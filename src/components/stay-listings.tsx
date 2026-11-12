"use client";
import { imageVariant, skipOptimizer } from "@/lib/assets";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Content } from "@/lib/types";
import { filterStays } from "@/lib/stays";
import { Price } from "./ui";
export function StayListings({
  items,
  destination,
}: {
  items: Content[];
  destination: string;
}) {
  const [audience, setAudience] = useState(""),
    [tier, setTier] = useState("");
  const filtered = filterStays(items, audience, tier);
  return (
    <>
      <div className="stay-filters">
        <label className="field">
          Travelling with
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="">Everyone</option>
            <option>Couples</option>
            <option>Families</option>
          </select>
        </label>
        <label className="field">
          Stay category
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="">All categories</option>
            <option>Budget</option>
            <option>Premium</option>
            <option>Luxury</option>
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setAudience("");
            setTier("");
          }}
        >
          Clear filters
        </button>
      </div>
      <p role="status" className="small-note">
        {filtered.length} {filtered.length === 1 ? "stay" : "stays"}
      </p>
      {filtered.length ? (
        <div className="trip-grid">
          {filtered.map((item) => (
            <article className="trip-card" key={item.id}>
              <Link
                href={`/resorts-and-villas/${item.slug}`}
                className="card-photo"
              >
                <Image
                  src={imageVariant(item.image, "card")}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width:600px) 90vw, (max-width:1100px) 45vw, 23vw"
                  unoptimized={skipOptimizer(item.image)}
                />
              </Link>
              <div className="card-body">
                <h2 className="stay-card-title">{item.title}</h2>
                <p className="card-location">{item.location}</p>
                {item.amenities.length > 0 && (
                  <ul className="stay-amenities">
                    {item.amenities.slice(0, 4).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
                <div className="card-bottom">
                  <Price item={item} />
                </div>
                <Link
                  href={`/resorts-and-villas/${item.slug}`}
                  className="button secondary stay-details-link"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {items.length
              ? "No stays match these filters"
              : `We're adding stays in ${destination}`}
          </h2>
          <p>
            {items.length
              ? "Try another category, or ask us to help find a stay."
              : "Tell us your dates and preferences, and our team will help you explore options."}
          </p>
          <Link
            href={`/plan-my-trip?kind=resort&destination=${encodeURIComponent(destination)}`}
            className="button"
          >
            Enquire about {destination}
          </Link>
        </div>
      )}
    </>
  );
}
