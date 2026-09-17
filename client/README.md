# Roadly client

React/TypeScript frontend for Roadly. Start with the [root README](../README.md) for installation, environment, MongoDB, authentication, and end-to-end setup.

From the repository root:

```sh
npm run dev -w client
npm run test -w client
npm run typecheck -w client
npm run lint -w client
npm run build -w client
npm run preview -w client
```

Copy `.env.example` to `.env`; `VITE_API_URL` points to the API including `/api`. Vite values are public build-time configuration. Never add credentials or signing secrets here.

The app uses Coss/Base UI primitives, Tailwind v4, TanStack Query, React Router, Axios, and safe Markdown rendering. Routes and query ownership are documented in [frontend architecture](../docs/07-FRONTEND-ARCHITECTURE.md). Tests are colocated under `src/**/__tests__`. Production output is `dist/`; configure SPA fallback for deep links. `vercel.json` supplies that fallback and static response headers.

Access tokens stay in memory; refresh uses an httpOnly cookie. Only the theme preference is persisted in localStorage.
