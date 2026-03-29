/**
 * Simple in-memory rate limiter for auth endpoints
 * Limits by IP address to prevent abuse
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

const AUTH_RATE_LIMIT = {
  maxAttempts: 5,      // max 5 attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
};

export function checkAuthRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  // Clean expired entry
  if (entry && now > entry.resetAt) {
    attempts.delete(ip);
  }

  const current = attempts.get(ip);

  if (!current) {
    attempts.set(ip, { count: 1, resetAt: now + AUTH_RATE_LIMIT.windowMs });
    return { allowed: true, remaining: AUTH_RATE_LIMIT.maxAttempts - 1, resetIn: AUTH_RATE_LIMIT.windowMs };
  }

  if (current.count >= AUTH_RATE_LIMIT.maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: current.resetAt - now };
  }

  current.count++;
  return { allowed: true, remaining: AUTH_RATE_LIMIT.maxAttempts - current.count, resetIn: current.resetAt - now };
}

// Clean up old entries periodically (every 30 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of attempts.entries()) {
      if (now > entry.resetAt) attempts.delete(ip);
    }
  }, 30 * 60 * 1000);
}
