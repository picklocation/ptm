import { publicAsset } from "@/lib/assets";
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
        <span className="brand-dot">.</span>
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
export function Price({ item }: { item: Content }) {
  return item.price ? (
    <>
      <span className="price">
        From{" "}
        {new Intl.NumberFormat("en", {
          style: "currency",
          currency: item.currency,
          maximumFractionDigits: 0,
        }).format(item.price)}
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
  return (
    <article className="trip-card">
      <Link href={`/${paths[item.kind]}/${item.slug}`} className="card-photo">
        <Image
          src={item.image || publicAsset("brand/placeholder.svg")}
          unoptimized={item.image.startsWith("/api/media/")}
          alt={item.imageAlt || item.title}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1099px) 45vw, 24vw"
        />
        {item.days > 0 && (
          <span className="duration">
            <Clock size={13} />
            {item.days} days · {item.nights} nights
          </span>
        )}
        <span className="photo-arrow">
          <Arrow diagonal />
        </span>
      </Link>
      <div className="card-body">
        <p className="card-location">
          <MapPin size={13} />
          {item.location}
        </p>
        <Link href={`/${paths[item.kind]}/${item.slug}`}>
          <h3>{item.title}</h3>
        </Link>
        <p className="card-summary">{item.summary}</p>
        <div className="card-bottom">
          <Price item={item} />
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
