"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { initialHeaderMenuState, reduceHeaderMenu } from "@/lib/header-menu";
import type { SiteNavigation } from "@/lib/navigation";

export function SiteHeaderClient({ navigation, solid }: { navigation: SiteNavigation; solid: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [{ mobileOpen, megaOpen }, dispatchMenu] = useState(initialHeaderMenuState);
  const menuRef = useRef<HTMLElement>(null);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(solid || window.scrollY > 24);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dispatchMenu((state) => reduceHeaderMenu(state, { type: "escape" })); };
    const onPointerDown = (event: PointerEvent) => { if ((mobileOpen || megaOpen) && menuRef.current && !menuRef.current.contains(event.target as Node)) dispatchMenu((state) => reduceHeaderMenu(state, { type: "outside" })); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("keydown", onKeyDown); document.removeEventListener("pointerdown", onPointerDown); };
  }, [mobileOpen, megaOpen, solid]);

  function closeMenu() { dispatchMenu((state) => reduceHeaderMenu(state, { type: "navigate" })); }

  return <header ref={menuRef} className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="Thăng Long trang chủ" onClick={closeMenu}><span>THĂNG LONG</span><small>Sleep, considered.</small></Link>
      <nav id="mobile-navigation" className={`desktop-nav ${mobileOpen ? "is-mobile-open" : ""}`} aria-label="Điều hướng chính">
        <button className="nav-link has-menu" onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mega" }))} aria-expanded={megaOpen} aria-controls="mattress-menu">Nệm <span aria-hidden="true">⌄</span></button>
        {navigation.primary.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href as never} className="nav-link" onClick={closeMenu}>{item.label}</Link>)}
        {megaOpen && <div id="mattress-menu" className="mega-menu" role="region" aria-label="Khám phá nệm">
          <div><p className="eyebrow">NỆM</p><h2>Chọn cảm giác phù hợp.</h2><p className="muted">Khám phá theo dòng nệm hoặc nhu cầu ngủ của bạn.</p></div>
          <div><p className="mega-heading">THEO DÒNG</p><div className="mega-links">{navigation.mattressLines.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href as never} onClick={closeMenu}>{item.label} <span aria-hidden="true">→</span></Link>)}</div></div>
          <div><p className="mega-heading">THEO NHU CẦU</p><div className="mega-links">{navigation.needs.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href as never} onClick={closeMenu}>{item.label} <span aria-hidden="true">→</span></Link>)}</div></div>
        </div>}
      </nav>
      <div className="header-actions">
        <Link href="/dang-nhap" className="account-link" aria-label="Tài khoản" onClick={closeMenu}>Tài khoản</Link>
        <Link href="/gio-hang" className="cart-link" aria-label={`Giỏ hàng, ${count} sản phẩm`} onClick={closeMenu}>Giỏ <sup>{count}</sup></Link>
        <button className="menu-toggle" onClick={() => dispatchMenu((state) => reduceHeaderMenu(state, { type: "toggle-mobile" }))} aria-label={mobileOpen ? "Đóng menu" : "Mở menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation">☰</button>
      </div>
    </div>
  </header>;
}
