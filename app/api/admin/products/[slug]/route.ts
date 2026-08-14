import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { productInclude } from "@/lib/products";

const variantSchema = z.object({ id: z.string().optional(), width: z.number().int().min(1), length: z.number().int().min(1), thickness: z.number().int().min(1), price: z.number().int().positive().nullable(), compareAtPrice: z.number().int().positive().nullable().optional(), sku: z.string().min(1), stock: z.number().int().min(0), active: z.boolean() });
const mediaSchema = z.object({ id: z.string().optional(), type: z.enum(["image", "video", "model"]), url: z.string().min(1), alt: z.string().min(1), aspect: z.string().nullable().optional(), focalX: z.number().min(0).max(1).optional(), focalY: z.number().min(0).max(1).optional(), fit: z.enum(["cover", "contain"]).optional(), sortOrder: z.number().int().min(0), isDemo: z.boolean().optional() });
const layerSchema = z.object({ id: z.string().optional(), sortOrder: z.number().int().min(0), name: z.string().min(1), material: z.string().nullable().optional(), thickness: z.string().nullable().optional(), description: z.string().nullable().optional(), textureUrl: z.string().url().nullable().optional(), nodeName: z.string().nullable().optional(), explodeDistance: z.number().min(0).optional(), showHotspot: z.boolean().optional(), published: z.boolean() });
const documentSchema = z.object({ updatedAt: z.string().datetime(), general: z.object({ name: z.string().min(2), eyebrow: z.string().nullable().optional(), description: z.string().nullable().optional(), status: z.enum(["DRAFT", "PUBLISHED"]), isDemo: z.boolean(), mattressLab: z.boolean(), modelUrl: z.string().min(1).nullable().optional(), posterUrl: z.string().min(1).nullable().optional(), content: z.record(z.unknown()).nullable().optional() }), variants: z.array(variantSchema), media: z.array(mediaSchema), layers: z.array(layerSchema) });

async function requireEditor() {
  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await requireEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const { slug } = await context.params;
  try { const product = await prisma.product.findUnique({ where: { slug }, include: productInclude }); return product ? NextResponse.json(product) : NextResponse.json({ error: "Not found" }, { status: 404 }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await requireEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = documentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload sản phẩm không hợp lệ." }, { status: 400 });
  const { slug } = await context.params;
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  if (parsed.data.general.isDemo && parsed.data.variants.some((variant) => variant.active || variant.price !== null || variant.stock > 0)) return NextResponse.json({ error: "Demo product không được có giá hoặc tồn kho." }, { status: 400 });
  try {
    const current = await prisma.product.findUnique({ where: { slug }, include: { variants: { select: { id: true } }, media: { select: { id: true } }, layers: { select: { id: true } } } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (current.updatedAt.toISOString() !== parsed.data.updatedAt) return NextResponse.json({ error: "Sản phẩm đã được cập nhật ở nơi khác. Hãy tải lại trước khi lưu." }, { status: 409 });
    const saved = await prisma.$transaction(async (tx) => {
      const variantIds = parsed.data.variants.flatMap((variant) => variant.id ? [variant.id] : []);
      const mediaIds = parsed.data.media.flatMap((media) => media.id ? [media.id] : []);
      const layerIds = parsed.data.layers.flatMap((layer) => layer.id ? [layer.id] : []);
      const updated = await tx.product.updateMany({ where: { id: current.id, updatedAt: new Date(parsed.data.updatedAt) }, data: {
        name: parsed.data.general.name,
        eyebrow: parsed.data.general.eyebrow ?? null,
        description: parsed.data.general.description ?? null,
        status: parsed.data.general.status,
        isDemo: parsed.data.general.isDemo,
        mattressLab: parsed.data.general.mattressLab,
        modelUrl: parsed.data.general.modelUrl ?? null,
        posterUrl: parsed.data.general.posterUrl ?? null,
        content: parsed.data.general.content ? parsed.data.general.content as Prisma.InputJsonValue : Prisma.JsonNull,
      } });
      if (updated.count !== 1) throw new Error("OPTIMISTIC_CONFLICT");
      await tx.productVariant.updateMany({ where: { productId: current.id, id: { notIn: variantIds } }, data: { active: false } });
      await tx.mediaAsset.deleteMany({ where: { productId: current.id, id: { notIn: mediaIds } } });
      await tx.productLayer.deleteMany({ where: { productId: current.id, id: { notIn: layerIds } } });
      for (const variant of parsed.data.variants) {
        const data = { productId: current.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice ?? null, sku: variant.sku, stock: variant.stock, active: variant.active };
        if (variant.id) await tx.productVariant.update({ where: { id: variant.id }, data }); else await tx.productVariant.create({ data });
      }
      for (const media of parsed.data.media) {
        const data = { productId: current.id, type: media.type, url: media.url, alt: media.alt, aspect: media.aspect ?? null, focalX: media.focalX ?? .5, focalY: media.focalY ?? .5, fit: media.fit ?? "cover", sortOrder: media.sortOrder, isDemo: media.isDemo ?? false };
        if (media.id) await tx.mediaAsset.update({ where: { id: media.id }, data }); else await tx.mediaAsset.create({ data });
      }
      for (const layer of parsed.data.layers) {
        const data = { productId: current.id, sortOrder: layer.sortOrder, name: layer.name, material: layer.material ?? null, thickness: layer.thickness ?? null, description: layer.description ?? null, textureUrl: layer.textureUrl ?? null, nodeName: layer.nodeName ?? null, explodeDistance: layer.explodeDistance ?? 0, showHotspot: layer.showHotspot ?? false, published: layer.published };
        if (layer.id) await tx.productLayer.update({ where: { id: layer.id }, data }); else await tx.productLayer.create({ data });
      }
      return tx.product.findUnique({ where: { id: current.id }, include: productInclude });
    });
    revalidatePath(`/nem/${slug}`); revalidatePath(`/nem/${slug}/lab`);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể lưu sản phẩm.";
    return NextResponse.json({ error: /database server|P1001|Can't reach/i.test(message) ? "Database hiện chưa khả dụng." : message === "OPTIMISTIC_CONFLICT" ? "Sản phẩm đã được sửa ở nơi khác." : message }, { status: /database server|P1001|Can't reach/i.test(message) ? 503 : 409 });
  }
}
