import { createClient } from "@supabase/supabase-js";
import { migrationConfig } from "./config";
const c = migrationConfig();
const options = { auth: { persistSession:false, autoRefreshToken:false }, global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input,{...init,signal:AbortSignal.timeout(15000)}) } };
const anonymous = createClient(c.required("SUPABASE_URL"),c.required("SUPABASE_PUBLISHABLE_KEY"),options);
const server = createClient(c.required("SUPABASE_URL"),c.required("SUPABASE_SECRET_KEY"),options);
async function main() {
  const staff = await server.from("staff").select("id",{head:true,count:"exact"});
  if (staff.error) throw new Error(`Server credential check failed (HTTP ${staff.status}, ${staff.error.code || "API authentication error"})`);
  console.log("Server credential verified. No records changed.");
  // HEAD responses omit the error body: a denied anonymous table read can
  // return 401 without implying that the publishable key is invalid.
  for (const table of ["published_content","site_settings"]) {
    const result = await anonymous.from(table).select("id").limit(0);
    if (result.error) throw new Error(`Public read failed: ${table} (HTTP ${result.status}, ${result.error.code || "API error"})`);
    console.log(`Public key and read verified: ${table}`);
  }
  for (const table of ["staff","content","enquiries","delivery_jobs","audit_events","rate_limits","media_assets"]) {
    const result = await anonymous.from(table).select("*").limit(0);
    if (!result.error) throw new Error(`Anonymous private-table check failed: ${table}`);
    if (result.error.code !== "42501") throw new Error(`Unexpected access-check result for ${table}: HTTP ${result.status}, ${result.error.code || result.error.message}`);
    console.log(`Anonymous access denied: ${table}`);
  }
}
main().catch(error=>{console.error(error instanceof Error ? error.message : "Access verification failed");process.exitCode=1;});
