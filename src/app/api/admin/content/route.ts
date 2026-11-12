import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { contentSchema, publishErrors } from "@/lib/validation";
import { batch, list, get, listContent, demoEnabled } from "@/lib/store";
import type { Content } from "@/lib/types";
import { stayDestinations, stayDestinationKey } from "@/lib/stays";
import { managedObjectPaths } from "@/lib/assets";
import { supabaseMode, serviceSupabase } from "@/lib/supabase";
const imagesOf = (c: Content | null) =>
  c ? [c.image, ...c.gallery].filter(Boolean) : [];
// Frees Storage for uploaded photos that this save removed, but only when no
// draft or published record anywhere still uses them. Never blocks a save.
async function removeUnusedUploads(before: Content | null, after: Content) {
  if (!supabaseMode()) return;
  const kept = new Set(imagesOf(after));
  const dropped = imagesOf(before).filter(
    (url) => !kept.has(url) && managedObjectPaths(url).length,
  );
  if (!dropped.length) return;
  const client = serviceSupabase();
  // Read every live snapshot with server access: the public view can hide
  // sample records, and a hidden record may still use the photo.
  const live: Content[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("published_content")
      .select("data")
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error(error.message);
    live.push(...(data || []).map((row) => row.data as Content));
    if (!data || data.length < 500) break;
  }
  const inUse = new Set(
    [...(await list<Content>("content")), ...live].flatMap(imagesOf),
  );
  const unused = dropped.filter((url) => !inUse.has(url));
  if (!unused.length) return;
  await client.storage
    .from("website-public")
    .remove(unused.flatMap(managedObjectPaths));
  await client
    .from("media_assets")
    .delete()
    .eq("bucket", "website-public")
    .in(
      "object_path",
      unused.map((url) => managedObjectPaths(url)[0]),
    );
}
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const staff = await requireStaff("content");
    const raw = await req.text();
    if (raw.length > 200000)
      return Response.json({ error: "Content is too large." }, { status: 413 });
    const { content, action } = JSON.parse(raw);
    if (!["save", "publish", "unpublish", "archive"].includes(action))
      return Response.json({ error: "Unknown operation." }, { status: 400 });
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success)
      return Response.json(
        {
          error: parsed.error.issues
            .map((x) => `${x.path.join(".")}: ${x.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    const c = parsed.data;
    if (action === "publish") {
      const errors = publishErrors(c);
      if (
        c.kind === "resort" &&
        c.stayDestinationSlug &&
        !stayDestinations(
          await listContent<Content>("publishedContent", "destination"),
        ).some((d) => d.slug === stayDestinationKey(c.stayDestinationSlug!))
      )
        errors.push(
          "Publish the stay destination first, then assign this property to it.",
        );
      if (errors.length)
        return Response.json({ error: errors.join(" ") }, { status: 400 });
      if (
        c.demo &&
        process.env.VERCEL_ENV === "production" &&
        !(await demoEnabled())
      )
        return Response.json(
          { error: "Demonstration content cannot be published in production." },
          { status: 400 },
        );
    }
    const [sameSlug, existing] = await Promise.all([
      listContent<Content>("content", c.kind, c.slug),
      get<Content>("content", c.id),
    ]);
    if (sameSlug.some((x) => x.id !== c.id))
      return Response.json(
        { error: "That URL slug is already used. Choose another." },
        { status: 409 },
      );
    const now = new Date().toISOString();
    const updated = {
      ...c,
      updatedAt: now,
      status:
        action === "publish"
          ? "published"
          : action === "archive"
            ? "archived"
            : "draft",
    } as Content;
    const writes: { collection: string; id: string; data: unknown | null }[] = [
      { collection: "content", id: c.id, data: updated },
      {
        collection: "auditEvents",
        id: randomUUID(),
        data: { at: now, actor: staff.email, action, item: c.title },
      },
    ];
    if (existing)
      writes.push({
        collection: "revisions",
        id: randomUUID(),
        data: existing,
      });
    if (action === "publish")
      writes.push({ collection: "publishedContent", id: c.id, data: updated });
    if (action === "archive" || action === "unpublish")
      writes.push({ collection: "publishedContent", id: c.id, data: null });
    await batch(writes);
    if (action !== "save") revalidateTag("ptm-public", { expire: 0 });
    await removeUnusedUploads(existing, updated).catch((error) =>
      console.error(
        "Image clean-up skipped:",
        String(error?.message).slice(0, 140),
      ),
    );
    return Response.json({
      content: updated,
      message:
        action === "save"
          ? "Draft saved. The live version is unchanged."
          : action === "publish"
            ? "Published successfully."
            : action === "archive"
              ? "Archived."
              : "Unpublished.",
    });
  } catch (e) {
    return errorResponse(e);
  }
}
