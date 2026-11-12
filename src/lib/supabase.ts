import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export const supabaseMode = () => process.env.DATA_BACKEND === "supabase";
function configuration() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration missing");
  return { url, key };
}
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, {
        ...init,
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      }),
  },
};
export function publicSupabase() {
  const { url, key } = configuration();
  return createClient(url, key, options);
}
export function serviceSupabase() {
  if (typeof window !== "undefined") throw new Error("Server-only operation");
  const { url } = configuration();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Supabase server credential missing");
  return createClient(url, key, options);
}
export async function requestSupabase() {
  const { url, key } = configuration();
  const token = (await cookies()).get("ptm_supabase_access")?.value;
  return createClient(url, key, {
    ...options,
    global: {
      ...options.global,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    },
  });
}
export function databaseError(
  error: { code?: string; message: string } | null,
) {
  if (!error) return;
  if (error.code === "42501") throw new Error("FORBIDDEN");
  if (error.code === "PGRST301" || error.code === "PGRST303")
    throw new Error("UNAUTHENTICATED");
  throw Object.assign(new Error(error.message), { code: error.code });
}
const tables: Record<string, string> = {
  content: "content",
  publishedContent: "published_content",
  revisions: "content_revisions",
  enquiries: "enquiries",
  settings: "site_settings",
  runtimeConfig: "runtime_config",
  auditEvents: "audit_events",
  staff: "staff",
  media: "media_assets",
  excelJobs: "delivery_jobs",
  notificationJobs: "delivery_jobs",
};
async function clientFor(collection: string) {
  if (["publishedContent", "settings"].includes(collection))
    return publicSupabase();
  if (process.env.PTM_TRUSTED_WORKER === "true" && !process.env.VERCEL)
    return serviceSupabase();
  return requestSupabase();
}
// Fields the admin list and dashboard need. Fetching these instead of whole
// records keeps list pages small as the catalogue grows.
const contentSummary = [
  "title",
  "kind",
  "slug",
  "status",
  "demo",
  "featured",
  "order",
  "region",
  "country",
  "state",
  "location",
  "locations",
  "packageType",
  "collections",
  "stayDestinationSlug",
  "propertyVerified",
]
  .map((key) => `${key}:data->${key}`)
  .join(",");
export async function supabaseRead<T>(
  collection: string,
  id?: string,
  options: { where?: Record<string, string>; summary?: boolean } = {},
): Promise<T[]> {
  const table = tables[collection];
  if (!table) throw new Error("Unsupported collection");
  const client = await clientFor(collection);
  const output: T[] = [];
  // Explicit pages avoid PostgREST's default maximum silently truncating records.
  for (let offset = 0; ; offset += 500) {
    let query = client
      .from(table)
      .select(options.summary ? `id,${contentSummary}` : "*")
      .order(table === "delivery_jobs" ? "enquiry_id" : "id")
      .range(offset, offset + 499);
    for (const [column, value] of Object.entries(options.where || {}))
      query = query.eq(column, value);
    if (id)
      query = query.eq(table === "delivery_jobs" ? "enquiry_id" : "id", id);
    if (table === "delivery_jobs")
      query = query.eq(
        "kind",
        collection === "excelJobs" ? "excel" : "notification",
      );
    const { data, error } = await query;
    databaseError(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data || []) as any[];
    output.push(
      ...rows.map(
        (row) =>
          (collection === "staff" || options.summary
            ? row
            : collection === "media"
              ? {
                  ...row.data,
                  id: row.id,
                  bucket: row.bucket,
                  object_path: row.object_path,
                }
              : row.data) as T,
      ),
    );
    if (id || rows.length < 500) return output;
  }
}
export async function supabaseBatch(
  writes: { collection: string; id: string; data: unknown | null }[],
) {
  const client =
    process.env.PTM_TRUSTED_WORKER === "true" && !process.env.VERCEL
      ? serviceSupabase()
      : await requestSupabase();
  const { error } = await client.rpc("ptm_batch", { writes });
  databaseError(error);
}
