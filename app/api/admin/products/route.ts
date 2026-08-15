import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { CATALOG_SLUGS } from "@/lib/product-data";
import { catalogSlugSchema, initializeAdminProduct, neutralProductName } from "@/lib/admin-products";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function role() { return (await auth())?.user?.role ?? null; }

export async function GET() {
  const currentRole = await role();
  if (!currentRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (currentRole !== "ADMIN" && currentRole !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const products = await prisma.product.findMany({ where: { slug: { in: [...CATALOG_SLUGS] } }, orderBy: { slug: "asc" }, select: { id: true, slug: true, name: true, status: true, isDemo: true, updatedAt: true, _count: { select: { media: true } }, variants: { where: { active: true }, select: { price: true, stock: true } } } });
    return NextResponse.json(CATALOG_SLUGS.map((slug) => { const product = products.find((item) => item.slug === slug); return product ? { ...product, activeVariantCount: product.variants.length, purchasableVariantCount: product.isDemo ? 0 : product.variants.filter((variant) => variant.price !== null && variant.price > 0 && variant.stock > 0).length, variants: undefined, mediaCount: product._count.media } : { slug, name: neutralProductName(slug), status: null, isDemo: null, updatedAt: null, activeVariantCount: 0, purchasableVariantCount: 0, mediaCount: 0 }; }));
  } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const currentRole = await role();
  if (!currentRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (currentRole !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z.object({ slug: catalogSlugSchema }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Slug không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const product = await initializeAdminProduct(prisma, parsed.data.slug);
    revalidatePath("/admin/products");
    return NextResponse.json(product, { status: 201 });
  } catch { return NextResponse.json({ error: "Không thể khởi tạo sản phẩm." }, { status: 503 }); }
}
