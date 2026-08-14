"use client";

import { useEffect, useMemo, useRef, type ElementRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import type { ProductLayer } from "@/lib/types";

function Model({ url, mode, layers, rotationY }: { url: string; mode: string; layers: ProductLayer[]; rotationY: number }) {
  const { scene } = useGLTF(url);
  const copy = useMemo(() => scene.clone(), [scene]);
  const rendered = useMemo(() => {
    const next = copy.clone();
    next.traverse((node) => {
      if (!("name" in node) || !("position" in node)) return;
      const layer = layers.find((item) => item.nodeName === node.name);
      if (!layer) return;
      if (mode === "exploded") node.position.y += layer.explodeDistance ?? 0;
      if (mode === "inside" && layer.sortOrder === Math.min(...layers.map((item) => item.sortOrder))) node.visible = false;
      if (mode === "support" && layer.sortOrder !== Math.max(...layers.map((item) => item.sortOrder))) node.visible = false;
      if (mode === "materials" && "material" in node && node.material && !Array.isArray(node.material)) {
        const material = node.material as { emissive?: { set: (value: string) => void }; emissiveIntensity?: number };
        material.emissive?.set("#8d9f77"); material.emissiveIntensity = .28;
      }
    });
    return next;
  }, [copy, layers, mode]);
  return <primitive object={rendered} scale={1.8} rotation={[0, rotationY, 0]} />;
}

export function ThreeMattressModel({ url, mode, layers, rotationY, resetKey }: { url: string; mode: string; layers: ProductLayer[]; rotationY: number; resetKey: number }) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  useEffect(() => { controlsRef.current?.reset(); }, [resetKey]);
  return <Canvas camera={{ position: [0, 1.2, 4.8], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true }}><ambientLight intensity={1.3} /><directionalLight position={[4, 4, 3]} intensity={2} /><Environment preset="studio" /><Model url={url} mode={mode} layers={layers} rotationY={rotationY} /><ContactShadows position={[0, -1.2, 0]} opacity={.35} scale={5} blur={2} /><OrbitControls ref={controlsRef} enablePan={false} minDistance={3} maxDistance={7} /></Canvas>;
}
