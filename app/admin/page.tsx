import Link from "next/link";
import { auth } from "@/auth";
import { AdminProductEditor } from "@/components/admin-product-editor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !["ADMIN", "EDITOR"].includes(role)) return <main className="admin-access-denied"><p className="eyebrow">THĂNG LONG COMMERCE</p><h1>Admin access required.</h1><p>Đăng nhập bằng tài khoản quản trị để mở product editor.</p><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  return <main className="admin-page"><aside className="admin-sidebar"><Link className="admin-logo" href="/nem/luxury">THĂNG LONG<small>Commerce OS</small></Link><nav><Link className="active" href="/admin">Product</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/reviews">Reviews</Link><Link href="/admin/settings">Site settings</Link></nav><Link href="/nem/luxury" className="admin-back">← Storefront</Link></aside><section className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">PRODUCT / LUXURY</p><h1>Nệm Thăng Long Luxury</h1></div><div className="admin-status"><span className={role ? "status-dot live" : "status-dot"} />{role ? `${role} · Preview` : "Preview mode"}</div></div><AdminProductEditor /></section></main>;
}
