import { fmt } from './kit'

// Einfache, maßstabsgetreue Diagramme für die Lernschritte (SVG, Farben aus den Tokens).

const FILLS = ['#1d3f9e', '#8a5a00', '#2f9e5b', '#b8322a', '#6b4fa3', '#0f7c8c', '#5b6472', '#c27c0e']

interface SaeulenProps {
  labels: string[]
  values: number[]
  /** Achse beginnt bei diesem Wert (Standard 0) – für „geschönte“ Diagramme */
  yStart?: number
  yMax?: number
  step?: number
  yTitle?: string
  showValues?: boolean
  label: string
  unit?: string
}

export function Saeulen({ labels, values, yStart = 0, yMax, step, yTitle, showValues = false, label, unit = '' }: SaeulenProps) {
  const max = yMax ?? niceMax(Math.max(...values))
  const st = step ?? niceStep(max - yStart)
  const W = Math.max(320, 70 + labels.length * 74)
  const H = 260
  const left = 54
  const bottom = 210
  const top = 30
  const plotH = bottom - top
  const y = (v: number) => bottom - ((v - yStart) / (max - yStart)) * plotH
  const bw = 40
  const ticks: number[] = []
  for (let t = yStart; t <= max + 1e-9; t += st) ticks.push(Math.round(t * 1000) / 1000)

  return (
    <figure className="lp-figure">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - 10} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
            <text x={left - 8} y={y(t) + 5} textAnchor="end" fontSize="13" fill="var(--ink-muted)">
              {fmt(t, 2)}
              {unit}
            </text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top - 10} y2={bottom} stroke="var(--ink)" strokeWidth="1.5" />
        <line x1={left} x2={W - 10} y1={bottom} y2={bottom} stroke="var(--ink)" strokeWidth="1.5" />
        {yStart !== 0 && (
          <path d={`M${left - 6} ${bottom - 14} l12 -5 M${left - 6} ${bottom - 8} l12 -5`} stroke="var(--wrong)" strokeWidth="2" />
        )}
        {values.map((v, i) => {
          const x = left + 24 + i * 74
          return (
            <g key={i}>
              <rect x={x} y={y(v)} width={bw} height={bottom - y(v)} fill={FILLS[0]} opacity={0.8} />
              {showValues && (
                <text x={x + bw / 2} y={y(v) - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)">
                  {fmt(v, 2)}
                  {unit}
                </text>
              )}
              <text x={x + bw / 2} y={bottom + 20} textAnchor="middle" fontSize="13" fill="var(--ink)">
                {labels[i]}
              </text>
            </g>
          )
        })}
        {yTitle && (
          <text x={8} y={16} fontSize="13" fontWeight="700" fill="var(--ink-muted)">
            {yTitle}
          </text>
        )}
      </svg>
    </figure>
  )
}

export function Kreis({ labels, values, label, showAngles = false }: { labels: string[]; values: number[]; label: string; showAngles?: boolean }) {
  const total = values.reduce((s, v) => s + v, 0)
  const r = 100
  const cx = 120
  const cy = 120
  let a = -90
  const pt = (deg: number, rr = r) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy + rr * Math.sin((deg * Math.PI) / 180)]
  return (
    <figure className="lp-figure">
      <svg viewBox="0 0 440 240" width={440} role="img" aria-label={label}>
        {values.map((v, i) => {
          const sweep = (v / total) * 360
          const [x1, y1] = pt(a)
          const [x2, y2] = pt(a + sweep)
          const mid = a + sweep / 2
          const [lx, ly] = pt(mid, 66)
          const d = `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2} Z`
          a += sweep
          return (
            <g key={i}>
              <path d={d} fill={FILLS[i % FILLS.length]} opacity={0.85} stroke="var(--surface)" strokeWidth="2" />
              {showAngles && sweep > 18 && (
                <text x={lx} y={ly + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
                  {fmt(sweep, 0)}°
                </text>
              )}
            </g>
          )
        })}
        {labels.map((l, i) => (
          <g key={l}>
            <rect x={258} y={24 + i * 26} width={16} height={16} fill={FILLS[i % FILLS.length]} opacity={0.85} />
            <text x={282} y={37 + i * 26} fontSize="14" fill="var(--ink)">
              {l}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

function niceStep(range: number) {
  const raw = range / 5
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}
function niceMax(v: number) {
  const st = niceStep(v)
  return Math.ceil(v / st) * st
}
