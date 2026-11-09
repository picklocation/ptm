# PickTheMap: cloud setup and owner handover

## Current architecture

Next.js on Vercel renders the public site and admin portal. Firebase Authentication verifies staff identities. The server uses Firebase Admin SDK to access Firestore. GitHub branch `codex/build-pickthemap` deploys to the connected Vercel project. No checkout or live supplier inventory exists.

Public site: https://ptm-alpha.vercel.app

Admin login: https://ptm-alpha.vercel.app/admin/login

Dashboard: https://ptm-alpha.vercel.app/admin

## Demo catalogue

`src/lib/expanded-catalogue.ts` adds 130 sample holidays:

- Five each for Thailand, Indonesia, Malaysia, Singapore, Sri Lanka, Maldives, Mauritius, Switzerland, Italy and France (50).
- Five each for Kerala, Kashmir, Delhi Agra Jaipur, Goa, Rajasthan, Andaman, Wayanad, Munnar, Vagamon, Ooty, Kodaikanal, Kolukkumalai, Vattavada, Varkala, Kochi and Calicut (80).
- Existing destination, resort and road-trip records are retained.

Every new package has day-by-day detail, duration, route, accommodation notes, proposed inclusions/exclusions, meal plan, theme, illustrative image/alt text and fictional INR pricing with basis and conditions. Images may depict other places; they are not supplier/property evidence. These records are examples, not contracted inventory.

The owner-authorised temporary showroom uses private Firestore document `runtimeConfig/demoShowcase` with `enabled: true`. It enables visible sample records even on the production deployment, adds an unmistakable sitewide notice, sets noindex, blocks robots and empties the sitemap. This is an intentional preview exception to the normal rule that production hides demo content. Demo enquiries are marked accordingly. Local demo flags continue to work independently.

Seed cloud data from a trusted computer (never from a public HTTP endpoint):

```powershell
npx tsx scripts/cloud-admin.ts seed --key "C:\private\service-account.json" --project pickthemap-fe68b --showcase
```

The command validates all records, checks the project matches the key, and uses create-only transactions. It skips existing IDs and never overwrites owner edits. It does not create accounts or change passwords. It deliberately ignores `.env.local` and refuses emulator environment variables. Key contents are never printed. Keep the JSON outside the repository; matching service-account filenames are also ignored as a safeguard. A rerun can complete an interrupted seed.

Disable the showroom before real launch:

```powershell
npx tsx scripts/cloud-admin.ts showcase-off --key "C:\private\service-account.json" --project pickthemap-fe68b
```

In production, all `demo: true` records then disappear from public pages, while remaining editable in admin. Review and replace fictional content, pricing and photographs before clearing the demo checkbox and publishing. Do not bulk mark examples as real. Leave `ENABLE_DEMO_CONTENT=false` and `NEXT_PUBLIC_DEMO_MODE=false` in Vercel.

## Immediate next steps: enable your owner account

1. Firebase Console → Authentication → Get started → Sign-in method → enable **Email/Password**. Do not enable public registration in the website.
2. Authentication → Settings → Authorized domains → add `ptm-alpha.vercel.app`. Add your own domain when configured.
3. Authentication → Users → Add user. Enter your business owner email and a unique password of at least 12 characters. Keep the password in a password manager; do not put it in Git, chat, an npm command or Vercel environment variables. There is no default cloud password.
4. Provision that existing user's UID as an active owner using the private key locally:

```powershell
npx tsx scripts/cloud-admin.ts owner --key "C:\private\service-account.json" --project pickthemap-fe68b --email "YOUR_OWNER_EMAIL"
```

This only grants the specified existing identity owner access. It does not reset the password or silently promote an existing restricted staff record. Alternatively, an authorised project administrator can create Firestore `staff/{Firebase Auth UID}` with string fields `id` (same UID), `email`, `role: owner`, and boolean `active: true`.

5. Open `/admin/login`, sign in, then visit `/admin`. If the browser configuration changed, redeploy Vercel first; `NEXT_PUBLIC_*` variables are compiled at build time.
6. Test a sample package: edit → save draft → preview → publish → view website → submit a labelled test enquiry → check `/admin/enquiries`. Edit a published item and confirm it stays unchanged publicly until republished.
7. Create a separate editor and enquiry manager under `/admin/staff`. Verify an editor cannot read enquiries and an enquiry manager cannot publish content. Verify a Firebase user without a staff document is rejected. Deactivate a test staff member and confirm existing access stops.

## Permissions and views

| URL / capability | Owner | Editor | Enquiries |
|---|---|---|---|
| `/admin` dashboard | All summaries | Content summaries | Enquiry summaries |
| `/admin/content`, `/admin/content/new`, `/admin/content/{id}` | Yes | Yes | No |
| `/admin/preview/{id}` | Yes | Yes | No |
| `/admin/enquiries`, `/admin/enquiries/{id}`, exports | Yes | No | Yes |
| `/admin/settings`, `/admin/staff`, `/admin/audit` | Yes | No | No |

Content views support structured holidays, destinations, Europe road trips and resorts, draft saving, preview, publish, unpublish, archive, gallery alt text, prices and homepage ordering. Settings hold FAQs, policies and contact links. Enquiries support notes, status, follow-up, assignment and CSV/XLSX download. Content listing currently provides a simple table; advanced content search/pagination is a later improvement.

Firebase login returns an ID token; the server verifies it (including revocation) and resolves `staff/{uid}`. A random session token is stored in an HttpOnly, Secure-on-HTTPS, SameSite=Strict cookie for eight hours; Firestore stores its SHA-256 digest. Every protected request checks the staff record and active flag. Firebase sign-in alone grants no administrative permissions. State-changing routes require the exact `SITE_URL` origin. Client Firestore rules deny private reads/writes; Admin SDK bypasses rules, so server checks and IAM remain essential.

There is no self-service password reset or MFA UI yet. Use Firebase's supported account recovery controls while these are planned. Deactivate staff in the portal when revoking access; disabling only the Auth identity does not invalidate an already established application session until expiry. Password changes likewise do not currently revoke application sessions. Do not claim MFA until the chosen provider flow is configured and tested.

## Vercel configuration

| Variable | Value / source | Type |
|---|---|---|
| `DATA_BACKEND` | `firebase` | Config |
| `SITE_URL` | `https://ptm-alpha.vercel.app` | Config |
| `FIREBASE_PROJECT_ID` | `pickthemap-fe68b` | Config |
| `FIREBASE_CLIENT_EMAIL` | service-account JSON `client_email` | Config |
| `FIREBASE_PRIVATE_KEY` | complete JSON `private_key`, preserving newlines or literal `\n` | Secret |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `pickthemap-fe68b` | Config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `pickthemap-fe68b.firebaseapp.com` | Config |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app configuration | Config |
| `ENABLE_DEMO_CONTENT`, `NEXT_PUBLIC_DEMO_MODE` | `false` | Config |

Do not add `LOCAL_ADMIN_PASSWORD` or emulator hosts to Vercel. Never use a `NEXT_PUBLIC_` prefix for server credentials. Changing environment variables requires a new deployment. Configure production and preview separately to avoid preview writes to real data.

## Remaining launch dependencies

- Verify deployed owner access and the complete publish/enquiry flow. Finish real business contact details, policies, approved photographs and quotes.
- Firebase Spark database/Auth can support initial usage within quotas. This update enables no billing. Cloud image uploads require an available Storage bucket and configured `FIREBASE_STORAGE_BUCKET`; Firebase Storage currently requires Blaze. Until an approved storage decision, use existing illustrative URLs for demos and committed approved assets for real content.
- Vercel Hobby is intended for non-commercial personal use; check the plan terms before operating this commercial travel business. No paid plan has been enabled by this update.
- XLSX downloads work from admin. Automatic updates to the laptop workbook still require the local worker against the cloud database. Vercel cannot write directly to a laptop. A Microsoft 365/CRM adapter and an approved notification provider remain optional work.
- Define data retention, backup/recovery, monitoring, stronger spam protection and password recovery/MFA before public business launch.

References: [Firebase password authentication](https://firebase.google.com/docs/auth/web/password-auth), [Vercel environment variables](https://vercel.com/docs/environment-variables), [Firebase Storage billing changes](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [Vercel Hobby](https://vercel.com/docs/plans/hobby).
