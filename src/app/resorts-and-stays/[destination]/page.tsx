import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { publicContent } from "@/lib/store";
import {
  stayDestinations,
  staysForDestination,
  stayDestinationKey,
} from "@/lib/stays";
import { StayListings } from "@/components/stay-listings";
import { Footer } from "@/components/footer";
import { CatalogueStatus } from "@/components/catalogue-status";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ destination: string }> };
export async function generateMetadata({ params }: Props) {
  const { destination } = await params;
  const place = stayDestinations(await publicContent()).find(
    (x) => x.slug === stayDestinationKey(destination),
  );
  return {
    title: place ? `${place.name} Resorts & Stays` : "Destination not found",
    alternates: {
      canonical: `/resorts-and-stays/${stayDestinationKey(destination)}`,
    },
  };
}
export default async function StayDestinationPage({ params }: Props) {
  const { destination } = await params;
  const key = stayDestinationKey(destination);
  if (key !== destination) permanentRedirect(`/resorts-and-stays/${key}`);
  const items = await publicContent();
  const place = stayDestinations(items).find((x) => x.slug === key);
  if (!place) notFound();
  return (
    <>
      <main id="main" className="container page-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/resorts-and-stays">Resorts & Stays</Link>
          <span>/</span>
          <span>{place.name}</span>
        </nav>
        <div className="page-intro">
          <h1>Stays in {place.name}</h1>
          <p>
            Find a place for two, a family break or a stay that suits your
            budget. Dates and availability are confirmed with your quote.
          </p>
        </div>
        <CatalogueStatus />
        <StayListings
          items={staysForDestination(items, key)}
          destination={place.name}
        />
      </main>
      <Footer />
    </>
  );
}
