# PickTheMap project instructions

Read `AGENTS.md` and `docs/AI-HANDOVER.md` before making changes. The handover records the owner's design decisions, architecture, workflows and deployment pitfalls. Read `docs/DESIGN.md` for visual constraints and the relevant technical document for the task.

Treat the owner's latest explicit request as the priority. Preserve established design and working behaviour outside the requested scope. Inspect the actual repository and current Git state rather than assuming this handover proves what is deployed.

For Next.js changes, read the relevant installed guide in `node_modules/next/dist/docs/` first. Never print, commit or upload private environment files, service-account JSON, passwords or server keys. Do not run destructive database operations or replace existing data to fix an empty UI.

Use small, reviewable changes and relevant checks. Report what changed, what was tested, the commit/branch, and whether it is only pushed, Preview-ready or verified live. Never equate a Git push with a Production deployment.
