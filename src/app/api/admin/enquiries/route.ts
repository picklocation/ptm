import { randomUUID } from "node:crypto";
import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { get, batch } from "@/lib/store";
import { statuses, type Enquiry } from "@/lib/types";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const staff = await requireStaff("enquiries");
    const raw = await req.text();
    if (raw.length > 8000)
      return Response.json({ error: "Note is too long." }, { status: 413 });
    const d = JSON.parse(raw);
    if (
      typeof d.id !== "string" ||
      !statuses.includes(d.status) ||
      typeof d.note !== "string" ||
      d.note.length > 3000 ||
      typeof d.assignedTo !== "string" ||
      d.assignedTo.length > 150 ||
      typeof d.followUp !== "string" ||
      (d.followUp && !/^\d{4}-\d{2}-\d{2}$/.test(d.followUp))
    )
      return Response.json(
        { error: "Check status, follow-up date and note." },
        { status: 400 },
      );
    const e = await get<Enquiry>("enquiries", d.id);
    if (!e)
      return Response.json({ error: "Enquiry not found." }, { status: 404 });
    const now = new Date().toISOString();
    const updated = {
      ...e,
      status: d.status,
      assignedTo: d.assignedTo,
      followUp: d.followUp,
      updatedAt: now,
      excelStatus: "pending",
      notes: d.note.trim()
        ? [...e.notes, { text: d.note.trim(), author: staff.email, at: now }]
        : e.notes,
      history:
        e.status !== d.status
          ? [...e.history, { status: d.status, at: now, author: staff.email }]
          : e.history,
    };
    await batch([
      { collection: "enquiries", id: e.id, data: updated },
      {
        collection: "excelJobs",
        id: e.id,
        data: { id: e.id, status: "pending", attempts: 0, updatedAt: now },
      },
      {
        collection: "auditEvents",
        id: randomUUID(),
        data: {
          at: now,
          actor: staff.email,
          action: "updated enquiry",
          item: e.id,
        },
      },
    ]);
    return Response.json({ enquiry: updated });
  } catch (e) {
    return errorResponse(e);
  }
}
