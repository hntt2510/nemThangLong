import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isSwaggerTryItOutAllowed, openApiAuthStatus } from "@/lib/openapi-auth";
import { SwaggerClient } from "@/app/api-docs/swagger-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API Docs | Nệm Thăng Long",
  robots: { index: false, follow: false },
};

export default async function ApiDocsPage() {
  const status = openApiAuthStatus(await auth());
  if (status === 401) redirect("/dang-nhap");
  if (status !== 200) notFound();
  return <main className="api-docs-page"><div className="api-docs-heading"><p className="eyebrow">THĂNG LONG / API</p><h1>OpenAPI documentation</h1><p>Contract của các Route Handler hiện hữu. Production chỉ hiển thị dạng read-only.</p></div><SwaggerClient allowTryItOut={isSwaggerTryItOutAllowed()} /></main>;
}

