import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getStorage } from "firebase-admin/storage";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { put, firebaseMode, firebaseApp } from "@/lib/store";
import { publicAsset } from "@/lib/assets";
import { fitSize, largeRule, cardRule, type SizeRule } from "@/lib/image-sizes";
import { supabaseMode, serviceSupabase, databaseError } from "@/lib/supabase";
// Safety ceilings only. A 100-megapixel camera photo is accepted; the limit
// stops decompression bombs, not ordinary photos.
const MAX_UPLOAD = 25 * 1024 * 1024;
const MAX_PIXELS = 150_000_000;
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    await requireStaff("content");
    // The browser shrinks photos before sending, so real requests are small.
    // This ceiling only stops abuse; there is no limit on pixel size or shape.
    if (
      Number(req.headers.get("content-length") || 0) >
      MAX_UPLOAD + 1024 * 1024
    )
      return Response.json(
        { error: "That file is too large to upload." },
        { status: 413 },
      );
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > MAX_UPLOAD ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return Response.json(
        { error: "Upload a JPEG, PNG or WebP image." },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    let card: Buffer;
    try {
      const image = sharp(bytes, { limitInputPixels: MAX_PIXELS });
      const meta = await image.metadata();
      if (
        !["jpeg", "png", "webp"].includes(meta.format || "") ||
        !meta.width ||
        !meta.height
      )
        throw new Error();
      // Two fixed sizes, made once: large for detail pages, card for listings.
      // Orientation is applied first, so measure the picture as it will look.
      const turned = (meta.orientation || 1) >= 5;
      const width = turned ? meta.height : meta.width;
      const height = turned ? meta.width : meta.height;
      const sized = (rule: SizeRule, quality: number) =>
        image
          .clone()
          .rotate()
          .resize({
            ...fitSize(width, height, rule),
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality, effort: 5 })
          .toBuffer();
      [output, card] = await Promise.all([
        sized(largeRule, 80),
        sized(cardRule, 76),
      ]);
    } catch {
      return Response.json(
        { error: "This file could not be validated as a safe image." },
        { status: 400 },
      );
    }
    const id = randomUUID();
    if (supabaseMode()) {
      const contentId = String(form.get("contentId") || "");
      if (!/^[a-zA-Z0-9-]{1,80}$/.test(contentId))
        return Response.json(
          { error: "Save this record once before uploading images." },
          { status: 400 },
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
          name: file.name.slice(0, 160),
          alt: "",
          variants: paths,
          createdAt: new Date().toISOString(),
        },
      });
      if (recordError) {
        await bucket.remove(paths);
        databaseError(recordError);
      }
      return Response.json({ url: publicAsset(paths[0]), id });
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
      name: file.name.slice(0, 160),
      alt: "",
      createdAt: new Date().toISOString(),
    });
    return Response.json({ url: `/api/media/${id}`, id });
  } catch (e) {
    return errorResponse(e);
  }
}
