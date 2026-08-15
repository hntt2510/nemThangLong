import { defineConfig } from "vitest/config";
import path from "node:path";

const root = process.cwd();

export default defineConfig({
  resolve: { alias: { "@/": `${root}/`, "server-only": path.resolve(root, "tests/server-only-stub.ts") } },
  test: { include: ["tests/**/*.integration.test.ts"], fileParallelism: false, testTimeout: 30000, hookTimeout: 30000 },
});
