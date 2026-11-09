# PickTheMap

A responsive Next.js travel discovery website with a protected content admin, enquiry capture, WhatsApp handoff, and Excel tracking. Built for local development first; no deployment or paid service is required to explore it.

Cloud handover: [Setup, demo catalogue and admin access](docs/SETUP-AND-ADMIN.md) · [Schema and API reference](docs/SCHEMA-AND-API.md).

## Start locally

Requirements: Node.js 24 LTS, npm. Firebase emulators also require Java 21+.

```powershell
npm install
Copy-Item .env.example .env.local
# Edit .env.local: set a unique LOCAL_ADMIN_PASSWORD of 12+ characters.
npm run seed
npm run dev
```

Open http://localhost:3000. Staff sign-in: http://localhost:3000/admin/login. The initial owner email/password are in your **private `.env.local`**. Never commit or share that file. A generated local account has already been provisioned in this workspace. This workspace currently uses Firebase emulators; restart them before starting the website after a reboot.

Two persistent backend adapters are included:

- `DATA_BACKEND=local`: SQLite at `.local/pickthemap.sqlite`, local uploaded media. A convenient no-credentials fallback; never deploy this adapter to Vercel.
- `DATA_BACKEND=firebase`: Firebase Admin SDK with Authentication, Firestore, and Storage. Use the local emulators while developing; use dedicated cloud credentials when you choose to launch.

## Firebase emulator setup

Run `npm run emulators` in a separate terminal. Configure `.env.local`:

```dotenv
DATA_BACKEND=firebase
FIREBASE_PROJECT_ID=demo-pickthemap
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
FIREBASE_STORAGE_BUCKET=demo-pickthemap.appspot.com
NEXT_PUBLIC_FIREBASE_API_KEY=demo-pickthemap-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-pickthemap
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL=http://127.0.0.1:9099
```

Run `npm run seed`, then restart the website. Emulator import/export persists development data on graceful shutdown. Emulator data, SQLite, uploads, workbooks and secrets are ignored by Git. Stop the emulator with Ctrl+C to export. Keep local services bound to loopback; do not expose emulator ports publicly.

## Managing content

1. Sign in to `/admin`.
2. Open **Content & media → Create content**.
3. Choose holiday, road trip, resort or destination. Add title, URL slug, description and verified travel details.
4. Upload the cover photo and supply its alt text. Upload gallery photos and supply individual alt text.
5. Set an optional price only with currency, pricing basis and conditions.
6. Save a draft and open Preview. Publish when ready.

Saving edits to an existing published item leaves its public snapshot unchanged. Publish replaces the snapshot. Unpublish removes it from public browsing; archive retains its history. Feature and display-order fields control homepage selection. FAQs, policies, contact channels and social links live under **Site settings**.

Sample records are labelled demonstration content. Production normally rejects and hides demo records. The explicitly enabled temporary showroom (`runtimeConfig/demoShowcase`) allows samples with a sitewide fictional-pricing notice and disables search indexing. See the cloud handover for seeding and turning it off. Only clear a demo flag after verifying the content, rights and property photographs. Policy placeholders are not approved legal documents.

## Enquiries and WhatsApp

Both submission options save to the database before success. The WhatsApp option then shows a link with an enquiry reference and concise trip summary; the visitor presses Send in WhatsApp. Delivery is not tracked or claimed. Configure the business number in Site settings (country code + digits, no plus sign).

Admin provides status, notes, assignment, follow-up dates, filters and CSV/XLSX export. Request UUIDs prevent duplicate records. Notifications are optional and do not replace database storage.

## Excel tracking

The local worker creates `.local/enquiries.xlsx` by default. To target another local file, set an absolute `.xlsx` path in `EXCEL_PATH`. Use a dedicated workbook; do not point at an unrelated existing document.

```powershell
npm run excel:sync -- --watch
```

The worker checks pending jobs every 30 seconds. **Sync Excel now** is also available in admin. Keep your computer and worker running for automatic updates. Vercel cannot write directly to your laptop; after cloud deployment run the worker locally against Firebase, or implement the account-appropriate Microsoft 365 adapter.

Managed columns are updated from the database. The four final columns — **Tracking status, Tracking notes, Tracking owner, Tracking follow-up** — are yours and preserved on resync. Excel edits do not automatically write back to admin. Workbook failures retain pending jobs for retry. Close the workbook if Excel locks it. If a worker crashes, verify no worker is running before removing only its `.xlsx.lock` file.

## Notifications / future CRM

An outbox record is stored with each enquiry. `npm run notifications:send` delivers queued events to a configured HTTPS provider adapter, using an idempotency key. Nothing is sent when `NOTIFICATION_WEBHOOK_URL` is unset. Choose and authorise the recipient/provider before enabling; the adapter receives enquiry data. Run it with an approved scheduler at deployment. Provider retries require idempotent handling at the receiver. CRM integrations can use the same stable enquiry IDs and event model.

## Security model

- Staff are explicitly provisioned. Authentication alone does not grant access.
- Owner/editor/enquiry-manager permissions are checked on every server operation. Revocation is checked on every request.
- Session tokens are random, stored hashed, expire after eight hours, and use HttpOnly/SameSite cookies. Production cookies require HTTPS.
- Origin checks protect mutation endpoints; validation and persistent rate limits protect enquiries and sign-in.
- Firestore/Storage rules deny direct client private access and writes. Published non-demo Firestore documents are public. Server Admin SDK calls bypass rules, so server permissions and restricted IAM credentials are mandatory.
- Uploaded JPEG/PNG/WebP images are decoded, bounded and re-encoded; arbitrary files and SVG uploads are rejected. Draft media remains private.
- Spreadsheet formula-like visitor text is escaped. Private data is excluded from logs and Git.

Before public launch: configure strong staff authentication/MFA at the identity-provider level, account recovery, retention/deletion policy, cloud backup schedule, monitoring, production spam attestation, and correct IAM. No custom MFA or email recovery flow is claimed in this local build.

## Verification

```powershell
npm run typecheck
npm test
npm run test:flow
npx firebase emulators:exec --only firestore --project demo-pickthemap "npm run test:rules"
npm run build
```

`test:flow` needs the localhost server and local owner credentials. It creates labelled temporary test content/enquiries, checks publishing, validation, idempotency, access control, uploads, Excel update and unpublishing. The workbook retains test rows as verification evidence; use a fresh workbook before real enquiries.

## Deploy later: GitHub → Vercel + Firebase

1. Connect a business-owned GitHub repository; review the staged files for secrets.
2. Create separate production Firebase resources and deploy version-controlled rules/indexes.
3. Provision the owner using a secure administrative process. Do not seed demo content into production.
4. Import the GitHub repository into Vercel and configure server-only Firebase credentials and public Firebase client configuration separately.
5. Set `DATA_BACKEND=firebase`, `SITE_URL` to the HTTPS domain, disable demo flags, and remove all emulator variables.
6. Configure Firebase authorised domains, storage billing/quotas, IAM, backups and monitoring. Cloud Storage requires a billing-enabled Firebase plan; Vercel commercial plan terms apply at launch.
7. Add approved content/policies; WhatsApp is configured to +91 79022 20044. Confirm the Excel worker/CRM and notification processing schedule.
8. Re-run acceptance tests in an isolated staging environment before making production public.

The user connected Vercel project `ptm` to https://github.com/picklocation/ptm.git, branch `codex/build-pickthemap`, and configured Firebase project `pickthemap-fe68b`. No paid subscription is enabled by the setup scripts. Cloud owner provisioning is separate from sample-data seeding; follow the handover above.

## Current scope and practical limits

Enquiry-first, no availability feed, checkout, payment, supplier booking or customer accounts. Search is title/location/region substring matching and structured filters. For a small initial catalogue the server reads catalogue records; larger deployments should move to indexed/paginated queries and a dedicated text-search index. Gallery URLs are ordered in the editor; automated cloud Excel sync requires an agreed Microsoft account and workbook. Production policy wording and actual travel inventory must come from the business.
