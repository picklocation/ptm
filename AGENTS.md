<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Test-driven development (required)

Use the `superpowers:test-driven-development` skill for every feature, bug fix and behaviour change. Invoke it before writing implementation code.

- **Red → Green → Refactor.** Write a failing test first and run it to see it fail for the right reason. Write the minimum code to pass, then refactor with the tests green.
- **Bug fixes start with a regression test** that reproduces the bug.
- **Pick the right layer:**
  - Pure logic (validation, catalogue filtering, error handling) → unit tests in `tests/*.test.ts` (`npm test`, runs with `tsx --test`).
  - UI, layout, forms and navigation → Playwright specs in `e2e/*.spec.ts` (`npm run test:e2e`). First run: `npx playwright install chromium`. The config starts its own local-mode server on port 3100 with seeded demo data.
- Never weaken, skip or delete a test to make it pass. Fix the code, or change the test only when the requirement itself changed.
- Before finishing: `npm run typecheck`, `npm test` and `npm run test:e2e` must all pass. Report any failure honestly.
- Keep Playwright selectors user-facing (role, label, text). Avoid `waitForTimeout` unless a server-side delay must be respected.

## Mobile first (required)

Most visitors use phones. Design, build and test for a ~375px viewport first, then enhance for larger screens.

- **CSS:** write the base styles for mobile and add `@media (min-width: …)` rules to enlarge. Do not start from desktop and patch with `max-width` overrides.
- **Layout:** single column by default, no horizontal scroll at 320–430px, and stack primary actions full-width.
- **Touch:** tap targets are at least 44×44px. Form inputs use `font-size: 16px` or larger (prevents iOS zoom). Use the right `inputMode`, `type` and `autoComplete` for each field.
- **Keep it simple:** one clear action per screen region. Do not repeat the same links or content in several places. Collapse secondary content (e.g. footer columns) on phones, and never remove functionality to simplify.
- **Verification:** every UI change needs a Playwright test that runs in the `mobile` project (Pixel 5). The `desktop` project is the secondary check. Both projects run by default.
- Do not add a UI change that has only been checked at desktop width.
