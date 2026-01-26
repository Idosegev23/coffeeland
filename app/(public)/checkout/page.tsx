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
  Ticket,
  ExternalLink,
  AlertCircle
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
  const [step, setStep] = useState<'cart' | 'redirecting'>('cart');
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);

  // Check for error from PayPlus redirect
  const paymentError = searchParams.get('error');

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

  const handlePayment = async () => {
    setError('');
    setStep('redirecting');
    setProcessing(true);

    try {
      if (!cartItem || !user) throw new Error('Missing data');

      const itemType = searchParams.get('type') || 'pass';

      // Call our PayPlus API to create payment link
      const response = await fetch('/api/payments/payplus/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartItem.price,
          card_type_id: itemType === 'pass' ? cartItem.id : null,
          card_type_name: cartItem.name,
          entries_count: cartItem.entries,
          description: `רכישת ${cartItem.name}`,
          items: [{
            name: cartItem.name,
            quantity: 1,
            price: cartItem.price
          }]
        })
      });

      const data = await response.json();

      if (!response.ok || !data.payment_url) {
        console.error('PayPlus error:', data);
        throw new Error(data.error || data.details || 'שגיאה ביצירת קישור תשלום');
      }

      console.log('✅ Redirecting to PayPlus:', data.payment_url);
      
      // Redirect to PayPlus payment page
      window.location.href = data.payment_url;

    } catch (err: unknown) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעיבוד התשלום';
      setError(errorMessage);
      setStep('cart');
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
            <span className="text-sm">תשלום מאובטח עם PayPlus</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'cart' || step === 'redirecting' ? 'text-accent' : 'text-text-light/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'cart' || step === 'redirecting' ? 'bg-accent text-white' : 'bg-gray-200'}`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">סל קניות</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step === 'redirecting' ? 'text-accent' : 'text-text-light/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'redirecting' ? 'bg-accent text-white' : 'bg-gray-200'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">תשלום</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2 text-text-light/40">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">אישור</span>
          </div>
        </div>

        {/* Payment Error Alert */}
        {paymentError && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">התשלום לא הושלם</p>
                <p className="text-sm text-red-600">אנא נסה שנית או פנה לתמיכה</p>
              </div>
            </div>
          </div>
        )}

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
                  <span>כולל מע&quot;מ</span>
                  <span>✓</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-primary">סה&quot;כ לתשלום</span>
                  <span className="text-accent">₪{cartItem?.price}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">תשלום מאובטח SSL</span>
              </div>

              {/* PayPlus Badge */}
              <div className="mt-4 text-center">
                <p className="text-xs text-text-light/50 mb-2">מופעל על ידי</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-primary">PayPlus</span>
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {step === 'redirecting' ? (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="w-16 h-16 animate-spin text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">מעביר לדף תשלום מאובטח...</h2>
                <p className="text-text-light/70 mb-4">אנא המתן, אתה מועבר לדף התשלום של PayPlus</p>
                <div className="flex items-center justify-center gap-2 text-sm text-text-light/50">
                  <ExternalLink className="w-4 h-4" />
                  <span>תשלום מאובטח מחוץ לאתר</span>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-primary mb-6">אישור הזמנה</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

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

                {/* Payment Info */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">תשלום מאובטח</h4>
                      <p className="text-sm text-blue-700">
                        בלחיצה על &quot;המשך לתשלום&quot; תועבר לדף תשלום מאובטח של PayPlus. 
                        פרטי האשראי שלך לא נשמרים באתר שלנו.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accepted Cards */}
                <div className="mb-6">
                  <p className="text-sm text-text-light/60 mb-2 text-center">אמצעי תשלום נתמכים:</p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">Visa</div>
                    <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">Mastercard</div>
                    <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">American Express</div>
                    <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">Diners</div>
                    <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium">Isracard</div>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-text-light/70 mb-6">
                  <p>
                    בלחיצה על &quot;המשך לתשלום&quot; אני מאשר/ת שקראתי והסכמתי ל
                    <Link href="/legal" className="text-accent hover:underline mx-1">תנאי השימוש</Link>
                    ו
                    <Link href="/legal#privacy" className="text-accent hover:underline mx-1">מדיניות הפרטיות</Link>
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/passes">
                      <ArrowRight className="w-4 h-4 ml-2" />
                      חזרה
                    </Link>
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
                        המשך לתשלום מאובטח
                      </>
                    )}
                  </Button>
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
