"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Mesh, MeshPhysicalMaterial, Color } from "three";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import { getColorById, DEFAULT_COLOR_ID } from "@/lib/constants/colors";

const MODEL_PATH = "/models/mercedes-benz_maybach_2022-v2.glb";

const isPaintMaterial = (name: string) =>
  name.toLowerCase().includes("paint");

export default function Maybach() {
  const { scene } = useGLTF(MODEL_PATH);
  const paintMaterialsRef = useRef<MeshPhysicalMaterial[]>([]);
  const colorId = useConfiguratorStore((s) => s.colorId);

  // 초기 1회: 머티리얼 교체 + 페인트 머티리얼 수집
  useEffect(() => {
    const paintMaterials: MeshPhysicalMaterial[] = [];

    scene.traverse((child) => {
      if (!(child as Mesh).isMesh) return;
      const mesh = child as Mesh;
      const material = mesh.material;
      if (!material || Array.isArray(material)) return;

      // Glass — 틴티드 윈도우
      if (material.name === "Glass") {
        mesh.material = new MeshPhysicalMaterial({
          color: new Color("#0a0a0a"),
          metalness: 0.2,
          roughness: 0.05,
          transmission: 0.15,
          transparent: true,
          opacity: 0.85,
          ior: 1.5,
          envMapIntensity: 2.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
        });
        return;
      }

      // Paint — 페인트 머티리얼 업그레이드
    if (isPaintMaterial(material.name)) {
        const defaultColor = getColorById(DEFAULT_COLOR_ID);
        const paintMaterial = new MeshPhysicalMaterial({
            color: new Color(defaultColor.hex),
            metalness: defaultColor.metalness,
            roughness: defaultColor.roughness,
            clearcoat: defaultColor.clearcoat,
            clearcoatRoughness: defaultColor.clearcoatRoughness,
            envMapIntensity: defaultColor.envMapIntensity,
            reflectivity: 0.5,
            });
        paintMaterial.name = material.name;
        mesh.material = paintMaterial;
        paintMaterials.push(paintMaterial);
        }
    });

    paintMaterialsRef.current = paintMaterials;
    console.log(`🎨 Paint materials tracked: ${paintMaterials.length}`);
  }, [scene]);

// 색 변경 시: 추적 중인 모든 페인트 머티리얼 업데이트
useEffect(() => {
  const color = getColorById(colorId);
  paintMaterialsRef.current.forEach((mat) => {
    mat.color.set(color.hex);
    mat.metalness = color.metalness;
    mat.roughness = color.roughness;
    mat.clearcoat = color.clearcoat;
    mat.clearcoatRoughness = color.clearcoatRoughness;
    mat.envMapIntensity = color.envMapIntensity;
    mat.needsUpdate = true;
  });
  console.log(`🎨 Paint color → ${color.name} (${color.hex})`);
}, [colorId]);

  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_PATH);