import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listCustomerAfterSales } from "@/lib/after-sales";

export const dynamic = "force-dynamic";

export default async function AfterSalesPage() { const session = await auth(); if (!session?.user?.id) return <main className="account-page container"><h1>Đăng nhập để xem yêu cầu.</h1><Link href="/dang-nhap">Đăng nhập</Link></main>; const prisma = getPrisma(); const requests = prisma ? await listCustomerAfterSales(prisma, session.user.id).catch(() => []) : []; return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN / HỖ TRỢ SAU MUA</p><h1>Yêu cầu kiểm tra bảo hành / hỗ trợ.</h1><p className="muted">Việc gửi yêu cầu chỉ xác nhận rằng yêu cầu đã được tiếp nhận để kiểm tra.</p><Link className="button button-primary" href={"/tai-khoan/ho-tro/moi" as never}>Tạo yêu cầu</Link><div className="account-request-list">{requests.length === 0 ? <p className="admin-note">Chưa có yêu cầu nào.</p> : requests.map((request) => <article className="account-order-card" key={request.id}><strong>{request.subject}</strong><span>{request.type} · {request.status} · {request.createdAt.toLocaleDateString("vi-VN")}</span><small>Đơn {request.order.code} · {request.orderItem.productName} · {request.orderItem.sku}</small><p>{request.description}</p></article>)}</div></main>; }
