import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
let running = false;
async function run() {
  if (running) return;
  running = true;
  const { syncExcel } = await import("../src/lib/excel");
  try {
    const r = await syncExcel();
    if (r.synced)
      console.log(`Synced ${r.synced} enquiry records to the local workbook.`);
  } catch (e) {
    console.error(
      "Excel sync will retry:",
      e instanceof Error ? e.message : "Unknown error",
    );
  } finally {
    running = false;
  }
}
await run();
if (process.argv.includes("--watch")) setInterval(run, 30000);
