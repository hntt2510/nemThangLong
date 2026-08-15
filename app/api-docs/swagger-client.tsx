"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react").then((module) => module.default), { ssr: false, loading: () => <p>Đang tải tài liệu API…</p> });

export function SwaggerClient({ allowTryItOut }: { allowTryItOut: boolean }) {
  return <SwaggerUI url="/api/openapi" supportedSubmitMethods={allowTryItOut ? undefined : []} requestInterceptor={(request) => ({ ...request, credentials: "same-origin" })} />;
}
