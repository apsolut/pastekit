'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { SnippetGrid } from '@/components/SnippetGrid';
import { Toast } from '@/components/Toast';
import { ProjectSelector } from '@/components/ProjectSelector';
import {
  CreateProjectModal,
  RenameProjectModal,
  DeleteProjectModal,
  ManageProjectsModal
} from '@/components/ProjectModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  EncryptionSetupModal,
  EncryptionUnlockModal,
  DisableEncryptionModal,
  ChangePasswordModal
} from '@/components/EncryptionModal';
import { EncryptionProvider, useEncryption } from '@/contexts/EncryptionContext';
import { ProjectProvider, useProjects } from '@/contexts/ProjectContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/hooks/useTheme';
import { defaultSnippets } from '@/data/defaultSnippets';
import { cn } from '@/lib/utils';
import { LIMITS } from '@/lib/constants';

// Generate unique ID
const generateId = () => crypto.randomUUID();

function HomeContent() {
  // Theme management
  const { isDark, toggleTheme, mounted } = useTheme();

  // Encryption context
  const encryption = useEncryption();

  // Projects context
  const projectsCtx = useProjects();
  const {
    projects,
    activeProject,
    activeProjectId,
    isLoading: projectsLoading,
    dataLoaded,
    createProject,
    updateProject,
    deleteProject,
    switchProject,
    duplicateProject,
    updateActiveProjectSnippets,
    resetToDefaults,
    resetAllToDefaults,
    clearProjects
  } = projectsCtx;

  // Get snippets from active project
  const snippets = activeProject?.snippets || [];

  // Edit mode state
  const [isEditMode, setIsEditMode] = useLocalStorage('pastekit-edit-mode', false);

  // Security warning dismissed state
  const [warningDismissed, setWarningDismissed] = useLocalStorage('pastekit-security-warning-dismissed', false);

  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Encryption modal states
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Project modal states
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [manageProjectsModalOpen, setManageProjectsModalOpen] = useState(false);
  const [renameProjectModalOpen, setRenameProjectModalOpen] = useState(false);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // File input ref for import
  const fileInputRef = useRef(null);

  // Show toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Toggle edit mode
  const handleToggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, [setIsEditMode]);

  // Add new snippet
  const handleAddSnippet = useCallback(() => {
    if (snippets.length >= LIMITS.MAX_SNIPPETS_PER_PROJECT) {
      showToast(`Maximum snippets per project reached (${LIMITS.MAX_SNIPPETS_PER_PROJECT})`, 'error');
      return;
    }

    const newSnippet = {
      id: generateId(),
      title: '',
      fields: [
        { label: '', value: '', type: 'text' }
      ]
    };
    updateActiveProjectSnippets(prev => [newSnippet, ...prev]);

    // Auto-enable edit mode when adding
    if (!isEditMode) {
      setIsEditMode(true);
    }

    showToast('New snippet added!', 'success');
  }, [updateActiveProjectSnippets, isEditMode, setIsEditMode, showToast, snippets.length]);

  // Update snippet
  const handleUpdateSnippet = useCallback((id, updates) => {
    updateActiveProjectSnippets(prev =>
      prev.map(snippet =>
        snippet.id === id ? { ...snippet, ...updates } : snippet
      )
    );
  }, [updateActiveProjectSnippets]);

  // Delete snippet
  const handleDeleteSnippet = useCallback((id) => {
    updateActiveProjectSnippets(prev => prev.filter(snippet => snippet.id !== id));
    showToast('Snippet deleted', 'success');
  }, [updateActiveProjectSnippets, showToast]);

  // Copy snippet field
  const handleCopySnippet = useCallback((id) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      showToast(`Copied from "${snippet.title || 'Snippet'}"`, 'success');
    }
  }, [snippets, showToast]);

  // Reorder snippets (drag and drop)
  const handleReorderSnippets = useCallback((newSnippets) => {
    updateActiveProjectSnippets(newSnippets);
  }, [updateActiveProjectSnippets]);

  // Export current project's snippets as JSON
  const handleExportCurrentProject = useCallback(() => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const projectName = activeProject?.name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'project';
    link.download = `pastekit-${projectName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported "${activeProject?.name}" project!`, 'success');
  }, [snippets, activeProject, showToast]);

  // Export all projects as JSON
  const handleExportAllProjects = useCallback(() => {
    const exportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      projects: projects
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pastekit-all-projects-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${projects.length} project${projects.length !== 1 ? 's' : ''}!`, 'success');
  }, [projects, showToast]);

  // Trigger file input for import
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Import from JSON file (handles both snippet arrays and full project exports)
  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: File size limit to prevent DoS
    if (file.size > LIMITS.MAX_IMPORT_FILE_SIZE) {
      showToast(`File too large (max ${LIMITS.MAX_IMPORT_FILE_SIZE / (1024 * 1024)}MB)`, 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Helper to sanitize snippets
        const sanitizeSnippets = (snippets) => {
          return snippets.map(snippet => ({
            ...snippet,
            title: (snippet.title || '').substring(0, LIMITS.SNIPPET_TITLE),
            fields: (snippet.fields || []).map(field => ({
              ...field,
              label: (field.label || '').substring(0, LIMITS.FIELD_LABEL),
              value: (field.value || '').substring(0, LIMITS.FIELD_VALUE)
            }))
          }));
        };

        // Check if it's a full projects export (version 2 format)
        if (imported.version === 2 && Array.isArray(imported.projects)) {
          // Security: Limit number of projects
          if (imported.projects.length > LIMITS.MAX_PROJECTS) {
            showToast(`Too many projects (max ${LIMITS.MAX_PROJECTS})`, 'error');
            return;
          }

          // Validate projects structure
          const isValid = imported.projects.every(project => {
            if (!project || typeof project.id !== 'string' || typeof project.name !== 'string') {
              return false;
            }
            if (project.name.length > LIMITS.PROJECT_NAME) return false;
            if (!Array.isArray(project.snippets)) {
              return false;
            }

            // Security: Limit snippets per project
            if (project.snippets.length > LIMITS.MAX_SNIPPETS_PER_PROJECT) return false;

            return project.snippets.every(snippet => {
              if (!snippet || typeof snippet.id !== 'string' || typeof snippet.title !== 'string') {
                return false;
              }
              if (snippet.title.length > LIMITS.SNIPPET_TITLE) return false;
              if (!Array.isArray(snippet.fields)) {
                return false;
              }

              // Security: Limit fields per snippet
              if (snippet.fields.length > LIMITS.MAX_FIELDS_PER_SNIPPET) return false;

              return snippet.fields.every(field =>
                field &&
                typeof field.label === 'string' &&
                typeof field.value === 'string' &&
                ['text', 'password', 'rich'].includes(field.type) &&
                field.label.length <= LIMITS.FIELD_LABEL &&
                field.value.length <= LIMITS.FIELD_VALUE
              );
            });
          });

          if (!isValid) {
            showToast('Invalid file: projects have invalid structure or exceed limits', 'error');
            return;
          }

          // Sanitize projects
          const sanitizedProjects = imported.projects.map(project => ({
            ...project,
          name: project.name.substring(0, LIMITS.PROJECT_NAME),
            snippets: sanitizeSnippets(project.snippets)
          }));

          // Import all projects
          projectsCtx.setProjects(sanitizedProjects);
          projectsCtx.setActiveProjectId(sanitizedProjects[0]?.id);
          showToast(`Imported ${sanitizedProjects.length} project${sanitizedProjects.length !== 1 ? 's' : ''}!`, 'success');
          return;
        }

        // Legacy format - array of snippets
        if (!Array.isArray(imported)) {
          showToast('Invalid file: expected an array of snippets or projects export', 'error');
          return;
        }

        // Security: Limit snippets for legacy import
        if (imported.length > LIMITS.MAX_SNIPPETS_PER_PROJECT) {
          showToast(`Too many snippets (max ${LIMITS.MAX_SNIPPETS_PER_PROJECT})`, 'error');
          return;
        }

        // Validate each snippet has required fields and valid structure
        const isValid = imported.every(snippet => {
          if (!snippet || typeof snippet.id !== 'string' || typeof snippet.title !== 'string') {
            return false;
          }
          if (snippet.title.length > LIMITS.SNIPPET_TITLE) return false;
          if (!Array.isArray(snippet.fields)) {
            return false;
          }

          // Security: Limit fields per snippet
          if (snippet.fields.length > LIMITS.MAX_FIELDS_PER_SNIPPET) return false;

          return snippet.fields.every(field =>
            field &&
            typeof field.label === 'string' &&
            typeof field.value === 'string' &&
            ['text', 'password', 'rich'].includes(field.type) &&
            field.label.length <= LIMITS.FIELD_LABEL &&
            field.value.length <= LIMITS.FIELD_VALUE
          );
        });

        if (!isValid) {
          showToast('Invalid file: snippets have invalid structure or exceed limits', 'error');
          return;
        }

        const sanitizedSnippets = sanitizeSnippets(imported);

        // Import into current project
        updateActiveProjectSnippets(sanitizedSnippets);
        showToast(`Imported ${sanitizedSnippets.length} snippet${sanitizedSnippets.length !== 1 ? 's' : ''} into "${activeProject?.name}"!`, 'success');
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    event.target.value = '';
  }, [updateActiveProjectSnippets, activeProject, projectsCtx, showToast]);

  // Reset current project to defaults
  const handleReset = useCallback(async () => {
    await resetToDefaults();
    // Enable edit mode so user can immediately customize/delete defaults
    setIsEditMode(true);
    showToast('Project reset to defaults - Edit Mode enabled', 'success');
  }, [resetToDefaults, setIsEditMode, showToast]);

  // Handle encryption button click
  const handleEncryptionClick = useCallback(() => {
    if (!encryption.isEnabled) {
      setSetupModalOpen(true);
    } else if (encryption.isUnlocked) {
      setDisableModalOpen(true);
    }
  }, [encryption.isEnabled, encryption.isUnlocked]);

  // Setup encryption
  const handleSetupEncryption = useCallback(async (password) => {
    const result = await encryption.enableEncryption(password, projects);
    if (result.success) {
      showToast('Encryption enabled!', 'success');
      setWarningDismissed(true);
    }
    return result;
  }, [encryption, projects, showToast, setWarningDismissed]);

  // Unlock encryption
  const handleUnlock = useCallback(async (password) => {
    const result = await encryption.unlock(password);
    if (result.success) {
      showToast('Unlocked!', 'success');
    }
    return result;
  }, [encryption, showToast]);

  // Disable encryption
  const handleDisableEncryption = useCallback(async (password) => {
    const result = await encryption.disableEncryption(password, projects);
    if (result.success) {
      showToast('Encryption disabled', 'success');
    }
    return result;
  }, [encryption, projects, showToast]);

  // Change password
  const handleChangePassword = useCallback(async (oldPassword, newPassword) => {
    const result = await encryption.changePassword(oldPassword, newPassword, projects);
    if (result.success) {
      showToast('Password changed!', 'success');
    }
    return result;
  }, [encryption, projects, showToast]);

  // Dismiss security warning
  const handleDismissWarning = useCallback(() => {
    setWarningDismissed(true);
  }, [setWarningDismissed]);

  // Lock encryption and clear data from memory
  const handleLock = useCallback(() => {
    encryption.lock();
    clearProjects();
    showToast('Locked - data cleared from memory', 'success');
  }, [clearProjects, encryption, showToast]);

  // Project handlers
  const handleCreateProject = useCallback((name) => {
    if (projects.length >= LIMITS.MAX_PROJECTS) {
      showToast(`Maximum number of projects reached (${LIMITS.MAX_PROJECTS})`, 'error');
      return;
    }
    const project = createProject(name);
    showToast(`Created project "${project.name}"`, 'success');
  }, [createProject, showToast, projects.length]);

  const handleRenameProject = useCallback((projectId, newName) => {
    updateProject(projectId, { name: newName });
    showToast('Project renamed', 'success');
  }, [updateProject, showToast]);

  const handleDeleteProject = useCallback((projectId) => {
    const result = deleteProject(projectId);
    if (result.success) {
      showToast('Project deleted', 'success');
    } else {
      showToast(result.error, 'error');
    }
  }, [deleteProject, showToast]);

  const handleDuplicateProject = useCallback((projectId) => {
    if (projects.length >= LIMITS.MAX_PROJECTS) {
      showToast(`Maximum number of projects reached (${LIMITS.MAX_PROJECTS})`, 'error');
      return;
    }
    const result = duplicateProject(projectId);
    if (result.success) {
      showToast(`Duplicated project as "${result.project.name}"`, 'success');
    } else {
      showToast(result.error, 'error');
    }
  }, [duplicateProject, showToast, projects.length]);

  const handleSwitchProject = useCallback((projectId) => {
    const result = switchProject(projectId);
    if (result.success) {
      const project = projects.find(p => p.id === projectId);
      showToast(`Switched to "${project?.name}"`, 'success');
    }
  }, [switchProject, projects, showToast]);

  // Save and exit edit mode
  const handleSave = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
      showToast('Saved & locked!', 'success');
    }
  }, [isEditMode, setIsEditMode, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S to save and exit edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditMode) {
          setIsEditMode(false);
          showToast('Saved & locked!', 'success');
        } else {
          showToast('Already in view mode', 'success');
        }
      }
      // Ctrl+L to lock encryption (clear from memory)
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        if (encryption.isEnabled && encryption.isUnlocked) {
          e.preventDefault();
          handleLock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, setIsEditMode, showToast, encryption.isEnabled, encryption.isUnlocked, handleLock]);

  // Don't render until theme is mounted and data is ready
  if (!mounted || encryption.isLoading || projectsLoading) {
    return null;
  }

  // Show unlock modal if encryption is enabled but not unlocked
  if (encryption.isEnabled && !encryption.isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <EncryptionUnlockModal
          open={true}
          onUnlock={handleUnlock}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Header */}
      <Header
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        onSave={handleSave}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onAddSnippet={handleAddSnippet}
        onExport={handleExportCurrentProject}
        onExportCurrentProject={handleExportCurrentProject}
        onExportAllProjects={handleExportAllProjects}
        onImport={handleImportClick}
        onReset={handleReset}
        snippetCount={snippets.length}
        encryptionEnabled={encryption.isEnabled}
        encryptionUnlocked={encryption.isUnlocked}
        onEncryptionClick={handleEncryptionClick}
        onLock={handleLock}
        projects={projects}
        activeProject={activeProject}
        onSwitchProject={handleSwitchProject}
        onCreateProject={() => setCreateProjectModalOpen(true)}
        onManageProjects={() => setManageProjectsModalOpen(true)}
        projectSelector={
          <ProjectSelector
            projects={projects}
            activeProject={activeProject}
            onSwitchProject={handleSwitchProject}
            onCreateProject={() => setCreateProjectModalOpen(true)}
            onManageProjects={() => setManageProjectsModalOpen(true)}
          />
        }
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Indicator Banner */}
        <div className={cn(
          "mb-6 px-4 py-3 rounded-xl border transition-all duration-300",
          isEditMode
            ? "bg-ghibli-gold/5 border-ghibli-gold/20"
            : "bg-primary/5 border-primary/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse-soft",
                isEditMode ? "bg-ghibli-gold" : "bg-primary"
              )} />
              <p className="text-sm font-medium text-foreground">
                {isEditMode ? (
                  <>
                    <span className="text-ghibli-gold">Edit Mode</span>
                    <span className="text-muted-foreground ml-2">
                      — Edit titles, content, delete cards, or drag to reorder
                    </span>
                    <span className="text-muted-foreground/60 ml-2 hidden sm:inline">
                      (Ctrl+S to save & lock)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-primary">View Mode</span>
                    <span className="text-muted-foreground ml-2">
                      — Click any card to copy its content instantly
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Snippet Grid */}
        <SnippetGrid
          snippets={snippets}
          isEditMode={isEditMode}
          onUpdateSnippet={handleUpdateSnippet}
          onDeleteSnippet={handleDeleteSnippet}
          onCopySnippet={handleCopySnippet}
          onReorderSnippets={handleReorderSnippets}
        />
      </main>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is">
            <AccordionTrigger>What is PasteKit?</AccordionTrigger>
            <AccordionContent>
              PasteKit is a simple, fast clipboard snippet manager that runs entirely in your browser.
              It helps you store frequently used text snippets like code snippets, API keys, commands,
              credentials, and templates for quick one-click copying. No account needed, no server required.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-to-copy">
            <AccordionTrigger>How do I copy a snippet?</AccordionTrigger>
            <AccordionContent>
              Simply click on any field within a snippet card to instantly copy its content to your clipboard.
              You&apos;ll see a checkmark confirmation when the copy is successful. Make sure you&apos;re in View Mode
              (not Edit Mode) for one-click copying to work.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-to-edit">
            <AccordionTrigger>How do I add or edit snippets?</AccordionTrigger>
            <AccordionContent>
              Toggle the Edit Mode switch in the header. In Edit Mode, you can: add new snippets with the
              &quot;Add&quot; button, edit titles and field values directly, change field types (text, password, multiline),
              add or remove fields from each card, delete entire cards, and drag cards to reorder them.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="projects">
            <AccordionTrigger>What are Projects?</AccordionTrigger>
            <AccordionContent>
              Projects let you organize your snippets into separate collections. For example, you might have
              a &quot;Work&quot; project for work-related credentials and a &quot;Personal&quot; project for personal snippets.
              Click the project name in the header to switch between projects, create new ones, or manage existing ones.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="field-types">
            <AccordionTrigger>What are the different field types?</AccordionTrigger>
            <AccordionContent>
              PasteKit supports three field types: <strong>Text</strong> for regular single-line content,
              <strong>Password</strong> for sensitive data that stays masked until you click the eye icon,
              and <strong>Multiline</strong> for code snippets and longer text that preserves formatting.
              Click the field icon in Edit Mode to cycle between types.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-storage">
            <AccordionTrigger>Where is my data saved?</AccordionTrigger>
            <AccordionContent>
              All your snippets are saved locally in your browser&apos;s localStorage. Your data never leaves
              your device and is not sent to any server. This means your snippets are private and secure,
              but also means they won&apos;t sync across devices automatically.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-3">
                By default, your data is stored in plain text in your browser&apos;s localStorage. You can enable
                encryption by clicking the shield icon in the header, which encrypts your data with a master
                password using strong cryptography (XSalsa20-Poly1305).
              </p>
              <p className="mb-3">
                <strong>What encryption protects against:</strong> Someone copying your browser profile or
                localStorage files, backup extraction, and casual snooping. When locked, your data is unreadable
                without the password.
              </p>
              <p className="mb-3">
                <strong>What encryption does NOT protect against:</strong> Active malware running while the app
                is unlocked, keyloggers, malicious browser extensions, or screen capture software. When you unlock
                PasteKit, the decrypted data exists in browser memory and can be accessed by malicious software.
              </p>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Do not store real passwords, banking credentials, or production API keys here. For critical
                secrets, use a dedicated password manager like Bitwarden or 1Password that offers secure memory
                handling and process isolation. PasteKit is designed for convenience snippets, not as a
                security vault.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export">
            <AccordionTrigger>Can I export and import my snippets?</AccordionTrigger>
            <AccordionContent>
              Yes! Click the menu button in the header to access export options. You can export just the current
              project or all projects at once. To restore or load snippets, click &quot;Import&quot; and select a previously
              exported JSON file. Importing a single-project export will replace the current project&apos;s snippets,
              while importing a full backup will replace all your projects.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="why-pastekit">
            <AccordionTrigger>Why use PasteKit instead of a notes app?</AccordionTrigger>
            <AccordionContent>
              PasteKit is optimized for quick access and one-click copying. Unlike notes apps, each field
              is independently copyable, passwords stay hidden, and the interface is designed for rapid
              retrieval. It&apos;s perfect for developers, sysadmins, and anyone who frequently copies the same
              text snippets throughout their day.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Security Warning Banner - shown at bottom on first visit */}
      {!warningDismissed && !encryption.isEnabled && (
        <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="px-4 py-3 rounded-xl border bg-amber-500/10 border-amber-500/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Security Notice
                  </p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                    PasteKit is for convenience snippets, not a password vault. Do not store real passwords or
                    banking credentials here - use a dedicated password manager instead.
                    <button
                      onClick={() => setSetupModalOpen(true)}
                      className="ml-1 underline hover:no-underline"
                    >
                      Enable encryption
                    </button>
                    {' '}for basic protection of your snippets.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissWarning}
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 p-1 rounded"
                aria-label="Dismiss warning"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground">
          Your snippets are saved locally in your browser
          {encryption.isEnabled && ' (encrypted)'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          by <a href="https://apsolut.dev/" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">AP</a>
        </p>
      </footer>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Encryption Modals */}
      <EncryptionSetupModal
        open={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onSetup={handleSetupEncryption}
      />

      <DisableEncryptionModal
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        onDisable={handleDisableEncryption}
      />

      <ChangePasswordModal
        open={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onChange={handleChangePassword}
      />

      {/* Project Modals */}
      <CreateProjectModal
        open={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />

      <RenameProjectModal
        open={renameProjectModalOpen}
        onClose={() => setRenameProjectModalOpen(false)}
        project={selectedProject}
        onRename={handleRenameProject}
      />

      <DeleteProjectModal
        open={deleteProjectModalOpen}
        onClose={() => setDeleteProjectModalOpen(false)}
        project={selectedProject}
        onDelete={handleDeleteProject}
        projectCount={projects.length}
      />

      <ManageProjectsModal
        open={manageProjectsModalOpen}
        onClose={() => setManageProjectsModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onRename={(project) => {
          setSelectedProject(project);
          setManageProjectsModalOpen(false);
          setRenameProjectModalOpen(true);
        }}
        onDuplicate={(projectId) => {
          handleDuplicateProject(projectId);
        }}
        onDelete={(project) => {
          setSelectedProject(project);
          setManageProjectsModalOpen(false);
          setDeleteProjectModalOpen(true);
        }}
        onSwitch={handleSwitchProject}
      />
    </div>
  );
}

export default function Home() {
  return (
    <EncryptionProvider>
      <ProjectProvider>
        <HomeContent />
      </ProjectProvider>
    </EncryptionProvider>
  );
}
