'use client';

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
  Eye,
  EyeOff,
  Type,
  KeyRound,
  FileText,
  Plus,
  X,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  SNIPPET_TITLE_MAX_LENGTH,
  FIELD_LABEL_MAX_LENGTH,
  FIELD_VALUE_MAX_LENGTH
} from '@/lib/constants';

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'password', label: 'Password', icon: KeyRound },
  { value: 'rich', label: 'Multiline', icon: FileText }
];

const DEFAULT_FIELD = { label: '', value: '', type: 'text' };

export const SnippetCard = ({
  snippet,
  isEditMode,
  onUpdate,
  onDelete,
  onCopy
}) => {
  const [copiedField, setCopiedField] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [localTitle, setLocalTitle] = useState(snippet.title);
  const [localFields, setLocalFields] = useState(snippet.fields || [{ ...DEFAULT_FIELD }]);
  const [expandedOpen, setExpandedOpen] = useState(false);
  const titleInputRef = useRef(null);
  const prevSnippetRef = useRef({ title: snippet.title, fields: snippet.fields });

  // Update local state when snippet changes from external source
  useEffect(() => {
    if (prevSnippetRef.current.title !== snippet.title) {
      setLocalTitle(snippet.title);
    }
    if (JSON.stringify(prevSnippetRef.current.fields) !== JSON.stringify(snippet.fields)) {
      setLocalFields(snippet.fields || [{ ...DEFAULT_FIELD }]);
    }
    prevSnippetRef.current = { title: snippet.title, fields: snippet.fields };
  }, [snippet.title, snippet.fields]);

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

  const handleCopyField = async (index, value) => {
    if (isEditMode || !value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(index);
      onCopy(snippet.id);

      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePasswordReveal = (index) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (localTitle !== snippet.title) {
      onUpdate(snippet.id, { title: localTitle });
    }
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...localFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setLocalFields(newFields);
  };

  const handleFieldBlur = () => {
    if (JSON.stringify(localFields) !== JSON.stringify(snippet.fields)) {
      onUpdate(snippet.id, { fields: localFields });
    }
  };

  const cycleFieldType = (index) => {
    const currentType = localFields[index].type || 'text';
    const currentIndex = FIELD_TYPES.findIndex(t => t.value === currentType);
    const nextIndex = (currentIndex + 1) % FIELD_TYPES.length;
    handleFieldChange(index, 'type', FIELD_TYPES[nextIndex].value);
    const newFields = [...localFields];
    newFields[index] = { ...newFields[index], type: FIELD_TYPES[nextIndex].value };
    onUpdate(snippet.id, { fields: newFields });
  };

  const addField = () => {
    const newFields = [...localFields, { ...DEFAULT_FIELD }];
    setLocalFields(newFields);
    onUpdate(snippet.id, { fields: newFields });
  };

  const removeField = (index) => {
    if (localFields.length <= 1) return;
    const newFields = localFields.filter((_, i) => i !== index);
    setLocalFields(newFields);
    onUpdate(snippet.id, { fields: newFields });
  };

  const getFieldIcon = (type) => {
    const fieldType = FIELD_TYPES.find(t => t.value === type) || FIELD_TYPES[0];
    return fieldType.icon;
  };

  const getMaskedValue = (value) => {
    return '•'.repeat(Math.min(value.length, 20));
  };

  // Filter out empty fields in view mode
  const visibleFields = isEditMode
    ? localFields
    : localFields.filter(field => field.value && field.value.trim());

  // Render field content (shared between card and dialog)
  const renderFieldView = (field, actualIndex, inDialog = false) => {
    const FieldIcon = getFieldIcon(field.type);
    const isPassword = field.type === 'password';
    const isRich = field.type === 'rich';
    const isRevealed = revealedPasswords[actualIndex];

    return (
      <div
        className={cn(
          "flex items-start gap-2 p-2 rounded-md cursor-pointer transition-all",
          "bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20",
          copiedField === actualIndex && "bg-primary/10 border-primary/30"
        )}
        onClick={() => handleCopyField(actualIndex, field.value)}
      >
        <div className="flex-shrink-0 mt-0.5">
          <FieldIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {field.label}
          </p>
          {isRich ? (
            <pre className={cn(
              "text-xs font-mono text-foreground/90 whitespace-pre-wrap break-words mt-1",
              !inDialog && "max-h-[60px] overflow-hidden"
            )}>
              {field.value}
            </pre>
          ) : (
            <p className="text-xs font-mono text-foreground/90 truncate">
              {isPassword && !isRevealed ? getMaskedValue(field.value) : field.value}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isPassword && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePasswordReveal(actualIndex);
              }}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <div className={cn(
            "h-6 w-6 flex items-center justify-center rounded transition-all",
            copiedField === actualIndex
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          )}>
            {copiedField === actualIndex ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>
    );
  };

  // Render field edit (shared between card and dialog)
  const renderFieldEdit = (field, index, inDialog = false) => {
    const FieldIcon = getFieldIcon(field.type);
    const isPassword = field.type === 'password';
    const isRich = field.type === 'rich';

    return (
      <div className={cn(
        "space-y-1.5 p-2 rounded-md bg-muted/20 border border-border/50",
        inDialog && "p-3"
      )}>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => cycleFieldType(index)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <FieldIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Type: {FIELD_TYPES.find(t => t.value === field.type)?.label || 'Text'} (click to change)</p>
            </TooltipContent>
          </Tooltip>

          <Input
            value={field.label}
            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
            onBlur={handleFieldBlur}
            placeholder="Label..."
            maxLength={50}
            className={cn(
              "h-6 flex-1 text-xs font-medium bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary px-1 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
              inDialog && "h-8 text-sm"
            )}
          />

          {localFields.length > 1 && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => removeField(index)}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {isRich ? (
          <Textarea
            value={field.value}
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
            onBlur={handleFieldBlur}
            placeholder="Value..."
            maxLength={10000}
            className={cn(
              "min-h-[60px] text-xs font-mono bg-muted/30 border-border/50 resize-y",
              inDialog && "min-h-[120px] text-sm"
            )}
          />
        ) : (
          <Input
            type={isPassword ? 'password' : 'text'}
            value={field.value}
            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
            onBlur={handleFieldBlur}
            placeholder="Value..."
            maxLength={10000}
            className={cn(
              "h-8 text-xs font-mono bg-muted/30 border-border/50",
              inDialog && "h-10 text-sm"
            )}
          />
        )}
      </div>
    );
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
            "card-ghibli overflow-hidden h-[200px] flex flex-col",
            !isEditMode && "card-locked",
            isEditMode && "card-unlocked",
            isDragging && "card-dragging",
            "animate-fade-in"
          )}
        >
          {/* Header */}
          <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0 gap-2 flex-shrink-0">
            {isEditMode && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-accent/50 transition-colors touch-none"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <Input
                  ref={titleInputRef}
                  value={localTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  placeholder="Snippet title..."
                  maxLength={100}
                  className="h-7 text-sm font-semibold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary px-1 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {snippet.title || 'Untitled'}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Expand button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedOpen(true);
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Expand</p>
                </TooltipContent>
              </Tooltip>

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

              <div className={cn(
                "h-7 w-7 flex items-center justify-center rounded-md",
                isEditMode
                  ? "text-ghibli-gold bg-ghibli-gold/10"
                  : "text-primary/60 bg-primary/5"
              )}>
                {isEditMode ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              </div>
            </div>
          </CardHeader>

          {/* Fields - scrollable area */}
          <CardContent className="p-3 pt-0 space-y-2 flex-1 overflow-y-auto scrollbar-ghibli">
            {visibleFields.length === 0 && !isEditMode ? (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                No fields with content
              </p>
            ) : (
              visibleFields.map((field, index) => {
                const actualIndex = isEditMode ? index : localFields.indexOf(field);
                return (
                  <div key={actualIndex} className="relative">
                    {isEditMode ? renderFieldEdit(field, index, false) : renderFieldView(field, actualIndex, false)}
                  </div>
                );
              })
            )}

            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addField}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/50 hover:border-border"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Field
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Expanded Dialog */}
        <Dialog open={expandedOpen} onOpenChange={setExpandedOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? (
                  <Input
                    value={localTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    placeholder="Snippet title..."
                    maxLength={100}
                    className="text-lg font-semibold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary px-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                ) : (
                  snippet.title || 'Untitled'
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-3 py-4 scrollbar-ghibli">
              {localFields.map((field, index) => {
                const actualIndex = index;
                if (!isEditMode && (!field.value || !field.value.trim())) return null;
                return (
                  <div key={actualIndex} className="relative">
                    {isEditMode ? renderFieldEdit(field, index, true) : renderFieldView(field, actualIndex, true)}
                  </div>
                );
              })}

              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addField}
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 hover:border-border"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SnippetCard;
