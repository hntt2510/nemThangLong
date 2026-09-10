"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function WovenSurface() {
  const surfaceRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (surfaceRef.current) {
      surfaceRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.14) * 0.03;
      surfaceRef.current.rotation.x = -0.92 + Math.sin(clock.elapsedTime * 0.1) * 0.025;
    }
  });

  return (
    <mesh ref={surfaceRef} position={[1.9, -0.3, -1.3]} rotation={[-0.92, 0.18, -0.24]}>
      <planeGeometry args={[8.4, 6.2, 28, 28]} />
      <meshStandardMaterial color="#cdb9a0" roughness={0.86} metalness={0.02} transparent opacity={0.44} wireframe />
    </mesh>
  );
}

export function HomeHeroAtmosphereScene({ active }: { active: boolean }) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 5.5], fov: 42 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
    >
      <ambientLight intensity={1.5} color="#fff4df" />
      <pointLight position={[2.4, 2.2, 2]} intensity={16} color="#e6caa6" distance={7} />
      <pointLight position={[-2.4, -1.2, 1]} intensity={8} color="#8b725c" distance={6} />
      <WovenSurface />
    </Canvas>
  );
}
