import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { publicLeadSchema } from "@/lib/lead-validation";
import { createPublicLead, LeadDatabaseError, LeadRateLimitError, LeadValidationError } from "@/lib/leads";

const MAX_BODY_BYTES = 16 * 1024;

function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

class LeadBodyTooLargeError extends Error {}

async function readBodyWithLimit(request: Request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      total += chunk.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new LeadBodyTooLargeError("Lead body too large.");
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Nội dung gửi quá lớn." }, { status: 413 });

  let raw: string;
  try {
    raw = await readBodyWithLimit(request);
  } catch (error) {
    if (error instanceof LeadBodyTooLargeError) return NextResponse.json({ error: "Nội dung gửi quá lớn." }, { status: 413 });
    return NextResponse.json({ error: "Dữ liệu gửi không hợp lệ." }, { status: 400 });
  }
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch { return NextResponse.json({ error: "Dữ liệu gửi không hợp lệ." }, { status: 400 }); }
  const parsed = publicLeadSchema.safeParse(parsedJson);
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng kiểm tra lại thông tin.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return NextResponse.json({ error: "Hệ thống lưu yêu cầu đang được cập nhật. Vui lòng thử lại sau." }, { status: 503 });
  try {
    await createPublicLead(prisma, parsed.data, { ipAddress: requestIp(request) });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof LeadValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof LeadRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    if (error instanceof LeadDatabaseError) return NextResponse.json({ error: "Hệ thống lưu yêu cầu đang được cập nhật. Vui lòng thử lại sau." }, { status: 503 });
    return NextResponse.json({ error: "Không thể lưu yêu cầu lúc này." }, { status: 503 });
  }
}
