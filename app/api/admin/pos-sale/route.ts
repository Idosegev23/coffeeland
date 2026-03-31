import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Service Role client for admin operations (bypasses RLS)
const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * POST - מכירת כרטיסייה ב-POS (אדמין בלבד)
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // בדיקת הרשאות אדמין
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    logger.info('📦 POS Sale request body:', body);
    
    const { 
      customer_id, 
      card_type_id, 
      total_entries, 
      price_paid, 
      payment_method,
      pass_type,
      card_type_name 
    } = body;

    if (!customer_id || !card_type_id || !total_entries || !price_paid) {
      logger.error('❌ Missing required fields:', { customer_id, card_type_id, total_entries, price_paid });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { customer_id: !!customer_id, card_type_id: !!card_type_id, total_entries: !!total_entries, price_paid: !!price_paid }
      }, { status: 400 });
    }

    // יצירת תוקף (ברירת מחדל: 3 חודשים)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    // נשתמש ב-Service Role כדי לעקוף RLS ולמנוע נפילות הרשאות
    const serviceClient = getServiceClient();

    // יצירת כרטיסייה (סכמת passes בפועל)
    const passInsert = {
      user_id: customer_id,
      card_type_id: card_type_id,
      type: pass_type || 'playground',
      total_entries: total_entries,
      remaining_entries: total_entries,
      expiry_date: expiryDate.toISOString(),
      price_paid: price_paid,
      status: 'active',
      purchase_date: new Date().toISOString(),
    };

    logger.info('💳 Creating pass with data:', passInsert);

    const { data: pass, error: passError } = await serviceClient
      .from('passes')
      .insert(passInsert)
      .select()
      .single();

    if (passError) {
      logger.error('❌ Error creating pass:', passError);
      return NextResponse.json({ 
        error: 'Failed to create pass', 
        details: passError.message,
        code: passError.code,
        hint: passError.hint
      }, { status: 500 });
    }
    
    logger.info('✅ Pass created successfully:', pass);

    const paymentType =
      payment_method === 'cash'
        ? 'pos_cash'
        : payment_method === 'credit'
        ? 'pos_credit'
        : payment_method === 'bit'
        ? 'pos_bit'
        : 'pos_other';

    // יצירת תשלום (סכמת payments בפועל)
    const paymentInsert = {
      user_id: customer_id,
      amount: price_paid,
      currency: 'ILS',
      payment_type: paymentType,
      payment_method: payment_method,
      item_type: 'pass',
      item_id: pass.id,
      status: 'completed',
      processed_by_admin: admin.id,
      completed_at: new Date().toISOString(),
      notes: `מכירת כרטיסייה ${card_type_name || ''}`.trim(),
      metadata: {
        created_via: 'pos',
        admin_id: admin.id,
        card_type_id,
        card_type_name,
      }
    };

    logger.info('💰 Creating payment with data:', paymentInsert);

    const { data: payment, error: paymentError } = await serviceClient
      .from('payments')
      .insert(paymentInsert)
      .select()
      .single();

    if (paymentError) {
      logger.error('❌ Error creating payment:', paymentError);
      // במקרה של שגיאה בתשלום, נמחק את הכרטיסייה
      await serviceClient.from('passes').delete().eq('id', pass.id);
      return NextResponse.json({ 
        error: 'Failed to create payment', 
        details: paymentError.message,
        code: paymentError.code,
        hint: paymentError.hint
      }, { status: 500 });
    }
    
    logger.info('✅ Payment created successfully:', payment);

    // קישור התשלום לכרטיסייה (לא חובה אבל שימושי)
    await serviceClient
      .from('passes')
      .update({ payment_id: payment.id })
      .eq('id', pass.id);

    // רישום ב-audit log
    await serviceClient.from('audit_log').insert({
      admin_id: admin.id,
      action: 'pos_sale',
      entity_type: 'pass',
      entity_id: pass.id,
      details: {
        customer_id,
        card_type_id,
        price_paid,
        payment_method
      }
    });

    return NextResponse.json({
      success: true,
      pass,
      payment
    });
  } catch (error: any) {
    logger.error('Error in POS sale:', error);
    return NextResponse.json(
      { error: 'Failed to complete POS sale', details: error.message },
      { status: 500 }
    );
  }
}

