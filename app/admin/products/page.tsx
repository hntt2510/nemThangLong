import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { CATALOG_SLUGS } from "@/lib/product-data";
import { neutralProductName } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>;
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return <main className="admin-placeholder"><h1>Không có quyền.</h1></main>;
  const prisma = getPrisma();
  if (!prisma) return <main className="admin-placeholder"><h1>Không thể tải sản phẩm.</h1><p>Database chưa sẵn sàng.</p></main>;
  const products = await prisma.product.findMany({ where: { slug: { in: [...CATALOG_SLUGS] } }, select: { id: true, slug: true, name: true, status: true, isDemo: true, updatedAt: true, _count: { select: { media: true } }, variants: { where: { active: true }, select: { price: true, stock: true } } }, orderBy: { slug: "asc" } }).catch(() => null);
  if (!products) return <main className="admin-placeholder"><h1>Không thể tải sản phẩm.</h1><p>Đã xảy ra lỗi khi đọc dữ liệu.</p></main>;
  return <main className="admin-placeholder"><Link href="/admin/dashboard">← Dashboard</Link><p className="eyebrow">ADMIN / PRODUCTS</p><h1>Catalog CMS</h1><p className="muted">Sáu dòng nệm được quản lý từ Prisma.</p><div className="admin-order-list">{CATALOG_SLUGS.map((slug) => { const product = products.find((item) => item.slug === slug); const active = product?.variants.length ?? 0; const purchasable = product?.variants.filter((item) => item.price !== null && item.price > 0 && item.stock > 0).length ?? 0; return <Link key={slug} className="admin-order-card" href={`/admin/products/${slug}`}><div><strong>{product?.name ?? neutralProductName(slug)}</strong><span>{slug} · {product?.status ?? "CHƯA KHỞI TẠO"} {product?.isDemo ? "· DEMO" : ""}</span></div><div><span>{active} active · {purchasable} purchasable · {product?._count.media ?? 0} media</span><small>{product?.updatedAt ? product.updatedAt.toLocaleString("vi-VN") : "Chưa có document"}</small></div></Link>; })}</div></main>;
}
