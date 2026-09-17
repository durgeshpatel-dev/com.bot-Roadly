# Implemented feature specification

This describes the current product; [01](01-REQUIREMENTS.md) retains assessment wording, and [05](05-API-SPECIFICATION.md) defines exact HTTP contracts.

## Authentication

The signup page calls `POST /api/auth/register`; login is `POST /api/auth/login`. Users verify a crypto-random token through `/verify-email?token=...`. Verification expires after 24 hours; password-reset tokens expire after one hour. Development simulation is for a local demonstration, not an external email service. Access JWTs last 15 minutes and remain in memory. Refresh JWTs last seven days and use an httpOnly cookie, rotation, and server-side revocation/replay checks. Recovery uses a generic response to avoid revealing account existence.

## Requests, feed, and search

Authenticated users submit a Coss Dialog with title (5–150 characters), Markdown description (20–5000 characters), and categories: `ui-ux`, `integrations`, `performance`, `general`. Requests start `under-review`. The API supports author/admin editing and deletion.

Public cards show title, Markdown excerpt, categories, author, status, votes, comment count, and creation time. Detail pages show full Markdown, voting, discussion, and activity. The feed combines page/limit, category/status filters, and MongoDB text search over title and description. Search waits 300 ms after input. The URL records query state.

| Label | API sort |
|---|---|
| Newest | `newest` |
| Most Upvoted / Trending | `most-voted` |
| Most Discussed | `most-discussed` |

There is no `sort=trending` or time-decay ranking. Text search uses MongoDB tokenization, not arbitrary substring matching.

## Voting

`POST /api/posts/:id/vote` adds a vote; `DELETE` removes it. Both are idempotent. A conditional MongoDB update combines `$addToSet`/`$pull` with `$inc`; repeated or concurrent same-direction requests cannot duplicate a vote or decrement below zero. Public responses return counts and `hasVoted`, never raw voters.

The client updates cached feed/detail state optimistically, restores prior state on failure, and refetches authoritative data. Anonymous voting opens a login/signup prompt.

## Discussions

Root comments and direct replies support Markdown and 1–2000 character content. A reply belongs to a root on the same post; replies to replies are rejected. The author or an admin can edit/delete. Every deletion is soft: the API renders `[deleted]`, keeps the thread/replies, and decrements `commentCount` once. The count represents active roots plus replies. Root pagination nests replies under visible roots.

## Admin and roadmap

Frontend guards and backend authentication/RBAC protect admin routes. Only admins change lifecycle status. Adjacent transitions work in either direction:

`under-review ↔ planned ↔ in-progress ↔ completed`

Skipping stages is rejected. The public roadmap has exactly **Planned**, **In Progress**, and **Completed**, excludes Under Review, and sorts by votes descending then creation date descending. It refreshes after mutations and on focus; there is no WebSocket delivery.

## Approved additions

- Activity: paginated server-generated `post-created`, `status-changed`, and `comment-created` events. Safe actor identity and status metadata only. Recording is best-effort; the optional timeline cannot fail a successful core mutation.
- Admin insights: total posts/votes/active comments, all lifecycle counts, five top-voted/top-discussed requests. Read-only, admin-only aggregation.
- Theme: Light, Dark, System; only theme preference is persisted in localStorage.

Coss primitives provide loading, empty, failed, pending, form, dialog, and toast states. Browser/accessibility evidence belongs in [release evidence](21-RELEASE-REPORT.md). There is no profile API, real email provider, notifications, separate Vote collection, or realtime collaboration.
