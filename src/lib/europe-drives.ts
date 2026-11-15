import type { Content, Highlight, RouteStop } from "./types";
import { placePhoto, placePhotoUrl } from "./place-photos";

// The two Europe self-drive packages. Prices, durations, countries, routes,
// inclusions and exclusions come from the owner's brochures (November 2026).
// Nothing here confirms a hotel, car model or service beyond those brochures.
// Once installed, each package is edited independently in the admin portal.

const stop = (
  name: string,
  country: string,
  lat: number,
  lng: number,
  overnight = true,
): RouteStop => ({ name, country, lat, lng, overnight });
const paris = stop("Paris", "France", 48.8566, 2.3522);
const brussels = stop("Brussels", "Belgium", 50.8503, 4.3517);
const amsterdam = stop("Amsterdam", "Netherlands", 52.3676, 4.9041);

// A highlight appears only when a checked photograph of that place exists.
function highlights(items: [key: string, name: string, text: string][]) {
  return items.flatMap(([key, name, text]): Highlight[] => {
    const photo = placePhoto(key);
    return photo
      ? [{ name, text, image: placePhotoUrl(photo), imageAlt: photo.alt }]
      : [];
  });
}
const cover = (key: string) => {
  const photo = placePhoto(key);
  return photo
    ? { image: placePhotoUrl(photo), imageAlt: photo.alt }
    : { image: "", imageAlt: "" };
};

const drivingInfo = [
  {
    title: "Your rental car",
    text: "A rental car is included, collected and returned in Paris. The car category, transmission and pick-up point are confirmed in your quote; models are always subject to the rental company’s availability. Tell us your group size and luggage so we can suggest the right size.",
  },
  {
    title: "Insurance",
    text: "Basic car insurance is included. It normally carries an excess, which is the amount you remain responsible for if the car is damaged. Zero-excess cover is not included and can be requested with your quote. Travel insurance is listed separately under inclusions.",
  },
  {
    title: "Driving licence",
    text: "The main driver needs a valid, full driving licence and usually a passport and a credit card in their own name. Many rental companies ask visitors from outside Europe for an International Driving Permit alongside the original licence, and set a minimum age. We check the exact requirements for your licence before you confirm.",
  },
  {
    title: "Crossing borders",
    text: "Cross-border charges for the countries on this route are included. All of them are in the Schengen area, so there are normally no routine border checks, but carry your passport, visa and rental papers every day. Please keep to the agreed countries; taking the car elsewhere needs the rental company’s approval.",
  },
  {
    title: "Tolls, fuel, parking and deposits",
    text: "Fuel, road tolls, parking, traffic fines and any security deposit are paid by you and are not part of the package price. French motorways are tolled, and city-centre parking is limited and charged almost everywhere. The rental company usually blocks a deposit on the main driver’s credit card at pick-up.",
  },
  {
    title: "Rules of the road",
    text: "Drive on the right and overtake on the left. Seat belts are compulsory for everyone and phones must be hands-free. Speed limits change at each border and cameras are common. Several cities on this route have low-emission zones that need a windscreen sticker, such as Crit’Air in Paris and the Umweltplakette in German cities; ask the rental desk what the car carries.",
  },
];
const sharedFaqs = [
  {
    question: "Is this a guided tour?",
    answer:
      "No. This is a self-drive holiday: you drive your own rental car at your own pace. We plan the route, stays and paperwork with you, and the day-by-day plan is a suggestion you can adapt.",
  },
  {
    question: "Can the route or the pace be changed?",
    answer:
      "Yes. Tell us what you would like to add, skip or slow down. Changes to nights, hotels or route can change the price, and we show that clearly in your quote.",
  },
  {
    question: "Are the sightseeing tickets included?",
    answer:
      "No. Attraction entrance fees, cruises, cable cars and similar activities are paid by you unless your confirmed quote says otherwise. Many of the places in the plan are free to see from outside.",
  },
  {
    question: "Which hotels will we stay in?",
    answer:
      "Hotels are selected for your dates and confirmed in your quote. No hotel is confirmed until you have received and accepted it.",
  },
  {
    question: "Does sending an enquiry book the trip?",
    answer:
      "No. An enquiry starts a conversation. Nothing is booked and nothing is charged until you have received a written quote and confirmed it with our team.",
  },
];

const base = {
  kind: "road-trip" as const,
  region: "Europe",
  packageType: "Self-drive road trip" as const,
  collections: ["europe-road-trips" as const, "international-trips" as const],
  gallery: [],
  themes: ["Self-drive", "Road trip", "Multi-country"],
  featured: true,
  status: "published" as const,
  demo: false,
  amenities: [],
  rooms: [],
  mealPlans: [],
  vehicles: [],
  drivingInfo,
  updatedAt: "2026-11-14T00:00:00.000Z",
};

export const discoverEurope: Content = {
  ...base,
  id: "discover-europe",
  slug: "discover-europe",
  title: "DISCOVER Europe",
  location:
    "Paris → Brussels → Amsterdam → Cologne → Luxembourg → Reims → Paris",
  country: "Europe",
  countries: ["France", "Germany", "Luxembourg", "Belgium", "Netherlands"],
  locations: [
    "Paris",
    "Brussels",
    "Amsterdam",
    "Cologne",
    "Luxembourg City",
    "Reims",
  ],
  days: 7,
  nights: 6,
  order: 1,
  summary:
    "Seven days, five countries and one easy loop from Paris: Brussels, Amsterdam, Cologne, Luxembourg and Reims, all at your own pace behind the wheel.",
  description:
    "DISCOVER Europe is a seven-day self-drive loop that starts and ends in Paris. You spend two nights in Paris, then drive north to Brussels and Amsterdam, east to Cologne on the Rhine, and back through Luxembourg and the Champagne city of Reims. Each driving day is between two and five and a half hours on well-kept motorways, which leaves the afternoons and evenings free for the cities themselves.",
  ...cover("paris"),
  price: 5999,
  currency: "AED",
  priceBasis: "per person",
  priceConditions:
    "Starting price per person. Your final price depends on travel dates, group size, hotel and car category, and is confirmed in your written quote.",
  accommodation:
    "Six nights in hotels with breakfast: two in Paris, then one each in Brussels, Amsterdam, Cologne and Reims. Hotel names and room types are confirmed in your quote.",
  routeStops: [
    paris,
    brussels,
    amsterdam,
    stop("Cologne", "Germany", 50.9375, 6.9603),
    stop("Luxembourg City", "Luxembourg", 49.6116, 6.1319, false),
    stop("Reims", "France", 49.2583, 4.0317),
    paris,
  ],
  itinerary: [
    {
      title: "Arrival in Paris",
      description:
        "Land in Paris, collect your rental car and settle in. The first evening is kept free so you can recover from the flight.",
      afternoon: [
        "Arrive at Paris airport and collect the rental vehicle",
        "Drive to your hotel and check in",
        "Rest after the journey",
      ],
      evening: [
        "Explore nearby cafés and local streets if time permits",
        "Enjoy your first evening in Paris",
      ],
      overnight: "Paris",
    },
    {
      title: "Paris sightseeing",
      description:
        "A full day for the classics, from the Eiffel Tower in the morning to the Seine after dark.",
      morning: [
        "Breakfast at the hotel",
        "Visit the Eiffel Tower",
        "Walk through the Champ de Mars",
        "Capture panoramic city views",
      ],
      afternoon: [
        "Visit the Louvre Museum",
        "Explore the gardens around the Eiffel Tower",
        "Walk through Montmartre",
        "Experience traditional Parisian cafés",
      ],
      evening: [
        "Seine river cruise",
        "Explore the illuminated streets of Paris",
        "Dinner at a French restaurant",
      ],
      overnight: "Paris",
    },
    {
      title: "Paris to Brussels",
      description:
        "Your first driving day: north through the French countryside and across the border into Belgium.",
      morning: [
        "Breakfast and hotel check-out",
        "Begin your self-drive journey from Paris to Brussels",
        "Scenic drive through northern France into Belgium",
      ],
      afternoon: [
        "Arrive in Brussels",
        "Visit the iconic Grand Place",
        "Explore Brussels city centre",
        "Walk through the Galeries Royales Saint-Hubert",
        "Enjoy authentic Belgian waffles and chocolates",
      ],
      evening: [
        "Visit the Mont des Arts viewpoint",
        "See the Royal Palace (exterior)",
        "Explore the surrounding historic streets",
      ],
      driveDistance: "Approximately 320 km",
      driveTime: "Around 3.5–4 hours",
      overnight: "Brussels",
    },
    {
      title: "Brussels to Amsterdam",
      description:
        "A short drive north brings you to Amsterdam in time for an afternoon on foot and an evening on the canals.",
      morning: [
        "Breakfast at the hotel",
        "Check out from Brussels",
        "Begin your scenic self-drive journey to Amsterdam",
      ],
      afternoon: [
        "Arrive in Amsterdam",
        "Explore Dam Square",
        "Walk through the historic city centre",
        "Visit the Royal Palace",
        "Experience the famous canal district",
      ],
      evening: [
        "Enjoy a canal cruise",
        "Explore the Jordaan neighbourhood",
        "Dinner at a Dutch restaurant",
      ],
      driveDistance: "Approximately 210 km",
      driveTime: "Around 2.5–3 hours",
      overnight: "Amsterdam",
    },
    {
      title: "Amsterdam to Cologne",
      description:
        "Cross into Germany and follow the road to the Rhine, where Cologne’s cathedral towers over the old town.",
      morning: [
        "Breakfast at the hotel",
        "Check out from Amsterdam",
        "Begin your scenic self-drive journey to Cologne",
      ],
      afternoon: [
        "Arrive in Cologne",
        "Visit the iconic Cologne Cathedral",
        "Explore the Old Town (Altstadt)",
        "Walk along the Rhine promenade",
        "Visit the Hohenzollern Bridge",
      ],
      evening: [
        "Enjoy dinner overlooking the Rhine",
        "Explore Cologne city centre",
      ],
      driveDistance: "Approximately 265 km",
      driveTime: "Around 3 hours",
      overnight: "Cologne",
    },
    {
      title: "Cologne to Luxembourg to Reims",
      description:
        "The longest day of the loop, split in two by an afternoon in Luxembourg City before the evening drive into France.",
      morning: [
        "Breakfast at the hotel",
        "Check out from Cologne",
        "Begin the scenic drive towards Luxembourg",
      ],
      afternoon: [
        "Visit the Adolphe Bridge",
        "Explore the Old Town (UNESCO World Heritage Site)",
        "Walk through Place Guillaume II",
        "Visit the Grand Ducal Palace (exterior)",
        "Enjoy lunch at a traditional Luxembourg café",
      ],
      evening: [
        "Continue your self-drive journey to Reims, France",
        "Arrive in Reims and check in",
        "Relax after the journey",
      ],
      driveDistance: "Approximately 445 km in two legs",
      driveTime: "Around 5–5.5 hours in total",
      driveNote:
        "Cologne to Luxembourg: approximately 215 km, around 2.5–3 hours. Luxembourg to Reims: approximately 230 km, around 2.5 hours.",
      overnight: "Reims",
    },
    {
      title: "Reims to Paris and departure",
      description:
        "An easy final drive through the countryside back to Paris, where you return the car and fly home.",
      morning: [
        "Breakfast at the hotel in Reims",
        "Check out and begin your drive back to Paris",
        "Enjoy scenic countryside views",
      ],
      afternoon: [
        "Arrive in Paris",
        "Last-minute shopping (optional)",
        "Visit a nearby café or attraction if time permits",
      ],
      evening: [
        "Transfer to Paris airport and return the rental vehicle",
        "Check in for your international flight",
      ],
      driveDistance: "Approximately 145 km",
      driveTime: "Around 2 hours",
    },
  ],
  highlights: highlights([
    [
      "paris",
      "Paris",
      "Two nights for the Eiffel Tower, the Louvre, Montmartre and the Seine.",
    ],
    [
      "brussels",
      "Brussels",
      "The Grand Place, covered arcades, waffles and chocolate.",
    ],
    [
      "amsterdam",
      "Amsterdam",
      "Dam Square, the canal ring and the Jordaan by evening.",
    ],
    [
      "cologne",
      "Cologne",
      "The cathedral, the old town and the Rhine promenade.",
    ],
    [
      "luxembourg",
      "Luxembourg City",
      "A UNESCO-listed old town built across a gorge.",
    ],
    ["reims", "Reims", "A quiet last night in the capital of Champagne."],
  ]),
  inclusions: [
    "Round-trip international flights from the UAE to Paris",
    "Visa charges",
    "Hotel with breakfast",
    "Rental car",
    "Basic car insurance",
    "Travel insurance",
    "Cross-border charges",
  ],
  exclusions: [
    "Traffic and legal fines",
    "Parking charges",
    "Fuel and toll charges",
    "Lunches and dinners",
    "Attraction entrance fees",
    "Personal expenses",
    "VAT and other applicable taxes",
    "Deposits, if needed",
  ],
  travelTips: [
    "April to October offers the best weather and road conditions for this route.",
    "Roads are well-maintained motorways with some scenic countryside stretches.",
    "Start driving days after breakfast to arrive with the afternoon still free.",
    "Park at your hotel or a city car park and explore the centres on foot; old towns are tight and often restricted to traffic.",
    "Day 6 has two drives. Leave Cologne early so Luxembourg City gets a proper afternoon.",
    "Keep some coins and a bank card handy for tolls and parking machines.",
  ],
  faqs: [
    {
      question: "How much driving is there?",
      answer:
        "About 1,385 km over five driving days. Four of them are between two and four hours. Day 6 is the long one at around five to five and a half hours, broken by an afternoon in Luxembourg City.",
    },
    ...sharedFaqs,
  ],
  seoTitle: "DISCOVER Europe: 7-day self-drive through 5 countries",
  seoDescription:
    "A 7-day, 6-night self-drive loop from Paris through Brussels, Amsterdam, Cologne, Luxembourg and Reims. Starting from AED 5,999 per person.",
};

export const euroDrive: Content = {
  ...base,
  id: "euro-drive",
  slug: "euro-drive",
  title: "Euro Drive",
  location:
    "Paris → Brussels → Amsterdam → Luxembourg → Munich → Innsbruck → Seiser Alm → Zurich → Interlaken → Paris",
  country: "Europe",
  countries: [
    "France",
    "Germany",
    "Luxembourg",
    "Netherlands",
    "Belgium",
    "Austria",
    "Italy",
    "Switzerland",
    "Liechtenstein",
  ],
  locations: [
    "Paris",
    "Brussels",
    "Amsterdam",
    "Luxembourg City",
    "Munich",
    "Innsbruck",
    "Seiser Alm",
    "Liechtenstein",
    "Zurich",
    "Interlaken",
  ],
  days: 11,
  nights: 10,
  order: 2,
  summary:
    "Eleven days and nine countries in one grand loop: the capitals of the north, Bavaria, the Dolomites, Liechtenstein and the Swiss lakes, driven at your own pace.",
  description:
    "Euro Drive is our longest self-drive route. It begins with two nights in Paris, runs north through Brussels and Amsterdam, turns south-east through Luxembourg to Munich, then climbs over the Brenner Pass to a night on the Seiser Alm meadows in the Italian Dolomites. From there the road crosses Liechtenstein to Zurich and Interlaken before a final long drive back to Paris. Expect a mix of easy two-hour hops and three long motorway days, with the mountain scenery as the reward.",
  ...cover("lauterbrunnen"),
  price: 193000,
  currency: "INR",
  priceBasis: "per person",
  priceConditions:
    "Starting price per person. Your final price depends on travel dates, group size, hotel and car category, and is confirmed in your written quote.",
  accommodation:
    "Ten nights in 3-star hotels with breakfast: Paris (two nights at the start and one at the end), Brussels, Amsterdam, Luxembourg City, Munich, Seiser Alm, Zurich and Interlaken. Hotel names and room types are confirmed in your quote.",
  routeStops: [
    paris,
    brussels,
    amsterdam,
    stop("Luxembourg City", "Luxembourg", 49.6116, 6.1319),
    stop("Munich", "Germany", 48.1351, 11.582),
    stop("Innsbruck", "Austria", 47.2692, 11.4041, false),
    stop("Seiser Alm", "Italy", 46.5405, 11.6256),
    stop("Merano", "Italy", 46.6713, 11.1594, false),
    stop("Vaduz", "Liechtenstein", 47.141, 9.5209, false),
    stop("Zurich", "Switzerland", 47.3769, 8.5417),
    stop("Interlaken", "Switzerland", 46.6863, 7.8632),
    paris,
  ],
  itinerary: [
    {
      title: "Arrival in Paris",
      description:
        "Touch down in Paris and ease into the trip on foot. Today is about first impressions rather than ticking off sights.",
      afternoon: [
        "Arrive at Paris Charles de Gaulle Airport and transfer to your hotel",
        "Check in and freshen up",
        "Head to the Trocadéro terraces for the classic full-height view of the Eiffel Tower",
        "Cross the Pont Alexandre III, the most ornate bridge on the Seine",
      ],
      evening: [
        "Walk the Champs-Élysées up to the Arc de Triomphe as the lights come on",
        "Dinner at a neighbourhood brasserie (optional, own expense)",
      ],
      overnight: "Paris",
    },
    {
      title: "Paris: hilltops, islands and gardens",
      description:
        "A full day in the city, moving from the village streets of Montmartre down to the islands in the Seine and the gardens of the Left Bank.",
      morning: [
        "Breakfast at the hotel",
        "Climb to Montmartre and the Sacré-Cœur for the view over the rooftops",
        "Wander Place du Tertre and the lanes where the painters set up their easels",
      ],
      afternoon: [
        "Lunch in the Latin Quarter (own expense)",
        "See Notre-Dame from the forecourt and walk the Île de la Cité",
        "Optional: the stained glass of Sainte-Chapelle (ticketed)",
        "Slow down in the Luxembourg Gardens",
      ],
      evening: [
        "Explore the Marais: old mansions, small galleries and falafel on Rue des Rosiers",
        "Optional: an evening cruise on the Seine (ticketed)",
      ],
      overnight: "Paris",
    },
    {
      title: "Paris to Brussels",
      description:
        "The road trip begins. An easy motorway run north brings you to Brussels with most of the afternoon in hand.",
      morning: [
        "Breakfast and check-out",
        "Start your self-drive journey north on the A1",
        "Optional coffee stop in Lille, about halfway, for its Flemish main square",
      ],
      afternoon: [
        "Arrive in Brussels and check in",
        "Step into the Grand-Place, the guildhall square that is a UNESCO World Heritage Site",
        "Browse the glass-roofed Galeries Royales Saint-Hubert",
        "Say hello to the Manneken Pis, smaller than everyone expects",
      ],
      evening: [
        "Watch the sunset from the Mont des Arts gardens",
        "Follow the chocolate shops around Place du Grand Sablon",
        "Try moules-frites or a proper Belgian waffle (own expense)",
      ],
      driveDistance: "Approximately 310 km",
      driveTime: "Around 3.5–3.75 hours",
      driveNote: "Route: A1 and E19 motorways. Suggested stop: Lille.",
      overnight: "Brussels",
    },
    {
      title: "Brussels to Amsterdam",
      description:
        "A short hop into the Netherlands, with the option of a diamond-city detour on the way.",
      morning: [
        "Breakfast and check-out",
        "Drive north towards the Dutch border",
        "Optional stop in Antwerp for the Grote Markt and the cathedral spire",
      ],
      afternoon: [
        "Arrive in Amsterdam and check in",
        "Walk the canal ring: Herengracht, Keizersgracht and Prinsengracht",
        "Cross Dam Square past the Royal Palace",
        "Get lost in the Nine Streets, the lanes of small shops between the canals",
      ],
      evening: [
        "Stroll the Jordaan and its brown cafés",
        "See the Rijksmuseum façade and gardens on Museumplein",
        "Optional: a canal cruise at dusk or the A’DAM Lookout across the river (ticketed)",
      ],
      driveDistance: "Approximately 210 km",
      driveTime: "Around 2.5–2.75 hours",
      driveNote: "Route: E19 and A2 motorways. Suggested stop: Antwerp.",
      overnight: "Amsterdam",
    },
    {
      title: "Amsterdam to Luxembourg City",
      description:
        "South through three countries in a morning, ending in a capital built on cliffs.",
      morning: [
        "Breakfast and check-out",
        "Drive south through the Netherlands and Belgium",
        "Suggested break in Maastricht for coffee on the Vrijthof square",
      ],
      afternoon: [
        "Arrive in Luxembourg City and check in",
        "Walk the Chemin de la Corniche, often called Europe’s most beautiful balcony",
        "Look across the gorge from the Adolphe Bridge and Constitution Square",
        "Ride the free glass Pfaffenthal lift down to the lower town",
      ],
      evening: [
        "Wander the riverside Grund quarter",
        "See the Grand Ducal Palace from outside",
        "Optional: the Bock Casemates tunnels (ticketed, seasonal)",
        "Dinner around Place d’Armes (own expense)",
      ],
      driveDistance: "Approximately 360 km",
      driveTime: "Around 4.25–4.5 hours",
      driveNote:
        "Route: A2 and E25 through the Netherlands and Belgium. Suggested stops: Maastricht or Liège.",
      overnight: "Luxembourg City",
    },
    {
      title: "Luxembourg City to Munich",
      description:
        "The big motorway day. Share the driving if you can, break it twice, and Munich’s beer halls will be waiting.",
      morning: [
        "Early breakfast and check-out",
        "Cross into Germany and stop in Trier for the Roman Porta Nigra gate",
        "Continue east through the Palatinate and Swabia",
      ],
      afternoon: [
        "Lunch and a leg-stretch around Stuttgart or Ulm (own expense)",
        "Arrive in Munich and check in",
        "Head to Marienplatz for the New Town Hall and its glockenspiel, if the timing works",
      ],
      evening: [
        "Graze through the Viktualienmarkt food market",
        "See the twin domes of the Frauenkirche",
        "Dinner in a traditional Bavarian beer hall (own expense)",
        "Optional: an evening walk in the English Garden",
      ],
      driveDistance: "Approximately 565 km",
      driveTime: "Around 5.75–6 hours",
      driveNote:
        "Route: A1/E44 through Luxembourg, then the A6 and A8 across Germany. Suggested stops: Trier and Stuttgart.",
      overnight: "Munich",
    },
    {
      title: "Munich to Innsbruck to Seiser Alm",
      description:
        "Into the Alps. Lunch beneath the peaks in Innsbruck, then over the Brenner Pass to a night in the Dolomites.",
      morning: [
        "Breakfast and check-out",
        "Drive south into Austria with the mountains growing in the windscreen",
        "Arrive in Innsbruck and park for the old town",
      ],
      afternoon: [
        "See the Golden Roof and the painted houses of the old town",
        "Walk Maria-Theresien-Strasse with the Nordkette range behind it",
        "Stroll the Inn riverside for the row of coloured houses",
        "Optional: the Nordkette cable car or the City Tower (ticketed)",
      ],
      evening: [
        "Cross the Brenner Pass into Italy",
        "Climb to the Seiser Alm, Europe’s largest high-alpine meadow",
        "Check in and watch the evening light on the Sassolungo peaks",
      ],
      driveDistance: "Approximately 290 km in two legs",
      driveTime: "Around 3.25–3.5 hours in total",
      driveNote:
        "Munich to Innsbruck: about 180 km, 1.75–2 hours. Innsbruck to Seiser Alm: about 110 km, around 1.5 hours over the tolled Brenner motorway. The road up to the Seiser Alm is normally closed to private cars during the day except for hotel guests; we confirm the access rules with your booking.",
      overnight: "Seiser Alm",
    },
    {
      title: "Seiser Alm to Liechtenstein to Zurich",
      description:
        "A day of borders: from Italian meadows through a spa town and a tiny principality to Switzerland’s largest city.",
      morning: [
        "Breakfast with a mountain view",
        "A short walk across the meadows before check-out",
        "Drive down to Merano, the palm-lined spa town of South Tyrol",
      ],
      afternoon: [
        "Walk Merano’s Tappeiner Promenade above the rooftops",
        "Browse the medieval arcades of Via dei Portici",
        "Drive north-west over the Alps to Liechtenstein",
        "Pause in Vaduz for the castle viewpoint and the pedestrian Städtle",
      ],
      evening: [
        "Continue to Zurich and check in",
        "Stretch your legs along the lake promenade",
        "Dinner in the old town or by the lake (own expense)",
      ],
      driveDistance: "Approximately 365 km",
      driveTime: "Around 6 hours, plus stops",
      driveNote:
        "Seiser Alm to Merano takes roughly an hour. Merano to Zurich by way of Liechtenstein is about five hours on mountain roads and motorway. Alpine passes can close in winter or bad weather, and we plan the best route for your dates.",
      overnight: "Zurich",
    },
    {
      title: "Zurich to Interlaken",
      description:
        "A gentle day. A morning in Zurich, a short and beautiful drive, and an evening between two lakes.",
      morning: [
        "Breakfast at the hotel",
        "Climb to the Lindenhof terrace for the view over the Limmat",
        "Explore the old town lanes and Bahnhofstrasse",
        "Optional: the towers of the Grossmünster (ticketed)",
      ],
      afternoon: [
        "Check out and drive towards the Bernese Oberland",
        "Optional stop in Lucerne for the Chapel Bridge and the lakefront",
        "Follow the lakes over the Brünig Pass to Interlaken",
      ],
      evening: [
        "Check in and walk the Höhematte park, with the Jungfrau straight ahead",
        "Optional: the Harder Kulm funicular for sunset (ticketed, seasonal)",
        "Optional: the lakeside village of Iseltwald on Lake Brienz",
      ],
      driveDistance: "Approximately 118 km",
      driveTime: "Around 1.75–2 hours",
      driveNote:
        "Route: A3, A4 and A8 through central Switzerland. Suggested stop: Lucerne.",
      overnight: "Interlaken",
    },
    {
      title: "Interlaken to Paris",
      description:
        "The long road home across Switzerland and Burgundy. Break it up well and Paris will be lit when you arrive.",
      morning: [
        "Breakfast and check-out",
        "One last look at Lake Thun from the Spiez shoreline",
        "Optional stroll under the arcades of Bern’s old town",
      ],
      afternoon: [
        "Cross into France and drive through Burgundy",
        "Lunch stop in Dijon or Beaune (own expense)",
        "Regular breaks along the A6",
      ],
      evening: [
        "Arrive in Paris and check in",
        "See the Eiffel Tower sparkle on the hour after dark",
        "A final dinner in Paris (optional, own expense)",
      ],
      driveDistance: "Approximately 600 km",
      driveTime: "Around 6.5–7 hours",
      driveNote:
        "Route: A12 and A1 through Switzerland, then the A6 through France. Suggested stops: Bern and Dijon.",
      overnight: "Paris",
    },
    {
      title: "Departure from Paris",
      description:
        "Return the car and fly home. Timings depend on your flight and are set out in your final documents.",
      morning: [
        "Breakfast and check-out",
        "Return the rental car",
        "Transfer to the airport for your flight home",
      ],
    },
  ],
  highlights: highlights([
    ["paris", "Paris", "Three nights in total, at both ends of the loop."],
    ["brussels", "Brussels", "The Grand-Place, arcades and chocolate quarter."],
    [
      "amsterdam",
      "Amsterdam",
      "The canal ring, the Nine Streets and the Jordaan.",
    ],
    ["luxembourg", "Luxembourg City", "Clifftop walks above the Grund."],
    [
      "munich",
      "Munich",
      "Marienplatz, the food market and Bavarian beer halls.",
    ],
    ["innsbruck", "Innsbruck", "The Golden Roof beneath the Nordkette peaks."],
    ["seiser-alm", "Seiser Alm", "A night on Europe’s largest alpine meadow."],
    ["merano", "Merano", "Promenades and arcades in South Tyrol."],
    [
      "vaduz",
      "Liechtenstein",
      "A castle stop in one of Europe’s smallest countries.",
    ],
    ["zurich", "Zurich", "The old town and the lake."],
    ["interlaken", "Interlaken", "Between two lakes, facing the Jungfrau."],
  ]),
  inclusions: [
    "Round-trip flights from Cochin or Bangalore to Paris",
    "3-star hotel with breakfast",
    "Basic car rental",
    "Basic car insurance",
    "Travel insurance",
    "Cross-border charges",
    "Visa charges",
    "VFS charges",
  ],
  exclusions: [
    "Other meals",
    "Road tolls and zero-waiver car insurance",
    "Parking charges",
    "Traffic fines or legal penalties",
    "Car fuel for the trip",
    "GST, TCS and other taxes",
    "Deposits, if any",
  ],
  travelTips: [
    "Late spring to early autumn suits this route best; the alpine sections can see snow and pass closures outside those months.",
    "Three days are long drives: Luxembourg to Munich, Seiser Alm to Zurich and Interlaken to Paris. Share the driving and plan two proper breaks.",
    "Austria and Switzerland require a motorway vignette, and the Brenner motorway has its own toll. Ask at pick-up which vignettes the car already carries.",
    "Italian town centres often have restricted traffic zones marked ZTL. Park outside them and walk in to avoid fines.",
    "Switzerland and Liechtenstein use the Swiss franc; cards are accepted almost everywhere.",
    "Pack layers. It can be warm in Paris and close to freezing on the Seiser Alm on the same trip.",
    "The itinerary is subject to change and availability.",
  ],
  faqs: [
    {
      question: "How much driving is there?",
      answer:
        "About 2,800 km over eight driving days. Five of them are four and a half hours or less. Three are long days of around six to seven hours, and we recommend sharing the driving on those.",
    },
    {
      question: "Is mountain driving difficult?",
      answer:
        "The alpine roads on this route are well built and well signed, and most of the distance is motorway. The climb to the Seiser Alm and some stretches between Merano and Switzerland are winding. Take them slowly, and tell us if you would prefer a route that avoids high passes.",
    },
    ...sharedFaqs,
  ],
  seoTitle: "Euro Drive: 11-day self-drive through 9 countries",
  seoDescription:
    "An 11-day, 10-night self-drive loop from Paris through Brussels, Amsterdam, Luxembourg, Munich, the Dolomites, Liechtenstein and Switzerland. Starting from ₹193,000 per person.",
};

export const europeDrives = [discoverEurope, euroDrive];
