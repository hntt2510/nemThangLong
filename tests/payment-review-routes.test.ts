import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null, prisma: {} as object | null, list: vi.fn(), get: vi.fn(), resolve: vi.fn() }));
vi.mock("@/auth", () => ({ auth: vi.fn(async () => state.session) }));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn(() => state.prisma) }));
vi.mock("@/lib/admin-auth", () => ({ isAdmin: (session: { user?: { role?: string } } | null) => session?.user?.role === "ADMIN" }));
vi.mock("@/lib/payment-review", () => ({ listPaymentReviews: state.list, getPaymentReview: state.get, resolvePaymentReview: state.resolve }));

import { GET as listGET } from "@/app/api/admin/payment-reviews/route";
import { GET as detailGET, PATCH as detailPATCH } from "@/app/api/admin/payment-reviews/[id]/route";

const detail = { id: "order-1", code: "TL-1", total: 100, status: "CANCELLED", paymentStatus: "REVIEW_REQUIRED", customerName: "Sentinel", customerPhone: "0900000000", guestEmail: "sentinel@example.com", createdAt: new Date(), items: [], payments: [{ id: "attempt-1", status: "REVIEW_REQUIRED", amount: 100, providerTransactionId: "tx-1", expiresAt: new Date(), updatedAt: new Date() }], reservations: [] };

beforeEach(() => { state.session = null; state.prisma = {}; state.list.mockReset().mockResolvedValue([{ ...detail, customerPhone: "090***00", guestEmail: "s***@example.com" }]); state.get.mockReset().mockResolvedValue(detail); state.resolve.mockReset().mockResolvedValue({ id: "resolution-1", action: "FULFILL", createdAt: new Date() }); });

describe("payment review route authorization and projection", () => {
  for (const role of [null, "CUSTOMER", "EDITOR"] as const) {
    it(`blocks ${role ?? "anonymous"} list/detail/update access`, async () => {
      state.session = role ? { user: { id: "u", role } } : null;
      expect((await listGET()).status).toBe(role ? 403 : 401);
      expect((await detailGET(new Request("http://localhost"), { params: Promise.resolve({ id: "order-1" }) })).status).toBe(role ? 403 : 401);
      expect((await detailPATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ action: "FULFILL" }) }), { params: Promise.resolve({ id: "order-1" }) })).status).toBe(role ? 403 : 401);
      expect(state.list).not.toHaveBeenCalled(); expect(state.get).not.toHaveBeenCalled(); expect(state.resolve).not.toHaveBeenCalled();
    });
  }

  it("allows ADMIN and never serializes raw payment response or credentials", async () => {
    state.session = { user: { id: "admin", role: "ADMIN" } };
    const listResponse = await listGET(); expect(listResponse.status).toBe(200); const listBody = await listResponse.json(); expect(JSON.stringify(listBody)).not.toContain("sentinel@example.com"); expect(JSON.stringify(listBody)).not.toContain("rawResponse");
    const detailResponse = await detailGET(new Request("http://localhost"), { params: Promise.resolve({ id: "order-1" }) }); expect(detailResponse.status).toBe(200); const detailBody = await detailResponse.json(); expect(detailBody.guestEmail).toBe("sentinel@example.com"); expect(JSON.stringify(detailBody)).not.toContain("rawResponse"); expect(JSON.stringify(detailBody)).not.toContain("MOMO_SECRET_KEY");
    expect((await detailPATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ action: "FULFILL" }) }), { params: Promise.resolve({ id: "order-1" }) })).status).toBe(200);
  });
});
