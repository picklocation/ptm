import type { MetadataRoute } from "next";
import { publicContent } from "@/lib/store";
import { paths } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return [
    ...[
      "",
      "holidays",
      "international-trips",
      "domestic-trips",
      "resorts-and-villas",
      "visa-free-destinations",
      "destinations",
      "europe-road-trips",
      "kerala-resorts",
      "about",
      "contact",
      "faqs",
      "plan-my-trip",
    ].map((p) => ({ url: `${base}/${p}` })),
    ...(await publicContent())
      .filter((x) => !x.demo)
      .map((x) => ({
        url: `${base}/${paths[x.kind]}/${x.slug}`,
        lastModified: x.updatedAt,
      })),
  ];
}
