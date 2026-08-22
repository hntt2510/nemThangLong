import type { Prisma } from "@prisma/client";

export const SHOWCASE_SETTINGS: {
  id: string;
  shippingFee: number | null;
  freeShippingThreshold: number | null;
  bankTransferReservationMinutes: number | null;
  bankTransferInfo: Prisma.JsonValue | null;
  contactPhone: string | null;
  contactEmail: string | null;
  navigation: Prisma.JsonValue | null;
  updatedAt: Date;
} = {
  id: "default",
  shippingFee: 0,
  freeShippingThreshold: 0,
  bankTransferReservationMinutes: 30,
  bankTransferInfo: {
    bankName: "Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam (Vietcombank)",
    accountNumber: "1234567890",
    accountHolder: "CONG TY TNHH NEM THANG LONG",
  },
  contactPhone: "0901 234 567",
  contactEmail: "tuvan@nemthanglong.vn",
  navigation: {
    items: [
      {
        label: "Nệm",
        href: "/nem",
        children: [
          { label: "Nệm Thăng Long America", href: "/nem/america" },
          { label: "Nệm Thăng Long Classic", href: "/nem/classic" },
          { label: "Nệm Thăng Long Hoạt Tính", href: "/nem/hoat-tinh" },
          { label: "Nệm Thăng Long Memory Foam", href: "/nem/memory-foam" },
          { label: "Nệm Cao Su Thiên Nhiên", href: "/nem/cao-su-thien-nhien" },
          { label: "Nệm Thăng Long Luxury", href: "/nem/luxury" },
        ],
      },
      { label: "Theo nhu cầu", href: "/tim-nem" },
      { label: "Luxury", href: "/nem/luxury" },
      { label: "Khách sạn & dự án", href: "/khach-san-du-an" },
      { label: "Về Thăng Long", href: "/lien-he" },
    ],
  },
  updatedAt: new Date("2026-08-22T00:00:00Z"),
};

