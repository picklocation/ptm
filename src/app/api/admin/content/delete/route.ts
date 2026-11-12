import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { batch, get, list, put } from "@/lib/store";
import type { Content, Enquiry } from "@/lib/types";
import { managedObjectPaths } from "@/lib/assets";
import {
  supabaseMode,
  serviceSupabase,
  requestSupabase,
  databaseError,
} from "@/lib/supabase";
const schema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
  confirm: z.string().max(200),
});
const imagesOf = (c: Content | null) =>
  c ? [c.image, ...c.gallery].filter(Boolean) : [];
// Permanent deletion. Owner only, and only for a record that is already
// archived, so nothing live can disappear by accident. Linked enquiries are
// kept with the record's title but no longer point at it.
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const owner = await requireStaff("owner");
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return Response.json({ error: "Invalid request." }, { status: 400 });
    const { id, confirm } = parsed.data;
    const content = await get<Content>("content", id);
    if (!content)
      return Response.json({ error: "Record not found." }, { status: 404 });
    if (content.status !== "archived")
      return Response.json(
        { error: "Archive this record first, then delete it." },
        { status: 409 },
      );
    if (confirm.trim() !== content.title.trim())
      return Response.json(
        { error: "Type the exact title to confirm deletion." },
        { status: 400 },
      );
    const now = new Date().toISOString();
    const audit = {
      collection: "auditEvents",
      id: randomUUID(),
      data: {
        at: now,
        actor: owner.email,
        action: "delete",
        item: content.title,
      },
    };
    if (!supabaseMode()) {
      for (const e of await list<Enquiry>("enquiries"))
        if (e.itemId === id) await put("enquiries", e.id, { ...e, itemId: "" });
      await batch([
        { collection: "publishedContent", id, data: null },
        { collection: "content", id, data: null },
        audit,
      ]);
      revalidateTag("ptm-public", { expire: 0 });
      return Response.json({ ok: true });
    }
    // Staff-token client: database rules still apply to every step below.
    const db = await requestSupabase();
    const photos = new Set(imagesOf(content));
    const { data: revisions, error: revisionError } = await db
      .from("content_revisions")
      .select("data")
      .eq("content_id", id);
    databaseError(revisionError);
    for (const r of revisions || [])
      imagesOf(r.data as Content).forEach((url) => photos.add(url));
    const { data: linked, error: linkedError } = await db
      .from("enquiries")
      .select("id,data")
      .eq("content_id", id);
    databaseError(linkedError);
    for (const row of linked || []) {
      const { error } = await db
        .from("enquiries")
        .update({ data: { ...row.data, itemId: "", updatedAt: now } })
        .eq("id", row.id);
      databaseError(error);
    }
    for (const table of ["content_media", "content_revisions"]) {
      const { error } = await db.from(table).delete().eq("content_id", id);
      databaseError(error);
    }
    for (const table of ["published_content", "content"]) {
      const { error } = await db.from(table).delete().eq("id", id);
      databaseError(error);
    }
    await batch([audit]);
    revalidateTag("ptm-public", { expire: 0 });
    // The record is gone. Freeing its photos is best effort and skips any
    // photo another record still uses.
    let photosRemoved = true;
    try {
      const service = serviceSupabase();
      const others: Content[] = await list<Content>("content");
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await service
          .from("published_content")
          .select("data")
          .order("id")
          .range(offset, offset + 499);
        if (error) throw new Error(error.message);
        others.push(...(data || []).map((row) => row.data as Content));
        if (!data || data.length < 500) break;
      }
      const inUse = new Set(others.flatMap(imagesOf));
      const unused = [...photos].filter((url) => !inUse.has(url));
      const publicPaths = unused.flatMap(managedObjectPaths);
      if (publicPaths.length) {
        await service.storage.from("website-public").remove(publicPaths);
        await service
          .from("media_assets")
          .delete()
          .eq("bucket", "website-public")
          .in(
            "object_path",
            unused.flatMap((url) => managedObjectPaths(url).slice(0, 1)),
          );
      }
      const legacy = unused.flatMap(
        (url) => url.match(/^\/api\/media\/([a-f0-9-]{36})$/)?.[1] ?? [],
      );
      if (legacy.length) {
        await service.storage
          .from("website-private")
          .remove(legacy.map((mediaId) => `media/${mediaId}.webp`));
        await service.from("media_assets").delete().in("id", legacy);
      }
    } catch (error) {
      photosRemoved = false;
      console.error(
        "Photo clean-up skipped:",
        String((error as Error)?.message).slice(0, 140),
      );
    }
    return Response.json({ ok: true, photosRemoved });
  } catch (e) {
    return errorResponse(e);
  }
}
