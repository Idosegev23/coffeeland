import React from 'react';
import { Metadata } from 'next';
import { FileText, CreditCard, RefreshCw, AlertTriangle, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'תקנון השימוש | CoffeLand',
  description: 'תקנון השימוש של CoffeLand - תנאי השירות, מדיניות ביטולים והחזרים, וכללי התנהגות במתחם.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-latte" />
          </div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">תקנון השימוש</h1>
          <p className="text-lg text-coffee-700">
            עודכן לאחרונה: דצמבר 2024 | תואם לתיקון 13 לחוק הגנת הפרטיות
          </p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">מבוא</h2>
            <p className="text-coffee-700 leading-relaxed mb-4">
              ברוכים הבאים ל-CoffeLand! תקנון זה מסדיר את השימוש בשירותי בית הקפה-משחקייה שלנו, 
              כולל האתר, הסדנאות, האירועים ושירותי המזון והמשקאות.
            </p>
            <p className="text-coffee-700 leading-relaxed">
              השימוש בשירותים מהווה הסכמה מלאה לתנאים המפורטים להלן. אנא קראו בעיון לפני השימוש בשירותים.
            </p>
          </section>

          {/* General Terms */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">תנאים כלליים</h2>
            
            <div className="space-y-4">
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">גיל מינימום:</h3>
                <p className="text-coffee-700 text-sm">
                  השירותים מיועדים למבוגרים מגיל 18 ומעלה. קטינים יכולים להשתמש בשירותים בליווי הורה או אפוטרופוס בלבד.
                </p>
              </div>
              
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">זמינות השירותים:</h3>
                <p className="text-coffee-700 text-sm">
                  אנו שואפים לספק שירות רציף, אך שומרים לעצמנו את הזכות להפסיק או לשנות שירותים ללא הודעה מוקדמת 
                  לצורכי תחזוקה, שיפורים או נסיבות בלתי צפויות.
                </p>
              </div>
              
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">שימוש הוגן:</h3>
                <p className="text-coffee-700 text-sm">
                  השירותים מיועדים לשימוש אישי ולא מסחרי. אסור להעתיק, להפיץ או לעשות שימוש מסחרי בתכנים מהאתר 
                  ללא אישור מפורש בכתב.
                </p>
              </div>
            </div>
          </section>

          {/* Booking and Registration */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-tropical-600" />
              הזמנות והרשמות
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-coffee-900 mb-3">תהליך ההזמנה:</h3>
                <ol className="list-decimal list-inside text-coffee-700 space-y-2 text-sm">
                  <li>בחירת הפעילות או המוצר מהאתר</li>
                  <li>מילוי פרטים אישיים ופרטי התשלום</li>
                  <li>אישור ההזמנה ותשלום מאובטח דרך Stripe</li>
                  <li>קבלת אישור בדואל ו/או SMS</li>
                  <li>הגעה למתחם בזמן שנקבע</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                  חשוב לדעת:
                </h3>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• ההזמנה מאושרת רק לאחר קבלת התשלום המלא</li>
                  <li>• מקומות מוגבלים - ההרשמה על בסיס "מי שקדם זכה"</li>
                  <li>• יש להגיע 15 דקות לפני תחילת הפעילות</li>
                  <li>• איחור של יותר מ-10 דקות עלול לגרום לביטול ללא החזר</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cancellation and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <RefreshCw className="w-6 h-6 mr-3 text-tropical-600" />
              ביטולים והחזרים
            </h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">החזר מלא (100%)</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• ביטול עד 48 שעות לפני הפעילות</li>
                    <li>• ביטול מצד CoffeLand</li>
                    <li>• מקרי חירום מתועדים</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">החזר חלקי (50%)</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• ביטול 24-48 שעות לפני הפעילות</li>
                    <li>• העברה לתאריך אחר (חד פעמי)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">ללא החזר</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• ביטול פחות מ-24 שעות לפני הפעילות</li>
                  <li>• אי הגעה ללא הודעה מוקדמת</li>
                  <li>• הפרת כללי התנהגות במתחם</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">תהליך החזר:</h3>
                <p className="text-blue-700 text-sm">
                  החזרים יבוצעו לאמצעי התשלום המקורי תוך 5-14 ימי עסקים. 
                  לבקשת החזר יש לפנות בדואל או בטלפון עם מספר ההזמנה.
                </p>
              </div>
            </div>
          </section>

          {/* Behavior Rules */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">כללי התנהגות במתחם</h2>
            
            <div className="space-y-4">
              <div className="bg-tropical-50 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-3">מותר ומעודד:</h3>
                <ul className="text-coffee-700 text-sm space-y-1">
                  <li>✓ ליהנות ולהנות את הילדים</li>
                  <li>✓ לשתף פעולה עם המדריכים</li>
                  <li>✓ לצלם ולתעד רגעים יפים (בכבוד לאחרים)</li>
                  <li>✓ לשאול שאלות ולבקש עזרה</li>
                  <li>✓ לדווח על בעיות או חששות לצוות</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-3">אסור בהחלט:</h3>
                <ul className="text-coffee-700 text-sm space-y-1">
                  <li>✗ הפרעה לפעילויות או למשתתפים אחרים</li>
                  <li>✗ שימוש באלכוהול או חומרים משכרים</li>
                  <li>✗ עישון במתחם (כולל סיגריות אלקטרוניות)</li>
                  <li>✗ הכנסת מזון או משקאות מבחוץ ללא אישור</li>
                  <li>✗ התנהגות אגרסיבית או לא מכבדת</li>
                  <li>✗ צילום ילדים אחרים ללא רשות הוריהם</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Health and Safety */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">בריאות ובטיחות</h2>
            
            <div className="space-y-4">
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">אלרגיות ורגישויות:</h3>
                <p className="text-coffee-700 text-sm">
                  חובה לדווח מראש על אלרגיות או רגישויות מזון. אנו נעשה כל שביכולתנו להתאים, 
                  אך לא נוכל לערוב על סביבה נטולת אלרגנים לחלוטין.
                </p>
              </div>
              
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">מגבלות בריאותיות:</h3>
                <p className="text-coffee-700 text-sm">
                  ילדים עם מגבלות בריאותיות או פיזיות מוזמנים להשתתף. אנא יידעו אותנו מראש 
                  כדי שנוכל להתאים את הפעילות בצורה הטובה ביותר.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">אחריות וביטוח:</h3>
                <p className="text-coffee-700 text-sm">
                  המתחם מבוטח באחריות כלפי צד שלישי. ההורים אחראים על ילדיהם בכל עת. 
                  אנו לא נישא באחריות לנזקים הנובעים מאי ציות לכללי הבטיחות.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">פרטיות ונתונים</h2>
            
            <div className="bg-tropical-100 p-4 rounded-lg">
              <p className="text-coffee-700 text-sm mb-3">
                השימוש בשירותים כפוף למדיניות הפרטיות שלנו. עיקרי הנקודות:
              </p>
              <ul className="text-coffee-700 text-sm space-y-1">
                <li>• נאסוף מידע רק לצורך מתן השירות</li>
                <li>• לא נשתף מידע אישי עם צדדים שלישיים ללא הסכמה</li>
                <li>• תוכלו לבקש עיון, תיקון או מחיקת המידע בכל עת</li>
                <li>• עוגיות נשמרות לשיפור חוויית הגלישה</li>
              </ul>
              <p className="text-coffee-700 text-sm mt-3">
                לפרטים מלאים: <a href="/privacy" className="text-tropical-600 underline">מדיניות הפרטיות</a>
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">קניין רוחני</h2>
            
            <div className="space-y-4">
              <p className="text-coffee-700">
                כל התכנים באתר (טקסטים, תמונות, לוגו, עיצוב) הם קניינו הרוחני של CoffeLand 
                ומוגנים בזכויות יוצרים.
              </p>
              
              <div className="bg-latte-100 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">מותר:</h3>
                <ul className="text-coffee-700 text-sm space-y-1">
                  <li>• צפייה ושימוש אישי בתכנים</li>
                  <li>• שיתוף קישורים לדפי האתר</li>
                  <li>• הדפסת חומרים לשימוש אישי</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-2">אסור:</h3>
                <ul className="text-coffee-700 text-sm space-y-1">
                  <li>• העתקה או שכפול של תכנים</li>
                  <li>• שימוש מסחרי ללא רשות</li>
                  <li>• שינוי או עיבוד התכנים</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">הגבלת אחריות</h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>חשוב לדעת:</strong> אחריותנו מוגבלת למקרים של רשלנות גסה בלבד. 
                  אנו לא נישא באחריות עבור:
                </p>
                <ul className="text-yellow-800 text-sm space-y-1 mt-2">
                  <li>• נזקים עקיפים או תוצאתיים</li>
                  <li>• אובדן רווחים או הזדמנויות</li>
                  <li>• נזקים הנובעים משימוש לא נכון בשירותים</li>
                  <li>• תקלות טכניות באתר או במערכות</li>
                </ul>
              </div>
              
              <p className="text-coffee-700 text-sm">
                האחריות המקסימלית שלנו לא תעלה על סכום התשלום ששולם עבור השירות הספציפי.
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">יישוב סכסוכים</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">שלב ראשון - פנייה ישירה:</h3>
                <p className="text-green-700 text-sm">
                  כל בעיה או תלונה יטופלו תחילה בפנייה ישירה אלינו. אנו מחויבים לפתור בעיות 
                  בצורה הוגנת ומהירה.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">שלב שני - גישור:</h3>
                <p className="text-blue-700 text-sm">
                  אם לא הגענו להסכמה, נפנה לגישור במועצה לצרכנות או בבית דין לגישור מוסכם.
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">סמכות שיפוט:</h3>
                <p className="text-gray-700 text-sm">
                  סכסוכים יידונו בבתי המשפט המוסמכים באשקלון, בהתאם לדין הישראלי.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Phone className="w-6 h-6 mr-3 text-tropical-600" />
              יצירת קשר
            </h2>
            
            <div className="bg-tropical-50 p-6 rounded-lg">
              <p className="text-coffee-700 mb-4">
                לשאלות, תלונות או בקשות בנוגע לתקנון:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="w-4 h-4 text-tropical-600" />
                    <span className="text-coffee-900">08-123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="w-4 h-4 text-tropical-600" />
                    <span className="text-coffee-900">info@coffeeland.co.il</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-coffee-900 font-medium">בן גוריון 7, אשקלון</div>
                  <div className="text-coffee-700 text-sm">ראשון-חמישי: 8:00-20:00</div>
                  <div className="text-coffee-700 text-sm">שישי: 8:00-14:00, שבת: 19:00-23:00</div>
                </div>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">עדכוני התקנון</h2>
            <div className="bg-latte-100 p-4 rounded-lg">
              <p className="text-coffee-700 text-sm">
                אנו רשאים לעדכן תקנון זה מעת לעת. עדכונים מהותיים יפורסמו באתר ויישלחו ללקוחות רשומים. 
                המשך השימוש בשירותים לאחר עדכון התקנון מהווה הסכמה לשינויים.
              </p>
              <p className="text-coffee-700 text-sm mt-2">
                <strong>תאריך עדכון אחרון:</strong> דצמבר 2024
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
