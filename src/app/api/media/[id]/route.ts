import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStorage } from "firebase-admin/storage";
import { publicContent, firebaseMode, firebaseApp } from "@/lib/store";
import { currentStaff } from "@/lib/auth";
import { supabaseMode, serviceSupabase } from "@/lib/supabase";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const url = `/api/media/${id}`;
  const published = (await publicContent()).some(
    (c) => c.image === url || c.gallery.includes(url),
  );
  const staff = published ? null : await currentStaff();
  if (!published && (!staff || !["owner", "editor"].includes(staff.role)))
    return new Response(null, { status: 404 });
  try {
    let storageBytes: Uint8Array | undefined;
    if (supabaseMode()) {
      const { data, error } = await serviceSupabase()
        .storage.from("website-private")
        .download(`media/${id}.webp`);
      if (error || !data) return new Response(null, { status: 404 });
      storageBytes = new Uint8Array(await data.arrayBuffer());
    }
    const bytes =
      storageBytes ||
      (firebaseMode()
        ? (
            await getStorage(firebaseApp())
              .bucket()
              .file(`media/${id}.webp`)
              .download()
          )[0]
        : await readFile(
            path.join(process.cwd(), ".local", "media", `${id}.webp`),
          ));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": published ? "public, max-age=60" : "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
