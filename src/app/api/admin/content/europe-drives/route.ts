import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { batch, get, listContent } from "@/lib/store";
import type { Content } from "@/lib/types";
import { europeDrives } from "@/lib/europe-drives";
// Owner action: add the two Europe self-drive packages and archive the sample
// road trips, so that only those two are offered. A package that already
// exists is left exactly as the owner last saved it.
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const owner = await requireStaff("owner");
    const now = new Date().toISOString();
    const writes: { collection: string; id: string; data: unknown }[] = [];
    const added: string[] = [];
    for (const pack of europeDrives) {
      if (await get<Content>("content", pack.id)) continue;
      const record = { ...pack, updatedAt: now };
      writes.push(
        { collection: "content", id: pack.id, data: record },
        { collection: "publishedContent", id: pack.id, data: record },
      );
      added.push(pack.title);
    }
    const keep = new Set(europeDrives.map((p) => p.id));
    const archived: string[] = [];
    for (const trip of await listContent<Content>("content", "road-trip")) {
      // Only sample records are archived; anything the owner created stays.
      if (keep.has(trip.id) || !trip.demo || trip.status === "archived")
        continue;
      writes.push(
        {
          collection: "content",
          id: trip.id,
          data: { ...trip, status: "archived", updatedAt: now },
        },
        { collection: "publishedContent", id: trip.id, data: null },
      );
      archived.push(trip.title);
    }
    if (writes.length) {
      writes.push({
        collection: "auditEvents",
        id: randomUUID(),
        data: {
          at: now,
          actor: owner.email,
          action: "install europe drives",
          item: `${added.length} added, ${archived.length} samples archived`,
        },
      });
      for (let i = 0; i < writes.length; i += 90)
        await batch(writes.slice(i, i + 90));
      revalidateTag("ptm-public", { expire: 0 });
    }
    return Response.json({ added, archived: archived.length });
  } catch (e) {
    return errorResponse(e);
  }
}
