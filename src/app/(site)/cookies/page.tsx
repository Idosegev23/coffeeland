import React from 'react';
import { Metadata } from 'next';
import { Cookie, Settings, Eye, BarChart, Target, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'מדיניות קוקיז | CoffeLand',
  description: 'מדיניות הקוקיז של CoffeLand - כיצד אנו משתמשים בעוגיות לשיפור חוויית הגלישה שלכם.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-latte" />
          </div>
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">מדיניות קוקיז</h1>
          <p className="text-lg text-coffee-700">
            עודכן לאחרונה: דצמבר 2024 | תואם לתיקון 13 לחוק הגנת הפרטיות
          </p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">מה הן עוגיות (Cookies)?</h2>
            <p className="text-coffee-700 leading-relaxed mb-4">
              עוגיות הן קבצי טקסט קטנים הנשמרים במכשיר שלכם כאשר אתם מבקרים באתר. 
              הן עוזרות לנו לזכור את העדפותיכם, לשפר את חוויית הגלישה ולספק שירות מותאם אישית.
            </p>
            <div className="bg-tropical-100 p-4 rounded-lg">
              <p className="text-coffee-700 text-sm">
                <strong>חשוב לדעת:</strong> אתם יכולים לשלוט על השימוש בעוגיות דרך הגדרות הדפדפן שלכם 
                או באמצעות מרכז העדפות הפרטיות באתר.
              </p>
            </div>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">סוגי העוגיות שאנו משתמשים</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <Shield className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-800 mb-3">עוגיות חיוניות</h3>
                    <p className="text-green-700 mb-4">
                      עוגיות אלו הכרחיות לתפקוד האתר ולא ניתן להשביתן. הן מאפשרות לכם לנווט באתר 
                      ולהשתמש בשירותים הבסיסיים.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-green-800 mb-1">עוגיות הפעלה (Session)</h4>
                        <p className="text-green-700 text-sm">שמירת מידע זמני במהלך הביקור באתר</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-green-800 mb-1">עוגיות אבטחה</h4>
                        <p className="text-green-700 text-sm">הגנה מפני תקיפות סייבר ואימות זהות</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-green-800 mb-1">עגלת קניות</h4>
                        <p className="text-green-700 text-sm">שמירת פריטים שנבחרו לרכישה</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-100 rounded">
                      <p className="text-green-800 text-sm font-medium">
                        ⚠️ עוגיות אלו לא ניתנות להשבתה ואינן דורשות הסכמה
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <BarChart className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-blue-800 mb-3">עוגיות אנליטיקה</h3>
                    <p className="text-blue-700 mb-4">
                      עוגיות אלו עוזרות לנו להבין כיצד המבקרים משתמשים באתר, אילו דפים הכי פופולריים 
                      ואיך לשפר את חוויית הגלישה.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-blue-800 mb-1">Google Analytics</h4>
                        <p className="text-blue-700 text-sm">ניתוח תנועה באתר, דפים פופולריים ומקורות הגעה</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-blue-800 mb-1">מדדי ביצועים</h4>
                        <p className="text-blue-700 text-sm">זמני טעינה, שגיאות טכניות ואופטימיזציה</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-100 rounded">
                      <p className="text-blue-800 text-sm">
                        <strong>משך שמירה:</strong> עד 26 חודשים | 
                        <strong> ניתן להשבתה:</strong> כן
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <Settings className="w-8 h-8 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-purple-800 mb-3">עוגיות פונקציונליות</h3>
                    <p className="text-purple-700 mb-4">
                      עוגיות אלו זוכרות את הבחירות והעדפות שלכם כדי לספק חוויה מותאמת אישית.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-purple-800 mb-1">העדפות שפה</h4>
                        <p className="text-purple-700 text-sm">שמירת בחירת השפה המועדפת</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-purple-800 mb-1">הגדרות תצוגה</h4>
                        <p className="text-purple-700 text-sm">גודל גופן, ערכת צבעים ופריסה</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-purple-800 mb-1">מידע התחברות</h4>
                        <p className="text-purple-700 text-sm">זכירת פרטי התחברות (לא כולל סיסמה)</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-purple-100 rounded">
                      <p className="text-purple-800 text-sm">
                        <strong>משך שמירה:</strong> עד 12 חודשים | 
                        <strong> ניתן להשבתה:</strong> כן
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <Target className="w-8 h-8 text-orange-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-orange-800 mb-3">עוגיות שיווק</h3>
                    <p className="text-orange-700 mb-4">
                      עוגיות אלו משמשות להצגת פרסומות רלוונטיות ולמדידת יעילות הקמפיינים השיווקיים שלנו.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-orange-800 mb-1">Facebook Pixel</h4>
                        <p className="text-orange-700 text-sm">מדידת יעילות פרסומות בפייסבוק ואינסטגרם</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-orange-800 mb-1">Google Ads</h4>
                        <p className="text-orange-700 text-sm">מעקב המרות ואופטימיזציית קמפיינים</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded">
                        <h4 className="font-medium text-orange-800 mb-1">Remarketing</h4>
                        <p className="text-orange-700 text-sm">הצגת פרסומות מותאמות למבקרים חוזרים</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-orange-100 rounded">
                      <p className="text-orange-800 text-sm">
                        <strong>משך שמירה:</strong> עד 13 חודשים | 
                        <strong> דורש הסכמה:</strong> כן | 
                        <strong> ניתן להשבתה:</strong> כן
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie Control */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-tropical-600" />
              ניהול העדפות עוגיות
            </h2>
            
            <div className="space-y-6">
              <div className="bg-tropical-100 p-6 rounded-lg">
                <h3 className="font-semibold text-coffee-900 mb-3">מרכז העדפות CoffeLand</h3>
                <p className="text-coffee-700 mb-4">
                  השתמשו במרכז העדפות הפרטיות שלנו לשליטה מלאה על סוגי העוגיות שאתם מאשרים.
                </p>
                <button className="bg-tropical-600 text-latte px-6 py-3 rounded-lg hover:bg-tropical-700 transition-colors">
                  פתח מרכז העדפות
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-latte-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 mb-3">הגדרות דפדפן</h3>
                  <p className="text-coffee-700 text-sm mb-3">
                    אתם יכולים לחסום או למחוק עוגיות דרך הגדרות הדפדפן שלכם:
                  </p>
                  <ul className="text-coffee-700 text-sm space-y-1">
                    <li>• <strong>Chrome:</strong> הגדרות → פרטיות ואבטחה → עוגיות</li>
                    <li>• <strong>Firefox:</strong> הגדרות → פרטיות ואבטחה</li>
                    <li>• <strong>Safari:</strong> העדפות → פרטיות</li>
                    <li>• <strong>Edge:</strong> הגדרות → פרטיות וחיפוש</li>
                  </ul>
                </div>
                
                <div className="bg-latte-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-coffee-900 mb-3">מצב גלישה פרטית</h3>
                  <p className="text-coffee-700 text-sm mb-3">
                    במצב גלישה פרטית רוב העוגיות לא נשמרות:
                  </p>
                  <ul className="text-coffee-700 text-sm space-y-1">
                    <li>• <strong>Chrome:</strong> Ctrl+Shift+N</li>
                    <li>• <strong>Firefox:</strong> Ctrl+Shift+P</li>
                    <li>• <strong>Safari:</strong> Cmd+Shift+N</li>
                    <li>• <strong>Edge:</strong> Ctrl+Shift+N</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ השלכות חסימת עוגיות</h3>
                <p className="text-yellow-700 text-sm">
                  חסימת עוגיות עלולה להשפיע על תפקוד האתר. ייתכן שלא תוכלו להשתמש בחלק מהשירותים 
                  או שחוויית הגלישה תהיה פחות מותאמת אישית.
                </p>
              </div>
            </div>
          </section>

          {/* Third Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">עוגיות של צדדים שלישיים</h2>
            
            <div className="space-y-4">
              <p className="text-coffee-700">
                אנו משתמשים בשירותים של צדדים שלישיים שעלולים לשמור עוגיות במכשיר שלכם:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-coffee-200 rounded-lg">
                  <thead className="bg-latte-200">
                    <tr>
                      <th className="text-right p-3 font-semibold text-coffee-900">שירות</th>
                      <th className="text-right p-3 font-semibold text-coffee-900">מטרה</th>
                      <th className="text-right p-3 font-semibold text-coffee-900">מדיניות פרטיות</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-coffee-200">
                      <td className="p-3 text-coffee-900 font-medium">Google Analytics</td>
                      <td className="p-3 text-coffee-700 text-sm">ניתוח תנועה באתר</td>
                      <td className="p-3">
                        <a href="https://policies.google.com/privacy" className="text-tropical-600 underline text-sm" target="_blank" rel="noopener">
                          מדיניות Google
                        </a>
                      </td>
                    </tr>
                    <tr className="border-t border-coffee-200">
                      <td className="p-3 text-coffee-900 font-medium">Facebook Pixel</td>
                      <td className="p-3 text-coffee-700 text-sm">מדידת פרסומות</td>
                      <td className="p-3">
                        <a href="https://www.facebook.com/privacy/explanation" className="text-tropical-600 underline text-sm" target="_blank" rel="noopener">
                          מדיניות Facebook
                        </a>
                      </td>
                    </tr>
                    <tr className="border-t border-coffee-200">
                      <td className="p-3 text-coffee-900 font-medium">Stripe</td>
                      <td className="p-3 text-coffee-700 text-sm">עיבוד תשלומים</td>
                      <td className="p-3">
                        <a href="https://stripe.com/privacy" className="text-tropical-600 underline text-sm" target="_blank" rel="noopener">
                          מדיניות Stripe
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4">עדכונים למדיניות</h2>
            <div className="bg-latte-100 p-4 rounded-lg">
              <p className="text-coffee-700 text-sm">
                אנו עשויים לעדכן מדיניות עוגיות זו מעת לעת. שינויים יפורסמו באתר ויישלחו הודעה 
                ללקוחות רשומים במקרה של שינויים מהותיים.
              </p>
              <p className="text-coffee-700 text-sm mt-2">
                <strong>תאריך עדכון אחרון:</strong> דצמבר 2024
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-tropical-600" />
              יצירת קשר
            </h2>
            
            <div className="bg-tropical-50 p-6 rounded-lg">
              <p className="text-coffee-700 mb-4">
                לשאלות נוספות על השימוש בעוגיות:
              </p>
              
              <div className="space-y-2">
                <div className="text-coffee-900">
                  <strong>דואל:</strong> privacy@coffeeland.co.il
                </div>
                <div className="text-coffee-900">
                  <strong>טלפון:</strong> 08-123-4567
                </div>
                <div className="text-coffee-900">
                  <strong>כתובת:</strong> בן גוריון 7, אשקלון
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
