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
  comfort?: { published: boolean; firmnessLabel?: string; firmnessScore?: number; support?: number; breathability?: number; motionIsolation?: number };
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
  reviews: Array<{ rating: number; comfort?: number; quality?: number; value?: number }>;
  content?: ProductContent | null;
  isDemo: boolean;
  source: "database" | "demo";
  purchasable: boolean;
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
