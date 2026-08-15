import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getAdminProduct } from "@/lib/products";
import { isCatalogSlug } from "@/lib/admin-products";
import { AdminProductEditor, type AdminDocument } from "@/components/admin-product-editor";
import { AdminProductInitialize } from "@/components/admin-product-initialize";

export const dynamic = "force-dynamic";

export default async function AdminProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isCatalogSlug(slug)) notFound();
  const session = await auth();
  if (!session?.user) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>;
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return <main className="admin-placeholder"><h1>Không có quyền.</h1></main>;
  const product = await getAdminProduct(slug);
  if (!product) return <main className="admin-placeholder"><Link href={"/admin/products" as never}>← Catalog</Link><h1>Product chưa được khởi tạo.</h1><p>ADMIN cần khởi tạo document trước khi chỉnh sửa.</p>{session.user.role === "ADMIN" && <AdminProductInitialize slug={slug} />}</main>;
  const initialDocument: AdminDocument = { updatedAt: product.updatedAt.toISOString(), general: { name: product.name, eyebrow: product.eyebrow, description: product.description, status: product.status, isDemo: product.isDemo, mattressLab: product.mattressLab, modelUrl: product.modelUrl, posterUrl: product.posterUrl, content: product.content as Record<string, unknown> | null }, variants: product.variants.map((variant) => ({ id: variant.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice, sku: variant.sku, stock: variant.stock, active: variant.active })), media: product.media.map((media) => ({ id: media.id, type: media.type as "image" | "video" | "model", url: media.url, alt: media.alt, aspect: media.aspect ?? null, focalX: media.focalX, focalY: media.focalY, fit: media.fit as "cover" | "contain", sortOrder: media.sortOrder, isDemo: media.isDemo })), layers: product.layers.map((layer) => ({ id: layer.id, sortOrder: layer.sortOrder, name: layer.name, material: layer.material, thickness: layer.thickness, description: layer.description, textureUrl: layer.textureUrl, nodeName: layer.nodeName, explodeDistance: layer.explodeDistance, showHotspot: layer.showHotspot, published: layer.published })) };
  return <main className="admin-page"><aside className="admin-sidebar"><Link className="admin-logo" href="/nem">THĂNG LONG<small>Commerce OS</small></Link><nav><Link href="/admin/dashboard">Dashboard</Link><Link className="active" href="/admin/products">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/inventory">Inventory</Link><Link href="/admin/payment-reviews">Payment review</Link><Link href="/admin/leads">Leads</Link><Link href="/admin/after-sales">After-sales</Link></nav></aside><section className="admin-main"><div className="admin-topbar"><div><Link href="/admin/products">← Catalog</Link><p className="eyebrow">PRODUCT / {slug.toUpperCase()}</p><h1>{product.name}</h1></div><span className="admin-status">{session.user.role} · {product.status}</span></div><AdminProductEditor initialDocument={initialDocument} productId={product.id} slug={slug} /></section></main>;
}
