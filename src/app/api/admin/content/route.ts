import { randomUUID } from "node:crypto";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { contentSchema, publishErrors } from "@/lib/validation";
import { batch, list, get } from "@/lib/store";
import type { Content } from "@/lib/types";
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
      if (errors.length)
        return Response.json({ error: errors.join(" ") }, { status: 400 });
      if (c.demo && process.env.VERCEL_ENV === "production")
        return Response.json(
          { error: "Demonstration content cannot be published in production." },
          { status: 400 },
        );
    }
    const duplicate = (await list<Content>("content")).find(
      (x) => x.id !== c.id && x.slug === c.slug && x.kind === c.kind,
    );
    if (duplicate)
      return Response.json(
        { error: "That URL slug is already used. Choose another." },
        { status: 409 },
      );
    const now = new Date().toISOString();
    const existing = await get<Content>("content", c.id);
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
