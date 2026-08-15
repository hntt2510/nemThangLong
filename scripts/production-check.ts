import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import { getProductionEnv } from "../lib/env";
import { getOpenApiDocument, OPENAPI_ROUTE_EXCEPTIONS, OPENAPI_ROUTE_INVENTORY } from "../lib/openapi";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env, shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(path) : entry.name === "route.ts" ? [path] : [];
  });
}

function assertRouteInventory() {
  const root = join(process.cwd(), "app", "api");
  const discovered = new Set<string>();
  for (const file of routeFiles(root)) {
    const relativePath = relative(root, file).replaceAll("\\", "/").replace(/\/route\.ts$/, "");
    const path = `/api/${relativePath}`;
    const source = readFileSync(file, "utf8");
    const methods = [...source.matchAll(/export\s+(?:async\s+function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map((match) => match[1]);
    if (methods.length === 0) {
      if (!(path in OPENAPI_ROUTE_EXCEPTIONS)) throw new Error(`Undocumented route handler: ${path}`);
      continue;
    }
    for (const method of methods) discovered.add(`${method} ${path}`);
  }
  const documented = new Set(OPENAPI_ROUTE_INVENTORY.map(([method, path]) => `${method} ${path}`));
  if (discovered.size !== documented.size || [...discovered].some((operation) => !documented.has(operation))) {
    throw new Error("OpenAPI route inventory is out of date.");
  }
}

async function main() {
  getProductionEnv();
  const document = getOpenApiDocument();
  await SwaggerParser.validate(document as never);
  assertRouteInventory();
  run(process.execPath, ["node_modules/prisma/build/index.js", "validate"]);
  run(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "status"]);
  console.log("Production readiness check passed (read-only).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Production readiness check failed.");
  process.exitCode = 1;
});
