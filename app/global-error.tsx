"use client";

import { useEffect } from "react";
import { SITE_CONFIG } from "@/config/site-config";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary Caught]:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          backgroundColor: "#FAF9F6",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#1A2530",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DA",
            borderRadius: "16px",
            padding: "2.5rem 2rem",
            boxShadow: "0 10px 30px -10px rgba(26, 37, 48, 0.08)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#C8A27A",
              marginBottom: "0.75rem",
            }}
          >
            {SITE_CONFIG.brand.name}
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Không Thể Tải Trang
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#736E65",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Hệ thống đang gặp sự cố kết nối máy chủ tạm thời. Vui lòng bấm thử lại hoặc liên hệ hotline xưởng để được hỗ trợ.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.75rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: "#1A2530",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Thử tải lại trang
          </button>
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #F0ECE1",
              fontSize: "0.85rem",
              color: "#8C867A",
            }}
          >
            Hotline:{" "}
            <a
              href={`tel:${SITE_CONFIG.contact.hotlineRaw}`}
              style={{ color: "#1A2530", fontWeight: 600, textDecoration: "none" }}
            >
              {SITE_CONFIG.contact.hotlineDisplay}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
