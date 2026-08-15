import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: null as { user: { role: string } } | null,
  prisma: {} as object | null,
  listLeads: vi.fn(),
  getLead: vi.fn(),
  updateLead: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: vi.fn(async () => state.session) }));
vi.mock("@/lib/db", () => ({ getPrisma: vi.fn(() => state.prisma) }));
vi.mock("@/lib/admin-leads", () => ({
  isLeadAdmin: (role: string | undefined) => role === "ADMIN",
  parseLeadFilters: () => ({}),
  listLeads: state.listLeads,
  getLead: state.getLead,
  updateLead: state.updateLead,
}));

import { GET as listGET } from "@/app/api/admin/leads/route";
import { GET as detailGET, PATCH as detailPATCH } from "@/app/api/admin/leads/[id]/route";

const lead = {
  id: "lead-1",
  type: "CONSULTATION",
  status: "NEW",
  fullName: "Sentinel Customer",
  phone: "0900123456",
  email: "sentinel@example.com",
  organization: null,
  projectLocation: null,
  estimatedQuantity: null,
  productSlug: "america",
  message: "private message",
  source: "CONTACT_PAGE",
  internalNote: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function reset() {
  state.session = null;
  state.prisma = {};
  state.listLeads.mockReset();
  state.getLead.mockReset();
  state.updateLead.mockReset();
  state.listLeads.mockResolvedValue({ items: [lead], total: 1, page: 1, pageSize: 50 });
  state.getLead.mockResolvedValue(lead);
  state.updateLead.mockResolvedValue(lead);
}

describe("admin lead route authorization", () => {
  beforeEach(reset);

  for (const role of [null, "CUSTOMER", "EDITOR"] as const) {
    it(`blocks ${role ?? "anonymous"} list access without PII`, async () => {
      state.session = role ? { user: { role } } : null;
      const response = await listGET(new Request("http://localhost/api/admin/leads"));
      expect(response.status).toBe(role ? 403 : 401);
      expect(await response.text()).not.toContain("sentinel@example.com");
      expect(state.listLeads).not.toHaveBeenCalled();
    });

    it(`blocks ${role ?? "anonymous"} detail access without PII`, async () => {
      state.session = role ? { user: { role } } : null;
      const response = await detailGET(new Request("http://localhost/api/admin/leads/lead-1"), { params: Promise.resolve({ id: "lead-1" }) });
      expect(response.status).toBe(role ? 403 : 401);
      expect(await response.text()).not.toContain("sentinel@example.com");
      expect(state.getLead).not.toHaveBeenCalled();
    });

    it(`blocks ${role ?? "anonymous"} updates without PII`, async () => {
      state.session = role ? { user: { role } } : null;
      const response = await detailPATCH(new Request("http://localhost/api/admin/leads/lead-1", { method: "PATCH", body: JSON.stringify({ status: "CLOSED", internalNote: "x", updatedAt: lead.updatedAt.toISOString() }) }), { params: Promise.resolve({ id: "lead-1" }) });
      expect(response.status).toBe(role ? 403 : 401);
      expect(await response.text()).not.toContain("sentinel@example.com");
      expect(state.updateLead).not.toHaveBeenCalled();
    });
  }

  it("masks list contact fields and exposes full detail only to ADMIN", async () => {
    state.session = { user: { role: "ADMIN" } };
    const listResponse = await listGET(new Request("http://localhost/api/admin/leads"));
    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.items[0]).toMatchObject({ phone: "•••• 3456", email: "s***@example.com" });
    expect(JSON.stringify(listBody)).not.toContain("sentinel@example.com");

    const detailResponse = await detailGET(new Request("http://localhost/api/admin/leads/lead-1"), { params: Promise.resolve({ id: "lead-1" }) });
    expect(detailResponse.status).toBe(200);
    expect(await detailResponse.json()).toMatchObject({ phone: "0900123456", email: "sentinel@example.com", message: "private message" });

    const patchResponse = await detailPATCH(new Request("http://localhost/api/admin/leads/lead-1", { method: "PATCH", body: JSON.stringify({ status: "CLOSED", internalNote: "reviewed", updatedAt: lead.updatedAt.toISOString() }) }), { params: Promise.resolve({ id: "lead-1" }) });
    expect(patchResponse.status).toBe(200);
    expect(state.updateLead).toHaveBeenCalledOnce();
  });
});
