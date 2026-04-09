"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows, Stats } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import Maybach from "./Maybach";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import { PAINT_COLORS } from "@/lib/constants/colors";
import * as THREE from "three";

export default function Scene() {
  // 개발용: 콘솔에서 색 바꿀 수 있게 window에 노출
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).charan = {
        setColor: (id: string) => useConfiguratorStore.getState().setColorId(id),
        colors: PAINT_COLORS.map((c) => c.id),
      };
      console.log("🔧 Dev console: charan.setColor('ruby-red')");
      console.log("🔧 Available colors:", PAINT_COLORS.map((c) => c.id));
    }
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [5, 2, 5], fov: 40 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <Stats /> {/* 성능 확인용 */}
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} environmentIntensity={1.2}/>
        {/* Key Light — 차량 위에서 내려오는 주조명 */}
        <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        />

        {/* Fill Light — 반대쪽 약한 보조광 */}
        <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        />

        {/* Rim Light — 뒤쪽에서 윤곽 강조 */}
        <directionalLight
        position={[0, 3, -8]}
        intensity={0.8}
        color="#a0c4ff"
        />
        <Maybach />
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.75}
          scale={20}
          blur={3.5}
          far={5}
          resolution={1024}
        />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}