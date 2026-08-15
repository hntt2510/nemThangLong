import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountProfile } from "@/lib/account";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN</p><h1>Không gian của bạn.</h1><p className="muted">Vui lòng <Link href="/dang-nhap" className="text-link">đăng nhập</Link> hoặc <Link href="/dang-ky" className="text-link">tạo tài khoản</Link> để tiếp tục.</p></main>;
  const prisma = getPrisma(); const profile = prisma ? await getAccountProfile(prisma, session.user.id).catch(() => null) : null;
  return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN</p><h1>{profile?.name ?? session.user.name ?? "Không gian của bạn."}</h1><p className="muted">{profile?.email ?? session.user.email}</p><div className="account-cards"><Link href={"/tai-khoan/ho-so" as never}><span>01</span><strong>Hồ sơ</strong><small>Thông tin liên hệ an toàn</small></Link><Link href={"/tai-khoan/don-hang" as never}><span>02</span><strong>Đơn hàng</strong><small>Xem lịch sử và chi tiết mua hàng</small></Link><Link href={"/tai-khoan/dia-chi" as never}><span>03</span><strong>Địa chỉ</strong><small>Quản lý địa chỉ đã lưu</small></Link><Link href={"/tai-khoan/ho-tro" as never}><span>04</span><strong>Hỗ trợ sau mua</strong><small>Yêu cầu kiểm tra bảo hành / hỗ trợ</small></Link><Link href="/nem/luxury"><span>05</span><strong>Tiếp tục khám phá</strong><small>Trở lại sản phẩm Luxury</small></Link></div><p className="muted account-guest-note">Đơn mua trước khi đăng nhập chưa được tự động liên kết. Liên hệ hỗ trợ nếu cần.</p></main>;
}
