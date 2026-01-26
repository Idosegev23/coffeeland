import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { verifyPayPlusCallback } from '@/lib/payplus';

/**
 * Callback/Webhook מ-PayPlus
 * POST /api/payments/payplus/callback
 * 
 * PayPlus שולח לכאן עדכון על סטטוס התשלום
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('📥 PayPlus Callback received at:', new Date().toISOString());
    console.log('📥 Callback data:', JSON.stringify(body, null, 2));

    // אימות שהCallback מגיע מPayPlus
    if (!verifyPayPlusCallback(body)) {
      console.error('❌ Invalid PayPlus callback signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const {
      transaction_uid,
      page_request_uid,
      status_code,
      approval_num,
      voucher_num,
      more_info,    // מזהה העסקה שלנו (transactionRef)
      more_info_1,  // ID התשלום בDB
      amount,
      customer_uid,
      token_uid
    } = body;

    // קבלת סטטוס העסקה
    // status_code: 000 = הצלחה, אחרים = כשלון
    const isSuccess = status_code === '000' || status_code === 0 || status_code === '0';
    const paymentStatus = isSuccess ? 'completed' : 'failed';

    console.log(`💳 Payment ${isSuccess ? 'SUCCESS' : 'FAILED'}: ${more_info_1}`);

    // שימוש ב-Service Client לעדכון ללא RLS
    const supabase = getServiceClient();

    // מציאת התשלום בDB
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*, metadata')
      .eq('id', more_info_1)
      .single();

    if (findError || !payment) {
      console.error('❌ Payment not found:', more_info_1, findError);
      // עדיין מחזירים 200 לPayPlus
      return NextResponse.json({ received: true, error: 'Payment not found' });
    }

    // עדכון סטטוס התשלום
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        completed_at: isSuccess ? new Date().toISOString() : null,
        metadata: {
          ...payment.metadata,
          payplus_transaction_uid: transaction_uid,
          payplus_approval_num: approval_num,
          payplus_voucher_num: voucher_num,
          payplus_status_code: status_code,
          payplus_customer_uid: customer_uid,
          payplus_token_uid: token_uid,
          callback_received_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Error updating payment:', updateError);
    }

    // אם התשלום הצליח ויש card_type_id - יוצרים את הכרטיסייה
    if (isSuccess && payment.metadata?.card_type_id) {
      console.log('🎫 Creating pass for successful payment...');
      
      const { card_type_id, card_type_name, entries_count } = payment.metadata;
      
      // יצירת תוקף (3 חודשים)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 3);

      const { data: pass, error: passError } = await supabase
        .from('passes')
        .insert({
          user_id: payment.user_id,
          card_type_id: card_type_id,
          type: card_type_name?.toLowerCase().includes('workshop') ? 'workshop' : 
                card_type_name?.toLowerCase().includes('playground') ? 'playground' : 
                'playground', // ברירת מחדל
          total_entries: entries_count || 10,
          remaining_entries: entries_count || 10,
          expiry_date: expiryDate.toISOString(),
          price_paid: payment.amount,
          status: 'active',
          purchase_date: new Date().toISOString(),
          payment_id: payment.id
        })
        .select()
        .single();

      if (passError) {
        console.error('❌ Error creating pass:', passError);
      } else {
        console.log('✅ Pass created:', pass.id);
        
        // עדכון התשלום עם מזהה הכרטיסייה
        await supabase
          .from('payments')
          .update({
            item_id: pass.id,
            metadata: {
              ...payment.metadata,
              pass_id: pass.id
            }
          })
          .eq('id', payment.id);
      }
    }
    
    // אם התשלום הצליח והוא עבור הצגה - יוצרים registration
    if (isSuccess && payment.metadata?.event_id) {
      console.log('🎭 Creating show registration for successful payment...');
      
      const { event_id, ticket_type } = payment.metadata;
      
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: event_id,
          user_id: payment.user_id,
          status: 'confirmed',
          is_paid: true,
          payment_id: payment.id,
          tickets_count: 1,
          ticket_type: ticket_type || 'regular',
          qr_code: `SHOW-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          registered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (regError) {
        console.error('❌ Error creating registration:', regError);
      } else {
        console.log('✅ Registration created:', registration.id);
        
        // עדכון התשלום עם מזהה הרישום
        await supabase
          .from('payments')
          .update({
            item_id: registration.id,
            item_type: 'show',
            metadata: {
              ...payment.metadata,
              registration_id: registration.id
            }
          })
          .eq('id', payment.id);
      }
    }

    console.log('✅ PayPlus callback processed successfully');
    
    // PayPlus מצפה לתשובה 200
    return NextResponse.json({ 
      received: true,
      status: paymentStatus,
      payment_id: payment.id
    });

  } catch (error) {
    console.error('❌ Error processing PayPlus callback:', error);
    // עדיין מחזירים 200 כדי שPayPlus לא ינסה שוב
    return NextResponse.json({ 
      received: true, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * GET - לבדיקת זמינות ה-endpoint
 */
export async function GET() {
  console.log('✅ PayPlus Callback GET check at:', new Date().toISOString());
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'PayPlus Callback',
    message: 'Endpoint is ready to receive webhooks',
    timestamp: new Date().toISOString()
  });
}
