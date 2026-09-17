# 12 — TESTING STRATEGY

## Testing Philosophy

Prioritize testing **critical business logic and security** over achieving high coverage numbers. For an assessment project, focused tests on high-risk areas are more valuable than shallow tests everywhere.

---

## Test Types & Priority

| Priority | Type | Scope | Tools |
|----------|------|-------|-------|
| **P0 — Critical** | API Integration | Auth flows, voting atomicity, authorization | Jest/Vitest + Supertest |
| **P0 — Critical** | Security | Token handling, cookie flags, role enforcement | Manual + automated |
| **P1 — Important** | API Integration | Post CRUD, comment CRUD, roadmap | Jest/Vitest + Supertest |
| **P1 — Important** | Unit | Service logic, utilities, validators | Jest/Vitest |
| **P2 — Nice-to-have** | Frontend | Component rendering, form validation | Vitest + React Testing Library |
| **P2 — Nice-to-have** | E2E | Full user journeys | Playwright/Cypress (🔵 OPTIONAL) |

---

## Test Infrastructure 🟡 RECOMMENDED

| Tool | Purpose |
|------|---------|
| **Vitest** or **Jest** | Test runner (Vitest for consistency with Vite frontend) |
| **Supertest** | HTTP assertion library for Express API testing |
| **MongoDB Memory Server** | In-memory MongoDB for isolated test database |
| **faker.js** | Generate test data |

🟠 IMPLEMENTATION DECISION: Vitest is recommended for consistency (client already uses Vite), but Jest is equally valid.

---

## Critical Test Cases (P0)

### Authentication Tests

| Test Case | Endpoint | Expected Behavior |
|-----------|----------|-------------------|
| Signup with valid data | POST /api/auth/signup | 201, user created, verification token logged |
| Signup with duplicate email | POST /api/auth/signup | 409, "Email already registered" |
| Signup with invalid email | POST /api/auth/signup | 400, validation error |
| Signup with weak password | POST /api/auth/signup | 400, validation error |
| Login with correct credentials | POST /api/auth/login | 200, access token + refresh cookie |
| Login with wrong password | POST /api/auth/login | 401, generic "Invalid credentials" |
| Login with non-existent email | POST /api/auth/login | 401, generic "Invalid credentials" |
| Token refresh with valid cookie | POST /api/auth/refresh | 200, new access token + new cookie |
| Token refresh with expired cookie | POST /api/auth/refresh | 401 |
| Token refresh with reused token | POST /api/auth/refresh | 401, all user tokens revoked |
| Logout | POST /api/auth/logout | 200, cookie cleared |
| Forgot password with existing email | POST /api/auth/forgot-password | 200, reset token logged |
| Forgot password with non-existent email | POST /api/auth/forgot-password | 200, same message (no enumeration) |
| Reset password with valid token | POST /api/auth/reset-password | 200, password updated |
| Reset password with expired token | POST /api/auth/reset-password | 400 |
| Email verification with valid token | POST /api/auth/verify-email | 200, user verified |
| Email verification with invalid token | POST /api/auth/verify-email | 400 |

### Authorization Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Access protected route without token | 401 |
| Access protected route with expired token | 401 |
| Access admin route as regular user | 403 |
| Access admin route as admin | 200 |
| Edit own post as author | 200 |
| Edit another user's post as user | 403 |
| Edit any post as admin | 200 |
| Delete own comment as author | 200 |
| Delete another user's comment as user | 403 |
| Delete any comment as admin | 200 |
| Change post status as user | 403 |
| Change post status as admin | 200 |

### Voting Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Upvote a post (first vote) | 200, voteCount +1, hasVoted: true |
| Remove vote (already voted) | 200, voteCount -1, hasVoted: false |
| Attempt duplicate vote (same user) | voteCount unchanged (atomic prevention) |
| Vote without authentication | 401 |
| Vote on non-existent post | 404 |
| Concurrent votes from different users | All votes correctly counted (atomic ops) |
| Verify voters array matches voteCount | voteCount === voters.length |

---

## Important Test Cases (P1)

### Post CRUD Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Create post with valid data | 201, post created |
| Create post without auth | 401 |
| Create post with missing title | 400, validation error |
| Create post with invalid category | 400, validation error |
| Get posts (paginated) | 200, correct pagination meta |
| Get posts with filters | 200, filtered results |
| Get posts with search | 200, text search results |
| Get posts with sorting | 200, correct sort order |
| Get single post | 200, full post data |
| Get non-existent post | 404 |
| Update own post | 200 |
| Delete own post | 200, associated comments also deleted |

### Comment Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Add comment to post | 201, commentCount incremented |
| Add reply to comment | 201, max 1 level nesting enforced |
| Edit own comment | 200, isEdited: true |
| Delete comment | 200, commentCount decremented |
| Get threaded comments | 200, replies nested under parents |
| Comment with empty content | 400, validation error |
| Comment on non-existent post | 404 |

### Roadmap Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Get roadmap (public) | 200, 3 groups (planned, in-progress, completed) |
| Roadmap excludes under-review | under-review posts not in response |
| Status change reflects on roadmap | Updated grouping after status change |

---

## Validation Tests (P1)

| Area | Test |
|------|------|
| Email format | Invalid emails rejected |
| Password length | Below minimum rejected |
| Title length | Below/above limits rejected |
| Description length | Below/above limits rejected |
| Category enum | Invalid categories rejected |
| Status enum | Invalid statuses rejected |
| ObjectId format | Invalid IDs return 400, not crash |
| XSS in content | Script tags in Markdown don't execute |

---

## Frontend Testing (P2) 🔵 OPTIONAL

| Test | Library | Scope |
|------|---------|-------|
| VoteButton renders correct state | RTL | Component |
| PostCard displays all fields | RTL | Component |
| Login form validation | RTL | Form behavior |
| Auth context provides correct state | RTL | Context |
| Optimistic vote rolls back on error | RTL + MSW | Integration |

---

## Manual QA Checklist

### User Flows

- [ ] New user signup → verify email → login → browse feed
- [ ] Submit feature request → see it in feed → view detail
- [ ] Vote on request → see count update → vote again to remove
- [ ] Unauthenticated user clicks vote → sees auth modal → logs in
- [ ] Add comment → edit comment → delete comment
- [ ] Reply to comment → see threaded display
- [ ] Search for a post → results appear after debounce
- [ ] Filter by category → results update
- [ ] Filter by status → results update
- [ ] Sort by newest / most voted / most discussed
- [ ] View roadmap → see 3 columns with correct posts
- [ ] Forgot password → get token → reset password → login with new password
- [ ] Logout → protected pages redirect to login

### Admin Flows

- [ ] Login as admin → see admin nav link
- [ ] Access admin dashboard → see stats
- [ ] View all posts in admin panel
- [ ] Change post status → verify on roadmap
- [ ] Delete a post → verify removed from feed
- [ ] Delete any comment (moderation)

### Error & Edge Cases

- [ ] Network failure during vote → rollback
- [ ] Invalid URL → 404 page
- [ ] Session expired → redirect to login with message
- [ ] Form submission with invalid data → inline errors
- [ ] Empty feed → empty state shown
- [ ] Empty search results → helpful message

### Responsive Testing

- [ ] All pages at 320px (mobile)
- [ ] All pages at 768px (tablet)
- [ ] All pages at 1024px (small desktop)
- [ ] All pages at 1440px (desktop)
- [ ] Kanban roadmap on mobile (stacked/tabbed)

### Security Checklist

- [ ] Access token NOT in localStorage (check DevTools → Application → Storage)
- [ ] Refresh token in httpOnly cookie (not accessible via JS)
- [ ] Cookie has Secure flag in production
- [ ] Cookie has SameSite=Strict
- [ ] CORS blocks unauthorized origins
- [ ] Non-admin cannot access admin API endpoints
- [ ] User cannot edit/delete another user's content (API level)
- [ ] Password not returned in any API response
- [ ] Invalid/expired tokens properly rejected
- [ ] Rate limiting on auth endpoints
