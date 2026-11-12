"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import type { Content } from "@/lib/types";
import { imageVariant } from "@/lib/assets";
import { stayTags, type StayDestination } from "@/lib/stays";
import {
  packageTypes,
  collectionOptions,
  assignedCollections,
} from "@/lib/classification";
// Shrink large camera photos in the browser so uploads are quick and stay
// under the host's request size limit. The server validates and re-encodes.
async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    return blob && blob.size < file.size
      ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
          type: "image/jpeg",
        })
      : file;
  } catch {
    return file;
  }
}
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
  const maxGallery = 8;
  const gallery = c.gallery.filter(Boolean);
  function moveGallery(index: number, step: number) {
    const next = [...gallery];
    const [moved] = next.splice(index, 1);
    next.splice(index + step, 0, moved);
    update("gallery", next);
  }
  // Swap a gallery photo with the cover, keeping each photo's description.
  function makeCover(url: string) {
    setC((old) => {
      const alts = { ...old.galleryAlt };
      const nextAlt = alts[url] || "";
      delete alts[url];
      const rest = old.gallery.filter((x) => x && x !== url);
      if (old.image) {
        rest.unshift(old.image);
        alts[old.image] = old.imageAlt;
      }
      return {
        ...old,
        image: url,
        imageAlt: nextAlt,
        gallery: rest,
        galleryAlt: alts,
      };
    });
  }
  async function uploadPhotos(list: FileList | null, limit: number) {
    const files = Array.from(list || []);
    const added: string[] = [];
    if (!files.length) return added;
    setBusy(true);
    setError("");
    try {
      if (files.length > limit)
        throw new Error(
          `You can add ${limit} more photo${limit === 1 ? "" : "s"} here. A gallery holds up to ${maxGallery}.`,
        );
      for (const [i, file] of files.entries()) {
        setMessage(`Uploading photo ${i + 1} of ${files.length}…`);
        const body = new FormData();
        body.set("file", await shrinkImage(file));
        body.set("contentId", c.id);
        const r = await fetch("/api/admin/upload", { method: "POST", body });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Upload failed.");
        added.push(j.url);
      }
      setMessage(
        `${added.length === 1 ? "Photo" : added.length + " photos"} uploaded. Add descriptions and save your changes.`,
      );
    } catch (e) {
      setMessage("");
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
    return added;
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
            <div className="photo-manager">
              <div className="photo-item">
                <div className="photo-thumb">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageVariant(c.image, "card")} alt="" />
                  ) : (
                    <span className="muted">No cover yet</span>
                  )}
                </div>
                <div className="photo-fields">
                  <strong>Cover photo</strong>
                  {field("imageAlt", "Cover description (alt text)")}
                  <label className="button secondary small photo-pick">
                    <Upload size={16} />
                    {c.image ? "Replace cover" : "Upload cover"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy}
                      onChange={async (e) => {
                        const [url] = await uploadPhotos(e.target.files, 1);
                        e.target.value = "";
                        if (url) update("image", url);
                      }}
                    />
                  </label>
                </div>
              </div>
              {gallery.map((url, i) => (
                <div className="photo-item" key={url}>
                  <div className="photo-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageVariant(url, "card")} alt="" />
                  </div>
                  <div className="photo-fields">
                    <strong>Gallery photo {i + 1}</strong>
                    <label className="field">
                      Description (alt text)
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
                    <div className="photo-actions">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Move photo ${i + 1} earlier`}
                        disabled={i === 0}
                        onClick={() => moveGallery(i, -1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Move photo ${i + 1} later`}
                        disabled={i === gallery.length - 1}
                        onClick={() => moveGallery(i, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={() => makeCover(url)}
                      >
                        Use as cover
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove photo ${i + 1}`}
                        onClick={() =>
                          update(
                            "gallery",
                            gallery.filter((x) => x !== url),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="upload-zone">
              <label className="field">
                <Upload size={18} />
                Add gallery photos ({gallery.length} of {maxGallery})
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy || gallery.length >= maxGallery}
                  onChange={async (e) => {
                    const added = await uploadPhotos(
                      e.target.files,
                      maxGallery - gallery.length,
                    );
                    e.target.value = "";
                    if (added.length)
                      setC((old) => ({
                        ...old,
                        gallery: [...old.gallery.filter(Boolean), ...added],
                      }));
                  }}
                />
              </label>
              <p className="small-note">
                Choose several photos at once. They are resized and compressed
                automatically. Add a description to each, then save. Removed
                photos are deleted from storage when you save.
              </p>
            </div>
            <details className="photo-advanced">
              <summary>Advanced: edit image links by hand</summary>
              {field("image", "Cover image URL")}
              {lines("gallery", "Gallery image URLs in display order")}
            </details>
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
