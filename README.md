# PickTheMap

Next.js travel discovery, personalised enquiries and a protected admin portal.

## Current status — 15 November 2026

The site runs on Supabase (PostgreSQL, Auth, Storage) and Vercel at https://www.pickthemap.in, with the staff portal at `/adminportal`. Current work is on `codex/migrate-supabase`; the owner promotes its deployments to Production by hand.

Recent work: rebuilt image uploads, new package cards with discount pricing, a two-step enquiry form, location-checked photographs, and two Europe self-drive packages with a route-map page. See [implementation status](docs/IMPLEMENTATION_STATUS.md), [roadmap](docs/ROADMAP.md) and the [dated change log](docs/CURRENT-UPDATES.md).

The catalogue began as 200 sample entries. The owner now uses the holidays as real packages; their generated prices and internal sample flag are open decisions recorded in the status document. Firebase remains intact for rollback and holds the pre-migration enquiries.

## Start the prepared Supabase version

Requires Node.js 24 and npm, with the private `.env.migration.local` configured as described in the launch guide.

```powershell
npm install
npx tsx scripts/supabase-local.ts build
npx tsx scripts/supabase-local.ts start
```

Website: http://localhost:3005

Admin: http://localhost:3005/adminportal/login

Owner: **pickthemap@gmail.com**, using the password chosen privately during Supabase provisioning.

Do not copy private credentials into GitHub or chat. The seed utility never resets an existing owner's password.

## AI assistant handover

For Claude Code, start with [CLAUDE.md](CLAUDE.md). Upload [the portable AI handover](docs/AI-HANDOVER.md) to another assistant to share the design decisions, architecture, owner preferences and deployment safeguards.

## Documentation

- [Admin/mobile review](docs/ADMIN-MOBILE-REVIEW.md): fixes, capability inventory and remaining device checks.

- [Owner handbook](docs/OWNER-HANDBOOK.md): day-to-day content, enquiries, login and launch checklist.
- [Supabase launch guide](docs/SUPABASE-LAUNCH.md): configuration, hosting and API map.
- [Schema and API reference](docs/SCHEMA-AND-API.md): tables, relationships, permissions and endpoint contracts.
- [Migration runbook](docs/SUPABASE-MIGRATION.md): versioned SQL and optional historical-import tools.

## Verification

```powershell
npm run typecheck
npm test
npx tsx scripts/supabase-local.ts build
npx tsx scripts/migration/verify-access.ts
npx tsx scripts/migration/verify-supabase-flow.ts
```

39 unit tests and the production build pass as of 15 November 2026. The Supabase flow verified owner login, publishing, public detail pages, enquiry persistence/idempotency, delivery jobs, enquiry updates, Excel export, uploads, private/public image access, role isolation, account disabling, unpublishing and logout. Flow tests create and clean up disposable records in the configured Supabase project.

## Retained adapters

`DATA_BACKEND=supabase` is the new hosted setup. Legacy Firebase code/tools remain for transition and rollback, and `DATA_BACKEND=local` retains SQLite/offline development. Neither is used by the Supabase preview. Do not deploy local mode to Vercel.

No live inventory, checkout, online payment, customer accounts or CRM integration has been added. Excel/CSV export works; automatic local workbook sync requires the owner to run its worker. Sample photos/prices require business review before launch.

## Resorts & Stays update

See [the Resorts & Stays guide](docs/RESORTS-AND-STAYS.md) for the destination-first directory, admin verification and property assignment. Public resorts now require published, non-sample, admin-verified records; old mock resorts remain in admin but are hidden from public pages. The homepage domestic row starts with Resorts & Stays, then South India; the South Asia card was removed. Legacy property URLs and collection identifiers remain compatible.
