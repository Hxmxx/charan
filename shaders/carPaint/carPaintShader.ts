import { MeshPhysicalMaterial, Shader } from "three";

export interface CarPaintUniforms {
  uFlakeIntensity: { value: number };
}

export function injectCarPaintShader(
  material: MeshPhysicalMaterial,
  initialFlakeIntensity: number
): CarPaintUniforms {
  const uniforms: CarPaintUniforms = {
    uFlakeIntensity: { value: initialFlakeIntensity },
  };

  material.onBeforeCompile = (shader: Shader) => {
    shader.uniforms.uFlakeIntensity = uniforms.uFlakeIntensity;

    // ============================================================
    // VERTEX SHADER — worldPosition + worldNormal 을 fragment 로 넘기기
    // ============================================================

    // 1. varying 선언
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      /* glsl */ `
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;

      void main() {
      `
    );

    // 2. worldPosition 저장
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      /* glsl */ `
      #include <worldpos_vertex>
      vWorldPosition = worldPosition.xyz;
      `
    );

    // 3. worldNormal 저장
    // beginnormal_vertex 이후에 objectNormal 이 사용 가능
    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      /* glsl */ `
      #include <beginnormal_vertex>
      vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
      `
    );

    // ============================================================
    // FRAGMENT SHADER
    // ============================================================

    // 4. varying 수신 + 유니폼 + 헬퍼 함수
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      /* glsl */ `
      uniform float uFlakeIntensity;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;

      float hash3(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
      }

      vec3 hash3vec(vec3 p) {
        return fract(sin(vec3(
          dot(p, vec3(127.1, 311.7, 74.7)),
          dot(p, vec3(269.5, 183.3, 246.1)),
          dot(p, vec3(113.5, 271.9, 124.6))
        )) * 43758.5453123);
      }

      void main() {
      `
    );

    // 5. 플레이크 계산 주입
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `
      #include <color_fragment>

      // === CARPAINT FLAKE (2.3.3 - 각도 의존적 스파클) ===

      // 1) 월드 좌표를 잘게 나눠서 플레이크 셀
      vec3 flakeCell = floor(vWorldPosition * 600.0);

      // 2) 각 셀의 고유 "랜덤 법선"
      vec3 flakeNormal = normalize(hash3vec(flakeCell) * 2.0 - 1.0);

      // 3) 표면 법선과 블렌딩
      vec3 surfaceNormal = normalize(vWorldNormal);
      vec3 blendedNormal = normalize(surfaceNormal + flakeNormal * 0.6);

      // 4) view direction: 카메라 월드 위치 → 현재 픽셀 월드 위치
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);

      // 5) 플레이크 법선과 view direction 의 정렬도
      float sparkle = dot(blendedNormal, viewDir);

      // 6) 정면일 때만 튀게 (pow)
      sparkle = pow(max(sparkle, 0.0), 80.0);

      // 7) 50% 셀만 플레이크로 마스킹
      float flakeMask = step(0.5, hash3(flakeCell));

      // 8) 최종 플레이크 밝기
      float flakeAmount = sparkle * flakeMask * uFlakeIntensity * 0.22;

      // 9) 베이스 색에 더하기
      diffuseColor.rgb += vec3(flakeAmount);

      // === END CARPAINT FLAKE ===
      `
    );
  };

  material.needsUpdate = true;

  return uniforms;
}