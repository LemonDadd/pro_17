import {
  useMode as culoriUseMode,
  modeOklch,
  modeOklab,
  modeRgb,
  modeHsl,
  converter,
  parse,
  formatHex,
  wcagContrast,
} from 'culori';
import type { PaletteStep, ColorSchemeType, ColorBlindType } from '@/types';
import { PALETTE_STEPS } from '@/types';

culoriUseMode(modeOklch);
culoriUseMode(modeOklab);
culoriUseMode(modeRgb);
culoriUseMode(modeHsl);

const toRgb = converter('rgb');
const toOklch = converter('oklch');

export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const parsed = parse(hex);
  if (!parsed) return { l: 0.5, c: 0.15, h: 250 };
  const oklchColor = toOklch(parsed);
  if (!oklchColor) return { l: 0.5, c: 0.15, h: 250 };
  return {
    l: oklchColor.l ?? 0.5,
    c: oklchColor.c ?? 0.15,
    h: (oklchColor.h ?? 250) % 360,
  };
}

export function oklchToHex(l: number, c: number, h: number): string {
  const color = { mode: 'oklch' as const, l, c, h: h % 360 };
  const rgb = toRgb(color);
  if (!rgb) return '#000000';
  return formatHex(rgb) ?? '#000000';
}

const TAILWIND_L_CURVE: Record<PaletteStep, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.67,
  500: 0.55,
  600: 0.45,
  700: 0.35,
  800: 0.26,
  900: 0.20,
  950: 0.14,
};

export function generatePalette(hex: string): Record<string, string> {
  const { c, h } = hexToOklch(hex);
  const palette: Record<string, string> = {};

  for (const step of PALETTE_STEPS) {
    const targetL = TAILWIND_L_CURVE[step];
    let chroma = c;
    if (step >= 800) chroma = c * 0.7;
    if (step >= 900) chroma = c * 0.5;
    if (step <= 100) chroma = c * 0.6;
    if (step === 50) chroma = c * 0.4;
    palette[step.toString()] = oklchToHex(targetL, chroma, h);
  }

  return palette;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const c1 = parse(hex1);
  const c2 = parse(hex2);
  if (!c1 || !c2) return 1;
  return wcagContrast(c1, c2);
}

export function contrastPass(hex: string): { white: boolean; black: boolean; ratioW: number; ratioB: number } {
  const ratioW = getContrastRatio(hex, '#ffffff');
  const ratioB = getContrastRatio(hex, '#000000');
  return {
    white: ratioW >= 4.5,
    black: ratioB >= 4.5,
    ratioW: Math.round(ratioW * 10) / 10,
    ratioB: Math.round(ratioB * 10) / 10,
  };
}

export function generateColorScheme(
  hex: string,
  type: ColorSchemeType
): string[] {
  const { l, c, h } = hexToOklch(hex);

  switch (type) {
    case 'analogous':
      return [
        oklchToHex(l, c, (h - 30 + 360) % 360),
        hex,
        oklchToHex(l, c, (h + 30) % 360),
      ];
    case 'complementary':
      return [
        hex,
        oklchToHex(l, c, (h + 180) % 360),
      ];
    case 'triadic':
      return [
        hex,
        oklchToHex(l, c, (h + 120) % 360),
        oklchToHex(l, c, (h + 240) % 360),
      ];
    case 'tetradic':
      return [
        hex,
        oklchToHex(l, c, (h + 90) % 360),
        oklchToHex(l, c, (h + 180) % 360),
        oklchToHex(l, c, (h + 270) % 360),
      ];
    default:
      return [hex];
  }
}

const PROTAN_MATRIX = [
  [0.56667, 0.43333, 0],
  [0.55833, 0.44167, 0],
  [0, 0.24167, 0.75833],
];

const DEUTAN_MATRIX = [
  [0.625, 0.375, 0],
  [0.7, 0.3, 0],
  [0, 0.3, 0.7],
];

export function simulateColorBlind(
  hex: string,
  type: ColorBlindType
): string {
  if (type === 'none') return hex;

  const parsed = parse(hex);
  if (!parsed) return hex;
  const rgb = toRgb(parsed);
  if (!rgb) return hex;

  const r = rgb.r ?? 0;
  const g = rgb.g ?? 0;
  const b = rgb.b ?? 0;

  const matrix = type === 'protan' ? PROTAN_MATRIX : DEUTAN_MATRIX;

  const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b;
  const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b;
  const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b;

  const clamped = {
    mode: 'rgb' as const,
    r: Math.max(0, Math.min(1, newR)),
    g: Math.max(0, Math.min(1, newG)),
    b: Math.max(0, Math.min(1, newB)),
  };

  return formatHex(clamped) ?? hex;
}

export function darkenColor(hex: string, amount: number): string {
  const { l, c, h } = hexToOklch(hex);
  return oklchToHex(Math.max(0, l - amount), c, h);
}

export function lightenColor(hex: string, amount: number): string {
  const { l, c, h } = hexToOklch(hex);
  return oklchToHex(Math.min(1, l + amount), c, h);
}

export function hexToRgbString(hex: string): string {
  const parsed = parse(hex);
  if (!parsed) return 'rgb(0,0,0)';
  const rgb = toRgb(parsed);
  if (!rgb) return 'rgb(0,0,0)';
  return `rgb(${Math.round((rgb.r ?? 0) * 255)},${Math.round((rgb.g ?? 0) * 255)},${Math.round((rgb.b ?? 0) * 255)})`;
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}
