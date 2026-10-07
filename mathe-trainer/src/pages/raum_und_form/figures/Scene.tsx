// Kleine SVG-Szenen-Bibliothek für Skizzen (Modellkoordinaten, y nach oben).
// Die Skizze wird automatisch in die Zeichenfläche eingepasst.

import { Fragment, type ReactNode } from 'react';

export type P = [number, number];

export const C = {
  line: '#334155',
  fill: '#dbeafe',
  fill2: '#bfdbfe',
  fill3: '#fde68a',
  green: '#bbf7d0',
  water: '#7dd3fc',
  red: '#dc2626',
  blue: '#1d4ed8',
  gray: '#94a3b8',
  label: '#0f172a',
};

export type El =
  | { t: 'poly'; pts: P[]; fill?: string; stroke?: string; dash?: boolean; w?: number; opacity?: number }
  | { t: 'line'; pts: P[]; stroke?: string; dash?: boolean; w?: number }
  | { t: 'circle'; c: P; r: number; fill?: string; stroke?: string; dash?: boolean }
  | { t: 'label'; at: P; text: string; color?: string; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end'; size?: number; bold?: boolean }
  | { t: 'side'; a: P; b: P; text: string; side?: 1 | -1; color?: string; off?: number }
  | { t: 'dim'; a: P; b: P; text: string; side?: 1 | -1; off?: number; color?: string }
  | { t: 'right'; at: P; u: P; v: P; size?: number }
  | { t: 'dot'; at: P; color?: string };

export const RED = C.red;

/** Punkte auf einer Ellipse (Winkel in Grad) */
export function ell(c: P, rx: number, ry: number, a0 = 0, a1 = 360, n = 48): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([c[0] + rx * Math.cos(a), c[1] + ry * Math.sin(a)]);
  }
  return pts;
}

export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
export const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
export const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export function unit(v: P): P {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
}

/** Text mit einfachen Indizes: h_s, h_{a}, r_{innen} */
export function SvgText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /_(\{[^}]*\}|[^\s=])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  let restore = false;
  const plain = (str: string) => {
    parts.push(
      <tspan key={k++} dy={restore ? '-0.35em' : undefined}>
        {str}
      </tspan>,
    );
    restore = false;
  };
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) plain(text.slice(last, m.index));
    const s = m[1].startsWith('{') ? m[1].slice(1, -1) : m[1];
    parts.push(
      <tspan key={k++} fontSize="0.72em" dy={restore ? '0' : '0.35em'}>
        {s}
      </tspan>,
    );
    restore = true;
    last = m.index + m[0].length;
  }
  if (last < text.length) plain(text.slice(last));
  return <>{parts}</>;
}

const textWidth = (s: string, size: number) => s.replace(/_\{?/g, '').replace(/\}/g, '').length * size * 0.56;

interface SceneProps {
  els: El[];
  /** Breite der Zeichenfläche in px (viewBox) */
  w?: number;
  /** maximale Höhe der Geometrie in px */
  maxH?: number;
  className?: string;
}

export default function Scene({ els, w = 260, maxH = 170, className }: SceneProps) {
  // Geometrie-Bounding-Box
  const pts: P[] = [];
  for (const e of els) {
    if (e.t === 'poly' || e.t === 'line') pts.push(...e.pts);
    else if (e.t === 'circle') pts.push([e.c[0] - e.r, e.c[1] - e.r], [e.c[0] + e.r, e.c[1] + e.r]);
    else if (e.t === 'side' || e.t === 'dim') pts.push(e.a, e.b);
    else if (e.t === 'dot' || e.t === 'right') pts.push(e.at);
    else if (e.t === 'label') pts.push(e.at);
  }
  if (pts.length === 0) return null;
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  const maxY = Math.max(...pts.map((p) => p[1]));
  const bw = Math.max(maxX - minX, 1e-6);
  const bh = Math.max(maxY - minY, 1e-6);
  const s = Math.min((w - 70) / bw, maxH / bh);
  const T = (p: P): P => [(p[0] - minX) * s, (maxY - p[1]) * s];
  const path = (ps: P[], close: boolean) =>
    ps.map((p, i) => `${i ? 'L' : 'M'}${T(p)[0].toFixed(1)},${T(p)[1].toFixed(1)}`).join(' ') + (close ? ' Z' : '');

  // Box inkl. Beschriftungen
  let x0 = 0;
  let y0 = 0;
  let x1 = bw * s;
  let y1 = bh * s;
  const grow = (x: number, y: number, tw: number, th: number, anchor: 'start' | 'middle' | 'end') => {
    const left = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
    x0 = Math.min(x0, left - 3);
    x1 = Math.max(x1, left + tw + 3);
    y0 = Math.min(y0, y - th / 2 - 3);
    y1 = Math.max(y1, y + th / 2 + 3);
  };

  const nodes: ReactNode[] = [];
  const labelNodes: ReactNode[] = [];

  const placeText = (key: string, x: number, y: number, text: string, color: string, size = 15, anchor: 'start' | 'middle' | 'end' = 'middle', bold = false) => {
    grow(x, y, textWidth(text, size), size * 1.2, anchor);
    labelNodes.push(
      <text
        key={key}
        x={x}
        y={y}
        fill={color}
        fontSize={size}
        fontWeight={bold ? 700 : 600}
        textAnchor={anchor}
        dominantBaseline="central"
        stroke="white"
        strokeWidth={3}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        <SvgText text={text} />
      </text>,
    );
  };

  els.forEach((e, i) => {
    const key = `e${i}`;
    switch (e.t) {
      case 'poly':
        nodes.push(
          <path
            key={key}
            d={path(e.pts, true)}
            fill={e.fill ?? C.fill}
            fillOpacity={e.opacity ?? 0.85}
            stroke={e.stroke ?? C.line}
            strokeWidth={e.w ?? 1.8}
            strokeDasharray={e.dash ? '5 4' : undefined}
            strokeLinejoin="round"
          />,
        );
        break;
      case 'line':
        nodes.push(
          <path
            key={key}
            d={path(e.pts, false)}
            fill="none"
            stroke={e.stroke ?? C.line}
            strokeWidth={e.w ?? 1.8}
            strokeDasharray={e.dash ? '5 4' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />,
        );
        break;
      case 'circle': {
        const [cx, cy] = T(e.c);
        nodes.push(
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={e.r * s}
            fill={e.fill ?? C.fill}
            fillOpacity={0.85}
            stroke={e.stroke ?? C.line}
            strokeWidth={1.8}
            strokeDasharray={e.dash ? '5 4' : undefined}
          />,
        );
        break;
      }
      case 'dot': {
        const [cx, cy] = T(e.at);
        nodes.push(<circle key={key} cx={cx} cy={cy} r={3} fill={e.color ?? C.line} />);
        break;
      }
      case 'right': {
        const sz = e.size ?? 11;
        const [px, py] = T(e.at);
        const u = unit(e.u);
        const v = unit(e.v);
        const a: P = [px + u[0] * sz, py - u[1] * sz];
        const b: P = [px + (u[0] + v[0]) * sz, py - (u[1] + v[1]) * sz];
        const c: P = [px + v[0] * sz, py - v[1] * sz];
        nodes.push(
          <Fragment key={key}>
            <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}`} fill="none" stroke={C.line} strokeWidth={1.2} />
            <circle cx={(px + b[0]) / 2} cy={(py + b[1]) / 2} r={1.6} fill={C.line} />
          </Fragment>,
        );
        break;
      }
      case 'label': {
        const [x, y] = T(e.at);
        placeText(key, x + (e.dx ?? 0), y + (e.dy ?? 0), e.text, e.color ?? C.label, e.size ?? 15, e.anchor ?? 'middle', e.bold);
        break;
      }
      case 'side':
      case 'dim': {
        const A = T(e.a);
        const B = T(e.b);
        const d = unit([B[0] - A[0], B[1] - A[1]]);
        // Normale in Bildschirmkoordinaten; side=1 → links der Richtung a→b im Modell
        const sgn = e.side ?? 1;
        const n: P = [d[1] * sgn, -d[0] * sgn];
        const color = e.color ?? C.label;
        let off = e.off ?? 0;
        if (e.t === 'dim') {
          off = e.off ?? 16;
          const a2: P = [A[0] + n[0] * off, A[1] + n[1] * off];
          const b2: P = [B[0] + n[0] * off, B[1] + n[1] * off];
          const tick = (p: P) => `M${p[0] - n[0] * 4},${p[1] - n[1] * 4} L${p[0] + n[0] * 4},${p[1] + n[1] * 4}`;
          nodes.push(
            <path
              key={key + 'd'}
              d={`M${a2[0]},${a2[1]} L${b2[0]},${b2[1]} ${tick(a2)} ${tick(b2)}`}
              fill="none"
              stroke={color === C.label ? C.gray : color}
              strokeWidth={1.2}
            />,
          );
        }
        const tw = textWidth(e.text, 15);
        const extra = Math.abs(n[0]) * (tw / 2) + Math.abs(n[1]) * 8 + 5;
        const mx = (A[0] + B[0]) / 2 + n[0] * (off + extra);
        const my = (A[1] + B[1]) / 2 + n[1] * (off + extra);
        placeText(key, mx, my, e.text, color);
        break;
      }
    }
  });

  const vw = x1 - x0;
  const vh = y1 - y0;
  return (
    <svg
      viewBox={`${x0.toFixed(1)} ${y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
      className={className ?? 'mx-auto h-auto w-full'}
      style={{ maxHeight: 260, maxWidth: Math.round(vw * 1.15) }}
      role="img"
      aria-label="Skizze"
    >
      {nodes}
      {labelNodes}
    </svg>
  );
}
