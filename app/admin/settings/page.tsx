import Link from "next/link";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/products";
import { AdminSettingsForm } from "@/components/admin-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "EDITOR"].includes(session.user.role)) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>;
  const settings = await getSiteSettings();
  return <main className="admin-placeholder"><Link href="/admin">← Product editor</Link><p className="eyebrow">ADMIN / SETTINGS</p><h1>Site settings</h1><p>Checkout chỉ mở khi phí vận chuyển và phương thức thanh toán đã được cấu hình.</p><AdminSettingsForm initial={settings ? { shippingFee: settings.shippingFee, freeShippingThreshold: settings.freeShippingThreshold, bankTransferReservationMinutes: settings.bankTransferReservationMinutes, bankTransferInfo: settings.bankTransferInfo as Record<string, unknown> | null } : null} /></main>;
}
