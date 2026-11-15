# Implementation status

Updated 15 November 2026. Code state: branch `claude/nifty-knuth-mb9k8r` at `d602115`. `codex/migrate-supabase` is at `d677145`, so the last four commits listed under "Awaiting merge" are not on it yet.

How this was checked: source and Git history read; typecheck clean, 39 unit tests passing, production build passing in local mode; new endpoints exercised against a local SQLite copy; selected pages screenshotted from a local build at desktop and phone width. **Not checked by the assistant:** the live site, the Vercel project, the Supabase database, a real phone, and the Supabase integration script. Statements about those come from the owner's screenshots and messages and are marked as such.

## Deployment state

| Item | State | Source |
| --- | --- | --- |
| Public domain | `https://www.pickthemap.in`; `ptm-alpha.vercel.app` still resolves | Owner |
| Admin address | `/adminportal` (old `/admin` links redirect) | Code; owner confirmed it works on the new domain |
| `SITE_URL` | Must equal `https://www.pickthemap.in`. Logins, uploads and enquiries are refused from any other address | Code; owner hit this error twice |
| Vercel function region | Changed from Washington (`iad1`) to Singapore (`sin1`) to sit beside the database | Owner reported |
| Supabase region | Singapore (`ap-southeast-1`) | Owner screenshot |
| Vercel plan | Hobby | Owner screenshot. Check Vercel's terms on commercial use |
| How Production updates | Manual promotion of a `codex/migrate-supabase` deployment. Pushes create Previews only | Owner screenshot |
| Which commit is live | **Unknown.** Last merge was `d677145` | |
| Owner actions pressed on the live database | **Unknown** (see "Owner actions" below) | |

## Complete in code

**Public site**
- Homepage, collection pages, detail pages, text and legal pages, sitemap, robots, Photo credits page.
- Package cards: green stop line, day chip, large price, green round arrow button, discount badge.
- Discount pricing: optional original price shown struck through with a percentage tag.
- Homepage Popular destinations row led by a Euro Drive card linking to `/europe-road-trips`; its photo is an admin setting.
- Resorts & Stays directory with verified-only listings.
- Two Europe self-drive packages (DISCOVER Europe, Euro Drive) with a dedicated detail layout: summary bar, route map with country borders, highlights, day-by-day itinerary with morning, afternoon, evening and drive details, stays, inclusions, driving information, tips, FAQs, WhatsApp enquiry.
- Enquiry form in two steps: trip basics, then name, phone and email (all mandatory) with consent. Styled suggestion list and uniform date control.
- 72 location-checked photographs with credits; automatic matching of sample records to their own place.
- Sample packages free of demonstration wording, generic accommodation notes and cover-only galleries.

**Admin**
- Portal at `/adminportal`: dashboard, content editor, enquiries, settings, staff, audit.
- Image manager: thumbnails, multi-upload with progress, reorder, remove, use as cover; browser-side shrinking; two stored sizes; direct Storage links; clean-up of removed photos.
- Permanent delete for archived records (owner only, type the title to confirm).
- Self-drive fields in the editor: countries, route stops, day parts and drive details, highlights, driving information, tips, FAQs.
- Faster pages: parallel session check, summary queries for lists, targeted lookups on save, instant loading state.
- Owner actions above the content list (see below).

**Backend**
- Supabase schema, RLS, storage, atomic functions; one-hour cookie session.
- Outage handling, backend-specific cache keys, noindex while samples show.

## Owner actions (Admin → Content & media, owner only)

Each is safe to press again. None changes prices.

| Button | What it does | Endpoint |
| --- | --- | --- |
| Set up the two packages | Adds DISCOVER Europe and Euro Drive if missing; archives sample road trips | `/api/admin/content/europe-drives` |
| Update to latest version | Overwrites both Europe packages with the built-in version after a confirmation; admin edits to those two are lost | same, `{mode:"update"}` |
| Match photos to locations | Gives sample records still on shared stock photos the photo for their own place; uploads are kept | `/api/admin/content/photos` |
| Tidy package wording | Removes demonstration wording, generic accommodation notes and stock gallery photos, and fixes text slips, in sample holidays and destinations; owner-written text is kept | `/api/admin/content/wording` |

## Awaiting merge into `codex/migrate-supabase`

`1a57597` Euro Drive card photo setting · `b66c273` wording clean-up · `eb517ae` two-step enquiry form · `d602115` accommodation notes and galleries removed.

## Open decisions for the owner

1. **Package prices.** The 130 sample holiday prices were produced by a formula in the earlier build. The "fictional" label is gone, so visitors read them as real. Keep them as quoted prices, or remove them so packages show "Request a quote".
2. **Sample flag.** Holidays and destinations are still `demo: true`. While the showcase switch is on, the whole site is `noindex` and every enquiry is stored as a development record. Decide whether to mark the adopted packages as real.
3. **Homepage banner.** The hero photograph is Kluane, Yukon (Canada). It is unlabelled, so not misleading, but it is not a destination on sale.
4. **Per-leg figures for Euro Drive days 7 and 8** are estimates fitted to the owner's daily totals (263 km / 3 hr 25 min and 358 km / 4 hr 50 min). To be checked against the owner's route plan.
5. **Homepage row ordering.** Popular follows each destination's Display order; Visa-free and Domestic rows are fixed in code. A settings screen for row order was offered, not built.
6. **Vercel plan** and its terms for commercial use.

## Built but waiting on content or configuration

| Item | What is missing |
| --- | --- |
| Resorts & Stays listings | No verified real property exists. The sample stays describe properties that do not exist and stay hidden. |
| About, privacy, terms, cancellation, contact details | Placeholder text until filled in Site settings. |
| New-enquiry alerts | Outbox jobs are written, but nothing sends them without a webhook and a scheduled worker. |
| Password reset, staff invitations | Need Supabase email delivery. |
| Excel workbook sync | Local worker only; use the export buttons on Vercel. |

## Partly implemented

- Draft preview is a simplified layout, not the public page.
- Destination captions, hero content, the visa list and the Domestic row are code-managed. The Domestic row and the International country cards depend on specific sample records.
- South Asia has a page without a navigation link; Southeast Asia has no page.
- The route map covers roughly Ireland to Poland and northern Spain to Denmark. Stops outside that area do not show.
- Photos uploaded but never saved, and replaced Euro Drive card photos, are not cleaned up.
- `content_media` table exists but is unused.

## Not implemented

Live availability, booking, payments, customer accounts, CRM, reviews, blog, multi-language, analytics, MFA, automated backups, data-retention rules, committed end-to-end tests.

## Known problems and risks

1. **Formula-generated prices now look real** (decision 1).
2. **Site-wide noindex and development-flagged enquiries** while samples are switched on (decision 2).
3. **Published snapshots hidden by the showcase switch are not rewritten** by the photo and wording actions, because those read the public view. Run the actions while samples are visible.
4. **One address only.** Changing `SITE_URL` without redeploying, or using the other domain, produces "This operation is not permitted".
5. **Repository size.** `public/images/places` holds about 17 MB of photographs.
6. **Wikimedia photographs carry attribution duties** (CC BY / BY-SA). `/photo-credits` meets them; keep it linked.
7. **Dependency advisories** from the 10 November audit (4 high, 9 moderate, mostly legacy Firebase packages) have not been re-run.
8. Admin enquiry lists still load everything in memory; `rate_limits` rows are never cleaned up; no MFA or recovery email.
9. Supabase Free limits and inactivity pausing; about 280 KB of storage per uploaded photo.

## Technical debt

- Three backends in one adapter; Firebase kept only for rollback.
- One global stylesheet of about 3,500 lines with appended override blocks.
- Admin is a single catch-all page; the content editor is about 1,100 lines.
- Package content for the two Europe trips lives in code (`src/lib/europe-drives.ts`) and in the database once installed; the "Update to latest version" action is the bridge.
- Unused dependencies: `@fontsource/inter`, `@playwright/test`, `@axe-core/playwright` (Playwright is used ad hoc from the cloud image for visual checks, not from the project).
- Stale branches: `mobile-first-ui-and-tests`, `revert-1-mobile-first-ui-and-tests`, `codex/build-pickthemap`.

Priorities and ordering are in the [roadmap](ROADMAP.md). A dated log of each change is in [CURRENT-UPDATES.md](CURRENT-UPDATES.md).
