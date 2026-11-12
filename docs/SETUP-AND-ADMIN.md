# PickTheMap setup and admin access

Updated 11 November 2026. This replaces the previous Firebase-first setup instructions.

Use the [Supabase launch guide](SUPABASE-LAUNCH.md) for current configuration and the [owner handbook](OWNER-HANDBOOK.md) for daily operations.

## Admin credentials

- Owner email: **pickthemap@gmail.com**
- Password: the private password chosen during Supabase setup; not included in documentation.
- Local login: http://localhost:3005/adminportal/login
- Local dashboard: http://localhost:3005/adminportal
- Hosted preview: append `/adminportal/login` to the latest ready deployment URL from `codex/migrate-supabase`.
- Production after cutover: https://ptm-alpha.vercel.app/adminportal/login

The new Supabase login is separate from the old Firebase login. Editing `SUPABASE_OWNER_PASSWORD` in a local file after provisioning does not change an existing Auth password. Password recovery email configuration is not yet verified.

## Current deployment state

Code, catalogue cache fixes, typography, destination captions and browser icons are pushed to GitHub on `codex/migrate-supabase`. Supabase tables, access rules, 200 sample entries, Storage assets and owner access are prepared. Local verification passed.

The six required environment-variable names were assigned to Production and Preview. The owner reported promoting the migration deployment, but live checks then showed an unavailable catalogue. The cache fix and subsequent design changes are pushed; verify and promote the newest ready deployment. A preview push does not automatically update the public domain. See [current updates](CURRENT-UPDATES.md).

Firebase data was not imported, at the owner's request. No Firebase resources were deleted or disabled.
