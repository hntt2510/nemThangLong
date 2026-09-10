import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getEnv } from "@/lib/env";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export type SePayConfiguration =
  | { ready: true; bank: string; accountNumber: string; accountName: string; webhookSecret: string; publicBaseUrl: string }
  | { ready: false; reason: string };

export function getSePayConfiguration(source: Record<string, string | undefined> = process.env): SePayConfiguration {
  const runtime = source.NODE_ENV ?? process.env.NODE_ENV ?? "development";
  if (runtime !== "development") return { ready: false, reason: "SePay Test Mode chỉ hoạt động trong môi trường development." };
  let env: ReturnType<typeof getEnv>;
  try { env = getEnv(source, runtime); } catch { return { ready: false, reason: "Cấu hình SePay Test Mode chưa hợp lệ." }; }
  if (env.SEPAY_TEST_MODE !== "true") return { ready: false, reason: "SePay Test Mode chưa được bật." };
  if (!env.SEPAY_WEBHOOK_SECRET || !env.SEPAY_TEST_BANK || !env.SEPAY_TEST_ACCOUNT_NUMBER || !env.SEPAY_TEST_ACCOUNT_NAME || !env.SEPAY_PUBLIC_BASE_URL) return { ready: false, reason: "Cấu hình SePay Test Mode chưa đầy đủ." };
  try {
    const callback = new URL(env.SEPAY_PUBLIC_BASE_URL);
    if (callback.protocol !== "https:" || LOCAL_HOSTS.has(callback.hostname.replace(/^\[|\]$/g, ""))) return { ready: false, reason: "SEPAY_PUBLIC_BASE_URL phải là HTTPS công khai, không dùng localhost." };
  } catch { return { ready: false, reason: "SEPAY_PUBLIC_BASE_URL không hợp lệ." }; }
  return { ready: true, bank: env.SEPAY_TEST_BANK, accountNumber: env.SEPAY_TEST_ACCOUNT_NUMBER, accountName: env.SEPAY_TEST_ACCOUNT_NAME, webhookSecret: env.SEPAY_WEBHOOK_SECRET, publicBaseUrl: env.SEPAY_PUBLIC_BASE_URL.replace(/\/$/, "") };
}

export function makeSePayPaymentCode() { return `NEM${randomBytes(6).toString("hex").toUpperCase()}`; }

const paymentCodePattern = /(?:^|[^A-Z0-9])(NEM[0-9A-F]{12})(?=$|[^A-Z0-9])/i;

export function extractSePayPaymentCode(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (!value) continue;
    const match = value.toUpperCase().match(paymentCodePattern);
    if (match) return match[1];
  }
  return null;
}

export function getSePayTransactionId(input: { id?: number | string; referenceCode?: string | null; [key: string]: unknown }, rawBody: string) {
  if (input.id !== undefined && input.id !== null && String(input.id).trim()) return `sepay:id:${String(input.id).trim()}`;
  if (input.referenceCode?.trim()) return `sepay:reference:${input.referenceCode.trim()}`;
  return `sepay:payload:${createHash("sha256").update(rawBody).digest("hex")}`;
}

export function getSePayWebhookUrl(config: Extract<SePayConfiguration, { ready: true }>) { return new URL("/api/payments/sepay/webhook", config.publicBaseUrl).toString(); }

export function getSePayQrUrl(input: { bank: string; accountNumber: string; accountName: string; amount: number; paymentCode: string }) {
  const url = new URL("https://vietqr.app/img");
  url.searchParams.set("acc", input.accountNumber);
  url.searchParams.set("bank", input.bank);
  url.searchParams.set("amount", String(input.amount));
  url.searchParams.set("des", input.paymentCode);
  url.searchParams.set("template", "compact");
  url.searchParams.set("showinfo", "true");
  url.searchParams.set("holder", input.accountName);
  return url.toString();
}

export function signSePayWebhook(rawBody: string, timestamp: string, secret: string) { return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")}`; }

export function verifySePayWebhook(rawBody: string, timestamp: string | null, signature: string | null, secret: string, now = Date.now()) {
  if (!timestamp || !signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const seconds = Number(timestamp);
  if (!Number.isSafeInteger(seconds) || Math.abs(now - seconds * 1000) > 5 * 60 * 1000) return false;
  const expected = signSePayWebhook(rawBody, timestamp, secret);
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
