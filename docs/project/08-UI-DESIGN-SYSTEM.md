# UI design system

Roadly uses checked-in Coss UI primitives built on Base UI and Tailwind CSS v4. `client/components.json` records setup; `client/src/components/ui/` holds source. Product components compose this system.

## Visual language and components

`client/src/index.css` provides shared theme tokens, spacing, page sizing, readable typography, Markdown, and reduced-motion rules. Status badges include text; color is supplementary. ThemeContext implements Light, Dark, and System and persists only `roadly-theme`.

| Primitives | Application use |
|---|---|
| Button, Input, Textarea, Label, Checkbox | Auth, post, comment, filter forms |
| Dialog | Request submission and auth prompts |
| Sheet | Narrow-screen navigation and filters |
| Card, Badge, Avatar | Requests, identities, statuses, insights |
| Table, Select, Menu | Admin controls |
| Skeleton, Empty, Alert, Toast | Loading, empty, error, feedback |
| Pagination | Content navigation |

Other Coss primitives are intentionally reusable library source, not evidence of calendar, notification, or command-palette product features.

## Layout and accessibility

The feed uses a desktop filter sidebar and a mobile Sheet. The roadmap stacks on narrow screens. Detail/auth pages avoid fixed desktop widths. A skip link targets the main landmark; forms have labels; dialogs/sheets have titles; icon actions have names; focus is visible; status feedback includes text.

Base UI supplies primitive focus management, but product composition still requires keyboard checks. Release QA targets **320, 375, 768, 1024, and 1440 px**, light/dark/system, overflow, keyboard navigation, modal/Sheet focus, and loading/error/empty states. See [release evidence](21-RELEASE-REPORT.md) for actual results and gaps; this is not a certified WCAG audit.

User Markdown never executes raw HTML. Long content wraps or scrolls within its own region instead of widening the page.
