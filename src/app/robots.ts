import type { MetadataRoute } from "next";
import { demoEnabled } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      ...(process.env.VERCEL_ENV === "production" && !(await demoEnabled())
        ? { allow: "/", disallow: ["/admin", "/api", "/preview"] }
        : { disallow: "/" }),
    },
    sitemap: `${process.env.SITE_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}
