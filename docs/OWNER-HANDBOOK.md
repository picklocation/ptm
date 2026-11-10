# PickTheMap owner handbook

Updated 10 November 2026.

## Where things stand

Your new backend uses Supabase for packages, enquiries, staff login and image storage. GitHub holds the code, and Vercel hosts the website. The design, page URLs and green-and-white theme are retained. The green dot after the wordmark has been removed.

There are 200 sample catalogue records, including five holidays each across ten international countries and five each for sixteen Indian/regional locations, alongside destination, resort and Europe road-trip entries. Nine shared travel photos, your logo and a placeholder are stored in Supabase. Photos are illustrative, not verified photographs of each named property.

You chose a fresh start: old Firebase enquiries and edited content were not copied. Firebase remains untouched. Local tests pass; hosted preview verification and production promotion remain unconfirmed.

## Admin login

| Item | Details |
| --- | --- |
| Owner email | pickthemap@gmail.com |
| Password | Your privately chosen Supabase password |
| Local login | http://localhost:3005/admin/login |
| Local dashboard | http://localhost:3005/admin |
| Hosted preview login | Latest migration preview URL followed by /admin/login |
| Production login after cutover | https://ptm-alpha.vercel.app/admin/login |

Use the Supabase password, which may differ from your old Firebase password. No password is written here. Changing the local setup file after account creation does not reset an existing password. Sessions last at most one hour; sign in again when required. Password-reset email delivery is not yet verified.

To start locally:
```powershell
npx tsx scripts/supabase-local.ts build
npx tsx scripts/supabase-local.ts start
```

## What visitors do

Visitors browse international and domestic holidays, Europe road trips, resorts/villas, South India and destination guidance. They open an itinerary and request a personalised quote. There is no instant booking, live availability or online payment.

Both enquiry buttons save the request in Supabase first. The WhatsApp option then offers a prepared message to **+91 79022 20044**; the visitor must press Send in WhatsApp. The site does not automatically send a WhatsApp message or track delivery.

## Manage packages and destinations

1. Open **Content & media** at /admin/content and select an item or create one.
2. Choose holiday, road trip, resort or destination.
3. Edit the name, URL slug, locations, description, duration and itinerary.
4. Add accommodation, inclusions/exclusions, vehicle details or room/meal-plan information.
5. Upload images and provide alt descriptions. Arrange gallery URLs in display order; remove a URL to remove that gallery reference.
6. Enter pricing only with currency, per-person/per-group basis and conditions. Otherwise use Request a quote.
7. Save a draft and preview it. Publish when ready.

Saving a draft does not replace the current published version. Publish updates the public snapshot. Unpublish hides it; archive preserves it and its history. **Permanent package/file deletion is not exposed in the current editor.** Removing a gallery reference does not delete the stored file.

Featured flags and display order control homepage selections. An independent banner manager has not been added; the existing hero remains configured in code.

## Images

JPEG, PNG and WebP uploads are checked and re-encoded into WebP. Uploaded images stay in a private Supabase bucket; visitors can access them only when used by published content. Approved seed photos and brand assets use a public bucket. The original logo artwork is unchanged.

The app accepts files below 8 MB, but Vercel may impose a smaller request limit. Use compressed web images; if a large upload fails, reduce its size. Initial shared assets occupy about 7 MB.

## Manage enquiries

Open /admin/enquiries. Search/filter requests, open details, add internal notes, assign follow-up and update status:

**new → contacted → quote sent → confirmed → closed**

An enquiry is not a confirmed booking. Set confirmed only after your business has agreed the arrangements. Repeat submission references prevent duplicate records. Notes and history remain associated with the enquiry.

Download CSV or Excel from admin. Exporting does not automatically connect an existing workbook or CRM.

For continuous local Excel updates, configure your private .env.local for Supabase and run:
```powershell
npm run excel:sync -- --watch
```

Keep the computer and worker running. The default workbook is .local/enquiries.xlsx; EXCEL_PATH can select another dedicated workbook. Vercel cannot write directly to your laptop. Email notifications remain optional and require a configured provider/webhook.

## Staff permissions

| Role | Access |
| --- | --- |
| Owner | Content, enquiries, settings, staff and audit |
| Editor | Content and media |
| Enquiries | Enquiries, notes and exports |

Create or deactivate staff at /admin/staff. Use unique passwords. You cannot deactivate yourself through that screen. Database permissions independently restrict each role; disabling a staff record blocks its data access even if it still has a token.

## Settings and content review

At /admin/settings, enter business contact details, social links, WhatsApp number, FAQs, About text and business-approved privacy, terms and cancellation content.

Sample packages retain demo flags and fictional-price conditions. Showcase mode currently allows them to display while search indexing is disabled. Review routes, photographs, operating arrangements, prices and legal content before clearing demo flags. Hiding a demo banner does not verify an offer.

## Deployment and domain

The Supabase code is on **codex/migrate-supabase**. The latest UI change removes the wordmark dot. Vercel variable names have been assigned to Production and Preview, but hidden values cannot be confirmed from screenshots.

Next:
1. Open the newest ready migration Preview deployment.
2. Check homepage, catalogue images, /admin/login and one enquiry.
3. Approve promotion to Production after those checks pass.
4. Verify the public domain and admin again.

The current public domain is https://ptm-alpha.vercel.app; a successful Supabase production switch has not yet been confirmed. No custom domain purchase or DNS connection has been confirmed. Once purchased, add it in Vercel, apply Vercel's displayed DNS records at the registrar, and update production SITE_URL before redeploying.

Do not delete the Firebase setup yet. If rolling back after taking new Supabase enquiries, retain/export those new enquiries first.

## What is tested and what remains

Passed locally: production build, TypeScript, thirteen tests, owner login, publishing and public detail pages, enquiry saving and retries, Excel export, uploads, private photo access, role restrictions, disabled accounts, unpublishing and logout.

Remaining: hosted preview verification, approved production promotion, real content/pricing review, legal/contact details, optional email recovery/notifications, custom domain and any later CRM integration. No paid service was enabled by this work.

See [technical launch instructions](SUPABASE-LAUNCH.md) and [schema/API reference](SCHEMA-AND-API.md). Any previously generated PDF dated 9 November describes the earlier Firebase setup; this updated Markdown handbook supersedes it.
