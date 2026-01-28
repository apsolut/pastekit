'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useEncryption } from './EncryptionContext';
import { defaultProject } from '@/data/defaultProject';
import {
  needsMigration,
  migrateUnencryptedData,
  migrateEncryptedData,
  setMigrationComplete,
  generateProjectId,
  STORAGE_KEYS
} from '@/lib/migration';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const encryption = useEncryption();

  // Projects state
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Get the active project
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Initialize projects from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If encryption is enabled but not unlocked, wait
    if (encryption.isEnabled && !encryption.isUnlocked) {
      setIsLoading(false);
      return;
    }

    const initProjects = async () => {
      try {
        // If encryption is enabled and unlocked, load encrypted data
        if (encryption.isEnabled && encryption.isUnlocked) {
          const result = await encryption.loadEncrypted();

          if (result.success) {
            if (result.needsMigration && result.snippets) {
              // Migrate legacy encrypted snippets to projects
              const migratedProjects = migrateEncryptedData(result.snippets);
              setProjects(migratedProjects);
              setActiveProjectId(migratedProjects[0]?.id || 'default');

              // Save migrated data
              await encryption.saveEncrypted(migratedProjects);
              setMigrationComplete();
            } else if (result.projects) {
              setProjects(result.projects);
              // Restore active project or use first
              const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
              const validActiveId = result.projects.find(p => p.id === savedActiveId)?.id;
              setActiveProjectId(validActiveId || result.projects[0]?.id);
            } else {
              // No data, create default
              const defaultProjects = [{ ...defaultProject, createdAt: Date.now(), updatedAt: Date.now() }];
              setProjects(defaultProjects);
              setActiveProjectId('default');
              await encryption.saveEncrypted(defaultProjects);
            }
          }
          setDataLoaded(true);
          setIsLoading(false);
          return;
        }

        // Not encrypted - check for migration
        if (needsMigration()) {
          const migratedProjects = migrateUnencryptedData();
          if (migratedProjects) {
            setProjects(migratedProjects);
            setActiveProjectId(migratedProjects[0]?.id || 'default');
          }
        } else {
          // Load from new format
          const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
          if (stored) {
            const parsed = JSON.parse(stored);
            setProjects(parsed);
            // Restore active project
            const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
            const validActiveId = parsed.find(p => p.id === savedActiveId)?.id;
            setActiveProjectId(validActiveId || parsed[0]?.id);
          } else {
            // Fresh install
            const defaultProjects = [{ ...defaultProject, createdAt: Date.now(), updatedAt: Date.now() }];
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProjects));
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, 'default');
            setProjects(defaultProjects);
            setActiveProjectId('default');
            setMigrationComplete();
          }
        }

        setDataLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing projects:', error);
        // Fallback to default
        const defaultProjects = [{ ...defaultProject, createdAt: Date.now(), updatedAt: Date.now() }];
        setProjects(defaultProjects);
        setActiveProjectId('default');
        setDataLoaded(true);
        setIsLoading(false);
      }
    };

    initProjects();
  }, [encryption.isEnabled, encryption.isUnlocked, encryption.loadEncrypted, encryption.saveEncrypted]);

  // Save projects when they change
  useEffect(() => {
    if (!dataLoaded || projects.length === 0) return;

    const saveProjects = async () => {
      if (encryption.isEnabled && encryption.isUnlocked) {
        await encryption.saveEncrypted(projects);
      } else if (!encryption.isEnabled) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      }
    };

    saveProjects();
  }, [projects, dataLoaded, encryption.isEnabled, encryption.isUnlocked, encryption.saveEncrypted]);

  // Save active project ID
  useEffect(() => {
    if (activeProjectId && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, activeProjectId);
    }
  }, [activeProjectId]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.PROJECTS && e.newValue && !encryption.isEnabled) {
        try {
          setProjects(JSON.parse(e.newValue));
        } catch {
          console.warn('Error parsing storage change for projects');
        }
      }
      if (e.key === STORAGE_KEYS.ACTIVE_PROJECT && e.newValue) {
        setActiveProjectId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [encryption.isEnabled]);

  // Create a new project
  const createProject = useCallback((name) => {
    const now = Date.now();
    const newProject = {
      id: generateProjectId(),
      name: name || 'New Project',
      createdAt: now,
      updatedAt: now,
      snippets: []
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);

    return newProject;
  }, []);

  // Update a project
  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: Date.now() }
          : project
      )
    );
  }, []);

  // Delete a project
  const deleteProject = useCallback((projectId) => {
    // Prevent deleting the last project
    if (projects.length <= 1) {
      return { success: false, error: 'Cannot delete the last project' };
    }

    setProjects(prev => {
      const newProjects = prev.filter(p => p.id !== projectId);

      // If we're deleting the active project, switch to another one
      if (activeProjectId === projectId) {
        setActiveProjectId(newProjects[0]?.id);
      }

      return newProjects;
    });

    return { success: true };
  }, [projects.length, activeProjectId]);

  // Switch to a different project
  const switchProject = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProjectId(projectId);
      return { success: true };
    }
    return { success: false, error: 'Project not found' };
  }, [projects]);

  // Duplicate a project
  const duplicateProject = useCallback((projectId) => {
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (!projectToDuplicate) {
      return { success: false, error: 'Project not found' };
    }

    const now = Date.now();
    const newProject = {
      ...projectToDuplicate,
      id: generateProjectId(),
      name: `${projectToDuplicate.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      snippets: projectToDuplicate.snippets.map(s => ({
        ...s,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);

    return { success: true, project: newProject };
  }, [projects]);

  // Update snippets for the active project
  const updateActiveProjectSnippets = useCallback((snippetsOrUpdater) => {
    if (!activeProjectId) return;

    setProjects(prev =>
      prev.map(project => {
        if (project.id === activeProjectId) {
          const newSnippets = typeof snippetsOrUpdater === 'function'
            ? snippetsOrUpdater(project.snippets)
            : snippetsOrUpdater;
          return { ...project, snippets: newSnippets, updatedAt: Date.now() };
        }
        return project;
      })
    );
  }, [activeProjectId]);

  // Reset data to clear state when encryption locks
  const clearProjects = useCallback(() => {
    setProjects([]);
    setDataLoaded(false);
  }, []);

  // Reset all data to defaults for current project
  const resetToDefaults = useCallback(async () => {
    const defaultSnippets = defaultProject.snippets;
    updateActiveProjectSnippets(defaultSnippets);
  }, [updateActiveProjectSnippets]);

  // Reset everything (all projects) to default
  const resetAllToDefaults = useCallback(async () => {
    const defaultProjects = [{ ...defaultProject, createdAt: Date.now(), updatedAt: Date.now() }];
    setProjects(defaultProjects);
    setActiveProjectId('default');

    if (encryption.isEnabled && encryption.isUnlocked) {
      await encryption.saveEncrypted(defaultProjects);
    } else {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProjects));
    }
  }, [encryption.isEnabled, encryption.isUnlocked, encryption.saveEncrypted]);

  const value = {
    // State
    projects,
    activeProject,
    activeProjectId,
    isLoading,
    dataLoaded,

    // Project actions
    createProject,
    updateProject,
    deleteProject,
    switchProject,
    duplicateProject,

    // Snippet actions (on active project)
    updateActiveProjectSnippets,
    resetToDefaults,
    resetAllToDefaults,

    // Utility
    clearProjects,
    setProjects,
    setActiveProjectId
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
