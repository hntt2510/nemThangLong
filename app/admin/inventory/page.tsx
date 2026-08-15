import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listInventory, parseInventoryFilters } from "@/lib/inventory-admin";
import { AdminInventoryAdjustments } from "@/components/admin-inventory-adjustments";

export const dynamic = "force-dynamic";
export default async function InventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth(); if (!session?.user) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>; if (session.user.role !== "ADMIN") return <main className="admin-placeholder"><h1>Không có quyền.</h1></main>;
  const prisma = getPrisma(); if (!prisma) return <main className="admin-placeholder"><h1>Không thể tải tồn kho.</h1></main>;
  const raw = await searchParams; const qs = new URLSearchParams(); for (const [key, value] of Object.entries(raw)) if (typeof value === "string") qs.set(key, value); const result = await listInventory(prisma, parseInventoryFilters(qs)).catch(() => null); if (!result) return <main className="admin-placeholder"><h1>Không thể tải tồn kho.</h1></main>;
  return <main className="admin-placeholder"><Link href="/admin/products">← Products</Link><p className="eyebrow">ADMIN / INVENTORY</p><h1>Tồn kho</h1><p className="muted">Điều chỉnh theo delta; không có ngưỡng tồn kho tự đặt.</p><AdminInventoryAdjustments initialItems={result.items} /></main>;
}
