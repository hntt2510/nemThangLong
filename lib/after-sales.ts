import "server-only";

import type { AfterSalesRequestType, AfterSalesStatus, PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

export const afterSalesCreateSchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  type: z.enum(["WARRANTY_REVIEW", "PRODUCT_SUPPORT"]),
  subject: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(4000),
}).strict();

export const afterSalesAdminUpdateSchema = z.object({
  status: z.enum(["SUBMITTED", "REVIEWING", "RESOLVED", "CLOSED"]),
  internalNote: z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(4000).optional()),
  updatedAt: z.string().datetime(),
}).strict();

export type AfterSalesCreateInput = z.infer<typeof afterSalesCreateSchema>;
export type AfterSalesAdminUpdateInput = z.infer<typeof afterSalesAdminUpdateSchema>;

export const validAfterSalesStatusTransitions: Record<AfterSalesStatus, AfterSalesStatus[]> = {
  SUBMITTED: ["SUBMITTED", "REVIEWING", "CLOSED"],
  REVIEWING: ["REVIEWING", "RESOLVED", "CLOSED"],
  RESOLVED: ["RESOLVED", "CLOSED", "REVIEWING"],
  CLOSED: ["CLOSED", "REVIEWING"],
};

export function canTransitionAfterSalesStatus(from: AfterSalesStatus, to: AfterSalesStatus) {
  return validAfterSalesStatusTransitions[from]?.includes(to) ?? false;
}

export async function createAfterSalesRequest(prisma: PrismaClient, userId: string, input: AfterSalesCreateInput) {
  const parsed = afterSalesCreateSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findFirst({
      where: { id: parsed.orderItemId, orderId: parsed.orderId, order: { userId } },
      select: { id: true },
    });
    if (!item) throw new Error("NOT_FOUND");
    return tx.afterSalesRequest.create({
      data: { ...parsed, userId },
      select: { id: true, type: true, status: true, subject: true, description: true, orderId: true, orderItemId: true, createdAt: true, updatedAt: true },
    });
  });
}

export async function listCustomerAfterSales(prisma: PrismaClient, userId: string) {
  return prisma.afterSalesRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, type: true, status: true, subject: true, description: true, orderId: true, orderItemId: true, createdAt: true, updatedAt: true,
      order: { select: { code: true } },
      orderItem: { select: { productName: true, sku: true, width: true, length: true, thickness: true } },
    },
  });
}

export function parseAfterSalesFilters(searchParams: URLSearchParams) {
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const pageValue = Number(searchParams.get("page") ?? "1");
  return {
    type: type === "WARRANTY_REVIEW" || type === "PRODUCT_SUPPORT" ? type as AfterSalesRequestType : undefined,
    status: status === "SUBMITTED" || status === "REVIEWING" || status === "RESOLVED" || status === "CLOSED" ? status as AfterSalesStatus : undefined,
    q: (searchParams.get("q") ?? "").trim().slice(0, 100),
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 1000) : 1,
  };
}

export async function listAdminAfterSales(prisma: PrismaClient, filters: ReturnType<typeof parseAfterSalesFilters>) {
  const where: Prisma.AfterSalesRequestWhereInput = {};
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.q) {
    where.OR = [
      { subject: { contains: filters.q, mode: "insensitive" } },
      { order: { code: { contains: filters.q, mode: "insensitive" } } },
      { user: { name: { contains: filters.q, mode: "insensitive" } } },
      { user: { email: { contains: filters.q, mode: "insensitive" } } },
      { user: { phone: { contains: filters.q } } },
      { orderItem: { productName: { contains: filters.q, mode: "insensitive" } } },
      { orderItem: { sku: { contains: filters.q, mode: "insensitive" } } },
    ];
  }
  const pageSize = 50;
  const [items, total] = await prisma.$transaction([
    prisma.afterSalesRequest.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (filters.page - 1) * pageSize, take: pageSize,
      select: { id: true, type: true, status: true, subject: true, orderId: true, orderItemId: true, createdAt: true, updatedAt: true, user: { select: { name: true, email: true, phone: true } }, order: { select: { code: true } }, orderItem: { select: { productName: true, sku: true, width: true, length: true, thickness: true } } },
    }),
    prisma.afterSalesRequest.count({ where }),
  ]);
  return { items, total, page: filters.page, pageSize };
}

export async function getAdminAfterSales(prisma: PrismaClient, id: string) {
  return prisma.afterSalesRequest.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, email: true, phone: true } }, order: { select: { id: true, code: true, status: true, paymentStatus: true, total: true, createdAt: true } }, orderItem: true } });
}

export async function updateAfterSalesRequest(prisma: PrismaClient, id: string, input: AfterSalesAdminUpdateInput) {
  const parsed = afterSalesAdminUpdateSchema.parse(input);
  const current = await prisma.afterSalesRequest.findUnique({ where: { id }, select: { status: true } });
  if (!current) throw new Error("NOT_FOUND");
  if (!canTransitionAfterSalesStatus(current.status, parsed.status)) throw new Error("INVALID_TRANSITION");
  const result = await prisma.afterSalesRequest.updateMany({
    where: { id, updatedAt: new Date(parsed.updatedAt) },
    data: { status: parsed.status, internalNote: parsed.internalNote || null },
  });
  if (result.count !== 1) throw new Error("STALE");
  return prisma.afterSalesRequest.findUniqueOrThrow({ where: { id }, select: { id: true, status: true, internalNote: true, updatedAt: true } });
}
