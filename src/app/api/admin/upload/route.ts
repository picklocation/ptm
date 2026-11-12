import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getStorage } from "firebase-admin/storage";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { put, firebaseMode, firebaseApp } from "@/lib/store";
import { supabaseMode, serviceSupabase, databaseError } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    await requireStaff("content");
    if (Number(req.headers.get("content-length") || 0) > 9 * 1024 * 1024)
      return Response.json(
        { error: "Choose an image smaller than 8 MB." },
        { status: 413 },
      );
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 8 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return Response.json(
        { error: "Upload a JPEG, PNG or WebP image under 8 MB." },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    try {
      const image = sharp(bytes, { limitInputPixels: 40000000 });
      const meta = await image.metadata();
      if (
        !["jpeg", "png", "webp"].includes(meta.format || "") ||
        !meta.width ||
        !meta.height
      )
        throw new Error();
      output = await image
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      return Response.json(
        { error: "This file could not be validated as a safe image." },
        { status: 400 },
      );
    }
    const id = randomUUID();
    if (supabaseMode()) {
      const client = serviceSupabase();
      const objectPath = `media/${id}.webp`;
      const { error } = await client.storage
        .from("website-private")
        .upload(objectPath, output, {
          contentType: "image/webp",
          upsert: false,
        });
      if (error) throw new Error("Image upload failed");
      const { error: recordError } = await client
        .from("media_assets")
        .insert({
          id,
          bucket: "website-private",
          object_path: objectPath,
          mime_type: "image/webp",
          byte_size: output.length,
          approved_public: false,
          data: {
            id,
            name: file.name.slice(0, 160),
            alt: "",
            createdAt: new Date().toISOString(),
          },
        });
      if (recordError) {
        await client.storage.from("website-private").remove([objectPath]);
        databaseError(recordError);
      }
      return Response.json({ url: `/api/media/${id}`, id });
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
