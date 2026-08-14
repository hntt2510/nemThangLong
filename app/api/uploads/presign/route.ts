import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getR2Config } from "@/lib/r2";

const rules = {
  image: { max: 12 * 1024 * 1024, extensions: { "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"] } },
  video: { max: 80 * 1024 * 1024, extensions: { "video/mp4": ["mp4"] } },
  model: { max: 50 * 1024 * 1024, extensions: { "model/gltf-binary": ["glb"] } },
} as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "EDITOR"].includes(session.user.role ?? "")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  const config = getR2Config();
  if (!prisma || !config) return NextResponse.json({ error: "Media storage chưa được cấu hình." }, { status: 503 });
  const body = await request.json().catch(() => null) as { kind?: keyof typeof rules; contentType?: string; fileName?: string; size?: number } | null;
  const kind = body?.kind;
  const contentType = body?.contentType;
  const fileName = body?.fileName;
  const size = body?.size;
  const rule = kind ? rules[kind] : undefined;
  const extension = fileName?.split(".").pop()?.toLowerCase();
  const extensions = rule && contentType ? (rule.extensions as Record<string, readonly string[]>)[contentType] : undefined;
  if (!rule || !contentType || !fileName || !extension || typeof size !== "number" || !Number.isInteger(size)) return NextResponse.json({ error: "File không được hỗ trợ hoặc quá lớn." }, { status: 400 });
  if (size <= 0 || size > rule.max || !extensions?.includes(extension) || !kind) return NextResponse.json({ error: "File không được hỗ trợ hoặc quá lớn." }, { status: 400 });
  const since = new Date(Date.now() - 5 * 60 * 1000);
  if (await prisma.uploadIntent.count({ where: { userId: session.user.id, createdAt: { gte: since } } }) >= 10) return NextResponse.json({ error: "Bạn đã đạt giới hạn upload tạm thời." }, { status: 429 });
  const key = `uploads/${session.user.id}/${kind}/${randomUUID()}.${extension}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const intent = await prisma.uploadIntent.create({ data: { userId: session.user.id, key, kind, contentType, size, expiresAt } });
  const url = await getSignedUrl(config.client, new PutObjectCommand({ Bucket: config.env.R2_BUCKET!, Key: key, ContentType: contentType }), { expiresIn: 900 });
  return NextResponse.json({ intentId: intent.id, url, key, publicUrl: `${config.env.R2_PUBLIC_URL}/${key}`, expiresAt });
}
