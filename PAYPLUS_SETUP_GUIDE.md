# מדריך התקנה ותיקון PayPlus

## 🔧 תיקון שבוצע

### **בעיה:** תשלומים נשארים בסטטוס "ממתין" (`pending`)

### **הסיבה:** 
ה-Authorization header לא נבנה נכון. PayPlus דורש JSON string ולא JSON object.

### **התיקון:**
```typescript
// ❌ לפני (לא עבד):
'Authorization': JSON.stringify({
  api_key: API_KEY,
  secret_key: SECRET_KEY
})

// ✅ אחרי (עובד):
'Authorization': `{"api_key":"${API_KEY}","secret_key":"${SECRET_KEY}"}`
```

---

## 🎯 הגדרות נדרשות בפאנל PayPlus

### **1. Callback URL (IPN)**
בפאנל PayPlus, ודא ש-Callback URL מוגדר ל:
```
https://coffelandclub.co.il/api/payments/payplus/callback
```

### **2. משתני סביבה ב-Vercel**

וודא שהמשתנים הבאים קיימים ב-Vercel Environment Variables:

```env
PAYPLUS_API_KEY=your_api_key_here
PAYPLUS_SECRET_KEY=480ad33e-1227-4885-9068-82102c19877a
PAYPLUS_PAYMENT_PAGE_UID=your_payment_page_uid_here
PAYPLUS_ENVIRONMENT=production
```

**⚠️ חשוב:** אל תשכח ללחוץ "Redeploy" אחרי שינוי משתני סביבה!

---

## 📊 איך לבדוק שהכל עובד

### **1. בדיקת Callback Endpoint**
```bash
curl https://coffelandclub.co.il/api/payments/payplus/callback
```

**תשובה צפויה:**
```json
{
  "status": "ok",
  "endpoint": "PayPlus Callback",
  "message": "Endpoint is ready to receive webhooks",
  "timestamp": "2026-01-31T..."
}
```

### **2. בדיקת Logs ב-Vercel**
אחרי תשלום, חפש ב-Vercel Logs:
- ✅ `📥 PayPlus Callback received at:`
- ✅ `💳 Payment SUCCESS: [payment_id]`
- ✅ `🎭 Creating show registration...`
- ✅ `✅ Registration created:`

---

## 🔄 תהליך התשלום המלא

### **שלב 1: יצירת קישור תשלום**
```
POST /api/payments/payplus/create
↓
יוצר payment בDB עם status='pending'
↓
שולח בקשה ל-PayPlus API
↓
מחזיר payment_url ללקוח
```

### **שלב 2: התשלום ב-PayPlus**
```
לקוח משלם ב-PayPlus
↓
PayPlus מאמת תשלום
↓
PayPlus שולח callback ל-/api/payments/payplus/callback
```

### **שלב 3: עדכון ב-DB (Callback)**
```
Callback מתקבל
↓
מאמת את הסטטוס (status_code === '000')
↓
מעדכן payment: status='completed'
↓
יוצר registration (להצגה) או pass (לכרטיסייה)
↓
מחזיר 200 OK ל-PayPlus
```

---

## ⚠️ שגיאות נפוצות

### **שגיאה 1: "Payment not found"**
**סיבה:** ה-`more_info_1` בcallback לא תואם ל-payment ID בDB
**פתרון:** ודא שה-`more_info_1` נשלח נכון ב-`generatePaymentLink`

### **שגיאה 2: "Invalid signature"**
**סיבה:** ה-Authorization header לא נכון
**פתרון:** ✅ תוקן! (ראה למעלה)

### **שגיאה 3: תשלום נשאר "pending"**
**סיבות אפשריות:**
1. ה-callback URL לא מוגדר בפאנל PayPlus
2. PayPlus לא שולח callback (בעיה בצידם)
3. ה-callback נחסם ע"י firewall

**פתרון גיבוי:**
- ✅ יש לנו Cron Job שרץ כל 15 דקות ומתקן תשלומים תקועים
- ✅ יש לנו פונקציה ידנית: `/api/admin/fix-pending-payments`

---

## 🛡️ מנגנוני הגנה (4 שכבות)

### **שכבה 1: Callback רגיל**
PayPlus שולח callback מיד אחרי תשלום → מעדכן ל-`completed`

### **שכבה 2: Polling בדף הצלחה**
אם Callback מאחר, הדף בודק כל 3 שניות במשך 30 שניות

### **שכבה 3: Cron Job אוטומטי**
רץ כל 15 דקות, מוצא תשלומים תקועים ומתקן אותם

### **שכבה 4: תיקון ידני**
אדמין יכול להריץ: `GET /api/admin/fix-pending-payments`

---

## 📝 Testing

### **תרחיש מלא:**

1. **צור תשלום חדש:**
   - לך ל-`/shows` → בחר הצגה → "רכוש כרטיס"
   - בחר סוג כרטיס → "המשך לתשלום"

2. **בצע תשלום:**
   - שלם דרך PayPlus
   - ✅ אמור להפנות ל-`/payment-success`

3. **ודא שהתשלום הצליח:**
   - היכנס ל-`/my-account`
   - ✅ אמור לראות את הכרטיס עם QR code

4. **בדוק ב-Admin:**
   - `/admin/shows` → לחץ "👁️ משתתפים"
   - ✅ אמור לראות את הרכישה החדשה

---

## 🔍 איך לבדוק אם PayPlus שולח Callback

### **אופציה 1: Vercel Logs**
```
Vercel Dashboard → Your Project → Logs
→ חפש "PayPlus Callback"
```

### **אופציה 2: Database**
```sql
SELECT 
  id, 
  amount, 
  status, 
  metadata->>'callback_received_at' as callback_time
FROM payments 
ORDER BY created_at DESC 
LIMIT 10;
```

אם `callback_received_at` הוא `null` - PayPlus לא שלח callback!

---

## 📞 תמיכה

אם עדיין יש בעיות:

1. **בדוק Logs ב-Vercel** - חפש שגיאות
2. **בדוק פאנל PayPlus** - ודא שה-Callback URL נכון
3. **הרץ תיקון ידני** - `/api/admin/fix-pending-payments`
4. **צור support ticket ב-PayPlus** - אולי יש בעיה בצידם

---

✅ **המערכת עכשיו מתוקנת ואמורה לעבוד!**
