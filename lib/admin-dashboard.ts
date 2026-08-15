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
    prisma.order.findMany({ where: orderWhere, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, code: true, status: true, paymentStatus: true, total: true, createdAt: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, type: true, status: true, fullName: true, phone: true, email: true, createdAt: true } }),
    prisma.afterSalesRequest.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, type: true, status: true, subject: true, createdAt: true, user: { select: { phone: true, email: true } }, order: { select: { code: true } } } }),
  ]);

  return {
    range,
    since,
    orders: { total: recentOrderTotal, byStatus: { PENDING: pendingOrders, CONFIRMED: confirmedOrders, PROCESSING: processingOrders, SHIPPED: shippedOrders, COMPLETED: completedOrders, CANCELLED: cancelledOrders } },
    payments: { pending: pendingPayments, reviewRequired, paidRevenue: paidRevenue._sum.total ?? 0 },
    leads: { NEW: newLeads, IN_PROGRESS: inProgressLeads },
    afterSales: { SUBMITTED: submittedAfterSales, REVIEWING: reviewingAfterSales },
    inventory: { zeroStockActiveVariants: zeroStockVariants },
    activity: {
      orders: recentOrders,
      leads: recentLeads.map((lead) => ({ ...lead, phone: maskPhone(lead.phone), email: maskEmail(lead.email) })),
      afterSales: recentAfterSales.map(({ user, ...request }) => ({ ...request, phone: maskPhone(user.phone ?? ""), email: maskEmail(user.email) })),
    },
  };
}
