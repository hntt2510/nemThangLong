import { NextResponse } from "next/server";
import { listPublicProducts, parsePublicCatalogQuery, StorefrontUnavailableError } from "@/lib/storefront-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = parsePublicCatalogQuery(new URL(request.url).searchParams);
    if (query.minPrice !== null && query.maxPrice !== null && query.minPrice > query.maxPrice) return NextResponse.json({ error: "Khoảng giá không hợp lệ.", code: "VALIDATION_ERROR" }, { status: 400 });
    return NextResponse.json(await listPublicProducts(query), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const unavailable = error instanceof StorefrontUnavailableError;
    return NextResponse.json({ error: unavailable ? "Dữ liệu cửa hàng tạm thời chưa sẵn sàng." : "Không thể tải danh mục.", code: unavailable ? "STOREFRONT_UNAVAILABLE" : "CATALOG_UNAVAILABLE" }, { status: 503 });
  }
}
