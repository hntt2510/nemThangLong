import Image from "next/image";
import Link from "next/link";
import { GenericProductPurchase } from "@/components/generic-product-purchase";
import { ProductCard } from "@/components/product-card";
import { MattressLayerExploder } from "@/components/mattress-layer-exploder";
import { ProductSpecGrid } from "@/components/product-spec-grid";
import type { CatalogProductSummary } from "@/lib/catalog";
import { catalogBreadcrumbs, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import type { Product } from "@/lib/types";
import { isDemoMedia, mediaAlt } from "@/lib/product-media";
import { ProductReviews } from "@/components/product-rating";
import {
  ArrowRight,
  Scale,
  Sparkles,
  Award,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ChevronRight,
} from "lucide-react";

type ProductSettings = { contactPhone?: string | null; contactEmail?: string | null } | null;

function jsonLdScript(value: unknown) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
    />
  );
}

export function GenericProductPdp({
  product,
  related,
  settings,
}: {
  product: Product;
  related: CatalogProductSummary[];
  settings: ProductSettings;
}) {
  const directContactHref = settings?.contactPhone
    ? "tel:" + settings.contactPhone
    : settings?.contactEmail
    ? "mailto:" + settings.contactEmail
    : null;
  const consultationHref = ("/lien-he?product=" + encodeURIComponent(product.slug)) as never;
  const breadcrumbs = catalogBreadcrumbs(product.slug, product.name);
  const productSchema = productJsonLd(product, "/nem/" + product.slug);
  const audience =
    product.content?.audience?.published && product.content.audience.title && product.content.audience.body
      ? product.content.audience
      : null;
  const materialStory =
    product.content?.materialStory?.published && product.content.materialStory.title && product.content.materialStory.body
      ? product.content.materialStory
      : null;
  const secondaryMedia = product.media[1] ?? product.media[0];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-stone-900">
      {jsonLdScript(breadcrumbJsonLd(breadcrumbs))}
      {productSchema && jsonLdScript(productSchema)}

      <main className="pb-24">
        {/* Breadcrumb Navigation */}
        <nav
          className="mx-auto flex w-[min(calc(100%-40px),1280px)] items-center gap-2 pt-6 text-xs sm:text-sm text-stone-500 md:w-[min(calc(100%-64px),1280px)]"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.item} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-stone-300">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span aria-current="page" className="font-semibold text-stone-900">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.item as never} className="hover:text-stone-900 transition-colors">
                  {crumb.name}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* 12-Col Interactive Gallery & Configurator */}
        <GenericProductPurchase product={product} contactHref={consultationHref} />

        {/* Comparison Shortcut Strip */}
        <div className="mx-auto mt-6 w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-stone-200/80 bg-white px-6 py-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                <Scale className="size-4 text-[#C5A880]" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-800">
                Phân vân giữa {product.name} và các dòng nệm khác trong cùng phân khúc?
              </p>
            </div>
            <Link
              href={("/so-sanh?items=" + encodeURIComponent(product.slug)) as never}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1E3A5F] hover:text-[#152843] transition-colors shrink-0"
            >
              <span>So sánh thông số kỹ thuật</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Standalone Deep 3D Exploded Layer Section (Below the Fold) */}
        <MattressLayerExploder
          productSlug={product.slug}
          title={`Bóc Tách Kỹ Thuật Đa Tầng: ${product.name}`}
          subtitle={`Khám phá giải pháp công thái học và vật liệu độc quyền trên dòng ${product.name}`}
        />

        {/* Audience Fit Section (Phù hợp với ai) */}
        {audience && (
          <section className="mx-auto mt-16 w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs grid lg:grid-cols-12 lg:items-center">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:col-span-6 bg-stone-100 min-h-[320px]">
                {secondaryMedia && (
                  <Image
                    src={secondaryMedia.url}
                    alt={mediaAlt(product, secondaryMedia)}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    style={{ objectFit: secondaryMedia.fit ?? "cover" }}
                  />
                )}
                {secondaryMedia && isDemoMedia(product, secondaryMedia) && (
                  <span className="absolute top-4 left-4 rounded-md bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">
                    Hình ảnh minh họa
                  </span>
                )}
              </div>

              <div className="p-8 sm:p-12 lg:col-span-6 flex flex-col justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#C5A880]">
                  <Sparkles className="size-3.5" /> Khuyến nghị chuyên gia
                </span>
                <h2 className="mt-3 font-brand-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                  {audience.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-600">
                  {audience.body}
                </p>

                <div className="mt-6 space-y-2 border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-700">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Nâng đỡ chuẩn đường cong thắt lưng, ngăn đau mỏi sau khi thức giấc.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-700">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Vật liệu an toàn với hệ hô hấp và da nhạy cảm trẻ nhỏ, người cao tuổi.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Master Luxury Specification Bento Grid (Replaces disjointed headers and sparse tables) */}
        <ProductSpecGrid productSlug={product.slug} />

        {/* Product Reviews */}
        <div className="mx-auto mt-16 w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
          <ProductReviews reviews={product.reviews} />
        </div>

        {/* Related Mattresses */}
        <section className="mx-auto mt-16 w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
          <div className="flex items-end justify-between border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
                KHÁM PHÁ THÊM
              </p>
              <h2 className="mt-1 font-brand-display text-2xl sm:text-3xl font-bold text-stone-900">
                Các dòng nệm cùng phân khúc
              </h2>
            </div>
            <Link
              href="/nem"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1E3A5F] hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {related.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {related.map((item, index) => (
                <ProductCard key={item.slug} product={item} index={index} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-stone-500">Các lựa chọn liên quan đang được cập nhật.</p>
          )}
        </section>

        {/* Bottom Consultation Strip */}
        <section className="mx-auto mt-16 w-[min(calc(100%-40px),1280px)] rounded-2xl border border-stone-200/80 bg-white p-8 text-center shadow-xs md:w-[min(calc(100%-64px),1280px)]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
            TRẢI NGHIỆM THỰC TẾ
          </p>
          <h2 className="mt-2 font-brand-display text-2xl font-bold text-stone-900 md:text-3xl">
            Muốn nằm thử trực tiếp {product.name}?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">
            Nệm Thăng Long có 7 showroom trải nghiệm tại TP.HCM và các tỉnh lân cận với không gian nằm thử riêng tư không áp lực mua hàng.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={"/showrooms" as never}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-6 py-3.5 text-sm font-bold !text-white shadow-md transition-all cursor-pointer"
              style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
            >
              <MapPin className="size-4 text-white" />
              <span>Tìm showroom gần bạn nhất</span>
            </Link>

            {directContactHref && (
              <a
                href={directContactHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-6 py-3.5 text-sm font-bold text-stone-800 transition-all shadow-xs"
              >
                <PhoneCall className="size-4 text-stone-700" />
                <span>Gọi hotline tư vấn nhanh</span>
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
