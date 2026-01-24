import React from 'react';
import { 
  Sun, 
  Moon, 
  Lock, 
  Unlock, 
  Plus, 
  Clipboard,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const Header = ({ 
  isEditMode, 
  onToggleEditMode, 
  isDark, 
  onToggleTheme, 
  onAddSnippet,
  snippetCount 
}) => {
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
                    <span className="hidden sm:inline">Add Snippet</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Add new snippet</p>
                </TooltipContent>
              </Tooltip>

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
