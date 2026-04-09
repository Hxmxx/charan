import { MeshPhysicalMaterial, Shader } from "three";

export interface CarPaintUniforms {
  uFlakeIntensity: { value: number };
}

/**
 * MeshPhysicalMaterial 에 카페인트 플레이크 셰이더 주입
 */
export function injectCarPaintShader(
  material: MeshPhysicalMaterial,
  initialFlakeIntensity: number
): CarPaintUniforms {
  const uniforms: CarPaintUniforms = {
    uFlakeIntensity: { value: initialFlakeIntensity },
  };

  material.onBeforeCompile = (shader: Shader) => {
    // 유니폼 주입
    shader.uniforms.uFlakeIntensity = uniforms.uFlakeIntensity;

    // ============================================================
    // VERTEX SHADER — worldPosition 을 fragment 로 넘기기
    // ============================================================

    // 1. varying 선언 (vertex 상단)
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      /* glsl */ `
      varying vec3 vWorldPosition;

      void main() {
      `
    );

    // 2. worldPosition 계산해서 varying 에 저장
    // worldpos_vertex 는 이미 Three.js 내부에서 worldPosition 을 계산하는 지점
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      /* glsl */ `
      #include <worldpos_vertex>
      vWorldPosition = worldPosition.xyz;
      `
    );

    // ============================================================
    // FRAGMENT SHADER — 플레이크 계산
    // ============================================================

    // 3. varying 수신 + 유니폼 + 헬퍼 함수 선언
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      /* glsl */ `
      uniform float uFlakeIntensity;
      varying vec3 vWorldPosition;

      // 3D 해시 노이즈
      float hash3(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
      }

      void main() {
      `
    );

    // 4. 색 결정 직후에 플레이크 주입
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `
      #include <color_fragment>

      // === CARPAINT FLAKE (2.3.2 - 데모용) ===
      // 월드 좌표를 잘게 나눠서 각 셀마다 랜덤값
      vec3 flakeCell = floor(vWorldPosition * 300.0);
      float flakeRandom = hash3(flakeCell);

      // 상위 2% 확률의 셀만 플레이크로 찍기
      if (flakeRandom > 0.98) {
        diffuseColor.rgb += vec3(1.0) * uFlakeIntensity;
      }
      // === END CARPAINT FLAKE ===
      `
    );
  };

  material.needsUpdate = true;

  return uniforms;
}