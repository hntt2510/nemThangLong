import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/products";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return <><SiteHeader solid /><div className="account-shell">{children}</div><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
