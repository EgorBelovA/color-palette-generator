function hslToHex(h: number, s = 70, l = 50) {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToHsl(hex: string) {
  hex = hex.replace('#', '');

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

export type Harmony =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split complementary'
  | 'double split complementary'
  | 'rectangle'
  | 'triadic'
  | 'tetradic';

const harmonyPresets: Record<Harmony, number | number[]> = {
  monochromatic: 1,
  analogous: [3, 5],
  complementary: 2,
  'split complementary': 2,
  'double split complementary': 2,
  rectangle: 2,
  triadic: 3,
  tetradic: 4,
};

interface GenerateHarmonyOptions {
  baseColor: string;
  harmony: Harmony;
  count: number;
}

export function generateHarmony({
  baseColor,
  harmony,
  count,
}: GenerateHarmonyOptions): string[] {
  const { h, s, l } = hexToHsl(baseColor);

  let offsets: number[] = [];

  switch (harmony) {
    case 'monochromatic':
      offsets = [0];
      break;
    case 'complementary':
      offsets = [0, 180];
      break;
    case 'triadic':
      offsets = [0, 120, 240];
      break;
    case 'tetradic':
      offsets = [0, 90, 180, 270];
      break;
    case 'analogous':
    default:
      offsets = [-30, -15, 0, 15, 30];
      break;
  }

  const result: string[] = [];
  let i = 0;

  while (result.length < count) {
    const hue = (h + offsets[i % offsets.length] + 360) % 360;
    const lightness = l + Math.floor(i / offsets.length) * 8;

    result.push(hslToHex(hue, s, Math.min(lightness, 90)));
    i++;
  }

  return result;
}

export { harmonyPresets };
