# PickTheMap design specification

Updated 11 November 2026. The full portable decision guide is [AI-HANDOVER.md](AI-HANDOVER.md). New explicit owner instructions take priority over historical notes.

## Direction

White/gray travel discovery with rounded photographic cards and restrained green. MyTourCab informs layout and trip hierarchy; PickYourTrail informs grouped destination photography and captions. Use original implementation/copy and licensed photographs. Preserve supplied logo artwork and proportions; no trailing wordmark dot.

## Typography and colours

Self-hosted **Outfit**, weights 400–700, for body and headings; **Plus Jakarta Sans** for the wordmark. Do not restore the former Inter body/Jakarta heading pairing. Keep headings restrained and copy conversational and place-specific.

Canonical CSS is src/app/globals.css. Primary actions use #09B468 with white text/icons; hover is #08A660. Package-card circular actions use the green button fill with white arrows, placed beside the price (owner request, 12 November 2026; this replaces the earlier white-circle treatment). Main text is #122B25, secondary text #53635C, paper #F6F8F5, mint #E6F4EC, border #E1E7E2. No dominant yellow or decorative gradient washes. Photo overlays may shade text for readability. Check contrast for the actual font size/weight.

## Current layout decisions

- Preserve responsive layouts from 360px, comfortable touch controls, accessible labels, visible focus and reduced-motion behaviour.
- Hero supporting paragraph is hidden at **901px and wider**; retained below that breakpoint.
- Destination cards stay in a single manually scrollable row with hidden scrollbar. No autoplay/ticker.
- Small destination photo captions sit above centred white place names. Captions are currently code-managed in src/app/page.tsx.
- Popular and International destination rows use different places. Bali/Indonesia count as the same place.
- Package cards retain pale green surfaces and rounded photos. Desktop grids show at least four cards where space permits; mobile cards remain readable.
- Retain the exact requested label “Visa-Free-destinations”, while maintaining accurate passport-specific guidance.
- Browser favicon and mobile icons derive from the supplied logo. Default title: “PickTheMap | Custom Holidays & Road Trips”.

## Content and implementation discipline

The service is enquiry-first, without instant booking, payments or live availability. Sample records retain internal demo flags and showcase/noindex safeguards. The owner requested removal of the public demo banner; this does not verify sample offers. Do not fabricate reviews, credentials, guarantees or driving times. Replace illustrative property photos/prices with approved content.

Reuse existing components and tokens. Inspect responsive overrides before adding CSS. Use available design/frontend skills when relevant; do not install arbitrary UI kits or claim tools were used without evidence. Prior 21st catalogue access required authentication. The latest visual changes have not had a browser screenshot review. Respect the owner's preference to provide screenshots rather than open/automate browsers without a new request.
