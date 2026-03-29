import { getServiceClient } from './supabase';

type NotificationType =
  | 'show_sold_out'
  | 'payment_failed'
  | 'refund_processed'
  | 'pass_expiring'
  | 'new_birthday_inquiry'
  | 'waitlist_spot_available'
  | 'new_registration';

export async function createAdminNotification(
  type: NotificationType,
  title: string,
  message: string,
  details?: Record<string, any>
) {
  const supabase = getServiceClient();
  await supabase.from('admin_notifications').insert({
    type,
    title,
    message,
    details: details || null,
  });
}

/**
 * Notify admin when a show sells out
 */
export async function notifyShowSoldOut(showTitle: string, eventId: string) {
  await createAdminNotification(
    'show_sold_out',
    `הצגה מלאה: ${showTitle}`,
    `ההצגה "${showTitle}" נמכרה במלואה!`,
    { event_id: eventId }
  );
}

/**
 * Notify admin when a payment fails
 */
export async function notifyPaymentFailed(paymentId: string, amount: number, error: string) {
  await createAdminNotification(
    'payment_failed',
    'תשלום נכשל',
    `תשלום בסך ${amount}₪ נכשל: ${error}`,
    { payment_id: paymentId, amount, error }
  );
}

/**
 * Notify admin when a refund is processed
 */
export async function notifyRefundProcessed(customerName: string, amount: number, refundId: string) {
  await createAdminNotification(
    'refund_processed',
    `זיכוי בוצע: ${amount}₪`,
    `זיכוי של ${amount}₪ בוצע ל${customerName}`,
    { refund_id: refundId, amount, customer: customerName }
  );
}

/**
 * Notify admin of new birthday inquiry
 */
export async function notifyBirthdayInquiry(name: string, phone: string, date?: string) {
  await createAdminNotification(
    'new_birthday_inquiry',
    `פנייה חדשה ליום הולדת`,
    `${name} (${phone}) מעוניין/ת ביום הולדת${date ? ` בתאריך ${date}` : ''}`,
    { name, phone, date }
  );
}
