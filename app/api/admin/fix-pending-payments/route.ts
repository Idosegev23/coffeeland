import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * API לתיקון תשלומים תקועים במצב pending
 * GET /api/admin/fix-pending-payments
 * 
 * מוצא תשלומים ישנים במצב pending ומתקן אותם
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dryRun = searchParams.get('dry_run') === 'true'; // אם true, רק בודק בלי לתקן
    
    const supabase = getServiceClient();
    
    // מציאת תשלומים pending מעל 10 דקות
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: pendingPayments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', tenMinutesAgo);
    
    if (error) {
      console.error('Error fetching pending payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({
        message: 'No pending payments to fix',
        count: 0
      });
    }
    
    const results: any[] = [];
    
    for (const payment of pendingPayments) {
      const result = {
        payment_id: payment.id,
        user_id: payment.user_id,
        amount: payment.amount,
        created_at: payment.created_at,
        metadata: payment.metadata,
        action: 'skipped',
        reason: ''
      };
      
      // בדיקה אם זה תשלום להצגה
      if (payment.metadata?.event_id) {
        if (dryRun) {
          result.action = 'would_create_registration';
          result.reason = 'Show payment pending';
        } else {
          // יצירת registration
          const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert({
              event_id: payment.metadata.event_id,
              user_id: payment.user_id,
              status: 'confirmed',
              ticket_type: payment.metadata.ticket_type || 'show_only',
              registered_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (regError) {
            result.action = 'error';
            result.reason = regError.message;
          } else {
            // עדכון payment
            await supabase
              .from('payments')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                metadata: {
                  ...payment.metadata,
                  registration_id: registration.id,
                  fixed_by_admin: true,
                  fixed_at: new Date().toISOString()
                }
              })
              .eq('id', payment.id);
            
            result.action = 'fixed';
            result.reason = `Created registration ${registration.id}`;
          }
        }
      }
      // בדיקה אם זה תשלום לכרטיסייה
      else if (payment.metadata?.card_type_id) {
        if (dryRun) {
          result.action = 'would_create_pass';
          result.reason = 'Pass payment pending';
        } else {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          
          const { data: pass, error: passError } = await supabase
            .from('passes')
            .insert({
              user_id: payment.user_id,
              card_type_id: payment.metadata.card_type_id,
              type: 'playground',
              total_entries: payment.metadata.entries_count || 10,
              remaining_entries: payment.metadata.entries_count || 10,
              expiry_date: expiryDate.toISOString(),
              price_paid: payment.amount,
              status: 'active',
              purchase_date: new Date().toISOString(),
              payment_id: payment.id
            })
            .select()
            .single();
          
          if (passError) {
            result.action = 'error';
            result.reason = passError.message;
          } else {
            await supabase
              .from('payments')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                metadata: {
                  ...payment.metadata,
                  pass_id: pass.id,
                  fixed_by_admin: true,
                  fixed_at: new Date().toISOString()
                }
              })
              .eq('id', payment.id);
            
            result.action = 'fixed';
            result.reason = `Created pass ${pass.id}`;
          }
        }
      } else {
        result.reason = 'Unknown payment type';
      }
      
      results.push(result);
    }
    
    return NextResponse.json({
      message: dryRun ? 'Dry run completed' : 'Pending payments fixed',
      count: pendingPayments.length,
      dry_run: dryRun,
      results
    });
    
  } catch (error: any) {
    console.error('Error fixing pending payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
