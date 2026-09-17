# 17 — DECISION LOG

## Format

Each decision follows this template:

```
### DEC-XXX: [Decision Title]

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **Status** | PROPOSED / ACCEPTED / SUPERSEDED |
| **Impacted Components** | List of affected areas |

**Context:** Why this decision was needed.

**Options Considered:**
1. Option A — description
2. Option B — description
3. Option C — description

**Selected:** Option X

**Reason:** Why this option was selected.

**Trade-offs:** What we gain and what we lose.
```

---

## Decisions

### DEC-001: TypeScript over JavaScript

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Client, Server, Build tooling |

**Context:** Assessment says "MERN" without mandating JS or TS. Need to decide on language for the entire project.

**Options Considered:**
1. JavaScript — No compilation step, simpler setup, lower barrier
2. TypeScript — Type safety, better IDE support, self-documenting, more professional

**Selected:** TypeScript (🟡 RECOMMENDED)

**Reason:** TypeScript demonstrates higher code quality, makes the codebase self-documenting, provides compile-time error catching, and is the industry standard for modern React + Node projects. Coss UI is built with TypeScript. The assessment evaluates "code quality" and "technical decisions" — TypeScript scores higher on both.

**Trade-offs:**
- ✅ Type safety catches bugs at compile time
- ✅ Better IDE autocomplete and documentation
- ✅ Mongoose types improve model usage
- ✅ Coss UI TypeScript-native
- ❌ Requires `tsc` compilation for server
- ❌ Slightly more setup complexity
- ❌ Must learn TypeScript nuances if unfamiliar

---

### DEC-002: Vite over Create React App

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Client build system |

**Context:** Need a build tool for the React frontend.

**Options Considered:**
1. Create React App (CRA) — Deprecated, slow, webpack-based
2. Vite — Modern, fast HMR, native ESM, actively maintained
3. Next.js — SSR/SSG capabilities, overkill for SPA

**Selected:** Vite

**Reason:** CRA is effectively deprecated. Vite is the modern standard for React SPAs with instant HMR and native TypeScript support. Next.js adds SSR complexity not needed for this project.

**Trade-offs:**
- ✅ Extremely fast dev server
- ✅ Native TypeScript/JSX support
- ✅ Modern ESM-first
- ❌ Fewer built-in features than Next.js
- ❌ Less documentation than CRA (but growing)

---

### DEC-003: Access Token Storage — In-Memory Only

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Auth system, Frontend state |

**Context:** Assessment requires secure token handling. Must decide where to store the JWT access token.

**Options Considered:**
1. localStorage — Persistent across tabs, but vulnerable to XSS
2. sessionStorage — Per-tab, but still vulnerable to XSS
3. In-memory (React state/context) — Not accessible to XSS, lost on refresh
4. httpOnly cookie — Most secure, but then need CSRF protection

**Selected:** In-memory (React state/context) for access token + httpOnly cookie for refresh token

**Reason:** This is the industry-standard pattern for SPAs with JWTs. The access token lives only in JavaScript memory (unreachable by XSS attacks on storage APIs). When the page refreshes, the access token is re-acquired via the refresh endpoint using the httpOnly cookie.

**Trade-offs:**
- ✅ Access token not accessible to XSS via localStorage
- ✅ Refresh token not accessible via JavaScript at all
- ✅ Short-lived access token limits exposure window
- ❌ Token lost on page refresh (requires refresh call)
- ❌ Small delay on app initialization (refresh call)

---

### DEC-004: Embedded Voters Array vs. Separate Vote Collection

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Database design, Voting system |

**Context:** Need to track which users voted on which posts while supporting atomic operations.

**Options Considered:**
1. Embedded `voters` array on Post document — Simple, atomic with `$addToSet`
2. Separate `Vote` collection with `{ user, post }` — More scalable, separate indexes
3. Bitfield/bitmap — Very efficient but complex

**Selected:** Embedded voters array on Post document

**Reason:** Assessment explicitly requires `$addToSet`, `$pull`, `$inc` — these operators work with embedded arrays. A separate collection would require transactions for atomicity. For assessment scale (<1000 users per post), embedded array is appropriate.

**Trade-offs:**
- ✅ Single atomic operation for vote + count update
- ✅ Assessment-mandated operators work naturally
- ✅ Simple query to check if user voted
- ❌ Document size grows with voters (16MB limit)
- ❌ At production scale (>10k voters per post), would need separate collection

---

### DEC-005: Comment Threading — Adjacency List

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Database design, Comment system |

**Context:** Need threaded/nested comments. Must decide the data model.

**Options Considered:**
1. Adjacency list (`parentComment` reference) — Each comment references its parent
2. Nested embedded comments — Comments embedded in Post document
3. Materialized path — Store full path string: "root/parent/child"
4. Nested sets — Left/right numbers for tree traversal

**Selected:** Adjacency list with 2-level max depth

**Reason:** Simplest model that supports threading. Fetch all comments for a post in one query, build the tree client-side. Two-level limit keeps the UI clean and reduces complexity.

**Trade-offs:**
- ✅ Simple schema and queries
- ✅ Individual CRUD on comments
- ✅ Pagination-friendly
- ❌ Tree building done client-side (fine for assessment scale)
- ❌ Deep nesting not supported (limited to 2 levels by design)

---

### DEC-006: TanStack Query for Server State

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Frontend data fetching |

**Context:** Need a strategy for fetching, caching, and synchronizing server data. Also need optimistic updates for voting.

**Options Considered:**
1. TanStack Query (React Query) — Dedicated server state library with caching, optimistic updates
2. Redux Toolkit Query — Full Redux solution
3. SWR — Lighter alternative to React Query
4. Manual fetch + useState — No library

**Selected:** TanStack Query v5

**Reason:** Built-in support for optimistic mutations (required for voting), automatic caching, refetch-on-focus, pagination support, and excellent DevTools. Assessment requires optimistic UI — TanStack Query's `onMutate`/`onError` pattern is the standard solution.

**Trade-offs:**
- ✅ First-class optimistic update support
- ✅ Automatic caching and background refetching
- ✅ Built-in loading/error states
- ✅ Pagination support
- ❌ Additional dependency
- ❌ Learning curve for query keys and cache invalidation

---

### DEC-007: Offset Pagination vs. Cursor Pagination

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | API design, Database queries, Frontend pagination |

**Context:** Assessment requires pagination. Need to choose a strategy.

**Options Considered:**
1. Offset-based (`skip` + `limit`) — Page numbers, simple
2. Cursor-based (`_id` after cursor) — Better for infinite scroll, consistent
3. Keyset pagination — Like cursor but uses sort field

**Selected:** Offset-based pagination

**Reason:** Simpler to implement, supports page number navigation (better UX for browsable lists), adequate for the expected data volume. Cursor-based would be better for infinite scroll but adds unnecessary complexity.

**Trade-offs:**
- ✅ Simple implementation
- ✅ Page numbers in UI
- ✅ Users can jump to specific pages
- ❌ Performance degrades at very high page numbers (skip)
- ❌ Results can shift if items are inserted/deleted between pages

---

### DEC-008: Zod for Validation

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Server validation, Client form validation |

**Context:** Need input validation on both client and server. Want consistency.

**Options Considered:**
1. Zod — TypeScript-first, composable, can share schemas
2. express-validator — Express-native, chain API
3. Joi — Popular, mature, but not TypeScript-first
4. Yup — Similar to Zod, older

**Selected:** Zod

**Reason:** TypeScript-first (infers types from schemas), can potentially share validation schemas between client and server, composable schema building, works with React Hook Form via `@hookform/resolvers/zod`.

**Trade-offs:**
- ✅ TypeScript type inference
- ✅ Shared schemas possible
- ✅ React Hook Form integration
- ✅ Composable and readable
- ❌ Not Express-native (needs adapter middleware)
- ❌ Slightly newer ecosystem

---

### DEC-009: 3-Column Kanban Interpretation

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | ACCEPTED |
| **Impacted Components** | Roadmap feature, UI design |

**Context:** Assessment says "3-column Kanban" but there are 4 statuses. Need to resolve this.

**Options Considered:**
1. 3 columns: Planned, In Progress, Completed (Under Review stays in feed)
2. 4 columns: Under Review, Planned, In Progress, Completed
3. 3 columns: Planned, In Progress, Completed with Under Review as a separate section above

**Selected:** Option 1 — 3 active columns (Planned, In Progress, Completed)

**Reason:** "Under Review" items haven't been accepted yet — they don't belong on a public roadmap. The roadmap represents committed/planned work. This interpretation matches the "3-column" requirement literally and makes product sense.

**Trade-offs:**
- ✅ Matches "3-column" requirement literally
- ✅ Product-logical: roadmap shows accepted features only
- ✅ Cleaner UI
- ❌ Users might wonder where "Under Review" items went

### DEC-015: Phase 6 Admin and Roadmap Decisions

| Field | Value |
|-------|-------|
| **Date** | 2026-09-17 |
| **Status** | ACCEPTED |
| **Impacted Components** | Admin API, status transitions, roadmap API/UI, post list serialization |

**Context:** Phase 6 required final implementation decisions for lifecycle transitions, roadmap ordering, response redaction, and scope boundaries.

**Selected:**
- Enforce adjacent bidirectional transitions only:
  `under-review -> planned`, `planned -> under-review|in-progress`,
  `in-progress -> planned|completed`, and `completed -> in-progress`.
- Do not add an admin statistics endpoint in this phase.
- Exclude `under-review` from the public three-column roadmap.
- Order roadmap posts by `voteCount DESC`, then `createdAt DESC`.
- Omit `Post.voters` from public and admin list responses.
- Keep roadmap cards independent of the unimplemented post-detail route.
- Reuse `PostService.getPosts()` for admin list filtering/pagination.
- Keep the admin seed utility development/testing-only with environment-provided credentials.

**Reason:** These choices directly resolve the approved Phase 6 scope while preserving the existing architecture and API security boundary.

---

### DEC-010: Email Verification Simulation Method

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | PROPOSED |
| **Impacted Components** | Auth system, DX |

**Context:** Assessment requires "Email Verification simulation." Need to decide how to simulate it.

**Options Considered:**
1. Console log token + URL — Simplest, developer copies from console
2. Nodemailer + Ethereal — Sends to fake SMTP inbox, more realistic
3. In-app display — Show the token on-screen after signup

**Selected:** Option 1 — Console log (🟡 RECOMMENDED)

**Reason:** Simplest, clearly a "simulation," easy to demonstrate in video, no external service dependency.

**Trade-offs:**
- ✅ Zero dependencies
- ✅ Obviously a simulation (assessment requirement)
- ✅ Easy to demonstrate
- ❌ Requires access to server console
- ❌ Less realistic than Ethereal

---

## Pending Decisions

| ID | Decision | Status | Blocker |
|----|----------|--------|---------|
| DEC-011 | Coss UI installation method (CLI vs manual copy) | PENDING | Verify latest Coss UI docs during Phase 1 |
| DEC-013 | Testing framework (Vitest vs Jest) | PENDING | Choose during Phase 1 based on Vite compatibility |

---

### DEC-012: Server-side TypeScript execution (tsx vs tsc)

| Field | Value |
|-------|-------|
| **Date** | 2026-09-16 |
| **Status** | ACCEPTED (Implementation Decision) |
| **Impacted Components** | Backend development environment, Build process |

**Context:** Need a way to run TypeScript for the backend server during local development and in production.

**Options Considered:**
1. `tsc` + `node` — Standard, but requires a build step for every local change
2. `ts-node` + `nodemon` — Older standard for local dev, can be slow
3. `tsx` — Modern, extremely fast (esbuild), built-in watch mode

**Selected:** `tsx` for local dev (`tsx watch`), `tsc` for production compilation

**Reason:** `tsx` provides the best developer experience with zero-config watch mode and very fast execution. For production, `tsc` is used as it performs full type-checking and outputs standard JavaScript.

**Trade-offs:**
- ✅ Extremely fast local reloads
- ✅ Zero configuration for watch mode
- ✅ No `nodemon` dependency required
- ❌ Slightly different execution environments between dev and prod
- ❌ `tsx` doesn't perform type checking (must run `tsc --noEmit` separately)

---

### DEC-014: Comment Deletion Strategy & commentCount Definition

| Field | Value |
|-------|-------|
| **Date** | 2026-09-17 |
| **Status** | ACCEPTED (Implementation Decision) |
| **Impacted Components** | Database design, Comment API |

**Context:** Needed to resolve ambiguity in docs/05-API-SPECIFICATION.md regarding what happens when a comment is deleted, and explicitly define what `commentCount` on a post represents.

**Options Considered:**
1. Hard/Cascade Delete — Delete the document and all replies, subtract from count.
2. Soft Delete — Mark as deleted, preserve identity and replies, render as "[deleted]".

**Selected:** Option 2 — Soft Delete.

**Reason:** Soft deletion preserves the thread context and child replies while effectively removing the problematic content. The author reference remains in the database for data integrity and history, but the API/UI treats it as deleted content (`"[deleted]"`).

**Definition of `commentCount`:** `commentCount` strictly represents the number of *non-deleted* comments. 
- Creating a comment: +1
- Soft deleting a comment: -1
- Soft deleting a root comment does *not* recursively decrement the count for its replies, as the replies remain active and visible.

**Trade-offs:**
- ✅ Thread context is preserved for replies
- ✅ Audit history remains intact
- ❌ Requires slightly more complex rendering logic (e.g., checking `isDeleted`)
- ❌ Database retains the deleted document
