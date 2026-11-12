import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

type Entry = { path: string; exists: boolean; data: Record<string,unknown> | null };
export async function validateBackup(directory: string) {
  const manifest = JSON.parse(await readFile(path.join(directory,"manifest.json"),"utf8"));
  if (manifest.complete !== true || manifest.project !== "pickthemap-fe68b") throw new Error("Backup is incomplete or belongs to another project.");
  const loaded: Record<string,unknown> = {};
  for (const name of ["firestore.json","auth-identities.json"]) {
    const bytes = await readFile(path.join(directory,name));
    if (createHash("sha256").update(bytes).digest("hex") !== manifest.sha256?.[name]) throw new Error(`Backup checksum failed: ${name}`);
    loaded[name] = JSON.parse(bytes.toString("utf8"));
  }
  if (!Array.isArray(loaded["firestore.json"]) || !Array.isArray(loaded["auth-identities.json"])) throw new Error("Backup files must contain arrays.");
  const records = loaded["firestore.json"] as Entry[];
  const known = new Set(["content","publishedContent","revisions","enquiries","excelJobs","notificationJobs","settings","runtimeConfig","auditEvents","rateLimits","staff","sessions","media"]);
  const seen = new Set<string>();
  const counts: Record<string,number> = {};
  for (const entry of records) {
    if (typeof entry.path !== "string" || seen.has(entry.path)) throw new Error("Duplicate or invalid document path.");
    seen.add(entry.path);
    const parts = entry.path.split("/");
    if (parts.length !== 2 || !known.has(parts[0])) throw new Error(`Unmapped source collection: ${parts[0]}. Extend the migration mapping before importing.`);
    counts[parts[0]] ??= 0;
    if (!entry.exists) continue;
    counts[parts[0]]++;
    if (!entry.data || typeof entry.data !== "object" || Array.isArray(entry.data)) throw new Error("Invalid document payload.");
    if (["content","publishedContent","enquiries","staff","media"].includes(parts[0]) && entry.data.id !== parts[1]) throw new Error(`Document ID does not match payload in ${parts[0]}.`);
    if (JSON.stringify(entry.data).includes('"__firestoreType"')) throw new Error(`Typed Firestore values require explicit conversion in ${parts[0]}. Original backup is preserved.`);
  }
  for (const [collection,count] of Object.entries(manifest.counts as Record<string,number>)) {
    if ((counts[collection] || 0) !== count) throw new Error(`Count mismatch: ${collection}`);
  }
  const contents = new Set(records.filter(x=>x.exists && x.path.startsWith("content/")).map(x=>x.path.split("/")[1]));
  const enquiries = new Set(records.filter(x=>x.exists && x.path.startsWith("enquiries/")).map(x=>x.path.split("/")[1]));
  for (const entry of records.filter(x=>x.exists)) {
    const [collection,id] = entry.path.split("/");
    const d = entry.data!;
    if (collection === "publishedContent" && (!contents.has(id) || d.status !== "published")) throw new Error("Published snapshot has an invalid parent or status.");
    if (collection === "revisions" && !contents.has(String(d.id))) throw new Error("Revision has a missing parent.");
    if (collection === "enquiries" && d.itemId && !contents.has(String(d.itemId))) throw new Error("Enquiry references missing content; reconcile before import.");
    if (["excelJobs","notificationJobs"].includes(collection) && !enquiries.has(id)) throw new Error("Delivery job references a missing enquiry.");
  }
  if ((loaded["auth-identities.json"] as unknown[]).length !== manifest.authUsers) throw new Error("Auth identity count mismatch.");
  return { records, identities: loaded["auth-identities.json"], counts };
}
if (process.argv[1]?.replace(/\\/g,"/").endsWith("/validate-backup.ts")) {
  const directory = process.argv[2];
  if (!directory) throw new Error("Supply the completed backup directory.");
  validateBackup(path.resolve(directory)).then(({counts})=>console.log("Backup checks passed:",JSON.stringify(counts))).catch(error=>{console.error(error.message);process.exitCode=1;});
}
