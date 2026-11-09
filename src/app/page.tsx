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
import { publicContent, settings, demoEnabled } from "@/lib/store";
import { photos } from "@/lib/seed-data";
import { Finder } from "@/components/finder";
import { SectionTitle, TripCard } from "@/components/ui";
import { Footer } from "@/components/footer";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [items, s] = await Promise.all([publicContent(), settings()]);
  const holidays = items
      .filter((x) => x.kind === "holiday" && x.featured)
      .slice(0, 3),
    destinations = items.filter((x) => x.kind === "destination").slice(0, 6),
    resorts = items
      .filter((x) => x.kind === "resort" && x.featured)
      .slice(0, 2);
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
          {demoEnabled() && (
            <p className="demo-notice">
              Development preview · Trips and property details below are
              illustrative, not bookable offers.
            </p>
          )}
          <section className="section destinations">
            <SectionTitle
              eyebrow="A little inspiration"
              title="Where will your curiosity take you?"
              href="/destinations"
              label="All destinations"
            />
            <div className="destination-grid">
              {destinations.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.slug}`}
                  className="destination-tile"
                >
                  <Image
                    src={d.image}
                    unoptimized={d.image.startsWith("/api/media/")}
                    alt={d.imageAlt}
                    fill
                    sizes="(max-width:640px) 44vw, 16vw"
                  />
                  <div />
                  <span>
                    {d.title}
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
          <section className="service-grid">
            {[
              {
                icon: Globe2,
                title: "Holidays, made personal",
                text: "Big adventures. Little escapes. All yours.",
                href: "/holidays",
              },
              {
                icon: Route,
                title: "Europe, one road at a time",
                text: "The freedom to take the scenic route.",
                href: "/europe-road-trips",
              },
              {
                icon: Palmtree,
                title: "A slower kind of Kerala",
                text: "Beautiful stays. Room to unwind.",
                href: "/kerala-resorts",
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
              title="Your next great story starts here"
              description="A few journeys to spark an idea. We’ll make the details your own."
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
          <section className="section kerala-section">
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
              <Link href="/kerala-resorts" className="text-link">
                Find your Kerala stay
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="kerala-cards">
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
