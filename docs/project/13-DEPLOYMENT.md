# 13 — Deployment runbook

Deployment configuration is prepared. No hosted deployment, provider account, email integration or live URL is claimed. Hosting, database credentials and domains require operator-owned accounts. Check current provider pricing before choosing a plan.

## Build and run

Use Node 24.x and the root workspace lockfile:

```sh
npm ci
npm run check
npm run build
npm start -w server
```

Backend native-host build: npm ci && npm run build -w server. Start: npm start -w server. Build with development dependencies available. Compiled entry: server/dist/server.js. The server connects before listening and handles SIGTERM/SIGINT gracefully.

Root Dockerfile builds the backend in stages, prunes development dependencies and runs as node:

```sh
docker build -t roadly-api .
docker run --env-file /secure/location/roadly.env -p 5000:5000 roadly-api
```

Docker is unavailable on the release workstation; build and smoke-test this container before using it.

## Environment and frontend

| Variable | Production configuration |
|---|---|
| NODE_ENV | production |
| PORT | Host-assigned port; default 5000 |
| MONGODB_URI | Authenticated connection to the intended MongoDB database |
| JWT_SECRET | Random access secret, at least 32 characters |
| JWT_REFRESH_SECRET | Different random refresh secret, at least 32 characters |
| CLIENT_URL | Exact HTTPS frontend origin, no trailing slash/path |
| COOKIE_SAME_SITE | strict default; lax/none according to topology |
| TRUST_PROXY | Actual trusted ingress hops, 0–5 |
| ADMIN_EMAIL/PASSWORD/NAME | Temporary private seed inputs |

Access/refresh expiry is fixed at 15m/7d. There are no JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, EMAIL_SIMULATION or RATE_LIMIT_MAX switches. Use current per-app .env.example files.

Client VITE_API_URL is public build-time configuration, e.g. https://api.your-domain.example/api. Rebuild after changing it. Build with npm run build -w client and publish client/dist. Serve index.html for nested routes without rewriting missing assets to HTML.

client/vercel.json provides SPA rewrites/security headers. For Vercel, select client as the app root, allow workspace source outside that directory, use the committed root npm lockfile for installation, npm run build, output dist. Verify actual installation logs use that lockfile. No Vercel project/domain has been provisioned.

## TLS, cookies and CORS

Use HTTPS for frontend/API. Credentialed CORS allows CLIENT_URL only. Same-site app/api subdomains can use strict cookies. Unrelated domains need production Secure cookies, SameSite=none and the implemented exact-Origin check; browser third-party-cookie restrictions may still interfere. Same-origin proxying avoids that dependency.

Cookies remain httpOnly, path /api/auth, no Domain override. Preserve Set-Cookie at the ingress, forward client IP correctly and set TRUST_PROXY to the real chain. Never use a public-suffix cookie domain. Verify refresh/reload/logout in the target browser, not merely the login response.

## Database/admin

Use a dedicated least-privilege database user and restrict network access to application egress where available. Configure backups/recovery. Verify declared indexes; follow [database upgrade precautions](04-DATABASE-DESIGN.md). Removing a schema declaration does not drop an existing index.

Privately supply admin values and run npm run seed:admin -w server while dev dependencies exist. With compiled artifacts and production env already supplied, run node server/dist/seeds/admin.seed.js. Seed creates a verified admin, leaves an existing admin unchanged and refuses promotion of an existing regular account. Remove temporary seed credentials afterward.

## Email/logging and final smoke

Development simulation is disabled in production. Add private email delivery at server/src/utils/emailSimulation.ts or an explicit adapter before public verification/recovery, preserving hashed expiring one-use tokens and generic responses. Never publish terminal token links. Operational messages exclude credentials/connection strings; no hosted error tracker or monitoring account is configured.

- [ ] Build the committed release and start in production mode.
- [ ] GET /api/health returns 200 `{success:true,data:{status:"ok",dbStatus:"connected",uptime}}`; disconnected returns a 503 error envelope.
- [ ] Feed/direct nested routes work over HTTPS.
- [ ] Exact-origin CORS works; foreign auth Origins fail.
- [ ] Login sets Secure/httpOnly cookie; refresh rotates; reload restores; logout clears.
- [ ] Private verification/reset delivery works and links are single use.
- [ ] Disposable request/vote/comment/reply/status flows work.
- [ ] Admin status updates reach roadmap/activity/insights; user RBAC rejects access.
- [ ] Mobile/theme, ingress logs, restart, backups and alerting ownership checked.

[Release evidence](21-RELEASE-REPORT.md) distinguishes local checks from deployment. Add live and public video URLs only after verifying them.
