import { getSiteSettings } from "@/lib/products";
import { parseNavigation } from "@/lib/navigation";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader({ solid = false }: { solid?: boolean } = {}) {
  const settings = await getSiteSettings();
  return <SiteHeaderClient navigation={parseNavigation(settings?.navigation)} solid={solid} />;
}
