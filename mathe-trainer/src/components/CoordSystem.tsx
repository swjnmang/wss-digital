import { useState } from 'react'
import type { MouseEvent } from 'react'

// Kartesisches Koordinatensystem (alle vier Quadranten, Achsen -5 bis 5) als SVG.
// Auf der ganzen Seite gilt dieselbe Farbcodierung: x = blau, y = orange.

export const X_COL = '#2563eb'
export const Y_COL = '#c2410c'

export interface Pt {
  x: number
  y: number
}

export interface SysPoint extends Pt {
  label?: string
  color?: string
  emoji?: string
  ring?: boolean
}

export interface Segment {
  a: Pt
  b: Pt
  color: string
  dashed?: boolean
}

/** Lösungsweg: vom Ursprung erst waagrecht (x, blau), dann senkrecht (y, orange). */
export const originPath = (p: Pt): Segment[] => [
  { a: { x: 0, y: 0 }, b: { x: p.x, y: 0 }, color: X_COL },
  { a: { x: p.x, y: 0 }, b: p, color: Y_COL },
]

/** Hilfslinien zum Ablesen: vom Punkt senkrecht zur x-Achse (x-Wert) und waagrecht zur y-Achse (y-Wert). */
export const dropLines = (p: Pt): Segment[] => [
  { a: p, b: { x: p.x, y: 0 }, color: X_COL, dashed: true },
  { a: p, b: { x: 0, y: p.y }, color: Y_COL, dashed: true },
]

interface Props {
  points?: SysPoint[]
  segments?: Segment[]
  polygon?: Pt[]
  /** Quadrant 1-4 einfärben */
  shade?: 1 | 2 | 3 | 4 | null
  quadrantLabels?: boolean
  /** Wird mit dem angetippten Gitterpunkt aufgerufen (auf ganze Zahlen gerastet) */
  onPick?: (p: Pt) => void
  compact?: boolean
  maxWidth?: number
  ariaLabel?: string
}

const R = 5
const minus = (n: number) => String(n).replace('-', '−')

export default function CoordSystem({
  points = [],
  segments = [],
  polygon,
  shade = null,
  quadrantLabels = false,
  onPick,
  compact = false,
  maxWidth,
  ariaLabel = 'Koordinatensystem',
}: Props) {
  const W = compact ? 236 : 340
  const pad = compact ? 20 : 26
  const inner = W - 2 * pad
  const u = inner / (2 * R)
  const sx = (x: number) => pad + (x + R) * u
  const sy = (y: number) => pad + (R - y) * u
  const fs = compact ? 9 : 11
  const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R)
  const [hover, setHover] = useState<Pt | null>(null)

  const toGrid = (e: MouseEvent<SVGSVGElement>): Pt | null => {
    const r = e.currentTarget.getBoundingClientRect()
    const rawX = ((e.clientX - r.left) / r.width) * W
    const rawY = ((e.clientY - r.top) / r.height) * W
    const gx = (rawX - pad) / u - R
    const gy = R - (rawY - pad) / u
    if (Math.abs(gx) > R + 0.5 || Math.abs(gy) > R + 0.5) return null
    return { x: Math.max(-R, Math.min(R, Math.round(gx))), y: Math.max(-R, Math.min(R, Math.round(gy))) }
  }

  const shadeRect: Record<number, { x: number; y: number }> = {
    1: { x: sx(0), y: sy(R) },
    2: { x: sx(-R), y: sy(R) },
    3: { x: sx(-R), y: sy(0) },
    4: { x: sx(0), y: sy(0) },
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${W}`}
      className="mx-auto w-full select-none"
      style={{ maxWidth: maxWidth ?? (compact ? 280 : 440), cursor: onPick ? 'crosshair' : 'default', touchAction: 'manipulation' }}
      role="img"
      aria-label={ariaLabel}
      onClick={(e: MouseEvent<SVGSVGElement>) => {
        if (!onPick) return
        const g = toGrid(e)
        if (g) onPick(g)
      }}
      onMouseMove={(e: MouseEvent<SVGSVGElement>) => {
        if (!onPick) return
        const g = toGrid(e)
        setHover((h) => (h && g && h.x === g.x && h.y === g.y ? h : g))
      }}
      onMouseLeave={() => setHover(null)}
    >
      <rect x={pad} y={pad} width={inner} height={inner} fill="#fff" stroke="#e2e8f0" />
      {shade && <rect x={shadeRect[shade].x} y={shadeRect[shade].y} width={R * u} height={R * u} fill="rgba(37,99,235,0.14)" />}

      {ticks.map((t) => (
        <g key={`g${t}`}>
          <line x1={sx(t)} y1={pad} x2={sx(t)} y2={pad + inner} stroke="#eef2f7" />
          <line x1={pad} y1={sy(t)} x2={pad + inner} y2={sy(t)} stroke="#eef2f7" />
        </g>
      ))}

      {/* Achsen */}
      <line x1={pad} y1={sy(0)} x2={pad + inner} y2={sy(0)} stroke={X_COL} strokeWidth={1.6} />
      <line x1={sx(0)} y1={pad} x2={sx(0)} y2={pad + inner} stroke={Y_COL} strokeWidth={1.6} />
      <polygon points={`${pad + inner + 5},${sy(0)} ${pad + inner - 3},${sy(0) - 3.5} ${pad + inner - 3},${sy(0) + 3.5}`} fill={X_COL} />
      <polygon points={`${sx(0)},${pad - 5} ${sx(0) - 3.5},${pad + 3} ${sx(0) + 3.5},${pad + 3}`} fill={Y_COL} />

      {/* Skalierung */}
      {ticks
        .filter((t) => t !== 0)
        .map((t) => (
          <g key={`t${t}`} fontSize={fs} fill="#475569">
            <line x1={sx(t)} y1={sy(0) - 2.5} x2={sx(t)} y2={sy(0) + 2.5} stroke={X_COL} />
            <line x1={sx(0) - 2.5} y1={sy(t)} x2={sx(0) + 2.5} y2={sy(t)} stroke={Y_COL} />
            <text x={sx(t)} y={sy(0) + fs + 4} textAnchor="middle" fill={X_COL}>
              {minus(t)}
            </text>
            <text x={sx(0) - 5} y={sy(t) + fs / 3} textAnchor="end" fill={Y_COL}>
              {minus(t)}
            </text>
          </g>
        ))}
      <text x={sx(0) - 5} y={sy(0) + fs + 4} textAnchor="end" fontSize={fs} fill="#475569" fontWeight={700}>
        O
      </text>
      <text x={W - 3} y={sy(0) - 8} textAnchor="end" fontSize={compact ? 13 : 16} fontStyle="italic" fontWeight={800} fill={X_COL}>
        x
      </text>
      <text x={sx(0) + 9} y={compact ? 13 : 15} fontSize={compact ? 13 : 16} fontStyle="italic" fontWeight={800} fill={Y_COL}>
        y
      </text>

      {quadrantLabels &&
        [
          { n: 'I', x: 2.5, y: 2.5 },
          { n: 'II', x: -2.5, y: 2.5 },
          { n: 'III', x: -2.5, y: -2.5 },
          { n: 'IV', x: 2.5, y: -2.5 },
        ].map((q) => (
          <text key={q.n} x={sx(q.x)} y={sy(q.y) + 8} textAnchor="middle" fontSize={26} fontWeight={800} fill="#94a3b8" opacity={0.55}>
            {q.n}
          </text>
        ))}

      {polygon && polygon.length > 2 && (
        <polygon points={polygon.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="rgba(22,163,74,0.14)" stroke="#16a34a" strokeWidth={2.2} strokeLinejoin="round" />
      )}

      {segments.map((s, i) =>
        s.a.x === s.b.x && s.a.y === s.b.y ? null : (
          <line
            key={`s${i}`}
            x1={sx(s.a.x)}
            y1={sy(s.a.y)}
            x2={sx(s.b.x)}
            y2={sy(s.b.y)}
            stroke={s.color}
            strokeWidth={s.dashed ? 2.2 : 3.6}
            strokeLinecap="round"
            strokeDasharray={s.dashed ? '5 4' : undefined}
            opacity={0.9}
          />
        ),
      )}

      {hover && onPick && <circle cx={sx(hover.x)} cy={sy(hover.y)} r={5} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="2 2" />}

      {points.map((p, i) => (
        <g key={`p${i}`}>
          {p.ring && <circle cx={sx(p.x)} cy={sy(p.y)} r={11} fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth={2.2} />}
          {p.emoji ? (
            <>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={2.2} fill="#475569" />
              <text x={sx(p.x)} y={sy(p.y)} textAnchor="middle" dominantBaseline="central" fontSize={compact ? 15 : 20}>
                {p.emoji}
              </text>
            </>
          ) : (
            <circle cx={sx(p.x)} cy={sy(p.y)} r={compact ? 4.5 : 5.5} fill={p.color ?? '#1e293b'} stroke="#fff" strokeWidth={1.4} />
          )}
          {p.label && (
            <text
              x={sx(p.x) + 8}
              y={sy(p.y) - 8}
              fontSize={compact ? 12 : 14}
              fontWeight={800}
              fill={p.color ?? '#1e293b'}
              stroke="#fff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
