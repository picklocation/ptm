import type { Content } from "./types";

// Location photographs checked against the place they are assigned to.
// Files live in public/images/places. `match` lists lower-case names that
// select the photo; the first stop of a route decides, then title, state and
// country. Credits are shown on /photo-credits (required for Wikimedia files).
export type PlacePhoto = {
  key: string;
  alt: string;
  match: string[];
  source: "Unsplash" | "Wikimedia Commons";
  author?: string;
  licence?: string;
  page?: string;
};
export const placePhotos: PlacePhoto[] = [
  // PLACE-PHOTOS-START
  {
    key: "paris",
    alt: "Eiffel Tower beside the Seine in Paris",
    match: ["paris", "france"],
    source: "Unsplash",
  },
  {
    key: "venice",
    alt: "Santa Maria della Salute on the Grand Canal, Venice",
    match: ["venice"],
    source: "Unsplash",
  },
  {
    key: "rome",
    alt: "The Colosseum in Rome",
    match: ["rome"],
    source: "Unsplash",
  },
  {
    key: "florence",
    alt: "Florence skyline with the cathedral dome and bell tower",
    match: ["florence", "siena"],
    source: "Unsplash",
  },
  {
    key: "cinque-terre",
    alt: "Colourful cliffside houses of Manarola, Cinque Terre",
    match: ["cinque terre", "italy"],
    source: "Unsplash",
  },
  {
    key: "maldives",
    alt: "Overwater villas in a turquoise Maldives lagoon",
    match: ["maldives", "male", "north male atoll", "south male atoll"],
    source: "Unsplash",
  },
  {
    key: "lauterbrunnen",
    alt: "Lauterbrunnen valley and Staubbach Falls, Switzerland",
    match: ["lauterbrunnen", "switzerland"],
    source: "Unsplash",
  },
  {
    key: "zurich",
    alt: "Zurich old town along the Limmat river",
    match: ["zurich"],
    source: "Unsplash",
  },
  {
    key: "bali",
    alt: "Pura Ulun Danu Bratan temple on Lake Bratan, Bali",
    match: ["bali", "indonesia", "sanur"],
    source: "Unsplash",
  },
  {
    key: "ubud",
    alt: "Tegallalang rice terraces near Ubud, Bali",
    match: ["ubud"],
    source: "Unsplash",
  },
  {
    key: "tanah-lot",
    alt: "Tanah Lot sea temple at sunset, Bali",
    match: ["tanah lot", "uluwatu", "seminyak"],
    source: "Unsplash",
  },
  {
    key: "krabi",
    alt: "Longtail boats on the beach at Railay, Krabi",
    match: ["krabi", "railay"],
    source: "Unsplash",
  },
  {
    key: "chiang-mai",
    alt: "Temple chedi and pavilions in Chiang Mai, Thailand",
    match: ["chiang mai", "thailand"],
    source: "Unsplash",
  },
  {
    key: "bangkok",
    alt: "Temple spires in Bangkok",
    match: ["bangkok"],
    source: "Unsplash",
  },
  {
    key: "ha-long-bay",
    alt: "Limestone islands of Ha Long Bay, Vietnam",
    match: ["ha long", "halong", "vietnam"],
    source: "Unsplash",
  },
  {
    key: "kuala-lumpur",
    alt: "Petronas Twin Towers on the Kuala Lumpur skyline",
    match: ["kuala lumpur", "malaysia"],
    source: "Unsplash",
  },
  {
    key: "singapore",
    alt: "Marina Bay Sands and the bay, Singapore",
    match: ["singapore", "marina bay", "sentosa"],
    source: "Unsplash",
  },
  {
    key: "ella",
    alt: "Train crossing the Nine Arch Bridge at Ella, Sri Lanka",
    match: ["ella", "sri lanka"],
    source: "Unsplash",
  },
  {
    key: "nepal",
    alt: "Stupa beneath Himalayan peaks in Nepal",
    match: ["nepal", "kathmandu", "pokhara", "phewa lake"],
    source: "Unsplash",
  },
  {
    key: "bhutan",
    alt: "Paro Taktsang, the Tiger’s Nest monastery, Bhutan",
    match: ["bhutan", "paro", "thimphu", "punakha"],
    source: "Unsplash",
  },
  {
    key: "srinagar",
    alt: "Houseboats on Dal Lake, Srinagar",
    match: ["srinagar", "dal lake", "kashmir"],
    source: "Unsplash",
  },
  {
    key: "delhi",
    alt: "India Gate in New Delhi",
    match: ["delhi", "new delhi"],
    source: "Unsplash",
  },
  {
    key: "agra",
    alt: "The Taj Mahal and its reflecting pool, Agra",
    match: ["agra", "taj mahal", "fatehpur sikri"],
    source: "Unsplash",
  },
  {
    key: "jaipur",
    alt: "Hawa Mahal, the Palace of Winds, Jaipur",
    match: ["jaipur", "rajasthan"],
    source: "Unsplash",
  },
  {
    key: "goa",
    alt: "Palm-lined beach huts in Goa",
    match: [
      "goa",
      "north goa",
      "south goa",
      "panaji",
      "panjim",
      "old goa",
      "candolim",
      "palolem",
    ],
    source: "Unsplash",
  },
  {
    key: "alleppey",
    alt: "Houseboat on the palm-lined backwaters of Kerala",
    match: ["alleppey", "alappuzha", "kumarakom", "backwaters", "kerala"],
    source: "Unsplash",
  },
  {
    key: "barcelona",
    alt: "Barcelona’s Eixample district around the Sagrada Família",
    match: ["barcelona", "spain"],
    source: "Unsplash",
  },
  {
    key: "madrid",
    alt: "Gran Vía and the Metropolis building, Madrid",
    match: ["madrid"],
    source: "Unsplash",
  },
  {
    key: "lisbon",
    alt: "Yellow tram in central Lisbon",
    match: ["lisbon", "sintra"],
    source: "Unsplash",
  },
  {
    key: "porto",
    alt: "Ribeira riverfront on the Douro, Porto",
    match: ["porto", "douro", "portugal"],
    source: "Unsplash",
  },
  {
    key: "dubrovnik",
    alt: "Dubrovnik’s walled old town on the Adriatic",
    match: ["dubrovnik", "croatia"],
    source: "Unsplash",
  },
  {
    key: "hallstatt",
    alt: "Hallstatt village beside its lake, Austria",
    match: ["hallstatt", "austria"],
    source: "Unsplash",
  },
  {
    key: "munich",
    alt: "Munich old town rooftops and St Peter’s Church",
    match: ["munich", "germany"],
    source: "Unsplash",
  },
  {
    key: "nice",
    alt: "Promenade du Paillon water mirror in Nice",
    match: ["nice", "french riviera"],
    source: "Unsplash",
  },
  // PLACE-PHOTOS-END
];
export const placePhotoUrl = (photo: PlacePhoto) =>
  `/images/places/${photo.key}.webp`;
const byKey = new Map(placePhotos.map((p) => [p.key, p]));
export const placePhoto = (key: string) => byKey.get(key);

const fold = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function find(text: string) {
  const value = ` ${fold(text).replace(/[^a-z0-9]+/g, " ")} `;
  let best: { photo: PlacePhoto; at: number; size: number } | undefined;
  for (const photo of placePhotos)
    for (const name of photo.match) {
      const at = value.indexOf(` ${name} `);
      // Earliest mention wins; a longer name beats a shorter one at the same spot.
      if (
        at >= 0 &&
        (!best || at < best.at || (at === best.at && name.length > best.size))
      )
        best = { photo, at, size: name.length };
    }
  return best?.photo;
}
type Placed = Pick<
  Content,
  | "title"
  | "location"
  | "state"
  | "country"
  | "locations"
  | "stayDestinationSlug"
>;
export function placePhotoFor(c: Placed): PlacePhoto | undefined {
  for (const text of [
    c.stayDestinationSlug,
    ...(c.locations || []),
    ...c.location.split(/[·→>|]/),
    c.title,
    c.state,
    c.country,
  ]) {
    const photo = text && find(text);
    if (photo) return photo;
  }
}

// Images this module may replace: the original shared stock set and photos it
// assigned earlier. Anything else (an admin upload, a pasted link) is kept.
export const isReplaceablePhoto = (url: string) =>
  /\/website-public\/catalogue\/photo-[\w-]+\.jpg$/.test(url) ||
  url.startsWith("/images/places/");

// Returns the record with its location photo, or the same object when nothing
// should change.
export function withPlacePhoto<T extends Content>(c: T): T {
  const photo = placePhotoFor(c);
  if (!photo) return c;
  const url = placePhotoUrl(photo);
  const swapCover = !c.image || isReplaceablePhoto(c.image);
  const gallery = c.gallery.map((g) => (isReplaceablePhoto(g) ? url : g));
  const uniqueGallery = [...new Set(gallery)];
  const galleryAlt = Object.fromEntries(
    uniqueGallery.map((g) => [
      g,
      g === url ? photo.alt : c.galleryAlt?.[g] || "",
    ]),
  );
  const next = {
    ...c,
    image: swapCover ? url : c.image,
    imageAlt: swapCover ? photo.alt : c.imageAlt,
    gallery: uniqueGallery,
    ...(c.galleryAlt || uniqueGallery.length ? { galleryAlt } : {}),
  };
  return JSON.stringify(next) === JSON.stringify(c) ? c : next;
}
