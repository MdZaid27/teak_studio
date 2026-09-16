import crypto from "crypto";

export interface OtpRecord {
  hashedCode: string;
  salt: string;
  targetPhone: string;
  targetEmail: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// Global in-memory cache for OTP records
declare global {
  var __teakOtpStore: Map<string, OtpRecord> | undefined;
}

if (!global.__teakOtpStore) {
  global.__teakOtpStore = new Map<string, OtpRecord>();
}

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_OTP_ATTEMPTS = 5;

/**
 * Generates a cryptographically secure 6-digit numerical OTP string.
 */
export function generateSecureOtp(): string {
  // randomInt generates an integer in [min, max) with uniform cryptographic distribution
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hashes an OTP code using SHA-256 with a unique cryptographic salt.
 */
export function hashOtp(code: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(code).digest("hex");
}

/**
 * Normalizes a phone number to its last 10 digits.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

/**
 * Masks an email address for privacy in UI feedback (e.g. mzaid6048@gmail.com -> m***8@gmail.com).
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  return `${firstChar}***${lastChar}@${domain}`;
}

/**
 * Cleans up stale OTP tokens from the in-memory store (expired by > 1 hour).
 * Recent expired tokens are preserved until verified so patrons receive an informative expiration notice.
 */
function cleanupExpiredTokens() {
  const store = global.__teakOtpStore!;
  const now = Date.now();
  const STALE_THRESHOLD_MS = 60 * 60 * 1000;
  for (const [key, record] of store.entries()) {
    if (now > record.expiresAt + STALE_THRESHOLD_MS) {
      store.delete(key);
    }
  }
}

/**
 * Stores a new hashed OTP in the secure memory store for a given phone/email.
 */
export function storeOtp(params: {
  phone: string;
  email: string;
  code: string;
  expiryMs?: number;
}): void {
  cleanupExpiredTokens();
  const cleanPhone = normalizePhone(params.phone);
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedCode = hashOtp(params.code, salt);
  const expiryMs = params.expiryMs || OTP_EXPIRY_MS;

  const record: OtpRecord = {
    hashedCode,
    salt,
    targetPhone: cleanPhone,
    targetEmail: params.email.trim().toLowerCase(),
    expiresAt: Date.now() + expiryMs,
    attempts: 0,
    createdAt: Date.now(),
  };

  global.__teakOtpStore!.set(cleanPhone, record);
}

/**
 * Verifies a candidate OTP against the stored hashed record.
 * Defends against brute force with attempt limits and timing-safe comparison.
 */
export function verifyStoredOtp(
  phone: string,
  candidateCode: string
): { success: boolean; error?: string; email?: string } {
  cleanupExpiredTokens();
  const cleanPhone = normalizePhone(phone);
  const cleanCode = candidateCode.trim().replace(/\D/g, "");

  if (cleanCode.length !== 6) {
    return { success: false, error: "Please enter a valid 6-digit verification code." };
  }

  const record = global.__teakOtpStore!.get(cleanPhone);
  if (!record) {
    return {
      success: false,
      error: "No active verification code found for this mobile number. Please request a new code.",
    };
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    global.__teakOtpStore!.delete(cleanPhone);
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  record.attempts += 1;

  if (record.attempts > MAX_OTP_ATTEMPTS) {
    global.__teakOtpStore!.delete(cleanPhone);
    return {
      success: false,
      error: "Maximum verification attempts exceeded. Please request a new code.",
    };
  }

  const candidateHash = hashOtp(cleanCode, record.salt);
  const isMatch =
    candidateHash.length === record.hashedCode.length &&
    crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(record.hashedCode));

  if (!isMatch) {
    const remaining = MAX_OTP_ATTEMPTS - record.attempts;
    return {
      success: false,
      error:
        remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Invalid verification code. Maximum attempts exceeded.",
    };
  }

  // Verification succeeded - clear OTP and return target email
  const targetEmail = record.targetEmail;
  global.__teakOtpStore!.delete(cleanPhone);

  return {
    success: true,
    email: targetEmail,
  };
}

/**
 * Peek helper for automated unit tests (returns non-sensitive metadata)
 */
export function getStoredOtpMeta(phone: string): { exists: boolean; attempts: number; expiresAt: number } | null {
  const cleanPhone = normalizePhone(phone);
  const record = global.__teakOtpStore!.get(cleanPhone);
  if (!record) return null;
  return {
    exists: true,
    attempts: record.attempts,
    expiresAt: record.expiresAt,
  };
}
