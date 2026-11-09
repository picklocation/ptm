import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { seedContent } from "../src/lib/seed-data";
import { contentSchema, publishErrors } from "../src/lib/validation";
import { defaultSettings } from "../src/lib/types";

// Deliberately does NOT load .env.local: local emulator settings must never redirect a cloud operation.
const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
async function main() {
  const command = args[0];
  if (!["seed", "owner", "showcase-off", "inspect"].includes(command))
    throw new Error(
      "Choose seed, owner, showcase-off, or inspect; supply --key <JSON path> --project <project ID>.",
    );
  if (
    ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"].some(
      (key) => process.env[key],
    )
  )
    throw new Error(
      "Remove emulator environment variables before cloud administration.",
    );
  const keyPath = option("--key"),
    projectId = option("--project");
  if (!keyPath || !projectId)
    throw new Error("Both --key and --project are required.");
  const credential = JSON.parse(readFileSync(keyPath, "utf8"));
  if (credential.project_id !== projectId)
    throw new Error(
      "Credential project does not match --project; no writes made.",
    );
  const app = initializeApp({ credential: cert(credential), projectId });
  const db = getFirestore(app);
  db.settings({ preferRest: true });
  console.log(`Target project: ${projectId}`);
  if (command === "seed") {
    // Validate all records before the first write. Create-only transactions preserve edited content on rerun.
    for (const record of seedContent) {
      const parsed = contentSchema.parse(record);
      if (!record.demo || publishErrors(parsed).length)
        throw new Error(`Invalid demo record: ${record.id}`);
    }
    let created = 0;
    for (const record of seedContent) {
      const added = await db.runTransaction(async (tx) => {
        const draft = db.collection("content").doc(record.id);
        const live = db.collection("publishedContent").doc(record.id);
        const [a, b] = await Promise.all([tx.get(draft), tx.get(live)]);
        if (a.exists || b.exists) return false;
        tx.create(draft, record);
        tx.create(live, record);
        return true;
      });
      if (added) created++;
      if (created > 0 && created % 25 === 0)
        console.log(`Created ${created} sample records so far.`);
    }
    await db.runTransaction(async (tx) => {
      const ref = db.collection("settings").doc("site");
      if (!(await tx.get(ref)).exists) tx.create(ref, defaultSettings);
    });
    if (args.includes("--showcase"))
      await db
        .collection("runtimeConfig")
        .doc("demoShowcase")
        .set({ enabled: true, updatedAt: new Date().toISOString() });
    console.log(
      `Created ${created}; preserved ${seedContent.length - created} existing records. Showcase ${args.includes("--showcase") ? "enabled" : "unchanged"}.`,
    );
  } else if (command === "owner") {
    const email = option("--email");
    if (!email)
      throw new Error(
        "Supply --email for an existing Firebase Authentication user; no password is accepted by this script.",
      );
    const user = await getAuth(app).getUserByEmail(email);
    if (user.disabled)
      throw new Error("Enable this identity in Firebase Authentication first.");
    const ref = db.collection("staff").doc(user.uid);
    await db.runTransaction(async (tx) => {
      const old = await tx.get(ref);
      if (old.exists) {
        if (old.data()?.role !== "owner" || !old.data()?.active)
          throw new Error(
            "Existing staff access differs; use the owner dashboard to change it.",
          );
        return;
      }
      tx.create(ref, {
        id: user.uid,
        email: user.email,
        role: "owner",
        active: true,
      });
    });
    console.log(
      "Owner access provisioned for the specified existing identity. Password unchanged.",
    );
  } else if (command === "showcase-off") {
    await db
      .collection("runtimeConfig")
      .doc("demoShowcase")
      .set({ enabled: false, updatedAt: new Date().toISOString() });
    console.log(
      "Showcase disabled. Demo records retained privately for editing; production hides them.",
    );
  }
  const [contents, published, staff, flag] = await Promise.all([
    db.collection("content").count().get(),
    db.collection("publishedContent").count().get(),
    db.collection("staff").count().get(),
    db.collection("runtimeConfig").doc("demoShowcase").get(),
  ]);
  console.log(
    JSON.stringify({
      content: contents.data().count,
      published: published.data().count,
      staff: staff.data().count,
      showcase: flag.data()?.enabled === true,
    }),
  );
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Cloud administration failed",
  );
  process.exitCode = 1;
});
