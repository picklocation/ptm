# PickTheMap — portable AI development handover

Updated 11 November 2026. You can upload this file to Claude, or use it alongside the repository in Claude Code. It is a specification of decisions and working methods, not a guarantee that different assistants will produce identical results. If working without repository access, request the relevant source files before claiming to implement or verify a change.

## 1. Product and working style

PickTheMap arranges personalised holidays, Indian domestic trips, international holidays, Europe road trips, Kerala resorts/villas/camping and South India stays. The site helps visitors discover ideas and request quotes. It does not have live availability, instant booking, checkout or online payments.

The owner values practical action, short explanations and low tool/credit usage. Make reasonable routine decisions. Ask only when missing information affects the business workflow, architecture, cost or safety. Do not repeatedly ask permission for an already requested edit. Do not expand a small styling request into a redesign.

The owner previously asked not to open or automate browsers; they prefer to open pages themselves and supply screenshots. Respect that unless they explicitly change the preference. Use source inspection, targeted checks and bounded HTTP reads where useful. State when visual browser verification has not happened.

Do not install a collection of skills or packages simply because they are available. Use relevant installed design/frontend skills and existing project components. Only claim tools and checks actually used. Prior 21st catalogue access required authentication; no catalogue component retrieval or paid generation should be assumed available.

## 2. How to make design decisions

For each change:

1. Identify the exact element, screen sizes and behaviour the owner wants changed.
2. Inspect the closest component and its CSS, including later responsive overrides. Read the relevant project instructions and installed Next.js guide.
3. Match the latest screenshots and explicit preferences. Preserve adjacent layout, typography, colours and interactions unless the request includes them.
4. Choose the smallest coherent change that solves the request. Reuse tokens and primitives instead of adding parallel components or another UI library.
5. Check mobile wrapping, text length, keyboard focus and empty/error states. Make uncertainty explicit rather than inventing a successful test.
6. Explain the result plainly, with deployment status separate from code completion.

“Less AI-looking” means restrained, specific, readable design: place-specific captions, real photographs, consistent typography and natural wording. It does not mean adding gradients, new colour palettes, giant headings, ornamental labels, animation or a new visual style every time.

## 3. Visual rules to preserve

### Brand and typography

- Predominantly white backgrounds, soft gray/pale green surfaces, charcoal/forest text and restrained green accents. No dominant yellow.
- Use the supplied logo artwork without redrawing, stretching, recolouring or adding a trailing green dot to the wordmark.
- Source logo: `public/images/pickthemap-icon.png`. Browser assets: `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`.
- Outfit is the locally bundled body/heading family, weights 400–700. The wordmark retains Plus Jakarta Sans. Do not revert to the older Inter body/Jakarta heading pairing.
- Default tab title: `PickTheMap | Custom Holidays & Road Trips`; page titles use `%s | PickTheMap`.

Current CSS tokens in `src/app/globals.css`:

| Purpose | Value |
| --- | --- |
| White base | `#FFFFFF` |
| Paper surface | `#F6F8F5` |
| Main text | `#122B25` |
| Secondary text | `#53635C` |
| Logo/brand accent | `#05A660` |
| Primary button | `#09B468` |
| Primary button text/icon | `#FFFFFF` |
| Button hover | `#08A660` |
| Pale mint | `#E6F4EC` |
| Subtle border | `#E1E7E2` |

The dark forest `#063F2E` remains a text/support colour, not the owner's requested main button fill. Primary buttons are bright green with white text/arrows. Package-card circular arrows are the explicit exception: white circle, green arrow. Preserve those separate treatments. Audit contrast when changing typography or colours; do not assume every existing colour/size combination meets WCAG.

### Layout and destination rows

- MyTourCab informs the rounded photography, compact navigation and trip-card hierarchy. PickYourTrail informs grouped photo destination rows and small captions above names. Use original code/copy and licensed assets, not copied site source.
- Destination rows stay in a single horizontal row, with manual controls/swiping and hidden scrollbars. No autoplay, moving ticker or visible horizontal scrollbar.
- Popular and International destinations must not repeat places across those two rows. Treat Bali/Indonesia as the same place for selection. Choose from published content, not dead links or fabricated entries.
- Destination tiles use centred white place names with small place-specific captions above them. Examples: Kerala → “Backwaters & tea hills”; Switzerland → “Lakes beneath the Alps”. Use restrained photo shading for readability.
- Captions are currently a code dictionary in `src/app/page.tsx`, not an admin field. Unmapped places still show a name. If adding admin-managed captions, implement validation/storage/editor support instead of claiming it already exists.
- Package cards retain their pale green surface, rounded photos, readable details and white circle/green-arrow treatment. Desktop package grids should show at least four cards where the existing layout supports it; never squeeze four cards onto mobile.
- The hero supporting paragraph (“From the winding roads of Europe…”) is hidden at widths **901px and above**. It remains on mobile/tablet. Do not restore the desktop paragraph during later typography work.
- Preserve the requested label **Visa-Free-destinations**. This is a display label, not proof of visa eligibility. Verify actual entry rules for the passport/travel dates before updating guidance; do not treat visa-on-arrival/eVisa as universally visa-free.

### Mobile and accessibility

Support widths from 360px. Keep text readable, buttons comfortably touchable, focus visible and controls labelled. Avoid page-level horizontal overflow. Keep sticky navigation, enquiry buttons and WhatsApp clear of form controls and footer content. Respect reduced motion; do not add autoplay video. Keep images responsive and compressed.

## 4. Architecture and source map

Existing stack: Next.js App Router, React, TypeScript, Tailwind/global CSS; Supabase PostgreSQL/Auth/Storage; Vercel hosting. Inspect `package.json` and the lockfile for installed versions. This project uses a recent Next.js version with local documentation under `node_modules/next/dist/docs/`; do not rely on old API examples.

| Area | Source |
| --- | --- |
| Homepage, captions, destination selection | `src/app/page.tsx` |
| Global styles and responsive overrides | `src/app/globals.css` |
| Fonts, metadata, root layout | `src/app/layout.tsx` |
| Destination row controls/tiles | `src/components/destination-row.tsx` |
| Shared trip cards | `src/components/ui.tsx` |
| Data adapters and public caches | `src/lib/store.ts` |
| Supabase clients, collection/table mapping | `src/lib/supabase.ts` |
| Identity/session/role checks | `src/lib/auth.ts` |
| Record types and input validation | `src/lib/types.ts`, `src/lib/validation.ts` |
| Package formats and collection assignment | `src/lib/classification.ts` |
| Public asset URLs | `src/lib/assets.ts` |
| Database migrations | `supabase/migrations/` |
| Admin pages and HTTP endpoints | `src/app/admin/`, `src/app/api/` |

`DATA_BACKEND=supabase` is the intended hosted mode. Legacy Firebase code remains for transition/rollback; local SQLite is not suitable for Vercel. Do not silently delete legacy resources or run Firebase seed scripts against the new setup.

## 5. Content and package classification

Keep these separate: page template (`holiday`, `road-trip`, `resort`, `destination`), package format, country/state/local stops, website section assignments, featured flag and display order.

Formats include Custom holiday, Resort stay, Villa stay, Camping, Glamping, Houseboat, Cab road trip, Self-drive road trip, City break, Beach holiday, Adventure, Honeymoon and Group tour.

Assign several sections when appropriate: `international-trips`, `domestic-trips`, `resorts-and-villas`, `kerala-resorts`, `europe-road-trips`, `south-india`. For example, Kerala camping can belong to Domestic, Kerala stays, Resorts/villas/camping and South India. A normal European holiday and a European road trip are different formats even when they share destinations.

Explicit empty section assignments must remain empty; only absent assignments use legacy inference. Do not change a package's URL template just to change its collection placement. Visa guidance is country-based, not an arbitrary package tag.

Drafts and published snapshots are separate. Saving a draft does not replace public content. Publish/unpublish/archive must preserve authorization, revisions and cache invalidation. Physical media/package deletion is not currently exposed; removing a gallery URL does not free Storage space.

## 6. Security and enquiry behaviour

- Admin owner email: `pickthemap@gmail.com`. Passwords are private; never include one in prompts, screenshots, documentation or Git.
- Roles: owner, editor, enquiries. Enforce authorization on the server and with database RLS. Never bypass RLS for routine staff reads/writes to “make it work”.
- The server secret stays server-side. Never put it in a `NEXT_PUBLIC_` variable. Public clients use the publishable key.
- Sessions use the HttpOnly `ptm_supabase_access` cookie, Secure in production, SameSite=Strict, at most one hour. No persisted browser refresh-token flow is implemented. Do not claim password-reset email, MFA or SMTP are configured without verification.
- Save enquiries reliably before showing success or offering WhatsApp. UUID idempotency prevents duplicates; database transaction creates the enquiry and delivery jobs. WhatsApp opens a prepared message, but the visitor must press Send.
- Validate input, preserve rate limits and honeypot/timing checks, and retain CSV/Excel formula-injection protection.
- Uploads accept validated JPEG/PNG/WebP, decode/re-encode through sharp, and use private storage until referenced by published content. Do not allow arbitrary SVG/HTML uploads or publicly expose private media.
- Never print or commit `.env.migration.local`, `.env.vercel.supabase.local`, other private env files, service-account JSON or database passwords. Use existing ignored local configuration without echoing values.
- The 10 November dependency review recorded unresolved advisories. Its counts are historical; rerun an audit when appropriate. Do not claim the application is vulnerability-free or use `npm audit fix --force` blindly.

## 7. Data and catalogue outages: important lessons

The owner requested a fresh Supabase catalogue rather than a Firebase import. There are 200 sample published records as of the last direct check. Old Firebase enquiries/edits were not imported. Do not invent claims that historical data was migrated.

Sample content remains flagged internally and uses showcase gating. The owner asked to remove visible demo wording and will review content. Do not silently remove internal demo/indexing safeguards, fabricate testimonials/operating guarantees or convert illustrative prices into verified offers.

If packages disappear:

1. Check the exact public URL, deployed commit and environment. The public domain has previously served older code while previews showed newer content.
2. Inspect actual package-card/detail links and empty-state text. Place names in general copy do not prove packages rendered.
3. Check Supabase published records and `ptm_showcase` independently using safe bounded reads. Never print credentials or enquiry data.
4. Inspect environment configuration, runtime errors and cache behaviour before reseeding or editing data.
5. Cache keys must distinguish backend/project. Catalogue errors must be handled outside `unstable_cache`; otherwise a failed read becomes a persistent successful empty list. Showcase errors must likewise not be cached as a deliberate false setting.
6. Showcase fails closed for the failed request, then retries. Do not force all demo records visible to bypass an unexplained failure.

Successful public reads normally revalidate after 15 minutes; content mutations invalidate the public tag. Direct SQL edits can take time to appear. Supabase responses and Vercel runtime settings are separate evidence: a healthy database does not prove the deployed app is configured correctly.

## 8. Git, hosting and verification

- Repository: https://github.com/picklocation/ptm
- Current working branch at handover: `codex/migrate-supabase` (verify with Git before working).
- Public URL: https://ptm-alpha.vercel.app/
- Admin: https://ptm-alpha.vercel.app/admin/login
- Vercel deployments: https://vercel.com/pickthemap/ptm/deployments
- Supabase project URL: https://feqmnzutyhzochuyiint.supabase.co

These URLs are configuration references, not evidence of current live status. No custom domain purchase/connection has been confirmed. Do not enable paid services or upgrade plans without the owner's agreement; check current provider terms before promising free commercial hosting.

Production/Preview require `DATA_BACKEND`, `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SITE_URL`. Use the launch guide for details; no secrets are supplied here. Database URLs and owner provisioning passwords are not Vercel runtime requirements.

Read `git status` first. Preserve other work. Do not force-push or reset branches. Keep commits focused and push to the intended branch when authorised. Verify the remote and authentication account.

A push to the migration branch has produced **Preview**, not automatic Production updates. Wait for Ready, inspect the latest commit and promote the correct deployment when authorised. Redeploying an old commit does not fetch the newest code. Promotion does not merge branches or change the configured production branch. Report whether an update is merely committed/pushed, built, promoted or actually verified on the public domain.

Relevant commands (from the project root):

```powershell
npm run typecheck
npm test
npx tsx scripts/supabase-local.ts build
npx tsx scripts/supabase-local.ts start
```

The local launcher uses private configuration and serves port 3005. `verify-access.ts` and `verify-supabase-flow.ts` under `scripts/migration/` perform cloud access/integration checks; inspect them first because they create and clean up test data. Run them when backend/auth/content flows change, not for every colour tweak. No need for new tests that only repeat trivial CSS declarations.

For a data/permission fix, verify failure and success paths. For a visual change, check responsive rules and perform visual review if authorised; clearly state if it was not performed. Never reuse an earlier passing test as proof of a newer untested change.

## 9. Recent decisions and next checks

Recent code through `7655569` includes: catalogue cache fix, showcase retry fix, Outfit/captions, browser icons, desktop hero paragraph removal, no duplicate places between Popular/International rows, mobile focus and admin responsive fixes, the Resorts & Stays directory, and removal of the South Asia homepage card. Check Git for later commits. Verified status and remaining work: `docs/IMPLEMENTATION_STATUS.md` and `docs/ROADMAP.md`. The latest public-domain promotion and full hosted flow have not been independently verified.

Priorities: verify the correct production deployment, package browsing, admin login and a test enquiry; review real photos/prices/legal copy; configure optional recovery email/notifications; connect a purchased domain when provided. Do not treat these as completed.

Further references: `docs/OWNER-HANDBOOK.md`, `docs/SETUP-AND-ADMIN.md`, `docs/SUPABASE-LAUNCH.md`, `docs/SCHEMA-AND-API.md`, `docs/CURRENT-UPDATES.md`, `docs/SECURITY-REVIEW.md`. The old 9 November PDF is historical.

## Suggested opening prompt for Claude

> Read CLAUDE.md, AGENTS.md and docs/AI-HANDOVER.md, then inspect the relevant source and current Git state. Continue PickTheMap using the documented design decisions and existing architecture. Preserve working behaviour outside my request. Do not expose secrets, recreate data to mask an error, enable paid services or assume a Preview is live Production. Keep changes focused, verify appropriately, and explain the result briefly. My next task is: [describe the change].

## Resorts & Stays update

See [the Resorts & Stays guide](RESORTS-AND-STAYS.md) for the destination-first directory, admin verification and property assignment. Public resorts now require published, non-sample, admin-verified records; old mock resorts remain in admin but are hidden from public pages. The homepage domestic row starts with Resorts & Stays, then South India; the South Asia card was removed. Legacy property URLs and collection identifiers remain compatible.
