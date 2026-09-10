import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const ui = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-ui",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Nệm Thăng Long — Sleep, considered.",
  description: "Khám phá những lựa chọn nệm được sắp xếp để bạn tìm thấy cảm giác phù hợp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning className={ui.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
