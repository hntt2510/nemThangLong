import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountProfile } from "@/lib/account";
import { AccountProfileForm } from "@/components/account-profile-form";

export const dynamic = "force-dynamic";

import { isUiShowcaseMode, getShowcaseProfile } from "@/lib/ui-showcase";

export default async function ProfilePage() {
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  if (!session?.user?.id && !showcase) return <main className="account-page container"><h1>Đăng nhập để xem hồ sơ.</h1><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  const prisma = getPrisma();
  const profile = showcase ? getShowcaseProfile() : prisma && session?.user?.id ? await getAccountProfile(prisma, session.user.id).catch(() => null) : null;
  if (!profile) return <main className="account-page container"><h1>Không thể tải hồ sơ.</h1></main>;
  return <main className="account-page container"><Link href="/tai-khoan" className="text-link">← Tài khoản</Link><p className="eyebrow">TÀI KHOẢN / HỒ SƠ</p><h1>Thông tin của bạn.</h1><AccountProfileForm initial={{ name: profile.name ?? "", phone: profile.phone ?? "" }} /></main>;
}
