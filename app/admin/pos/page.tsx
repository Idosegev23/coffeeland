'use client';

/**
 * POS - קופה וירטואלית למכירת כרטיסיות
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  CreditCard,
  Banknote,
  Search,
  ShoppingCart,
  Check,
  Printer,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface CardType {
  id: string;
  name: string;
  description: string;
  type: string;
  entries_count: number;
  price: number;
  sale_price?: number;
}

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  qr_code: string;
}

// Wrapper component with Suspense for useSearchParams
export default function POSPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען קופה...</p>
        </div>
      </div>
    }>
      <POSContent />
    </Suspense>
  );
}

function POSContent() {
  const searchParams = useSearchParams();
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bit' | 'other'>('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCardTypes();
  }, []);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone && !customer) {
      setPhoneSearch(phone);
      // auto-search
      setTimeout(() => {
        searchCustomer();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadCardTypes = async () => {
    try {
      const res = await fetch('/api/card-types?active=true');
      const data = await res.json();
      setCardTypes(data.card_types || []);
    } catch (error) {
      console.error('Error loading card types:', error);
    }
  };

  const searchCustomer = async () => {
    if (!phoneSearch.trim()) {
      alert('נא להזין מספר טלפון');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneSearch.trim())
        .single();

      if (error || !data) {
        alert('לקוח לא נמצא. ניתן ליצור חשבון חדש בעמוד ההרשמה.');
        return;
      }

      setCustomer(data);
    } catch (error: any) {
      alert('שגיאה בחיפוש: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const completeSale = async () => {
    if (!customer || !selectedCard) {
      alert('נא לבחור לקוח וכרטיסייה');
      return;
    }

    setLoading(true);
    try {
      const finalPrice = selectedCard.sale_price || selectedCard.price;

      // ביצוע מכירה דרך API
      const res = await fetch('/api/admin/pos-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          card_type_id: selectedCard.id,
          total_entries: selectedCard.entries_count,
          price_paid: finalPrice,
          payment_method: paymentMethod,
          pass_type: selectedCard.type,
          card_type_name: selectedCard.name
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to complete sale');
      }

      const data = await res.json();

      // הצגת קבלה
      setReceiptData({
        customer,
        card: selectedCard,
        pass: data.pass,
        payment: data.payment,
        finalPrice
      });
      setShowReceipt(true);

      // איפוס
      setSelectedCard(null);
      setCustomer(null);
      setPhoneSearch('');
      setPaymentMethod('cash');

      alert('✅ מכירה הושלמה בהצלחה!');
    } catch (error: any) {
      console.error('POS sale error:', error);
      alert('❌ שגיאה: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* כפתור חזרה */}
        <Link href="/admin" className="block mb-4">
          <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white">
            <ArrowRight size={18} />
            חזרה לפאנל ניהול
          </Button>
        </Link>

        {/* כותרת */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <ShoppingCart className="ml-3" size={36} />
            קופה - מכירת כרטיסיות
          </h1>
          <p className="text-gray-600 mt-2">מערכת POS וירטואלית למכירה מהירה במקום</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* חיפוש לקוח */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Search className="ml-2" size={20} />
              חיפוש לקוח
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">מספר טלפון</label>
                <input
                  type="text"
                  value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  placeholder="05X-XXXXXXX"
                  className="w-full px-4 py-2 border rounded-md"
                  dir="ltr"
                />
              </div>

              <Button
                onClick={searchCustomer}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? 'מחפש...' : 'חפש לקוח'}
              </Button>

              {customer && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">לקוח נמצא</span>
                    <Check className="text-green-600" size={20} />
                  </div>
                  <p className="font-bold text-lg">{customer.full_name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* בחירת כרטיסייה */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">בחר כרטיסייה</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {cardTypes.map(card => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCard?.id === card.id
                      ? 'border-accent bg-accent/5 shadow-md'
                      : 'border-gray-200 hover:border-accent/50'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {card.entries_count} כניסות
                    </span>
                    <div className="text-left">
                      {card.sale_price && (
                        <span className="text-xs text-gray-400 line-through block">
                          ₪{card.price}
                        </span>
                      )}
                      <span className="text-xl font-bold text-accent">
                        ₪{card.sale_price || card.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedCard && (
              <div className="border-t pt-6">
                <h3 className="font-bold mb-4">אמצעי תשלום</h3>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 hover:border-accent/50'
                    }`}
                  >
                    <Banknote size={24} />
                    <span className="text-sm font-medium">מזומן</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'credit'
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 hover:border-accent/50'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span className="text-sm font-medium">אשראי</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bit')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'bit'
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 hover:border-accent/50'
                    }`}
                  >
                    <span className="text-lg font-bold">₿</span>
                    <span className="text-sm font-medium">Bit</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('other')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'other'
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 hover:border-accent/50'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span className="text-sm font-medium">אחר</span>
                  </button>
                </div>

                <Button
                  onClick={completeSale}
                  disabled={!customer || loading}
                  className="w-full h-14 text-lg bg-accent hover:bg-accent/90"
                >
                  {loading ? 'מעבד...' : `השלם מכירה - ₪${selectedCard.sale_price || selectedCard.price}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* דיאלוג קבלה */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-green-600">
                <Check className="inline-block mb-1" size={28} />
                מכירה הושלמה!
              </DialogTitle>
            </DialogHeader>

            {receiptData && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">לקוח</p>
                  <p className="font-bold text-lg">{receiptData.customer.full_name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">כרטיסייה</p>
                  <p className="font-bold text-lg">{receiptData.card.name}</p>
                  <p className="text-sm text-gray-500">
                    {receiptData.card.entries_count} כניסות
                  </p>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-gray-600">סכום ששולם</p>
                  <p className="font-bold text-3xl text-accent">
                    ₪{receiptData.finalPrice}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {paymentMethod === 'cash' ? 'מזומן' :
                     paymentMethod === 'credit' ? 'אשראי' :
                     paymentMethod === 'bit' ? 'Bit' : 'אחר'}
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  חשבונית ירוקה תישלח למייל הלקוח
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={printReceipt}>
                <Printer className="ml-2" size={16} />
                הדפס
              </Button>
              <Button
                onClick={() => setShowReceipt(false)}
                className="bg-accent"
              >
                סגור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

