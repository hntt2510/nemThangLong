export type ProductMedia = {
  id: string;
  type: "image" | "video" | "model";
  url: string;
  alt: string;
  aspect?: string;
  focalX?: number;
  focalY?: number;
  fit?: "cover" | "contain";
  isDemo?: boolean;
};

export type ProductVariant = {
  id: string;
  width: number;
  length: number;
  thickness: number;
  price: number | null;
  compareAtPrice?: number | null;
  sku: string;
  stock: number;
  active: boolean;
  priceStatus?: "PLACEHOLDER" | "VERIFIED" | "SOURCE_CONFLICT";
  stockStatus?: "PLACEHOLDER" | "VERIFIED" | "SOURCE_CONFLICT";
};

export type ProductLayer = {
  id: string;
  sortOrder: number;
  name: string;
  material?: string | null;
  thickness?: string | null;
  description?: string | null;
  nodeName?: string | null;
  explodeDistance?: number;
  showHotspot?: boolean;
  published?: boolean;
};

export type ProductContent = {
  comfort?: { published: boolean; firmnessLabel?: string; firmnessScore?: number | null; support?: number | null; breathability?: number | null; motionIsolation?: number | null };
  audience?: { published: boolean; title: string; body: string };
  materialStory?: { published: boolean; title: string; body: string };
  delivery?: { published: boolean; title?: string; body: string };
  warranty?: { published: boolean; title?: string; body: string };
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  media: ProductMedia[];
  variants: ProductVariant[];
  layers: ProductLayer[];
  modelUrl?: string | null;
  posterUrl?: string | null;
  mattressLab: boolean;
  reviews: Array<{ authorName: string; rating: number; comfort?: number; quality?: number; value?: number; body: string; createdAt: string; isFixture?: boolean }>;
  facts?: Array<{ key: string; label: string; value: string; dataStatus: "PLACEHOLDER" | "VERIFIED" | "SOURCE_CONFLICT" }>;
  content?: ProductContent | null;
  presentation?: "STANDARD" | "LUXURY";
  saleStatus?: "HIDDEN" | "CONTACT_ONLY" | "ACTIVE";
  verificationStatus?: "PLACEHOLDER" | "VERIFIED";
  isDemo: boolean;
  source: "database" | "demo" | "showcase";
  purchasable: boolean;
  isShowcase?: boolean;
  previewPurchasable?: boolean;
};

export type CartItem = {
  variantId: string;
  quantity: number;
  productSlug: string;
  productName: string;
  width: number;
  length: number;
  thickness: number;
  price: number;
  sku: string;
  image: string;
};
