import Link from "next/link";
import { MattressLabViewer } from "@/components/mattress-lab-viewer";
import { luxuryProduct } from "@/lib/product-data";

export default function LuxuryLabPage() {
  return <main><div className="lab-page-top"><Link href="/nem/luxury">← Quay lại Luxury</Link><span>THĂNG LONG LUXURY</span></div><MattressLabViewer product={luxuryProduct} /></main>;
}
