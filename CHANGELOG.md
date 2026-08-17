# Changelog

All notable changes to the Platform Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **2026-08 note:** This file previously stopped at Phase 1 and still listed Phases 2–9 as
> "NOT STARTED," even though phases 2–8 plus a CMS rebuild, a full design system overhaul, and a
> Plan Management UI had all shipped since. Rewritten below from the individual phase/feature docs
> now under `docs/archive/`. `package.json` is still at `0.1.0`, so this rewrite keeps everything
> after that release under `[Unreleased]` rather than inventing version numbers that were never
> actually tagged.

---

## [Unreleased]

### 2026-08-13 — Plan Management UI & Unlimited Plan Limits
- Built the Platform Super Admin Plan Management UI: plans list, create, and detail/edit pages,
  with full CRUD and a versioning flow for breaking changes to in-use plans.
- Added `LocalizedInput` (EN/AR tab switcher) and `MoneyInput` (integer-cents entry) components.
- Implemented "Unlimited" plan limits using `NULL` as the canonical representation for
  unlimited stores/products/users, with no backend changes required.
- Known gap: the migration wizard (bulk-moving subscribers between plans) is not built — it's
  blocked on a backend endpoint (`GET /api/v1/platform/billing/plans/{id}/subscribers`) that
  doesn't exist yet. See `docs/features/plan-management.md`.
- Details: `docs/features/plan-management.md`, `docs/features/unlimited-plan-limits.md`,
  `docs/guides/plan-management-quickstart.md`, `docs/archive/plan-management-reconnaissance.md`.

### 2026-08-12 — Design System Overhaul & Dashboard API Connection
- Full visual redesign from the generic shadcn template to a branded, elevation-based interface:
  new color/shadow/typography tokens, zero visible borders, RTL fixes, branded chart colors,
  accessible focus states, and a signature active-nav-item treatment.
- Fixed a critical dark-mode bug where headings were invisible, and moved the brand color to a
  proper indigo/violet hue with WCAG AA+ contrast.
- Added consistent box shadows to inputs/selects/textareas and a `.page-header` utility.
- Verified the backend dashboard-stats/analytics endpoints and connected the dashboard to real
  data instead of mocks.
- Details: `docs/features/design-system.md` (living reference) and `docs/archive/design-system/`
  (the individual build logs this summarizes).

### 2026-07-16 — CMS Rebuild & UI Crash Fixes
- Rebuilt the marketing-pages CMS against `/api/v1/platform/cms/pages`, with full CRUD, EN/AR
  bilingual editing, and publish workflow.
- Fixed crashes on the Users, Stores, Audit, and Features pages caused by undefined fields, and
  fixed a pagination bug that silently reset tables back to page 1.
- Details: `docs/features/cms.md`, `docs/archive/cms-implementation.md`,
  `docs/archive/fixes/ui-crash-fixes.md`.

### 2026-07-15 — Phases 2 through 8
All eight core phases shipped in a single day:

- **Phase 2 — Authentication & Dashboard Shell**: sign-in flow, session handling, dashboard
  shell with sidebar/header. Required a follow-up CSRF fix (HTTP 419) — see
  `docs/archive/fixes/csrf-fix.md`.
- **Phase 2.5 — Auth Guards**: went through two different implementations the same afternoon —
  a server-side check first, then a client-side (`useEffect`) check that replaced it. See
  `docs/archive/phases/phase-2.5-auth-guards-v2-client-side.md` for the version that stuck, and
  its "Known Limitations" note about a brief unauthenticated content flash before redirect.
- **Phase 3 — Dashboard Analytics**: stats cards, charts, analytics summaries.
- **Phase 4 — User Management**: user list, detail view, suspend/activate/edit actions.
- **Phase 5 — Store Management**: store list and detail pages, search/filter/sort, mock data
  for 56 stores.
- **Phase 6 — CMS Management**: initial CMS overview with tabbed Blog/Pages/Docs (later rebuilt,
  see 2026-07-16 above).
- **Phase 7 — Audit Logs**: searchable/filterable activity timeline with before/after change
  tracking and CSV/JSON export.
- **Phase 8 — Feature Flags**: flags table with instant toggle, targeting, and environment
  badges.

Details for each phase: `docs/archive/phases/`.

---

## [0.1.0] - 2026-07-15

### Phase 1: Project Setup & Foundation ✅

#### Added
- **Next.js 15 Project**: Initialized with TypeScript, Tailwind CSS v4, and App Router
  (subsequently upgraded — `package.json` currently pins Next.js 16.2.10 / React 19.2.4)
- **Core Dependencies**:
  - UI: shadcn/ui components (17 components installed)
  - Forms: React Hook Form + Zod validation
  - State Management: TanStack Query + Zustand
  - i18n: next-intl with English and Arabic support
  - Utilities: date-fns, sonner (toast notifications), clsx, tailwind-merge
- **Internationalization**:
  - English (en) and Arabic (ar) locales configured
  - RTL layout support for Arabic
  - Locale-based routing (`/en/*`, `/ar/*`)
  - Language switcher component
  - 50+ translation keys for common UI elements
- **Theme System**:
  - Dark mode and light mode support
  - System preference detection
  - CSS variables for theming
  - Theme toggle component
  - Persistent theme storage
- **Project Structure**:
  - `/app/[locale]` - Localized routing with App Router
  - `/components` - Organized by category (ui, dashboard, forms, tables, shared)
  - `/lib` - Utilities, API client, providers, stores
  - `/locales` - Translation files
  - `/docs` - Project documentation
- **Configuration Files**:
  - `.env.local` - Environment variables for local development
  - `.env.example` - Environment template
  - `.prettierrc` - Code formatting configuration
  - `.cursorrules` - Cursor AI development guidelines
  - `components.json` - shadcn/ui configuration
  - `i18n.ts` - Internationalization configuration
  - `middleware.ts` - Locale routing middleware
- **Documentation**:
  - `README.md` - Project overview, setup, and quick start
  - `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/API_INTEGRATION.md`, `docs/TESTING.md` —
    listed as created in the original Phase 1 log, but **not present** in the files reviewed
    during this doc cleanup (2026-08). Worth tracking down or recreating if still needed.
  - `CHANGELOG.md` - This file
- **UI Components** (shadcn/ui):
  - Button, Input, Label, Card, Table
  - Dialog, Dropdown Menu, Select, Textarea
  - Sonner (Toast), Badge, Avatar, Skeleton
  - Tabs, Separator, Alert, Checkbox
- **Shared Components**:
  - Language Switcher (English ⇄ Arabic)
  - Theme Toggle (Light/Dark/System)
- **Providers**:
  - ThemeProvider - Dark mode management
  - QueryProvider - TanStack Query configuration
  - NextIntlClientProvider - i18n integration

#### Technical Details (at time of writing)
- **Next.js**: 15 → since upgraded to 16.2.10
- **React**: since upgraded to 19.2.4
- **TypeScript**: 5.x with strict mode enabled
- **Tailwind CSS**: v4 with CSS variables
- **Build Tool**: Webpack (Next.js default)

---

## Notes

### Version Numbering
- **Major version** (1.0.0): Full production release
- **Minor version** (0.1.0): Phase completions
- **Patch version** (0.1.1): Bug fixes and minor updates
- No version bump has actually been tagged past `0.1.0` yet, despite phases 2–8 and several
  feature builds having shipped — `package.json` is the source of truth here.

### Where the detailed history lives
- Phase-by-phase build logs: `docs/archive/phases/`
- Feature build logs: `docs/archive/` (CMS, fixes) and `docs/archive/design-system/`
- Living "what's implemented now" references: `docs/features/`
- Forward-looking roadmap: `docs/future-enhancements.md`
