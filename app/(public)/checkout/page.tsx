'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CreditCard, 
  Lock, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  Shield,
  Calendar,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CartItem {
  id: string;
  name: string;
  type: string;
  price: number;
  entries: number;
  description?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'cart' | 'payment' | 'processing'>('cart');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  // Form fields for demo payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [idNumber, setIdNumber] = useState('');

  useEffect(() => {
    loadCheckoutData();
  }, [searchParams]);

  const loadCheckoutData = async () => {
    try {
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login?redirect=/checkout?' + searchParams.toString());
        return;
      }
      setUser(authUser);

      // Get item from URL params
      const itemId = searchParams.get('item');
      const itemType = searchParams.get('type') || 'pass';

      if (!itemId) {
        router.push('/passes');
        return;
      }

      // Load item data
      if (itemType === 'pass') {
        const { data: cardType, error } = await supabase
          .from('card_types')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error || !cardType) {
          setError('לא נמצא המוצר המבוקש');
          return;
        }

        setCartItem({
          id: cardType.id,
          name: cardType.name,
          type: cardType.type,
          price: cardType.sale_price || cardType.price,
          entries: cardType.entries_count,
          description: cardType.description
        });
      } else if (itemType === 'event') {
        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error || !event) {
          setError('לא נמצא האירוע המבוקש');
          return;
        }

        setCartItem({
          id: event.id,
          name: event.title,
          type: 'event',
          price: event.price || 0,
          entries: 1,
          description: event.description
        });
      }
    } catch (err) {
      console.error('Error loading checkout:', err);
      setError('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('מספר כרטיס לא תקין');
      return false;
    }
    if (cardName.trim().length < 2) {
      setError('נא להזין שם בעל הכרטיס');
      return false;
    }
    if (expiryDate.length < 5) {
      setError('תאריך תפוגה לא תקין');
      return false;
    }
    if (cvv.length < 3) {
      setError('CVV לא תקין');
      return false;
    }
    if (idNumber.length < 9) {
      setError('תעודת זהות לא תקינה');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');
    
    if (!validateForm()) return;
    
    setStep('processing');
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create the pass in database
      if (!cartItem || !user) throw new Error('Missing data');

      const itemType = searchParams.get('type') || 'pass';

      if (itemType === 'pass') {
        // Calculate expiry
        const expiryMonths = cartItem.entries >= 10 ? 6 : cartItem.entries >= 5 ? 3 : 2;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

        // Create pass
        const { error: passError } = await supabase
          .from('passes')
          .insert({
            user_id: user.id,
            card_type_id: cartItem.id,
            type: cartItem.type,
            pass_type: cartItem.type,
            total_entries: cartItem.entries,
            remaining_entries: cartItem.entries,
            expiry_date: expiryDate.toISOString(),
            price_paid: cartItem.price,
            status: 'active',
          });

        if (passError) throw passError;

        // Create payment record
        await supabase.from('payments').insert({
          user_id: user.id,
          amount: cartItem.price,
          currency: 'ILS',
          payment_type: 'online',
          payment_method: 'credit_card',
          item_type: 'pass',
          item_id: cartItem.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            card_last_four: cardNumber.slice(-4),
            created_via: 'online_checkout'
          }
        });
      } else if (itemType === 'event') {
        // Create event registration
        const { error: regError } = await supabase
          .from('registrations')
          .insert({
            event_id: cartItem.id,
            user_id: user.id,
            status: 'confirmed',
            is_paid: true,
          });

        if (regError) throw regError;
      }

      // Redirect to success page
      const successUrl = `/payment-success?type=${encodeURIComponent(cartItem.name)}&amount=${cartItem.price}&name=${encodeURIComponent(user.user_metadata?.full_name || '')}`;
      router.push(successUrl);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'שגיאה בעיבוד התשלום');
      setStep('payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-text-light/70">טוען נתוני רכישה...</p>
        </div>
      </div>
    );
  }

  if (error && !cartItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild>
            <Link href="/passes">חזרה לכרטיסיות</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-light to-background">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute top-10 left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute bottom-20 right-10 -rotate-12" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/2create-logo.webp" alt="CoffeeLand" width={120} height={40} className="mx-auto" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            השלמת רכישה
          </h1>
          <div className="flex items-center justify-center gap-2 text-text-light/60">
            <Lock className="w-4 h-4" />
            <span className="text-sm">תשלום מאובטח עם ישראכרט</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'cart' || step === 'payment' || step === 'processing' ? 'text-accent' : 'text-text-light/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'cart' || step === 'payment' || step === 'processing' ? 'bg-accent text-white' : 'bg-gray-200'}`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">סל קניות</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step === 'payment' || step === 'processing' ? 'text-accent' : 'text-text-light/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' || step === 'processing' ? 'bg-accent text-white' : 'bg-gray-200'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">תשלום</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-accent' : 'text-text-light/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'processing' ? 'bg-accent text-white' : 'bg-gray-200'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">אישור</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Cart Summary - Right Side */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="p-6 bg-white/80 backdrop-blur-sm sticky top-4">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                סיכום הזמנה
              </h2>

              {cartItem && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center">
                      {cartItem.type === 'event' ? (
                        <Calendar className="w-8 h-8 text-accent" />
                      ) : (
                        <Ticket className="w-8 h-8 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{cartItem.name}</h3>
                      {cartItem.entries > 1 && (
                        <p className="text-sm text-text-light/70">{cartItem.entries} כניסות</p>
                      )}
                      {cartItem.description && (
                        <p className="text-xs text-text-light/60 mt-1 line-clamp-2">{cartItem.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light/70">סכום ביניים</span>
                  <span>₪{cartItem?.price}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>כולל מע"מ</span>
                  <span>✓</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-primary">סה"כ לתשלום</span>
                  <span className="text-accent">₪{cartItem?.price}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">תשלום מאובטח SSL</span>
              </div>

              <div className="mt-4 flex justify-center">
                <Image 
                  src="/images/isracard-logo.png" 
                  alt="Isracard" 
                  width={80} 
                  height={30}
                  className="opacity-70"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Payment Form - Left Side */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {step === 'processing' ? (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">מעבד תשלום...</h2>
                <p className="text-text-light/70">אנא המתן, אל תסגור את הדף</p>
              </Card>
            ) : step === 'cart' ? (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-primary mb-6">אישור הזמנה</h2>
                
                {cartItem && (
                  <div className="bg-background-light rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{cartItem.name}</h3>
                        <p className="text-sm text-text-light/70">
                          {cartItem.entries > 1 ? `${cartItem.entries} כניסות` : 'כניסה אחת'}
                        </p>
                      </div>
                      <div className="text-xl font-bold text-accent">₪{cartItem.price}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/passes">
                      <ArrowRight className="w-4 h-4 ml-2" />
                      חזרה
                    </Link>
                  </Button>
                  <Button onClick={() => setStep('payment')} className="flex-1">
                    המשך לתשלום
                    <CreditCard className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  פרטי תשלום
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      מספר כרטיס אשראי
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-left direction-ltr"
                        dir="ltr"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Card Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      שם בעל הכרטיס
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        תוקף
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-center"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        placeholder="***"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      תעודת זהות בעל הכרטיס
                    </label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      maxLength={9}
                      placeholder="123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-text-light/70">
                  <p>
                    בלחיצה על "שלם עכשיו" אני מאשר/ת שקראתי והסכמתי ל
                    <Link href="/legal" className="text-accent hover:underline mx-1">תנאי השימוש</Link>
                    ו
                    <Link href="/legal#privacy" className="text-accent hover:underline mx-1">מדיניות הפרטיות</Link>
                  </p>
                </div>

                {/* Submit */}
                <div className="mt-6 flex gap-4">
                  <Button variant="outline" onClick={() => setStep('cart')} className="flex-1">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    חזרה
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        מעבד...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        שלם ₪{cartItem?.price}
                      </>
                    )}
                  </Button>
                </div>

                {/* Demo Notice */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-sm text-yellow-800">
                    🧪 <strong>מצב דמו</strong> - התשלום לא אמיתי. הזינו פרטים כלשהם להמשך.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-text-light/70">טוען...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

