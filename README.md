# CoffeLand - בית קפה משחקייה 

אפליקציית Next.js 14 מתקדמת לבית קפה-משחקייה בסגנון תל-אביבי, מובייל-פרסט ו-RTL.

## ✨ תכונות עיקריות

- 🎯 **דף בית דינמי** - באנר חם מתחלף + הירו קרוסלה
- 📅 **לוח פעילויות** - סדנאות עם הרשמה
- 🎉 **שירותי יום הולדת** - חבילות מותאמות אישית
- 🖼️ **גלריה אינטראקטיבית** - עם מסנני תגיות
- 📞 **טפסי יצירת קשר** - לאירועים ובקשות
- 📅 **יצוא ICS** - הוספה ליומן אוטומטית
- 🔒 **תואמות GDPR** - עמודי פרטיות מלאים
- 📱 **מותאם למובייל** - RTL + נגישות AA

## 🛠️ טכנולוגיות

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **עיצוב**: TailwindCSS + MagicUI + Framer Motion
- **מסד נתונים**: Supabase (Postgres + Auth + Storage + RLS)
- **אחרים**: TanStack Query, React Hook Form, Zod, Next-SEO

## 🚀 התקנה והפעלה

### דרישות מוקדמות

- Node.js 18+ 
- npm/yarn
- חשבון Supabase

### שלבי התקנה

1. **שכפול הפרויקט**
```bash
git clone <repository-url>
cd coffeeland
```

2. **התקנת תלויות**
```bash
npm install
```

3. **הגדרת משתני סביבה**

קובץ `.env.local` כבר קיים עם הגדרות Supabase! תצטרכו רק להוסיף:

```env
# הוסיפו את המפתח הזה מ-Supabase Dashboard > Settings > API
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

```

4. **הגדרת מסד הנתונים**

הטבלאות כבר נוצרו באמצעות Supabase MCP. הנתונים כוללים:
- ✅ 4 מוצרים דמו
- ✅ באנר חם פעיל
- ✅ 3 סליידים להירו
- ✅ 3 סדנאות + מופעים
- ✅ 2 חבילות יום הולדת
- ✅ 8 פריטי גלריה
- ✅ משתמש אדמין
- ✅ קופוני הנחה

5. **הפעלת השרת**
```bash
npm run dev
```

האתר יהיה זמין ב: `http://localhost:3000` (או 3001 אם 3000 תפוס)

## 📁 מבנה הפרויקט

```
src/
├── app/                    # Next.js App Router
│   ├── (site)/            # דפי האתר הציבוריים
│   │   ├── page.tsx       # דף הבית
│   │   ├── calendar/      # לוח פעילויות
│   │   ├── gallery/       # גלריה
│   │   ├── privacy/       # מדיניות פרטיות
│   │   ├── terms/         # תקנון
│   │   ├── cookies/       # מדיניות קוקיז
│   │   └── data-requests/ # בקשות נתונים
│   ├── api/               # API Routes
│   │   ├── hot-banner/    # מוצרים לבאנר חם
│   │   ├── checkout/      # יצירת תשלום
│   │   ├── webhooks/      # וובהוקי Stripe
│   │   ├── ics/          # יצוא ICS
│   │   ├── events-contact/ # טופס אירועים
│   │   └── data-requests/ # טיפול בבקשות נתונים
│   └── globals.css        # סגנונות גלובליים
├── components/            # קומפוננטים
│   ├── banner/           # באנר חם
│   ├── hero/             # קרוסלת הירו
│   ├── calendar/         # רכיבי לוח
│   ├── forms/            # טפסים
│   ├── layout/           # Header/Footer
│   └── ui/               # רכיבי UI בסיסיים
├── lib/                  # עזרים ותצורות
│   ├── supabaseClient.ts # חיבור לSupabase
│   ├── stripe.ts         # חיבור לStripe
│   ├── ics.ts           # יצירת קבצי ICS
│   └── utils.ts         # פונקציות עזר
└── styles/
    └── theme.ts          # מערכת צבעים
```

## 🎨 עיצוב ומיתוג

### פלטת צבעים
- **Base**: Latte (`#e8ded1`) - רקע חם ונעים
- **Text**: Coffee (`#4c2c21`) - טקסט כהה וקריא
- **Accent**: Tropical (`#5f614c`) - הדגשות ירוקות

### טיפוגרפיה
- **Heebo** - גופן עברי נקי ומודרני
- משקלים: 300, 400, 500, 600, 700

### עקרונות עיצוב
- 📱 **Mobile-First** - עיצוב מתחיל מהמובייל
- ↩️ **RTL Support** - תמיכה מלאה בעברית
- ♿ **נגישות AA** - ניגודיות, alt, aria
- 🎯 **UX מותאם** - חוויית משתמש אינטואיטיבית

## 🔧 API Endpoints

### ציבוריים
- `GET /api/hot-banner` - באנר חם + מוצרים
- `GET /api/ics/[sessionId]` - הורדת ICS
- `POST /api/events-contact` - טופס אירועים
- `POST /api/data-requests` - בקשות נתונים

## 💳 אינטגרציות

### Supabase
- **Authentication**: ניהול משתמשים
- **Database**: PostgreSQL עם RLS
- **Storage**: תמונות ומדיה
- **Real-time**: עדכונים חיים

## 📱 תכונות מובייל

- **PWA Ready** - ניתן להתקנה כאפליקציה
- **Touch Optimized** - ממשק מותאם למגע
- **Fast Loading** - אופטימיזציה למהירות
- **Offline Support** - תמיכה בסיסית במצב לא מקוון

## 🔒 אבטחה ופרטיות

### מדיניות פרטיות
- ✅ תואם לתיקון 13 לחוק הגנת הפרטיות
- ✅ זכויות נושא מידע מלאות
- ✅ ניהול הסכמות
- ✅ טופס בקשות נתונים

### אבטחה טכנית
- 🔐 **RLS** - Row Level Security בSupabase
- 🛡️ **Input Validation** - Zod schemas
- 🔒 **HTTPS** - הצפנה בתקשורת
- 🚫 **XSS Protection** - הגנה מפני הזרקות

## 🚀 פריסה (Deployment)

### Vercel (מומלץ)
```bash
# התחבר לVercel
npx vercel login

# פרוס לראשונה
npx vercel

# הגדר משתני סביבה בVercel Dashboard
# פרוס לפרודקשן
npx vercel --prod
```

### משתני סביבה בפרודקשן
וודא שכל המשתנים מ-`.env.example` מוגדרים בפלטפורמת הפריסה.


## 🧪 בדיקות

### בדיקות ידניות
- [ ] באנר חם מציג מוצרים
- [ ] הירו קרוסלה עובדת
- [ ] הרשמה לסדנה + תשלום
- [ ] הורדת ICS עובדת
- [ ] טופס אירועים שולח לוואטסאפ
- [ ] עמודי פרטיות נגישים
- [ ] מובייל responsive


## 🐛 פתרון בעיות נפוצות

### שגיאות חיבור לSupabase
```bash
# בדוק שהמשתנים נכונים
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```


### בעיות RTL
- וודא ש-`html` tag יש `dir="rtl"`
- בדוק שהגופן Heebo נטען
- TailwindCSS עם `rtl:` modifiers

## 📞 תמיכה

לשאלות ובעיות:
- 📧 **Email**: info@coffeeland.co.il
- 📱 **WhatsApp**: +972-50-123-4567
- 🏠 **כתובת**: בן גוריון 7, אשקלון

## 📄 רישיון

פרויקט זה מיועד לשימוש של CoffeLand בלבד.

---

**נבנה עם ❤️ בישראל**
