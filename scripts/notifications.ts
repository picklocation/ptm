import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const { list, get, put } = await import("../src/lib/store");
const url = process.env.NOTIFICATION_WEBHOOK_URL;
if (!url) {
  console.log(
    "Notifications are disabled. Enquiries remain available in admin.",
  );
  process.exit(0);
}
if (!url.startsWith("https://"))
  throw new Error("Use an HTTPS notification endpoint.");
for (const job of (
  await list<{ id: string; status: string; attempts: number }>(
    "notificationJobs",
  )
).filter((j) => j.status !== "sent")) {
  try {
    const enquiry = await get("enquiries", job.id);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NOTIFICATION_WEBHOOK_TOKEN || ""}`,
        "Idempotency-Key": job.id,
      },
      body: JSON.stringify({ type: "enquiry.created", enquiry }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Provider rejected request");
    await put("notificationJobs", job.id, {
      ...job,
      status: "sent",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    await put("notificationJobs", job.id, {
      ...job,
      status: "failed",
      attempts: job.attempts + 1,
      updatedAt: new Date().toISOString(),
    });
    console.log("Notification queued for retry:", job.id);
  }
}
