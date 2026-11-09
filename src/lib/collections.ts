import type { Content } from "./types";
export const isBeachTrip = (item: Content) =>
  item.kind === "holiday" &&
  (item.themes.some((theme) => /^(beach|island)$/i.test(theme)) ||
    /\b(bali|phuket|krabi|goa|andaman|maldives|langkawi|coast|beach)\b/i.test(
      `${item.title} ${item.location} ${item.country || ""}`,
    ));
export const isDomesticOrNeighbour = (item: Content) =>
  item.kind === "holiday" &&
  (item.region === "India" || item.region === "South Asia");
