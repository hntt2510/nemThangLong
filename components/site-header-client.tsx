"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { initialHeaderMenuState, reduceHeaderMenu } from "@/lib/header-menu";
import type { SiteNavigation } from "@/lib/navigation";

export function SiteHeaderClient({
  navigation,
  solid,
  isAuthenticated = false,
}: {
  navigation: SiteNavigation;
  solid: boolean;
  landing?: boolean;
  isAuthenticated?: boolean;
  showcaseMode?: boolean;
}) {
  const [scrolled, setScrolled] = useState(solid);
  const [{ mobileOpen, megaOpen }, dispatchMenu] = useState(initialHeaderMenuState);
  const menuRef = useRef<HTMLElement>(null);
  const pathname = usePathname() ?? "";
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(solid || window.scrollY > 20);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatchMenu((state) => reduceHeaderMenu(state, { type: "escape" }));
    };
    const onPointerDown = (event: PointerEvent) => {
      if ((mobileOpen || megaOpen) && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        dispatchMenu((state) => reduceHeaderMenu(state, { type: "outside" }));
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileOpen, megaOpen, solid]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMenu = () => dispatchMenu((state) => reduceHeaderMenu(state, { type: "navigate" }));
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const accountHref = isAuthenticated ? "/tai-khoan" : "/dang-nhap";
  const accountLabel = isAuthenticated ? "Tài khoản của tôi" : "Đăng nhập";
  const navLinkClass = (href: string) => `border-b-2 px-1 py-2 text-sm font-semibold transition-colors duration-200 hover:text-brand-accent ${
    isActive(href) ? "border-brand-ink text-brand-ink" : "border-transparent text-brand-copy"
  }`;

  return (
    <header
      ref={menuRef}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow] duration-200 ${
        scrolled ? "border-brand-ink/10 bg-brand-canvas/96 shadow-[0_2px_14px_rgba(48,40,32,0.05)] backdrop-blur" : "border-transparent bg-brand-canvas/88"
      }`}
    >
      <div className="mx-auto flex h-16 w-[min(calc(100%-40px),1280px)] items-center justify-between gap-5 md:w-[min(calc(100%-64px),1280px)] lg:h-18">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-brand-ink" aria-label="Thăng Long trang chủ" onClick={closeMenu}>
          <span className="font-brand-display border-r border-brand-ink/30 pr-2 text-2xl font-semibold leading-none tracking-[-0.08em]" aria-hidden="true">TL</span>
          <span className="flex flex-col leading-none">
            <b className="font-brand-display text-base font-semibold tracking-[0.12em]">THĂNG LONG</b>
            <small className="mt-1 text-[0.56rem] font-bold tracking-[0.15em] text-brand-copy">GIẤC NGỦ VIỆT</small>
          </span>
        </Link>

        <nav
          id="mobile-navigation"
          className={`absolute inset-x-0 top-16 border-b border-brand-ink/10 bg-brand-canvas px-5 py-6 shadow-lg transition-opacity duration-200 md:px-8 lg:static lg:flex lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            mobileOpen ? "block" : "hidden lg:flex"
          }`}
          aria-label="Điều hướng chính"
        >
          <div className={`relative flex items-center ${isActive("/nem") ? "text-brand-ink" : ""}`}>
            <Link href="/nem" className={navLinkClass("/nem")} onClick={closeMenu}>Sản phẩm</Link>
            <button
              id="mattress-menu-trigger"
              className="ml-0.5 rounded p-2 text-brand-copy transition hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              type="button"
              onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mega" }))}
              aria-expanded={megaOpen}
              aria-controls="mattress-menu"
              aria-label="Mở danh sách sản phẩm"
            >
              <span aria-hidden="true">⌄</span>
            </button>
            {megaOpen ? (
              <div id="mattress-menu" className="mt-3 w-full rounded-brand border border-brand-ink/12 bg-white p-5 shadow-[0_14px_38px_rgba(48,40,32,0.12)] lg:absolute lg:left-0 lg:top-full lg:mt-3 lg:grid lg:w-135 lg:grid-cols-[1fr_1.1fr] lg:gap-7" role="region" aria-label="Khám phá nệm">
                <div className="border-b border-brand-ink/10 pb-5 lg:border-r lg:border-b-0 lg:pb-0 lg:pr-7">
                  <p className="text-xs font-bold tracking-[0.16em] text-brand-accent">NỆM THĂNG LONG</p>
                  <h2 className="mt-3 font-brand-display text-3xl font-semibold">Chọn cảm giác phù hợp.</h2>
                  <p className="mt-3 text-sm leading-6 text-brand-copy">Khám phá theo dòng nệm hoặc nhu cầu nghỉ ngơi của bạn.</p>
                  <Link href="/nem" className="mt-5 inline-flex text-sm font-bold text-brand-ink hover:text-brand-accent" onClick={closeMenu}>Xem tất cả nệm <span aria-hidden="true" className="ml-2">→</span></Link>
                </div>
                <div className="pt-5 lg:pt-0">
                  <p className="text-xs font-bold tracking-[0.16em] text-brand-accent">THEO DÒNG</p>
                  <div className="mt-3 grid gap-1">
                    {navigation.mattressLines.map((item) => (
                      <Link key={`${item.label}${item.href}`} href={item.href as never} className="flex items-center justify-between rounded-brand px-2 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-surface" onClick={closeMenu}>
                        {item.label} <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {navigation.primary.map((item) => (
            <Link key={`${item.label}${item.href}`} href={item.href as never} className={`${navLinkClass(item.href)} block lg:inline-block`} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
          <Link href={accountHref} className="mt-5 inline-flex min-h-11 items-center rounded-brand border border-brand-ink/45 px-4 py-2 text-sm font-bold text-brand-ink lg:hidden" onClick={closeMenu}>
            {accountLabel}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
          <Link href={accountHref} className="hidden text-brand-copy transition hover:text-brand-ink lg:inline" aria-label={accountLabel} onClick={closeMenu}>
            {accountLabel}
          </Link>
          <Link href="/gio-hang" className="inline-flex items-center gap-1 text-brand-ink transition hover:text-brand-accent" aria-label={`Giỏ hàng, ${count} sản phẩm`} onClick={closeMenu}>
            Giỏ <sup className="rounded-full bg-brand-accent px-1.5 py-0.5 text-[0.65rem] leading-none text-white">{count}</sup>
          </Link>
          <button
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-brand border border-brand-ink/18 text-lg text-brand-ink lg:hidden"
            type="button"
            onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mobile" }))}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
