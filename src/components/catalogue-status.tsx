import Link from "next/link";
import { catalogueState, settings } from "@/lib/store";
export async function CatalogueStatus() {
  if (!(await catalogueState()).unavailable) return null;
  const s = await settings();
  const wa = s.whatsapp || "917902220044";
  return (
    <aside className="notice status-notice" role="status">
      <p>Trips are loading slowly right now. Please try again in a moment.</p>
      <div>
        <Link href="/plan-my-trip" className="button small">
          Plan my trip
        </Link>
        <a
          href={`https://wa.me/${wa}`}
          className="button small secondary"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp us
        </a>
      </div>
    </aside>
  );
}
