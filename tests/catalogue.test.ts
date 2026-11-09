import test from "node:test";
import assert from "node:assert/strict";
import {
  expandedCatalogue,
  internationalPlaces,
  regionalPlaces,
} from "../src/lib/expanded-catalogue";
import { seedContent } from "../src/lib/seed-data";
import { contentSchema, publishErrors } from "../src/lib/validation";
test("expanded catalogue has five complete fictional itineraries for each requested market", () => {
  assert.equal(internationalPlaces.length, 10);
  assert.equal(regionalPlaces.length, 16);
  assert.equal(expandedCatalogue.length, 130);
  for (const place of [...internationalPlaces, ...regionalPlaces]) {
    const records = expandedCatalogue.filter((c) =>
      c.title.startsWith(`${place.name}:`),
    );
    assert.equal(records.length, 5, place.name);
    for (const c of records) {
      assert.equal(c.itinerary.length, c.days);
      assert.equal(c.nights, c.days - 1);
      assert.ok(c.price && c.price > 0);
      assert.match(c.priceConditions, /Fictional/);
      assert.equal(c.demo, true);
      assert.ok(c.accommodation && c.inclusions.length && c.exclusions.length);
    }
  }
});
test("all seed IDs and routes are unique and valid for publication", () => {
  assert.equal(new Set(seedContent.map((c) => c.id)).size, seedContent.length);
  assert.equal(
    new Set(seedContent.map((c) => `${c.kind}/${c.slug}`)).size,
    seedContent.length,
  );
  for (const c of seedContent) {
    assert.ok(contentSchema.safeParse(c).success, c.id);
    assert.deepEqual(publishErrors(contentSchema.parse(c)), [], c.id);
    assert.equal(c.demo, true);
  }
});
