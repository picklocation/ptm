import { enquirySchema } from "@/lib/validation";
import {
  createEnquiryOnce,
  publicContent,
  rateLimit,
  settings,
  demoEnabled,
} from "@/lib/store";
import { checkOrigin, digest, errorResponse } from "@/lib/auth";
import type { Enquiry } from "@/lib/types";
import { stayDestinations, stayDestinationKey } from "@/lib/stays";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const raw = await request.text();
    if (raw.length > 16000)
      return Response.json(
        { error: "Please shorten your enquiry." },
        { status: 413 },
      );
    const parsed = enquirySchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        fields[String(issue.path[0])] = issue.message;
      return Response.json(
        { error: "Please check the highlighted details.", fields },
        { status: 400 },
      );
    }
    const d = parsed.data;
    if (Date.now() - d.startedAt < 1500)
      return Response.json(
        { error: "Please take a moment to review your details." },
        { status: 400 },
      );
    const ip = process.env.VERCEL
      ? request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
      : "local";
    if (!(await rateLimit(digest("enquiry:" + ip), 15)))
      return Response.json(
        { error: "Too many enquiries. Please try again in a few minutes." },
        { status: 429 },
      );
    const content = await publicContent();
    const item = content.find((x) => x.id === d.itemId);
    if (d.itemId && !item)
      return Response.json(
        {
          error:
            "This trip is no longer available to enquire about. Please start a custom enquiry.",
        },
        { status: 400 },
      );
    const now = new Date().toISOString();
    const { requestId, consent, website, startedAt, ...fields } = d;
    void consent;
    void website;
    void startedAt;
    const enquiry: Enquiry = {
      ...fields,
      ...(item?.kind === "resort" && item.stayDestinationSlug
        ? {
            destination:
              stayDestinations(content).find(
                (place) =>
                  place.slug === stayDestinationKey(item.stayDestinationSlug!),
              )?.name || item.location,
            kind: "resort",
          }
        : {}),
      id: requestId,
      itemTitle: item?.title || "",
      createdAt: now,
      updatedAt: now,
      status: "new",
      assignedTo: "",
      followUp: "",
      notes: [],
      history: [{ status: "new", at: now, author: "Visitor" }],
      excelStatus: "pending",
      demo:
        !!item?.demo ||
        (await demoEnabled()) ||
        process.env.VERCEL_ENV !== "production",
    };
    const saved = await createEnquiryOnce(enquiry);
    if (
      saved.phone !== enquiry.phone ||
      saved.name !== enquiry.name ||
      saved.destination !== enquiry.destination
    )
      return Response.json(
        {
          error:
            "This submission reference has already been used. Please reload the form.",
        },
        { status: 409 },
      );
    const s = await settings();
    const number = s.whatsapp || process.env.WHATSAPP_NUMBER;
    const summary = `Hello PickTheMap! My enquiry reference is ${saved.id}.\nI’m planning a trip to ${saved.destination}${saved.itemTitle ? " (" + saved.itemTitle + ")" : ""}.\nTravellers: ${saved.adults} adults, ${saved.children} children.\nDates: ${saved.startDate || "Not decided"}${saved.flexible ? " (flexible)" : ""}.\nPlease help me plan my trip.`;
    return Response.json(
      {
        id: saved.id,
        whatsappUrl:
          number && /^\d{7,15}$/.test(number)
            ? `https://wa.me/${number}?text=${encodeURIComponent(summary)}`
            : null,
      },
      { status: 201 },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
