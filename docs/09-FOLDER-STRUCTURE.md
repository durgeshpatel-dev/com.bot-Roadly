# Repository structure

```text
roadly/
├── client/
│   ├── public/                 Static public assets
│   ├── src/
│   │   ├── api/                Axios and domain adapters
│   │   ├── components/
│   │   │   ├── ui/             Checked-in Coss primitives
│   │   │   ├── auth/           Forms/shell/guards/prompts
│   │   │   ├── posts/          Cards/forms/voting/Markdown
│   │   │   ├── comments/       Thread forms/items/list
│   │   │   ├── roadmap/        Board/columns/cards
│   │   │   ├── admin/          Moderation rows
│   │   │   ├── activity/       Timeline
│   │   │   ├── layout/         Shared page/header layouts
│   │   │   └── shared/         Search/filter/sort/pagination
│   │   ├── context/            Auth/theme/submission state
│   │   ├── hooks/              Queries and interactions
│   │   ├── pages/              Public/auth/admin routes
│   │   ├── lib/                Shared utilities
│   │   ├── types/              Contracts
│   │   ├── App.tsx             Providers and routes
│   │   ├── main.tsx            Entry
│   │   └── index.css           Theme/layout/Markdown
│   ├── components.json         Coss setup
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/             Environment/MongoDB
│   │   ├── constants/          Lifecycle
│   │   ├── controllers/        HTTP handlers
│   │   ├── middleware/         Auth/validation/errors/abuse controls
│   │   ├── models/             User/RefreshToken/Post/Comment/Activity
│   │   ├── routes/             API registration
│   │   ├── services/           Business rules
│   │   ├── seeds/              Admin setup
│   │   ├── types/              Express identity
│   │   ├── utils/              JWT/crypto/errors/responses
│   │   ├── app.ts              Testable app
│   │   └── server.ts           Process entry
│   ├── tests/                  Integration/regression suites
│   └── .env.example
├── docs/                       Specifications and release evidence
├── reference/                  Preserved assessment PDFs
├── .cursor/rules/              Maintenance rules
├── package.json                Workspace commands
├── package-lock.json           Reproducible installation
└── README.md                   Starting point
```

Frontend tests are colocated in `__tests__/`; backend tests are in `server/tests/`. There is no `client/src/contexts`, shared schema package, or Tailwind v3 config. Use `rg --files` for the current detailed inventory.

Dependencies, build output, coverage, local environment files, and machine-specific QA output are ignored generated artifacts. PDFs, docs, tests, seed utilities, and reusable Coss components remain even when not imported by product code.
