import { catalogueState } from "@/lib/store";
export async function CatalogueStatus() {
  if (!(await catalogueState()).unavailable) return null;
  return (
    <aside className="notice" role="status">
      Trip listings are temporarily unavailable. Please try again later, or{" "}
      <a href="https://wa.me/917902220044" className="text-link">
        contact PickTheMap on WhatsApp
      </a>{" "}
      to plan your holiday.
    </aside>
  );
}
