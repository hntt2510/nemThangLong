import { SiteHeader } from "@/components/site-header";
import { CheckoutForm } from "@/components/checkout-form";
import { getSiteSettings } from "@/lib/products";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountProfile, listAccountAddresses } from "@/lib/account";
import { getSePayConfiguration } from "@/lib/sepay";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getSiteSettings(), auth()]);
  const prisma = getPrisma();
  const account = prisma && session?.user?.id
    ? await Promise.all([getAccountProfile(prisma, session.user.id), listAccountAddresses(prisma, session.user.id)]).catch(() => [null, []] as const)
    : [null, []] as const;
  const bankTransferEnabled = Boolean(settings?.bankTransferInfo && settings.bankTransferReservationMinutes && settings.bankTransferReservationMinutes >= 5 && settings.bankTransferReservationMinutes <= 10080);
  const sepay = getSePayConfiguration();
  return <>
    <SiteHeader />
    <main className="checkout-page container"><div className="checkout-intro"><p className="eyebrow">CHECKOUT</p><h1>Hoàn tất lựa chọn.</h1><p className="muted">Thông tin của bạn chỉ được dùng để xử lý đơn hàng và giao hàng.</p></div><CheckoutForm bankTransferEnabled={bankTransferEnabled} sepayEnabled={sepay.ready} sepayUnavailableReason={sepay.ready ? undefined : sepay.reason} profile={account[0]} addresses={[...account[1]]} shippingPolicy={{ shippingFee: settings?.shippingFee ?? null, freeShippingThreshold: settings?.freeShippingThreshold ?? null }} /></main>
    <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
  </>;
}
