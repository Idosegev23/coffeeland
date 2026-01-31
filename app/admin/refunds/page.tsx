'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { CreditCard, Search, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle, ExternalLink, Info, Database } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  item_type: string;
  created_at: string;
  transaction_uid: string;
  metadata?: {
    payplus_page_request_uid?: string;
    payplus_transaction_uid?: string;
    transaction_ref?: string;
    card_type_name?: string;
    event_id?: string;
    ticket_type?: string;
    [key: string]: any;
  };
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

interface PayPlusSearchResult {
  success: boolean;
  search: {
    uid: string;
    type: string;
  };
  database: {
    found: boolean;
    payment_id?: string;
    amount?: number;
    status?: string;
    created_at?: string;
    user?: any;
    registrations?: any[];
    metadata?: any;
  };
  payplus: {
    found: boolean;
    data?: any;
    error?: string;
  };
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

  // חיפוש PayPlus
  const [showPayPlusSearch, setShowPayPlusSearch] = useState(false);
  const [payPlusSearchUid, setPayPlusSearchUid] = useState('');
  const [payPlusSearchType, setPayPlusSearchType] = useState<'transaction' | 'page_request'>('page_request');
  const [payPlusSearching, setPayPlusSearching] = useState(false);
  const [payPlusResult, setPayPlusResult] = useState<PayPlusSearchResult | null>(null);

  // הצגת פרטים מפורטים
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<Payment | null>(null);

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

  // חיפוש עסקה ב-PayPlus
  const searchPayPlus = async () => {
    if (!payPlusSearchUid.trim()) {
      alert('יש להזין מזהה עסקה');
      return;
    }

    setPayPlusSearching(true);
    setPayPlusResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `/api/admin/payplus/check-transaction?uid=${encodeURIComponent(payPlusSearchUid)}&type=${payPlusSearchType}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search PayPlus');
      }

      const result: PayPlusSearchResult = await response.json();
      setPayPlusResult(result);

      // אם נמצא תשלום במסד הנתונים, נוסיף אותו לרשימה אם הוא לא קיים
      if (result.database.found && result.database.payment_id) {
        const existingPayment = payments.find(p => p.id === result.database.payment_id);
        if (!existingPayment) {
          // רענון הרשימה כדי לכלול את התשלום
          await loadPayments();
        }
      }
    } catch (error) {
      console.error('Error searching PayPlus:', error);
      alert('❌ שגיאה בחיפוש ב-PayPlus');
    } finally {
      setPayPlusSearching(false);
    }
  };

  // הצגת פרטים מפורטים של תשלום
  const showPaymentDetails = (payment: Payment) => {
    setSelectedPaymentDetails(payment);
    setShowDetailsDialog(true);
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

        {/* כפתור חיפוש PayPlus */}
        <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">חיפוש ישיר ב-PayPlus API</span>
            </div>
            <Button
              onClick={() => setShowPayPlusSearch(true)}
              variant="outline"
              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Search className="w-4 h-4" />
              חפש עסקה
            </Button>
          </div>
        </Card>

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
                      <Button
                        onClick={() => showPaymentDetails(payment)}
                        variant="outline"
                        className="gap-2 text-xs"
                        size="sm"
                      >
                        <Info className="w-3 h-3" />
                        פרטים מלאים
                      </Button>

                      {(payment.metadata?.payplus_page_request_uid || payment.metadata?.payplus_transaction_uid) && (
                        <Button
                          onClick={() => {
                            const uid = payment.metadata?.payplus_transaction_uid || payment.metadata?.payplus_page_request_uid || '';
                            const type = payment.metadata?.payplus_transaction_uid ? 'transaction' : 'page_request';
                            setPayPlusSearchUid(uid);
                            setPayPlusSearchType(type);
                            setShowPayPlusSearch(true);
                            setTimeout(() => searchPayPlus(), 100);
                          }}
                          variant="outline"
                          className="gap-2 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                          size="sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          בדוק ב-PayPlus
                        </Button>
                      )}

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

      {/* Dialog חיפוש PayPlus */}
      {showPayPlusSearch && (
        <Dialog open={showPayPlusSearch} onOpenChange={setShowPayPlusSearch}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <ExternalLink className="w-6 h-6" />
                חיפוש עסקה ב-PayPlus API
              </h2>

              {/* טופס חיפוש */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-primary">סוג מזהה</label>
                  <select
                    value={payPlusSearchType}
                    onChange={(e) => setPayPlusSearchType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-text-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="page_request">Page Request UID (מהלינק)</option>
                    <option value="transaction">Transaction UID (מהעסקה)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-primary">מזהה לחיפוש</label>
                  <input
                    type="text"
                    value={payPlusSearchUid}
                    onChange={(e) => setPayPlusSearchUid(e.target.value)}
                    placeholder="למשל: 7F9gvmYXwy או 273213fb-ccd4-40b1-8a70-c81c2a418ce7"
                    className="w-full px-4 py-2 border border-text-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <Button
                  onClick={searchPayPlus}
                  disabled={payPlusSearching || !payPlusSearchUid.trim()}
                  className="w-full gap-2"
                >
                  {payPlusSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      מחפש...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      חפש עסקה
                    </>
                  )}
                </Button>
              </div>

              {/* תוצאות חיפוש */}
              {payPlusResult && (
                <div className="space-y-4">
                  {/* תוצאות מסד נתונים */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      מסד נתונים
                    </h3>
                    
                    {payPlusResult.database.found ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-green-600 font-semibold">✅ נמצא תשלום במערכת</p>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <p><strong>Payment ID:</strong> {payPlusResult.database.payment_id?.substring(0, 8)}...</p>
                          <p><strong>סכום:</strong> ₪{payPlusResult.database.amount}</p>
                          <p><strong>סטטוס:</strong> {payPlusResult.database.status}</p>
                          <p><strong>תאריך:</strong> {payPlusResult.database.created_at && new Date(payPlusResult.database.created_at).toLocaleDateString('he-IL')}</p>
                        </div>
                        {payPlusResult.database.user && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="font-semibold">{payPlusResult.database.user.full_name}</p>
                            <p className="text-xs text-gray-600">{payPlusResult.database.user.email}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-yellow-600">⚠️ לא נמצא תשלום במסד נתונים</p>
                    )}
                  </div>

                  {/* תוצאות PayPlus */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-blue-600" />
                      PayPlus API
                    </h3>
                    
                    {payPlusResult.payplus.found ? (
                      <div className="text-sm">
                        <p className="text-green-600 font-semibold mb-3">✅ נמצא ב-PayPlus</p>
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto max-h-64">
                          {JSON.stringify(payPlusResult.payplus.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        {payPlusResult.payplus.error || 'לא ניתן לבדוק ב-PayPlus (זמין רק ל-transaction_uid)'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPayPlusSearch(false);
                    setPayPlusResult(null);
                    setPayPlusSearchUid('');
                  }}
                  className="w-full"
                >
                  סגור
                </Button>
              </div>
            </Card>
          </div>
        </Dialog>
      )}

      {/* Dialog פרטים מלאים */}
      {showDetailsDialog && selectedPaymentDetails && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <Info className="w-6 h-6" />
                פרטים מלאים - {selectedPaymentDetails.user?.full_name}
              </h2>

              <div className="space-y-4">
                {/* פרטי תשלום */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-3">פרטי תשלום</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p><strong>Payment ID:</strong> <code className="text-xs bg-white px-2 py-1 rounded">{selectedPaymentDetails.id}</code></p>
                    <p><strong>סכום:</strong> ₪{selectedPaymentDetails.amount.toFixed(2)}</p>
                    <p><strong>סטטוס:</strong> {getStatusBadge(selectedPaymentDetails.status)}</p>
                    <p><strong>סוג תשלום:</strong> {selectedPaymentDetails.payment_type}</p>
                    <p><strong>סוג פריט:</strong> {getItemTypeLabel(selectedPaymentDetails.item_type)}</p>
                    <p><strong>תאריך יצירה:</strong> {new Date(selectedPaymentDetails.created_at).toLocaleString('he-IL')}</p>
                  </div>
                </div>

                {/* פרטי משתמש */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold mb-3">פרטי משתמש</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>שם מלא:</strong> {selectedPaymentDetails.user?.full_name}</p>
                    <p><strong>אימייל:</strong> {selectedPaymentDetails.user?.email}</p>
                    <p><strong>טלפון:</strong> {selectedPaymentDetails.user?.phone}</p>
                    <p><strong>User ID:</strong> <code className="text-xs bg-white px-2 py-1 rounded">{selectedPaymentDetails.user?.id}</code></p>
                  </div>
                </div>

                {/* Metadata */}
                {selectedPaymentDetails.metadata && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-bold mb-3">מטא-דאטה</h3>
                    <div className="space-y-2 text-sm">
                      {selectedPaymentDetails.metadata.payplus_page_request_uid && (
                        <p><strong>PayPlus Page UID:</strong> <code className="text-xs bg-white px-2 py-1 rounded">{selectedPaymentDetails.metadata.payplus_page_request_uid}</code></p>
                      )}
                      {selectedPaymentDetails.metadata.payplus_transaction_uid && (
                        <p><strong>PayPlus Transaction UID:</strong> <code className="text-xs bg-white px-2 py-1 rounded">{selectedPaymentDetails.metadata.payplus_transaction_uid}</code></p>
                      )}
                      {selectedPaymentDetails.metadata.transaction_ref && (
                        <p><strong>Transaction Ref:</strong> <code className="text-xs bg-white px-2 py-1 rounded">{selectedPaymentDetails.metadata.transaction_ref}</code></p>
                      )}
                      {selectedPaymentDetails.metadata.card_type_name && (
                        <p><strong>שם מוצר:</strong> {selectedPaymentDetails.metadata.card_type_name}</p>
                      )}
                      {selectedPaymentDetails.metadata.ticket_type && (
                        <p><strong>סוג כרטיס:</strong> {selectedPaymentDetails.metadata.ticket_type}</p>
                      )}
                      <details className="mt-4">
                        <summary className="cursor-pointer font-semibold text-purple-700">הצג JSON מלא</summary>
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto mt-2 max-h-64">
                          {JSON.stringify(selectedPaymentDetails.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}

                {/* זיכויים */}
                {selectedPaymentDetails.refunds && selectedPaymentDetails.refunds.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-bold mb-3">זיכויים</h3>
                    <div className="space-y-3">
                      {selectedPaymentDetails.refunds.map((refund) => (
                        <div key={refund.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">₪{refund.refund_amount.toFixed(2)}</span>
                            {getStatusBadge(refund.status)}
                          </div>
                          {refund.reason && <p className="text-sm text-gray-600">סיבה: {refund.reason}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(refund.created_at).toLocaleString('he-IL')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                {(selectedPaymentDetails.metadata?.payplus_page_request_uid || selectedPaymentDetails.metadata?.payplus_transaction_uid) && (
                  <Button
                    onClick={() => {
                      const uid = selectedPaymentDetails.metadata?.payplus_transaction_uid || selectedPaymentDetails.metadata?.payplus_page_request_uid || '';
                      const type = selectedPaymentDetails.metadata?.payplus_transaction_uid ? 'transaction' : 'page_request';
                      setPayPlusSearchUid(uid);
                      setPayPlusSearchType(type);
                      setShowDetailsDialog(false);
                      setShowPayPlusSearch(true);
                      setTimeout(() => searchPayPlus(), 100);
                    }}
                    variant="outline"
                    className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    בדוק ב-PayPlus
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setSelectedPaymentDetails(null);
                  }}
                  className="flex-1"
                >
                  סגור
                </Button>
              </div>
            </Card>
          </div>
        </Dialog>
      )}

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
