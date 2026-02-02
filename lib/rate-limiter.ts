/**
 * Rate Limiter for PayPlus API Calls
 * 
 * מגן מפני חריגה ממגבלות API של PayPlus
 * בברירת מחדל: 100 קריאות לדקה, 1000 ליום
 */

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
}

interface RequestLog {
  timestamp: number;
  endpoint: string;
}

class RateLimiter {
  private requests: RequestLog[] = [];
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxRequestsPerMinute: config?.maxRequestsPerMinute || 50,  // זהיר - 50 לדקה
      maxRequestsPerHour: config?.maxRequestsPerHour || 500,     // 500 לשעה
      maxRequestsPerDay: config?.maxRequestsPerDay || 5000       // 5000 ליום
    };
  }

  /**
   * בדיקה האם ניתן לבצע קריאה נוספת
   */
  canMakeRequest(): boolean {
    this.cleanOldRequests();

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const requestsLastMinute = this.requests.filter(r => r.timestamp > oneMinuteAgo).length;
    const requestsLastHour = this.requests.filter(r => r.timestamp > oneHourAgo).length;
    const requestsLastDay = this.requests.filter(r => r.timestamp > oneDayAgo).length;

    // בדיקה מול כל המגבלות
    if (requestsLastMinute >= this.config.maxRequestsPerMinute) {
      console.warn(`⚠️ Rate limit exceeded: ${requestsLastMinute}/${this.config.maxRequestsPerMinute} requests per minute`);
      return false;
    }

    if (requestsLastHour >= this.config.maxRequestsPerHour) {
      console.warn(`⚠️ Rate limit exceeded: ${requestsLastHour}/${this.config.maxRequestsPerHour} requests per hour`);
      return false;
    }

    if (requestsLastDay >= this.config.maxRequestsPerDay) {
      console.warn(`⚠️ Rate limit exceeded: ${requestsLastDay}/${this.config.maxRequestsPerDay} requests per day`);
      return false;
    }

    return true;
  }

  /**
   * רישום קריאה חדשה
   */
  recordRequest(endpoint: string = 'unknown'): void {
    this.requests.push({
      timestamp: Date.now(),
      endpoint
    });

    console.log(`📊 PayPlus API call recorded: ${endpoint} (Total today: ${this.getTodayCount()})`);
  }

  /**
   * המתנה עד שניתן יהיה לבצע קריאה
   */
  async waitForSlot(): Promise<void> {
    const maxWaitTime = 60000; // דקה מקסימום
    const checkInterval = 100; // בדוק כל 100ms
    let waited = 0;

    while (!this.canMakeRequest() && waited < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    if (waited >= maxWaitTime) {
      throw new Error('Rate limit timeout: waited too long for available slot');
    }

    if (waited > 0) {
      console.log(`⏱️ Rate limiter waited ${waited}ms for available slot`);
    }
  }

  /**
   * ביצוע קריאה עם rate limiting אוטומטי
   */
  async execute<T>(
    fn: () => Promise<T>,
    endpoint: string = 'unknown'
  ): Promise<T> {
    await this.waitForSlot();
    this.recordRequest(endpoint);

    try {
      return await fn();
    } catch (error) {
      console.error(`❌ Rate-limited request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * ניקוי בקשות ישנות (מעל 24 שעות)
   */
  private cleanOldRequests(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.requests = this.requests.filter(r => r.timestamp > oneDayAgo);
  }

  /**
   * קבלת מספר הקריאות היום
   */
  getTodayCount(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return this.requests.filter(r => r.timestamp > oneDayAgo).length;
  }

  /**
   * קבלת סטטיסטיקות
   */
  getStats() {
    this.cleanOldRequests();

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return {
      last_minute: this.requests.filter(r => r.timestamp > oneMinuteAgo).length,
      last_hour: this.requests.filter(r => r.timestamp > oneHourAgo).length,
      last_day: this.requests.filter(r => r.timestamp > oneDayAgo).length,
      limits: {
        per_minute: this.config.maxRequestsPerMinute,
        per_hour: this.config.maxRequestsPerHour,
        per_day: this.config.maxRequestsPerDay
      },
      availability: {
        can_make_request: this.canMakeRequest(),
        slots_remaining_minute: Math.max(0, this.config.maxRequestsPerMinute - this.requests.filter(r => r.timestamp > oneMinuteAgo).length),
        slots_remaining_hour: Math.max(0, this.config.maxRequestsPerHour - this.requests.filter(r => r.timestamp > oneHourAgo).length),
        slots_remaining_day: Math.max(0, this.config.maxRequestsPerDay - this.requests.filter(r => r.timestamp > oneDayAgo).length)
      }
    };
  }

  /**
   * איפוס הmemory (לשימוש בטסטים בלבד)
   */
  reset(): void {
    this.requests = [];
  }
}

// יצירת instance גלובלי
export const payPlusRateLimiter = new RateLimiter({
  maxRequestsPerMinute: 50,   // זהיר - 50 לדקה
  maxRequestsPerHour: 500,    // 500 לשעה
  maxRequestsPerDay: 5000     // 5000 ליום
});

/**
 * Decorator function לשימוש קל
 */
export function withRateLimit<T>(
  fn: () => Promise<T>,
  endpoint?: string
): Promise<T> {
  return payPlusRateLimiter.execute(fn, endpoint);
}

/**
 * בדיקה פשוטה אם ניתן לבצע קריאה
 */
export function canCallPayPlus(): boolean {
  return payPlusRateLimiter.canMakeRequest();
}

/**
 * קבלת סטטיסטיקות rate limiting
 */
export function getRateLimitStats() {
  return payPlusRateLimiter.getStats();
}
