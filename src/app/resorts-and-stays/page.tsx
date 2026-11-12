import Link from "next/link";
import Image from "next/image";
import { publicContent } from "@/lib/store";
import { stayDestinations } from "@/lib/stays";
import { Footer } from "@/components/footer";
import { CatalogueStatus } from "@/components/catalogue-status";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Resorts & Stays",
  alternates: { canonical: "/resorts-and-stays" },
};
export default async function StaysHome() {
  const places = stayDestinations(await publicContent());
  return (
    <>
      <main id="main" className="container page-main">
        <div className="page-intro">
          <h1>Resorts & Stays</h1>
          <p>
            Choose your destination, then find a stay for your dates and your
            kind of trip.
          </p>
        </div>
        <CatalogueStatus />
        <div className="stay-destination-grid">
          {places.map((place) => (
            <Link
              key={place.slug}
              href={`/resorts-and-stays/${place.slug}`}
              className="stay-destination-card"
            >
              <div className="card-photo">
                <Image
                  src={place.image}
                  alt={place.alt}
                  fill
                  sizes="(max-width:600px) 90vw, (max-width:1100px) 45vw, 23vw"
                  unoptimized={place.image.startsWith("/api/media/")}
                />
              </div>
              <div className="card-body">
                <h2>{place.name}</h2>
                <span className="text-link">
                  Explore stays <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
        <p className="small-note">
          Destination imagery is travel inspiration. Property photographs and
          details appear within each published stay.
        </p>
      </main>
      <Footer />
    </>
  );
}
