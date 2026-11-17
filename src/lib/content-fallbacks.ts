import type { Kind } from "./types";
// Deliberately vague: we have no verified facts about a given location, so
// these only reference its name, never invent specific attractions or claims.
const journeyWord = (kind: Kind) => (kind === "resort" ? "stay" : "journey");
export function fallbackSummary(location: string, kind: Kind) {
  return `A ${journeyWord(kind)} in ${location}, shaped around your pace. Full details in your quote.`;
}
export function fallbackDescription(location: string, kind: Kind) {
  return `${location} is the backdrop for this ${journeyWord(kind)}. The exact plan comes together around your dates and preferences — share them to receive full details in your personalised quote.`;
}
export const FALLBACK_ITINERARY_NOTE =
  "Your day-by-day plan isn't set yet. Share your travel dates and preferences and we'll shape an itinerary around them.";
export const FALLBACK_INCLUSIONS = [
  "Inclusions will be confirmed in your personalised quote.",
];
export const FALLBACK_EXCLUSIONS = [
  "Exclusions will be confirmed in your personalised quote.",
];
