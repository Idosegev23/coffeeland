# הגדרת Google Calendar API - מדריך מהיר

## שלב 1: הפקת Refresh Token (פעם אחת)

### התקנה והרצה

```bash
# נווט לתיקיית הסקריפטים
cd scripts

# התקן תלויות
npm install

# הרץ את הסקריפט (ודא ש-.env.local מכיל GOOGLE_CLIENT_ID ו-SECRET_KEY)
cd ..
node scripts/get-google-refresh-token.mjs
```

### מה יקרה?

1. דפדפן ייפתח אוטומטית
2. תתבקש להתחבר לחשבון Google שלך
3. אשר הרשאות ל-Google Calendar
4. בטרמינל יופיע `GOOGLE_REFRESH_TOKEN` להעתקה

### העתק ל-.env.local

```bash
# הוסף שורה זו:
GOOGLE_REFRESH_TOKEN="1//0g..."

# וגם:
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_TIMEZONE=Asia/Jerusalem
```

---

## שלב 2: מציאת Calendar ID

1. היכנס ל-[Google Calendar](https://calendar.google.com)
2. לחץ על ⚙️ Settings
3. בחר את היומן שברצונך לסנכרן (או צור יומן חדש)
4. גלול ל-**"Integrate calendar"**
5. העתק את **Calendar ID** (נראה כמו `abc123@group.calendar.google.com`)

---

## שלב 3: בדיקת התקינות

לאחר שהוספת את כל המשתנים ל-.env.local, הרץ:

```bash
npm run dev
```

נסה ליצור אירוע חדש בממשק האדמין. אם הכול תקין, האירוע יופיע ביומן Google שלך תוך שניות ספורות.

---

## פתרון בעיות נפוצות

### "Invalid credentials"
- ודא ש-Client ID ו-Secret נכונים ב-.env.local
- ודא שהוספת `http://localhost:3000/oauth2callback` ל-Authorized Redirect URIs ב-Google Cloud Console

### "Refresh token is undefined"
- הרץ שוב את הסקריפט
- ודא שבחרת `prompt: 'consent'` (קורה אוטומטית בסקריפט)

### "Calendar not found"
- בדוק ש-Calendar ID נכון (כולל @group.calendar.google.com)
- ודא שהחשבון שאישרת הרשאות הוא בעלים של היומן

---

## אבטחה 🔒

⚠️ **לעולם אל תשתף את ה-Refresh Token!**

- השאר `.env.local` בקובץ `.gitignore`
- בפרודקשן, הוסף את המשתנים דרך Vercel Environment Variables
- Refresh Token מאפשר גישה מלאה ליומן - שמור אותו כמו סיסמה

---

## תמיכה

אם נתקעת, בדוק:
- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)

