export type NavigationItem = { label: string; href: string };

export type SiteNavigation = {
  mattressLines: NavigationItem[];
  needs: NavigationItem[];
  primary: NavigationItem[];
};

const defaultNavigation: SiteNavigation = {
  mattressLines: [
    { label: "America", href: "/nem/america" },
    { label: "Classic", href: "/nem/classic" },
    { label: "Hoạt Tính", href: "/nem/hoat-tinh" },
    { label: "Memory Foam", href: "/nem/memory-foam" },
    { label: "Cao Su Thiên Nhiên", href: "/nem/cao-su-thien-nhien" },
    { label: "Luxury", href: "/nem/luxury" },
  ],
  needs: [
    { label: "Êm ái", href: "/#shop-by-need" },
    { label: "Nâng đỡ", href: "/#shop-by-need" },
    { label: "Ngủ mát", href: "/#shop-by-need" },
    { label: "Cặp đôi", href: "/#shop-by-need" },
    { label: "Gia đình", href: "/#shop-by-need" },
    { label: "Cao cấp", href: "/#shop-by-need" },
  ],
  primary: [
    { label: "Theo nhu cầu", href: "/#shop-by-need" },
    { label: "Luxury", href: "/nem/luxury" },
    { label: "Khách sạn & dự án", href: "/#hotel-project" },
    { label: "Về Thăng Long", href: "/#about" },
  ],
};

function safeHref(value: unknown) {
  if (typeof value !== "string") return null;
  const allowedRoutes = new Set(["/", "/nem", "/nem/america", "/nem/classic", "/nem/hoat-tinh", "/nem/memory-foam", "/nem/cao-su-thien-nhien", "/nem/luxury"]);
  const allowedAnchors = new Set(["/#find-mattress", "/#product-range", "/#natural-latex", "/#shop-by-need", "/#compare", "/#hotel-project", "/#about", "/#contact"]);
  if (allowedRoutes.has(value) || allowedAnchors.has(value)) return value;
  return null;
}

function parseItems(value: unknown, fallback: NavigationItem[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const href = safeHref(candidate.href);
    return typeof candidate.label === "string" && href ? [{ label: candidate.label, href }] : [];
  });
  return items.length > 0 ? items : fallback;
}

export function parseNavigation(value: unknown): SiteNavigation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultNavigation;
  const source = value as Record<string, unknown>;
  return {
    mattressLines: parseItems(source.mattressLines, defaultNavigation.mattressLines),
    needs: parseItems(source.needs, defaultNavigation.needs),
    primary: parseItems(source.primary, defaultNavigation.primary),
  };
}

export { defaultNavigation };
