# Current website updates

Updated 11 November 2026. This records implemented changes separately from what has been verified on the live domain.

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
