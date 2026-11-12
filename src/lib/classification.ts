import type { Content } from "./types";
export const packageTypes = [
  "Custom holiday",
  "Resort stay",
  "Villa stay",
  "Camping",
  "Glamping",
  "Houseboat",
  "Cab road trip",
  "Self-drive road trip",
  "City break",
  "Beach holiday",
  "Adventure",
  "Honeymoon",
  "Group tour",
] as const;
export const collectionOptions = [
  ["international-trips", "International trips"],
  ["domestic-trips", "Domestic trips"],
  ["resorts-and-villas", "Resorts & Stays"],
  ["kerala-resorts", "Kerala stays & camping"],
  ["europe-road-trips", "Europe road trips"],
  ["south-india", "South India"],
] as const;
export type Collection = (typeof collectionOptions)[number][0];
export function inferredCollections(c: Content): Collection[] {
  const india =
    c.country?.trim().toLowerCase() === "india" || c.region === "India";
  const locations = [c.location, c.state, ...(c.locations || [])]
    .join(" ")
    .toLowerCase();
  const kerala =
    c.state?.toLowerCase() === "kerala" ||
    /kerala|wayanad|munnar|vagamon|vagomon|vattavada|varkala|kochi|calicut|alleppey|kolukkumalai/.test(
      locations,
    );
  return [
    ...(c.kind !== "destination"
      ? [india ? "domestic-trips" : "international-trips"]
      : []),
    ...(c.kind === "resort"
      ? ["resorts-and-villas", ...(kerala ? ["kerala-resorts"] : [])]
      : []),
    ...(c.kind === "road-trip" ? ["europe-road-trips"] : []),
    ...(india &&
    (kerala || /tamil nadu|karnataka|ooty|kodaikanal/.test(locations))
      ? ["south-india"]
      : []),
  ] as Collection[];
}
export function assignedCollections(c: Content): Collection[] {
  return c.collections ?? inferredCollections(c);
}
export function inCollection(c: Content, section: string) {
  return assignedCollections(c).includes(section as Collection);
}
