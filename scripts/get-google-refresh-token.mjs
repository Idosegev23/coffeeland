#!/usr/bin/env node
/**
 * סקריפט חד-פעמי להפקת Google Calendar Refresh Token
 * 
 * הרצה:
 * node scripts/get-google-refresh-token.mjs
 * 
 * הסקריפט יפתח דפדפן, תאשר הרשאות, ותקבל refresh token להעתיק ל-.env.local
 */

import express from 'express';
import open from 'open';
import { google } from 'googleapis';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_SECRET_KEY;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

// ה-scope המינימלי ליצירה ועריכה של אירועים
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ חסרים Client ID או Secret Key ב-.env.local');
    console.error('ודא שהגדרת:');
    console.error('  NEXT_PUBLIC_GOOGLE_CLIENT_ID=...');
    console.error('  NEXT_PUBLIC_GOOGLE_SECRET_KEY=...');
    process.exit(1);
  }

  const app = express();
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });

  console.log('\n🔐 מפיק Refresh Token ל-Google Calendar...\n');
  console.log('📌 פותח דפדפן לאישור הרשאות...');
  console.log('אם הדפדפן לא נפתח, העתק את הקישור הזה:\n');
  console.log(authUrl);
  console.log('\n');

  await open(authUrl);

  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
      res.send('❌ לא התקבל קוד אישור. סגור את החלון ונסה שוב.');
      server.close();
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(String(code));
      
      console.log('\n✅ הצלחה! העתק את הערכים האלה ל-.env.local שלך:\n');
      console.log('─────────────────────────────────────────────────────');
      console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
      if (tokens.access_token) {
        console.log(`GOOGLE_ACCESS_TOKEN="${tokens.access_token}" # (אופציונלי)`);
      }
      console.log('─────────────────────────────────────────────────────\n');
      console.log('💡 עכשיו הוסף גם:');
      console.log('GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com');
      console.log('GOOGLE_TIMEZONE=Asia/Jerusalem\n');
      
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <title>הצלחה! ✅</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              padding: 40px; 
              max-width: 600px; 
              margin: 0 auto;
              text-align: center;
            }
            .success { 
              background: #d4edda; 
              color: #155724; 
              padding: 20px; 
              border-radius: 8px;
              margin-bottom: 20px;
            }
            code { 
              background: #f5f5f5; 
              padding: 2px 6px; 
              border-radius: 3px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ הצלחה!</h1>
            <p>Refresh Token נוצר בהצלחה</p>
          </div>
          <p>חזור לטרמינל והעתק את ה-<code>GOOGLE_REFRESH_TOKEN</code> ל-.env.local</p>
          <p style="color: #666; margin-top: 30px;">אפשר לסגור את החלון הזה</p>
        </body>
        </html>
      `);
      
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 2000);
    } catch (error) {
      console.error('❌ שגיאה בקבלת Tokens:', error.message);
      res.send('❌ שגיאה. בדוק את הקונסול.');
      server.close();
    }
  });

  const server = app.listen(3000, () => {
    console.log('🔊 מאזין ב-http://localhost:3000\n');
  });
}

main().catch(console.error);

