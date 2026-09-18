# Roadly project master

Roadly is a Customer Feedback + Feature Request + Public Product Roadmap application for **Technical Assessment Project 01**. The implemented stack is React, TypeScript, Vite, Tailwind CSS v4, Coss UI/Base UI, TanStack Query, Axios, React Router, Node.js, Express, and Mongoose/MongoDB.

The repository contains completed feature phases 1–9 and a final engineering release pass. Implementation and fresh verification results take precedence over historical phase plans. A working implementation does not imply that hosting, a recorded video, or the final Git push has been completed.

## Sources and scope

- [Technical Assessment](../reference/Technical%20Assessment.pdf): universal assessment rules and deliverables.
- [Project 01 brief](../reference/Project%2001%20-%20Feature%20Request%20%26%20Roadmap%20Portal.pdf): product requirements.
- Other assessment PDFs under `reference/` are retained as references, not requirements.
- [Requirements](01-REQUIREMENTS.md) preserves all 73 assessment IDs.
- [Implementation matrix](20-REQUIREMENT-TRACEABILITY.md) maps each ID to code and verification.
- [Release evidence](21-RELEASE-REPORT.md) records final checks and remaining manual work.

Mandatory features include dual JWT authentication, verification simulation, password recovery, feature requests, search/filter/sort, atomic optimistic voting, two-level comments, admin RBAC, and a public three-column roadmap. Approved additions are theme preferences, the public activity timeline, and admin insights. Notifications, follows, profiles, WebSockets, AI features, and a separate trending algorithm remain out of scope.

## Documentation index

| Document | Purpose |
|---|---|
| [01 Requirements](01-REQUIREMENTS.md) | Original assessment IDs and source mapping |
| [02 Feature specification](02-FEATURE-SPECIFICATION.md) | Implemented behavior |
| [03 Architecture](03-ARCHITECTURE.md) | Boundaries and request flow |
| [04 Database design](04-DATABASE-DESIGN.md) | Models and index inventory |
| [05 API specification](05-API-SPECIFICATION.md) | Methods, requests, responses, errors |
| [06 Auth and security](06-AUTH-SECURITY.md) | Trust boundaries and sessions |
| [07 Frontend architecture](07-FRONTEND-ARCHITECTURE.md) | Routes, state, caching |
| [08 UI design system](08-UI-DESIGN-SYSTEM.md) | Coss, themes, accessibility |
| [09 Folder structure](09-FOLDER-STRUCTURE.md) | Actual source organization |
| [10 Development phases](10-DEVELOPMENT-PHASES.md) | Delivered phase numbering |
| [11 Coding rules](11-CODING-RULES.md) | Maintenance standards |
| [12 Testing strategy](12-TESTING-STRATEGY.md) | Commands and coverage |
| [13 Deployment](13-DEPLOYMENT.md) | Production runbook |
| [14 README checklist](14-README-PLAN.md) | Submission documentation |
| [15 Demo plan](15-DEMO-VIDEO-PLAN.md) | Engineering walkthrough |
| [16 Extras](16-EXTRA-FEATURES.md) | Approved additions and exclusions |
| [17 Decision log](17-DECISION-LOG.md) | Decisions and historical context |
| [18 Progress tracker](18-PROGRESS-TRACKER.md) | Implementation and delivery state |
| [19 Agent workflow](19-AI-AGENT-WORKFLOW.md) | Future maintenance |
| [20 Traceability](20-REQUIREMENT-TRACEABILITY.md) | All assessment requirements |
| [21 Release report](21-RELEASE-REPORT.md) | Measured checks and manual steps |

Classification: **Required** comes from an assessment PDF; **recommended** is engineering guidance; **optional** is an approved addition; **deferred** is outside delivered scope; **implementation decision** resolves an unspecified detail. Do not treat a recommendation as a mandatory feature.

See [README](../README.md) for setup and [.cursor rules](../.cursor/rules/project-rules.mdc) for repository conventions.
