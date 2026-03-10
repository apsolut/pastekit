# Sentinel's Journal

## 2025-05-14 - Backward Compatible PBKDF2 Migration
**Vulnerability:** Weak PBKDF2 iteration count (100,000) below modern OWASP recommendations (600,000).
**Learning:** Increasing iteration count is a breaking change for existing encrypted data if not handled carefully.
**Prevention:** Use a fallback mechanism in decryption and verification functions to try both the new and legacy iteration counts. This allows for seamless migration of data (upon next save) while maintaining access for existing users.

## 2025-05-15 - Defense in Depth: Input Length Limits
**Vulnerability:** Missing input length limits on snippets and projects, leading to potential client-side DoS or memory exhaustion.
**Learning:** In a client-side application where all data is kept in memory (and localStorage), excessively large inputs can degrade performance or crash the browser. Input validation must happen at both the UI level and during data ingestion (imports).
**Prevention:** Implement `maxLength` on all user-facing inputs and enforce the same limits in JSON parsing/import logic to ensure data stays within safe bounds.

## 2025-05-16 - Tiered Defense-in-Depth for Master Passwords
**Vulnerability:** Weak master password requirements (8 chars) and lack of enforcement at the cryptographic layer.
**Learning:** Security requirements should be enforced at multiple layers. While the UI can enforce strict modern standards (e.g., 12 chars + complexity) for new passwords, the underlying cryptographic layer should enforce a baseline security invariant (e.g., 8 chars) to provide defense-in-depth without breaking access for legacy users who haven't updated their passwords yet.
**Prevention:** Use tiered constants (e.g., `MASTER_PASSWORD_MIN` vs `MASTER_PASSWORD_LEGACY_MIN`) and validate in both the UI components and core logic functions.
