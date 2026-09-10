import { getPrisma } from "@/lib/db";

function readSePayTestConfiguration(source: NodeJS.ProcessEnv = process.env) {
  const required = ["SEPAY_WEBHOOK_SECRET", "SEPAY_TEST_BANK", "SEPAY_TEST_ACCOUNT_NUMBER", "SEPAY_TEST_ACCOUNT_NAME", "SEPAY_PUBLIC_BASE_URL"] as const;
  if ((source.NODE_ENV ?? "development") !== "development" || source.SEPAY_TEST_MODE !== "true") return { ready: false, reason: "SePay Test Mode chỉ chạy khi NODE_ENV=development và SEPAY_TEST_MODE=true." } as const;
  const missing = required.filter((key) => !source[key]);
  if (missing.length) return { ready: false, reason: `Thiếu cấu hình SePay: ${missing.join(", ")}.` } as const;
  const baseUrl = new URL(source.SEPAY_PUBLIC_BASE_URL!);
  if (baseUrl.protocol !== "https:") return { ready: false, reason: "SEPAY_PUBLIC_BASE_URL phải dùng HTTPS." } as const;
  return { ready: true, webhookUrl: new URL("/api/payments/sepay/webhook", baseUrl).toString() } as const;
}

async function main() {
  const configuration = readSePayTestConfiguration();
  if (!configuration.ready) throw new Error(configuration.reason);
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database is unavailable.");
  await prisma.$queryRaw`SELECT 1`;
  const readyVariants = await prisma.productVariant.count({ where: { active: true, price: { gt: 0 }, stock: { gt: 0 }, product: { status: "PUBLISHED", saleStatus: "ACTIVE" } } });
  if (!readyVariants) throw new Error("No purchasable variant with stock is available for SePay Test Mode.");
  console.info(JSON.stringify({ ready: true, webhookUrl: configuration.webhookUrl, readyVariants }));
}

void main().catch((error) => { console.error(error instanceof Error ? error.message : "SePay readiness check failed."); process.exitCode = 1; });
