'use client';

import React, { useState, useEffect } from 'react';
import { Folder, Copy, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_PROJECT_NAME_LENGTH } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Create New Project Modal
export function CreateProjectModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Enter a name for your new project. You can organize different snippets in separate projects.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Project name"
            autoFocus
            maxLength={MAX_PROJECT_NAME_LENGTH}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Rename Project Modal
export function RenameProjectModal({ open, onClose, project, onRename }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && project) {
      setName(project.name);
    }
  }, [open, project]);

  const handleRename = () => {
    if (name.trim() && name.trim() !== project?.name) {
      onRename(project.id, name.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      handleRename();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Rename Project
          </DialogTitle>
          <DialogDescription>
            Enter a new name for &quot;{project?.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Project name"
            autoFocus
            maxLength={MAX_PROJECT_NAME_LENGTH}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!name.trim() || name.trim() === project?.name}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Project Confirmation Modal
export function DeleteProjectModal({ open, onClose, project, onDelete, projectCount }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);

  const handleDelete = () => {
    if (confirmText.toLowerCase() === 'delete') {
      onDelete(project.id);
      onClose();
    }
  };

  const isLastProject = projectCount <= 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            {isLastProject ? (
              <span className="text-amber-500">
                You cannot delete the last project. Create another project first.
              </span>
            ) : (
              <>
                This will permanently delete &quot;{project?.name}&quot; and all its snippets.
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isLastProject && (
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
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isLastProject && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText.toLowerCase() !== 'delete'}
            >
              Delete Project
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Manage Projects Modal (shows list with actions)
export function ManageProjectsModal({
  open,
  onClose,
  projects,
  activeProjectId,
  onRename,
  onDuplicate,
  onDelete,
  onSwitch
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
          <DialogDescription>
            Rename, duplicate, or delete your projects.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                project.id === activeProjectId
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => {
                  onSwitch(project.id);
                  onClose();
                }}
              >
                <Folder className={cn(
                  "h-4 w-4",
                  project.id === activeProjectId ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="font-medium truncate">{project.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({project.snippets?.length || 0} snippets)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRename(project)}
                  title="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDuplicate(project.id)}
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(project)}
                  title="Delete"
                  disabled={projects.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default {
  CreateProjectModal,
  RenameProjectModal,
  DeleteProjectModal,
  ManageProjectsModal
};
