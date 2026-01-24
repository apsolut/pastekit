import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  GripVertical, 
  Copy, 
  Check,
  Pencil
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const SnippetCard = ({ 
  snippet, 
  isEditMode, 
  onUpdate, 
  onDelete, 
  onCopy 
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [localTitle, setLocalTitle] = useState(snippet.title);
  const [localContent, setLocalContent] = useState(snippet.content);
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const prevSnippetRef = useRef({ title: snippet.title, content: snippet.content });

  // Update local state when snippet changes from external source
  if (prevSnippetRef.current.title !== snippet.title || prevSnippetRef.current.content !== snippet.content) {
    prevSnippetRef.current = { title: snippet.title, content: snippet.content };
    if (localTitle !== snippet.title) setLocalTitle(snippet.title);
    if (localContent !== snippet.content) setLocalContent(snippet.content);
  }

  // Focus title input when entering edit mode for new cards
  useEffect(() => {
    if (isEditMode && !snippet.title && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditMode, snippet.title]);

  // Sortable hook for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: snippet.id,
    disabled: !isEditMode 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCopy = async () => {
    if (isEditMode) return;
    
    try {
      await navigator.clipboard.writeText(snippet.content);
      setShowCopied(true);
      setIsFlashing(true);
      onCopy(snippet.id);
      
      setTimeout(() => setShowCopied(false), 2000);
      setTimeout(() => setIsFlashing(false), 600);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setLocalContent(e.target.value);
  };

  const handleTitleBlur = () => {
    if (localTitle !== snippet.title) {
      onUpdate(snippet.id, { title: localTitle });
    }
  };

  const handleContentBlur = () => {
    if (localContent !== snippet.content) {
      onUpdate(snippet.id, { content: localContent });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative",
          isDragging && "z-50"
        )}
      >
        <Card
          className={cn(
            "card-ghibli overflow-hidden",
            !isEditMode && "card-locked",
            isEditMode && "card-unlocked",
            isDragging && "card-dragging",
            isFlashing && "copy-flash",
            "animate-fade-in"
          )}
          onClick={!isEditMode ? handleCopy : undefined}
        >
          {/* Header */}
          <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0 gap-2">
            {/* Drag Handle - Only in Edit Mode */}
            {isEditMode && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-accent/50 transition-colors touch-none"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <Input
                  ref={titleInputRef}
                  value={localTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  placeholder="Snippet title..."
                  className="h-7 text-sm font-semibold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary px-1 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {snippet.title || 'Untitled'}
                </h3>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Copy indicator (view mode) */}
              {!isEditMode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-md transition-all duration-200",
                      showCopied 
                        ? "bg-primary/15 text-primary" 
                        : "text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                    )}>
                      {showCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{showCopied ? 'Copied!' : 'Click to copy'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Delete button (edit mode) */}
              {isEditMode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(snippet.id);
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Delete snippet</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Lock/Unlock indicator */}
              <div className={cn(
                "h-7 w-7 flex items-center justify-center rounded-md",
                isEditMode 
                  ? "text-ghibli-gold bg-ghibli-gold/10" 
                  : "text-primary/60 bg-primary/5"
              )}>
                {isEditMode ? (
                  <Unlock className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-3 pt-0">
            {isEditMode ? (
              <Textarea
                ref={contentInputRef}
                value={localContent}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                placeholder="Paste your code or text here..."
                className="min-h-[80px] max-h-[200px] text-xs font-mono bg-muted/30 border-border/50 resize-y code-content scrollbar-ghibli"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="relative">
                <pre className={cn(
                  "code-content font-mono text-xs text-foreground/90 bg-muted/30 rounded-md p-2.5 max-h-[120px] overflow-y-auto scrollbar-ghibli",
                  "border border-transparent group-hover:border-primary/20 transition-colors"
                )}>
                  {snippet.content || (
                    <span className="text-muted-foreground italic">
                      No content yet...
                    </span>
                  )}
                </pre>
                
                {/* Fade gradient for overflow */}
                {snippet.content && snippet.content.split('\n').length > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted/30 to-transparent rounded-b-md pointer-events-none" />
                )}
              </div>
            )}
          </CardContent>

          {/* Copied overlay */}
          {showCopied && !isEditMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/5 backdrop-blur-[1px] rounded-xl pointer-events-none">
              <div className="flex items-center gap-2 bg-card/95 px-4 py-2 rounded-full shadow-ghibli-hover animate-scale-pop">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Copied!</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default SnippetCard;
