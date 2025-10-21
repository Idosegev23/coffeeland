import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'תנאי השימוש באתר ובשירותי CoffeeLand',
}

export default function TermsPage() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">תנאי שימוש</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-text-light/80">
            <p className="text-sm text-text-light/60">
              עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
            </p>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">1. כללי</h2>
              <p>
                ברוכים הבאים ל-CoffeeLand. השימוש באתר זה ובשירותים שאנו מציעים כפוף לתנאי
                השימוש המפורטים להלן. על ידי גישה לאתר ושימוש בו, אתם מסכימים לתנאים אלה.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">2. שימוש במשחקייה</h2>
              <ul className="list-disc mr-6 space-y-2">
                <li>כל הילדים במשחקייה חייבים להיות בפיקוח הורה או אפוטרופוס חוקי</li>
                <li>ההורים אחראים על בטיחות ילדיהם ועל התנהגותם</li>
                <li>חובה להקפיד על כללי הבטיחות והנהלים שנקבעו על ידי הצוות</li>
                <li>נדרש לשמור על ניקיון וסדר במתקן</li>
                <li>אין להביא אוכל ומשקאות מבחוץ ללא אישור מראש</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">3. מדיניות ביטולים</h2>
              <p>
                ביטול אירוע או יום הולדת עד 48 שעות לפני המועד - החזר כספי מלא. ביטול
                בתוך 48 שעות - החזר של 50%. אי הגעה ללא הודעה - ללא החזר כספי.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">4. כרטיסיות ומנויים</h2>
              <ul className="list-disc mr-6 space-y-2">
                <li>כרטיסיות ומנויים אינם ניתנים להחזרה או להעברה</li>
                <li>תוקף הכרטיסייה מתחיל מיום הרכישה</li>
                <li>כרטיסיות שפג תוקפן אינן ניתנות לשימוש או להחזר כספי</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">5. אחריות ופטור מאחריות</h2>
              <p>
                CoffeeLand עושה כל מאמץ להבטיח את בטיחות המשתמשים, אך איננו אחראים לפציעות
                או נזקים שייגרמו כתוצאה משימוש לא נכון או אי ציות לכללי הבטיחות. ההורים
                אחראים באופן בלעדי על ילדיהם.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">6. שינויים בתנאי השימוש</h2>
              <p>
                אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת. שינויים יכנסו לתוקף
                מיד עם פרסומם באתר. המשך השימוש באתר לאחר שינויים מהווה הסכמה לתנאים
                המעודכנים.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-primary">7. צור קשר</h2>
              <p>
                לשאלות או הבהרות בנוגע לתנאי השימוש, אנא פנו אלינו בטלפון 050-123-4567 או
                במייל info@coffeeland.co.il
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

