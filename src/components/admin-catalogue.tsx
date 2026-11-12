"use client";
import { useState } from "react";
import Link from "next/link";
import type { Content } from "@/lib/types";
import {
  assignedCollections,
  collectionOptions,
  packageTypes,
} from "@/lib/classification";
export function AdminCatalogue({ items }: { items: Content[] }) {
  const [query, setQuery] = useState(""),
    [section, setSection] = useState(""),
    [format, setFormat] = useState(""),
    [status, setStatus] = useState("");
  const filtered = items.filter(
    (c) =>
      (!query ||
        [
          c.title,
          c.country,
          c.state,
          c.location,
          c.stayDestinationSlug,
          ...(c.locations || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!section || assignedCollections(c).some((x) => x === section)) &&
      (!format || c.packageType === format) &&
      (!status || c.status === status),
  );
  return (
    <div className="admin-card">
      <div className="form-grid">
        <label className="field">
          Search package or location
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kerala, Munnar, Switzerland…"
          />
        </label>
        <label className="field">
          Website section
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">All sections</option>
            {collectionOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Package format
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="">All formats</option>
            {packageTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {["draft", "published", "archived"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <p role="status">
        {filtered.length} of {items.length} records
      </p>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Location</th>
              <th>Format / template</th>
              <th>Website sections</th>
              <th>Status</th>
              <th>Homepage</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/adminportal/content/${c.id}`}>{c.title}</Link>
                  {c.demo && <span className="demo-tag">Sample</span>}
                </td>
                <td>
                  {[c.country, c.state].filter(Boolean).join(" · ")}
                  <br />
                  {c.locations?.join(" · ") || c.location}
                  {c.kind === "resort" && (
                    <>
                      <br />
                      <small>
                        Stay destination:{" "}
                        {c.stayDestinationSlug || "Not assigned"} ·{" "}
                        {c.propertyVerified && !c.demo
                          ? "Verified by admin"
                          : "Needs verification"}
                      </small>
                    </>
                  )}
                </td>
                <td>
                  {c.packageType || "Not assigned"}
                  <br />
                  <small>{c.kind}</small>
                </td>
                <td>
                  {assignedCollections(c)
                    .map(
                      (id) => collectionOptions.find((x) => x[0] === id)?.[1],
                    )
                    .join(", ") || "No collection selected"}
                </td>
                <td>{c.status}</td>
                <td>
                  {c.featured ? "Featured" : "—"} · {c.order}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && <p>No matching packages. Try another filter.</p>}
    </div>
  );
}
