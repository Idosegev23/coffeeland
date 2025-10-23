-- SQL להרצה ב-Supabase SQL Editor
-- יוצר משתמש אדמין עבור coffeeland.ashkelon@gmail.com

-- שלב 1: מצא את ה-user_id של המשתמש
-- (צריך להריץ זאת אחרי שהמשתמש נרשם דרך /register)

-- הצג את כל המשתמשים
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- שלב 2: אחרי שמצאת את ה-ID, הרץ זאת:
-- (החלף YOUR_USER_ID עם ה-ID האמיתי)

INSERT INTO public.admins (user_id, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'coffeeland.ashkelon@gmail.com'),
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- אימות שהאדמין נוצר:
SELECT 
  a.id,
  a.is_active,
  u.email,
  u.created_at
FROM public.admins a
JOIN public.users u ON u.id = a.user_id
WHERE u.email = 'coffeeland.ashkelon@gmail.com';

