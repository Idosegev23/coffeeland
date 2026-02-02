import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isPayPlusConfigured, checkTransactionStatus } from '@/lib/payplus';
import { getRateLimitStats } from '@/lib/rate-limiter';

/**
 * Health Check API
 * GET /api/admin/health
 * 
 * בודק את תקינות כל המערכות:
 * - Database connectivity
 * - PayPlus API connectivity
 * - Webhook endpoint
 * - Rate limiter status
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: any = {};

  try {
    // 1. בדיקת Database
    try {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .limit(1);

      checks.database = {
        status: error ? 'error' : 'healthy',
        message: error ? error.message : 'Database connection successful',
        response_time_ms: Date.now() - startTime
      };
    } catch (err: any) {
      checks.database = {
        status: 'error',
        message: err.message,
        response_time_ms: Date.now() - startTime
      };
    }

    // 2. בדיקת PayPlus Configuration
    const payplusConfigured = isPayPlusConfigured();
    checks.payplus_config = {
      status: payplusConfigured ? 'healthy' : 'warning',
      message: payplusConfigured 
        ? 'PayPlus API keys configured' 
        : 'PayPlus API keys missing',
      configured: payplusConfigured
    };

    // 3. בדיקת PayPlus API Connectivity (אם configured)
    if (payplusConfigured) {
      try {
        const testStart = Date.now();
        // ננסה לעשות קריאה לAPI (עם transaction_uid בדיוני)
        // אם נקבל תשובה (גם אם שגיאה), המשמעות היא שה-API זמין
        const response = await checkTransactionStatus('test-health-check-uid');
        
        checks.payplus_api = {
          status: response ? 'healthy' : 'warning',
          message: response ? 'PayPlus API responding' : 'No response from PayPlus API',
          response_time_ms: Date.now() - testStart
        };
      } catch (err: any) {
        checks.payplus_api = {
          status: 'warning',
          message: `PayPlus API check failed: ${err.message}`,
          response_time_ms: Date.now() - startTime
        };
      }
    }

    // 4. בדיקת Webhook Endpoint
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_URL || 'https://coffelandclub.co.il'}/api/payments/payplus/callback`;
      const webhookStart = Date.now();
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'health-check' }
      });

      checks.webhook_endpoint = {
        status: webhookResponse.ok ? 'healthy' : 'warning',
        message: webhookResponse.ok 
          ? 'Webhook endpoint accessible' 
          : `Webhook endpoint returned ${webhookResponse.status}`,
        url: webhookUrl,
        response_time_ms: Date.now() - webhookStart
      };
    } catch (err: any) {
      checks.webhook_endpoint = {
        status: 'error',
        message: `Webhook endpoint unreachable: ${err.message}`
      };
    }

    // 5. Rate Limiter Status
    try {
      const rateLimitStats = getRateLimitStats();
      
      checks.rate_limiter = {
        status: rateLimitStats.availability.can_make_request ? 'healthy' : 'warning',
        message: rateLimitStats.availability.can_make_request 
          ? 'Rate limiter operating normally' 
          : 'Rate limit reached',
        stats: rateLimitStats
      };
    } catch (err: any) {
      checks.rate_limiter = {
        status: 'error',
        message: `Rate limiter check failed: ${err.message}`
      };
    }

    // 6. סיכום כללי
    const allHealthy = Object.values(checks).every((check: any) => check.status === 'healthy');
    const hasErrors = Object.values(checks).some((check: any) => check.status === 'error');

    const overallStatus = hasErrors ? 'degraded' : (allHealthy ? 'healthy' : 'warning');

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      checks
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      error: error.message,
      checks
    }, { status: 500 });
  }
}
