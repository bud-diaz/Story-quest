/** Tiny deterministic helpers — no external RNG dependency needed for placeholder art. */

/** Mulberry32: a small, fast, seedable PRNG returning floats in [0, 1). */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic string -> 32-bit int hash (djb2), used to derive stable colors from content ids. */
export function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Deterministic HSL color string derived from an arbitrary id, for placeholder art/swatches. */
export function colorForId(id: string, saturation = 60, lightness = 55): string {
  const hue = hashString(id) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/** Same derivation as colorForId but returned as a 0xRRGGBB number for Phaser. */
export function hexColorForId(id: string, saturation = 60, lightness = 55): number {
  const hue = hashString(id) % 360;
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): number {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toByte = (v: number) => Math.round((v + m) * 255);
  return (toByte(r) << 16) | (toByte(g) << 8) | toByte(b);
}
