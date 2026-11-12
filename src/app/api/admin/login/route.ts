import { signIn, checkOrigin, digest, errorResponse } from "@/lib/auth";
import { rateLimit } from "@/lib/store";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const raw = await req.text();
    if (raw.length > 12000)
      return Response.json({ error: "Request too large." }, { status: 413 });
    const d = JSON.parse(raw);
    if (typeof d.email !== "string" || typeof d.password !== "string")
      return Response.json(
        { error: "Enter your credentials." },
        { status: 400 },
      );
    const ip = process.env.VERCEL
      ? req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
      : "local";
    if (
      !(await rateLimit(digest("login-ip:" + ip), 30)) ||
      !(await rateLimit(digest("login:" + ip + ":" + d.email.toLowerCase()), 8))
    )
      return Response.json(
        { error: "Too many attempts. Try again in ten minutes." },
        { status: 429 },
      );
    const staff = await signIn(d.email, d.password, d.idToken);
    if (!staff)
      return Response.json(
        { error: "Sign-in failed. Check your credentials and staff access." },
        { status: 401 },
      );
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
