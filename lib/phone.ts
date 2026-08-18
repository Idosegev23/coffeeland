/**
 * נרמול מספרי טלפון ישראליים — משמש גם בצד לקוח וגם בצד שרת,
 * ותואם את public.normalize_phone ב-DB.
 */

export function normalizePhone(input: string): string {
  let digits = (input || '').replace(/\D/g, '');
  if (digits.startsWith('972')) {
    digits = '0' + digits.slice(3);
  }
  return digits;
}

export function isValidIsraeliMobile(input: string): boolean {
  return /^05\d{8}$/.test(normalizePhone(input));
}

export function maskEmail(email: string): string {
  const [local, domain] = (email || '').split('@');
  if (!local || !domain) return '';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}
