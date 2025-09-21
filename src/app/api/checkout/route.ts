import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, CartItem } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { generateDeviceId } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, userId, email, successUrl, cancelUrl } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate and enrich cart items
    const validatedItems: CartItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      let validatedItem: CartItem;
      
      switch (item.item_type) {
        case 'product':
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('id, title, price_cents, stock, is_active')
            .eq('id', item.ref_id)
            .eq('is_active', true)
            .single();

          if (!product) {
            return NextResponse.json(
              { success: false, error: `Product ${item.ref_id} not found or inactive` },
              { status: 400 }
            );
          }

          if (product.stock < item.qty) {
            return NextResponse.json(
              { success: false, error: `Insufficient stock for ${product.title}` },
              { status: 400 }
            );
          }

          validatedItem = {
            item_type: 'product',
            ref_id: product.id,
            title_snapshot: product.title,
            unit_price_cents: product.price_cents,
            qty: item.qty,
          };
          break;

        case 'workshop_session':
          const { data: session } = await supabaseAdmin
            .from('workshop_sessions')
            .select(`
              id,
              start_at,
              end_at,
              capacity_override,
              price_override,
              status,
              workshops!inner (
                id,
                title,
                base_price,
                capacity_default,
                is_active
              )
            `)
            .eq('id', item.ref_id)
            .eq('status', 'scheduled')
            .eq('workshops.is_active', true)
            .single();

          if (!session) {
            return NextResponse.json(
              { success: false, error: `Workshop session ${item.ref_id} not found or inactive` },
              { status: 400 }
            );
          }

          // Check capacity
          const { data: registrations } = await supabaseAdmin
            .from('registrations')
            .select('spots')
            .eq('session_id', session.id)
            .eq('status', 'reserved');

          const currentRegistrations = (registrations || []).reduce((sum, reg) => sum + reg.spots, 0);
          const capacity = session.capacity_override || (session.workshops as any).capacity_default;
          
          if (currentRegistrations + item.qty > capacity) {
            return NextResponse.json(
              { success: false, error: `Not enough spots available for ${(session.workshops as any).title}` },
              { status: 400 }
            );
          }

          const price = session.price_override || (session.workshops as any).base_price;
          const startDate = new Date(session.start_at).toLocaleDateString('he-IL');
          
          validatedItem = {
            item_type: 'workshop_session',
            ref_id: session.id,
            title_snapshot: `${(session.workshops as any).title} - ${startDate}`,
            unit_price_cents: price,
            qty: item.qty,
          };
          break;

        default:
          return NextResponse.json(
            { success: false, error: `Unsupported item type: ${item.item_type}` },
            { status: 400 }
          );
      }

      validatedItems.push(validatedItem);
      totalAmount += validatedItem.unit_price_cents * validatedItem.qty;
    }

    // Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId || null,
        total_amount: totalAmount,
        currency: 'ILS',
        status: 'pending',
        payment_provider: 'stripe',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      item_type: item.item_type,
      ref_id: item.ref_id,
      title_snapshot: item.title_snapshot,
      unit_price: item.unit_price_cents,
      qty: item.qty,
      line_total: item.unit_price_cents * item.qty,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      items: validatedItems,
      userId,
      email,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        order_id: order.id,
      },
    });

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ external_payment_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      order_id: order.id,
    });

  } catch (error) {
    console.error('Error in checkout API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
