'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { CreditCard, Search, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  item_type: string;
  created_at: string;
  transaction_uid: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  refunds: Array<{ 
    id: string; 
    refund_amount: number; 
    status: string;
    created_at: string;
    reason: string;
  }>;
}

export default function RefundsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // פילטרים
  const [statusFilter, setStatusFilter] = useState('completed');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClientComponentClient();

  // טעינת תשלומים
  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const data = await response.json();
      setPayments(data.payments || []);
      setFilteredPayments(data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('שגיאה בטעינת תשלומים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  // חיפוש
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPayments(payments);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = payments.filter(p =>
      p.user?.full_name?.toLowerCase().includes(search) ||
      p.user?.email?.toLowerCase().includes(search) ||
      p.user?.phone?.includes(search) ||
      p.id?.toLowerCase().includes(search)
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  // פתיחת דיאלוג זיכוי
  const openRefundDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount.toString());
    setRefundReason('');
    setShowDialog(true);
  };

  // סגירת דיאלוג
  const closeDialog = () => {
    setShowDialog(false);
    setSelectedPayment(null);
    setRefundAmount('');
    setRefundReason('');
  };

  // ביצוע זיכוי
  const handleRefund = async () => {
    if (!selectedPayment) return;
    
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedPayment.amount) {
      alert('סכום לא תקין');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/refunds/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: selectedPayment.id,
          refund_amount: amount,
          reason: refundReason || null
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ זיכוי בוצע בהצלחה!');
        closeDialog();
        loadPayments(); // רענון
      } else {
        alert(`❌ שגיאה: ${result.message || 'הזיכוי נכשל'}`);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('❌ שגיאה בביצוע זיכוי');
    } finally {
      setProcessing(false);
    }
  };

  // קבלת badge סטטוס
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string; icon: any }> = {
      completed: { text: 'שולם', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { text: 'ממתין', className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      failed: { text: 'נכשל', className: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { text: 'מזוכה', className: 'bg-purple-100 text-purple-800', icon: CreditCard }
    };

    const badge = badges[status] || { text: status, className: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  // קבלת סוג פריט
  const getItemTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      show: 'הצגה',
      pass: 'כרטיסייה',
      event_registration: 'אירוע',
      other: 'אחר'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            ניהול זיכויים
          </h1>
          <p className="text-text-light/70">זיכוי תשלומים ללקוחות דרך PayPlus</p>
        </div>

        {/* פילטרים וחיפוש */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* חיפוש */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light/50 w-5 h-5" />
              <input
                type="text"
                placeholder="חיפוש לפי שם, אימייל, טלפון או מזהה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-text-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* סטטוס */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-text-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="completed">שולם</option>
              <option value="refunded">מזוכה</option>
              <option value="pending">ממתין</option>
              <option value="failed">נכשל</option>
            </select>

            {/* רענון */}
            <Button
              onClick={loadPayments}
              variant="outline"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              רענן
            </Button>
          </div>
        </Card>

        {/* סטטיסטיקות מהירות */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {payments.filter(p => p.status === 'completed' && !p.refunds?.length).length}
            </div>
            <div className="text-sm text-green-600">ניתן לזיכוי</div>
          </Card>
          
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-700">
              {payments.filter(p => p.refunds?.some(r => r.status === 'completed')).length}
            </div>
            <div className="text-sm text-purple-600">זוכו</div>
          </Card>
          
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-700">
              ₪{payments
                .filter(p => p.refunds?.some(r => r.status === 'completed'))
                .reduce((sum, p) => sum + (p.refunds.find(r => r.status === 'completed')?.refund_amount || 0), 0)
                .toFixed(2)}
            </div>
            <div className="text-sm text-blue-600">סכום זיכויים</div>
          </Card>
          
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="text-2xl font-bold text-gray-700">
              {filteredPayments.length}
            </div>
            <div className="text-sm text-gray-600">תוצאות</div>
          </Card>
        </div>

        {/* רשימת תשלומים */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-light/70">טוען תשלומים...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <Card className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-text-light/30 mx-auto mb-4" />
            <p className="text-text-light/70 text-lg">לא נמצאו תשלומים</p>
            <p className="text-text-light/50 text-sm mt-2">נסה לשנות את הפילטרים או לחפש משהו אחר</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map(payment => {
              const hasRefund = payment.refunds && payment.refunds.length > 0;
              const completedRefund = payment.refunds?.find(r => r.status === 'completed');
              
              return (
                <Card key={payment.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* פרטי תשלום */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-lg">{payment.user?.full_name || 'לא ידוע'}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-light/70">
                        <p>📧 {payment.user?.email}</p>
                        <p>📞 {payment.user?.phone || 'לא צוין'}</p>
                        <p>💰 ₪{payment.amount.toFixed(2)}</p>
                        <p>📦 {getItemTypeLabel(payment.item_type)}</p>
                        <p>📅 {new Date(payment.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <p className="text-xs">🔑 {payment.id.substring(0, 8)}...</p>
                      </div>

                      {/* זיכויים קיימים */}
                      {hasRefund && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          {payment.refunds.map(refund => (
                            <div key={refund.id} className="text-sm">
                              <p className="font-semibold text-purple-800">
                                🔄 זיכוי: ₪{refund.refund_amount.toFixed(2)} • {getStatusBadge(refund.status)}
                              </p>
                              {refund.reason && (
                                <p className="text-purple-600 text-xs mt-1">סיבה: {refund.reason}</p>
                              )}
                              <p className="text-purple-500 text-xs">
                                {new Date(refund.created_at).toLocaleDateString('he-IL')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* כפתורי פעולה */}
                    <div className="flex flex-col justify-center gap-2">
                      {payment.status === 'completed' && !completedRefund && (
                        <Button
                          onClick={() => openRefundDialog(payment)}
                          className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                          <CreditCard className="w-4 h-4" />
                          ביצוע זיכוי
                        </Button>
                      )}
                      
                      {payment.status === 'refunded' && (
                        <div className="text-center">
                          <span className="text-purple-600 font-semibold text-sm">✅ מזוכה</span>
                        </div>
                      )}
                      
                      {payment.status === 'pending' && (
                        <span className="text-yellow-600 text-sm">⏳ ממתין לתשלום</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog זיכוי */}
      {showDialog && selectedPayment && (
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-primary mb-4">ביצוע זיכוי</h2>
              
              {/* פרטי לקוח */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-lg mb-2">{selectedPayment.user?.full_name}</p>
                <p className="text-sm text-gray-600">{selectedPayment.user?.email}</p>
                <p className="text-sm text-gray-600">{selectedPayment.user?.phone}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-lg font-bold text-primary">סכום מקורי: ₪{selectedPayment.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getItemTypeLabel(selectedPayment.item_type)} • {new Date(selectedPayment.created_at).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>

              {/* סכום זיכוי */}
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-primary">
                  סכום לזיכוי (₪)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedPayment.amount}
                  min="0"
                  step="0.01"
                  className="border border-text-light/20 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-lg"
                  placeholder={`מקסימום: ${selectedPayment.amount}`}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setRefundAmount(selectedPayment.amount.toString())}
                    className="text-sm px-3 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20"
                  >
                    זיכוי מלא
                  </button>
                  <button
                    onClick={() => setRefundAmount((selectedPayment.amount / 2).toString())}
                    className="text-sm px-3 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20"
                  >
                    50%
                  </button>
                </div>
              </div>

              {/* סיבה */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-primary">
                  סיבת הזיכוי (אופציונלי)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="border border-text-light/20 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                  placeholder="למשל: בקשת לקוח, ביטול אירוע, וכו'"
                />
              </div>

              {/* אזהרה */}
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>שים לב:</strong> פעולת הזיכוי תבוצע באופן מיידי דרך PayPlus ולא ניתן לבטל אותה.
                  {parseFloat(refundAmount) === selectedPayment.amount && (
                    <span className="block mt-1">הכרטיס/רישום יבוטל אוטומטית.</span>
                  )}
                </p>
              </div>

              {/* כפתורים */}
              <div className="flex gap-2">
                <Button
                  onClick={handleRefund}
                  disabled={processing || !refundAmount || parseFloat(refundAmount) <= 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      מעבד זיכוי...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      אשר זיכוי
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  disabled={processing}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </Card>
          </div>
        </Dialog>
      )}
    </div>
  );
}
