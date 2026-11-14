import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { batch, list } from "@/lib/store";
import type { Content } from "@/lib/types";
import { withPlacePhoto } from "@/lib/place-photos";
// Owner action: give every record that still uses the shared stock photos the
// checked photograph for its own location. Uploaded photos are never touched.
// Safe to run again; unchanged records are skipped.
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const owner = await requireStaff("owner");
    const writes: { collection: string; id: string; data: unknown }[] = [];
    const changed = new Set<string>();
    for (const collection of ["content", "publishedContent"]) {
      // Published snapshots hidden by the sample switch are covered through
      // their draft: a snapshot is only rewritten when it is readable here.
      for (const record of await list<Content>(collection)) {
        const next = withPlacePhoto(record);
        if (next === record) continue;
        writes.push({ collection, id: record.id, data: next });
        changed.add(record.id);
      }
    }
    for (let i = 0; i < writes.length; i += 90)
      await batch(writes.slice(i, i + 90));
    if (writes.length) {
      await batch([
        {
          collection: "auditEvents",
          id: randomUUID(),
          data: {
            at: new Date().toISOString(),
            actor: owner.email,
            action: "match photos",
            item: `${changed.size} records`,
          },
        },
      ]);
      revalidateTag("ptm-public", { expire: 0 });
    }
    return Response.json({ updated: changed.size });
  } catch (e) {
    return errorResponse(e);
  }
}
