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
    stops: [p.name, p.name, p.name, p.name],
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
    // A trip based in one place names it once.
    const places = [...new Set(stops)];
    const id = `demo-${slug(place.name)}-${slug(style.name)}`;
    const alt = `Travel photograph for ${place.name}`;
    return {
      id,
      slug: id,
      kind: "holiday",
      title: `${place.name}: ${style.name}`,
      location: places.join(" · "),
      country: place.country,
      region: place.region,
      summary: `${style.days} days in ${place.name}, designed around ${style.focus}.`,
      description: `Explore ${places.join(" and ")} on a ${style.days}-day holiday built around ${style.focus}. The route, hotels and experiences are tailored to your dates and your group, and everything is confirmed in your personalised quote.`,
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
            description: `Arrive in ${stops[0]}, check in to your hotel and take a short orientation walk if time permits. Your arrival transfer is timed around your travel schedule.`,
          };
        if (day === style.days - 1)
          return {
            title: `Day ${day + 1}: Departure from ${stops[1]}`,
            description:
              "Breakfast, check-out and your departure transfer. We confirm the departure point, luggage arrangements and connection time before you travel.",
          };
        return {
          title: `Day ${day + 1}: ${stop} — ${day % 2 ? "local discoveries" : "scenery and leisure"}`,
          description: `Time in ${stop} for ${day % 2 ? "a neighbourhood walk, regional food and a locally guided cultural visit" : "a scenic excursion followed by an unhurried afternoon"}. We set the pace around your group. Tickets, guides and transport between stops are confirmed in your quote.`,
        };
      }),
      accommodation: `${style.days - 1} hotel nights in a standard double or twin room, shared by two adults. Hotels and room categories are confirmed in your quote. Family rooms, upgrades and extra beds are quoted separately.`,
      inclusions: [
        `${style.days - 1} hotel nights on twin sharing`,
        "Daily breakfast",
        "Arrival and departure transfers",
        "Itinerary planning and suggested sightseeing",
      ],
      exclusions: [
        "Flights and visas",
        "Travel insurance",
        "Lunch, dinner and personal spending",
        "Optional activity admission and guides unless quoted",
        "Taxes, peak-date supplements and upgrades",
      ],
      amenities: [],
      rooms: [],
      mealPlans: ["Breakfast"],
      vehicles: [],
      price: place.base + style.uplift,
      currency: "INR",
      priceBasis: "per adult, twin sharing",
      priceConditions:
        "Starting price for two adults sharing; flights excluded. Your final price depends on dates, hotels and group size and is confirmed in your quote.",
      seoTitle: `${place.name}: ${style.name}`,
      seoDescription: `${style.days} days in ${place.name}: ${style.focus}. Personalised by PickTheMap.`,
      updatedAt: "2026-11-09T00:00:00.000Z",
    };
  }),
);
