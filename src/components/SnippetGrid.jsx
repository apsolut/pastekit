import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SnippetCard } from './SnippetCard';
import { cn } from '@/lib/utils';

export const SnippetGrid = ({
  snippets,
  isEditMode,
  onUpdateSnippet,
  onDeleteSnippet,
  onCopySnippet,
  onReorderSnippets,
}) => {
  const [activeId, setActiveId] = React.useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = snippets.findIndex((s) => s.id === active.id);
      const newIndex = snippets.findIndex((s) => s.id === over.id);
      
      const newSnippets = arrayMove(snippets, oldIndex, newIndex);
      onReorderSnippets(newSnippets);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeSnippet = activeId ? snippets.find((s) => s.id === activeId) : null;

  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No snippets yet
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Click &ldquo;Add Snippet&rdquo; to create your first code snippet. Your snippets will be saved automatically.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={snippets.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div
          className={cn(
            "grid gap-3 sm:gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {snippets.map((snippet, index) => (
            <div
              key={snippet.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <SnippetCard
                snippet={snippet}
                isEditMode={isEditMode}
                onUpdate={onUpdateSnippet}
                onDelete={onDeleteSnippet}
                onCopy={onCopySnippet}
              />
            </div>
          ))}
        </div>
      </SortableContext>

      {/* Drag Overlay */}
      <DragOverlay adjustScale={false}>
        {activeSnippet ? (
          <div className="opacity-90 scale-105 rotate-2">
            <SnippetCard
              snippet={activeSnippet}
              isEditMode={isEditMode}
              onUpdate={() => {}}
              onDelete={() => {}}
              onCopy={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default SnippetGrid;
