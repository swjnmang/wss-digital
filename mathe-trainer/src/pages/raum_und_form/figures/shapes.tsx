// Fertige Skizzen für Flächen und Körper.
// Beschriftungen mit "?" oder "x" werden rot dargestellt (gesuchte Größe).

import Scene, { C, ell, lerp, mid, sub, unit, type El, type P } from './Scene';

export const isSought = (s?: string) => !!s && (/\?/.test(s) || /^x(\s|$)/.test(s) || s === 'x');
const col = (s?: string) => (isSought(s) ? C.red : C.label);

function centroid(ps: P[]): P {
  const n = ps.length;
  return [ps.reduce((s, p) => s + p[0], 0) / n, ps.reduce((s, p) => s + p[1], 0) / n];
}

/** Seitenbeschriftung, automatisch nach außen (weg von `center`) */
export function sl(a: P, b: P, text: string | undefined, center: P, off = 0): El[] {
  if (!text) return [];
  const d = sub(b, a);
  const n: P = [-d[1], d[0]];
  const m = mid(a, b);
  const side: 1 | -1 = n[0] * (m[0] - center[0]) + n[1] * (m[1] - center[1]) >= 0 ? 1 : -1;
  return [{ t: 'side', a, b, text, side, color: col(text), off }];
}

/** Punktname neben einer Ecke, weg vom Mittelpunkt */
export function vl(p: P, text: string | undefined, center: P, dist = 13): El[] {
  if (!text) return [];
  const u = unit(sub(p, center));
  return [{ t: 'label', at: p, text, dx: u[0] * dist, dy: -u[1] * dist, color: C.blue }];
}

const clampRatio = (x: number, y: number, max = 3.2): [number, number] => {
  if (x / y > max) return [x, x / max];
  if (y / x > max) return [y / max, y];
  return [x, y];
};

// ---------------------------------------------------------------------------
// Flächen
// ---------------------------------------------------------------------------

export function RectFig(props: { a: number; b: number; la?: string; lb?: string; ld?: string; names?: string[]; fill?: string; lu?: string }) {
  const [a, b] = clampRatio(props.a, props.b);
  const ps: P[] = [[0, 0], [a, 0], [a, b], [0, b]];
  const c = centroid(ps);
  const els: El[] = [
    { t: 'poly', pts: ps, fill: props.fill },
    ...sl(ps[0], ps[1], props.la, c),
    ...sl(ps[3], ps[0], props.lb, c),
  ];
  if (props.ld) {
    els.push({ t: 'line', pts: [ps[0], ps[2]], dash: true });
    els.push({ t: 'label', at: mid(ps[0], ps[2]), text: props.ld, color: col(props.ld), dy: -12 });
  }
  props.names?.forEach((nm, i) => els.push(...vl(ps[i], nm, c)));
  return <Scene els={els} />;
}

export function TriFig(props: { g: number; h: number; t?: number; lg?: string; lh?: string; la?: string; lb?: string; names?: string[]; noHeight?: boolean }) {
  const [g, h] = clampRatio(props.g, props.h, 2.6);
  const t = props.t ?? 0.35;
  const A: P = [0, 0];
  const B: P = [g, 0];
  const Cc: P = [g * t, h];
  const c = centroid([A, B, Cc]);
  const els: El[] = [{ t: 'poly', pts: [A, B, Cc] }, ...sl(A, B, props.lg, c), ...sl(B, Cc, props.la, c), ...sl(Cc, A, props.lb, c)];
  if (!props.noHeight) {
    const F: P = [g * t, 0];
    els.push({ t: 'line', pts: [Cc, F], dash: true, stroke: C.blue });
    els.push({ t: 'right', at: F, u: [1, 0], v: [0, 1] });
    if (props.lh) els.push({ t: 'label', at: mid(Cc, F), text: props.lh, color: col(props.lh), dx: 8, anchor: 'start' });
  }
  props.names?.forEach((nm, i) => els.push(...vl([A, B, Cc][i], nm, c)));
  return <Scene els={els} />;
}

/**
 * Rechtwinkliges Dreieck mit Katheten (Länge k1 entlang x, k2 entlang y), rechter Winkel bei R.
 * rot dreht die Skizze, damit Schüler die Hypotenuse nicht an der Lage erkennen.
 */
export function RightTriFig(props: {
  k1: number;
  k2: number;
  l1?: string;
  l2?: string;
  lh?: string;
  /** Namen der Ecken: [rechter Winkel, Ende k1, Ende k2] */
  names?: [string, string, string];
  rot?: number;
  mirror?: boolean;
}) {
  const [k1, k2] = clampRatio(props.k1, props.k2, 2.8);
  const r = ((props.rot ?? 0) * Math.PI) / 180;
  const m = props.mirror ? -1 : 1;
  const tr = (p: P): P => {
    const x = p[0] * m;
    return [x * Math.cos(r) - p[1] * Math.sin(r), x * Math.sin(r) + p[1] * Math.cos(r)];
  };
  const R = tr([0, 0]);
  const X = tr([k1, 0]);
  const Y = tr([0, k2]);
  const c = centroid([R, X, Y]);
  const els: El[] = [
    { t: 'poly', pts: [R, X, Y] },
    { t: 'right', at: R, u: sub(X, R), v: sub(Y, R), size: 12 },
    ...sl(R, X, props.l1, c),
    ...sl(R, Y, props.l2, c),
    ...sl(X, Y, props.lh, c),
  ];
  props.names?.forEach((nm, i) => els.push(...vl([R, X, Y][i], nm, c)));
  return <Scene els={els} maxH={150} />;
}

export function ParaFig(props: { a: number; h: number; shift?: number; la?: string; lh?: string; lb?: string }) {
  const [a, h] = clampRatio(props.a, props.h, 2.6);
  const sh = (props.shift ?? 0.35) * a;
  const ps: P[] = [[0, 0], [a, 0], [a + sh, h], [sh, h]];
  const c = centroid(ps);
  const F: P = [sh, 0];
  const els: El[] = [
    { t: 'poly', pts: ps },
    ...sl(ps[0], ps[1], props.la, c),
    ...sl(ps[1], ps[2], props.lb, c),
    { t: 'line', pts: [ps[3], F], dash: true, stroke: C.blue },
    { t: 'right', at: F, u: [1, 0], v: [0, 1] },
  ];
  if (props.lh) els.push({ t: 'label', at: mid(ps[3], F), text: props.lh, color: col(props.lh), dx: 8, anchor: 'start' });
  return <Scene els={els} />;
}

export function RauteFig(props: { e: number; f: number; le?: string; lf?: string; la?: string }) {
  const [e, f] = clampRatio(props.e, props.f, 2.5);
  const ps: P[] = [[0, 0], [e / 2, -f / 2], [e, 0], [e / 2, f / 2]];
  const c: P = [e / 2, 0];
  const els: El[] = [
    { t: 'poly', pts: ps },
    { t: 'line', pts: [ps[0], ps[2]], dash: true, stroke: C.blue },
    { t: 'line', pts: [ps[1], ps[3]], dash: true, stroke: C.blue },
    { t: 'right', at: c, u: [1, 0], v: [0, 1], size: 9 },
    ...sl(ps[2], ps[3], props.la, c),
  ];
  if (props.le) els.push({ t: 'label', at: [e * 0.25, 0], text: props.le, color: col(props.le), dy: -11 });
  if (props.lf) els.push({ t: 'label', at: [e / 2, f * 0.25], text: props.lf, color: col(props.lf), dx: 8, anchor: 'start' });
  return <Scene els={els} />;
}

export function TrapezFig(props: { a: number; c: number; h: number; shift?: number; la?: string; lc?: string; lh?: string; lb?: string; ld?: string; lm?: string }) {
  const a = props.a;
  const cc = props.c;
  const h = Math.min(Math.max(props.h, a / 3.2), a * 1.3);
  const off = props.shift ?? (a - cc) / 2;
  const ps: P[] = [[0, 0], [a, 0], [off + cc, h], [off, h]];
  const ce = centroid(ps);
  const els: El[] = [
    { t: 'poly', pts: ps },
    ...sl(ps[0], ps[1], props.la, ce),
    ...sl(ps[2], ps[3], props.lc, ce),
    ...sl(ps[1], ps[2], props.lb, ce),
    ...sl(ps[3], ps[0], props.ld, ce),
  ];
  if (props.lh) {
    const hx: P = [off + Math.min(cc, a) * 0.08, 0];
    const top: P = [hx[0], h];
    els.push({ t: 'line', pts: [top, hx], dash: true, stroke: C.blue });
    els.push({ t: 'right', at: hx, u: [1, 0], v: [0, 1] });
    els.push({ t: 'label', at: mid(top, hx), text: props.lh, color: col(props.lh), dx: 8, anchor: 'start' });
  }
  if (props.lm) {
    const L = mid(ps[0], ps[3]);
    const R = mid(ps[1], ps[2]);
    els.push({ t: 'line', pts: [L, R], dash: true, stroke: C.gray });
    els.push({ t: 'label', at: mid(L, R), text: props.lm, color: col(props.lm), dy: -10 });
  }
  return <Scene els={els} />;
}

export function CircleFig(props: { lr?: string; ld?: string; lu?: string; fill?: string }) {
  const els: El[] = [{ t: 'circle', c: [0, 0], r: 1, fill: props.fill }, { t: 'dot', at: [0, 0] }, { t: 'label', at: [0, 0], text: 'M', dx: -10, dy: 10, color: C.blue, size: 12 }];
  if (props.lr) {
    els.push({ t: 'line', pts: [[0, 0], [Math.cos(0.5), Math.sin(0.5)]], stroke: C.blue });
    els.push({ t: 'label', at: [Math.cos(0.5) / 2, Math.sin(0.5) / 2], text: props.lr, color: col(props.lr), dy: -12 });
  }
  if (props.ld) {
    els.push({ t: 'line', pts: [[-1, -0.0], [1, 0]], stroke: C.blue });
    els.push({ t: 'label', at: [0.5, 0], text: props.ld, color: col(props.ld), dy: 12 });
  }
  if (props.lu) els.push({ t: 'label', at: [0.75, -0.75], text: props.lu, color: col(props.lu), dx: 10, dy: 8, anchor: 'start' });
  return <Scene els={els} maxH={140} />;
}

export function RingFig(props: { R: number; r: number; lR?: string; lr?: string }) {
  const k = props.r / props.R;
  const els: El[] = [
    { t: 'circle', c: [0, 0], r: 1, fill: C.fill2 },
    { t: 'circle', c: [0, 0], r: k, fill: '#ffffff' },
    { t: 'dot', at: [0, 0] },
  ];
  if (props.lR) {
    els.push({ t: 'line', pts: [[0, 0], [Math.cos(0.7), Math.sin(0.7)]], stroke: C.blue });
    els.push({ t: 'label', at: [Math.cos(0.7), Math.sin(0.7)], text: props.lR, color: col(props.lR), dx: 8, dy: -8, anchor: 'start' });
  }
  if (props.lr) {
    els.push({ t: 'line', pts: [[0, 0], [-k, 0]], stroke: C.red });
    els.push({ t: 'label', at: [-k / 2, 0], text: props.lr, color: col(props.lr), dy: 11 });
  }
  return <Scene els={els} maxH={140} />;
}

// ---------------------------------------------------------------------------
// Körper (Schrägbild: Tiefe unter 45°, verkürzt auf 0,5)
// ---------------------------------------------------------------------------

export type V3 = [number, number, number];
const K = 0.5 * Math.SQRT1_2;
export const ob = (p: V3): P => [p[0] + p[2] * K, p[1] + p[2] * K];

function newell(vs: V3[]): V3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < vs.length; i++) {
    const a = vs[i];
    const b = vs[(i + 1) % vs.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return [x, y, z];
}

/** Konvexer Körper: sichtbare Flächen gefüllt, verdeckte Kanten gestrichelt. */
export function polyhedron(V: V3[], faces: number[][], fills?: (string | undefined)[]): El[] {
  const bc: V3 = [0, 1, 2].map((k) => V.reduce((s, v) => s + v[k], 0) / V.length) as V3;
  const visible = faces.map((f) => {
    const vs = f.map((i) => V[i]);
    let n = newell(vs);
    const fc = [0, 1, 2].map((k) => vs.reduce((s, v) => s + v[k], 0) / vs.length);
    if (n[0] * (fc[0] - bc[0]) + n[1] * (fc[1] - bc[1]) + n[2] * (fc[2] - bc[2]) < 0) n = [-n[0], -n[1], -n[2]];
    return n[0] * K + n[1] * K - n[2] > 1e-9;
  });
  const edges = new Map<string, { a: number; b: number; vis: boolean }>();
  faces.forEach((f, fi) => {
    f.forEach((a, i) => {
      const b = f[(i + 1) % f.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const e = edges.get(key) ?? { a, b, vis: false };
      e.vis = e.vis || visible[fi];
      edges.set(key, e);
    });
  });
  const els: El[] = [];
  faces.forEach((f, fi) => {
    if (visible[fi]) els.push({ t: 'poly', pts: f.map((i) => ob(V[i])), fill: fills?.[fi] ?? C.fill, stroke: 'none', opacity: 0.75 });
  });
  edges.forEach((e) => {
    els.push({ t: 'line', pts: [ob(V[e.a]), ob(V[e.b])], dash: !e.vis, stroke: e.vis ? C.line : C.gray, w: e.vis ? 1.8 : 1.3 });
  });
  return els;
}

/** Quader: Breite a (vorne), Tiefe b, Höhe h */
export function quaderEls(a: number, b: number, h: number, o: V3 = [0, 0, 0]): { els: El[]; V: V3[] } {
  const [x, y, z] = o;
  const V: V3[] = [
    [x, y, z], [x + a, y, z], [x + a, y, z + b], [x, y, z + b],
    [x, y + h, z], [x + a, y + h, z], [x + a, y + h, z + b], [x, y + h, z + b],
  ];
  const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  return { els: polyhedron(V, F, [undefined, C.fill2, undefined, C.fill2]), V };
}

export function QuaderFig(props: { a: number; b: number; h: number; la?: string; lb?: string; lh?: string; ld?: string; le?: string }) {
  const m = Math.max(props.a, props.b, props.h);
  const a = Math.max(props.a, m / 3.5);
  const b = Math.max(props.b, m / 3.5);
  const h = Math.max(props.h, m / 3.5);
  const { els, V } = quaderEls(a, b, h);
  const c = ob([a / 2, h / 2, b / 2]);
  els.push(...sl(ob(V[0]), ob(V[1]), props.la, c));
  els.push(...sl(ob(V[1]), ob(V[2]), props.lb, c));
  els.push(...sl(ob(V[0]), ob(V[4]), props.lh, ob([a / 2, h / 2, 0])));
  if (props.ld) {
    els.push({ t: 'line', pts: [ob(V[0]), ob(V[6])], stroke: C.red, w: 1.5 });
    els.push({ t: 'label', at: mid(ob(V[0]), ob(V[6])), text: props.ld, color: col(props.ld), dy: -11, dx: -6 });
  }
  if (props.le) {
    els.push({ t: 'line', pts: [ob(V[0]), ob(V[2])], stroke: C.blue, w: 1.3, dash: true });
    els.push({ t: 'label', at: mid(ob(V[0]), ob(V[2])), text: props.le, color: col(props.le), dy: 10, dx: 10 });
  }
  return <Scene els={els} maxH={140} />;
}

/**
 * Gerades Prisma mit beliebiger (konvexer) Vorderfläche `front` (x/y) und Länge `len` nach hinten.
 * Beschriftungen der Vorderkanten über `edgeLabels` (Index der Startecke).
 */
export function PrismFig(props: {
  front: P[];
  len: number;
  edgeLabels?: Record<number, string>;
  llen?: string;
  height?: { from: P; to: P; label?: string };
  fill?: string;
}) {
  const n = props.front.length;
  const V: V3[] = [...props.front.map((p) => [p[0], p[1], 0] as V3), ...props.front.map((p) => [p[0], p[1], props.len] as V3)];
  const faces: number[][] = [Array.from({ length: n }, (_, i) => i), Array.from({ length: n }, (_, i) => n + i)];
  for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
  const fills = [props.fill ?? C.fill, C.fill2, ...Array(n).fill(C.fill2)];
  const els = polyhedron(V, faces, fills);
  const c = centroid(props.front);
  Object.entries(props.edgeLabels ?? {}).forEach(([k, text]) => {
    const i = Number(k);
    els.push(...sl(props.front[i], props.front[(i + 1) % n], text, c));
  });
  if (props.height) {
    els.push({ t: 'line', pts: [props.height.from, props.height.to], dash: true, stroke: C.blue });
    els.push({ t: 'right', at: props.height.to, u: [1, 0], v: sub(props.height.from, props.height.to) });
    if (props.height.label)
      els.push({ t: 'label', at: mid(props.height.from, props.height.to), text: props.height.label, color: col(props.height.label), dx: 7, anchor: 'start' });
  }
  if (props.llen) {
    // Längskante an der untersten, rechtesten Ecke
    let idx = 0;
    props.front.forEach((p, i) => {
      const q = props.front[idx];
      if (p[1] < q[1] - 1e-9 || (Math.abs(p[1] - q[1]) < 1e-9 && p[0] > q[0])) idx = i;
    });
    const a = ob(V[idx]);
    const b = ob(V[n + idx]);
    els.push({ t: 'side', a, b, text: props.llen, side: -1, color: col(props.llen) });
  }
  return <Scene els={els} />;
}

export function WuerfelFig(props: { la?: string; ld?: string; le?: string }) {
  return <QuaderFig a={1} b={1} h={1} la={props.la} ld={props.ld} le={props.le} />;
}

export function PyramideFig(props: { a: number; h: number; la?: string; lh?: string; lhs?: string; ls?: string; ld?: string }) {
  const a = props.a;
  const h = Math.min(Math.max(props.h, a * 0.6), a * 2.2);
  const V: V3[] = [[0, 0, 0], [a, 0, 0], [a, 0, a], [0, 0, a], [a / 2, h, a / 2]];
  const F = [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
  const els = polyhedron(V, F, [undefined, C.fill, C.fill2, C.fill2, C.fill2]);
  const M = ob([a / 2, 0, a / 2]);
  const S = ob(V[4]);
  const E = ob([a / 2, 0, 0]);
  const c = ob([a / 2, h / 3, a / 2]);
  els.push({ t: 'line', pts: [S, M], dash: true, stroke: C.blue });
  els.push({ t: 'dot', at: M });
  els.push({ t: 'label', at: S, text: 'S', dy: -12, color: C.blue });
  if (props.lh) els.push({ t: 'label', at: mid(S, M), text: props.lh, color: col(props.lh), dx: 7, anchor: 'start' });
  if (props.lhs) {
    els.push({ t: 'line', pts: [S, E], stroke: C.red, w: 1.4 });
    els.push({ t: 'label', at: lerp(S, E, 0.6), text: props.lhs, color: col(props.lhs), dx: -7, anchor: 'end' });
  }
  if (props.ld) {
    els.push({ t: 'line', pts: [ob(V[0]), ob(V[2])], dash: true, stroke: C.gray, w: 1.2 });
  }
  els.push(...sl(ob(V[0]), ob(V[1]), props.la, c));
  if (props.ls) els.push(...sl(ob(V[1]), S, props.ls, c));
  return <Scene els={els} />;
}

const RY = 0.32;

export function ZylinderFig(props: { r: number; h: number; lr?: string; lh?: string; ld?: string; fill?: string }) {
  const r = 1;
  const h = Math.min(Math.max(props.h / props.r, 0.5), 3.2);
  const ry = RY;
  const fill = props.fill ?? C.fill;
  const els: El[] = [
    { t: 'poly', pts: [...ell([0, 0], r, ry, 180, 360), ...ell([0, h], r, ry, 0, 180)], fill, stroke: 'none' },
    { t: 'poly', pts: ell([0, h], r, ry), fill: C.fill2 },
    { t: 'line', pts: ell([0, 0], r, ry, 180, 360) },
    { t: 'line', pts: ell([0, 0], r, ry, 0, 180), dash: true, stroke: C.gray, w: 1.3 },
    { t: 'line', pts: [[-r, 0], [-r, h]] },
    { t: 'line', pts: [[r, 0], [r, h]] },
    { t: 'dot', at: [0, 0] },
  ];
  if (props.lr) {
    els.push({ t: 'line', pts: [[0, 0], [r, 0]], stroke: C.blue });
    els.push({ t: 'label', at: [r / 2, 0], text: props.lr, color: col(props.lr), dy: -10 });
  }
  if (props.ld) {
    els.push({ t: 'line', pts: [[-r, h], [r, h]], stroke: C.blue });
    els.push({ t: 'label', at: [0, h], text: props.ld, color: col(props.ld), dy: -11 });
  }
  if (props.lh) {
    els.push({ t: 'line', pts: [[0, 0], [0, h]], dash: true, stroke: C.blue });
    els.push({ t: 'label', at: [r, h / 2], text: props.lh, color: col(props.lh), dx: 8, anchor: 'start' });
  }
  return <Scene els={els} maxH={170} />;
}

export function KegelFig(props: { r: number; h: number; lr?: string; lh?: string; ls?: string; ld?: string }) {
  const r = 1;
  const h = Math.min(Math.max(props.h / props.r, 0.8), 3.2);
  const ry = RY;
  const els: El[] = [
    { t: 'poly', pts: [...ell([0, 0], r, ry, 180, 360), [0, h]], fill: C.fill, stroke: 'none' },
    { t: 'line', pts: ell([0, 0], r, ry, 180, 360) },
    { t: 'line', pts: ell([0, 0], r, ry, 0, 180), dash: true, stroke: C.gray, w: 1.3 },
    { t: 'line', pts: [[-r, 0], [0, h], [r, 0]] },
    { t: 'dot', at: [0, 0] },
  ];
  if (props.lh) {
    els.push({ t: 'line', pts: [[0, 0], [0, h]], dash: true, stroke: C.blue });
    els.push({ t: 'right', at: [0, 0], u: [1, 0], v: [0, 1], size: 9 });
    els.push({ t: 'label', at: [0, h * 0.5], text: props.lh, color: col(props.lh), dx: 8, anchor: 'start' });
  }
  if (props.lr) {
    els.push({ t: 'line', pts: [[0, 0], [r, 0]], stroke: C.blue });
    els.push({ t: 'label', at: [r / 2, -ry], text: props.lr, color: col(props.lr), dy: 12 });
  }
  if (props.ld) {
    els.push({ t: 'line', pts: [[-r, 0], [r, 0]], stroke: C.blue });
    els.push({ t: 'label', at: [0, -ry], text: props.ld, color: col(props.ld), dy: 12 });
  }
  if (props.ls) els.push({ t: 'side', a: [r, 0], b: [0, h], text: props.ls, side: -1, color: col(props.ls) });
  return <Scene els={els} maxH={170} />;
}

export function KugelFig(props: { lr?: string; ld?: string; half?: boolean }) {
  const els: El[] = props.half
    ? [
        { t: 'poly', pts: [...ell([0, 0], 1, 1, 180, 360), ...ell([0, 0], 1, RY, 0, 180).reverse()], fill: C.fill, stroke: 'none' },
        { t: 'line', pts: ell([0, 0], 1, 1, 180, 360) },
        { t: 'poly', pts: ell([0, 0], 1, RY), fill: C.fill2 },
      ]
    : [
        { t: 'circle', c: [0, 0], r: 1 },
        { t: 'line', pts: ell([0, 0], 1, RY, 180, 360) },
        { t: 'line', pts: ell([0, 0], 1, RY, 0, 180), dash: true, stroke: C.gray, w: 1.3 },
      ];
  els.push({ t: 'dot', at: [0, 0] });
  els.push({ t: 'label', at: [0, 0], text: 'M', dx: -11, dy: -9, color: C.blue, size: 12 });
  if (props.lr) {
    els.push({ t: 'line', pts: [[0, 0], [1, 0]], stroke: C.blue });
    els.push({ t: 'label', at: [0.5, 0], text: props.lr, color: col(props.lr), dy: props.half ? -11 : 12 });
  }
  if (props.ld) {
    els.push({ t: 'line', pts: [[-1, 0], [1, 0]], stroke: C.blue });
    els.push({ t: 'label', at: [0.45, 0], text: props.ld, color: col(props.ld), dy: props.half ? -11 : 12 });
  }
  return <Scene els={els} maxH={140} />;
}
