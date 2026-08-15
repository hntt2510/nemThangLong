import "server-only";

import type { PrismaClient, LeadStatus, LeadType, LeadSource } from "@prisma/client";
import { CATALOG_SLUGS } from "@/lib/product-data";
import { normalizePhone, type PublicLeadInput, type LeadTypeValue } from "@/lib/lead-validation";
import { consumeLeadRateLimitBucket, getLeadRateLimitSecret, hashLeadRateLimitKey, LEAD_IP_LIMIT, LEAD_IP_WINDOW_MS, LEAD_PHONE_LIMIT, LEAD_PHONE_WINDOW_MS, cleanupExpiredLeadRateLimitBuckets } from "@/lib/lead-rate-limit";

export class LeadDatabaseError extends Error {}
export class LeadValidationError extends Error {}
export class LeadRateLimitError extends Error {}

export function leadSourceForType(type: LeadTypeValue): LeadSource {
  return type === "B2B_PROJECT" ? "B2B_PAGE" : "CONTACT_PAGE";
}

export const validLeadStatusTransitions: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["NEW", "IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["IN_PROGRESS", "CLOSED"],
  CLOSED: ["CLOSED", "IN_PROGRESS"],
};

export function canTransitionLeadStatus(from: LeadStatus, to: LeadStatus) {
  return validLeadStatusTransitions[from].includes(to);
}

function requestedProductSlug(input: PublicLeadInput) {
  return input.type === "CONSULTATION" ? input.productSlug ?? input.interestedProduct : undefined;
}

async function publishedProductExists(prisma: Pick<PrismaClient, "product">, productSlug: string | undefined) {
  if (!productSlug) return null;
  if (!CATALOG_SLUGS.includes(productSlug as (typeof CATALOG_SLUGS)[number])) throw new LeadValidationError("Sản phẩm không hợp lệ.");
  const product = await prisma.product.findFirst({ where: { slug: productSlug, status: "PUBLISHED" }, select: { slug: true } });
  if (!product) throw new LeadValidationError("Sản phẩm không hợp lệ.");
  return product.slug;
}

export type CreatePublicLeadOptions = {
  ipAddress?: string;
  rateLimitSecret?: string;
  now?: Date;
};

export async function createPublicLead(prisma: PrismaClient, input: PublicLeadInput, options: CreatePublicLeadOptions = {}) {
  const now = options.now ?? new Date();
  const ipAddress = options.ipAddress ?? "unknown";
  const secret = options.rateLimitSecret ?? getLeadRateLimitSecret();
  const run = async (tx: PrismaClient) => {
    const productSlug = await publishedProductExists(tx, requestedProductSlug(input));
    const phone = normalizePhone(input.phone);
    const ipCount = await consumeLeadRateLimitBucket(tx, "IP", hashLeadRateLimitKey("IP", ipAddress, secret), now, LEAD_IP_WINDOW_MS);
    if (ipCount > LEAD_IP_LIMIT) throw new LeadRateLimitError("Vui lòng thử lại sau.");
    const phoneCount = await consumeLeadRateLimitBucket(tx, "PHONE", hashLeadRateLimitKey("PHONE", phone, secret), now, LEAD_PHONE_WINDOW_MS);
    if (phoneCount > LEAD_PHONE_LIMIT) throw new LeadRateLimitError("Vui lòng thử lại sau.");
    const common = {
      type: input.type as LeadType,
      fullName: input.fullName,
      phone,
      email: input.email || null,
      productSlug,
      message: input.message || null,
      source: leadSourceForType(input.type),
    };
    return input.type === "B2B_PROJECT"
      ? tx.lead.create({ data: { ...common, organization: input.organization || null, projectLocation: input.projectLocation || null, estimatedQuantity: input.estimatedQuantity ?? null } })
      : tx.lead.create({ data: common });
  };
  try {
    const lead = await prisma.$transaction((tx) => run(tx as PrismaClient));
    await cleanupExpiredLeadRateLimitBuckets(prisma).catch(() => undefined);
    return lead;
  } catch (error) {
    if (error instanceof LeadValidationError || error instanceof LeadRateLimitError) throw error;
    throw new LeadDatabaseError("Lead database unavailable.");
  }
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 4 ? "•••• " + digits.slice(-4) : "••••";
}

export function maskEmail(email: string | null) {
  if (!email) return null;
  const [name, domain] = email.split("@");
  return name && domain ? name.slice(0, 1) + "***@" + domain : "***";
}

export function leadStatusLabel(status: LeadStatus) {
  return status === "NEW" ? "Mới" : status === "IN_PROGRESS" ? "Đang xử lý" : "Đã đóng";
}

export function leadTypeLabel(type: LeadType) {
  return type === "B2B_PROJECT" ? "Khách sạn & dự án" : "Tư vấn sản phẩm";
}
