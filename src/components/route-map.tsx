"use client";
import { useState } from "react";
import { mapCountries, mapSize, project } from "@/lib/europe-map";
import type { RouteStop } from "@/lib/types";

// Country names differ slightly between the map data and package copy.
const sameCountry = (a: string, b: string) =>
  a.toLowerCase().replace(/[^a-z]/g, "") ===
  b.toLowerCase().replace(/[^a-z]/g, "");
export function RouteMap({
  stops,
  countries,
  title,
}: {
  stops: RouteStop[];
  countries: string[];
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const points = stops.map((s) => ({ ...s, ...project(s.lat, s.lng) }));
  // Frame the route with a margin, keeping the map's proportions sensible.
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  const pad = 90;
  let x0 = Math.max(0, Math.min(...xs) - pad),
    x1 = Math.min(mapSize.width, Math.max(...xs) + pad),
    y0 = Math.max(0, Math.min(...ys) - pad),
    y1 = Math.min(mapSize.height, Math.max(...ys) + pad);
  const minRatio = 1.15;
  if ((x1 - x0) / (y1 - y0) < minRatio) {
    const grow = ((y1 - y0) * minRatio - (x1 - x0)) / 2;
    x0 = Math.max(0, x0 - grow);
    x1 = Math.min(mapSize.width, x1 + grow);
  }
  const scale = (x1 - x0) / 1000;
  // A repeated place (a loop back to the start) is drawn once.
  const unique = points.filter(
    (p, i) => points.findIndex((q) => q.name === p.name) === i,
  );
  const visited = (name: string) => countries.some((c) => sameCountry(c, name));
  return (
    <figure className="route-map">
      <svg
        viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`}
        style={{ "--map-scale": scale } as React.CSSProperties}
        role="img"
        aria-label={`Map of the ${title} driving route: ${stops.map((s) => s.name).join(", ")}`}
      >
        {mapCountries.map((c) => (
          <path
            key={c.name}
            d={c.d}
            className={visited(c.name) ? "land visited" : "land"}
            strokeWidth={1.2 * scale}
          />
        ))}
        {points.slice(1).map((p, i) => (
          <line
            key={i}
            x1={points[i].x}
            y1={points[i].y}
            x2={p.x}
            y2={p.y}
            className={
              active !== null &&
              (points[i].name === unique[active]?.name ||
                p.name === unique[active]?.name)
                ? "leg active"
                : "leg"
            }
            strokeWidth={3.2 * scale}
            strokeDasharray={`${9 * scale} ${7 * scale}`}
          />
        ))}
        {unique.map((p, i) => {
          const left = p.x > (x0 + x1) / 2 + (x1 - x0) * 0.28;
          return (
            <g
              key={p.name}
              className={`stop${p.overnight ? " night" : ""}${active === i ? " active" : ""}`}
              tabIndex={0}
              role="button"
              aria-label={`${p.name}, ${p.country}${p.overnight ? ", overnight stay" : ", stop on the way"}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <circle cx={p.x} cy={p.y} r={20 * scale} className="hit" />
              <circle
                cx={p.x}
                cy={p.y}
                r={(p.overnight ? 8 : 5.5) * scale}
                strokeWidth={2.5 * scale}
                className="dot"
              />
              <text
                x={p.x + (left ? -13 : 13) * scale}
                y={p.y + 5 * scale}
                textAnchor={left ? "end" : "start"}
                strokeWidth={4.5 * scale}
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <span className="key night" />
        Overnight stay
        <span className="key" />
        Stop on the way
        <span className="route-map-note" role="status">
          {active !== null
            ? `${unique[active].name}, ${unique[active].country}`
            : "Tap a place on the map"}
        </span>
      </figcaption>
    </figure>
  );
}
