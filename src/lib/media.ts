import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getStorage } from "firebase-admin/storage";
import { put, firebaseMode, firebaseApp } from "./store";
import { publicAsset } from "./assets";
import { supabaseMode, serviceSupabase, databaseError } from "./supabase";
import { uploadResolutionError } from "./validation";
// Thrown for a problem with the file itself (bad format, too small). The
// admin route maps this to 400; storage/database errors propagate past it
// to errorResponse() for correct 503/500 handling.
export class ImageValidationError extends Error {}
// Shared by the admin upload route and scripts/upload-media.ts, so the CLI
// and the browser upload flow can never drift apart on validation or sizing.
export async function processAndStoreImage(
  bytes: Buffer,
  name: string,
  contentId?: string,
): Promise<{ url: string; id: string }> {
  let output: Buffer;
  let card: Buffer;
  try {
    const image = sharp(bytes, { limitInputPixels: 40000000 });
    const meta = await image.metadata();
    if (
      !["jpeg", "png", "webp"].includes(meta.format || "") ||
      !meta.width ||
      !meta.height
    )
      throw new ImageValidationError(
        "This file could not be validated as a safe image.",
      );
    const resolutionError = uploadResolutionError(meta.width, meta.height);
    if (resolutionError) throw new ImageValidationError(resolutionError);
    // Two fixed sizes, made once: large for detail pages, card for listings.
    const sized = (edge: number, quality: number) =>
      image
        .clone()
        .rotate()
        .resize({
          width: edge,
          height: edge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 5 })
        .toBuffer();
    [output, card] = await Promise.all([sized(1600, 80), sized(640, 76)]);
  } catch (e) {
    if (e instanceof ImageValidationError) throw e;
    throw new ImageValidationError(
      "This file could not be validated as a safe image.",
    );
  }
  const id = randomUUID();
  if (supabaseMode()) {
    if (!contentId || !/^[a-zA-Z0-9-]{1,80}$/.test(contentId))
      throw new ImageValidationError(
        "Save this record once before uploading images.",
      );
    const client = serviceSupabase();
    const bucket = client.storage.from("website-public");
    const base = `content/${contentId}/${id}`;
    const paths = [`${base}-1600.webp`, `${base}-640.webp`];
    const upload = (objectPath: string, body: Buffer) =>
      bucket.upload(objectPath, body, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    const results = await Promise.all([
      upload(paths[0], output),
      upload(paths[1], card),
    ]);
    if (results.some((r) => r.error)) {
      await bucket.remove(paths);
      throw new Error("Image upload failed");
    }
    const { error: recordError } = await client.from("media_assets").insert({
      id,
      bucket: "website-public",
      object_path: paths[0],
      mime_type: "image/webp",
      byte_size: output.length + card.length,
      approved_public: true,
      data: {
        id,
        contentId,
        name: name.slice(0, 160),
        alt: "",
        variants: paths,
        createdAt: new Date().toISOString(),
      },
    });
    if (recordError) {
      await bucket.remove(paths);
      databaseError(recordError);
    }
    return { url: publicAsset(paths[0]), id };
  } else if (firebaseMode()) {
    await getStorage(firebaseApp())
      .bucket()
      .file(`media/${id}.webp`)
      .save(output, { contentType: "image/webp" });
  } else {
    const dir = path.join(process.cwd(), ".local", "media");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.webp`), output);
  }
  await put("media", id, {
    id,
    name: name.slice(0, 160),
    alt: "",
    createdAt: new Date().toISOString(),
  });
  return { url: `/api/media/${id}`, id };
}
