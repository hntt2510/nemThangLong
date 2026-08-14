"use client";

import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "@/lib/types";

const ThreeMattressModel = dynamic(() => import("./three-mattress-model").then((module) => module.ThreeMattressModel), { ssr: false, loading: () => <div className="viewer-loading">Đang tải mô hình…</div> });

type Mode = "complete" | "inside" | "exploded" | "materials" | "support";

export function MattressLabViewer({ product }: { product: Product }) {
  const [mode, setMode] = useState<Mode>("complete");
  const publishedLayers = useMemo(() => product.layers.filter((layer) => layer.published), [product.layers]);
  const hasPublishedModel = Boolean(product.modelUrl && publishedLayers.length);

  return <div className="lab-viewer-shell">
    <div className="lab-mode-bar" role="tablist" aria-label="Chế độ Mattress Lab">
      {(["complete", "inside", "exploded", "materials", "support"] as Mode[]).map((item, index) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)} role="tab" aria-selected={mode === item}>{String(index + 1).padStart(2, "0")} — {item}</button>)}
    </div>
    <div className="lab-viewer-stage">
      {hasPublishedModel ? <Suspense fallback={<div className="viewer-loading">Đang tải mô hình…</div>}><div className="three-model-canvas" aria-label={`Mô hình nệm ở chế độ ${mode}`}><ThreeMattressModel url={product.modelUrl!} mode={mode} layers={publishedLayers} /></div></Suspense> : <div className="viewer-fallback"><img src={product.posterUrl ?? product.media[0].url} alt="Poster Mattress Lab — mô hình 3D sẽ xuất hiện sau khi được cấu hình" /><div><p className="eyebrow">MATTRESS LAB</p><h2>Khám phá cấu tạo</h2><p>Mô hình 3D đang được hoàn thiện. Bạn vẫn có thể xem thông tin sản phẩm và vật liệu đã xác nhận.</p></div></div>}
    </div>
    <div className="viewer-controls"><span>Rotate</span><input aria-label="Xoay mô hình" type="range" min="-30" max="30" defaultValue="0" /><button onClick={() => setMode("complete")}>Reset view</button></div>
    {mode !== "complete" && publishedLayers.length > 0 && <div className="layer-list">{publishedLayers.map((layer) => <div key={layer.id}><b>{String(layer.sortOrder).padStart(2, "0")}</b><span>{layer.name}</span><small>{layer.material ?? "Thông số đang cập nhật"}</small></div>)}</div>}
  </div>;
}
