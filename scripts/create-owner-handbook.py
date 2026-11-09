from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT

pages = [
('Your website at a glance', [
('Current status - 9 November 2026', 'The site runs on Vercel with Firebase Authentication and Firestore. The owner account pickthemap@gmail.com has been provisioned, and you have reported successful login. There are 200 catalogue records, including 130 newly added holiday examples. Content review and your own custom domain are still pending.'),
('Useful addresses', 'Website: https://ptm-alpha.vercel.app\nAdmin login: https://ptm-alpha.vercel.app/admin/login\nDashboard: https://ptm-alpha.vercel.app/admin\nRepository: https://github.com/picklocation/ptm'),
('What visitors can do', 'Explore international and domestic holidays, Europe road trips, resorts and villas, visa guidance and South India destinations. Open a trip to see its itinerary and details, then request a personalised quote. The website does not provide live availability, instant booking or online payment.'),
('How the pieces connect', 'GitHub stores the application code. A push to codex/build-pickthemap triggers the connected Vercel deployment. Vercel serves the website and server endpoints. Firestore stores packages, enquiries, settings and staff permissions. Firebase Authentication verifies staff credentials. Content changes saved through admin go directly to the database and do not require a Git push.'),
('The content you see today', 'The catalogue contains fictional prices and illustrative photos. Removing preview banners does not approve these details for sale. Review package copy, routes, photos, supplier arrangements and prices before promoting the site. Internal demo flags and search-indexing protection remain while showcase mode is enabled.')]),
('Manage packages and destinations', [
('1. Open Content & media', 'Sign in and open /admin/content. Select a record to edit, or choose Create content. Choose the appropriate kind: holiday, road trip, resort or destination.'),
('2. Complete the structured fields', 'Add a clear title and unique URL slug, location, country, region, summary and detailed description. Set days and nights, themes, itinerary days, inclusions, exclusions and accommodation. Road trips also need vehicle and luggage details. Resorts need amenities, room categories and meal plans.'),
('3. Review images and pricing', 'Use photographs you have rights to use and describe each image with alt text. Confirm that a property photo shows the actual property. Prices need currency, per-person or per-group basis, and conditions. If no approved price exists, leave the price blank so visitors see Request a quote. Cloud uploads need a separately configured storage solution; current sample image URLs do not prove upload readiness.'),
('4. Save draft, preview, then publish', 'Save draft stores your edits without replacing an existing published snapshot. Preview shows the draft to authorised staff. Publish replaces the public snapshot. Unpublish removes the public version while retaining the editable record. Archive retains the record but removes it from public browsing.'),
('5. Control homepage selection', 'Use Featured and display order to influence existing homepage selections. Some destination rows and layout sections are configured in code; this is not a drag-and-drop page builder. Check the homepage after publishing.'),
('Approve a sample carefully', 'Replace fictional text, pricing and photos first. Only then clear the Demonstration content checkbox and publish. Do not clear every demo flag at once. Before launch, turn off showcase mode using the documented administration command so unapproved samples are hidden.')]),
('Handle enquiries and Excel', [
('What happens on submission', 'The form validates the visitor input and saves the enquiry to Firestore before showing success. It also queues Excel and optional notification jobs. A repeated request reference avoids duplicate records. Both normal submission and the WhatsApp option save first.'),
('WhatsApp is a handoff', 'After a successful save, the visitor can open a prepared message to +91 79022 20044. The visitor must press Send in WhatsApp. The website does not claim that a message was delivered or automatically send messages on your behalf.'),
('Your daily enquiry workflow', 'Open /admin/enquiries. Search or filter, open the enquiry, review dates, traveller count, budget and preferences. Add an internal note, set an assignment and follow-up date, and choose a status: new, contacted, quote sent, confirmed or closed. Confirmed is your manual business status, not an automated supplier booking.'),
('Download Excel when needed', 'Export filtered records as XLSX or CSV. Check that your filters are correct before downloading. Store files securely because they contain customer contact information.'),
('Automatic workbook updates', 'The local Excel worker can update a dedicated workbook while your computer is running and configured for the cloud database. Vercel cannot directly edit a workbook on your laptop. Tracking status, Tracking notes, Tracking owner and Tracking follow-up columns are preserved by the worker. Excel edits do not automatically update the dashboard. Microsoft 365 or CRM synchronisation is a separate integration.'),
('Test without confusing real customers', 'Use your own contact information and write TEST - please ignore in preferences. Submit once, verify the record, add a note, change status and export it. Showcase enquiries are internally marked as demonstrations. Email notifications are not configured merely by creating an enquiry.')]),
('Staff, settings and routine care', [
('Owner access', 'Your owner email is pickthemap@gmail.com. Use the password you created privately in Firebase. No password is recorded in this handbook. Owner access includes content, enquiries, site settings, staff and audit history.'),
('Team permissions', 'Editor: content creation, editing, preview and publishing; no enquiry access. Enquiries: enquiry management and exports; no content publishing. Owner: both areas plus site settings, staff and audit. Add separate accounts through Staff & access; avoid sharing your owner password.'),
('Revoke access safely', 'Deactivate a staff account in the portal. The app checks the active staff record on protected requests. Firebase identity alone does not grant dashboard access. Existing application sessions last up to eight hours; password changes or disabling only the Firebase identity do not currently invalidate these app sessions immediately.'),
('Site settings & FAQs', 'Complete business email, phone, address, social links, WhatsApp, About text and FAQs. Add business-approved privacy, terms and cancellation wording. Verify all contact links on mobile. The app has no custom password-reset or MFA screen yet; account recovery and stronger authentication need a separate operational setup.'),
('What to check regularly', 'Review new enquiries and follow-ups daily. Check export/worker failures and failed sign-ins. Recheck package prices and conditions when supplier information changes. Plan data retention, backups and restoration. Keep service-account keys and environment files private; never commit them to GitHub.'),
('Costs and limits', 'No paid plan has been enabled by this work. Firestore usage is subject to free-tier quotas. Firebase Cloud Storage requires a billing-enabled plan under current rules. Vercel Hobby is intended for non-commercial personal use; resolve the appropriate plan before operating the travel business publicly.')]),
('Connect your GoDaddy domain', [
('Before purchase', 'You have not bought a domain yet and plan to use GoDaddy. Confirm spelling, first-year price and renewal price before buying. Domain registration is separate from hosting. This Next.js site is already hosted on Vercel, so an additional GoDaddy website-hosting package is not needed for this setup. No purchase has been made by the assistant.'),
('1. Add the purchased domain to Vercel', 'After purchase, send the exact domain name. In Vercel open ptm > Settings > Domains and add it. Add the www version as appropriate and choose one canonical address. Use the DNS record values displayed for this particular project; do not copy arbitrary IP addresses from tutorials.'),
('2. Update DNS where it is managed', 'In the DNS manager for the domain, apply the records requested by Vercel (such as apex A and www CNAME, plus verification if requested). If nameservers point elsewhere, edit DNS at that provider. Preserve email MX and email-related TXT records. Do not replace all records or nameservers without reviewing what already depends on them.'),
('3. Wait for validation and HTTPS', 'Vercel must show the domain as correctly configured and issue its HTTPS certificate. Propagation time varies. Test both the root domain and www and configure a redirect to the chosen address. There is no need to buy an extra certificate simply to complete this Vercel setup.'),
('4. Update the application', 'Set Production SITE_URL in Vercel to the chosen HTTPS origin, then redeploy. The server checks this exact origin for form submissions and admin changes. Add the domain to Firebase Authentication authorised domains. Keep NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as the Firebase project domain unless deliberately setting up a custom auth domain.'),
('5. Verify before switching links', 'On the new domain, sign in again, publish a test edit and submit a test enquiry. Check redirects, WhatsApp, images and exports. Update business links only after these pass. Connecting a domain does not turn off showcase/noindex mode; that is a separate content-approval step.')]),
('Your acceptance checklist and references', [
('Public website checks', '[ ] Desktop and 360px mobile navigation work.\n[ ] International, domestic, resort and road-trip links open.\n[ ] Filters and empty states make sense.\n[ ] Package itinerary, photos, price basis and conditions are accurate.\n[ ] Contact and WhatsApp links use the right details.'),
('Admin and enquiry checks', '[ ] Signed-out /admin redirects to login.\n[ ] Save draft leaves the published page unchanged.\n[ ] Publish, unpublish and archive behave correctly.\n[ ] A test enquiry appears once with the right details.\n[ ] Notes, status and follow-up changes persist.\n[ ] XLSX export contains the test record.\n[ ] Editor and enquiry-only accounts have the intended restrictions.'),
('Launch checks', '[ ] Domain, HTTPS and canonical redirect verified.\n[ ] SITE_URL updated and redeployed; new-domain enquiry tested.\n[ ] Firebase authorised domain configured.\n[ ] Real package content and policy wording approved.\n[ ] Showcase disabled after approval; remaining samples hidden.\n[ ] Indexing and sitemap checked again.\n[ ] Hosting plan, storage, recovery and retention decisions completed.'),
('Technical handover files', 'Repository: docs/SETUP-AND-ADMIN.md covers configuration and owner provisioning. docs/SCHEMA-AND-API.md covers Firestore collections and endpoint contracts. scripts/cloud-admin.ts supports inspect, seed, owner and showcase-off. Do not pass passwords into command lines. Keep the service-account JSON private.'),
('Official setup references', 'Vercel domains: https://vercel.com/docs/domains/working-with-domains/add-a-domain\nEnvironment changes: https://vercel.com/docs/environment-variables\nFirebase authentication: https://firebase.google.com/docs/auth/web/password-auth\nStorage requirements: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024\nVercel plans: https://vercel.com/docs/plans/hobby')])]

out = Path('output/pdf'); out.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BookTitle', fontName='Helvetica-Bold', fontSize=25, leading=30, textColor=HexColor('#073f32'), spaceAfter=18))
styles.add(ParagraphStyle(name='SectionTitle', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=HexColor('#073f32'), spaceBefore=12, spaceAfter=5))
styles.add(ParagraphStyle(name='Copy', fontName='Helvetica', fontSize=10, leading=14, textColor=HexColor('#263833'), spaceAfter=5, splitLongWords=True))
styles.add(ParagraphStyle(name='Kicker', fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=HexColor('#13865d'), spaceAfter=10))
md=['# PickTheMap owner handbook\n\nPrepared 9 November 2026.\n']
story=[]
for index,(title,sections) in enumerate(pages):
    if index: story.append(PageBreak())
    story.append(Paragraph('PICKTHEMAP / OWNER HANDBOOK',styles['Kicker']))
    story.append(Paragraph(escape(title),styles['BookTitle']))
    md.append('## '+title+'\n')
    for heading,body in sections:
        story.append(Paragraph(escape(heading),styles['SectionTitle']))
        story.append(Paragraph(escape(body).replace('\n','<br/>'),styles['Copy']))
        md.append('### '+heading+'\n\n'+body+'\n')
def footer(canvas,doc):
    canvas.setStrokeColor(HexColor('#dce7df')); canvas.line(45,40,550,40)
    canvas.setFont('Helvetica',8); canvas.setFillColor(HexColor('#63736d'))
    canvas.drawString(45,27,'PickTheMap | Owner handbook | 09 Nov 2026')
    canvas.drawRightString(550,27,str(doc.page))
SimpleDocTemplate(str(out/'PickTheMap-Owner-Handbook.pdf'),pagesize=(595.28,841.89),rightMargin=45,leftMargin=45,topMargin=40,bottomMargin=52,title='PickTheMap Owner Handbook',author='PickTheMap').build(story,onFirstPage=footer,onLaterPages=footer)
Path('docs/OWNER-HANDBOOK.md').write_text('\n'.join(md),encoding='utf-8')
print('Created owner handbook PDF and Markdown')
