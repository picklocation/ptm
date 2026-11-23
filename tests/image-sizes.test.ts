import test from "node:test";
import assert from "node:assert/strict";
import {
  fitSize,
  largeRule,
  cardRule,
  smallPhotoNote,
} from "../src/lib/image-sizes";
const large = (w: number, h: number) => fitSize(w, h, largeRule);
const card = (w: number, h: number) => fitSize(w, h, cardRule);
test("ordinary photos are sized as before", () => {
  assert.deepEqual(large(4000, 3000), { width: 1600, height: 1200 });
  assert.deepEqual(large(3000, 4000), { width: 1200, height: 1600 });
  assert.deepEqual(large(4000, 2250), { width: 1600, height: 900 });
  assert.deepEqual(card(4000, 3000), { width: 640, height: 480 });
  assert.deepEqual(card(3000, 4000), { width: 480, height: 640 });
});
test("small photos get a note but are never blocked", () => {
  const note = smallPhotoNote(800, 600, "beach.jpg");
  assert.match(note || "", /small \(800 × 600 px\)/);
  assert.match(note || "", /uploaded anyway/);
  assert.equal(smallPhotoNote(1600, 400, "wide.jpg"), null);
  assert.equal(smallPhotoNote(400, 1600, "tall.jpg"), null);
  assert.equal(smallPhotoNote(4000, 3000, "big.jpg"), null);
  // A browser that could not read the photo gives no size; no note then.
  assert.equal(smallPhotoNote(0, 0, "unknown.jpg"), null);
});
test("small photos are never enlarged", () => {
  assert.deepEqual(large(40, 40), { width: 40, height: 40 });
  assert.deepEqual(card(300, 200), { width: 300, height: 200 });
});
test("very wide and very tall photos keep their shorter side", () => {
  // Before, a 12000 x 500 panorama became 1600 x 67 and looked blurred.
  const wide = large(12000, 500);
  assert.ok(wide.height >= 300 && wide.width <= 8000);
  assert.ok(Math.abs(wide.width / wide.height - 24) < 0.1);
  const tall = large(500, 12000);
  assert.ok(tall.width >= 300 && tall.height <= 8000);
});
test("every output stays within the ceilings and keeps its shape", () => {
  for (const [w, h] of [
    [16000, 300],
    [300, 16000],
    [9000, 9000],
    [100, 5000],
    [5000, 100],
  ] as const) {
    for (const rule of [largeRule, cardRule]) {
      const out = fitSize(w, h, rule);
      assert.ok(Math.max(out.width, out.height) <= rule.maxLong, `${w}x${h}`);
      assert.ok(out.width <= w && out.height <= h, `${w}x${h} not enlarged`);
      assert.ok(
        Math.abs(out.width / out.height - w / h) / (w / h) < 0.05,
        `${w}x${h} shape`,
      );
    }
  }
});
