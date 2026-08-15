import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getPaymentReview } from "@/lib/payment-review";
import { AdminPaymentReviewActions } from "@/components/admin-payment-review-actions";

export const dynamic = "force-dynamic";
export default async function PaymentReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>; if (session.user.role !== "ADMIN") return <main className="admin-placeholder"><h1>Không có quyền.</h1></main>;
  const prisma = getPrisma(); if (!prisma) return <main className="admin-placeholder"><h1>Database chưa sẵn sàng.</h1></main>;
  const item = await getPaymentReview(prisma, (await params).id).catch(() => null); if (!item) notFound();
  return <main className="admin-placeholder"><Link href="/admin/payment-reviews">← Payment review</Link><p className="eyebrow">PAYMENT REVIEW / {item.code}</p><h1>{item.customerName}</h1><p>{item.total.toLocaleString("vi-VN")} ₫ · {item.payments[0]?.providerTransactionId ?? "—"}</p><div className="dashboard-section"><h2>Items và tồn kho hiện tại</h2><ul>{item.items.map((line) => <li key={line.id}><span>{line.productName} · {line.sku} · {line.quantity} · tồn hiện tại {line.variant.stock}</span><strong>{item.reservations.filter((reservation) => reservation.variantId === line.variantId).map((reservation) => `${reservation.status} × ${reservation.quantity}`).join(", ") || "Đã release"}</strong></li>)}</ul></div><p className="admin-note">Chỉ ADMIN được xử lý. Fulfill sẽ kiểm tra tồn kho và trừ atomically; manual refund chỉ ghi nhận hoàn tiền đã thực hiện ngoài hệ thống.</p><AdminPaymentReviewActions orderId={item.id} /></main>;
}
