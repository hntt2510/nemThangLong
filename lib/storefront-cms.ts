import "server-only";

import { z } from "zod";
import { getPrisma } from "@/lib/db";
import type { NavigationItem, SiteNavigation } from "@/lib/navigation";

const heroPayloadSchema = z.object({
  eyebrow: z.string(), title: z.string(), body: z.string(),
  primaryCta: z.object({ label: z.string(), href: z.string() }),
  secondaryCta: z.object({ label: z.string(), href: z.string() }),
});
const introPayloadSchema = z.object({ eyebrow: z.string(), title: z.string(), body: z.string() });

export type HomeHero = z.infer<typeof heroPayloadSchema> & { imageUrl: string | null; imageAlt: string | null };

function asItems(items: Array<{ label: string; href: string; enabled: boolean }>): NavigationItem[] {
  return items.filter((item) => item.enabled).map(({ label, href }) => ({ label, href }));
}

export async function getMenuItems(key: string): Promise<NavigationItem[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const menu = await prisma.menu.findUnique({ where: { key }, include: { items: { where: { parentId: null, enabled: true }, orderBy: { sortOrder: "asc" } } } }).catch(() => null);
  return menu ? asItems(menu.items) : [];
}

export async function getStorefrontNavigation(): Promise<SiteNavigation> {
  const prisma = getPrisma();
  if (!prisma) return { mattressLines: [], needs: [], primary: [] };
  const menus = await prisma.menu.findMany({
    where: { key: { in: ["header-mattress", "header-needs", "header-primary"] } },
    include: { items: { where: { parentId: null }, orderBy: { sortOrder: "asc" } } },
  }).catch(() => []);
  const byKey = new Map(menus.map((menu) => [menu.key, asItems(menu.items)]));
  return { mattressLines: byKey.get("header-mattress") ?? [], needs: byKey.get("header-needs") ?? [], primary: byKey.get("header-primary") ?? [] };
}

export async function getHomeHero(): Promise<HomeHero | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  const section = await prisma.pageSection.findFirst({
    where: { key: "hero", enabled: true, page: { slug: "home", status: "PUBLISHED" } },
    include: { media: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } } },
  }).catch(() => null);
  if (!section) return null;
  const parsed = heroPayloadSchema.safeParse(section.payload);
  if (!parsed.success) return null;
  const image = section.media.find((item) => item.mediaAsset.reviewStatus === "APPROVED" || process.env.NODE_ENV !== "production")?.mediaAsset;
  return { ...parsed.data, imageUrl: image?.url ?? null, imageAlt: image?.alt ?? null };
}

export async function getPageIntro(slug: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const section = await prisma.pageSection.findFirst({ where: { key: "intro", enabled: true, page: { slug, status: "PUBLISHED" } } }).catch(() => null);
  if (!section) return null;
  const parsed = introPayloadSchema.safeParse(section.payload);
  return parsed.success ? parsed.data : null;
}
