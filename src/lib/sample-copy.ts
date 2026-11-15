import type { Content } from "./types";

// Wording left over from the original sample catalogue: demonstration
// notices, "fictional"/"mock" price notes, and text-generation slips such as
// repeated words or made-up "countryside" stops.
const staleWords =
  /demonstration|\bsample\b|fictional|illustrat|\(mock\)|— demo\b|not a verified|explore explore|arrive in arrive|at your own pace at your|local sights|business approval|not contracted|supplier commitments|no driving times are promised/i;
// "Wayanad countryside" was an invented stop; ordinary "scenic countryside"
// is fine, so this check needs the capitalised place name before it.
const inventedStop = /[A-Z][a-z]+ countryside\b/;
const isStale = (text: unknown) =>
  typeof text === "string" &&
  (staleWords.test(text) || inventedStop.test(text));

const textFields = [
  "summary",
  "description",
  "accommodation",
  "location",
  "priceBasis",
  "priceConditions",
  "seoTitle",
  "seoDescription",
  "imageAlt",
] as const;
const listFields = ["inclusions", "exclusions", "mealPlans"] as const;

// Returns `record` with leftover sample wording replaced by the clean text
// in `fresh` (the current built-in version of the same record). A field the
// owner has rewritten is left exactly as it is. Stays are skipped: the sample
// stays describe properties that do not exist and remain hidden from visitors.
export function withCleanCopy<T extends Content>(record: T, fresh: Content): T {
  // Real packages are written by hand and are never touched.
  if (record.kind === "resort" || !record.demo) return record;
  const next: Content = { ...record };
  for (const key of textFields)
    if (isStale(record[key]) && typeof fresh[key] === "string")
      (next[key] as string) = fresh[key] as string;
  for (const key of listFields)
    if (record[key].some(isStale)) next[key] = fresh[key];
  if (
    record.itinerary.some((d) => isStale(d.title) || isStale(d.description)) &&
    fresh.itinerary.length
  )
    next.itinerary = fresh.itinerary;
  if (record.galleryAlt && Object.values(record.galleryAlt).some(isStale))
    next.galleryAlt = Object.fromEntries(
      Object.entries(record.galleryAlt).map(([url, alt]) => [
        url,
        isStale(alt) ? next.imageAlt : alt,
      ]),
    );
  return JSON.stringify(next) === JSON.stringify(record) ? record : (next as T);
}
export const hasSampleWording = (record: Content) =>
  record.kind !== "resort" &&
  record.demo &&
  ([
    ...textFields.map((k) => record[k]),
    ...listFields.flatMap((k) => record[k]),
  ].some(isStale) ||
    record.itinerary.some((d) => isStale(d.title) || isStale(d.description)));
