# 08 — UI DESIGN SYSTEM

## Coss UI — Primary UI Primitive System 🔴 REQUIRED

### What is Coss UI

Coss UI (`coss.com/ui`) is a modern React component library built on Base UI primitives. It is the official design system for Cal.com.

**Key characteristics:**
- Built on **Base UI** (accessible primitives with keyboard navigation, focus management, ARIA)
- **Copy-paste philosophy** (like shadcn/ui) — you own the component source code
- **Layered architecture:**
  - **Primitives:** Unstyled Base UI building blocks
  - **Particles:** Pre-assembled, styled UI patterns
  - **Atoms:** Smart, API-integrated components
- Built with **React + TypeScript + Tailwind CSS**
- Installable via **shadcn CLI** or manual copy

### Official Resources

| Resource | URL |
|----------|-----|
| Homepage | https://coss.com/ui |
| Documentation | https://coss.com/ui/docs |
| Components | https://coss.com/ui/particles |
| GitHub | https://github.com/cosscom/coss |
| Getting Started | https://coss.com/ui/docs/installation |

> [!IMPORTANT]
> Before implementation, verify the latest Coss UI installation instructions and available components at the URLs above. The library is actively evolving.

---

## Coss UI Component Usage Plan

### Components from Coss UI (Particles)

Based on the Coss UI component library, these components should be used as primitives:

| Coss UI Component | Roadly Usage |
|-------------------|-------------|
| **Button** | All buttons (submit, vote, nav, actions) |
| **Dialog / Alert Dialog** | Feature request modal, login modal, confirm delete |
| **Card** | Post cards, roadmap cards, stat cards |
| **Badge** | Status badges, category tags |
| **Input** | Form text inputs |
| **Textarea** | Description/comment editors |
| **Select** | Sort dropdown, category select |
| **Tabs** | Kanban mobile tabs, admin sections |
| **Dropdown Menu** | User menu, post actions menu |
| **Toast / Sonner** | Success/error/info notifications |
| **Skeleton** | Loading states |
| **Avatar** | User avatars (initials fallback) |
| **Separator** | Visual dividers |
| **Tooltip** | Icon button labels, info hints |
| **Checkbox** | Filter checkboxes |
| **Label** | Form labels |
| **Pagination** | Feed pagination controls |
| **Command** | Search command palette (🔵 OPTIONAL) |
| **Accordion** | FAQ, collapsible sections |
| **Popover** | Filter popover on mobile |
| **Sheet** | Mobile sidebar/filter panel |
| **Scroll Area** | Kanban columns scroll |
| **Progress** | Status flow indicator |

### Custom Application Components (composed from Coss UI)

These are Roadly-specific components built ON TOP of Coss UI primitives:

| Component | Built From | Purpose |
|-----------|-----------|---------|
| `<PostCard>` | Card + Badge + Button + Avatar | Feature request card in feed |
| `<RoadmapCard>` | Card + Badge | Simplified card for Kanban board |
| `<VoteButton>` | Button (custom styling) | Upvote toggle with count |
| `<StatusBadge>` | Badge (color variants) | Status indicator |
| `<CategoryTag>` | Badge (outline variant) | Category label |
| `<SearchInput>` | Input + icon | Debounced search |
| `<PostForm>` | Dialog + Input + Textarea + Select + Button | Create/edit request |
| `<CommentItem>` | Card + Avatar + DropdownMenu + Button | Single comment display |
| `<CommentForm>` | Textarea + Button | Comment/reply input |
| `<AuthModal>` | Dialog + Tabs + forms | Login/signup triggered by vote |
| `<EmptyState>` | Custom (illustration + text + Button) | No content message |
| `<SortSelect>` | Select | Sorting control |
| `<FilterPanel>` | Checkbox group + Badge | Category/status filters |
| `<AdminPostRow>` | Table row + Badge + DropdownMenu | Admin table row |
| `<StatsCard>` | Card + number | Admin dashboard stat |

### Where Custom Styling is Justified

| Area | Reason |
|------|--------|
| Kanban board layout | CSS Grid/Flexbox for 3-column drag-free layout; Coss UI doesn't provide a Kanban component |
| Vote button | Unique visual treatment (vertical layout, large count, animated heart/arrow) |
| Landing hero section | Brand-specific large typography and illustration |
| Feature feed layout | Sidebar + content grid specific to Roadly's information architecture |
| Markdown rendered content | Typography styles for rendered Markdown (`prose` styles via Tailwind Typography plugin) |

---

## Visual Direction

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Clean & Professional** | No unnecessary decoration. Clear hierarchy. Generous whitespace. |
| **Modern SaaS** | Inspired by products like Linear, Canny, Featurebase, Notion |
| **Responsive** | Works on mobile, tablet, desktop |
| **Consistent** | Uniform spacing, typography, colors across all pages |
| **Accessible** | WCAG AA compliance. Keyboard navigable. Screen reader friendly. |

### Color System

Use Coss UI's built-in CSS variables (Tailwind-compatible). The library provides:

```css
/* Coss UI CSS variables (inherited from shadcn/ui convention) */
--background
--foreground
--card / --card-foreground
--popover / --popover-foreground
--primary / --primary-foreground
--secondary / --secondary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--destructive / --destructive-foreground
--border
--input
--ring
```

**Roadly custom colors (status-specific):**

| Status | Color Token | Visual |
|--------|------------|--------|
| Under Review | `amber-500` / `yellow` | 🟡 Yellow/amber badge |
| Planned | `blue-500` / `indigo` | 🔵 Blue badge |
| In Progress | `violet-500` / `purple` | 🟣 Purple badge |
| Completed | `emerald-500` / `green` | 🟢 Green badge |

**Category colors (🟠 IMPLEMENTATION DECISION):**

| Category | Suggested Color |
|----------|----------------|
| UI/UX | `pink-500` |
| Integrations | `cyan-500` |
| Performance | `orange-500` |
| General | `slate-500` |

### Typography Hierarchy

Use Coss UI's font system (defaults to Inter/system fonts):

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Page title (h1) | `text-3xl` / `text-4xl` | `font-bold` | Page headings |
| Section title (h2) | `text-2xl` | `font-semibold` | Section headings |
| Card title (h3) | `text-lg` | `font-semibold` | Post titles |
| Body text | `text-base` | `font-normal` | Descriptions, content |
| Small text | `text-sm` | `font-normal` | Metadata, timestamps |
| Caption | `text-xs` | `font-medium` | Labels, badges |

### Spacing System

Follow Tailwind's 4px base scale consistently:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` / `p-1` | 4px | Tight internal spacing |
| `gap-2` / `p-2` | 8px | Badge padding, tight groups |
| `gap-3` / `p-3` | 12px | Card internal padding |
| `gap-4` / `p-4` | 16px | Standard card padding, section gaps |
| `gap-6` / `p-6` | 24px | Section spacing |
| `gap-8` / `p-8` | 32px | Page section spacing |

---

## Component Specifications

### Post Card (Feed)

```
┌─────────────────────────────────────┐
│ ┌──┐  Title of Feature Request      │
│ │▲ │  Description excerpt here...   │
│ │12│                                │
│ │▼ │  [UI/UX] [Performance]         │
│ └──┘  👤 Author Name • 2 hours ago │
│        💬 5 comments  🟡 Under Rev. │
└─────────────────────────────────────┘
```

### Status Badge

| Status | Variant | Colors |
|--------|---------|--------|
| Under Review | `outline` | Amber border + text |
| Planned | `default` | Blue background |
| In Progress | `default` | Purple background |
| Completed | `default` | Green background |

### Vote Button

```
┌──────┐
│  ▲   │  <- Arrow icon (filled if voted)
│  12  │  <- Vote count
└──────┘
```
- **Default:** Outline, muted colors
- **Voted:** Filled/primary color, number bold
- **Hover:** Subtle background
- **Disabled (unauthenticated):** Pointer cursor, triggers auth modal on click

### Roadmap Column

```
┌──────────────────┐
│  📋 Planned (3)  │  <- Column header with count
├──────────────────┤
│ ┌──────────────┐ │
│ │ Card title   │ │
│ │ [Category]   │ │
│ │ ▲ 15         │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Card title   │ │
│ │ [Category]   │ │
│ │ ▲ 8          │ │
│ └──────────────┘ │
└──────────────────┘
```

### Comment Thread

```
┌──────────────────────────────────┐
│ 👤 Author Name • 3 hours ago    │
│ Comment content in Markdown...   │
│                       [Reply] ⋮  │
│ ┌──────────────────────────────┐ │
│ │ 👤 Reply Author • 1 hour ago│ │
│ │ Reply content...             │ │
│ │                          ⋮   │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## UX States

### Loading States 🔴 REQUIRED
- **Feed skeleton:** 3–5 card-shaped skeleton blocks
- **Roadmap skeleton:** 3 column-shaped skeleton blocks
- **Detail page skeleton:** Header block + content block + comment blocks
- **Button loading:** Spinner/loading indicator replacing text

### Empty States 🔴 REQUIRED
- **No posts:** Illustration + "No feature requests yet" + "Submit the first one" CTA
- **No results:** "No results match your filters" + "Clear filters" button
- **No comments:** "Be the first to share your thoughts" + comment form focus

### Error States 🟡 RECOMMENDED
- **Network error:** "Something went wrong" + "Try again" button
- **404:** "Page not found" + "Go home" button
- **Form error:** Inline red text below invalid fields

### Toast Notifications 🔴 REQUIRED
- **Success:** Green indicator — "Request submitted", "Vote recorded", etc.
- **Error:** Red indicator — "Failed to submit", "Unauthorized", etc.
- **Info:** Blue indicator — "Session expired, please log in"

---

## Dark/Light Theme 🔵 OPTIONAL

Coss UI natively supports dark/light themes via the `class` strategy (add `dark` class to `<html>`). Including theme toggle is:
- Low-effort (Coss UI handles it)
- Adds visual polish
- Demonstrates attention to UX
- **RECOMMENDED** to include if time permits

---

## Accessibility 🟡 RECOMMENDED

| Concern | Implementation |
|---------|---------------|
| Keyboard navigation | Coss UI (Base UI) handles focus management |
| ARIA labels | All interactive elements have accessible names |
| Color contrast | Use Coss UI's default theme (WCAG AA compliant) |
| Focus indicators | Coss UI provides focus rings |
| Screen reader support | Semantic HTML, proper heading hierarchy |
| Reduced motion | Respect `prefers-reduced-motion` |
| Skip to content link | 🔵 OPTIONAL but good practice |

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| Generic Bootstrap look | Use Coss UI's opinionated styling |
| Inconsistent spacing | Follow the spacing system above |
| Excessive gradients | Clean, flat design with subtle shadows |
| Unnecessary animations | Purposeful micro-interactions only |
| Visual clutter | Generous whitespace, clear hierarchy |
| Glassmorphism everywhere | Solid backgrounds, subtle transparency sparingly |
| Heavy custom CSS | Compose from Coss UI + Tailwind utilities |
| Multiple font families | Stick to Coss UI's font stack |
