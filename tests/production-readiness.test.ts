import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertDevelopmentDatabaseTarget, assertIntegrationDatabaseTarget } from "@/lib/database-safety";
import { getEnv, getProductionEnv, validateEnvironment } from "@/lib/env";
import { bootstrapDevelopment } from "@/scripts/dev-bootstrap";

const dbState = vi.hoisted(() => ({ prisma: null as { $queryRaw: ReturnType<typeof vi.fn> } | null }));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn(() => dbState.prisma) }));

import { GET as liveGET } from "@/app/api/health/live/route";
import { GET as readyGET } from "@/app/api/health/ready/route";

const baseSecrets = {
  AUTH_SECRET: "a".repeat(32),
  CRON_SECRET: "b".repeat(32),
  LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
};

const baseDevEnv = {
  ...baseSecrets,
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

const baseProdEnv = {
  ...baseSecrets,
  NEXT_PUBLIC_SITE_URL: "https://example.com",
};

describe("database safety and production readiness", () => {
  describe("database safety target rules", () => {
    it("accepts only local development target for destructive dev commands", () => {
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev" })).not.toThrow();
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://thanglong:thanglong_dev@127.0.0.1:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@127.0.0.1:5432/thanglong_dev" })).not.toThrow();
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://thanglong:thanglong_dev@[::1]:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@[::1]:5432/thanglong_dev" })).not.toThrow();

      // Refuses remote host
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://user:password@remote.example:5432/thanglong_dev", DIRECT_URL: "postgresql://user:password@remote.example:5432/thanglong_dev" })).toThrow(/non-local/);

      // Refuses production NODE_ENV
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, NODE_ENV: "production", DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev" })).toThrow(/production/);

      // Refuses thanglong_test or arbitrary database names for dev commands
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/thanglong_test", DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/thanglong_test" })).toThrow(/unexpected database target/);
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/other_db", DIRECT_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/other_db" })).toThrow(/unexpected database target/);

      // Refuses mismatched DATABASE_URL and DIRECT_URL
      expect(() => assertDevelopmentDatabaseTarget({ ...baseDevEnv, DATABASE_URL: "postgresql://thanglong:thanglong_dev@localhost:5432/thanglong_dev", DIRECT_URL: "postgresql://thanglong:thanglong_dev@127.0.0.1:5432/thanglong_dev" })).toThrow(/must target the same/);
    });

    it("requires an explicit safe integration target", () => {
      const safe = { ...baseDevEnv, RUN_INTEGRATION: "true", DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/thanglong_test", DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/thanglong_test" };
      expect(() => assertIntegrationDatabaseTarget(safe)).not.toThrow();
      expect(() => assertIntegrationDatabaseTarget({ ...safe, DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/production" })).toThrow();
      expect(() => assertIntegrationDatabaseTarget({ ...safe, RUN_INTEGRATION: "false" })).toThrow();
    });
  });

  describe("production site URL validation", () => {
    it("allows localhost in development", () => {
      expect(validateEnvironment(baseDevEnv, "development").success).toBe(true);
      expect(validateEnvironment({ ...baseSecrets }, "development").success).toBe(true);
    });

    it("rejects localhost, 127.0.0.1, and ::1 in production check", () => {
      expect(validateEnvironment(baseDevEnv, "production").success).toBe(false);
      expect(validateEnvironment({ ...baseSecrets, NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000" }, "production").success).toBe(false);
      expect(validateEnvironment({ ...baseSecrets, NEXT_PUBLIC_SITE_URL: "http://[::1]:3000" }, "production").success).toBe(false);
      expect(validateEnvironment({ ...baseSecrets, NEXT_PUBLIC_SITE_URL: "https://localhost:3000" }, "production").success).toBe(false);
      expect(validateEnvironment({ ...baseSecrets }, "production").success).toBe(false);
    });

    it("rejects non-HTTPS URLs in production check", () => {
      expect(validateEnvironment({ ...baseSecrets, NEXT_PUBLIC_SITE_URL: "http://example.com" }, "production").success).toBe(false);
    });

    it("allows valid non-local HTTPS URL in production check", () => {
      expect(validateEnvironment(baseProdEnv, "production").success).toBe(true);
    });
  });

  describe("MoMo production endpoint safety", () => {
    it("passes production check when MoMo is completely disabled", () => {
      expect(validateEnvironment(baseProdEnv, "production").success).toBe(true);
    });

    it("fails validation when MoMo is partially configured in dev or prod", () => {
      expect(validateEnvironment({ ...baseDevEnv, MOMO_PARTNER_CODE: "MOMO_PARTNER" }, "development").success).toBe(false);
      expect(validateEnvironment({ ...baseProdEnv, MOMO_PARTNER_CODE: "MOMO_PARTNER", MOMO_ACCESS_KEY: "KEY" }, "production").success).toBe(false);
    });

    it("fails production check when MoMo is configured with test gateway or missing explicit endpoint", () => {
      const fullMomo = { ...baseProdEnv, MOMO_PARTNER_CODE: "MOMO123", MOMO_ACCESS_KEY: "ACCESS123", MOMO_SECRET_KEY: "SECRET123" };
      // Relying on default test endpoint
      expect(validateEnvironment(fullMomo, "production").success).toBe(false);
      // Explicit test gateway endpoint
      expect(validateEnvironment({ ...fullMomo, MOMO_ENDPOINT: "https://test-payment.momo.vn/v2/gateway/api/create" }, "production").success).toBe(false);
      // Non-HTTPS endpoint
      expect(validateEnvironment({ ...fullMomo, MOMO_ENDPOINT: "http://payment.momo.vn/v2/gateway/api/create" }, "production").success).toBe(false);
    });

    it("passes production check when MoMo is configured with explicit non-test HTTPS endpoint", () => {
      const validMomoProd = {
        ...baseProdEnv,
        MOMO_PARTNER_CODE: "MOMO123",
        MOMO_ACCESS_KEY: "ACCESS123",
        MOMO_SECRET_KEY: "SECRET123",
        MOMO_ENDPOINT: "https://payment.momo.vn/v2/gateway/api/create",
      };
      expect(validateEnvironment(validMomoProd, "production").success).toBe(true);
    });
  });

  describe("database startup rule and production env requirements", () => {
    it("keeps runtime DB optional in production env validation but fails getProductionEnv without DB URLs", () => {
      expect(validateEnvironment(baseProdEnv, "production").success).toBe(true);
      expect(() => getProductionEnv(baseProdEnv)).toThrow(/DATABASE_URL/);
      expect(() => getProductionEnv({ ...baseProdEnv, DATABASE_URL: "postgresql://user:pass@remote:5432/db" })).toThrow(/DIRECT_URL/);
      expect(() => getProductionEnv({ ...baseProdEnv, DATABASE_URL: "postgresql://user:pass@remote:5432/db", DIRECT_URL: "postgresql://user:pass@remote:5432/db" })).not.toThrow();
    });
  });

  describe("actual getEnv runtime mode behavior", () => {
    it("allows missing production-only secrets in development mode", () => {
      const devSource = { NEXT_PUBLIC_SITE_URL: "http://localhost:3000" };
      expect(() => getEnv(devSource, "development")).not.toThrow();
      const env = getEnv(devSource, "development");
      expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    });

    it("fails getEnv in production mode when AUTH_SECRET is missing", () => {
      const prodMissingAuth = {
        CRON_SECRET: "b".repeat(32),
        LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      };
      expect(() => getEnv(prodMissingAuth, "production")).toThrow(/AUTH_SECRET/);
    });

    it("fails getEnv in production mode when CRON_SECRET is missing", () => {
      const prodMissingCron = {
        AUTH_SECRET: "a".repeat(32),
        LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      };
      expect(() => getEnv(prodMissingCron, "production")).toThrow(/CRON_SECRET/);
    });

    it("fails getEnv in production mode when LEAD_RATE_LIMIT_SECRET is missing", () => {
      const prodMissingLead = {
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "b".repeat(32),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      };
      expect(() => getEnv(prodMissingLead, "production")).toThrow(/LEAD_RATE_LIMIT_SECRET/);
    });

    it("does NOT fail getEnv in production mode when DATABASE_URL or DIRECT_URL is missing", () => {
      const prodNoDb = {
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "b".repeat(32),
        LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      };
      expect(() => getEnv(prodNoDb, "production")).not.toThrow();
      const env = getEnv(prodNoDb, "production");
      expect(env.DATABASE_URL).toBeUndefined();
      expect(env.DIRECT_URL).toBeUndefined();
    });

    it("fails getEnv in production mode when NEXT_PUBLIC_SITE_URL is localhost", () => {
      const prodLocalhost = {
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "b".repeat(32),
        LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      };
      expect(() => getEnv(prodLocalhost, "production")).toThrow(/NEXT_PUBLIC_SITE_URL/);
    });

    it("fails getEnv in production mode when MoMo is enabled with test-payment gateway", () => {
      const prodMomoTest = {
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "b".repeat(32),
        LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        MOMO_PARTNER_CODE: "MOMO123",
        MOMO_ACCESS_KEY: "KEY123",
        MOMO_SECRET_KEY: "SECRET123",
        MOMO_ENDPOINT: "https://test-payment.momo.vn/v2/gateway/api/create",
      };
      expect(() => getEnv(prodMomoTest, "production")).toThrow(/MOMO_ENDPOINT/);
    });

    it("fails getProductionEnv when DATABASE_URL or DIRECT_URL is missing", () => {
      const prodNoDb = {
        AUTH_SECRET: "a".repeat(32),
        CRON_SECRET: "b".repeat(32),
        LEAD_RATE_LIMIT_SECRET: "c".repeat(32),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      };
      expect(() => getProductionEnv(prodNoDb)).toThrow(/DATABASE_URL/);
      expect(() => getProductionEnv({ ...prodNoDb, DATABASE_URL: "postgresql://user:pass@remote:5432/db" })).toThrow(/DIRECT_URL/);
    });
  });

  describe("bootstrap idempotence", () => {
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
