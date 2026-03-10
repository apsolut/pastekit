'use client';

import React, { useState } from 'react';
import { Lock, Shield, ShieldOff, Eye, EyeOff, AlertTriangle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { LIMITS } from '@/lib/constants';

// Setup encryption for first time
export function EncryptionSetupModal({ open, onClose, onSetup }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setError('');

    if (password.length < LIMITS.MASTER_PASSWORD_MIN) {
      setError(`Password must be at least ${LIMITS.MASTER_PASSWORD_MIN} characters`);
      return;
    }

    if (new Set(password).size < 4) {
      setError('Password must contain at least 4 unique characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await onSetup(password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Setup failed');
    } else {
      setPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Enable Encryption
          </DialogTitle>
          <DialogDescription>
            Your snippets will be encrypted with a master password.
            Make sure to remember it - there is no recovery option.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={`Master password (min ${LIMITS.MASTER_PASSWORD_MIN} characters)`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={LIMITS.MASTER_PASSWORD}
              className="pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={LIMITS.MASTER_PASSWORD}
          />

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <strong>Important:</strong> If you forget your password, your data cannot be recovered.
              Consider exporting an unencrypted backup first.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading ? 'Encrypting...' : 'Enable Encryption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Unlock encrypted data
export function EncryptionUnlockModal({ open, onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const handleUnlock = async () => {
    // Check if locked out
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${secondsLeft}s`);
      return;
    }

    setError('');
    setIsLoading(true);
    const result = await onUnlock(password);
    setIsLoading(false);

    if (!result.success) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      // Progressive lockout: 5s after 3 attempts, 30s after 5, 60s after 7
      if (newAttempts >= 7) {
        setLockoutUntil(Date.now() + 60000);
        setError('Too many attempts. Locked for 60 seconds.');
      } else if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 30000);
        setError('Too many attempts. Locked for 30 seconds.');
      } else if (newAttempts >= 3) {
        setLockoutUntil(Date.now() + 5000);
        setError('Too many attempts. Locked for 5 seconds.');
      } else {
        setError(result.error || 'Unlock failed');
      }
      setPassword('');
    } else {
      setFailedAttempts(0);
      setLockoutUntil(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUnlock();
    }
  };

  // Reset error when password changes
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error && !lockoutUntil) setError('');
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Unlock Your Snippets
          </DialogTitle>
          <DialogDescription>
            Enter your master password to access your encrypted snippets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Master password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              maxLength={LIMITS.MASTER_PASSWORD}
              className="pr-10"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleUnlock} disabled={isLoading || !password} className="w-full">
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Disable encryption confirmation
export function DisableEncryptionModal({ open, onClose, onDisable }) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDisable = async () => {
    setError('');

    if (confirmText.toLowerCase() !== 'disable') {
      setError('Please type "disable" to confirm');
      return;
    }

    setIsLoading(true);
    const result = await onDisable(password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to disable encryption');
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldOff className="h-5 w-5" />
            Disable Encryption
          </DialogTitle>
          <DialogDescription>
            Your snippets will be stored in plain text. This is less secure but
            means you won&apos;t need a password to access them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={LIMITS.MASTER_PASSWORD}
              className="pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div>
            <p className="text-sm text-foreground mb-2">
              Type <span className="font-mono font-bold text-destructive">disable</span> to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'disable' to confirm"
              className="font-mono"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={isLoading || confirmText.toLowerCase() !== 'disable'}
          >
            {isLoading ? 'Disabling...' : 'Disable Encryption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Change password
export function ChangePasswordModal({ open, onClose, onChange }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async () => {
    setError('');

    if (newPassword.length < LIMITS.MASTER_PASSWORD_MIN) {
      setError(`New password must be at least ${LIMITS.MASTER_PASSWORD_MIN} characters`);
      return;
    }

    if (new Set(newPassword).size < 4) {
      setError('New password must contain at least 4 unique characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await onChange(currentPassword, newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to change password');
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update your master password. Your snippets will be re-encrypted with the new password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              type={showPasswords ? 'text' : 'password'}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              maxLength={LIMITS.MASTER_PASSWORD}
              className="pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Input
            type={showPasswords ? 'text' : 'password'}
            placeholder={`New password (min ${LIMITS.MASTER_PASSWORD_MIN} characters)`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            maxLength={LIMITS.MASTER_PASSWORD}
          />

          <Input
            type={showPasswords ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={LIMITS.MASTER_PASSWORD}
          />

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleChange} disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
