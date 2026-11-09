import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
async function main() {
  const { put, get, demoEnabled, firebaseMode, firebaseApp } =
    await import("../src/lib/store");
  const { hashPassword, digest } = await import("../src/lib/auth");
  const { seedContent } = await import("../src/lib/seed-data");
  const { defaultSettings } = await import("../src/lib/types");
  if (process.env.VERCEL_ENV === "production")
    throw new Error("Demo seeding is disabled in production.");
  if (await demoEnabled()) {
    for (const content of seedContent) {
      if (!(await get("content", content.id))) {
        await put("content", content.id, content);
        await put("publishedContent", content.id, content);
      }
    }
    console.log(
      "Development catalogue ready. Demonstration content is labelled.",
    );
  }
  if (!(await get("settings", "site")))
    await put("settings", "site", defaultSettings);
  const email = process.env.LOCAL_ADMIN_EMAIL;
  const password = process.env.LOCAL_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error(
      "Set LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD (at least 12 characters).",
    );
  let id = digest(email.toLowerCase());
  if (firebaseMode()) {
    const { getAuth } = await import("firebase-admin/auth");
    const auth = getAuth(firebaseApp());
    try {
      id = (await auth.getUserByEmail(email)).uid;
    } catch {
      id = (await auth.createUser({ email, password })).uid;
    }
  }
  if (!(await get("staff", id)))
    await put("staff", id, {
      id,
      email,
      role: "owner",
      active: true,
      ...(!firebaseMode() ? { passwordHash: hashPassword(password) } : {}),
    });
  console.log(
    "Owner account provisioned. Use credentials in your private .env.local.",
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
