import type { Content } from "./types";
export const photos = {
  hero: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85",
  swiss:
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1000&q=85",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85",
  kerala:
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=85",
  italy:
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=85",
  thailand:
    "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=85",
  singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=85",
  resort:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85",
};
const base: Content = {
  id: "",
  kind: "holiday",
  title: "",
  slug: "",
  location: "",
  region: "",
  summary: "",
  description:
    "A starting point for a holiday shaped around you. This demonstration itinerary illustrates how a personalised trip can be presented. Actual arrangements, accommodation and inclusions require business approval.",
  image: "",
  gallery: [],
  imageAlt: "",
  days: 6,
  nights: 5,
  themes: ["Family", "Couple"],
  featured: true,
  order: 0,
  status: "published",
  demo: true,
  itinerary: [
    {
      title: "Arrive and settle in",
      description:
        "Begin at your preferred arrival point. Arrival arrangements and accommodation will be agreed in your personalised quote.",
    },
    {
      title: "Explore at your own pace",
      description:
        "Choose the places and experiences that interest you. Your travel planner will tailor the route to your group.",
    },
    {
      title: "Make room for something special",
      description:
        "Leave time for a local experience, a scenic stop or a slower day. Activities remain subject to confirmation.",
    },
  ],
  inclusions: ["Arrangements will be specified in your personalised quote."],
  exclusions: ["Anything not explicitly listed in the agreed quote."],
  amenities: [],
  rooms: [],
  mealPlans: [],
  vehicles: [],
  currency: "INR",
  priceBasis: "",
  priceConditions: "",
  seoTitle: "",
  seoDescription: "",
  updatedAt: new Date().toISOString(),
};
const item = (
  id: string,
  title: string,
  location: string,
  region: string,
  image: string,
  extra: Partial<Content> = {},
): Content => ({
  ...base,
  id,
  slug: id,
  title,
  location,
  region,
  image,
  imageAlt: `Scenic inspiration for ${location}`,
  summary: `Discover ${location} with a holiday planned around the way you like to travel.`,
  ...extra,
});
export const seedContent: Content[] = [
  item(
    "bali-slow-days",
    "A little Bali, a lot of beautiful",
    "Ubud · Uluwatu · Seminyak",
    "Southeast Asia",
    photos.bali,
    { order: 1, days: 7, nights: 6 },
  ),
  item(
    "swiss-alpine-escape",
    "Your Swiss alpine escape",
    "Lucerne · Interlaken · Zürich",
    "Europe",
    photos.hero,
    { order: 2, days: 8, nights: 7 },
  ),
  item(
    "kerala-backwater-days",
    "The slower side of Kerala",
    "Munnar · Alleppey · Kochi",
    "India",
    photos.kerala,
    { order: 3, days: 5, nights: 4 },
  ),
  item(
    "thailand-island-time",
    "Find your island time",
    "Phuket · Krabi",
    "Southeast Asia",
    photos.thailand,
    { order: 4 },
  ),
  item(
    "alps-to-italian-lakes",
    "From the Alps to the Italian lakes",
    "Zürich → Lucerne → Lake Como",
    "Europe",
    photos.italy,
    {
      kind: "road-trip",
      order: 5,
      days: 8,
      nights: 7,
      themes: ["Road trip", "Couple"],
      vehicles: [
        {
          name: "Vehicle arranged to suit your group",
          passengers: 4,
          luggage: "Capacity to be confirmed with the operator",
        },
      ],
    },
  ),
  item(
    "switzerland-scenic-loop",
    "The scenic Swiss loop",
    "Zürich → Interlaken → Lucerne",
    "Europe",
    photos.hero,
    { kind: "road-trip", order: 6, days: 7, nights: 6 },
  ),
  item(
    "backwater-retreat",
    "A backwater retreat",
    "Kumarakom, Kerala",
    "India",
    photos.kerala,
    {
      kind: "resort",
      order: 7,
      days: 0,
      nights: 0,
      summary:
        "A demonstration of a peaceful waterside stay. Property details will be added once verified.",
      rooms: ["Room categories to be confirmed"],
      mealPlans: ["Breakfast preference", "Half-board preference"],
      amenities: ["Waterside setting — illustrative"],
    },
  ),
  item(
    "coastal-hideaway",
    "A coastal hideaway",
    "Marari, Kerala",
    "India",
    photos.resort,
    {
      kind: "resort",
      order: 8,
      days: 0,
      nights: 0,
      summary:
        "An illustrative coastal escape. Photography is inspiration, not a verified property.",
      rooms: ["Room categories to be confirmed"],
      mealPlans: ["Breakfast preference"],
    },
  ),
  ...[
    ["bali", "Bali", "Southeast Asia", photos.bali],
    ["switzerland", "Switzerland", "Europe", photos.hero],
    ["kerala", "Kerala", "India", photos.kerala],
    ["thailand", "Thailand", "Southeast Asia", photos.thailand],
    ["italy", "Italy", "Europe", photos.italy],
    ["singapore", "Singapore", "Southeast Asia", photos.singapore],
  ].map(([id, title, region, image], i) =>
    item(id, title, title, region, image, {
      kind: "destination",
      order: 20 + i,
      days: 0,
      nights: 0,
    }),
  ),
];
