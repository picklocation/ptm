import test from "node:test";
import assert from "node:assert/strict";
import { seedContent } from "../src/lib/seed-data";
import {
  stayDestinations,
  staysForDestination,
  filterStays,
  stayDestinationKey,
} from "../src/lib/stays";
import { contentSchema, publishErrors } from "../src/lib/validation";
import type { Content } from "../src/lib/types";
const base = {
  ...seedContent.find((x) => x.kind === "resort")!,
  status: "published",
  demo: false,
  propertyVerified: true,
  stayDestinationSlug: "munnar",
  stayTags: ["Couples", "Premium"],
} as Content;
test("stay directory includes sixteen destinations and merges admin overrides without duplicate aliases", () => {
  assert.equal(stayDestinations([]).length, 16);
  const custom = {
    ...base,
    kind: "destination",
    stayDestination: true,
    slug: "bengaluru",
    title: "Bangalore",
    image: "/images/bangalore.jpg",
  } as Content;
  const result = stayDestinations([custom]);
  assert.equal(result.length, 16);
  assert.equal(result.find((x) => x.slug === "bangalore")?.image, custom.image);
  assert.equal(stayDestinationKey("kolukkumalai"), "kulukkumala");
});
test("stay listings require explicit destination, verified non-sample publication", () => {
  const rows = [
    base,
    { ...base, demo: true },
    { ...base, propertyVerified: false },
    { ...base, status: "draft" as const },
    { ...base, stayDestinationSlug: "wayanad" },
    { ...base, stayDestinationSlug: undefined },
  ];
  assert.deepEqual(staysForDestination(rows, "munnar"), [base]);
});
test("stay audience and tier filters combine without inventing categories", () => {
  assert.equal(filterStays([base], "Couples", "Premium").length, 1);
  assert.equal(filterStays([base], "Families", "Premium").length, 0);
  assert.equal(filterStays([base], "Couples", "Budget").length, 0);
  assert.equal(filterStays([base], "", "").length, 1);
});
test("publishing rejects unverified and sample directory properties; new fields survive validation", () => {
  const valid = contentSchema.parse(base);
  assert.equal(valid.stayDestinationSlug, "munnar");
  assert.deepEqual(valid.stayTags, ["Couples", "Premium"]);
  assert.ok(
    publishErrors({ ...valid, propertyVerified: false }).some((s) =>
      s.includes("Verify"),
    ),
  );
  assert.ok(
    publishErrors({ ...valid, demo: true }).some((s) => s.includes("Sample")),
  );
  assert.ok(!publishErrors(valid).some((s) => /Verify|Sample/.test(s)));
});
