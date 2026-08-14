import { NextResponse } from "next/server";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getR2Config } from "@/lib/r2";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "EDITOR"].includes(session.user.role ?? "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  const config = getR2Config();
  if (!prisma || !config) return NextResponse.json({ error: "Media storage chưa được cấu hình." }, { status: 503 });
  const body = await request.json().catch(() => null) as { intentId?: string; productId?: string; alt?: string; aspect?: string } | null;
  if (!body?.intentId || !body.productId || !body.alt) return NextResponse.json({ error: "Thiếu thông tin media." }, { status: 400 });
  const intent = await prisma.uploadIntent.findFirst({ where: { id: body.intentId, userId: session.user.id, completedAt: null, expiresAt: { gt: new Date() } } });
  if (!intent) return NextResponse.json({ error: "Upload intent không còn hợp lệ." }, { status: 409 });
  const head = await config.client.send(new HeadObjectCommand({ Bucket: config.env.R2_BUCKET!, Key: intent.key }));
  if (head.ContentLength !== intent.size || head.ContentType !== intent.contentType) return NextResponse.json({ error: "Media metadata không khớp." }, { status: 400 });
  const media = await prisma.$transaction(async (tx) => {
    await tx.uploadIntent.update({ where: { id: intent.id }, data: { completedAt: new Date() } });
    return tx.mediaAsset.create({ data: { productId: body.productId!, type: intent.kind, url: `${config.env.R2_PUBLIC_URL}/${intent.key}`, alt: body.alt!, aspect: body.aspect } });
  });
  return NextResponse.json(media);
}
