'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  encryptSnippets,
  decryptSnippets,
  encryptProjects,
  decryptProjects,
  createPasswordHash,
  verifyPassword,
  isEncrypted
} from '@/lib/crypto';

const STORAGE_KEYS = {
  ENABLED: 'pastekit-encryption-enabled',
  PASSWORD_HASH: 'pastekit-password-hash',
  ENCRYPTED_DATA: 'pastekit-encrypted-projects',
  // Legacy key for migration
  LEGACY_ENCRYPTED_DATA: 'pastekit-encrypted-snippets'
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
  // Now accepts projects array instead of snippets
  const enableEncryption = useCallback(async (password, projects) => {
    try {
      // Create password hash for verification
      const passwordHash = await createPasswordHash(password);

      // Encrypt existing projects
      const encryptedData = await encryptProjects(projects, password);

      // Store encrypted state
      localStorage.setItem(STORAGE_KEYS.ENABLED, 'true');
      localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);

      // Remove unencrypted data
      localStorage.removeItem('pastekit-snippets');
      localStorage.removeItem('pastekit-projects');

      setIsEnabled(true);
      setIsUnlocked(true);
      setCurrentPassword(password);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Disable encryption
  // Now accepts projects array instead of snippets
  const disableEncryption = useCallback(async (password, decryptedProjects) => {
    try {
      const passwordHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
      const isValid = await verifyPassword(password, passwordHash);

      if (!isValid) {
        return { success: false, error: 'Incorrect password' };
      }

      // Store projects unencrypted
      localStorage.setItem('pastekit-projects', JSON.stringify(decryptedProjects));

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

      // Try to decrypt to fully verify (try new format first, then legacy)
      const encryptedData = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
      const legacyEncryptedData = localStorage.getItem(STORAGE_KEYS.LEGACY_ENCRYPTED_DATA);

      if (encryptedData) {
        await decryptProjects(encryptedData, password);
      } else if (legacyEncryptedData) {
        // Legacy format - will be migrated on load
        await decryptSnippets(legacyEncryptedData, password);
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

  // Save encrypted projects
  const saveEncrypted = useCallback(async (projects) => {
    if (!isEnabled || !isUnlocked || !currentPassword) {
      return { success: false, error: 'Encryption not active' };
    }

    try {
      const encryptedData = await encryptProjects(projects, currentPassword);
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [isEnabled, isUnlocked, currentPassword]);

  // Load encrypted projects
  // Returns { success, projects, needsMigration }
  const loadEncrypted = useCallback(async (password) => {
    const encryptedData = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
    const legacyEncryptedData = localStorage.getItem(STORAGE_KEYS.LEGACY_ENCRYPTED_DATA);

    // Try new format first
    if (encryptedData) {
      try {
        const projects = await decryptProjects(encryptedData, password || currentPassword);
        return { success: true, projects, needsMigration: false };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }

    // Try legacy format
    if (legacyEncryptedData) {
      try {
        const snippets = await decryptSnippets(legacyEncryptedData, password || currentPassword);
        // Return snippets with migration flag so caller can migrate
        return { success: true, snippets, needsMigration: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true, projects: null, needsMigration: false };
  }, [currentPassword]);

  // Check if data in storage is encrypted
  const checkStorageEncrypted = useCallback(() => {
    const data = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
    return data && isEncrypted(data);
  }, []);

  // Change password
  // Now accepts projects array instead of snippets
  const changePassword = useCallback(async (oldPassword, newPassword, projects) => {
    try {
      const passwordHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
      const isValid = await verifyPassword(oldPassword, passwordHash);

      if (!isValid) {
        return { success: false, error: 'Incorrect current password' };
      }

      // Create new password hash
      const newPasswordHash = await createPasswordHash(newPassword);

      // Re-encrypt with new password
      const encryptedData = await encryptProjects(projects, newPassword);

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
