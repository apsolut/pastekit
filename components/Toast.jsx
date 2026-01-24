'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Toast = ({ message, type = 'success', isVisible, onClose, duration = 2000 }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const prevVisibleRef = useRef(isVisible);

  // Reset leaving state when becoming visible
  if (isVisible && !prevVisibleRef.current) {
    prevVisibleRef.current = isVisible;
    if (isLeaving) setIsLeaving(false);
  }
  if (!isVisible) {
    prevVisibleRef.current = false;
  }

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(onClose, 200);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-xl shadow-ghibli-hover",
          "bg-card border border-primary/20 backdrop-blur-sm",
          "transition-all duration-200 ease-ghibli-bounce",
          isLeaving ? "opacity-0 translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full",
          type === 'success' && "bg-primary/15 text-primary",
          type === 'error' && "bg-destructive/15 text-destructive"
        )}>
          {type === 'success' ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </div>
        <span className="text-sm font-medium text-foreground">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
