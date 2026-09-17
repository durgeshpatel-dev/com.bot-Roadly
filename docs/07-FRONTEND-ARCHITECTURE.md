# Frontend architecture

The client uses React 19, TypeScript, Vite, React Router, TanStack Query, Axios, Tailwind CSS v4, Coss/Base UI, and react-markdown. The manifests/lockfile define exact versions.

## Routes

| URL | Purpose | Access |
|---|---|---|
| `/` | Feed/search/filter/sort/submission | Public |
| `/posts/:id` | Detail/voting/comments/activity | Public; mutations require login |
| `/roadmap` | Three-column roadmap | Public |
| `/login`, `/signup` | Authentication | Guest |
| `/forgot-password`, `/reset-password?token=...` | Recovery | Guest |
| `/verify-email?token=...` | Verification | Public |
| `/admin` | Insights | Admin |
| `/admin/posts` | Request moderation | Admin |
| Unmatched path | NotFoundPage | Public |

`src/App.tsx` registers routes. No profile, my-requests, or user dashboard route exists. Client guards improve navigation; Express authorization enforces security.

## State

- `context/AuthContext.tsx`: user/session startup, login, signup, logout.
- `api/axios.ts`: credentialed requests and in-memory access token; coordinated refresh/retry.
- `context/ThemeContext.tsx`: System/Light/Dark under `roadly-theme`, without credentials in storage.
- `context/FeatureSubmissionContext.tsx`: shared submission dialog and auth prompt.
- Local form/dialog state stays in components; fetched records stay in TanStack Query.

Startup refreshes the httpOnly cookie session and fetches `/users/me`. Failed refresh produces a guest session. Account changes discard user-specific vote/admin cache state.

## Query keys

| Prefix | Purpose |
|---|---|
| `['posts', query]` | Feed |
| `['post', id]` | Detail |
| `['comments', id]` | Thread pages |
| `['roadmap']` | Public board |
| `['admin', 'posts', filters]` | Admin requests |
| `['admin', 'stats']` | Insights |
| `['activity', id, page]` | Timeline |

Hooks may extend keys with page parameters. Feed requests support cancellation and retain prior results while fetching. Roadmap explicitly refetches on focus. Optimistic voting snapshots/updates caches, rolls back failed requests, and invalidates authoritative data after settlement. Domain mutations invalidate related lists/counts/activity/insights.

## Composition

Pages compose feature components over `components/ui/`. Shared tokens/layout/Markdown styles live in `index.css`. Auth forms use React Hook Form; compact post/comment forms use local state plus server validation. No shared cross-workspace schema package or WYSIWYG editor exists.

Search debounces 300 ms. Category/status arrays serialize as comma-separated strings. Most Upvoted / Trending sends `most-voted`. Markdown does not execute raw HTML.

Colocated Vitest/RTL tests exercise functional UI behavior. Browser widths, focus, and visual checks are separate evidence in [release report](21-RELEASE-REPORT.md).
