import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * Cron job לניקוי תשלומים ממתינים ישנים (>15 דקות)
 * מונע מצב של "הזמנות רפאים" שתופסות קיבולת
 * 
 * Vercel Cron: */10 * * * * (כל 10 דקות)
 */
export async function GET(req: Request) {
  try {
    // אימות Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    
    // תשלומים pending ישנים מ-15 דקות
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    console.log(`🧹 Starting cleanup of pending payments older than ${fifteenMinutesAgo}`);

    // מציאת תשלומים ישנים
    const { data: oldPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, user_id, amount, metadata, created_at')
      .eq('status', 'pending')
      .lt('created_at', fifteenMinutesAgo);

    if (fetchError) {
      console.error('❌ Error fetching old payments:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      }, { status: 500 });
    }

    if (!oldPayments || oldPayments.length === 0) {
      console.log('✅ No old pending payments found');
      return NextResponse.json({
        success: true,
        message: 'No old pending payments to clean up',
        cleaned: 0
      });
    }

    console.log(`📋 Found ${oldPayments.length} old pending payments to cancel`);

    // ביטול התשלומים הישנים
    const { data: cancelledPayments, error: cancelError } = await supabase
      .from('payments')
      .update({ 
        status: 'failed',
        notes: 'Auto-cancelled: Payment timeout (15 minutes expired)'
      })
      .in('id', oldPayments.map(p => p.id))
      .select();

    if (cancelError) {
      console.error('❌ Error cancelling payments:', cancelError);
      return NextResponse.json({ 
        success: false, 
        error: cancelError.message 
      }, { status: 500 });
    }

    console.log(`✅ Successfully cancelled ${cancelledPayments?.length || 0} payments`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cancelledPayments?.length || 0} old pending payments`,
      cleaned: cancelledPayments?.length || 0,
      payments: cancelledPayments?.map(p => ({
        id: p.id,
        amount: p.amount,
        created_at: p.created_at
      }))
    });

  } catch (error) {
    console.error('❌ Error in cleanup cron:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
