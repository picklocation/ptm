// Dev CLI: upload an image without going through the admin UI.
// Usage: npm run media:upload -- <file> [--content-id <id>]
// In Supabase mode, --content-id is required (save the content record once
// first, as the admin UI already requires).
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
import { readFile } from "node:fs/promises";
import path from "node:path";
async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const contentIdIndex = args.indexOf("--content-id");
  const contentId =
    contentIdIndex >= 0 ? args[contentIdIndex + 1] : undefined;
  if (!file) throw new Error("Usage: npm run media:upload -- <file> [--content-id <id>]");
  const { processAndStoreImage } = await import("../src/lib/media");
  const bytes = await readFile(file);
  const { url, id } = await processAndStoreImage(
    bytes,
    path.basename(file),
    contentId,
  );
  console.log(`Uploaded. id=${id}`);
  console.log(url);
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
