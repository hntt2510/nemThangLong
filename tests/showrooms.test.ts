import { describe, expect, it } from "vitest";
import {
  SHOWROOMS_DATA,
  calculateHaversineDistanceKm,
  getGoogleMapsDirectionsUrl,
  sanitizePhoneForTel,
} from "@/lib/showrooms";

describe("Showrooms data and geolocation utilities", () => {
  it("has exactly 7 verified showrooms with valid coordinates", () => {
    expect(SHOWROOMS_DATA).toHaveLength(7);
    SHOWROOMS_DATA.forEach((s) => {
      expect(s.lat).toBeGreaterThan(10);
      expect(s.lat).toBeLessThan(12);
      expect(s.lng).toBeGreaterThan(105);
      expect(s.lng).toBeLessThan(108);
      expect(s.latitude).toBe(s.lat);
      expect(s.longitude).toBe(s.lng);
      expect(s.address.length).toBeGreaterThan(15);
      expect(s.phone).toBe("0911 251 004");
    });
  });

  it("calculates 0 km distance between identical points", () => {
    const dist = calculateHaversineDistanceKm(10.9575, 106.9142, 10.9575, 106.9142);
    expect(dist).toBe(0);
  });

  it("calculates realistic distance between HCMC center and Trang Bom", () => {
    // HCMC center ~ 10.7769, 106.7009; Trang Bom: 10.9575, 106.9142
    const dist = calculateHaversineDistanceKm(10.7769, 106.7009, 10.9575, 106.9142);
    expect(dist).toBeGreaterThan(25);
    expect(dist).toBeLessThan(40);
  });

  it("generates 1-tap Google Maps directions link with encoded address", () => {
    const address = "18/2 Ấp Thanh Hoá, Xã Hố Nai 3, Huyện Trảng Bom, Đồng Nai";
    const url = getGoogleMapsDirectionsUrl(address);
    expect(url).toContain("https://www.google.com/maps/dir/?api=1&destination=");
    expect(url).toContain(encodeURIComponent(address));
  });

  it("sanitizes hotline phone number for tel: protocol", () => {
    expect(sanitizePhoneForTel("0911 251 004")).toBe("0911251004");
    expect(sanitizePhoneForTel("+84 911 251 004")).toBe("+84911251004");
  });
});
