// Owner-run CLI: force-correct the cover photo on specific REAL (non-demo)
// packages, in one batch, using the already-curated public/images/places
// library (src/lib/place-photos.ts).
//
// This deliberately bypasses withPlacePhoto()'s two safety gates (it only
// touches demo records, and only swaps a cover that already looks like
// generic stock) — because this list is a reviewed, explicit correction,
// not a generic automatic sweep. Nothing outside image/imageAlt is touched:
// price, description, status and everything else is preserved exactly.
//
// Usage:
//   npm run photos:fix-real -- <manifest.json>            (dry run, no writes)
//   npm run photos:fix-real -- <manifest.json> --apply     (writes for real)
//
// Manifest: JSON array of { "slug": string, "kind": "holiday"|"road-trip"|"resort"|"destination" }
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
async function main() {
  const args = process.argv.slice(2);
  const manifestFile = args.find((a) => !a.startsWith("--"));
  const apply = args.includes("--apply");
  if (!manifestFile)
    throw new Error(
      "Usage: npm run photos:fix-real -- <manifest.json> [--apply]",
    );
  const { batch, listContent } = await import("../src/lib/store");
  const { placePhotoFor, placePhotoUrl } = await import("../src/lib/place-photos");
  const { contentSchema } = await import("../src/lib/validation");
  type Target = { slug: string; kind: "holiday" | "road-trip" | "resort" | "destination" };
  const targets: Target[] = JSON.parse(await readFile(manifestFile, "utf8"));
  console.log(apply ? "APPLYING changes.\n" : "DRY RUN — no writes. Pass --apply to write.\n");
  let ok = 0, skipped = 0, failed = 0;
  for (const t of targets) {
    try {
      const matches = await listContent("content", t.kind, t.slug);
      const record = matches[0] as Awaited<ReturnType<typeof listContent<any>>>[number] | undefined;
      if (!record) {
        console.log(`SKIP  ${t.kind}/${t.slug} — no record found.`);
        skipped++;
        continue;
      }
      const photo = placePhotoFor(record);
      if (!photo) {
        console.log(`SKIP  ${t.kind}/${t.slug} — no curated place-photo match for its location/title text. Fix manually.`);
        skipped++;
        continue;
      }
      const url = placePhotoUrl(photo);
      if (record.image === url) {
        console.log(`OK    ${t.kind}/${t.slug} — already correct (${url}).`);
        ok++;
        continue;
      }
      console.log(`${apply ? "FIX  " : "WOULD FIX"} ${t.kind}/${t.slug}`);
      console.log(`      was: ${record.image}  (alt: "${record.imageAlt}")`);
      console.log(`      now: ${url}  (alt: "${photo.alt}")`);
      if (!apply) {
        ok++;
        continue;
      }
      const now = new Date().toISOString();
      const updated = contentSchema.parse({
        ...record,
        image: url,
        imageAlt: photo.alt,
        updatedAt: now,
      });
      const writes: { collection: string; id: string; data: unknown }[] = [
        { collection: "content", id: record.id, data: updated },
        { collection: "revisions", id: randomUUID(), data: record },
        {
          collection: "auditEvents",
          id: randomUUID(),
          data: {
            at: now,
            actor: process.env.CLI_ACTOR_EMAIL || "dev-cli",
            action: "photo-fix",
            item: record.title,
          },
        },
      ];
      if (record.status === "published")
        writes.push({ collection: "publishedContent", id: record.id, data: updated });
      await batch(writes);
      ok++;
    } catch (e) {
      console.error(`FAIL  ${t.kind}/${t.slug} — ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }
  console.log(`\n${ok} ok, ${skipped} skipped, ${failed} failed.`);
  if (apply)
    console.log("Public cache refreshes within its normal 15-minute window.");
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
