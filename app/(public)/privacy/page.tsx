import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'מדיניות הפרטיות של CoffeeLand - כיצד אנו אוספים ומשתמשים במידע שלכם',
}

export default function PrivacyPage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">מדיניות פרטיות</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-text-light/80">
            <p className="text-sm text-text-light/60">
              עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
            </p>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">1. מבוא</h2>
              <p>
                ב-CoffeeLand אנו מכבדים את פרטיותכם ומחויבים להגן על המידע האישי שלכם. מדיניות
                פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">2. מידע שאנו אוספים</h2>
              <ul className="list-disc mr-6 space-y-2">
              <li>
                <strong>מידע אישי:</strong> שם, מספר טלפון, כתובת דוא{'"'}ל - כאשר אתם
                מבצעים הזמנה או נרשמים לשירותים
              </li>
                <li>
                  <strong>מידע על הילדים:</strong> גיל, שם (לצורך התאמת פעילויות ומסירת
                  שירות אישי)
                </li>
                <li>
                  <strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, נתוני גלישה (דרך Google
                  Analytics)
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">3. שימוש במידע</h2>
              <p>אנו משתמשים במידע שנאסף למטרות הבאות:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>מתן שירותים - ניהול הזמנות, אירועים וכרטיסיות</li>
                <li>תקשורת - יצירת קשר לגבי הזמנות, תזכורות, מבצעים</li>
                <li>שיפור השירות - הבנת צרכי הלקוחות ושיפור החוויה</li>
                <li>אבטחה - הגנה על המערכות והמידע שלנו ושלכם</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">4. שיתוף מידע</h2>
              <p>
                אנו לא מוכרים או משכירים את המידע האישי שלכם לצדדים שלישיים. נשתף מידע רק
                במקרים הבאים:
              </p>
              <ul className="list-disc mr-6 space-y-2">
                <li>ספקי שירות (עיבוד תשלומים, משלוח הודעות) - בכפוף לחיסיון</li>
                <li>חובה חוקית או בקשת רשות מוסמכת</li>
                <li>הגנה על זכויותינו או בטיחות הציבור</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">5. אבטחת מידע</h2>
              <p>
                אנו נוקטים באמצעי אבטחה סבירים כדי להגן על המידע שלכם מפני גישה לא מורשית,
                שינוי, חשיפה או השמדה. עם זאת, אף שיטת העברה או אחסון אינה בטוחה ב-100%.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">6. עוגיות (Cookies)</h2>
              <p>
                אנו משתמשים בעוגיות כדי לשפר את חוויית הגלישה שלכם. ראו את{' '}
                <a href="/cookies" className="text-accent hover:underline">
                  מדיניות העוגיות
                </a>{' '}
                שלנו למידע נוסף.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">7. זכויותיכם</h2>
              <p>יש לכם זכות:</p>
              <ul className="list-disc mr-6 space-y-2">
                <li>לדעת איזה מידע אנחנו מחזיקים עליכם</li>
                <li>לבקש תיקון או עדכון של מידע שגוי</li>
                <li>לבקש מחיקת המידע שלכם (בכפוף להגבלות חוקיות)</li>
                <li>להתנגד לשימוש במידע למטרות שיווקיות</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">8. ילדים</h2>
              <p>
                השירותים שלנו מיועדים למבוגרים. אנו לא אוספים במכוון מידע אישי מילדים
                מתחת לגיל 18 ללא הסכמת הורים. אם הובא לידיעתנו שאספנו מידע כזה בטעות, נמחק
                אותו מיד.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">9. שינויים במדיניות</h2>
              <p>
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. נודיע על שינויים מהותיים באתר
                ובדוא{'"'}ל (אם הוא זמין).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">10. צור קשר</h2>
              <p>
                לשאלות או בקשות הנוגעות לפרטיותכם, אנא פנו אלינו:
                <br />
                טלפון: 050-123-4567
                <br />
                דוא{'"'}ל: info@coffeeland.co.il
                <br />
                כתובת: רחוב הקפה 123, תל אביב
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

