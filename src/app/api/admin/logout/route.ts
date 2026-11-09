import { signOut, checkOrigin, errorResponse } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    await signOut();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
