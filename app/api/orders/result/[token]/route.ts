import { NextResponse } from "next/server";
import { getOrderResult } from "@/lib/orders";

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!token || token.length < 20) return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  const result = await getOrderResult(token);
  return result ? NextResponse.json(result) : NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
}
