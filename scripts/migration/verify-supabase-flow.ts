import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { migrationConfig } from "./config";
import { seedContent } from "../../src/lib/seed-data";
const c = migrationConfig();
const base = "http://localhost:3005";
const service = createClient(
  c.required("SUPABASE_URL"),
  c.required("SUPABASE_SECRET_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
let cookie = "";
async function call(route: string, data?: unknown, authenticated = true) {
  const response = await fetch(base + route, {
    method: data ? "POST" : "GET",
    redirect: "manual",
    headers: {
      Origin: base,
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(authenticated ? { Cookie: cookie } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const set = response.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return response;
}
const id = "qa-" + randomUUID();
const enquiryId = randomUUID();
const content = {
  ...seedContent.find((x) => x.kind === "holiday")!,
  id,
  slug: id,
  title: `QA disposable ${id}`,
  featured: false,
  state: "Kerala",
  locations: ["Munnar", "Vattavada"],
  packageType: "Camping" as const,
  collections: ["domestic-trips", "kerala-resorts", "resorts-and-villas"] as (
    "domestic-trips" | "kerala-resorts" | "resorts-and-villas"
  )[],
};
const createdUsers: string[] = [];
let uploadedId = "";
async function main() {
  assert.equal(
    (await call("/api/admin/content", { content, action: "publish" }, false))
      .status,
    401,
    "Anonymous admin write blocked",
  );
  const login = await call("/api/admin/login", {
    email: "pickthemap@gmail.com",
    password: c.required("SUPABASE_OWNER_PASSWORD"),
  });
  assert.equal(login.status, 200, "Owner login");
  assert.equal((await call("/adminportal")).status, 200, "Owner dashboard");
  for (const [route, heading] of [
    ["/adminportal/content", "Content &amp; journeys"],
    ["/adminportal/content/new", "A new journey"],
    ["/adminportal/enquiries", "Enquiries"],
    ["/adminportal/settings", "Frequently asked questions"],
    ["/adminportal/staff", "Staff &amp; access"],
    ["/adminportal/audit", "Audit"],
  ]) {
    const response = await call(route);
    assert.equal(response.status, 200, `Owner module ${route}`);
    assert.ok(
      (await response.text()).includes(heading),
      `Module content ${route}`,
    );
  }
  for (const [route, heading] of [
    ["/resorts-and-stays", "Kakkadampoyil"],
    ["/resorts-and-stays/munnar", "Stays in"],
    ["/south-asia", "South Asia"],
  ]) {
    const response = await call(route, undefined, false);
    assert.equal(response.status, 200, `Public stays route ${route}`);
    assert.ok((await response.text()).includes(heading));
  }
  assert.equal(
    (await call("/resorts-and-villas", undefined, false)).status,
    308,
    "Legacy stays index redirect",
  );
  assert.equal(
    (await call("/resorts-and-stays/unknown-place", undefined, false)).status,
    404,
    "Unknown stay destination",
  );
  const publish = await call("/api/admin/content", {
    content,
    action: "publish",
  });
  assert.equal(publish.status, 200, "Package publication");
  const classified = await service
    .from("content")
    .select("data")
    .eq("id", id)
    .single();
  assert.equal(
    classified.data?.data.packageType,
    "Camping",
    "Classification persisted",
  );
  assert.deepEqual(classified.data?.data.locations, ["Munnar", "Vattavada"]);
  assert.match(
    await (await call("/kerala-resorts", undefined, false)).text(),
    new RegExp(id),
    "Assigned package reaches Kerala section",
  );
  assert.equal(
    (await call(`/holidays/${id}`, undefined, false)).status,
    200,
    "Published package detail",
  );
  const enquiry = {
    requestId: enquiryId,
    name: "QA Traveller",
    email: "qa@example.test",
    phone: "+491234567890",
    destination: "Bali",
    kind: "holiday",
    startDate: "",
    endDate: "",
    flexible: true,
    adults: 2,
    children: 0,
    childAges: "",
    rooms: 1,
    departure: "Berlin",
    budget: "2000",
    currency: "EUR",
    budgetBasis: "total",
    preferences: "Disposable integration check",
    vehicle: "",
    mealPlan: "",
    contactMethod: "email",
    itemId: id,
    method: "whatsapp",
    consent: true,
    website: "",
    startedAt: Date.now() - 5000,
  };
  assert.equal(
    (await call("/api/enquiries", { ...enquiry, adults: 0 }, false)).status,
    400,
    "Invalid enquiry rejected",
  );
  const submitted = await call("/api/enquiries", enquiry, false);
  assert.equal(submitted.status, 201, "Enquiry saved");
  assert.match(
    (await submitted.json()).whatsappUrl,
    /^https:\/\/wa.me\/917902220044/,
  );
  assert.equal(
    (await call("/api/enquiries", enquiry, false)).status,
    201,
    "Idempotent retry",
  );
  const jobs = await service
    .from("delivery_jobs")
    .select("kind")
    .eq("enquiry_id", enquiryId);
  assert.equal(jobs.data?.length, 2, "Atomic delivery jobs");
  assert.equal(
    (await call(`/adminportal/enquiries/${enquiryId}`)).status,
    200,
    "Admin enquiry view",
  );
  assert.equal(
    (
      await call("/api/admin/enquiries", {
        id: enquiryId,
        status: "contacted",
        note: "QA note",
        assignedTo: "",
        followUp: "",
      })
    ).status,
    200,
    "Enquiry update with audit",
  );
  const updated = await service
    .from("enquiries")
    .select("data")
    .eq("id", enquiryId)
    .single();
  assert.equal(updated.data?.data.status, "contacted");
  assert.equal(
    (await call("/api/admin/export?format=xlsx")).status,
    200,
    "Excel export",
  );
  const badUpload = new FormData();
  badUpload.set(
    "file",
    new Blob(["not an image"], { type: "image/png" }),
    "bad.png",
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/upload", {
        method: "POST",
        headers: { Origin: base, Cookie: cookie },
        body: badUpload,
      })
    ).status,
    400,
    "Malformed upload rejected",
  );
  const sharp = (await import("sharp")).default;
  const bytes = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#05a660" },
  })
    .png()
    .toBuffer();
  const validUpload = new FormData();
  validUpload.set(
    "file",
    new Blob([new Uint8Array(bytes)], { type: "image/png" }),
    "qa.png",
  );
  const uploaded = await fetch(base + "/api/admin/upload", {
    method: "POST",
    headers: { Origin: base, Cookie: cookie },
    body: validUpload,
  });
  assert.equal(uploaded.status, 200, "Valid Supabase upload");
  const media = await uploaded.json();
  uploadedId = media.id;
  assert.equal(
    (await call(media.url, undefined, false)).status,
    404,
    "Unpublished upload private",
  );
  assert.equal((await call(media.url)).status, 200, "Editor preview upload");
  content.image = media.url;
  assert.equal(
    (await call("/api/admin/content", { content, action: "publish" })).status,
    200,
  );
  assert.equal(
    (await call(media.url, undefined, false)).status,
    200,
    "Published photo accessible",
  );
  for (const role of ["editor", "enquiries"] as const) {
    const email = `ptm-qa-${randomUUID()}@example.test`,
      password = randomBytes(24).toString("hex");
    const user = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.ok(user.data.user);
    const userId = user.data.user.id;
    createdUsers.push(userId);
    assert.equal(
      (
        await service
          .from("staff")
          .insert({ id: userId, email, role, active: true })
      ).error,
      null,
    );
    const scoped = createClient(
      c.required("SUPABASE_URL"),
      c.required("SUPABASE_PUBLISHABLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    assert.equal(
      (await scoped.auth.signInWithPassword({ email, password })).error,
      null,
    );
    const allowed = await scoped
      .from(role === "editor" ? "content" : "enquiries")
      .select("id")
      .limit(1);
    assert.equal(allowed.error, null);
    assert.ok(allowed.data?.length);
    const denied = await scoped
      .from(role === "editor" ? "enquiries" : "content")
      .select("id")
      .limit(1);
    assert.equal(denied.data?.length, 0, "Cross-role rows hidden");
    assert.ok(
      (await scoped.from("staff").update({ role: "owner" }).eq("id", userId))
        .error,
      "Self-promotion denied",
    );
    await service.from("staff").update({ active: false }).eq("id", userId);
    const disabled = await scoped
      .from(role === "editor" ? "content" : "enquiries")
      .select("id")
      .limit(1);
    assert.equal(disabled.data?.length, 0, "Disabled staff immediately denied");
    await scoped.auth.signOut();
  }
  assert.equal(
    (await call("/api/admin/content", { content, action: "unpublish" })).status,
    200,
  );
  assert.equal(
    (await call(`/holidays/${id}`, undefined, false)).status,
    404,
    "Unpublished detail hidden",
  );
  const unverifiedStay = {
    ...content,
    kind: "resort",
    demo: false,
    propertyVerified: false,
    stayDestinationSlug: "munnar",
    stayTags: ["Families", "Budget"],
  };
  assert.equal(
    (
      await call("/api/admin/content", {
        content: unverifiedStay,
        action: "save",
      })
    ).status,
    200,
    "Save stay assignment as draft",
  );
  const savedStay = await service
    .from("content")
    .select("data")
    .eq("id", id)
    .single();
  assert.equal(savedStay.data?.data.stayDestinationSlug, "munnar");
  assert.deepEqual(savedStay.data?.data.stayTags, ["Families", "Budget"]);
  assert.equal(
    (
      await call("/api/admin/content", {
        content: unverifiedStay,
        action: "publish",
      })
    ).status,
    400,
    "Unverified property publication blocked",
  );
  assert.equal(
    (await call(`/resorts-and-villas/${id}`, undefined, false)).status,
    404,
    "Unverified property not public",
  );
  assert.equal((await call("/api/admin/logout", {})).status, 200);
  assert.equal(
    (await call("/api/admin/content", { content, action: "publish" })).status,
    401,
    "Logout protected",
  );
  console.log(
    "PASS: login, dashboard, publish/discover/enquire, duplicate prevention, outbox, enquiry update, Excel export, invalid upload, role isolation, disabled staff, unpublish, logout.",
  );
}
async function cleanup() {
  // Delete only IDs generated by this disposable test run, never business data.
  for (const userId of createdUsers) {
    await service.from("staff").delete().eq("id", userId);
    await service.auth.admin.deleteUser(userId);
  }
  await service.from("delivery_jobs").delete().eq("enquiry_id", enquiryId);
  await service.from("enquiries").delete().eq("id", enquiryId);
  await service.from("content_revisions").delete().eq("content_id", id);
  await service.from("published_content").delete().eq("id", id);
  await service.from("content").delete().eq("id", id);
  if (uploadedId) {
    await service.storage
      .from("website-private")
      .remove([`media/${uploadedId}.webp`]);
    await service.from("media_assets").delete().eq("id", uploadedId);
  }
  await service.from("audit_events").delete().eq("data->>item", content.title);
  await service.from("audit_events").delete().eq("data->>item", enquiryId);
}
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Flow failed");
    process.exitCode = 1;
  })
  .finally(cleanup);
