/**
 * Centralized security and application limits
 * These limits help prevent client-side DoS and ensure data consistency.
 */
export const LIMITS = {
  // Input Lengths
  PROJECT_NAME: 50,
  SNIPPET_TITLE: 100,
  FIELD_LABEL: 50,
  FIELD_VALUE: 10000,
  MASTER_PASSWORD: 128,

  // Resource Counts (DoS prevention)
  MAX_PROJECTS: 50,
  MAX_SNIPPETS_PER_PROJECT: 200,
  MAX_FIELDS_PER_SNIPPET: 20,

  // Import Limits
  MAX_IMPORT_FILE_SIZE: 2 * 1024 * 1024, // 2MB
};

export default {
  LIMITS,
};
