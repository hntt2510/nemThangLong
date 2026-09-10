export type NavigationItem = { label: string; href: string };

export type SiteNavigation = {
  mattressLines: NavigationItem[];
  needs: NavigationItem[];
  primary: NavigationItem[];
};

export const defaultNavigation: SiteNavigation = { mattressLines: [], needs: [], primary: [] };

export function parseNavigation(value: unknown): SiteNavigation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultNavigation;
  const source = value as Partial<Record<keyof SiteNavigation, unknown>>;
  const parseItems = (items: unknown) => Array.isArray(items)
    ? items.flatMap((item) => item && typeof item === "object" && typeof (item as NavigationItem).label === "string" && typeof (item as NavigationItem).href === "string" ? [item as NavigationItem] : [])
    : [];
  return { mattressLines: parseItems(source.mattressLines), needs: parseItems(source.needs), primary: parseItems(source.primary) };
}
