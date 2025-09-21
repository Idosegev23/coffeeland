'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { FileText, Send, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const dataRequestSchema = z.object({
  requesterEmail: z.string().email('כתובת מייל לא תקינה'),
  requestType: z.enum(['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'], {
    required_error: 'בחרו סוג בקשה',
  }),
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  idNumber: z.string().min(8, 'מספר זהות לא תקין').max(9, 'מספר זהות לא תקין'),
  phone: z.string().optional(),
  details: z.string().min(10, 'אנא פרטו את בקשתכם (לפחות 10 תווים)'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  preferredResponse: z.enum(['email', 'phone', 'mail']).default('email'),
  consent: z.boolean().refine(val => val === true, 'חובה לאשר את תנאי הבקשה'),
});

type DataRequestForm = z.infer<typeof dataRequestSchema>;

const requestTypes = [
  {
    value: 'access',
    label: 'זכות עיון',
    description: 'לקבל עותק מהמידע האישי שאנו מחזיקים עליכם',
    icon: FileText,
  },
  {
    value: 'rectification',
    label: 'זכות תיקון',
    description: 'לתקן מידע שגוי או לא מדויק',
    icon: CheckCircle,
  },
  {
    value: 'erasure',
    label: 'זכות מחיקה',
    description: 'לבקש מחיקת המידע האישי (במקרים מסוימים)',
    icon: AlertCircle,
  },
  {
    value: 'restriction',
    label: 'זכות הגבלה',
    description: 'להגביל את השימוש במידע האישי',
    icon: Shield,
  },
  {
    value: 'portability',
    label: 'זכות ניידות',
    description: 'לקבל את המידע בפורמט מובנה ונגיש',
    icon: FileText,
  },
  {
    value: 'objection',
    label: 'זכות התנגדות',
    description: 'להתנגד לעיבוד המידע לצרכי שיווק',
    icon: AlertCircle,
  },
];

const urgencyLevels = [
  { value: 'low', label: 'רגילה', description: 'תגובה תוך 30 יום' },
  { value: 'medium', label: 'בינונית', description: 'תגובה תוך 14 יום' },
  { value: 'high', label: 'דחופה', description: 'תגובה תוך 7 ימים (במקרים מיוחדים)' },
];

const responsePreferences = [
  { value: 'email', label: 'דואל אלקטרוני', description: 'מהיר ונוח' },
  { value: 'phone', label: 'טלפון', description: 'לבירורים מורכבים' },
  { value: 'mail', label: 'דואר רגיל', description: 'למסמכים רשמיים' },
];

export default function DataRequestsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<DataRequestForm>({
    resolver: zodResolver(dataRequestSchema),
  });

  const selectedRequestType = watch('requestType');
  const selectedRequest = requestTypes.find(rt => rt.value === selectedRequestType);

  const onSubmit = async (data: DataRequestForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/data-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const result = await response.json();
      
      setRequestId(result.requestId);
      setSubmitted(true);
      toast.success('בקשתכם נשלחה בהצלחה!');
      
    } catch (error) {
      console.error('Error submitting data request:', error);
      toast.error('שגיאה בשליחת הבקשה. אנא נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-coffee-900 mb-4">בקשתכם נשלחה בהצלחה!</h1>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <p className="text-green-800 font-medium mb-2">מספר בקשה: {requestId}</p>
              <p className="text-green-700 text-sm">שמרו מספר זה למעקב אחר הבקשה</p>
            </div>
            
            <div className="space-y-4 text-right">
              <h3 className="font-semibold text-coffee-900">מה הלאה?</h3>
              <div className="space-y-2 text-coffee-700 text-sm">
                <p>✓ קיבלנו את בקשתכם ונבדוק אותה</p>
                <p>✓ נשלח אישור קבלה לדואל שציינתם</p>
                <p>✓ נחזור אליכם עם תגובה בהתאם לסוג הבקשה</p>
                <p>✓ במקרה של שאלות, פנו אלינו עם מספר הבקשה</p>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => { setSubmitted(false); reset(); }}>
                שלח בקשה נוספת
              </Button>
              <Button variant="outline" asChild>
                <a href="/">חזור לדף הבית</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-latte" />
          </div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">בקשות נתונים אישיים</h1>
          <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
            מלאו את הטופס להגשת בקשה בנוגע למידע האישי שלכם בהתאם לחוק הגנת הפרטיות
          </p>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <Clock className="w-8 h-8 text-tropical-600 mx-auto mb-3" />
            <h3 className="font-semibold text-coffee-900 mb-2">זמן מענה</h3>
            <p className="text-coffee-700 text-sm">עד 30 יום מקבלת הבקשה</p>
          </div>
          
          <div className="card p-6 text-center">
            <Shield className="w-8 h-8 text-tropical-600 mx-auto mb-3" />
            <h3 className="font-semibold text-coffee-900 mb-2">אימות זהות</h3>
            <p className="text-coffee-700 text-sm">נדרש לצורך הגנה על הפרטיות</p>
          </div>
          
          <div className="card p-6 text-center">
            <FileText className="w-8 h-8 text-tropical-600 mx-auto mb-3" />
            <h3 className="font-semibold text-coffee-900 mb-2">ללא תשלום</h3>
            <p className="text-coffee-700 text-sm">כל הבקשות מטופלות חינם</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6 border-b border-coffee-200 pb-2">
              פרטים אישיים
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  שם מלא *
                </label>
                <input
                  {...register('fullName')}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                  placeholder="השם המלא שלכם"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  כתובת מייל *
                </label>
                <input
                  {...register('requesterEmail')}
                  type="email"
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                  placeholder="email@example.com"
                />
                {errors.requesterEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.requesterEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  מספר זהות *
                </label>
                <input
                  {...register('idNumber')}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                  placeholder="123456789"
                  maxLength={9}
                />
                {errors.idNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.idNumber.message}</p>
                )}
                <p className="text-coffee-600 text-xs mt-1">נדרש לאימות זהות ואבטחת המידע</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  טלפון (אופציונלי)
                </label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                  placeholder="050-1234567"
                />
              </div>
            </div>
          </section>

          {/* Request Type */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6 border-b border-coffee-200 pb-2">
              סוג הבקשה *
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {requestTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`
                      relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                      ${selectedRequestType === type.value
                        ? 'border-tropical-600 bg-tropical-50'
                        : 'border-coffee-200 hover:border-coffee-300 bg-white'
                      }
                    `}
                  >
                    <input
                      {...register('requestType')}
                      type="radio"
                      value={type.value}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mt-1 ml-3 ${
                      selectedRequestType === type.value ? 'text-tropical-600' : 'text-coffee-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-semibold text-coffee-900 mb-1">{type.label}</div>
                      <div className="text-sm text-coffee-600">{type.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.requestType && (
              <p className="text-red-600 text-sm mt-2">{errors.requestType.message}</p>
            )}
          </section>

          {/* Request Details */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6 border-b border-coffee-200 pb-2">
              פרטי הבקשה
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-2">
                  פירוט הבקשה *
                </label>
                <textarea
                  {...register('details')}
                  rows={6}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                  placeholder={
                    selectedRequest
                      ? `אנא פרטו את בקשתכם ל${selectedRequest.label.toLowerCase()}. לדוגמה: איזה מידע אתם רוצים לראות, מה צריך לתקן, וכו'...`
                      : 'אנא פרטו את בקשתכם...'
                  }
                />
                {errors.details && (
                  <p className="text-red-600 text-sm mt-1">{errors.details.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-3">
                    רמת דחיפות
                  </label>
                  <div className="space-y-2">
                    {urgencyLevels.map((level) => (
                      <label key={level.value} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <input
                          {...register('urgency')}
                          type="radio"
                          value={level.value}
                          className="text-tropical-600 focus:ring-tropical-600"
                        />
                        <div>
                          <span className="font-medium text-coffee-900">{level.label}</span>
                          <span className="text-sm text-coffee-600 block">{level.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-3">
                    אופן מענה מועדף
                  </label>
                  <div className="space-y-2">
                    {responsePreferences.map((pref) => (
                      <label key={pref.value} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <input
                          {...register('preferredResponse')}
                          type="radio"
                          value={pref.value}
                          className="text-tropical-600 focus:ring-tropical-600"
                        />
                        <div>
                          <span className="font-medium text-coffee-900">{pref.label}</span>
                          <span className="text-sm text-coffee-600 block">{pref.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Consent */}
          <section>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <input
                  {...register('consent')}
                  type="checkbox"
                  className="mt-1 text-tropical-600 focus:ring-tropical-600 rounded"
                />
                <div className="text-sm">
                  <label className="text-coffee-900 font-medium cursor-pointer">
                    אני מאשר/ת את תנאי הבקשה *
                  </label>
                  <div className="text-coffee-700 mt-1 space-y-1">
                    <p>• אני מאשר/ת כי המידע שמסרתי נכון ומדויק</p>
                    <p>• אני מבין/ה כי יתכן ויידרש אימות זהות נוסף</p>
                    <p>• אני מודע/ת לזכויותיי בהתאם לחוק הגנת הפרטיות</p>
                    <p>• אני מסכים/ה לעיבוד המידע לצורך טיפול בבקשה</p>
                  </div>
                </div>
              </div>
              {errors.consent && (
                <p className="text-red-600 text-sm mt-2">{errors.consent.message}</p>
              )}
            </div>
          </section>

          {/* Submit Button */}
          <div className="border-t border-coffee-200 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto text-lg px-8 py-4"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <div className="w-4 h-4 border-2 border-latte border-t-transparent rounded-full animate-spin" />
                  <span>שולח בקשה...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <Send className="w-5 h-5" />
                  <span>שלח בקשה</span>
                </div>
              )}
            </Button>
            
            <p className="text-coffee-600 text-sm mt-3">
              לאחר שליחת הבקשה תקבלו אישור בדואל ומספר מעקב
            </p>
          </div>
        </form>

        {/* Additional Information */}
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold text-coffee-900 mb-4">מידע נוסף</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-coffee-700">
            <div>
              <h4 className="font-medium text-coffee-900 mb-2">זמני מענה:</h4>
              <ul className="space-y-1">
                <li>• בקשות רגילות: עד 30 יום</li>
                <li>• בקשות מורכבות: עד 60 יום (עם הודעה)</li>
                <li>• בקשות דחופות: עד 7 ימים (במקרים מיוחדים)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-coffee-900 mb-2">יצירת קשר:</h4>
              <ul className="space-y-1">
                <li>• דואל: privacy@coffeeland.co.il</li>
                <li>• טלפון: 08-123-4567</li>
                <li>• כתובת: בן גוריון 7, אשקלון</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
