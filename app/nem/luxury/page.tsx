import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { LuxuryPdp } from "@/components/luxury-pdp";
import { getStorefrontProduct } from "@/lib/products";
import { breadcrumbJsonLd, productJsonLd, productMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return productMetadata(await getStorefrontProduct("luxury"), "/nem/luxury");
}

export default async function LuxuryPage() {
  const product = await getStorefrontProduct("luxury");
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Trang chủ", item: "/" },
    { name: "Dòng nệm", item: "/nem" },
    { name: product.name, item: "/nem/luxury" },
  ]);
  const productSchema = productJsonLd(product, "/nem/luxury");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      {productSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />}
      <SiteHeader />
      <main><div className="container luxury-compare-entry"><Link href="/so-sanh?items=luxury" className="text-link">So sánh Luxury <span aria-hidden="true">→</span></Link></div><LuxuryPdp product={product} /></main>
    </>
  );
}
