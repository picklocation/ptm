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
  // Place each label beside its dot, preferring overnight stops. A label that
  // would collide on both sides is left off; the place stays tappable and is
  // listed under the map.
  // Every dot is an obstacle, so a label never sits on top of another stop.
  const placed: { x0: number; x1: number; y0: number; y1: number }[] =
    unique.map((p) => ({
      x0: p.x - 9 * scale,
      x1: p.x + 9 * scale,
      y0: p.y - 9 * scale,
      y1: p.y + 9 * scale,
    }));
  const labels = new Map<string, "start" | "end">();
  for (const p of [...unique].sort(
    (a, b) => Number(b.overnight) - Number(a.overnight),
  )) {
    // Overnight labels are drawn larger on phones, so they reserve that
    // larger space here and stay clear of each other at every width.
    const size = (p.overnight ? 36 : 17) * scale;
    const width = p.name.length * size * 0.56;
    const preferLeft = p.x > (x0 + x1) / 2 + (x1 - x0) * 0.28;
    for (const left of preferLeft ? [true, false] : [false, true]) {
      const bx0 = left ? p.x - 13 * scale - width : p.x + 13 * scale;
      const box = {
        x0: bx0,
        x1: bx0 + width,
        y0: p.y - size * 0.75,
        y1: p.y + size * 0.55,
      };
      const clash =
        box.x0 < x0 ||
        box.x1 > x1 ||
        placed.some(
          (o) =>
            box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0,
        );
      if (!clash) {
        placed.push(box);
        labels.set(p.name, left ? "end" : "start");
        break;
      }
    }
    // An overnight stop is always named, even in a crowded corner.
    if (p.overnight && !labels.has(p.name))
      labels.set(p.name, preferLeft ? "end" : "start");
  }
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
          const anchor = labels.get(p.name);
          const left = anchor === "end";
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
              {(anchor || active === i) && (
                <text
                  x={p.x + (left ? -13 : 13) * scale}
                  y={p.y + 5 * scale}
                  textAnchor={left ? "end" : "start"}
                  strokeWidth={4.5 * scale}
                >
                  {p.name}
                </text>
              )}
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
