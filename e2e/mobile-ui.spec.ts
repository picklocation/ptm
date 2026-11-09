import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/",
  "/holidays",
  "/domestic-trips",
  "/destinations",
  "/plan-my-trip",
  "/contact",
];

test.describe("layout", () => {
  for (const path of pages)
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
});

test.describe("footer", () => {
  test("is compact on phones and expands on tap", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/contact");
    const footer = page.locator("footer");
    const columns = footer.locator("details.footer-col");
    await expect(columns).toHaveCount(3);
    if (isMobile) {
      await expect(columns.first()).not.toHaveAttribute("open", "");
      expect((await footer.boundingBox())!.height).toBeLessThan(450);
      await columns.first().locator("summary").click();
      await expect(
        footer.getByRole("link", { name: "Domestic trips" }),
      ).toBeVisible();
    } else {
      await expect(
        footer.getByRole("link", { name: "Domestic trips" }),
      ).toBeVisible();
    }
  });
  test("keeps every legal and contact route reachable", async ({ page }) => {
    await page.goto("/contact");
    const footer = page.locator("footer");
    for (const name of ["Privacy", "Terms", "Cancellation"])
      await expect(footer.getByRole("link", { name })).toBeVisible();
  });
});

test.describe("home page", () => {
  test("has no duplicated service cards and keeps collection links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".service-grid")).toHaveCount(0);
    for (const name of [
      "International trips",
      "Domestic trips",
      "Resorts & villas",
      "Europe road trips",
    ])
      await expect(
        page.locator(".collection-links").getByRole("link", { name }),
      ).toBeVisible();
  });
  test("hero search routes to the catalogue", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Destination").first().fill("Kerala");
    await page.getByRole("button", { name: "Explore trips" }).click();
    await expect(page).toHaveURL(/\/holidays\?.*q=Kerala/);
  });
});

test.describe("catalogue", () => {
  test("search narrows results", async ({ page }) => {
    await page.goto("/holidays");
    const count = page.locator(".result-count");
    await expect(count).toContainText("to explore");
    await page
      .getByLabel("Search destinations or trips")
      .fill("zzzz-no-such-place");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByText("A different adventure awaits.")).toBeVisible();
  });
});

test.describe("enquiry form", () => {
  test("suggests places and departure cities", async ({ page }) => {
    await page.goto("/plan-my-trip");
    expect(await page.locator("#place-options option").count()).toBeGreaterThan(
      5,
    );
    expect(await page.locator("#city-options option").count()).toBeGreaterThan(
      5,
    );
    await expect(
      page.getByLabel("Where would you like to go?"),
    ).toHaveAttribute("list", "place-options");
    await expect(page.getByLabel(/Departure city/)).toHaveAttribute(
      "list",
      "city-options",
    );
  });
  test("validates the first step", async ({ page }) => {
    await page.goto("/plan-my-trip");
    await page.getByLabel("Where would you like to go?").fill("");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator(".error-box")).toContainText(
      "check your trip details",
    );
  });
  test("walks all three steps with full-width actions on phones", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/plan-my-trip?destination=Switzerland");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByRole("heading", { name: "Make it feel like you." }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByRole("heading", { name: /little hello/ }),
    ).toBeVisible();
    await expect(page.locator(".review-list")).toContainText("Switzerland");
    const submit = page.getByRole("button", { name: "Submit enquiry" });
    const whatsapp = page.getByRole("button", { name: /continue on WhatsApp/ });
    await expect(submit).toBeVisible();
    await expect(whatsapp).toBeVisible();
    const [a, b, form] = await Promise.all([
      submit.boundingBox(),
      whatsapp.boundingBox(),
      page.locator(".enquiry-form").boundingBox(),
    ]);
    if (isMobile) {
      expect(a!.width).toBeGreaterThan(form!.width * 0.8);
      expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1); // stacked, not side by side
    }
    // Back returns to step 2 without losing the destination.
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByLabel("Where would you like to go?")).toHaveValue(
      "Switzerland",
    );
  });
  test("requires consent before sending", async ({ page }) => {
    await page.goto("/plan-my-trip?destination=Bali");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Your name").fill("Test Traveller");
    await page
      .getByLabel("Phone / WhatsApp with country code")
      .fill("+919876543210");
    await page.getByRole("button", { name: "Submit enquiry" }).click();
    await expect(page.locator(".error-box")).toBeVisible();
    await expect(
      page.getByText("Please confirm before sending your enquiry."),
    ).toBeVisible();
  });
});

test.describe("accessibility", () => {
  for (const path of ["/", "/plan-my-trip"])
    test(`no critical axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const bad = results.violations.filter((v) => v.impact === "critical");
      expect(bad.map((v) => v.id)).toEqual([]);
    });
});
