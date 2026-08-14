import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.upsert({
    where: { slug: "luxury" },
    update: {
      name: "Nệm Thăng Long Luxury",
      eyebrow: "THE THĂNG LONG SIGNATURE",
      description: "Một trải nghiệm nghỉ ngơi đang được hoàn thiện trong CMS.",
      content: Prisma.JsonNull,
      status: "PUBLISHED",
      isDemo: true,
      mattressLab: true,
      modelUrl: null,
      posterUrl: "/images/luxury-hero.png",
    },
    create: {
      slug: "luxury",
      name: "Nệm Thăng Long Luxury",
      eyebrow: "THE THĂNG LONG SIGNATURE",
      description: "Một trải nghiệm nghỉ ngơi đang được hoàn thiện trong CMS.",
      status: "PUBLISHED",
      isDemo: true,
      mattressLab: true,
      posterUrl: "/images/luxury-hero.png",
    },
  });

  for (const variant of [
    { width: 160, length: 200, thickness: 15, sku: "TL-LUX-160-200-15" },
    { width: 180, length: 200, thickness: 20, sku: "TL-LUX-180-200-20" },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: variant.sku },
      update: { productId: product.id, price: null, compareAtPrice: null, stock: 0, active: false },
      create: { ...variant, productId: product.id, price: null, stock: 0, active: false },
    });
  }

  await prisma.productLayer.deleteMany({ where: { productId: product.id } });
  for (const [index, file] of ["luxury-hero.png", "luxury-detail.png", "luxury-lifestyle.png"].entries()) {
    await prisma.mediaAsset.upsert({
      where: { id: `demo-media-${index}` },
      update: { productId: product.id, type: "image", url: `/images/${file}`, alt: "Hình ảnh minh họa Luxury", sortOrder: index, isDemo: true },
      create: { id: `demo-media-${index}`, productId: product.id, type: "image", url: `/images/${file}`, alt: "Hình ảnh minh họa Luxury", sortOrder: index, isDemo: true },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { shippingFee: null, freeShippingThreshold: null, bankTransferReservationMinutes: null, bankTransferInfo: Prisma.JsonNull },
    create: { id: "default", shippingFee: null, freeShippingThreshold: null, bankTransferReservationMinutes: null, bankTransferInfo: Prisma.JsonNull },
  });
}

main().finally(() => prisma.$disconnect());
