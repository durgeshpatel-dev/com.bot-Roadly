# 01 — REQUIREMENTS

## Source Traceability

Every requirement in this document is traced to its source:
- **[P01]** = Project 01 PDF
- **[TA]** = Technical Assessment PDF
- **[ARCH]** = Architectural recommendation (not from PDF)
- **[PROD]** = Product quality recommendation (not from PDF)

---

## 1. Universal Security & Authentication Requirements 🔴 REQUIRED

> Source: [P01] "Universal Security & Architecture Requirements" section

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| SEC-01 | JWT Access Token — short-lived, 15 minutes | [P01] | 🔴 REQUIRED |
| SEC-02 | JWT Refresh Token — long-lived, 7 days, stored in httpOnly cookie | [P01] | 🔴 REQUIRED |
| SEC-03 | Signup with Email Verification simulation | [P01] | 🔴 REQUIRED |
| SEC-04 | Login with token rotation | [P01] | 🔴 REQUIRED |
| SEC-05 | Forgot/Reset Password | [P01] | 🔴 REQUIRED |
| SEC-06 | Route guards for protected routes | [P01] Deliverables | 🔴 REQUIRED |
| SEC-07 | Secure cookie handling | [P01] Deliverables | 🔴 REQUIRED |
| SEC-08 | Password recovery flow | [P01] Deliverables | 🔴 REQUIRED |

---

## 2. UI Standard Requirements 🔴 REQUIRED

> Source: [P01] "UI Standard: Build all interface components using coss.com/ui primitives."

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| UI-01 | All interface components must use Coss UI primitives | [P01] | 🔴 REQUIRED |
| UI-02 | Loading skeletons built with Coss UI | [P01] Section E | 🔴 REQUIRED |
| UI-03 | Empty state placeholders built with Coss UI | [P01] Section E | 🔴 REQUIRED |
| UI-04 | Toast notifications built with Coss UI | [P01] Section E | 🔴 REQUIRED |

---

## 3. Feature Request Submission & Feed Requirements 🔴 REQUIRED

> Source: [P01] Section 2A

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| FR-01 | Modal form for feature request submission | [P01] 2A | 🔴 REQUIRED |
| FR-02 | Form validation | [P01] 2A | 🔴 REQUIRED |
| FR-03 | Submit title field | [P01] 2A | 🔴 REQUIRED |
| FR-04 | Submit rich Markdown description | [P01] 2A | 🔴 REQUIRED |
| FR-05 | Submit category tags (UI/UX, Integrations, Performance, General) | [P01] 2A | 🔴 REQUIRED |
| FR-06 | Dynamic feed displaying request cards | [P01] 2A | 🔴 REQUIRED |
| FR-07 | Cards show author info | [P01] 2A | 🔴 REQUIRED |
| FR-08 | Cards show status badges | [P01] 2A | 🔴 REQUIRED |
| FR-09 | Cards show vote count | [P01] 2A | 🔴 REQUIRED |
| FR-10 | Cards show comment count | [P01] 2A | 🔴 REQUIRED |
| FR-11 | Sorting: Most Upvoted / Trending | [P01] 2A | 🔴 REQUIRED |
| FR-12 | Sorting: Newest | [P01] 2A | 🔴 REQUIRED |
| FR-13 | Sorting: Most Discussed | [P01] 2A | 🔴 REQUIRED |
| FR-14 | Filtering by category | [P01] 2A | 🔴 REQUIRED |
| FR-15 | Filtering by status | [P01] 2A | 🔴 REQUIRED |

---

## 4. Atomic Upvoting Engine Requirements 🔴 REQUIRED

> Source: [P01] Section 2B

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| VT-01 | Prevent duplicate votes per user | [P01] 2B | 🔴 REQUIRED |
| VT-02 | Use atomic MongoDB operators ($addToSet, $pull, $inc) | [P01] 2B | 🔴 REQUIRED |
| VT-03 | Optimistic UI updates on frontend | [P01] 2B | 🔴 REQUIRED |
| VT-04 | Instant rollback on request failure | [P01] 2B | 🔴 REQUIRED |
| VT-05 | Unauthenticated users clicking upvote → login/signup modal | [P01] 2B | 🔴 REQUIRED |

---

## 5. Threaded Discussions & Moderation Requirements 🔴 REQUIRED

> Source: [P01] Section 2C

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| CM-01 | Threaded comments on feature request pages | [P01] 2C | 🔴 REQUIRED |
| CM-02 | Markdown support in comments | [P01] 2C | 🔴 REQUIRED |
| CM-03 | Author permissions to edit/delete own comments | [P01] 2C | 🔴 REQUIRED |
| CM-04 | Admin permissions to edit/delete any comment | [P01] 2C | 🔴 REQUIRED |

---

## 6. Admin Controls & Kanban Roadmap Requirements 🔴 REQUIRED

> Source: [P01] Section 2D

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| AD-01 | Admin panel with RBAC | [P01] 2D | 🔴 REQUIRED |
| AD-02 | Status transitions: Under Review → Planned → In Progress → Completed | [P01] 2D | 🔴 REQUIRED |
| AD-03 | Public 3-column Kanban Roadmap view | [P01] 2D | 🔴 REQUIRED |
| AD-04 | Roadmap synchronizes with backend state changes | [P01] 2D | 🔴 REQUIRED |

> [!NOTE]
> The PDF says "3-column Kanban" but there are 4 statuses (Under Review, Planned, In Progress, Completed). **Implementation decision required**: The Kanban likely displays 3 active columns (Planned, In Progress, Completed) while "Under Review" items remain in the feed/admin panel, not yet on the roadmap. This is RECOMMENDED interpretation. Alternative: show all 4 as columns.

---

## 7. Search & System UX Requirements 🔴 REQUIRED

> Source: [P01] Section 2E

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| SX-01 | Debounced full-text search across titles and descriptions | [P01] 2E | 🔴 REQUIRED |
| SX-02 | Loading skeletons | [P01] 2E | 🔴 REQUIRED |
| SX-03 | Empty state placeholders | [P01] 2E | 🔴 REQUIRED |
| SX-04 | Toast notifications | [P01] 2E | 🔴 REQUIRED |

---

## 8. Deliverables Checklist Requirements 🔴 REQUIRED

> Source: [P01] Section 3 — Deliverables Checklist

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| DL-01 | Dual-token JWT auth | [P01] Deliverables | 🔴 REQUIRED |
| DL-02 | Route guards | [P01] Deliverables | 🔴 REQUIRED |
| DL-03 | Secure cookie handling | [P01] Deliverables | 🔴 REQUIRED |
| DL-04 | Password recovery | [P01] Deliverables | 🔴 REQUIRED |
| DL-05 | Mongoose schemas (User, Post, Comment) | [P01] Deliverables | 🔴 REQUIRED |
| DL-06 | Atomic vote handling | [P01] Deliverables | 🔴 REQUIRED |
| DL-07 | Pagination queries | [P01] Deliverables | 🔴 REQUIRED |
| DL-08 | Coss UI components | [P01] Deliverables | 🔴 REQUIRED |
| DL-09 | 3-column Kanban board | [P01] Deliverables | 🔴 REQUIRED |
| DL-10 | Optimistic upvote state | [P01] Deliverables | 🔴 REQUIRED |
| DL-11 | Clean GitHub repo | [P01] Deliverables | 🔴 REQUIRED |
| DL-12 | Sample .env.example | [P01] Deliverables | 🔴 REQUIRED |
| DL-13 | API documentation | [P01] Deliverables | 🔴 REQUIRED |

---

## 9. Technical Assessment Universal Requirements 🔴 REQUIRED

> Source: [TA] — applies to all projects

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| TA-01 | Working application covering major requirements | [TA] §3 | 🔴 REQUIRED |
| TA-02 | Functional frontend and backend | [TA] §3 | 🔴 REQUIRED |
| TA-03 | Store and retrieve data appropriately | [TA] §3 | 🔴 REQUIRED |
| TA-04 | Implement required APIs and business logic | [TA] §3 | 🔴 REQUIRED |
| TA-05 | Handle basic validation and error cases | [TA] §3 | 🔴 REQUIRED |
| TA-06 | Clean and understandable project structure | [TA] §3 | 🔴 REQUIRED |
| TA-07 | Follow reasonable coding and development practices | [TA] §3 | 🔴 REQUIRED |
| TA-08 | External services/libraries explained in documentation | [TA] §3 | 🔴 REQUIRED |
| TA-09 | Public Git repository with complete source code | [TA] §4 | 🔴 REQUIRED |
| TA-10 | README.md with setup instructions | [TA] §4 | 🔴 REQUIRED |
| TA-11 | Environment variable requirements documented | [TA] §4 | 🔴 REQUIRED |
| TA-12 | No secrets committed to repository | [TA] §4 | 🔴 REQUIRED |
| TA-13 | Project explanation video | [TA] §5 | 🔴 REQUIRED |
| TA-14 | Public video link | [TA] §5 | 🔴 REQUIRED |
| TA-15 | Candidate must be able to explain code and technical decisions | [TA] §8 | 🔴 REQUIRED |

---

## 10. Responsive Design 🔴 REQUIRED

> Source: [TA] §7 — Evaluation includes "responsiveness"

| ID | Requirement | Source | Classification |
|----|-------------|--------|---------------|
| RD-01 | Responsive design across devices | [TA] §7 | 🔴 REQUIRED |

---

## Requirements Summary

| Category | Count | Classification |
|----------|-------|---------------|
| Security & Auth | 8 | 🔴 REQUIRED |
| UI Standard | 4 | 🔴 REQUIRED |
| Feature Requests | 15 | 🔴 REQUIRED |
| Voting | 5 | 🔴 REQUIRED |
| Comments | 4 | 🔴 REQUIRED |
| Admin & Roadmap | 4 | 🔴 REQUIRED |
| Search & UX | 4 | 🔴 REQUIRED |
| Deliverables | 13 | 🔴 REQUIRED |
| Assessment Universal | 15 | 🔴 REQUIRED |
| Responsive | 1 | 🔴 REQUIRED |
| **TOTAL** | **73** | **All 🔴 REQUIRED** |

> [!IMPORTANT]
> All 73 requirements above are explicitly traceable to the assessment PDFs. No optional feature has been classified as required.
