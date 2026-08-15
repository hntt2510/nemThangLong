import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SwaggerParser from "@apidevtools/swagger-parser";
import { getOpenApiDocument, OPENAPI_ROUTE_EXCEPTIONS, OPENAPI_ROUTE_INVENTORY } from "@/lib/openapi";
import { openApiAuthStatus } from "@/lib/openapi-auth";

const state = vi.hoisted(() => ({ session: null as { user: { role: string } } | null }));
vi.mock("@/auth", () => ({ auth: vi.fn(async () => state.session) }));
vi.mock("@/app/api-docs/swagger-client", () => ({ SwaggerClient: () => null }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); }, notFound: () => { throw new Error("NOT_FOUND"); } }));

import { GET as openApiGET } from "@/app/api/openapi/route";
import ApiDocsPage from "@/app/api-docs/page";

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(path) : entry.name === "route.ts" ? [path] : [];
  });
}

function discoveredInventory() {
  const root = join(process.cwd(), "app", "api");
  const rows: string[] = [];
  for (const file of routeFiles(root)) {
    const relativePath = relative(root, file).replaceAll("\\", "/").replace(/\/route\.ts$/, "");
    const path = `/api/${relativePath}`;
    const source = readFileSync(file, "utf8");
    const methods = [...source.matchAll(/export\s+(?:async\s+function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map((match) => match[1]);
    if (methods.length === 0) {
      expect(OPENAPI_ROUTE_EXCEPTIONS).toHaveProperty(path);
      continue;
    }
    for (const method of methods) rows.push(`${method} ${path}`);
  }
  return rows.sort();
}

describe("OpenAPI contract", () => {
  it("generates a valid OpenAPI 3.1 document with a complete operation inventory", async () => {
    const document = getOpenApiDocument() as { openapi: string; paths: Record<string, Record<string, { operationId?: string }>> };
    await SwaggerParser.validate(document as never);
    const operations = Object.entries(document.paths).flatMap(([path, item]) => Object.entries(item).filter(([method]) => ["get", "post", "put", "patch", "delete"].includes(method)).map(([method, operation]) => `${method.toUpperCase()} ${path}`));
    expect(operations).toHaveLength(39);
    expect(new Set(operations).size).toBe(39);
    expect(operations.every((operation) => document.paths[operation.split(" ")[1]][operation.split(" ")[0].toLowerCase()].operationId)).toBe(true);
    expect(new Set(Object.values(document.paths).flatMap((item) => Object.values(item).map((operation) => operation.operationId))).size).toBe(39);
    expect(operations).toContain("POST /api/checkout");
    expect(operations).toContain("PATCH /api/admin/payment-reviews/{id}");
    expect(operations).not.toContain("GET /api/fake");
    expect(JSON.stringify(document)).not.toMatch(/rawResponse|MOMO_SECRET_KEY|MOMO_ACCESS_KEY|DATABASE_URL|R2_SECRET_ACCESS_KEY|@gmail\.com/i);
    expect(JSON.stringify(document)).toContain("providerTransactionId");
  });

  it("keeps the documented operations aligned with app/api route handlers", () => {
    const documented = OPENAPI_ROUTE_INVENTORY.map(([method, path]) => `${method} ${path.replaceAll("[", "{").replaceAll("]", "}")}`).sort();
    expect(documented).toEqual(discoveredInventory().map((value) => value.replaceAll("[", "{").replaceAll("]", "}")).sort());
  });

  describe("documentation authorization", () => {
    beforeEach(() => { state.session = null; });

    it("returns 401 for anonymous and 403 for non-admin roles", async () => {
      expect(openApiAuthStatus(null)).toBe(401);
      expect((await openApiGET()).status).toBe(401);
      for (const role of ["CUSTOMER", "EDITOR"]) {
        state.session = { user: { role } };
        expect(openApiAuthStatus(state.session)).toBe(403);
        expect((await openApiGET()).status).toBe(403);
      }
    });

    it("allows ADMIN and blocks the Swagger page before hydration for others", async () => {
      state.session = { user: { role: "ADMIN" } };
      expect((await openApiGET()).status).toBe(200);
      state.session = null;
      await expect(ApiDocsPage()).rejects.toThrow("REDIRECT:/dang-nhap");
      state.session = { user: { role: "EDITOR" } };
      await expect(ApiDocsPage()).rejects.toThrow("NOT_FOUND");
      state.session = { user: { role: "ADMIN" } };
      expect(await ApiDocsPage()).toBeTruthy();
    });
  });
});
