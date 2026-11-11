# Resorts & Stays owner guide

Updated 11 November 2026.

## Visitor flow

The domestic/neighbouring homepage row starts with Resorts & Stays, then South India. The South Asia category card is omitted. Other destination cards remain. Public navigation labels now say Resorts & Stays.

`/resorts-and-stays` shows Wayanad, Munnar, Vagamon, Ooty, Kodaikanal, Kulukkumala, Kakkadampoyil, Vattavada, Bangalore, Varkala, Thekkady, Kochi, Calicut, Goa, Alleppey and Coorg. Each links to `/resorts-and-stays/{destination}`. Destination imagery is inspiration until the owner supplies approved location photographs.

Listings combine audience (Couples/Families) and category (Budget/Premium/Luxury) filters. Cards show supplied property details, up to four amenities, conditional starting prices and View Details. Missing prices show Request a quote. Empty destinations offer an enquiry instead of invented properties.

Existing `/resorts-and-villas/{property-slug}` detail URLs are preserved. The old `/resorts-and-villas` index permanently redirects to the new hub. Property pages link back to the destination and offer Enquire Now and WhatsApp. Both lead through the enquiry form so dates, guests and contact details are saved before the optional WhatsApp handoff. The visitor must press Send in WhatsApp.

## Add a real property

1. Admin → Content & media → Create content. Select the Stay template.
2. Enter its real name, unique slug, location and approved description. Upload authorised property photos and alt text.
3. Under Resorts & Stays directory, choose its destination and applicable filters.
4. Add rooms, meal plans, amenities, accommodation, inclusions/exclusions and optional price. Prices require currency, basis and conditions.
5. Check the information with the property or an authoritative source, then tick the verification confirmation. Do not mark fictional/sample records as verified. Clear the sample flag only for genuinely reviewed content.
6. Save a draft, preview and publish. Verify the destination listing and enquiry link.

Only published, non-sample resorts marked verified are visible on public pages. Existing unverified/sample resort records remain in admin but are hidden publicly. No real property names, prices or facilities were created in this change. This verification flag records an admin's confirmation; it is not an independent certification.

## Add or edit destinations

Create/edit a Destination record, choose its title and slug, upload a photo with alt text, and tick Include this destination in Resorts & Stays. Publish it before assigning properties. A published record with a matching built-in slug overrides that card's name/photo. New slugs add new destinations. Edit existing records when their slug is already in use.

The sixteen requested destinations remain built-in choices. Unpublishing an override restores its built-in card; removing built-in destinations is currently a code change. Aliases such as Bengaluru/Bangalore, Kolukkumalai/Kulukkumala and Alappuzha/Alleppey resolve to the same directory destination.

## Enquiries and storage

The server records the selected property's ID/title and resolves its destination from published content. Dates, adults/children, rooms and contact details use the existing enquiry form. Admin enquiry search includes the property title; existing follow-up/status/notes and Excel export remain available.

Optional Content JSONB fields: `stayDestination` (destination-card inclusion), `stayDestinationSlug` (property assignment), `propertyVerified` (admin attestation), `stayTags` (Couples/Families/Budget/Premium/Luxury). No SQL migration is needed. Existing permissions, RLS and publishing/revision behaviour remain.

Source: `src/lib/stays.ts`, `src/app/resorts-and-stays/`, `src/components/stay-listings.tsx`, existing content editor and detail/enquiry routes. The legacy `resorts-and-villas` collection identifier remains for compatibility; its display label is Resorts & Stays.

## Verification and deployment

Production build, all 21 unit tests, and the extended Supabase integration check passed on 11 November 2026.

Unit coverage checks destination count/aliases/overrides, verified-only listings, combined filters and publication validation. The extended integration check covers public directory routes, legacy redirect, unknown destination 404, draft assignment persistence and rejection of an unverified property. It also exercises the existing admin/public enquiry and permission workflow.

No browser automation or real-phone visual review was performed. After promoting the latest Ready deployment, check mobile destination cards, filters, detail links, and a genuine property's enquiry/WhatsApp handoff. Populate approved property information before expecting populated resort listings.
