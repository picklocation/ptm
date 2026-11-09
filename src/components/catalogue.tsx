"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TripCard } from "./ui";
import type { Content } from "@/lib/types";
export function Catalogue({
  items,
  destinations = false,
}: {
  items: Content[];
  destinations?: boolean;
}) {
  const search = useSearchParams(),
    router = useRouter(),
    dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState(search.get("q") || ""),
    [region, setRegion] = useState(search.get("region") || ""),
    [duration, setDuration] = useState(search.get("duration") || ""),
    [theme, setTheme] = useState(search.get("theme") || ""),
    [page, setPage] = useState(1);
  const filtered = items.filter(
    (x) =>
      (!query ||
        `${x.title} ${x.location} ${x.region}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!region || x.region === region) &&
      (!theme || x.themes.includes(theme)) &&
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
    router.replace(`?${p}`, { scroll: false });
    setPage(1);
    dialog.current?.close();
  }
  const filters = (
    <>
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
              {[...new Set(items.flatMap((x) => x.themes))].map((x) => (
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
      <div className="catalogue-search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <Search size={20} />
          <input
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
      <dialog className="filter-dialog" ref={dialog}>
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
        {destinations
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
          {filtered.slice((page - 1) * 9, page * 9).map((item) =>
            destinations ? (
              <Link
                key={item.id}
                className="destination-tile"
                href={`/destinations/${item.slug}`}
              >
                <Image
                  src={item.image || "/images/placeholder.svg"}
                  unoptimized={item.image.startsWith("/api/media/")}
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
      {filtered.length > 9 && (
        <div className="pagination">
          <button
            className="button secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(filtered.length / 9)}
          </span>
          <button
            className="button secondary"
            disabled={page * 9 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
