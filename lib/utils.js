import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { LIMITS } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a master password against security requirements
 * @param {string} password - The password to validate
 * @param {string} type - 'setup' or 'change' (for error message flavoring)
 * @returns {string|null} - Error message or null if valid
 */
export function validateMasterPassword(password, type = 'setup') {
  const prefix = type === 'change' ? 'New password' : 'Password';

  if (!password || password.length < LIMITS.MASTER_PASSWORD_MIN) {
    return `${prefix} must be at least ${LIMITS.MASTER_PASSWORD_MIN} characters`;
  }

  // Check for unique characters (at least 4) to prevent simple repeating patterns
  const uniqueChars = new Set(password).size;
  if (uniqueChars < 4) {
    return `${prefix} is too simple. Use more unique characters.`;
  }

  return null;
}
