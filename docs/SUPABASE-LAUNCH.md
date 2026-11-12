# PickTheMap: Supabase setup and handover

Status updated 11 November 2026: Supabase and owner access are provisioned. The owner reported a production promotion; subsequent live checks showed a catalogue outage despite 200 published records being available in Supabase. A cache fix and newer visual updates are pushed to the migration branch. Their production promotion and full hosted flow still need verification. See [current updates](CURRENT-UPDATES.md).

## What changed

The existing website now supports `DATA_BACKEND=supabase`: PostgreSQL for catalogue and enquiries, Supabase Auth for staff, and Supabase Storage for photographs and uploads. URLs and visual design are preserved. Firebase mode remains available only as a transition/rollback option; Supabase mode does not read or write Firebase. The original production branch and the migration branch remain separate; manually promoting a deployment does not merge their code.

At the owner's request, this is a **fresh start**, not a historical data import. The 200 original sample entries have been recreated. Old enquiries and owner content edits remain in Firebase only. Initial business details use safe defaults; fill in approved contact, legal, and company information in admin.

## Local preview

Use the ignored `.env.migration.local` configuration already prepared on the owner's computer:

```powershell
npx tsx scripts/supabase-local.ts build
npx tsx scripts/supabase-local.ts start
```

Open `http://localhost:3005`. Login is `http://localhost:3005/adminportal/login`, with owner email `pickthemap@gmail.com` and the private password saved during provisioning. Passwords are not stored in repository files or this guide. `fresh-supabase.ts` never resets an existing owner's password.

Sessions use a short-lived Supabase access token in a Secure (production), HttpOnly, SameSite=Strict cookie. Sign in again after at most one hour. Every admin action checks current identity and active staff permissions; database RLS independently enforces roles. Disabling a staff record blocks its data access immediately. Logout clears this app's session cookie. No customer accounts are introduced.

## Vercel configuration

A private `.env.vercel.supabase.local` file has been prepared locally for Vercel's **Import .env** control. It contains the six values below, including the server secret. Do not upload it to GitHub, paste it into chat, or share screenshots of its values.

Set these values on the migration **Preview environment first**, then on Production only after approval:

| Variable | Value/type |
| --- | --- |
| `DATA_BACKEND` | `supabase` — Config |
| `SUPABASE_URL` | `https://feqmnzutyhzochuyiint.supabase.co` — Config |
| `NEXT_PUBLIC_SUPABASE_URL` | Same URL — Config, used for public assets |
| `SUPABASE_PUBLISHABLE_KEY` | Current project publishable key — Config |
| `SUPABASE_SECRET_KEY` | Current server secret key — Secret; never prefix with NEXT_PUBLIC |
| `SITE_URL` | Production canonical URL, currently `https://ptm-alpha.vercel.app` — Config |

No database password, migration CA, Firebase service-account file, or owner password belongs in Vercel. Redeploy after saving environment variables. Preview request origins use Vercel's deployment URL automatically. Production uses `SITE_URL`; update it when connecting the final domain.

Git branch: `codex/migrate-supabase`. Do not change the current production branch until the preview is reviewed. Firebase environment values can remain temporarily for rollback, but are unused when `DATA_BACKEND=supabase`.

## Managing content and enquiries

- `/adminportal`: dashboard and counts.
- `/adminportal/content`: create/edit/preview/publish/unpublish/archive packages, destinations, road trips and resorts. Publishing atomically writes the public snapshot and audit/revision records.
- Galleries: upload JPEG/PNG/WebP, edit alt text and order URLs. Removing a URL from the gallery removes that reference; physical file deletion is not exposed in the existing editor. Archiving preserves history and enquiry references.
- Uploads are validated, decoded and resized into WebP. They live in the private bucket and are served to visitors only when referenced by published content. Public seed assets use the public bucket with long-lived caching.
- `/adminportal/enquiries`: new → contacted → quote sent → confirmed → closed, notes, assignment and follow-up. Submissions save before showing a WhatsApp link. The visitor still presses Send in WhatsApp.
- Excel/CSV export remains available in admin. Continuous workbook sync runs on the owner's computer, never on Vercel. Configure `.env.local` with the Supabase server variables, then run `npm run excel:sync -- --watch`. Local workers explicitly use trusted server access; keep the server key private.
- `/adminportal/settings`: contact details, WhatsApp, social links, FAQs and approved policy copy.
- `/adminportal/staff`: owner-only staff creation and activation. Roles: owner, editor, enquiries.

## API map

| Endpoint | Purpose/access |
| --- | --- |
| `POST /api/enquiries` | Validated public enquiry; server rate limit; atomic idempotent enquiry + two delivery jobs |
| `POST /api/admin/login` | Supabase password sign-in, active staff gate and rate limit |
| `POST /api/admin/logout` | Clears session cookie |
| `POST /api/admin/content` | Editor/owner: save, publish, unpublish, archive |
| `POST /api/admin/enquiries` | Enquiries/owner: status and internal notes |
| `GET /api/admin/export` | Enquiries/owner: Excel or CSV export |
| `POST /api/admin/upload` | Editor/owner: validated image upload |
| `GET /api/media/:id` | Published photo, or authorized content-staff preview |
| `POST /api/admin/settings` | Owner: site settings |
| `POST /api/admin/staff` | Owner: create/toggle staff |
| `POST /api/admin/sync` | Enquiries/owner: local workbook sync; unavailable on Vercel |

Schema details and migration commands are in `SUPABASE-MIGRATION.md`. SQL is versioned under `supabase/migrations`.

## Verification and limits

`npm test`, `npm run typecheck`, `npx tsx scripts/supabase-local.ts build`, and `npx tsx scripts/migration/verify-supabase-flow.ts` verify the new setup. The flow check creates explicitly marked disposable records and staff identities, then removes only its own test data. Do not run legacy Firebase/local flow scripts against production.

Supabase Free remains enabled. No paid services were activated. Monitor database size, Storage usage and egress in Supabase; inactivity may pause a Free project. The nine shared seed photographs plus brand assets currently occupy about 7 MB. Media is deduplicated by seed path. Hosted image transformations are not required: uploads are compressed in the app and public images use Next.js optimization. Default Supabase email delivery has restrictions; password resets/invitations need verified email configuration before relying on email delivery. Current provisioning uses the owner's chosen password and owner-created staff credentials.

## Production cutover

1. Configure the Preview environment and deploy the migration branch.
2. Verify public pages, image loading, admin login and a test enquiry on that exact preview URL.
3. Approve the fresh-start cutover, set Production variables, and promote/deploy the reviewed branch.
4. Confirm a real test enquiry arrives and admin access works. Keep Firebase intact.
5. To roll back, restore the prior production deployment and its Firebase environment values. Any enquiries received in Supabase after cutover must be retained/exported separately before returning to Firebase.
