# 00 — PROJECT MASTER DOCUMENT

## Roadly — Customer Feedback & Public Roadmap SaaS

**Version:** 1.0.0  
**Last Updated:** 2026-09-16  
**Status:** DOCUMENTATION PHASE (Phase 0)  
**Assessment:** Project 01 — Feature Request & Public Roadmap Portal

---

## Purpose

This is the **single source of truth** for the Roadly project. Every AI coding agent, developer, or reviewer must read this document before making any changes to the codebase.

Roadly is a production-quality customer feedback platform built as a MERN stack application for a technical assessment. It allows users to submit feature requests, vote on them, participate in threaded discussions, and track feature progress on a public Kanban roadmap.

---

## Source Assessment Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Technical Assessment | `reference/Technical Assessment.pdf` | Universal assessment rules, evaluation criteria, deliverables |
| Project 01 Brief | `reference/Project 01 - Feature Request & Roadmap Portal.pdf` | Feature-specific requirements for the selected project |

> [!CAUTION]
> Do NOT treat the other four project PDFs (Projects 02–05) as requirements. They are reference-only.

---

## Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React.js + TypeScript | Assessment specifies React; TypeScript adds type safety and explainability |
| **UI Library** | Coss UI (coss.com/ui) | **Assessment-mandated**: "Build all interface components using coss.com/ui primitives" |
| **Styling** | Tailwind CSS v4 | Coss UI is built on Tailwind CSS; required dependency |
| **Backend** | Node.js + Express.js | Assessment-specified MERN stack |
| **Database** | MongoDB + Mongoose | Assessment-specified MERN stack |
| **Authentication** | JWT (Access + Refresh tokens) | Assessment-mandated pair-token auth |
| **Build Tool** | Vite | Modern, fast bundler for React + TypeScript |

---

## Documentation Index

Every document below is maintained under `docs/`. Agents must consult the relevant document before modifying any part of the system.

| # | Document | Purpose |
|---|----------|---------|
| 00 | [PROJECT-MASTER.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/00-PROJECT-MASTER.md) | This file — project overview and navigation |
| 01 | [REQUIREMENTS.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/01-REQUIREMENTS.md) | All requirements with source traceability |
| 02 | [FEATURE-SPECIFICATION.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/02-FEATURE-SPECIFICATION.md) | Detailed feature specifications |
| 03 | [ARCHITECTURE.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/03-ARCHITECTURE.md) | System architecture and patterns |
| 04 | [DATABASE-DESIGN.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/04-DATABASE-DESIGN.md) | MongoDB schema design and indexing |
| 05 | [API-SPECIFICATION.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/05-API-SPECIFICATION.md) | Complete REST API reference |
| 06 | [AUTH-SECURITY.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/06-AUTH-SECURITY.md) | Authentication, authorization, and security |
| 07 | [FRONTEND-ARCHITECTURE.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/07-FRONTEND-ARCHITECTURE.md) | Frontend structure, routing, state management |
| 08 | [UI-DESIGN-SYSTEM.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/08-UI-DESIGN-SYSTEM.md) | UI/UX design system and Coss UI usage |
| 09 | [FOLDER-STRUCTURE.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/09-FOLDER-STRUCTURE.md) | Project directory layout |
| 10 | [DEVELOPMENT-PHASES.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/10-DEVELOPMENT-PHASES.md) | Phased implementation plan |
| 11 | [CODING-RULES.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/11-CODING-RULES.md) | Development standards and AI agent rules |
| 12 | [TESTING-STRATEGY.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/12-TESTING-STRATEGY.md) | Testing approach and checklists |
| 13 | [DEPLOYMENT.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/13-DEPLOYMENT.md) | Deployment architecture and checklist |
| 14 | [README-PLAN.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/14-README-PLAN.md) | README structure plan |
| 15 | [DEMO-VIDEO-PLAN.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/15-DEMO-VIDEO-PLAN.md) | Explanation video structure |
| 16 | [EXTRA-FEATURES.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/16-EXTRA-FEATURES.md) | Optional features evaluation |
| 17 | [DECISION-LOG.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/17-DECISION-LOG.md) | Technical decision records |
| 18 | [PROGRESS-TRACKER.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/18-PROGRESS-TRACKER.md) | Phase/task progress tracking |
| 19 | [AI-AGENT-WORKFLOW.md](file:///c:/Users/MOBILE/Desktop/com.bot%20project/docs/19-AI-AGENT-WORKFLOW.md) | Workflow rules for AI coding agents |

**Cursor Rules:** [`.cursor/rules/project-rules.mdc`](file:///c:/Users/MOBILE/Desktop/com.bot%20project/.cursor/rules/project-rules.mdc)

---

## Requirement Classification Legend

Throughout all documentation, requirements are classified as:

| Label | Meaning |
|-------|---------|
| **🔴 REQUIRED** | Explicitly stated in assessment PDFs. Must be implemented. |
| **🟡 RECOMMENDED** | Not explicitly required but architecturally beneficial. Proposed by documentation author. |
| **🔵 OPTIONAL** | Nice-to-have. Only implement after all REQUIRED features are complete and stable. |
| **⚪ DEFERRED** | Evaluated and intentionally postponed. Do not implement unless explicitly reconsidered. |
| **🟠 IMPLEMENTATION DECISION** | Not specified by assessment. Agent/developer must decide during implementation. |

---

## Assessment Evaluation Criteria

The assessment evaluates these areas (from Technical Assessment PDF):

| Area | What They Look For |
|------|-------------------|
| Requirement Understanding | How well you understood and implemented the selected project |
| Functionality | Whether the core features work correctly |
| Code Quality | Clean, readable, maintainable code |
| Architecture | Logical application and backend architecture |
| Database Design | Appropriate data modelling and database usage |
| API Development | Proper API structure, validation, and error handling |
| Frontend | Usability, responsiveness, and implementation quality |
| Problem Solving | How you approached and solved technical challenges |
| Technical Decisions | Understanding of why particular technologies or approaches were used |
| Documentation | Quality of README and setup instructions |
| Explanation | Clarity and depth of the project explanation video |

---

## Known Open Decisions

These decisions require resolution before or during implementation:

1. **TypeScript vs JavaScript** — TypeScript is RECOMMENDED for type safety and explainability. Final decision during Phase 1.
2. **Coss UI installation method** — Copy-paste vs shadcn CLI. Needs verification of current CLI support.
3. **MongoDB text search vs Atlas Search vs regex** — Depends on deployment target (local MongoDB vs Atlas).
4. **Trending algorithm specifics** — Assessment mentions "Most Upvoted / Trending" but does not define the algorithm.
5. **Email verification simulation mechanism** — Console log vs in-app token display vs nodemailer with Ethereal.
6. **Dark/light theme** — Coss UI supports theming; worth including but not assessment-mandated.

---

## First Development Task

**Phase 1: Repository Initialization & MERN Foundation**

When documentation review is complete and approved, the first coding task is:
1. Initialize a monorepo with `client/` and `server/` directories
2. Set up Vite + React + TypeScript for the client
3. Set up Node.js + Express + TypeScript for the server
4. Install and configure Coss UI + Tailwind CSS
5. Configure ESLint, Prettier, and basic project tooling
6. Create `.env.example` files
7. Verify both dev servers start successfully

> [!IMPORTANT]
> Implementation must NOT begin until this documentation phase is reviewed and approved.
