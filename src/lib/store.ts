import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Content, Enquiry, Settings } from "./types";
import { defaultSettings } from "./types";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  isDatabaseUnavailable,
  publicReadDeadline,
  resilient,
} from "./service-errors";
const persistentPublicCache = () =>
  firebaseMode() && !process.env.FIRESTORE_EMULATOR_HOST;
export const firebaseMode = () => process.env.DATA_BACKEND === "firebase";
async function readShowcase() {
  try {
    return (
      (
        await publicReadDeadline(
          get<{ enabled: boolean }>("runtimeConfig", "demoShowcase"),
        )
      )?.enabled === true
    );
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return false;
  } // Never enable sample publication when the mode cannot be verified.
}
const cachedShowcase = unstable_cache(readShowcase, ["ptm-showcase-v1"], {
  revalidate: 900,
  tags: ["ptm-public"],
});
export const demoEnabled = cache(
  async () =>
    (process.env.ENABLE_DEMO_CONTENT === "true" &&
      process.env.VERCEL_ENV !== "production") ||
    (await (persistentPublicCache() ? cachedShowcase() : readShowcase())),
);
let sqlite: DatabaseSync | undefined;
function local() {
  if (process.env.VERCEL)
    throw new Error(
      "Configure DATA_BACKEND=firebase before deploying. Local storage is not durable on Vercel.",
    );
  if (!sqlite) {
    mkdirSync(path.join(process.cwd(), ".local"), { recursive: true });
    sqlite = new DatabaseSync(
      path.join(process.cwd(), ".local", "pickthemap.sqlite"),
    );
    sqlite.exec(
      "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS documents (collection TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(collection,id));",
    );
  }
  return sqlite;
}
export function firebaseApp() {
  if (!getApps().length) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      ...(!process.env.FIRESTORE_EMULATOR_HOST &&
      process.env.FIREBASE_PRIVATE_KEY
        ? {
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
                /\\n/g,
                "\n",
              ),
            }),
          }
        : {}),
    });
  }
  return getApps()[0];
}
function cloud() {
  return getFirestore(firebaseApp());
}
export async function get<T>(
  collection: string,
  id: string,
): Promise<T | null> {
  if (firebaseMode()) {
    const d = await cloud().collection(collection).doc(id).get();
    return d.exists ? (d.data() as T) : null;
  }
  const row = local()
    .prepare("SELECT data FROM documents WHERE collection=? AND id=?")
    .get(collection, id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}
export async function list<T>(collection: string): Promise<T[]> {
  if (firebaseMode())
    return (await cloud().collection(collection).get()).docs.map(
      (d) => d.data() as T,
    );
  return (
    local()
      .prepare("SELECT data FROM documents WHERE collection=?")
      .all(collection) as { data: string }[]
  ).map((r) => JSON.parse(r.data));
}
export async function put(collection: string, id: string, data: unknown) {
  if (firebaseMode()) {
    await cloud()
      .collection(collection)
      .doc(id)
      .set(JSON.parse(JSON.stringify(data)));
    return;
  }
  local()
    .prepare(
      "INSERT INTO documents(collection,id,data) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data",
    )
    .run(collection, id, JSON.stringify(data));
}
export async function remove(collection: string, id: string) {
  if (firebaseMode()) {
    await cloud().collection(collection).doc(id).delete();
    return;
  }
  local()
    .prepare("DELETE FROM documents WHERE collection=? AND id=?")
    .run(collection, id);
}
type Write = { collection: string; id: string; data: unknown | null };
export async function batch(writes: Write[]) {
  if (firebaseMode()) {
    const b = cloud().batch();
    for (const w of writes) {
      const ref = cloud().collection(w.collection).doc(w.id);
      if (w.data === null) b.delete(ref);
      else b.set(ref, JSON.parse(JSON.stringify(w.data)));
    }
    await b.commit();
    return;
  }
  const db = local();
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const w of writes) {
      if (w.data === null)
        db.prepare("DELETE FROM documents WHERE collection=? AND id=?").run(
          w.collection,
          w.id,
        );
      else
        db.prepare(
          "INSERT INTO documents(collection,id,data) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data",
        ).run(w.collection, w.id, JSON.stringify(w.data));
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export async function createEnquiryOnce(enquiry: Enquiry): Promise<Enquiry> {
  const job = {
    id: enquiry.id,
    status: "pending",
    attempts: 0,
    updatedAt: enquiry.updatedAt,
  };
  if (firebaseMode()) {
    return cloud().runTransaction(async (tx) => {
      const ref = cloud().collection("enquiries").doc(enquiry.id);
      const old = await tx.get(ref);
      if (old.exists) return old.data() as Enquiry;
      tx.set(ref, enquiry);
      tx.set(cloud().collection("excelJobs").doc(enquiry.id), job);
      tx.set(cloud().collection("notificationJobs").doc(enquiry.id), job);
      return enquiry;
    });
  }
  const db = local();
  db.exec("BEGIN IMMEDIATE");
  try {
    const old = await get<Enquiry>("enquiries", enquiry.id);
    if (old) {
      db.exec("COMMIT");
      return old;
    }
    for (const [c, data] of [
      ["enquiries", enquiry],
      ["excelJobs", job],
      ["notificationJobs", job],
    ] as const)
      db.prepare("INSERT INTO documents VALUES(?,?,?)").run(
        c,
        enquiry.id,
        JSON.stringify(data),
      );
    db.exec("COMMIT");
    return enquiry;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export async function rateLimit(key: string, max = 8, windowMs = 600000) {
  const now = Date.now();
  if (firebaseMode())
    return cloud().runTransaction(async (tx) => {
      const ref = cloud().collection("rateLimits").doc(key);
      const d = (await tx.get(ref)).data();
      const current =
        d && d.until > now ? d : { count: 0, until: now + windowMs };
      if (current.count >= max) return false;
      tx.set(ref, { count: current.count + 1, until: current.until });
      return true;
    });
  const db = local();
  db.exec("BEGIN IMMEDIATE");
  try {
    const d = await get<{ count: number; until: number }>("rateLimits", key);
    const current =
      d && d.until > now ? d : { count: 0, until: now + windowMs };
    if (current.count >= max) {
      db.exec("COMMIT");
      return false;
    }
    await put("rateLimits", key, {
      count: current.count + 1,
      until: current.until,
    });
    db.exec("COMMIT");
    return true;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
// Failures must throw inside the cached function so an outage is never cached
// for an hour; `resilient` serves the last good snapshot during an outage.
const cachedCatalogue = unstable_cache(
  () => publicReadDeadline(list<Content>("publishedContent")),
  ["ptm-catalogue-v3"],
  { revalidate: 3600, tags: ["ptm-public"] },
);
const readCatalogue = resilient<Content>(() =>
  persistentPublicCache()
    ? cachedCatalogue()
    : publicReadDeadline(list<Content>("publishedContent")),
);
export const catalogueState = cache(readCatalogue);
export const publicContent = cache(async () => {
  const showDemo = await demoEnabled();
  return (await catalogueState()).items
    .filter((x) => x.status === "published" && (!x.demo || showDemo))
    .sort((a, b) => a.order - b.order);
});
async function readSettings(): Promise<Settings> {
  try {
    return {
      ...defaultSettings,
      ...(await publicReadDeadline(get<Settings>("settings", "site"))),
    };
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    return defaultSettings;
  }
}
const cachedSettings = unstable_cache(readSettings, ["ptm-settings-v1"], {
  revalidate: 900,
  tags: ["ptm-public"],
});
export const settings = cache(() =>
  persistentPublicCache() ? cachedSettings() : readSettings(),
);
