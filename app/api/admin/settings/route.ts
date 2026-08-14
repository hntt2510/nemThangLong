import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const schema = z.object({ shippingFee: z.number().int().min(0).nullable(), freeShippingThreshold: z.number().int().min(0).nullable(), bankTransferReservationMinutes: z.number().int().min(5).max(10080).nullable(), bankTransferInfo: z.record(z.string()).nullable() });

async function isEditor() {
  const session = await auth();
  return Boolean(session?.user?.role && ["ADMIN", "EDITOR"].includes(session.user.role));
}

export async function GET() {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Site settings không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const data = { shippingFee: parsed.data.shippingFee, freeShippingThreshold: parsed.data.freeShippingThreshold, bankTransferReservationMinutes: parsed.data.bankTransferReservationMinutes, bankTransferInfo: parsed.data.bankTransferInfo ? parsed.data.bankTransferInfo as Prisma.InputJsonValue : Prisma.JsonNull };
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  return NextResponse.json(settings);
}
