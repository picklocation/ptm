# Roadmap

Updated 15 November 2026. A recommended order, not a commitment. Items marked **Owner decision** need the owner's answer first. Current state is in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

## Done since the first roadmap (12 November)

- Production verified by the owner on the Supabase build; custom domain `www.pickthemap.in` connected; admin moved to `/adminportal`; Vercel functions moved to Singapore.
- Image system rebuilt (direct links, two sizes, gallery manager, clean-up); permanent delete; faster admin.
- New package cards, discount pricing, two-step enquiry form.
- Location-checked photographs across the catalogue with a credits page.
- Two Europe self-drive packages with a dedicated page and route map.
- Demonstration wording, generic accommodation notes and cover-only galleries removed from sample packages.

## Phase 1: finish the current release

1. **Merge** the four waiting commits into `codex/migrate-supabase` and **promote** the deployment in Vercel.
2. **Press the owner actions** in Admin → Content & media, with samples visible: Set up the two packages (or Update to latest version if already installed), Match photos to locations, Tidy package wording.
3. **Check on the live site and a real phone:** both Europe package pages, the homepage cards, a holiday package page, and one test enquiry through the two-step form that then appears in admin.

Depends on: owner. Code changes: none expected.

## Phase 2: decide what the catalogue is

4. **Owner decision: prices.** Keep the formula-generated prices as real quotes, replace them with real ones, or remove them so packages show "Request a quote". A one-click removal can be added.
5. **Owner decision: sample flag.** If the adopted packages are real, clear `demo` on holidays and destinations so the site can be indexed and enquiries stop being flagged. Sample stays must stay flagged and hidden.
6. **Real resorts.** Enter verified properties with authorised photos. Add a fallback for the homepage Kerala section while none is featured.
7. **Business details:** email, phone, address, social links, about, privacy, terms, cancellation.
8. **Owner's own photographs** for Kerala and South India destinations, and better ones for Calicut, Manali and Merano.

## Phase 3: homepage control

9. **Owner decision: row ordering screen.** A "Homepage rows" section in Site settings to reorder, hide or add cards in each row, replacing the code-fixed Visa-free and Domestic rows and the borrowed-photo International cards.
10. Give each country its own Destination record so every card photo is changeable in admin.
11. **Owner decision: hero photograph** (currently Yukon, Canada).
12. Admin-editable destination captions.

## Phase 4: enquiry operations

13. **New-enquiry alerts. Owner decision** on channel and provider; confirm any cost first.
14. Supabase email delivery for password reset and staff invitations.
15. Staff accounts for whoever handles enquiries and content.

## Phase 5: hardening

16. Re-run the dependency audit; remove Firebase code and packages once rollback is no longer wanted. **Owner decision.**
17. Backups and enquiry retention.
18. Pagination for admin enquiries; `rate_limits` clean-up.
19. Clean up unsaved uploads and replaced settings photos.
20. Make the photo and wording actions rewrite hidden published snapshots through a narrow server path.
21. Visa guidance review on a schedule.
22. Missing-configuration page shows the unavailable banner instead of an error.
23. Review the Vercel plan against its commercial-use terms. **Owner decision.**
24. Settle branches: create `main` from the Supabase line, set it as the Vercel production branch, delete stale branches. **Owner decision.**

## Phase 6: optional

- More Europe driving packages (the page design and editor fields are reusable).
- A wider route map, or a zoomable one, if routes leave western and central Europe.
- Southeast Asia page; decide the South Asia page.
- Full-fidelity draft preview; per-package FAQs for holidays.
- Committed end-to-end tests; analytics.
- Consolidating the overlapping documentation.

## Testing and deployment notes

- Every change: `npm run typecheck` and `npm test`. Build when routes, config or data loading change.
- Appearance changes: a local build, at most one desktop and one phone-width screenshot, then the owner's check on a real phone. Stop any earlier local server first (`pkill -f next-server`); a stale one serves old pages.
- Backend, auth, content or enquiry changes: also `scripts/migration/verify-supabase-flow.ts` on the owner's machine.
- Schema changes: a new file under `supabase/migrations/`; never edit an applied one. Optional content fields live in JSONB and need none.
- Data changes on the live database go through an owner-only admin action, never a script run from a cloud session.
- Report each change as committed, pushed, Preview-ready, merged, promoted, or verified on the public domain.
