import type { CartItem } from "@/lib/types";

export const SHOWCASE_CART_ITEMS: CartItem[] = [
  {
    variantId: "var-lx-160-200-20",
    quantity: 1,
    productSlug: "luxury",
    productName: "Nệm Thăng Long Luxury",
    width: 160,
    length: 200,
    thickness: 20,
    price: 22900000,
    sku: "TL-LX-16020020",
    image: "/images/home-luxury.webp",
  },
  {
    variantId: "var-cl-120-200-10",
    quantity: 1,
    productSlug: "classic",
    productName: "Nệm Thăng Long Classic",
    width: 120,
    length: 200,
    thickness: 10,
    price: 6900000,
    sku: "TL-CL-12020010",
    image: "/images/home-classic.webp",
  },
];
