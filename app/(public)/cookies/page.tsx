import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מדיניות עוגיות',
  description: 'מדיניות העוגיות (Cookies) של CoffeeLand - כיצד אנו משתמשים בעוגיות באתר',
}

export default function CookiesPage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">מדיניות עוגיות</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-text-light/80">
            <p className="text-sm text-text-light/60">
              עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
            </p>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">1. מה הן עוגיות?</h2>
              <p>
                עוגיות (Cookies) הן קבצי טקסט קטנים שנשמרים במכשיר שלכם כאשר אתם מבקרים
                באתר אינטרנט. עוגיות משמשות לשיפור חוויית הגלישה, ניתוח תנועה באתר ומתן
                שירותים מותאמים אישית.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">2. סוגי העוגיות שאנו משתמשים</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary">עוגיות הכרחיות</h3>
                  <p>
                    עוגיות אלה נחוצות לתפקוד התקין של האתר. הן מאפשרות ניווט באתר ושימוש
                    בתכונות בסיסיות.
                  </p>
                  <ul className="list-disc mr-6 mt-2">
                    <li>ניהול הפעלות (session management)</li>
                    <li>אבטחה והגנה מפני הונאות</li>
                    <li>העדפות שפה וריגיונליות</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary">עוגיות ביצועים</h3>
                  <p>
                    עוגיות אלה עוזרות לנו להבין כיצד המשתמשים מתקשרים עם האתר, מה הדפים
                    הפופולריים והאם יש שגיאות.
                  </p>
                  <ul className="list-disc mr-6 mt-2">
                    <li>Google Analytics - ניתוח תנועת גולשים</li>
                    <li>מדידת ביצועי דפים</li>
                    <li>זיהוי בעיות טכניות</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary">עוגיות פונקציונליות</h3>
                  <p>
                    עוגיות אלה מזכרות את הבחירות שעשיתם (כגון שפה, אזור, העדפות תצוגה) כדי
                    לספק חוויה מותאמת אישית.
                  </p>
                  <ul className="list-disc mr-6 mt-2">
                    <li>העדפות משתמש</li>
                    <li>הגדרות תצוגה</li>
                    <li>זיכרון טפסים שמולאו</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary">עוגיות שיווקיות</h3>
                  <p>
                    עוגיות אלה משמשות להצגת פרסומות רלוונטיות ולמדידת יעילות הקמפיינים
                    השיווקיים שלנו. (נכון לעכשיו, אנחנו לא משתמשים בסוג זה של עוגיות)
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">3. עוגיות של צדדים שלישיים</h2>
              <p>
                אנו משתמשים בשירותים של צדדים שלישיים שעשויים להציב עוגיות במכשיר שלכם:
              </p>
              <ul className="list-disc mr-6 space-y-2">
                <li>
                  <strong>Google Analytics:</strong> לניתוח תנועת גולשים ושיפור האתר.
                  למידע נוסף:{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    מדיניות הפרטיות של Google
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">4. כיצד לנהל עוגיות</h2>
              <p>
                אתם יכולים לשלוט בעוגיות ולמחוק אותן דרך הגדרות הדפדפן שלכם. שימו לב שחסימת
                עוגיות מסוימות עלולה להשפיע על תפקוד האתר.
              </p>
              <ul className="list-disc mr-6 space-y-2">
                <li>
                  <strong>Chrome:</strong> הגדרות {'>'} פרטיות ואבטחה {'>'} עוגיות ונתוני אתרים אחרים
                </li>
                <li>
                  <strong>Firefox:</strong> אפשרויות {'>'} פרטיות ואבטחה {'>'} עוגיות ונתוני אתרים
                </li>
                <li>
                  <strong>Safari:</strong> העדפות {'>'} פרטיות {'>'} עוגיות ונתוני אתרים
                </li>
                <li>
                  <strong>Edge:</strong> הגדרות {'>'} עוגיות והרשאות אתרים
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">5. הסכמה</h2>
              <p>
                על ידי המשך השימוש באתר שלנו, אתם מסכימים לשימוש שלנו בעוגיות כפי שמתואר
                במדיניות זו. אם אינכם מסכימים, תוכלו לשנות את הגדרות הדפדפן או להימנע משימוש
                באתר.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">6. עדכונים למדיניות</h2>
              <p>
                אנו עשויים לעדכן מדיניות עוגיות זו מעת לעת. כל שינוי יפורסם בעמוד זה עם
                תאריך העדכון המעודכן.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">7. צור קשר</h2>
              <p>
                לשאלות נוספות לגבי מדיניות העוגיות שלנו, צרו קשר:
                <br />
                טלפון: 050-123-4567
                <br />
                דוא{'"'}ל: info@coffeeland.co.il
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

