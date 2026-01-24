'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { SnippetGrid } from '@/components/SnippetGrid';
import { Toast } from '@/components/Toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/hooks/useTheme';
import { defaultSnippets } from '@/data/defaultSnippets';
import { cn } from '@/lib/utils';

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function Home() {
  // Theme management
  const { isDark, toggleTheme, mounted } = useTheme();

  // Snippets state with localStorage persistence
  const [snippets, setSnippets] = useLocalStorage('pastekit-snippets', defaultSnippets);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useLocalStorage('pastekit-edit-mode', false);

  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

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
    const newSnippet = {
      id: generateId(),
      title: '',
      fields: [
        { label: '', value: '', type: 'text' }
      ]
    };
    setSnippets(prev => [newSnippet, ...prev]);

    // Auto-enable edit mode when adding
    if (!isEditMode) {
      setIsEditMode(true);
    }

    showToast('New snippet added!', 'success');
  }, [setSnippets, isEditMode, setIsEditMode, showToast]);

  // Update snippet
  const handleUpdateSnippet = useCallback((id, updates) => {
    setSnippets(prev =>
      prev.map(snippet =>
        snippet.id === id ? { ...snippet, ...updates } : snippet
      )
    );
  }, [setSnippets]);

  // Delete snippet
  const handleDeleteSnippet = useCallback((id) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== id));
    showToast('Snippet deleted', 'success');
  }, [setSnippets, showToast]);

  // Copy snippet field
  const handleCopySnippet = useCallback((id) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      showToast(`Copied from "${snippet.title || 'Snippet'}"`, 'success');
    }
  }, [snippets, showToast]);

  // Reorder snippets (drag and drop)
  const handleReorderSnippets = useCallback((newSnippets) => {
    setSnippets(newSnippets);
  }, [setSnippets]);

  // Export snippets as JSON
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pastekit-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Snippets exported!', 'success');
  }, [snippets, showToast]);

  // Trigger file input for import
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Import snippets from JSON file
  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate structure
        if (!Array.isArray(imported)) {
          showToast('Invalid file: expected an array of snippets', 'error');
          return;
        }

        // Validate each snippet has required fields
        const isValid = imported.every(snippet =>
          snippet &&
          typeof snippet.id === 'string' &&
          typeof snippet.title === 'string' &&
          Array.isArray(snippet.fields)
        );

        if (!isValid) {
          showToast('Invalid file: snippets have invalid structure', 'error');
          return;
        }

        setSnippets(imported);
        showToast(`Imported ${imported.length} snippet${imported.length !== 1 ? 's' : ''}!`, 'success');
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    event.target.value = '';
  }, [setSnippets, showToast]);

  // Reset all data to defaults
  const handleReset = useCallback(() => {
    setSnippets(defaultSnippets);
    setIsEditMode(false);
    showToast('All data reset to defaults', 'success');
  }, [setSnippets, setIsEditMode, showToast]);

  // Keyboard shortcut: Ctrl+S to save and lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditMode) {
          setIsEditMode(false);
          showToast('Saved & locked!', 'success');
        } else {
          showToast('Already in view mode', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, setIsEditMode, showToast]);

  // Don't render until theme is mounted to avoid flash
  if (!mounted) {
    return null;
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
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onAddSnippet={handleAddSnippet}
        onExport={handleExport}
        onImport={handleImportClick}
        onReset={handleReset}
        snippetCount={snippets.length}
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

          <AccordionItem value="export">
            <AccordionTrigger>Can I export and import my snippets?</AccordionTrigger>
            <AccordionContent>
              Yes! Click the &quot;Export&quot; button in the header to download all your snippets as a JSON file.
              This allows you to backup your data, transfer it to another browser, or share snippet
              collections with others. To restore or load snippets, click &quot;Import&quot; and select a previously
              exported JSON file. The imported snippets will replace your current collection.
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

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground">
          Your snippets are saved locally in your browser
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          by <a href="https://apsolut.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">AP</a>
        </p>
      </footer>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
