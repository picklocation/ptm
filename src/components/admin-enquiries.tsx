"use client";
import { useState } from "react";
import Link from "next/link";
import type { Enquiry } from "@/lib/types";
import { statuses } from "@/lib/types";
export function EnquiryList({ initial }: { initial: Enquiry[] }) {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const rows = initial.filter(
    (x) =>
      (!status || x.status === status) &&
      `${x.name} ${x.email} ${x.phone} ${x.destination} ${x.itemTitle}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const params = new URLSearchParams({ q, status });
  return (
    <>
      <div className="admin-toolbar">
        <input
          aria-label="Search enquiries"
          placeholder="Search name, destination, contact…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <a
          className="button secondary small"
          href={`/api/admin/export?${params}`}
        >
          Export CSV
        </a>
        <a
          className="button secondary small"
          href={`/api/admin/export?${params}&format=xlsx`}
        >
          Export Excel
        </a>
        <button
          disabled={busy}
          className="button small"
          onClick={async () => {
            setBusy(true);
            try {
              const r = await fetch("/api/admin/sync", { method: "POST" });
              const j = await r.json();
              setMessage(j.message || j.error);
            } catch {
              setMessage("Sync failed. Records remain saved.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Syncing…" : "Sync Excel now"}
        </button>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="admin-card table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Traveller</th>
              <th>Journey</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Excel</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link href={`/adminportal/enquiries/${e.id}`}>{e.name}</Link>
                  <br />
                  <span className="muted">{e.phone}</span>
                </td>
                <td>
                  {e.destination}
                  <br />
                  <span className="muted">
                    {e.adults} adults · {e.children} children
                  </span>
                </td>
                <td>
                  {e.startDate || "Undecided"}
                  {e.flexible ? " · flexible" : ""}
                </td>
                <td>
                  <span className={`status ${e.status}`}>{e.status}</span>
                </td>
                <td>
                  <span className={`status ${e.excelStatus}`}>
                    {e.excelStatus}
                  </span>
                </td>
                <td>{new Date(e.createdAt).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">
            <h3>No enquiries match.</h3>
            <p>New enquiries will appear here as soon as they are saved.</p>
          </div>
        )}
      </div>
    </>
  );
}
export function EnquiryDetail({ initial }: { initial: Enquiry }) {
  const [e, setE] = useState(initial),
    [status, setStatus] = useState(e.status),
    [note, setNote] = useState(""),
    [assignedTo, setAssigned] = useState(e.assignedTo),
    [followUp, setFollowUp] = useState(e.followUp),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Enquiry · {e.id}</p>
          <h1>{e.name}</h1>
        </div>
        <Link href="/adminportal/enquiries" className="button secondary small">
          All enquiries
        </Link>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="admin-details">
        <section className="admin-card">
          <h2>Travel details</h2>
          <dl>
            {Object.entries({
              Destination: e.destination,
              "Selected trip": e.itemTitle || "Custom enquiry",
              Dates: `${e.startDate || "Undecided"} — ${e.endDate || "Undecided"}${e.flexible ? " (flexible)" : ""}`,
              Travellers: `${e.adults} adults, ${e.children} children`,
              "Child ages": e.childAges || "Not supplied",
              Rooms: e.rooms,
              Departure: e.departure || "Not supplied",
              Budget: e.budget
                ? `${e.currency} ${e.budget} (${e.budgetBasis})`
                : "Not supplied",
              Preferences: e.preferences || "None supplied",
              Vehicle: e.vehicle || "Not supplied",
              "Meal plan": e.mealPlan || "Not supplied",
              Phone: e.phone,
              Email: e.email || "Not supplied",
              "Contact via": e.contactMethod,
              Submission:
                e.method === "whatsapp"
                  ? "Saved + WhatsApp handoff requested"
                  : "Saved enquiry",
              "Excel sync": e.excelStatus,
            }).map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div>
          <form
            className="admin-card"
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              try {
                const r = await fetch("/api/admin/enquiries", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: e.id,
                    status,
                    note,
                    assignedTo,
                    followUp,
                  }),
                });
                const j = await r.json();
                if (!r.ok) throw new Error(j.error);
                setE(j.enquiry);
                setNote("");
                setMessage("Enquiry updated. Excel update queued.");
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Update failed.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2>Follow up</h2>
            <label className="field">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field" style={{ marginTop: 15 }}>
              Assigned to
              <input
                value={assignedTo}
                onChange={(e) => setAssigned(e.target.value)}
              />
            </label>
            <label className="field" style={{ marginTop: 15 }}>
              Follow-up date
              <input
                type="date"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </label>
            <label className="field" style={{ marginTop: 15 }}>
              Internal note
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
            </label>
            <button
              className="button"
              style={{ marginTop: 20 }}
              disabled={busy}
            >
              {busy ? "Saving…" : "Save update"}
            </button>
          </form>
          <section className="admin-card">
            <h2>Notes & history</h2>
            {e.notes.map((n, i) => (
              <div key={i} className="note">
                <small>
                  {n.author} · {new Date(n.at).toLocaleString("en-GB")}
                </small>
                {n.text}
              </div>
            ))}
            {e.history.map((h, i) => (
              <p className="note" key={`h${i}`}>
                <small>
                  {new Date(h.at).toLocaleString("en-GB")} · {h.author}
                </small>
                Status: {h.status}
              </p>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
