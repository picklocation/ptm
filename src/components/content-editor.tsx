"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import type { Content } from "@/lib/types";
import { stayTags, type StayDestination } from "@/lib/stays";
import {
  packageTypes,
  collectionOptions,
  assignedCollections,
} from "@/lib/classification";
export function ContentEditor({
  initial,
  stayDestinations = [],
}: {
  initial: Content;
  stayDestinations?: StayDestination[];
}) {
  const [c, setC] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const router = useRouter();
  function update(key: string, value: unknown) {
    setC((old) => ({ ...old, [key]: value }));
  }
  function field(key: keyof Content, label: string, type = "text") {
    return (
      <label className="field" key={key}>
        {label}
        <input
          type={type}
          value={String(c[key] ?? "")}
          onChange={(e) =>
            update(
              key,
              type === "number"
                ? e.target.value === ""
                  ? undefined
                  : Number(e.target.value)
                : e.target.value,
            )
          }
        />
      </label>
    );
  }
  function area(key: keyof Content, label: string, rows = 4) {
    return (
      <label className="field" key={key}>
        {label}
        <textarea
          rows={rows}
          value={String(c[key] || "")}
          onChange={(e) => update(key, e.target.value)}
        />
      </label>
    );
  }
  function lines(key: keyof Content, label: string) {
    return (
      <label className="field" key={key}>
        {label} <span className="muted">(one per line)</span>
        <textarea
          rows={4}
          value={(c[key] as string[]).join("\n")}
          onChange={(e) => update(key, e.target.value.split("\n"))}
        />
      </label>
    );
  }
  async function save(action: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            ...c,
            locations: c.locations?.map((x) => x.trim()).filter(Boolean),
            gallery: c.gallery.filter(Boolean),
            inclusions: c.inclusions.filter(Boolean),
            exclusions: c.exclusions.filter(Boolean),
            amenities: c.amenities.filter(Boolean),
            rooms: c.rooms.filter(Boolean),
            mealPlans: c.mealPlans.filter(Boolean),
          },
          action,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setC(j.content);
      setMessage(j.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">{c.kind} editor</p>
          <h1>{c.title || "A new journey"}</h1>
        </div>
        <div className="editor-actions">
          <Link
            className="button secondary"
            href={`/adminportal/preview/${c.id}`}
            target="_blank"
          >
            Preview ↗
          </Link>
          <button
            disabled={busy}
            className="button secondary"
            onClick={() => save("save")}
          >
            Save draft
          </button>
          <button
            disabled={busy}
            className="button"
            onClick={() => save("publish")}
          >
            Publish
          </button>
        </div>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      <div className="editor-grid">
        <div>
          <section className="admin-card">
            <h2>The essentials</h2>
            <div className="form-grid">
              {field("title", "Title")}
              {field("slug", "URL slug")}
              <label className="field">
                Page template
                <select
                  value={c.kind}
                  onChange={(e) => update("kind", e.target.value)}
                >
                  <option value="holiday">Holiday</option>
                  <option value="road-trip">Road-trip itinerary</option>
                  <option value="resort">
                    Stay (resort, villa or camping)
                  </option>
                  <option value="destination">Destination</option>
                </select>
              </label>
              {field("location", "Destinations / location")}
              {field("region", "Region (use India for domestic trips)")}
              {field("country", "Country (e.g. Malaysia, Nepal or Bhutan)")}
              {field("state", "State / province (e.g. Kerala)")}
              <label className="field">
                Package format
                <select
                  value={c.packageType || ""}
                  onChange={(e) =>
                    update("packageType", e.target.value || undefined)
                  }
                >
                  <option value="">Choose a format</option>
                  {packageTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              {field("days", "Days", "number")}
              {field("nights", "Nights", "number")}
            </div>
            <label className="field">
              Local places / stops (comma separated)
              <input
                value={(c.locations || []).join(",")}
                onChange={(e) => update("locations", e.target.value.split(","))}
                placeholder="Munnar, Vattavada, Kolukkumalai"
              />
            </label>
            <fieldset className="admin-card">
              <legend>Show this package in</legend>
              <p className="small-note">
                Select every relevant section. The page template controls the
                detail fields; these choices control where visitors find the
                package. Existing packages use suggested sections until you
                change them.
              </p>
              <div className="form-grid">
                {collectionOptions.map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="checkbox"
                      checked={assignedCollections(c).includes(value)}
                      onChange={(e) =>
                        update(
                          "collections",
                          e.target.checked
                            ? [...assignedCollections(c), value]
                            : assignedCollections(c).filter((x) => x !== value),
                        )
                      }
                    />{" "}
                    {label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="text-link"
                onClick={() => update("collections", undefined)}
              >
                Use automatic suggestions
              </button>
              <p className="small-note">
                Visa guidance is matched to the country, not a manual visa-free
                promise. Homepage featuring and order remain separate controls.
              </p>
            </fieldset>
            {c.kind === "destination" && (
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={!!c.stayDestination}
                  onChange={(e) => update("stayDestination", e.target.checked)}
                />
                Include this destination in Resorts & Stays (publish to make it
                available)
              </label>
            )}
            {c.kind === "resort" && (
              <fieldset className="admin-card">
                <legend>Resorts & Stays directory</legend>
                <label className="field">
                  Stay destination
                  <select
                    value={c.stayDestinationSlug || ""}
                    onChange={(e) =>
                      update("stayDestinationSlug", e.target.value)
                    }
                  >
                    <option value="">
                      Not assigned to the stays directory
                    </option>
                    {stayDestinations.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                    {c.stayDestinationSlug &&
                      !stayDestinations.some(
                        (d) => d.slug === c.stayDestinationSlug,
                      ) && (
                        <option value={c.stayDestinationSlug}>
                          {c.stayDestinationSlug} (check destination)
                        </option>
                      )}
                  </select>
                </label>
                <div className="form-grid">
                  {stayTags.map((tag) => (
                    <label className="checkbox" key={tag}>
                      <input
                        type="checkbox"
                        checked={c.stayTags?.includes(tag) || false}
                        onChange={(e) =>
                          update(
                            "stayTags",
                            e.target.checked
                              ? [...(c.stayTags || []), tag]
                              : (c.stayTags || []).filter((x) => x !== tag),
                          )
                        }
                      />
                      {tag}
                    </label>
                  ))}
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!c.propertyVerified}
                    onChange={(e) =>
                      update("propertyVerified", e.target.checked)
                    }
                  />
                  I have checked this property's name, photos, rooms, amenities
                  and any prices with an authoritative source or the property.
                </label>
                <p className="small-note">
                  Only verified, published, non-sample properties appear in the
                  directory. Do not mark mock listings as verified. Leave
                  pricing blank when a quote is required.
                </p>
              </fieldset>
            )}
            {area("summary", "Short introduction", 2)}
            {area("description", "Full description", 6)}
            <label className="field">
              Travel styles (comma separated; use Budget, Family, Couples or
              Villa for stays)
              <input
                value={c.themes.join(", ")}
                onChange={(e) =>
                  update(
                    "themes",
                    e.target.value.split(",").map((x) => x.trim()),
                  )
                }
              />
            </label>
          </section>
          <section className="admin-card">
            <h2>Images & gallery</h2>
            {field("image", "Cover image URL")}
            {field("imageAlt", "Cover image description (alt text)")}
            <div className="upload-zone">
              <label className="field">
                <Upload size={18} />
                Upload a cover image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      const form = new FormData();
                      form.set("file", file);
                      const r = await fetch("/api/admin/upload", {
                        method: "POST",
                        body: form,
                      });
                      const j = await r.json();
                      if (!r.ok) throw new Error(j.error);
                      update("image", j.url);
                      setMessage(
                        "Image uploaded. Add alt text and save your changes.",
                      );
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Upload failed.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
              <p className="small-note">
                JPEG, PNG or WebP, up to 8 MB. Uploaded images stay private
                until the content is published.
              </p>
            </div>
            {lines("gallery", "Additional image URLs in display order")}
            {c.gallery.filter(Boolean).map((url, i) => (
              <label className="field" key={url}>
                Photo {i + 1} alt description
                <input
                  value={c.galleryAlt?.[url] || ""}
                  onChange={(e) =>
                    update("galleryAlt", {
                      ...c.galleryAlt,
                      [url]: e.target.value,
                    })
                  }
                />
              </label>
            ))}
            <label className="field">
              Add gallery photos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  setBusy(true);
                  setError("");
                  const added: string[] = [];
                  try {
                    for (const file of files) {
                      const body = new FormData();
                      body.set("file", file);
                      const r = await fetch("/api/admin/upload", {
                        method: "POST",
                        body,
                      });
                      const j = await r.json();
                      if (!r.ok) throw new Error(j.error);
                      added.push(j.url);
                    }
                    setMessage(
                      "Gallery uploaded. Add photo descriptions, then save.",
                    );
                  } catch (error) {
                    setError(
                      error instanceof Error ? error.message : "Upload failed.",
                    );
                  } finally {
                    setC((old) => ({
                      ...old,
                      gallery: [...old.gallery.filter(Boolean), ...added],
                    }));
                    setBusy(false);
                  }
                }}
              />
            </label>
          </section>
          {c.kind !== "resort" && c.kind !== "destination" && (
            <section className="admin-card">
              <h2>Day-by-day itinerary</h2>
              {c.itinerary.map((day, i) => (
                <div className="repeat-row" key={i}>
                  <label className="field">
                    Day / stop {i + 1} title
                    <input
                      value={day.title}
                      onChange={(e) =>
                        update(
                          "itinerary",
                          c.itinerary.map((x, j) =>
                            j === i ? { ...x, title: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    Description
                    <textarea
                      rows={3}
                      value={day.description}
                      onChange={(e) =>
                        update(
                          "itinerary",
                          c.itinerary.map((x, j) =>
                            j === i ? { ...x, description: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="editor-actions">
                    <button
                      className="icon-button"
                      aria-label={`Move day ${i + 1} up`}
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...c.itinerary];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        update("itinerary", next);
                      }}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Move day ${i + 1} down`}
                      disabled={i === c.itinerary.length - 1}
                      onClick={() => {
                        const next = [...c.itinerary];
                        [next[i + 1], next[i]] = [next[i], next[i + 1]];
                        update("itinerary", next);
                      }}
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Remove day ${i + 1}`}
                      onClick={() =>
                        update(
                          "itinerary",
                          c.itinerary.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="button secondary small"
                onClick={() =>
                  update("itinerary", [
                    ...c.itinerary,
                    { title: "", description: "" },
                  ])
                }
              >
                <Plus size={16} />
                Add day / stop
              </button>
            </section>
          )}
          <section className="admin-card">
            <h2>Inclusions & details</h2>
            {area("accommodation", "Accommodation information", 4)}
            {lines("inclusions", "Included")}
            {lines("exclusions", "Excluded")}
            {c.kind === "resort" && (
              <>
                {lines("amenities", "Amenities")}
                {lines("rooms", "Room categories & accommodation details")}
                {lines("mealPlans", "Meal plans")}
              </>
            )}
            {c.kind === "road-trip" && (
              <>
                <h3>Vehicle options</h3>
                {c.vehicles.map((v, i) => (
                  <div className="repeat-row" key={i}>
                    <label className="field">
                      Vehicle name
                      <input
                        value={v.name}
                        onChange={(e) =>
                          update(
                            "vehicles",
                            c.vehicles.map((x, j) =>
                              i === j ? { ...x, name: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="field">
                      Passenger capacity
                      <input
                        type="number"
                        min="1"
                        value={v.passengers}
                        onChange={(e) =>
                          update(
                            "vehicles",
                            c.vehicles.map((x, j) =>
                              i === j
                                ? { ...x, passengers: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="field">
                      Luggage capacity / conditions
                      <input
                        value={v.luggage}
                        onChange={(e) =>
                          update(
                            "vehicles",
                            c.vehicles.map((x, j) =>
                              i === j ? { ...x, luggage: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      className="text-link"
                      onClick={() =>
                        update(
                          "vehicles",
                          c.vehicles.filter((_, j) => i !== j),
                        )
                      }
                    >
                      Remove vehicle
                    </button>
                  </div>
                ))}
                <button
                  className="button secondary small"
                  onClick={() =>
                    update("vehicles", [
                      ...c.vehicles,
                      { name: "", passengers: 4, luggage: "" },
                    ])
                  }
                >
                  Add vehicle
                </button>
              </>
            )}
          </section>
        </div>
        <aside>
          <section className="admin-card">
            <h2>Publishing</h2>
            <p className="muted">
              Status: {c.status}. Save keeps edits private until you publish.
            </p>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={c.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />
              Feature on homepage
            </label>
            {field("order", "Display order (lower first)", "number")}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={c.demo}
                onChange={(e) => update("demo", e.target.checked)}
              />
              Demonstration content
            </label>
            <p className="small-note">
              Only remove this flag after verifying the content and image
              rights.
            </p>
            <div className="editor-actions" style={{ marginTop: 20 }}>
              <button
                className="button secondary small"
                disabled={busy}
                onClick={() => save("unpublish")}
              >
                Unpublish
              </button>
              <button
                className="button secondary small"
                disabled={busy}
                onClick={() => save("archive")}
              >
                Archive
              </button>
            </div>
          </section>
          <section className="admin-card">
            <h2>Pricing</h2>
            <p className="small-note">
              Leave price empty to display “Request a quote”.
            </p>
            {field("price", "From price (optional)", "number")}
            <label className="field">
              Currency
              <select
                value={c.currency}
                onChange={(e) => update("currency", e.target.value)}
              >
                {["INR", "EUR", "USD", "GBP", "AED"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            {field("priceBasis", "Pricing basis (e.g. per person)")}
            {area("priceConditions", "Conditions / dates / occupancy")}
          </section>
          <section className="admin-card">
            <h2>Search appearance</h2>
            {field("seoTitle", "SEO title (optional)")}
            {area("seoDescription", "SEO description (optional)", 3)}
          </section>
        </aside>
      </div>
    </>
  );
}
