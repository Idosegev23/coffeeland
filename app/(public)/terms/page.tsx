import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'תנאי שימוש | CoffeeLand Club',
  description: 'תנאי השימוש באתר ובשירותי CoffeeLand Club',
};

export default function TermsPage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <FileText className="w-16 h-16 mx-auto text-primary mb-6" />
            <h1 className="text-3xl font-bold text-primary mb-4">תנאי שימוש</h1>
            <p className="text-gray-600 mb-8">
              כל תנאי השימוש, מדיניות הפרטיות, מדיניות הביטולים ואבטחת המידע 
              מרוכזים כעת בדף המסמכים המשפטיים המאוחד.
            </p>
            <Link 
              href="/legal" 
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-colors text-lg"
            >
              למסמכים המשפטיים
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
