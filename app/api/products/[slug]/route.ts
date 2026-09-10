import { NextResponse } from "next/server";
import { catalogSlugSchema } from "@/lib/admin-product-validation";
import { getPublicProduct, StorefrontUnavailableError } from "@/lib/storefront-api";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!catalogSlugSchema.safeParse(slug).success) return NextResponse.json({ error: "Không tìm thấy sản phẩm.", code: "NOT_FOUND" }, { status: 404 });
  try {
    const product = await getPublicProduct(slug);
    return product ? NextResponse.json(product, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "Không tìm thấy sản phẩm.", code: "NOT_FOUND" }, { status: 404 });
  } catch (error) {
    const unavailable = error instanceof StorefrontUnavailableError;
    return NextResponse.json({ error: unavailable ? "Dữ liệu cửa hàng tạm thời chưa sẵn sàng." : "Không thể tải sản phẩm.", code: unavailable ? "STOREFRONT_UNAVAILABLE" : "PRODUCT_UNAVAILABLE" }, { status: 503 });
  }
}
