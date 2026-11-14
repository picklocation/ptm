import { Footer } from "@/components/footer";
import { placePhotos } from "@/lib/place-photos";
export const metadata = {
  title: "Photo credits",
  alternates: { canonical: "/photo-credits" },
};
export default function PhotoCredits() {
  const credited = placePhotos.filter((p) => p.source === "Wikimedia Commons");
  return (
    <>
      <main id="main" className="container page-main prose-page">
        <p className="eyebrow">PickTheMap</p>
        <h1>Photo credits</h1>
        <p className="lead">
          Destination photographs on this site show the places they are labelled
          with. Property photographs appear only on individual stays.
        </p>
        <p>
          Some destination photographs come from Unsplash and are used under the
          Unsplash licence. The photographs below come from Wikimedia Commons
          and are used under the licences shown. They have been resized and
          compressed; no endorsement by the photographers is implied.
        </p>
        <ul className="credit-list">
          {credited.map((p) => (
            <li key={p.key}>
              <strong>{p.alt}</strong>
              <br />
              Photo: {p.author || "Wikimedia Commons contributor"}
              {p.licence ? `, ${p.licence}` : ""}
              {p.page && (
                <>
                  {" · "}
                  <a href={p.page} target="_blank" rel="noreferrer">
                    Source and licence ↗
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
