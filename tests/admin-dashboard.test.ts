import { describe, expect, it } from "vitest";
import { parseDashboardRange } from "@/lib/admin-dashboard";
import { authStatus } from "@/lib/admin-auth";

describe("admin dashboard", () => {
  it("sanitizes the operational time window", () => {
    expect(parseDashboardRange("30d")).toBe("30d");
    expect(parseDashboardRange("90d")).toBe("7d");
    expect(parseDashboardRange(undefined)).toBe("7d");
  });

  it("keeps dashboard and order authorization explicit", () => {
    expect(authStatus(null, ["ADMIN"])).toBe(401);
    expect(authStatus({ user: { id: "u", role: "CUSTOMER" } } as never, ["ADMIN"])).toBe(403);
    expect(authStatus({ user: { id: "u", role: "ADMIN" } } as never, ["ADMIN"])).toBe(200);
    expect(authStatus({ user: { id: "u", role: "EDITOR" } } as never, ["ADMIN", "EDITOR"])).toBe(200);
  });
});
