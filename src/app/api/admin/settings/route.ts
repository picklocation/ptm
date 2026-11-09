import { z } from "zod";
import { revalidateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { batch } from "@/lib/store";
const schema = z.object({
  whatsapp: z.string().regex(/^\d{7,15}$|^$/),
  email: z.union([z.email(), z.literal("")]),
  phone: z.string().max(40),
  address: z.string().max(500),
  instagram: z.union([
    z.url().refine((s) => s.startsWith("https://")),
    z.literal(""),
  ]),
  facebook: z.union([
    z.url().refine((s) => s.startsWith("https://")),
    z.literal(""),
  ]),
  about: z.string().max(20000),
  privacy: z.string().max(30000),
  terms: z.string().max(30000),
  cancellation: z.string().max(30000),
  faqs: z
    .array(
      z.object({
        question: z.string().min(3).max(300),
        answer: z.string().min(3).max(3000),
      }),
    )
    .max(40),
});
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const staff = await requireStaff("owner");
    const raw = await req.text();
    if (raw.length > 150000)
      return Response.json({ error: "Settings too large." }, { status: 413 });
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return Response.json(
        {
          error: parsed.error.issues
            .map((x) => `${x.path.join(".")}: ${x.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    await batch([
      { collection: "settings", id: "site", data: parsed.data },
      {
        collection: "auditEvents",
        id: randomUUID(),
        data: {
          at: new Date().toISOString(),
          actor: staff.email,
          action: "updated settings",
          item: "Site settings",
        },
      },
    ]);
    revalidateTag("ptm-public", { expire: 0 });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
