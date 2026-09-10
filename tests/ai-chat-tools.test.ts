import { describe, expect, it } from "vitest";
import {
  parseWidthFromString,
  parseThicknessFromString,
  executeCatalogOrShowroomsQuery,
  executeCreateDraftOrder,
  HCM_HOTLINE,
  HCM_HOTLINE_DISPLAY
} from "@/lib/ai-assistant-tools";
import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";
import {
  generateLuxuryOrderEmailHtml,
  sendOrderReceiptEmail,
  sendOrderConfirmationEmail,
  OFFICIAL_HOTLINE_DISPLAY
} from "@/lib/email-service";

describe("AI Assistant Tools & Anti-Fraud Verification Gate", () => {
  describe("Dimension & Thickness Parser", () => {
    it("correctly parses mattress widths", () => {
      expect(parseWidthFromString("1m8x2m")).toBe(180);
      expect(parseWidthFromString("180x200")).toBe(180);
      expect(parseWidthFromString("1m6x2m")).toBe(160);
      expect(parseWidthFromString("160cm")).toBe(160);
      expect(parseWidthFromString("1m4x2m")).toBe(140);
      expect(parseWidthFromString("1m2x2m")).toBe(120);
      expect(parseWidthFromString("1m0x2m")).toBe(100);
      expect(parseWidthFromString("1m x 2m")).toBe(100);
      expect(parseWidthFromString(undefined)).toBe(160);
    });

    it("correctly parses mattress thickness options", () => {
      expect(parseThicknessFromString("10cm")).toBe(10);
      expect(parseThicknessFromString("15cm")).toBe(15);
      expect(parseThicknessFromString("20cm")).toBe(20);
      expect(parseThicknessFromString("dày 15")).toBe(15);
      expect(parseThicknessFromString("20 phân")).toBe(20);
      expect(parseThicknessFromString(undefined)).toBe(10);
    });
  });

  describe("executeCatalogOrShowroomsQuery", () => {
    it("returns verified showrooms with google maps directions and hotline", async () => {
      const result = await executeCatalogOrShowroomsQuery({
        queryType: "showroom_locator"
      });

      expect(result.totalShowrooms).toBe(7);
      expect(result.hotline).toBe(HCM_HOTLINE_DISPLAY);
      expect(result.showrooms).toBeDefined();
      expect(result.showrooms?.length).toBe(7);

      const first = result.showrooms![0];
      expect(first.name).toBeDefined();
      expect(first.directionsUrl).toContain("https://www.google.com/maps/dir/?api=1&destination=");
    });

    it("filters showrooms by province", async () => {
      const result = await executeCatalogOrShowroomsQuery({
        queryType: "showroom_locator",
        province: "Tây Ninh"
      });

      expect(result.totalShowrooms).toBeGreaterThanOrEqual(1);
      result.showrooms?.forEach((s) => {
        expect(s.province.toLowerCase()).toContain("tây ninh");
      });
    });

    it("returns technical specifications for a product", async () => {
      const spec = await executeCatalogOrShowroomsQuery({
        queryType: "product_specs",
        productSlug: "classic"
      });

      expect(spec.productSlug).toBe("classic");
      expect(spec.brand).toBeDefined();
      expect(spec.coreMaterial).toBeDefined();
      expect(spec.warrantyYears).toBeGreaterThanOrEqual(10);
      expect(spec.firmnessIndex).toBeDefined();
      expect(spec.certifications).toBeInstanceOf(Array);
    });

    it("performs dynamic price lookup with formatted currency and dimension", async () => {
      const priceInfo = await executeCatalogOrShowroomsQuery({
        queryType: "price_lookup",
        productSlug: "classic",
        dimension: "1m6x2m",
        thickness: "10cm"
      });

      expect(priceInfo.width).toBe(160);
      expect(priceInfo.thickness).toBe(10);
      expect(priceInfo.unitPrice).toBeGreaterThan(0);
      expect(priceInfo.formattedPrice).toContain("₫");
      expect(priceInfo.sku).toContain("NTL-CLASSIC-160X200-10");
      expect(priceInfo.inStock).toBe(true);
    });
  });

  describe("executeCreateDraftOrder & Anti-Fraud 1-Tap Zalo Verification Gate", () => {
    it("rejects order creation if phone number is invalid", async () => {
      await expect(
        executeCreateDraftOrder({
          customerName: "Nguyễn Văn A",
          phoneNumber: "12345", // invalid phone
          customerEmail: "valid@email.com",
          shippingAddress: "123 Biên Hòa, Đồng Nai",
          productSlug: "classic",
          productName: "Nệm Thăng Long Classic",
          dimension: "1m6x2m",
          thickness: "10cm"
        })
      ).rejects.toThrow("Số điện thoại không hợp lệ");
    });

    it("rejects order creation if email is invalid or missing", async () => {
      await expect(
        executeCreateDraftOrder({
          customerName: "Nguyễn Văn A",
          phoneNumber: "0911251004",
          customerEmail: "not-an-email", // invalid email
          shippingAddress: "123 Biên Hòa, Đồng Nai",
          productSlug: "classic",
          productName: "Nệm Thăng Long Classic",
          dimension: "1m6x2m",
          thickness: "10cm"
        })
      ).rejects.toThrow("Email không hợp lệ");
    });

    it("creates draft order with NTL- code and formatted Zalo deep link", async () => {
      const result = await executeCreateDraftOrder({
        customerName: "Trần Thị B",
        phoneNumber: "0911251004",
        customerEmail: "tranthib@gmail.com",
        shippingAddress: "Số 45 Đường 30/4, P. Trung Dũng, TP. Biên Hòa, Đồng Nai",
        productSlug: "classic",
        productName: "Nệm Cao Su Thăng Long Classic",
        dimension: "1m8x2m",
        thickness: "15cm",
        quantity: 1,
        notes: "Giao sau 17h chiều"
      });

      expect(result.success).toBe(true);
      expect(result.orderCode).toMatch(/^NTL-\d{6}$/);
      expect(result.verificationStatus).toBe("PENDING_ZALO_VERIFICATION");
      expect(result.customerEmail).toBe("tranthib@gmail.com");
      expect(result.phoneNumber).toBe("0911251004");
      expect(result.dimension).toBe("180x200cm");
      expect(result.thickness).toBe("15cm");
      expect(result.totalAmount).toBeGreaterThan(0);
      expect(result.formattedTotalAmount).toContain("₫");

      // Verify 1-Tap Zalo URL format
      expect(result.zaloUrl).toContain(`https://zalo.me/${HCM_HOTLINE}?text=`);
      const decodedZaloText = decodeURIComponent(result.zaloUrl);
      expect(decodedZaloText).toContain("Xác nhận đơn hàng Nệm Thắng Long");
      expect(decodedZaloText).toContain(result.orderCode);
      expect(decodedZaloText).toContain("Trần Thị B");
      expect(decodedZaloText).toContain("0911251004");
      expect(decodedZaloText).toContain("tranthib@gmail.com");
      expect(decodedZaloText).toContain("180x200cm, độ dày 15cm");
    });
  });

  describe("Next.js /api/chat Fallback Mode", () => {
    it("handles showroom questions with verified addresses and directions", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Cho tôi xin địa chỉ showroom ở Đồng Nai với" }]
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.message).toBeDefined();
      expect(json.message).toContain("showroom");
      expect(json.message).toContain("Google Maps");
      expect(json.message).toContain(HCM_HOTLINE_DISPLAY);
      expect(json.orderCard).toBeNull();
    });

    it("handles price lookup requests accurately", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Nệm Classic 1m6x2m dày 10cm giá bao nhiêu tiền?" }]
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.message).toContain("CLASSIC");
      expect(json.message).toContain("160cm");
      expect(json.message).toContain("10cm");
      expect(json.message).toContain("₫");
      expect(json.orderCard).toBeNull();
    });

    it("prompts for missing phone & email when customer wants to order", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Tôi muốn đặt nệm 1m6 giao đến nhà" }]
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.message).toContain("Số điện thoại");
      expect(json.message).toContain("email");
      expect(json.orderCard).toBeNull();
    });

    it("generates draft order card when phone and email are provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Tôi muốn mua nệm classic 1m6 dày 10cm, sdt 0911251004, email test@gmail.com, giao về Biên Hòa"
            }
          ]
        })
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.message).toContain("NTL-");
      expect(json.message).toContain("Zalo");
      expect(json.orderCard).toBeDefined();
      expect(json.orderCard?.orderCode).toMatch(/^NTL-\d{6}$/);
      expect(json.orderCard?.phoneNumber).toBe("0911251004");
      expect(json.orderCard?.customerEmail).toBe("test@gmail.com");
      expect(json.orderCard?.verificationStatus).toBe("PENDING_ZALO_VERIFICATION");
      expect(json.orderCard?.zaloUrl).toContain("https://zalo.me/0911251004");
    });
  });

  describe("Luxury Order Confirmation Email Template", () => {
    const mockPayload = {
      orderCode: "NTL-686868",
      customerName: "Lê Hoàng Yến",
      customerEmail: "hoangyen@gmail.com",
      phoneNumber: "0911251004",
      shippingAddress: "123 Võ Thị Sáu, P. Thống Nhất, TP. Biên Hòa, Đồng Nai",
      productName: "Nệm Cao Su Thăng Long Classic",
      dimension: "180x200cm",
      thickness: "15cm",
      quantity: 1,
      totalPrice: 8500000,
      zaloUrl: "https://zalo.me/0911251004?text=Xac%20nhan%20don%20hang%20NTL-686868"
    };

    it("renders Quiet Luxury design tokens, amber status badge, and order summary table", () => {
      const html = generateLuxuryOrderEmailHtml(mockPayload);

      // Design tokens: Linen Off-White & Palette
      expect(html).toContain("#FAF9F6"); // Linen Off-White
      expect(html).toContain("#1A2530"); // Charcoal Slate
      expect(html).toContain("#736E65"); // Muted warm grey
      expect(html).toContain("#E8E4DA"); // Subtle border

      // Header: Brand logo / Name
      expect(html).toContain("NỆM THĂNG LONG - GIẤC NGỦ VIỆT");

      // Status Badge: Amber
      expect(html).toContain("ĐƠN HÀNG ĐANG CHỜ XÁC NHẬN ZALO");
      expect(html).toContain("#FFFBEB");
      expect(html).toContain("#92400E");

      // Order Summary Table
      expect(html).toContain("NTL-686868");
      expect(html).toContain("Nệm Cao Su Thăng Long Classic");
      expect(html).toContain("180x200cm");
      expect(html).toContain("15cm");
      expect(html).toContain("Lê Hoàng Yến");
      expect(html).toContain("0911251004");
      expect(html).toContain("hoangyen@gmail.com");
      expect(html).toContain("123 Võ Thị Sáu, P. Thống Nhất, TP. Biên Hòa, Đồng Nai");

      // Direct CTA Button
      expect(html).toContain("Bấm Vào Đây Để Xác Nhận Qua Zalo");
      expect(html).toContain("https://zalo.me/0911251004?text=Xac%20nhan%20don%20hang%20NTL-686868");

      // Warranty & Guarantee Footer
      expect(html).toContain("BẢO HÀNH 10 - 15 NĂM");
      expect(html).toContain("100 ĐÊM NẰM THỬ");
      expect(html).toContain("GIAO TẬN PHÒNG");
      expect(html).toContain("0911 251 004");
      expect(html).toContain(OFFICIAL_HOTLINE_DISPLAY);
    });

    it("executes sendOrderReceiptEmail successfully with development fallback", async () => {
      const result = await sendOrderReceiptEmail(mockPayload);
      expect(result).toBe(true);
    });

    it("verifies sendOrderConfirmationEmail is an alias to sendOrderReceiptEmail", async () => {
      expect(sendOrderConfirmationEmail).toBe(sendOrderReceiptEmail);
    });
  });
});
