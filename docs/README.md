# Documentation

This folder used to be ~40 loose `.md` files sitting in the project root, mostly one-off
"X_COMPLETE.md" logs written during development sessions (several within minutes of each other).
Reorganized into three purposes:

## [`guides/`](./guides/)
How-to docs you'd follow while working on the project.
- [`quick-start.md`](./guides/quick-start.md) — get a checkout running
- [`css-utilities.md`](./guides/css-utilities.md) — CSS utility class reference
- [`plan-management-quickstart.md`](./guides/plan-management-quickstart.md) — using the Plan
  Management UI

## [`features/`](./features/)
Living reference docs — what's implemented **right now**, not a log of how it got built.
Update these in place as features change.
- [`design-system.md`](./features/design-system.md) — tokens, colors, shadows, typography, utilities
- [`cms.md`](./features/cms.md) — marketing pages CMS
- [`plan-management.md`](./features/plan-management.md) — plan CRUD, pricing, versioning
- [`unlimited-plan-limits.md`](./features/unlimited-plan-limits.md) — the `NULL`-as-unlimited pattern

## [`archive/`](./archive/)
Historical build logs — phase-by-phase and feature-by-feature snapshots of what was done and why.
Useful for context, not guaranteed to match current code. See
[`archive/README.md`](./archive/README.md) for an index and a couple of specific caveats
(a contradiction between two Phase 2.5 docs, and one file that was deleted as a pure duplicate).

## Root-level docs (unchanged location)
- `../README.md` — project overview, stack, setup
- `../CHANGELOG.md` — dated history of notable changes
- `../future-enhancements` → [`future-enhancements.md`](./future-enhancements.md) — forward-looking roadmap

## Known gap
Several older docs (`CHANGELOG.md`'s Phase 1 entry, `docs/archive/phases/phase-1-foundation.md`,
`docs/archive/phases/phase-2-session-summary.md`) reference `docs/ARCHITECTURE.md`,
`docs/DEVELOPMENT.md`, `docs/API_INTEGRATION.md`, and `docs/TESTING.md` as if they exist. None of
them were present in the files reviewed for this cleanup. Either they live elsewhere in the real
repo and just weren't part of this export, or they were logged as "done" but never actually
written — worth checking which.
