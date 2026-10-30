import { useId } from 'react'
import type { MouseEvent } from 'react'
import { X_COL, Y_COL } from './CoordSystem'

// Koordinatensystem (SVG) zum Einzeichnen von Punkten aus einer Wertetabelle. Die Achsen werden unabhängig
// voneinander an die Werte angepasst. Ein Klick ruft onPick mit den Koordinaten des Klicks auf; ob er einen Punkt
// trifft, entscheidet die Seite. Ist k gesetzt, wird zusätzlich die Ursprungsgerade y = k·x gezeichnet.

interface Props {
  xMax: number
  yMax: number
  xLabel: string
  yLabel: string
  /** Bereits richtig gesetzte Punkte */
  points: { x: number; y: number }[]
  /** Kurz sichtbarer Fehlklick */
  wrong: { x: number; y: number } | null
  /** Steigung der Geraden, null solange nicht alle Punkte gesetzt sind */
  k: number | null
  /** Alle Punkte der Wertetabelle; ein Klick in der Nähe rastet auf den nächsten ein */
  targets: { x: number; y: number }[]
  disabled?: boolean
  /** hit ist der getroffene Tabellenpunkt, bei einem Fehlklick null; click sind die Koordinaten des Klicks */
  onPick: (hit: { x: number; y: number } | null, click: { x: number; y: number }) => void
}

const W = 640
const H = 420
const PL = 56
const PR = 24
const PT = 22
const PB = 40
const IW = W - PL - PR
const IH = H - PT - PB
const HIT_RADIUS = 24 // Bildschirmpunkte (viewBox-Einheiten) um einen Tabellenpunkt

function niceStep(max: number): number {
  const raw = max / 6
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  for (const f of [1, 2, 2.5, 5, 10]) if (f * pow >= raw) return f * pow
  return 10 * pow
}

const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',').replace('-', '−')

export default function PunktePlot({ xMax, yMax, xLabel, yLabel, points, wrong, k, targets, disabled, onPick }: Props) {
  const clipId = useId()
  const xStep = niceStep(xMax)
  const yStep = niceStep(yMax)
  const xEnd = Math.ceil(xMax / xStep - 1e-9) * xStep
  const yEnd = Math.ceil(yMax / yStep - 1e-9) * yStep
  const sx = (x: number) => PL + (x / xEnd) * IW
  const sy = (y: number) => PT + IH - (y / yEnd) * IH
  const xTicks = Array.from({ length: Math.round(xEnd / xStep) }, (_, i) => (i + 1) * xStep)
  const yTicks = Array.from({ length: Math.round(yEnd / yStep) }, (_, i) => (i + 1) * yStep)

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (disabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const py = ((e.clientY - r.top) / r.height) * H
    let hit: { x: number; y: number } | null = null
    let best = HIT_RADIUS
    for (const t of targets) {
      const d = Math.hypot(sx(t.x) - px, sy(t.y) - py)
      if (d <= best) {
        hit = t
        best = d
      }
    }
    onPick(hit, { x: ((px - PL) / IW) * xEnd, y: ((PT + IH - py) / IH) * yEnd })
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto block w-full select-none"
      style={{ cursor: disabled ? 'default' : 'crosshair', touchAction: 'manipulation', maxWidth: 760 }}
      role="img"
      aria-label="Koordinatensystem zum Einzeichnen der Punkte aus der Wertetabelle"
      onClick={handleClick}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PL} y={PT} width={IW} height={IH} />
        </clipPath>
      </defs>
      <rect x={PL} y={PT} width={IW} height={IH} fill="#fff" stroke="#e2e8f0" />

      {xTicks.map((v) => (
        <line key={`gx${v}`} x1={sx(v)} y1={PT} x2={sx(v)} y2={PT + IH} stroke="#e5eaf1" />
      ))}
      {yTicks.map((v) => (
        <line key={`gy${v}`} x1={PL} y1={sy(v)} x2={PL + IW} y2={sy(v)} stroke="#e5eaf1" />
      ))}

      <line x1={PL} y1={sy(0)} x2={PL + IW + 8} y2={sy(0)} stroke={X_COL} strokeWidth={1.6} />
      <line x1={sx(0)} y1={PT + IH} x2={sx(0)} y2={PT - 8} stroke={Y_COL} strokeWidth={1.6} />
      <polygon points={`${PL + IW + 14},${sy(0)} ${PL + IW + 5},${sy(0) - 4} ${PL + IW + 5},${sy(0) + 4}`} fill={X_COL} />
      <polygon points={`${sx(0)},${PT - 14} ${sx(0) - 4},${PT - 5} ${sx(0) + 4},${PT - 5}`} fill={Y_COL} />

      {xTicks.map((v) => (
        <g key={`tx${v}`} fontSize={12}>
          <line x1={sx(v)} y1={sy(0) - 3} x2={sx(v)} y2={sy(0) + 3} stroke={X_COL} />
          <text x={sx(v)} y={sy(0) + 17} textAnchor="middle" fill={X_COL}>{fmt(v)}</text>
        </g>
      ))}
      {yTicks.map((v) => (
        <g key={`ty${v}`} fontSize={12}>
          <line x1={sx(0) - 3} y1={sy(v)} x2={sx(0) + 3} y2={sy(v)} stroke={Y_COL} />
          <text x={sx(0) - 7} y={sy(v) + 4} textAnchor="end" fill={Y_COL}>{fmt(v)}</text>
        </g>
      ))}
      <text x={sx(0) - 7} y={sy(0) + 17} textAnchor="end" fontSize={12} fill={X_COL}>0</text>
      <text x={PL + IW} y={sy(0) - 8} textAnchor="end" fontSize={13} fontWeight={700} fill={X_COL}>{xLabel}</text>
      <text x={sx(0) + 8} y={PT + 10} fontSize={13} fontWeight={700} fill={Y_COL}>{yLabel}</text>

      {k !== null && (
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(xEnd)}
          y2={sy(k * xEnd)}
          stroke="#2563eb"
          strokeWidth={3}
          strokeLinecap="round"
          clipPath={`url(#${clipId})`}
        />
      )}

      {points.map((p) => (
        <circle key={p.x} cx={sx(p.x)} cy={sy(p.y)} r={7} fill="#16a34a" stroke="#fff" strokeWidth={1.8} />
      ))}
      {wrong && <circle cx={sx(wrong.x)} cy={sy(wrong.y)} r={7} fill="#dc2626" stroke="#fff" strokeWidth={1.8} />}
    </svg>
  )
}
