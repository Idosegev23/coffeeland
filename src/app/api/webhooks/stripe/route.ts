import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseClient';
import Stripe from 'stripe';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret) as unknown as Stripe.Event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  
  if (!orderId) {
    console.error('No order_id in session metadata');
    return;
  }

  // Update order status
  const { error: orderError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (orderError) {
    console.error('Error updating order status:', orderError);
    throw orderError;
  }

  // Get order items to process registrations
  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    throw itemsError;
  }

  // Process workshop session registrations
  for (const item of orderItems || []) {
    if (item.item_type === 'workshop_session') {
      await createWorkshopRegistration(orderId, item, session);
    } else if (item.item_type === 'product') {
      await updateProductStock(item);
    }
  }

  // Log successful payment
  await supabaseAdmin
    .from('audit_log')
    .insert({
      action: 'payment_completed',
      entity: 'order',
      entity_id: orderId,
      diff: {
        session_id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    });

  console.log(`Order ${orderId} payment completed successfully`);
}

async function createWorkshopRegistration(
  orderId: string, 
  item: any, 
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id || null;
  
  const { error } = await supabaseAdmin
    .from('registrations')
    .insert({
      user_id: userId,
      session_id: item.ref_id,
      order_id: orderId,
      spots: item.qty,
      status: 'confirmed',
    });

  if (error) {
    console.error('Error creating workshop registration:', error);
    throw error;
  }

  console.log(`Created registration for session ${item.ref_id}, ${item.qty} spots`);
}

async function updateProductStock(item: any) {
  // First get current stock
  const { data: currentProduct } = await supabaseAdmin
    .from('products')
    .select('stock')
    .eq('id', item.ref_id)
    .single();

  if (currentProduct) {
    const newStock = Math.max(0, currentProduct.stock - item.qty);
    const { error } = await supabaseAdmin
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.ref_id);

    if (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
    console.log(`Updated stock for product ${item.ref_id}, reduced by ${item.qty}`);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
  
  // Additional processing if needed
  // This is mainly for direct PaymentIntent flows, not Checkout Sessions
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} failed`);
  
  // You might want to update order status to failed
  // and send notification to customer
}
