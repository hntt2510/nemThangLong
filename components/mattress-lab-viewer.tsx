"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { hasPublishedMattressLab, publishedMattressLabLayers } from "@/lib/mattress-lab";
import type { Product } from "@/lib/types";

const ThreeMattressModel = dynamic(
  () => import("./three-mattress-model").then((module) => module.ThreeMattressModel),
  { ssr: false, loading: () => <div className="viewer-loading">Đang tải mô hình…</div> },
);

type Mode = "complete" | "inside" | "exploded" | "materials" | "support";

const modeLabels: Record<Mode, string> = {
  complete: "Toàn cảnh",
  inside: "Bên trong",
  exploded: "Tách lớp",
  materials: "Chất liệu",
  support: "Nâng đỡ",
};

function LabUnavailable({ product }: { product: Product }) {
  const poster = product.posterUrl ?? product.media[0]?.url;

  return <div className="lab-viewer-shell"><section className="lab-unavailable"><p className="eyebrow">MATTRESS LAB</p><h1>Trải nghiệm 3D đang được hoàn thiện.</h1><p>Chúng tôi chỉ mở Mattress Lab khi mô hình và cấu tạo sản phẩm đã được xác nhận đầy đủ.</p>{poster && <img src={poster} alt={`Hình ảnh ${product.name}`} />}<Link href="/nem/luxury" className="button button-primary">Xem sản phẩm Luxury <span aria-hidden="true">→</span></Link></section></div>;
}

export function MattressLabViewer({ product }: { product: Product }) {
  const [mode, setMode] = useState<Mode>("complete");
  const [rotationY, setRotationY] = useState(-.35);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const publishedLayers = publishedMattressLabLayers(product);
  const hasPublishedModel = hasPublishedMattressLab(product);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!hasPublishedModel) return <LabUnavailable product={product} />;

  return <div className="lab-viewer-shell"><div className="lab-mode-bar" role="tablist" aria-label="Chế độ Mattress Lab">{(Object.keys(modeLabels) as Mode[]).map((item, index) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)} role="tab" aria-selected={mode === item}>{String(index + 1).padStart(2, "0")} — {modeLabels[item]}</button>)}</div><div className="lab-viewer-stage">{mobile && !ready ? <div className="viewer-fallback"><img src={product.posterUrl ?? product.media[0]?.url} alt={`Poster Mattress Lab của ${product.name}`} /><div><p className="eyebrow">MATTRESS LAB</p><h2>Khám phá cấu tạo</h2><p>Chỉ tải mô hình 3D khi bạn chọn mở trên thiết bị này.</p><button className="button button-primary" onClick={() => setReady(true)}>Mở mô hình 3D</button></div></div> : <Suspense fallback={<div className="viewer-loading">Đang tải mô hình…</div>}><div className="three-model-canvas" aria-label={`Mô hình nệm ở chế độ ${mode}`}><ThreeMattressModel url={product.modelUrl!} mode={mode} layers={publishedLayers} rotationY={rotationY} resetKey={canvasKey} /></div></Suspense>}</div><div className="viewer-controls"><label>Xoay<input aria-label="Xoay mô hình" type="range" min={-3.14} max={3.14} step={.01} value={rotationY} onChange={(event) => setRotationY(Number(event.target.value))} /></label><button onClick={() => { setMode("complete"); setRotationY(-.35); setCanvasKey((key) => key + 1); }}>Đặt lại góc nhìn</button></div>{mode !== "complete" && <div className="layer-list">{publishedLayers.map((layer) => <div key={layer.id}><b>{String(layer.sortOrder).padStart(2, "0")}</b><span>{layer.name}</span><small>{layer.material ?? "Thông số đang cập nhật"}</small></div>)}</div>}</div>;
}
