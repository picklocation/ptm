import Image from "next/image";
import { EnquiryForm } from "@/components/enquiry-form";
import { Footer } from "@/components/footer";
import { publicContent, settings } from "@/lib/store";
import { photos } from "@/lib/seed-data";
import { CatalogueStatus } from "@/components/catalogue-status";
import { stayDestinations, stayDestinationKey } from "@/lib/stays";
export const metadata = {
  title: "Plan your personalised trip",
  alternates: { canonical: "/plan-my-trip" },
};
export const dynamic = "force-dynamic";
export default async function Plan({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const items = await publicContent();
  const item = items.find((x) => x.id === q.item);
  const s = await settings();
  // Suggestions come only from published content, never invented places.
  const stayNames = stayDestinations(items).map((x) => x.name);
  const places = [
    ...new Set(
      [
        ...items.filter((x) => x.kind === "destination").map((x) => x.title),
        ...items.map((x) => x.country || ""),
        ...stayNames,
        ...items.flatMap((x) => x.locations || []),
      ]
        .map((x) => x.trim())
        .filter((x) => x && !x.includes("/")),
    ),
  ]
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 300);
  const popular = [
    ...new Set([
      ...items
        .filter((x) => x.kind === "destination")
        .slice(0, 5)
        .map((x) => x.title),
      ...stayNames.slice(0, 3),
    ]),
  ].slice(0, 7);
  return (
    <>
      <main id="main" className="container page-main enquiry-page">
        <div className="enquiry-intro">
          <p className="eyebrow">A holiday that feels like you</p>
          <h1>
            Big dreams.
            <br />
            Little details.
            <br />
            Let’s talk travel.
          </h1>
          <p>
            Tell us what you have in mind. We’ll help turn your ideas into a
            personalised holiday, with the details thoughtfully taken care of.
          </p>
          <div className="enquiry-visual">
            <Image
              src={photos.kerala}
              alt="Lush green hills in Kerala"
              fill
              sizes="500px"
            />
          </div>
          <p className="small-note">
            No payment. No instant booking. Just the start of a good journey.
          </p>
        </div>
        <div>
          <CatalogueStatus />
          <EnquiryForm
            itemId={item?.id || ""}
            itemTitle={item?.title || ""}
            destination={
              stayDestinations(items).find(
                (d) =>
                  d.slug ===
                  stayDestinationKey(item?.stayDestinationSlug || ""),
              )?.name ||
              item?.location ||
              q.destination ||
              ""
            }
            kind={
              item && item.kind !== "destination"
                ? item.kind
                : ["holiday", "resort", "road-trip"].includes(q.kind || "")
                  ? q.kind!
                  : "holiday"
            }
            places={places}
            popular={popular}
            whatsappEnabled={!!s.whatsapp}
            preferWhatsApp={q.contact === "whatsapp"}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
