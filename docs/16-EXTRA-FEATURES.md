# 16 — EXTRA FEATURES EVALUATION

## Evaluation Criteria

Before implementing any optional feature, evaluate it against these criteria:

1. **Does it improve the product?** — Adds real value, not just complexity
2. **Does it demonstrate useful engineering skill?** — Shows competence in a relevant area
3. **Is it aligned with the product?** — Fits a feedback/roadmap platform
4. **Can the candidate explain it?** — Understandable and explainable in interview/video
5. **Can it be implemented reliably within assessment time?** — Not a rabbit hole
6. **Does it risk destabilizing mandatory requirements?** — Must not break core features

---

## Prioritization Matrix

| Feature | Improves Product | Engineering Skill | Aligned | Explainable | Feasible | Stable | **Priority** |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Trending score (recent engagement) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 RECOMMENDED |
| Dark/light theme toggle | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ | 🟡 RECOMMENDED |
| Activity timeline on posts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 RECOMMENDED |
| User profile page | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ | 🔵 OPTIONAL |
| Admin analytics dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 OPTIONAL |
| Email notification simulation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 OPTIONAL |
| Watch/follow feature requests | ✅ | ✅ | ✅ | ✅ | ⬜ | ✅ | 🔵 OPTIONAL |
| Roadmap filters | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ | 🔵 OPTIONAL |
| Feature change history/audit | ✅ | ✅ | ✅ | ✅ | ⬜ | ✅ | 🔵 OPTIONAL |
| Command/search palette | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ | 🔵 OPTIONAL |
| Notification center | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⚪ DEFERRED |
| Saved/bookmarked requests | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⚪ DEFERRED |
| API/webhook support | ⬜ | ✅ | ⬜ | ✅ | ⬜ | ⬜ | ⚪ DEFERRED |
| Release announcements | ✅ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⚪ DEFERRED |
| Audit log | ⬜ | ✅ | ⬜ | ✅ | ⬜ | ⬜ | ⚪ DEFERRED |

---

## Detailed Feature Evaluations

### 1. Trending Score Based on Recent Engagement 🟡 RECOMMENDED

**What:** Instead of simple "most votes" sort, calculate a trending score that weights recent votes more heavily.

**Algorithm (simple):**
```
trendingScore = voteCount + (recentVotes * 2) + (commentCount * 0.5)
```
Where `recentVotes` = votes in the last 7 days.

**Implementation:**
- Add `recentVoteCount` field (updated periodically or on vote) or compute at query time
- Or use a time-decay formula: `score = voteCount / ((hoursSinceCreation + 2) ^ 1.5)`
- Simpler alternative: just sort by votes in last 7 days

**Why RECOMMENDED:** The assessment mentions "Most Upvoted / Trending" as a sort option. A true trending algorithm is more impressive than just sorting by total votes.

**Effort:** Low–Medium (1–2 hours)

**Risk:** Low — doesn't affect core functionality

---

### 2. Dark/Light Theme Toggle 🟡 RECOMMENDED

**What:** Toggle between dark and light color schemes.

**Implementation:** Coss UI natively supports dark mode via `class` strategy. Add a theme toggle button and persist preference in localStorage.

**Why RECOMMENDED:** Near-zero effort because Coss UI + Tailwind handle it. Shows attention to UX polish.

**Effort:** Low (~30 minutes)

**Risk:** Very low

---

### 3. Activity Timeline on Posts 🟡 RECOMMENDED

**What:** Show a timeline of events on a feature request (created, status changed, comments added).

**Implementation:** Add a `statusHistory` array to the Post model that logs each status change with timestamp and admin user.

**Why RECOMMENDED:** Demonstrates data modeling skill and provides transparency to users.

**Effort:** Medium (2–3 hours)

**Risk:** Low

---

### 4. User Profile Page 🔵 OPTIONAL

**What:** Page showing user's submitted requests, their votes, and comment history.

**Implementation:** New `/profile` route, query posts by author, show user stats.

**Why OPTIONAL:** Nice for UX but doesn't demonstrate significant engineering skill.

**Effort:** Low–Medium (1–2 hours)

**Risk:** Low

---

### 5. Admin Analytics Dashboard 🔵 OPTIONAL

**What:** Dashboard with stats: total posts, posts per status, most voted, most discussed, recent activity.

**Implementation:** MongoDB aggregation pipeline for stats, chart library for visualization (optional).

**Why OPTIONAL:** Demonstrates MongoDB aggregation skills. Good for the video walkthrough.

**Effort:** Medium (2–3 hours)

**Risk:** Low

---

### 6. Email Notification Simulation 🔵 OPTIONAL

**What:** Simulated email notifications when someone votes on or comments on your request.

**Implementation:** Log "email" to console with recipient, subject, body. Show in-app notification count.

**Why OPTIONAL:** Extends the email simulation concept. Good for demonstrating event-driven thinking.

**Effort:** Medium (2–3 hours)

**Risk:** Medium — scope can creep if not bounded

---

### 7. Watch/Follow Feature Requests 🔵 OPTIONAL

**What:** Users can "watch" a feature request to get notified (simulated) of updates.

**Implementation:** Add `watchers` array to Post, toggle endpoint, notification on status change.

**Why OPTIONAL:** Useful feature but adds complexity to multiple areas.

**Effort:** Medium (3–4 hours)

**Risk:** Medium — touches multiple components

---

### 8. Roadmap Filters 🔵 OPTIONAL

**What:** Filter roadmap by category.

**Implementation:** Add category filter to roadmap API and UI.

**Why OPTIONAL:** Simple and useful but very small scope.

**Effort:** Low (30 minutes)

**Risk:** Very low

---

### 9. Feature Change History 🔵 OPTIONAL

**What:** Show a log of all edits to a feature request (title changes, description changes).

**Implementation:** Mongoose `pre('save')` hook to log changes, separate ChangeLog collection or embedded array.

**Why OPTIONAL:** Demonstrates Mongoose middleware and data modeling.

**Effort:** Medium (2–3 hours)

**Risk:** Low

---

### 10. Command/Search Palette 🔵 OPTIONAL

**What:** Keyboard shortcut (Cmd+K) to open a command palette for quick search/navigation.

**Implementation:** Coss UI has a Command component. Wire it to search API and route navigation.

**Why OPTIONAL:** Impressive UX feature, but not core to the product.

**Effort:** Medium (2–3 hours)

**Risk:** Low

---

## Implementation Order (if time permits)

1. Dark/light theme toggle (🟡 lowest effort, high polish value)
2. Trending score (🟡 assessment mentions it explicitly)
3. Activity timeline (🟡 good for video walkthrough)
4. Admin analytics dashboard (🔵 shows aggregation skills)
5. User profile page (🔵 completes the user experience)
6. Roadmap filters (🔵 quick win)
7. Others as time permits

---

## Rules for Extra Feature Implementation

> [!WARNING]
> 1. **All 🔴 REQUIRED features must be complete and stable** before starting any extras.
> 2. **Each extra feature must be tested** before moving to the next.
> 3. **If an extra feature causes instability** in core features, revert it immediately.
> 4. **Document each extra** in the README and video.
> 5. **Time-box each extra** — if it takes more than 1.5x estimated time, abandon or simplify.
