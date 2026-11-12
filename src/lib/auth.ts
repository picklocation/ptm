import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { get, put, remove, firebaseMode, firebaseApp } from "./store";
import type { Staff } from "./types";
import { isDatabaseUnavailable } from "./service-errors";
import { supabaseMode, publicSupabase, requestSupabase } from "./supabase";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "hex"),
    actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
// Cached per request so a page and its helpers share one lookup.
export const currentStaff = cache(async (): Promise<Staff | null> => {
  if (supabaseMode()) {
    const token = (await cookies()).get("ptm_supabase_access")?.value;
    if (!token) return null;
    // The token's subject only picks which staff row to request. Supabase Auth
    // still verifies the token, and the database verifies it again for the
    // staff query, so both checks run together instead of one after another.
    let subject = "";
    try {
      subject = String(
        JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
          .sub || "",
      );
    } catch {
      return null;
    }
    if (!/^[0-9a-f-]{36}$/.test(subject)) return null;
    const client = await requestSupabase();
    const [
      {
        data: { user },
        error,
      },
      { data: staff },
    ] = await Promise.all([
      client.auth.getUser(token),
      client
        .from("staff")
        .select("id,email,role,active")
        .eq("id", subject)
        .eq("active", true)
        .maybeSingle(),
    ]);
    if (error || !user || user.id !== subject) return null;
    return staff as Staff | null;
  }
  const token = (await cookies()).get("ptm_session")?.value;
  if (!token) return null;
  const session = await get<{ staffId: string; expires: number }>(
    "sessions",
    digest(token),
  );
  if (!session || session.expires < Date.now()) return null;
  const staff = await get<Staff>("staff", session.staffId);
  return staff?.active ? staff : null;
});
export async function requireStaff(
  permission: "content" | "enquiries" | "owner" = "content",
) {
  const staff = await currentStaff();
  if (!staff) throw new Error("UNAUTHENTICATED");
  if (
    staff.role !== "owner" &&
    !(permission === "content" && staff.role === "editor") &&
    !(permission === "enquiries" && staff.role === "enquiries")
  )
    throw new Error("FORBIDDEN");
  return staff;
}
export async function signIn(
  email: string,
  password: string,
  idToken?: string,
) {
  let staff: Staff | null = null;
  if (supabaseMode()) {
    const client = publicSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) return null;
    const { data: record } = await client
      .from("staff")
      .select("id,email,role,active")
      .eq("id", data.user.id)
      .eq("active", true)
      .maybeSingle();
    if (!record) {
      await client.auth.signOut();
      return null;
    }
    // Short-lived Auth access token, no password or refresh token in browser storage.
    // Expired sessions require sign-in again; active staff is checked on each operation.
    (await cookies()).set("ptm_supabase_access", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.min(data.session.expires_in, 3600),
    });
    return record as Staff;
  }
  if (firebaseMode()) {
    if (!idToken) throw new Error("Use Firebase sign-in.");
    const decoded = await getAuth(firebaseApp()).verifyIdToken(idToken, true);
    staff = await get<Staff>("staff", decoded.uid);
  } else {
    staff = await get<Staff>("staff", digest(email.toLowerCase()));
    if (!staff?.passwordHash || !verifyPassword(password, staff.passwordHash))
      return null;
  }
  if (!staff?.active) return null;
  const token = randomBytes(32).toString("hex");
  await put("sessions", digest(token), {
    staffId: staff.id,
    expires: Date.now() + 8 * 60 * 60 * 1000,
  });
  (await cookies()).set("ptm_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return staff;
}
export async function signOut() {
  const jar = await cookies();
  if (supabaseMode()) {
    jar.delete("ptm_supabase_access");
    jar.delete("ptm_session");
    return;
  }
  const token = jar.get("ptm_session")?.value;
  if (token) await remove("sessions", digest(token));
  jar.delete("ptm_session");
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.SITE_URL || "http://localhost:3000",
  ).origin;
  if (!origin || origin !== expected) throw new Error("FORBIDDEN");
}
export function errorResponse(error: unknown) {
  if (isDatabaseUnavailable(error))
    return Response.json(
      {
        error:
          "Our database is temporarily unavailable. This action could not be confirmed. Please try later or contact us on WhatsApp.",
      },
      { status: 503, headers: { "Retry-After": "900" } },
    );
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message === "UNAUTHENTICATED")
    return Response.json({ error: "Please sign in." }, { status: 401 });
  if (message === "FORBIDDEN")
    return Response.json(
      { error: "This operation is not permitted." },
      { status: 403 },
    );
  console.error("Operation failed:", message.slice(0, 140));
  return Response.json(
    { error: "We could not complete this request. Please retry." },
    { status: 500 },
  );
}
