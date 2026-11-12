import type { MetadataRoute } from "next";
import { demoEnabled, catalogueState } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      ...(process.env.VERCEL_ENV === "production" &&
      !(await demoEnabled()) &&
      !(await catalogueState()).unavailable
        ? { allow: "/", disallow: ["/admin", "/adminportal", "/api", "/preview"] }
        : { disallow: "/" }),
    },
    sitemap: `${process.env.SITE_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}
