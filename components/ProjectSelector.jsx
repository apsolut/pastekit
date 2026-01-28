'use client';

import React from 'react';
import {
  FolderOpen,
  ChevronDown,
  Check,
  Plus,
  Settings,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ProjectSelector({
  projects,
  activeProject,
  onSwitchProject,
  onCreateProject,
  onManageProjects
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 px-3 h-9 font-medium",
            "hover:bg-primary/5 hover:text-primary",
            "border border-transparent hover:border-border/50",
            "transition-all duration-200"
          )}
        >
          <FolderOpen className="h-4 w-4 text-primary/70" />
          <span className="max-w-[120px] truncate">
            {activeProject?.name || 'No Project'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        {/* List of projects */}
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onSwitchProject(project.id)}
            className={cn(
              "cursor-pointer gap-2",
              project.id === activeProject?.id && "bg-primary/5"
            )}
          >
            <Folder className={cn(
              "h-4 w-4",
              project.id === activeProject?.id ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="flex-1 truncate">{project.name}</span>
            {project.id === activeProject?.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* New Project */}
        <DropdownMenuItem
          onClick={onCreateProject}
          className="cursor-pointer gap-2 text-primary"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </DropdownMenuItem>

        {/* Manage Projects */}
        <DropdownMenuItem
          onClick={onManageProjects}
          className="cursor-pointer gap-2"
        >
          <Settings className="h-4 w-4" />
          <span>Manage Projects...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProjectSelector;
