# PickTheMap project context

Written 12 November 2026 from a full read of the repository at `codex/migrate-supabase` commit `7655569`, its Git history, and the two handover files supplied by the owner (`CLAUDE.md` and `docs/AI-HANDOVER.md`, which are identical to the copies in the repository).

Statements here were checked against the source unless marked **Unverified** or **Assumption**. The live website, Vercel settings and Supabase project could not be reached from the analysis session, so nothing about their current state is confirmed here.

Related documents: [implementation status](IMPLEMENTATION_STATUS.md), [roadmap](ROADMAP.md), [AI handover](AI-HANDOVER.md), [design](DESIGN.md), [schema and API](SCHEMA-AND-API.md), [Resorts & Stays](RESORTS-AND-STAYS.md), [Supabase launch](SUPABASE-LAUNCH.md), [owner handbook](OWNER-HANDBOOK.md).

## 1. Business

PickTheMap arranges personalised travel:

- customised international holidays (Southeast Asia, South Asia, Europe, Indian Ocean and others)
- Europe road trips and private cab tours
- Indian domestic holidays
- Kerala and South India resorts, villas, camping and stays

The website is a discovery and lead-generation tool. A visitor finds an idea, sends an enquiry, and the team replies with a personal quote. There is no live inventory, instant booking, checkout, online payment, customer login or CRM integration, and none of these has been requested.

## 2. Technology

| Layer | What is used |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript. Server-rendered pages, all `force-dynamic`. Build uses `next build --webpack`. |
| Styling | One global stylesheet (`src/app/globals.css`, about 3,100 lines) with Tailwind 4 through PostCSS. Later responsive overrides sit near the end of the file. |
| Hosted backend | Supabase: PostgreSQL with RLS, Supabase Auth for staff, Supabase Storage for images. |
| Legacy backends | Firebase (Firestore, Auth, Storage) and local SQLite. Both are still selectable with `DATA_BACKEND` and share one adapter in `src/lib/store.ts`. |
| Hosting | Vercel. GitHub Actions runs typecheck, tests and a local-mode build. |
| Libraries | zod, sharp, exceljs, lucide-react, `@supabase/supabase-js`, `pg` (migration scripts), `firebase` and `firebase-admin` (legacy). |

## 3. Public website

### Routes

| URL | Purpose |
| --- | --- |
| `/` | Homepage: hero and finder, four destination rows, collection links, three service cards, featured holidays, Europe road-trip feature, Kerala stays section, process steps, FAQs, final call to action. |
| `/holidays`, `/international-trips`, `/domestic-trips`, `/europe-road-trips`, `/south-india`, `/south-asia`, `/kerala-resorts`, `/visa-free-destinations`, `/destinations` | Collection pages rendered by `src/app/[section]/page.tsx` with client-side search and filters (`src/components/catalogue.tsx`). |
| `/{section}/{slug}` | Detail pages for holidays, road trips, resorts (`/resorts-and-villas/{slug}`) and destinations. |
| `/resorts-and-stays` | Destination-first stays hub with sixteen built-in destinations. |
| `/resorts-and-stays/{destination}` | Verified properties for one destination with audience and category filters. |
| `/resorts-and-villas` | Permanently redirects to `/resorts-and-stays`. Property detail URLs under it still work. |
| `/plan-my-trip` | Enquiry form (`src/components/enquiry-form.tsx`). |
| `/about`, `/contact`, `/faqs`, `/privacy`, `/terms`, `/cancellation` | Text pages filled from admin settings, with safe fallbacks. |

Navigation: International, Domestic, Resorts & Stays, Europe road trips, Visa-free. Mobile adds a dialog menu and a three-item bottom bar.

### How content is organised

Every catalogue record is one `Content` object. These attributes are independent of each other:

- **Template** (`kind`): `holiday`, `road-trip`, `resort`, `destination`. It fixes the URL path.
- **Package format** (`packageType`): Custom holiday, Resort stay, Villa stay, Camping, Glamping, Houseboat, Cab road trip, Self-drive road trip, City break, Beach holiday, Adventure, Honeymoon, Group tour.
- **Place**: `region`, `country`, `state`, `location`, `locations[]`.
- **Section assignments** (`collections[]`): `international-trips`, `domestic-trips`, `resorts-and-villas`, `kerala-resorts`, `europe-road-trips`, `south-india`. When the field is absent, sections are inferred from kind and place. An explicit empty list stays empty.
- **Display**: `featured`, `order`.
- **Lifecycle**: `status` (draft, published, archived) and the internal `demo` flag.

Regions present in the sample catalogue: Europe, India, South Asia, Southeast Asia, Indian Ocean. Southeast Asia has no dedicated page; its trips appear under International trips and are found by search. South Asia has a page (`/south-asia`) with no navigation link.

### Homepage destination rows

1. Popular destinations: the first six published destination records.
2. International destinations: other non-India destinations and countries, never repeating a place from row 1. Bali and Indonesia count as one place.
3. Visa-Free-destinations: countries from the code list in `src/lib/visa-guides.ts` that have a published holiday.
4. Domestic & neighbouring: Resorts & Stays, South India, then fixed tiles that depend on specific sample record IDs.

Captions above place names come from the `destinationCaptions` dictionary in `src/app/page.tsx`. They are not editable in admin.

### Resorts & Stays journey

Resorts → destination → listings → property detail → enquiry.

- Sixteen built-in destinations: Wayanad, Munnar, Vagamon, Ooty, Kodaikanal, Kulukkumala, Kakkadampoyil, Vattavada, Bangalore, Varkala, Thekkady, Kochi, Calicut, Goa, Alleppey, Coorg. Spelling aliases redirect to one slug.
- A published Destination record with a matching slug and "include in Resorts & Stays" ticked overrides the card's name and photo. New slugs add destinations.
- Listings filter by audience (Couples, Families) and category (Budget, Premium, Luxury).
- A resort is public only when it is published, not a sample, and marked verified by an admin. This rule is applied in `publicContent()`, so it also governs the homepage Kerala section, `/kerala-resorts`, search and the sitemap.
- No real property has been entered in code. Unless the owner has added some in admin, every destination shows its "enquire instead" empty state.

### Enquiries

`POST /api/enquiries` checks origin, size, zod schema, honeypot, a 1.5 second minimum fill time and an IP rate limit. It then saves the enquiry and two delivery jobs (Excel, notification) in one database call keyed by the browser-generated UUID, so retries cannot duplicate. Only after the save does the response include a prepared WhatsApp link. The visitor must press Send in WhatsApp.

## 4. Admin portal

All screens are served by `src/app/admin/[[...segments]]/page.tsx`.

| Screen | Roles | What it does |
| --- | --- | --- |
| Dashboard | all | Counts and recent enquiries according to role. |
| Content | owner, editor | List with search and filters; create, edit, save draft, simplified preview, publish, unpublish, archive. Covers classification, itinerary, inclusions, stay fields, vehicles, pricing, SEO, cover and gallery with alt text. |
| Enquiries | owner, enquiries | Search and filter, status (new → contacted → quote sent → confirmed → closed), notes, assignment, follow-up date, CSV and Excel export. |
| Settings | owner | Contact details, WhatsApp, social links, about and legal text, site-wide FAQs. |
| Staff | owner | Create staff, activate or deactivate, assign owner/editor/enquiries role. |
| Audit | owner | History of content and enquiry actions. |

Access control has two layers. `requireStaff()` in `src/lib/auth.ts` checks the role on the server for every protected route, and database RLS policies check `private.has_permission()` for the same staff token. Mutating routes also require the request `Origin` to match the site.

## 5. Data and infrastructure

### Backend status

The code supports three backends. Which one the public domain uses depends on Vercel environment variables and on which deployment is promoted, neither of which is visible from the repository.

- **Supabase** is the intended hosted backend. Three SQL migrations under `supabase/migrations/` define twelve tables with RLS on every one, two storage buckets (`website-public`, `website-private`), and the functions `ptm_batch`, `ptm_enquiry_once`, `ptm_rate_limit` and `ptm_showcase`. The documentation says they were applied to project `feqmnzutyhzochuyiint` and seeded with 200 sample records. **Unverified** in this session.
- **Firebase** code, rules files and scripts remain for rollback. The documentation says the Firebase project was left intact and its old enquiries and edits were deliberately not imported.
- **Local SQLite** is used for offline development and for the CI build.

Table summary and endpoint contracts are in [SCHEMA-AND-API.md](SCHEMA-AND-API.md). Catalogue records are stored as JSONB with generated columns, so new optional content fields (such as the stays fields) need no SQL migration.

### Sessions

Staff sign in with Supabase email and password. The app stores only the short-lived access token in the HttpOnly `ptm_supabase_access` cookie (SameSite=Strict, Secure in production, at most one hour). There is no refresh flow, so staff sign in again after expiry. Active-staff status is rechecked on every request.

### Images

Admin uploads accept JPEG, PNG or WebP up to 8 MB, are decoded and re-encoded to WebP with sharp, and go to the private bucket. `/api/media/{id}` serves them publicly only when a published record references them. Seed photographs and brand assets live in the public bucket. `next.config.ts` allows optimised images only from that bucket.

### Caching

Public catalogue, settings and the showcase flag are cached for 15 minutes with keys that include backend and project. Publishing, unpublishing, archiving and settings changes clear the cache. Read failures are caught outside the cache and show an "unavailable" state for that request only. Public reads have a five second deadline.

### Sample content and indexing

Sample records carry `demo: true`. They are visible only when the database showcase flag is on (or in non-production with `ENABLE_DEMO_CONTENT=true`). While samples are showing, or the catalogue is unavailable, or the deployment is not Production, pages are `noindex`, robots disallows everything and the sitemap is empty.

### Environment variables

Hosted Supabase mode needs `DATA_BACKEND`, `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` and `SITE_URL`. Optional: `WHATSAPP_NUMBER`, `EXCEL_PATH`, `NOTIFICATION_WEBHOOK_URL`, `NOTIFICATION_WEBHOOK_TOKEN`. No secret values are in the repository; `.gitignore` excludes `.env*` and service-account files.

## 6. Design system

The owner likes the current design. Summary of the rules in [DESIGN.md](DESIGN.md) and handover section 3:

- White-dominant pages, paper `#F6F8F5`, pale mint `#E6F4EC`, text `#122B25` and `#53635C`, border `#E1E7E2`, brand green `#05A660`.
- Primary buttons `#09B468` with white text and arrows, hover `#08A660`. Package-card arrows are the exception: white circle, green arrow.
- Outfit 400–700 for body and headings; Plus Jakarta Sans for the wordmark only.
- Supplied logo artwork unchanged, with no trailing dot on the wordmark.
- Rounded photographic cards, single-row destination rows with manual scrolling and hidden scrollbars, centred white place names with a small caption above.
- No dominant yellow, decorative gradients, autoplay, tickers or new visual styles. Support widths from 360px.

## 7. History in brief

| Date | What happened |
| --- | --- |
| 9 Nov | Initial build on Firebase (`codex/build-pickthemap`): public site, admin, enquiries, sample catalogue, destination rows, button colour iterations, Firebase read caching. |
| 10 Nov | A separate "Mobile first UI and tests" branch was merged into `codex/build-pickthemap` as pull request 1 and reverted the same day as pull request 2. The branch tip's file tree is identical to the commit before the merge. |
| 10 Nov | Supabase work started on `codex/migrate-supabase` from the pre-merge commit: schema, fresh catalogue, staff auth, storage, enquiries, classification, security fixes. |
| 11 Nov | Cache isolation and outage fixes, Outfit typography and captions, browser icons, desktop hero paragraph hidden, no repeated places across rows, mobile focus and admin responsive fixes, Resorts & Stays directory, South Asia card removed from the homepage. |

## 8. Decisions taken from the two handover files

- Start fresh in Supabase; do not import Firebase history; keep Firebase untouched for rollback.
- Short answers, practical action, low tool usage. Ask only when the answer affects business workflow, architecture, cost or safety.
- No browser automation; the owner supplies screenshots.
- Small styling requests stay small. "Less AI-looking" means restrained and specific, not more decoration.
- Do not install skills, packages or UI kits just because they are available.
- A push is not a deployment. Report pushed, built, promoted and verified-live as separate states.
- When packages disappear, investigate deployment, environment and cache before touching data. Never reseed to hide an outage.
- Visa labels are display text; entry rules must be verified per passport and date.
- No paid services or plan upgrades without agreement.

## 9. Where the handover files differ from the repository

| Handover statement | What the repository shows |
| --- | --- |
| Recent code runs "through `44fbfcd`". | Four later commits exist: handover docs (`77d9f25`), mobile and admin responsive fixes (`0f60869`), Resorts & Stays (`eb924b0`), South Asia card removal (`7655569`). |
| Homepage category order is "Resorts & Stays, South India, South Asia". | The last commit removed the South Asia card. The row now starts Resorts & Stays, South India. `/south-asia` still exists and is in the sitemap. |
| Documents quote "seventeen tests". | Twenty-one unit tests exist and pass. |
| Southeast Asia is listed as a business area in the owner's brief. | It exists only as a region value on records; there is no Southeast Asia page or navigation entry. |
| The brief asks whether the Supabase migration is complete. | Code and schema are complete on the migration branch. The older Firebase branch has not received this work, and the production cutover is recorded as unverified. |
