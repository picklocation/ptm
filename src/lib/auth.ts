import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { get, put, remove, firebaseMode, firebaseApp } from "./store";
import type { Staff } from "./types";
import { isDatabaseUnavailable } from "./service-errors";
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
export async function currentStaff(): Promise<Staff | null> {
  const token = (await cookies()).get("ptm_session")?.value;
  if (!token) return null;
  const session = await get<{ staffId: string; expires: number }>(
    "sessions",
    digest(token),
  );
  if (!session || session.expires < Date.now()) return null;
  const staff = await get<Staff>("staff", session.staffId);
  return staff?.active ? staff : null;
}
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
  const token = jar.get("ptm_session")?.value;
  if (token) await remove("sessions", digest(token));
  jar.delete("ptm_session");
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.SITE_URL || "http://localhost:3000")
    .origin;
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
