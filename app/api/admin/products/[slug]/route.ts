import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { productInclude } from "@/lib/products";
import { adminProductDocumentSchema, isCatalogSlug } from "@/lib/admin-products";

async function authorize() {
  const session = await auth();
  if (!session?.user) return 401 as const;
  return session.user.role === "ADMIN" || session.user.role === "EDITOR" ? 200 as const : 403 as const;
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const { slug } = await context.params;
  if (!isCatalogSlug(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { const product = await prisma.product.findUnique({ where: { slug }, include: productInclude }); return product ? NextResponse.json(product) : NextResponse.json({ error: "Not found" }, { status: 404 }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const parsed = adminProductDocumentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload sản phẩm không hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const { slug } = await context.params;
  if (!isCatalogSlug(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const document = parsed.data;
  if (document.general.isDemo && document.variants.some((variant) => variant.active || variant.price !== null)) return NextResponse.json({ error: "Demo product không được có giá hoặc variant active." }, { status: 400 });
  const dimensionKeys = new Set<string>();
  for (const variant of document.variants) { const key = `${variant.width}:${variant.length}:${variant.thickness}`; if (dimensionKeys.has(key)) return NextResponse.json({ error: "Kích thước variant bị trùng." }, { status: 400 }); dimensionKeys.add(key); }
  try {
    const current = await prisma.product.findUnique({ where: { slug }, include: { variants: true, media: true, layers: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (document.general.isDemo && current.variants.some((variant) => variant.stock > 0)) return NextResponse.json({ error: "Không thể chuyển product còn tồn kho thành demo." }, { status: 400 });
    if (current.updatedAt.toISOString() !== document.updatedAt) return NextResponse.json({ error: "Sản phẩm đã được sửa ở nơi khác." }, { status: 409 });
    const saved = await prisma.$transaction(async (tx) => {
      const variantIds = new Set(document.variants.flatMap((item) => item.id ? [item.id] : []));
      const mediaIds = new Set(document.media.flatMap((item) => item.id ? [item.id] : []));
      const layerIds = new Set(document.layers.flatMap((item) => item.id ? [item.id] : []));
      if ([...variantIds].some((id) => !current.variants.some((item) => item.id === id)) || [...mediaIds].some((id) => !current.media.some((item) => item.id === id)) || [...layerIds].some((id) => !current.layers.some((item) => item.id === id))) throw new Error("OWNERSHIP");
      const skuRows = await tx.productVariant.findMany({ where: { sku: { in: document.variants.map((item) => item.sku) }, NOT: { productId: current.id } }, select: { sku: true } });
      if (skuRows.length) throw new Error("DUPLICATE_SKU");
      const detachedMediaUrls = current.media.filter((item) => !mediaIds.has(item.id)).map((item) => item.url);
      const updated = await tx.product.updateMany({ where: { id: current.id, updatedAt: new Date(document.updatedAt) }, data: { name: document.general.name, eyebrow: document.general.eyebrow ?? null, description: document.general.description ?? null, status: document.general.status, isDemo: document.general.isDemo, mattressLab: document.general.mattressLab, modelUrl: detachedMediaUrls.includes(document.general.modelUrl ?? "") ? null : document.general.modelUrl ?? null, posterUrl: detachedMediaUrls.includes(document.general.posterUrl ?? "") ? null : document.general.posterUrl ?? null, content: document.general.content ? document.general.content as Prisma.InputJsonValue : Prisma.JsonNull } });
      if (updated.count !== 1) throw new Error("OPTIMISTIC_CONFLICT");
      await tx.productVariant.updateMany({ where: { productId: current.id, id: { notIn: [...variantIds] } }, data: { active: false } });
      await tx.mediaAsset.deleteMany({ where: { productId: current.id, id: { notIn: [...mediaIds] } } });
      await tx.productLayer.deleteMany({ where: { productId: current.id, id: { notIn: [...layerIds] } } });
      for (const variant of document.variants) {
        const data = { productId: current.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice ?? null, sku: variant.sku, active: variant.active };
        if (variant.id) await tx.productVariant.update({ where: { id: variant.id }, data }); else await tx.productVariant.create({ data: { ...data, stock: 0 } });
      }
      for (const media of document.media) {
        const data = { productId: current.id, type: media.type, url: media.url, alt: media.alt, aspect: media.aspect ?? null, focalX: media.focalX ?? .5, focalY: media.focalY ?? .5, fit: media.fit ?? "cover", sortOrder: media.sortOrder, isDemo: media.isDemo ?? false };
        if (media.id) await tx.mediaAsset.update({ where: { id: media.id }, data }); else await tx.mediaAsset.create({ data });
      }
      for (const layer of document.layers) {
        const data = { productId: current.id, sortOrder: layer.sortOrder, name: layer.name, material: layer.material ?? null, thickness: layer.thickness ?? null, description: layer.description ?? null, textureUrl: layer.textureUrl ?? null, nodeName: layer.nodeName ?? null, explodeDistance: layer.explodeDistance ?? 0, showHotspot: layer.showHotspot ?? false, published: layer.published };
        if (layer.id) await tx.productLayer.update({ where: { id: layer.id }, data }); else await tx.productLayer.create({ data });
      }
      return tx.product.findUnique({ where: { id: current.id }, include: productInclude });
    });
    revalidatePath(`/nem/${slug}`); revalidatePath(`/nem/${slug}/lab`); revalidatePath("/");
    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof Error && error.message === "OWNERSHIP") return NextResponse.json({ error: "Bản ghi không thuộc product này." }, { status: 400 });
    if (error instanceof Error && error.message === "DUPLICATE_SKU") return NextResponse.json({ error: "SKU đã tồn tại." }, { status: 409 });
    if (error instanceof Error && error.message === "OPTIMISTIC_CONFLICT") return NextResponse.json({ error: "Sản phẩm đã được sửa ở nơi khác." }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "SKU hoặc kích thước đã tồn tại." }, { status: 409 });
    return NextResponse.json({ error: "Không thể lưu sản phẩm." }, { status: 503 });
  }
}
