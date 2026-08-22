import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountProfile } from "@/lib/account";

export const dynamic = "force-dynamic";

import { isUiShowcaseMode, getShowcaseProfile } from "@/lib/ui-showcase";

export default async function AccountPage() {
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  const showcaseProfile = showcase ? getShowcaseProfile() : null;

  if (!session?.user?.id && !showcase) {
    return (
      <main className="account-page container">
        <p className="eyebrow">TÀI KHOẢN</p>
        <h1>Không gian của bạn.</h1>
        <p className="muted">
          Vui lòng <Link href="/dang-nhap" className="text-link">đăng nhập</Link> hoặc{" "}
          <Link href="/dang-ky" className="text-link">tạo tài khoản</Link> để tiếp tục.
        </p>
      </main>
    );
  }
  const prisma = getPrisma();
  const profile = showcaseProfile ?? (prisma && session?.user?.id ? await getAccountProfile(prisma, session.user.id).catch(() => null) : null);
  const displayName = profile?.name ?? session?.user?.name ?? "Nguyễn Minh Anh";
  const displayEmail = profile?.email ?? session?.user?.email ?? "minhanh@example.test";

  return (
    <main className="account-page container">
      <p className="eyebrow">TÀI KHOẢN KHÁCH HÀNG</p>
      <h1>{displayName}</h1>
      <p className="muted account-email">{displayEmail}</p>
      <div className="account-cards">
        <Link href={"/tai-khoan/ho-so" as never} className="account-nav-card">
          <span>01</span>
          <strong>Hồ sơ</strong>
          <small>Thông tin cá nhân &amp; liên hệ</small>
        </Link>
        <Link href={"/tai-khoan/don-hang" as never} className="account-nav-card">
          <span>02</span>
          <strong>Đơn hàng</strong>
          <small>Lịch sử &amp; trạng thái đơn hàng</small>
        </Link>
        <Link href={"/tai-khoan/dia-chi" as never} className="account-nav-card">
          <span>03</span>
          <strong>Sổ địa chỉ</strong>
          <small>Địa chỉ nhận hàng đã lưu</small>
        </Link>
        <Link href={"/tai-khoan/ho-tro" as never} className="account-nav-card">
          <span>04</span>
          <strong>Hỗ trợ sau mua</strong>
          <small>Yêu cầu kiểm tra &amp; bảo hành</small>
        </Link>
        <Link href={"/nem" as never} className="account-nav-card">
          <span>05</span>
          <strong>Danh mục nệm</strong>
          <small>Khám phá thêm các dòng sản phẩm</small>
        </Link>
      </div>
      <p className="muted account-guest-note">
        Đơn mua trước khi đăng nhập chưa được tự động liên kết. Vui lòng liên hệ hỗ trợ nếu cần tra cứu.
      </p>
    </main>
  );
}
