# Sentinel's Journal

## 2025-05-14 - Backward Compatible PBKDF2 Migration
**Vulnerability:** Weak PBKDF2 iteration count (100,000) below modern OWASP recommendations (600,000).
**Learning:** Increasing iteration count is a breaking change for existing encrypted data if not handled carefully.
**Prevention:** Use a fallback mechanism in decryption and verification functions to try both the new and legacy iteration counts. This allows for seamless migration of data (upon next save) while maintaining access for existing users.

## 2025-05-15 - Defense in Depth: Input Length Limits
**Vulnerability:** Missing input length limits on snippets and projects, leading to potential client-side DoS or memory exhaustion.
**Learning:** In a client-side application where all data is kept in memory (and localStorage), excessively large inputs can degrade performance or crash the browser. Input validation must happen at both the UI level and during data ingestion (imports).
**Prevention:** Implement `maxLength` on all user-facing inputs and enforce the same limits in JSON parsing/import logic to ensure data stays within safe bounds.

## 2025-05-16 - Tiered Password Validation & Defense in Depth
**Vulnerability:** Weak master password policy (8 chars) susceptible to brute-force or simple password selection.
**Learning:** Security policy should be enforced both at the UI layer (for UX and strict requirements like unique characters) and the cryptographic layer (as a final safeguard). Maintaining a lower "legacy" minimum at the crypto layer prevents locking out existing users while encouraging new users to adopt stronger practices.
**Prevention:** Use a centralized validation utility for UI checks and implement final length checks in core cryptographic functions before performing sensitive operations.
