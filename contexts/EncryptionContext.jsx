'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  encryptSnippets,
  decryptSnippets,
  createPasswordHash,
  verifyPassword,
  isEncrypted
} from '@/lib/crypto';

const STORAGE_KEYS = {
  ENABLED: 'pastekit-encryption-enabled',
  PASSWORD_HASH: 'pastekit-password-hash',
  ENCRYPTED_DATA: 'pastekit-encrypted-snippets'
};

const EncryptionContext = createContext(null);

export function EncryptionProvider({ children }) {
  // Core state
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED) === 'true';
    const hasPasswordHash = !!localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);

    setIsEnabled(enabled && hasPasswordHash);
    setIsLoading(false);
  }, []);

  // Enable encryption with a new password
  const enableEncryption = useCallback(async (password, snippets) => {
    try {
      // Create password hash for verification
      const passwordHash = await createPasswordHash(password);

      // Encrypt existing snippets
      const encryptedData = await encryptSnippets(snippets, password);

      // Store encrypted state
      localStorage.setItem(STORAGE_KEYS.ENABLED, 'true');
      localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);

      // Remove unencrypted snippets
      localStorage.removeItem('pastekit-snippets');

      setIsEnabled(true);
      setIsUnlocked(true);
      setCurrentPassword(password);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Disable encryption
  const disableEncryption = useCallback(async (password, decryptedSnippets) => {
    try {
      const passwordHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
      const isValid = await verifyPassword(password, passwordHash);

      if (!isValid) {
        return { success: false, error: 'Incorrect password' };
      }

      // Store snippets unencrypted
      localStorage.setItem('pastekit-snippets', JSON.stringify(decryptedSnippets));

      // Remove encryption data
      localStorage.removeItem(STORAGE_KEYS.ENABLED);
      localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
      localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_DATA);

      setIsEnabled(false);
      setIsUnlocked(false);
      setCurrentPassword(null);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Unlock with password
  const unlock = useCallback(async (password) => {
    try {
      const passwordHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);

      if (!passwordHash) {
        return { success: false, error: 'Encryption not configured' };
      }

      const isValid = await verifyPassword(password, passwordHash);

      if (!isValid) {
        return { success: false, error: 'Incorrect password' };
      }

      // Try to decrypt to fully verify
      const encryptedData = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
      if (encryptedData) {
        await decryptSnippets(encryptedData, password);
      }

      setIsUnlocked(true);
      setCurrentPassword(password);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Decryption failed - incorrect password' };
    }
  }, []);

  // Lock (clear password from memory)
  const lock = useCallback(() => {
    setIsUnlocked(false);
    setCurrentPassword(null);
  }, []);

  // Save encrypted snippets
  const saveEncrypted = useCallback(async (snippets) => {
    if (!isEnabled || !isUnlocked || !currentPassword) {
      return { success: false, error: 'Encryption not active' };
    }

    try {
      const encryptedData = await encryptSnippets(snippets, currentPassword);
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [isEnabled, isUnlocked, currentPassword]);

  // Load encrypted snippets
  const loadEncrypted = useCallback(async (password) => {
    const encryptedData = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);

    if (!encryptedData) {
      return { success: true, snippets: null };
    }

    try {
      const snippets = await decryptSnippets(encryptedData, password || currentPassword);
      return { success: true, snippets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [currentPassword]);

  // Check if data in storage is encrypted
  const checkStorageEncrypted = useCallback(() => {
    const data = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
    return data && isEncrypted(data);
  }, []);

  // Change password
  const changePassword = useCallback(async (oldPassword, newPassword, snippets) => {
    try {
      const passwordHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
      const isValid = await verifyPassword(oldPassword, passwordHash);

      if (!isValid) {
        return { success: false, error: 'Incorrect current password' };
      }

      // Create new password hash
      const newPasswordHash = await createPasswordHash(newPassword);

      // Re-encrypt with new password
      const encryptedData = await encryptSnippets(snippets, newPassword);

      localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, newPasswordHash);
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);

      setCurrentPassword(newPassword);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    // State
    isEnabled,
    isUnlocked,
    isLoading,

    // Actions
    enableEncryption,
    disableEncryption,
    unlock,
    lock,
    saveEncrypted,
    loadEncrypted,
    checkStorageEncrypted,
    changePassword
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}
