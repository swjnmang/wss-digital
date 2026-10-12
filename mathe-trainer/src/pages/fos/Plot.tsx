// Koordinatensystem mit Funktionsgraphen, Punkten und Beschriftungen (SVG).

import { C } from '../raum_und_form/figures/Scene';

export interface Curve {
  f: (x: number) => number;
  color?: string;
  label?: string;
  dash?: boolean;
  /** Definitionsbereich, sonst ganzer sichtbarer Bereich */
  from?: number;
  to?: number;
}

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export const PLOT_COLORS = [C.blue, '#ea580c', '#16a34a', '#9333ea', '#be123c'];

interface Props {
  x: [number, number];
  y: [number, number];
  curves?: Curve[];
  points?: PlotPoint[];
  /** Markierte x-Bereiche (z. B. Lösungsmenge einer Ungleichung) */
  bands?: { from: number; to: number }[];
  /** Achsenbeschriftungen */
  xl?: string;
  yl?: string;
  /** Abstand der Achsenzahlen */
  step?: number;
  ystep?: number;
}

export default function Plot({ x, y, curves = [], points = [], bands = [], xl = 'x', yl = 'y', step = 1, ystep }: Props) {
  const W = 300;
  const pad = 22;
  const [x0, x1] = x;
  const [y0, y1] = y;
  const sx = (W - 2 * pad) / (x1 - x0);
  let sy = sx;
  if ((y1 - y0) * sy > 340) sy = 340 / (y1 - y0);
  if ((y1 - y0) * sy < 120) sy = 120 / (y1 - y0);
  const H = (y1 - y0) * sy + 2 * pad;
  const X = (v: number) => pad + (v - x0) * sx;
  const Y = (v: number) => pad + (y1 - v) * sy;
  const ys = ystep ?? step;

  const ticks = (a: number, b: number, s: number) => {
    const out: number[] = [];
    for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) out.push(Math.round(v * 1000) / 1000);
    return out;
  };
  const gx = ticks(x0, x1, step);
  const gy = ticks(y0, y1, ys);
  const ax = Math.min(Math.max(0, x0), x1);
  const ay = Math.min(Math.max(0, y0), y1);
  const id = `clip${Math.random().toString(36).slice(2, 8)}`;
  const fmt = (v: number) => String(v).replace('.', ',');

  const path = (c: Curve) => {
    const a = Math.max(c.from ?? x0, x0);
    const b = Math.min(c.to ?? x1, x1);
    const n = 240;
    let d = '';
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const xv = a + ((b - a) * i) / n;
      const yv = c.f(xv);
      if (!Number.isFinite(yv) || yv > y1 + (y1 - y0) || yv < y0 - (y1 - y0)) {
        pen = false;
        continue;
      }
      d += `${pen ? 'L' : 'M'}${X(xv).toFixed(1)},${Y(yv).toFixed(1)}`;
      pen = true;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Koordinatensystem">
      <defs>
        <clipPath id={id}>
          <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="#fff" rx={8} />
      {bands.map((b, i) => (
        <rect
          key={i}
          x={X(Math.max(b.from, x0))}
          y={pad}
          width={Math.max(0, X(Math.min(b.to, x1)) - X(Math.max(b.from, x0)))}
          height={H - 2 * pad}
          fill="#bbf7d0"
          opacity={0.55}
        />
      ))}
      {gx.map((v) => (
        <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={pad} y2={H - pad} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {gy.map((v) => (
        <line key={`gy${v}`} x1={pad} x2={W - pad} y1={Y(v)} y2={Y(v)} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <line x1={pad - 4} x2={W - pad + 8} y1={Y(ay)} y2={Y(ay)} stroke={C.line} strokeWidth={1.4} />
      <line x1={X(ax)} x2={X(ax)} y1={H - pad + 4} y2={pad - 8} stroke={C.line} strokeWidth={1.4} />
      <path d={`M${W - pad + 8},${Y(ay)} l-7,-3.5 v7 z`} fill={C.line} />
      <path d={`M${X(ax)},${pad - 8} l-3.5,7 h7 z`} fill={C.line} />
      <text x={W - pad + 6} y={Y(ay) - 6} fontSize={12} fontStyle="italic" textAnchor="end" fill={C.label}>
        {xl}
      </text>
      <text x={X(ax) + 6} y={pad - 2} fontSize={12} fontStyle="italic" fill={C.label}>
        {yl}
      </text>
      {gx
        .filter((v) => v !== ax)
        .map((v) => (
          <text key={`lx${v}`} x={X(v)} y={Y(ay) + 12} fontSize={9.5} textAnchor="middle" fill="#64748b">
            {fmt(v)}
          </text>
        ))}
      {gy
        .filter((v) => v !== ay)
        .map((v) => (
          <text key={`ly${v}`} x={X(ax) - 4} y={Y(v) + 3} fontSize={9.5} textAnchor="end" fill="#64748b">
            {fmt(v)}
          </text>
        ))}
      <g clipPath={`url(#${id})`}>
        {curves.map((c, i) => (
          <path
            key={i}
            d={path(c)}
            fill="none"
            stroke={c.color ?? PLOT_COLORS[i % PLOT_COLORS.length]}
            strokeWidth={2.2}
            strokeDasharray={c.dash ? '6 4' : undefined}
          />
        ))}
      </g>
      {curves.map((c, i) => {
        if (!c.label) return null;
        // Beschriftung am rechten Rand, wo der Graph sichtbar ist
        let lx = Math.min(c.to ?? x1, x1) - (x1 - x0) * 0.04;
        for (let k = 0; k < 40; k++) {
          const yv = c.f(lx);
          if (Number.isFinite(yv) && yv < y1 - (y1 - y0) * 0.05 && yv > y0 + (y1 - y0) * 0.05) break;
          lx -= (x1 - x0) / 50;
        }
        const yv = c.f(lx);
        if (!Number.isFinite(yv)) return null;
        return (
          <text
            key={`l${i}`}
            x={X(lx) - 4}
            y={Y(yv) - 7}
            fontSize={12}
            fontWeight={700}
            textAnchor="end"
            fill={c.color ?? PLOT_COLORS[i % PLOT_COLORS.length]}
          >
            {c.label}
          </text>
        );
      })}
      {points.map((pt, i) => (
        <g key={`p${i}`}>
          <circle cx={X(pt.x)} cy={Y(pt.y)} r={3.6} fill={pt.color ?? C.red} />
          {pt.label && (
            <text x={X(pt.x) + 6} y={Y(pt.y) - 6} fontSize={11.5} fontWeight={700} fill={pt.color ?? C.red}>
              {pt.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
