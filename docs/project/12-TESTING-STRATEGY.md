# Testing and release verification

The project uses **Vitest** in both workspaces, **Supertest** against the real Express app, **mongodb-memory-server** for isolated MongoDB integration, and **React Testing Library/jsdom** for client tests. No Jest/Cypress/faker/MSW dependency is required.

## Commands

From the repository root:

```sh
npm ci
npm run check
npm audit
```

`check` runs client/server lint, typechecks, both full test suites, and both builds. Individual scripts are `npm test`, `npm run test -w server`, `npm run test -w client`, `npm run typecheck`, `npm run lint`, and `npm run build`.

Use Node 24. The first server test run may download a MongoDB binary. Test configuration provides isolated environment values and does not connect to the application database. Test files run against real MongoDB operations, not mocked vote atomicity.

## Coverage inventory

| Area | Main evidence |
|---|---|
| Auth/signup/verification/login/rotation/reuse/logout/reset | Server auth/security regression tests; client auth and Axios tests |
| Post CRUD/validation/search/sort/filter/page/projection | `server/tests/post.test.ts` plus hardening regressions |
| Vote idempotency/concurrency/anonymous/redaction | `server/tests/vote.test.ts` |
| Actual optimistic update and rollback | Client hook tests; VoteButton tests only cover button/prompt wiring |
| Root/reply/depth/ownership/edit/delete/count | `server/tests/comment.test.ts` and regressions; client comment tests |
| RBAC and adjacent transitions | `server/tests/admin.test.ts` |
| Public columns/order/status movement | `server/tests/roadmap.test.ts`; RoadmapBoard RTL |
| Activity generation/pagination/safe actor data | `server/tests/activity.test.ts`; ActivityTimeline RTL |
| Admin aggregation and safe bounded results | `server/tests/adminStats.test.ts`; AdminDashboard RTL |
| Theme, search debounce, feed/detail states, filters/page controls | Colocated client tests |
| Raw HTML/unsafe Markdown | Client Markdown regression tests |
| Production env/cookies/origin/abuse/errors | Backend security/config regressions |

[Traceability](20-REQUIREMENT-TRACEABILITY.md) maps all assessment IDs to exact files. [Release report](21-RELEASE-REPORT.md) records fresh counts and command results; do not infer a passing run merely because a test exists.

## Browser QA

Use a dedicated local/demo database and disposable accounts. Cover guest/user/admin flows at **320, 375, 768, 1024, 1440 px**. Inspect feed, submission Dialog, detail/comments/activity, roadmap, admin, auth, and Light/Dark/System themes.

Verify visible focus, skip link, keyboard controls, labels, modal and Sheet focus/escape/restore behavior, status text, reduced motion, and no unintended page-level horizontal overflow. Exercise loading, empty, retry, invalid form, and anonymous voting states. RTL cannot prove layout/contrast correctness.

For deployed smoke tests, verify deep-link reload, health DB state, CORS, cookie flags/path, refresh after page reload, reset delivery, admin status movement, and absence of secret/voter leakage. Record any untested browser/device combination rather than claiming universal compatibility.
