# PickTheMap project context

Updated 15 November 2026 for the code at `claude/nifty-knuth-mb9k8r` commit `d602115`. First written 12 November 2026 from a full read of the repository and the owner's two handover files.

Statements here were checked against the source unless marked **Unverified**. The live site, the Vercel project and the Supabase database are not reachable for writing from an assistant session; what is known about them comes from the owner.

Related documents: [implementation status](IMPLEMENTATION_STATUS.md), [roadmap](ROADMAP.md), [dated change log](CURRENT-UPDATES.md), [AI handover](AI-HANDOVER.md), [design](DESIGN.md), [schema and API](SCHEMA-AND-API.md), [Resorts & Stays](RESORTS-AND-STAYS.md), [Supabase launch](SUPABASE-LAUNCH.md), [owner handbook](OWNER-HANDBOOK.md).

## 1. Business

PickTheMap arranges personalised travel: international holidays, Indian domestic trips, Europe self-drive road trips, and Kerala and South India resorts and stays. The website is a discovery and lead-generation tool. A visitor finds an idea, sends an enquiry, and the team replies with a personal quote. There is no live inventory, booking, payment, customer login or CRM integration.

Two Europe self-drive packages are the flagship offers: **DISCOVER Europe** (7 days, 6 nights, 5 countries, from AED 5,999 per person, flights from the UAE) and **Euro Drive** (11 days, 10 nights, 9 countries, from ₹193,000 per person, flights from Cochin or Bangalore).

## 2. Technology

| Layer | What is used |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript. Server-rendered, `force-dynamic` pages. Build uses `next build --webpack`. |
| Styling | One global stylesheet (`src/app/globals.css`, about 3,500 lines) with Tailwind 4 through PostCSS. Later blocks override earlier ones. |
| Hosted backend | Supabase in Singapore: PostgreSQL with RLS, Auth for staff, Storage for images. |
| Legacy backends | Firebase and local SQLite, selectable with `DATA_BACKEND`, sharing one adapter in `src/lib/store.ts`. |
| Hosting | Vercel, functions in Singapore. Domain `www.pickthemap.in`. GitHub Actions runs typecheck, tests and a local-mode build. |
| Libraries | zod, sharp, exceljs, lucide-react, `@supabase/supabase-js`, `pg` (migration scripts), `firebase` and `firebase-admin` (legacy). No map or UI library. |

## 3. Public website

### Routes

| URL | Purpose |
| --- | --- |
| `/` | Hero and finder, four destination rows, collection links, service cards, featured holidays, Europe road-trip feature, Kerala stays section, process, FAQs. |
| `/holidays`, `/international-trips`, `/domestic-trips`, `/europe-road-trips`, `/south-india`, `/south-asia`, `/kerala-resorts`, `/visa-free-destinations`, `/destinations` | Collection pages with search and filters. |
| `/{section}/{slug}` | Detail pages. A road trip that has route stops uses the self-drive layout; everything else uses the standard layout. |
| `/resorts-and-stays`, `/resorts-and-stays/{destination}` | Destination-first stays directory. `/resorts-and-villas` redirects to it; property URLs under it still work. |
| `/plan-my-trip` | Two-step enquiry form. |
| `/privacy`, `/terms`, `/cancellation` | Built-in policy text (`src/lib/legal-defaults.ts`) unless the owner has written their own in Site settings. The Terms page ends with the photograph credits. |
| `/about`, `/contact`, `/faqs`, `/privacy`, `/terms`, `/cancellation` | Text pages from admin settings. |
| `/adminportal` | Staff portal. `/admin` redirects here. |

### Content model

Every catalogue record is one `Content` object stored as JSONB. Independent attributes: template (`kind`: holiday, road-trip, resort, destination), package format, place fields, section assignments (`collections`), display (`featured`, `order`), lifecycle (`status`, internal `demo` flag), pricing (`price`, optional `originalPrice` for a discount, currency, basis, conditions).

Self-drive packages add optional fields: `countries`, `routeStops` (name, country, latitude, longitude, overnight), `highlights`, `drivingInfo`, `travelTips`, `faqs`, and per itinerary day `morning`, `afternoon`, `evening`, `driveDistance`, `driveTime`, `driveNote`, `overnight`. None needs a SQL migration.

### Homepage rows

1. **Popular destinations:** a Euro Drive card first (while a road trip is published; photo from Site settings, default Lake Reschen), then the six destination records with the lowest Display order.
2. **International destinations:** other non-India destinations, then countries represented by their first holiday's cover photo. No place repeats row 1; Bali and Indonesia count as one.
3. **Visa-Free-destinations:** the code list in `src/lib/visa-guides.ts`.
4. **Domestic & neighbouring:** Resorts & Stays, South India, then fixed tiles tied to specific sample records.

Captions come from a dictionary in `src/app/page.tsx`.

### Photographs

`src/lib/place-photos.ts` registers 72 photographs in `public/images/places`, each checked against its place: 34 from Unsplash and 38 from Wikimedia Commons with author, licence and source. `placePhotoFor()` picks a photo from a record's first stop, then title, state and country. `withPlacePhoto()` applies it only to sample records whose image is an old shared stock photo or an earlier place photo, so uploads and real packages are never changed. Stay destination cards fall back to the same set.

### Self-drive pages

`src/components/road-trip-detail.tsx` renders the layout; `src/components/route-map.tsx` draws stops over country outlines from `src/lib/europe-map.ts` (generated from Natural Earth public-domain data, about 48 KB, no map service). Labels avoid each other and other stops; on phones only overnight stops are labelled and any stop can be tapped. The two packages are defined in `src/lib/europe-drives.ts` from the owner's brochures and installed into the database by an owner action; after that they are edited in admin.

### Enquiries

Two steps: trip basics (destination with suggestions, kind, start date or flexible, adults, children), then name, phone and email, all mandatory, with consent. `POST /api/enquiries` checks origin, size, schema, honeypot, a 1.5 second minimum fill time and an IP rate limit, then saves the enquiry and two delivery jobs in one idempotent database call. The WhatsApp link is offered only after the save. Fields no longer on the form are stored with neutral defaults so exports keep their columns.

## 4. Admin portal

One catch-all page: `src/app/adminportal/[[...segments]]/page.tsx`.

| Screen | Roles | What it does |
| --- | --- | --- |
| Dashboard | all | Counts and recent enquiries by role. |
| Content & media | owner, editor | List with search and filters; create, edit, draft, preview, publish, unpublish, archive. Photo manager, pricing with discount, classification, stays fields, self-drive fields. Owner: permanent delete of archived records and the four owner actions. |
| Enquiries | owner, enquiries | Search, status, notes, assignment, follow-up, CSV and Excel export. |
| Site settings & FAQs | owner | Contact details, WhatsApp, social links, about and legal text, FAQs, Euro Drive homepage card photo. |
| Staff & access | owner | Create, activate, deactivate; owner, editor, enquiries roles. |
| Audit history | owner | Content, enquiry and owner-action events. |

Access control has two layers: `requireStaff()` on the server and RLS policies in the database for the same staff token. Mutating routes require the request `Origin` to equal `SITE_URL`.

## 5. Data and infrastructure

- **Supabase:** three SQL migrations define twelve tables with RLS, two storage buckets and the functions `ptm_batch`, `ptm_enquiry_once`, `ptm_rate_limit`, `ptm_showcase`. Project `feqmnzutyhzochuyiint`, region Singapore.
- **Images:** admin uploads are shrunk in the browser, validated and re-encoded on the server, and stored in the public bucket as `content/{contentId}/{imageId}-1600.webp` and `-640.webp`. Records store the direct link to the 1600 file; cards use the 640 file. Older `/api/media/{id}` links to the private bucket still work. Location photographs are static files in the repository.
- **Sessions:** Supabase email and password; a one-hour HttpOnly `ptm_supabase_access` cookie; no refresh flow. The session check and staff lookup run together and are cached per request.
- **Caching:** public catalogue, settings and showcase flag for 15 minutes, keyed by backend and project; content and settings changes clear it; failures are never cached.
- **Samples and indexing:** `demo: true` records show only when the showcase switch is on. While it is on, or the catalogue is unavailable, or the deployment is not Production, pages are `noindex`.
- **Environment:** `DATA_BACKEND`, `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SITE_URL`. No secrets in the repository.

## 6. Design system

Summary of [DESIGN.md](DESIGN.md):

- White-dominant pages, paper `#F6F8F5`, mint `#E6F4EC`, text `#122B25` and `#53635C`, border `#E1E7E2`, brand green `#05A660`.
- Buttons `#09B468` with white text. Package-card arrows are green circles with white arrows beside the price.
- Outfit for body and headings; Plus Jakarta Sans for the wordmark. Logo artwork unchanged.
- Rounded photographic cards; single-row destination rows with manual scrolling.
- No dominant yellow, gradients, autoplay or new UI libraries. Support widths from 360px.

## 7. History in brief

| Date | What happened |
| --- | --- |
| 9 Nov | Initial Firebase build. |
| 10 Nov | A mobile-first pull request merged and reverted on the Firebase branch (net nil). Supabase work started on `codex/migrate-supabase`. |
| 11 Nov | Cache fixes, typography, icons, Resorts & Stays directory. |
| 12 Nov | Development moved to Claude Code. Documentation set written. Admin moved to `/adminportal`; domain `www.pickthemap.in`; image system rebuilt; permanent delete; admin speed; new cards, discounts, enquiry form improvements. |
| 14 Nov | Catalogue photo review; location photographs and credits page. Styled suggestion list and date control. Owner allowed limited browser checks. |
| 15 Nov | Europe self-drive packages and page design; Euro Drive days 7 and 8 revised; Euro Drive homepage card; demonstration wording, accommodation notes and galleries removed; enquiry form cut to two steps. |

## 8. Owner decisions and working rules

- Fresh start in Supabase; Firebase untouched for rollback.
- Short answers, practical action, low usage. Ask only when the answer affects business workflow, architecture, cost or safety.
- Small requests stay small; no redesigns.
- **Browser checks (14 Nov):** an automated browser may be used on a local build for appearance changes only, with at most one desktop and one phone screenshot per change.
- **Card arrows (12 Nov):** green circle, white arrow.
- **Sample packages (15 Nov):** the owner uses them as real packages and wants no demonstration wording, generic accommodation notes or cover-only galleries. Prices and the internal sample flag are still undecided.
- **Europe packages (15 Nov):** prices are per person; rental car is included in DISCOVER Europe; Euro Drive is ₹193,000; no car model is promised.
- A push is not a deployment. Report pushed, merged, promoted and verified-live separately.
- Never reseed to hide an outage. Never invent properties, reviews, guarantees or confirmed services.
- No paid services without agreement.

## 9. Environment notes for assistant sessions

- A cloud environment named `ptm` allows `unsplash.com`, `images.unsplash.com`, `commons.wikimedia.org`, `upload.wikimedia.org`, the Supabase project host and `www.pickthemap.in`, for reading only. There are no Supabase credentials in a session.
- Wikimedia accepts roughly two requests a minute from a session's shared address; Unsplash blocks automated search.
- Live data is changed only through owner-only admin actions that the owner presses.
