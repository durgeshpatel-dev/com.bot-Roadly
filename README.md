# Roadly
Customer Feedback & Public Roadmap SaaS built with the MERN stack.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` in the `server` and `client` directories if necessary, or just at the root.
3. Start development servers:
   ```bash
   npm run dev
   ```

## Approved Optional Product Features

Roadly includes two Phase 9 product enhancements:

- Public activity timeline on feature details, backed by the paginated `/api/posts/:id/activity` endpoint.
- Admin insights dashboard, backed by the admin-only read-only `/api/admin/stats` endpoint.

Both features reuse the existing authentication, authorization, Post, Comment, and React Query systems. No credentials or private voter data are included in their responses.
