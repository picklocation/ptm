"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// One-click owner maintenance actions shown above the content list.
function OwnerAction({
  title,
  text,
  button,
  endpoint,
  done,
}: {
  title: string;
  text: string;
  button: string;
  endpoint: string;
  done: (result: Record<string, unknown>) => string;
}) {
  const [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  const router = useRouter();
  return (
    <div className="notice">
      <strong>{title}</strong> {text}{" "}
      <button
        type="button"
        className="button secondary small"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setNote("Working…");
          try {
            const r = await fetch(endpoint, { method: "POST" });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || "Update failed.");
            setNote(done(j));
            router.refresh();
          } catch (e) {
            setNote(e instanceof Error ? e.message : "Update failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {button}
      </button>{" "}
      <span role="status">{note}</span>
    </div>
  );
}
export function MatchPhotos() {
  return (
    <OwnerAction
      title="Location photos."
      text="Replace the shared sample photos with the checked photograph for each record’s own place. Photos you uploaded are not changed."
      button="Match photos to locations"
      endpoint="/api/admin/content/photos"
      done={(j) =>
        j.updated
          ? `${j.updated} records updated.`
          : "Everything already matches."
      }
    />
  );
}
export function InstallEuropeDrives() {
  return (
    <OwnerAction
      title="Europe driving trips."
      text="Add the DISCOVER Europe and Euro Drive packages and archive the sample road trips, so only those two are offered. Packages you have already edited are not overwritten."
      button="Set up the two packages"
      endpoint="/api/admin/content/europe-drives"
      done={(j) => {
        const added = (j.added as string[]) || [];
        return added.length || j.archived
          ? `${added.length ? "Added " + added.join(" and ") + ". " : ""}${j.archived ? j.archived + " sample road trips archived." : ""}`
          : "Both packages are already set up.";
      }}
    />
  );
}
