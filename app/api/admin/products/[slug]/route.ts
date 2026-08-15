import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { productInclude } from "@/lib/products";
import { adminProductDocumentSchema, isCatalogSlug, saveAdminProductDocument } from "@/lib/admin-products";

async function authorize() { const session = await auth(); if (!session?.user) return 401 as const; return session.user.role === "ADMIN" || session.user.role === "EDITOR" ? 200 as const : 403 as const; }

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const status = await authorize(); if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const { slug } = await context.params; if (!isCatalogSlug(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { const product = await prisma.product.findUnique({ where: { slug }, include: productInclude }); return product ? NextResponse.json(product) : NextResponse.json({ error: "Not found" }, { status: 404 }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const status = await authorize(); if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const parsed = adminProductDocumentSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Payload sản phẩm không hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const { slug } = await context.params; if (!isCatalogSlug(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { const saved = await saveAdminProductDocument(prisma, slug, parsed.data); revalidatePath(`/nem/${slug}`); revalidatePath(`/nem/${slug}/lab`); revalidatePath("/"); return NextResponse.json(saved); } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (["OWNERSHIP", "DEMO_PRODUCT_INVALID", "DEMO_PRODUCT_STOCK", "DUPLICATE_DIMENSIONS"].includes(code)) return NextResponse.json({ error: "Payload sản phẩm không hợp lệ." }, { status: 400 });
    if (["DUPLICATE_SKU", "OPTIMISTIC_CONFLICT"].includes(code) || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) return NextResponse.json({ error: code === "OPTIMISTIC_CONFLICT" ? "Sản phẩm đã được sửa ở nơi khác." : "SKU hoặc kích thước đã tồn tại." }, { status: 409 });
    return NextResponse.json({ error: "Không thể lưu sản phẩm." }, { status: 503 });
  }
}
