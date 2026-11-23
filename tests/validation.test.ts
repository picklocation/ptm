import { test } from "node:test";
import assert from "node:assert/strict";
import {
  enquirySchema,
  publishErrors,
  contentSchema,
} from "../src/lib/validation";
import { seedContent } from "../src/lib/seed-data";
import { safeCell } from "../src/lib/excel";
import { sectionLabels } from "../src/lib/types";
const valid = {
  requestId: "5e1faed7-06a0-4c90-a8e1-b5b713f8343f",
  name: "Test Traveller",
  email: "traveller@example.com",
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
test("rejects invalid dates, empty groups, spam, missing consent and missing contact details", () => {
  for (const change of [
    { startDate: "2027-02-30" },
    { adults: 0 },
    { website: "spam" },
    { consent: false },
    { email: "" },
    { email: "not-an-email" },
    { name: "A" },
    { phone: "12" },
    { startDate: "2027-04-20", endDate: "2027-04-10" },
    { budget: "-200" },
  ])
    assert.equal(
      enquirySchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("accepts the short form: only trip basics, name, phone and email", () => {
  const short = {
    requestId: valid.requestId,
    name: "Test Traveller",
    email: "traveller@example.com",
    phone: "+491234567890",
    destination: "Kerala",
    kind: "holiday",
    startDate: "",
    flexible: true,
    adults: 2,
    children: 0,
    itemId: "",
    method: "submit",
    consent: true,
    website: "",
    startedAt: valid.startedAt,
  };
  const parsed = enquirySchema.safeParse(short);
  assert.equal(parsed.success, true);
  // Fields removed from the form are filled with neutral values for storage.
  assert.deepEqual(
    parsed.success && [
      parsed.data.endDate,
      parsed.data.departure,
      parsed.data.budget,
      parsed.data.rooms,
      parsed.data.contactMethod,
    ],
    ["", "", "", 1, "phone"],
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
test("a discount needs an original price above the offer price", () => {
  const base = {
    ...seedContent[0],
    priceBasis: "per person",
    priceConditions: "Twin sharing",
  };
  const errors = (price: number | undefined, originalPrice: number) =>
    publishErrors(contentSchema.parse({ ...base, price, originalPrice }));
  const message = "The original price must be higher than the offer price.";
  assert.ok(!errors(20000, 25000).includes(message));
  assert.ok(errors(20000, 20000).includes(message));
  assert.ok(errors(undefined, 25000).includes(message));
});
test("section breadcrumb labels are human-readable, not raw URL slugs", () => {
  for (const label of Object.values(sectionLabels)) {
    assert.doesNotMatch(label, /-/);
    assert.match(label, /^[A-Z]/);
  }
  assert.equal(sectionLabels["road-trip"], "Europe road trips");
  assert.equal(sectionLabels.resort, "Resorts & villas");
});
