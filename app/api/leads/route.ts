import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { publicLeadSchema } from "@/lib/lead-validation";
import { consumeLeadIpLimit, createPublicLead, LeadDatabaseError, LeadRateLimitError, LeadValidationError } from "@/lib/leads";

const MAX_BODY_BYTES = 16 * 1024;

function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Nội dung gửi quá lớn." }, { status: 413 });
  if (!consumeLeadIpLimit(requestIp(request))) return NextResponse.json({ error: "Vui lòng thử lại sau." }, { status: 429 });

  const raw = await request.text().catch(() => "");
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Nội dung gửi quá lớn." }, { status: 413 });
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch { return NextResponse.json({ error: "Dữ liệu gửi không hợp lệ." }, { status: 400 }); }
  const parsed = publicLeadSchema.safeParse(parsedJson);
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng kiểm tra lại thông tin.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return NextResponse.json({ error: "Hệ thống lưu yêu cầu đang được cập nhật. Vui lòng thử lại sau." }, { status: 503 });
  try {
    await createPublicLead(prisma, parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof LeadValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof LeadRateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    if (error instanceof LeadDatabaseError) return NextResponse.json({ error: "Hệ thống lưu yêu cầu đang được cập nhật. Vui lòng thử lại sau." }, { status: 503 });
    return NextResponse.json({ error: "Không thể lưu yêu cầu lúc này." }, { status: 503 });
  }
}
