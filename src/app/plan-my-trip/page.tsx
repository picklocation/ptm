import Image from "next/image";
import { EnquiryForm } from "@/components/enquiry-form";
import { Footer } from "@/components/footer";
import { publicContent, settings } from "@/lib/store";
import { photos } from "@/lib/seed-data";
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
        <EnquiryForm
          itemId={item?.id || ""}
          itemTitle={item?.title || ""}
          destination={item?.location || q.destination || ""}
          kind={
            item && item.kind !== "destination"
              ? item.kind
              : ["holiday", "resort", "road-trip"].includes(q.kind || "")
                ? q.kind!
                : "holiday"
          }
          whatsappEnabled={!!s.whatsapp}
        />
      </main>
      <Footer />
    </>
  );
}
