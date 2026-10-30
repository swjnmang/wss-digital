import { useId, useState } from 'react'
import type { MouseEvent } from 'react'
import { X_COL, Y_COL } from './CoordSystem'
import type { Pt } from './CoordSystem'

// Koordinatensystem (SVG) mit der Geraden y = m·x + t, auf dem Schüler Punkte anklicken können.
// Ein Punkt erscheint nur, wenn der Klick auf einen Gitterpunkt des Graphen trifft (Rastung auf den nächsten
// Gitterpunkt der Geraden); ein Klick daneben ruft onPick(null) auf.

interface Props {
  m: number
  t: number
  /** Bereits gewählte Punkte (werden mit P₁, P₂ beschriftet) */
  points: Pt[]
  /** Angeklickter Gitterpunkt auf der Geraden, bei einem Fehlklick null */
  onPick: (p: Pt | null) => void
}

const R = 6
const W = 400
const PAD = 28
const INNER = W - 2 * PAD
const U = INNER / (2 * R)
const TOL = 0.45 // maximaler Abstand (in Einheiten) zwischen Klick und Gitterpunkt auf dem Graphen
const minus = (n: number) => String(n).replace('-', '−')
const sx = (x: number) => PAD + (x + R) * U
const sy = (y: number) => PAD + (R - y) * U
const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R)

export default function KlickGraph({ m, t, points, onPick }: Props) {
  const clipId = useId()
  const [hover, setHover] = useState<Pt | null>(null)

  // Nächster Gitterpunkt der Geraden im sichtbaren Bereich zum Klick (gx|gy), sofern nah genug
  const snap = (e: MouseEvent<SVGSVGElement>): Pt | null => {
    const r = e.currentTarget.getBoundingClientRect()
    const gx = (((e.clientX - r.left) / r.width) * W - PAD) / U - R
    const gy = R - (((e.clientY - r.top) / r.height) * W - PAD) / U
    let best: Pt | null = null
    let bestD = TOL
    for (let x = -R; x <= R; x++) {
      const y = m * x + t
      if (Math.abs(y) > R) continue
      const d = Math.hypot(x - gx, y - gy)
      if (d <= bestD) {
        best = { x, y }
        bestD = d
      }
    }
    return best
  }

  // Gerade über den ganzen Rand zeichnen, der Ausschnitt wird per clipPath begrenzt
  const x1 = -R - 1
  const x2 = R + 1

  return (
    <svg
      viewBox={`0 0 ${W} ${W}`}
      className="mx-auto block w-full select-none"
      style={{ cursor: 'crosshair', touchAction: 'manipulation' }}
      role="img"
      aria-label={`Koordinatensystem mit dem Graphen einer linearen Funktion. Klicke Punkte auf dem Graphen an.`}
      onClick={(e: MouseEvent<SVGSVGElement>) => onPick(snap(e))}
      onMouseMove={(e: MouseEvent<SVGSVGElement>) => {
        const p = snap(e)
        setHover((h) => (h && p && h.x === p.x && h.y === p.y ? h : p))
      }}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD} y={PAD} width={INNER} height={INNER} />
        </clipPath>
      </defs>
      <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="#fff" stroke="#e2e8f0" />

      {ticks.map((k) => (
        <g key={`g${k}`}>
          <line x1={sx(k)} y1={PAD} x2={sx(k)} y2={PAD + INNER} stroke={k === 0 ? 'none' : '#e5eaf1'} />
          <line x1={PAD} y1={sy(k)} x2={PAD + INNER} y2={sy(k)} stroke={k === 0 ? 'none' : '#e5eaf1'} />
        </g>
      ))}

      {/* Achsen */}
      <line x1={PAD} y1={sy(0)} x2={PAD + INNER} y2={sy(0)} stroke={X_COL} strokeWidth={1.6} />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={PAD + INNER} stroke={Y_COL} strokeWidth={1.6} />
      <polygon points={`${PAD + INNER + 6},${sy(0)} ${PAD + INNER - 3},${sy(0) - 4} ${PAD + INNER - 3},${sy(0) + 4}`} fill={X_COL} />
      <polygon points={`${sx(0)},${PAD - 6} ${sx(0) - 4},${PAD + 3} ${sx(0) + 4},${PAD + 3}`} fill={Y_COL} />

      {ticks
        .filter((k) => k !== 0)
        .map((k) => (
          <g key={`t${k}`} fontSize={11}>
            <line x1={sx(k)} y1={sy(0) - 3} x2={sx(k)} y2={sy(0) + 3} stroke={X_COL} />
            <line x1={sx(0) - 3} y1={sy(k)} x2={sx(0) + 3} y2={sy(k)} stroke={Y_COL} />
            <text x={sx(k)} y={sy(0) + 16} textAnchor="middle" fill={X_COL}>
              {minus(k)}
            </text>
            <text x={sx(0) - 6} y={sy(k) + 4} textAnchor="end" fill={Y_COL}>
              {minus(k)}
            </text>
          </g>
        ))}
      <text x={W - 4} y={sy(0) - 9} textAnchor="end" fontSize={16} fontStyle="italic" fontWeight={800} fill={X_COL}>
        x
      </text>
      <text x={sx(0) + 10} y={16} fontSize={16} fontStyle="italic" fontWeight={800} fill={Y_COL}>
        y
      </text>

      {/* Graph */}
      <line
        x1={sx(x1)}
        y1={sy(m * x1 + t)}
        x2={sx(x2)}
        y2={sy(m * x2 + t)}
        stroke="#16a34a"
        strokeWidth={3}
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
      />

      {/* Vorschau: nur an Punkten, die tatsächlich auf dem Graphen liegen */}
      {hover && <circle cx={sx(hover.x)} cy={sy(hover.y)} r={9} fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="3 3" />}

      {points.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r={6.5} fill="#1e293b" stroke="#fff" strokeWidth={1.6} />
          <text
            x={sx(p.x) + 10}
            y={sy(p.y) - 10}
            fontSize={14}
            fontWeight={800}
            fill="#1e293b"
            stroke="#fff"
            strokeWidth={3.5}
            paintOrder="stroke"
          >
            P<tspan fontSize={10} dy={3}>{i + 1}</tspan>
          </text>
        </g>
      ))}
    </svg>
  )
}
