// Dev CLI: create or update a content record without the admin UI.
// Usage: npm run content:upsert -- <json-file> [--publish]
// The JSON file is a single Content record (see src/lib/types.ts). Mirrors
// the validation and write shape of src/app/api/admin/content/route.ts, but
// skips what only makes sense inside an HTTP request: staff-session
// attribution, cache revalidation (the public cache still refreshes on its
// normal 15-minute TTL) and unused-upload clean-up.
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const publish = args.includes("--publish");
  if (!file)
    throw new Error("Usage: npm run content:upsert -- <json-file> [--publish]");
  const { contentSchema, publishErrors } = await import("../src/lib/validation");
  const { batch, get, listContent } = await import("../src/lib/store");
  const { stayDestinations, stayDestinationKey } = await import("../src/lib/stays");
  const raw = JSON.parse(await readFile(file, "utf8"));
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      console.error(`${issue.path.join(".")}: ${issue.message}`);
    throw new Error("Record failed validation.");
  }
  const c = parsed.data;
  type ContentRecord = typeof c;
  if (publish) {
    const errors = publishErrors(c);
    if (
      c.kind === "resort" &&
      c.stayDestinationSlug &&
      !stayDestinations(
        await listContent<ContentRecord>("publishedContent", "destination"),
      ).some((d) => d.slug === stayDestinationKey(c.stayDestinationSlug!))
    )
      errors.push(
        "Publish the stay destination first, then assign this property to it.",
      );
    if (errors.length) throw new Error(errors.join(" "));
  }
  const [sameSlug, existing] = await Promise.all([
    listContent<ContentRecord>("content", c.kind, c.slug),
    get<ContentRecord>("content", c.id),
  ]);
  if (sameSlug.some((x) => x.id !== c.id))
    throw new Error("That URL slug is already used by a different record.");
  const now = new Date().toISOString();
  const updated = {
    ...c,
    updatedAt: now,
    status: publish ? "published" : c.status === "archived" ? "archived" : "draft",
  };
  const writes: { collection: string; id: string; data: unknown | null }[] = [
    { collection: "content", id: c.id, data: updated },
    {
      collection: "auditEvents",
      id: randomUUID(),
      data: {
        at: now,
        actor: process.env.CLI_ACTOR_EMAIL || "dev-cli",
        action: publish ? "publish" : "save",
        item: c.title,
      },
    },
  ];
  if (existing)
    writes.push({ collection: "revisions", id: randomUUID(), data: existing });
  if (publish)
    writes.push({ collection: "publishedContent", id: c.id, data: updated });
  await batch(writes);
  console.log(
    `${existing ? "Updated" : "Created"} ${c.kind}/${c.slug} (${c.id}), status=${updated.status}.`,
  );
  if (publish)
    console.log(
      "Public cache refreshes within its normal 15-minute window; it is not revalidated instantly by this script.",
    );
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
