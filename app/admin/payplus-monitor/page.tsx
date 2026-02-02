'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SyncStats {
  pending_payments: number;
  active_alerts: number;
  recent_syncs: any[];
}

interface WebhookLog {
  id: string;
  created_at: string;
  status: string;
  payment_id: string | null;
  retry_count: number;
  error_message: string | null;
}

interface Alert {
  id: string;
  created_at: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
}

export default function PayPlusMonitorPage() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
    // רענון אוטומטי כל 30 שניות
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      // טעינת סטטיסטיקות
      const statsRes = await fetch('/api/admin/payplus/sync');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // טעינת webhooks אחרונים
      const webhooksRes = await fetch('/api/admin/webhooks/logs?limit=20');
      const webhooksData = await webhooksRes.json();
      if (webhooksData.success) {
        setWebhooks(webhooksData.logs || []);
      }

      // טעינת alerts פעילים
      const alertsRes = await fetch('/api/admin/alerts?status=active&limit=10');
      const alertsData = await alertsRes.json();
      if (alertsData.success) {
        setAlerts(alertsData.alerts || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/payplus/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_pending', maxAge: 72, limit: 50 })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`סנכרון הושלם!\nעודכנו: ${data.result.total_updated}\nנכשלו: ${data.result.total_failed}`);
        loadData();
      } else {
        alert(`שגיאה: ${data.error}`);
      }
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'processing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* כותרת */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ניטור PayPlus</h1>
            <p className="text-gray-600">מעקב אחר תשלומים, webhooks והתראות</p>
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? 'מסנכרן...' : '🔄 סנכרון ידני'}
          </Button>
        </div>

        {/* סטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-sm text-gray-600">תשלומים ממתינים</div>
            <div className="text-4xl font-bold mt-2">{stats?.pending_payments || 0}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-gray-600">התראות פעילות</div>
            <div className="text-4xl font-bold mt-2 text-red-600">{stats?.active_alerts || 0}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-gray-600">סנכרונים אחרונים</div>
            <div className="text-4xl font-bold mt-2">{stats?.recent_syncs?.length || 0}</div>
          </Card>
        </div>

        {/* טאבים */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">התראות</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="syncs">סנכרונים</TabsTrigger>
          </TabsList>

          {/* התראות */}
          <TabsContent value="alerts">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">התראות פעילות</h2>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    ✅ אין התראות פעילות
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.alert_type}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(alert.created_at).toLocaleString('he-IL')}
                            </span>
                          </div>
                          <div className="font-semibold">{alert.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Webhooks אחרונים</h2>
              <div className="space-y-2">
                {webhooks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    אין webhooks אחרונים
                  </div>
                ) : (
                  webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between border-b py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(webhook.status)}>
                            {webhook.status}
                          </Badge>
                          {webhook.retry_count > 0 && (
                            <Badge variant="outline">
                              ניסיון #{webhook.retry_count + 1}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(webhook.created_at).toLocaleString('he-IL')}
                        </div>
                        {webhook.error_message && (
                          <div className="text-sm text-red-600 mt-1">
                            {webhook.error_message}
                          </div>
                        )}
                      </div>
                      {webhook.payment_id && (
                        <div className="text-sm text-gray-500">
                          Payment: {webhook.payment_id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* סנכרונים */}
          <TabsContent value="syncs">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">סנכרונים אחרונים</h2>
              <div className="space-y-3">
                {!stats?.recent_syncs || stats.recent_syncs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    אין סנכרונים אחרונים
                  </div>
                ) : (
                  stats.recent_syncs.map((sync: any) => (
                    <div key={sync.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(sync.status)}>
                              {sync.status}
                            </Badge>
                            <Badge variant="outline">{sync.sync_type}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(sync.created_at).toLocaleString('he-IL')}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">נבדקו</div>
                              <div className="font-semibold">{sync.total_checked || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">עודכנו</div>
                              <div className="font-semibold text-green-600">{sync.total_updated || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">נכשלו</div>
                              <div className="font-semibold text-red-600">{sync.total_failed || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">זמן</div>
                              <div className="font-semibold">{sync.duration_ms}ms</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
