import { pick, randInt, chance } from './util';

export type Pt = { x: number; y: number };

export const COLOR_GIVEN = '#1e293b';
export const COLOR_ASKED = '#dc2626';
export const COLOR_PLAIN = '#64748b';

export interface Mark {
  text: string;
  color?: string;
  /** dicker zeichnen (Seite) bzw. Bogen hervorheben (Winkel) */
  bold?: boolean;
}

export interface Pose {
  rotate: number;
  mirror: boolean;
}

/** Zufällige Lage: gedreht (in 90°-Schritten, leicht schräg) und ggf. gespiegelt. */
export function randomPose(tilt = 18): Pose {
  return {
    rotate: pick([0, 90, 180, 270]) + (chance(0.5) ? 0 : randInt(-tilt, tilt)),
    mirror: chance(),
  };
}

export const NO_POSE: Pose = { rotate: 0, mirror: false };

/** Dreieck aus zwei Seiten und dem eingeschlossenen Winkel an Ecke 0 (Ecke 1 auf der x-Achse). */
export function trianglePoints(side01: number, side02: number, angle0Deg: number): [Pt, Pt, Pt] {
  const r = (angle0Deg * Math.PI) / 180;
  return [
    { x: 0, y: 0 },
    { x: side01, y: 0 },
    { x: side02 * Math.cos(r), y: side02 * Math.sin(r) },
  ];
}

interface Props {
  /** Eckpunkte in mathematischen Koordinaten (y nach oben) */
  pts: [Pt, Pt, Pt];
  names: [string, string, string];
  /** Beschriftung der Seite gegenüber Ecke i */
  sides?: (Mark | null | undefined)[];
  /** Beschriftung des Winkels an Ecke i */
  angles?: (Mark | null | undefined)[];
  /** Ecke mit rechtem Winkel */
  right?: number;
  pose?: Pose;
  /** Seitenfarben (z. B. zur Kennzeichnung von Hypotenuse/Katheten) */
  className?: string;
}

const W = 270;
const H = 190;
const PAD = 40;
const PADX = 72;

const sub = (a: Pt, b: Pt) => ({ x: a.x - b.x, y: a.y - b.y });
const len = (a: Pt) => Math.hypot(a.x, a.y);
const unit = (a: Pt) => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};

export default function TriangleFigure({
  pts,
  names,
  sides = [],
  angles = [],
  right,
  pose = NO_POSE,
  className,
}: Props) {
  // Lage anwenden und in Bildschirmkoordinaten (y nach unten) umrechnen
  const r = (pose.rotate * Math.PI) / 180;
  const t = pts.map((p) => {
    const x = pose.mirror ? -p.x : p.x;
    const xr = x * Math.cos(r) - p.y * Math.sin(r);
    const yr = x * Math.sin(r) + p.y * Math.cos(r);
    return { x: xr, y: -yr };
  });
  const minX = Math.min(...t.map((p) => p.x));
  const maxX = Math.max(...t.map((p) => p.x));
  const minY = Math.min(...t.map((p) => p.y));
  const maxY = Math.max(...t.map((p) => p.y));
  const s = Math.min(W / (maxX - minX || 1), H / (maxY - minY || 1));
  const P = t.map((p) => ({ x: (p.x - minX) * s, y: (p.y - minY) * s }));
  const w = (maxX - minX) * s;
  const h = (maxY - minY) * s;
  const centroid = { x: (P[0].x + P[1].x + P[2].x) / 3, y: (P[0].y + P[1].y + P[2].y) / 3 };

  const sideColor = (i: number) => sides[i]?.color ?? COLOR_GIVEN;

  return (
    <svg
      viewBox={`${-PADX - (W - w) / 2} ${-PAD - (H - h) / 2} ${W + 2 * PADX} ${H + 2 * PAD}`}
      className={className ?? 'w-full max-w-[400px] mx-auto'}
      role="img"
      aria-label={`Dreieck ${names.join('')}`}
    >
      <polygon points={P.map((p) => `${p.x},${p.y}`).join(' ')} fill="#eff6ff" stroke="none" />
      {[0, 1, 2].map((i) => {
        const a = P[(i + 1) % 3];
        const b = P[(i + 2) % 3];
        return (
          <line
            key={`s${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={sideColor(i)}
            strokeWidth={sides[i]?.bold ? 3.5 : 2}
            strokeLinecap="round"
          />
        );
      })}

      {/* Winkel */}
      {[0, 1, 2].map((i) => {
        const v = P[i];
        const u1 = unit(sub(P[(i + 1) % 3], v));
        const u2 = unit(sub(P[(i + 2) % 3], v));
        const shortest = Math.min(len(sub(P[(i + 1) % 3], v)), len(sub(P[(i + 2) % 3], v)));
        if (right === i) {
          const q = Math.min(14, shortest * 0.25);
          const c1 = { x: v.x + u1.x * q, y: v.y + u1.y * q };
          const c2 = { x: v.x + u1.x * q + u2.x * q, y: v.y + u1.y * q + u2.y * q };
          const c3 = { x: v.x + u2.x * q, y: v.y + u2.y * q };
          return (
            <g key={`a${i}`}>
              <polyline
                points={`${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y}`}
                fill="none"
                stroke={COLOR_GIVEN}
                strokeWidth={1.3}
              />
              <circle
                cx={v.x + (u1.x + u2.x) * q * 0.5}
                cy={v.y + (u1.y + u2.y) * q * 0.5}
                r={1.6}
                fill={COLOR_GIVEN}
              />
            </g>
          );
        }
        const m = angles[i];
        if (!m) return null;
        const rad = Math.min(26, shortest * 0.32);
        const a1 = Math.atan2(u1.y, u1.x);
        const a2 = Math.atan2(u2.y, u2.x);
        let d = a2 - a1;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        const sweep = d > 0 ? 1 : 0;
        const st = { x: v.x + u1.x * rad, y: v.y + u1.y * rad };
        const en = { x: v.x + u2.x * rad, y: v.y + u2.y * rad };
        const bis = unit({ x: u1.x + u2.x, y: u1.y + u2.y });
        const opening = Math.abs(d);
        // bei spitzen Winkeln den Text weiter nach innen setzen, damit er nicht auf den Seiten liegt
        const lr = rad + (opening < 0.55 ? 34 : opening < 0.8 ? 22 : 13);
        const color = m.color ?? COLOR_GIVEN;
        return (
          <g key={`a${i}`}>
            <path
              d={`M ${st.x} ${st.y} A ${rad} ${rad} 0 0 ${sweep} ${en.x} ${en.y} L ${v.x} ${v.y} Z`}
              fill={color}
              fillOpacity={m.bold ? 0.18 : 0.08}
              stroke="none"
            />
            <path
              d={`M ${st.x} ${st.y} A ${rad} ${rad} 0 0 ${sweep} ${en.x} ${en.y}`}
              fill="none"
              stroke={color}
              strokeWidth={m.bold ? 2 : 1.3}
            />
            <text
              x={v.x + bis.x * lr}
              y={v.y + bis.y * lr}
              fontSize={13}
              fontWeight={m.bold ? 'bold' : 'normal'}
              fill={color}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {m.text}
            </text>
          </g>
        );
      })}

      {/* Eckpunkte */}
      {P.map((p, i) => {
        const dir = unit(sub(p, centroid));
        return (
          <g key={`v${i}`}>
            <circle cx={p.x} cy={p.y} r={2.4} fill={COLOR_GIVEN} />
            <text
              x={p.x + dir.x * 15}
              y={p.y + dir.y * 15}
              fontSize={15}
              fontWeight="bold"
              fill={COLOR_GIVEN}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {names[i]}
            </text>
          </g>
        );
      })}

      {/* Seitenbeschriftung */}
      {[0, 1, 2].map((i) => {
        const m = sides[i];
        if (!m) return null;
        const a = P[(i + 1) % 3];
        const b = P[(i + 2) % 3];
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const dirv = unit(sub(b, a));
        let n = { x: -dirv.y, y: dirv.x };
        if ((mid.x - centroid.x) * n.x + (mid.y - centroid.y) * n.y < 0) n = { x: -n.x, y: -n.y };
        const anchor = n.x > 0.35 ? 'start' : n.x < -0.35 ? 'end' : 'middle';
        return (
          <text
            key={`l${i}`}
            x={mid.x + n.x * 10}
            y={mid.y + n.y * 12}
            fontSize={13}
            fontWeight={m.bold ? 'bold' : 'normal'}
            fill={m.color ?? COLOR_GIVEN}
            textAnchor={anchor}
            dominantBaseline="middle"
          >
            {m.text}
          </text>
        );
      })}
    </svg>
  );
}
