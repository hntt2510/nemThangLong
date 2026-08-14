import { SiteHeader } from "@/components/site-header";
import { LuxuryPdp } from "@/components/luxury-pdp";
import { luxuryProduct } from "@/lib/product-data";

export default function LuxuryPage() {
  return <><SiteHeader /><main><LuxuryPdp product={luxuryProduct} /></main></>;
}
