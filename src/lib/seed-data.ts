import { withPlacePhoto } from "./place-photos";
import { europeDrives } from "./europe-drives";
import { travelPhoto } from "./assets";
import { southIndiaLocations } from "./south-india";
import { expandedCatalogue } from "./expanded-catalogue";
import type { Content } from "./types";
export const photos = {
  hero: travelPhoto("photo-1464822759023-fed622ff2c3b"),
  swiss: travelPhoto("photo-1531366936337-7c912a4589a7"),
  bali: travelPhoto("photo-1537996194471-e657df975ab4"),
  kerala: travelPhoto("photo-1602216056096-3b40cc0c9944"),
  italy: travelPhoto("photo-1516483638261-f4dbaf036963"),
  thailand: travelPhoto("photo-1528181304800-259b08848526"),
  singapore: travelPhoto("photo-1525625293386-3f8f99389edd"),
  resort: travelPhoto("photo-1571896349842-33c89424de2d"),
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
    "A starting point for a holiday shaped around you. Tell us your dates, your group and what you enjoy, and we’ll plan the route, stays and experiences with you. Everything is confirmed in your personalised quote.",
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
  ...expandedCatalogue,
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

// Development-only sample catalogue. All property details remain illustrative.
const sampleRoutes = [
  [
    "kashmir-valley",
    "Kashmir lakes & mountain air",
    "India",
    "India",
    "Srinagar|Srinagar gardens|Gulmarg|Pahalgam|Pahalgam valley|Srinagar departure",
    "hero",
  ],
  [
    "golden-triangle",
    "Delhi, Agra & Jaipur",
    "India",
    "India",
    "Delhi|Old and New Delhi|Agra|Fatehpur Sikri and Jaipur|Jaipur forts|Jaipur departure",
    "india",
  ],
  [
    "rajasthan-royal-trail",
    "Rajasthan: the royal trail",
    "India",
    "India",
    "Jaipur|Jaipur palaces|Jodhpur|Jodhpur old town|Udaipur|Udaipur lakes|Departure",
    "india",
  ],
  [
    "goa-coastal-break",
    "Goa at your own pace",
    "India",
    "India",
    "North Goa|Beach day|Old Goa and Panjim|South Goa|Departure",
    "resort",
  ],
  [
    "andaman-island-days",
    "Andaman island days",
    "India",
    "India",
    "Port Blair|Havelock Island|Havelock beach day|Neil Island|Port Blair|Departure",
    "thailand",
  ],
  [
    "himachal-mountains",
    "Shimla & Manali mountain holiday",
    "India",
    "India",
    "Chandigarh|Shimla|Shimla surroundings|Manali|Solang Valley|Manali leisure|Departure",
    "hero",
  ],
  [
    "sikkim-darjeeling",
    "Sikkim & Darjeeling tea trails",
    "India",
    "India",
    "Bagdogra to Gangtok|Gangtok|Tsomgo Lake option|Darjeeling|Darjeeling tea gardens|Departure",
    "kerala",
  ],
  [
    "kerala-hills-backwaters",
    "Kerala: tea hills to backwaters",
    "India",
    "India",
    "Kochi|Munnar|Munnar tea country|Thekkady|Alleppey|Departure",
    "kerala",
  ],
  [
    "singapore-family",
    "Singapore family discovery",
    "Singapore",
    "Southeast Asia",
    "Singapore|Gardens and Marina Bay|Sentosa options|Neighbourhoods and food|Departure",
    "singapore",
  ],
  [
    "malaysia-city-island",
    "Malaysia: city lights & island days",
    "Malaysia",
    "Southeast Asia",
    "Kuala Lumpur|Kuala Lumpur landmarks|Langkawi|Langkawi beaches|Island leisure|Departure",
    "singapore",
  ],
  [
    "malaysia-culture-coast",
    "Kuala Lumpur & Penang flavours",
    "Malaysia",
    "Southeast Asia",
    "Kuala Lumpur|City discoveries|Penang|George Town|Penang coast|Departure",
    "singapore",
  ],
  [
    "nepal-valleys-lakes",
    "Nepal: Kathmandu & Pokhara",
    "Nepal",
    "South Asia",
    "Kathmandu|Kathmandu heritage|Pokhara|Phewa Lake|Pokhara leisure|Kathmandu|Departure",
    "hero",
  ],
  [
    "bhutan-valley-journey",
    "Bhutan: Paro & Thimphu valleys",
    "Bhutan",
    "South Asia",
    "Paro to Thimphu|Thimphu|Punakha|Punakha valley|Paro|Paro walking options|Departure",
    "hero",
  ],
  [
    "sri-lanka-tea-coast",
    "Sri Lanka: tea country & the coast",
    "Sri Lanka",
    "South Asia",
    "Colombo|Kandy|Nuwara Eliya|Ella|South coast|Galle|Departure",
    "kerala",
  ],
  [
    "maldives-lagoon",
    "Maldives lagoon escape",
    "Maldives",
    "South Asia",
    "Malé and island transfer|Lagoon leisure|Optional ocean activities|Island time|Return transfer",
    "resort",
  ],
  [
    "vietnam-discoveries",
    "Vietnam: old streets & new discoveries",
    "Vietnam",
    "Southeast Asia",
    "Hanoi|Hanoi old quarter|Ha Long Bay option|Da Nang|Hoi An|Hoi An leisure|Departure",
    "thailand",
  ],
  [
    "bali-temples-beaches",
    "Bali temples & beaches",
    "Indonesia",
    "Southeast Asia",
    "Ubud|Ubud rice terraces|Temple options|Uluwatu|Seminyak|Beach leisure|Departure",
    "bali",
  ],
  [
    "france-italy-highlights",
    "Paris, Florence & Rome",
    "France / Italy",
    "Europe",
    "Paris|Paris landmarks|Paris leisure|Florence|Florence art|Rome|Rome landmarks|Departure",
    "italy",
  ],
  [
    "swiss-lakes-mountains",
    "Swiss lakes & mountain villages",
    "Switzerland",
    "Europe",
    "Zürich|Lucerne|Lucerne mountain options|Interlaken|Bernese Oberland|Departure",
    "hero",
  ],
  [
    "spain-city-stories",
    "Barcelona & Madrid city stories",
    "Spain",
    "Europe",
    "Barcelona|Gaudí landmarks|Coastal leisure|Madrid|Madrid museums|Toledo option|Departure",
    "italy",
  ],
] as const;
const sampleStays = [
  [
    "munnar-budget-retreat",
    "Munnar garden retreat",
    "Munnar, Kerala",
    "Budget|Family",
    "kerala",
  ],
  [
    "wayanad-family-resort",
    "Wayanad family hideaway",
    "Wayanad, Kerala",
    "Family",
    "kerala",
  ],
  [
    "marari-couples-villa",
    "Marari coastal villa",
    "Marari, Kerala",
    "Couples|Villa",
    "resort",
  ],
  [
    "kumarakom-family-villa",
    "Kumarakom waterside villa",
    "Kumarakom, Kerala",
    "Family|Villa",
    "kerala",
  ],
  [
    "varkala-budget-stay",
    "Varkala easy escape",
    "Varkala, Kerala",
    "Budget|Couples",
    "resort",
  ],
  [
    "munnar-couples-cottage",
    "Munnar hillside cottage",
    "Munnar, Kerala",
    "Couples",
    "kerala",
  ],
  [
    "coorg-family-villa",
    "Coorg coffee-country villa",
    "Coorg, Karnataka",
    "Family|Villa",
    "kerala",
  ],
  [
    "goa-pool-villa",
    "Goa pool villa concept",
    "South Goa, Goa",
    "Couples|Family|Villa",
    "resort",
  ],
] as const;
function sampleJourney(stops: string[]) {
  return stops.map((stop, i) => {
    // Some stops are phrased as headings ("Arrive in X", "Explore X at your
    // own pace"); sentences use the place name on its own.
    const place = stop
      .replace(/^(Arrive in|Explore)\s+/i, "")
      .replace(/\s+at your own pace$/i, "");
    return {
      title: `Day ${i + 1}: ${stop}`,
      description:
        i === 0
          ? `Arrive in ${place} and settle into your accommodation, with free time depending on your arrival. Transfers and check-in are confirmed in your quote.`
          : i === stops.length - 1
            ? "Enjoy a relaxed check-out before your onward journey. Departure arrangements are planned around your confirmed tickets."
            : `Explore ${place} at your preferred pace, with guided visits, independent time and local dining to choose from. Tickets and transport are set out in your quote.`,
    };
  });
}
const demoImage = (key: string) =>
  key === "india"
    ? travelPhoto("photo-1564507592333-c60657eea523")
    : photos[key as keyof typeof photos];
for (const [id, title, country, region, route, photo] of sampleRoutes) {
  const stops = route.split("|");
  seedContent.push(
    item(
      id,
      title,
      stops
        .filter((_, i) => i === 0 || i === Math.floor(stops.length / 2))
        .join(" · "),
      region,
      demoImage(photo),
      {
        country,
        order: 30 + seedContent.length,
        days: stops.length,
        nights: stops.length - 1,
        themes: ["Family", "Couples"],
        itinerary: sampleJourney(stops),
        imageAlt: `Travel photograph for ${title}`,
        description: `Explore ${country} through ${stops.length} thoughtfully paced days. The route follows ${stops.join(" → ")}. Adjust the number of nights, hotel style and experiences with your planner. All arrangements require a personalised quote.`,
        accommodation:
          "Comfortable hotels with private rooms. Hotel names, category and meal basis are confirmed in your quote.",
        inclusions: [
          "Proposed accommodation and transfers, subject to your final quote",
          "A personalised day-by-day itinerary",
          "Activities only where explicitly included in the confirmed quote",
        ],
        exclusions: [
          "Flights unless included in your quote",
          "Visa or permit fees, travel insurance and personal expenses",
          "Optional activities and meals not specified",
        ],
      },
    ),
  );
}
// Europe self-drive packages replace the earlier sample road trips.
seedContent.push(...europeDrives);
for (const [id, title, location, styles, photo] of sampleStays) {
  seedContent.push(
    item(id, title, location, "India", demoImage(photo), {
      kind: "resort",
      country: "India",
      order: 120 + seedContent.length,
      days: 3,
      nights: 2,
      themes: styles.split("|"),
      imageAlt: "Illustrative stay photograph; not the actual property",
      summary:
        "Sample stay concept · " +
        styles.split("|").join(" / ") +
        ". Personalise your dates, room preferences and meals.",
      description: `An illustrative ${location} stay for ${styles.toLowerCase().split("|").join(" and ")} holidays. This is a sample property concept, not an operating property listing. Photos illustrate the mood. Tell us your dates, group size and preferred room setup for suitable verified options.`,
      itinerary: sampleJourney([
        "Arrival and settle in",
        "A day at your own pace",
        "Check-out and onward travel",
      ]),
      amenities: [
        "Garden or outdoor setting — sample preference",
        "Wi-Fi — request confirmation",
        "Parking — request confirmation",
      ],
      rooms: styles.includes("Villa")
        ? ["Two-bedroom villa preference", "Extra-bed requirements to discuss"]
        : ["Double room preference", "Family room preference"],
      mealPlans: [
        "Room only",
        "Breakfast included preference",
        "Breakfast and dinner preference",
      ],
      accommodation:
        "Illustrative rooms and amenities only. Property name, room category, meal plan, pool access and child policies must be confirmed in your quote.",
    }),
  );
}

// South India sample destination pages and matching enquiry-first holidays.
for (const [index, place] of southIndiaLocations.entries()) {
  const image = ["varkala", "kochi", "calicut"].includes(place.slug)
    ? photos.resort
    : photos.kerala;
  seedContent.push(
    item(
      place.slug,
      place.name,
      `${place.name}, ${place.state}`,
      "India",
      image,
      {
        kind: "destination",
        country: "India",
        order: 200 + index,
        days: 0,
        nights: 0,
        themes: ["South India"],
        summary: place.mood + ". Plan a visit around your dates and interests.",
        description: `Discover ${place.name} in ${place.state}. ${place.mood}. It is a starting point for a personalised holiday, with accommodation and experiences chosen around your group.`,
        imageAlt: `Scenery around ${place.name}`,
      },
    ),
  );
  seedContent.push(
    item(
      `${place.slug}-short-escape`,
      `${place.name}: a little escape`,
      `${place.name}, ${place.state}`,
      "India",
      image,
      {
        country: "India",
        order: 220 + index,
        days: 3,
        nights: 2,
        themes: ["South India", "Family", "Couples"],
        featured: false,
        summary: place.mood + ". A customisable three-day itinerary.",
        description: `A three-day stay in ${place.name}. Choose your preferred pace, accommodation and local experiences. Transport, permits, weather-dependent activities and inclusions are confirmed in your personalised quote.`,
        itinerary: sampleJourney([
          `Arrive in ${place.name}`,
          `Explore ${place.name} at your own pace`,
          "Check-out and onward travel",
        ]),
        accommodation:
          "Two nights in a hotel, resort or homestay to suit your budget. The property and room category will be confirmed in your quote.",
        imageAlt: `Scenery around ${place.name}`,
      },
    ),
  );
}
for (const [id, title, country, route, photo] of [
  [
    "thailand-city-beach",
    "Thailand: city stories & beach days",
    "Thailand",
    "Bangkok|Bangkok temples and neighbourhoods|Phuket|Beach leisure|Island activity options|Departure",
    photos.thailand,
  ],
  [
    "mauritius-island-escape",
    "Mauritius: a slower island escape",
    "Mauritius",
    "Arrival and settle in|Coastal leisure|Port Louis options|Island scenery|A day at your own pace|Departure",
    photos.resort,
  ],
]) {
  const stops = route.split("|");
  seedContent.push(
    item(
      id,
      title,
      country,
      country === "Thailand" ? "Southeast Asia" : "Indian Ocean",
      photo,
      {
        country,
        days: 6,
        nights: 5,
        order: 250 + seedContent.length,
        featured: false,
        description: `A six-day holiday in ${country}. Personalise your accommodation, transfers and experiences with us; everything is confirmed in your quote.`,
        itinerary: sampleJourney(stops),
        accommodation:
          "Five nights in accommodation selected around your budget and preferences. The property, room and meal plan will be confirmed in your quote.",
        imageAlt: `Travel photograph for ${country}`,
      },
    ),
  );
}

// Give every sample record the checked photograph for its own location.
for (const [index, record] of seedContent.entries())
  seedContent[index] = withPlacePhoto(record);
