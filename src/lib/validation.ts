/**
 * Teak Haus — Shared Form Validation & Sanitization Helpers
 * Centralized utility functions for Indian phone numbers, postal PIN codes, emails, and text fields.
 */

/**
 * Sanitizes input to retain only digits, capped at 10 numbers.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 10);
}

/**
 * Validates whether a given string is a valid 10-digit Indian mobile number
 * starting with 6, 7, 8, or 9.
 */
export function isValidIndianPhone(phone: string): boolean {
  const clean = sanitizePhone(phone);
  return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
}

/**
 * Returns an error message if phone is invalid, or null if valid.
 */
export function validateIndianPhone(phone: string): string | null {
  if (!isValidIndianPhone(phone)) {
    return "Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
  }
  return null;
}

/**
 * Sanitizes input to retain only digits, capped at 6 numbers.
 */
export function sanitizePincode(pincode: string): string {
  return pincode.replace(/\D/g, "").slice(0, 6);
}

/**
 * Validates whether a given string is a valid 6-digit Indian PIN code (cannot start with 0).
 */
export function isValidIndianPincode(pincode: string): boolean {
  const clean = sanitizePincode(pincode);
  return /^[1-9][0-9]{5}$/.test(clean);
}

/**
 * Returns an error message if pincode is invalid, or null if valid.
 */
export function validateIndianPincode(pincode: string): string | null {
  if (!isValidIndianPincode(pincode)) {
    return "Indian Postal PIN code must be exactly 6 digits and cannot start with 0.";
  }
  return null;
}

/**
 * Checks whether an email address matches standard RFC pattern.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Returns an error message if email is invalid, or null if valid.
 */
export function validateEmail(email: string): string | null {
  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * Validates that a name is present and satisfies minimum character length.
 */
export function validateName(name: string, minLength = 2): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < minLength) {
    return `Please enter your full name (at least ${minLength} characters).`;
  }
  return null;
}
