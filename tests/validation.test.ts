import { test } from "node:test";
import assert from "node:assert/strict";
import { enquirySchema, publishErrors } from "../src/lib/validation";
import { seedContent } from "../src/lib/seed-data";
import { safeCell } from "../src/lib/excel";
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
    publishErrors({ ...seedContent[0], currency: "INR", price: 100 }).some(
      (x) => x.includes("basis"),
    ),
  ));
test("neutralises spreadsheet formulas in exported visitor input", () => {
  assert.equal(
    safeCell('=HYPERLINK("malicious")'),
    '\'=HYPERLINK("malicious")',
  );
  assert.equal(safeCell("+4912345"), "'+4912345");
  assert.equal(safeCell("Normal text"), "Normal text");
});
