import type { NextConfig } from "next";

const isExplicitNonProduction =
  process.env.VERCEL_ENV === "preview" ||
  process.env.VERCEL_ENV === "development" ||
  process.env.ENVIRONMENT === "staging" ||
  process.env.ENVIRONMENT === "preview" ||
  process.env.ENVIRONMENT === "development" ||
  process.env.ENVIRONMENT === "test" ||
  process.env.ENVIRONMENT === "local" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "preview" ||
  process.env.APP_ENV === "development" ||
  process.env.APP_ENV === "test" ||
  process.env.APP_ENV === "local" ||
  process.env.PREVIEW_MODE === "true" ||
  process.env.IS_PREVIEW === "true";

const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.ENVIRONMENT === "production" ||
  process.env.APP_ENV === "production" ||
  process.env.DEPLOY_ENV === "production" ||
  process.env.SITE_ENV === "production" ||
  (process.env.NODE_ENV === "production" && !isExplicitNonProduction);

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
