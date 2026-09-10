"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site-config";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Storefront Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAF9F6",
        padding: "2rem 1.5rem",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E4DA",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 10px 30px -10px rgba(26, 37, 48, 0.08)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#C8A27A",
            marginBottom: "0.75rem",
          }}
        >
          {SITE_CONFIG.brand.name}
        </span>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1A2530",
            marginBottom: "0.75rem",
            lineHeight: 1.3,
          }}
        >
          Hệ Thống Đang Kết Nối Lại
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#736E65",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          Dữ liệu trực tuyến đang trong quá trình khởi động hoặc đồng bộ. Quý khách vui lòng thử tải lại trang hoặc liên hệ hotline xưởng để được hỗ trợ tức thì.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: "#1A2530",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            Thử tải lại trang
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#1A2530",
              backgroundColor: "#FAF9F6",
              border: "1px solid #E8E4DA",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Về trang chủ
          </Link>
        </div>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid #F0ECE1",
            fontSize: "0.85rem",
            color: "#8C867A",
          }}
        >
          Hotline hỗ trợ 24/7:{" "}
          <a
            href={`tel:${SITE_CONFIG.contact.hotlineRaw}`}
            style={{
              color: "#1A2530",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {SITE_CONFIG.contact.hotlineDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
