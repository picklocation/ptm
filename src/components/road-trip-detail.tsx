import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BedDouble,
  CarFront,
  Check,
  Clock,
  Flag,
  MapPin,
  MessageCircle,
  Route,
  X,
} from "lucide-react";
import type { Content } from "@/lib/types";
import { publicAsset, skipOptimizer } from "@/lib/assets";
import { PriceFigure } from "./ui";
import { RouteMap } from "./route-map";

// Detail layout for self-drive packages that carry route stops. Everything
// shown comes from the package record; empty sections are left out.
export function RoadTripDetail({
  item,
  href,
  whatsapp,
}: {
  item: Content;
  href: string;
  whatsapp: boolean;
}) {
  const stops = item.routeStops || [];
  const countries = item.countries || [];
  const overnightPlaces = [
    ...new Set(stops.filter((s) => s.overnight).map((s) => s.name)),
  ];
  const parts = [
    ["Morning", "morning"],
    ["Afternoon", "afternoon"],
    ["Evening", "evening"],
  ] as const;
  const actions = (
    <div className="drive-actions">
      <Link className="button" href={href}>
        Request a quote
        <ArrowUpRight size={18} />
      </Link>
      {whatsapp && (
        <Link className="button secondary" href={`${href}&contact=whatsapp`}>
          <MessageCircle size={18} />
          Enquire on WhatsApp
        </Link>
      )}
    </div>
  );
  return (
    <>
      <div className="detail-hero drive-hero">
        <Image
          src={item.image || publicAsset("brand/placeholder.svg")}
          unoptimized={skipOptimizer(item.image)}
          alt={item.imageAlt}
          fill
          priority
          sizes="100vw"
        />
        <div className="detail-heading">
          <span className="pill">
            Self-drive · {item.days} days · {item.nights} nights
          </span>
          <h1>{item.title}</h1>
          {countries.length > 0 && (
            <p>
              <Flag size={16} />
              {countries.length} countries: {countries.join(" · ")}
            </p>
          )}
        </div>
      </div>
      <div className="drive-summary">
        <dl>
          <div>
            <dt>Duration</dt>
            <dd>
              {item.days} days / {item.nights} nights
            </dd>
          </div>
          {countries.length > 0 && (
            <div>
              <dt>Countries</dt>
              <dd>{countries.length}</dd>
            </div>
          )}
          {overnightPlaces.length > 0 && (
            <div>
              <dt>Overnight stops</dt>
              <dd>{overnightPlaces.length}</dd>
            </div>
          )}
          {item.price && (
            <div>
              <dt>Starting from</dt>
              <dd>
                <PriceFigure item={item} />
              </dd>
            </div>
          )}
        </dl>
        {actions}
      </div>
      <div className="detail-grid">
        <div>
          <section className="detail-section">
            <p className="eyebrow">Your road, your pace</p>
            <h2>About this journey</h2>
            <p>{item.description}</p>
            {item.price && <p className="small-note">{item.priceConditions}</p>}
          </section>
          {stops.length > 1 && (
            <section className="detail-section">
              <p className="eyebrow">The route</p>
              <h2>Where you’ll drive</h2>
              <RouteMap
                stops={stops}
                countries={countries}
                title={item.title}
              />
              <ol className="route-strip">
                {stops.map((s, i) => (
                  <li key={i} className={s.overnight ? "night" : ""}>
                    {s.name}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {item.highlights && item.highlights.length > 0 && (
            <section className="detail-section">
              <p className="eyebrow">Along the way</p>
              <h2>Places you’ll see</h2>
              <div className="highlight-grid">
                {item.highlights.map((h) => (
                  <figure key={h.name}>
                    <div>
                      <Image
                        src={h.image}
                        unoptimized={skipOptimizer(h.image)}
                        alt={h.imageAlt}
                        fill
                        sizes="(max-width:640px) 92vw, (max-width:1099px) 45vw, 280px"
                      />
                    </div>
                    <figcaption>
                      <strong>{h.name}</strong>
                      {h.text}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
          <section className="detail-section">
            <p className="eyebrow">One day at a time</p>
            <h2>Day-by-day itinerary</h2>
            <div className="day-list">
              {item.itinerary.map((d, i) => (
                <details key={i} open={i === 0}>
                  <summary>
                    <span className="day-number">Day {i + 1}</span>
                    <span className="day-title">{d.title}</span>
                    {d.driveDistance && (
                      <span className="day-drive">
                        <CarFront size={14} />
                        {d.driveDistance.replace(/^Approximately /, "~")}
                      </span>
                    )}
                  </summary>
                  <div className="day-body">
                    <p>{d.description}</p>
                    {(d.driveDistance || d.driveTime) && (
                      <div className="drive-box">
                        <strong>
                          <Route size={16} />
                          Today’s drive
                        </strong>
                        {d.driveDistance && (
                          <span>
                            <MapPin size={14} />
                            {d.driveDistance}
                          </span>
                        )}
                        {d.driveTime && (
                          <span>
                            <Clock size={14} />
                            {d.driveTime}
                          </span>
                        )}
                        {d.driveNote && <p>{d.driveNote}</p>}
                      </div>
                    )}
                    <div className="day-parts">
                      {parts.map(([label, key]) =>
                        d[key]?.length ? (
                          <div key={key}>
                            <h3>{label}</h3>
                            <ul>
                              {d[key]!.map((line, j) => (
                                <li key={j}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null,
                      )}
                    </div>
                    {d.overnight && (
                      <p className="day-night">
                        <BedDouble size={16} />
                        Overnight in {d.overnight}
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
            <p className="small-note">
              Distances and driving times are approximate and exclude stops and
              traffic. Sightseeing is a suggestion; entrance fees are not
              included unless your quote says so. Your final itinerary is
              confirmed in your personalised quote.
            </p>
          </section>
          {item.accommodation && (
            <section className="detail-section">
              <h2>Where you’ll stay</h2>
              <p>{item.accommodation}</p>
            </section>
          )}
          <section className="detail-section">
            <h2>What’s included</h2>
            <div className="incl-grid">
              <ul className="incl yes">
                {item.inclusions.map((x, i) => (
                  <li key={i}>
                    <Check size={16} />
                    {x}
                  </li>
                ))}
              </ul>
              <div>
                <h3>Not included</h3>
                <ul className="incl no">
                  {item.exclusions.map((x, i) => (
                    <li key={i}>
                      <X size={16} />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          {item.drivingInfo && item.drivingInfo.length > 0 && (
            <section className="detail-section">
              <p className="eyebrow">Before you drive</p>
              <h2>Car, insurance and licence</h2>
              <div className="info-grid">
                {item.drivingInfo.map((x) => (
                  <div key={x.title}>
                    <h3>{x.title}</h3>
                    <p>{x.text}</p>
                  </div>
                ))}
              </div>
              <p className="small-note">
                Rules and rental terms vary by company, licence and season. We
                confirm what applies to you before you book.
              </p>
            </section>
          )}
          {item.travelTips && item.travelTips.length > 0 && (
            <section className="detail-section">
              <h2>Good to know</h2>
              <ul className="tip-list">
                {item.travelTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          )}
          {item.faqs && item.faqs.length > 0 && (
            <section className="detail-section">
              <h2>Questions about this trip</h2>
              <div className="faqs">
                {item.faqs.map((f, i) => (
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
          )}
        </div>
        <aside className="enquiry-aside">
          <p className="eyebrow">Ready when you are</p>
          <h2>
            {item.title}
            <br />
            {item.days} days on the road
          </h2>
          {item.price ? (
            <p className="aside-price">
              <span className="price-from">Starting from</span>
              <PriceFigure item={item} />
            </p>
          ) : null}
          <p>
            Tell us your dates and who is travelling. We’ll reply with a
            personal quote and answer your questions.
          </p>
          {actions}
          <div className="aside-features">
            <p>
              <Check size={14} />
              Route, stays and paperwork planned with you
            </p>
            <p>
              <Check size={14} />
              Clear inclusions in your written quote
            </p>
            <p>
              <Check size={14} />
              No booking or payment at this stage
            </p>
          </div>
        </aside>
      </div>
      <div className="drive-bar">
        <span>{item.price ? <PriceFigure item={item} /> : item.title}</span>
        <Link className="button small" href={href}>
          Request a quote
        </Link>
      </div>
    </>
  );
}
