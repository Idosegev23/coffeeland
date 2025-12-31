import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, MapPin, Shield, FileText, Lock, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'מסמכים משפטיים | CoffeeLand Club',
  description: 'תקנון האתר, מדיניות פרטיות, מדיניות ביטולים ואבטחת מידע - CoffeeLand Club',
};

export default function LegalPage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              מסמכים משפטיים
            </h1>
            <p className="text-lg text-gray-600">
              תקנון האתר | מדיניות פרטיות | מדיניות ביטולים | אבטחת מידע
            </p>
            <p className="text-sm text-gray-500 mt-2">
              עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ניווט מהיר
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a href="#business-details" className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium">
                <MapPin className="w-4 h-4 text-amber-600" />
                פרטי העסק
              </a>
              <a href="#privacy" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                <Lock className="w-4 h-4 text-blue-600" />
                פרטיות
              </a>
              <a href="#cancellation" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                <CreditCard className="w-4 h-4 text-green-600" />
                ביטולים
              </a>
              <a href="#security" className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                <Shield className="w-4 h-4 text-purple-600" />
                אבטחה
              </a>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-10">
            
            {/* Section 1: Business Details */}
            <section id="business-details" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                פרטי העסק
              </h2>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
                <p className="text-xl font-bold text-primary mb-4">CoffeeLand Club</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <span>גבע 2, אשקלון</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-amber-600" />
                    <a href="tel:052-5636067" className="hover:text-accent">052-5636067</a>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Mail className="w-5 h-5 text-amber-600" />
                    <a href="mailto:coffeeland256@gmail.com" className="hover:text-accent">coffeeland256@gmail.com</a>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  לכל שאלה, בירור או פנייה בנוגע לשירותים, רכישות, ביטולים או פרטיות – ניתן לפנות באמצעי הקשר המפורטים לעיל.
                </p>
              </div>
            </section>

            {/* Section 2: General */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                כללי והגדרות
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  אתר זה מופעל על ידי CoffeeLand Club (להלן: &quot;העסק&quot;).
                  השימוש באתר, לרבות רכישת מנויים, כרטיסיות או הרשמה לאירועים, מהווה הסכמה מלאה לתנאים המפורטים במסמך זה.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="font-semibold mb-2">במסמך זה:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>&quot;האתר&quot;</strong> – אתר coffelandclub.co.il</li>
                    <li><strong>&quot;משתמש&quot;</strong> – כל גולש באתר</li>
                    <li><strong>&quot;לקוח&quot;</strong> – משתמש שביצע רכישה</li>
                    <li><strong>&quot;שירותים&quot;</strong> – מנויים, כרטיסיות, אירועים וסדנאות</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Terms of Use */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                תנאי שימוש באתר
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  השימוש באתר מותר למטרות אישיות וחוקיות בלבד.
                  חל איסור לבצע כל פעולה העלולה לפגוע באתר, בתשתיותיו, במשתמשים אחרים או בעסק, 
                  לרבות ניסיון חדירה, שימוש לא מורשה או פגיעה בזמינות האתר.
                </p>
                <p className="font-medium text-amber-700">
                  המשתמש אחראי לנכונות הפרטים שמסר.
                </p>
              </div>
            </section>

            {/* Section 4: Services */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                השירותים המוצעים באתר
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>האתר מאפשר:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>רכישת מנויים וכרטיסיות כניסה</li>
                  <li>הרשמה לאירועים וסדנאות</li>
                </ul>
                <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-lg mt-4">
                  <p className="font-medium text-amber-800">
                    ⚠️ ימי הולדת אינם נרכשים דרך האתר והתשלום עבורם מתבצע במקום ובתיאום טלפוני בלבד.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Payment */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                רכישה ותשלום
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <CreditCard className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-semibold text-blue-800">אמצעי תשלום</p>
                  <p className="text-sm text-blue-700">התשלום באתר מתבצע באמצעות כרטיס אשראי בלבד</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <Shield className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-semibold text-green-800">ספק סליקה</p>
                  <p className="text-sm text-green-700">הסליקה מתבצעת דרך ספק חיצוני – ישראכרט</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 sm:col-span-2">
                  <Lock className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-semibold text-purple-800">אבטחת פרטי תשלום</p>
                  <p className="text-sm text-purple-700">
                    פרטי כרטיס האשראי אינם נשמרים באתר או בשרתי העסק. המחירים המוצגים באתר כוללים מע&quot;מ, ככל שחל.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Subscriptions */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                תוקף והגבלות מנויים וכרטיסיות
              </h2>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span>מנויים וכרטיסיות הם <strong>אישיים</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span>כוללים <strong>מספר כניסות מוגדר</strong> מראש</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span>בעלי <strong>תוקף זמן ו/או כמות כניסות</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✗</span>
                    <span>אינם ניתנים להעברה, פיצול או שימוש על ידי אחר ללא אישור העסק</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✗</span>
                    <span>כניסות שלא מומשו אינן ניתנות להחזר, בכפוף לדין</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7: Cancellation Policy */}
            <section id="cancellation" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                מדיניות ביטולים והחזרים
              </h2>
              
              <div className="space-y-6">
                {/* Subscriptions */}
                <div className="bg-green-50 rounded-xl p-5">
                  <h3 className="font-bold text-green-800 mb-3">מנויים וכרטיסיות</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• ביטול עסקה יתבצע בהתאם לחוק הגנת הצרכן</li>
                    <li>• בקשת ביטול תימסר בכתב למייל העסק או טלפונית</li>
                    <li>• החזר כספי, ככל שיינתן, יבוצע לאמצעי התשלום המקורי ובהתאם ללוחות הזמנים הקבועים בחוק</li>
                    <li>• <strong>לא יינתן החזר עבור כניסות שכבר מומשו</strong></li>
                  </ul>
                </div>

                {/* Events */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <h3 className="font-bold text-blue-800 mb-3">אירועים וסדנאות</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• ניתן לבטל הרשמה <strong>עד 48 שעות</strong> לפני מועד האירוע</li>
                    <li>• ביטול לאחר מועד זה <strong>לא יזכה בהחזר</strong></li>
                    <li>• במקרה של ביטול אירוע ביוזמת העסק, יינתן החזר מלא או זיכוי</li>
                  </ul>
                </div>

                {/* Birthdays */}
                <div className="bg-purple-50 rounded-xl p-5">
                  <h3 className="font-bold text-purple-800 mb-3">ימי הולדת</h3>
                  <p className="text-sm text-purple-700">
                    ימי הולדת אינם נרכשים באתר, ומדיניות הביטול נקבעת ישירות מול העסק.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">8</span>
                קניין רוחני
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  כל התכנים באתר, לרבות טקסטים, עיצובים, תמונות, לוגו וסימנים מסחריים, הם רכוש העסק או בעלי הזכויות בו.
                  <strong> אין להעתיק, לשכפל או לעשות שימוש בתכנים ללא אישור מראש ובכתב.</strong>
                </p>
              </div>
            </section>

            {/* Section 9: Liability */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">9</span>
                הגבלת אחריות
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  השימוש באתר ובשירותים נעשה באחריות המשתמש בלבד.
                  העסק לא יישא באחריות לנזקים עקיפים, תקלות טכניות, שיבושים או הפסקות שירות, למעט אם נקבע אחרת בדין.
                </p>
              </div>
            </section>

            {/* Section 10: Privacy Policy */}
            <section id="privacy" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">10</span>
                מדיניות פרטיות
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">מידע שנאסף</h3>
                  <p className="text-gray-700 mb-3">בעת שימוש באתר נאסף מידע כגון:</p>
                  <ul className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      שם פרטי ושם משפחה
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      מספר טלפון נייד
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      פרטי רכישה (ללא פרטי אשראי)
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    מסירת המידע אינה חובה, אך בלעדיו לא ניתן יהיה להשתמש בחלק מהשירותים.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3">מטרות השימוש</h3>
                  <p className="text-gray-700 mb-3">המידע משמש ל:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">ניהול מנויים וכרטיסיות</div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">יצירת קשר עם הלקוח</div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">תפעול אירועים וסדנאות</div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">עמידה בדרישות חוק</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 11: Third Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">11</span>
                שירותי צד ג&apos;
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>העסק עושה או יעשה שימוש ב:</p>
                <div className="grid sm:grid-cols-3 gap-4 mt-4 not-prose">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                    <CreditCard className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-blue-800">ספק סליקה</p>
                    <p className="text-sm text-blue-600">ישראכרט</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                    <Shield className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="font-semibold text-green-800">אחסון נתונים</p>
                    <p className="text-sm text-green-600">Supabase</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <p className="font-semibold text-orange-800">אנליטיקה</p>
                    <p className="text-sm text-orange-600">Google Analytics</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  המידע עשוי להיות מאוחסן ומעובד על גבי שרתים מחוץ לישראל, באמצעות ספקים העומדים בתקני אבטחת מידע מקובלים.
                </p>
              </div>
            </section>

            {/* Section 12: Security */}
            <section id="security" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">12</span>
                אבטחת מידע
              </h2>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">העסק נוקט באמצעים סבירים ומקובלים להגנה על המידע, לרבות:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">חיבור מאובטח (HTTPS / SSL)</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">הגבלת גישה למורשים בלבד</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">שימוש בשירותי ענן מאובטחים</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">הפרדה בין סביבות</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  העסק אינו מתחייב לחסינות מוחלטת אך פועל למניעת גישה בלתי מורשית ושימוש לרעה.
                </p>
              </div>
            </section>

            {/* Section 13: User Rights */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">13</span>
                זכויות המשתמש
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>המשתמש זכאי:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>לעיין במידע השמור עליו</li>
                  <li>לבקש תיקון או מחיקה</li>
                  <li>לבקש הפסקת שימוש במידע לצורכי דיוור</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                  פניות יטופלו בתוך זמן סביר בהתאם לדין.
                </p>
              </div>
            </section>

            {/* Section 14: Changes */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">14</span>
                שינוי מסמכים
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  העסק רשאי לעדכן מסמך זה מעת לעת.
                  הנוסח המעודכן יפורסם באתר וייכנס לתוקף עם פרסומו.
                </p>
              </div>
            </section>

            {/* Section 15: Jurisdiction */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b pb-3">
                <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">15</span>
                סמכות שיפוט
              </h2>
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-gray-700">
                  הדין החל הוא <strong>הדין הישראלי בלבד</strong>.
                </p>
                <p className="text-gray-700 mt-2">
                  סמכות השיפוט הבלעדית נתונה ל<strong>בתי המשפט המוסמכים במחוז דרום</strong>.
                </p>
              </div>
            </section>

          </div>

          {/* Service Description Cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {/* Subscriptions Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-4">מנויים וכרטיסיות</h2>
              <p className="text-gray-600 mb-4">
                רכישת מנוי או כרטיסייה מקנה זכות כניסה בהתאם לתנאים הבאים:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  מנוי / כרטיסייה אישיים
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  כוללים מספר כניסות מוגדר
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  בעלי תוקף מוגבל
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  אינם ניתנים להעברה או פיצול
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  התשלום מתבצע מראש באמצעות כרטיס אשראי
                </li>
              </ul>
              <Link href="/passes" className="inline-block mt-4 text-accent hover:underline font-medium">
                לרכישת כרטיסיות →
              </Link>
            </div>

            {/* Events Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-4">אירועים וסדנאות</h2>
              <p className="text-gray-600 mb-4">
                ההרשמה לאירועים וסדנאות מתבצעת דרך האתר בלבד.
              </p>
              <p className="text-gray-700 mb-3">בכל אירוע יוצגו:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  מועד ומשך
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  מחיר
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  תנאי ביטול
                </li>
              </ul>
              <p className="text-sm text-amber-700 mt-4 font-medium">
                ⚠️ ניתן לבטל הרשמה עד 48 שעות לפני מועד האירוע.
              </p>
              <Link href="/classes" className="inline-block mt-4 text-accent hover:underline font-medium">
                לצפייה באירועים →
              </Link>
            </div>
          </div>

          {/* Contact Footer */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">יש שאלות?</h2>
            <p className="mb-6">נשמח לעזור בכל נושא</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:052-5636067" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                <Phone className="w-5 h-5" />
                052-5636067
              </a>
              <a href="mailto:coffeeland256@gmail.com" className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-colors">
                <Mail className="w-5 h-5" />
                שלחו מייל
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

