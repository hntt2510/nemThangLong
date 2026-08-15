import { PrismaClient } from "@prisma/client";
import { CATALOG_SLUGS } from "../lib/product-data";
import { neutralCatalogProductName } from "../lib/catalog-names";
import { assertDevelopmentDatabaseTarget } from "../lib/database-safety";

export async function bootstrapDevelopment(prisma: PrismaClient, source: NodeJS.ProcessEnv = process.env) {
  assertDevelopmentDatabaseTarget(source);
  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.createMany({ data: [{ id: "default" }], skipDuplicates: true });
    for (const slug of CATALOG_SLUGS) {
      const existing = await tx.product.findUnique({ where: { slug }, select: { id: true } });
      if (!existing) await tx.product.create({ data: { slug, name: neutralCatalogProductName(slug), status: "DRAFT", isDemo: true, mattressLab: false } });
    }
  });
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await bootstrapDevelopment(prisma);
    console.log("Development bootstrap complete.");
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("scripts/dev-bootstrap.ts")) void main();
