"use client";
import { publicAsset, imageVariant, skipOptimizer } from "@/lib/assets";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DestinationTile = {
  name: string;
  caption?: string;
  image: string;
  alt: string;
  href: string;
};
export function DestinationRow({
  title,
  items,
  popular = false,
  href,
}: {
  title: string;
  items: DestinationTile[];
  popular?: boolean;
  href?: string;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft < 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [items]);
  function move(direction: number) {
    const el = track.current;
    if (el)
      el.scrollBy({
        left: direction * el.clientWidth,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  if (!items.length) return null;
  return (
    <section
      className={`destination-row-section ${popular ? "popular-destination-row" : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="destination-row-heading">
        <h2 id={`${id}-heading`}>{title}</h2>
        <div className="destination-row-controls">
          {href && (
            <Link href={href} className="destination-view-all">
              View all
            </Link>
          )}
          <button
            aria-label={`Previous ${title.toLowerCase()}`}
            aria-controls={id}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={19} />
          </button>
          <button
            aria-label={`Next ${title.toLowerCase()}`}
            aria-controls={id}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div
        className="destination-name-track"
        ref={track}
        id={id}
        role="region"
        aria-label={title}
        tabIndex={0}
      >
        {items.map((item) => (
          <Link key={item.name} href={item.href} className="destination-tile">
            <Image
              src={imageVariant(item.image, "card") || publicAsset("brand/placeholder.svg")}
              alt={item.alt}
              fill
              sizes="(max-width:600px) 65vw, 20vw"
              unoptimized={skipOptimizer(item.image)}
            />
            <div />
            <span className="destination-label">
              {item.caption && <small>{item.caption}</small>}
              <strong>{item.name}</strong>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
