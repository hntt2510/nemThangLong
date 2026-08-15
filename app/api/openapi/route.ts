import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOpenApiDocument } from "@/lib/openapi";
import { openApiAuthStatus } from "@/lib/openapi-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = openApiAuthStatus(await auth());
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  return NextResponse.json(getOpenApiDocument(), { headers: { "Cache-Control": "private, no-store" } });
}
