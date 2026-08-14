import Link from "next/link";
import { auth } from "@/auth";
import { getAdminProduct } from "@/lib/products";
import {
  AdminProductEditor,
  type AdminDocument,
} from "@/components/admin-product-editor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !["ADMIN", "EDITOR"].includes(role))
    return (
      <main className="admin-access-denied">
        <p className="eyebrow">THĂNG LONG COMMERCE</p>
        <h1>Admin access required.</h1>
        <p>Đăng nhập bằng tài khoản quản trị để mở product editor.</p>
        <Link href="/dang-nhap" className="button button-primary">
          Đăng nhập
        </Link>
      </main>
    );
  const product = await getAdminProduct("luxury");
  if (!product)
    return (
      <main className="admin-access-denied">
        <p className="eyebrow">PRODUCT / LUXURY</p>
        <h1>Database chưa sẵn sàng.</h1>
        <p>Không thể tải product document để chỉnh sửa.</p>
      </main>
    );
  const initialDocument: AdminDocument = {
    updatedAt: product.updatedAt.toISOString(),
    general: {
      name: product.name,
      eyebrow: product.eyebrow,
      description: product.description,
      status: product.status,
      isDemo: product.isDemo,
      mattressLab: product.mattressLab,
      modelUrl: product.modelUrl,
      posterUrl: product.posterUrl,
      content: product.content as Record<string, unknown> | null,
    },
    variants: product.variants.map((variant) => ({
      id: variant.id,
      width: variant.width,
      length: variant.length,
      thickness: variant.thickness,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      sku: variant.sku,
      stock: variant.stock,
      active: variant.active,
    })),
    media: product.media.map((media) => ({
      id: media.id,
      type: media.type as "image" | "video" | "model",
      url: media.url,
      alt: media.alt,
      aspect: media.aspect,
      focalX: media.focalX,
      focalY: media.focalY,
      fit: media.fit as "cover" | "contain",
      sortOrder: media.sortOrder,
      isDemo: media.isDemo,
    })),
    layers: product.layers.map((layer) => ({
      id: layer.id,
      sortOrder: layer.sortOrder,
      name: layer.name,
      material: layer.material,
      thickness: layer.thickness,
      description: layer.description,
      textureUrl: layer.textureUrl,
      nodeName: layer.nodeName,
      explodeDistance: layer.explodeDistance,
      showHotspot: layer.showHotspot,
      published: layer.published,
    })),
  };
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/nem/luxury">
          THĂNG LONG<small>Commerce OS</small>
        </Link>
        <nav>
          <Link className="active" href="/admin">
            Product
          </Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/reviews">Reviews</Link>
          <Link href={"/admin/leads" as never}>Leads</Link>
          <Link href="/admin/settings">Site settings</Link>
        </nav>
        <Link href="/nem/luxury" className="admin-back">
          ← Storefront
        </Link>
      </aside>
      <section className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">PRODUCT / LUXURY</p>
            <h1>{product.name}</h1>
          </div>
          <div className="admin-status">
            <span className="status-dot live" />
            {role} · Live document
          </div>
        </div>
        <AdminProductEditor
          initialDocument={initialDocument}
          productId={product.id}
        />
      </section>
    </main>
  );
}
