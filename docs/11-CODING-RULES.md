# 11 — CODING RULES

## Language Decision

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | TypeScript | Type safety, better DX, self-documenting, easier to explain in interview |
| Backend | TypeScript | Shared types with frontend, Mongoose type support, consistent codebase |

**Classification:** 🟡 RECOMMENDED. Assessment says "MERN" without mandating JS or TS. TypeScript is the stronger choice for demonstrating code quality.

---

## General Coding Standards

### File & Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PostCard.tsx`, `VoteButton.tsx` |
| Hooks | camelCase with `use` prefix | `usePosts.ts`, `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts`, `catchAsync.ts` |
| API functions | camelCase with resource prefix | `posts.api.ts`, `auth.api.ts` |
| Models | PascalCase with `.model` suffix | `User.model.ts`, `Post.model.ts` |
| Controllers | camelCase with `.controller` suffix | `auth.controller.ts` |
| Services | camelCase with `.service` suffix | `auth.service.ts` |
| Routes | camelCase with `.routes` suffix | `auth.routes.ts` |
| Validators | camelCase with `.validator` suffix | `auth.validator.ts` |
| Types | PascalCase interfaces, camelCase for type files | `IUser`, `auth.types.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_VOTE_COUNT`, `STATUS_ENUM` |
| Environment variables | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| CSS classes | Tailwind utilities (no custom class naming) | — |

### Code Quality Rules

1. **No unnecessary dependencies.** Before adding a library, check if it can be done with existing tools. Document why each dependency is needed.
2. **No duplicate utilities.** Before creating a helper function, check if one already exists.
3. **No giant files.** Max ~300 lines per file (soft limit). Split if larger.
4. **No giant components.** Max ~150 lines per React component. Extract sub-components.
5. **Meaningful naming.** Variable/function names should be self-documenting. No `data`, `temp`, `x`.
6. **Consistent error handling.** All async operations use try/catch or catchAsync wrapper. Never swallow errors.
7. **Input validation.** All API endpoints validate input before processing. Never trust client input.
8. **Secure secrets.** All secrets in `.env`. Never hardcode credentials, API keys, or tokens.
9. **Environment variables.** Use `process.env.VAR_NAME`. Validate required env vars at startup.
10. **No hardcoded credentials.** Passwords, secrets, connection strings — all from env.
11. **No token leakage.** Access tokens never in localStorage/sessionStorage/URL parameters. Never log tokens.
12. **No console spam in production.** Use `console.log` only in development. Use proper logger in production.
13. **Comments only when useful.** Comment WHY, not WHAT. The code itself should be readable.
14. **Consistent API response format.** All endpoints use `{ success, data, error, meta }` format.
15. **Reusable functions.** Don't repeat logic. Extract shared code to utils or services.
16. **Separation of concerns.** Routes → Controllers → Services → Models. No business logic in routes or controllers.
17. **Avoid premature abstraction.** Don't create abstractions until you need them in 2+ places.
18. **Accessibility.** All interactive elements keyboard accessible, proper ARIA labels, focus management.
19. **Responsive design.** Test all layouts at 320px, 768px, 1024px, and 1440px widths.
20. **Security review.** Before marking any auth/security code complete, review against OWASP top 10.

### Testing Standards

21. **Tests for critical business logic.** At minimum: auth flows, voting atomicity, authorization.
22. **Test error paths.** Don't just test happy paths. Test validation errors, unauthorized access, edge cases.
23. **No test code in production.** Test files in dedicated `tests/` directory.

### Code Formatting

24. **Linting:** ESLint with TypeScript rules.
25. **Formatting:** Prettier with consistent config.
26. **Run lint before commit.**

### Git Discipline

27. **Meaningful commit messages.** Format: `type(scope): description` (e.g., `feat(auth): implement login endpoint`)
28. **No large uncommitted changes.** Commit frequently at logical checkpoints.
29. **No secrets in commits.** Use `.gitignore` and `.env.example`.
30. **No generated files in Git.** Ignore `node_modules`, `dist`, `.env`.

---

## AI Agent Rules

These rules apply specifically to AI coding agents working on this project:

### Before Every Task

1. **Read relevant documentation.** Before modifying code, read:
   - `00-PROJECT-MASTER.md` (if not recently read)
   - The relevant phase document
   - The relevant architecture/API/database document

2. **Inspect current code.** Before making changes, examine the files you'll modify and their imports.

3. **Make a plan.** For non-trivial changes, outline what you'll do before writing code.

### During Implementation

4. **Implement only the requested scope.** Do not add unrequested features, refactors, or "improvements."

5. **Do not modify unrelated files.** Changes should be minimal and focused.

6. **Do not change architecture without documenting.** If you believe the architecture should change, document the decision in `17-DECISION-LOG.md` and get approval before proceeding.

7. **Do not invent requirements.** Only implement what is documented in `01-REQUIREMENTS.md` and `02-FEATURE-SPECIFICATION.md`. If a requirement is ambiguous, ask for clarification.

8. **Preserve existing behavior.** Unless the task explicitly changes it, existing features must continue working.

9. **Prefer incremental changes.** Make small, testable changes rather than large rewrites.

### After Implementation

10. **Run relevant tests/checks.** After changes, run:
    - Linting (`npm run lint`)
    - Type checking (`npx tsc --noEmit`)
    - Relevant tests
    - Manual verification of the changed feature

11. **Review security.** For auth/security changes, verify:
    - Tokens stored correctly (not in localStorage)
    - Cookies have correct flags
    - Authorization enforced at API level
    - Input validated

12. **Update progress tracker.** Mark completed tasks in `18-PROGRESS-TRACKER.md`.

13. **Report what changed.** At the end of a task, summarize:
    - Files created/modified
    - Features implemented
    - Decisions made

14. **Report any assumptions.** If you made implementation decisions, document them.

15. **Report unresolved issues.** If you encountered problems you couldn't resolve, document them.

16. **Never mark a task complete when validation has not been performed.** If you couldn't test something, say so explicitly.

### Prohibitions

17. **Do NOT rebuild the project from scratch** unless explicitly instructed.

18. **Do NOT overwrite working architecture** casually. Refactoring requires documentation and justification.

19. **Do NOT introduce new dependencies without justification.** Document why the dependency is needed and what alternatives were considered.

20. **Do NOT modify unrelated areas.** Stay within the scope of the current task.

21. **Do NOT silently change requirements.** If something in the docs doesn't match what you think is right, flag it — don't just change it.

22. **Do NOT mark incomplete work as completed.** Be honest about what was and wasn't done.

23. **Ask for clarification** when requirements genuinely conflict or are ambiguous.

---

## Dependency Approval Checklist

Before adding any new dependency, answer:

| Question | Answer Required |
|----------|----------------|
| What does this dependency do? | Clear description |
| Why can't we do this without it? | Specific justification |
| How large is it (bundle size impact)? | Size check |
| Is it actively maintained? | Last update date, stars, issues |
| Are there simpler alternatives? | List alternatives considered |
| Does the assessment allow external libraries? | Yes — [TA] §3 says "You may use third-party libraries" |
| Is it documented in project docs? | Must be mentioned in README |

---

## Import Order Convention 🟡 RECOMMENDED

```typescript
// 1. External dependencies
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules (absolute imports)
import { PostCard } from '@/components/posts/PostCard';
import { usePosts } from '@/hooks/usePosts';

// 3. Types
import type { Post } from '@/types/post.types';

// 4. Styles (if any)
import './styles.css';
```
