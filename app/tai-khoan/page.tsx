import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountProfile } from "@/lib/account";
import { formatVnd } from "@/lib/format";
import { isUiShowcaseMode, getShowcaseProfile, getShowcaseOrders, getShowcaseAddresses } from "@/lib/ui-showcase";

export const dynamic = "force-dynamic";

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

  const showcaseOrders = showcase ? getShowcaseOrders().slice(0, 2) : [];
  const showcaseAddresses = showcase ? getShowcaseAddresses().slice(0, 1) : [];

  return (
    <main className="account-page container">
      <header className="account-header">
        <p className="eyebrow">TÀI KHOẢN KHÁCH HÀNG</p>
        <h1>{displayName}</h1>
        <p className="muted account-email">{displayEmail}</p>
      </header>

      <div className="account-overview-grid">
        {/* Left Column: 7 cols */}
        <div className="account-overview-main">
          {showcaseOrders.length > 0 && (
            <div className="account-recent-orders-card">
              <div className="account-card-header">
                <div>
                  <p className="eyebrow">ĐƠN HÀNG GẦN ĐÂY</p>
                  <h3>Lịch sử mua sắm</h3>
                </div>
                <Link href={"/tai-khoan/don-hang" as never} className="text-link">
                  Xem tất cả <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="account-order-list">
                {showcaseOrders.map((ord) => (
                  <div key={ord.id} className="account-order-row">
                    <div className="order-info">
                      <strong className="order-code">{ord.code}</strong>
                      <span className="order-item-name">{ord.items[0]?.productName}</span>
                      <span className="order-date">{ord.createdAt.toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="order-meta">
                      <span className="order-status-tag">{ord.status}</span>
                      <strong className="order-total">{formatVnd(ord.total)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="account-quick-nav-row">
            <Link href={"/tai-khoan/ho-so" as never} className="account-nav-card">
              <span>01</span>
              <strong>Thông tin hồ sơ</strong>
              <small>Họ tên, số điện thoại &amp; bảo mật</small>
            </Link>
            <Link href={"/tai-khoan/don-hang" as never} className="account-nav-card">
              <span>02</span>
              <strong>Quản lý đơn hàng</strong>
              <small>Lịch sử &amp; trạng thái giao vận</small>
            </Link>
          </div>
        </div>

        {/* Right Column: 5 cols */}
        <div className="account-overview-side">
          <div className="account-side-card">
            <div className="account-side-header">
              <p className="eyebrow">SỔ ĐỊA CHỈ</p>
              <h4>Địa chỉ nhận hàng</h4>
            </div>
            <p className="account-side-address">
              {showcaseAddresses[0]
                ? `${showcaseAddresses[0].label}: ${showcaseAddresses[0].line1}, ${showcaseAddresses[0].district}, ${showcaseAddresses[0].province}`
                : "Chưa có địa chỉ mặc định"}
            </p>
            <Link href={"/tai-khoan/dia-chi" as never} className="text-link">
              Quản lý địa chỉ <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="account-side-card">
            <div className="account-side-header">
              <p className="eyebrow">HỖ TRỢ SAU MUA</p>
              <h4>Chăm sóc &amp; bảo hành</h4>
            </div>
            <p className="account-side-support">Yêu cầu tư vấn bảo dưỡng định kỳ hoặc hỗ trợ kiểm tra nệm.</p>
            <Link href={"/tai-khoan/ho-tro" as never} className="text-link">
              Yêu cầu hỗ trợ <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Link href={"/nem" as never} className="account-nav-card account-nav-card-compact">
            <span>05</span>
            <strong>Danh mục nệm Thăng Long</strong>
            <small>Khám phá toàn bộ bộ sưu tập</small>
          </Link>
        </div>
      </div>

      <p className="muted account-guest-note">
        Đơn mua trước khi đăng nhập chưa được tự động liên kết. Vui lòng liên hệ hỗ trợ nếu cần tra cứu.
      </p>
    </main>
  );
}
