# הגדרת Supabase למערכת הכרטיסיות

## 1. כיבוי אישור אימייל (חובה!)

כדי למשתמשים להירשם ולהתחבר מיד ללא צורך באישור אימייל:

1. היכנס ל-[Supabase Dashboard](https://app.supabase.com)
2. בחר בפרויקט שלך: `dubdsrgoojmlznwjxyxw`
3. לך ל-**Authentication** → **Providers** → **Email**
4. כבה את האפשרות: **"Enable email confirmations"**
5. שמור שינויים

## 2. יצירת משתמש אדמין

### שלב א: הרשמה רגילה
1. פתח את האתר: http://localhost:3001/register
2. הירשם עם אימייל וסיסמה
3. המערכת תיצור לך QR אוטומטית

### שלב ב: הפיכה לאדמין
1. לך ל-Supabase Dashboard → **SQL Editor**
2. הרץ את הקוד הבא (החלף את EMAIL באימייל שלך):

```sql
-- Get the user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';

-- Make them admin (use the ID from above)
INSERT INTO public.admins (user_id, is_active)
VALUES ('USER_ID_HERE', true);
```

3. התחבר מחדש ב-/login
4. תופנה אוטומטית ל-/admin

## 3. בדיקת RLS Policies

לוודא שה-policies עובדים:

```sql
-- Check policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check policies on admins table
SELECT * FROM pg_policies WHERE tablename = 'admins';
```

## 4. טיפים לפיתוח

### צפייה במשתמשים רשומים:
```sql
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.qr_code,
  CASE WHEN a.id IS NOT NULL THEN 'Admin' ELSE 'User' END as role
FROM public.users u
LEFT JOIN public.admins a ON a.user_id = u.id;
```

### צפייה בכרטיסיות פעילות:
```sql
SELECT 
  u.full_name,
  p.type,
  p.remaining_entries,
  p.total_entries,
  p.status
FROM public.passes p
JOIN public.users u ON u.id = p.user_id
WHERE p.status = 'active';
```

### צפייה בחותמות נאמנות:
```sql
SELECT 
  u.full_name,
  lc.total_stamps,
  lc.redeemed_coffees,
  (lc.total_stamps % 10) as current_stamps
FROM public.loyalty_cards lc
JOIN public.users u ON u.id = lc.user_id;
```

## 5. בעיות נפוצות

### "row-level security policy violation"
- וודא שהרצת את כל ה-migrations
- בדוק ש-RLS policies קיימות ופעילות

### "relation does not exist"
- הרץ את ה-migrations מחדש
- רענן את הדפדפן

### לא מצליח להירשם
- וודא ש-email confirmations מכובה
- בדוק שמשתני הסביבה נכונים ב-.env.local

