import { auth } from "@/auth";
import { getStorefrontNavigation } from "@/lib/storefront-cms";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader({ solid = false, landing = false }: { solid?: boolean; landing?: boolean } = {}) {
  const [navigation, session] = await Promise.all([
    getStorefrontNavigation().catch(() => ({ mattressLines: [], needs: [], primary: [] })),
    auth().catch(() => null),
  ]);
  return <SiteHeaderClient navigation={navigation} solid={solid} landing={landing} isAuthenticated={Boolean(session?.user?.id)} showcaseMode={false} />;
}
