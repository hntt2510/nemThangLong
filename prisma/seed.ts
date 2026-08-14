import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.upsert({ where: { slug: "luxury" }, update: {}, create: { slug: "luxury", name: "Nệm Thăng Long Luxury", eyebrow: "THE THĂNG LONG SIGNATURE", description: "Một trải nghiệm nghỉ ngơi cân bằng giữa độ êm, độ nâng đỡ và sự hồi đáp tự nhiên.", status: "PUBLISHED", mattressLab: true, posterUrl: "/images/luxury-hero.png" } });
  await prisma.productVariant.upsert({ where: { sku: "TL-LUX-160-200-15" }, update: {}, create: { productId: product.id, width: 160, length: 200, thickness: 15, price: 18900000, sku: "TL-LUX-160-200-15", stock: 6, active: true } });
  await prisma.productVariant.upsert({ where: { sku: "TL-LUX-180-200-20" }, update: {}, create: { productId: product.id, width: 180, length: 200, thickness: 20, price: null, sku: "TL-LUX-180-200-20", stock: 0, active: true } });
  for (const [index, file] of ["luxury-hero.png", "luxury-detail.png", "luxury-lifestyle.png"].entries()) await prisma.mediaAsset.upsert({ where: { id: `demo-media-${index}` }, update: {}, create: { id: `demo-media-${index}`, productId: product.id, type: "image", url: `/images/${file}`, alt: "Thăng Long Luxury demo asset", sortOrder: index, isDemo: true } });
}

main().finally(() => prisma.$disconnect());
