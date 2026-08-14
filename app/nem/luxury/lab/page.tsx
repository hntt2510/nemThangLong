import Link from "next/link";
import { MattressLabViewer } from "@/components/mattress-lab-viewer";
import { getStorefrontProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function LuxuryLabPage() {
  const product = await getStorefrontProduct("luxury");
  return <main><div className="lab-page-top"><Link href="/nem/luxury">← Quay lại Luxury</Link><span>THĂNG LONG LUXURY</span></div><MattressLabViewer product={product} /></main>;
}
