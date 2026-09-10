import { getPrisma } from "@/lib/db";
import { listInventory } from "@/lib/inventory-admin";
import { AdminInventoryAdjustments } from "@/components/admin-inventory-adjustments";

export const dynamic = "force-dynamic";
export default async function InventoryPage() {
  const prisma = getPrisma();
  if (!prisma) return <section className="ops-empty-state"><h2>Database chưa sẵn sàng</h2><p>Không thể tải tồn kho.</p></section>;
  const result = await listInventory(prisma, { slug: "", active: undefined, zeroStock: false, page: 1 }).catch(() => null);
  if (!result) return <section className="ops-empty-state"><h2>Không thể tải tồn kho</h2><p>Hãy thử lại sau.</p></section>;
  return <div className="ops-stack"><section className="ops-page-heading"><div><p className="ops-overline">SẢN PHẨM</p><h2>Tồn kho</h2><p>Điều chỉnh theo từng kích thước. Hệ thống luôn lưu lịch sử thay đổi.</p></div></section><AdminInventoryAdjustments initialItems={result.items} /></div>;
}
