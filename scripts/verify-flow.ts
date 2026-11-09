import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
nextEnv.loadEnvConfig(process.cwd());
const base = process.env.SITE_URL || "http://localhost:3000";
const { seedContent } = await import("../src/lib/seed-data");
let cookie = "";
async function call(path: string, data?: unknown, authenticated = true) {
  const res = await fetch(base + path, {
    method: data ? "POST" : "GET",
    headers: {
      Origin: base,
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(authenticated ? { Cookie: cookie } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return res;
}
assert.equal(
  (
    await call(
      "/api/admin/content",
      { content: seedContent[0], action: "publish" },
      false,
    )
  ).status,
  401,
);
let idToken = "";
if (process.env.DATA_BACKEND === "firebase") {
  const endpoint = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (!endpoint)
    throw new Error("Flow tests require a local emulator, never production.");
  const authResponse = await fetch(
    `http://${endpoint}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-pickthemap-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.LOCAL_ADMIN_EMAIL,
        password: process.env.LOCAL_ADMIN_PASSWORD,
        returnSecureToken: true,
      }),
    },
  );
  assert.equal(authResponse.status, 200);
  idToken = (await authResponse.json()).idToken;
}
const login = await call("/api/admin/login", {
  email: process.env.LOCAL_ADMIN_EMAIL,
  password: process.env.LOCAL_ADMIN_PASSWORD,
  idToken,
});
assert.equal(login.status, 200);
const testContent = {
  ...seedContent[0],
  id: "qa-" + randomUUID(),
  slug: "qa-" + randomUUID(),
  title: "QA journey — development only",
  demo: true,
  featured: false,
};
assert.equal(
  (
    await call("/api/admin/content", {
      content: testContent,
      action: "publish",
    })
  ).status,
  200,
);
assert.equal((await call("/holidays/" + testContent.slug)).status, 200);
const enquiry = {
  requestId: randomUUID(),
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
  preferences: "Development integration verification",
  vehicle: "",
  mealPlan: "",
  contactMethod: "email",
  itemId: testContent.id,
  method: "whatsapp",
  consent: true,
  website: "",
  startedAt: Date.now() - 5000,
};
assert.equal(
  (await call("/api/enquiries", { ...enquiry, adults: 0 }, false)).status,
  400,
);
const saved = await call("/api/enquiries", enquiry, false);
assert.equal(saved.status, 201);
const body = await saved.json();
assert.equal(body.id, enquiry.requestId);
assert.equal((await call("/api/enquiries", enquiry, false)).status, 201);
const { get, list, put, remove } = await import("../src/lib/store");
assert.equal(
  (await list<{ id: string }>("enquiries")).filter((e) => e.id === body.id)
    .length,
  1,
);
assert.ok(await get("excelJobs", body.id));
assert.equal(
  (
    await call("/api/admin/enquiries", {
      id: body.id,
      status: "contacted",
      note: "QA follow-up note",
      assignedTo: "Owner",
      followUp: "2027-01-01",
    })
  ).status,
  200,
);
const form = new FormData();
form.set(
  "file",
  new Blob(["not a real image"], { type: "image/png" }),
  "fake.png",
);
const upload = await fetch(base + "/api/admin/upload", {
  method: "POST",
  headers: { Origin: base, Cookie: cookie },
  body: form,
});
assert.equal(upload.status, 400);
const sharp = (await import("sharp")).default;
const imageBytes = await sharp({
  create: { width: 10, height: 10, channels: 3, background: "#05a660" },
})
  .png()
  .toBuffer();
const realForm = new FormData();
realForm.set(
  "file",
  new Blob([new Uint8Array(imageBytes)], { type: "image/png" }),
  "qa.png",
);
const realUpload = await fetch(base + "/api/admin/upload", {
  method: "POST",
  headers: { Origin: base, Cookie: cookie },
  body: realForm,
});
assert.equal(realUpload.status, 200);
const media = await realUpload.json();
assert.equal((await call(media.url, undefined, false)).status, 404);
assert.equal((await call(media.url)).status, 200);
testContent.image = media.url;
assert.equal(
  (
    await call("/api/admin/content", {
      content: testContent,
      action: "publish",
    })
  ).status,
  200,
);
assert.equal((await call(media.url, undefined, false)).status, 200);

assert.equal(
  (
    await fetch(base + "/api/admin/settings", {
      method: "POST",
      headers: {
        Origin: "https://evil.example",
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: "{}",
    })
  ).status,
  403,
);
const sync = await call("/api/admin/sync", {});
assert.equal(sync.status, 200);
assert.equal(
  (await get<{ excelStatus: string }>("enquiries", body.id))?.excelStatus,
  "synced",
);
const ExcelJS = (await import("exceljs")).default;
const path = await import("node:path");
const target = path.resolve(process.env.EXCEL_PATH || ".local/enquiries.xlsx");
const book = new ExcelJS.Workbook();
await book.xlsx.readFile(target);
const sheet = book.getWorksheet("Enquiries")!;
let row = 0;
sheet.eachRow((r, n) => {
  if (r.getCell(1).text === body.id) row = n;
});
assert.ok(row > 1);
const { columns } = await import("../src/lib/excel");
sheet.getRow(row).getCell(columns.length + 2).value =
  "Keep my manual tracking note";
await book.xlsx.writeFile(target);
await put("excelJobs", body.id, {
  id: body.id,
  status: "pending",
  attempts: 0,
});
assert.equal((await call("/api/admin/sync", {})).status, 200);
const check = new ExcelJS.Workbook();
await check.xlsx.readFile(target);
assert.equal(
  check
    .getWorksheet("Enquiries")!
    .getRow(row)
    .getCell(columns.length + 2).text,
  "Keep my manual tracking note",
);
assert.equal(
  (
    await call("/api/admin/content", {
      content: testContent,
      action: "unpublish",
    })
  ).status,
  200,
);
assert.equal((await call("/holidays/" + testContent.slug)).status, 404);
assert.equal((await call(media.url, undefined, false)).status, 404);
await remove("media", media.id);
if (process.env.DATA_BACKEND === "firebase") {
  const { getStorage } = await import("firebase-admin/storage");
  const { firebaseApp } = await import("../src/lib/store");
  await getStorage(firebaseApp())
    .bucket()
    .file("media/" + media.id + ".webp")
    .delete();
} else {
  const { unlink } = await import("node:fs/promises");
  await unlink(path.join(process.cwd(), ".local", "media", media.id + ".webp"));
}
// Remove only test data generated by this run; retain the workbook as verification evidence.
for (const collection of ["content", "publishedContent"])
  await remove(collection, testContent.id);
for (const collection of ["enquiries", "excelJobs", "notificationJobs"])
  await remove(collection, body.id);
console.log(
  "PASS: auth, publish, public detail, invalid submission, idempotency, enquiry update, unsafe upload, private/published image access, CSRF, Excel sync/manual-column preservation, unpublish.",
);
