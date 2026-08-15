import { spawnSync } from "node:child_process";
import { assertDevelopmentDatabaseTarget } from "../lib/database-safety";

const prismaCli = "node_modules/prisma/build/index.js";

function run(command: string, args: string[], env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env, shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  const action = process.argv[2];
  if (["migrate-dev", "studio", "reset"].includes(action)) assertDevelopmentDatabaseTarget();
  if (action === "up") return run("docker", ["compose", "up", "-d", "--wait", "postgres"]);
  if (action === "down") return run("docker", ["compose", "down"]);
  if (action === "migrate-dev") return run(process.execPath, [prismaCli, "migrate", "dev"]);
  if (action === "studio") return run(process.execPath, [prismaCli, "studio"]);
  if (action === "generate") return run(process.execPath, [prismaCli, "generate"]);
  if (action === "validate") return run(process.execPath, [prismaCli, "validate"]);
  if (action === "status") return run(process.execPath, [prismaCli, "migrate", "status"]);
  if (action !== "reset") throw new Error("Unknown database command.");

  run("docker", ["compose", "down", "-v"]);
  run("docker", ["compose", "up", "-d", "--wait", "postgres"]);
  run(process.execPath, [prismaCli, "migrate", "deploy"]);
  const { PrismaClient } = await import("@prisma/client");
  const { bootstrapDevelopment } = await import("./dev-bootstrap");
  const prisma = new PrismaClient();
  try { await bootstrapDevelopment(prisma); } finally { await prisma.$disconnect(); }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Database command failed.");
  process.exitCode = 1;
});
