import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { checkoutSchema } from "@/lib/validation";
import { luxuryProduct } from "@/lib/product-data";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

function makeOrderCode() { return `TL-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`; }

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thông tin checkout chưa đầy đủ hoặc không hợp lệ." }, { status: 400 });
  const input = parsed.data;
  const prisma = getPrisma();
  const shippingFee = Number(process.env.DEFAULT_SHIPPING_FEE ?? 0);

  if (!prisma) {
    try {
      const items = input.items.map((item) => {
        const variant = luxuryProduct.variants.find((candidate) => candidate.id === item.variantId);
        if (!variant || !variant.price || !variant.active || variant.stock < item.quantity) throw new Error("Một sản phẩm trong giỏ không còn khả dụng.");
        return { ...item, variant, productName: luxuryProduct.name };
      });
      const subtotal = items.reduce((sum, item) => sum + (item.variant.price ?? 0) * item.quantity, 0);
      if (input.paymentMethod === "MOMO") return NextResponse.json({ error: "MoMo cần database và merchant credentials được cấu hình." }, { status: 503 });
      return NextResponse.json({ code: makeOrderCode(), subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod: input.paymentMethod });
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo đơn hàng." }, { status: 409 }); }
  }

  try {
    const variants = await prisma.productVariant.findMany({ where: { id: { in: input.items.map((item) => item.variantId) }, active: true }, include: { product: true } });
    if (variants.length !== input.items.length) return NextResponse.json({ error: "Một sản phẩm trong giỏ không còn khả dụng." }, { status: 409 });
    const lines = input.items.map((item) => {
      const variant = variants.find((candidate) => candidate.id === item.variantId);
      if (!variant || !variant.price || variant.stock < item.quantity) throw new Error("Sản phẩm vừa được cập nhật. Vui lòng kiểm tra lại giỏ hàng.");
      return { item, variant };
    });
    const subtotal = lines.reduce((sum, line) => sum + (line.variant.price ?? 0) * line.item.quantity, 0);
    const code = makeOrderCode();
    const order = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const updated = await tx.productVariant.updateMany({ where: { id: line.variant.id, stock: { gte: line.item.quantity } }, data: { stock: { decrement: line.item.quantity } } });
        if (updated.count !== 1) throw new Error("Sản phẩm vừa hết tồn kho.");
      }
      return tx.order.create({ data: {
        code, guestEmail: input.guestEmail || null, customerName: input.customerName, customerPhone: input.customerPhone,
        shippingAddress: input.address, subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod: input.paymentMethod,
        items: { create: lines.map(({ item, variant }) => ({ variantId: variant.id, productName: variant.product.name, sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: item.quantity, unitPrice: variant.price ?? 0 })) },
        payments: { create: { provider: input.paymentMethod, amount: subtotal + shippingFee } },
      }, include: { items: true } });
    });
    if (input.paymentMethod === "MOMO") return NextResponse.json({ code: order.code, paymentRequired: true, paymentPath: `/api/payments/momo/create?code=${order.code}` });
    return NextResponse.json({ code: order.code, subtotal, shippingFee, total: subtotal + shippingFee });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
    const status = /database server|P1001|Can't reach/i.test(message) ? 503 : 409;
    return NextResponse.json({ error: status === 503 ? "Database hiện chưa khả dụng." : message }, { status });
  }
}
