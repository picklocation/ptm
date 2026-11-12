# Supabase schema and HTTP API

Updated 11 November 2026. Canonical records: `src/lib/types.ts`; validation: `src/lib/validation.ts`. SQL migrations are under `supabase/migrations`.

## Tables and relationships

| Table | Contents and relationships |
| --- | --- |
| content | Editable record in JSONB; generated kind, slug, status, region, country, duration, display order and demo fields. Unique kind/slug. |
| published_content | Separate published JSONB snapshot; ID references content. Indexed catalogue filters and search vector. |
| content_revisions | Previous content snapshot; content_id references content. |
| staff | UUID references auth.users; email, owner/editor/enquiries role, active flag, optional legacy Firebase UID. No password column. |
| enquiries | UUID request ID; contact/trip preferences, notes/history arrays, status, assignment, follow-up and timestamps. Optional content_id FK. |
| delivery_jobs | Composite enquiry_id/kind key; kind excel or notification; FK to enquiries; JSONB delivery status/attempts. |
| site_settings | Single site row with public business/contact/social/FAQ/legal content. No secrets. |
| runtime_config | Internal configuration, including demoShowcase enabled flag. |
| media_assets | Bucket, object path, source metadata, MIME type, size, optional SHA-256 and public approval. |
| content_media | Schema supports ordered versioned asset relationships. Current editor still stores image URLs/alt maps in content JSONB; this relation is not populated by the current upload flow. |
| audit_events | Actor, timestamp, action and target in JSONB. |
| rate_limits | Hashed key, count and expiry; atomic database updates. |

Content JSONB preserves itinerary arrays, image/gallery alt text, accommodation, inclusions/exclusions, amenities, rooms, meals, vehicles, pricing basis/conditions and SEO fields. Enquiry JSONB preserves the existing API shape. Generated columns and foreign keys support validation and queries without dropping structured fields.

Supabase Auth owns passwords and identities. There is no Supabase application-sessions table. The app uses the HttpOnly `ptm_supabase_access` cookie, with a maximum one-hour lifetime and no persisted browser refresh token. A fresh sign-in is required after expiry. Logout clears the cookie; an independently copied access token remains subject to its expiry and active-staff checks.

## Database operations and permissions

- RLS is enabled on all application tables.
- Public reads use the publishable key for eligible published content and public settings only.
- Admin reads/edits use the staff access token, so RLS applies in addition to server role checks.
- The server secret is used narrowly for validated enquiry creation, rate limits, owner-authorized staff provisioning, media operations and explicit trusted local workers.
- `ptm_batch` is an invoker-rights atomic content/enquiry/settings/audit operation with a fixed collection allowlist. Enquiry staff may update existing enquiries, not directly insert arbitrary ones.
- `ptm_enquiry_once` atomically saves a request and two outbox jobs; service-role only. Repeated UUIDs do not create duplicate jobs.
- `ptm_rate_limit` atomically accepts/rejects a request; service-role only.
- `ptm_showcase` exposes only the boolean needed for public sample visibility.
- Staff cannot promote themselves. Disabled staff fail database permission checks.
- Queries fetch explicit 500-row pages to avoid silent API truncation; current catalogue/admin views still assemble their lists in memory.
- Seed utility is rerunnable and skips existing IDs. Seed draft/public writes happen in separate batches; a failed seed must be rerun/verified before launch.

## Storage

`website-public` contains approved seed photographs and brand assets. `website-private` contains validated admin uploads. The media endpoint checks published references or content-staff authorization before returning private bytes. Uploaded images are decoded and converted to WebP; general SVG uploads are rejected. The trusted bundled placeholder is the only SVG seed asset.

The current editor supports gallery URL ordering/removal, but no physical asset-delete control. Archiving is supported; permanent package deletion is not exposed. No automatic cleanup or backup schedule is configured.

## Endpoints

Preview origins use the Vercel deployment URL. Production mutation requests require `Origin` equal to `SITE_URL`. JSON unless specified. Protected routes use the `ptm_supabase_access` cookie. The site uses server-rendered reads; there is no public catalogue REST endpoint.

| Method / path | Permission | Request and response |
|---|---|---|
| POST `/api/admin/login` | Public, rate limited | `{email,password}`. Supabase verifies credentials, then active staff access is required. Returns `{ok:true}` and session cookie. |
| POST `/api/admin/logout` | Cookie session | Clears the app session cookie. |
| POST `/api/admin/content` | Owner/editor | `{content: Content, action: save\|publish\|unpublish\|archive}` → `{content,message}`. Publish validates required fields, gallery alt and price conditions; duplicate slug returns 409. Demo production publication requires showcase. |
| POST `/api/enquiries` | Public, rate limited | Enquiry input described below → 201 `{id,whatsappUrl}`. Database save always precedes WhatsApp handoff. |
| POST `/api/admin/enquiries` | Owner/enquiries | `{id,status,note,assignedTo,followUp}` → `{enquiry}`. Status is new/contacted/quote sent/confirmed/closed. Empty note adds nothing. followUp is empty or YYYY-MM-DD. |
| GET `/api/admin/export?format=xlsx&status=new&q=...` | Owner/enquiries | Downloads XLSX; omit format for CSV. Optional status and search filters. Formula-like visitor text is escaped. |
| POST `/api/admin/sync` | Owner/enquiries | Runs local Excel sync → `{message}`. Returns 409 on Vercel with local-worker guidance. |
| POST `/api/admin/settings` | Owner | Full Settings object → `{ok:true}`. Validates HTTPS social URLs and WhatsApp digits. |
| POST `/api/admin/staff` | Owner | `{action:"create",email,password,role}` or `{action:"toggle",id,active}` → staff list without password hashes. Cannot revoke self. |
| POST `/api/admin/upload` | Owner/editor | multipart/form-data field `file`, JPEG/PNG/WebP under 8 MB; decode limit 40MP, resize and reencode WebP → `{url,id}`. Deployment ingress may impose a smaller body limit. |
| GET `/api/media/{id}` | Public if referenced by published content; otherwise content staff | Validated image response or 404. |

Enquiry input fields: `requestId` UUID, `name`, `email` (can be empty unless email contact), `phone`, `destination`, `kind`, `startDate`, `endDate`, `flexible`, `adults`, `children`, `childAges`, `rooms`, `departure`, `budget` numeric string or empty, `currency` INR/EUR/USD/GBP/AED, `budgetBasis` total/per person, `preferences`, `vehicle`, `mealPlan`, `contactMethod` phone/email/whatsapp, `itemId` or empty, `method` submit/whatsapp, `consent:true`, `website:""` honeypot, `startedAt` epoch milliseconds. Follow `enquirySchema` for bounds. Date-required rules depend on flexibility. Submission must take at least 1.5 seconds.

Errors generally use `{error:string}`; enquiry validation also supplies `fields`. 400 invalid request, 401 no valid session, 403 insufficient role/origin, 404 missing record, 409 conflict/unavailable local operation, 413 too large, 429 rate limit, 500 generic server failure. Some malformed JSON and unexpected authentication errors currently fall through to the generic 500 handler; clients must handle non-2xx responses. Do not expose server logs or credential details to visitors.

## Verification and operations

Seventeen tests, TypeScript and the Supabase production build passed. The local end-to-end check verified login, dashboard, publication/discovery, enquiry persistence and idempotency, delivery jobs, enquiry updates, Excel export, valid/invalid uploads, private/public media access, role isolation, disabled accounts, unpublishing and logout. Disposable test records were removed.

Public catalogue/settings/showcase cache keys include the backend and project URL/ID to isolate Firebase from Supabase. Successful catalogue reads cache for 15 minutes; catalogue errors are caught outside the persistent cache, so an outage is not stored as a successful empty result. Showcase lookup errors also fall back outside the persistent cache: samples remain hidden for the failed request, but the next request retries. Settings retain their existing fallback behaviour. Publishing, unpublishing, archiving and settings changes invalidate the public tag. Other successful public reads cache for 15 minutes. Staff and enquiry reads are not cached. External database edits may take up to 15 minutes to appear. Public reads have a five-second deadline and show an unavailable state on classified database outages.

```powershell
npm run typecheck
npm test
npx tsx scripts/supabase-local.ts build
npx tsx scripts/migration/verify-access.ts
npx tsx scripts/migration/verify-supabase-flow.ts
```

The owner reported promoting an earlier migration deployment. The latest cache fix and visual updates still need hosted verification and confirmed promotion. See SUPABASE-LAUNCH.md for deployment. The owner approved a fresh catalogue rather than historical Firebase import; optional backup tools remain available but are not a launch dependency.

## Resorts & Stays extension

Content JSONB now supports optional stayDestination (boolean), stayDestinationSlug (slug), propertyVerified (boolean) and stayTags (Couples/Families/Budget/Premium/Luxury). No schema migration is required. Real resort publication requires destination assignment and admin verification; directory publication rejects sample properties. All public resort browsing excludes sample/unverified records, even when sample holiday showcase is enabled. The enquiry endpoint derives the selected resort title and destination from published content. See [the stays guide](RESORTS-AND-STAYS.md) for routes and admin instructions.
