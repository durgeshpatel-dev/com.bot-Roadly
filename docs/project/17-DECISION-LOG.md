# 17 — Decision log

Implemented decisions were reconciled against source during the 2026-09-17 final release. Earlier proposed choices below are now accepted; original source assessment PDFs remain unchanged.

| ID | Decision/status | Reason and trade-off |
|---|---|---|
| DEC-001 | Accepted: TypeScript in both apps | Compile-time contracts and consistent tooling; production build required. No shared-schema package is claimed. |
| DEC-002 | Accepted: Vite SPA | Fits the existing client routing and static hosting; no server rendering. |
| DEC-003 | Accepted: access JWT in memory, refresh in httpOnly cookie | Avoids persistent browser token storage; refresh needed at startup. In-memory JavaScript remains vulnerable to XSS. |
| DEC-004 | Accepted: embedded voters | Required atomic $addToSet/$pull/$inc on one Post; large voter sets need a future model change. |
| DEC-005 | Accepted: two-level adjacency-list comments | Root pagination plus batched replies assembled on the server; simple moderation, no deep nesting. |
| DEC-006 | Accepted: TanStack Query | Shared server cache and optimistic mutations; explicit invalidation needed. |
| DEC-007 | Accepted: offset pagination | Numbered pages; expensive high offsets and shifting results under writes. |
| DEC-008 | Accepted: Zod | Typed validation in each app; aligned separate schemas with server authority. |
| DEC-009 | Accepted: three-column roadmap | Planned/In Progress/Completed; Under Review remains feed/admin only. |
| DEC-010 | Accepted: development email simulation | Private terminal links satisfy local assessment without provider; production delivery requires integration. |
| DEC-011 | Accepted: source-owned Coss primitives | Existing components/ui is the installed primitive library backed by Base UI; retain reusable source. |
| DEC-012 | Accepted: tsx development, tsc + node production | Fast development, checked compiled deployment. |
| DEC-013 | Accepted: Vitest, Supertest, RTL, isolated MongoDB | Real database integration/concurrency plus UI tests; initial MongoDB binary download/startup required. |
| DEC-014 | Accepted: soft-delete comments | Replace content with [deleted], preserve replies, count active comments only. |
| DEC-015 | Accepted: adjacent bidirectional transitions | Under Review ↔ Planned ↔ In Progress ↔ Completed; conditional update detects conflicts. Reuse feed service for admin lists. Phase 7 added detail links and Phase 9 added insights. |
| DEC-016 | Accepted: activity and admin insights | Approved optional additions, safe server-generated events and current aggregates; best-effort activity is not a compliance log. |
| DEC-017 | Accepted: atomic session rotation/reset hardening | Stable JTI + nonce + hashed-token conditional replacement; replay revokes sessions, authVersion invalidates tokens after reset. Cross-tab refresh races fail closed. |
| DEC-018 | Accepted: focused rate limits/origin validation | Maintained express-rate-limit avoids custom abuse-control logic; memory store targets one process and needs shared state at scale. |
| DEC-019 | Accepted: route-level lazy loading | Measured large initial JS chunk split by routes; preserves architecture and defers route code, does not imply total JS transfer falls by the same ratio. |
| DEC-020 | Accepted: measured reply index and unused-index cleanup | Reply explain plan improved from 1,000 examined documents to 20; removed author index declarations without dropping any live database index. |
| DEC-021 | Accepted: release tooling/environment | Node 24, workspace check command, both-app lint/typechecks, CI, per-app env examples, backend container/static-host config. Hosted/container execution needs explicit evidence. |
| DEC-022 | Accepted: safe admin seed | Create new verified admin or preserve existing admin; refuse regular-account promotion and never reset passwords implicitly. |

No pending product architecture decisions remain for the implemented scope. Hosting, email integration, video recording/publication and candidate explanation are external deliverables tracked separately.

The final pass fixes auth envelope parsing, startup/refresh races, identity caches, concurrent vote rollback, one-use verification in StrictMode, comment draft preservation/count races, Markdown safety, mobile control fit and auth form semantics. It does not add product features or replace the layered MERN architecture.
