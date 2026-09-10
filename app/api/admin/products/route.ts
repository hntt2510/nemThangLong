import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { catalogSlugSchema, initializeAdminProduct } from "@/lib/admin-products";
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
    const products = await prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, slug: true, name: true, status: true, isDemo: true, verificationStatus: true, saleStatus: true, updatedAt: true, _count: { select: { mediaLinks: true } }, variants: { where: { active: true }, select: { price: true, stock: true } } } });
    return NextResponse.json(products.map((product) => ({ ...product, activeVariantCount: product.variants.length, purchasableVariantCount: product.saleStatus === "ACTIVE" ? product.variants.filter((variant) => variant.price !== null && variant.price > 0 && variant.stock > 0).length : 0, variants: undefined, mediaCount: product._count.mediaLinks })));
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
