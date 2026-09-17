# 09 — FOLDER STRUCTURE

## Root Directory

```
roadly/
├── client/                     # React frontend application
├── server/                     # Express backend application
├── docs/                       # Project documentation (this folder)
├── reference/                  # Assessment PDFs (source of truth)
├── .cursor/
│   └── rules/
│       └── project-rules.mdc   # Persistent rules for AI coding agents
├── .gitignore
├── .env.example                # Root env example (if applicable)
├── package.json                # Root package.json (workspace scripts)
└── README.md                   # Project README
```

---

## Client Directory

```
client/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── api/                    # API client configuration
│   │   ├── axios.ts            # Axios instance with interceptors
│   │   ├── auth.api.ts         # Auth endpoint functions
│   │   ├── posts.api.ts        # Post endpoint functions
│   │   ├── comments.api.ts     # Comment endpoint functions
│   │   ├── roadmap.api.ts      # Roadmap endpoint functions
│   │   └── admin.api.ts        # Admin endpoint functions
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Coss UI primitives (copied/installed)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── label.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── ...             # Other Coss UI components as needed
│   │   ├── layout/             # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PageLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── posts/              # Feature request components
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── VoteButton.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── CategoryTag.tsx
│   │   │   └── SortSelect.tsx
│   │   ├── comments/           # Comment components
│   │   │   ├── CommentThread.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   └── CommentForm.tsx
│   │   ├── roadmap/            # Roadmap components
│   │   │   ├── RoadmapBoard.tsx
│   │   │   ├── RoadmapColumn.tsx
│   │   │   └── RoadmapCard.tsx
│   │   ├── auth/               # Auth-related components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   └── shared/             # General shared components
│   │       ├── SearchInput.tsx
│   │       ├── FilterGroup.tsx
│   │       ├── Pagination.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── MarkdownRenderer.tsx
│   │       └── ConfirmDialog.tsx
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Auth context hook
│   │   ├── usePosts.ts         # Post queries/mutations
│   │   ├── useComments.ts      # Comment queries/mutations
│   │   ├── useVote.ts          # Vote mutation with optimistic UI
│   │   ├── useRoadmap.ts       # Roadmap query
│   │   ├── useDebounce.ts      # Debounce utility hook
│   │   └── useAdmin.ts         # Admin queries/mutations
│   ├── pages/                  # Page components (one per route)
│   │   ├── HomePage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── RoadmapPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MyRequestsPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── AdminPostsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── routes/                 # Route definitions and guards
│   │   ├── AppRouter.tsx       # Main router with all routes
│   │   ├── ProtectedRoute.tsx
│   │   ├── GuestRoute.tsx
│   │   └── AdminRoute.tsx
│   ├── lib/                    # Utility functions
│   │   ├── utils.ts            # General utilities (cn, formatDate, etc.)
│   │   └── constants.ts        # App-wide constants
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── post.types.ts
│   │   ├── comment.types.ts
│   │   └── api.types.ts
│   ├── validations/            # Zod schemas (shared with server if possible)
│   │   ├── auth.schema.ts
│   │   ├── post.schema.ts
│   │   └── comment.schema.ts
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles + Tailwind directives
├── components.json             # Coss UI / shadcn configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── package.json
├── .env.example
└── .eslintrc.cjs               # ESLint configuration
```

---

## Server Directory

```
server/
├── src/
│   ├── config/                 # Configuration
│   │   ├── db.ts               # MongoDB connection setup
│   │   ├── env.ts              # Environment variable validation
│   │   └── cors.ts             # CORS configuration
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── post.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── roadmap.controller.ts
│   │   └── admin.controller.ts
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── post.service.ts
│   │   ├── comment.service.ts
│   │   ├── roadmap.service.ts
│   │   └── admin.service.ts
│   ├── models/                 # Mongoose schemas/models
│   │   ├── User.model.ts
│   │   ├── Post.model.ts
│   │   ├── Comment.model.ts
│   │   └── RefreshToken.model.ts
│   ├── middleware/              # Express middleware
│   │   ├── authenticate.ts     # JWT verification
│   │   ├── authorize.ts        # Role-based access
│   │   ├── validate.ts         # Request validation
│   │   ├── errorHandler.ts     # Centralized error handler
│   │   └── rateLimiter.ts      # Rate limiting
│   ├── routes/                 # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── post.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── roadmap.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts            # Route aggregator
│   ├── validators/             # Validation schemas
│   │   ├── auth.validator.ts
│   │   ├── post.validator.ts
│   │   └── comment.validator.ts
│   ├── utils/                  # Utility functions
│   │   ├── AppError.ts         # Custom error class
│   │   ├── catchAsync.ts       # Async error wrapper
│   │   ├── token.ts            # JWT and crypto token utilities
│   │   ├── email.ts            # Email simulation
│   │   └── response.ts         # Response formatting helpers
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Custom types, interfaces, express extensions
│   ├── seeds/                  # Database seed scripts
│   │   └── admin.seed.ts       # Create initial admin user
│   └── app.ts                  # Express app setup
│   └── server.ts               # Entry point (listen)
├── tests/                      # Test files
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── posts.test.ts
│   │   ├── comments.test.ts
│   │   └── voting.test.ts
│   └── setup.ts                # Test configuration
├── tsconfig.json
├── package.json
├── .env.example
└── .eslintrc.cjs
```

---

## Docs Directory

```
docs/
├── 00-PROJECT-MASTER.md
├── 01-REQUIREMENTS.md
├── 02-FEATURE-SPECIFICATION.md
├── 03-ARCHITECTURE.md
├── 04-DATABASE-DESIGN.md
├── 05-API-SPECIFICATION.md
├── 06-AUTH-SECURITY.md
├── 07-FRONTEND-ARCHITECTURE.md
├── 08-UI-DESIGN-SYSTEM.md
├── 09-FOLDER-STRUCTURE.md        (this file)
├── 10-DEVELOPMENT-PHASES.md
├── 11-CODING-RULES.md
├── 12-TESTING-STRATEGY.md
├── 13-DEPLOYMENT.md
├── 14-README-PLAN.md
├── 15-DEMO-VIDEO-PLAN.md
├── 16-EXTRA-FEATURES.md
├── 17-DECISION-LOG.md
├── 18-PROGRESS-TRACKER.md
└── 19-AI-AGENT-WORKFLOW.md
```

---

## Directory Responsibility Summary

| Directory | Responsibility |
|-----------|---------------|
| `client/src/api/` | API client functions — one file per resource domain |
| `client/src/components/ui/` | Coss UI primitives (copied/installed source) — **do not modify** unless extending |
| `client/src/components/layout/` | Page layout wrappers — Navbar, Footer, Sidebar |
| `client/src/components/{feature}/` | Feature-specific composed components |
| `client/src/components/shared/` | Cross-cutting reusable components |
| `client/src/contexts/` | React Context providers (auth only, unless more needed) |
| `client/src/hooks/` | Custom hooks — data fetching, state logic, utilities |
| `client/src/pages/` | One component per route — combines layout + feature components |
| `client/src/routes/` | React Router config + route guard components |
| `client/src/lib/` | Pure utility functions with no React dependency |
| `client/src/types/` | TypeScript interfaces and types |
| `client/src/validations/` | Zod schemas for form validation |
| `server/src/config/` | App configuration — DB, env, CORS |
| `server/src/controllers/` | Request parsing + response formatting — thin |
| `server/src/services/` | Business logic — the "brain" of the backend |
| `server/src/models/` | Mongoose schemas, indexes, hooks |
| `server/src/middleware/` | Express middleware — auth, validation, error handling |
| `server/src/routes/` | URL → middleware → controller mapping |
| `server/src/validators/` | Request validation schemas (zod or express-validator) |
| `server/src/utils/` | Shared utility functions |
| `server/src/seeds/` | Database seeding scripts |
| `server/tests/` | All test files — unit and integration |
