"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AdminShellProps = {
  children: React.ReactNode;
  role: "ADMIN" | "EDITOR";
  name: string;
  signOutAction: () => void | Promise<void>;
};

type NavItem = readonly [string, string];
type NavGroup = { label: string; items: readonly NavItem[] };
const groups: readonly NavGroup[] = [
  { label: "Tổng quan", items: [["/admin/dashboard", "Tổng quan"]] },
  { label: "Bán hàng", items: [["/admin/orders", "Đơn hàng"], ["/admin/payment-reviews", "Kiểm tra thanh toán"]] },
  { label: "Sản phẩm", items: [["/admin/products", "Danh mục"], ["/admin/categories", "Danh mục loại"], ["/admin/inventory", "Tồn kho"], ["/admin/reviews", "Đánh giá"]] },
  { label: "CMS", items: [["/admin/pages", "Trang nội dung"], ["/admin/menus", "Điều hướng"], ["/admin/media", "Thư viện ảnh"]] },
  { label: "Khách hàng", items: [["/admin/users", "Khách hàng"], ["/admin/leads", "Khách quan tâm"], ["/admin/after-sales", "Sau mua"]] },
  { label: "Hệ thống", items: [["/admin/settings", "Cài đặt"]] },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));
}

export function AdminShell({ children, role, name, signOutAction }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="ops-shell">
    <button className="ops-menu-button" type="button" aria-label="Mở điều hướng" onClick={() => setOpen(true)}>☰</button>
    <aside className={`ops-sidebar ${open ? "is-open" : ""}`} aria-label="Điều hướng quản trị">
      <div className="ops-sidebar-head"><Link href="/admin/dashboard" className="ops-brand">THĂNG LONG <small>OPERATIONS</small></Link><button type="button" className="ops-close" aria-label="Đóng điều hướng" onClick={() => setOpen(false)}>×</button></div>
      <nav>{groups.map((group) => <section key={group.label} className="ops-nav-group"><p>{group.label}</p>{group.items.map(([href, label]) => <Link onClick={() => setOpen(false)} className={isCurrent(pathname, href) ? "active" : ""} key={href} href={href as never}>{label}</Link>)}</section>)}</nav>
      <div className="ops-sidebar-foot"><Link href="/" target="_blank">Xem storefront ↗</Link><form action={signOutAction}><button type="submit">Đăng xuất</button></form></div>
    </aside>
    {open && <button className="ops-scrim" aria-label="Đóng điều hướng" onClick={() => setOpen(false)} />}
    <div className="ops-workspace">
      <header className="ops-topbar"><div><p className="ops-breadcrumb">QUẢN TRỊ / {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "tổng quan"}</p><h1>{groups.flatMap((group) => [...group.items]).find(([href]) => isCurrent(pathname, href))?.[1] ?? "Quản trị"}</h1></div><div className="ops-user"><span>{role === "ADMIN" ? "Quản trị viên" : "Biên tập viên"}</span><strong>{name}</strong></div></header>
      <main className="ops-content">{children}</main>
    </div>
  </div>;
}
