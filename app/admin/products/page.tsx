import Link from "next/link";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";
const badge = (value: string) => <span className={`ops-badge ${value.toLowerCase()}`}>{value}</span>;

export default async function AdminProductsPage() {
  const prisma = getPrisma();
  if (!prisma) return <section className="ops-empty-state"><h2>Database chưa sẵn sàng</h2><p>Không thể tải danh mục sản phẩm.</p></section>;
  const products = await prisma.product.findMany({ select: { id: true, slug: true, name: true, status: true, verificationStatus: true, saleStatus: true, _count: { select: { mediaLinks: true } }, variants: { where: { active: true }, select: { stock: true } }, mediaLinks: { take: 1, orderBy: { sortOrder: "asc" }, select: { mediaAsset: { select: { url: true } } } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }).catch(() => null);
  if (!products) return <section className="ops-empty-state"><h2>Không thể tải sản phẩm</h2><p>Hãy thử lại sau.</p></section>;
  return <div className="ops-stack"><section className="ops-page-heading"><div><p className="ops-overline">SẢN PHẨM</p><h2>Danh mục sản phẩm</h2><p>Quản lý nội dung, giá và media từ PostgreSQL.</p></div><Link className="ops-button" href={"/admin/categories" as never}>Quản lý loại sản phẩm</Link></section><section className="ops-card ops-table-card"><div className="ops-data-table"><div className="ops-data-head"><span>Sản phẩm</span><span>Xuất bản</span><span>Dữ liệu</span><span>Biến thể</span><span>Tồn kho</span><span /></div>{products.map((product) => { const stock = product.variants.reduce((total, item) => total + item.stock, 0); return <Link className="ops-data-row" key={product.id} href={`/admin/products/${product.slug}` as never}><span className="ops-product-cell">{product.mediaLinks[0] ? <img src={product.mediaLinks[0].mediaAsset.url} alt="" /> : <i>—</i>}<b>{product.name}<small>{product.slug} · {product._count.mediaLinks} ảnh</small></b></span><span>{badge(product.status)}</span><span>{badge(product.verificationStatus)}</span><span>{product.variants.length}</span><span>{stock}</span><span>Chỉnh sửa →</span></Link>; })}</div></section></div>;
}
