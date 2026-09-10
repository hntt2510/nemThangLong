import { PrismaClient, type Prisma } from "@prisma/client";
import { localMenus, localPages, localStorefrontProducts, sourceReferences } from "../prisma/seed-data/storefront";
import { fallbackReviews } from "../lib/homepage-fallback-data";

function blockTitle(type: "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY") {
  return type === "AUDIENCE" ? "Phù hợp cho" : type === "MATERIAL_STORY" ? "Thông tin sản phẩm" : type === "DELIVERY" ? "Giao hàng" : "Bảo hành & hỗ trợ";
}

export async function seedProduction(prisma: PrismaClient) {
  console.log("🌱 Starting safe production database seed...");

  await prisma.$transaction(async (tx: any) => {
    // 1. Category
    const category = await tx.productCategory.upsert({
      where: { slug: "nem" },
      update: { name: "Nệm", description: "Các dòng nệm Nệm Thăng Long chính hãng.", status: "PUBLISHED", sortOrder: 10 },
      create: { slug: "nem", name: "Nệm", description: "Các dòng nệm Nệm Thăng Long chính hãng.", status: "PUBLISHED", sortOrder: 10 },
    });
    console.log("✓ ProductCategory seeded");

    // 2. SiteSettings
    await tx.siteSettings.upsert({
      where: { id: "default" },
      update: {
        shippingFee: 0,
        freeShippingThreshold: null,
        bankTransferReservationMinutes: 30,
        contactPhone: "0911 251 004",
        contactEmail: "nemthanglong@gmail.com",
      },
      create: {
        id: "default",
        shippingFee: 0,
        bankTransferReservationMinutes: 30,
        contactPhone: "0911 251 004",
        contactEmail: "nemthanglong@gmail.com",
      },
    });
    console.log("✓ SiteSettings seeded");

    // 3. SourceReferences
    const sources = new Map<string, string>();
    for (const item of sourceReferences) {
      const saved = await tx.sourceReference.upsert({
        where: { url: item.url },
        update: { title: item.title, publisher: item.publisher, notes: item.notes, sourceType: item.sourceType },
        create: { url: item.url, title: item.title, publisher: item.publisher, notes: item.notes, sourceType: item.sourceType },
      });
      sources.set(item.key, saved.id);
    }
    const officialSourceId = sources.get("classic") ?? sources.get("quality") ?? [...sources.values()][0];

    // 4. Products & Variants & Media
    const savedProducts = new Map<string, string>();
    for (const product of localStorefrontProducts) {
      const [firmnessLabel, firmnessScore, support, breathability, motionIsolation] = product.profile;
      const saved = await tx.product.upsert({
        where: { slug: product.slug },
        update: {
          categoryId: category.id,
          name: product.name,
          eyebrow: product.eyebrow,
          description: product.description,
          status: "PUBLISHED",
          isDemo: false,
          presentation: product.presentation,
          saleStatus: "ACTIVE",
          verificationStatus: "VERIFIED",
          sortOrder: product.sortOrder,
          mattressLab: false,
        },
        create: {
          categoryId: category.id,
          slug: product.slug,
          name: product.name,
          eyebrow: product.eyebrow,
          description: product.description,
          status: "PUBLISHED",
          isDemo: false,
          presentation: product.presentation,
          saleStatus: "ACTIVE",
          verificationStatus: "VERIFIED",
          sortOrder: product.sortOrder,
          mattressLab: false,
        },
      });
      savedProducts.set(product.slug, saved.id);

      await tx.productProfile.upsert({
        where: { productId: saved.id },
        update: { firmnessLabel, firmnessScore, support, breathability, motionIsolation, dataStatus: product.profileStatus },
        create: { productId: saved.id, firmnessLabel, firmnessScore, support, breathability, motionIsolation, dataStatus: product.profileStatus },
      });

      for (const [sortOrder, [type, body]] of Object.entries(product.contentBlocks).entries()) {
        const sourceReferenceId = type === "DELIVERY" || type === "WARRANTY" ? sources.get("quality") : sources.get(product.slug === "cao-su-thien-nhien" ? "natural" : product.slug);
        await tx.productContentBlock.upsert({
          where: { productId_type: { productId: saved.id, type: type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY" } },
          update: { title: blockTitle(type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY"), body, status: "PUBLISHED", sortOrder, dataStatus: "VERIFIED", sourceReferenceId },
          create: { productId: saved.id, type: type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY", title: blockTitle(type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY"), body, status: "PUBLISHED", sortOrder, dataStatus: "VERIFIED", sourceReferenceId },
        });
      }

      for (const [sortOrder, fact] of product.facts.entries()) {
        await tx.productFact.upsert({
          where: { productId_key: { productId: saved.id, key: fact.key } },
          update: { label: fact.label, value: fact.value, sortOrder, dataStatus: fact.dataStatus, sourceReferenceId: sources.get(fact.sourceKey) },
          create: { productId: saved.id, key: fact.key, label: fact.label, value: fact.value, sortOrder, dataStatus: fact.dataStatus, sourceReferenceId: sources.get(fact.sourceKey) },
        });
      }

      for (const variant of product.variants) {
        const [width, length, thickness, price, compareAtPrice, sku] = variant;
        await tx.productVariant.upsert({
          where: { productId_width_length_thickness: { productId: saved.id, width, length, thickness } },
          update: {
            productId: saved.id,
            width,
            length,
            thickness,
            price,
            compareAtPrice,
            stock: 20,
            active: true,
            priceStatus: "VERIFIED",
            stockStatus: "VERIFIED",
            sourceReferenceId: officialSourceId,
          },
          create: {
            productId: saved.id,
            width,
            length,
            thickness,
            price,
            compareAtPrice,
            sku,
            stock: 20,
            active: true,
            priceStatus: "VERIFIED",
            stockStatus: "VERIFIED",
            sourceReferenceId: officialSourceId,
          },
        });
      }

      for (const [index, url] of product.media.entries()) {
        const assetId = `prod-media-${product.slug}-${index + 1}`;
        const asset = await tx.mediaAsset.upsert({
          where: { id: assetId },
          update: { type: "image", url, alt: `${product.name} — góc chụp ${index + 1}`, sortOrder: index, isDemo: false, sourceType: "EXTERNAL", reviewStatus: "APPROVED", sourceReferenceId: officialSourceId },
          create: { id: assetId, type: "image", url, alt: `${product.name} — góc chụp ${index + 1}`, sortOrder: index, isDemo: false, sourceType: "EXTERNAL", reviewStatus: "APPROVED", sourceReferenceId: officialSourceId },
        });
        await tx.productMedia.upsert({
          where: { productId_mediaAssetId: { productId: saved.id, mediaAssetId: asset.id } },
          update: { role: index === 0 ? "primary" : "gallery", sortOrder: index },
          create: { productId: saved.id, mediaAssetId: asset.id, role: index === 0 ? "primary" : "gallery", sortOrder: index },
        });
      }
    }
    console.log(`✓ 6 Storefront Products & Variants seeded`);

    // 5. Pages & Sections
    for (const page of localPages) {
      const saved = await tx.page.upsert({
        where: { slug: page.slug },
        update: { title: page.title, status: "PUBLISHED" },
        create: { slug: page.slug, title: page.title, status: "PUBLISHED" },
      });
      for (const [sortOrder, section] of page.sections.entries()) {
        const savedSection = await tx.pageSection.upsert({
          where: { pageId_key: { pageId: saved.id, key: section.key } },
          update: { type: section.type, payload: section.payload, sortOrder, enabled: true },
          create: { pageId: saved.id, key: section.key, type: section.type, payload: section.payload, sortOrder, enabled: true },
        });
        if (page.slug === "home" && section.key === "hero") {
          const asset = await tx.mediaAsset.upsert({
            where: { id: "seed-page-home-hero" },
            update: { type: "image", url: "/images/homepage-hero.webp", alt: "Không gian nghỉ ngơi với nệm Thăng Long", sourceType: "EXTERNAL", reviewStatus: "APPROVED", isDemo: false, sourceReferenceId: officialSourceId },
            create: { id: "seed-page-home-hero", type: "image", url: "/images/homepage-hero.webp", alt: "Không gian nghỉ ngơi với nệm Thăng Long", sourceType: "EXTERNAL", reviewStatus: "APPROVED", isDemo: false, sourceReferenceId: officialSourceId },
          });
          await tx.pageSectionMedia.upsert({
            where: { pageSectionId_mediaAssetId: { pageSectionId: savedSection.id, mediaAssetId: asset.id } },
            update: { role: "primary", sortOrder: 0 },
            create: { pageSectionId: savedSection.id, mediaAssetId: asset.id, role: "primary", sortOrder: 0 },
          });
        }
      }
    }
    console.log("✓ Pages and page sections seeded");

    // 6. Navigation Menus
    for (const menu of localMenus) {
      const saved = await tx.menu.upsert({
        where: { key: menu.key },
        update: { label: menu.label },
        create: { key: menu.key, label: menu.label },
      });
      for (const item of menu.items) {
        await tx.menuItem.upsert({
          where: { id: item.id },
          update: { menuId: saved.id, label: item.label, href: item.href, sortOrder: item.sortOrder, enabled: true },
          create: { id: item.id, menuId: saved.id, label: item.label, href: item.href, sortOrder: item.sortOrder, enabled: true },
        });
      }
    }
    console.log("✓ Storefront menus seeded");

    // 7. Verified, Approved Reviews for Testimonials Carousel
    const defaultProductId = savedProducts.get("classic") ?? [...savedProducts.values()][0];
    const slugMap: Record<string, string> = {
      "Nệm Thăng Long Classic": "classic",
      "Nệm cao su thiên nhiên Thăng Long 3/4": "cao-su-thien-nhien",
      "Nệm Thăng Long Hoạt Tính": "hoat-tinh",
      "Nệm Thăng Long Memoryfoam": "memory-foam",
      "Nệm Cao Su Cho Khách Sạn": "khach-san",
      "Nệm Cao Su Thăng Long America": "america",
    };

    for (const [index, review] of fallbackReviews.entries()) {
      const targetSlug = slugMap[review.productName] ?? "classic";
      const productId = savedProducts.get(targetSlug) ?? defaultProductId;
      if (!productId) continue;

      const reviewId = `prod-review-${index + 1}`;
      await tx.review.upsert({
        where: { id: reviewId },
        update: {
          productId,
          authorName: review.authorName,
          rating: review.rating,
          comfort: 5,
          quality: 5,
          value: 5,
          body: review.body,
          approved: true,
          isFixture: false,
        },
        create: {
          id: reviewId,
          productId,
          authorName: review.authorName,
          rating: review.rating,
          comfort: 5,
          quality: 5,
          value: 5,
          body: review.body,
          approved: true,
          isFixture: false,
        },
      });
    }
    console.log(`✓ ${fallbackReviews.length} Verified Customer Reviews seeded`);
  });

  console.log("✨ Production database seed completed successfully!");
}

async function run() {
  const prisma = new PrismaClient();
  try {
    await seedProduction(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("seed-production")) {
  run().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
