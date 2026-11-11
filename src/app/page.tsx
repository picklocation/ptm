import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Globe2,
  Route,
  Palmtree,
  MoveRight,
  Check,
  MapPin,
} from "lucide-react";
import { publicContent, settings } from "@/lib/store";
import { photos } from "@/lib/seed-data";
import { Finder } from "@/components/finder";
import { SectionTitle, TripCard } from "@/components/ui";
import {
  DestinationRow,
  type DestinationTile,
} from "@/components/destination-row";
import { visaGuides } from "@/lib/visa-guides";
import { Footer } from "@/components/footer";
import { CatalogueStatus } from "@/components/catalogue-status";
import { inCollection } from "@/lib/classification";
const destinationCaptions: Record<string, string> = {
  Bali: "Temples, terraces & coast",
  Switzerland: "Lakes beneath the Alps",
  Kerala: "Backwaters & tea hills",
  Thailand: "Islands & golden temples",
  Italy: "Art, piazzas & coastlines",
  Singapore: "Gardens above the city",
  Maldives: "Life by the lagoon",
  Malaysia: "City lights & island days",
  "Sri Lanka": "Tea country to the coast",
  Mauritius: "Beyond the blue lagoon",
  Japan: "Mountain trails & city lights",
  Norway: "Along the fjords",
  Kenya: "Across the savannah",
  Kashmir: "Lakes & mountain valleys",
  Rajasthan: "Forts & desert skies",
  "Delhi, Agra & Jaipur": "Three cities, centuries of stories",
  Goa: "Slow days by the sea",
  Andaman: "Islands in the blue",
  Bhutan: "Monasteries in the mountains",
  Nepal: "Himalayan trails & valleys",
  "South India": "Hill stays & coastal escapes",
};
export const dynamic = "force-dynamic";
export default async function Home() {
  const [items, s] = await Promise.all([publicContent(), settings()]);
  const holidays = items
      .filter((x) => x.kind === "holiday" && x.featured)
      .slice(0, 8),
    destinations = items.filter((x) => x.kind === "destination").slice(0, 6),
    resorts = items
      .filter((x) => inCollection(x, "resorts-and-villas") && x.featured)
      .slice(0, 4);
  const tile = (
    name: string,
    item: (typeof items)[number],
    href: string,
  ): DestinationTile => ({
    name,
    caption: destinationCaptions[name],
    image: item.image,
    alt: item.imageAlt,
    href,
  });
  const popularTiles = destinations.map((d) =>
    tile(d.title, d, "/destinations/" + d.slug),
  );
  // Treat Bali and Indonesia as the same destination for row selection.
  const destinationKey = (name: string) => {
    const key = name.trim().toLowerCase();
    return key === "bali" ? "indonesia" : key;
  };
  const usedDestinations = new Set(
    destinations.flatMap((d) =>
      [d.title, d.country]
        .filter((name): name is string => !!name)
        .map(destinationKey),
    ),
  );
  const internationalTiles: DestinationTile[] = [];
  for (const destination of items.filter(
    (x) =>
      x.kind === "destination" && x.region !== "India" && x.country !== "India",
  )) {
    const keys = [destination.title, destination.country]
      .filter((name): name is string => !!name)
      .map(destinationKey);
    if (keys.some((key) => usedDestinations.has(key))) continue;
    internationalTiles.push(
      tile(destination.title, destination, "/destinations/" + destination.slug),
    );
    keys.forEach((key) => usedDestinations.add(key));
  }
  for (const item of items.filter(
    (x) =>
      x.kind === "holiday" &&
      x.country &&
      x.country !== "India" &&
      x.region !== "India",
  )) {
    if (
      item.country!.includes("/") ||
      usedDestinations.has(destinationKey(item.country!))
    )
      continue;
    internationalTiles.push(
      tile(
        item.country!,
        item,
        "/international-trips?q=" + encodeURIComponent(item.country!),
      ),
    );
    usedDestinations.add(destinationKey(item.country!));
  }
  const visaTiles = visaGuides.flatMap((v) => {
    const item = items.find(
      (x) => x.kind === "holiday" && x.country === v.country,
    );
    return item
      ? [
          tile(
            v.country,
            item,
            "/visa-free-destinations?q=" + encodeURIComponent(v.country),
          ),
        ]
      : [];
  });
  const domesticTiles = [
    ["Kerala", "kerala", "Kerala"],
    ["Kashmir", "kashmir-valley", "Kashmir"],
    ["Rajasthan", "rajasthan-royal-trail", "Rajasthan"],
    ["Delhi, Agra & Jaipur", "golden-triangle", "Delhi"],
    ["Goa", "goa-coastal-break", "Goa"],
    ["Andaman", "andaman-island-days", "Andaman"],
    ["Bhutan", "bhutan-valley-journey", "Bhutan"],
    ["Nepal", "nepal-valleys-lakes", "Nepal"],
    ["Sri Lanka", "sri-lanka-tea-coast", "Sri Lanka"],
  ].flatMap(([name, id, query]) => {
    const item = items.find((x) => x.id === id);
    return item
      ? [tile(name, item, "/holidays?q=" + encodeURIComponent(query))]
      : [];
  });
  const southIndiaCover =
    items.find((x) => x.id === "wayanad") ||
    items.find((x) => x.id === "kerala");
  const southAsiaCover = items.find((x) => x.region === "South Asia");
  domesticTiles.unshift(
    {
      name: "Resorts & Stays",
      caption: "Find your place to unwind",
      image: photos.resort,
      alt: "Travel inspiration for a resort stay",
      href: "/resorts-and-stays",
    },
    {
      name: "South India",
      caption: "Hill stays & coastal escapes",
      image: southIndiaCover?.image || photos.kerala,
      alt: southIndiaCover?.imageAlt || "South India travel inspiration",
      href: "/south-india",
    },
    {
      name: "South Asia",
      caption: "Discover nearby journeys",
      image: southAsiaCover?.image || photos.kerala,
      alt: southAsiaCover?.imageAlt || "South Asia travel inspiration",
      href: "/south-asia",
    },
  );
  return (
    <>
      <main id="main">
        <section className="hero-wrap">
          <div className="hero">
            <Image
              src={photos.hero}
              alt="Sunlit alpine mountains above a green valley"
              fill
              priority
              loading="eager"
              sizes="100vw"
              className="hero-image"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <div className="hero-topline">
                <span className="tiny-line" />A world of possibilities. Your
                kind of journey.
              </div>
              <h1>
                Pick the place.
                <br />
                We’ll plan the way.
              </h1>
              <p>
                From the winding roads of Europe to the quiet backwaters of
                Kerala. Thoughtfully planned, entirely yours.
              </p>
              <div className="hero-actions">
                <Link href="/holidays" className="button light">
                  Explore trips
                  <span className="round-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </Link>
                <Link href="/plan-my-trip" className="hero-secondary">
                  Plan my trip
                  <MoveRight size={20} />
                </Link>
              </div>
            </div>
            <span className="hero-caption">
              <MapPin size={14} />
              Somewhere you’d rather be.
            </span>
          </div>
          <div className="finder-wrap">
            <Finder />
          </div>
        </section>
        <div className="container">
          <div className="reassurance">
            <span>
              <Check size={15} />
              Personalised to your pace
            </span>
            <span>
              <Check size={15} />
              Thoughtfully planned details
            </span>
            <span>
              <Check size={15} />A real person to plan with
            </span>
          </div>
          <CatalogueStatus />
          <DestinationRow
            title="Popular destinations"
            items={popularTiles}
            popular
            href="/destinations"
          />
          <div className="destination-groups">
            <DestinationRow
              title="International destinations"
              items={internationalTiles}
            />
            <DestinationRow
              title="Visa-Free-destinations"
              items={visaTiles}
              href="/visa-free-destinations"
            />
            <DestinationRow
              title="Domestic & neighbouring destinations"
              items={domesticTiles}
            />
          </div>
          <section
            className="collection-links"
            aria-label="Explore our collections"
          >
            {[
              ["International trips", "international-trips"],
              ["Domestic trips", "domestic-trips"],
              ["Resorts & Stays", "resorts-and-stays"],
              ["Europe road trips", "europe-road-trips"],
              ["Visa-Free-destinations", "visa-free-destinations"],
            ].map(([label, url]) => (
              <Link key={url} href={`/${url}`}>
                {label}
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </section>
          <section className="service-grid">
            {[
              {
                icon: Globe2,
                title: "International trips",
                text: "Multi-city holidays, island breaks and time to explore.",
                href: "/international-trips",
              },
              {
                icon: Route,
                title: "Europe, one road at a time",
                text: "The freedom to take the scenic route.",
                href: "/europe-road-trips",
              },
              {
                icon: Palmtree,
                title: "Resorts & Stays",
                text: "Find a stay for a weekend, a family trip or a quiet break.",
                href: "/resorts-and-stays",
              },
            ].map((c) => (
              <Link href={c.href} key={c.title} className="service-card">
                <span className="service-icon">
                  <c.icon size={24} />
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </section>
          <section className="section">
            <SectionTitle
              eyebrow="Good places to start"
              title="Holidays to make your own"
              description="Start with a route you like. We’ll help with the dates, stays and stops."
              href="/holidays"
              label="Explore holidays"
            />
            {holidays.length ? (
              <div className="trip-grid">
                {holidays.map((x) => (
                  <TripCard key={x.id} item={x} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>Your next journey starts with a conversation.</h3>
                <Link href="/plan-my-trip" className="button">
                  Plan my trip
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            )}
          </section>
        </div>
        <section className="road-feature">
          <div className="container road-feature-inner">
            <div className="road-photo">
              <Image
                src={photos.italy}
                alt="Colourful Italian coastal village above the sea"
                fill
                sizes="(max-width:800px) 100vw, 50vw"
              />
              <span className="image-note">
                Take the road that stays with you.
              </span>
            </div>
            <div className="road-copy">
              <p className="eyebrow">Europe, at your own pace</p>
              <h2>
                More little stops.
                <br />
                More big memories.
              </h2>
              <p>
                Alpine villages. Lakeside lunches. A winding road you’ll wish
                would never end. Let’s put together a Europe road trip that
                feels like you.
              </p>
              <div className="route-line">
                <span>Choose your places</span>
                <i />
                <span>Find your pace</span>
                <i />
                <span>Make it yours</span>
              </div>
              <Link href="/europe-road-trips" className="button">
                Explore Europe road trips
                <ArrowUpRight size={18} />
              </Link>
              <span className="small-note">
                Routes, stays and vehicle options tailored to your group.
              </span>
            </div>
          </div>
        </section>
        <div className="container">
          <section className="section stays-section">
            <div className="kerala-intro">
              <p className="eyebrow">Closer to calm</p>
              <h2>
                Kerala. <br />
                Breathe a little <br />
                deeper.
              </h2>
              <p>
                Wake up by the water. Wander through the green. Find a stay that
                lets you simply be.
              </p>
              <Link href="/resorts-and-stays" className="text-link">
                Explore Resorts & Stays
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="trip-grid">
              {resorts.map((x) => (
                <TripCard key={x.id} item={x} />
              ))}
            </div>
          </section>
          <section className="section process-section">
            <SectionTitle
              eyebrow="Less planning. More looking forward."
              title="From a little idea to a lovely journey"
            />
            <div className="process-grid">
              {[
                [
                  "Tell us your travel idea",
                  "A place, a feeling, a wish list. Start wherever you are.",
                ],
                [
                  "We shape it together",
                  "A thoughtful itinerary, refined around your pace and preferences.",
                ],
                [
                  "Review your personal quote",
                  "Clear arrangements and inclusions, before you decide.",
                ],
                [
                  "Get ready to make memories",
                  "Confirm the details with our team and look forward to your trip.",
                ],
              ].map(([title, desc], i) => (
                <div className="process-step" key={title}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="section faq-section">
            <div>
              <p className="eyebrow">Before you pack</p>
              <h2>
                A few things you
                <br />
                might be wondering.
              </h2>
              <Link href="/contact" className="text-link">
                Let’s talk
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="faqs">
              {s.faqs.map((f, i) => (
                <details key={i}>
                  <summary>
                    {f.question}
                    <span>+</span>
                  </summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="final-cta">
            <div>
              <p className="eyebrow">Your next chapter</p>
              <h2>
                Have a place in mind?
                <br />
                Let’s make it a plan.
              </h2>
              <p>
                Tell us a little about your dream trip. We’ll take it from
                there.
              </p>
            </div>
            <Link href="/plan-my-trip" className="button">
              Plan my trip
              <ArrowUpRight size={20} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
