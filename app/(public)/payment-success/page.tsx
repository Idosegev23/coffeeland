'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Phone, Mail, Home, User, Loader2, ArrowLeft, Ticket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PaymentDetails {
  type?: string;
  amount?: string;
  name?: string;
  status?: string;
  passId?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [transactionDetails, setTransactionDetails] = useState<PaymentDetails>({});
  const [countdown, setCountdown] = useState(8);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    loadPaymentDetails();
  }, [searchParams]);

  const loadPaymentDetails = async () => {
    try {
      const paymentId = searchParams.get('payment_id');
      const ref = searchParams.get('ref');

      if (paymentId) {
        // Fetch payment details from database
        const { data: payment, error } = await supabase
          .from('payments')
          .select('*, metadata')
          .eq('id', paymentId)
          .single();

        if (payment && !error) {
          // Check if payment is still pending (PayPlus callback hasn't arrived yet)
          if (payment.status === 'pending') {
            setIsPending(true);
            // Poll for updates
            const pollInterval = setInterval(async () => {
              const { data: updatedPayment } = await supabase
                .from('payments')
                .select('*, metadata')
                .eq('id', paymentId)
                .single();
              
              if (updatedPayment && updatedPayment.status !== 'pending') {
                clearInterval(pollInterval);
                setIsPending(false);
                setTransactionDetails({
                  type: updatedPayment.metadata?.card_type_name || 'רכישה',
                  amount: updatedPayment.amount?.toString(),
                  name: updatedPayment.notes || updatedPayment.metadata?.card_type_name,
                  status: updatedPayment.status,
                  passId: updatedPayment.metadata?.pass_id
                });
              }
            }, 2000);
            
            // Stop polling after 30 seconds
            setTimeout(() => clearInterval(pollInterval), 30000);
          } else {
            setTransactionDetails({
              type: payment.metadata?.card_type_name || 'רכישה',
              amount: payment.amount?.toString(),
              name: payment.notes || payment.metadata?.card_type_name,
              status: payment.status,
              passId: payment.metadata?.pass_id
            });
          }
        }
      } else {
        // Fallback to URL params
        const type = searchParams.get('type') || 'רכישה';
        const amount = searchParams.get('amount') ?? undefined;
        const name = searchParams.get('name') ?? undefined;
        setTransactionDetails({ type, amount, name });
      }
    } catch (err) {
      console.error('Error loading payment details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-redirect to my-account after countdown
  useEffect(() => {
    if (loading || isPending) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/my-account');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, loading, isPending]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">טוען פרטי עסקה...</p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-600 mb-4">
                מעבד תשלום...
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                אנא המתן, מאשרים את התשלום
              </p>
              <div className="bg-yellow-50 rounded-xl p-4 flex items-center justify-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-700 text-sm">
                  הדף יתעדכן אוטומטית כאשר התשלום יאושר
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
              תודה על הרכישה! 🎉
            </h1>
            
            <p className="text-xl text-gray-700 mb-6">
              התשלום נקלט בהצלחה
            </p>

            {/* Transaction Details */}
            {(transactionDetails.name || transactionDetails.amount) && (
              <div className="bg-green-50 rounded-xl p-6 mb-6 text-right">
                <h2 className="font-semibold text-green-800 mb-3 text-center">פרטי העסקה</h2>
                <div className="space-y-2">
                  {transactionDetails.type && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">{transactionDetails.type}</span>
                      <span className="text-gray-600">סוג רכישה</span>
                    </div>
                  )}
                  {transactionDetails.name && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">{transactionDetails.name}</span>
                      <span className="text-gray-600">פריט</span>
                    </div>
                  )}
                  {transactionDetails.amount && (
                    <div className="flex justify-between items-center border-t border-green-200 pt-2 mt-2">
                      <span className="text-green-700 font-bold text-xl">₪{transactionDetails.amount}</span>
                      <span className="text-gray-600">סכום</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pass Created Notice */}
            {transactionDetails.passId && (
              <div className="bg-accent/10 rounded-xl p-4 mb-6 flex items-center gap-3">
                <Ticket className="w-8 h-8 text-accent" />
                <div className="text-right">
                  <p className="font-medium text-primary">הכרטיסייה נוספה לחשבון!</p>
                  <p className="text-sm text-text-light/70">תוכל לראות אותה באזור האישי</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-600 text-sm">
                📧 פרטי העסקה נשלחו אליך באמצעי ההתקשרות שסופקו
              </p>
            </div>

            {/* Auto-redirect Notice */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">{countdown}</span>
              </div>
              <p className="text-blue-700 text-sm">
                מעבר אוטומטי לאיזור האישי בעוד {countdown} שניות...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/my-account">
                <Button className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700">
                  <User className="w-5 h-5" />
                  לאזור האישי
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full h-12 gap-2">
                  <Home className="w-5 h-5" />
                  לדף הבית
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">יש שאלות? אנחנו כאן</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="tel:052-5636067" 
                className="inline-flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                052-5636067
              </a>
              <a 
                href="mailto:coffeeland256@gmail.com" 
                className="inline-flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                coffeeland256@gmail.com
              </a>
            </div>
          </div>

          {/* Legal Note */}
          <p className="text-xs text-gray-500 mt-6">
            בביצוע הרכישה אישרת את{' '}
            <Link href="/legal" className="text-green-600 hover:underline">
              תנאי השימוש ומדיניות הפרטיות
            </Link>
          </p>

        </div>
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
