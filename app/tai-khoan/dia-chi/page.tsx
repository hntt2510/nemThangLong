import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listAccountAddresses } from "@/lib/account";
import { AccountAddressBook } from "@/components/account-address-book";

export const dynamic = "force-dynamic";
export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) return <main className="account-page container"><h1>Đăng nhập để xem địa chỉ.</h1><Link href="/dang-nhap">Đăng nhập</Link></main>;
  const prisma = getPrisma();
  if (!prisma) return <main className="account-page container"><h1>Không thể tải địa chỉ.</h1><p className="muted">Database chưa sẵn sàng.</p></main>;
  const result = await listAccountAddresses(prisma, session.user.id).then((addresses) => ({ ok: true as const, addresses })).catch(() => ({ ok: false as const }));
  if (!result.ok) return <main className="account-page container"><h1>Không thể tải địa chỉ.</h1><p className="muted">Đã xảy ra lỗi khi đọc dữ liệu.</p></main>;
  return <main className="account-page container"><Link href="/tai-khoan">← Tài khoản</Link><p className="eyebrow">TÀI KHOẢN / ĐỊA CHỈ</p><h1>Địa chỉ đã lưu.</h1><AccountAddressBook initial={result.addresses} /></main>;
}
