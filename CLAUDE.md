# PickTheMap project instructions

Read `AGENTS.md` and `docs/AI-HANDOVER.md` before making changes. The handover records the owner's design decisions, architecture, workflows and deployment pitfalls. Read `docs/DESIGN.md` for visual constraints and the relevant technical document for the task. `docs/PROJECT_CONTEXT.md`, `docs/IMPLEMENTATION_STATUS.md` and `docs/ROADMAP.md` hold the verified project overview, current status and remaining work.

Treat the owner's latest explicit request as the priority. Preserve established design and working behaviour outside the requested scope. Inspect the actual repository and current Git state rather than assuming this handover proves what is deployed.

For Next.js changes, read the relevant installed guide in `node_modules/next/dist/docs/` first. Never print, commit or upload private environment files, service-account JSON, passwords or server keys. Do not run destructive database operations or replace existing data to fix an empty UI.

Use small, reviewable changes and relevant checks. Report what changed, what was tested, the commit/branch, and whether it is only pushed, Preview-ready or verified live. Never equate a Git push with a Production deployment.

## Project in one paragraph

PickTheMap is an enquiry-first travel website (custom international holidays, Indian domestic trips, Europe road trips, Kerala/South India resorts and stays) with a protected admin portal. Visitors browse and request quotes; there is no live availability, checkout, payment or customer account.

## Stack

- Next.js 16 App Router, React 19, TypeScript, global CSS with Tailwind 4 PostCSS (`src/app/globals.css` holds nearly all styling).
- Hosted backend: Supabase (PostgreSQL + RLS, Auth, Storage), selected by `DATA_BACKEND=supabase`. Legacy adapters remain in the same data layer: `firebase` (rollback only) and `local` (SQLite, offline development and CI).
- Hosting: Vercel. Validation: zod. Images: sharp. Exports: exceljs. Icons: lucide-react. Fonts: self-hosted Outfit (body/headings) and Plus Jakarta Sans (wordmark).

## Branches (verified 12 November 2026)

- `codex/migrate-supabase` holds the current Supabase application and all recent work. Pushes to it produce Vercel **Preview** deployments only.
- `codex/build-pickthemap` is the older Firebase version. It contains a merged-then-reverted mobile PR whose net effect is nil. There is no `main`.
- `mobile-first-ui-and-tests` holds that reverted mobile/Playwright work. It was never ported to the Supabase branch. Do not merge it without the owner's decision.
- Claude sessions work on their own `claude/...` branch that includes `codex/migrate-supabase`. Never force-push, reset or revert shared branches.

## Commands

```bash
npm ci
npm run typecheck
npm test            # node test runner via tsx, tests/*.test.ts
npm run build       # CI builds with DATA_BACKEND=local, ENABLE_DEMO_CONTENT=false
```

CI (`.github/workflows/checks.yml`) runs typecheck, tests and build on Node 24. The owner's machine uses `npx tsx scripts/supabase-local.ts build|start` (port 3005) with a private `.env.migration.local`; that file does not exist in cloud sessions. `scripts/migration/verify-supabase-flow.ts` writes disposable records to the real Supabase project: run it only for backend/auth/content-flow changes and only with the owner's configuration.

## Where things live

| Area | Source |
| --- | --- |
| Homepage, destination captions and row selection | `src/app/page.tsx` |
| Collection/static pages, detail pages | `src/app/[section]/page.tsx`, `src/app/[section]/[slug]/page.tsx` |
| Resorts & Stays hub and destination listings | `src/app/resorts-and-stays/`, `src/lib/stays.ts`, `src/components/stay-listings.tsx` |
| Admin UI (single catch-all route) | `src/app/admin/[[...segments]]/page.tsx`, `src/components/admin-*.tsx`, `content-editor.tsx` |
| HTTP endpoints | `src/app/api/` |
| Data adapters and public caches | `src/lib/store.ts`, `src/lib/supabase.ts` |
| Auth, sessions, roles, origin check | `src/lib/auth.ts` |
| Types, validation, classification | `src/lib/types.ts`, `validation.ts`, `classification.ts` |
| SQL migrations (never edit applied files; add a new one) | `supabase/migrations/` |

## Rules that are easy to break

- Design: white-dominant, pale mint and restrained green; primary buttons `#09B468` with white text; package-card arrows are green circles with white arrows (owner request, 12 November 2026). No redesigns, new palettes, gradients, autoplay or new UI libraries for a small request. Full rules: `docs/DESIGN.md` and handover section 3.
- Keep the label **Visa-Free-destinations** exactly. Keep the hero paragraph hidden at 901px and wider. Keep destination rows single-row, manually scrolled, with no repeated places between Popular and International.
- The owner prefers to open pages and send screenshots. Do not open or automate a browser unless they ask. Say when visual verification has not happened.
- Public resorts appear only when published, non-sample and admin-verified. Never invent properties, prices, reviews or guarantees to fill an empty page.
- Sample catalogue records keep their internal `demo` flag and showcase/noindex gating. Do not remove those safeguards or reseed data to mask an outage.
- Enquiries are saved (idempotent UUID, transactional outbox) before success or WhatsApp is shown. Keep rate limits, honeypot, timing check and origin check.
- Staff writes go through the staff token so RLS applies. The server secret is used only for the narrow paths listed in `docs/SCHEMA-AND-API.md`. Never expose it through `NEXT_PUBLIC_`.
- Catalogue and showcase failures must be handled outside `unstable_cache` so an outage is never cached as an empty result.
- Do not enable paid services, change the Vercel production branch, alter Supabase data or delete Firebase resources without the owner's approval.
