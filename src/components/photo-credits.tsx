import { placePhotos } from "@/lib/place-photos";
// Attribution required by the photographers' licences (CC BY / CC BY-SA).
// Shown at the end of the Terms page; keep it for as long as these photos
// are used on the website.
export function PhotoCredits() {
  const credited = placePhotos.filter((p) => p.source === "Wikimedia Commons");
  if (!credited.length) return null;
  return (
    <details className="photo-credits">
      <summary>Photograph credits</summary>
      <p className="small-note">
        Some photographs are from Wikimedia Commons and are used under the
        licences shown, after resizing and compression. No endorsement by the
        photographers is implied.
      </p>
      <ul>
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
                  Source ↗
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
