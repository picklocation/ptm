"use client";
import { useState } from "react";
import type { Settings } from "@/lib/types";
export function SettingsEditor({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(s),
          });
          const j = await r.json();
          setMessage(r.ok ? "Settings saved." : j.error);
        } catch {
          setMessage("Save failed. Please retry.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="admin-top">
        <h1>Site settings</h1>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="editor-grid">
        <div>
          <section className="admin-card">
            <h2>Business details</h2>
            {(
              [
                "whatsapp",
                "email",
                "phone",
                "address",
                "instagram",
                "facebook",
              ] as const
            ).map((k) => (
              <label className="field" key={k}>
                {k === "whatsapp"
                  ? "WhatsApp number (digits with country code, no +)"
                  : k}
                <input
                  value={s[k]}
                  onChange={(e) => setS({ ...s, [k]: e.target.value })}
                />
              </label>
            ))}
          </section>
          <section className="admin-card">
            <h2>Approved content & policies</h2>
            {(["about", "privacy", "terms", "cancellation"] as const).map(
              (k) => (
                <label className="field" key={k}>
                  {k}
                  <textarea
                    rows={7}
                    value={s[k]}
                    onChange={(e) => setS({ ...s, [k]: e.target.value })}
                  />
                </label>
              ),
            )}
          </section>
        </div>
        <section className="admin-card">
          <h2>Frequently asked questions</h2>
          {s.faqs.map((f, i) => (
            <div className="repeat-row" key={i}>
              <label className="field">
                Question
                <input
                  value={f.question}
                  onChange={(e) =>
                    setS({
                      ...s,
                      faqs: s.faqs.map((x, j) =>
                        j === i ? { ...x, question: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <label className="field">
                Answer
                <textarea
                  value={f.answer}
                  rows={4}
                  onChange={(e) =>
                    setS({
                      ...s,
                      faqs: s.faqs.map((x, j) =>
                        j === i ? { ...x, answer: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setS({ ...s, faqs: s.faqs.filter((_, j) => i !== j) })
                }
              >
                Remove question
              </button>
            </div>
          ))}
          <button
            type="button"
            className="button secondary small"
            onClick={() =>
              setS({ ...s, faqs: [...s.faqs, { question: "", answer: "" }] })
            }
          >
            Add question
          </button>
        </section>
      </div>
    </form>
  );
}
