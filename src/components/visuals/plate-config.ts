/**
 * Framing contract for the exploded gear plate.
 *
 * These numbers decide whether the drawing stays inside its frame at every
 * scroll position. `scripts/verify-plate.mjs` imports THIS file and walks the
 * whole scroll range in both orientations, so the check can never drift out of
 * sync with what the component actually renders. Run `npm run verify:plate`
 * after changing anything here.
 */

export type PlateConfig = {
  viewBox: string;
  /** Axial offset of each layer at full explosion, in viewBox units. */
  travel: { ring: number; index: number; gear: number; hub: number };
  /** Stage scale when assembled. */
  assembled: number;
  explodedX: number;
  explodedY: number;
  /**
   * Downward drift as it explodes. The ring travels further up than the hub
   * travels down, so without this the stack sits high in the frame.
   */
  drift: number;
  leader: number;
  labelX: number;
  fontSize: number;
  /**
   * Scroll progress at which the callouts finish fading in. Held late enough
   * that the stage has pulled in and the labels clear the viewBox edge —
   * which differs per orientation, hence per config.
   */
  calloutFrom: number;
  labels: [string, string, string, string];
};

/** Local extent of each layer about its own centre, in viewBox units. */
export const LAYER_RADIUS = {
  ring: 186,
  index: 126,
  gear: 104,
  hub: 39,
} as const;

/** Hub scales up slightly as it separates. */
export const HUB_SCALE = 1.3;

/** Rough advance per character at the configured font size and letter-spacing. */
export const CHAR_ADVANCE = 0.68;

export const LANDSCAPE_PLATE: PlateConfig = {
  viewBox: "-520 -350 1040 700",
  travel: { ring: -200, index: -74, gear: 78, hub: 204 },
  assembled: 1.4,
  explodedX: 0.78,
  explodedY: 0.52,
  drift: 38,
  leader: 212,
  labelX: 228,
  fontSize: 19,
  calloutFrom: 0.65,
  labels: [
    "RING GEAR  Z=28",
    "INDEX PLATE  60 DIV",
    "PINION  Z=18",
    "HUB  Ø60",
  ],
};

export const PORTRAIT_PLATE: PlateConfig = {
  // Asymmetric on purpose: the visible band runs y -560..720, putting the
  // assembly above the optical centre. On a phone the stage sits just below
  // the fold, so centring it left a dead strip of empty ground on top.
  viewBox: "-400 -560 800 1280",
  travel: { ring: -300, index: -110, gear: 116, hub: 306 },
  assembled: 1.85,
  explodedX: 1.0,
  explodedY: 0.78,
  drift: 26,
  // Labels must start clear of the ring's radius (186) or they sit on top of
  // it once the stack separates.
  leader: 190,
  labelX: 206,
  fontSize: 24,
  calloutFrom: 0.7,
  labels: ["RING", "INDEX", "PINION", "HUB"],
};

export function viewBoxHalfExtents(viewBox: string) {
  const [minX, minY, w, h] = viewBox.split(/\s+/).map(Number);
  return { x: Math.min(-minX, minX + w), y: Math.min(-minY, minY + h) };
}

/**
 * Bounding box of everything drawn, at scroll progress `t` (0 assembled,
 * 1 fully exploded). Mirrors exactly what the component's timeline does.
 */
export function frameExtents(cfg: PlateConfig, t: number) {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const sx = lerp(cfg.assembled, cfg.explodedX);
  const sy = lerp(cfg.assembled, cfg.explodedY);
  const dy = cfg.drift * t;

  let top = 0;
  let bottom = 0;
  let right = 0;

  (Object.keys(LAYER_RADIUS) as (keyof typeof LAYER_RADIUS)[]).forEach((k) => {
    const r = LAYER_RADIUS[k] * (k === "hub" ? lerp(1, HUB_SCALE) : 1);
    const y = cfg.travel[k] * t;
    top = Math.min(top, (y - r) * sy + dy);
    bottom = Math.max(bottom, (y + r) * sy + dy);
    right = Math.max(right, r * sx);
  });

  if (t > cfg.calloutFrom) {
    const widest = Math.max(...cfg.labels.map((l) => l.length));
    const labelRight = cfg.labelX + widest * cfg.fontSize * CHAR_ADVANCE;
    right = Math.max(right, labelRight * sx);
  }

  return { top, bottom, right };
}
