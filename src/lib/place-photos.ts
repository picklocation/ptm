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
  {
    key: "wayanad",
    alt: "Pookode Lake in Wayanad, Kerala",
    match: ["wayanad"],
    source: "Wikimedia Commons",
    author: "Ingo Mehling",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Wayanad_-_Pookode_Lake_-_1.jpg",
  },
  {
    key: "munnar",
    alt: "Tea plantations on the hills of Munnar, Kerala",
    match: ["munnar"],
    source: "Wikimedia Commons",
    author: "www.eatoutzone.com",
    licence: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Tea_plantations_in_Munnar.jpg",
  },
  {
    key: "vagamon",
    alt: "Rolling meadows of Vagamon, Kerala",
    match: ["vagamon", "vagomon"],
    source: "Wikimedia Commons",
    author: "Vengolis",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Idukki_0839.jpg",
  },
  {
    key: "ooty",
    alt: "Marlimund Lake near Ooty in the Nilgiris",
    match: ["ooty", "nilgiris"],
    source: "Wikimedia Commons",
    author: "Timothy A. Gonsalves",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:SW_Marlimund_Lake_Ooty_Aug25_A7CR_07269.jpg",
  },
  {
    key: "kodaikanal",
    alt: "Kodaikanal Lake among the hills of Tamil Nadu",
    match: ["kodaikanal"],
    source: "Wikimedia Commons",
    author: "Marcus334",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Kodaikanal_Lake_View.JPG",
  },
  {
    key: "kulukkumala",
    alt: "Sunrise over the peak at Kolukkumalai",
    match: ["kolukkumalai", "kulukkumala", "kolukkumallai"],
    source: "Wikimedia Commons",
    author: "Musheer1999",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Sunrise_over_the_peak_at_Kolukkumalai,_Kerala.jpg",
  },
  {
    key: "kakkadampoyil",
    alt: "Misty hillside farms at Kakkadampoyil, Kerala",
    match: ["kakkadampoyil"],
    source: "Wikimedia Commons",
    author: "Prof tpms",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:KakkadampoyilChaliyar_S_Valavu.jpg",
  },
  {
    key: "vattavada",
    alt: "Terraced farms in the Vattavada valley, Kerala",
    match: ["vattavada"],
    source: "Wikimedia Commons",
    author: "Ahamedhjewadh",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vattavada_Valley.jpg",
  },
  {
    key: "bangalore",
    alt: "Vidhana Soudha in Bengaluru",
    match: ["bangalore", "bengaluru"],
    source: "Wikimedia Commons",
    author: "Moheen Reeyad",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vidhana_Soudha,_front_(01).jpg",
  },
  {
    key: "varkala",
    alt: "Varkala beach seen from the cliff, Kerala",
    match: ["varkala"],
    source: "Wikimedia Commons",
    author: "Lukas Vacovsky",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Varkala_beach_-_cliff_view.JPG",
  },
  {
    key: "thekkady",
    alt: "Periyar Lake at Thekkady, Kerala",
    match: ["thekkady", "periyar"],
    source: "Wikimedia Commons",
    author: "Sibyperiyar",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Thekkady,_Periyar_Lake.JPG",
  },
  {
    key: "kochi",
    alt: "Chinese fishing nets at Fort Kochi, Kerala",
    match: ["kochi", "cochin", "fort kochi"],
    source: "Wikimedia Commons",
    author: "Ingo Mehling",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Chinese_Fishing_Nets_-_3.jpg",
  },
  {
    key: "calicut",
    alt: "Kozhikode beach under monsoon clouds",
    match: ["calicut", "kozhikode"],
    source: "Wikimedia Commons",
    author: "Gannu03",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Kozhikode_Beach_9.jpg",
  },
  {
    key: "coorg",
    alt: "Paddy fields and coffee hills in Coorg, Karnataka",
    match: ["coorg", "kodagu"],
    source: "Wikimedia Commons",
    author: "Timothy A. Gonsalves",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Paddy_Hills_Inakanahalli_Coorg_Nov24_A7CR_04454.jpg",
  },
  {
    key: "mauritius",
    alt: "Le Morne peninsula and its lagoon, Mauritius",
    match: ["mauritius", "grand baie", "port louis", "chamarel"],
    source: "Wikimedia Commons",
    author: "dronepicr",
    licence: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Le_Morne_Peninsula_in_Mauritius_(53697779236).jpg",
  },
  {
    key: "bergen",
    alt: "Wooden wharf houses of Bryggen in Bergen, Norway",
    match: ["bergen", "norway", "flam"],
    source: "Wikimedia Commons",
    author: "Diego Delso",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Bryggen,_Bergen,_Noruega,_2019-09-08,_DD_115-117_PAN.jpg",
  },
  {
    key: "darjeeling",
    alt: "Mist over a tea garden in Darjeeling",
    match: ["darjeeling", "gangtok", "bagdogra to gangtok"],
    source: "Wikimedia Commons",
    author: "Joydeep",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Tea_plantation_Darjeeling.JPG",
  },
  {
    key: "manali",
    alt: "Solang Valley near Manali, Himachal Pradesh",
    match: ["manali", "chandigarh", "himachal"],
    source: "Wikimedia Commons",
    author: "Vikas Choudhary",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Solang_Valley,_Manali.jpg",
  },
  {
    key: "udaipur",
    alt: "City Palace beside Lake Pichola, Udaipur",
    match: ["udaipur"],
    source: "Wikimedia Commons",
    author: "Jakub Hałun",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:20191207_City_Palace,_Mohan_Temple_and_Lake_Pichola,_Udaipur,_1523_7262.jpg",
  },
  {
    key: "jodhpur",
    alt: "Mehrangarh Fort, Jodhpur",
    match: ["jodhpur"],
    source: "Wikimedia Commons",
    author: "Yann",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Mehrangarh_Fort_2,_Jodhpur,_Rajasthan,_India.jpg",
  },
  {
    key: "andaman",
    alt: "Radhanagar Beach on Havelock Island, Andaman",
    match: [
      "andaman",
      "port blair",
      "swaraj dweep",
      "shaheed dweep",
      "havelock",
      "neil island",
    ],
    source: "Wikimedia Commons",
    author: "Vyacheslav Argenberg",
    licence: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Havelock_Island,_Radhanagar_Beach_before_sunset,_Andaman_Islands.jpg",
  },
  {
    key: "lucerne",
    alt: "Chapel Bridge and Water Tower, Lucerne",
    match: ["lucerne", "luzern"],
    source: "Wikimedia Commons",
    author: "Ikiwaner",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Luzern_Kapellbruecke.jpg",
  },
  {
    key: "tuscany",
    alt: "Sunset over the Val d’Orcia from Pienza, Tuscany",
    match: ["tuscany", "val d orcia", "pienza"],
    source: "Wikimedia Commons",
    author: "Anna.Massini",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Tramonto_sulla_Val_d%27Orcia_da_Pienza_-_Patrimonio_Unesco.jpg",
  },
  {
    key: "phuket",
    alt: "Sunrise at Banana Beach, Phuket",
    match: ["phuket"],
    source: "Wikimedia Commons",
    author: "Anton Zelenov",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Banana_beach_Phuket_2017_-_02.jpg",
  },
  {
    key: "kandy",
    alt: "Kandy Lake beside the Temple of the Tooth, Sri Lanka",
    match: ["kandy"],
    source: "Wikimedia Commons",
    author: "Philip Nalangan",
    licence: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Sacred_Tooth_Relic_Temple_1.jpg",
  },
  {
    key: "brussels",
    alt: "Guildhalls on the Grand-Place, Brussels",
    match: ["brussels", "belgium"],
    source: "Wikimedia Commons",
    author: "iMahesh",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Grand-Place_(Brussels)_-_Row_of_historic_Baroque_guildhouses_with_visitors_on_the_square.jpg",
  },
  {
    key: "amsterdam",
    alt: "Canal houses on the Singel, Amsterdam",
    match: ["amsterdam", "netherlands"],
    source: "Wikimedia Commons",
    author: "Dietmar Rabich",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Amsterdam_(NL),_Singel_--_2015_--_7171.jpg",
  },
  {
    key: "cologne",
    alt: "Hohenzollern Bridge and Cologne Cathedral at dusk",
    match: ["cologne", "koln"],
    source: "Wikimedia Commons",
    author: "Thomas Wolf (Der Wolf im Wald)",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Hohenzollernbr%C3%BCcke_K%C3%B6lner_Dom.jpg",
  },
  {
    key: "luxembourg",
    alt: "The Grund quarter of Luxembourg City at night",
    match: ["luxembourg", "luxembourg city"],
    source: "Wikimedia Commons",
    author: "Pierre Blaché",
    licence: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Grund,_Luxembourg_City_(54540538196).jpg",
  },
  {
    key: "reims",
    alt: "West front of Reims Cathedral",
    match: ["reims"],
    source: "Wikimedia Commons",
    author: "Mathieu Kappler",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Reims_-_cath%C3%A9drale_Notre-Dame_-_2023-05-27_-_05.jpg",
  },
  {
    key: "innsbruck",
    alt: "The Golden Roof in Innsbruck",
    match: ["innsbruck"],
    source: "Wikimedia Commons",
    author: "Wilfredor",
    licence: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Goldenes_Dachl_from_Innsbruck_2.jpg",
  },
  {
    key: "seiser-alm",
    alt: "Autumn meadows of the Seiser Alm beneath the Sassolungo",
    match: ["seiser alm", "alpe di siusi", "dolomites"],
    source: "Wikimedia Commons",
    author: "Wolfgang Moroder",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Autumn_on_the_meadows_of_Seiser_Alm_with_Saslong.jpg",
  },
  {
    key: "merano",
    alt: "Historic buildings on the Passer promenade, Merano",
    match: ["merano", "meran"],
    source: "Wikimedia Commons",
    author: "ManfredK",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Meran_Passerpromenade_62-76.jpg",
  },
  {
    key: "vaduz",
    alt: "Vaduz Castle on its hillside, Liechtenstein",
    match: ["vaduz", "liechtenstein"],
    source: "Wikimedia Commons",
    author: "AnonymousGuyFawkes",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Vaduz_Castle_1.jpg",
  },
  {
    key: "reschen",
    alt: "The sunken bell tower in Lake Reschen, South Tyrol",
    match: ["reschen", "lake reschen", "resia"],
    source: "Wikimedia Commons",
    author: "Dietmar Rabich",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Graun_im_Vinschgau_(IT),_Campanile_di_Santa_Caterina_--_2026_--_3005.jpg",
  },
  {
    key: "bolzano",
    alt: "Piazza Walther in the centre of Bolzano",
    match: ["bolzano", "bozen"],
    source: "Wikimedia Commons",
    author: "Aciarium",
    licence: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Waltherplatz_Bozen_Luftansicht.jpg",
  },
  {
    key: "glorenza",
    alt: "The walled town of Glorenza in the Venosta valley",
    match: ["glorenza", "glurns"],
    source: "Wikimedia Commons",
    author: "Kuebi",
    licence: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Glurns_Stadt_01.jpg",
  },
  {
    key: "mittenwald",
    alt: "Frescoed house front on the Obermarkt, Mittenwald",
    match: ["mittenwald"],
    source: "Wikimedia Commons",
    author: "Johannes Robalotoff",
    licence: "CC BY-SA 3.0 de",
    page: "https://commons.wikimedia.org/wiki/File:Obermarkt-1-Mittenwald-JR-E-6259-2022-08-14.jpg",
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
  // Real packages are curated by hand; only sample records are matched.
  if (!c.demo) return c;
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
