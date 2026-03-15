import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { LIMITS } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a master password for strength and length
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export function validateMasterPassword(password) {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < LIMITS.MASTER_PASSWORD_MIN) {
    return {
      isValid: false,
      error: `Password must be at least ${LIMITS.MASTER_PASSWORD_MIN} characters`
    };
  }

  if (password.length > LIMITS.MASTER_PASSWORD) {
    return {
      isValid: false,
      error: `Password must be no more than ${LIMITS.MASTER_PASSWORD} characters`
    };
  }

  // Basic complexity check: count unique characters
  const uniqueChars = new Set(password).size;
  if (uniqueChars < 4) {
    return {
      isValid: false,
      error: 'Password is too simple. Please use more unique characters.'
    };
  }

  return { isValid: true, error: null };
}
