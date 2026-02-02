import { getServiceClient } from './supabase';
import Papa from 'papaparse';
import { getTransactionsHistory, PayPlusTransaction } from './payplus';

/**
 * PayPlus Transaction Report Reconciliation Service
 * משווה בין דוחות PayPlus CSV לבין המערכת
 */

export interface PayPlusTransactionRow {
  'מס\' עסקה': string; // Transaction number (more_info)
  'UID של עסקה': string; // Transaction UID
  'תאריך העסקה': string;
  'זמן עסקה': string;
  'לקוח': string;
  'אימייל הלקוח': string;
  'סוג עסקה': string;
  'מס\' אישור': string;
  'סכום': string;
  'מטבע': string;
  'פרטים נוספים': string; // Transaction ref (more_info)
  'more-info-1': string; // Payment ID in our system
}

export interface ReconciliationResult {
  success: boolean;
  totalInReport: number;
  matchedInSystem: number;
  missingInSystem: number[];
  extraInSystem: number[];
  statusMismatches: Array<{
    paymentId: string;
    transactionRef: string;
    systemStatus: string;
    shouldBe: string;
  }>;
  fixed: number;
  errors: string[];
}

/**
 * ניתוח CSV של PayPlus
 */
export function parsePayPlusCSV(csvContent: string): PayPlusTransactionRow[] {
  try {
    const result = Papa.parse<PayPlusTransactionRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8'
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
    }

    return result.data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

/**
 * התאמה (Reconciliation) בין דוח PayPlus למערכת
 */
export async function reconcileWithPayPlusReport(
  csvContent: string,
  autoFix: boolean = false
): Promise<ReconciliationResult> {
  const supabase = getServiceClient();
  
  const result: ReconciliationResult = {
    success: false,
    totalInReport: 0,
    matchedInSystem: 0,
    missingInSystem: [],
    extraInSystem: [],
    statusMismatches: [],
    fixed: 0,
    errors: []
  };

  try {
    // Parse CSV
    const transactions = parsePayPlusCSV(csvContent);
    result.totalInReport = transactions.length;

    console.log(`📊 Reconciling ${transactions.length} transactions from PayPlus report`);

    // קבלת כל התשלומים מהמערכת שנוצרו באותו תאריך
    const dates = transactions.map(t => {
      const [day, month, year] = t['תאריך העסקה'].split('/');
      return `${year}-${month}-${day}`;
    });
    const uniqueDates = [...new Set(dates)];

    const { data: systemPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, status, metadata, amount, created_at, completed_at')
      .gte('created_at', `${uniqueDates[0]}T00:00:00`)
      .lte('created_at', `${uniqueDates[uniqueDates.length - 1]}T23:59:59`);

    if (paymentsError) {
      result.errors.push(`Error fetching payments: ${paymentsError.message}`);
      return result;
    }

    // יצירת map של תשלומים לפי more-info-1 (payment_id)
    const paymentMap = new Map(systemPayments?.map(p => [p.id, p]) || []);

    // בדיקת כל עסקה מהדוח
    for (const transaction of transactions) {
      const paymentId = transaction['more-info-1'];
      const transactionRef = transaction['פרטים נוספים']?.replace(/"/g, '');
      const transactionType = transaction['סוג עסקה'];
      
      if (!paymentId) {
        result.errors.push(`Transaction ${transactionRef} has no payment_id (more-info-1)`);
        continue;
      }

      const systemPayment = paymentMap.get(paymentId);

      if (!systemPayment) {
        // תשלום קיים ב-PayPlus אבל לא במערכת
        result.missingInSystem.push(paymentId);
        result.errors.push(`Payment ${paymentId} (${transactionRef}) exists in PayPlus but not in system`);
        continue;
      }

      result.matchedInSystem++;

      // בדיקת התאמת סטטוס
      const isCharge = transactionType === 'חיוב';
      const isRefund = transactionType === 'זיכוי';
      
      let expectedStatus: string;
      if (isCharge) {
        expectedStatus = 'completed';
      } else if (isRefund) {
        expectedStatus = 'refunded';
      } else {
        expectedStatus = 'failed';
      }

      if (systemPayment.status !== expectedStatus) {
        result.statusMismatches.push({
          paymentId,
          transactionRef,
          systemStatus: systemPayment.status,
          shouldBe: expectedStatus
        });

        // תיקון אוטומטי אם מופעל
        if (autoFix) {
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: expectedStatus,
              completed_at: expectedStatus === 'completed' ? new Date().toISOString() : null,
              notes: `Auto-fixed by reconciliation from PayPlus report`
            })
            .eq('id', paymentId);

          if (!updateError) {
            result.fixed++;
            console.log(`✅ Fixed payment ${paymentId}: ${systemPayment.status} → ${expectedStatus}`);
            
            // אם התשלום הפך ל-completed, צור registrations אם חסרות
            if (expectedStatus === 'completed' && systemPayment.metadata?.event_id) {
              const { count: regCount } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('payment_id', paymentId);

              if (regCount === 0) {
                const quantity = systemPayment.metadata?.quantity || 1;
                const registrationsToInsert = Array.from({ length: quantity }, () => ({
                  event_id: systemPayment.metadata.event_id,
                  user_id: systemPayment.user_id,
                  status: 'confirmed',
                  is_paid: true,
                  payment_id: paymentId,
                  ticket_type: systemPayment.metadata?.ticket_type || 'regular',
                  registered_at: systemPayment.completed_at || new Date().toISOString()
                }));

                await supabase.from('registrations').insert(registrationsToInsert);
                console.log(`✅ Created ${quantity} registration(s) for payment ${paymentId}`);
              }
            }
          } else {
            result.errors.push(`Failed to fix payment ${paymentId}: ${updateError.message}`);
          }
        }
      }
    }

    // בדיקת תשלומים במערכת שלא בדוח (completed/pending שלא עברו סליקה)
    const reportPaymentIds = new Set(
      transactions.map(t => t['more-info-1']).filter(Boolean)
    );
    
    const extraPayments = systemPayments?.filter(
      p => p.status === 'completed' && !reportPaymentIds.has(p.id)
    ) || [];

    for (const extraPayment of extraPayments) {
      result.extraInSystem.push(extraPayment.id);
      
      if (autoFix) {
        // בטל תשלומים שלא בדוח
        const { error: cancelError } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            notes: 'Not found in PayPlus report - cancelled by reconciliation'
          })
          .eq('id', extraPayment.id);

        if (!cancelError) {
          // מחק registrations של תשלום מבוטל
          await supabase
            .from('registrations')
            .delete()
            .eq('payment_id', extraPayment.id);
          
          result.fixed++;
          console.log(`✅ Cancelled payment ${extraPayment.id} (not in PayPlus report)`);
        }
      }
    }

    result.success = true;
    console.log(`✅ Reconciliation complete: ${result.matchedInSystem}/${result.totalInReport} matched, ${result.fixed} fixed`);

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error('Reconciliation error:', error);
  }

  return result;
}

/**
 * התאמה אוטומטית עם PayPlus API (ללא צורך ב-CSV)
 */
export async function reconcileWithPayPlusAPI(
  daysBack: number = 7,
  autoFix: boolean = false
): Promise<ReconciliationResult> {
  const supabase = getServiceClient();
  
  const result: ReconciliationResult = {
    success: false,
    totalInReport: 0,
    matchedInSystem: 0,
    missingInSystem: [],
    extraInSystem: [],
    statusMismatches: [],
    fixed: 0,
    errors: []
  };

  try {
    // חישוב תאריכים
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`📊 Fetching transactions from PayPlus (${fromDate} to ${toDate})...`);

    // משיכת עסקאות מ-PayPlus API
    const payPlusResult = await getTransactionsHistory({
      from_date: fromDate,
      to_date: toDate
    });

    if (!payPlusResult.success) {
      result.errors.push(`Failed to fetch from PayPlus: ${payPlusResult.error}`);
      return result;
    }

    const transactions = payPlusResult.transactions;
    result.totalInReport = transactions.length;

    console.log(`📊 Reconciling ${transactions.length} transactions from PayPlus API`);

    // קבלת כל התשלומים מהמערכת באותו טווח זמן
    const { data: systemPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, status, metadata, amount, created_at, completed_at, user_id')
      .gte('created_at', `${fromDate}T00:00:00`)
      .lte('created_at', `${toDate}T23:59:59`);

    if (paymentsError) {
      result.errors.push(`Error fetching payments: ${paymentsError.message}`);
      return result;
    }

    // יצירת map של תשלומים לפי payment_id (more_info_1)
    const paymentMap = new Map(systemPayments?.map(p => [p.id, p]) || []);

    // בדיקת כל עסקה מ-PayPlus
    for (const transaction of transactions) {
      const paymentId = transaction.more_info_1;
      const transactionRef = transaction.more_info;
      const transactionType = transaction.transaction_type;
      
      if (!paymentId) {
        result.errors.push(`Transaction ${transactionRef} has no payment_id (more_info_1)`);
        continue;
      }

      const systemPayment = paymentMap.get(paymentId);

      if (!systemPayment) {
        // תשלום קיים ב-PayPlus אבל לא במערכת
        result.missingInSystem.push(paymentId);
        result.errors.push(`Payment ${paymentId} (${transactionRef}) exists in PayPlus but not in system`);
        continue;
      }

      result.matchedInSystem++;

      // בדיקת התאמת סטטוס
      const isCharge = transactionType === 'Charge';
      const isRefund = transactionType === 'Refund';
      
      let expectedStatus: string;
      if (isCharge) {
        expectedStatus = 'completed';
      } else if (isRefund) {
        expectedStatus = 'refunded';
      } else {
        expectedStatus = 'failed';
      }

      if (systemPayment.status !== expectedStatus) {
        result.statusMismatches.push({
          paymentId,
          transactionRef,
          systemStatus: systemPayment.status,
          shouldBe: expectedStatus
        });

        // תיקון אוטומטי אם מופעל
        if (autoFix) {
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: expectedStatus,
              completed_at: expectedStatus === 'completed' ? new Date().toISOString() : null,
              notes: `Auto-fixed by PayPlus API reconciliation`
            })
            .eq('id', paymentId);

          if (!updateError) {
            result.fixed++;
            console.log(`✅ Fixed payment ${paymentId}: ${systemPayment.status} → ${expectedStatus}`);
            
            // אם התשלום הפך ל-completed, צור registrations אם חסרות
            if (expectedStatus === 'completed' && systemPayment.metadata?.event_id) {
              const { count: regCount } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('payment_id', paymentId);

              if (regCount === 0) {
                const quantity = systemPayment.metadata?.quantity || 1;
                const registrationsToInsert = Array.from({ length: quantity }, () => ({
                  event_id: systemPayment.metadata.event_id,
                  user_id: systemPayment.user_id,
                  status: 'confirmed',
                  is_paid: true,
                  payment_id: paymentId,
                  ticket_type: systemPayment.metadata?.ticket_type || 'regular',
                  registered_at: systemPayment.completed_at || new Date().toISOString()
                }));

                await supabase.from('registrations').insert(registrationsToInsert);
                console.log(`✅ Created ${quantity} registration(s) for payment ${paymentId}`);
              }
            }
          } else {
            result.errors.push(`Failed to fix payment ${paymentId}: ${updateError.message}`);
          }
        }
      }
    }

    // בדיקת תשלומים במערכת שלא ב-PayPlus (completed שלא עברו סליקה)
    const reportPaymentIds = new Set(
      transactions.map(t => t.more_info_1).filter(Boolean)
    );
    
    const extraPayments = systemPayments?.filter(
      p => p.status === 'completed' && !reportPaymentIds.has(p.id)
    ) || [];

    for (const extraPayment of extraPayments) {
      result.extraInSystem.push(extraPayment.id);
      
      if (autoFix) {
        // בטל תשלומים שלא ב-PayPlus
        const { error: cancelError } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            notes: 'Not found in PayPlus API - cancelled by reconciliation'
          })
          .eq('id', extraPayment.id);

        if (!cancelError) {
          // מחק registrations של תשלום מבוטל
          await supabase
            .from('registrations')
            .delete()
            .eq('payment_id', extraPayment.id);
          
          result.fixed++;
          console.log(`✅ Cancelled payment ${extraPayment.id} (not in PayPlus)`);
        }
      }
    }

    result.success = true;
    console.log(`✅ API Reconciliation complete: ${result.matchedInSystem}/${result.totalInReport} matched, ${result.fixed} fixed`);

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error('Reconciliation error:', error);
  }

  return result;
}

/**
 * יצירת דוח reconciliation
 */
export function generateReconciliationReport(result: ReconciliationResult): string {
  let report = '═══════════════════════════════════════════\n';
  report += '   דוח התאמה PayPlus ← מערכת\n';
  report += '═══════════════════════════════════════════\n\n';

  report += `✅ סה"כ עסקאות בדוח PayPlus: ${result.totalInReport}\n`;
  report += `✅ נמצאו במערכת: ${result.matchedInSystem}\n`;
  report += `❌ חסרות במערכת: ${result.missingInSystem.length}\n`;
  report += `⚠️  עודפות במערכת: ${result.extraInSystem.length}\n`;
  report += `🔧 אי התאמות סטטוס: ${result.statusMismatches.length}\n`;
  
  if (result.fixed > 0) {
    report += `\n✨ תוקנו: ${result.fixed} רשומות\n`;
  }

  if (result.statusMismatches.length > 0) {
    report += '\n\n📋 אי התאמות סטטוס:\n';
    report += '─────────────────────────────────────────\n';
    result.statusMismatches.forEach(mismatch => {
      report += `• ${mismatch.transactionRef}\n`;
      report += `  Payment ID: ${mismatch.paymentId}\n`;
      report += `  במערכת: ${mismatch.systemStatus} → צריך להיות: ${mismatch.shouldBe}\n\n`;
    });
  }

  if (result.extraInSystem.length > 0) {
    report += '\n\n⚠️  תשלומים עודפים במערכת (לא בדוח PayPlus):\n';
    report += '─────────────────────────────────────────\n';
    result.extraInSystem.forEach(id => {
      report += `• ${id}\n`;
    });
  }

  if (result.errors.length > 0) {
    report += '\n\n❌ שגיאות:\n';
    report += '─────────────────────────────────────────\n';
    result.errors.forEach(error => {
      report += `• ${error}\n`;
    });
  }

  report += '\n═══════════════════════════════════════════\n';

  return report;
}
