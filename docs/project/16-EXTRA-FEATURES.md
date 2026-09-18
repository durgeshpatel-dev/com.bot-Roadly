# Approved optional scope

| Feature | State | Implementation |
|---|---|---|
| Light/Dark/System | Implemented, Phase 8 | ThemeContext/ThemeToggle/CSS |
| Public request activity | Implemented, Phase 9 | Activity model/service/API/timeline |
| Admin insights | Implemented, Phase 9 | Admin-only aggregation/dashboard |

Activity records only post-created, status-changed, and comment-created. It is best-effort history, not an exhaustive audit log. Insights provide totals, lifecycle counts, and bounded top-five lists without external analytics or charts.

There is no time-decay trending algorithm: the label Most Upvoted / Trending maps to `most-voted`. Profiles, follows/watchers, notifications, bookmarks, command palette, release announcements, webhooks, full edit audit history, WebSockets, AI features, and extra role types are deferred/out of scope. Reusable Coss primitives do not imply those features exist.

Mandatory verification/reset simulation is separate from optional notification emails. No new product scope is implied by this list.
