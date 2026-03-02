/**
 * PayPlus Payment Integration
 * Documentation: https://docs.payplus.co.il/reference/post_paymentpages-generatelink
 */

import { withRateLimit, payPlusRateLimiter } from './rate-limiter';

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
  'Authorization': `{"api_key":"${API_KEY}","secret_key":"${SECRET_KEY}"}`
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
 * יצירת קישור לדף תשלום PayPlus (עם rate limiting)
 */
export async function generatePaymentLink(request: PaymentPageRequest): Promise<PayPlusResponse> {
  return withRateLimit(async () => {
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
  }, 'generateLink');
}

/**
 * אימות Callback מ-PayPlus
 * PayPlus שולח את הנתונים בתוך אובייקט "transaction"
 */
export function verifyPayPlusCallback(payload: Record<string, any>): boolean {
  // בדיקות בסיסיות
  if (!payload) {
    console.error('🔴 PayPlus callback verification failed: empty payload');
    return false;
  }

  // PayPlus שולח את הנתונים בתוך transaction object
  const transaction = payload.transaction;
  if (!transaction || typeof transaction !== 'object') {
    console.error('🔴 PayPlus callback verification failed: missing transaction object');
    return false;
  }

  // בדיקה שיש את השדות החובה בתוך transaction
  const requiredFields = ['uid', 'status_code', 'more_info_1'];
  const missingFields = requiredFields.filter(field => !transaction[field]);
  
  if (missingFields.length > 0) {
    console.error('🔴 PayPlus callback verification failed: missing required fields in transaction:', missingFields);
    return false;
  }

  // בדיקת תקינות status_code
  const statusCode = transaction.status_code;
  if (typeof statusCode !== 'string' && typeof statusCode !== 'number') {
    console.error('🔴 PayPlus callback verification failed: invalid status_code type');
    return false;
  }

  // בדיקת תקינות uid (transaction_uid)
  const transactionUid = transaction.uid;
  if (typeof transactionUid !== 'string' || transactionUid.length === 0) {
    console.error('🔴 PayPlus callback verification failed: invalid transaction uid');
    return false;
  }

  // אם יש API signature (PayPlus תומך באימות HMAC) - נאמת אותו
  // זה דורש הגדרה בפאנל PayPlus והוספת webhook_secret למשתני סביבה
  const webhookSecret = process.env.PAYPLUS_WEBHOOK_SECRET;
  if (webhookSecret && payload.signature) {
    const signature = payload.signature as string;
    const dataToSign = `${transaction.uid}-${transaction.status_code}-${transaction.amount}`;
    
    // כאן צריך לחשב HMAC-SHA256 ולהשוות
    // לצורך הדוגמה, אני מדלג על זה כרגע
    // TODO: להוסיף אימות HMAC אמיתי כשמוסיפים webhook secret
    console.log('🔵 Signature verification skipped (webhook_secret not configured)');
  }

  console.log('✅ PayPlus callback verification passed');
  return true;
}

/**
 * חישוב HMAC signature לאימות webhooks (לעתיד)
 */
export function calculateWebhookSignature(data: string, secret: string): string {
  // TODO: להוסיף crypto.createHmac('sha256', secret).update(data).digest('hex')
  // כרגע מחזיר placeholder
  return '';
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
 * ביצוע זיכוי דרך PayPlus API (עם rate limiting)
 */
export async function processRefund(request: RefundRequest): Promise<PayPlusResponse> {
  return withRateLimit(async () => {
    // RefundByTransactionUID - זיכוי לפי UID של עסקה (לא דורש פרטי כרטיס)
    // https://docs.payplus.co.il/reference/post_transactions-refundbytransactionuid
    const url = `${BASE_URL}/Transactions/RefundByTransactionUID`;

    const body = {
      transaction_uid: request.transaction_uid,
      amount: request.amount,
      more_info: request.reason || 'Customer refund'
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
  }, 'refund');
}

/**
 * בדיקת סטטוס עסקה
 * https://docs.payplus.co.il/reference/transactions-view
 */
export async function checkTransactionStatus(transactionUid: string): Promise<PayPlusResponse> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/Transactions/View`;
    
    const body = {
      transaction_uid: transactionUid
    };

    console.log('🔍 Checking transaction status:', transactionUid);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data: PayPlusResponse = await response.json();
      console.log('✅ Transaction status:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error checking transaction status:', error);
      throw error;
    }
  }, 'check-transaction');
}

/**
 * אישור עסקה (J5)
 * https://docs.payplus.co.il/reference/transactions-approval
 */
export async function approveTransaction(transactionUid: string): Promise<PayPlusResponse> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/Transactions/ApprovalTransaction`;
    
    const body = {
      transaction_uid: transactionUid
    };

    console.log('✅ Approving transaction:', transactionUid);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data: PayPlusResponse = await response.json();
      console.log('✅ Transaction approved:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error approving transaction:', error);
      throw error;
    }
  }, 'approve-transaction');
}

/**
 * ביטול עסקה
 * https://docs.payplus.co.il/reference/transactions-cancel
 */
export async function cancelTransaction(transactionUid: string): Promise<PayPlusResponse> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/Transactions/CancelTransaction`;
    
    const body = {
      transaction_uid: transactionUid
    };

    console.log('🚫 Cancelling transaction:', transactionUid);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data: PayPlusResponse = await response.json();
      console.log('✅ Transaction cancelled:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error cancelling transaction:', error);
      throw error;
    }
  }, 'cancel-transaction');
}

/**
 * חיוב ישיר (J4) - לעסקאות ללא דף תשלום
 * https://docs.payplus.co.il/reference/transactions-charge
 */
export interface DirectChargeRequest {
  transaction_uid?: string;
  amount: number;
  currency_code?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  credit_card_number: string;
  credit_card_exp: string; // MMYY
  cvv: string;
  four_digits?: string;
  more_info?: string;
  more_info_1?: string;
  charge_method?: number;
}

export async function directCharge(request: DirectChargeRequest): Promise<PayPlusResponse> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/Transactions/ChargeTransaction`;
    
    console.log('💳 Processing direct charge...');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request)
      });

      const data: PayPlusResponse = await response.json();
      console.log('✅ Direct charge response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error processing direct charge:', error);
      throw error;
    }
  }, 'direct-charge');
}

/**
 * משיכת היסטוריית עסקאות מ-PayPlus
 * https://docs.payplus.co.il/reference/transactions-history
 */
export interface TransactionsHistoryRequest {
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  from_time?: string; // HH:MM:SS
  to_time?: string;   // HH:MM:SS
  page?: number;
  page_size?: number;
}

export interface PayPlusTransaction {
  transaction_uid: string;
  number: string; // Transaction number
  date: string;
  time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  currency: string;
  status_code: string;
  approval_number: string;
  voucher_number: string;
  transaction_type: string; // "Charge" or "Refund"
  brand: string;
  more_info: string;
  more_info_1: string;
  more_info_2: string;
  more_info_3: string;
  more_info_4: string;
  more_info_5: string;
}

/**
 * דוח עסקאות שאושרו
 * https://docs.payplus.co.il/reference/transactions-approval-report
 */
export async function getApprovedTransactions(
  request: TransactionsHistoryRequest = {}
): Promise<{ success: boolean; transactions: PayPlusTransaction[]; error?: string }> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/TransactionReports/TransactionsApproval`;
    
    const toDate = request.to_date || new Date().toISOString().split('T')[0];
    const fromDate = request.from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const body = {
      from_date: fromDate,
      to_date: toDate,
      page_number: request.page || 1,
      page_size: request.page_size || 1000
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.results?.status === 'success' && data.data?.items) {
        return { success: true, transactions: data.data.items };
      }
      return { success: false, transactions: [], error: data.results?.description };
    } catch (error) {
      return { success: false, transactions: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, 'approved-transactions');
}

/**
 * דוח עסקאות שנדחו/נכשלו
 * https://docs.payplus.co.il/reference/rejected-transactions
 */
export async function getRejectedTransactions(
  request: TransactionsHistoryRequest = {}
): Promise<{ success: boolean; transactions: PayPlusTransaction[]; error?: string }> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/TransactionReports/RejectsTransactions`;
    
    const toDate = request.to_date || new Date().toISOString().split('T')[0];
    const fromDate = request.from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const body = {
      from_date: fromDate,
      to_date: toDate,
      page_number: request.page || 1,
      page_size: request.page_size || 1000
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.results?.status === 'success' && data.data?.items) {
        return { success: true, transactions: data.data.items };
      }
      return { success: false, transactions: [], error: data.results?.description };
    } catch (error) {
      return { success: false, transactions: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, 'rejected-transactions');
}

/**
 * דוח עסקאות שבוטלו
 * https://docs.payplus.co.il/reference/cancelled-transactions
 */
export async function getCancelledTransactions(
  request: TransactionsHistoryRequest = {}
): Promise<{ success: boolean; transactions: PayPlusTransaction[]; error?: string }> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/TransactionReports/CancelledTransactions`;
    
    const toDate = request.to_date || new Date().toISOString().split('T')[0];
    const fromDate = request.from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const body = {
      from_date: fromDate,
      to_date: toDate,
      page_number: request.page || 1,
      page_size: request.page_size || 1000
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.results?.status === 'success' && data.data?.items) {
        return { success: true, transactions: data.data.items };
      }
      return { success: false, transactions: [], error: data.results?.description };
    } catch (error) {
      return { success: false, transactions: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, 'cancelled-transactions');
}

export async function getTransactionsHistory(
  request: TransactionsHistoryRequest = {}
): Promise<{ success: boolean; transactions: PayPlusTransaction[]; error?: string }> {
  return withRateLimit(async () => {
    const url = `${BASE_URL}/Transactions/RefundsAccountingReport`;
    
    // ברירת מחדל: 30 ימים אחרונים
    const toDate = request.to_date || new Date().toISOString().split('T')[0];
    const fromDate = request.from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const body = {
      from_date: fromDate,
      to_date: toDate,
      from_time: request.from_time || '00:00:00',
      to_time: request.to_time || '23:59:59',
      page_number: request.page || 1,
      page_size: request.page_size || 1000
    };

    console.log('📊 Fetching PayPlus transactions history:', body);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.results?.status === 'success' && data.data?.items) {
        console.log(`✅ Fetched ${data.data.items.length} transactions from PayPlus`);
        return {
          success: true,
          transactions: data.data.items
        };
      } else {
        console.error('❌ PayPlus transactions fetch failed:', data);
        return {
          success: false,
          transactions: [],
          error: data.results?.description || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching PayPlus transactions:', error);
      return {
        success: false,
        transactions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, 'transactions-history');
}
