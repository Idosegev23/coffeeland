# 🛡️ מערכת מניעת תשלומים תקועים

## הבעיה שפתרנו

ב-26/1/2026 התגלה שיש **11 רכישות** שנשארו במצב `pending` אף שהתשלום בוצע בהצלחה.  
**הסיבה:** PayPlus callback לא הגיע למערכת.  
**התוצאה:** לקוחות שילמו אבל לא קיבלו כרטיסים!

---

## 🔧 הפתרונות שהוספנו

### 1️⃣ **Cron Job אוטומטי** ⏰

**קובץ:** `app/api/cron/fix-pending-payments/route.ts`  
**תדירות:** כל 15 דקות  
**תפקיד:** בודק תשלומים שנשארו `pending` מעל 15 דקות ומתקן אותם אוטומטית

**איך זה עובד:**
- רץ אוטומטית כל 15 דקות דרך Vercel Cron
- מוצא תשלומים תקועים
- יוצר registrations/passes
- מעדכן סטטוס ל-`completed`
- מתעד בlog: כמה תוקן, כמה נכשל

**הגדרה ב-Vercel:**
```json
{
  "crons": [
    {
      "path": "/api/cron/fix-pending-payments",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**אבטחה:** דורש `CRON_SECRET` ב-environment variables

---

### 2️⃣ **API לתיקון ידני** 🛠️

**קובץ:** `app/api/admin/fix-pending-payments/route.ts`  
**כתובת:** `GET /api/admin/fix-pending-payments`

**שימוש:**
```bash
# בדיקה בלבד (לא מתקן)
curl https://coffelandclub.co.il/api/admin/fix-pending-payments?dry_run=true

# תיקון ידני
curl https://coffelandclub.co.il/api/admin/fix-pending-payments
```

**מתי להשתמש:**
- כשצריך לבדוק מצב לפני תיקון
- כשצריך לתקן תשלומים ישנים (מעל 15 דקות)
- לבדיקות ידניות

---

### 3️⃣ **Fallback Mechanism** 🔄

**קובץ:** `app/api/payments/verify-status/route.ts`  
**תפקיד:** בודק סטטוס תשלום ישירות מ-PayPlus API

**איך זה עובד:**
1. דף ה-`payment-success` מחכה 10 שניות ל-callback
2. אם לא הגיע - קורא ל-`/api/payments/verify-status`
3. API בודק ישירות ב-PayPlus מה הסטטוס
4. אם התשלום הצליח - מתקן אוטומטית!

**שימוש:**
```javascript
POST /api/payments/verify-status
{
  "payment_id": "uuid-של-התשלום"
}
```

---

### 4️⃣ **Logging משופר** 📝

**כל ה-callbacks ו-APIs מתעדים:**
- ✅ התשלום התקבל
- 🔍 מה הסטטוס
- 🎫 האם נוצר registration/pass
- ❌ שגיאות מפורטות
- ⏰ timestamps מדויקים

**איפה לראות logs:**
- Vercel Dashboard → Deployment → Functions → Logs
- Supabase Dashboard → Logs (API)

---

## 🚀 הגדרה ב-Vercel

### 1. הוסף Environment Variables:

```bash
CRON_SECRET=your-secure-random-string-here
```

### 2. Deploy את `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fix-pending-payments",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### 3. ודא ש-PayPlus Callback URL מוגדר:

```
https://coffelandclub.co.il/api/payments/payplus/callback
```

---

## 📊 ניטור

### בדיקת Cron Job:

```bash
# בדוק אם רץ
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://coffelandclub.co.il/api/cron/fix-pending-payments
```

### בדיקת תשלומים תקועים:

```sql
-- ב-Supabase SQL Editor
SELECT 
  id, 
  user_id, 
  amount, 
  status, 
  created_at,
  metadata->>'card_type_name' as item
FROM payments
WHERE status = 'pending'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### בדיקת סטטוס עסקה:

```bash
curl -X POST https://coffelandclub.co.il/api/payments/verify-status \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "payment-uuid-here"}'
```

---

## ⚠️ אזהרות

1. **CRON_SECRET** - שמור במקום בטוח! זה מונע גישה לא מורשית
2. **PayPlus Callback URL** - ודא שמוגדר נכון ב-PayPlus Dashboard
3. **Service Role Key** - רק ב-environment variables, לעולם לא בקוד!

---

## 🎯 בעתיד

אפשר להוסיף:
- שליחת אימייל/SMS לאדמין כשיש תשלומים תקועים
- Dashboard לניטור תשלומים בזמן אמת
- התראות WhatsApp אוטומטיות
- Google Analytics events לתשלומים שתוקנו

---

## ✅ מצב עדכני

- ✅ Cron Job פעיל כל 15 דקות
- ✅ Fallback mechanism בדף התשלום
- ✅ API לתיקון ידני
- ✅ Logging מפורט
- ✅ 11 רכישות תוקנו ידנית (26/1/2026)

**התוצאה: אף לקוח לא יישאר בלי כרטיס!** 🎉
