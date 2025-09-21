# הוראות הגדרת Stripe

## 🏦 יצירת חשבון Stripe

1. **הירשמו ל-Stripe:**
   - https://dashboard.stripe.com/register
   - בחרו מדינה: Israel
   - מלאו את הפרטים

2. **עברו למצב Test:**
   - בצד השמאלי העליון תראו מתג "Test mode"
   - ודאו שהוא דלוק (כחול)

## 🔑 קבלת API Keys

### Publishable Key (ציבורי)
1. עברו ל-**Developers > API keys**
2. העתיקו את **Publishable key**
3. הוסיפו ל-`.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```

### Secret Key (סודי)
1. באותו מקום, העתיקו את **Secret key**
2. הוסיפו ל-`.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_51...
   ```

## 🪝 הגדרת Webhooks

### יצירת Webhook Endpoint
1. עברו ל-**Developers > Webhooks**
2. לחצו **Add endpoint**
3. הוסיפו URL: `https://your-domain.com/api/webhooks/stripe`
   - לפיתוח: `http://localhost:3000/api/webhooks/stripe`
4. בחרו Events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### קבלת Webhook Secret
1. לחצו על ה-webhook שיצרתם
2. לחצו **Reveal** ליד "Signing secret"
3. העתיקו את המפתח
4. הוסיפו ל-`.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_1234...
   ```

## 💳 כרטיסי בדיקה

לבדיקת תשלומים השתמשו בכרטיסים הללו:

### הצלחה
```
מספר כרטיס: 4242 4242 4242 4242
תאריך: כל תאריך עתידי (12/25)
CVC: כל 3 ספרות (123)
ZIP: כל מיקוד (12345)
```

### כרטיס נדחה
```
מספר כרטיס: 4000 0000 0000 0002
תאריך: כל תאריך עתידי
CVC: כל 3 ספרות
```

### דורש אימות 3D Secure
```
מספר כרטיס: 4000 0025 0000 3155
תאריך: כל תאריך עתידי
CVC: כל 3 ספרות
```

## 🧪 בדיקת התהליך

1. **הפעילו את השרת:**
   ```bash
   npm run dev
   ```

2. **עברו לדף הבית:** http://localhost:3000

3. **נסו להזמין משהו:**
   - לחצו על באנר חם
   - הוסיפו מוצר לעגלה  
   - עברו לתשלום

4. **השלימו תשלום עם כרטיس בדיקה**

5. **בדקו ב-Stripe Dashboard:**
   - עברו ל-**Payments**
   - תראו את התשלום החדש

## 🛠️ פתרון בעיות נפוצות

### "No such customer"
- ודאו שה-Secret Key נכון
- בדקו שאתם במצב Test

### "Invalid webhook signature"  
- ודאו שה-Webhook Secret נכון
- בדקו שה-URL של ה-webhook תואם

### "Payment requires confirmation"
- זה נורמלי עם כרטיסי 3D Secure
- המשיכו בתהליך האימות

## 🌍 הגדרות ישראל

בStripe Dashboard:
1. **Settings > Business settings**
2. **Country:** Israel
3. **Currency:** ILS (שקל)
4. **Tax settings:** לפי הצורך

זה יבטיח שהתשלומים יתבצעו בשקלים ועם המיסים הנכונים.
