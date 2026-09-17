# 15 — DEMO VIDEO PLAN

## Video Requirements (from Technical Assessment)

> "Record a video explaining your implementation. The video should help us understand what you built, how you built it, and why you made your technical decisions."

---

## Video Structure

### 1. Introduction (~1 min)
- Your name and the project name (Roadly)
- "I selected Project 01 — Feature Request & Public Roadmap Portal"
- Brief overview: "Roadly is a customer feedback platform that allows users to submit feature requests, vote on them, discuss them, and track their progress on a public roadmap."

### 2. Problem Statement (~1 min)
- What problem does this solve?
- "Product teams need a way to collect and prioritize customer feedback. Users want to see that their ideas are heard and tracked."
- Comparison to tools like Canny, Featurebase
- Why this is useful for developer/product companies

### 3. Technology Stack (~1–2 min)
- MERN stack: MongoDB, Express.js, React, Node.js
- TypeScript for type safety
- Coss UI for consistent design (explain what it is — component library built on Base UI)
- Tailwind CSS for styling
- TanStack Query for server state
- React Hook Form + Zod for forms and validation
- Explain why these choices were made

### 4. Live Demo (~5–7 min)

Walk through the application:

**Public features:**
- Browse the feature request feed
- Show sorting (newest, most voted, most discussed)
- Show filtering (by category, by status)
- Show search (debounced)
- View a feature request detail page
- View the public roadmap (3-column Kanban)

**User features:**
- Sign up (show email verification simulation — console token)
- Log in
- Submit a new feature request (show the modal, Markdown, categories)
- Vote on a request (show optimistic UI — instant update)
- Attempt to vote when logged out (show login modal)
- Add a comment (show Markdown rendering)
- Reply to a comment (show threading)
- Edit/delete own comment

**Admin features:**
- Log in as admin
- Access admin panel
- Change a post's status (show it move on the roadmap)
- Delete a post/comment (moderation)

**Error handling:**
- Show a loading skeleton
- Show an empty state
- Show a toast notification
- Show form validation errors

### 5. Architecture Walkthrough (~3–4 min)

Show and explain:
- Folder structure (client/, server/, docs/)
- Backend layers: routes → controllers → services → models
- Middleware stack: auth, validation, error handling
- Frontend structure: pages, components, hooks, contexts
- How Coss UI components are used

### 6. Database Design (~2–3 min)
- Show the schema design (User, Post, Comment, RefreshToken)
- Explain the voters array on Post
- Explain why voteCount is denormalized
- Explain the text index for search
- Explain the adjacency list for comments
- Show an example document in MongoDB

### 7. Authentication & Security (~3–4 min)
- **This is crucial — explain in depth**
- Dual-token JWT: Access (15min, in-memory) + Refresh (7d, httpOnly cookie)
- Why access token is NOT in localStorage
- Token rotation: every refresh generates new tokens
- Reuse detection: what happens if a stolen token is reused
- Cookie configuration (httpOnly, Secure, SameSite)
- Password hashing with bcrypt
- Role-based access control
- Show the Axios interceptor for automatic token refresh

### 8. Important API Design (~2 min)
- RESTful endpoint structure
- Consistent response format
- Validation middleware
- Centralized error handling
- Show an example request/response

### 9. Frontend Architecture (~2–3 min)
- React Router for routing
- TanStack Query for server state (caching, refetching)
- Auth context for auth state
- Show optimistic voting implementation
- Route guards

### 10. Important Technical Decisions (~2 min)
- Why offset pagination over cursor-based
- Why embedded voters array over separate Vote collection
- Why adjacency list for comments
- Why Zod for validation (shared schemas)
- Why Vite over Create React App

### 11. Optimistic Voting Deep Dive (~2 min)
- **Explain this specifically — assessment highlights it**
- Show the code: onMutate → optimistic update → onError → rollback → onSettled → invalidate
- Show atomic MongoDB operations ($addToSet, $pull, $inc)
- Explain why this prevents duplicates

### 12. RBAC (~1 min)
- Two roles: user, admin
- Authorization at API level, not just frontend
- Show middleware: authenticate → authorize('admin')

### 13. Challenges & How Solved (~1–2 min)
- Be honest about difficulties encountered
- Examples: Token refresh race conditions, cookie configuration for cross-origin, optimistic UI rollback
- How you solved them

### 14. Extra Features (~1 min, if applicable)
- List any additional features beyond requirements
- Briefly explain why they add value

### 15. Limitations & Future Improvements (~1 min)
- Be honest — assessment explicitly asks for this
- What would you improve with more time?
- Examples: Real email, WebSocket for real-time, drag-and-drop Kanban, more comprehensive testing

### 16. Conclusion (~30 sec)
- Summary
- Thank the reviewers

---

## Video Production Notes

| Aspect | Recommendation |
|--------|---------------|
| **Duration** | 20–30 minutes total |
| **Recording** | Screen recording with microphone audio |
| **Tool** | OBS Studio, Loom, or screen recorder |
| **Code display** | Use VS Code with a readable theme and font size |
| **Browser** | Show in Chrome with DevTools visible when demonstrating auth/cookies |
| **Upload** | YouTube (unlisted) or Google Drive (anyone with link) |
| **Permission** | Verify the link works in an incognito window |

---

## Key Assessment Emphasis

From the Technical Assessment:
> "The video should help us understand what you built, **how you built it**, and **why you made your technical decisions**."

The video is NOT just a UI demo. It must show:
- Code understanding
- Architectural reasoning
- Database design decisions
- Security awareness
- Problem-solving approach
- Honest limitations

The candidate must be able to **explain** the code, not just show screens.
