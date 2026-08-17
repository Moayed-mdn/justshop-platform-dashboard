# Archive

Historical development logs, kept for context. These describe what was done **at the time** —
for the current state of a feature, check [`docs/features/`](../features/) instead.

## [`phases/`](./phases/)
The original phase-by-phase build (Phase 1 → Phase 8, July 15–16, 2026), in order:

1. `phase-1-foundation.md`
2. `phase-2-authentication.md` (merged from the original COMPLETE + TESTING docs)
3. `phase-2-session-summary.md` — a narrative debugging session covering the CSRF fix; kept
   separately because it has code-level detail (cookie forwarding, Sanctum config) not repeated
   elsewhere
4. `phase-2.5-auth-guards-v1-server-side.md` and `phase-2.5-auth-guards-v2-client-side.md` —
   **read the banner at the top of each.** These document two different, incompatible
   implementations of the same auth-guard feature, written ~40 minutes apart. v2 is the one whose
   file list matches what actually shipped; v1 is kept for history.
5. `phase-3-dashboard-analytics.md` through `phase-8-feature-flags.md` (each merged from the
   original `_PLAN` + `_COMPLETE` pair)
6. `project-complete-snapshot.md` — a full recap written the same day phases 1–8 wrapped

## [`fixes/`](./fixes/)
- `csrf-fix.md` — the HTTP 419 CSRF token fix (see also `test-auth.sh` in the project root, which
  tests this flow)
- `ui-crash-fixes.md` — undefined-field crashes on Users/Stores/Audit/Features pages, plus a
  pagination auto-reset bug
- `user-actions-update.md` — user edit/suspend/activate action wiring

## [`design-system/`](./design-system/)
The Aug 12, 2026 redesign session, in the order it happened:
`theme-fix-complete.md` → `theme-changes-summary.md` (Arabic quick-summary of the previous file)
→ `visual-redesign-complete.md` → `shadow-enhancement.md` → `input-shadow-update.md` →
`professional-polish-complete.md` → `dashboard-connection-complete.md`. The consolidated result
of the redesign lives at [`docs/features/design-system.md`](../features/design-system.md).

## Root of this folder
- `cms-implementation.md` — backend integration log for the CMS rebuild
- `plan-management-reconnaissance.md` — the stack/architecture discovery notes written before the
  Plan Management UI was built (confirmed accurate against `package.json`: Next.js 16.2.10,
  React 19.2.4, TanStack Query 5.101.2 all match)

## What got deleted, not just moved
One file — the original `PLAN_MANAGEMENT_UI_PROGRESS.md` — was deleted rather than archived.
It was a mid-session checkpoint whose entire content (type definitions, API endpoints, list/create
pages, the missing-subscriber-endpoint blocker) is a strict subset of what's already recorded in
`docs/features/plan-management.md`. Everything else was kept, even where redundant, because this
cleanup only had the markdown + root config files to work from — no `app/`, `components/`, or
`lib/` source — so there was no way to verify implementation-level claims against real code.
