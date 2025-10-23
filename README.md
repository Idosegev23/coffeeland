# ☕️ CoffeeLand - מערכת ניהול מלאה לבית קפה משפחתי

מערכת אחודה ומקצועית לניהול בית קפה עם משחקייה, חוגים וסדנאות - כולל POS וירטואלי, כרטיסיות נאמנות, וסנכרון אוטומטי ליומן Google Calendar.

---

## 🌟 תכונות עיקריות

### 👨‍👩‍👧‍👦 למשתמשים (לקוחות)

- **כרטיסיות משחקייה** - רכישה אונליין או בקופה, QR אישי לכל משתמש
- **כרטיסיית נאמנות קפה** - 10 חותמות = קפה חינם 🎁
- **הרשמה לחוגים וסדנאות** - ממשק נוח, תשלום מאובטח, אישור במייל
- **ניהול ילדים** - הוספת מספר ילדים לחשבון אחד
- **איזור אישי** - צפייה בכרטיסיות פעילות, היסטוריה, הרשמות קרובות

### 👨‍💼 לאדמינים

- **דשבורד מקיף** - סטטיסטיקות, הכנסות, כרטיסיות פעילות
- **POS וירטואלי** - מכירת כרטיסיות במקום (מזומן/אשראי/Bit)
- **ניהול אירועים** - יצירה ועריכה של חוגים וסדנאות
- **סריקת QR** - הוספת חותמות נאמנות, ניצול כרטיסיות
- **ניהול לקוחות** - רשימת לקוחות, ילדים, תשלומים
- **לוג פעולות (Audit Log)** - מעקב מלא אחר כל פעולה במערכת

### 🔗 אינטגרציות

- **Google Calendar** - סנכרון אוטומטי של כל אירוע שנוצר (חד-כיווני)
- **Green Invoice** - (מוכן לחיבור) הנפקת חשבוניות אוטומטית
- **WhatsApp** - קישורים ישירים ליצירת קשר
- **Email** - אישורי רישום והודעות אוטומטיות

---

## 🛠️ טכנולוגיות

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Framer Motion** (אנימציות)

### Backend
- **Next.js API Routes**
- **Supabase** (Database + Auth + RLS)
- **Google Calendar API** (OAuth2)

### כלים
- **html5-qrcode** - סריקת QR
- **qrcode.react** - יצירת QR
- **nanoid** - מזהים ייחודיים

---

## 🚀 התקנה מהירה

```bash
# 1. שכפול
git clone <your-repo>
cd coffeeland

# 2. התקנת תלויות
npm install

# 3. הגדרת משתני סביבה
cp .env.example .env.local
# ערוך את .env.local עם הפרטים שלך

# 4. הרצת סקריפט Google Refresh Token
cd scripts
npm install
cd ..
node scripts/get-google-refresh-token.mjs

# 5. הרצה מקומית
npm run dev
# פתח http://localhost:3000
```

📖 **למדריך מפורט**: ראה [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

---

## 📁 מבנה הפרויקט

```
coffeeland/
├── app/
│   ├── (auth)/              # הרשמה והתחברות
│   ├── (public)/            # עמודים ציבוריים
│   │   ├── classes/         # חוגים וסדנאות
│   │   ├── passes/          # רכישת כרטיסיות
│   │   └── my-account/      # איזור אישי
│   ├── admin/               # ממשק אדמין
│   │   ├── scan/            # סריקת QR
│   │   ├── pos/             # קופה וירטואלית
│   │   └── events/          # ניהול אירועים
│   └── api/                 # API Routes
│       ├── events/          # CRUD אירועים
│       ├── registrations/   # הרשמות
│       ├── payments/        # תשלומים (mockup + POS)
│       ├── card-types/      # סוגי כרטיסיות
│       └── children/        # ניהול ילדים
├── components/
│   ├── account/             # רכיבי חשבון משתמש
│   ├── admin/               # רכיבי אדמין
│   ├── calendar/            # רכיבי יומן
│   └── ui/                  # רכיבי UI בסיסיים
├── lib/
│   ├── googleCalendar.ts    # אינטגרציית Google Calendar
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # פונקציות עזר
├── scripts/
│   └── get-google-refresh-token.mjs  # הפקת Refresh Token
├── memory-bank/             # תיעוד פרויקט
└── [קבצי הגדרה...]
```

---

## 🗄️ מבנה Database (Supabase)

### טבלאות עיקריות

| טבלה | תיאור |
|------|-------|
| **users** | משתמשים (לקוחות) |
| **admins** | אדמינים מורשים |
| **children** | ילדים שייכים להורים |
| **card_types** | סוגי כרטיסיות (משחקייה, סדנאות...) |
| **passes** | כרטיסיות פעילות |
| **pass_usages** | היסטוריית ניצול כרטיסיות |
| **loyalty_cards** | כרטיסיות נאמנות קפה |
| **loyalty_stamps** | חותמות נאמנות |
| **events** | חוגים וסדנאות |
| **registrations** | הרשמות לאירועים |
| **instructors** | מדריכים |
| **rooms** | חדרים/מיקומים |
| **payments** | תשלומים (אונליין + POS) |
| **audit_log** | לוג פעולות |

---

## 🔐 אבטחה

- **Row Level Security (RLS)** על כל הטבלאות
- **משתמשים** רואים רק את הנתונים שלהם
- **אדמינים** גישה מלאה דרך policies מובנים
- **Authentication** דרך Supabase Auth (JWT)
- **Middleware** לבדיקת הרשאות בעמודי אדמין

---

## 📱 תכונות נוספות

### Google Calendar Sync
כל אירוע שנוצר באדמין מסתנכרן אוטומטית ליומן Google:
- יצירה → `POST /api/events` → Google Calendar
- עדכון → `PATCH /api/events/:id` → Google Calendar
- מחיקה → `DELETE /api/events/:id` → Google Calendar

### POS (קופה וירטואלית)
- חיפוש לקוח לפי טלפון
- בחירת כרטיסייה מתוך קטלוג
- תשלום מזומן/אשראי/Bit/אחר
- הפקת "קבלה" (mockup - מוכן לחיבור Green Invoice)

### כרטיסיית נאמנות
- 10 חותמות = קפה חינם
- ויזואליזציה עם לוגו של הקפה
- מימוש אוטומטי + איפוס המונה

---

## 🎯 Roadmap עתידי

- [ ] חיבור Green Invoice API אמיתי
- [ ] שליחת SMS/WhatsApp אוטומטית (GreenAPI)
- [ ] דוחות ואנליטיקות מתקדמות
- [ ] רשימת המתנה לאירועים מלאים
- [ ] קופונים והנחות
- [ ] אפליקציה מובייל (React Native)

---

## 📞 תמיכה

- **Email**: support@coffeeland.com
- **WhatsApp**: 050-123-4567
- **Docs**: [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

---

## 📄 רישיון

MIT License

---

## 🙏 תודות

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**בנוי ב-❤️ עבור CoffeeLand ☕️**
