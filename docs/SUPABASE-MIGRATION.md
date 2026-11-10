# Supabase migration runbook

## Current stage

Work is isolated on `codex/migrate-supabase`. The original Firebase production application remains active. Applying the new schema does not switch Vercel or alter Firebase.

The initial PostgreSQL schema has been applied to project `feqmnzutyhzochuyiint`. Migration completion requires verified source backup, import, storage transfer, application integration, permissions testing, preview review, and an approved production cutover.

## Private configuration

Use the ignored `.env.migration.local` file. Never commit this file, a service-account JSON, database password, export, or secret key.

- `SUPABASE_URL`: project API URL.
- `SUPABASE_PUBLISHABLE_KEY`: public browser key.
- `SUPABASE_SECRET_KEY`: privileged migration/server key; never a `NEXT_PUBLIC_` variable.
- `SUPABASE_DB_URL`: session pooler PostgreSQL URL with a URL-encoded password. No SSL query parameters: the migration runner explicitly configures verified TLS.
- `SUPABASE_CA_CERT_PATH`: optional public CA path; defaults to `.local/migration/supabase-ca.crt`. Obtain the certificate from Database → Settings → SSL configuration in the Supabase dashboard.
- `FIREBASE_SERVICE_ACCOUNT_PATH`: local source credentials file.
- `MIGRATION_OUTPUT_DIR`: defaults to `.local/migration`.

## Commands

```powershell
npx tsx scripts/migration/apply-schema.ts --check
npx tsx scripts/migration/apply-schema.ts
npx tsx scripts/migration/export-firebase.ts
npx tsx scripts/migration/validate-backup.ts <completed-backup-directory>
npx tsx scripts/migration/verify-access.ts
```

The schema runner checks the target project, verifies TLS, serializes migration runs with an advisory lock, and records each migration's SHA-256 checksum. Applied SQL files must not be edited: create a subsequent migration instead.

The exporter reads every discovered Firestore collection and recursively discovers subcollections, including those under missing parent documents. It preserves special Firestore values with explicit type tags and exports authentication identity metadata separately. It does not copy passwords or password hashes. Console output contains counts, not customer records or credentials.

Each export gets a unique ignored folder. Import is allowed only when `manifest.json` says `complete: true` and all file checksums match. A failed export is not a usable backup. This logical export is not a transactionally consistent frozen snapshot and does not include Storage bytes. Before cutover, freeze edits briefly and export/import a final delta. Retain the original source until rollback is no longer required.

## Schema

| Table | Purpose |
| --- | --- |
| `staff` | Supabase Auth UUID, legacy Firebase UID, email, role and active flag |
| `content` | Draft/editor records; preserved structured JSON plus indexed typed fields |
| `published_content` | Separate published snapshots; FK to content and indexed search vector |
| `content_revisions` | Revision payloads linked to content |
| `enquiries` | Customer requests, ordered notes/history, status/date indexes and content FK |
| `delivery_jobs` | Excel/notification outbox entries linked to enquiries |
| `site_settings` | Public business information and approved policy copy |
| `runtime_config` | Internal runtime flags |
| `audit_events` | Administrative activity records |
| `rate_limits` | Internal request counters |
| `media_assets` | Storage metadata, provenance, content hash and publication approval |
| `content_media` | Ordered cover/gallery relationships, alt text and draft/published version |

JSONB preserves editor arrays and legacy fields without flattening away data. Generated columns enforce catalogue types and publication states and support indexed filtering. Staff IDs change to Auth UUIDs; the explicit legacy UID mapping must be used to update associations. Notes/history remain ordered arrays rather than duplicated relational rows.

## Access model

RLS is enabled on all application tables. Anonymous users can read eligible published snapshots and public site settings only. Active editors manage content; enquiry staff read/update enquiries and delivery jobs; owners have both permissions. Staff role mutation has no client write grant and requires an owner-authorized server operation. Disabled staff fail the database permission function. Anonymous enquiry creation must go through validated, rate-limited server handling.

`website-private` is restricted to authorized content staff. `website-public` is reserved for approved published assets. Direct client updates/deletions are denied. Server media deletion must check references. Trusted bundled SVG assets are separate from general JPEG/PNG/WebP uploads.

## Required before cutover

1. Reconcile source counts, hashes, IDs, references and unknown collections; never replace a failed backup with seed data.
2. Transfer originals and approved derivatives to Supabase Storage and reconcile hashes/URLs; retain private unpublished assets.
3. Relink staff identities and arrange password setup; invalidate old app sessions at cutover.
4. Integrate database operations with server authentication and user-scoped RLS; implement atomic publish and enquiry/outbox operations.
5. Verify anonymous/disabled/wrong-role access, uploads, catalogue pages, enquiries, exports, and admin publishing in a separate preview.
6. Obtain owner approval before changing production backend variables. Preserve Firebase and backup files.
7. If rolling back after new writes, reconcile those writes first; switching environment variables alone would lose them.
