import { describe, expect, it } from "vitest";
import { resolvePdpCta } from "@/lib/product-cta";

describe("resolvePdpCta", () => {
  it("returns purchase action when canPurchase is true regardless of contactHref", () => {
    const cta = resolvePdpCta(true, "tel:0900000000");
    expect(cta).toEqual({
      type: "purchase",
      label: "Mua ngay",
    });
  });

  it("returns native tel link when canPurchase is false and contactHref is a tel URI", () => {
    const cta = resolvePdpCta(false, "tel:0901234567");
    expect(cta).toEqual({
      type: "contact",
      label: "Tư vấn",
      href: "tel:0901234567",
    });
  });

  it("returns native mailto link when canPurchase is false and contactHref is a mailto URI", () => {
    const cta = resolvePdpCta(false, "mailto:support@nemthanglong.vn");
    expect(cta).toEqual({
      type: "contact",
      label: "Tư vấn",
      href: "mailto:support@nemthanglong.vn",
    });
  });

  it("returns internal contact page link when canPurchase is false and contactHref is a relative route", () => {
    const cta = resolvePdpCta(false, "/lien-he?product=america");
    expect(cta).toEqual({
      type: "contact",
      label: "Tư vấn",
      href: "/lien-he?product=america",
    });
  });

  it("returns disabled state without broken navigation when contactHref is null or empty", () => {
    const nullCta = resolvePdpCta(false, null);
    expect(nullCta).toEqual({
      type: "disabled",
      label: "Liên hệ",
    });

    const emptyCta = resolvePdpCta(false, "   ");
    expect(emptyCta).toEqual({
      type: "disabled",
      label: "Liên hệ",
    });
  });

  it("respects custom labels for luxury or custom PDPs", () => {
    const cta = resolvePdpCta(false, "/lien-he?product=luxury", {
      contact: "Liên hệ tư vấn",
      purchase: "Đặt mua",
      disabled: "Tạm ngưng",
    });
    expect(cta).toEqual({
      type: "contact",
      label: "Liên hệ tư vấn",
      href: "/lien-he?product=luxury",
    });
  });
});
