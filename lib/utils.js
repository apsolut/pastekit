import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { LIMITS } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a master password based on security requirements.
 * Requirements:
 * - Minimum length: LIMITS.MASTER_PASSWORD_MIN (12)
 * - Minimum unique characters: 4
 * @param {string} password - The password to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export function validateMasterPassword(password) {
  if (!password || password.length < LIMITS.MASTER_PASSWORD_MIN) {
    return {
      isValid: false,
      error: `Password must be at least ${LIMITS.MASTER_PASSWORD_MIN} characters`
    };
  }

  // Check for minimum unique characters to prevent simple passwords like '123456789012'
  const uniqueChars = new Set(password).size;
  if (uniqueChars < 4) {
    return {
      isValid: false,
      error: 'Password is too simple. Use more unique characters.'
    };
  }

  return { isValid: true, error: null };
}
