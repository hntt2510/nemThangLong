import type { NextConfig } from "next";

const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.ENVIRONMENT === "production" ||
  process.env.APP_ENV === "production" ||
  process.env.DEPLOY_ENV === "production" ||
  process.env.SITE_ENV === "production";

const isShowcase = !isProduction && process.env.UI_SHOWCASE_MODE === "true";

const nextConfig: NextConfig = {
  env: {
    UI_SHOWCASE_MODE: isShowcase ? "true" : "false",
    NEXT_PUBLIC_UI_SHOWCASE_MODE: isShowcase ? "true" : "false",
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
