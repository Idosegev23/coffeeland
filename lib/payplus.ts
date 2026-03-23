/**
 * PayPlus Payment Integration
 * Documentation: https://docs.payplus.co.il/reference/post_paymentpages-generatelink
 */

import crypto from 'crypto';
import { withRateLimit, payPlusRateLimiter } from './rate-limiter';

// סביבות PayPlus
const PAYPLUS_URLS = {
  staging: 'https://restapidev.payplus.co.il/api/v1.0',
  production: 'https://restapi.payplus.co.il/api/v1.0'
};

// בדיקה אם אנחנו בסביבת טסטים
const isStaging = process.env.NODE_ENV !== 'production' || process.env.PAYPLUS_ENVIRONMENT === 'staging';
const BASE_URL = isStaging ? PAYPLUS_URLS.staging : PAYPLUS_URLS.production;

// פרטי התחברות
const API_KEY = process.env.PAYPLUS_API_KEY || '';
const SECRET_KEY = process.env.PAYPLUS_SECRET_KEY || '';
const PAYMENT_PAGE_UID = process.env.PAYPLUS_PAYMENT_PAGE_UID || '';

// כותרות לכל בקשה
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'api-key': API_KEY,
  'secret-key': SECRET_KEY
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

    console.log('🔵 PayPlus Request:', { amount: body.amount, currency: body.currency_code, email: body.customer?.email });
    console.log('🔵 PayPlus URL:', url);
    console.log('🔵 PayPlus Environment:', isStaging ? 'STAGING' : 'PRODUCTION');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      const data: PayPlusResponse = await response.json();
      console.log('🟢 PayPlus Response:', { status: data.results?.status, code: data.results?.code, page_uid: data.data?.page_request_uid });
      
      return data;
    } catch (error) {
      console.error('🔴 PayPlus Error:', error);
      throw error;
    }
  }, 'generateLink');
}

/**
 * אימות Callback מ-PayPlus באמצעות HMAC-SHA256
 * https://docs.payplus.co.il/reference/validate-requests-received-from-payplus
 */
export function verifyPayPlusCallback(
  body: Record<string, any>,
  headers: Record<string, string>
): { valid: boolean; reason?: string } {
  // בדיקה בסיסית
  if (!body || !body.transaction) {
    return { valid: false, reason: 'Missing transaction object' };
  }

  const transaction = body.transaction;
  const requiredFields = ['uid', 'status_code'];
  const missingFields = requiredFields.filter(field => !transaction[field]);
  if (missingFields.length > 0) {
    return { valid: false, reason: `Missing fields: ${missingFields.join(', ')}` };
  }

  // אימות HMAC אם secret key מוגדר
  const secretKey = process.env.PAYPLUS_SECRET_KEY;
  if (!secretKey) {
    console.warn('⚠️ PAYPLUS_SECRET_KEY not set — skipping HMAC verification');
    return { valid: true };
  }

  // בדיקת user-agent
  const userAgent = headers['user-agent'] || headers['User-Agent'] || '';
  if (userAgent !== 'PayPlus') {
    return { valid: false, reason: `Invalid user-agent: ${userAgent}` };
  }

  // בדיקת hash header
  const receivedHash = headers['hash'] || headers['Hash'] || '';
  if (!receivedHash) {
    console.warn('⚠️ No hash header received — skipping HMAC verification');
    return { valid: true };
  }

  // חישוב HMAC-SHA256 של ה-body ב-Base64
  const message = JSON.stringify(body);
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');

  if (expectedHash !== receivedHash) {
    return { valid: false, reason: 'HMAC signature mismatch' };
  }

  return { valid: true };
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

    console.log('🔵 PayPlus Refund Request:', { transaction_uid: body.transaction_uid, amount: body.amount });
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
    const url = `${BASE_URL}/Transactions/Cancel`;
    
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

/**
 * ⚠️ WARNING: This endpoint returns REFUNDS ONLY, not all transactions.
 * Do not use this for general transaction reconciliation.
 * Use getApprovedTransactions() + getRejectedTransactions() instead.
 */
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
