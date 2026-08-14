"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import type { ProductLayer } from "@/lib/types";

function Model({ url, mode, layers }: { url: string; mode: string; layers: ProductLayer[] }) {
  const { scene } = useGLTF(url);
  const copy = scene.clone();
  copy.traverse((node) => {
    if (!("name" in node) || !("position" in node)) return;
    const layer = layers.find((item) => item.nodeName === node.name);
    if (layer && mode === "exploded") node.position.y += layer.explodeDistance ?? 0;
    if (layer && mode === "inside" && layer.sortOrder === 1) node.visible = false;
  });
  return <primitive object={copy} scale={1.8} rotation={[0, -0.35, 0]} />;
}

export function ThreeMattressModel({ url, mode, layers }: { url: string; mode: string; layers: ProductLayer[] }) {
  return <Canvas camera={{ position: [0, 1.2, 4.8], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true }}><ambientLight intensity={1.3} /><directionalLight position={[4, 4, 3]} intensity={2} /><Environment preset="studio" /><Model url={url} mode={mode} layers={layers} /><ContactShadows position={[0, -1.2, 0]} opacity={.35} scale={5} blur={2} /><OrbitControls enablePan={false} minDistance={3} maxDistance={7} /></Canvas>;
}
