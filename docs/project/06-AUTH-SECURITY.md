# 06 — Authentication and security

## Identity and tokens

Passwords use bcrypt cost 12; validation enforces 8+ characters and at most 72 UTF-8 bytes. Registration creates regular users regardless of supplied role. HS256 access tokens expire after 15 minutes, refresh tokens after 7 days, using distinct environment secrets of at least 32 characters. Verification restricts algorithms and validates identity/timestamps/role/JTI.

Access tokens live only in memory. Axios coordinates a single refresh across bootstrap/interceptors, avoids recursion, and reuses renewed tokens for late 401s. Session versioning prevents old requests restoring logged-out identity. Identity-dependent caches are invalidated on account changes. StrictMode verification reuses one pending request to avoid consuming the token twice.

Login stores one RefreshToken document: user, stable random JTI, SHA-256 token hash, expiry, revocation. Rotation signs a distinct nonce and conditionally replaces the presented current hash; concurrent requests cannot mint two accepted successors. Valid-token replay revokes all stored refresh sessions for that user. Revoked records remain until TTL expiry. Independent tabs can still race and fail closed, requiring sign-in again.

Logout revokes the cookie session without requiring a valid access JWT and clears matching cookie attributes. Ordinary logout leaves already-issued access JWTs valid for their remaining lifetime (at most 15 minutes). Password reset increments authVersion, checked against the current database user on protected requests/refresh, immediately rejecting old credentials.

## Verification and recovery

Tokens use 32 random bytes encoded as 64 hex characters; only SHA-256 hashes are stored. Verification expires after 24 hours; reset after one hour. Conditional updates consume each once. Forgot-password returns the same message whether the email exists or not. Unverified accounts may log in; verification is a state change, not an admission gate.

Development alone prints simulated delivery links to the private terminal. Never publish/record these sensitive links. Production/test do not print them. **Production email delivery remains unconfigured**: integrate a private provider before public verification/recovery. Do not return tokens in normal API responses.

## Browser boundary

Cookie: httpOnly, path /api/auth, seven-day maxAge, Secure in production, no Domain attribute. SameSite defaults strict; lax supported; none permitted only in production. CLIENT_URL is an exact origin without path/trailing slash and requires HTTPS in production.

CORS allows credentials for CLIENT_URL. All auth routes reject supplied foreign Origins; SameSite=none also rejects missing Origin. Protected resource writes use Bearer identity. CORS alone is not authorization. Third-party-cookie restrictions can block unrelated frontend/API domains despite correct flags; prefer same-site domains or an origin proxy.

Auth responses are no-store. Helmet protects API responses; static-host configuration adds baseline headers. Markdown skips raw HTML, rejects unsafe protocols, suppresses remote images and disables feed-excerpt links. In-memory storage reduces persistent token exposure but does not make JavaScript immune to XSS.

## Authorization, validation and abuse

Middleware loads current database role/authVersion. Author/admin checks are enforced in services; clients cannot set roles, author, counters or status through general post edits. Public projections omit passwords, tokens/sessions, private emails and voters. Auth endpoints intentionally return access tokens.

Zod validates/strips bodies and rejects invalid queries; services construct controlled MongoDB filters. Pagination/enums/search/body sizes are bounded. JSON bodies over 32 KiB return 413. Generic errors omit stack traces, raw database errors and rejected values.

express-rate-limit applies per-IP 15-minute limits: registration 5, login 10, recovery 3, token actions 10, refresh/logout 120, resource writes/votes 120. TRUST_PROXY is explicitly 0–5 hops (zero locally); configure the actual ingress chain. A shared limiter store is needed for multi-replica deployments.

The admin seed creates a verified admin, preserves an existing admin and refuses to promote an existing regular user. Credentials come from operator environment only.

## Evidence and operational boundaries

Tests cover authentication, expiry, rotation/replay, concurrent token consumption, reset revocation, cookies/origins, RBAC, validation, safe projections and malicious Markdown. Ignored environment files, tracked files and reachable history are checked for secrets; no scan proves absence outside its examined sources.

Production email, target TLS/proxy/cookie behavior, multi-process rate state, cross-document crash reconciliation and formal penetration testing remain deployment/operational concerns.

References: [OWASP token rotation guidance](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html), [express-rate-limit proxy guidance](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues). Roadly preserves its first-party dual-JWT architecture; it is not an OAuth authorization server.
