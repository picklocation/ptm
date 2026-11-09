"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export function HomeRail({
  title,
  description,
  href,
  destinations = false,
  children,
}: {
  title: string;
  description?: string;
  href: string;
  destinations?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const el = rail.current;
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
  }, []);
  function move(direction: number) {
    const el = rail.current;
    if (el)
      el.scrollBy({
        left: direction * el.clientWidth,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  return (
    <section className="home-collection" aria-labelledby={`${id}-title`}>
      <div className="home-collection-heading">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="rail-controls">
          <Link href={href} className="rail-browse">
            View all <ArrowUpRight size={18} />
          </Link>
          <button
            className="rail-arrow"
            aria-label={`Previous ${title.toLowerCase()}`}
            aria-controls={id}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="rail-arrow"
            aria-label={`Next ${title.toLowerCase()}`}
            aria-controls={id}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div
        id={id}
        className={`home-rail ${destinations ? "destination-rail" : "package-rail"}`}
        ref={rail}
        tabIndex={0}
        role="region"
        aria-label={`${title} — scroll to explore`}
      >
        {children}
      </div>
    </section>
  );
}
