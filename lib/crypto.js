import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { SECURITY } from './constants';
const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } = naclUtil;

// Constants
const SALT_LENGTH = 16;
const NONCE_LENGTH = 24;

/**
 * Derive a 32-byte key from a password using PBKDF2
 */
export async function deriveKey(password, salt, iterations = SECURITY.PBKDF2_ITERATIONS) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive 32 bytes (256 bits) for NaCl secretbox
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

/**
 * Generate a random salt
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random nonce
 */
export function generateNonce() {
  return crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

/**
 * Encrypt data using NaCl secretbox (XSalsa20-Poly1305)
 * Returns base64 encoded: salt + nonce + ciphertext
 */
export async function encrypt(plaintext, password) {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const nonce = generateNonce();

  const messageUint8 = decodeUTF8(plaintext);
  const ciphertext = nacl.secretbox(messageUint8, nonce, key);

  if (!ciphertext) {
    throw new Error('Encryption failed');
  }

  // Combine salt + nonce + ciphertext
  const combined = new Uint8Array(SALT_LENGTH + NONCE_LENGTH + ciphertext.length);
  combined.set(salt, 0);
  combined.set(nonce, SALT_LENGTH);
  combined.set(ciphertext, SALT_LENGTH + NONCE_LENGTH);

  return encodeBase64(combined);
}

/**
 * Decrypt data
 * Expects base64 encoded: salt + nonce + ciphertext
 */
export async function decrypt(encryptedData, password) {
  const combined = decodeBase64(encryptedData);

  if (combined.length < SALT_LENGTH + NONCE_LENGTH + 16) {
    throw new Error('Invalid encrypted data');
  }

  const salt = combined.slice(0, SALT_LENGTH);
  const nonce = combined.slice(SALT_LENGTH, SALT_LENGTH + NONCE_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + NONCE_LENGTH);

  // Try current iterations
  let key = await deriveKey(password, salt, SECURITY.PBKDF2_ITERATIONS);
  let decrypted = nacl.secretbox.open(ciphertext, nonce, key);

  // Fallback to legacy iterations if decryption failed
  if (!decrypted) {
    key = await deriveKey(password, salt, SECURITY.LEGACY_PBKDF2_ITERATIONS);
    decrypted = nacl.secretbox.open(ciphertext, nonce, key);
  }

  if (!decrypted) {
    throw new Error('Decryption failed - incorrect password');
  }

  return encodeUTF8(decrypted);
}

/**
 * Create a password verification hash
 * This is stored to verify the password is correct without storing it
 */
export async function createPasswordHash(password) {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);

  // Hash the derived key to create a verification hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', key);
  const hashArray = new Uint8Array(hashBuffer);

  // Combine salt + hash
  const combined = new Uint8Array(SALT_LENGTH + hashArray.length);
  combined.set(salt, 0);
  combined.set(hashArray, SALT_LENGTH);

  return encodeBase64(combined);
}

/**
 * Verify a password against a stored hash
 * Supports both current and legacy iteration counts
 */
export async function verifyPassword(password, storedHash) {
  try {
    const combined = decodeBase64(storedHash);
    const salt = combined.slice(0, SALT_LENGTH);
    const expectedHash = combined.slice(SALT_LENGTH);

    // Helper for constant-time comparison
    const constantTimeEqual = (a, b) => {
      if (a.length !== b.length) return false;
      let res = 0;
      for (let i = 0; i < a.length; i++) res |= a[i] ^ b[i];
      return res === 0;
    };

    // Try current iterations
    const key = await deriveKey(password, salt, SECURITY.PBKDF2_ITERATIONS);
    const hashBuffer = await crypto.subtle.digest('SHA-256', key);
    const actualHash = new Uint8Array(hashBuffer);

    if (constantTimeEqual(actualHash, expectedHash)) {
      return true;
    }

    // Try legacy iterations
    const legacyKey = await deriveKey(password, salt, SECURITY.LEGACY_PBKDF2_ITERATIONS);
    const legacyHashBuffer = await crypto.subtle.digest('SHA-256', legacyKey);
    const legacyActualHash = new Uint8Array(legacyHashBuffer);

    return constantTimeEqual(legacyActualHash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Check if data looks like it's encrypted (base64 with minimum length)
 */
export function isEncrypted(data) {
  if (typeof data !== 'string') return false;

  // Check if it's valid base64 and has minimum length for encrypted data
  try {
    const decoded = decodeBase64(data);
    return decoded.length >= SALT_LENGTH + NONCE_LENGTH + 16;
  } catch {
    return false;
  }
}

/**
 * Encrypt snippets array
 */
export async function encryptSnippets(snippets, password) {
  const jsonString = JSON.stringify(snippets);
  return encrypt(jsonString, password);
}

/**
 * Decrypt snippets array
 */
export async function decryptSnippets(encryptedData, password) {
  const jsonString = await decrypt(encryptedData, password);
  return JSON.parse(jsonString);
}

/**
 * Encrypt projects array
 */
export async function encryptProjects(projects, password) {
  const jsonString = JSON.stringify(projects);
  return encrypt(jsonString, password);
}

/**
 * Decrypt projects array
 */
export async function decryptProjects(encryptedData, password) {
  const jsonString = await decrypt(encryptedData, password);
  return JSON.parse(jsonString);
}
