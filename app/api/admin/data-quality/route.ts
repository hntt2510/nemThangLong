import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true, slug: true, name: true, verificationStatus: true,
        facts: { select: { dataStatus: true, sourceReferenceId: true } },
        contentBlocks: { select: { type: true, dataStatus: true, sourceReferenceId: true } },
        profile: { select: { dataStatus: true } },
        variants: { where: { active: true }, select: { price: true, stock: true, priceStatus: true, stockStatus: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products.map((product) => {
      const missingSources = product.facts.filter((fact) => !fact.sourceReferenceId).length + product.contentBlocks.filter((block) => !block.sourceReferenceId).length;
      const conflicts = product.facts.filter((fact) => fact.dataStatus === "SOURCE_CONFLICT").length + product.contentBlocks.filter((block) => block.dataStatus === "SOURCE_CONFLICT").length + (product.profile?.dataStatus === "SOURCE_CONFLICT" ? 1 : 0);
      const unverifiedVariants = product.variants.filter((variant) => (variant.price !== null && variant.priceStatus !== "VERIFIED") || (variant.stock > 0 && variant.stockStatus !== "VERIFIED")).length;
      return { slug: product.slug, name: product.name, verificationStatus: product.verificationStatus, missingSources, conflicts, unverifiedVariants, canPublishForProduction: product.verificationStatus === "VERIFIED" && missingSources === 0 && conflicts === 0 && unverifiedVariants === 0 };
    }));
  } catch {
    return NextResponse.json({ error: "Không thể đọc chất lượng dữ liệu." }, { status: 503 });
  }
}
