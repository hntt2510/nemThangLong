import type { Metadata } from "next";
import { Lora, Be_Vietnam_Pro } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const lora = Lora({ subsets: ["latin", "vietnamese"], variable: "--font-lora", display: "swap" });
const beVietnam = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], variable: "--font-be", display: "swap", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Thăng Long Luxury — Built for comfort",
  description: "Một trải nghiệm nghỉ ngơi cân bằng giữa độ êm, độ nâng đỡ và sự hồi đáp tự nhiên.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${lora.variable} ${beVietnam.variable}`}><AppProviders>{children}</AppProviders></body></html>;
}
