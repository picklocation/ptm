import test from "node:test";
import assert from "node:assert/strict";
import {
  discoverEurope,
  euroDrive,
  europeDrives,
} from "../src/lib/europe-drives";
import { seedContent } from "../src/lib/seed-data";
import { contentSchema, publishErrors } from "../src/lib/validation";
import { project, mapSize } from "../src/lib/europe-map";
test("there are exactly two Europe driving packages, both publishable", () => {
  const roads = seedContent.filter((c) => c.kind === "road-trip");
  assert.deepEqual(roads.map((c) => c.title).sort(), [
    "DISCOVER Europe",
    "Euro Drive",
  ]);
  for (const c of europeDrives)
    assert.deepEqual(publishErrors(contentSchema.parse(c)), [], c.id);
});
test("automatic photo matching leaves the curated packages alone", () => {
  const seeded = seedContent.find((c) => c.id === "euro-drive")!;
  assert.equal(seeded.image, euroDrive.image);
  assert.ok(euroDrive.image.endsWith("/lauterbrunnen.webp"));
  assert.ok((euroDrive.highlights?.length || 0) >= 9);
  assert.equal(discoverEurope.highlights?.length, 6);
});
test("brochure facts are preserved", () => {
  assert.deepEqual(
    [
      discoverEurope.days,
      discoverEurope.nights,
      discoverEurope.price,
      discoverEurope.currency,
    ],
    [7, 6, 5999, "AED"],
  );
  assert.equal(discoverEurope.countries?.length, 5);
  assert.ok(discoverEurope.inclusions.includes("Rental car"));
  for (const c of europeDrives) assert.equal(c.priceBasis, "per person");
  assert.deepEqual(
    [euroDrive.days, euroDrive.nights, euroDrive.price, euroDrive.currency],
    [11, 10, 193000, "INR"],
  );
  assert.equal(euroDrive.countries?.length, 9);
  assert.equal(euroDrive.title, "Euro Drive");
  assert.ok(
    !JSON.stringify(euroDrive).match(/\bzon\b|zonholidays|elegant europe/i),
  );
});
test("itineraries match the trip length and overnight sequence", () => {
  for (const c of europeDrives) {
    assert.equal(c.itinerary.length, c.days, c.id);
    assert.equal(c.itinerary.filter((d) => d.overnight).length, c.nights, c.id);
    // Every route stop falls inside the drawn map.
    for (const s of c.routeStops || []) {
      const { x, y } = project(s.lat, s.lng);
      assert.ok(
        x > 0 && x < mapSize.width && y > 0 && y < mapSize.height,
        s.name,
      );
    }
  }
  assert.deepEqual(
    euroDrive.itinerary.flatMap((d) => d.overnight || []),
    [
      "Paris",
      "Paris",
      "Brussels",
      "Amsterdam",
      "Luxembourg City",
      "Munich",
      "Seiser Alm",
      "Zurich",
      "Interlaken",
      "Paris",
    ],
  );
});
