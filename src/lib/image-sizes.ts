// How uploaded photos are sized. There is no limit on the shape or size of the
// original: every photo is stored once in a "large" and a "card" version, and
// the website always shows it inside a container of fixed size with
// object-fit: cover, so the container never changes and the photo is never
// stretched.
export type SizeRule = {
  /** Normal photos are scaled so their longer side is this many pixels. */
  long: number;
  /** Very wide or tall photos keep at least this much on their shorter side. */
  short: number;
  /** Hard ceiling on the longer side, so storage stays small. */
  maxLong: number;
};
export const largeRule: SizeRule = { long: 1600, short: 640, maxLong: 8000 };
export const cardRule: SizeRule = { long: 640, short: 400, maxLong: 3000 };

// Photos shorter than this on their longest side can look soft in large
// banners. This only ever produces a note for the person uploading; it never
// blocks an upload.
export const SHARP_EDGE_PX = 1600;
export function smallPhotoNote(width: number, height: number, name: string) {
  if (!width || !height || Math.max(width, height) >= SHARP_EDGE_PX)
    return null;
  return `“${name}” is small (${width} × ${height} px) and may look soft in large banners. It was uploaded anyway; a photo at least ${SHARP_EDGE_PX} px wide looks sharper.`;
}

// Output size for an image of `width` x `height`. Never enlarges the original.
// A 4:3 photo comes out 1600 x 1200 (large) and 640 x 480 (card), as before.
// A 12000 x 500 panorama keeps its height instead of shrinking to 1600 x 67,
// so a cover crop of it in a card or banner stays sharp.
export function fitSize(width: number, height: number, rule: SizeRule) {
  const longEdge = Math.max(width, height);
  const shortEdge = Math.min(width, height);
  const cap = Math.min(1, rule.maxLong / longEdge);
  const wanted = Math.max(rule.long / longEdge, rule.short / shortEdge);
  const scale = Math.min(cap, wanted);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
