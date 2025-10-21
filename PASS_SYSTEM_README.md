# מערכת כרטיסיות ונאמנות CoffeeLand

## סקירה כללית

מערכת מקיפה לניהול כרטיסיות (משחקייה, סדנאות, אירועים) וכרטיסיית נאמנות קפה עם QR code.

## תכונות

### 👤 למשתמשים
- **הרשמה והתחברות** - חשבון אישי עם QR ייחודי
- **רכישת כרטיסיות** - משחקייה (5/10 כניסות), סדנאות, אירועים
- **QR Code אישי** - להצגה בעת ביקור + אפשרות הורדה
- **כרטיסיית נאמנות** - 10 חותמות = קפה חינם
- **איזור אישי** - צפייה בכרטיסיות, חותמות, היסטוריה

### 👨‍💼 לאדמינים
- **סריקת QR** - מצלמה או הזנה ידנית
- **ניצול כרטיסיות** - הפחתת כניסות אוטומטית
- **ניהול נאמנות** - הוספת חותמות + מימוש קפה
- **דשבורד** - סטטיסטיקות וניהול

## מבנה הטבלאות

```
users
├── id (uuid, PK)
├── email (unique)
├── full_name
├── phone
├── qr_code (unique) ← QR ייחודי למשתמש
└── created_at

admins
├── id (uuid, PK)
├── user_id (FK → users) ← אדמינים נקבעים ידנית
├── is_active
└── created_at

passes
├── id (uuid, PK)
├── user_id (FK → users)
├── type (playground/workshop/event)
├── total_entries
├── remaining_entries ← מתעדכן בכל ניצול
├── purchase_date
├── expiry_date
├── status (active/expired/depleted)
└── price_paid

pass_usages
├── id (uuid, PK)
├── pass_id (FK → passes)
├── used_by_admin (FK → admins)
├── used_at
└── notes

loyalty_cards
├── id (uuid, PK)
├── user_id (FK → users, unique)
├── total_stamps ← מונה חותמות נוכחי
├── redeemed_coffees ← כמה קפה חינם מומשו
└── created_at

loyalty_stamps
├── id (uuid, PK)
├── loyalty_card_id (FK → loyalty_cards)
├── stamped_by_admin (FK → admins)
├── stamped_at
└── is_redeemed ← true אחרי מימוש
```

## Flow משתמש

### 1. הרשמה ורכישה
```
משתמש → /register
  ↓
מילוי טופס (שם, email, טלפון, סיסמה)
  ↓
יצירת QR ייחודי + loyalty card אוטומטי
  ↓
/my-account (אוטומטי)
  ↓
/passes (רכישת כרטיסיות)
  ↓
בחירת כרטיסייה → "רכוש" (mockup - ללא תשלום אמיתי)
  ↓
חזרה ל-/my-account עם כרטיסייה חדשה
```

### 2. שימוש בכרטיסייה
```
משתמש מגיע ל-CoffeeLand
  ↓
פותח /my-account → מציג QR
  ↓
צוות סורק QR ב-/admin/scan
  ↓
מוצג modal עם כרטיסיות
  ↓
לחיצה על "נצל כניסה"
  ↓
remaining_entries יורד ב-1
  ↓
נרשם ב-pass_usages
```

### 3. נאמנות קפה
```
משתמש קונה קפה
  ↓
צוות סורק QR
  ↓
לחיצה על "הוסף חותמת"
  ↓
total_stamps עולה ב-1
  ↓
אחרי 10 חותמות:
  ↓
אדמין לוחץ "מימוש קפה חינם"
  ↓
10 חותמות מסומנות is_redeemed=true
  ↓
total_stamps מתאפס
  ↓
redeemed_coffees עולה ב-1
```

## API Endpoints

### Public
- `POST /api/admin/validate-qr` - אימות QR והחזרת נתוני משתמש
- `POST /api/admin/use-pass` - ניצול כניסה מכרטיסייה
- `POST /api/admin/add-stamp` - הוספת חותמת נאמנות
- `POST /api/admin/redeem-coffee` - מימוש קפה חינם

## Pages

### משתמשים
- `/register` - הרשמה
- `/login` - התחברות
- `/passes` - רכישת כרטיסיות
- `/my-account` - איזור אישי

### אדמינים
- `/admin` - דשבורד
- `/admin/scan` - סריקת QR

## Components

### Account
- `QRCodeDisplay` - הצגת QR + הורדה
- `PassCard` - כרטיסייה עם progress bar
- `LoyaltyCard` - 10 משבצות עם חותמות (לוגו)
- `UsageHistory` - היסטוריית שימושים

### Admin
- `QRScanner` - סריקה במצלמה או ידנית (html5-qrcode)
- `UserPassesModal` - הצגת כרטיסיות + פעולות

## Security

### RLS Policies
- Users רואים רק את הנתונים שלהם
- Admins רואים הכל (דרך is_active check)
- Pass usages מוגנים

### Middleware
- `/admin/*` - רק אדמינים מאושרים
- `/my-account` - רק משתמשים מחוברים

## הגדרת אדמין

לאחר יצירת משתמש דרך `/register`, הפוך אותו לאדמין:

```sql
-- In Supabase SQL Editor
INSERT INTO public.admins (user_id, is_active)
VALUES ('USER_ID_FROM_AUTH_USERS', true);
```

## Testing Flow

1. **הירשם** ב-`/register`
2. **רכוש כרטיסייה** ב-`/passes`
3. **ראה QR** ב-`/my-account`
4. **צור אדמין** דרך SQL
5. **התחבר כאדמין** ב-`/login` → redirect to `/admin`
6. **סרוק QR** ב-`/admin/scan`
7. **נצל כניסה** או **הוסף חותמת**

## Dependencies

```json
{
  "qrcode.react": "^4.0.1",
  "html5-qrcode": "^2.3.8",
  "nanoid": "^5.0.4",
  "@supabase/supabase-js": "latest",
  "@supabase/auth-helpers-nextjs": "latest"
}
```

## Next Steps

- [ ] חיבור למערכת תשלומים אמיתית (Stripe/Tranzila)
- [ ] שליחת QR באימייל אחרי רכישה
- [ ] התראות Push כש-10 חותמות מושלמות
- [ ] ייצוא דוחות לאדמין
- [ ] ניהול משתמשים (עריכה, חסימה)

