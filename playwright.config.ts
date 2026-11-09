import { defineConfig, devices } from "@playwright/test";
const port = 3100;
// Mobile first: the phone project is the default; desktop is the extra check.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "on-first-retry" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"] } },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `npm run seed && npx next dev --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      DATA_BACKEND: "local",
      SITE_URL: `http://127.0.0.1:${port}`,
      ENABLE_DEMO_CONTENT: "true",
      SESSION_SECRET: "e2e-session-secret-e2e-session-secret",
      LOCAL_ADMIN_EMAIL: "owner@pickthemap.local",
      LOCAL_ADMIN_PASSWORD: "e2e-local-password-123",
    },
  },
});
