import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export interface CartItem {
  item_type: 'product' | 'workshop_session' | 'service';
  ref_id: string;
  title_snapshot: string;
  unit_price_cents: number;
  qty: number;
}

export interface CreateCheckoutSessionParams {
  items: CartItem[];
  userId?: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession({
  items,
  userId,
  email,
  successUrl,
  cancelUrl,
  metadata = {},
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
    price_data: {
      currency: 'ils',
      product_data: {
        name: item.title_snapshot,
        metadata: {
          item_type: item.item_type,
          ref_id: item.ref_id,
        },
      },
      unit_amount: item.unit_price_cents,
    },
    quantity: item.qty,
  }));

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId || '',
      ...metadata,
    },
    customer_creation: 'if_required',
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['IL'],
    },
    phone_number_collection: {
      enabled: true,
    },
    // locale: 'he', // Hebrew not supported by Stripe
  };

  if (email) {
    sessionParams.customer_email = email;
  }

  return await stripe.checkout.sessions.create(sessionParams);
}

export async function createPaymentIntent({
  amount,
  currency = 'ils',
  metadata = {},
}: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  });
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function formatStripeAmount(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
