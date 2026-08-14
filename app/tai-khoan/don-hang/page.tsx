import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function OrdersPage() { const session = await auth(); return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN / ĐƠN HÀNG</p><h1>Lịch sử đơn hàng.</h1>{session ? <div className="admin-note">Đơn hàng của bạn sẽ xuất hiện tại đây sau khi đặt thành công.</div> : <p className="muted">Vui lòng <Link href="/dang-nhap" className="text-link">đăng nhập</Link> để xem lịch sử.</p>}</main>; }
