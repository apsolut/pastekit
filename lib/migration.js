import { defaultProject } from '@/data/defaultProject';

const STORAGE_KEYS = {
  // Legacy keys
  LEGACY_SNIPPETS: 'pastekit-snippets',
  LEGACY_ENCRYPTED_SNIPPETS: 'pastekit-encrypted-snippets',

  // New keys
  PROJECTS: 'pastekit-projects',
  ENCRYPTED_PROJECTS: 'pastekit-encrypted-projects',
  ACTIVE_PROJECT: 'pastekit-active-project',
  MIGRATION_VERSION: 'pastekit-migration-version'
};

const CURRENT_MIGRATION_VERSION = 2;

/**
 * Generate a unique project ID
 */
export function generateProjectId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new project with given name and optional snippets
 */
export function createProject(name, snippets = []) {
  const now = Date.now();
  return {
    id: generateProjectId(),
    name,
    createdAt: now,
    updatedAt: now,
    snippets
  };
}

/**
 * Wrap snippets in a default project structure
 */
function wrapSnippetsInProject(snippets) {
  return {
    ...defaultProject,
    id: 'default',
    name: 'Default',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    snippets: snippets || defaultProject.snippets
  };
}

/**
 * Check if migration is needed
 */
export function needsMigration() {
  if (typeof window === 'undefined') return false;

  const version = localStorage.getItem(STORAGE_KEYS.MIGRATION_VERSION);
  const currentVersion = version ? parseInt(version, 10) : 0;

  return currentVersion < CURRENT_MIGRATION_VERSION;
}

/**
 * Get the current migration version
 */
export function getMigrationVersion() {
  if (typeof window === 'undefined') return 0;

  const version = localStorage.getItem(STORAGE_KEYS.MIGRATION_VERSION);
  return version ? parseInt(version, 10) : 0;
}

/**
 * Check if there's existing data to migrate (unencrypted)
 */
export function hasLegacyData() {
  if (typeof window === 'undefined') return false;

  return !!localStorage.getItem(STORAGE_KEYS.LEGACY_SNIPPETS);
}

/**
 * Check if there's existing encrypted data to migrate
 */
export function hasLegacyEncryptedData() {
  if (typeof window === 'undefined') return false;

  return !!localStorage.getItem(STORAGE_KEYS.LEGACY_ENCRYPTED_SNIPPETS);
}

/**
 * Migrate unencrypted snippets to projects structure
 * Returns the migrated projects array or null if no migration needed
 */
export function migrateUnencryptedData() {
  if (typeof window === 'undefined') return null;

  const legacySnippets = localStorage.getItem(STORAGE_KEYS.LEGACY_SNIPPETS);

  if (!legacySnippets) {
    // No legacy data, create default project
    const projects = [{ ...defaultProject, createdAt: Date.now(), updatedAt: Date.now() }];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, 'default');
    localStorage.setItem(STORAGE_KEYS.MIGRATION_VERSION, CURRENT_MIGRATION_VERSION.toString());
    return projects;
  }

  try {
    const snippets = JSON.parse(legacySnippets);
    const migratedProject = wrapSnippetsInProject(snippets);
    const projects = [migratedProject];

    // Write new format
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, 'default');
    localStorage.setItem(STORAGE_KEYS.MIGRATION_VERSION, CURRENT_MIGRATION_VERSION.toString());

    // Keep old key for rollback safety (will be removed in future version)
    // localStorage.removeItem(STORAGE_KEYS.LEGACY_SNIPPETS);

    return projects;
  } catch (error) {
    console.error('Migration failed:', error);
    return null;
  }
}

/**
 * Migrate encrypted data to projects structure
 * This only handles the unencrypted wrapper - actual encrypted data
 * needs to be decrypted, migrated, and re-encrypted by EncryptionContext
 *
 * @param {Array} decryptedSnippets - The decrypted snippets array
 * @returns {Array} - Projects array with snippets wrapped in default project
 */
export function migrateEncryptedData(decryptedSnippets) {
  if (!decryptedSnippets || !Array.isArray(decryptedSnippets)) {
    return [{ ...defaultProject, createdAt: Date.now(), updatedAt: Date.now() }];
  }

  const migratedProject = wrapSnippetsInProject(decryptedSnippets);
  return [migratedProject];
}

/**
 * Set migration complete
 */
export function setMigrationComplete() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MIGRATION_VERSION, CURRENT_MIGRATION_VERSION.toString());
}

/**
 * Get storage keys (for use by other modules)
 */
export function getStorageKeys() {
  return { ...STORAGE_KEYS };
}

export { STORAGE_KEYS, CURRENT_MIGRATION_VERSION };
