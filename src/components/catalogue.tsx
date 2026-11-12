"use client";
import { publicAsset, imageVariant, skipOptimizer } from "@/lib/assets";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TripCard } from "./ui";
import type { Content } from "@/lib/types";
import { packageTypes } from "@/lib/classification";
export function Catalogue({
  items,
  destinations = false,
  stays = false,
}: {
  items: Content[];
  destinations?: boolean;
  stays?: boolean;
}) {
  const search = useSearchParams(),
    router = useRouter(),
    dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState(search.get("q") || ""),
    [region, setRegion] = useState(search.get("region") || ""),
    [duration, setDuration] = useState(search.get("duration") || ""),
    [theme, setTheme] = useState(search.get("theme") || ""),
    [packageType, setPackageType] = useState(search.get("type") || ""),
    [page, setPage] = useState(1);
  const normalTheme = (value: string) =>
    value === "Couple" ? "Couples" : value;
  const filtered = items.filter(
    (x) =>
      (!query ||
        `${x.title} ${x.location} ${x.region} ${x.country || ""} ${x.state || ""} ${(x.locations || []).join(" ")} ${x.packageType || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!region || x.region === region) &&
      (!packageType || x.packageType === packageType) &&
      (!theme || x.themes.map(normalTheme).includes(normalTheme(theme))) &&
      (!duration ||
        (duration === "short"
          ? x.days <= 5
          : duration === "week"
            ? x.days >= 6 && x.days <= 9
            : x.days >= 10)),
  );
  function apply() {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (region) p.set("region", region);
    if (duration) p.set("duration", duration);
    if (theme) p.set("theme", theme);
    if (packageType) p.set("type", packageType);
    router.replace(`?${p}`, { scroll: false });
    setPage(1);
    dialog.current?.close();
  }
  const filters = (
    <>
      <label>
        Package format
        <select
          value={packageType}
          onChange={(e) => setPackageType(e.target.value)}
        >
          <option value="">All formats</option>
          {packageTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Region
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          {[...new Set(items.map((x) => x.region))].sort().map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      {!destinations && (
        <>
          <label>
            Duration
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="">Any duration</option>
              <option value="short">Up to 5 days</option>
              <option value="week">6–9 days</option>
              <option value="long">10 days or more</option>
            </select>
          </label>
          <label>
            Travel style
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="">Any style</option>
              {[
                ...new Set(items.flatMap((x) => x.themes.map(normalTheme))),
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <button className="button" type="button" onClick={apply}>
        Apply filters
      </button>
      <button
        type="button"
        className="text-link"
        onClick={() => {
          setQuery("");
          setRegion("");
          setDuration("");
          setTheme("");
          setPackageType("");
          setPage(1);
          router.replace("?", { scroll: false });
          dialog.current?.close();
        }}
      >
        Clear filters
      </button>
    </>
  );
  return (
    <>
      {stays && (
        <div className="stay-tabs" aria-label="Stay preferences">
          {["", "Budget", "Family", "Couples", "Villa"].map((value) => (
            <button
              key={value}
              className="stay-tab"
              aria-pressed={theme === value}
              onClick={() => {
                setTheme(value);
                setPage(1);
                const p = new URLSearchParams(search.toString());
                value ? p.set("theme", value) : p.delete("theme");
                router.replace(`?${p}`, { scroll: false });
              }}
            >
              {value || "All stays"}
            </button>
          ))}
        </div>
      )}
      <div className="catalogue-search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <Search size={20} />
          <input
            type="search"
            name="q"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Search destinations or trips"
            placeholder="Where would you like to go?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <button className="button small">Search</button>
        </form>
        <button
          className="button secondary filter-toggle"
          onClick={() => dialog.current?.showModal()}
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>
      <div className="filter-bar">{filters}</div>
      <dialog className="filter-dialog" ref={dialog} aria-label="Filter trips">
        <div className="menu-top">
          <h2>Find your kind of trip</h2>
          <button
            className="icon-button"
            aria-label="Close filters"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        {filters}
      </dialog>
      <p className="result-count" aria-live="polite">
        {filtered.length}{" "}
        {stays
          ? filtered.length === 1
            ? "stay"
            : "stays"
          : destinations
            ? filtered.length === 1
              ? "destination"
              : "destinations"
            : filtered.length === 1
              ? "journey"
              : "journeys"}{" "}
        to explore
      </p>
      {!filtered.length ? (
        <div className="empty-state">
          <h2>A different adventure awaits.</h2>
          <p>Try fewer filters, or let us plan something just for you.</p>
          <Link href="/plan-my-trip" className="button">
            Plan my trip
          </Link>
        </div>
      ) : (
        <div
          className={
            destinations ? "destination-grid listing-destinations" : "trip-grid"
          }
        >
          {filtered.slice((page - 1) * 12, page * 12).map((item) =>
            destinations ? (
              <Link
                key={item.id}
                className="destination-tile"
                href={`/destinations/${item.slug}`}
              >
                <Image
                  src={imageVariant(item.image, "card") || publicAsset("brand/placeholder.svg")}
                  unoptimized={skipOptimizer(item.image)}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width:640px) 45vw, 30vw"
                />
                <div />
                <span>{item.title} ↗</span>
              </Link>
            ) : (
              <TripCard key={item.id} item={item} />
            ),
          )}
        </div>
      )}
      {filtered.length > 12 && (
        <div className="pagination">
          <button
            className="button secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(filtered.length / 12)}
          </span>
          <button
            className="button secondary"
            disabled={page * 12 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
