import type { Metadata } from "next";
import { Lora, Be_Vietnam_Pro } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const lora = Lora({ subsets: ["latin", "vietnamese"], variable: "--font-lora", display: "swap" });
const beVietnam = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], variable: "--font-be", display: "swap", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Nệm Thăng Long — Sleep, considered.",
  description: "Khám phá những lựa chọn nệm được sắp xếp để bạn tìm thấy cảm giác phù hợp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={lora.variable + " " + beVietnam.variable}><AppProviders>{children}</AppProviders></body></html>;
}
