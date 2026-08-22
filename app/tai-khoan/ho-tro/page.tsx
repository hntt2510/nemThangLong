import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listCustomerAfterSales } from "@/lib/after-sales";

export const dynamic = "force-dynamic";
import { isUiShowcaseMode, getShowcaseAfterSales } from "@/lib/ui-showcase";

export default async function AfterSalesPage() {
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  if (!session?.user?.id && !showcase) return <main className="account-page container"><h1>Đăng nhập để xem yêu cầu.</h1><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  const prisma = getPrisma();
  const requests = showcase
    ? getShowcaseAfterSales().map((item) => ({
        id: item.id,
        subject: item.description,
        type: item.type,
        status: item.status,
        createdAt: item.createdAt,
        description: item.description,
        order: { code: item.orderCode },
        orderItem: { productName: item.productName, sku: "TL-LT-16020010" },
      }))
    : prisma && session?.user?.id
    ? await listCustomerAfterSales(prisma, session.user.id).catch(() => null)
    : null;

  if (!requests) return <main className="account-page container"><h1>Không thể tải yêu cầu.</h1><p className="muted">Đã xảy ra lỗi khi đọc dữ liệu. Chưa thể tạo yêu cầu mới.</p></main>;
  return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN / HỖ TRỢ SAU MUA</p><h1>Yêu cầu kiểm tra bảo hành / hỗ trợ.</h1><p className="muted">Việc gửi yêu cầu chỉ xác nhận rằng yêu cầu đã được tiếp nhận để kiểm tra.</p><Link className="button button-primary" href={"/tai-khoan/ho-tro/moi" as never}>Tạo yêu cầu</Link><div className="account-request-list">{requests.length === 0 ? <p className="admin-note">Chưa có yêu cầu nào.</p> : requests.map((request) => <article className="account-order-card" key={request.id}><strong>{request.subject}</strong><span>{request.type} · {request.status} · {request.createdAt.toLocaleDateString("vi-VN")}</span><small>Đơn {request.order.code} · {request.orderItem.productName} · {request.orderItem.sku}</small><p>{request.description}</p></article>)}</div></main>;
}
