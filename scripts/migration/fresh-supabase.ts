import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { migrationConfig } from "./config";
import { seedContent, photos } from "../../src/lib/seed-data";
import { defaultSettings } from "../../src/lib/types";
import { contentSchema } from "../../src/lib/validation";
const c = migrationConfig();
const client = createClient(
  c.required("SUPABASE_URL"),
  c.required("SUPABASE_SECRET_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
async function upload(objectPath: string, bytes: Buffer, mime: string) {
  const hash = createHash("sha256").update(bytes).digest("hex");
  const { error } = await client.storage
    .from("website-public")
    .upload(objectPath, bytes, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error && !/already exists|duplicate/i.test(error.message))
    throw new Error(`Storage upload failed (${error.message})`);
  const { error: meta } = await client
    .from("media_assets")
    .upsert(
      {
        id: `seed-${createHash("sha256").update(objectPath).digest("hex").slice(0, 24)}`,
        bucket: "website-public",
        object_path: objectPath,
        mime_type: mime,
        byte_size: bytes.length,
        approved_public: true,
        sha256: hash,
        data: { seed: true },
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (meta) throw new Error(`Asset metadata failed (${meta.code})`);
}
async function main() {
  if (
    new URL(c.required("SUPABASE_URL")).hostname !==
    "feqmnzutyhzochuyiint.supabase.co"
  )
    throw new Error("Unexpected target project");
  const sourceUrls = new Set([
    ...Object.values(photos),
    ...seedContent.flatMap((x) => [x.image, ...x.gallery]),
  ]);
  const ids = new Set(
    [...sourceUrls]
      .map((url) => url.match(/(photo-[\w-]+)\.jpg/)?.[1])
      .filter(Boolean) as string[],
  );
  for (const id of ids) {
    const objectPath = `catalogue/${id}.jpg`;
    const { data: exists } = await client
      .from("media_assets")
      .select("id")
      .eq("object_path", objectPath)
      .maybeSingle();
    if (exists) continue;
    const response = await fetch(
      `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=85&fm=jpg`,
      { signal: AbortSignal.timeout(30000) },
    );
    if (!response.ok) throw new Error(`Source photo unavailable: ${id}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (
      bytes.length > 8 * 1024 * 1024 ||
      !response.headers.get("content-type")?.startsWith("image/")
    )
      throw new Error("Invalid source image");
    await upload(objectPath, bytes, "image/jpeg");
    console.log(`Uploaded catalogue photo (${bytes.length} bytes)`);
  }
  for (const [name, mime] of [
    ["pickthemap-icon.png", "image/png"],
    ["placeholder.svg", "image/svg+xml"],
  ])
    await upload(
      `brand/${name}`,
      await readFile(`public/images/${name}`),
      mime,
    );
  for (const record of seedContent) contentSchema.parse(record);
  for (let offset = 0; offset < seedContent.length; offset += 50) {
    const rows = seedContent
      .slice(offset, offset + 50)
      .map((data) => ({ id: data.id, data }));
    for (const table of ["content", "published_content"]) {
      const { error } = await client
        .from(table)
        .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
      if (error) throw new Error(`Seed failed: ${table} (${error.code})`);
    }
  }
  const { error: settingsError } = await client
    .from("site_settings")
    .upsert(
      { id: "site", data: defaultSettings },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (settingsError)
    throw new Error(`Settings seed failed (${settingsError.code})`);
  const { error: configError } = await client
    .from("runtime_config")
    .upsert(
      {
        id: "demoShowcase",
        data: { enabled: true, updatedAt: new Date().toISOString() },
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (configError)
    throw new Error(`Preview configuration failed (${configError.code})`);
  console.log(
    `Fresh catalogue ready: ${seedContent.length} records. Existing target records preserved. Firebase untouched.`,
  );
  const password = c.optional("SUPABASE_OWNER_PASSWORD");
  if (!password) {
    console.log(
      "Owner creation pending: set SUPABASE_OWNER_PASSWORD privately.",
    );
    return;
  }
  if (password.length < 12)
    throw new Error("Owner password must contain at least 12 characters.");
  const email = "pickthemap@gmail.com";
  const { data: existing, error: lookup } = await client
    .from("staff")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (lookup) throw new Error("Owner lookup failed");
  if (existing) {
    console.log("Owner already provisioned; password unchanged.");
    return;
  }
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user)
    throw new Error(
      "Owner identity could not be created; inspect Auth users for an existing identity.",
    );
  const { error: staffError } = await client
    .from("staff")
    .insert({ id: data.user.id, email, role: "owner", active: true });
  if (staffError)
    throw new Error("Identity created but staff provisioning failed");
  console.log(
    "Owner provisioned: pickthemap@gmail.com. Password was not logged.",
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Fresh setup failed");
  process.exitCode = 1;
});
