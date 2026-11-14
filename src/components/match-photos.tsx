"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function MatchPhotos() {
  const [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  const router = useRouter();
  return (
    <div className="notice">
      <strong>Location photos.</strong> Replace the shared sample photos with
      the checked photograph for each record’s own place. Photos you uploaded
      are not changed.{" "}
      <button
        type="button"
        className="button secondary small"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setNote("Updating…");
          try {
            const r = await fetch("/api/admin/content/photos", {
              method: "POST",
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || "Update failed.");
            setNote(
              j.updated
                ? `${j.updated} records updated.`
                : "Everything already matches.",
            );
            router.refresh();
          } catch (e) {
            setNote(e instanceof Error ? e.message : "Update failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Match photos to locations
      </button>{" "}
      <span role="status">{note}</span>
    </div>
  );
}
