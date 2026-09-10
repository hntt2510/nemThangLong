import "server-only";

import type { PrismaClient } from "@prisma/client";
import { maskEmail, maskPhone } from "@/lib/leads";

export type DashboardRange = "7d" | "30d";

export function parseDashboardRange(value: string | null | undefined): DashboardRange {
  return value === "30d" ? "30d" : "7d";
}

export async function getAdminDashboard(prisma: PrismaClient, range: DashboardRange, now = new Date()) {
  const since = new Date(now.getTime() - (range === "30d" ? 30 : 7) * 24 * 60 * 60 * 1000);
  const orderWhere = { createdAt: { gte: since } } as const;
  const [
    recentOrderTotal,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    completedOrders,
    cancelledOrders,
    pendingPayments,
    reviewRequired,
    paidRevenue,
    newLeads,
    inProgressLeads,
    submittedAfterSales,
    reviewingAfterSales,
    zeroStockVariants,
    lowStockVariants,
    recentOrdersForSeries,
    productQuality,
    recentOrders,
    recentLeads,
    recentAfterSales,
  ] = await prisma.$transaction([
    prisma.order.count({ where: orderWhere }),
    prisma.order.count({ where: { ...orderWhere, status: "PENDING" } }),
    prisma.order.count({ where: { ...orderWhere, status: "CONFIRMED" } }),
    prisma.order.count({ where: { ...orderWhere, status: "PROCESSING" } }),
    prisma.order.count({ where: { ...orderWhere, status: "SHIPPED" } }),
    prisma.order.count({ where: { ...orderWhere, status: "COMPLETED" } }),
    prisma.order.count({ where: { ...orderWhere, status: "CANCELLED" } }),
    prisma.order.count({ where: { ...orderWhere, paymentStatus: "PENDING" } }),
    prisma.order.count({ where: { ...orderWhere, paymentStatus: "REVIEW_REQUIRED" } }),
    prisma.order.aggregate({ where: { ...orderWhere, paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.lead.count({ where: { createdAt: { gte: since }, status: "NEW" } }),
    prisma.lead.count({ where: { createdAt: { gte: since }, status: "IN_PROGRESS" } }),
    prisma.afterSalesRequest.count({ where: { createdAt: { gte: since }, status: "SUBMITTED" } }),
    prisma.afterSalesRequest.count({ where: { createdAt: { gte: since }, status: "REVIEWING" } }),
    prisma.productVariant.count({ where: { active: true, stock: 0 } }),
    prisma.productVariant.count({ where: { active: true, stock: { gt: 0, lte: 3 } } }),
    prisma.order.findMany({ where: orderWhere, select: { createdAt: true, total: true, paymentStatus: true } }),
    prisma.product.findMany({ select: { verificationStatus: true, facts: { select: { sourceReferenceId: true, dataStatus: true } }, contentBlocks: { select: { sourceReferenceId: true, dataStatus: true } }, variants: { select: { price: true, stock: true, priceStatus: true, stockStatus: true } }, mediaLinks: { select: { mediaAsset: { select: { reviewStatus: true } } } } } }),
    prisma.order.findMany({ where: orderWhere, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, code: true, status: true, paymentStatus: true, total: true, createdAt: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, type: true, status: true, fullName: true, phone: true, email: true, createdAt: true } }),
    prisma.afterSalesRequest.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, type: true, status: true, subject: true, createdAt: true, user: { select: { phone: true, email: true } }, order: { select: { code: true } } } }),
  ]);

  const dayCount = range === "30d" ? 30 : 7;
  const daily = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (dayCount - index - 1));
    const key = date.toISOString().slice(0, 10);
    return { date: key, orders: 0, revenue: 0 };
  });
  const dailyIndex = new Map(daily.map((item, index) => [item.date, index]));
  for (const order of recentOrdersForSeries) {
    const index = dailyIndex.get(order.createdAt.toISOString().slice(0, 10));
    if (index === undefined) continue;
    daily[index].orders += 1;
    if (order.paymentStatus === "PAID") daily[index].revenue += order.total;
  }
  const quality = productQuality.reduce((summary, product) => {
    if (product.verificationStatus !== "VERIFIED") summary.unverifiedProducts += 1;
    for (const item of [...product.facts, ...product.contentBlocks]) {
      if (!item.sourceReferenceId) summary.missingSources += 1;
      if (item.dataStatus === "SOURCE_CONFLICT") summary.conflicts += 1;
    }
    for (const variant of product.variants) if ((variant.price !== null && variant.priceStatus !== "VERIFIED") || (variant.stock > 0 && variant.stockStatus !== "VERIFIED")) summary.unverifiedVariants += 1;
    for (const link of product.mediaLinks) if (link.mediaAsset.reviewStatus !== "APPROVED") summary.unapprovedMedia += 1;
    return summary;
  }, { unverifiedProducts: 0, missingSources: 0, conflicts: 0, unverifiedVariants: 0, unapprovedMedia: 0 });

  return {
    range,
    since,
    orders: { total: recentOrderTotal, byStatus: { PENDING: pendingOrders, CONFIRMED: confirmedOrders, PROCESSING: processingOrders, SHIPPED: shippedOrders, COMPLETED: completedOrders, CANCELLED: cancelledOrders } },
    payments: { pending: pendingPayments, reviewRequired, paidRevenue: paidRevenue._sum.total ?? 0 },
    leads: { NEW: newLeads, IN_PROGRESS: inProgressLeads },
    afterSales: { SUBMITTED: submittedAfterSales, REVIEWING: reviewingAfterSales },
    inventory: { zeroStockActiveVariants: zeroStockVariants, lowStockActiveVariants: lowStockVariants },
    daily,
    dataQuality: quality,
    activity: {
      orders: recentOrders,
      leads: recentLeads.map((lead) => ({ ...lead, phone: maskPhone(lead.phone), email: maskEmail(lead.email) })),
      afterSales: recentAfterSales.map(({ user, ...request }) => ({ ...request, phone: maskPhone(user.phone ?? ""), email: maskEmail(user.email) })),
    },
  };
}
