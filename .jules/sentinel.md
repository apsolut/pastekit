# Sentinel's Journal

## 2025-05-14 - Backward Compatible PBKDF2 Migration
**Vulnerability:** Weak PBKDF2 iteration count (100,000) below modern OWASP recommendations (600,000).
**Learning:** Increasing iteration count is a breaking change for existing encrypted data if not handled carefully.
**Prevention:** Use a fallback mechanism in decryption and verification functions to try both the new and legacy iteration counts. This allows for seamless migration of data (upon next save) while maintaining access for existing users.
