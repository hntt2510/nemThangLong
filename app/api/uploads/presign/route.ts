import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "model/gltf-binary", "application/octet-stream", "video/mp4"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { contentType?: string; fileName?: string; size?: number } | null;
  if (!body?.contentType || !allowed.has(body.contentType) || !body.fileName || !body.size || body.size > 150 * 1024 * 1024) return NextResponse.json({ error: "File không được hỗ trợ hoặc quá lớn." }, { status: 400 });
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET) return NextResponse.json({ error: "Media storage chưa được cấu hình." }, { status: 503 });
  const client = new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
  const extension = body.fileName.includes(".") ? body.fileName.split(".").pop() : "bin";
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: body.contentType }), { expiresIn: 900 });
  return NextResponse.json({ url, key, publicUrl: process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/${key}` : null });
}
