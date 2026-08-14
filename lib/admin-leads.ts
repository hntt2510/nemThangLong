import type { LeadStatus, LeadType, Prisma, PrismaClient } from "@prisma/client";
import { adminLeadUpdateSchema, normalizePhone, type AdminLeadUpdateInput } from "@/lib/lead-validation";
import { canTransitionLeadStatus } from "@/lib/leads";

export function isLeadAdmin(role: string | undefined) {
  return role === "ADMIN";
}

export function parseLeadFilters(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const pageValue = Number(searchParams.get("page") ?? "1");
  return {
    status: status === "NEW" || status === "IN_PROGRESS" || status === "CLOSED" ? status as LeadStatus : undefined,
    type: type === "CONSULTATION" || type === "B2B_PROJECT" ? type as LeadType : undefined,
    q: (searchParams.get("q") ?? "").trim().slice(0, 100),
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 1000) : 1,
  };
}

export async function listLeads(prisma: PrismaClient, filters: ReturnType<typeof parseLeadFilters>) {
  const where: Prisma.LeadWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.q) {
    const normalizedPhone = normalizePhone(filters.q);
    where.OR = [
      { fullName: { contains: filters.q, mode: "insensitive" } },
      ...(normalizedPhone.replace(/\D/g, "").length >= 3 ? [{ phone: { contains: normalizedPhone } }] : []),
      { email: { contains: filters.q, mode: "insensitive" } },
      { organization: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  const pageSize = 50;
  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (filters.page - 1) * pageSize, take: pageSize }),
    prisma.lead.count({ where }),
  ]);
  return { items, total, page: filters.page, pageSize };
}

export async function getLead(prisma: PrismaClient, id: string) {
  return prisma.lead.findUnique({ where: { id } });
}

export async function updateLead(prisma: PrismaClient, id: string, input: AdminLeadUpdateInput) {
  const parsed = adminLeadUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error("INVALID_INPUT");
  const current = await prisma.lead.findUnique({ where: { id } });
  if (!current) throw new Error("NOT_FOUND");
  if (!canTransitionLeadStatus(current.status, parsed.data.status)) throw new Error("INVALID_TRANSITION");
  const result = await prisma.lead.updateMany({
    where: { id, updatedAt: new Date(parsed.data.updatedAt) },
    data: { status: parsed.data.status, internalNote: parsed.data.internalNote || null },
  });
  if (result.count !== 1) throw new Error("STALE");
  return prisma.lead.findUniqueOrThrow({ where: { id } });
}
