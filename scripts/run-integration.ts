import { spawnSync } from "node:child_process";
import { assertIntegrationDatabaseTarget } from "../lib/database-safety";

const env = { ...process.env };
assertIntegrationDatabaseTarget(env);
const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "--config", "vitest.integration.config.mjs"], {
  stdio: "inherit",
  env,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
