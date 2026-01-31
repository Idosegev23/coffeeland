/**
 * PayPlus Payment Integration
 * Documentation: https://docs.payplus.co.il/reference/post_paymentpages-generatelink
 */

// סביבות PayPlus
const PAYPLUS_URLS = {
  staging: 'https://restapidev.payplus.co.il/api/v1.0',
  production: 'https://restapi.payplus.co.il/api/v1.0'
};

// בדיקה אם אנחנו בסביבת טסטים
const isStaging = process.env.PAYPLUS_ENVIRONMENT === 'staging';
const BASE_URL = isStaging ? PAYPLUS_URLS.staging : PAYPLUS_URLS.production;

// פרטי התחברות
const API_KEY = process.env.PAYPLUS_API_KEY || '';
const SECRET_KEY = process.env.PAYPLUS_SECRET_KEY || '';
const PAYMENT_PAGE_UID = process.env.PAYPLUS_PAYMENT_PAGE_UID || '';

// כותרות לכל בקשה
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': JSON.stringify({
    api_key: API_KEY,
    secret_key: SECRET_KEY
  })
});

// סוגי עסקאות
export const CHARGE_METHODS = {
  REGULAR: 1,       // תשלום רגיל
  INSTALLMENTS: 2,  // תשלומים
  CREDIT: 3,        // קרדיט
  IMMEDIATE: 4      // מיידי
};

// סוגי תשלום
export const CREDIT_TERMS = {
  REGULAR: 1,
  INSTALLMENTS: 2,
  CREDIT: 3
};

export interface PayPlusCustomer {
  customer_name: string;
  email: string;
  phone?: string;
  customer_uid?: string;
}

export interface PayPlusProduct {
  name: string;
  quantity: number;
  price: number;
  vat_type?: number; // 0 = כולל מע"מ, 1 = פטור
}

export interface PaymentPageRequest {
  amount: number;
  currency_code?: string;
  customer: PayPlusCustomer;
  products?: PayPlusProduct[];
  more_info?: string;
  more_info_1?: string;
  refURL_success?: string;
  refURL_failure?: string;
  refURL_callback?: string;
  sendEmailApproval?: boolean;
  sendEmailFailure?: boolean;
  create_token?: boolean;
  initial_invoice?: boolean;
  charge_method?: number;
  expiry_datetime?: string;
  hide_other_charge_methods?: boolean;
}

export interface PayPlusResponse {
  results: {
    status: string;
    code: number;
    description: string;
  };
  data?: {
    page_request_uid?: string;
    payment_page_link?: string;
    qr_code_image?: string;
    customer_uid?: string;
    token_uid?: string;
    transaction_uid?: string;
  };
}

/**
 * יצירת קישור לדף תשלום PayPlus
 */
export async function generatePaymentLink(request: PaymentPageRequest): Promise<PayPlusResponse> {
  const url = `${BASE_URL}/PaymentPages/generateLink`;
  
  const body = {
    payment_page_uid: PAYMENT_PAGE_UID,
    charge_method: request.charge_method || CHARGE_METHODS.REGULAR,
    amount: request.amount,
    currency_code: request.currency_code || 'ILS',
    sendEmailApproval: request.sendEmailApproval ?? true,
    sendEmailFailure: request.sendEmailFailure ?? false,
    refURL_success: request.refURL_success,
    refURL_failure: request.refURL_failure,
    refURL_callback: request.refURL_callback,
    create_token: request.create_token ?? false,
    initial_invoice: request.initial_invoice ?? false,
    hide_other_charge_methods: request.hide_other_charge_methods ?? false,
    customer: {
      customer_name: request.customer.customer_name,
      email: request.customer.email,
      phone: request.customer.phone || undefined
    },
    items: request.products?.map(p => ({
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      vat_type: p.vat_type ?? 0
    })),
    more_info: request.more_info,
    more_info_1: request.more_info_1
  };

  console.log('🔵 PayPlus Request:', JSON.stringify(body, null, 2));
  console.log('🔵 PayPlus URL:', url);
  console.log('🔵 PayPlus Environment:', isStaging ? 'STAGING' : 'PRODUCTION');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    const data: PayPlusResponse = await response.json();
    console.log('🟢 PayPlus Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('🔴 PayPlus Error:', error);
    throw error;
  }
}

/**
 * אימות Callback מ-PayPlus
 */
export function verifyPayPlusCallback(payload: Record<string, unknown>): boolean {
  // PayPlus שולח חתימה לאימות - ניתן להוסיף בדיקה כאן
  // כרגע מחזיר true, בפרודקשן כדאי לאמת את החתימה
  return true;
}

/**
 * בדיקת סטטוס עסקה
 */
export async function checkTransactionStatus(transactionUid: string): Promise<PayPlusResponse> {
  const url = `${BASE_URL}/Transactions/Check`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      transaction_uid: transactionUid
    })
  });

  return response.json();
}

/**
 * בדיקה האם PayPlus מוגדר כראוי
 */
export function isPayPlusConfigured(): boolean {
  return !!(API_KEY && SECRET_KEY && PAYMENT_PAGE_UID);
}

/**
 * קבלת מידע על הגדרות PayPlus (בלי לחשוף secrets)
 */
export function getPayPlusConfig() {
  return {
    isConfigured: isPayPlusConfigured(),
    environment: isStaging ? 'staging' : 'production',
    hasApiKey: !!API_KEY,
    hasSecretKey: !!SECRET_KEY,
    hasPaymentPageUid: !!PAYMENT_PAGE_UID
  };
}

/**
 * ממשק לבקשת זיכוי
 */
export interface RefundRequest {
  transaction_uid: string;  // מזהה העסקה המקורית
  amount: number;            // סכום לזיכוי (יכול להיות חלקי)
  reason?: string;           // סיבת הזיכוי (אופציונלי)
}

/**
 * ביצוע זיכוי דרך PayPlus API
 */
export async function processRefund(request: RefundRequest): Promise<PayPlusResponse> {
  const url = `${BASE_URL}/Transactions/Refund`;
  
  const body = {
    transaction_uid: request.transaction_uid,
    refund_amount: request.amount,
    reason: request.reason || 'Customer refund'
  };

  console.log('🔵 PayPlus Refund Request:', JSON.stringify(body, null, 2));
  console.log('🔵 PayPlus Refund URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    const data: PayPlusResponse = await response.json();
    console.log('🟢 PayPlus Refund Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('🔴 PayPlus Refund Error:', error);
    throw error;
  }
}
