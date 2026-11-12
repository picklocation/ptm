import type { MetadataRoute } from "next";
import { publicContent, demoEnabled } from "@/lib/store";
import { paths } from "@/lib/types";
import { stayDestinations } from "@/lib/stays";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (await demoEnabled()) return [];
  const base = process.env.SITE_URL || "http://localhost:3000";
  return [
    ...[
      "",
      "holidays",
      "south-india",
      "international-trips",
      "domestic-trips",
      "resorts-and-stays",
      "south-asia",
      "visa-free-destinations",
      "destinations",
      "europe-road-trips",
      "kerala-resorts",
      "about",
      "contact",
      "faqs",
      "plan-my-trip",
    ].map((p) => ({ url: `${base}/${p}` })),
    ...stayDestinations(await publicContent()).map((p) => ({
      url: `${base}/resorts-and-stays/${p.slug}`,
    })),
    ...(await publicContent())
      .filter((x) => !x.demo)
      .map((x) => ({
        url: `${base}/${paths[x.kind]}/${x.slug}`,
        lastModified: x.updatedAt,
      })),
  ];
}
