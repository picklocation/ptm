# Roadmap

Prepared 12 November 2026. This is a recommended order, not a commitment. Items marked **Owner decision** need the owner's answer before work starts. Status behind each item is in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

## Phase 1: get one verified production deployment

Everything else depends on knowing what visitors actually see.

1. **Done by the owner on 12 November 2026** (package cards and Resorts & Stays reported visible). **Check the public domain.** Owner opens https://ptm-alpha.vercel.app/ and reports (or screenshots) whether package cards, the Outfit font, the new browser icon and `/resorts-and-stays` appear.
2. **Identify the deployed commit** in Vercel. The newest Supabase build is `7655569` or later on `codex/migrate-supabase`.
3. **Promote the newest Ready deployment** if the domain is behind. Redeploying an older one will not include the cache fixes.
4. **Run the hosted smoke test:** a package detail page, admin login, one clearly labelled test enquiry, and confirm it appears in admin.
5. **If packages are still missing,** follow the outage checklist in handover section 7: environment values, runtime logs, cache. Do not reseed.

Depends on: Vercel access (owner). Code changes: none expected.

## Phase 2: settle the branches

6. **Owner decision:** make the Supabase line the production branch. Recommended: create `main` from `codex/migrate-supabase`, set it as the Vercel production branch and the GitHub default, and keep `codex/build-pickthemap` as the frozen Firebase rollback point.
7. **Owner decision:** keep or discard the reverted mobile work on `mobile-first-ui-and-tests`. If parts are wanted (for example the collapsible mobile footer), port them individually onto the Supabase line.
8. Delete stale branches once the above is decided.

Depends on: Phase 1. Risk: changing the production branch triggers a Production deployment, so do it straight after a verified promotion.

## Phase 3: real content

9. **Resorts first.** Enter real properties through admin (Stay template, destination, tags, photos with alt text, verified tick). The owner supplies names, authorised photos, amenities and prices. Until then every stays destination is empty.
10. **Homepage Kerala section fallback.** Small code change so the section shows a sensible message or link when no verified resort is featured.
11. **Replace or approve sample holidays and road trips.** Real itineraries, prices with conditions, licensed photographs. Clear the sample flag only on reviewed records.
12. **Domestic row.** It is tied to sample record IDs. Rework it to select from published content before the samples are removed.
13. **Business details in admin settings:** email, phone, address, WhatsApp, social links, about, privacy, terms, cancellation.
14. **Turn the showcase flag off** once real content is in place, so samples disappear, enquiries stop being flagged as development records, and search engines may index the site.

Depends on: owner-supplied content. Items 10 and 12 are code.

## Phase 4: enquiry operations

15. **New-enquiry alerts. Owner decision** on channel (email, WhatsApp, or both) and provider. The outbox and webhook adapter already exist; what is missing is a configured destination and something that runs the sender on a schedule.
16. **Password recovery and staff invitations:** configure Supabase email delivery.
17. **Add staff accounts** for whoever handles enquiries and content.

Depends on: Phase 1. May involve a third-party service; confirm cost first.

## Phase 5: launch hardening

18. **Custom domain:** connect it in Vercel, update `SITE_URL`, re-test enquiries (the origin check depends on `SITE_URL`).
19. **Dependency audit:** re-run, then remove Firebase packages and code once the owner confirms rollback is no longer needed. **Owner decision.**
20. **Backups and retention:** scheduled export of enquiries and content; decide how long enquiries are kept.
21. **Rate-limit cleanup** and pagination for admin lists.
22. **Visa guidance review** before launch and on a schedule.
23. **Real-device check** at 360px, 390px and tablet width using the list in `docs/ADMIN-MOBILE-REVIEW.md`.
24. **Missing-configuration handling:** show the unavailable banner instead of an error page.

## Phase 6: optional improvements

Only if the owner asks. Each is a separate, scoped piece of work.

- Admin-editable destination captions and hero text.
- A Southeast Asia page and a decision on the South Asia page (link it or remove it).
- Full-fidelity draft preview.
- Per-package FAQs.
- Permanent deletion of packages and unused images.
- Browser end-to-end tests on the Supabase line.
- Analytics.
- Consolidating the overlapping documentation.

## Testing and deployment notes

- Every change: `npm run typecheck` and `npm test`. Build when routes, config or data loading change.
- Backend, auth, content or enquiry changes: also run `scripts/migration/verify-supabase-flow.ts` on the owner's machine. It writes and removes disposable records in the real project.
- Visual changes: check the responsive overrides in `globals.css`, then ask the owner for screenshots. State plainly when no visual check happened.
- Schema changes: add a new file under `supabase/migrations/`; never edit an applied one.
- Reporting: say whether a change is committed, pushed, Preview-ready, promoted, or verified on the public domain.
