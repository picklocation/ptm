# Targeted review — 10 November 2026

This is a code/dependency review and functional access test, not a full penetration test or a guarantee of no vulnerabilities.

## Fixed

- Upgraded sharp from 0.34.x to 0.35.5, including Next.js's deduplicated copy. npm reported high-severity native image-library advisories affecting the earlier version. Valid and malformed image upload tests are included in the integration check.
- Added an IP-wide login limit (30 attempts/window) alongside the existing IP+email limit (8 attempts/window), reducing bypass by cycling email addresses. Window defaults to ten minutes. Shared IP users share that cap.
- Package classification is validated on the server, restricted to known section identifiers/formats, and stored in existing content JSONB. Admin writes continue to require both server authorization and database RLS.

## Open dependency findings

After the sharp update, `npm audit --omit=dev` reports **13 affected production dependency entries: 4 high, 9 moderate, 0 critical**. These are dependency-graph entries, not 13 distinct demonstrated exploits.

High entries are the retained Firebase client dependency chain including grpc-js. Moderate entries include Firebase Admin/Google request libraries and ExcelJS's uuid chain. Supabase mode does not use Firebase operations, but the packages remain installed for rollback and legacy tools. This reduces the relevant runtime surface; it does not justify ignoring the audit findings.

Do not use `npm audit fix --force`: the suggested fixes include breaking Firebase/ExcelJS changes or downgrades. Next work is to isolate/remove legacy Firebase dependencies after rollback approval and assess compatible patched versions/overrides for the Excel chain. No forced major-version changes were made in this task.

Sources returned by npm audit:
- https://github.com/advisories/GHSA-m9gg-hp2v-232j
- https://github.com/advisories/GHSA-f596-whhp-79r4
- https://github.com/advisories/GHSA-w5hq-g745-h8pq
- https://github.com/advisories/GHSA-f88m-g3jw-g9cj

## Operational checks still needed

- Hosted preview and final production backend switch must be verified on the actual deployment URL; setting Supabase variables on the old Firebase branch is insufficient.
- Passwords previously pasted into chat must not be reused. The owner login uses the privately saved password; documentation never records it.
- Sample itinerary/pricing/photo content needs business approval before public launch. The internal demo flags and noindex protections remain.
- Recovery email/SMTP, MFA, backup schedules, data retention and automatic rate-limit cleanup have not been configured by this work.
- Application sessions expire within an hour. Logout clears the cookie; a separately copied JWT remains valid until expiry unless staff is deactivated (staff authorization is checked on every protected operation).
- Existing admin supports archiving and gallery-reference removal, not permanent file/package deletion. Do not assume deleting a gallery URL frees Storage space.

Previously verified: anonymous admin requests blocked, role isolation, denied self-promotion, immediate disabled-staff denial, private uploads before publication, input validation, duplicate enquiry protection, and transactional enquiry/outbox saves.
