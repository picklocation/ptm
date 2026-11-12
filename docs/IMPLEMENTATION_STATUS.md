# Implementation status

Assessed 12 November 2026 against `codex/migrate-supabase` commit `7655569`.

How this was checked: full source and Git history read; `npm ci`, `npm run typecheck` and `npm test` run in the analysis session (typecheck clean, 21 of 21 tests pass). **Not checked:** the live website, Vercel configuration, the Supabase project, the production build, the Supabase integration script and any visual or real-device review. The session's network policy blocked the public domain.

## Complete in code

- Public site: homepage, nine collection pages, detail pages for all four templates, text and legal pages, 404 and error pages, sitemap and robots.
- Search and filter on collection pages; homepage finder.
- Homepage destination rows with captions, manual scrolling and no repeated places between Popular and International.
- Package classification: template, format, country/state/stops, multiple section assignments, featured and order.
- Resorts & Stays: hub, sixteen destinations with aliases, listings with combined filters, admin destination override, property assignment, verification gate, legacy URL redirect.
- Enquiry form with validation, idempotent save, delivery outbox, optional WhatsApp handoff, rate limiting and spam checks.
- Admin: login/logout, dashboard, content editor with draft/preview/publish/unpublish/archive and revisions, enquiries workflow with CSV/Excel export, settings, staff management, audit history.
- Supabase backend: schema, RLS, storage buckets and policies, atomic functions, staff auth with one-hour cookie session.
- Image upload pipeline with re-encoding and private-until-published serving.
- Outage handling: backend-specific cache keys, failures not cached, unavailable banner, noindex while samples show or the catalogue is down.
- Branding: Outfit typography, logo, favicon and home-screen icons, colour tokens.
- CI workflow for typecheck, tests and build.

## Built but waiting on content or configuration

| Item | What is missing |
| --- | --- |
| Resorts & Stays listings | No verified real property exists in code. Public resort pages stay empty until the owner enters and verifies real properties in admin. |
| Whole catalogue | The 200 records are samples with illustrative photos and prices. They need business review or replacement before launch. |
| About, privacy, terms, cancellation, contact details | Fall back to placeholder text until filled in admin settings. |
| Notifications | An outbox job is written for every enquiry, but sending needs `NOTIFICATION_WEBHOOK_URL` and someone running `npm run notifications:send`. No email or WhatsApp alert reaches staff automatically. |
| Excel workbook sync | Works only as a worker on the owner's computer. On Vercel, use the export buttons. |
| Password reset, staff invitations | Depend on Supabase email/SMTP, which the documentation records as not configured. |

## Partly implemented

- **Draft preview** shows a simplified layout, not the real public detail page.
- **Destination captions, hero content and the domestic row** are code-managed. The domestic row depends on specific sample record IDs, so it will lose tiles when samples are replaced.
- **Visa guidance** is a code list dated 9 November 2026 with no admin editing or review reminder.
- **South Asia** has a page but no navigation link. **Southeast Asia** has no page.
- **`content_media` table** exists but the editor stores image URLs in content JSONB instead.
- **Media and package deletion**: only archive and gallery-reference removal exist. Storage is never freed.
- **FAQs** are site-wide only.

## Not implemented

Live availability, booking, payments, customer accounts, CRM integration, reviews or testimonials, blog, multi-language, analytics, MFA, automated backups, data-retention rules, browser end-to-end tests on this branch, custom domain.

None of these was confirmed as required. They are listed so nobody assumes they exist.

## Known problems and risks

### Deployment (highest priority)

1. **Owner update, 12 November 2026:** the owner reported that package cards and the Resorts & Stays page now appear on the public domain. This was the owner's own check; the deployed commit, admin login and a test enquiry have not yet been confirmed. Earlier history follows. **Production state was unknown.** The documentation records that after the owner promoted a migration deployment, the public domain showed older homepage code and zero packages while Supabase held 200 published records. Two cache fixes followed. Whether the newest deployment was promoted and works has never been confirmed.
2. **Preview-only branch.** Pushes to `codex/migrate-supabase` create Preview deployments. Production changes only by manual promotion. The Vercel production branch is presumably still the Firebase branch (**Assumption**).
3. **Branches have diverged.** `codex/build-pickthemap` (Firebase) lacks all Supabase work. There is no `main`.

### Behaviour worth knowing

4. **Homepage Kerala section can render empty.** It shows featured resorts, but only verified real resorts are public. With none entered, the intro text sits beside an empty grid with no fallback message. Not visually confirmed.
5. **Enquiries are flagged `demo` while samples are showing.** Any enquiry received while the showcase flag is on is stored as a development record (it still appears in admin and exports, in a "Development record" column). Real leads arriving before samples are replaced would carry that flag.
6. **Missing Supabase variables produce an error page**, not the "unavailable" banner, because a configuration error is not classed as an outage.
7. **Admin lists load everything in memory.** Fine at 200 records and a few enquiries; will slow with volume.
8. **`rate_limits` rows are never cleaned up.**
9. **Supabase Free projects pause after inactivity** and have storage and egress limits.

### Security and dependencies

10. The 10 November audit recorded 4 high and 9 moderate advisories in production dependencies, mostly from the retained Firebase packages and the ExcelJS chain. Not re-run since.
11. A copied access token stays valid until it expires (up to one hour) unless the staff member is deactivated.
12. No MFA, no verified recovery email.
13. The security document notes passwords were once pasted into a chat. Those must not be reused.

## Technical debt

- Three backends in one adapter (`src/lib/store.ts`, `src/lib/auth.ts`, upload and media routes). Firebase and its dependencies remain only for rollback.
- An error message in `src/lib/store.ts` still tells the reader to configure `DATA_BACKEND=firebase`.
- `@fontsource/inter`, `@playwright/test` and `@axe-core/playwright` are installed but unused on this branch.
- One 3,100-line global stylesheet with layered responsive overrides; changes need a check of later rules.
- The admin is one catch-all page file.
- Documentation overlaps across eleven files and repeats stale figures (test counts, "through `44fbfcd`").
- Stale branches: `mobile-first-ui-and-tests`, `revert-1-mobile-first-ui-and-tests`.

## The reverted mobile work

Pull request 1 ("Mobile first UI and tests") changed the footer into collapsible columns, altered the enquiry form, homepage and collection page, added 171 lines of CSS and a Playwright suite. It was merged into the Firebase branch and reverted the same day. The revert is clean: nothing is half-applied, and the Supabase branch was started from the commit before the merge, so it never contained that work. Some of its aims (mobile form sizing, admin tables, touch targets) were later redone differently in commit `0f60869`. The original branch still exists if the owner wants any part of it back.

## Current priorities

1. Confirm what the public domain is serving and get the newest Supabase build verified there.
2. Decide the long-term production branch.
3. Replace sample content with real, approved content, starting with resorts.
4. Make sure staff are alerted to new enquiries.

Details and ordering are in the [roadmap](ROADMAP.md).
