import type { PrismaClient, LeadStatus, LeadType, LeadSource } from "@prisma/client";
import { CATALOG_SLUGS } from "@/lib/product-data";
import { normalizePhone, type PublicLeadInput, type LeadTypeValue } from "@/lib/lead-validation";

const IP_WINDOW_MS = 10 * 60 * 1000;
const PHONE_WINDOW_MS = 15 * 60 * 1000;
const IP_LIMIT = 5;
const PHONE_LIMIT = 3;
const ipAttempts = new Map<string, { count: number; resetAt: number }>();

export class LeadDatabaseError extends Error {}
export class LeadValidationError extends Error {}
export class LeadRateLimitError extends Error {}

export function consumeLeadIpLimit(ip: string, now = Date.now()) {
  const current = ipAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    ipAttempts.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (current.count >= IP_LIMIT) return false;
  current.count += 1;
  return true;
}

export function resetLeadIpLimitForTests() {
  ipAttempts.clear();
}

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

export async function createPublicLead(prisma: PrismaClient, input: PublicLeadInput) {
  const run = async (tx: PrismaClient) => {
    const productSlug = await publishedProductExists(tx, requestedProductSlug(input));
    const phone = normalizePhone(input.phone);
    const recent = await tx.lead.count({ where: { phone, createdAt: { gte: new Date(Date.now() - PHONE_WINDOW_MS) } } });
    if (recent >= PHONE_LIMIT) throw new LeadRateLimitError("Vui lòng thử lại sau.");
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
    return await prisma.$transaction((tx) => run(tx as PrismaClient));
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
