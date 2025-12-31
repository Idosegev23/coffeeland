import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | CoffeeLand Club',
  description: 'מדיניות הפרטיות של CoffeeLand Club - כיצד אנו אוספים ומשתמשים במידע שלכם',
};

export default function PrivacyPage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Lock className="w-16 h-16 mx-auto text-blue-600 mb-6" />
            <h1 className="text-3xl font-bold text-primary mb-4">מדיניות פרטיות</h1>
            <p className="text-gray-600 mb-8">
              מדיניות הפרטיות שלנו, יחד עם תנאי השימוש, מדיניות הביטולים ואבטחת המידע,
              מרוכזים כעת בדף המסמכים המשפטיים המאוחד.
            </p>
            <Link 
              href="/legal#privacy" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-medium hover:bg-blue-700 transition-colors text-lg"
            >
              למדיניות הפרטיות
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
