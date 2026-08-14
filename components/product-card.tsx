import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { CatalogProductSummary } from "@/lib/catalog";

export type ProductCardProduct = Pick<CatalogProductSummary, "slug" | "name" | "eyebrow" | "description" | "image" | "imageAlt" | "isDemo" | "imageIsDemo" | "minPrice">;

export function ProductCard({ product, index, className = "" }: { product: ProductCardProduct; index?: number; className?: string }) {
  const priceLabel = product.isDemo ? "Thông tin đang cập nhật" : product.minPrice ? "Từ " + formatVnd(product.minPrice) : "Liên hệ";
  return (
    <article className={"home-product-card product-card " + className}>
      <Link href={"/nem/" + product.slug as never} aria-label={"Xem " + product.name}>
        <div className="home-product-media product-card-media">
          <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw" style={{ objectFit: "cover" }} />
          {typeof index === "number" && <span className="home-product-index">0{index + 1}</span>}
          {product.imageIsDemo && <span className="demo-badge">Minh họa</span>}
        </div>
        <div className="home-product-copy product-card-copy"><p className="eyebrow">{product.eyebrow}</p><h3>{product.name}</h3><p>{product.description}</p><div className="home-product-meta"><span>{priceLabel}</span><span>Khám phá →</span></div></div>
      </Link>
    </article>
  );
}
