"use client";
import { useState } from "react";
import type { Staff } from "@/lib/types";
export function StaffEditor({
  initial,
  ownId,
}: {
  initial: Staff[];
  ownId: string;
}) {
  const [staff, setStaff] = useState(initial),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function send(data: unknown) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setStaff(j.staff);
      setMessage(
        "Staff access updated. Share credentials privately; never through the repository.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-top">
        <h1>Staff & access</h1>
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
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{s.role}</td>
                <td>{s.active ? "Active" : "Revoked"}</td>
                <td>
                  {s.id !== ownId && (
                    <button
                      disabled={busy}
                      className="text-link"
                      onClick={() =>
                        send({ action: "toggle", id: s.id, active: !s.active })
                      }
                    >
                      {s.active ? "Revoke access" : "Restore access"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        className="admin-card"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          send({
            action: "create",
            email: f.get("email"),
            password: f.get("password"),
            role: f.get("role"),
          });
        }}
      >
        <h2>Provision a staff account</h2>
        <div className="form-grid">
          <label className="field">
            Email
            <input name="email" type="email" required />
          </label>
          <label className="field">
            Initial password (12+ characters)
            <input
              name="password"
              type="password"
              minLength={12}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            Role
            <select name="role">
              <option value="editor">Content editor</option>
              <option value="enquiries">Enquiry manager</option>
              <option value="owner">Owner</option>
            </select>
          </label>
        </div>
        <button className="button" disabled={busy} style={{ marginTop: 20 }}>
          Create staff account
        </button>
      </form>
    </>
  );
}
