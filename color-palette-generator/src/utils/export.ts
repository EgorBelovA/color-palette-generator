function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((h) => h + h)
      .join('');
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
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
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: +(s * 100).toFixed(1),
    l: +(l * 100).toFixed(1),
  };
}

function hexToOklab(hex) {
  const { r, g, b } = hexToRgb(hex);
  const L =
    (0.4122214708 * r) / 255 +
    (0.5363325363 * g) / 255 +
    (0.0514459929 * b) / 255;
  const a =
    (0.2104542553 * r) / 255 -
    (0.0890321335 * g) / 255 -
    (0.1215764846 * b) / 255;
  const b2 =
    (-0.0168080247 * r) / 255 +
    (0.0415099385 * g) / 255 +
    (0.0324360247 * b) / 255;
  return { L: +L.toFixed(3), a: +a.toFixed(3), b: +b2.toFixed(3) };
}

function oklabToOklch({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C: +C.toFixed(3), h: +h.toFixed(1) };
}

export function exportPalette(palette, type) {
  if (!palette) return '';
  switch (type) {
    case 'css':
      return palette.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
    case 'scss':
      return palette.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
    case 'tailwind':
      return palette.map((c, i) => `${i + 1}: '${c}',`).join('\n');
    case 'json':
      return JSON.stringify(palette, null, 2);
    case 'hsl':
      return palette
        .map((c, i) => {
          const { h, s, l } = rgbToHsl(hexToRgb(c));
          return `--color-${i + 1}: hsl(${h} ${s}% ${l}%);`;
        })
        .join('\n');
    case 'oklab':
      return palette
        .map((c, i) => {
          const { L, a, b } = hexToOklab(c);
          return `--color-${i + 1}: oklab(${L} ${a} ${b});`;
        })
        .join('\n');
    case 'oklch':
      return palette
        .map((c, i) => {
          const lab = hexToOklab(c);
          const { L, C, h } = oklabToOklch(lab);
          return `--color-${i + 1}: oklch(${L} ${C} ${h});`;
        })
        .join('\n');
    default:
      return palette.join(', ');
  }
}
