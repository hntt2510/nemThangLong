import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    UI_SHOWCASE_MODE: process.env.UI_SHOWCASE_MODE === "true" || process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE === "true" ? "true" : "false",
    NEXT_PUBLIC_UI_SHOWCASE_MODE: process.env.UI_SHOWCASE_MODE === "true" || process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE === "true" ? "true" : "false",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
  typedRoutes: true,
};

export default nextConfig;
