import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { cert, initializeApp, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp, GeoPoint, DocumentReference, type CollectionReference } from "firebase-admin/firestore";
import { migrationConfig } from "./config";

const c = migrationConfig();
// Never load local emulator configuration for a cloud backup.
if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error("Remove emulator environment variables before cloud export.");
const key = JSON.parse(readFileSync(c.required("FIREBASE_SERVICE_ACCOUNT_PATH"), "utf8"));
if (key.project_id !== "pickthemap-fe68b") throw new Error("Unexpected Firebase source project.");
const app = initializeApp({ credential: cert(key), projectId: key.project_id });
const db = getFirestore(app);
db.settings({ preferRest: true });
const directory = path.join(c.output, `firebase-${new Date().toISOString().replace(/[:.]/g, "-")}`);
function encode(value: unknown): unknown {
  if (value instanceof Timestamp) return { __firestoreType: "timestamp", seconds: value.seconds, nanoseconds: value.nanoseconds };
  if (value instanceof GeoPoint) return { __firestoreType: "geopoint", latitude: value.latitude, longitude: value.longitude };
  if (value instanceof DocumentReference) return { __firestoreType: "reference", path: value.path };
  if (Buffer.isBuffer(value)) return { __firestoreType: "bytes", base64: value.toString("base64") };
  if (typeof value === "number" && !Number.isFinite(value)) return { __firestoreType: "number", value: String(value) };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,encode(v)]));
  return value;
}
const records: { path: string; exists: boolean; data: unknown }[] = [];
const counts: Record<string, number> = {};
async function visit(collection: CollectionReference) {
  // listDocuments includes missing parent documents with surviving subcollections.
  const references = await collection.listDocuments();
  counts[collection.path] = 0;
  for (let start=0; start<references.length; start+=100) {
    const documents = await db.getAll(...references.slice(start,start+100));
    for (const document of documents) {
      records.push({ path: document.ref.path, exists: document.exists, data: document.exists ? encode(document.data()) : null });
      if (document.exists) counts[collection.path]++;
      for (const child of await document.ref.listCollections()) await visit(child);
    }
  }
}
async function main() {
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory,"manifest.json"), JSON.stringify({ complete:false, project:key.project_id, startedAt:new Date().toISOString() },null,2));
  for (const collection of await db.listCollections()) {
    await visit(collection);
    console.log(`Exported collection ${collection.id}: ${counts[collection.path]} records`);
  }
  const users: unknown[] = [];
  let token: string | undefined;
  do {
    const page = await getAuth(app).listUsers(1000,token);
    // Preserve identity metadata; password reset is required, no password hashes are migrated.
    users.push(...page.users.map(user => ({ uid:user.uid, email:user.email, emailVerified:user.emailVerified, disabled:user.disabled, displayName:user.displayName, photoURL:user.photoURL, phoneNumber:user.phoneNumber, providerData:user.providerData, customClaims:user.customClaims, metadata:user.metadata.toJSON() })));
    token = page.pageToken;
  } while (token);
  const files = { "firestore.json": JSON.stringify(records,null,2), "auth-identities.json": JSON.stringify(users,null,2) };
  const hashes: Record<string,string> = {};
  for (const [name,data] of Object.entries(files)) {
    await writeFile(path.join(directory,name),data);
    hashes[name] = createHash("sha256").update(data).digest("hex");
  }
  await writeFile(path.join(directory,"manifest.json"),JSON.stringify({ complete:true, project:key.project_id, finishedAt:new Date().toISOString(), counts, authUsers:users.length, sha256:hashes, note:"Logical Firestore/identity export, not a transactionally frozen snapshot. Storage bytes require separate export. Final delta required before cutover." },null,2));
  console.log(`Backup complete: ${records.length} document entries, ${users.length} identities. Private files: ${directory}`);
}
main().catch(error => { console.error("Backup incomplete; do not import it. Error code:", typeof error?.code === "string" || typeof error?.code === "number" ? error.code : "unknown"); process.exitCode=1; }).finally(()=>deleteApp(app));
