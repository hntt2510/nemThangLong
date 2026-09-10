import { SiteHeader } from "@/components/site-header";
import { CartPage } from "@/components/cart-page";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/products";

export default async function CartRoute() {
  const settings = await getSiteSettings();
  return <>
    <SiteHeader />
    <main><CartPage shippingPolicy={{ shippingFee: settings?.shippingFee ?? null, freeShippingThreshold: settings?.freeShippingThreshold ?? null }} /></main>
    <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
  </>;
}
