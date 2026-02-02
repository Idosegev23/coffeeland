'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, RefreshCw, Eye, CheckCircle2, XCircle, 
  RotateCcw, DollarSign, FileText, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  payment_method: string;
  created_at: string;
  completed_at: string | null;
  metadata: any;
  users: {
    email: string;
    full_name: string;
    phone: string;
  };
  registrations: Array<{
    id: string;
    status: string;
    ticket_type: string;
    events: {
      title: string;
      start_at: string;
    };
  }>;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [statusFilter]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('limit', '100');

      const res = await fetch(`/api/admin/transactions?${params}`);
      const data = await res.json();

      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'failed': return 'bg-red-600 text-white';
      case 'refunded': return 'bg-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: 'הושלם',
      pending: 'ממתין',
      failed: 'נכשל',
      refunded: 'זוכה'
    };
    return statusMap[status] || status;
  };

  const filteredTransactions = transactions.filter(t => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(search) ||
      t.users?.email?.toLowerCase().includes(search) ||
      t.users?.full_name?.toLowerCase().includes(search) ||
      t.amount.toString().includes(search)
    );
  });

  // סטטיסטיקות
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalAmount: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">טוען עסקאות...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* כותרת */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ניהול עסקאות</h1>
            <p className="text-gray-600">מערכת ניהול מלאה לתשלומים, חיובים והחזרים</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadTransactions} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              רענן
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/admin/transactions/create">
                <DollarSign className="w-4 h-4 ml-2" />
                עסקה חדשה
              </Link>
            </Button>
          </div>
        </div>

        {/* סטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">סה&quot;כ עסקאות</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="text-sm text-green-700">הושלמו</div>
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
          </Card>
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="text-sm text-yellow-700">ממתינות</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          </Card>
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="text-sm text-red-700">נכשלו</div>
            <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
          </Card>
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="text-sm text-blue-700">סה&quot;כ הכנסות</div>
            <div className="text-2xl font-bold text-blue-700">
              ₪{stats.totalAmount.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* פילטרים וחיפוש */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש לפי ID, מייל, שם או סכום..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'completed', 'pending', 'failed', 'refunded'].map(status => (
                <Button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                >
                  {status === 'all' ? 'הכל' : getStatusText(status)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* טבלת עסקאות */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold">מזהה עסקה</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">לקוח</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">סכום</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">סטטוס</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">אמצעי תשלום</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">תאריך</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{transaction.id.substring(0, 8)}...</div>
                      {transaction.metadata?.transaction_ref && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.metadata.transaction_ref}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{transaction.users?.full_name}</div>
                      <div className="text-sm text-gray-500">{transaction.users?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">₪{transaction.amount}</div>
                      <div className="text-xs text-gray-500">{transaction.currency || 'ILS'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusText(transaction.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{transaction.payment_type}</div>
                      <div className="text-xs text-gray-500">{transaction.payment_method || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {new Date(transaction.created_at).toLocaleDateString('he-IL')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleTimeString('he-IL')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          asChild
                          title="צפה בפרטים"
                        >
                          <Link href={`/admin/transactions/${transaction.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        
                        {transaction.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            title="אשר עסקה"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {transaction.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-purple-600 hover:text-purple-700"
                            title="החזר כספי"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {(transaction.status === 'pending' || transaction.status === 'failed') && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title="בטל עסקה"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>לא נמצאו עסקאות</p>
              </div>
            )}
          </div>
        </Card>

        {/* לינקים מהירים */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Link href="/admin/reports" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">דוחות וסטטיסטיקות</div>
                  <div className="text-sm text-gray-600">ניתוחים מעמיקים</div>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Link href="/admin/payplus-monitor" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">סנכרון PayPlus</div>
                  <div className="text-sm text-gray-600">ניטור והתאמה</div>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Link href="/admin/refunds" className="block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold">החזרים</div>
                  <div className="text-sm text-gray-600">ניהול החזרים כספיים</div>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
