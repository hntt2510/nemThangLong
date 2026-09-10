import { NextResponse } from "next/server";
import { getOrderResult, OrderResultUnavailableError } from "@/lib/orders";

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!token || token.length < 20) return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  try {
    const result = await getOrderResult(token);
    return result ? NextResponse.json(result, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  } catch (error) {
    if (error instanceof OrderResultUnavailableError) return NextResponse.json({ error: "Hệ thống đơn hàng tạm thời chưa khả dụng." }, { status: 503 });
    return NextResponse.json({ error: "Hệ thống đơn hàng tạm thời chưa khả dụng." }, { status: 503 });
  }
}
