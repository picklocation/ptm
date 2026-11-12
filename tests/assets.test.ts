import test from "node:test";
import assert from "node:assert/strict";
import {
  publicAsset,
  imageVariant,
  skipOptimizer,
  isManagedUpload,
  managedObjectPaths,
} from "../src/lib/assets";
const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
const upload = publicAsset(`content/stay-1/${id}-1600.webp`);
test("uploaded photos resolve to card and large sizes", () => {
  assert.ok(isManagedUpload(upload));
  assert.equal(imageVariant(upload, "large"), upload);
  assert.equal(
    imageVariant(upload, "card"),
    publicAsset(`content/stay-1/${id}-640.webp`),
  );
  assert.deepEqual(managedObjectPaths(upload), [
    `content/stay-1/${id}-1600.webp`,
    `content/stay-1/${id}-640.webp`,
  ]);
  assert.ok(skipOptimizer(upload));
});
test("seed photos and legacy uploads are left unchanged", () => {
  const seed = publicAsset("catalogue/photo-1.jpg");
  assert.equal(imageVariant(seed, "card"), seed);
  assert.equal(skipOptimizer(seed), false);
  assert.deepEqual(managedObjectPaths(seed), []);
  assert.equal(imageVariant(`/api/media/${id}`, "card"), `/api/media/${id}`);
  assert.ok(skipOptimizer(`/api/media/${id}`));
});
