// Bausteine für zusammengesetzte Körper (Vorderansicht mit Ellipsen).
import { C, ell, type El, type P } from './Scene';

const RY = 0.28;

export function cyl(cx: number, y0: number, r: number, h: number, fill: string = C.fill, top = true): El[] {
  const ry = r * RY;
  const els: El[] = [
    { t: 'poly', pts: [...ell([cx, y0], r, ry, 180, 360), ...ell([cx, y0 + h], r, ry, 0, 180)], fill, stroke: 'none' },
    { t: 'line', pts: ell([cx, y0], r, ry, 180, 360) },
    { t: 'line', pts: ell([cx, y0], r, ry, 0, 180), dash: true, stroke: C.gray, w: 1.2 },
    { t: 'line', pts: [[cx - r, y0], [cx - r, y0 + h]] },
    { t: 'line', pts: [[cx + r, y0], [cx + r, y0 + h]] },
  ];
  if (top) els.push({ t: 'poly', pts: ell([cx, y0 + h], r, ry), fill: C.fill2 });
  else els.push({ t: 'line', pts: ell([cx, y0 + h], r, ry, 180, 360) }, { t: 'line', pts: ell([cx, y0 + h], r, ry, 0, 180), dash: true, stroke: C.gray, w: 1.2 });
  return els;
}

/** Kegel mit Spitze nach oben, Grundkreis bei y0 */
export function coneUp(cx: number, y0: number, r: number, h: number, fill: string = C.fill, hiddenBase = true): El[] {
  const ry = r * RY;
  return [
    { t: 'poly', pts: [...ell([cx, y0], r, ry, 180, 360), [cx, y0 + h]], fill, stroke: 'none' },
    { t: 'line', pts: ell([cx, y0], r, ry, 180, 360) },
    ...(hiddenBase ? [{ t: 'line', pts: ell([cx, y0], r, ry, 0, 180), dash: true, stroke: C.gray, w: 1.2 } as El] : []),
    { t: 'line', pts: [[cx - r, y0], [cx, y0 + h], [cx + r, y0]] },
  ];
}

/** Kegel mit Spitze nach unten (Öffnung oben bei yTop) */
export function coneDown(cx: number, yTop: number, r: number, h: number, fill: string = C.fill, open = true): El[] {
  const ry = r * RY;
  const els: El[] = [
    { t: 'poly', pts: [...ell([cx, yTop], r, ry, 180, 360), [cx, yTop - h]], fill, stroke: 'none' },
    { t: 'line', pts: [[cx - r, yTop], [cx, yTop - h], [cx + r, yTop]] },
  ];
  els.push(open ? { t: 'poly', pts: ell([cx, yTop], r, ry), fill: C.fill2 } : { t: 'line', pts: ell([cx, yTop], r, ry, 180, 360) });
  return els;
}

/** Halbkugel als Schale (Wölbung unten, Öffnung oben bei y) */
export function hemiDown(cx: number, y: number, r: number, fill: string = C.fill): El[] {
  return [
    { t: 'poly', pts: [...ell([cx, y], r, r, 180, 360), ...ell([cx, y], r, r * RY, 0, 180)], fill, stroke: 'none' },
    { t: 'line', pts: ell([cx, y], r, r, 180, 360) },
    { t: 'poly', pts: ell([cx, y], r, r * RY), fill: C.fill2 },
  ];
}

/** Halbkugel als Kuppel (Wölbung oben, Grundkreis bei y) */
export function hemiUp(cx: number, y: number, r: number, fill: string = C.fill): El[] {
  return [
    { t: 'poly', pts: [...ell([cx, y], r, r, 0, 180), ...ell([cx, y], r, r * RY, 180, 360)], fill, stroke: 'none' },
    { t: 'line', pts: ell([cx, y], r, r, 0, 180) },
    { t: 'line', pts: ell([cx, y], r, r * RY, 180, 360) },
    { t: 'line', pts: ell([cx, y], r, r * RY, 0, 180), dash: true, stroke: C.gray, w: 1.2 },
  ];
}

export const lbl = (at: P, text: string, dx = 0, dy = 0, color?: string, anchor: 'start' | 'middle' | 'end' = 'middle'): El => ({
  t: 'label',
  at,
  text,
  dx,
  dy,
  color: color ?? (text.includes('?') ? C.red : C.label),
  anchor,
});

export const dim = (a: P, b: P, text: string, side: 1 | -1 = 1, off = 16): El => ({
  t: 'dim',
  a,
  b,
  text,
  side,
  off,
  color: text.includes('?') ? C.red : undefined,
});
