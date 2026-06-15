import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { LIMITS } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a master password against current security requirements.
 * @param {string} password The password to validate.
 * @param {boolean} isLegacy If true, use legacy requirements (8 chars min).
 * @returns {{isValid: boolean, error: string|null}} Validation result.
 */
export function validateMasterPassword(password, isLegacy = false) {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  const minLength = isLegacy ? LIMITS.MASTER_PASSWORD_LEGACY_MIN : LIMITS.MASTER_PASSWORD_MIN;

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters`
    };
  }

  if (!isLegacy) {
    // Check for unique characters to prevent simple passwords like "123456789012"
    const uniqueChars = new Set(password).size;
    if (uniqueChars < 4) {
      return {
        isValid: false,
        error: 'Password must contain at least 4 unique characters'
      };
    }
  }

  return { isValid: true, error: null };
}
