import { auth } from "@/auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getPrisma } from "@/lib/db";
import { getAdminDashboard, parseDashboardRange } from "@/lib/admin-dashboard";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await auth();
  const range = parseDashboardRange((await searchParams).range);
  const prisma = getPrisma();
  if (!session?.user || session.user.role !== "ADMIN") return <section className="ops-empty-state"><h2>Không có quyền truy cập</h2><p>Dashboard vận hành chỉ dành cho quản trị viên.</p></section>;
  if (!prisma) return <section className="ops-empty-state"><h2>Database chưa sẵn sàng</h2><p>Kiểm tra kết nối PostgreSQL rồi tải lại trang.</p></section>;
  const data = await getAdminDashboard(prisma, range).catch(() => null);
  if (!data) return <section className="ops-empty-state"><h2>Không thể tải dashboard</h2><p>Hãy thử lại sau.</p></section>;
  return <AdminDashboard data={data} range={range} />;
}
