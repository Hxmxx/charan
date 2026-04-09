export type PaintCategory = "solid" | "metallic" | "pearl";

export interface PaintColor {
  id: string;
  name: string;
  nameKo: string;
  category: PaintCategory;
  hex: string;

  // 베이스 레이어
  metalness: number;
  roughness: number;

  // Clearcoat 레이어
  clearcoat: number;
  clearcoatRoughness: number;

  // 환경 반사 강도
  envMapIntensity: number;

  // Phase 2.3 플레이크용
  flakeIntensity: number;
}

export const PAINT_COLORS: PaintColor[] = [
  // === SOLID ===
  {
    id: "obsidian-black",
    name: "Obsidian Black",
    nameKo: "옵시디언 블랙",
    category: "solid",
    hex: "#0a0a0e",
    metalness: 0.9,
    roughness: 0.28,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.8,
    flakeIntensity: 0.0,
  },
  {
    id: "diamond-white",
    name: "Diamond White",
    nameKo: "다이아몬드 화이트",
    category: "solid",
    hex: "#d4d2cc",           // ← #e8e6e0 → 더 어둡게 (진짜 화이트는 이 정도가 한계)
    metalness: 0.4,           // ← 0.3 → 살짝 올림 (diffuse 약화)
    roughness: 0.32,          // ← 0.15 → 대폭 올림 (하이라이트 분산)
    clearcoat: 1.0,
    clearcoatRoughness: 0.08, // ← 0.02 → 올림 (코팅 하이라이트도 부드럽게)
    envMapIntensity: 1.4,     // ← 2.5 → 확 낮춤
    flakeIntensity: 0.0,
    },

  // === METALLIC ===
  {
    id: "nautical-blue",
    name: "Nautical Blue",
    nameKo: "노티컬 블루",
    category: "metallic",
    hex: "#0f1f3a",
    metalness: 0.95,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025,
    envMapIntensity: 1.9,
    flakeIntensity: 0.6,
  },
  {
    id: "emerald-green",
    name: "Emerald Green",
    nameKo: "에메랄드 그린",
    category: "metallic",
    hex: "#0d2a22",
    metalness: 0.95,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025,
    envMapIntensity: 1.9,
    flakeIntensity: 0.6,
  },
  {
    id: "ruby-red",
    name: "Ruby Red",
    nameKo: "루비 레드",
    category: "metallic",
    hex: "#3a0a10",
    metalness: 0.95,
    roughness: 0.20,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.0,
    flakeIntensity: 0.7,
  },

  // === PEARL ===
  {
    id: "champagne-gold",
    name: "Champagne Gold",
    nameKo: "샴페인 골드",
    category: "pearl",
    hex: "#9e8655",           // ← 살짝 어둡게 (기존 #b8a070은 너무 밝음)
    metalness: 0.75,          // ← 약간 낮춤
    roughness: 0.20,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025,
    envMapIntensity: 2.2,     // ← 강화
    flakeIntensity: 0.9,
  },
  {
    id: "silver-pearl",
    name: "Silver Pearl",
    nameKo: "실버 펄",
    category: "pearl",
    hex: "#a8adb3",           // ← 살짝 어둡게
    metalness: 0.6,           // ← 낮춤 (밝은 색 문제 방지)
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.4,     // ← 강화
    flakeIntensity: 0.85,
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    nameKo: "로즈 골드",
    category: "pearl",
    hex: "#8a5a4c",           // ← 어둡게
    metalness: 0.78,
    roughness: 0.20,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025,
    envMapIntensity: 2.1,
    flakeIntensity: 0.8,
  },
];

export const DEFAULT_COLOR_ID = "obsidian-black";

export const getColorById = (id: string): PaintColor =>
  PAINT_COLORS.find((c) => c.id === id) ?? PAINT_COLORS[0];