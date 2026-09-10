import { NextResponse } from "next/server";
import { getPublicSettings, StorefrontUnavailableError } from "@/lib/storefront-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getPublicSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const unavailable = error instanceof StorefrontUnavailableError;
    return NextResponse.json({ error: unavailable ? "Dữ liệu cửa hàng tạm thời chưa sẵn sàng." : "Không thể tải cấu hình cửa hàng.", code: unavailable ? "STOREFRONT_UNAVAILABLE" : "SETTINGS_UNAVAILABLE" }, { status: 503 });
  }
}
