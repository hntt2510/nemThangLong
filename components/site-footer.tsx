import Link from "next/link";
import { getMenuItems } from "@/lib/storefront-cms";
import { SITE_CONFIG } from "@/config/site-config";

export async function SiteFooter({ contactPhone, contactEmail }: { contactPhone?: string | null; contactEmail?: string | null }) {
  const [explore, support] = await Promise.all([getMenuItems("footer-explore"), getMenuItems("footer-support")]);
  const displayPhone = contactPhone || SITE_CONFIG.contact.hotlineDisplay;
  const displayEmail = contactEmail || SITE_CONFIG.contact.supportEmail;
  const telLink = displayPhone.replace(/\s+/g, "");

  return (
    <footer className="border-t border-brand-ink/10 bg-brand-canvas text-brand-copy" id="about">
      <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-9 py-12 md:w-[min(calc(100%-64px),1280px)] md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12 lg:py-15">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-brand-ink" aria-label="Thăng Long trang chủ">
            <span className="font-brand-display border-r border-brand-ink/30 pr-2 text-3xl font-semibold leading-none tracking-[-0.08em]" aria-hidden="true">TL</span>
            <span className="flex flex-col leading-none">
              <b className="font-brand-display text-base font-semibold tracking-[0.12em]">{SITE_CONFIG.brand.name.toUpperCase()}</b>
              <small className="mt-1 text-[0.56rem] font-bold tracking-[0.15em] text-brand-copy">GIẤC NGỦ VIỆT</small>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6">{SITE_CONFIG.brand.slogan}.</p>
        </div>
        <div className="grid content-start gap-3 text-sm">
          <p className="mb-1 text-xs font-bold tracking-[0.14em] text-brand-ink">KHÁM PHÁ</p>
          {explore.map((item) => <Link key={item.href} href={item.href as never} className="w-fit hover:text-brand-accent">{item.label}</Link>)}
        </div>
        <div className="grid content-start gap-3 text-sm">
          <p className="mb-1 text-xs font-bold tracking-[0.14em] text-brand-ink">HỖ TRỢ</p>
          {support.map((item) => <Link key={item.href} href={item.href as never} className="w-fit hover:text-brand-accent">{item.label}</Link>)}
        </div>
        <div className="grid content-start gap-3 text-sm">
          <p className="mb-1 text-xs font-bold tracking-[0.14em] text-brand-ink">LIÊN HỆ</p>
          {displayPhone ? <a href={`tel:${telLink}`} className="w-fit hover:text-brand-accent">{displayPhone}</a> : null}
          {displayEmail ? <a href={`mailto:${displayEmail}`} className="w-fit hover:text-brand-accent">{displayEmail}</a> : null}
        </div>
      </div>
      <div className="border-t border-brand-ink/10">
        <div className="mx-auto flex w-[min(calc(100%-40px),1280px)] flex-col gap-2 py-5 text-xs leading-5 md:w-[min(calc(100%-64px),1280px)] md:flex-row md:justify-between">
          <span>© Thăng Long</span>
          <span>Hình ảnh mang tính chất minh họa trải nghiệm.</span>
        </div>
      </div>
    </footer>
  );
}
