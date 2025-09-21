'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, Calendar, Users, Gift, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const eventContactSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  phone: z.string().min(10, 'מספר טלפון לא תקין').regex(/^[0-9-+\s()]+$/, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת מייל לא תקינה'),
  childAge: z.string().min(1, 'גיל הילד נדרש'),
  preferredDate: z.string().min(1, 'תאריך מועדף נדרש'),
  alternativeDate: z.string().optional(),
  guestCount: z.string().min(1, 'מספר אורחים נדרש'),
  packageType: z.enum(['basic', 'premium', 'deluxe'], {
    required_error: 'בחרו סוג חבילה',
  }),
  additionalServices: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
  marketingConsent: z.boolean().optional(),
});

type EventContactForm = z.infer<typeof eventContactSchema>;

const packageTypes = [
  { value: 'basic', label: 'חבילה בסיסית', description: 'עד 10 ילדים, משחקים ועוגה' },
  { value: 'premium', label: 'חבילה מורחבת', description: 'עד 15 ילדים, משחקים, יצירה ועוגה' },
  { value: 'deluxe', label: 'חבילה מלאה', description: 'עד 20 ילדים, כל השירותים + צלם' },
];

const additionalServices = [
  { value: 'photographer', label: 'צלם מקצועי' },
  { value: 'decorations', label: 'קישוטים מיוחדים' },
  { value: 'entertainment', label: 'הפעלה מיוחדת' },
  { value: 'catering', label: 'קייטרינג מורחב' },
];

export function EventsContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EventContactForm>({
    resolver: zodResolver(eventContactSchema),
  });

  const handleServiceToggle = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(newServices);
    setValue('additionalServices', newServices);
  };

  const onSubmit = async (data: EventContactForm) => {
    setIsSubmitting(true);
    
    try {
      // Submit to API
      const response = await fetch('/api/events-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Create WhatsApp message
      const whatsappMessage = createWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
      
      toast.success('הטופס נשלח בהצלחה! פותחים וואטסאפ...');
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      reset();
      setSelectedServices([]);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('שגיאה בשליחת הטופס. אנא נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createWhatsAppMessage = (data: EventContactForm) => {
    const packageLabel = packageTypes.find(p => p.value === data.packageType)?.label || data.packageType;
    
    return `🎉 בקשה לאירוע יום הולדת - CoffeLand

👤 פרטי יצירת קשר:
שם: ${data.name}
טלפון: ${data.phone}
מייל: ${data.email}

🎂 פרטי האירוע:
גיל הילד: ${data.childAge}
תאריך מועדף: ${data.preferredDate}
${data.alternativeDate ? `תאריך חלופי: ${data.alternativeDate}` : ''}
מספר אורחים: ${data.guestCount}
סוג חבילה: ${packageLabel}

${selectedServices.length > 0 ? `🎨 שירותים נוספים:
${selectedServices.map(s => additionalServices.find(as => as.value === s)?.label).join(', ')}` : ''}

${data.specialRequests ? `📝 בקשות מיוחדות:
${data.specialRequests}` : ''}

נשמח לתאם איתכם את כל הפרטים! 🎈`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-latte" />
        </div>
        <h1 className="text-3xl font-bold text-coffee-900 mb-2">תאמו יום הולדת מיוחד</h1>
        <p className="text-lg text-coffee-700">
          מלאו את הטופס ונצור איתכם קשר לתיאום כל הפרטים
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-coffee-900 border-b border-coffee-200 pb-2">
            פרטים אישיים
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                שם מלא *
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                placeholder="השם שלכם"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                טלפון *
              </label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                placeholder="050-1234567"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-900 mb-2">
              כתובת מייל *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-coffee-900 border-b border-coffee-200 pb-2">
            פרטי האירוע
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                גיל הילד *
              </label>
              <input
                {...register('childAge')}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                placeholder="5"
              />
              {errors.childAge && (
                <p className="text-red-600 text-sm mt-1">{errors.childAge.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                מספר אורחים *
              </label>
              <input
                {...register('guestCount')}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                placeholder="10"
              />
              {errors.guestCount && (
                <p className="text-red-600 text-sm mt-1">{errors.guestCount.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                תאריך מועדף *
              </label>
              <input
                {...register('preferredDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
              />
              {errors.preferredDate && (
                <p className="text-red-600 text-sm mt-1">{errors.preferredDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-2">
                תאריך חלופי
              </label>
              <input
                {...register('alternativeDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
              />
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-coffee-900 border-b border-coffee-200 pb-2">
            בחירת חבילה *
          </h3>
          
          <div className="space-y-3">
            {packageTypes.map((pkg) => (
              <label key={pkg.value} className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer">
                <input
                  {...register('packageType')}
                  type="radio"
                  value={pkg.value}
                  className="mt-1 text-tropical-600 focus:ring-tropical-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-coffee-900">{pkg.label}</div>
                  <div className="text-sm text-coffee-600">{pkg.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.packageType && (
            <p className="text-red-600 text-sm mt-1">{errors.packageType.message}</p>
          )}
        </div>

        {/* Additional Services */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-coffee-900 border-b border-coffee-200 pb-2">
            שירותים נוספים
          </h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            {additionalServices.map((service) => (
              <label key={service.value} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.value)}
                  onChange={() => handleServiceToggle(service.value)}
                  className="text-tropical-600 focus:ring-tropical-600 rounded"
                />
                <span className="text-coffee-900">{service.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            בקשות מיוחדות
          </label>
          <textarea
            {...register('specialRequests')}
            rows={4}
            className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
            placeholder="יש לכם בקשות מיוחדות? אלרגיות? העדפות מיוחדות?"
          />
        </div>

        {/* Marketing Consent */}
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <input
            {...register('marketingConsent')}
            type="checkbox"
            className="mt-1 text-tropical-600 focus:ring-tropical-600 rounded"
          />
          <label className="text-sm text-coffee-700 leading-relaxed">
            אני מסכים לקבל עדכונים שיווקיים על פעילויות וחידושים ב-CoffeLand (לא חובה)
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-lg py-4"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <div className="w-4 h-4 border-2 border-latte border-t-transparent rounded-full animate-spin" />
              <span>שולח...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Send className="w-5 h-5" />
              <span>שלח בקשה</span>
            </div>
          )}
        </Button>

        <div className="text-center text-sm text-coffee-600">
          לאחר שליחת הטופס תועברו לוואטסאפ להמשך התיאום
        </div>
      </form>
    </div>
  );
}
