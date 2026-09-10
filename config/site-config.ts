export const SITE_CONFIG = {
  brand: {
    name: "Nệm Thăng Long",
    slogan: "Giấc Ngủ Việt - Nâng Đỡ Cột Sống",
    legalName: "Công ty TNHH Nệm Thăng Long Việt Nam",
    domain: process.env.NEXT_PUBLIC_APP_URL || "https://nemthanglong.vn",
  },
  contact: {
    hotlineRaw: "0911251004", // Standard digits for tel: links & APIs
    hotlineDisplay: "0911 251 004", // Formatted for UI display
    supportEmail: "nemthanglong@gmail.com",
    zaloPhone: "0911251004",
    zaloLink: "https://zalo.me/0911251004",
    workHours: "07:30 - 21:00 (Mở cửa tất cả các ngày trong tuần)",
    addressMain: "18/2 Ấp Thanh Hoá, Xã Hố Nai 3, Huyện Trảng Bom, Đồng Nai",
  },
  policies: {
    sleepTrialNights: 100,
    minWarrantyYears: 10,
    maxWarrantyYears: 15,
    freeDeliveryText: "Giao tận phòng ngủ miễn phí",
    parkingText: "Bãi đỗ ô tô & xe tải miễn phí tại tất cả showroom",
  },
  pricingTiers: {
    budgetMax: 8000000, // < 8M: America, Classic
    midMax: 14000000,   // 8M - 14M: Than Hoạt Tính, Memory Foam, Cao Su 3/4
    luxuryMin: 14000000 // > 14M: Cao Su Thiên Nhiên 100%, Khách Sạn Vinhalatex
  }
} as const;

export type SiteConfig = typeof SITE_CONFIG;
