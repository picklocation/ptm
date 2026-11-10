import { z } from "zod";
import { collectionOptions, packageTypes } from "./classification";
const text = z.string().trim().max(2000);
export const enquirySchema = z
  .object({
    requestId: z.string().uuid(),
    name: z.string().trim().min(2).max(100),
    email: z.union([z.email(), z.literal("")]),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[\d\s()-]{7,25}$/,
        "Enter a valid phone number with country code.",
      ),
    destination: text.min(2),
    kind: z.enum(["holiday", "road-trip", "resort"]),
    startDate: z.string().max(10),
    endDate: z.string().max(10),
    flexible: z.boolean(),
    adults: z.number().int().min(1).max(100),
    children: z.number().int().min(0).max(50),
    childAges: z.string().max(200),
    rooms: z.number().int().min(1).max(50),
    departure: z.string().max(150),
    budget: z.string().regex(/^\d{0,9}(\.\d{1,2})?$/),
    currency: z.enum(["INR", "EUR", "USD", "GBP", "AED"]),
    budgetBasis: z.enum(["total", "per person"]),
    preferences: text,
    vehicle: z.string().max(150),
    mealPlan: z.string().max(150),
    contactMethod: z.enum(["phone", "email", "whatsapp"]),
    itemId: z.string().max(100),
    method: z.enum(["submit", "whatsapp"]),
    consent: z.literal(true),
    website: z.literal(""),
    startedAt: z.number(),
  })
  .superRefine((d, ctx) => {
    if (d.contactMethod === "email" && !d.email)
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required for email contact.",
      });
    for (const field of ["startDate", "endDate"] as const) {
      if (
        d[field] &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(d[field]) ||
          Number.isNaN(Date.parse(d[field])) ||
          new Date(d[field]).toISOString().slice(0, 10) !== d[field])
      )
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Choose a valid date.",
        });
    }
    if (!d.flexible && !d.startDate)
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Choose a date or select flexible dates.",
      });
    if (d.startDate && d.startDate < new Date().toISOString().slice(0, 10))
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Choose a future date.",
      });
    if (d.startDate && d.endDate && d.endDate < d.startDate)
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must follow the start date.",
      });
  });
const image = z
  .string()
  .max(1000)
  .refine(
    (v) =>
      !v ||
      v.startsWith("/images/") ||
      /^\/api\/media\/[a-f0-9-]+$/.test(v) ||
      v.startsWith(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://feqmnzutyhzochuyiint.supabase.co"}/storage/v1/object/public/website-public/`,
      ),
    "Use an uploaded image or an approved image URL.",
  );
export const contentSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]+$/),
  kind: z.enum(["holiday", "road-trip", "resort", "destination"]),
  title: z.string().trim().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: text,
  region: z.string().max(100),
  country: z.string().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  locations: z.array(z.string().trim().min(1).max(100)).max(40).optional(),
  packageType: z.enum(packageTypes).optional(),
  collections: z
    .array(z.enum(collectionOptions.map((x) => x[0])))
    .max(6)
    .refine((x) => new Set(x).size === x.length)
    .optional(),
  summary: z.string().max(400),
  description: z.string().max(10000),
  image,
  gallery: z.array(image).max(30),
  galleryAlt: z.record(z.string().max(1000), z.string().max(300)).optional(),
  accommodation: z.string().max(5000).optional(),
  imageAlt: z.string().max(300),
  days: z.number().int().min(0).max(365),
  nights: z.number().int().min(0).max(365),
  themes: z.array(z.string().max(50)).max(10),
  featured: z.boolean(),
  order: z.number().int().min(0).max(9999),
  status: z.enum(["draft", "published", "archived"]),
  demo: z.boolean(),
  itinerary: z
    .array(
      z.object({
        title: z.string().max(150),
        description: z.string().max(3000),
      }),
    )
    .max(100),
  inclusions: z.array(text).max(50),
  exclusions: z.array(text).max(50),
  amenities: z.array(text).max(50),
  rooms: z.array(text).max(50),
  mealPlans: z.array(text).max(20),
  vehicles: z
    .array(
      z.object({
        name: z.string().max(100),
        passengers: z.number().int().min(1).max(100),
        luggage: z.string().max(200),
      }),
    )
    .max(20),
  price: z.number().positive().optional(),
  currency: z.enum(["INR", "EUR", "USD", "GBP", "AED"]),
  priceBasis: z.string().max(100),
  priceConditions: text,
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(300),
  updatedAt: z.string(),
});
export function publishErrors(c: z.infer<typeof contentSchema>) {
  return [
    !c.image && "Add a cover image.",
    !c.imageAlt && "Add image alt text.",
    !c.summary && "Add a summary.",
    !c.location && "Add a destination/location.",
    c.gallery.some((url) => !c.galleryAlt?.[url]?.trim()) &&
      "Add an alt description for every gallery photo.",
    c.price &&
      (!c.priceBasis || !c.priceConditions) &&
      "A price needs a basis and conditions.",
  ].filter(Boolean) as string[];
}
