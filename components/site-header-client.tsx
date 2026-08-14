"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { SiteNavigation } from "@/lib/navigation";

export function SiteHeaderClient({ navigation, solid }: { navigation: SiteNavigation; solid: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(solid || window.scrollY > 24);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const onPointerDown = (event: PointerEvent) => { if (open && menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("keydown", onKeyDown); document.removeEventListener("pointerdown", onPointerDown); };
  }, [open, solid]);

  function closeMenu() { setOpen(false); }

  return <header ref={menuRef} className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="Thăng Long trang chủ" onClick={closeMenu}><span>THĂNG LONG</span><small>Sleep, considered.</small></Link>
      <nav className={`desktop-nav ${open ? "is-open" : ""}`} aria-label="Điều hướng chính">
        <button className="nav-link has-menu" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mattress-menu">Nệm <span aria-hidden="true">⌄</span></button>
        <Link href="/nem/luxury" className="nav-link" onClick={closeMenu}>Luxury</Link>
        <Link href="/#shop-by-need" className="nav-link" onClick={closeMenu}>Theo nhu cầu</Link>
        <Link href="/#hotel-project" className="nav-link" onClick={closeMenu}>Khách sạn &amp; dự án</Link>
        {open && <div id="mattress-menu" className="mega-menu" role="region" aria-label="Khám phá nệm">
          <div><p className="eyebrow">NỆM</p><h2>Chọn cảm giác phù hợp.</h2><p className="muted">Khám phá theo dòng nệm hoặc nhu cầu ngủ của bạn.</p></div>
          <div><p className="mega-heading">THEO DÒNG</p><div className="mega-links">{navigation.mattressLines.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href as never} onClick={closeMenu}>{item.label} <span aria-hidden="true">→</span></Link>)}</div></div>
          <div><p className="mega-heading">THEO NHU CẦU</p><div className="mega-links">{navigation.needs.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href as never} onClick={closeMenu}>{item.label} <span aria-hidden="true">→</span></Link>)}</div></div>
        </div>}
      </nav>
      <div className="header-actions">
        <Link href="/dang-nhap" aria-label="Tài khoản" onClick={closeMenu}>Tài khoản</Link>
        <Link href="/gio-hang" aria-label={`Giỏ hàng, ${count} sản phẩm`} onClick={closeMenu}>Giỏ <sup>{count}</sup></Link>
        <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open}>☰</button>
      </div>
    </div>
  </header>;
}
