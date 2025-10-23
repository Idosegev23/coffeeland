import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    const { 
      customer_id, 
      card_type_id, 
      total_entries, 
      price_paid, 
      payment_method,
      card_type_name 
    } = body;

    if (!customer_id || !card_type_id || !total_entries || !price_paid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // יצירת תוקף (3 חודשים מהיום)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    // יצירת כרטיסייה
    const { data: pass, error: passError } = await supabase
      .from('passes')
      .insert({
        user_id: customer_id,
        card_type_id: card_type_id,
        entries_used: 0,
        entries_remaining: total_entries,
        expires_at: expiryDate.toISOString(),
        status: 'active',
        purchased_at: new Date().toISOString()
      })
      .select()
      .single();

    if (passError) {
      console.error('Error creating pass:', passError);
      throw passError;
    }

    // יצירת תשלום
    const paymentType = `pos_${payment_method}`;
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: customer_id,
        amount: price_paid,
        payment_method: `POS - ${payment_method}`,
        payment_status: 'completed',
        item_type: 'pass',
        item_id: pass.id,
        metadata: {
          admin_id: admin.id,
          card_type: card_type_name,
          notes: `מכירת כרטיסייה ${card_type_name}`
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      // במקרה של שגיאה בתשלום, נמחק את הכרטיסייה
      await supabase.from('passes').delete().eq('id', pass.id);
      throw paymentError;
    }

    // רישום ב-audit log
    await supabase.from('audit_log').insert({
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
    console.error('Error in POS sale:', error);
    return NextResponse.json(
      { error: 'Failed to complete POS sale', details: error.message },
      { status: 500 }
    );
  }
}

