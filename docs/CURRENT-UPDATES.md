# Current website updates

Updated 15 November 2026. A dated log: each section records a change as it was made, so earlier sections describe the site as it was then. For the present state read [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md). The public site is now https://www.pickthemap.in with the staff portal at `/adminportal`; older sections below still mention `ptm-alpha.vercel.app`.

## Website and admin

- Website: https://ptm-alpha.vercel.app/
- Admin login: https://ptm-alpha.vercel.app/adminportal/login
- Owner email: **pickthemap@gmail.com**. Use the privately chosen Supabase password; no password belongs in this document.
- GitHub: https://github.com/picklocation/ptm — branch `codex/migrate-supabase`.
- Vercel: https://vercel.com/pickthemap/ptm/deployments

## Recent changes

| Commit | Change |
| --- | --- |
| `5f3c740` | Package formats, country/state/local stops, multiple section assignments and admin filters. |
| `5f43b64` | Public label changed to the requested “Visa-Free-destinations”. |
| `f3549be` | Backend/project-specific public cache keys; catalogue failures no longer persist as successful empty lists. |
| `02235bb` | Self-hosted Outfit typography, larger hero supporting text, place-specific destination captions and simpler homepage copy. |
| `ee7a2c2` | Browser favicon, mobile home-screen icons and clearer default tab title. |

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
