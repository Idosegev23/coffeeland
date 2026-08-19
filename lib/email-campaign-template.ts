// תבנית מייל הקמפיין — "נכנסים עם הנייד" + קופונים
// שתי גרסאות: hasPhone (יש נייד במערכת) / noPhone (צריך לחבר נייד)

const C = {
  brown: '#4C2C21',
  brownMid: '#8D5A40',
  cream: '#E8DED1',
  creamLight: '#F9F7F3',
  olive: '#5F614C',
  ink: '#2A1C15',
};

const LOGO = 'https://www.coffelandclub.co.il/email-logo.png';
const LOGIN_URL = 'https://www.coffelandclub.co.il/login';
const SITE_URL = 'https://www.coffelandclub.co.il';

function couponChip(code: string, title: string, sub: string) {
  return `
  <td width="49%" style="padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed ${C.brownMid}; border-radius:16px 16px 16px 0; background:#ffffff;">
      <tr><td align="center" style="padding:18px 10px 4px;">
        <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:${C.olive}; font-weight:bold;">${title}</div>
      </td></tr>
      <tr><td align="center" style="padding:2px 10px;">
        <div style="font-family:'Courier New',monospace; font-size:26px; letter-spacing:2px; color:${C.brown}; font-weight:bold;" dir="ltr">${code}</div>
      </td></tr>
      <tr><td align="center" style="padding:2px 10px 16px;">
        <div style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:${C.ink}; opacity:.75;">${sub}</div>
      </td></tr>
    </table>
  </td>`;
}

function step(num: number, emoji: string, text: string) {
  return `
  <tr>
    <td style="padding:7px 0; vertical-align:top;" width="44">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td align="center" style="width:34px; height:34px; background:${C.cream}; border-radius:50%; font-size:16px;">${emoji}</td>
      </tr></table>
    </td>
    <td style="padding:10px 12px 7px 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; color:${C.ink}; line-height:1.5;">${text}</td>
  </tr>`;
}

export function buildEmail({ noPhone }: { noPhone: boolean }) {
  const noPhoneBlock = noPhone ? `
  <tr><td style="padding:0 28px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF3E4; border-right:4px solid ${C.brownMid}; border-radius:12px 12px 12px 0;">
      <tr><td style="padding:18px 20px;">
        <div style="font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:bold; color:${C.brown}; margin-bottom:8px;">📌 רגע — אין לנו את מספר הנייד שלך!</div>
        <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${C.ink}; line-height:1.7;">
          נרשמת אצלנו עם אימייל בלבד, אז נשאר צעד אחד קטן:<br>
          בכניסה הבאה הזינו את המספר שלכם, בחרו <b>"נרשמתי בעבר עם אימייל"</b>, והזינו את הכתובת שאליה הגיע המייל הזה — המספר יתחבר לחשבון <b>בפעם אחת</b>, ומשם נכנסים תמיד עם הנייד בלבד.
        </div>
      </td></tr>
    </table>
  </td></tr>` : '';

  const introLine = noPhone
    ? 'שדרגנו את הכניסה לאיזור האישי: בלי סיסמאות, בלי לינקים במייל — פשוט מספר הנייד, וזהו.'
    : 'שדרגנו את הכניסה לאיזור האישי: בלי סיסמאות, בלי לינקים במייל — מזינים את מספר הנייד, ואתם בפנים.';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:${C.cream};">
  <div style="display:none; max-height:0; overflow:hidden;">מהיום נכנסים לקופילנד עם מספר הנייד בלבד — ויש גם מתנה בפנים 🎁</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

        <!-- masthead -->
        <tr><td align="center" style="background:${C.creamLight}; border-radius:24px 24px 0 0; padding:30px 20px 18px;">
          <img src="${LOGO}" width="200" alt="CoffeeLand" style="display:block; border:0; max-width:200px;">
        </td></tr>

        <!-- hero -->
        <tr><td align="center" style="background:${C.creamLight}; padding:6px 28px 4px;">
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:30px; line-height:1.3; color:${C.brown}; font-weight:bold;">
            נכנסים עם הנייד.<br>זהו, באמת רק זה. 📱
          </div>
        </td></tr>
        <tr><td align="center" style="background:${C.creamLight}; padding:12px 40px 22px;">
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:16px; color:${C.ink}; line-height:1.7;">
            ${introLine}
          </div>
        </td></tr>

        ${noPhone ? `<tr><td style="background:${C.creamLight};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${noPhoneBlock.replace('<tr><td style="padding:0 28px 8px;">', '<tr><td style="padding:0 28px 18px;">')}</table>
        </td></tr>` : ''}

        <!-- steps -->
        <tr><td style="background:${C.creamLight}; padding:0 40px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${step(1, '📱', '<b>נכנסים לאתר</b> ולוחצים על "התחברות"')}
            ${step(2, '🔢', '<b>מזינים את מספר הנייד</b> — בלי סיסמה ובלי אימות')}
            ${step(3, '🎟️', '<b>וזהו!</b> הכרטיסיות, הכניסות וההזמנות — הכל שם')}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td align="center" style="background:${C.creamLight}; padding:18px 28px 30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td align="center" style="background:${C.olive}; border-radius:16px 16px 16px 0;">
              <a href="${LOGIN_URL}" style="display:inline-block; padding:15px 44px; font-family:Arial,Helvetica,sans-serif; font-size:17px; font-weight:bold; color:${C.creamLight}; text-decoration:none;">
                לכניסה לאיזור האישי ←
              </a>
            </td>
          </tr></table>
        </td></tr>

        <!-- gift band -->
        <tr><td align="center" style="background:${C.brown}; padding:26px 28px 8px;">
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:22px; color:${C.creamLight}; font-weight:bold;">🎁 ולרגל השדרוג — מתנה</div>
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${C.cream}; padding-top:6px;">מזינים את הקוד בעמוד התשלום · בתוקף עד 18.9</div>
        </td></tr>
        <tr><td style="background:${C.brown}; padding:16px 28px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            ${couponChip('NAYAD20', '20% הנחה', 'על כניסה חד־פעמית למשחקייה')}
            <td width="2%">&nbsp;</td>
            ${couponChip('NAYAD10', '10% הנחה', 'על כרטיסייה מרובת כניסות')}
          </tr></table>
        </td></tr>

        <!-- footer -->
        <tr><td align="center" style="background:${C.creamLight}; border-radius:0 0 0 24px; padding:22px 28px 26px;">
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; color:${C.ink}; opacity:.8; line-height:1.8;">
            נתראה במשחקייה! ☕🐆<br>
            <a href="${SITE_URL}" style="color:${C.olive}; font-weight:bold; text-decoration:none;">coffelandclub.co.il</a>
          </div>
          <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; color:${C.ink}; opacity:.5; padding-top:10px;">
            קיבלת מייל זה כי נרשמת לאתר קופילנד
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

