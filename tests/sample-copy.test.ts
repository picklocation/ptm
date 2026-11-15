import test from "node:test";
import assert from "node:assert/strict";
import { seedContent } from "../src/lib/seed-data";
import { withCleanCopy, hasSampleWording } from "../src/lib/sample-copy";
import { discoverEurope } from "../src/lib/europe-drives";
const fresh = seedContent.find((c) => c.id === "demo-wayanad-easy-escape")!;
// How this record read before the clean-up.
const old = {
  ...fresh,
  location: "Wayanad · Wayanad countryside",
  summary:
    "4 days in Wayanad, designed around a relaxed introduction, local neighbourhoods and free time. Sample itinerary with fictional pricing.",
  description:
    "DEMONSTRATION PACKAGE — not an available offer. Explore Wayanad and Wayanad countryside with a suggested 4-day route.",
  priceBasis: "per adult, twin sharing (mock)",
  priceConditions: "Fictional display price, not a quote or offer.",
  seoTitle: "Wayanad: Easy escape — demo",
  inclusions: [
    "3 proposed hotel nights",
    "Daily breakfast as a sample meal plan",
  ],
  itinerary: fresh.itinerary.map((d, i) =>
    i === 1
      ? {
          title: "Day 2: Wayanad countryside — local discoveries",
          description: "Suggested time; no driving times are promised.",
        }
      : d,
  ),
};
test("no visible package still carries sample wording", () => {
  const left = seedContent.filter(hasSampleWording).map((c) => c.id);
  assert.deepEqual(left, []);
  for (const c of seedContent.filter((c) => c.kind !== "resort"))
    assert.doesNotMatch(
      JSON.stringify([c.summary, c.description, c.itinerary, c.location]),
      /DEMONSTRATION|Explore Explore|Arrive in Arrive|local sights/,
      c.id,
    );
});
test("old wording is replaced and the price is untouched", () => {
  assert.ok(hasSampleWording(old));
  const cleaned = withCleanCopy(old, fresh);
  assert.deepEqual(cleaned, fresh);
  assert.equal(cleaned.price, old.price);
  assert.equal(withCleanCopy(fresh, fresh), fresh);
});
test("text the owner rewrote is kept", () => {
  const edited = {
    ...old,
    description: "Our own Wayanad escape, written by us.",
  };
  const cleaned = withCleanCopy(edited, fresh);
  assert.equal(cleaned.description, "Our own Wayanad escape, written by us.");
  assert.equal(cleaned.summary, fresh.summary);
});
test("real packages and sample stays are never rewritten", () => {
  assert.equal(withCleanCopy(discoverEurope, discoverEurope), discoverEurope);
  const stay = seedContent.find((c) => c.kind === "resort")!;
  assert.equal(withCleanCopy(stay, { ...stay, summary: "x" }), stay);
});
