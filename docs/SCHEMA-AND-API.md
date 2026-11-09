# Database schema and HTTP API

Canonical TypeScript records: `src/lib/types.ts`. Validation: `src/lib/validation.ts` and route-specific Zod schemas. Dates are ISO strings unless noted. Firestore uses document IDs rather than SQL foreign keys; application code enforces relationships. Local SQLite stores the same documents in `documents(collection, id, data)`.

## Collections

| Collection / ID | Data and relationships |
|---|---|
| `content/{id}` | Editable Content. `kind`: holiday/road-trip/resort/destination; title, slug (unique within kind), location, country, region, summary, description; image/alt, gallery and URL→alt map; days/nights/themes; featured/order; status draft/published/archived; demo; itinerary title/description array; accommodation; inclusions/exclusions; resort amenities/rooms/mealPlans; road-trip vehicles name/passengers/luggage; optional price, currency, priceBasis, priceConditions; SEO fields; updatedAt. |
| `publishedContent/{id}` | Published snapshot of content with the same ID. Draft editing does not change it. Unpublish/archive removes the snapshot. Public reads filter demo unless showcase is active. |
| `revisions/{random ID}` | Previous full content snapshot, including its original content ID. |
| `staff/{Auth UID}` | id, email, role owner/editor/enquiries, active. Local-only staff IDs hash email and additionally store salted scrypt passwordHash. Cloud staff never store passwords. |
| `sessions/{SHA256(token)}` | staffId → staff; expires in epoch milliseconds. Raw random token exists only in browser cookie. |
| `enquiries/{request UUID}` | name/email/phone; destination/kind, itemId → content (optional), itemTitle snapshot; dates/flexible; adults/children/childAges/rooms; departure; budget/currency/budgetBasis; preferences/vehicle/mealPlan/contactMethod; method submit/whatsapp; status; assignedTo, followUp; notes and history arrays with author/time; createdAt/updatedAt; excelStatus; demo. No passport/payment details. |
| `excelJobs/{enquiry ID}` | Pending workbook job: status, attempts, updatedAt, plus error information on failure. Same ID as enquiry for retry/deduplication. |
| `notificationJobs/{enquiry ID}` | Pending optional provider/CRM notification; same ID as enquiry. Delivery is separate from saving. |
| `settings/site` | whatsapp, email, phone, address, social links, about, privacy, terms, cancellation, question/answer FAQs. |
| `runtimeConfig/demoShowcase` | enabled boolean, updatedAt. Trusted administration script controls the temporary demo showroom; no public write endpoint. |
| `media/{UUID}` | Original filename metadata, alt, createdAt. Encoded WebP stored separately as `media/{UUID}.webp`. Access depends on published content references or staff permission. |
| `auditEvents/{UUID}` | at, actor, action, item for admin mutations/exports. |
| `rateLimits/{hashed key}` | count and until (epoch milliseconds). Persistent transaction-based limiter. |

Enquiry creation and its two outbox jobs are atomic. Repeat request UUIDs do not create duplicate jobs; conflicting repeated submissions return 409. Publication, revision and audit changes share a batch. The cloud seed writes draft and published pairs transactionally and skips existing records. Client rules deny all private collections and writes; published non-demo documents are readable. Server Admin SDK is privileged and must never be exposed in browser code.

## Endpoints

All mutation requests require `Origin` equal to `SITE_URL`. JSON unless specified. Protected routes use the `ptm_session` cookie. The site uses server-rendered reads; there is no public catalogue REST endpoint.

| Method / path | Permission | Request and response |
|---|---|---|
| POST `/api/admin/login` | Public, rate limited | `{email,password,idToken}`. Firebase requires a verified ID token from browser Email/Password login. Local mode verifies password. Returns `{ok:true}` and session cookie. |
| POST `/api/admin/logout` | Cookie session | Clears database session and cookie. |
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

Errors generally use `{error:string}`; enquiry validation also supplies `fields`. 400 invalid request, 401 no valid session, 403 insufficient role/origin, 404 missing record, 409 conflict/unavailable local operation, 413 too large, 429 rate limit, 500 generic server failure. Some malformed JSON and invalid Firebase token errors currently fall through to the generic 500 handler; clients must handle non-2xx responses. Do not expose server logs or credential details to visitors.

## Verification and operations

Public catalogue, site settings and showcase reads use a shared Next.js cache for 15 minutes in cloud mode, plus request-level deduplication. Publishing, unpublishing, archiving and settings saves expire the public cache immediately. Private staff, sessions, enquiries and writes are never cached. Local/emulator reads stay immediate. External edits (including the showcase administration script) can take up to 15 minutes to appear.

During a database quota/network outage, public reads have a five-second response deadline and show unavailable listings rather than fabricated or resurrected content. Site contact defaults remain accessible. Sample publication is not enabled when its setting cannot be verified; search indexing is disabled while the catalogue is unavailable. Failed mutations return an explicit service-unavailable response when Firebase reports quota/unavailability; they never report successful enquiry storage. Free quota recovery is controlled by Firebase, not a deployment. Failed public results may take up to 15 minutes to refresh after recovery.

Run `npm run typecheck`, `npm test`, `npm run build`. Catalogue tests check all record schemas, publication rules, unique IDs/routes, five variants per market, complete day counts and mock pricing. `npm run test:flow` is an isolated local/emulator integration flow; do not run it against real customer data. `npm run test:rules` verifies Firestore rules with the emulator.

Cloud status without sensitive record contents:

```powershell
npx tsx scripts/cloud-admin.ts inspect --key "C:\private\service-account.json" --project pickthemap-fe68b
```

For larger catalogues, replace full-collection reads with indexed pagination and search. Review TTL/cleanup for expired sessions/rate limits, outbox retry monitoring, retention for enquiries/revisions/audit records, and recovery backups before scaling. No automatic deletion policy or backup schedule is configured by these commands.
