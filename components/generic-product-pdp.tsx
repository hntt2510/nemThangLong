import Image from "next/image";
import Link from "next/link";
import { GenericProductPurchase } from "@/components/generic-product-purchase";
import { ProductCard } from "@/components/product-card";
import type { CatalogProductSummary } from "@/lib/catalog";
import { catalogBreadcrumbs, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import type { Product } from "@/lib/types";
import { isDemoMedia, mediaAlt } from "@/lib/product-media";

type ProductSettings = { contactPhone?: string | null; contactEmail?: string | null } | null;

function jsonLdScript(value: unknown) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }} />;
}

export function GenericProductPdp({ product, related, settings }: { product: Product; related: CatalogProductSummary[]; settings: ProductSettings }) {
  const contactHref = settings?.contactPhone
    ? "tel:" + settings.contactPhone
    : settings?.contactEmail
      ? "mailto:" + settings.contactEmail
      : null;
  const breadcrumbs = catalogBreadcrumbs(product.slug, product.name);
  const productSchema = productJsonLd(product, "/nem/" + product.slug);
  const audience = product.content?.audience?.published && product.content.audience.title && product.content.audience.body ? product.content.audience : null;
  const materialStory = product.content?.materialStory?.published && product.content.materialStory.title && product.content.materialStory.body ? product.content.materialStory : null;
  const delivery = product.content?.delivery?.published && product.content.delivery.body ? product.content.delivery : null;
  const warranty = product.content?.warranty?.published && product.content.warranty.body ? product.content.warranty : null;
  const secondaryMedia = product.media[1] ?? product.media[0];

  return (
    <div className="generic-product-page">
      {jsonLdScript(breadcrumbJsonLd(breadcrumbs))}
      {productSchema && jsonLdScript(productSchema)}
      <main>
        <nav className="container breadcrumb-nav" aria-label="Breadcrumb">{breadcrumbs.map((crumb, index) => <span key={crumb.item}>{index > 0 && <b aria-hidden="true">/</b>}{index === breadcrumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <Link href={crumb.item as never}>{crumb.name}</Link>}</span>)}</nav>
        <GenericProductPurchase product={product} contactHref={contactHref} />
        <div className="container generic-compare-entry"><Link href={("/so-sanh?items=" + encodeURIComponent(product.slug)) as never} className="text-link">So sánh dòng nệm này <span aria-hidden="true">→</span></Link></div>
        {product.isDemo && <p className="container product-data-note">Hình ảnh minh họa · Sản phẩm chưa có giá, tồn kho hoặc tổ hợp mua được xác nhận.</p>}

        {audience && <section className="generic-editorial container"><div className="generic-editorial-media">{secondaryMedia && <Image src={secondaryMedia.url} alt={mediaAlt(product, secondaryMedia)} fill sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: secondaryMedia.fit ?? "cover" }} />}{secondaryMedia && isDemoMedia(product, secondaryMedia) && <span className="demo-badge">Hình ảnh minh họa</span>}</div><div><p className="section-label">PHÙ HỢP VỚI</p><h2>{audience.title}</h2><p>{audience.body}</p></div></section>}
        {materialStory && <section className="generic-content-section container"><p className="section-label">MATERIAL STORY</p><h2>{materialStory.title}</h2><p>{materialStory.body}</p></section>}
        {(delivery || warranty) && <section className="generic-info-grid container">{delivery && <article><p className="section-label">GIAO HÀNG</p><h2>{delivery.title ?? "Giao hàng"}</h2><p>{delivery.body}</p></article>}{warranty && <article><p className="section-label">BẢO HÀNH</p><h2>{warranty.title ?? "Bảo hành"}</h2><p>{warranty.body}</p></article>}</section>}
        <section className="generic-related container"><div><p className="section-label">KHÁM PHÁ THÊM</p><h2>Các dòng nệm khác.</h2></div>{related.length > 0 ? <div className="catalog-grid">{related.map((item, index) => <ProductCard key={item.slug} product={item} index={index} />)}</div> : <p className="muted">Các lựa chọn liên quan đang được cập nhật.</p>}</section>
        {!contactHref && <p className="container product-contact-pending">Thông tin tư vấn đang được cập nhật.</p>}
      </main>
    </div>
  );
}
