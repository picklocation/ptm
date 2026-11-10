# PickTheMap setup and admin access

Updated 10 November 2026. This replaces the previous Firebase-first setup instructions.

Use the [Supabase launch guide](SUPABASE-LAUNCH.md) for current configuration and the [owner handbook](OWNER-HANDBOOK.md) for daily operations.

## Admin credentials

- Owner email: **pickthemap@gmail.com**
- Password: the private password chosen during Supabase setup; not included in documentation.
- Local login: http://localhost:3005/admin/login
- Local dashboard: http://localhost:3005/admin
- Hosted preview: append `/admin/login` to the latest ready deployment URL from `codex/migrate-supabase`.
- Production after cutover: https://ptm-alpha.vercel.app/admin/login

The new Supabase login is separate from the old Firebase login. Editing `SUPABASE_OWNER_PASSWORD` in a local file after provisioning does not change an existing Auth password. Password recovery email configuration is not yet verified.

## Current deployment state

Code and the wordmark change are pushed to GitHub on `codex/migrate-supabase`. Supabase tables, access rules, 200 sample entries, Storage assets and owner access are prepared. Local verification passed.

The user assigned the six required environment-variable names to Production and Preview in Vercel and selected the migration branch's Preview redeploy. Successful hosted testing and promotion to production are still unconfirmed. Do not describe the old production domain as migrated until verified.

Firebase data was not imported, at the owner's request. No Firebase resources were deleted or disabled.
