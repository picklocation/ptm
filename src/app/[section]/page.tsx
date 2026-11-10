import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { publicContent, settings } from "@/lib/store";
import { Catalogue } from "@/components/catalogue";
import { visaGuides } from "@/lib/visa-guides";
import { southIndiaLocations } from "@/lib/south-india";
import { Footer } from "@/components/footer";
import { CatalogueStatus } from "@/components/catalogue-status";
import { inCollection, collectionOptions } from "@/lib/classification";
const catalogues: Record<
  string,
  { kind: string; title: string; description: string }
> = {
  "south-india": {
    kind: "destination",
    title: "South India",
    description:
      "From Wayanad and Munnar to the coast: choose a place and make the journey your own.",
  },
  "international-trips": {
    kind: "holiday",
    title: "International trips",
    description:
      "South Asia, Southeast Asia and Europe. Explore a holiday shaped around your favourite places.",
  },
  "domestic-trips": {
    kind: "holiday",
    title: "Discover more of India",
    description:
      "Kashmir valleys, Rajasthan palaces, Kerala backwaters and everything in between.",
  },
  "resorts-and-villas": {
    kind: "resort",
    title: "Resorts & villas",
    description:
      "Find your kind of downtime. Budget-friendly escapes, family stays and quiet places for two.",
  },
  "visa-free-destinations": {
    kind: "holiday",
    title: "Visa-Free-destinations",
    description:
      "Travel inspiration for Indian passport holders, with entry conditions explained.",
  },
  holidays: {
    kind: "holiday",
    title: "Find your next great story.",
    description:
      "A little inspiration for your next escape. Every journey can be made your own.",
  },
  "europe-road-trips": {
    kind: "road-trip",
    title: "Take the scenic route.",
    description:
      "Explore Europe one beautiful stop at a time. Routes, stays and transport, thoughtfully arranged.",
  },
  "kerala-resorts": {
    kind: "resort",
    title: "Somewhere to simply be.",
    description:
      "From the backwaters to the coast. Explore ideas for a slower Kerala stay.",
  },
  destinations: {
    kind: "destination",
    title: "A world worth wandering.",
    description:
      "Follow your curiosity. Find a place that feels like your next chapter.",
  },
};
const titles: Record<string, string> = {
  about: "A place in mind. A journey made yours.",
  contact: "Let’s talk about your next trip.",
  faqs: "A little clarity before you go.",
  privacy: "Privacy policy",
  terms: "Terms and conditions",
  cancellation: "Cancellation information",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: catalogues[section]?.title || titles[section] || "Page not found",
    alternates: { canonical: `/${section}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const c = catalogues[section];
  if (c) {
    const items = (await publicContent()).filter((x) =>
      collectionOptions.some(([id]) => id === section)
        ? inCollection(x, section) ||
          (section === "south-india" &&
            x.kind === "destination" &&
            southIndiaLocations.some((place) => place.slug === x.slug))
        : x.kind === c.kind &&
          (section !== "south-india" ||
            southIndiaLocations.some((place) => place.slug === x.slug)) &&
          (section !== "domestic-trips" || x.region === "India") &&
          (section !== "international-trips" || x.region !== "India") &&
          (section !== "kerala-resorts" || /kerala/i.test(x.location)) &&
          (section !== "visa-free-destinations" ||
            visaGuides.some((v) => v.country === x.country)),
    );
    return (
      <>
        <main id="main" className="container page-main">
          <div className="page-intro">
            <p className="eyebrow">Pick your place</p>
            <h1>{c.title}</h1>
            <p>{c.description}</p>
          </div>
          <CatalogueStatus />
          {section === "visa-free-destinations" && (
            <section className="visa-guidance">
              <h2>Before choosing your trip</h2>
              <p>
                For Indian ordinary passport holders travelling for tourism.
                Checked 9 November 2026. Visa exemptions and free visas have
                different requirements. They do not waive entry documents,
                permits or fees. Confirm the rules for your travel date before
                making arrangements.
              </p>
              <div className="visa-guide-grid">
                {visaGuides.map((v) => (
                  <article key={v.country}>
                    <h3>{v.country}</h3>
                    <p>{v.note}</p>
                    <a href={v.source} target="_blank" rel="noreferrer">
                      Official entry guidance ↗
                    </a>
                  </article>
                ))}
              </div>
            </section>
          )}
          <Suspense>
            <Catalogue
              items={items}
              stays={c.kind === "resort"}
              destinations={
                c.kind === "destination" && section !== "south-india"
              }
            />
          </Suspense>
        </main>
        <Footer />
      </>
    );
  }
  if (!titles[section]) notFound();
  const s = await settings();
  return (
    <>
      <main id="main" className="container page-main prose-page">
        <p className="eyebrow">PickTheMap</p>
        <h1>{titles[section]}</h1>
        {section === "about" ? (
          <>
            <p className="lead">
              We help turn a place on your wish list into a holiday that feels
              like you.
            </p>
            <p>
              {s.about ||
                "PickTheMap organises customised holidays and travel arrangements based on what matters to each traveller. Explore international holidays, Europe road trips, Indian escapes and Kerala stays, then share your ideas with us."}
            </p>
            <Link className="button" href="/plan-my-trip">
              Let’s plan your trip ↗
            </Link>
          </>
        ) : section === "contact" ? (
          <>
            <p className="lead">
              A destination, a question, or just the beginnings of an idea. We’d
              love to hear it.
            </p>
            <div className="contact-box">
              {s.email && (
                <p>
                  Email: <a href={`mailto:${s.email}`}>{s.email}</a>
                </p>
              )}
              {s.phone && (
                <p>
                  Phone: <a href={`tel:${s.phone}`}>{s.phone}</a>
                </p>
              )}
              {s.address && <p>{s.address}</p>}
              <Link className="button" href="/plan-my-trip">
                Send a trip enquiry ↗
              </Link>
              {s.whatsapp && (
                <a
                  className="button secondary"
                  href={`https://wa.me/${s.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp ↗
                </a>
              )}
            </div>
            <Link href="/faqs" className="text-link">
              Browse frequently asked questions →
            </Link>
          </>
        ) : section === "faqs" ? (
          <div className="faqs">
            {s.faqs.map((x, i) => (
              <details key={i}>
                <summary>
                  {x.question}
                  <span>+</span>
                </summary>
                <p>{x.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <div className="policy-text">
            {s[section as "privacy" | "terms" | "cancellation"] ||
              "Business-approved policy content has not been published yet. Please contact the team for the applicable information before confirming travel arrangements."}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
