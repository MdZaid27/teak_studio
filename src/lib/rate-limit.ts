import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Global in-memory cache for sliding-window rate limiting
declare global {
  var __teakRateLimitStore: Map<string, RateLimitRecord> | undefined;
}

if (!global.__teakRateLimitStore) {
  global.__teakRateLimitStore = new Map<string, RateLimitRecord>();
}

/**
 * Extract client IP address from request headers across standard proxies, Cloudflare, and Vercel.
 */
export function getClientIp(request: NextRequest): string {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

/**
 * Sliding-window rate limit checker.
 * @param key Unique identifier (e.g. IP + endpoint)
 * @param limit Maximum allowed requests within windowMs
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const store = global.__teakRateLimitStore!;
  const now = Date.now();

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(key, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil(newRecord.resetTime / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  };
}

/**
 * Enforces rate limiting on Next.js API requests.
 * If limit exceeded, returns a 429 Too Many Requests response with standard headers.
 */
export function enforceRateLimit(
  request: NextRequest,
  endpointPrefix: string,
  limit: number = 10,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${endpointPrefix}:${ip}`;
  const result = checkRateLimit(key, limit, windowMs);

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset * 1000 - Date.now()) / 1000));
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  return null;
}
