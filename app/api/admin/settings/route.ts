import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { adminSettingsSchema } from "@/lib/api-validation";

async function authorize() {
  const session = await auth();
  if (!session?.user) return 401 as const;
  return ["ADMIN", "EDITOR"].includes(session.user.role ?? "") ? 200 as const : 403 as const;
}

export async function GET() {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const parsed = adminSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Site settings không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const data = { shippingFee: parsed.data.shippingFee, freeShippingThreshold: parsed.data.freeShippingThreshold, bankTransferReservationMinutes: parsed.data.bankTransferReservationMinutes, bankTransferInfo: parsed.data.bankTransferInfo ? parsed.data.bankTransferInfo as Prisma.InputJsonValue : Prisma.JsonNull };
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  revalidatePath("/");
  return NextResponse.json(settings);
}
