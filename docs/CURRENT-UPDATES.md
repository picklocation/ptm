# Current website updates

Updated 15 November 2026. A dated log: each section records a change as it was made, so earlier sections describe the site as it was then. For the present state read [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md). The public site is now https://www.pickthemap.in with the staff portal at `/adminportal`; older sections below still mention `ptm-alpha.vercel.app`.

## Website and admin

- Website: https://ptm-alpha.vercel.app/
- Admin login: https://ptm-alpha.vercel.app/adminportal/login
- Owner email: **pickthemap@gmail.com**. Use the privately chosen Supabase password; no password belongs in this document.
- GitHub: https://github.com/picklocation/ptm — branch `codex/migrate-supabase`.
- Vercel: https://vercel.com/pickthemap/ptm/deployments

## Recent changes

| Commit    | Change                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `5f3c740` | Package formats, country/state/local stops, multiple section assignments and admin filters.                                |
| `5f43b64` | Public label changed to the requested “Visa-Free-destinations”.                                                            |
| `f3549be` | Backend/project-specific public cache keys; catalogue failures no longer persist as successful empty lists.                |
| `02235bb` | Self-hosted Outfit typography, larger hero supporting text, place-specific destination captions and simpler homepage copy. |
| `ee7a2c2` | Browser favicon, mobile home-screen icons and clearer default tab title.                                                   |

Changes on this branch are cumulative: deploying its latest commit includes earlier changes.

## Typography and destination cards

Outfit weights 400–700 are bundled locally through Fontsource, with no Google Fonts request required. Body copy and headings use Outfit; the wordmark retains Plus Jakarta Sans. The green-and-white palette remains.

Destination rows show a small white caption above the larger destination name, centred over the photograph. Examples include “Backwaters & tea hills” for Kerala and “Lakes beneath the Alps” for Switzerland. Photo shading supports readability. Rows retain manual scrolling and arrow controls; no autoplay or visible scrollbar was added.

The captions currently live in `destinationCaptions` in `src/app/page.tsx`, keyed by the displayed destination name. They are not editable in admin yet. A destination without a matching caption still displays its name. Package content, photographs, locations and section assignments remain managed through admin.

## Browser branding

- `src/app/favicon.ico`: 32-pixel browser icon.
- `src/app/icon.png`: 192-pixel icon.
- `src/app/apple-icon.png`: 180-pixel Apple home-screen icon with white padding.
- Source artwork: `public/images/pickthemap-icon.png`; proportions preserved.
- Default tab title: **PickTheMap | Custom Holidays & Road Trips**, configured in `src/app/layout.tsx`. Page-specific titles continue to use the page title followed by PickTheMap.

Next.js discovers these icon files automatically. Browser chrome colours are not customised by this update. Browsers may retain an old favicon; reopen the tab after deployment if needed.

## Publish the latest update

1. In Vercel, open the newest deployment from `codex/migrate-supabase` and wait for **Ready**. Check the source commit rather than selecting an older redeployment.
2. Use **Visit** to check its preview: package cards, destination captions, browser icon and mobile layout.
3. Promote that deployment to Production when ready. A Preview badge alone does not mean the public domain has updated.
4. Open the public domain again. Check a package detail page, admin login and a clearly labelled test enquiry; confirm it appears in admin.
5. If packages are absent, check Production environment values, Supabase project availability and Vercel runtime logs. Do not reseed simply because the page is empty: 200 published records were confirmed in Supabase during the outage investigation.

Promotion does not change the project's production branch. To make future pushes automatically deploy to Production, intentionally merge changes into the configured production branch or change that branch in Vercel after review. Redeploying an old commit uses old code even with new environment variables.

## Verification and remaining checks

The cache update passed TypeScript, all 17 unit tests and the production build. The typography/caption update passed TypeScript and the production build. The icon/title update passed TypeScript. The latest visual changes have not had a browser screenshot review, and their production promotion has not been independently confirmed.

These changes add no schema migrations, API endpoints or new credentials. The prior Supabase flow checks remain documented in the [schema/API reference](SCHEMA-AND-API.md); they were not rerun for these visual changes.

The [owner handbook](OWNER-HANDBOOK.md) is the current operational guide. The older 9 November PDF is historical and has not been regenerated.

## Follow-up: recurring empty catalogue

Live checks after the documentation update found the public domain still serving the older homepage copy without the new icon, and zero package cards. Public Supabase requests returned 200 published records and showcase=true. This confirms the records remain available, but does not expose the production runtime settings or cache contents. A remaining code path cached showcase lookup failures as false; the follow-up fix moves that fallback outside the persistent cache and changes its cache key. Promote the newest deployment and verify the public domain; an earlier Ready deployment does not contain this fix.

## 12 November 2026: package cards, offers and enquiry form

- **Package cards:** green stop line (uses the record's stops, else its location), day count chip, large price and a green round button with a white arrow beside the price. The earlier white-circle arrow on the photo is replaced at the owner's request.
- **Offers:** content has an optional `originalPrice` (admin: "Original price before discount"). When it is higher than the price, the site strikes it through, shows the offer price and a "% off" tag on cards, listings and detail pages. Publishing rejects an original price that is not higher than the price. No schema migration is needed.
- **Enquiry form, first step:** destination suggestions from published content, tap-to-fill popular choices, trip type as pills, plus/minus traveller counts and departure-city suggestions. Fields, validation and saving are unchanged.
- Cards do not show confirmation amounts or cancellation promises; nothing of that kind is stored, and none should be invented.

## 15 November 2026: Europe self-drive packages and location photos

- **Two packages only:** DISCOVER Europe (7 days, 6 nights, 5 countries, from AED 5,999 per person) and Euro Drive (11 days, 10 nights, 9 countries, from ₹193,000 per person). Source: the owner's two brochures. Definitions live in `src/lib/europe-drives.ts`; the earlier sample road trips are removed from the seed data.
- **Installing on the live database:** Admin → Content & media → "Set up the two packages" (owner only). It adds the two packages if missing, never overwrites one that exists, and archives sample road trips. After that each package is edited in admin like any other record.
- **Detail page:** a road trip with route stops uses `src/components/road-trip-detail.tsx`: summary bar, route map, highlights, day-by-day itinerary with morning/afternoon/evening and drive details, stays, inclusions, driving information, tips, FAQs and WhatsApp enquiry. Road trips without route stops keep the standard page.
- **Route map:** `src/components/route-map.tsx` draws stops over country outlines in `src/lib/europe-map.ts`, generated from Natural Earth public-domain data. No map service, key or new dependency. The map covers roughly Ireland to Poland and northern Spain to Denmark; stops outside that area will not show.
- **New optional content fields** (JSONB, no migration): `countries`, `routeStops`, `highlights`, `drivingInfo`, `travelTips`, `faqs`, and per-day `morning`, `afternoon`, `evening`, `driveDistance`, `driveTime`, `driveNote`, `overnight`. All are editable in the content editor for the road-trip template.
- **Location photos:** 68 photographs in `public/images/places`, registered in `src/lib/place-photos.ts` (34 from Unsplash, 34 from Wikimedia Commons with author, licence and source shown on `/photo-credits`). Admin → "Match photos to locations" applies them to sample records that still use the old shared stock photos. Real (non-sample) records and uploaded photos are never changed.
- **Confirmed by the owner on 15 November 2026:** prices are per person; car rental is included in DISCOVER Europe; the Euro Drive price is ₹193,000 (the brochure said ₹195,000); Day 11 of Euro Drive is car return and departure; no car model is promised.
- **Still not stated as fact:** hotel names and car models.

## 15 November 2026: Euro Drive days 7 and 8 revised

At the owner's request, Day 7 is now Munich → Mittenwald → Vipiteno via the Brenner Pass → Bolzano area (263 km, 3 hr 25 min) and Day 8 is Bolzano → Glorenza → Reschen Pass → Landeck → Vaduz → Zürich area (358 km, 4 hr 50 min). Each leg's distance and time is listed in the day's drive note; the per-leg split is an estimate that adds up to the owner's daily totals. Overnights are the Bolzano area and the Zürich area. Name, price (₹193,000 per person) and the nine countries are unchanged. Innsbruck, the Seiser Alm and Merano are no longer stops.

Because an installed package is never overwritten automatically, Admin → Content & media has a second owner action, "Update to latest version", which replaces both packages with the built-in version after a confirmation and discards admin edits to those two records.

## 15 November 2026: Euro Drive homepage card photo

Admin → Site settings & FAQs → "Homepage: Euro Drive card" lets the owner upload the photo for the first Popular destinations card. It is stored as the optional `driveCardImage` setting; empty falls back to the built-in Lake Reschen photo. Only an uploaded photo or a bundled `/images/` path is accepted.

## 15 November 2026: demonstration wording removed from packages

At the owner's request ("I use the sample packages as my packages"), the visible demonstration wording is gone from holidays and destinations: "DEMONSTRATION PACKAGE — not an available offer", "Sample itinerary with fictional pricing", "(mock)", "— demo" in page titles, "illustrative" day plans and similar. Text slips are fixed too: repeated words ("Explore Explore…", "Arrive in Arrive in…") and invented stops ("Wayanad countryside", "Wayanad local sights").

- Source text: `src/lib/expanded-catalogue.ts` and `src/lib/seed-data.ts`.
- Live database: Admin → Content & media → "Tidy package wording" (owner only). `src/lib/sample-copy.ts` replaces a field only when it still contains leftover wording, so text the owner rewrote is kept. Prices are never changed. Safe to run again.
- **Not changed, and needing the owner's decision:** the 130 package prices were generated by formula in the earlier build and are not confirmed business prices; the internal `demo` flag and showcase/noindex gating are still in place; the sample stays describe properties that do not exist and remain hidden from visitors.

## 15 November 2026: shorter enquiry form

"Plan my trip" is now two short steps. Step 1: destination, kind of trip, preferred start date or flexible, adults and children. Step 2: name, phone and email (all mandatory) plus consent. Removed from the form: the whole "details" step (budget, currency, rooms, meal plan, vehicle, preferences), end date, departure city, children's ages and the contact-method choice. The server schema makes email mandatory and gives the removed fields neutral defaults, so stored enquiries and exports keep the same shape. Honeypot, timing, rate limit, origin and idempotency checks are unchanged.

## 15 November 2026: accommodation notes and galleries removed from sample packages

At the owner's request, holiday packages no longer carry the generic "Your accommodation" note or a gallery that only repeated the cover photo, so the "Your accommodation" and "Picture yourself here" sections no longer appear on them. Both sections still exist on the page and return for any package once real accommodation text or gallery photos are added in admin. "Tidy package wording" applies this to existing records: it removes only generator-written accommodation notes and stock or place photos from galleries; accommodation the owner wrote and photos the owner uploaded are kept. The two Europe self-drive packages keep their "Where you'll stay" section.

## 15 November 2026: enquiry confirmation screen

After an enquiry is sent the visitor sees a centred thank-you panel with their first name, a short summary (package if any, destination, travellers, dates), three "what happens next" steps showing the phone and email they gave, and buttons to keep exploring or continue on WhatsApp. The enquiry reference is no longer shown to the visitor, and the prepared WhatsApp message now opens with the visitor's name instead of the reference. The reference still exists on the enquiry in admin and exports. No response time is promised.

## 15 November 2026: owner maintenance buttons removed

The owner confirmed all four maintenance actions have been run on the live database ("Tidy package wording" reported 157 packages tidied; "Match photos to locations" reported everything already matching) and asked for the buttons to go. They are removed from Admin → Content & media. The owner-only endpoints (`/api/admin/content/photos`, `/wording`, `/europe-drives`) remain in the code without a button, so a future bulk change can be given a button again. Until then, changes to the two Europe packages are made in the admin editor, or need a button re-added to apply a code-side revision.

## 15 November 2026: editing Resorts & Stays destination photos

Six of the sixteen built-in stay destinations (Kakkadampoyil, Bangalore, Thekkady, Goa, Alleppey, Coorg) had no Destination record, so their card photos could not be changed in admin. Admin → Content & media now has a folded "Resorts & Stays destination photos" list of all sixteen places. A place with a record opens it; a place without one opens a new Destination record already filled in (name, slug, current photo, "include in Resorts & Stays" ticked, display order 900 so it stays out of the homepage Popular row). The owner replaces the cover and publishes. No records are created automatically.

## 18 November 2026: photo credits page removed; privacy, terms and cancellation added

- The `/photo-credits` page and its footer link are removed at the owner's request (the address now returns "not found"). The Wikimedia Commons photographs are used under CC BY / CC BY-SA licences that require attribution, so the credits moved to a collapsed "Photograph credits" section at the end of the Terms page instead of being dropped.
- `/privacy`, `/terms` and `/cancellation` now show complete built-in text (`src/lib/legal-defaults.ts`) instead of "not published yet". It was written from how the site actually works (enquiry-only, no payments, no analytics, Vercel hosting, Supabase database in Singapore) and follows the usual structure of established travel companies without copying any. Text saved in Admin → Site settings overrides it, and headings (`# Heading`) and bullets (`- item`) in that text are formatted.
- It is general information, not legal advice. It sets no refund percentages or refund deadlines; those are the owner's business decisions, to be added once decided. It does not name the operating company; pending the owner's confirmation of how PickTheMap relates to the registered enterprise.

## 18 November 2026: cancellation charges follow resort and partner policies

At the owner's direction, the built-in Cancellation text now says charges depend on the policy of the resort or booking partner involved, shown in the customer's quote before they confirm: resorts and stays follow the resort's own policy (including stricter peak-season, festival and offer-rate rules); international holidays follow the airlines', hotels', tour operators' and car rental companies' policies, with visa, insurance and already-paid partner fees usually non-refundable; refunds are paid after PickTheMap receives them from the partner. Self-drive trips and other India holidays follow their suppliers. It states no percentages or refund deadlines. The owner confirmed the company name used on the pages is "PickTheMap".

## 23 November 2026: uploads of any size and shape

At the owner's request, photo uploads have no restriction on pixel size or aspect ratio, in every section (packages, Resorts & Stays destinations, the Euro Drive card photo) because they all use the same upload.

- **Removed:** the 40-megapixel limit (a 64-megapixel photo was refused with "could not be validated") and the 8 MB file limit (a 10 MB PNG was refused). Safety ceilings remain: 25 MB and 150 megapixels per file. The admin page prepares each photo in the browser first, so the hosting request limit (about 4.5 MB) is never reached.
- **Better for extreme shapes:** a 12000 × 500 panorama used to be squeezed to 1600 × 67 and looked blurred when cropped into a card. Sizing now keeps a minimum on the shorter side (`src/lib/image-sizes.ts`). Ordinary photos are sized exactly as before.
- **Fit:** nothing changes in the layout. Every container already has a fixed size and the global `img` rule sets `object-fit: cover`. One exception was fixed: the thumbnails in the admin photo manager grew with tall photos.
- **Gallery limit:** still eight photos per record, as decided earlier. That is a count, not a size or shape restriction.
- **Verified** on a local build: 1,495 photo-in-container checks across 16 public and admin pages at desktop and phone width, with every photo swapped for wide, tall, tiny, square and panorama images, found no container resized, no photo failing to fill its container and no photo not set to cover. Seven test uploads (including a 64-megapixel JPEG, a 10 MB PNG, a 12000 × 500 panorama, a 500 × 12000 strip and a 40 × 40 icon) all uploaded through the real editor at both widths.

## 23 November 2026: small-photo note, minimum-size rule removed, branch changes

- **Minimum upload size removed.** The live site had a rule (merged to `prod` on 18 November from another contributor's pull request) that refused photos whose longest side was under 1600 px. It is removed, as the owner asked for no size or shape restrictions.
- **Non-blocking note instead.** After an upload, a photo under 1600 px on its longest side gets a note beside the success message ("is small (800 × 600 px) and may look soft in large banners. It was uploaded anyway"). It never refuses an upload. This is for the editor only; visitors see nothing.
- **Branches.** `codex/migrate-supabase` no longer exists; `prod` is the live line and this work was merged into it at the owner's instruction. The notes in `CLAUDE.md` were updated to match.
