import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listAccountAddresses } from "@/lib/account";
import { AccountAddressBook } from "@/components/account-address-book";

export const dynamic = "force-dynamic";
import { isUiShowcaseMode, getShowcaseAddresses } from "@/lib/ui-showcase";

export default async function AddressesPage() {
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  if (!session?.user?.id && !showcase) return <main className="account-page container"><h1>Đăng nhập để xem địa chỉ.</h1><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  const prisma = getPrisma();
  const addresses = showcase ? getShowcaseAddresses() : prisma && session?.user?.id ? await listAccountAddresses(prisma, session.user.id).catch(() => null) : null;
  if (!addresses) return <main className="account-page container"><h1>Không thể tải địa chỉ.</h1><p className="muted">Đã xảy ra lỗi khi đọc dữ liệu.</p></main>;
  return <main className="account-page container"><Link href="/tai-khoan" className="text-link">← Tài khoản</Link><p className="eyebrow">TÀI KHOẢN / ĐỊA CHỈ</p><h1>Địa chỉ đã lưu.</h1><AccountAddressBook initial={addresses} /></main>;
}
