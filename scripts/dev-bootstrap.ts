import { PrismaClient, type Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { assertDevelopmentDatabaseTarget } from "../lib/database-safety";
import { localMenus, localPages, localStorefrontProducts, sourceReferences } from "../prisma/seed-data/storefront";

const FIXTURE_SOURCE_URL = "https://nemthanglong.local/internal-fixture";

function blockTitle(type: "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY") {
  return type === "AUDIENCE" ? "Phù hợp cho" : type === "MATERIAL_STORY" ? "Thông tin sản phẩm" : type === "DELIVERY" ? "Giao hàng" : "Bảo hành & hỗ trợ";
}

export async function bootstrapDevelopment(prisma: PrismaClient, source: NodeJS.ProcessEnv = process.env) {
  assertDevelopmentDatabaseTarget(source);
  const [adminHash, userHash] = await Promise.all([
    hash("ThangLong@Admin123", 12),
    hash("ThangLong@User123", 12),
  ]);

  await prisma.$transaction(async (tx: any) => {
    if (!tx.productCategory) {
      if (tx.siteSettings?.createMany) {
        await tx.siteSettings.createMany({ data: [{ id: "default" }], skipDuplicates: true });
      }
      for (const slug of ["america", "classic", "hoat-tinh", "memory-foam", "cao-su-thien-nhien", "luxury"]) {
        const existing = await tx.product.findUnique({ where: { slug }, select: { id: true } });
        if (!existing) {
          await tx.product.create({ data: { slug, name: slug, status: "DRAFT", isDemo: true } });
        }
      }
      return;
    }
    const category = await tx.productCategory.upsert({
      where: { slug: "nem" },
      update: { name: "Nệm", description: "Các dòng nệm Nệm Thăng Long.", status: "PUBLISHED", sortOrder: 10 },
      create: { slug: "nem", name: "Nệm", description: "Các dòng nệm Nệm Thăng Long.", status: "PUBLISHED", sortOrder: 10 },
    });
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

    const sources = new Map<string, string>();
    for (const item of sourceReferences) {
      const saved = await tx.sourceReference.upsert({
        where: { url: item.url },
        update: { title: item.title, publisher: item.publisher, notes: item.notes, sourceType: item.sourceType },
        create: { url: item.url, title: item.title, publisher: item.publisher, notes: item.notes, sourceType: item.sourceType },
      });
      sources.set(item.key, saved.id);
    }
    const fixtureSourceId = sources.get("fixture");
    if (!fixtureSourceId) throw new Error("Fixture source missing.");

    const savedProducts = new Map<string, { id: string; name: string }>();
    for (const product of localStorefrontProducts) {
      const [firmnessLabel, firmnessScore, support, breathability, motionIsolation] = product.profile;
      const saved = await tx.product.upsert({
        where: { slug: product.slug },
        update: {
          categoryId: category.id, name: product.name, eyebrow: product.eyebrow, description: product.description,
          status: "PUBLISHED", isDemo: false, presentation: product.presentation, saleStatus: "ACTIVE",
          verificationStatus: "PLACEHOLDER", sortOrder: product.sortOrder, mattressLab: false, modelUrl: null,
        },
        create: {
          categoryId: category.id, slug: product.slug, name: product.name, eyebrow: product.eyebrow,
          description: product.description, status: "PUBLISHED", isDemo: false, presentation: product.presentation,
          saleStatus: "ACTIVE", verificationStatus: "PLACEHOLDER", sortOrder: product.sortOrder, mattressLab: false,
        },
      });
      savedProducts.set(product.slug, saved);
      await tx.productProfile.upsert({
        where: { productId: saved.id },
        update: { firmnessLabel, firmnessScore, support, breathability, motionIsolation, dataStatus: product.profileStatus },
        create: { productId: saved.id, firmnessLabel, firmnessScore, support, breathability, motionIsolation, dataStatus: product.profileStatus },
      });
      for (const [sortOrder, [type, body]] of Object.entries(product.contentBlocks).entries()) {
        const sourceReferenceId = type === "DELIVERY" || type === "WARRANTY" ? sources.get("quality") : sources.get(product.slug === "cao-su-thien-nhien" ? "natural" : product.slug);
        await tx.productContentBlock.upsert({
          where: { productId_type: { productId: saved.id, type: type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY" } },
          update: { title: blockTitle(type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY"), body, status: "PUBLISHED", sortOrder, dataStatus: type === "MATERIAL_STORY" && product.slug !== "cao-su-thien-nhien" ? "PLACEHOLDER" : "VERIFIED", sourceReferenceId },
          create: { productId: saved.id, type: type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY", title: blockTitle(type as "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY"), body, status: "PUBLISHED", sortOrder, dataStatus: type === "MATERIAL_STORY" && product.slug !== "cao-su-thien-nhien" ? "PLACEHOLDER" : "VERIFIED", sourceReferenceId },
        });
      }
      for (const [sortOrder, fact] of product.facts.entries()) {
        await tx.productFact.upsert({
          where: { productId_key: { productId: saved.id, key: fact.key } },
          update: { label: fact.label, value: fact.value, sortOrder, dataStatus: fact.dataStatus, sourceReferenceId: sources.get(fact.sourceKey) },
          create: { productId: saved.id, key: fact.key, label: fact.label, value: fact.value, sortOrder, dataStatus: fact.dataStatus, sourceReferenceId: sources.get(fact.sourceKey) },
        });
      }
      const expectedSkus = product.variants.map((item) => item[5]);
      await tx.productVariant.deleteMany({
        where: {
          productId: saved.id,
          sku: { notIn: expectedSkus },
          orderItems: { none: {} },
          reservations: { none: {} },
          inventoryAdjustments: { none: {} },
        },
      });
      await tx.productVariant.updateMany({
        where: { productId: saved.id, sku: { notIn: expectedSkus } },
        data: { active: false },
      });
      for (const variant of product.variants) {
        const [width, length, thickness, price, compareAtPrice, sku, stock] = variant;
        await tx.productVariant.upsert({
          where: { productId_width_length_thickness: { productId: saved.id, width, length, thickness } },
          update: { productId: saved.id, width, length, thickness, price, compareAtPrice, stock, active: true, priceStatus: "PLACEHOLDER", stockStatus: "PLACEHOLDER", sourceReferenceId: fixtureSourceId },
          create: { productId: saved.id, width, length, thickness, price, compareAtPrice, sku, stock, active: true, priceStatus: "PLACEHOLDER", stockStatus: "PLACEHOLDER", sourceReferenceId: fixtureSourceId },
        });
      }
      for (const [index, url] of product.media.entries()) {
        const assetId = `seed-media-${product.slug}-${index + 1}`;
        const asset = await tx.mediaAsset.upsert({
          where: { id: assetId },
          update: { type: "image", url, alt: `${product.name} — góc chụp ${index + 1}`, sortOrder: index, isDemo: false, sourceType: "AI_GENERATED", reviewStatus: "APPROVED", sourceReferenceId: fixtureSourceId },
          create: { id: assetId, type: "image", url, alt: `${product.name} — góc chụp ${index + 1}`, sortOrder: index, isDemo: false, sourceType: "AI_GENERATED", reviewStatus: "APPROVED", sourceReferenceId: fixtureSourceId },
        });
        await tx.productMedia.upsert({
          where: { productId_mediaAssetId: { productId: saved.id, mediaAssetId: asset.id } },
          update: { role: index === 0 ? "primary" : "gallery", sortOrder: index },
          create: { productId: saved.id, mediaAssetId: asset.id, role: index === 0 ? "primary" : "gallery", sortOrder: index },
        });
      }
    }

    for (const page of localPages) {
      const saved = await tx.page.upsert({ where: { slug: page.slug }, update: { title: page.title, status: "PUBLISHED" }, create: { slug: page.slug, title: page.title, status: "PUBLISHED" } });
      for (const [sortOrder, section] of page.sections.entries()) {
        const savedSection = await tx.pageSection.upsert({
          where: { pageId_key: { pageId: saved.id, key: section.key } },
          update: { type: section.type, payload: section.payload, sortOrder, enabled: true },
          create: { pageId: saved.id, key: section.key, type: section.type, payload: section.payload, sortOrder, enabled: true },
        });
        if (page.slug === "home" && section.key === "hero") {
          const asset = await tx.mediaAsset.upsert({
            where: { id: "seed-page-home-hero" },
            update: { type: "image", url: "/images/homepage-hero.webp", alt: "Không gian nghỉ ngơi với nệm Thăng Long", sourceType: "AI_GENERATED", reviewStatus: "APPROVED", isDemo: false, sourceReferenceId: fixtureSourceId },
            create: { id: "seed-page-home-hero", type: "image", url: "/images/homepage-hero.webp", alt: "Không gian nghỉ ngơi với nệm Thăng Long", sourceType: "AI_GENERATED", reviewStatus: "APPROVED", isDemo: false, sourceReferenceId: fixtureSourceId },
          });
          await tx.pageSectionMedia.upsert({
            where: { pageSectionId_mediaAssetId: { pageSectionId: savedSection.id, mediaAssetId: asset.id } },
            update: { role: "primary", sortOrder: 0 },
            create: { pageSectionId: savedSection.id, mediaAssetId: asset.id, role: "primary", sortOrder: 0 },
          });
        }
      }
    }

    for (const menu of localMenus) {
      const saved = await tx.menu.upsert({ where: { key: menu.key }, update: { label: menu.label }, create: { key: menu.key, label: menu.label } });
      if (menu.key === "header-primary") {
        await tx.menuItem.deleteMany({ where: { menuId: saved.id, id: "seed-menu-primary-luxury" } });
      }
      if (menu.key === "footer-explore") {
        await tx.menuItem.deleteMany({ where: { menuId: saved.id, id: "seed-menu-footer-compare" } });
      }
      for (const item of menu.items) {
        await tx.menuItem.upsert({
          where: { id: item.id },
          update: { menuId: saved.id, label: item.label, href: item.href, sortOrder: item.sortOrder, enabled: true },
          create: { id: item.id, menuId: saved.id, label: item.label, href: item.href, sortOrder: item.sortOrder, enabled: true },
        });
      }
    }

    const admin = await tx.user.upsert({
      where: { email: "admin@nemthanglong.local" },
      update: { name: "Quản trị Nệm Thăng Long", passwordHash: adminHash, role: "ADMIN", emailVerified: new Date() },
      create: { email: "admin@nemthanglong.local", name: "Quản trị Nệm Thăng Long", passwordHash: adminHash, role: "ADMIN", emailVerified: new Date() },
    });
    const user = await tx.user.upsert({
      where: { email: "user@nemthanglong.local" },
      update: { name: "Khách hàng thử nghiệm", passwordHash: userHash, role: "CUSTOMER", emailVerified: new Date() },
      create: { email: "user@nemthanglong.local", name: "Khách hàng thử nghiệm", passwordHash: userHash, role: "CUSTOMER", emailVerified: new Date() },
    });
    const address = await tx.address.upsert({
      where: { id: "seed-user-address" },
      update: { userId: user.id, label: "Nhà riêng", fullName: "Khách hàng thử nghiệm", phone: "0900000000", line1: "79 Đường số 11", province: "TP.HCM", district: "Bình Tân" },
      create: { id: "seed-user-address", userId: user.id, label: "Nhà riêng", fullName: "Khách hàng thử nghiệm", phone: "0900000000", line1: "79 Đường số 11", province: "TP.HCM", district: "Bình Tân" },
    });
    await seedDashboardFixtures(tx, user.id, admin.id, address.id, savedProducts);
  });
}

async function seedDashboardFixtures(tx: Prisma.TransactionClient, userId: string, adminId: string, addressId: string, products: Map<string, { id: string; name: string }>) {
  const variants = await tx.productVariant.findMany({ where: { productId: { in: [...products.values()].map((item) => item.id) }, price: { not: null } }, orderBy: { sku: "asc" } });
  if (!variants.length) throw new Error("Fixture variants missing.");
  const states = [
    ["PENDING", "COD", "PENDING", "ACTIVE"], ["CONFIRMED", "BANK_TRANSFER", "PENDING", "ACTIVE"], ["PROCESSING", "MOMO", "PAID", "COMMITTED"], ["SHIPPED", "COD", "PENDING", "COMMITTED"],
    ["COMPLETED", "BANK_TRANSFER", "PAID", "COMMITTED"], ["CANCELLED", "MOMO", "FAILED", "RELEASED"], ["CONFIRMED", "COD", "PENDING", "ACTIVE"], ["PROCESSING", "BANK_TRANSFER", "REVIEW_REQUIRED", "RELEASED"],
  ] as const;
  for (const [index, [status, paymentMethod, paymentStatus, reservationStatus]] of states.entries()) {
    const variant = variants[index % variants.length]!;
    const price = variant.price ?? 0;
    const code = `FIX-2026-${String(index + 1).padStart(3, "0")}`;
    const order = await tx.order.upsert({
      where: { code },
      update: { userId, addressId, customerName: "Khách hàng thử nghiệm", customerPhone: "0900000000", subtotal: price, shippingFee: 0, total: price, status, paymentMethod, paymentStatus, shippingAddress: { line1: "79 Đường số 11", province: "TP.HCM" } },
      create: { code, userId, addressId, customerName: "Khách hàng thử nghiệm", customerPhone: "0900000000", subtotal: price, shippingFee: 0, total: price, status, paymentMethod, paymentStatus, shippingAddress: { line1: "79 Đường số 11", province: "TP.HCM" } },
    });
    const itemId = `seed-order-item-${index + 1}`;
    await tx.orderItem.upsert({
      where: { id: itemId },
      update: { orderId: order.id, variantId: variant.id, productName: [...products.values()].find((product) => product.id === variant.productId)?.name ?? "Nệm Thăng Long", sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: 1, unitPrice: price },
      create: { id: itemId, orderId: order.id, variantId: variant.id, productName: [...products.values()].find((product) => product.id === variant.productId)?.name ?? "Nệm Thăng Long", sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: 1, unitPrice: price },
    });
    await tx.paymentAttempt.upsert({
      where: { provider_providerOrderId: { provider: paymentMethod, providerOrderId: code } },
      update: { orderId: order.id, amount: price, status: paymentStatus },
      create: { orderId: order.id, provider: paymentMethod, providerOrderId: code, amount: price, status: paymentStatus },
    });
    const reservationId = `seed-reservation-${index + 1}`;
    const dates = reservationStatus === "ACTIVE" ? {} : reservationStatus === "COMMITTED" ? { committedAt: new Date() } : { releasedAt: new Date() };
    await tx.inventoryReservation.upsert({
      where: { id: reservationId },
      update: { orderId: order.id, variantId: variant.id, quantity: 1, status: reservationStatus, expiresAt: new Date(Date.now() + 30 * 60_000), ...dates },
      create: { id: reservationId, orderId: order.id, variantId: variant.id, quantity: 1, status: reservationStatus, expiresAt: new Date(Date.now() + 30 * 60_000), ...dates },
    });
  }
  const first = variants[0]!;
  await tx.inventoryAdjustment.upsert({
    where: { id: "seed-inventory-adjustment" },
    update: { variantId: first.id, delta: 5, reason: "RECEIPT", note: "Phiếu nhập fixture local", actorId: adminId, resultingStock: first.stock },
    create: { id: "seed-inventory-adjustment", variantId: first.id, delta: 5, reason: "RECEIPT", note: "Phiếu nhập fixture local", actorId: adminId, resultingStock: first.stock },
  });
  const leadStates = ["NEW", "IN_PROGRESS", "CLOSED", "NEW"] as const;
  for (const [index, status] of leadStates.entries()) {
    await tx.lead.upsert({
      where: { id: `seed-lead-${index + 1}` },
      update: { status, type: index % 2 ? "B2B_PROJECT" : "CONSULTATION", fullName: `Khách thử nghiệm ${index + 1}`, phone: `090000000${index}`, source: index % 2 ? "B2B_PAGE" : "CONTACT_PAGE" },
      create: { id: `seed-lead-${index + 1}`, status, type: index % 2 ? "B2B_PROJECT" : "CONSULTATION", fullName: `Khách thử nghiệm ${index + 1}`, phone: `090000000${index}`, source: index % 2 ? "B2B_PAGE" : "CONTACT_PAGE" },
    });
  }
  const fixtureOrders = await tx.order.findMany({ where: { code: { startsWith: "FIX-2026-" } }, include: { items: true }, orderBy: { code: "asc" }, take: 3 });
  for (const [index, order] of fixtureOrders.entries()) {
    const item = order.items[0];
    if (!item) continue;
    await tx.afterSalesRequest.upsert({
      where: { id: `seed-after-sales-${index + 1}` },
      update: { userId, orderId: order.id, orderItemId: item.id, type: index % 2 ? "PRODUCT_SUPPORT" : "WARRANTY_REVIEW", status: index === 2 ? "RESOLVED" : "REVIEWING", subject: "Yêu cầu fixture", description: "Yêu cầu sau mua dành cho môi trường local." },
      create: { id: `seed-after-sales-${index + 1}`, userId, orderId: order.id, orderItemId: item.id, type: index % 2 ? "PRODUCT_SUPPORT" : "WARRANTY_REVIEW", status: index === 2 ? "RESOLVED" : "REVIEWING", subject: "Yêu cầu fixture", description: "Yêu cầu sau mua dành cho môi trường local." },
    });
  }
  const reviews = ["Classic", "Cao su 3/4", "Hoạt Tính", "Memoryfoam", "Khách sạn", "America"];
  for (const [index, label] of reviews.entries()) {
    const product = [...products.values()][index]!;
    await tx.review.upsert({
      where: { id: `seed-review-${index + 1}` },
      update: { productId: product.id, authorName: `Khách hàng mẫu ${index + 1}`, rating: 5, body: `Đánh giá mẫu local cho dòng ${label}; không phải phản hồi khách hàng đã xác minh.`, approved: true, isFixture: true },
      create: { id: `seed-review-${index + 1}`, productId: product.id, authorName: `Khách hàng mẫu ${index + 1}`, rating: 5, body: `Đánh giá mẫu local cho dòng ${label}; không phải phản hồi khách hàng đã xác minh.`, approved: true, isFixture: true },
    });
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await bootstrapDevelopment(prisma);
    console.log("Development bootstrap complete.");
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("scripts/dev-bootstrap.ts")) void main();
