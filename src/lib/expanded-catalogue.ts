import { travelPhoto } from "./assets";
import type { Content } from "./types";
import { southIndiaLocations } from "./south-india";

type Place = {
  name: string;
  region: string;
  country: string;
  stops: string[];
  image: string;
  base: number;
};
const image = travelPhoto;
const beach = image("photo-1571896349842-33c89424de2d");
const hills = image("photo-1464822759023-fed622ff2c3b");
const kerala = image("photo-1602216056096-3b40cc0c9944");
export const internationalPlaces: Place[] = [
  {
    name: "Thailand",
    country: "Thailand",
    region: "Southeast Asia",
    stops: ["Bangkok", "Chiang Mai", "Phuket", "Krabi"],
    image: image("photo-1528181304800-259b08848526"),
    base: 42000,
  },
  {
    name: "Indonesia",
    country: "Indonesia",
    region: "Southeast Asia",
    stops: ["Ubud", "Sanur", "Uluwatu", "Seminyak"],
    image: image("photo-1537996194471-e657df975ab4"),
    base: 48000,
  },
  {
    name: "Malaysia",
    country: "Malaysia",
    region: "Southeast Asia",
    stops: ["Kuala Lumpur", "Malacca", "Penang", "Langkawi"],
    image: beach,
    base: 39000,
  },
  {
    name: "Singapore",
    country: "Singapore",
    region: "Southeast Asia",
    stops: ["Marina Bay", "Chinatown", "Sentosa", "Kampong Glam"],
    image: image("photo-1525625293386-3f8f99389edd"),
    base: 56000,
  },
  {
    name: "Sri Lanka",
    country: "Sri Lanka",
    region: "South Asia",
    stops: ["Colombo", "Kandy", "Ella", "Bentota"],
    image: kerala,
    base: 36000,
  },
  {
    name: "Maldives",
    country: "Maldives",
    region: "South Asia",
    stops: ["Malé", "North Malé Atoll", "South Malé Atoll", "Maafushi"],
    image: beach,
    base: 62000,
  },
  {
    name: "Mauritius",
    country: "Mauritius",
    region: "Indian Ocean",
    stops: ["Grand Baie", "Port Louis", "Chamarel", "Flic en Flac"],
    image: beach,
    base: 74000,
  },
  {
    name: "Switzerland",
    country: "Switzerland",
    region: "Europe",
    stops: ["Zürich", "Lucerne", "Interlaken", "Bern"],
    image: hills,
    base: 125000,
  },
  {
    name: "Italy",
    country: "Italy",
    region: "Europe",
    stops: ["Rome", "Florence", "Venice", "Milan"],
    image: image("photo-1516483638261-f4dbaf036963"),
    base: 98000,
  },
  {
    name: "France",
    country: "France",
    region: "Europe",
    stops: ["Paris", "Versailles", "Lyon", "Nice"],
    image: hills,
    base: 105000,
  },
];
export const regionalPlaces: Place[] = [
  { name: "Kerala", stops: ["Kochi", "Munnar", "Thekkady", "Alleppey"] },
  { name: "Kashmir", stops: ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"] },
  {
    name: "Delhi Agra Jaipur",
    stops: ["Delhi", "Agra", "Fatehpur Sikri", "Jaipur"],
  },
  { name: "Goa", stops: ["Panaji", "Old Goa", "Candolim", "Palolem"] },
  { name: "Rajasthan", stops: ["Jaipur", "Jodhpur", "Udaipur", "Pushkar"] },
  {
    name: "Andaman",
    stops: ["Port Blair", "Swaraj Dweep", "Shaheed Dweep", "Port Blair"],
  },
  ...southIndiaLocations.map((p) => ({
    name: p.name,
    stops: [p.name, `${p.name} countryside`, `${p.name} local sights`, p.name],
  })),
].map((p, i) => ({
  ...p,
  country: "India",
  region: "India",
  image: kerala,
  base: 12500 + i * 900,
}));
const styles = [
  {
    name: "Easy escape",
    theme: "Budget",
    days: 4,
    uplift: 0,
    focus: "a relaxed introduction, local neighbourhoods and free time",
  },
  {
    name: "Family discovery",
    theme: "Family",
    days: 6,
    uplift: 9000,
    focus:
      "short sightseeing sessions, rest breaks and family-friendly activity options",
  },
  {
    name: "Couples retreat",
    theme: "Couple",
    days: 5,
    uplift: 15000,
    focus: "slow mornings, scenic walks and time together",
  },
  {
    name: "Culture and landscapes",
    theme: "Culture",
    days: 7,
    uplift: 19000,
    focus: "heritage areas, regional food and scenic excursions",
  },
  {
    name: "The unhurried journey",
    theme: "Personalised",
    days: 8,
    uplift: 26000,
    focus: "longer stays, independent exploring and flexible leisure days",
  },
];
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const expandedCatalogue: Content[] = [
  ...internationalPlaces,
  ...regionalPlaces,
].flatMap((place, placeIndex) =>
  styles.map((style, variant) => {
    // Each route stays within two neighbouring itinerary bases; transport feasibility is reviewed before sale.
    const stops = place.stops.slice(variant % 2, (variant % 2) + 2);
    const id = `demo-${slug(place.name)}-${slug(style.name)}`;
    const alt = `Illustrative travel photograph for ${place.name}; not a verified destination or property image`;
    return {
      id,
      slug: id,
      kind: "holiday",
      title: `${place.name}: ${style.name}`,
      location: stops.join(" · "),
      country: place.country,
      region: place.region,
      summary: `${style.days} days in ${place.name}, designed around ${style.focus}. Sample itinerary with fictional pricing.`,
      description: `DEMONSTRATION PACKAGE — not an available offer. Explore ${stops.join(" and ")} with a suggested ${style.days}-day route. This ${style.theme.toLowerCase()} concept prioritises ${style.focus}. Routes, opening days, transfers, accessibility, accommodation and all activities must be checked by a planner before a real quote. Photographs are illustrative and may show other locations. No bookings or supplier commitments are implied.`,
      image: place.image,
      imageAlt: alt,
      gallery: [place.image],
      galleryAlt: { [place.image]: alt },
      days: style.days,
      nights: style.days - 1,
      themes: [style.theme],
      featured: variant === 0,
      order: 500 + placeIndex * 5 + variant,
      status: "published",
      demo: true,
      itinerary: Array.from({ length: style.days }, (_, day) => {
        const stop = stops[day < Math.ceil(style.days / 2) ? 0 : 1];
        if (day === 0)
          return {
            title: `Day 1: Arrive in ${stops[0]}`,
            description: `Meet at the agreed arrival point, settle into your proposed hotel and take a short orientation walk if time permits. Arrival transfer is a sample inclusion; timing depends on your travel schedule.`,
          };
        if (day === style.days - 1)
          return {
            title: `Day ${day + 1}: Departure from ${stops[1]}`,
            description:
              "Breakfast, check-out and a proposed departure transfer. Your planner will confirm the departure point, luggage arrangements and connection time before booking.",
          };
        return {
          title: `Day ${day + 1}: ${stop} — ${day % 2 ? "local discoveries" : "scenery and leisure"}`,
          description: `Suggested time in ${stop} for ${day % 2 ? "a neighbourhood walk, regional food and a locally guided cultural visit" : "a scenic excursion followed by an unhurried afternoon"}. Tailor the pace for ${style.theme.toLowerCase()} travel. Tickets, guide availability, transport between bases and any access permits require confirmation; no driving times are promised.`,
        };
      }),
      accommodation: `${style.days - 1} sample hotel nights in a standard double/twin room, shared by two adults. Properties and room categories are not contracted. Family room requests, upgrades, accessibility and extra beds are quoted separately.`,
      inclusions: [
        `${style.days - 1} proposed hotel nights on twin sharing`,
        "Daily breakfast as a sample meal plan",
        "Proposed arrival/departure transfers",
        "Itinerary planning and suggested sightseeing; final scope by quote",
      ],
      exclusions: [
        "Flights and visas",
        "Travel insurance",
        "Lunch, dinner and personal spending",
        "Optional activity admission and guides unless quoted",
        "Taxes, peak-date supplements and upgrades require confirmation",
      ],
      amenities: [],
      rooms: [],
      mealPlans: ["Breakfast (sample)"],
      vehicles: [],
      price: place.base + style.uplift,
      currency: "INR",
      priceBasis: "per adult, twin sharing (mock)",
      priceConditions:
        "Fictional display price, not a quote or offer. Assumes two adults; flights excluded. Dates, taxes, supplements and every inclusion require a real quote.",
      seoTitle: `${place.name}: ${style.name} — demo`,
      seoDescription:
        "Demonstration itinerary with fictional prices. Not a bookable offer.",
      updatedAt: "2026-11-09T00:00:00.000Z",
    };
  }),
);
