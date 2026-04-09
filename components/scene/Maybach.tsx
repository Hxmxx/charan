"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Mesh, MeshPhysicalMaterial, Color } from "three";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import { getColorById, DEFAULT_COLOR_ID } from "@/lib/constants/colors";
import {
  injectCarPaintShader,
  CarPaintUniforms,
} from "@/shaders/carPaint/carPaintShader";

const MODEL_PATH = "/models/mercedes-benz_maybach_2022-v2.glb";

const isPaintMaterial = (name: string) =>
  name.toLowerCase().includes("paint");

interface PaintMaterialEntry {
  material: MeshPhysicalMaterial;
  uniforms: CarPaintUniforms;
}

export default function Maybach() {
  const { scene } = useGLTF(MODEL_PATH);
  const paintEntriesRef = useRef<PaintMaterialEntry[]>([]);
  const colorId = useConfiguratorStore((s) => s.colorId);

  // 초기 1회: 머티리얼 교체 + 셰이더 주입
  useEffect(() => {
    const entries: PaintMaterialEntry[] = [];
    const defaultColor = getColorById(DEFAULT_COLOR_ID);

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

      // Paint — 페인트 머티리얼 + 셰이더 주입
      if (isPaintMaterial(material.name)) {
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

        // ⭐ 셰이더 주입
        const uniforms = injectCarPaintShader(
          paintMaterial,
          defaultColor.flakeIntensity
        );

        mesh.material = paintMaterial;
        entries.push({ material: paintMaterial, uniforms });
      }
    });

    paintEntriesRef.current = entries;
    console.log(`🎨 Paint materials tracked: ${entries.length}`);
  }, [scene]);

  // 색 변경 시: 파라미터 + 유니폼 업데이트
  useEffect(() => {
    const color = getColorById(colorId);
    paintEntriesRef.current.forEach(({ material, uniforms }) => {
      material.color.set(color.hex);
      material.metalness = color.metalness;
      material.roughness = color.roughness;
      material.clearcoat = color.clearcoat;
      material.clearcoatRoughness = color.clearcoatRoughness;
      material.envMapIntensity = color.envMapIntensity;
      material.needsUpdate = true;

      // ⭐ 셰이더 유니폼 업데이트
      uniforms.uFlakeIntensity.value = color.flakeIntensity;
    });
    console.log(
      `🎨 Paint color → ${color.name} (flake: ${color.flakeIntensity})`
    );
  }, [colorId]);

  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_PATH);