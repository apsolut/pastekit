'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Lock,
  Unlock,
  Plus,
  Clipboard,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Shield,
  ShieldCheck,
  Menu,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const Header = ({
  isEditMode,
  onToggleEditMode,
  isDark,
  onToggleTheme,
  onAddSnippet,
  onExport,
  onImport,
  onReset,
  snippetCount,
  encryptionEnabled,
  encryptionUnlocked,
  onEncryptionClick,
  onLock
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleReset = () => {
    if (confirmText.toLowerCase() === 'delete') {
      onReset();
      setResetDialogOpen(false);
      setConfirmText('');
    }
  };

  const handleDialogClose = (open) => {
    setResetDialogOpen(open);
    if (!open) {
      setConfirmText('');
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                isEditMode
                  ? "bg-ghibli-gold/20 shadow-ghibli-glow"
                  : "bg-primary/10"
              )}>
                <Clipboard className={cn(
                  "h-5 w-5 transition-colors",
                  isEditMode ? "text-ghibli-gold" : "text-primary"
                )} />
                {/* Decorative sparkle */}
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-ghibli-gold opacity-60" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  PasteKit
                </h1>
                <p className="text-xs text-muted-foreground">
                  {snippetCount} snippet{snippetCount !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Add Snippet Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghibli"
                    size="sm"
                    onClick={onAddSnippet}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Add new snippet</p>
                </TooltipContent>
              </Tooltip>

              {/* Menu for Export, Import, Reset */}
              <Dialog open={resetDialogOpen} onOpenChange={handleDialogClose}>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghibliOutline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>More options</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onExport} className="cursor-pointer">
                      <Download className="h-4 w-4 mr-2" />
                      Export {!encryptionEnabled && '(unencrypted)'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onImport} className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset All Data
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset All Data</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your snippets and restore the default examples.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-foreground mb-2">
                      Type <span className="font-mono font-bold text-destructive">delete</span> to confirm:
                    </p>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type 'delete' to confirm"
                      className="font-mono"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleDialogClose(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReset}
                      disabled={confirmText.toLowerCase() !== 'delete'}
                    >
                      Reset All Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Encryption Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghibliOutline"
                    size="icon"
                    onClick={onEncryptionClick}
                    className={cn(
                      "relative",
                      encryptionEnabled && encryptionUnlocked && "border-primary/50 bg-primary/5"
                    )}
                  >
                    {encryptionEnabled ? (
                      encryptionUnlocked ? (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Shield className="h-4 w-4 text-amber-500" />
                      )
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {encryptionEnabled
                      ? encryptionUnlocked
                        ? 'Encryption settings'
                        : 'Encryption locked'
                      : 'Enable encryption'}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Lock Button - only shown when encryption is enabled and unlocked */}
              {encryptionEnabled && encryptionUnlocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghibliOutline"
                      size="icon"
                      onClick={onLock}
                      className="text-amber-500 hover:text-amber-600 hover:border-amber-500/50 hover:bg-amber-500/10"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Lock now (clear from memory)</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Edit Mode Toggle */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300",
                isEditMode
                  ? "bg-ghibli-gold/10 border-ghibli-gold/30"
                  : "bg-muted/50 border-border"
              )}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggleEditMode}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {isEditMode ? (
                        <Unlock className="h-4 w-4 text-ghibli-gold" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={cn(
                        "text-xs font-medium hidden sm:inline",
                        isEditMode ? "text-ghibli-gold" : "text-muted-foreground"
                      )}>
                        {isEditMode ? 'Editing' : 'Locked'}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{isEditMode ? 'Switch to view mode (click cards to copy)' : 'Switch to edit mode (edit, delete, reorder)'}</p>
                  </TooltipContent>
                </Tooltip>

                <Switch
                  checked={isEditMode}
                  onCheckedChange={onToggleEditMode}
                  className="data-[state=checked]:bg-ghibli-gold"
                />
              </div>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghibliOutline"
                    size="icon"
                    onClick={onToggleTheme}
                    className="relative overflow-hidden"
                  >
                    <Sun className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isDark ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute"
                    )} />
                    <Moon className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isDark ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100"
                    )} />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Toggle {isDark ? 'light' : 'dark'} mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
