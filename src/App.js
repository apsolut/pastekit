import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SnippetGrid } from '@/components/SnippetGrid';
import { Toast } from '@/components/Toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/hooks/useTheme';
import { defaultSnippets } from '@/data/defaultSnippets';
import { cn } from '@/lib/utils';
import '@/App.css';

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function App() {
  // Theme management
  const { isDark, toggleTheme, mounted } = useTheme();
  
  // Snippets state with localStorage persistence
  const [snippets, setSnippets] = useLocalStorage('pastekit-snippets', defaultSnippets);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useLocalStorage('pastekit-edit-mode', false);
  
  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

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
      content: ''
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

  // Copy snippet
  const handleCopySnippet = useCallback((id) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      showToast(`"${snippet.title || 'Snippet'}" copied!`, 'success');
    }
  }, [snippets, showToast]);

  // Reorder snippets (drag and drop)
  const handleReorderSnippets = useCallback((newSnippets) => {
    setSnippets(newSnippets);
  }, [setSnippets]);

  // Don't render until theme is mounted to avoid flash
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onAddSnippet={handleAddSnippet}
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

export default App;
