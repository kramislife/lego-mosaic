// This file handles the logic to match a color to the nearest color in a palette.

const REF_X = 95.047;
const REF_Y = 100.0;
const REF_Z = 108.883;

export const DEFAULT_BACKGROUND = { r: 255, g: 255, b: 255 };

export function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function srgbChannelToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function rgbToXyz({ r, g, b }) {
  const lr = srgbChannelToLinear(r);
  const lg = srgbChannelToLinear(g);
  const lb = srgbChannelToLinear(b);

  const x = lr * 0.4124 + lg * 0.3576 + lb * 0.1805;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = lr * 0.0193 + lg * 0.1192 + lb * 0.9505;

  return { x: x * 100, y: y * 100, z: z * 100 };
}

function xyzToLab({ x, y, z }) {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  const xr = x / REF_X;
  const yr = y / REF_Y;
  const zr = z / REF_Z;

  const fx = xr > epsilon ? Math.cbrt(xr) : (kappa * xr + 16) / 116;
  const fy = yr > epsilon ? Math.cbrt(yr) : (kappa * yr + 16) / 116;
  const fz = zr > epsilon ? Math.cbrt(zr) : (kappa * zr + 16) / 116;

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function rgbToLab(rgb) {
  return xyzToLab(rgbToXyz(rgb));
}

export function deltaE(lab1, lab2) {
  const dL = lab1.L - lab2.L;
  const dA = lab1.a - lab2.a;
  const dB = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + dA * dA + dB * dB);
}

export function preparePalette(colors = []) {
  return colors.map((color) => {
    const rgb = hexToRgb(color.hex);
    const lab = rgbToLab(rgb);
    return {
      ...color,
      rgb,
      lab,
    };
  });
}

export function findNearestColor(targetLab, palette = []) {
  if (!palette.length) return null;
  
  // Early exit for exact match (deltaE = 0)
  let best = palette[0];
  let bestDelta = deltaE(targetLab, best.lab);
  
  if (bestDelta === 0) return best;

  for (let i = 1; i < palette.length; i += 1) {
    const candidate = palette[i];
    const nextDelta = deltaE(targetLab, candidate.lab);
    if (nextDelta < bestDelta) {
      bestDelta = nextDelta;
      best = candidate;
      // Early exit for perfect match
      if (bestDelta === 0) break;
    }
  }

  return best;
}

export function blendWithBackground({ r, g, b, a }, background = DEFAULT_BACKGROUND) {
  const alpha = Math.max(0, Math.min(1, a ?? 1));
  if (alpha >= 1) return { r, g, b };
  return {
    r: Math.round(r * alpha + background.r * (1 - alpha)),
    g: Math.round(g * alpha + background.g * (1 - alpha)),
    b: Math.round(b * alpha + background.b * (1 - alpha)),
  };
}

export default {
  hexToRgb,
  rgbToLab,
  deltaE,
  preparePalette,
  findNearestColor,
  blendWithBackground,
};