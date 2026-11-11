# Admin and mobile review — 11 November 2026

## Mobile fixes

- Search controls previously used 12–14px text. All text inputs, selects and textareas now use 16px on narrow screens and coarse-pointer devices to address focus-triggered phone zoom. User-controlled pinch zoom remains enabled.
- The finder/catalogue input's protruding green focus outline is replaced with a subtle dark inset underline. Keyboard focus remains visible; other controls retain their focus indicator.
- Search inputs now declare search semantics and a search-key hint.
- Mobile form grids collapse to one column, including admin classification and enquiry fields. Flexible children may shrink without pushing the page wider.
- Admin tables retain their columns in a horizontally scrollable container instead of squeezing them into unreadable widths.
- Admin navigation and finder controls have larger mobile touch targets. Editor panels stack at tablet widths.
- Navigation/filter dialogs have accessible names, bounded dynamic-viewport height, internal scrolling and contained overscroll.
- Bottom-navigation spacing includes the phone safe area. Admin/login screens do not reserve space for a public bottom navigation they do not display.

Source review used the [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines). No browser was opened or automated, in line with the owner's earlier preference. This is not proof of pixel-perfect layout or iOS Safari behaviour; real-device focus/keyboard checks remain necessary.

## Admin capability inventory

| Area | Present behaviour |
| --- | --- |
| Authentication | Supabase password login, active staff check, protected server routes and database RLS, logout |
| Dashboard | Content/enquiry counts and links according to role |
| Content | Create, edit, save draft, simplified private preview, publish, unpublish, archive |
| Organisation | Template, package format, country/state/local stops, multiple collection assignments, featured/order, search and filters |
| Trip details | Duration, itinerary/stops, inclusions/exclusions, accommodation; resort amenities/rooms/meals; road-trip vehicles/capacities |
| Media | Upload, cover/gallery URLs, alt text, gallery ordering by URL order, private/public access checks |
| Pricing/SEO | Price, currency, basis, conditions, SEO title and description |
| Enquiries | Search/filter, status, notes, assignment/follow-up, CSV and Excel export |
| Settings | Contact/social/WhatsApp, About/legal content and site-wide FAQs |
| Staff | Owner-managed staff creation and activation, owner/editor/enquiries roles |
| Audit | Owner-visible history |

## Existing limitations

- Draft preview is a simplified view, not the full public detail-page layout.
- FAQs are site-wide; there is no separate per-package FAQ editor.
- Hero content and destination captions are code-managed, not editable admin modules.
- Archiving and gallery-reference removal exist; permanent package/file deletion and automatic unused-media cleanup do not.
- “Sync Excel now” cannot write to the owner's laptop from Vercel. Hosted users should export a file or run the documented local sync worker.
- Password recovery email, MFA and notification-provider delivery have not been verified/configured by this review.
- Homepage selection uses featured/order controls; there is no independent drag-and-drop page builder.

## Checks

The integration script now checks authenticated owner access and rendered headings for Content, New content, Enquiries, Settings/FAQs, Staff and Audit modules, in addition to the existing publish/enquire/export/media/permissions workflow. Test records are generated with disposable IDs and cleaned up; business records are not intentionally changed.

All 17 unit tests passed. The extended Supabase integration run passed, including owner module checks, publication/discovery, enquiry persistence/idempotency, exports, valid/invalid uploads, role isolation, disabled staff, unpublish and logout. The integration run cleaned up its disposable records.

After deploying, manually check at 360px, 390px and tablet width: focus each search input/select without automatic zoom; keyboard focus remains visible; long package names and locations do not widen the page; tables scroll within their card; menus and filters remain usable with the keyboard open; enquiry actions are not obscured by sticky navigation.
