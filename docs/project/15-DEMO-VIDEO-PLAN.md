# Final demo and interview plan

The candidate's recorded explanation and public video link remain separate deliverables (TA-13/TA-14). This file prepares the recording; it does not claim that a recording was created or uploaded.

Use a dedicated demo database, a disposable user, and an admin created by the seed. Prepare several requests across all four statuses, a root/reply thread, and meaningful votes. Keep credentials, cookies, token values, environment contents, and private verification/reset links out of the recording. Review [release evidence](21-RELEASE-REPORT.md) before quoting tests or deployment status.

## Suggested sequence (20–25 minutes)

| Step | Demonstrate | Explain |
|---|---|---|
| 1 | Introduce Roadly and Project 01 | Customer feedback is otherwise scattered and delivery progress unclear |
| 2 | Public feed and roadmap | Users contribute; teams prioritize and publish progress |
| 3 | Signup and local verification; login | Simulation is development-only, hashed expiring token, production delivery remains manual |
| 4 | Submit a request through the Dialog | Title/Markdown/categories, client feedback and authoritative server validation |
| 5 | Search, category/status filters, three sorts | 300 ms debounce, MongoDB text index, combined query, Most Upvoted sends `most-voted` |
| 6 | Vote/unvote and anonymous prompt | Optimism, rollback, idempotent POST/DELETE, authentication |
| 7 | Add root/reply, edit, soft-delete | Two levels, ownership/admin rights, preserved thread, active comment count |
| 8 | Detail page | Safe Markdown, metadata, linked discussion |
| 9 | Public roadmap | Three active columns; Under Review stays in feed; vote/date ordering |
| 10 | Admin moderation and adjacent status moves | Backend RBAC; no client role trust; show roadmap after mutation |
| 11 | Activity timeline and pagination | Server-generated safe events, best-effort recording |
| 12 | Admin insights | Totals, lifecycle counts, bounded top-voted/top-discussed aggregation |
| 13 | Theme and responsive widths | Coss primitives, shared tokens, mobile Sheet, keyboard/focus states |
| 14 | Auth code walkthrough | 15m access memory / 7d httpOnly refresh; hash rotation/reuse; password-reset auth version |
| 15 | Models and indexes | User/Post/Comment/RefreshToken/Activity; TTL, uniqueness, query-backed indexes |
| 16 | API and business logic | Routes → controllers → services → models, error envelopes, ownership/projection |
| 17 | Tests and builds | Show actual full-suite results; explain concurrency/security regressions, not coverage percentages |
| 18 | Decisions and challenges | Refresh races, optimistic rollback, deleted-comment counters, stale cache coordination |
| 19 | Limitations and future work | Email integration, scale/transaction boundaries, best-effort history, hosting/video handoff |
| 20 | Close with verified links | Repository, actual live URL if deployed, public video link after upload |

## Code anchors worth opening

- `server/src/services/auth.service.ts`, `server/src/utils/jwt.ts`, `server/src/middleware/auth.ts`: token lifecycle and current-identity checks.
- `server/src/services/post.service.ts`: conditional `$addToSet`/`$pull` plus `$inc`.
- `client/src/hooks/useVote.ts`: snapshot, optimism, rollback, invalidate.
- `server/src/services/comment.service.ts`: parent/depth/ownership and deletion counts.
- `server/src/constants/postStatus.ts`: adjacent transitions.
- `server/src/services/activity.service.ts`, `admin.service.ts`: safe timeline and bounded insights.
- `client/src/App.tsx`, `context/`, `components/ui/`: routes, state boundaries, Coss usage.
- [Index inventory](04-DATABASE-DESIGN.md) and [requirement matrix](20-REQUIREMENT-TRACEABILITY.md).

## Interview prompts

1. Why separate access and refresh lifetimes? Explain storage exposure, automatic refresh, and revocation limits.
2. What makes votes atomic? The condition and both updates execute in one document operation; retries remain idempotent.
3. Why embedded voters? It satisfies required operators and keeps a single atomic boundary; huge populations need a different model.
4. Why two-level adjacency lists? Independent moderation and root pagination with simple, readable threads.
5. What does soft deletion count? Active comments only, including replies; deleting a root preserves its active replies.
6. Why no `sort=trending`? Assessment label maps to approved vote-count ordering; no fabricated time-based ranking.
7. Why is activity best-effort? Product actions should not fail because an optional timeline write failed; it is not an audit guarantee.
8. What breaks at scale? Offset scans, embedded voter size, full roadmap/reply payloads, in-process rate limit storage, cross-document crash consistency.
9. Why Coss? Required by assessment; Base UI supplies accessible behavior while owned source supports coherent product styling.
10. What is not finished externally? Be specific about deployment credentials, production email, video upload, and submission.

Record at a readable font size with microphone narration. Rehearse the flows and keep secrets hidden. After upload, open the public video link in a signed-out/private browser, verify playback and permissions, then add the real URL to the submission. The candidate should be able to explain the code without relying on a generated script.
