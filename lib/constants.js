/**
 * Security and Resource Limits
 * Centralized constants to prevent DoS and ensure data integrity.
 */

export const LIMITS = {
  // Input Lengths
  PROJECT_NAME: 50,
  SNIPPET_TITLE: 100,
  FIELD_LABEL: 50,
  FIELD_VALUE: 10000,

  // Resource Counts
  MAX_PROJECTS: 50,
  MAX_SNIPPETS_PER_PROJECT: 200,
  MAX_FIELDS_PER_SNIPPET: 20,

  // Import/File Limits
  MAX_IMPORT_SIZE: 2 * 1024 * 1024, // 2MB
};

export const SECURITY = {
  PBKDF2_ITERATIONS: 600000,
  LEGACY_PBKDF2_ITERATIONS: 100000,
};
