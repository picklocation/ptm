import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { batch, list } from "@/lib/store";
import type { Content } from "@/lib/types";
import { seedContent } from "@/lib/seed-data";
import { withCleanCopy, hasSampleWording } from "@/lib/sample-copy";
// Owner action: replace leftover demonstration wording and text slips in the
// original packages with clean copy. Fields the owner rewrote are kept, and
// prices are never changed. Safe to run again.
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const owner = await requireStaff("owner");
    const fresh = new Map(seedContent.map((c) => [c.id, c]));
    const writes: { collection: string; id: string; data: unknown }[] = [];
    const changed = new Set<string>();
    let remaining = 0;
    for (const collection of ["content", "publishedContent"]) {
      for (const record of await list<Content>(collection)) {
        const source = fresh.get(record.id);
        const next = source ? withCleanCopy(record, source) : record;
        if (collection === "content" && hasSampleWording(next)) remaining++;
        if (next === record) continue;
        writes.push({
          collection,
          id: record.id,
          data: { ...next, updatedAt: new Date().toISOString() },
        });
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
            action: "tidy wording",
            item: `${changed.size} records`,
          },
        },
      ]);
      revalidateTag("ptm-public", { expire: 0 });
    }
    return Response.json({ updated: changed.size, remaining });
  } catch (e) {
    return errorResponse(e);
  }
}
