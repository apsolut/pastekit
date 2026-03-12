# Sentinel's Journal

## 2025-05-14 - Backward Compatible PBKDF2 Migration
**Vulnerability:** Weak PBKDF2 iteration count (100,000) below modern OWASP recommendations (600,000).
**Learning:** Increasing iteration count is a breaking change for existing encrypted data if not handled carefully.
**Prevention:** Use a fallback mechanism in decryption and verification functions to try both the new and legacy iteration counts. This allows for seamless migration of data (upon next save) while maintaining access for existing users.

## 2025-05-15 - Defense in Depth: Input Length Limits
**Vulnerability:** Missing input length limits on snippets and projects, leading to potential client-side DoS or memory exhaustion.
**Learning:** In a client-side application where all data is kept in memory (and localStorage), excessively large inputs can degrade performance or crash the browser. Input validation must happen at both the UI level and during data ingestion (imports).
**Prevention:** Implement `maxLength` on all user-facing inputs and enforce the same limits in JSON parsing/import logic to ensure data stays within safe bounds.

## 2025-05-16 - Tiered Master Password Validation
**Vulnerability:** Weak master password requirements (8 characters) allowed easily guessable passwords for encryption.
**Learning:** Increasing security requirements for existing users can be disruptive. A tiered approach allows for stronger requirements for new/changed passwords (12 chars + complexity check) while maintaining a lower "legacy" minimum (8 chars) in the cryptographic layer to ensure existing users aren't locked out of their data until they choose to update their password.
**Prevention:** Enforce strict validation in the UI for all write/change operations, but keep a broader compatibility range in the core security libraries to support legacy data. Implement a unique character count check (e.g., min 4 unique characters) to prevent simple repeating patterns that meet length requirements but offer low entropy.
