import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import { migrationConfig } from "./config";
const c = migrationConfig();
const connectionString = c.required("SUPABASE_DB_URL");
let target: URL;
try { target = new URL(connectionString); }
catch { throw new Error("Invalid database URL in the private configuration. Check password URL encoding."); }
const project = new URL(c.required("SUPABASE_URL")).hostname.split(".")[0];
if (!target.hostname.includes(project) && !decodeURIComponent(target.username).includes(project)) throw new Error("Database URL does not identify the configured Supabase project.");
if (!["postgres:","postgresql:"].includes(target.protocol)) throw new Error("Use a PostgreSQL connection URL.");
// Keep TLS verification enabled. Do not print connection strings or driver errors containing credentials.
// URL SSL parameters override pg's explicit TLS options; reject them rather than silently weaken verification.
if (["sslmode", "sslcert", "sslkey", "sslrootcert"].some(key => target.searchParams.has(key))) throw new Error("Remove SSL query parameters from the database URL; this script configures verified TLS explicitly.");
const ca = readFileSync(c.optional("SUPABASE_CA_CERT_PATH") || ".local/migration/supabase-ca.crt", "utf8");
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: true, ca }, connectionTimeoutMillis: 15000, statement_timeout: 60000 });
async function main() {
  await client.connect();
  if (process.argv.includes("--check")) {
    await client.query("select 1");
    console.log("Verified TLS database connection succeeded (no schema changes).");
    return;
  }
  await client.query("select pg_advisory_lock(90261109)");
  await client.query("create schema if not exists private; revoke all on schema private from public; create table if not exists private.ptm_migrations(name text primary key, sha256 text not null, applied_at timestamptz not null default now())");
  for (const name of (await readdir("supabase/migrations")).filter(x=>x.endsWith(".sql")).sort()) {
    const sql = await readFile(`supabase/migrations/${name}`,"utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    const old = await client.query("select sha256 from private.ptm_migrations where name=$1",[name]);
    if (old.rowCount) { if(old.rows[0].sha256!==hash) throw new Error(`Applied migration changed: ${name}`); console.log(`Already applied: ${name}`); continue; }
    await client.query("begin");
    try { await client.query(sql); await client.query("insert into private.ptm_migrations(name,sha256) values($1,$2)",[name,hash]); await client.query("commit"); console.log(`Applied: ${name}`); }
    catch(error) { await client.query("rollback"); throw error; }
  }
}
main().catch(error=>{console.error("Schema application failed:",error instanceof Error && error.message.startsWith("Applied migration") ? error.message : (error as {code?:string}).code || "connection/schema error; inspect privately");process.exitCode=1;}).finally(()=>client.end());
