import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const primary = [
  ["seed-menu-primary-need", "Theo nhu cầu", "/tim-nem", 10],
  ["seed-menu-primary-project", "Khách sạn & dự án", "/khach-san-du-an", 20],
  ["seed-menu-primary-about", "Về Thăng Long", "/ve-thang-long", 30],
  ["seed-menu-primary-blog", "Blog", "/kien-thuc-giac-ngu", 40],
] as const;

const explore = [
  ["seed-menu-footer-products", "Sản phẩm", "/nem", 10],
  ["seed-menu-footer-finder", "Theo nhu cầu", "/tim-nem", 20],
  ["seed-menu-footer-blog", "Blog", "/kien-thuc-giac-ngu", 30],
  ["seed-menu-footer-about", "Về Thăng Long", "/ve-thang-long", 40],
] as const;

async function syncMenu(key: string, label: string, items: readonly (readonly [string, string, string, number])[]) {
  const menu = await prisma.menu.upsert({ where: { key }, update: { label }, create: { key, label } });
  await Promise.all(items.map(([id, itemLabel, href, sortOrder]) => prisma.menuItem.upsert({ where: { id }, update: { menuId: menu.id, label: itemLabel, href, sortOrder, enabled: true }, create: { id, menuId: menu.id, label: itemLabel, href, sortOrder, enabled: true } })));
  return menu;
}

async function main() {
  const [header, footer] = await Promise.all([syncMenu("header-primary", "Điều hướng chính", primary), syncMenu("footer-explore", "Khám phá", explore)]);
  await prisma.menuItem.deleteMany({ where: { menuId: header.id, id: "seed-menu-primary-luxury" } });
  await prisma.menuItem.deleteMany({ where: { menuId: footer.id, id: "seed-menu-footer-compare" } });
}

main().finally(() => prisma.$disconnect());
