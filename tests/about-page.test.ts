import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AboutCoreValues } from "@/components/about/about-core-values";
import { AboutCraftStory } from "@/components/about/about-craft-story";
import { AboutFeaturedCollections } from "@/components/about/about-featured-collections";
import { AboutHero } from "@/components/about/about-hero";
import { AboutShowroomCTA } from "@/components/about/about-showroom-cta";
import { AboutTestimonials } from "@/components/about/about-testimonials";
import { AboutTrustStats } from "@/components/about/about-trust-stats";

describe("AboutPage (/ve-thang-long) brand redesign components", () => {
  it("renders AboutHero with contrast-compliant CTA buttons and 3D tilt label", () => {
    const markup = renderToStaticMarkup(createElement(AboutHero));
    expect(markup).toContain("Tìm nệm cho gia đình bạn →");
    expect(markup).toContain("bg-[#1E3A5F]");
    expect(markup).toContain("text-white");
    expect(markup).toContain("100% Nguyên liệu an toàn");
    expect(markup).toContain("✨");
    expect(markup).toContain("VỀ THĂNG LONG");
    expect(markup).toContain("benefit-family-comfort.png");
  });

  it("renders AboutTrustStats with 4 upgraded metrics", () => {
    const markup = renderToStaticMarkup(createElement(AboutTrustStats));
    expect(markup).toContain("Năm đồng hành cùng giấc ngủ Việt");
    expect(markup).toContain("Gia đình tin dùng sản phẩm Thăng Long");
    expect(markup).toContain("Điểm tư vấn &amp; đại lý trên toàn quốc");
    expect(markup).toContain("Mức đánh giá hài lòng từ khách hàng");
    expect(markup).toContain("bg-gradient-to-b from-slate-900 to-[#16273e]");
    expect(markup).toContain("text-[#D4A373]");
  });

  it("renders AboutCoreValues with the 3 interactive craft pillars", () => {
    const markup = renderToStaticMarkup(createElement(AboutCoreValues));
    expect(markup).toContain("Chất lượng từ tâm xưởng");
    expect(markup).toContain("Nâng đỡ công thái học");
    expect(markup).toContain("Đồng hành trọn vòng đời");
    expect(markup).toContain("Bảo hành 10 - 15 năm");
  });

  it("renders AboutCraftStory with distinct craftsmanship image", () => {
    const markup = renderToStaticMarkup(createElement(AboutCraftStory));
    expect(markup).toContain("Bền bỉ từ kết cấu, nâng niu từng giấc say.");
    expect(markup).toContain("TÂM HUYẾT NGHỀ NỆM");
    expect(markup).toContain("homepage-construction.png");
  });

  it("renders AboutFeaturedCollections with 3 target mattress cards and badges", () => {
    const markup = renderToStaticMarkup(createElement(AboutFeaturedCollections, { products: [] }));
    expect(markup).toContain("Nệm Thăng Long Classic");
    expect(markup).toContain("Cao su thiên nhiên 3/4");
    expect(markup).toContain("Thăng Long Hoạt Tính");
    expect(markup).toContain("Bán chạy nhất");
    expect(markup).toContain("Cao su tự nhiên");
    expect(markup).toContain("Kháng khuẩn than hoạt tính");
    expect(markup).toContain("Xem chi tiết →");
  });

  it("renders AboutShowroomCTA with interactive locator, 7 showrooms and Google Maps directions", () => {
    const markup = renderToStaticMarkup(
      createElement(AboutShowroomCTA, { contactPhone: "0911 251 004", contactHref: "/lien-he" })
    );
    expect(markup).toContain("Trải nghiệm 100 đêm thử nệm tại 7 showroom Nệm Thăng Long");
    expect(markup).toContain("landing-showroom-v2.png");
    expect(markup).toContain("Hệ thống 7 Chi Nhánh");
    expect(markup).toContain("Trảng Bom");
    expect(markup).toContain("Thống Nhất");
    expect(markup).toContain("Hoà Thành");
    expect(markup).toContain("Trảng Bàng");
    expect(markup).toContain("Bình Long");
    expect(markup).toContain("Đức Hòa");
    expect(markup).toContain("Long Thành");
    expect(markup).toContain("Chỉ đường Google Maps");
    expect(markup).toContain("0911 251 004");
  });

  it("renders AboutTestimonials with verified customer reviews", () => {
    const markup = renderToStaticMarkup(createElement(AboutTestimonials));
    expect(markup).toContain("Chị Thanh Hà");
    expect(markup).toContain("Anh Minh Quân");
    expect(markup).toContain("Chị Bích Ngọc");
  });
});
