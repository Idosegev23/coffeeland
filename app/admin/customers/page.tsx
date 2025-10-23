'use client';

/**
 * אדמין - ניהול לקוחות
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Edit,
  Phone,
  Mail,
  QrCode,
  CreditCard,
  ArrowRight,
  Calendar,
  Coffee
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  qr_code: string;
  created_at: string;
  loyalty_card?: {
    total_stamps: number;
    redeemed_coffees: number;
  };
  passes?: Array<{
    id: string;
    card_type: {
      name: string;
    };
    entries_used: number;
    entries_remaining: number;
    status: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          loyalty_card:loyalty_cards(*),
          passes:passes(
            id,
            entries_used,
            entries_remaining,
            status,
            card_type:card_types(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error: any) {
      console.error('Error loading customers:', error);
      alert('שגיאה בטעינת לקוחות');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer =>
      customer.full_name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.qr_code.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const openCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען לקוחות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כפתור חזרה */}
        <Link href="/admin">
          <Button variant="outline" className="mb-4 flex items-center gap-2">
            <ArrowRight size={18} />
            חזרה לפאנל ניהול
          </Button>
        </Link>

        {/* כותרת */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            <Users className="inline-block mr-2 mb-1" />
            ניהול לקוחות
          </h1>
          <p className="text-gray-600">צפייה וניהול של כל הלקוחות במערכת</p>
        </div>

        {/* סטטיסטיקות מהירות */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">סך הכל לקוחות</p>
                <p className="text-3xl font-bold text-primary">{customers.length}</p>
              </div>
              <Users className="text-primary opacity-20" size={48} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">כרטיסיות פעילות</p>
                <p className="text-3xl font-bold text-accent">
                  {customers.reduce((sum, c) => sum + (c.passes?.filter(p => p.status === 'active').length || 0), 0)}
                </p>
              </div>
              <CreditCard className="text-accent opacity-20" size={48} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">חותמות נאספו</p>
                <p className="text-3xl font-bold text-green-600">
                  {customers.reduce((sum, c) => sum + (c.loyalty_card?.[0]?.total_stamps || 0), 0)}
                </p>
              </div>
              <Coffee className="text-green-600 opacity-20" size={48} />
            </div>
          </div>
        </div>

        {/* חיפוש */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם, טלפון, אימייל או QR..."
              className="flex-1 outline-none text-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                נקה
              </Button>
            )}
          </div>
        </div>

        {/* רשימת לקוחות */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">שם</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">טלפון</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">אימייל</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">QR</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">כרטיסיות</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">חותמות</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">תאריך הצטרפות</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.full_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail size={14} />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {customer.qr_code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        <CreditCard size={14} />
                        {customer.passes?.filter(p => p.status === 'active').length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        <Coffee size={14} />
                        {customer.loyalty_card?.[0]?.total_stamps || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCustomerDetails(customer)}
                      >
                        <Edit size={14} className="ml-1" />
                        פרטים
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>לא נמצאו לקוחות התואמים לחיפוש "{searchQuery}"</p>
                ) : (
                  <p>אין עדיין לקוחות במערכת</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dialog - פרטי לקוח */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>פרטי לקוח</DialogTitle>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6 py-4">
                {/* מידע אישי */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users size={20} />
                    מידע אישי
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">שם מלא:</span>
                      <span className="font-medium">{selectedCustomer.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">טלפון:</span>
                      <span className="font-medium">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">אימייל:</span>
                      <span className="font-medium">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">QR Code:</span>
                      <code className="bg-white px-2 py-1 rounded border">
                        {selectedCustomer.qr_code}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">תאריך הצטרפות:</span>
                      <span className="font-medium">{formatDate(selectedCustomer.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* כרטיס נאמנות */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Coffee size={20} />
                    כרטיס נאמנות
                  </h3>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">חותמות נאספו</p>
                        <p className="text-3xl font-bold text-green-700">
                          {selectedCustomer.loyalty_card?.[0]?.total_stamps || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">קפה חינם נוצל</p>
                        <p className="text-3xl font-bold text-green-700">
                          {selectedCustomer.loyalty_card?.[0]?.redeemed_coffees || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* כרטיסיות פעילות */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CreditCard size={20} />
                    כרטיסיות ({selectedCustomer.passes?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {selectedCustomer.passes && selectedCustomer.passes.length > 0 ? (
                      selectedCustomer.passes.map((pass) => (
                        <div
                          key={pass.id}
                          className={`p-3 rounded-lg border-2 ${
                            pass.status === 'active'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{pass.card_type.name}</p>
                              <p className="text-sm text-gray-600">
                                נוצלו: {pass.entries_used} | נותרו: {pass.entries_remaining}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded text-sm ${
                                pass.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {pass.status === 'active' ? 'פעיל' : 'לא פעיל'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">אין כרטיסיות</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setShowDetailsDialog(false)}>
                סגור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

