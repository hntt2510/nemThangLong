import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertDevelopmentDatabaseTarget, assertIntegrationDatabaseTarget } from "@/lib/database-safety";
import { getProductionEnv, validateEnvironment } from "@/lib/env";
import { bootstrapDevelopment } from "@/scripts/dev-bootstrap";

const dbState = vi.hoisted(() => ({ prisma: null as { $queryRaw: ReturnType<typeof vi.fn> } | null }));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn(() => dbState.prisma) }));

import { GET as liveGET } from "@/app/api/health/live/route";
import { GET as readyGET } from "@/app/api/health/ready/route";

const baseEnv = {
  AUTH_SECRET: "a".repeat(32),
  CRON_SECRET: "b".repeat(32),
  LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("database safety and production readiness", () => {
  it("accepts only the local development target for destructive dev commands", () => {
    expect(() => assertDevelopmentDatabaseTarget({ ...baseEnv, DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev" })).not.toThrow();
    expect(() => assertDevelopmentDatabaseTarget({ ...baseEnv, DATABASE_URL: "postgresql://user:password@remote.example/thanglong_dev", DIRECT_URL: "postgresql://user:password@remote.example/thanglong_dev" })).toThrow();
    expect(() => assertDevelopmentDatabaseTarget({ ...baseEnv, NODE_ENV: "production", DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev" })).toThrow();
  });

  it("requires an explicit safe integration target", () => {
    const safe = { ...baseEnv, RUN_INTEGRATION: "true", DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/thanglong_test", DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/thanglong_test" };
    expect(() => assertIntegrationDatabaseTarget(safe)).not.toThrow();
    expect(() => assertIntegrationDatabaseTarget({ ...safe, DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/production" })).toThrow();
    expect(() => assertIntegrationDatabaseTarget({ ...safe, RUN_INTEGRATION: "false" })).toThrow();
  });

  it("keeps runtime DB optional but makes production check fail without DB URLs", () => {
    expect(validateEnvironment(baseEnv, "production").success).toBe(true);
    expect(() => getProductionEnv(baseEnv)).toThrow(/DATABASE_URL/);
    expect(validateEnvironment({ ...baseEnv, MOMO_PARTNER_CODE: "configured" }, "development").success).toBe(false);
  });

  it("bootstraps six neutral catalog documents idempotently", async () => {
    const products = new Map<string, { slug: string; name: string; status: string; isDemo: boolean; variants?: unknown[] }>();
    let settingsCreated = 0;
    const tx = {
      siteSettings: { createMany: vi.fn(async ({ data, skipDuplicates }: { data: Array<{ id: string }>; skipDuplicates: boolean }) => { if (skipDuplicates && settingsCreated > 0) return { count: 0 }; settingsCreated += data.length; return { count: data.length }; }) },
      product: {
        findUnique: vi.fn(async ({ where }: { where: { slug: string } }) => products.get(where.slug) ?? null),
        create: vi.fn(async ({ data }: { data: { slug: string; name: string; status: string; isDemo: boolean } }) => { const product = { ...data }; products.set(data.slug, product); return product; }),
      },
    };
    const fakePrisma = { $transaction: async (callback: (client: typeof tx) => Promise<void>) => callback(tx) } as never;
    const target = { NODE_ENV: "development" as const, DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev" };
    await bootstrapDevelopment(fakePrisma, target);
    await bootstrapDevelopment(fakePrisma, target);
    expect(products.size).toBe(6);
    expect([...products.values()].every((product) => product.status === "DRAFT" && product.isDemo && !product.variants)).toBe(true);
    expect(settingsCreated).toBe(1);
  });

  describe("health routes", () => {
    beforeEach(() => { dbState.prisma = null; });

    it("live never requires database", async () => {
      const response = await liveGET();
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "ok" });
    });

    it("ready returns 503 without DB and 200 after SELECT 1 succeeds", async () => {
      expect((await readyGET()).status).toBe(503);
      dbState.prisma = { $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]) };
      expect((await readyGET()).status).toBe(200);
      expect(dbState.prisma.$queryRaw).toHaveBeenCalledOnce();
    });
  });
});
