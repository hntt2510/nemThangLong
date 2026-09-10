import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { CatalogProductSummary } from "@/lib/catalog";

export type ProductCardProduct = Pick<CatalogProductSummary, "slug" | "name" | "eyebrow" | "description" | "image" | "imageAlt" | "isDemo" | "imageIsDemo" | "minPrice" | "inStock" | "widths" | "ratingAverage" | "ratingCount"> & {
  hasPlaceholderPrices?: boolean;
  isShowcase?: boolean;
  previewPurchasable?: boolean;
};

export function ProductCard({ product, className = "" }: { product: ProductCardProduct; index?: number; className?: string; presentation?: "default" | "landing" }) {
  const priceLabel = product.minPrice
    ? `Từ ${formatVnd(product.minPrice)}${product.hasPlaceholderPrices ? " · Giá thử nghiệm" : ""}`
    : product.hasPlaceholderPrices
      ? "Có giá thử nghiệm"
      : "Liên hệ tư vấn";

  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-brand border border-brand-ink/12 bg-white ${className}`}>
      <Link href={`/nem/${product.slug}` as never} aria-label={`Xem ${product.name}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-surface">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.025]"
        />
        {product.imageIsDemo ? <span className="absolute left-3 top-3 rounded-brand bg-brand-canvas/94 px-2.5 py-1 text-xs font-bold text-brand-copy">Ảnh minh họa</span> : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-[0.12em] text-brand-accent">{product.eyebrow}</p>
        <h3 className="mt-3 font-brand-display text-[1.65rem] leading-[1.08] font-semibold tracking-[-0.02em] text-brand-ink">
          <Link href={`/nem/${product.slug}` as never} className="transition-colors duration-200 hover:text-brand-accent">{product.name}</Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-brand-copy">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 border-t border-brand-ink/10 pt-3 text-xs font-semibold text-brand-copy">
          {product.widths.length > 0 ? <span>{product.widths.join(" · ")} cm</span> : null}
          <span className={product.inStock ? "text-[#45613d]" : "text-brand-copy"}>{product.inStock ? "Còn hàng" : "Tạm hết hàng"}</span>
          {product.ratingAverage !== null && product.ratingCount > 0 ? <span>Đánh giá {product.ratingAverage.toFixed(1)} ({product.ratingCount})</span> : null}
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <span className="font-brand-ui text-sm font-bold leading-5 text-brand-ink">{priceLabel}</span>
          <Link href={`/nem/${product.slug}` as never} className="shrink-0 text-sm font-bold text-brand-ink transition-colors duration-200 hover:text-brand-accent">Xem chi tiết <span aria-hidden="true" className="ml-1">→</span></Link>
        </div>
      </div>
    </article>
  );
}
