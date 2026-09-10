import { Homepage } from "@/components/homepage";
import { SiteHeader } from "@/components/site-header";
import { getHomepageData } from "@/lib/homepage";
import { getHomeHero } from "@/lib/storefront-cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ products, reviews, settings, databaseAvailable }, hero] = await Promise.all([getHomepageData(), getHomeHero()]);
  return <><SiteHeader solid landing /><Homepage products={products} reviews={reviews} settings={settings} hero={hero} databaseAvailable={databaseAvailable} /></>;
}
