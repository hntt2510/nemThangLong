import { describe, it, expect } from "vitest";
import { SITE_CONFIG } from "@/config/site-config";
import { createZaloOrderLink, getHotlineTelLink, getSupportMailtoLink } from "@/lib/utils/contact-helpers";

describe("Centralized SITE_CONFIG & Contact Helpers", () => {
  it("defines immutable frozen brand configuration", () => {
    expect(SITE_CONFIG.brand.name).toBe("Nệm Thăng Long");
    expect(SITE_CONFIG.brand.slogan).toBe("Giấc Ngủ Việt - Nâng Đỡ Cột Sống");
    expect(SITE_CONFIG.brand.legalName).toBe("Công ty TNHH Nệm Thăng Long Việt Nam");
    expect(SITE_CONFIG.brand.domain).toBeDefined();
  });

  it("defines centralized contact details with official hotline 0911 251 004", () => {
    expect(SITE_CONFIG.contact.hotlineRaw).toBe("0911251004");
    expect(SITE_CONFIG.contact.hotlineDisplay).toBe("0911 251 004");
    expect(SITE_CONFIG.contact.zaloPhone).toBe("0911251004");
    expect(SITE_CONFIG.contact.zaloLink).toBe("https://zalo.me/0911251004");
    expect(SITE_CONFIG.contact.supportEmail).toBe("nemthanglong@gmail.com");
    expect(SITE_CONFIG.contact.workHours).toBe("07:30 - 21:00 (Mở cửa tất cả các ngày trong tuần)");
    expect(SITE_CONFIG.contact.addressMain).toContain("Trảng Bom, Đồng Nai");
  });

  it("defines customer policies consistently", () => {
    expect(SITE_CONFIG.policies.sleepTrialNights).toBe(100);
    expect(SITE_CONFIG.policies.minWarrantyYears).toBe(10);
    expect(SITE_CONFIG.policies.maxWarrantyYears).toBe(15);
    expect(SITE_CONFIG.policies.freeDeliveryText.toLowerCase()).toContain("miễn phí");
  });

  it("defines pricing tier thresholds correctly", () => {
    expect(SITE_CONFIG.pricingTiers.budgetMax).toBe(8000000);
    expect(SITE_CONFIG.pricingTiers.midMax).toBe(14000000);
    expect(SITE_CONFIG.pricingTiers.luxuryMin).toBe(14000000);
  });

  it("generates correct hotline tel: link with sanitized digits", () => {
    expect(getHotlineTelLink()).toBe("tel:0911251004");
  });

  it("generates correct support mailto: link", () => {
    expect(getSupportMailtoLink()).toBe("mailto:nemthanglong@gmail.com");
  });

  it("creates valid Zalo order confirmation link with URI encoded parameters", () => {
    const url = createZaloOrderLink("NTL-888888", "Nguyễn Văn A", "Nệm Classic 1m6");
    expect(url).toContain("https://zalo.me/0911251004?text=");
    expect(decodeURIComponent(url)).toContain("NTL-888888");
    expect(decodeURIComponent(url)).toContain("Nguyễn Văn A");
    expect(decodeURIComponent(url)).toContain("Nệm Classic 1m6");
  });
});
