import { SiteHeader } from "@/components/site-header";
import { LuxuryPdp } from "@/components/luxury-pdp";
import { getStorefrontProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function LuxuryPage() {
  const product = await getStorefrontProduct("luxury");
  return <><SiteHeader /><main><LuxuryPdp product={product} /></main></>;
}
