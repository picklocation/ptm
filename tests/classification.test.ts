import test from "node:test";
import assert from "node:assert/strict";
import { assignedCollections, inCollection } from "../src/lib/classification";
import { seedContent } from "../src/lib/seed-data";
import { contentSchema } from "../src/lib/validation";
test("Kerala camping can be assigned to several collections without changing its template", () => {
  const c = contentSchema.parse({
    ...seedContent[0],
    kind: "resort",
    country: "India",
    state: "Kerala",
    locations: ["Munnar", "Vattavada"],
    packageType: "Camping",
    collections: [
      "domestic-trips",
      "kerala-resorts",
      "resorts-and-villas",
      "south-india",
    ],
  });
  assert.ok(inCollection(c, "kerala-resorts"));
  assert.ok(inCollection(c, "south-india"));
  assert.equal(inCollection(c, "international-trips"), false);
});
test("European holiday and road trip have independent assignments", () => {
  const c = {
    ...seedContent[0],
    country: "Switzerland",
    region: "Europe",
    collections: ["international-trips"] as const,
  };
  assert.equal(
    inCollection(
      { ...c, collections: [...c.collections] },
      "europe-road-trips",
    ),
    false,
  );
  assert.ok(
    inCollection(
      { ...c, collections: ["international-trips", "europe-road-trips"] },
      "europe-road-trips",
    ),
  );
});
test("Explicit empty collection list does not fall back to suggestions", () => {
  assert.deepEqual(
    assignedCollections({ ...seedContent[0], collections: [] }),
    [],
  );
});
test("Legacy Kerala stays get suitable suggestions and invalid sections are rejected", () => {
  const c = {
    ...seedContent[0],
    kind: "resort" as const,
    country: "India",
    region: "India",
    location: "Munnar",
    collections: undefined,
  };
  assert.ok(inCollection(c, "kerala-resorts"));
  assert.ok(inCollection(c, "resorts-and-villas"));
  assert.equal(
    contentSchema.safeParse({ ...c, collections: ["secret-admin"] }).success,
    false,
  );
});
