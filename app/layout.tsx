import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

// Keep the existing CSS variables so the editorial typography can be upgraded
// without touching every component that already opts into the display font.
const display = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const ui = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-ui",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Nệm Thăng Long — Sleep, considered.",
  description: "Khám phá những lựa chọn nệm được sắp xếp để bạn tìm thấy cảm giác phù hợp.",
};

import { UiShowcaseBadge } from "@/components/ui-showcase-badge";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={display.variable + " " + ui.variable}>
        <AppProviders>{children}</AppProviders>
        <UiShowcaseBadge />
      </body>
    </html>
  );
}
