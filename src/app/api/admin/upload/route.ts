import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { processAndStoreImage, ImageValidationError } from "@/lib/media";
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
    const contentId = String(form.get("contentId") || "");
    try {
      const { url, id } = await processAndStoreImage(
        bytes,
        file.name,
        contentId || undefined,
      );
      return Response.json({ url, id });
    } catch (e) {
      if (e instanceof ImageValidationError)
        return Response.json({ error: e.message }, { status: 400 });
      throw e;
    }
  } catch (e) {
    return errorResponse(e);
  }
}
