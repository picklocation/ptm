import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import { currentStaff } from "@/lib/auth";
import { list, get } from "@/lib/store";
import {
  defaultSettings,
  type Settings,
  type Content,
  type Enquiry,
  type Staff,
} from "@/lib/types";
import { AdminShell } from "@/components/admin-shell";
import { ContentEditor } from "@/components/content-editor";
import { EnquiryList, EnquiryDetail } from "@/components/admin-enquiries";
import { SettingsEditor } from "@/components/settings-editor";
import { StaffEditor } from "@/components/staff-editor";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
function blank(): Content {
  return {
    id: randomUUID(),
    kind: "holiday",
    title: "",
    slug: "",
    location: "",
    region: "",
    summary: "",
    description: "",
    image: "",
    gallery: [],
    imageAlt: "",
    days: 1,
    nights: 0,
    themes: [],
    featured: false,
    order: 100,
    status: "draft",
    demo: false,
    itinerary: [],
    inclusions: [],
    exclusions: [],
    amenities: [],
    rooms: [],
    mealPlans: [],
    vehicles: [],
    currency: "INR",
    priceBasis: "",
    priceConditions: "",
    seoTitle: "",
    seoDescription: "",
    updatedAt: new Date().toISOString(),
  };
}
export default async function Admin({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  const { segments = [] } = await params;
  const [section, id] = segments;
  let body: React.ReactNode;
  if (!section) {
    const contents =
      staff.role !== "enquiries" ? await list<Content>("content") : [];
    const enquiries =
      staff.role !== "editor"
        ? (await list<Enquiry>("enquiries")).sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          )
        : [];
    body = (
      <>
        <div className="admin-top">
          <div>
            <p className="eyebrow">Your travel desk</p>
            <h1>Good journeys start here.</h1>
          </div>
          <Link href="/" className="button secondary small" target="_blank">
            View website ↗
          </Link>
        </div>
        <div className="admin-stats">
          {[
            [
              "New enquiries",
              enquiries.filter((e) => e.status === "new").length,
            ],
            [
              "Awaiting Excel sync",
              enquiries.filter((e) => e.excelStatus !== "synced").length,
            ],
            [
              "Published content",
              contents.filter((c) => c.status === "published").length,
            ],
            ["Drafts", contents.filter((c) => c.status === "draft").length],
          ].map(([label, count]) => (
            <div className="admin-stat" key={label}>
              <span>{label}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
        <div className="notice">
          Your content workspace. Review sample content, replace fictional
          prices and add approved business details before launching real offers.
        </div>
        {staff.role !== "editor" && (
          <>
            <h2 style={{ marginBottom: 20 }}>Recent enquiries</h2>
            <EnquiryList initial={enquiries.slice(0, 20)} />
          </>
        )}
        {staff.role !== "enquiries" && (
          <div className="admin-card">
            <h2>Make something worth exploring.</h2>
            <p className="muted">
              Create a destination, holiday, road trip or resort. Preview it
              before publishing.
            </p>
            <Link
              href="/admin/content/new"
              className="button"
              style={{ marginTop: 20 }}
            >
              Create content +
            </Link>
          </div>
        )}
      </>
    );
  } else if (section === "content") {
    if (staff.role === "enquiries") redirect("/admin");
    if (id) {
      const c = id === "new" ? blank() : await get<Content>("content", id);
      if (!c) notFound();
      body = <ContentEditor initial={c} />;
    } else {
      const contents = (await list<Content>("content")).sort(
        (a, b) => a.order - b.order,
      );
      body = (
        <>
          <div className="admin-top">
            <h1>Content & journeys</h1>
            <Link href="/admin/content/new" className="button">
              Create content +
            </Link>
          </div>
          <div className="admin-card table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Homepage</th>
                  <th>Order</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/content/${c.id}`}>{c.title}</Link>
                      {c.demo && (
                        <span className="demo-tag" style={{ marginLeft: 8 }}>
                          Sample
                        </span>
                      )}
                    </td>
                    <td>{c.kind}</td>
                    <td>
                      <span className={`status ${c.status}`}>{c.status}</span>
                    </td>
                    <td>{c.featured ? "Featured" : "—"}</td>
                    <td>{c.order}</td>
                    <td>{new Date(c.updatedAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!contents.length && (
              <p>No content yet. Create your first journey.</p>
            )}
          </div>
        </>
      );
    }
  } else if (section === "preview") {
    if (staff.role === "enquiries") redirect("/admin");
    const c = await get<Content>("content", id);
    if (!c) notFound();
    body = (
      <>
        <div className="notice">
          Private draft preview · Save your latest changes before previewing.
        </div>
        <div className="admin-top">
          <h1>{c.title}</h1>
          <Link className="button secondary" href={`/admin/content/${c.id}`}>
            Back to editor
          </Link>
        </div>
        {c.image && (
          <div className="detail-hero">
            <Image
              src={c.image}
              alt={c.imageAlt}
              fill
              sizes="100vw"
              unoptimized={c.image.startsWith("/api/media/")}
            />
          </div>
        )}
        <section className="admin-card">
          <h2>{c.location}</h2>
          <p>{c.summary}</p>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
            {c.description}
          </p>
          {c.itinerary.map((d, i) => (
            <div className="detail-section" key={i}>
              <h3>
                {i + 1}. {d.title}
              </h3>
              <p>{d.description}</p>
            </div>
          ))}
        </section>
      </>
    );
  } else if (section === "enquiries") {
    if (staff.role === "editor") redirect("/admin");
    if (id) {
      const e = await get<Enquiry>("enquiries", id);
      if (!e) notFound();
      body = <EnquiryDetail initial={e} />;
    } else
      body = (
        <>
          <div className="admin-top">
            <h1>Enquiries</h1>
          </div>
          <EnquiryList
            initial={(await list<Enquiry>("enquiries")).sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
            )}
          />
        </>
      );
  } else if (section === "settings") {
    if (staff.role !== "owner") redirect("/admin");
    body = (
      <SettingsEditor
        initial={{
          ...defaultSettings,
          ...(await get<Settings>("settings", "site")),
        }}
      />
    );
  } else if (section === "staff") {
    if (staff.role !== "owner") redirect("/admin");
    body = (
      <StaffEditor
        initial={(await list<Staff>("staff")).map(({ passwordHash, ...s }) => {
          void passwordHash;
          return s;
        })}
        ownId={staff.id}
      />
    );
  } else if (section === "audit") {
    if (staff.role !== "owner") redirect("/admin");
    const logs = (
      await list<{ at: string; actor: string; action: string; item: string }>(
        "auditEvents",
      )
    ).sort((a, b) => b.at.localeCompare(a.at));
    body = (
      <>
        <div className="admin-top">
          <h1>Audit history</h1>
        </div>
        <div className="admin-card table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td>{new Date(l.at).toLocaleString("en-GB")}</td>
                  <td>{l.actor}</td>
                  <td>{l.action}</td>
                  <td>{l.item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else notFound();
  return <AdminShell staff={staff}>{body}</AdminShell>;
}
