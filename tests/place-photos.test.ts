import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  placePhotos,
  placePhotoFor,
  placePhotoUrl,
  withPlacePhoto,
  isReplaceablePhoto,
} from "../src/lib/place-photos";
import { seedContent } from "../src/lib/seed-data";
import { publicAsset } from "../src/lib/assets";
const pick = (location: string, country = "", title = "") =>
  placePhotoFor({ location, country, title })?.key;
test("every registered place photo exists and has a description", () => {
  for (const photo of placePhotos) {
    assert.ok(existsSync("public" + placePhotoUrl(photo)), photo.key);
    assert.ok(photo.alt.length > 10, photo.key);
    if (photo.source === "Wikimedia Commons")
      assert.ok(photo.author && photo.licence && photo.page, photo.key);
  }
  assert.equal(new Set(placePhotos.map((p) => p.key)).size, placePhotos.length);
});
test("the first stop of a route decides the photo", () => {
  assert.equal(pick("Delhi · Agra", "India"), "delhi");
  assert.equal(pick("Agra · Fatehpur Sikri", "India"), "agra");
  assert.equal(pick("Zürich → Interlaken → Lucerne"), "zurich");
  assert.equal(pick("Kuala Lumpur · Malacca", "Malaysia"), "kuala-lumpur");
  assert.equal(pick("Somewhere unknown", "Thailand"), "chiang-mai");
});
test("a place without a checked photo is left alone", () => {
  assert.equal(pick("Atlantis", "Nowhere"), undefined);
  const record = { ...seedContent[0], location: "Atlantis", country: "" };
  record.title = "Lost city";
  assert.equal(withPlacePhoto(record), record);
});
test("uploaded photos are never replaced", () => {
  const upload = publicAsset(
    "content/x/0f8fad5b-d9cb-469f-a165-70867728950e-1600.webp",
  );
  assert.equal(isReplaceablePhoto(upload), false);
  const record = {
    ...seedContent[0],
    location: "Paris",
    image: upload,
    gallery: [upload],
    galleryAlt: { [upload]: "Own photo" },
  };
  assert.equal(withPlacePhoto(record), record);
  const stock = publicAsset("catalogue/photo-1602216056096-3b40cc0c9944.jpg");
  const swapped = withPlacePhoto({ ...record, image: stock, gallery: [stock] });
  assert.equal(swapped.image, "/images/places/paris.webp");
  assert.deepEqual(swapped.gallery, ["/images/places/paris.webp"]);
  assert.match(swapped.imageAlt, /Paris/);
});
