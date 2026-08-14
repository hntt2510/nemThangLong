"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}><div className="header-inner"><Link href="/nem/luxury" className="brand" aria-label="Thăng Long trang chủ"><span>THĂNG LONG</span><small>Sleep, considered.</small></Link><nav className={`desktop-nav ${open ? "is-open" : ""}`} aria-label="Điều hướng chính"><button className="nav-link has-menu" onClick={() => setOpen((value) => !value)} aria-expanded={open}>Nệm <span aria-hidden="true">⌄</span></button><Link href="#mattress-lab" className="nav-link">Luxury</Link>{open && <div className="mega-menu"><div><p className="eyebrow">NỆM</p><h2>Chọn cảm giác phù hợp.</h2><p className="muted">Nội dung sản phẩm chỉ hiển thị khi đã được cấu hình trong CMS.</p></div><div className="mega-links"><Link href="/nem/luxury">Luxury →</Link></div></div>}</nav><div className="header-actions"><Link href="/dang-nhap" aria-label="Tài khoản">♙</Link><Link href="/gio-hang" aria-label={`Giỏ hàng, ${count} sản phẩm`}>Giỏ <sup>{count}</sup></Link><button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Mở menu">☰</button></div></div></header>;
}
