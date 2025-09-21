import React from 'react';
import { Metadata } from 'next';
import { Shield, Eye, Lock, Users, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | CoffeLand',
  description: 'מדיניות הפרטיות של CoffeLand - כיצד אנו אוספים, משתמשים ומגינים על המידע האישי שלכם.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-latte" />
          </div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">מדיניות פרטיות</h1>
          <p className="text-lg text-coffee-700">
            עודכן לאחרונה: דצמבר 2024 | תואם לתיקון 13 לחוק הגנת הפרטיות
          </p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-tropical-600" />
              מבוא
            </h2>
            <p className="text-coffee-700 leading-relaxed mb-4">
              ב-CoffeLand אנו מכבדים את פרטיותכם ומחויבים להגן על המידע האישי שלכם. מדיניות פרטיות זו 
              מסבירה כיצד אנו אוספים, משתמשים, מגינים ומשתפים מידע אישי בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 
              ותיקוניו, כולל תיקון מספר 13.
            </p>
            <p className="text-coffee-700 leading-relaxed">
              המדיניות חלה על כל השירותים שלנו: האתר, האפליקציה, הסדנאות, האירועים ושירותי בית הקפה.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-3 text-tropical-600" />
              איזה מידע אנו אוספים
            </h2>
            
            <div className="space-y-4">
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">מידע שאתם מספקים בהתנדבות:</h3>
                <ul className="list-disc list-inside text-coffee-700 space-y-1">
                  <li>שם מלא, כתובת מייל ומספר טלפון</li>
                  <li>פרטי ילדים (שם וגיל) לצורך הרשמה לסדנאות</li>
                  <li>העדפות תזונה ואלרגיות</li>
                  <li>פרטי תשלום (מעובדים באמצעות Stripe)</li>
                  <li>תכתובת איתנו דרך טפסי יצירת קשר</li>
                </ul>
              </div>

              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">מידע שנאסף אוטומטית:</h3>
                <ul className="list-disc list-inside text-coffee-700 space-y-1">
                  <li>כתובת IP ומידע על הדפדפן</li>
                  <li>דפים שביקרתם באתר ומשך הביקור</li>
                  <li>עוגיות (Cookies) לשיפור חוויית הגלישה</li>
                  <li>מידע על השימוש בשירותים שלנו</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-tropical-600" />
              כיצד אנו משתמשים במידע
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-coffee-900">שירותי ליבה:</h3>
                <ul className="list-disc list-inside text-coffee-700 space-y-1 text-sm">
                  <li>עיבוד הזמנות והרשמות</li>
                  <li>ניהול חשבון הלקוח</li>
                  <li>תקשורת על שירותים שהוזמנו</li>
                  <li>תמיכה טכנית ושירות לקוחות</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-coffee-900">שיפור השירות:</h3>
                <ul className="list-disc list-inside text-coffee-700 space-y-1 text-sm">
                  <li>ניתוח שימוש ושיפור האתר</li>
                  <li>התאמה אישית של התוכן</li>
                  <li>פיתוח מוצרים וסדנאות חדשים</li>
                  <li>מחקר שוק ופיתוח עסקי</li>
                </ul>
              </div>
            </div>

            <div className="bg-tropical-100 p-4 rounded-lg mt-4">
              <h3 className="font-semibold text-coffee-900 mb-2">שיווק (רק בהסכמה מפורשת):</h3>
              <p className="text-coffee-700 text-sm">
                נשלח עדכונים על פעילויות חדשות, הנחות ואירועים מיוחדים רק אם הסכמתם לכך במפורש. 
                תוכלו לבטל את ההסכמה בכל עת.
              </p>
            </div>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">הבסיס החוקי לעיבוד המידע</h2>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-tropical-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-coffee-900">ביצוע חוזה:</strong>
                  <span className="text-coffee-700"> עיבוד הזמנות, הרשמות לסדנאות ומתן השירותים</span>
                </div>
              </div>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-tropical-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-coffee-900">הסכמה:</strong>
                  <span className="text-coffee-700"> שיווק, עוגיות לא חיוניות ושיתוף מידע</span>
                </div>
              </div>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-tropical-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-coffee-900">אינטרס לגיטימי:</strong>
                  <span className="text-coffee-700"> שיפור השירות, אבטחה ומניעת הונאות</span>
                </div>
              </div>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-tropical-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong className="text-coffee-900">חובה חוקית:</strong>
                  <span className="text-coffee-700"> שמירת רישומים לצרכי מס ודיווח</span>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">שיתוף מידע עם צדדים שלישיים</h2>
            
            <div className="space-y-4">
              <p className="text-coffee-700">
                אנו לא מוכרים את המידע האישי שלכם. אנו משתפים מידע רק במקרים הבאים:
              </p>
              
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">ספקי שירות מורשים:</h3>
                <ul className="list-disc list-inside text-coffee-700 space-y-1 text-sm">
                  <li><strong>Stripe:</strong> עיבוד תשלומים מאובטח</li>
                  <li><strong>Supabase:</strong> אחסון נתונים מאובטח</li>
                  <li><strong>ספק המייל:</strong> שליחת הודעות ועדכונים</li>
                  <li><strong>Google Analytics:</strong> ניתוח תנועה באתר (אנונימי)</li>
                </ul>
              </div>
              
              <p className="text-coffee-700 text-sm">
                כל הספקים חתומים על הסכמי סודיות ומחויבים להגן על המידע שלכם.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">הזכויות שלכם</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-tropical-100 p-3 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">זכות עיון</h3>
                  <p className="text-coffee-700 text-xs">לדעת איזה מידע אנו מחזיקים עליכם</p>
                </div>
                
                <div className="bg-tropical-100 p-3 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">זכות תיקון</h3>
                  <p className="text-coffee-700 text-xs">לתקן מידע שגוי או לא מדויק</p>
                </div>
                
                <div className="bg-tropical-100 p-3 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">זכות מחיקה</h3>
                  <p className="text-coffee-700 text-xs">לבקש מחיקת המידע (במקרים מסוימים)</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-tropical-100 p-3 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">זכות הגבלה</h3>
                  <p className="text-coffee-700 text-xs">להגביל את השימוש במידע</p>
                </div>
                
                <div className="bg-tropical-100 p-3 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">זכות התנגדות</h3>
                  <p className="text-coffee-700 text-xs">להתנגד לעיבוד לצרכי שיווק</p>
                </div>
                
                <div className="bg-tropical-100 p-3 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">זכות ניידות</h3>
                  <p className="text-coffee-700 text-xs">לקבל את המידע בפורמט נגיש</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
              <p className="text-sm text-yellow-800">
                <strong>חשוב:</strong> למימוש הזכויות שלכם, פנו אלינו דרך <a href="/data-requests" className="underline">טופס בקשות הנתונים</a> 
                או בדואל: privacy@coffeeland.co.il
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">אבטחת המידע</h2>
            
            <div className="space-y-4">
              <p className="text-coffee-700">
                אנו מיישמים אמצעי אבטחה מתקדמים להגנה על המידע שלכם:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-latte-100 rounded-lg">
                  <Lock className="w-8 h-8 text-tropical-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">הצפנה</h3>
                  <p className="text-coffee-700 text-xs">SSL/TLS להעברת נתונים</p>
                </div>
                
                <div className="text-center p-4 bg-latte-100 rounded-lg">
                  <Shield className="w-8 h-8 text-tropical-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">אחסון מאובטח</h3>
                  <p className="text-coffee-700 text-xs">שרתים מוגנים וגיבויים</p>
                </div>
                
                <div className="text-center p-4 bg-latte-100 rounded-lg">
                  <Eye className="w-8 h-8 text-tropical-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-coffee-900 text-sm mb-1">גישה מוגבלת</h3>
                  <p className="text-coffee-700 text-xs">רק עובדים מורשים</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">תקופת שמירת המידע</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-latte-100 rounded-lg">
                <span className="text-coffee-900 font-medium">פרטי לקוחות פעילים</span>
                <span className="text-coffee-700 text-sm">כל עוד החשבון פעיל</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-latte-100 rounded-lg">
                <span className="text-coffee-900 font-medium">היסטוריית הזמנות</span>
                <span className="text-coffee-700 text-sm">7 שנים (חובה חוקית)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-latte-100 rounded-lg">
                <span className="text-coffee-900 font-medium">נתוני שיווק</span>
                <span className="text-coffee-700 text-sm">עד לביטול ההסכמה</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-latte-100 rounded-lg">
                <span className="text-coffee-900 font-medium">לוגי אבטחה</span>
                <span className="text-coffee-700 text-sm">2 שנים</span>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-tropical-600" />
              יצירת קשר
            </h2>
            
            <div className="bg-tropical-50 p-6 rounded-lg">
              <p className="text-coffee-700 mb-4">
                לשאלות, בקשות או תלונות בנושא פרטיות:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail className="w-4 h-4 text-tropical-600" />
                  <span className="text-coffee-900">privacy@coffeeland.co.il</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-4 h-4 text-tropical-600" />
                  <span className="text-coffee-900">08-123-4567</span>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Users className="w-4 h-4 text-tropical-600 mt-1" />
                  <div>
                    <div className="text-coffee-900">בן גוריון 7, אשקלון</div>
                    <div className="text-coffee-700 text-sm">ראשון-חמישי: 8:00-20:00</div>
                  </div>
                </div>
              </div>
              
              <p className="text-coffee-700 text-sm mt-4">
                תקופת מענה: עד 30 יום מקבלת הפנייה
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">עדכונים למדיניות</h2>
            <p className="text-coffee-700">
              אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר ויישלחו בדואל ללקוחות רשומים. 
              המשך השימוש בשירותים לאחר עדכון המדיניות מהווה הסכמה לשינויים.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
