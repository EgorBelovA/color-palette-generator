export type WcagLevel = 'AA' | 'AAA';
export type WcagKind = 'normalText' | 'largeText' | 'ui';

interface WcagResult {
  ratio: number;
  passes: boolean;
  required: number;
  level: WcagLevel;
  kind: WcagKind;
}

function normalizeHex(hex: string): string {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  return `#${h.toUpperCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const [R, G, B] = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function useAccessibility() {
  function wcag(
    color: string,
    background: string = '#ffffff',
    kind: WcagKind = 'normalText',
    level: WcagLevel = 'AA'
  ): WcagResult {
    const ratio = contrastRatio(color, background);

    let required = 4.5;
    if (kind === 'largeText' || kind === 'ui') {
      required = 3;
    }
    if (level === 'AAA') {
      if (kind === 'normalText') required = 7;
      else required = 4.5;
    }

    return {
      ratio: Number(ratio.toFixed(2)),
      passes: ratio >= required,
      required,
      level,
      kind,
    };
  }

  return {
    wcag,
    contrastRatio,
    luminance,
  };
}
