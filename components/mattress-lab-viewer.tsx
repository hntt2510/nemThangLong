"use client";
/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "@/lib/types";

const ThreeMattressModel = dynamic(() => import("./three-mattress-model").then((module) => module.ThreeMattressModel), { ssr: false, loading: () => <div className="viewer-loading">Đang tải mô hình…</div> });
type Mode = "complete" | "inside" | "exploded" | "materials" | "support";

export function MattressLabViewer({ product }: { product: Product }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("complete");
  const [rotationY, setRotationY] = useState(-.35);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const publishedLayers = useMemo(() => product.layers.filter((layer) => layer.published && layer.nodeName), [product.layers]);
  const hasPublishedModel = Boolean(product.modelUrl && publishedLayers.length);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update); return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!hasPublishedModel || mobile) return;
    const node = stageRef.current; if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setReady(true); observer.disconnect(); } }, { rootMargin: "300px" });
    observer.observe(node); return () => observer.disconnect();
  }, [hasPublishedModel, mobile]);

  const fallback = <div className="viewer-fallback"><img src={product.posterUrl ?? product.media[0]?.url} alt="Poster Mattress Lab — mô hình 3D sẽ xuất hiện sau khi được cấu hình" /><div><p className="eyebrow">MATTRESS LAB {product.isDemo ? "· 3D DEMO" : ""}</p><h2>{product.isDemo ? "3D demo — không phải cấu tạo sản phẩm" : "Khám phá cấu tạo"}</h2><p>{product.isDemo ? "Mô hình minh họa chỉ dùng để kiểm tra trải nghiệm viewer; không đại diện cho thông số sản phẩm." : "Mô hình 3D chỉ hiển thị các lớp đã được xác nhận trong CMS."}</p></div></div>;
  return <div className="lab-viewer-shell"><div className="lab-mode-bar" role="tablist" aria-label="Chế độ Mattress Lab">{(["complete", "inside", "exploded", "materials", "support"] as Mode[]).map((item, index) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)} role="tab" aria-selected={mode === item}>{String(index + 1).padStart(2, "0")} — {item}</button>)}</div><div ref={stageRef} className="lab-viewer-stage">{!hasPublishedModel ? fallback : mobile && !ready ? <div className="viewer-fallback"><img src={product.posterUrl ?? product.media[0]?.url} alt="Poster Mattress Lab" /><button className="button button-primary" onClick={() => setReady(true)}>Tải 3D demo</button><p className="muted">Chỉ tải mô hình sau khi bạn chọn trên thiết bị di động.</p></div> : ready ? <Suspense fallback={<div className="viewer-loading">Đang tải mô hình…</div>}><div className="three-model-canvas" aria-label={`Mô hình nệm ở chế độ ${mode}`}><ThreeMattressModel url={product.modelUrl!} mode={mode} layers={publishedLayers} rotationY={rotationY} resetKey={canvasKey} /></div></Suspense> : <div className="viewer-loading">Đang chờ viewport…</div>}</div><div className="viewer-controls"><label>Rotate<input aria-label="Xoay mô hình" type="range" min={-3.14} max={3.14} step={.01} value={rotationY} onChange={(event) => setRotationY(Number(event.target.value))} /></label><button onClick={() => { setMode("complete"); setRotationY(-.35); setCanvasKey((key) => key + 1); }}>Reset view</button></div>{mode !== "complete" && publishedLayers.length > 0 && <div className="layer-list">{publishedLayers.map((layer) => <div key={layer.id}><b>{String(layer.sortOrder).padStart(2, "0")}</b><span>{layer.name}</span><small>{layer.material ?? "Thông số đang cập nhật"}</small></div>)}</div>}</div>;
}
