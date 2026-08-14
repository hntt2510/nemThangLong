import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() { const session = await auth(); return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN</p><h1>{session?.user?.name ?? "Không gian của bạn."}</h1>{session ? <div className="account-cards"><Link href="/tai-khoan/don-hang"><span>01</span><strong>Đơn hàng</strong><small>Xem lịch sử đơn hàng</small></Link><Link href="/nem/luxury"><span>02</span><strong>Tiếp tục khám phá</strong><small>Trở lại sản phẩm Luxury</small></Link></div> : <p className="muted">Vui lòng <Link href="/dang-nhap" className="text-link">đăng nhập</Link> để xem đơn hàng của bạn.</p>}</main>; }
