import "server-only";

import type { PrismaClient } from "@prisma/client";
import type { AddressInput, ProfileUpdateInput } from "@/lib/account-validation";

const accountAddressSelect = { id: true, label: true, fullName: true, phone: true, line1: true, province: true, district: true, postalCode: true } as const;

export async function getAccountProfile(prisma: PrismaClient, userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, createdAt: true } });
}

export function updateAccountProfile(prisma: PrismaClient, userId: string, input: ProfileUpdateInput) {
  return prisma.user.update({ where: { id: userId }, data: input, select: { id: true, name: true, email: true, phone: true } });
}

export async function listAccountAddresses(prisma: PrismaClient, userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: { id: "asc" }, select: accountAddressSelect });
}

export function createAccountAddress(prisma: PrismaClient, userId: string, input: AddressInput) {
  return prisma.address.create({ data: { ...input, userId }, select: accountAddressSelect });
}

export async function updateAccountAddress(prisma: PrismaClient, userId: string, id: string, input: AddressInput) {
  const result = await prisma.address.updateMany({ where: { id, userId }, data: input });
  if (result.count !== 1) throw new Error("NOT_FOUND");
  return prisma.address.findFirstOrThrow({ where: { id, userId }, select: accountAddressSelect });
}

export async function deleteAccountAddress(prisma: PrismaClient, userId: string, id: string) {
  const result = await prisma.address.deleteMany({ where: { id, userId } });
  if (result.count !== 1) throw new Error("NOT_FOUND");
}

export async function listAccountOrders(prisma: PrismaClient, userId: string) {
  return prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, code: true, createdAt: true, status: true, paymentStatus: true, total: true, items: { select: { id: true, productName: true, sku: true, quantity: true } } } });
}

export async function getAccountOrder(prisma: PrismaClient, userId: string, id: string) {
  return prisma.order.findFirst({
    where: { id, userId },
    select: {
      id: true, code: true, createdAt: true, subtotal: true, shippingFee: true, total: true, status: true, paymentMethod: true, paymentStatus: true, shippingAddress: true,
      items: { select: { id: true, productName: true, sku: true, width: true, length: true, thickness: true, quantity: true, unitPrice: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, expiresAt: true, provider: true } },
    },
  });
}
