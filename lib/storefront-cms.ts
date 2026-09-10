import "server-only";

import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { defaultNavigation, type NavigationItem, type SiteNavigation } from "@/lib/navigation";

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
  try {
    const prisma = getPrisma();
    if (!prisma) return [];
    const menu = await prisma.menu.findUnique({ where: { key }, include: { items: { where: { parentId: null, enabled: true }, orderBy: { sortOrder: "asc" } } } });
    return menu ? asItems(menu.items) : [];
  } catch {
    return [];
  }
}

export async function getStorefrontNavigation(): Promise<SiteNavigation> {
  try {
    const prisma = getPrisma();
    if (!prisma) return defaultNavigation;
    const menus = await prisma.menu.findMany({
      where: { key: { in: ["header-mattress", "header-needs", "header-primary"] } },
      include: { items: { where: { parentId: null }, orderBy: { sortOrder: "asc" } } },
    });
    if (!menus || menus.length === 0) return defaultNavigation;
    const byKey = new Map(menus.map((menu) => [menu.key, asItems(menu.items)]));
    const mattressLines = byKey.get("header-mattress") ?? [];
    const needs = byKey.get("header-needs") ?? [];
    const primary = byKey.get("header-primary") ?? [];
    return {
      mattressLines: mattressLines.length > 0 ? mattressLines : defaultNavigation.mattressLines,
      needs: needs.length > 0 ? needs : defaultNavigation.needs,
      primary: primary.length > 0 ? primary : defaultNavigation.primary,
    };
  } catch {
    return defaultNavigation;
  }
}

export async function getHomeHero(): Promise<HomeHero | null> {
  try {
    const prisma = getPrisma();
    if (!prisma) return null;
    const section = await prisma.pageSection.findFirst({
      where: { key: "hero", enabled: true, page: { slug: "home", status: "PUBLISHED" } },
      include: { media: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } } },
    });
    if (!section) return null;
    const parsed = heroPayloadSchema.safeParse(section.payload);
    if (!parsed.success) return null;
    const image = section.media.find((item) => item.mediaAsset.reviewStatus === "APPROVED" || process.env.NODE_ENV !== "production")?.mediaAsset;
    return { ...parsed.data, imageUrl: image?.url ?? null, imageAlt: image?.alt ?? null };
  } catch {
    return null;
  }
}

export async function getPageIntro(slug: string) {
  try {
    const prisma = getPrisma();
    if (!prisma) return null;
    const section = await prisma.pageSection.findFirst({ where: { key: "intro", enabled: true, page: { slug, status: "PUBLISHED" } } });
    if (!section) return null;
    const parsed = introPayloadSchema.safeParse(section.payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
