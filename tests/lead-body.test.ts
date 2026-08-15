import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  prisma: {} as object | null,
  createPublicLead: vi.fn(),
  LeadDatabaseError: class extends Error {},
  LeadRateLimitError: class extends Error {},
  LeadValidationError: class extends Error {},
}));

vi.mock("@/lib/db", () => ({ getPrisma: vi.fn(() => state.prisma) }));
vi.mock("@/lib/leads", () => ({
  createPublicLead: state.createPublicLead,
  LeadDatabaseError: state.LeadDatabaseError,
  LeadRateLimitError: state.LeadRateLimitError,
  LeadValidationError: state.LeadValidationError,
}));

import { POST } from "@/app/api/leads/route";

const body = JSON.stringify({ type: "CONSULTATION", fullName: "Body Test", phone: "0900000000" });

function requestWithBody(value: BodyInit, headers: HeadersInit = { "content-type": "application/json" }) {
  return new Request("http://localhost/api/leads", { method: "POST", body: value, headers });
}

describe("lead request body limits", () => {
  beforeEach(() => {
    state.prisma = {};
    state.createPublicLead.mockReset().mockResolvedValue({ id: "lead-1" });
  });

  it("rejects an explicit oversized Content-Length before reading", async () => {
    const response = await POST(requestWithBody(body, { "content-type": "application/json", "content-length": "20000" }));
    expect(response.status).toBe(413);
    expect(state.createPublicLead).not.toHaveBeenCalled();
  });

  it("rejects an oversized chunked body and cancels the stream", async () => {
    let cancelled = false;
    let chunk = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (chunk === 0) controller.enqueue(new TextEncoder().encode("x".repeat(16 * 1024)));
        else if (chunk === 1) controller.enqueue(new TextEncoder().encode("overflow"));
        else controller.close();
        chunk += 1;
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request("http://localhost/api/leads", { method: "POST", body: stream, headers: { "content-type": "application/json" }, duplex: "half" } as RequestInit & { duplex: "half" });
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(cancelled).toBe(true);
    expect(state.createPublicLead).not.toHaveBeenCalled();
  });

  it("accepts a body within the byte cap", async () => {
    const response = await POST(requestWithBody(body));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(state.createPublicLead).toHaveBeenCalledOnce();
  });

  it("accepts honeypot submissions without touching persistence", async () => {
    const response = await POST(requestWithBody(JSON.stringify({ type: "CONSULTATION", fullName: "Bot", phone: "0900000000", website: "https://bot.invalid" })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(state.createPublicLead).not.toHaveBeenCalled();
  });
});
