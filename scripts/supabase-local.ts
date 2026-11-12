import { spawn } from "node:child_process";
import { migrationConfig } from "./migration/config";
const c = migrationConfig();
const command = process.argv[2] || "dev";
if (!["dev", "build", "start"].includes(command))
  throw new Error("Choose dev, build or start");
const env = {
  ...process.env,
  DATA_BACKEND: "supabase",
  SUPABASE_URL: c.required("SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_URL: c.required("SUPABASE_URL"),
  SUPABASE_PUBLISHABLE_KEY: c.required("SUPABASE_PUBLISHABLE_KEY"),
  SUPABASE_SECRET_KEY: c.required("SUPABASE_SECRET_KEY"),
  SITE_URL: "http://localhost:3005",
  ENABLE_DEMO_CONTENT: "true",
  NODE_USE_SYSTEM_CA: "1",
};
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    command,
    ...(command === "build"
      ? ["--webpack"]
      : ["--hostname", "127.0.0.1", "--port", "3005"]),
  ],
  { env, stdio: "inherit" },
);
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
