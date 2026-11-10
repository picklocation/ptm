import { z } from "zod";
import { getAuth } from "firebase-admin/auth";
import { randomUUID } from "node:crypto";
import {
  requireStaff,
  checkOrigin,
  errorResponse,
  digest,
  hashPassword,
} from "@/lib/auth";
import { list, get, put, firebaseMode, firebaseApp } from "@/lib/store";
import type { Staff } from "@/lib/types";
import { supabaseMode, serviceSupabase, databaseError } from "@/lib/supabase";
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    email: z.email(),
    password: z.string().min(12).max(200),
    role: z.enum(["owner", "editor", "enquiries"]),
  }),
  z.object({
    action: z.literal("toggle"),
    id: z.string().min(1).max(150),
    active: z.boolean(),
  }),
]);
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const owner = await requireStaff("owner");
    const raw = await req.text();
    if (raw.length > 4000)
      return Response.json({ error: "Request too large." }, { status: 413 });
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return Response.json(
        { error: "Check the email, password length and role." },
        { status: 400 },
      );
    const d = parsed.data;
    let target = "";
    if (d.action === "create") {
      const email = d.email.toLowerCase();
      if (
        (await list<Staff>("staff")).some(
          (s) => s.email.toLowerCase() === email,
        )
      )
        return Response.json(
          { error: "That staff account already exists." },
          { status: 409 },
        );
      let id = digest(email);
      if (supabaseMode()) {
        const { data, error } = await serviceSupabase().auth.admin.createUser({
          email,
          password: d.password,
          email_confirm: true,
        });
        if (error || !data.user)
          throw new Error("Could not create staff identity");
        id = data.user.id;
      }
      if (firebaseMode())
        id = (
          await getAuth(firebaseApp()).createUser({
            email,
            password: d.password,
          })
        ).uid;
      const record = {
        id,
        email,
        role: d.role,
        active: true,
        ...(!firebaseMode() && !supabaseMode()
          ? { passwordHash: hashPassword(d.password) }
          : {}),
      };
      if (supabaseMode()) {
        const { error } = await serviceSupabase().from("staff").insert(record);
        databaseError(error);
      } else await put("staff", id, record);
      target = email;
    } else {
      if (d.id === owner.id)
        return Response.json(
          { error: "You cannot revoke your own account." },
          { status: 400 },
        );
      const s = await get<Staff>("staff", d.id);
      if (!s)
        return Response.json(
          { error: "Staff member not found." },
          { status: 404 },
        );
      if (supabaseMode()) {
        const { error } = await serviceSupabase()
          .from("staff")
          .update({ active: d.active })
          .eq("id", d.id);
        databaseError(error);
      } else await put("staff", d.id, { ...s, active: d.active });
      if (firebaseMode() && !d.active)
        await getAuth(firebaseApp()).revokeRefreshTokens(d.id);
      target = s.email;
    }
    await put("auditEvents", randomUUID(), {
      at: new Date().toISOString(),
      actor: owner.email,
      action: `staff ${d.action}`,
      item: target,
    });
    return Response.json({
      staff: (await list<Staff>("staff")).map(({ passwordHash, ...s }) => {
        void passwordHash;
        return s;
      }),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
