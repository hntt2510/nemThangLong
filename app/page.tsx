import { Homepage } from "@/components/homepage";
import { SiteHeader } from "@/components/site-header";
import { getHomepageData } from "@/lib/homepage";
import { getStorefrontProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ products, settings }, luxuryProduct] = await Promise.all([getHomepageData(), getStorefrontProduct("luxury")]);
  return <><SiteHeader solid /><Homepage products={products} luxuryProduct={luxuryProduct} settings={settings} /></>;
}
