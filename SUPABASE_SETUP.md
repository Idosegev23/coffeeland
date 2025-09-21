# הוראות הגדרת Supabase

## 🔑 קבלת Service Role Key

1. **כנסו ל-Supabase Dashboard:**
   - https://app.supabase.com/projects

2. **בחרו את הפרויקט שלכם**

3. **עברו ל-Settings > API:**
   - בצד השמאלי: Settings
   - לחצו על API

4. **העתיקו את ה-Service Role Key:**
   - תמצאו אותו תחת "Project API keys"
   - זה המפתח שמתחיל ב-`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **זהירות!** זה מפתח רגיש - אל תחשפו אותו בגיט!

5. **הוסיפו אותו ל-.env.local:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🔒 הגדרת RLS (Row Level Security)

הטבלאות כבר מוגדרות עם RLS. אם אתם רוצים לבדוק:

1. **עברו ל-Table Editor**
2. **בחרו טבלה (למשל `products`)**  
3. **לחצו על ה-⚙️ ליד שם הטבלה**
4. **ודאו ש-"Enable RLS" מסומן**

## 📊 בדיקת הנתונים

כל הנתונים כבר קיימים במסד הנתונים:
- ✅ 4 מוצרים עם תמונות
- ✅ באנר חם פעיל  
- ✅ 3 סליידים להירו
- ✅ 3 סדנאות עם מופעים
- ✅ 2 חבילות יום הולדת
- ✅ 8 פריטי גלריה
- ✅ משתמש אדמין

## 🛠️ פתרון בעיות נפוצות

### שגיאת "Failed to fetch"
- ודאו שה-URL נכון ב-`.env.local`
- בדקו שה-Anon Key תקין

### שגיאת "Insufficient privileges"  
- ודאו שה-Service Role Key נכון
- בדקו שה-RLS מוגדר נכון

### "Table doesn't exist"
- הטבלאות כבר נוצרו באמצעות MCP
- אם חסרות, צרו קשר לתמיכה
