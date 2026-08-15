export function neutralCatalogProductName(slug: string) {
  if (slug === "cao-su-thien-nhien") return "Nệm Thăng Long Cao Su Thiên Nhiên";
  if (slug === "hoat-tinh") return "Nệm Thăng Long Hoạt Tính";
  if (slug === "memory-foam") return "Nệm Thăng Long Memory Foam";
  return `Nệm Thăng Long ${slug.replace(/^./, (character) => character.toUpperCase())}`;
}
