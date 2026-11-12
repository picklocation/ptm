import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import path from "node:path";
export function migrationConfig() {
  const values = parseEnv(readFileSync(path.resolve(".env.migration.local"), "utf8"));
  const required = (name: string) => {
    const value = process.env[name] || values[name];
    if (!value?.trim()) throw new Error(`Set ${name} in .env.migration.local (never paste it into chat).`);
    return value;
  };
  return { required, optional: (name: string) => process.env[name] || values[name] || "",
    output: path.resolve(values.MIGRATION_OUTPUT_DIR || ".local/migration") };
}
