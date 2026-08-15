import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listAccountOrders } from "@/lib/account";
import { AfterSalesForm } from "@/components/after-sales-form";

export const dynamic = "force-dynamic";
export default async function NewAfterSalesPage() {
  const session = await auth();
  if (!session?.user?.id) return <main className="account-page container"><h1>Đăng nhập để tiếp tục.</h1><Link href="/dang-nhap">Đăng nhập</Link></main>;
  const prisma = getPrisma();
  if (!prisma) return <main className="account-page container"><h1>Không thể tải đơn hàng.</h1><p className="muted">Database chưa sẵn sàng.</p></main>;
  const result = await listAccountOrders(prisma, session.user.id).then((orders) => ({ ok: true as const, orders })).catch(() => ({ ok: false as const }));
  if (!result.ok) return <main className="account-page container"><h1>Không thể tải đơn hàng.</h1><p className="muted">Chưa thể tạo yêu cầu khi dữ liệu không tải được.</p></main>;
  const items = result.orders.flatMap((order) => order.items.map((item) => ({ id: item.id, orderId: order.id, orderCode: order.code, productName: item.productName, sku: item.sku })));
  return <main className="account-page container"><Link href={"/tai-khoan/ho-tro" as never}>← Hỗ trợ sau mua</Link><p className="eyebrow">YÊU CẦU MỚI</p><h1>Gửi yêu cầu để được kiểm tra.</h1>{items.length === 0 ? <p className="muted">Bạn cần có OrderItem trong tài khoản để tạo yêu cầu.</p> : <AfterSalesForm items={items} />}</main>;
}
