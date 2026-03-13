import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { LIMITS } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates the master password based on security requirements.
 * Requirements:
 * - Minimum length (from LIMITS.MASTER_PASSWORD_MIN)
 * - Maximum length (from LIMITS.MASTER_PASSWORD)
 * - Minimum unique characters (at least 4)
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

  // Check for unique characters to prevent extremely simple passwords (e.g., "123456789012")
  const uniqueChars = new Set(password).size;
  if (uniqueChars < 4) {
    return {
      isValid: false,
      error: 'Password must be more complex (at least 4 unique characters)'
    };
  }

  return { isValid: true };
}
