# CoffeeLand - מדריך התקנה והפעלה 🚀

## סקירה כללית

מערכת מלאה לניהול בית קפה משפחתי עם:
- ✅ משחקייה וכרטיסיות נאמנות
- ✅ חוגים וסדנאות עם הרשמה אונליין
- ✅ POS וירטואלי למכירה במקום
- ✅ סנכרון אוטומטי ליומן Google Calendar
- ✅ תשלומים (mockup - מוכן לחיבור Green Invoice)
- ✅ ממשק אדמין מלא

---

## שלב 1: דרישות מקדימות

### תוכנות נדרשות

```bash
Node.js >= 20.x
npm >= 10.x
Git
```

### חשבונות חיצוניים

1. **Supabase** - [https://supabase.com](https://supabase.com)
2. **Google Cloud Console** - [https://console.cloud.google.com](https://console.cloud.google.com)
3. **Vercel** (אופציונלי לפריסה) - [https://vercel.com](https://vercel.com)

---

## שלב 2: הורדה והתקנה

```bash
# שכפל את הפרויקט
git clone <your-repo-url>
cd coffeeland

# התקן תלויות
npm install

# התקן תלויות לסקריפטים
cd scripts
npm install
cd ..
```

---

## שלב 3: הגדרת Supabase

### 3.1 יצירת פרויקט

1. היכנס ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. צור פרויקט חדש
3. שמור את ה-**Project URL** וה-**Anon Key**

### 3.2 הרצת Migrations (דרך MCP)

הטבלאות כבר נוצרו! אם אתה רוצה לבדוק:

```bash
# בדוק שהטבלאות קיימות
# דרך Supabase Dashboard -> SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

אמור להראות:
- users
- admins
- passes
- pass_usages
- loyalty_cards
- loyalty_stamps
- children
- card_types
- instructors
- rooms
- events
- registrations
- payments
- audit_log

### 3.3 יצירת אדמין ראשון

```sql
-- ב-Supabase SQL Editor
-- קודם צור משתמש דרך /register, ואז:

INSERT INTO public.admins (user_id, is_active)
VALUES ('YOUR_USER_ID_FROM_AUTH_USERS', true);
```

---

## שלב 4: הגדרת Google Calendar API

### 4.1 יצירת OAuth Credentials

1. פתח [Google Cloud Console](https://console.cloud.google.com)
2. צור פרויקט חדש או בחר קיים
3. **APIs & Services** -> **Enable APIs**
4. חפש **Google Calendar API** והפעל
5. **OAuth consent screen**:
   - User Type: External
   - מלא שם אפליקציה, אימייל
   - Scopes: `../auth/calendar`
6. **Credentials** -> **Create OAuth Client ID**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/oauth2callback`
7. שמור **Client ID** ו-**Client Secret**

### 4.2 הפקת Refresh Token

```bash
# ודא ש-.env.local מכיל:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
# NEXT_PUBLIC_GOOGLE_SECRET_KEY=...

# הרץ את הסקריפט
node scripts/get-google-refresh-token.mjs

# דפדפן ייפתח - אשר הרשאות
# העתק את GOOGLE_REFRESH_TOKEN מהטרמינל
```

### 4.3 מציאת Calendar ID

1. [Google Calendar](https://calendar.google.com)
2. Settings -> בחר יומן
3. **Integrate calendar** -> העתק **Calendar ID**
4. נראה כמו: `abc123@group.calendar.google.com`

---

## שלב 5: משתני סביבה

צור `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Calendar
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_SECRET_KEY=GOCSPX-xxx
GOOGLE_REFRESH_TOKEN=1//0g...
GOOGLE_CALENDAR_ID=your-calendar@group.calendar.google.com
GOOGLE_TIMEZONE=Asia/Jerusalem

# Contact
NEXT_PUBLIC_WHATSAPP_NUMBER=972501234567

# Analytics (אופציונלי)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Show sale badge
NEXT_PUBLIC_SHOW_SALE_BADGE=false
```

---

## שלב 6: בדיקה מקומית

```bash
# הרץ שרת פיתוח
npm run dev

# פתח דפדפן
http://localhost:3000
```

### בדיקות חובה:

1. ✅ **הרשמה**: `/register` - צור משתמש חדש
2. ✅ **התחברות**: `/login` - התחבר עם המשתמש
3. ✅ **כרטיסיות**: `/passes` - רכוש כרטיסייה
4. ✅ **QR**: `/my-account` - ראה QR אישי
5. ✅ **אדמין**: הפוך את המשתמש לאדמין (SQL למעלה)
6. ✅ **אירועים**: `/admin/events` - צור אירוע
7. ✅ **Google Calendar**: בדוק שהאירוע הופיע ביומן
8. ✅ **רישום**: `/classes` - נסה להירשם לאירוע
9. ✅ **POS**: `/admin/pos` - מכור כרטיסייה
10. ✅ **סריקה**: `/admin/scan` - סרוק QR

---

## שלב 7: פריסה לפרודקשן (Vercel)

### 7.1 חיבור Vercel

```bash
# התקן Vercel CLI
npm i -g vercel

# התחבר
vercel login

# פרוס
vercel --prod
```

### 7.2 משתני סביבה ב-Vercel

1. Vercel Dashboard -> Project -> Settings
2. **Environment Variables**
3. הוסף את כל המשתנים מ-.env.local
4. ⚠️ **חשוב**: שנה את Redirect URI ב-Google Cloud:
   - הוסף: `https://your-domain.vercel.app/oauth2callback`

### 7.3 עדכון Supabase

ב-Supabase Dashboard -> Authentication -> URL Configuration:
- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**: הוסף את הדומיין החדש

---

## שלב 8: אכלוס נתונים ראשוני

### 8.1 סוגי כרטיסיות

```sql
-- דרך Supabase SQL Editor או API
INSERT INTO public.card_types (name, description, type, entries_count, price, is_active) VALUES
('כרטיסייה 5 כניסות', 'כרטיסייה בסיסית למשחקייה', 'playground', 5, 150, true),
('כרטיסייה 10 כניסות', 'כרטיסייה חסכונית', 'playground', 10, 250, true),
('כרטיסייה משפחתית', 'עד 4 ילדים', 'playground', 20, 400, true);
```

### 8.2 מדריכים

```sql
INSERT INTO public.instructors (name, email, phone, specialties, is_active) VALUES
('יוסי כהן', 'yossi@example.com', '050-1234567', ARRAY['רובוטיקה', 'מדע'], true),
('שרה לוי', 'sara@example.com', '050-7654321', ARRAY['אומנות', 'קריאטיב'], true);
```

### 8.3 חדרים

```sql
INSERT INTO public.rooms (name, capacity, location, is_active) VALUES
('חדר ירוק', 15, 'קומה 1', true),
('חדר כחול', 20, 'קומה 2', true);
```

---

## שלב 9: תחזוקה

### גיבויים

- **Supabase**: Dashboard -> Settings -> Backups (אוטומטי בתוכנית Pro)
- **קוד**: Git + GitHub (push תכוף)

### עדכוני טבלאות

השתמש ב-MCP Supabase tools:
```typescript
// דרך Cursor MCP
mcp_supabase_apply_migration({
  name: "add_new_feature",
  query: "ALTER TABLE events ADD COLUMN new_field TEXT;"
})
```

### מעקב שגיאות

1. Vercel Dashboard -> Logs
2. Supabase Dashboard -> Logs
3. Console.log ב-API routes

---

## שלב 10: חיבור Green Invoice (עתידי)

כרגע המערכת עובדת עם **תשלומים דמה (mockup)**. לחיבור אמיתי:

1. קבל **API Key** מ-[Green Invoice](https://www.greeninvoice.co.il)
2. הוסף ל-.env.local:
   ```bash
   GREEN_INVOICE_API_KEY=your_key
   GREEN_INVOICE_SECRET=your_secret
   ```
3. עדכן `/api/payments/create/route.ts` להשתמש ב-Green Invoice API
4. הגדר Webhook URL ב-Green Invoice Dashboard

---

## פתרון בעיות נפוצות

### "Calendar API Error"
- ודא ש-Refresh Token תקף
- בדוק ש-Calendar ID נכון (כולל @group.calendar.google.com)

### "RLS policy violation"
- בדוק ש-RLS policies נכונים ב-Supabase
- ודא שהמשתמש מאומת

### "Admin access required"
- ודא שהמשתמש קיים ב-admins table
- בדוק ש-is_active = true

### "Events not syncing to Google"
- בדוק logs ב-Console
- נסה `/api/events` ידנית דרך Postman
- ודא שכל משתני ה-ENV מוגדרים

---

## תמיכה

- 📧 Email: support@coffeeland.com
- 📱 WhatsApp: 050-123-4567
- 📚 Documentation: `/docs` (אם קיים)

---

## רישיון

MIT License - השתמש בחופשיות!

---

**בהצלחה! ☕️**

