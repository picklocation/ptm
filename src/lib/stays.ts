import type { Content } from "./types";
import { travelPhoto } from "./assets";

export const stayTags = [
  "Couples",
  "Families",
  "Budget",
  "Premium",
  "Luxury",
] as const;
export const stayPlaces = [
  ["wayanad", "Wayanad"],
  ["munnar", "Munnar"],
  ["vagamon", "Vagamon"],
  ["ooty", "Ooty"],
  ["kodaikanal", "Kodaikanal"],
  ["kulukkumala", "Kulukkumala"],
  ["kakkadampoyil", "Kakkadampoyil"],
  ["vattavada", "Vattavada"],
  ["bangalore", "Bangalore"],
  ["varkala", "Varkala"],
  ["thekkady", "Thekkady"],
  ["kochi", "Kochi"],
  ["calicut", "Calicut"],
  ["goa", "Goa"],
  ["alleppey", "Alleppey"],
  ["coorg", "Coorg"],
] as const;
export const stayDestinationKey = (slug: string) =>
  ({
    kolukkumalai: "kulukkumala",
    kolukkumallai: "kulukkumala",
    vagomon: "vagamon",
    bengaluru: "bangalore",
    kozhikode: "calicut",
    alappuzha: "alleppey",
    kodagu: "coorg",
  })[slug.toLowerCase()] || slug.toLowerCase();
export type StayDestination = {
  slug: string;
  name: string;
  image: string;
  alt: string;
};
export function stayDestinations(items: Content[]): StayDestination[] {
  const custom = items.filter(
    (x) =>
      x.kind === "destination" && x.stayDestination && x.status === "published",
  );
  const output: StayDestination[] = stayPlaces.map(([slug, name]) => {
    const record =
      custom.find((x) => stayDestinationKey(x.slug) === slug) ||
      items.find(
        (x) => x.kind === "destination" && stayDestinationKey(x.slug) === slug,
      );
    return {
      slug,
      name: record?.stayDestination ? record.title : name,
      image: record?.image || travelPhoto("photo-1602216056096-3b40cc0c9944"),
      alt: record?.imageAlt || "Green landscape used as travel inspiration",
    };
  });
  for (const c of custom) {
    const slug = stayDestinationKey(c.slug);
    if (!output.some((x) => x.slug === slug))
      output.push({ slug, name: c.title, image: c.image, alt: c.imageAlt });
  }
  return output;
}
export function isVerifiedStay(item: Content) {
  return (
    item.kind === "resort" &&
    item.status === "published" &&
    !item.demo &&
    item.propertyVerified === true
  );
}
export function staysForDestination(items: Content[], slug: string) {
  return items.filter(
    (x) =>
      isVerifiedStay(x) &&
      x.stayDestinationSlug &&
      stayDestinationKey(x.stayDestinationSlug) === stayDestinationKey(slug),
  );
}
export function filterStays(items: Content[], audience: string, tier: string) {
  return items.filter(
    (x) =>
      (!audience ||
        x.stayTags?.includes(audience as (typeof stayTags)[number])) &&
      (!tier || x.stayTags?.includes(tier as (typeof stayTags)[number])),
  );
}
