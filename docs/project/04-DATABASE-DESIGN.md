# 04 — Database design

The application uses five Mongoose models. Source schemas and services define the implemented contract.

| Model | Fields and constraints | Relationships/exposure |
|---|---|---|
| User | Name 2–50, normalized unique email, bcrypt password, user/admin role, isVerified, authVersion, hashed verification/reset tokens and expiries, timestamps | Security fields select:false. Auth/current-user exposes _id/name/email/role/isVerified; public author exposes _id/name. |
| RefreshToken | User, unique stable JTI, SHA-256 token hash, isRevoked, expiresAt, createdAt | One session per login. Conditional rotation replaces hash; revoked records retained until expiry for replay detection. |
| Post | Title 5–150, description 20–5000, author, categories, status, embedded voters, nonnegative voteCount/commentCount, timestamps | API validates 1–4 unique categories. Status defaults under-review. Readers omit voters; authenticated readers receive hasVoted. |
| Comment | Content 1–2000, author, post, nullable parentComment, isEdited/isDeleted, timestamps | Root plus one reply level. Parent must be a root on the same post. Deleted content becomes [deleted]; replies remain. |
| Activity | Post, actor, type, optional fromStatus/toStatus, timestamps | Only post-created/status-changed/comment-created. No comment content or credentials stored; safe public actor projection. |

Categories: ui-ux, integrations, performance, general. Statuses: under-review, planned, in-progress, completed. References are application-managed, not foreign-key constraints.

## Every retained index

All collections also have the built-in unique _id index.

| Index | Query/constraint and limitations |
|---|---|
| User.email unique | Login, registration uniqueness, recovery, seed |
| User.verificationToken unique sparse | Locate/consume verification hash; expiry checked in query |
| User.resetPasswordToken unique sparse | Locate/consume reset hash; expiry checked in query |
| RefreshToken.user | Revoke user's sessions after replay/reset |
| RefreshToken.jti unique | Session lookup and uniqueness |
| RefreshToken.expiresAt TTL 0 | Expired-session cleanup; authorization checks expiry independently because TTL is asynchronous |
| Post title + description text | MongoDB full-text feed search |
| Post status:1, createdAt:-1 | Status-filtered newest feed; roadmap candidate filtering; not all vote-sorted combinations |
| Post voteCount:-1 | Most-voted feed/top-voted insights; secondary ties may still sort |
| Post commentCount:-1 | Most-discussed feed/insights; secondary ties may still sort |
| Post createdAt:-1 | Newest unfiltered feed |
| Comment post:1, createdAt:1 | Root retrieval/count by post; parent filtering may inspect documents |
| Comment parentComment:1, createdAt:1 | Replies for visible roots in time order; measured addition |
| Activity post:1, createdAt:-1 | Request timeline/cascade cleanup; _id tie ordering may still sort |

Removed declarations for Post.author and Comment.author: no implemented route queries author history. Ownership checks locate by _id then compare author.

Measured an isolated reply query with 1,000 comments and 20 matching replies. Before: COLLSCAN + SORT, 1,000 documents examined. After adding the parent/time index: IXSCAN/FETCH, 20 keys and 20 documents examined, no blocking SORT. Both returned 20. This is query-plan evidence, not production latency.

## Integrity and operations

Votes conditionally match membership and atomically update voters/count using $addToSet/$pull/$inc. Repeated upvote/unvote is idempotent. Comments increment active count on creation; a conditional isDeleted:false update decrements once. Deleted roots preserve active replies. Post deletion removes associated comments and activities. Admin transitions conditionally match prior status, returning 409 for a concurrent change.

Cross-collection writes are not transactions, preserving standalone MongoDB compatibility. Process crashes can leave counters/references requiring reconciliation; activity writes are best-effort. Back up and compare commentCount to non-deleted comments, voteCount to distinct voters, and inspect orphans before applying reviewed repairs.

New installations create declared indexes through Mongoose. For upgrades, back up and inspect getIndexes(); deploy the reply index and measure representative explain plans. Removing schema declarations does not drop existing database indexes. An operator may drop obsolete author_1 indexes on posts/comments only after checking external consumers. Do not blindly run syncIndexes against a live database.

Embedded voters face MongoDB's document-size limit. Offset pagination degrades at high offsets. Roadmap and replies within visible roots are not separately paginated. These are documented assessment-scale trade-offs.
