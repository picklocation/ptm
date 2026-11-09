import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";
import { Header } from "@/components/header";
import { demoEnabled, catalogueState } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title: {
      default: "PickTheMap — A place in mind. A journey made yours.",
      template: "%s | PickTheMap",
    },
    description:
      "Personalised holidays, scenic Europe road trips and beautiful Kerala stays. Pick the place. We’ll plan the way.",
    robots:
      process.env.VERCEL_ENV === "production" &&
      !(await demoEnabled()) &&
      !(await catalogueState()).unavailable
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        {children}
      </body>
    </html>
  );
}
