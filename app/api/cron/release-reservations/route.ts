import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { releaseExpiredReservations } from "@/lib/payment-lifecycle";

export async function GET(request: Request) {
  let env;
  try { env = getEnv(); } catch { return NextResponse.json({ error: "Cron configuration is invalid." }, { status: 503 }); }
  if (!env.CRON_SECRET) return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let prisma;
  try { prisma = getPrisma(); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!prisma) return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 });
  try { return NextResponse.json(await releaseExpiredReservations(prisma)); } catch { return NextResponse.json({ error: "Không thể release reservation." }, { status: 503 }); }
}
