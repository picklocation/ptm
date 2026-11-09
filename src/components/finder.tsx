"use client";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, Compass, Search } from "lucide-react";
export function Finder() {
  const router = useRouter();
  return (
    <form
      className="finder"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        if (f.get("q")) params.set("q", String(f.get("q")));
        if (f.get("duration"))
          params.set("duration", String(f.get("duration")));
        router.push(`${f.get("type")}?${params}`);
      }}
    >
      <label>
        <MapPin />
        <span>
          Where to?
          <input
            name="q"
            placeholder="A place you’ve been dreaming of"
            aria-label="Destination"
          />
        </span>
      </label>
      <label>
        <Compass />
        <span>
          Your kind of trip
          <select name="type" defaultValue="/holidays">
            <option value="/holidays">All holidays</option>
            <option value="/international-trips">International trips</option>
            <option value="/domestic-trips">Domestic trips</option>
            <option value="/visa-free-destinations">
              Visa-free destinations
            </option>
            <option value="/europe-road-trips">Europe road trip</option>
            <option value="/resorts-and-villas">Resorts & villas</option>
          </select>
        </span>
      </label>
      <label>
        <CalendarDays />
        <span>
          How long?
          <select name="duration">
            <option value="">I’m flexible</option>
            <option value="short">Up to 5 days</option>
            <option value="week">6–9 days</option>
            <option value="long">10 days or more</option>
          </select>
        </span>
      </label>
      <button className="button" type="submit">
        <Search size={19} />
        Explore trips
      </button>
    </form>
  );
}
