import { publicAsset } from "@/lib/assets";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin, Check, ArrowUpRight } from "lucide-react";
import { publicContent, catalogueState } from "@/lib/store";
import { CatalogueStatus } from "@/components/catalogue-status";
import { paths } from "@/lib/types";
import { Price, CheckList, TripCard } from "@/components/ui";
import { Footer } from "@/components/footer";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const item = (await publicContent()).find(
    (x) => x.slug === slug && paths[x.kind] === section,
  );
  return {
    title:
      item?.seoTitle ||
      item?.title ||
      ((await catalogueState()).unavailable
        ? "Trip details temporarily unavailable"
        : "Not found"),
    description: item?.seoDescription || item?.summary,
    alternates: { canonical: `/${section}/${slug}` },
    robots: item?.demo ? { index: false, follow: false } : undefined,
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  if (section === "kerala-resorts") redirect(`/resorts-and-villas/${slug}`);
  const all = await publicContent();
  if ((await catalogueState()).unavailable)
    return (
      <main id="main" className="container page-main">
        <h1>Trip details temporarily unavailable</h1>
        <CatalogueStatus />
      </main>
    );
  const item = all.find((x) => x.slug === slug && paths[x.kind] === section);
  if (!item) notFound();
  const href = `/plan-my-trip?item=${encodeURIComponent(item.id)}&destination=${encodeURIComponent(item.location)}&kind=${item.kind === "destination" ? "holiday" : item.kind}`;
  return (
    <>
      <main id="main" className="container page-main">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/${section}`}>{section.replaceAll("-", " ")}</Link>
          <span>/</span>
          <span>{item.title}</span>
        </div>
        <div className="detail-hero">
          <Image
            src={item.image || publicAsset("brand/placeholder.svg")}
            unoptimized={item.image.startsWith("/api/media/")}
            alt={item.imageAlt}
            fill
            priority
            sizes="100vw"
          />
          <div className="detail-heading">
            {item.days > 0 && (
              <span className="pill">
                {item.days} days · {item.nights} nights
              </span>
            )}
            <h1>{item.title}</h1>
            <p>
              <MapPin size={16} />
              {item.location}
            </p>
          </div>
        </div>
        <div className="detail-grid">
          <div>
            <section className="detail-section">
              <p className="eyebrow">A journey made yours</p>
              <h2>
                A little about this{" "}
                {item.kind === "resort" ? "stay" : "journey"}
              </h2>
              <p>{item.description}</p>
              <div className="tag-list">
                {item.themes.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </section>
            {item.gallery.length > 0 && (
              <section className="detail-section">
                <h2>Picture yourself here</h2>
                <div className="gallery-row">
                  {item.gallery.map((url, i) => (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      key={i}
                      aria-label={`Open photo ${i + 1} of ${item.title}`}
                    >
                      <Image
                        src={url}
                        unoptimized={url.startsWith("/api/media/")}
                        alt={
                          item.galleryAlt?.[url] ||
                          `${item.imageAlt} — view ${i + 1}`
                        }
                        fill
                        sizes="200px"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
            {item.accommodation && (
              <section className="detail-section">
                <h2>Your accommodation</h2>
                <p>{item.accommodation}</p>
              </section>
            )}
            {item.kind !== "resort" && item.kind !== "destination" && (
              <section className="detail-section">
                <p className="eyebrow">One lovely day at a time</p>
                <h2>
                  {item.kind === "road-trip"
                    ? "Your route, stop by stop"
                    : "Your itinerary"}
                </h2>
                <ol className="timeline">
                  {item.itinerary.map((d, i) => (
                    <li key={i}>
                      <span>{i + 1}</span>
                      <div>
                        <h3>{d.title}</h3>
                        <p>{d.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="small-note">
                  Your final itinerary and arrangements will be confirmed in
                  your personalised quote.
                </p>
              </section>
            )}
            {item.kind === "road-trip" && (
              <section className="detail-section">
                <h2>Travel comfortably</h2>
                {item.vehicles.length ? (
                  item.vehicles.map((v, i) => (
                    <div className="vehicle-card" key={i}>
                      <h3>{v.name}</h3>
                      <p>
                        Passengers: {v.passengers} · Luggage: {v.luggage}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>
                    Tell us your group size and luggage requirements. Vehicle
                    options will be included in your quote.
                  </p>
                )}
              </section>
            )}
            {item.kind === "resort" && (
              <>
                <section className="detail-section">
                  <h2>Rooms & meal plans</h2>
                  <CheckList items={item.rooms} />
                  <CheckList items={item.mealPlans} />
                </section>
                <section className="detail-section">
                  <h2>At the property</h2>
                  {item.amenities.length ? (
                    <CheckList items={item.amenities} />
                  ) : (
                    <p>
                      Amenities and property information will be confirmed by
                      the team.
                    </p>
                  )}
                </section>
              </>
            )}
            {item.kind !== "destination" && (
              <section className="detail-section">
                <h2>What’s included</h2>
                <CheckList items={item.inclusions} />
                <h2 style={{ marginTop: 30 }}>What’s not included</h2>
                <CheckList items={item.exclusions} />
              </section>
            )}
            {item.price && (
              <section className="detail-section">
                <h2>Pricing notes</h2>
                <Price item={item} />
              </section>
            )}
          </div>
          <aside className="enquiry-aside">
            <p className="eyebrow">Make this journey yours</p>
            <h2>
              Your trip.
              <br />
              Your kind of perfect.
            </h2>
            <Price item={item} />
            <p>
              Share your dates, travel style and little must-haves. We’ll help
              shape the details.
            </p>
            <Link className="button" href={href}>
              Request a quote
              <ArrowUpRight size={18} />
            </Link>
            <div className="aside-features">
              <p>
                <Check size={14} />
                Personalised to your group
              </p>
              <p>
                <Check size={14} />
                Clear inclusions in your quote
              </p>
              <p>
                <Check size={14} />
                No booking or payment at this stage
              </p>
            </div>
          </aside>
        </div>
        {item.kind === "destination" && (
          <section className="section">
            <h2 style={{ marginBottom: 25 }}>
              Explore journeys in {item.title}
            </h2>
            <div className="trip-grid">
              {all
                .filter(
                  (x) =>
                    x.kind !== "destination" &&
                    (x.location
                      .toLowerCase()
                      .includes(item.title.toLowerCase()) ||
                      x.country?.toLowerCase() === item.title.toLowerCase() ||
                      x.title.toLowerCase().includes(item.title.toLowerCase())),
                )
                .slice(0, 6)
                .map((x) => (
                  <TripCard item={x} key={x.id} />
                ))}
            </div>
          </section>
        )}
      </main>
      <div className="detail-mobile-action">
        <span>
          A trip made for you<strong>Request a personalised quote</strong>
        </span>
        <Link href={href} className="button small">
          Enquire
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <Footer />
    </>
  );
}
