# ⚡ Quick Start - צעדים מהירים להתחלה

## מה נבנה? ✅

מערכת מלאה לבית קפה משפחתי כוללת:
- ✅ מבנה DB מלא (events, registrations, payments, children, card_types...)
- ✅ API routes לכל פעולה (CRUD אירועים, תשלומים, הרשמות)
- ✅ אינטגרציית Google Calendar עם OAuth2
- ✅ ממשק אדמין (ניהול אירועים + POS)
- ✅ ממשק לקוח (רישום לחוגים/סדנאות)
- ✅ תשלומים mockup (מוכן לחיבור Green Invoice)

---

## צעדים הבאים - מה לעשות עכשיו?

### 1️⃣ התקן תלויות חדשות

```bash
npm install
```

### 2️⃣ הפק Google Refresh Token

```bash
# התקן תלויות לסקריפט
cd scripts
npm install
cd ..

# הרץ והעתק את ה-REFRESH_TOKEN ל-.env.local
node scripts/get-google-refresh-token.mjs
```

**מה יקרה?**
- דפדפן ייפתח
- תאשר הרשאות Google Calendar
- בטרמינל תקבל `GOOGLE_REFRESH_TOKEN` להעתקה

### 3️⃣ עדכן .env.local

הוסף את השורות החדשות:

```bash
# Google Calendar (הוסף את אלה!)
GOOGLE_REFRESH_TOKEN="1//0g..." # מהסקריפט למעלה
GOOGLE_CALENDAR_ID="your-calendar@group.calendar.google.com"
GOOGLE_TIMEZONE="Asia/Jerusalem"
```

**איך למצוא Calendar ID?**
1. [Google Calendar](https://calendar.google.com)
2. Settings → בחר יומן
3. "Integrate calendar" → העתק **Calendar ID**

### 4️⃣ הרץ את האפליקציה

```bash
npm run dev
```

פתח: http://localhost:3000

---

## בדיקות מומלצות

### ✅ לקוח

1. `/register` - צור חשבון חדש
2. `/my-account` - ראה QR אישי
3. `/passes` - רכוש כרטיסייה
4. `/classes` - ראה חוגים וסדנאות

### ✅ אדמין

1. **הפוך משתמש לאדמין**:
   ```sql
   -- ב-Supabase SQL Editor
   INSERT INTO admins (user_id, is_active)
   VALUES ('YOUR_USER_ID', true);
   ```

2. `/admin/events` - צור אירוע חדש
3. בדוק ביומן Google שהאירוע הופיע! 🎉
4. `/admin/pos` - נסה למכור כרטיסייה
5. `/admin/scan` - סרוק QR ונצל כרטיסייה

---

## איפה הקבצים החדשים?

### 📂 API Routes
```
app/api/
├── events/              ← CRUD אירועים + סנכרון Google
├── registrations/       ← הרשמות לאירועים
├── payments/            ← תשלומים (mockup + POS)
├── card-types/          ← ניהול סוגי כרטיסיות
└── children/            ← ניהול ילדים
```

### 📂 ממשקי משתמש
```
app/
├── admin/
│   ├── events/          ← ניהול חוגים וסדנאות
│   └── pos/             ← קופה וירטואלית
└── (public)/
    └── classes/         ← רישום לאירועים (לקוח)
```

### 📂 אינטגרציות
```
lib/googleCalendar.ts    ← Google Calendar API
scripts/get-google-refresh-token.mjs  ← הפקת Token
```

### 📂 תיעוד
```
INSTALLATION_GUIDE.md    ← מדריך מפורט
GOOGLE_CALENDAR_SETUP.md ← מדריך Google Calendar
README.md                ← סקירה כללית
```

---

## טיפים חשובים 💡

### Google Calendar
- סנכרון הוא **חד-כיווני**: Supabase → Google (לצפייה בלבד)
- כל אירוע שנוצר/מעודכן/נמחק באדמין → מסתנכרן אוטומטית
- אם סנכרון נכשל → לא נכשל כל הבקשה (fallback)

### תשלומים
- כרגע זה **mockup** (סימולציה)
- בפרודקשן: חבר Green Invoice API
- POS עובד מיד (מזומן/אשראי/Bit)

### הרשאות
- משתמשים רואים רק את הנתונים שלהם (RLS)
- אדמינים צריכים להיות ב-`admins` table
- Middleware בודק הרשאות ב-`/admin/*`

---

## בעיות נפוצות ופתרונות

### "Calendar API Error"
➡️ ודא ש-GOOGLE_REFRESH_TOKEN ו-GOOGLE_CALENDAR_ID נכונים

### "Admin access required"
➡️ הוסף את המשתמש ל-`admins` table (SQL למעלה)

### "Events not syncing"
➡️ בדוק Console logs, ודא שכל משתני ה-ENV מוגדרים

### "Payment failed"
➡️ זה נורמלי - mockup כרגע. תמשיך בממשק.

---

## מה הלאה?

1. ✅ בדוק שהכל עובד מקומית
2. ✅ צור נתוני דמה (כרטיסיות, מדריכים, חדרים)
3. ✅ התאם עיצוב לפי המיתוג שלך
4. ✅ חבר Green Invoice (ראה [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md))
5. ✅ פרוס ל-Vercel

---

## צריך עזרה?

📖 **מדריך מפורט**: [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)  
🔧 **Google Calendar**: [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)  
📋 **תיעוד טבלאות**: [PASS_SYSTEM_README.md](./PASS_SYSTEM_README.md)

---

**בהצלחה! אתה מוכן ליצור חוגים וסדנאות! 🎉**

