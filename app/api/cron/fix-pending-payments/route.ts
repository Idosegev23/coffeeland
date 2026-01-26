import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * Cron Job - תיקון אוטומטי של תשלומים תקועים
 * GET /api/cron/fix-pending-payments
 * 
 * רץ כל 15 דקות ומתקן תשלומים שנשארו pending
 * הוסף ב-Vercel Cron: 0,15,30,45 * * * *
 */
export async function GET(req: Request) {
  try {
    // בדיקת authorization (רק Vercel Cron יכול לקרוא)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = getServiceClient();
    
    // מציאת תשלומים pending מעל 15 דקות (סביר שהcallback לא יגיע)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: pendingPayments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', fifteenMinutesAgo);
    
    if (error) {
      console.error('[CRON] Error fetching pending payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('[CRON] No pending payments to fix');
      return NextResponse.json({
        success: true,
        message: 'No pending payments',
        count: 0,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`[CRON] Found ${pendingPayments.length} pending payments to fix`);
    
    let fixedCount = 0;
    let errorCount = 0;
    const results: any[] = [];
    
    for (const payment of pendingPayments) {
      try {
        // בדיקה אם זה תשלום להצגה
        if (payment.metadata?.event_id) {
          console.log(`[CRON] Fixing show payment: ${payment.id}`);
          
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
            console.error(`[CRON] Error creating registration:`, regError);
            errorCount++;
            results.push({
              payment_id: payment.id,
              action: 'error',
              error: regError.message
            });
            continue;
          }
          
          // עדכון payment
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              metadata: {
                ...payment.metadata,
                registration_id: registration.id,
                fixed_by_cron: true,
                fixed_at: new Date().toISOString()
              }
            })
            .eq('id', payment.id);
          
          fixedCount++;
          results.push({
            payment_id: payment.id,
            action: 'fixed',
            registration_id: registration.id,
            amount: payment.amount
          });
          
          console.log(`[CRON] ✅ Fixed payment ${payment.id} -> registration ${registration.id}`);
        }
        // בדיקה אם זה תשלום לכרטיסייה
        else if (payment.metadata?.card_type_id) {
          console.log(`[CRON] Fixing pass payment: ${payment.id}`);
          
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
            console.error(`[CRON] Error creating pass:`, passError);
            errorCount++;
            results.push({
              payment_id: payment.id,
              action: 'error',
              error: passError.message
            });
            continue;
          }
          
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              metadata: {
                ...payment.metadata,
                pass_id: pass.id,
                fixed_by_cron: true,
                fixed_at: new Date().toISOString()
              }
            })
            .eq('id', payment.id);
          
          fixedCount++;
          results.push({
            payment_id: payment.id,
            action: 'fixed',
            pass_id: pass.id,
            amount: payment.amount
          });
          
          console.log(`[CRON] ✅ Fixed payment ${payment.id} -> pass ${pass.id}`);
        }
      } catch (err: any) {
        console.error(`[CRON] Error processing payment ${payment.id}:`, err);
        errorCount++;
        results.push({
          payment_id: payment.id,
          action: 'error',
          error: err.message
        });
      }
    }
    
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_found: pendingPayments.length,
      fixed: fixedCount,
      errors: errorCount,
      results
    };
    
    console.log('[CRON] Summary:', JSON.stringify(summary, null, 2));
    
    // אם יש שגיאות - שלח התראה (אופציונלי)
    if (errorCount > 0) {
      console.warn(`[CRON] ⚠️ ${errorCount} payments failed to fix!`);
      // כאן אפשר להוסיף שליחת אימייל/SMS לאדמין
    }
    
    return NextResponse.json(summary);
    
  } catch (error: any) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// מאפשר גם POST (לבדיקות ידניות)
export async function POST(req: Request) {
  return GET(req);
}
