"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, Search, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCart } from "@/lib/cart-context";
import { initialHeaderMenuState, reduceHeaderMenu } from "@/lib/header-menu";
import type { SiteNavigation } from "@/lib/navigation";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

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
  const menuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
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

  useGSAP(
    (_, contextSafe) => {
      const logo = logoRef.current;
      if (!logo || !contextSafe || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const onMove = contextSafe((event: PointerEvent) => {
        const bounds = logo.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(logo, { rotateY: x * 7, rotateX: -y * 5, y: -1, duration: 0.28, ease: "power2.out", overwrite: "auto" });
      });
      const onLeave = contextSafe(() => gsap.to(logo, { rotateY: 0, rotateX: 0, y: 0, duration: 0.42, ease: "power3.out", overwrite: "auto" }));

      logo.addEventListener("pointermove", onMove);
      logo.addEventListener("pointerleave", onLeave);
      return () => {
        logo.removeEventListener("pointermove", onMove);
        logo.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: menuRef },
  );

  useGSAP(
    () => {
      if (!megaOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const panel = menuRef.current?.querySelector("#mattress-menu");
      if (panel) gsap.fromTo(panel, { autoAlpha: 0, y: -8, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power3.out", clearProps: "transform,visibility,opacity" });
    },
    { dependencies: [megaOpen], scope: menuRef, revertOnUpdate: true },
  );

  const closeMenu = () => dispatchMenu((state) => reduceHeaderMenu(state, { type: "navigate" }));
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const accountHref = isAuthenticated ? "/tai-khoan" : "/dang-nhap";
  const accountLabel = isAuthenticated ? "Tài khoản của tôi" : "Đăng nhập";
  const navLinkClass = (href: string) => `relative px-1 py-2 text-sm font-semibold transition-colors duration-200 hover:text-brand-primary after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:origin-left after:bg-brand-primary after:transition-transform after:duration-200 ${
    isActive(href) ? "text-brand-primary after:scale-x-100" : "text-brand-copy after:scale-x-0"
  }`;

  return (
    <div ref={menuRef}>
      <header className={`fixed inset-x-0 top-0 z-40 border-b border-brand-ink/10 bg-brand-canvas/96 transition-[background-color,box-shadow] duration-200 ${scrolled ? "shadow-[0_6px_24px_rgba(15,23,42,0.08)] backdrop-blur" : ""}`}>
        <div className="hidden h-6 bg-brand-primary text-white xl:block">
          <div className="mx-auto flex h-full w-[min(calc(100%-64px),1280px)] items-center justify-between text-[0.65rem] font-semibold tracking-[0.035em]">
            <div className="flex items-center gap-5 text-white/88">
              <span className="inline-flex items-center gap-1.5"><Truck size={13} strokeWidth={1.8} aria-hidden="true" />Giao tận phòng</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />Bảo hành chính hãng</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-white/92"><Phone size={13} strokeWidth={1.8} aria-hidden="true" />Tư vấn chọn nệm</span>
          </div>
        </div>

        <div className="mx-auto flex h-16 w-[min(calc(100%-40px),1280px)] items-center justify-between gap-5 md:w-[min(calc(100%-64px),1280px)] xl:h-12">
          <Link ref={logoRef} href="/" className="group flex shrink-0 items-center gap-2.5 text-brand-ink [perspective:600px] [transform-style:preserve-3d]" aria-label="Thăng Long trang chủ" onClick={closeMenu}>
            <span className="grid size-9 place-items-center rounded-[0.7rem] border border-brand-primary/20 bg-gradient-to-br from-white to-brand-surface text-lg font-extrabold tracking-[-0.12em] text-brand-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_rgba(15,23,42,0.1)]" aria-hidden="true">TL</span>
            <span className="flex flex-col leading-none">
              <b className="text-sm font-extrabold tracking-[0.12em] text-brand-ink">THĂNG LONG</b>
              <small className="mt-1 text-[0.55rem] font-bold tracking-[0.15em] text-brand-copy">GIẤC NGỦ VIỆT</small>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex xl:items-center xl:gap-7" aria-label="Điều hướng chính">
            <div className="relative flex items-center">
              <Link href="/nem" className={navLinkClass("/nem")} onClick={closeMenu}>
                Sản phẩm
              </Link>
              <button
                id="mattress-menu-trigger"
                className="ml-0.5 grid size-9 cursor-pointer place-items-center rounded-full text-brand-copy transition hover:bg-brand-surface hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                type="button"
                onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mega" }))}
                aria-expanded={megaOpen}
                aria-controls="mattress-menu"
                aria-label="Mở danh sách sản phẩm"
              >
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                />
              </button>
              {megaOpen ? (
                <div
                  id="mattress-menu"
                  className="absolute left-0 top-full mt-4 grid w-150 grid-cols-[0.9fr_1.1fr] gap-7 overflow-hidden rounded-2xl border border-brand-primary/12 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
                  role="region"
                  aria-label="Khám phá nệm"
                >
                  <div className="rounded-xl bg-brand-surface/65 p-5 border-r border-brand-primary/10">
                    <p className="text-xs font-bold tracking-[0.15em] text-brand-accent">NỆM THĂNG LONG</p>
                    <h2 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-brand-ink">
                      Chọn cảm giác phù hợp.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-brand-copy">
                      Khám phá theo dòng nệm hoặc nhu cầu nghỉ ngơi của bạn.
                    </p>
                    <Link
                      href="/nem"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-accent"
                      onClick={closeMenu}
                    >
                      Xem tất cả nệm <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-bold tracking-[0.15em] text-brand-accent">THEO DÒNG</p>
                    <div className="mt-3 grid gap-1">
                      {navigation.mattressLines.map((item) => (
                        <Link
                          key={`${item.label}${item.href}`}
                          href={item.href as never}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-surface hover:text-brand-primary"
                          onClick={closeMenu}
                        >
                          {item.label}
                          <span aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {navigation.primary.map((item) => (
              <Link
                key={`${item.label}${item.href}`}
                href={item.href as never}
                className={navLinkClass(item.href)}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 text-sm font-semibold">
            <Link href="/nem" className="hidden size-9 cursor-pointer place-items-center rounded-full text-brand-copy transition hover:bg-brand-surface hover:text-brand-primary xl:grid" aria-label="Tìm sản phẩm" onClick={closeMenu}><Search size={18} aria-hidden="true" /></Link>
            <Link href={accountHref} className="hidden text-brand-copy transition hover:text-brand-primary xl:inline" aria-label={accountLabel} onClick={closeMenu}>{accountLabel}</Link>
            <Link href="/gio-hang" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-primary px-3 text-xs font-bold text-white shadow-[0_5px_12px_rgba(30,58,95,0.2)] transition hover:bg-[#294d7b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" aria-label={`Giỏ hàng, ${count} sản phẩm`} onClick={closeMenu}><ShoppingBag size={15} aria-hidden="true" />Giỏ <span className="rounded-full bg-white/18 px-1.5 py-0.5">{count}</span></Link>
            <button className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-full border border-brand-primary/18 text-brand-primary xl:hidden" type="button" onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mobile" }))} aria-label={mobileOpen ? "Đóng menu" : "Mở menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation">{mobileOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}</button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer (Edge-to-Edge Off-Canvas Fullscreen Sheet) */}
      <div
        id="mobile-navigation"
        className={`fixed inset-0 z-50 flex flex-col bg-white xl:hidden ${
          mobileOpen ? "flex" : "hidden"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Điều hướng chính"
      >
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-stone-100 bg-white px-5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-brand-ink"
            aria-label="Thăng Long trang chủ"
            onClick={closeMenu}
          >
            <span
              className="grid size-9 place-items-center rounded-[0.7rem] border border-brand-primary/20 bg-gradient-to-br from-white to-brand-surface text-lg font-extrabold tracking-[-0.12em] text-brand-primary shadow-xs"
              aria-hidden="true"
            >
              TL
            </span>
            <span className="flex flex-col leading-none">
              <b className="text-sm font-extrabold tracking-[0.12em] text-brand-ink">THĂNG LONG</b>
              <small className="mt-1 text-[0.55rem] font-bold tracking-[0.15em] text-brand-copy">GIẤC NGỦ VIỆT</small>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/gio-hang"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-primary px-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#294d7b]"
              aria-label={`Giỏ hàng, ${count} sản phẩm`}
              onClick={closeMenu}
            >
              <ShoppingBag size={15} aria-hidden="true" />
              <span>Giỏ</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5">{count}</span>
            </Link>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mobile" }))}
              aria-label="Đóng menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-16">
          {/* Accordion: Sản phẩm */}
          <div className="border-b border-stone-100">
            <button
              type="button"
              className="flex min-h-[48px] w-full items-center justify-between py-3 text-left text-base font-bold text-stone-900 cursor-pointer"
              onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mega" }))}
              aria-expanded={megaOpen}
              aria-controls="mobile-mattress-accordion"
            >
              <span>Sản phẩm</span>
              <ChevronDown
                size={18}
                className={`text-stone-500 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {megaOpen ? (
              <div id="mobile-mattress-accordion" className="pb-4 pt-1">
                {/* Full-width Feature Banner */}
                <div className="w-full rounded-xl bg-stone-50 p-4 mb-4 border border-stone-100">
                  <p className="text-[11px] font-bold tracking-[0.15em] text-brand-accent uppercase">NỆM THĂNG LONG</p>
                  <h3 className="mt-1 text-base font-extrabold text-stone-900">Chọn cảm giác phù hợp.</h3>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    Khám phá theo dòng nệm hoặc nhu cầu nghỉ ngơi của bạn.
                  </p>
                  <Link
                    href="/nem"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-accent"
                    onClick={closeMenu}
                  >
                    <span>Xem tất cả nệm</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {/* Mattress Lines List */}
                <div className="flex flex-col">
                  {navigation.mattressLines.map((item) => (
                    <Link
                      key={`mobile-${item.label}${item.href}`}
                      href={item.href as never}
                      className="flex min-h-[48px] items-center justify-between py-3 border-b border-stone-100 active:bg-stone-50 text-stone-800 text-sm font-medium transition-colors"
                      onClick={closeMenu}
                    >
                      <span>{item.label}</span>
                      <span className="text-stone-400 text-sm" aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Primary Navigation Links */}
          <div className="flex flex-col">
            {navigation.primary.map((item) => (
              <Link
                key={`mobile-primary-${item.label}${item.href}`}
                href={item.href as never}
                className={`flex min-h-[48px] items-center justify-between py-3 border-b border-stone-100 active:bg-stone-50 text-stone-800 text-base font-semibold transition-colors ${
                  isActive(item.href) ? "text-brand-primary font-bold" : "hover:text-brand-primary"
                }`}
                onClick={closeMenu}
              >
                <span>{item.label}</span>
                <span className="text-stone-400 text-sm" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>

          {/* Account Button */}
          <div className="mt-6 pt-2">
            <Link
              href={accountHref}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-surface/50 px-4 py-3 text-sm font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
              onClick={closeMenu}
            >
              {accountLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
