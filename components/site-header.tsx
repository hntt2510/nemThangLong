import { auth } from "@/auth";
import { getStorefrontNavigation } from "@/lib/storefront-cms";
import { defaultNavigation } from "@/lib/navigation";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader({ solid = false, landing = false }: { solid?: boolean; landing?: boolean } = {}) {
  const [navigation, session] = await Promise.all([
    getStorefrontNavigation().catch(() => defaultNavigation),
    auth().catch(() => null),
  ]);
  return <SiteHeaderClient navigation={navigation} solid={solid} landing={landing} isAuthenticated={Boolean(session?.user?.id)} showcaseMode={false} />;
}
