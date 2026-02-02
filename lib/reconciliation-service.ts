/**
 * Reconciliation Service
 * 
 * משווה בין נתוני PayPlus למסד הנתונים ומזהה אי התאמות
 */

import { getServiceClient } from './supabase';

export interface ReconciliationIssue {
  issue_type: 'missing_payment' | 'status_mismatch' | 'amount_mismatch' | 'missing_registration';
  payment_id?: string;
  transaction_uid?: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  details: any;
}

export interface ReconciliationReport {
  report_id: string;
  timestamp: string;
  summary: {
    total_payments: number;
    total_issues: number;
    critical_issues: number;
    warnings: number;
  };
  issues: ReconciliationIssue[];
}

/**
 * בדיקת התאמה בין תשלומים completed לregistrations/passes
 */
export async function checkPaymentConsistency(): Promise<ReconciliationReport> {
  const supabase = getServiceClient();
  const issues: ReconciliationIssue[] = [];

  console.log('[RECONCILIATION] Starting payment consistency check...');

  // 1. תשלומים completed ללא registration (להצגות)
  const { data: paymentsWithoutReg, error: regError } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      created_at,
      metadata,
      registrations (id)
    `)
    .eq('status', 'completed')
    .not('metadata->>event_id', 'is', null);

  if (regError) {
    console.error('[RECONCILIATION] Error fetching payments:', regError);
  } else if (paymentsWithoutReg) {
    for (const payment of paymentsWithoutReg) {
      // @ts-ignore
      if (!payment.registrations || payment.registrations.length === 0) {
        issues.push({
          issue_type: 'missing_registration',
          payment_id: payment.id,
          description: `תשלום completed בלי registration`,
          severity: 'high',
          details: {
            payment_id: payment.id,
            amount: payment.amount,
            event_id: payment.metadata?.event_id,
            created_at: payment.created_at
          }
        });
      }
    }
  }

  // 2. תשלומים completed ללא pass (לכרטיסיות)
  const { data: paymentsWithoutPass, error: passError } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      created_at,
      metadata,
      passes (id)
    `)
    .eq('status', 'completed')
    .not('metadata->>card_type_id', 'is', null);

  if (passError) {
    console.error('[RECONCILIATION] Error fetching payments:', passError);
  } else if (paymentsWithoutPass) {
    for (const payment of paymentsWithoutPass) {
      // @ts-ignore
      if (!payment.passes || payment.passes.length === 0) {
        issues.push({
          issue_type: 'missing_registration',
          payment_id: payment.id,
          description: `תשלום completed בלי pass`,
          severity: 'high',
          details: {
            payment_id: payment.id,
            amount: payment.amount,
            card_type_id: payment.metadata?.card_type_id,
            created_at: payment.created_at
          }
        });
      }
    }
  }

  // 3. תשלומים pending ישנים (מעל 48 שעות)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: stuckPayments, error: stuckError } = await supabase
    .from('payments')
    .select('id, amount, created_at, metadata')
    .eq('status', 'pending')
    .lt('created_at', fortyEightHoursAgo);

  if (!stuckError && stuckPayments) {
    for (const payment of stuckPayments) {
      issues.push({
        issue_type: 'status_mismatch',
        payment_id: payment.id,
        description: `תשלום תקוע במצב pending מעל 48 שעות`,
        severity: 'medium',
        details: {
          payment_id: payment.id,
          amount: payment.amount,
          created_at: payment.created_at,
          age_hours: Math.round((Date.now() - new Date(payment.created_at).getTime()) / (60 * 60 * 1000))
        }
      });
    }
  }

  // 4. תשלומים ללא transaction_uid
  const { data: paymentsWithoutUid, error: uidError } = await supabase
    .from('payments')
    .select('id, amount, status, created_at')
    .is('metadata->>payplus_transaction_uid', null)
    .neq('status', 'pending');

  if (!uidError && paymentsWithoutUid) {
    for (const payment of paymentsWithoutUid) {
      issues.push({
        issue_type: 'missing_payment',
        payment_id: payment.id,
        description: `תשלום ${payment.status} בלי transaction_uid מPayPlus`,
        severity: 'low',
        details: {
          payment_id: payment.id,
          status: payment.status,
          amount: payment.amount,
          created_at: payment.created_at
        }
      });
    }
  }

  // סיכום
  const { count: totalPayments } = await supabase
    .from('payments')
    .select('id', { count: 'exact' });

  const criticalIssues = issues.filter(i => i.severity === 'high').length;
  const warnings = issues.filter(i => i.severity === 'medium' || i.severity === 'low').length;

  // יצירת רשומת דוח
  const { data: syncLog } = await supabase
    .from('sync_logs')
    .insert({
      sync_type: 'reconciliation',
      source: 'system',
      status: 'completed',
      total_checked: totalPayments || 0,
      total_failed: issues.length,
      details: { issues }
    })
    .select('id')
    .single();

  const report: ReconciliationReport = {
    report_id: syncLog?.id || 'unknown',
    timestamp: new Date().toISOString(),
    summary: {
      total_payments: totalPayments || 0,
      total_issues: issues.length,
      critical_issues: criticalIssues,
      warnings: warnings
    },
    issues
  };

  console.log(`[RECONCILIATION] Found ${issues.length} issues (${criticalIssues} critical, ${warnings} warnings)`);

  // יצירת alert אם יש בעיות קריטיות
  if (criticalIssues > 0) {
    await supabase
      .from('alerts')
      .insert({
        alert_type: 'mismatch_detected',
        severity: 'warning',
        title: 'Reconciliation Issues Detected',
        message: `Found ${criticalIssues} critical inconsistencies between payments and registrations`,
        details: {
          sync_log_id: syncLog?.id,
          total_issues: issues.length,
          critical_issues: criticalIssues
        },
        sync_log_id: syncLog?.id
      });
  }

  return report;
}
