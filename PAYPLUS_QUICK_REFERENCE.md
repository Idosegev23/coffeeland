# PayPlus Sync - מדריך מהיר ⚡

## 🎯 לשימוש יומיומי

### דשבורד הניטור
```
👉 https://coffelandclub.co.il/admin/payplus-monitor
```

### מה תראה בדשבורד?
- 📊 **תשלומים ממתינים** - צריך להיות 0 או מספר נמוך
- 🚨 **התראות פעילות** - בדוק אם יש משהו דורש טיפול
- 📝 **Webhooks אחרונים** - האם יש כשלונות?
- 🔄 **סנכרונים אחרונים** - מתי רץ הסנכרון האחרון?

---

## 🚨 מצבי חירום - פתרון מהיר

### תשלום לא התקבל (הלקוח שילם אבל אין כרטיס)

**פתרון מהיר:**
1. היכנס לדשבורד: `/admin/payplus-monitor`
2. לחץ "🔄 סנכרון ידני"
3. חכה 30 שניות
4. רענן את הדף
5. בדוק שהתשלום עבר ל-"completed"

**אם זה לא עזר:**
1. לך ל-`/admin/refunds`
2. חפש את התשלום
3. בדוק בPayPlus האם התשלום אכן עבר
4. אם כן - צור registration ידנית (בקרוב נוסיף כפתור לזה)

### הרבה התראות אדומות

**פתרון:**
1. קרא את ההתראות - מה הבעיה?
2. אם זה "payment_stuck" - הרץ סנכרון ידני
3. אם זה "webhook_failed" - בדוק שהCallback URL בPayPlus תקין
4. אם זה "sync_failed" - בדוק בVercel Logs מה השגיאה

---

## 📞 API Endpoints מהירים

### בדיקת תקינות
```bash
curl https://coffelandclub.co.il/api/admin/health
```

### סנכרון ידני
```bash
curl -X POST https://coffelandclub.co.il/api/admin/payplus/sync \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_pending","maxAge":72,"limit":50}'
```

### דוח התאמה
```bash
curl -X POST https://coffelandclub.co.il/api/admin/reconciliation
```

---

## 🔍 איפה לחפש מידע?

### בעיה: הלקוח שילם אבל אין לו כרטיס

**1. בדוק בדשבורד התשלומים:**
```
/admin/customers → חפש לפי שם/אימייל
```

**2. בדוק ב-webhook logs:**
```
/admin/payplus-monitor → טאב "Webhooks"
```
חפש webhooks כושלים עם השם/אימייל

**3. בדוק בPayPlus Dashboard:**
- האם התשלום אכן עבר?
- מה ה-transaction_uid?

**4. חפש בDB:**
```sql
SELECT * FROM payments 
WHERE email = 'customer@example.com' 
ORDER BY created_at DESC;
```

### בעיה: Cron Job לא רץ

**1. בדוק בVercel:**
```
Vercel → Project → Settings → Cron Jobs
```
וודא שהם "Active"

**2. בדוק Logs:**
```
Vercel → Logs → סנן לפי "[CRON]"
```

**3. הרץ ידנית:**
```bash
curl -X POST https://coffelandclub.co.il/api/cron/fix-pending-payments \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 💡 טיפים

### טיפ 1: רענן את הדשבורד
הדשבורד מתרענן אוטומטית כל 30 שניות, אבל אפשר גם ללחוץ F5

### טיפ 2: השתמש ב-Health Check
לפני שמתקשרים לתמיכה, הרץ health check ותצלם את התוצאה

### טיפ 3: התראות זה טוב!
התראות אומרות שהמערכת עובדת ומזהה בעיות. אל תתעלם מהן

### טיפ 4: Webhook Retry אוטומטי
אם webhook נכשל - אין בעיה! הוא ינסה שוב אוטומטית עד 10 פעמים

---

## 🎯 תזרים עבודה רגיל

### כל בוקר (2 דקות):
1. פתח דשבורד: `/admin/payplus-monitor`
2. בדוק שאין התראות קריטיות (אדומות)
3. בדוק ש"תשלומים ממתינים" הוא מספר נמוך (<5)

### אחת לשבוע (5 דקות):
1. הרץ דוח התאמה: POST `/api/admin/reconciliation`
2. בדוק את התוצאות
3. אם יש בעיות - הרץ סנכרון ידני

### אחת לחודש (10 דקות):
1. סקור את הלוגים בVercel
2. בדוק Rate Limiter statistics
3. עדכן documentation אם צריך

---

## ⚠️ מה לא לעשות

❌ אל תבטל webhooks בPayPlus
❌ אל תשנה את ה-Callback URL בלי לעדכן בקוד
❌ אל תמחק רשומות מ-webhook_logs (זה היסטוריה חשובה)
❌ אל תריץ סנכרון ידני 10 פעמים ברציפות (Rate Limiter יחסום)

---

## ✅ שאלות נפוצות

**ש: כמה זמן לוקח ל-webhook להגיע?**
ת: בדרך כלל מיידי (1-2 שניות). אם לא הגיע אחרי 5 דקות - הRetry יטפל

**ש: מה זה "pending" payment?**
ת: תשלום שעדיין לא אושר על ידי PayPlus (או שהwebhook לא הגיע)

**ש: כמה תשלומים pending זה תקין?**
ת: 0-5 זה נורמלי. מעל 10 - כדאי לבדוק

**ש: מה זה Rate Limiter?**
ת: מנגנון שמונע קריאות מרובות מדי ל-PayPlus API (הגנה מפני חסימה)

**ש: האם אפשר לכבות את הCron Jobs?**
ת: כן, אבל לא מומלץ! הם חלק קריטי מהמערכת

---

## 📱 אנשי קשר חירום

**בעיה טכנית:**
- בדוק `PAYPLUS_SYNC_SYSTEM.md`
- בדוק Vercel Logs
- הרץ Health Check

**בעיה בתשלום:**
- בדוק PayPlus Dashboard
- בדוק בדשבורד שלנו
- הרץ סנכרון ידני

---

זכור: המערכת פועלת 24/7 ומטפלת אוטומטית ברוב הבעיות! 🚀
