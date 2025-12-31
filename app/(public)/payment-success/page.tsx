'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Phone, Mail, Home, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [transactionDetails, setTransactionDetails] = useState<{
    type?: string;
    amount?: string;
    name?: string;
  }>({});

  useEffect(() => {
    // Get transaction details from URL params if provided
    const type = searchParams.get('type') || 'רכישה';
    const amount = searchParams.get('amount');
    const name = searchParams.get('name');
    
    setTransactionDetails({ type, amount, name });
  }, [searchParams]);

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

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-600 text-sm">
                📧 פרטי העסקה נשלחו אליך באמצעי ההתקשרות שסופקו
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/my-account">
                <Button variant="outline" className="w-full h-12 gap-2">
                  <User className="w-5 h-5" />
                  לאזור האישי
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

