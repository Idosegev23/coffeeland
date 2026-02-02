# מערכת סנכרון מלאה PayPlus ↔ מסד נתונים 🚀

## סקירה כללית

מערכת מקיפה לסנכרון אוטומטי ואמין בין PayPlus למסד הנתונים, עם 3 שכבות הגנה:

### 🎯 Real-time Layer - זמן אמת
- **Webhook Handler משופר** עם idempotency ו-signature verification
- **Callback Queue** עם retry logic ו-exponential backoff
- **Rate Limiter** למניעת חריגה ממגבלות API

### 🔄 Background Layer - רקע
- **Sync Service** לסנכרון מאסיבי של תשלומים
- **Cron Jobs** אוטומטיים (3 סוגים)
- **Full Import** לייבוא כל העסקאות

### 📊 Monitoring Layer - ניטור
- **Dashboard אדמין** מפורט
- **מערכת התראות** אוטומטית
- **Health Checks** לבדיקת תקינות
- **Reconciliation Reports** לזיהוי אי התאמות

---

## 📁 קבצים חדשים שנוצרו

### 1. טבלאות מסד נתונים (Migration)
```sql
- webhook_logs      -- עקיבה אחר כל webhook
- sync_logs         -- תיעוד תהליכי סנכרון
- alerts            -- התראות אוטומטיות
```

### 2. ספריות ושירותים
```
lib/
├── rate-limiter.ts              -- Rate limiting לPayPlus API
├── payplus-sync-service.ts      -- סנכרון מאסיבי
└── reconciliation-service.ts    -- דוחות התאמה
```

### 3. API Endpoints
```
app/api/
├── webhooks/retry/route.ts                  -- retry כושלים
├── admin/
│   ├── payplus/sync/route.ts               -- סנכרון ידני
│   ├── webhooks/logs/route.ts              -- webhook logs
│   ├── alerts/route.ts                     -- התראות
│   ├── health/route.ts                     -- בדיקת תקינות
│   └── reconciliation/route.ts             -- דוחות התאמה
└── cron/
    └── fix-pending-payments/route.ts       -- Cron משופר
```

### 4. דשבורד אדמין
```
app/admin/
└── payplus-monitor/page.tsx                 -- דשבורד ניטור
```

---

## 🎬 שימוש במערכת

### 1. גישה לדשבורד הניטור

```
https://coffelandclub.co.il/admin/payplus-monitor
```

**מה תראה בדשבורד:**
- ✅ תשלומים ממתינים (Pending)
- 🚨 התראות פעילות
- 📝 Webhooks אחרונים
- 📊 סנכרונים אחרונים
- 🔄 כפתור לסנכרון ידני

### 2. סנכרון ידני

**דרך הדשבורד:**
לחץ על כפתור "🔄 סנכרון ידני"

**דרך API:**
```bash
curl -X POST https://coffelandclub.co.il/api/admin/payplus/sync \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sync_pending",
    "maxAge": 72,
    "limit": 50
  }'
```

### 3. בדיקת תקינות המערכת

```bash
curl https://coffelandclub.co.il/api/admin/health
```

**תשובה לדוגמה:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "payplus_api": { "status": "healthy" },
    "webhook_endpoint": { "status": "healthy" },
    "rate_limiter": { "status": "healthy" }
  }
}
```

### 4. הרצת דוח התאמה

```bash
curl -X POST https://coffelandclub.co.il/api/admin/reconciliation
```

---

## ⏰ Cron Jobs אוטומטיים

### 1. Fix Pending Payments (כל 15 דקות)
```
Schedule: */15 * * * *
Path: /api/cron/fix-pending-payments
```
- בודק תשלומים pending מול PayPlus API
- מתקן אוטומטית תשלומים שהושלמו
- יוצר registrations/passes חסרים

### 2. Webhook Retry (כל 5 דקות)
```
Schedule: */5 * * * *
Path: /api/webhooks/retry
```
- מנסה שוב webhooks שנכשלו
- Exponential backoff: 1min → 5min → 15min → 1h → 6h → 24h
- מוותר אחרי 10 ניסיונות ושולח alert

### 3. Reconciliation (כל יום ב-2:00)
```
Schedule: 0 2 * * *
Path: /api/admin/reconciliation
```
- בודק התאמה בין תשלומים לregistrations
- מזהה תשלומים תקועים
- יוצר alerts על בעיות קריטיות

---

## 🔐 אבטחה ו-Idempotency

### Webhook Idempotency
כל webhook מקבל `idempotency_key` ייחודי:
```
{transaction_uid}-{page_request_uid}-{status_code}
```

אם webhook מגיע פעמיים:
- ✅ הפעם הראשונה - מעובד
- ⏭️ הפעם השנייה - מדולג (מחזיר "already_processed")

### Signature Verification
הwebhook handler בודק:
- ✅ שדות חובה קיימים
- ✅ תקינות status_code
- ✅ תקינות transaction_uid
- 🔜 HMAC signature (אופציונלי - דורש PAYPLUS_WEBHOOK_SECRET)

---

## 📈 Rate Limiting

**מגבלות ברירת מחדל:**
- 50 קריאות לדקה
- 500 קריאות לשעה
- 5000 קריאות ליום

**בדיקת סטטוס Rate Limiter:**
```javascript
import { getRateLimitStats } from '@/lib/rate-limiter';

const stats = getRateLimitStats();
console.log(stats);
// {
//   last_minute: 5,
//   last_hour: 42,
//   last_day: 312,
//   availability: {
//     can_make_request: true,
//     slots_remaining_minute: 45
//   }
// }
```

---

## 🚨 מערכת התראות

### סוגי התראות
1. **payment_stuck** - תשלום תקוע מעל 24 שעות
2. **webhook_failed** - webhook נכשל אחרי מספר ניסיונות
3. **sync_failed** - סנכרון נכשל עם אחוז גבוה
4. **mismatch_detected** - זוהה אי התאמה בין PayPlus למסד הנתונים

### רמות חומרה
- 🔵 **info** - מידע בלבד
- 🟡 **warning** - אזהרה
- 🟠 **error** - שגיאה
- 🔴 **critical** - קריטי

### צפייה בהתראות
- דרך הדשבורד: `/admin/payplus-monitor` → טאב "התראות"
- דרך API: `GET /api/admin/alerts?status=active`

---

## 🔍 Logging ו-Debugging

### 1. Webhook Logs
```sql
SELECT * FROM webhook_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Sync Logs
```sql
SELECT 
  sync_type,
  total_checked,
  total_updated,
  total_failed,
  duration_ms,
  created_at
FROM sync_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. Vercel Logs
חפש ב-Vercel Dashboard:
- `[SYNC-SERVICE]` - תהליכי סנכרון
- `[WEBHOOK-RETRY]` - retry של webhooks
- `[CRON]` - הרצות Cron
- `[RECONCILIATION]` - דוחות התאמה

---

## 🛠️ פתרון בעיות נפוצות

### בעיה: תשלומים נשארים Pending

**פתרונות:**
1. בדוק Health Check: `/api/admin/health`
2. הרץ סנכרון ידני דרך הדשבורד
3. בדוק Webhook logs: האם callbacks מגיעים?
4. בדוק PayPlus dashboard - הcallback URL נכון?

### בעיה: Webhook נכשל

**מה קורה:**
1. Webhook מתועד ב-`webhook_logs` עם `status='failed'`
2. הCron Job של retry ינסה שוב אוטומטית
3. אחרי 10 ניסיונות - נשלח alert קריטי

**לבדיקה:**
```sql
SELECT * FROM webhook_logs 
WHERE status = 'failed' 
AND retry_count < 10;
```

### בעיה: Rate Limit חריגה

**תסמינים:**
- שגיאת "Rate limit exceeded" בlogs
- PayPlus API מחזיר 429

**פתרון:**
- הRate Limiter ימתין אוטומטית
- אפשר להגדיל מגבלות ב-`lib/rate-limiter.ts`

---

## 📊 סטטיסטיקות ודשבורדים

### Dashboard Headers
- 🔢 **תשלומים ממתינים** - כמה payments במצב pending
- 🚨 **התראות פעילות** - alerts שטרם טופלו
- 📝 **סנכרונים אחרונים** - 10 הרצות אחרונות

### טאבים בדשבורד
1. **התראות** - כל ההתראות הפעילות
2. **Webhooks** - 20 webhooks אחרונים
3. **סנכרונים** - היסטוריית סנכרונים

---

## 🔄 תהליך סנכרון מלא (Flow Diagram)

```
תשלום בPayPlus
    ↓
Callback → Webhook Handler
    ↓
Idempotency Check → כבר עובד? → סיום
    ↓ לא
Signature Verify → תקין? → כן
    ↓
webhook_logs (processing)
    ↓
עדכון payments → completed
    ↓
יצירת registration/pass
    ↓
webhook_logs (completed)
    ↓
✅ הצלחה!

נכשל? ↓
webhook_logs (failed) → retry_count++
    ↓
Webhook Retry Cron (כל 5 דק')
    ↓
ניסיון נוסף (exponential backoff)
    ↓
10 ניסיונות? → Alert קריטי
```

---

## 🎓 Best Practices

1. **עקוב אחר ההתראות** - פתח את הדשבורד פעם ביום
2. **הרץ Reconciliation שבועי** - בנוסף לאוטומטי היומי
3. **בדוק Health Check** לפני כל deploy
4. **שמור את הלוגים** - ב-Vercel Logs לפחות 7 ימים
5. **תעדכן את PAYPLUS_WEBHOOK_SECRET** כשזמין

---

## 📞 תמיכה

אם יש בעיות:
1. בדוק את הדשבורד - `/admin/payplus-monitor`
2. הרץ Health Check - `/api/admin/health`
3. צפה בהתראות פעילות
4. בדוק Vercel Logs
5. הרץ Reconciliation Report

---

## ✅ סיכום מה נבנה

✨ **11 תכונות מרכזיות:**
1. ✅ Webhook Handler משופר עם idempotency
2. ✅ Callback Queue עם retry logic
3. ✅ 3 טבלאות חדשות (webhook_logs, sync_logs, alerts)
4. ✅ Rate Limiter לPayPlus API
5. ✅ Sync Service לסנכרון מאסיבי
6. ✅ Full Import/Sync Endpoint
7. ✅ Cron Job משופר
8. ✅ Dashboard אדמין מפורט
9. ✅ מערכת התראות אוטומטית
10. ✅ Health Checks
11. ✅ Reconciliation Reports

🎉 **המערכת מוכנה לשימוש!**
