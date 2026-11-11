# PickTheMap

Next.js travel discovery, personalised enquiries and a protected admin portal.

## Current status — 11 November 2026

The Supabase version is implemented and tested on `codex/migrate-supabase`. It uses PostgreSQL, Supabase Auth and Supabase Storage. Vercel remains the host. Recent updates add Outfit typography, destination photo captions, browser/home-screen icons and backend-specific catalogue caching. See [current updates and deployment checklist](docs/CURRENT-UPDATES.md).

This is an owner-approved fresh start: 200 sample catalogue entries were recreated; historical Firebase enquiries and edits were not imported. Firebase remains intact. The owner reported promoting the migration deployment, but subsequent live checks found an unavailable catalogue. The cache fix and newer design changes are pushed; their production promotion and hosted end-to-end verification remain unconfirmed. Vercel screenshots show the six required variable names assigned to Production and Preview; masked values cannot be verified from screenshots.

## Start the prepared Supabase version

Requires Node.js 24 and npm, with the private `.env.migration.local` configured as described in the launch guide.

```powershell
npm install
npx tsx scripts/supabase-local.ts build
npx tsx scripts/supabase-local.ts start
```

Website: http://localhost:3005

Admin: http://localhost:3005/admin/login

Owner: **pickthemap@gmail.com**, using the password chosen privately during Supabase provisioning.

Do not copy private credentials into GitHub or chat. The seed utility never resets an existing owner's password.

## AI assistant handover

For Claude Code, start with [CLAUDE.md](CLAUDE.md). Upload [the portable AI handover](docs/AI-HANDOVER.md) to another assistant to share the design decisions, architecture, owner preferences and deployment safeguards.

## Documentation

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

Seventeen tests and the production build passed. The Supabase flow verified owner login, publishing, public detail pages, enquiry persistence/idempotency, delivery jobs, enquiry updates, Excel export, uploads, private/public image access, role isolation, account disabling, unpublishing and logout. Flow tests create and clean up disposable records in the configured Supabase project.

## Retained adapters

`DATA_BACKEND=supabase` is the new hosted setup. Legacy Firebase code/tools remain for transition and rollback, and `DATA_BACKEND=local` retains SQLite/offline development. Neither is used by the Supabase preview. Do not deploy local mode to Vercel.

No live inventory, checkout, online payment, customer accounts or CRM integration has been added. Excel/CSV export works; automatic local workbook sync requires the owner to run its worker. Sample photos/prices require business review before launch.
