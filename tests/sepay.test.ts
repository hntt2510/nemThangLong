import { describe, expect, it } from "vitest";
import { sepayWebhookSchema } from "@/lib/api-validation";
import { extractSePayPaymentCode, getSePayConfiguration, getSePayQrUrl, getSePayTransactionId, getSePayWebhookUrl, signSePayWebhook, verifySePayWebhook } from "@/lib/sepay";

const secret = "s".repeat(32);
const environment = {
  NODE_ENV: "development", SEPAY_TEST_MODE: "true", SEPAY_WEBHOOK_SECRET: secret,
  SEPAY_TEST_BANK: "Vietcombank", SEPAY_TEST_ACCOUNT_NUMBER: "1234567890", SEPAY_TEST_ACCOUNT_NAME: "CONG TY TEST", SEPAY_PUBLIC_BASE_URL: "https://uat-example.trycloudflare.com",
};

describe("SePay Test Mode", () => {
  it("accepts a complete development configuration and builds the webhook URL", () => {
    const config = getSePayConfiguration(environment);
    expect(config.ready).toBe(true);
    if (!config.ready) return;
    expect(getSePayWebhookUrl(config)).toBe("https://uat-example.trycloudflare.com/api/payments/sepay/webhook");
  });

  it("never enables Test Mode outside development", () => {
    expect(getSePayConfiguration({ ...environment, NODE_ENV: "production" }).ready).toBe(false);
  });

  it("signs and verifies the exact raw webhook body with a fresh timestamp", () => {
    const timestamp = "1767225600";
    const raw = '{"id":1,"code":"NEMABC"}';
    const signature = signSePayWebhook(raw, timestamp, secret);
    expect(verifySePayWebhook(raw, timestamp, signature, secret, 1767225600_000)).toBe(true);
    expect(verifySePayWebhook(`${raw} `, timestamp, signature, secret, 1767225600_000)).toBe(false);
    expect(verifySePayWebhook(raw, timestamp, "sha256=" + "0".repeat(64), secret, 1767225600_000)).toBe(false);
    expect(verifySePayWebhook(raw, timestamp, signature, secret, 1767225901_000)).toBe(false);
  });

  it("creates a fixed VietQR URL with account, exact amount, and payment code", () => {
    const url = new URL(getSePayQrUrl({ bank: "Vietcombank", accountNumber: "1234567890", accountName: "CONG TY TEST", amount: 5_000_000, paymentCode: "NEMABC123" }));
    expect(url.origin).toBe("https://vietqr.app");
    expect(url.searchParams.get("acc")).toBe("1234567890");
    expect(url.searchParams.get("amount")).toBe("5000000");
    expect(url.searchParams.get("des")).toBe("NEMABC123");
  });

  it("accepts the observed Test Mode payload with an empty code", () => {
    const observed = { gateway: "MBBank", transactionDate: "2026-09-07 19:13:34", accountNumber: "0000000001", subAccount: "", code: "", content: "NEM0F393B5699F3", transferType: "in", description: "NEM0F393B5699F3", transferAmount: 6_700_000 };
    expect(sepayWebhookSchema.safeParse(observed).success).toBe(true);
    expect(extractSePayPaymentCode(observed.code, observed.content, observed.description)).toBe("NEM0F393B5699F3");
    const rawBody = JSON.stringify(observed);
    expect(getSePayTransactionId(observed, rawBody)).toMatch(/^sepay:payload:/);
    expect(getSePayTransactionId(observed, rawBody)).toBe(getSePayTransactionId(observed, rawBody));
  });

  it("uses a non-empty code first, then content and description", () => {
    expect(extractSePayPaymentCode("NEMABCDEF123456", "NEM0F393B5699F3", null)).toBe("NEMABCDEF123456");
    expect(extractSePayPaymentCode(undefined, "Thanh toan NEM0F393B5699F3", null)).toBe("NEM0F393B5699F3");
    expect(extractSePayPaymentCode(undefined, undefined, "NEM0F393B5699F3")).toBe("NEM0F393B5699F3");
    expect(extractSePayPaymentCode("not-a-code", "prefixNEM0F393B5699F3suffix", null)).toBeNull();
  });

  it("allows omitted optional Test Mode fields but rejects malformed payment fields", () => {
    const base = { gateway: "MBBank", accountNumber: "0000000001", content: "NEM0F393B5699F3", transferType: "in", transferAmount: 100_000 };
    expect(sepayWebhookSchema.safeParse(base).success).toBe(true);
    expect(sepayWebhookSchema.safeParse({ ...base, transferType: "other" }).success).toBe(false);
    expect(sepayWebhookSchema.safeParse({ ...base, transferAmount: 0 }).success).toBe(false);
    expect(sepayWebhookSchema.safeParse({ transferType: "in", transferAmount: 100_000 }).success).toBe(false);
  });
});
