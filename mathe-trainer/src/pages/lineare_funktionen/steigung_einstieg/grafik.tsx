import { useId } from 'react'
import { fmt } from '../../daten_und_zufall/lernpfad/kit'

// Graphen der Lernsituation „Der Bikepark“: kartesisches Koordinatensystem (gleiche Einheit auf beiden Achsen), Auffahrten als
// Ursprungsgeraden bzw. Strecken mit Keil darunter, Steigungsdreiecke mit Δx und Δy. Bleibt Inline-SVG, weil es sich mit den
// Eingaben der SuS ändert (Bildwelt Diorama: kräftige Flächen, weiche Farben).

/** Zahl als Text mit Komma und echtem Minus, z. B. „−0,5“ */
export const zahl = (v: number) => fmt(v).replace('-', '−')

/** Farben der drei Auffahrten (A = Themenfarbe); kein Grün und kein Rot, die sind für richtig/falsch reserviert */
export const FARBE = { A: 'var(--primary)', B: '#a8641c', C: '#6a3d9a' } as const

/** Auffahrt bzw. Gerade y = m · x. bis: Strecke von 0 bis bis (sonst ganze Gerade); keil: Fläche darunter wie eine Rampe */
export type Rampe = { m: number; bis?: number; name?: string; farbe?: string; art?: 'haupt' | 'blass' | 'live'; keil?: boolean }
/** Steigungsdreieck ab dem Punkt (x0 | m · x0): dx nach rechts, dann senkrecht bis zur Geraden; Texte an den Seiten */
export type Dreieck = { x0: number; dx: number; m: number; dxText?: string; dyText?: string }
export type Punkt = { x: number; y: number; text?: string }

export function Plan({
  xMin = 0,
  xMax,
  yMin = 0,
  yMax,
  einheit = 44,
  rampen = [],
  dreiecke = [],
  punkte = [],
  meter = false,
  label,
}: {
  xMin?: number
  xMax: number
  yMin?: number
  yMax: number
  einheit?: number
  rampen?: Rampe[]
  dreiecke?: Dreieck[]
  punkte?: Punkt[]
  /** Achsen in Metern beschriften („x in m“, „y in m“) */
  meter?: boolean
  label: string
}) {
  const clip = `bp-clip-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const K = { l: 44, r: meter ? 62 : 34, t: 34, b: 32 }
  const w = K.l + K.r + (xMax - xMin) * einheit
  const h = K.t + K.b + (yMax - yMin) * einheit
  const fs = 16
  const sx = (x: number) => K.l + (x - xMin) * einheit
  const sy = (y: number) => K.t + (yMax - y) * einheit
  const xs = Array.from({ length: xMax - xMin + 1 }, (_, i) => i + xMin)
  const ys = Array.from({ length: yMax - yMin + 1 }, (_, i) => i + yMin)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ maxWidth: Math.round(w * 1.2) }}>
      <defs>
        <clipPath id={clip}>
          <rect x={sx(xMin)} y={sy(yMax)} width={sx(xMax) - sx(xMin)} height={sy(yMin) - sy(yMax)} />
        </clipPath>
      </defs>
      {xs.map((v) => (
        <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={sy(yMax)} y2={sy(yMin)} stroke="var(--grid)" />
      ))}
      {ys.map((v) => (
        <line key={`gy${v}`} x1={sx(xMin)} x2={sx(xMax)} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" />
      ))}
      {/* Achsen mit Pfeilspitzen */}
      <line x1={sx(xMin)} x2={sx(xMax) + 14} y1={sy(0)} y2={sy(0)} stroke="var(--ink)" strokeWidth="2" />
      <line x1={sx(0)} x2={sx(0)} y1={sy(yMin)} y2={sy(yMax) - 14} stroke="var(--ink)" strokeWidth="2" />
      <polygon points={`${sx(xMax) + 20},${sy(0)} ${sx(xMax) + 10},${sy(0) - 5} ${sx(xMax) + 10},${sy(0) + 5}`} fill="var(--ink)" />
      <polygon points={`${sx(0)},${sy(yMax) - 20} ${sx(0) - 5},${sy(yMax) - 10} ${sx(0) + 5},${sy(yMax) - 10}`} fill="var(--ink)" />
      <text x={sx(xMax) + 8} y={sy(0) - 10} fontSize={fs + 1} fontWeight="700" fill="var(--ink)">
        <tspan fontStyle="italic">x</tspan>
        {meter ? ' in m' : ''}
      </text>
      <text x={sx(0) + 12} y={sy(yMax) - 8} fontSize={fs + 1} fontWeight="700" fill="var(--ink)">
        <tspan fontStyle="italic">y</tspan>
        {meter ? ' in m' : ''}
      </text>
      {xs
        .filter((v) => v !== 0)
        .map((v) => (
          <text key={`lx${v}`} x={sx(v)} y={sy(0) + fs + 5} textAnchor="middle" fontSize={fs} fill="var(--ink-muted)">
            {zahl(v)}
          </text>
        ))}
      {ys
        .filter((v) => v !== 0)
        .map((v) => (
          <text key={`ly${v}`} x={sx(0) - 7} y={sy(v) + fs / 3} textAnchor="end" fontSize={fs} fill="var(--ink-muted)">
            {zahl(v)}
          </text>
        ))}
      <text x={sx(0) - 7} y={sy(0) + fs + 5} textAnchor="end" fontSize={fs} fill="var(--ink-muted)">
        0
      </text>
      <g clipPath={`url(#${clip})`}>
        {/* Keile zuerst, damit die Linien darüber liegen */}
        {rampen
          .filter((r) => r.keil && r.bis !== undefined)
          .map((r, i) => (
            <polygon
              key={`k${i}`}
              points={`${sx(0)},${sy(0)} ${sx(r.bis!)},${sy(0)} ${sx(r.bis!)},${sy(r.m * r.bis!)}`}
              fill={r.farbe ?? 'var(--primary)'}
              opacity={0.16}
            />
          ))}
        {dreiecke.map((d, i) => {
          const y0 = d.m * d.x0
          const y1 = d.m * (d.x0 + d.dx)
          return (
            <g key={`d${i}`}>
              <polygon points={`${sx(d.x0)},${sy(y0)} ${sx(d.x0 + d.dx)},${sy(y0)} ${sx(d.x0 + d.dx)},${sy(y1)}`} fill="var(--highlight)" opacity={0.55} />
              <path d={`M${sx(d.x0)} ${sy(y0)} H${sx(d.x0 + d.dx)} V${sy(y1)}`} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeDasharray="8 5" />
            </g>
          )
        })}
        {rampen.map((r, i) => {
          const von = r.bis === undefined ? xMin : 0
          const bis = r.bis ?? xMax
          return (
            <line
              key={`r${i}`}
              x1={sx(von)}
              y1={sy(r.m * von)}
              x2={sx(bis)}
              y2={sy(r.m * bis)}
              stroke={r.art === 'blass' ? 'var(--line-strong)' : r.farbe ?? 'var(--primary)'}
              strokeWidth={r.art === 'blass' ? 2.5 : r.art === 'live' ? 3 : 4.5}
              strokeDasharray={r.art === 'live' ? '10 6' : undefined}
              strokeLinecap="round"
            />
          )
        })}
      </g>
      {/* Beschriftungen der Steigungsdreiecke */}
      {dreiecke.map((d, i) => {
        const y0 = d.m * d.x0
        const y1 = d.m * (d.x0 + d.dx)
        // Δx-Text unter die waagrechte Seite; liegt sie auf der x-Achse, darüber (sonst stößt er an die Achsenbeschriftung)
        const unten = y1 >= y0 && y0 !== 0
        return (
          <g key={`dt${i}`} fontSize={fs + 1} fontWeight="800" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth="5" strokeLinejoin="round">
            {d.dxText && (
              <text x={(sx(d.x0) + sx(d.x0 + d.dx)) / 2 + (y1 >= y0 && !unten ? einheit * 0.25 : 0)} y={sy(y0) + (unten ? fs + 6 : -8)} textAnchor="middle">
                {d.dxText}
              </text>
            )}
            {d.dyText && (
              <text x={sx(d.x0 + d.dx) + 8} y={(sy(y0) + sy(y1)) / 2 + fs / 3}>
                {d.dyText}
              </text>
            )}
          </g>
        )
      })}
      {/* Namen an den Enden der Auffahrten */}
      {rampen
        .filter((r) => r.name && r.bis !== undefined)
        .map((r, i) => (
          <text
            key={`n${i}`}
            x={sx(r.bis!) + 8}
            y={sy(r.m * r.bis!) - 6}
            fontSize={fs + 3}
            fontWeight="800"
            fill={r.farbe ?? 'var(--primary)'}
            paintOrder="stroke"
            stroke="var(--surface)"
            strokeWidth="5"
            strokeLinejoin="round"
          >
            {r.name}
          </text>
        ))}
      {punkte.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r="6" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
          {p.text && (
            <text x={sx(p.x) + 10} y={sy(p.y) - 10} fontSize={fs + 1} fontWeight="800" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth="5">
              {p.text}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
