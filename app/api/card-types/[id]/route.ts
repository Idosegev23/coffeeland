import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PATCH - עדכון סוג כרטיסייה (אדמין בלבד)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    
    console.log('📦 Update request body:', body);

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      name: body.name,
      description: body.description,
      type: body.type,
      entries_count: body.entries_count,
      price: body.price,
      is_active: body.is_active
    };
    
    // Add optional fields only if provided
    if (body.sale_price !== null && body.sale_price !== undefined) {
      updateData.sale_price = body.sale_price;
    }
    if (body.validity_days !== null && body.validity_days !== undefined) {
      updateData.validity_days = body.validity_days;
    }
    if (body.validity_months !== null && body.validity_months !== undefined) {
      updateData.validity_months = body.validity_months;
    }
    if (body.is_family !== null && body.is_family !== undefined) {
      updateData.is_family = body.is_family;
    }
    
    console.log('💾 Update data:', updateData);

    const { data: cardType, error } = await supabase
      .from('card_types')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'update_card_type',
      entity_type: 'card_type',
      entity_id: cardType.id,
      details: { name: cardType.name, price: cardType.price }
    });

    return NextResponse.json({ card_type: cardType });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update card type', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - מחיקת סוג כרטיסייה (אדמין בלבד)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // בדיקה אם יש כרטיסיות קיימות עם הסוג הזה
    const { count } = await supabase
      .from('passes')
      .select('id', { count: 'exact', head: true })
      .eq('card_type_id', params.id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `לא ניתן למחוק סוג כרטיסייה עם ${count} כרטיסיות פעילות. במקום זאת, סמן אותו כלא פעיל.` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('card_types')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'delete_card_type',
      entity_type: 'card_type',
      entity_id: params.id,
      details: {}
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete card type', details: error.message },
      { status: 500 }
    );
  }
}

