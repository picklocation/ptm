import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStorage } from "firebase-admin/storage";
import { publicContent, firebaseMode, firebaseApp } from "@/lib/store";
import { currentStaff } from "@/lib/auth";
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
  if (!published && !(await currentStaff()))
    return new Response(null, { status: 404 });
  try {
    const bytes = firebaseMode()
      ? (
          await getStorage(firebaseApp())
            .bucket()
            .file(`media/${id}.webp`)
            .download()
        )[0]
      : await readFile(
          path.join(process.cwd(), ".local", "media", `${id}.webp`),
        );
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
