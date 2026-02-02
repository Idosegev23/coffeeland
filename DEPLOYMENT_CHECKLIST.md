# 🚀 Deployment Checklist - PayPlus Sync System

## ✅ לפני ה-Deploy

### 1. משתני סביבה (Environment Variables)

וודא שכל המשתנים הבאים קיימים ב-Vercel:

```bash
# קיימים (צריך לאמת):
✅ PAYPLUS_API_KEY
✅ PAYPLUS_SECRET_KEY
✅ PAYPLUS_PAYMENT_PAGE_UID
✅ PAYPLUS_ENVIRONMENT=production

# חדשים (צריך להוסיף):
🆕 CRON_SECRET=your-random-secret-here-123456
🆕 NEXT_PUBLIC_URL=https://coffelandclub.co.il
⭐ PAYPLUS_WEBHOOK_SECRET=optional-for-hmac (אופציונלי)
```

**איך ליצור CRON_SECRET:**
```bash
# Linux/Mac:
openssl rand -base64 32

# או פשוט:
your-very-long-random-string-12345678
```

### 2. בדיקת קבצים

וודא שכל הקבצים החדשים נוספו ל-Git:

```bash
# טבלאות DB
✅ Migration applied: webhook_logs, sync_logs, alerts

# ספריות
✅ lib/rate-limiter.ts
✅ lib/payplus-sync-service.ts
✅ lib/reconciliation-service.ts

# API Routes
✅ app/api/webhooks/retry/route.ts
✅ app/api/admin/payplus/sync/route.ts
✅ app/api/admin/webhooks/logs/route.ts
✅ app/api/admin/alerts/route.ts
✅ app/api/admin/health/route.ts
✅ app/api/admin/reconciliation/route.ts

# Dashboard
✅ app/admin/payplus-monitor/page.tsx

# Cron Jobs
✅ vercel.json (עודכן)
✅ app/api/cron/fix-pending-payments/route.ts (שופר)

# Documentation
✅ PAYPLUS_SYNC_SYSTEM.md
✅ DEPLOYMENT_CHECKLIST.md
```

### 3. Vercel Cron Configuration

וודא שה-Cron Jobs מוגדרים ב-`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fix-pending-payments",
      "schedule": "*/15 * * * *"  // כל 15 דקות
    },
    {
      "path": "/api/webhooks/retry",
      "schedule": "*/5 * * * *"   // כל 5 דקות
    },
    {
      "path": "/api/admin/reconciliation",
      "schedule": "0 2 * * *"      // כל יום ב-2:00
    }
  ]
}
```

---

## 🔄 תהליך ה-Deploy

### שלב 1: Commit & Push

```bash
git add .
git commit -m "feat: PayPlus Full Sync System 🚀

- Enhanced webhook handler with idempotency
- Retry logic with exponential backoff
- Rate limiter for PayPlus API
- Sync service for bulk status checking
- Admin monitoring dashboard
- Alert system
- Health checks
- Reconciliation reports
- 3 automated cron jobs"

git push origin main
```

### שלב 2: Deploy ב-Vercel

1. Vercel תעשה deploy אוטומטי
2. חכה להשלמת הבנייה (Build)
3. בדוק שאין שגיאות בbuild logs

### שלב 3: הוספת Environment Variables

אם טרם הוספת, עכשיו הזמן:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. הוסף:
   ```
   CRON_SECRET = your-random-secret
   NEXT_PUBLIC_URL = https://coffelandclub.co.il
   ```
3. לחץ "Save"
4. **Redeploy!** (Deployments → 3 נקודות → Redeploy)

---

## ✅ אחרי ה-Deploy - בדיקות

### 1. בדיקת Health Check

```bash
curl https://coffelandclub.co.il/api/admin/health
```

**תשובה צפויה:**
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

### 2. בדיקת Webhook Endpoint

```bash
curl https://coffelandclub.co.il/api/payments/payplus/callback
```

**תשובה צפויה:**
```json
{
  "status": "ok",
  "endpoint": "PayPlus Callback",
  "message": "Endpoint is ready to receive webhooks"
}
```

### 3. גישה לדשבורד

פתח בדפדפן:
```
https://coffelandclub.co.il/admin/payplus-monitor
```

צריך לראות:
- ✅ תשלומים ממתינים
- ✅ התראות פעילות
- ✅ Webhooks אחרונים
- ✅ סנכרונים אחרונים

### 4. בדיקת Cron Jobs

ב-Vercel Dashboard:
1. Project → Settings → Cron Jobs
2. וודא שרואה 3 cron jobs
3. בדוק שהם "Active"

### 5. בדיקת Logs

ב-Vercel Dashboard → Logs:
- חפש `[CRON]` - תראה הרצות cron
- חפש `[SYNC-SERVICE]` - תראה סנכרונים
- חפש `[WEBHOOK-RETRY]` - תראה retry attempts

---

## 🔧 הגדרת PayPlus Dashboard

### Callback URL

וודא שבפאנל PayPlus ה-Callback URL מוגדר ל:
```
https://coffelandclub.co.il/api/payments/payplus/callback
```

**איפה למצוא:**
PayPlus Dashboard → Settings → IPN/Callback Settings

---

## 🧪 בדיקת המערכת

### Test 1: תשלום חדש

1. צור תשלום חדש (הצגה/כרטיסייה)
2. שלם דרך PayPlus
3. בדוק ש:
   - ✅ Payment עבר ל-`completed`
   - ✅ נוצרה registration/pass
   - ✅ נוצרה רשומה ב-`webhook_logs` עם `status=completed`

### Test 2: Webhook Retry

1. כבה את השרת זמנית (או סמלץ כשלון)
2. שלח webhook
3. בדוק שנוצרה רשומה ב-`webhook_logs` עם `status=failed`
4. חכה 5 דקות
5. ה-Cron Job אמור לנסות שוב
6. בדוק ב-`webhook_logs` שה-`retry_count` עלה

### Test 3: סנכרון ידני

1. היכנס ל-`/admin/payplus-monitor`
2. לחץ "🔄 סנכרון ידני"
3. בדוק שמופיע הודעת הצלחה
4. רענן את הדף - אמור לראות עדכון בסטטיסטיקות

### Test 4: Health Check

```bash
curl https://coffelandclub.co.il/api/admin/health | jq
```

כל המערכות צריכות להיות `"status": "healthy"`

---

## 🚨 מה לעשות אם משהו לא עובד?

### בעיה 1: Cron Jobs לא רצים

**פתרון:**
1. Vercel Dashboard → Cron Jobs
2. וודא שהם Active
3. בדוק שיש `CRON_SECRET` במשתני סביבה
4. Redeploy

### בעיה 2: Webhooks נכשלים

**פתרון:**
1. בדוק `/api/admin/webhooks/logs`
2. חפש את השגיאה ב-`error_message`
3. בדוק שהCallback URL בPayPlus נכון
4. בדוק Vercel Logs

### בעיה 3: Dashboard לא טוען

**פתרון:**
1. בדוק Console בדפדפן
2. בדוק שיש RLS policies (הרצנו migration)
3. בדוק שהמשתמש הוא אדמין
4. נסה Incognito/Private mode

### בעיה 4: Rate Limiter חוסם

**פתרון:**
זמני - זה בסדר! הRate Limiter ימתין אוטומטית.
אם זה קורה הרבה - הגדל את המגבלות ב-`lib/rate-limiter.ts`

---

## 📊 מעקב אחרי המערכת

### יומי:
- ✅ בדוק את הדשבורד - `/admin/payplus-monitor`
- ✅ בדוק התראות פעילות
- ✅ וודא שאין תשלומים תקועים

### שבועי:
- ✅ הרץ Reconciliation Report ידני
- ✅ בדוק Health Check
- ✅ סקור Vercel Logs

### חודשי:
- ✅ בדוק Rate Limiter statistics
- ✅ נקה webhook_logs ישנים (אופציונלי)
- ✅ עדכן documentation אם צריך

---

## ✅ Checklist סופי

לפני ש"מכריזים" שהמערכת live:

- [ ] כל משתני הסביבה מוגדרים
- [ ] Deploy הושלם בהצלחה
- [ ] Health Check מחזיר "healthy"
- [ ] Webhook endpoint עובד
- [ ] Cron Jobs פעילים בVercel
- [ ] Dashboard נגיש ועובד
- [ ] PayPlus Callback URL מוגדר
- [ ] בדיקת תשלום אמיתי עברה
- [ ] Documentation מעודכן

---

## 🎉 סיימת!

המערכת מוכנה לפרודקשן! 🚀

כל שאלה? קרא את `PAYPLUS_SYNC_SYSTEM.md`
