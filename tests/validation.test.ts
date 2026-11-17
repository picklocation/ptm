import { test } from "node:test";
import assert from "node:assert/strict";
import {
  enquirySchema,
  publishErrors,
  uploadResolutionError,
  MIN_UPLOAD_EDGE_PX,
} from "../src/lib/validation";
import { seedContent } from "../src/lib/seed-data";
import { safeCell } from "../src/lib/excel";
import { sectionLabels } from "../src/lib/types";
import {
  fallbackSummary,
  fallbackDescription,
} from "../src/lib/content-fallbacks";
import {
  PRIVACY_TEMPLATE,
  TERMS_TEMPLATE,
  CANCELLATION_TEMPLATE,
} from "../src/lib/legal-templates";
const valid = {
  requestId: "5e1faed7-06a0-4c90-a8e1-b5b713f8343f",
  name: "Test Traveller",
  email: "",
  phone: "+491234567890",
  destination: "Kerala",
  kind: "holiday",
  startDate: "",
  endDate: "",
  flexible: true,
  adults: 2,
  children: 0,
  childAges: "",
  rooms: 1,
  departure: "",
  budget: "",
  currency: "EUR",
  budgetBasis: "total",
  preferences: "",
  vehicle: "",
  mealPlan: "",
  contactMethod: "phone",
  itemId: "",
  method: "submit",
  consent: true,
  website: "",
  startedAt: Date.now() - 5000,
};
test("accepts flexible-date enquiry without demanding unnecessary personal details", () =>
  assert.equal(enquirySchema.safeParse(valid).success, true));
test("rejects invalid dates, empty groups, spam, missing consent and email preference without email", () => {
  for (const change of [
    { startDate: "2027-02-30" },
    { adults: 0 },
    { website: "spam" },
    { consent: false },
    { contactMethod: "email" },
    { startDate: "2027-04-20", endDate: "2027-04-10" },
    { budget: "-200" },
  ])
    assert.equal(
      enquirySchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("requires price basis and conditions when publishing a price", () =>
  assert.ok(
    publishErrors({
      ...seedContent[0],
      currency: "INR",
      price: 100,
      priceBasis: "",
      priceConditions: "",
    }).some((x) => x.includes("basis")),
  ));
test("neutralises spreadsheet formulas in exported visitor input", () => {
  assert.equal(
    safeCell('=HYPERLINK("malicious")'),
    '\'=HYPERLINK("malicious")',
  );
  assert.equal(safeCell("+4912345"), "'+4912345");
  assert.equal(safeCell("Normal text"), "Normal text");
});
test("rejects uploads below the minimum retina-safe resolution", () => {
  assert.match(uploadResolutionError(800, 600) || "", /too small/);
  assert.equal(uploadResolutionError(MIN_UPLOAD_EDGE_PX, 900), null);
  assert.equal(uploadResolutionError(1200, MIN_UPLOAD_EDGE_PX), null);
  assert.equal(uploadResolutionError(MIN_UPLOAD_EDGE_PX - 1, 400), "Image is too small (1599x400px). Upload a photo with its longest side at least 1600px so it stays sharp on large screens.");
});
test("section breadcrumb labels are human-readable, not raw URL slugs", () => {
  for (const label of Object.values(sectionLabels)) {
    assert.doesNotMatch(label, /-/);
    assert.match(label, /^[A-Z]/);
  }
  assert.equal(sectionLabels["road-trip"], "Europe road trips");
  assert.equal(sectionLabels.resort, "Resorts & villas");
});
test("trip-data fallbacks mention the location but invent no specific facts", () => {
  assert.match(fallbackSummary("Vagamon", "holiday"), /Vagamon/);
  assert.match(fallbackDescription("Vagamon", "holiday"), /Vagamon/);
  assert.match(fallbackSummary("Kochi", "resort"), /stay/);
  assert.match(fallbackSummary("Kochi", "holiday"), /journey/);
});
test("legal boilerplate templates are non-empty and flagged as general templates", () => {
  for (const t of [PRIVACY_TEMPLATE, TERMS_TEMPLATE, CANCELLATION_TEMPLATE]) {
    assert.ok(t.length > 200);
    assert.match(t, /general template/);
  }
});
