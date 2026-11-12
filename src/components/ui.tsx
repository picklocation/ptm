import { publicAsset, imageVariant, skipOptimizer } from "@/lib/assets";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, MapPin, Clock, Check } from "lucide-react";
import type { Content } from "@/lib/types";
import { paths } from "@/lib/types";
export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="PickTheMap home">
      <Image
        src={publicAsset("brand/pickthemap-icon.png")}
        alt=""
        width={30}
        height={36}
        priority
      />
      <span>
        pick<span className="brand-green">the</span>map
      </span>
    </Link>
  );
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <ArrowUpRight size={18} aria-hidden="true" />
  ) : (
    <ArrowRight size={18} aria-hidden="true" />
  );
}
export function SectionTitle({
  eyebrow,
  title,
  description,
  href,
  label = "Explore all",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {label}
          <Arrow />
        </Link>
      )}
    </div>
  );
}
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
// A discount shows only when the original price is genuinely higher.
export function discountOf(item: Content) {
  return item.price && item.originalPrice && item.originalPrice > item.price
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;
}
export function PriceFigure({ item }: { item: Content }) {
  if (!item.price) return null;
  const off = discountOf(item);
  return (
    <span className="price-figure">
      {off > 0 && (
        <>
          <span className="visually-hidden">Original price </span>
          <s className="price-was">
            {money(item.originalPrice!, item.currency)}
          </s>
          <span className="visually-hidden"> Offer price </span>
        </>
      )}
      <strong className="price-now">{money(item.price, item.currency)}</strong>
      {off > 0 && <span className="price-off">{off}% off</span>}
    </span>
  );
}
export function Price({ item }: { item: Content }) {
  return item.price ? (
    <>
      <span className="price">
        <span className="price-from">From</span>
        <PriceFigure item={item} />
      </span>
      <span className="price-basis">
        {item.priceBasis} · {item.priceConditions}
      </span>
    </>
  ) : (
    <span className="quote-label">
      Made for you. <strong>Request a quote</strong>
    </span>
  );
}
export function TripCard({ item }: { item: Content }) {
  const href = `/${paths[item.kind]}/${item.slug}`;
  const stops = item.locations?.filter(Boolean) || [];
  return (
    <article className="trip-card">
      <Link href={href} className="card-photo" tabIndex={-1} aria-hidden="true">
        <Image
          src={
            imageVariant(item.image, "card") ||
            publicAsset("brand/placeholder.svg")
          }
          unoptimized={skipOptimizer(item.image)}
          alt=""
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1099px) 45vw, 24vw"
        />
        {item.days > 0 && (
          <span className="duration">
            <Clock size={13} />
            {item.days} {item.days === 1 ? "day" : "days"}
          </span>
        )}
        {discountOf(item) > 0 && (
          <span className="offer-tag">{discountOf(item)}% off</span>
        )}
      </Link>
      <div className="card-body">
        <p className="card-location">
          <MapPin size={14} />
          <span>{stops.length ? stops.join(" · ") : item.location}</span>
        </p>
        <Link href={href}>
          <h3>{item.title}</h3>
        </Link>
        <p className="card-summary">{item.summary}</p>
        <div className="card-bottom">
          <div className="card-price">
            {item.price ? (
              <>
                <span className="price-from">
                  From{item.priceBasis ? ` · ${item.priceBasis}` : ""}
                </span>
                <PriceFigure item={item} />
              </>
            ) : (
              <span className="quote-label">
                Made for you. <strong>Request a quote</strong>
              </span>
            )}
          </div>
          <Link
            href={href}
            className="card-arrow"
            aria-label={`View ${item.title}`}
          >
            <Arrow diagonal />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((text, i) => (
        <li key={i}>
          <Check size={17} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
