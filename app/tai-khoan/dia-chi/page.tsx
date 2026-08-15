import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listAccountAddresses } from "@/lib/account";
import { AccountAddressBook } from "@/components/account-address-book";

export const dynamic = "force-dynamic";

export default async function AddressesPage() { const session = await auth(); if (!session?.user?.id) return <main className="account-page container"><h1>Đăng nhập để xem địa chỉ.</h1><Link href="/dang-nhap">Đăng nhập</Link></main>; const prisma = getPrisma(); if (!prisma) return <main className="account-page container"><h1>Database chưa sẵn sàng.</h1></main>; const addresses = await listAccountAddresses(prisma, session.user.id).catch(() => []); return <main className="account-page container"><Link href="/tai-khoan">← Tài khoản</Link><p className="eyebrow">TÀI KHOẢN / ĐỊA CHỈ</p><h1>Địa chỉ đã lưu.</h1><AccountAddressBook initial={addresses} /></main>; }
