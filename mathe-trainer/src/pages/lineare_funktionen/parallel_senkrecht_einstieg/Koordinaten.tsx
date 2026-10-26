import { useId, type ReactNode } from 'react'

// Koordinatensystem für die Lernsituation „Der neue Radweg“ mit gleich großen Einheiten in x- und y-Richtung,
// damit ein rechter Winkel auch auf dem Bildschirm rechtwinklig aussieht. Zeichnet Geraden, Steigungsdreiecke,
// Punkte und einen Winkel (Bogen bzw. Quadrat bei 90°) zwischen zwei Geraden.

export type Linie = { m: number; t: number; farbe?: string; dicke?: number; blass?: boolean; bahn?: boolean; name?: string; nameX?: number }
/** Steigungsdreieck: von (x | y) aus dx waagrecht, dann dy senkrecht; Beschriftung der beiden Katheten */
export type Dreieck = { x: number; y: number; dx: number; dy: number; farbe?: string; textDx?: string; textDy?: string }
export type Punkt = { x: number; y: number; name: string; farbe?: string; unten?: boolean; links?: boolean }
/** Winkel zwischen zwei Geraden (Steigungen m1, m2) im Schnittpunkt (x | y) */
export type Winkel = { x: number; y: number; m1: number; m2: number; text?: boolean; farbe?: string }

/** Spitzer Winkel zwischen zwei Geraden in Grad (0 bis 90) */
export function winkelZwischen(m1: number, m2: number) {
  let a = Math.abs(Math.atan(m1) - Math.atan(m2)) * (180 / Math.PI)
  if (a > 90) a = 180 - a
  return a
}

export function Koordinaten({
  xMin,
  xMax,
  yMin,
  yMax,
  einheit = 40,
  linien = [],
  dreiecke = [],
  punkte = [],
  winkel = [],
  schritt = 1,
  beschriftung = 2,
  ariaLabel,
  maxHoehe,
  children,
}: {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  einheit?: number
  linien?: Linie[]
  dreiecke?: Dreieck[]
  punkte?: Punkt[]
  winkel?: Winkel[]
  /** Abstand der Gitterlinien */
  schritt?: number
  /** Abstand der Achsenbeschriftungen */
  beschriftung?: number
  ariaLabel: string
  maxHoehe?: number
  children?: ReactNode
}) {
  const clip = `rw-clip-${useId().replace(/:/g, '')}`
  const rand = 28
  const w = (xMax - xMin) * einheit + 2 * rand
  const h = (yMax - yMin) * einheit + 2 * rand
  const gx = (x: number) => rand + (x - xMin) * einheit
  const gy = (y: number) => rand + (yMax - y) * einheit
  const gitter = (a: number, b: number) => {
    const out: number[] = []
    for (let v = Math.ceil(a / schritt) * schritt; v <= b + 1e-9; v += schritt) out.push(Math.round(v * 1000) / 1000)
    return out
  }
  const zahl = (v: number) => String(v).replace('-', '−').replace('.', ',')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel} style={maxHoehe ? { maxHeight: maxHoehe } : undefined}>
      <defs>
        <clipPath id={clip}>
          <rect x={gx(xMin)} y={gy(yMax)} width={gx(xMax) - gx(xMin)} height={gy(yMin) - gy(yMax)} />
        </clipPath>
      </defs>
      {gitter(xMin, xMax).map((v) => (
        <line key={`gx${v}`} x1={gx(v)} x2={gx(v)} y1={gy(yMin)} y2={gy(yMax)} stroke="var(--grid)" />
      ))}
      {gitter(yMin, yMax).map((v) => (
        <line key={`gy${v}`} x1={gx(xMin)} x2={gx(xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--grid)" />
      ))}
      {yMin <= 0 && yMax >= 0 && <line x1={gx(xMin)} x2={gx(xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="1.8" />}
      {xMin <= 0 && xMax >= 0 && <line x1={gx(0)} x2={gx(0)} y1={gy(yMin)} y2={gy(yMax)} stroke="var(--ink)" strokeWidth="1.8" />}
      {yMin <= 0 &&
        yMax >= 0 &&
        gitter(xMin + 0.01, xMax - 0.01)
          .filter((v) => v !== 0 && v % beschriftung === 0)
          .map((v) => (
            <text key={`tx${v}`} x={gx(v)} y={gy(0) + 19} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
              {zahl(v)}
            </text>
          ))}
      {xMin <= 0 &&
        xMax >= 0 &&
        gitter(yMin + 0.01, yMax - 0.01)
          .filter((v) => v !== 0 && v % beschriftung === 0)
          .map((v) => (
            <text key={`ty${v}`} x={gx(0) - 7} y={gy(v) + 5} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
              {zahl(v)}
            </text>
          ))}
      <g clipPath={`url(#${clip})`}>
        {linien.map((l, i) => {
          const y1 = l.m * xMin + l.t
          const y2 = l.m * xMax + l.t
          const farbe = l.farbe ?? 'var(--primary)'
          return (
            <g key={i} opacity={l.blass ? 0.45 : 1}>
              <line x1={gx(xMin)} y1={gy(y1)} x2={gx(xMax)} y2={gy(y2)} stroke={farbe} strokeWidth={l.dicke ?? (l.blass ? 2.5 : 4)} strokeLinecap="round" />
              {l.bahn && (
                <line x1={gx(xMin)} y1={gy(y1)} x2={gx(xMax)} y2={gy(y2)} stroke="var(--surface)" strokeWidth={(l.dicke ?? 4) - 3} strokeDasharray="10 8" />
              )}
            </g>
          )
        })}
        {dreiecke.map((d, i) => {
          const farbe = d.farbe ?? 'var(--primary)'
          const x2 = d.x + d.dx
          const y2 = d.y + d.dy
          return (
            <g key={i}>
              <polygon
                points={`${gx(d.x)},${gy(d.y)} ${gx(x2)},${gy(d.y)} ${gx(x2)},${gy(y2)}`}
                fill={farbe}
                fillOpacity="0.14"
                stroke={farbe}
                strokeWidth="2.5"
                strokeDasharray="7 4"
              />
              {d.textDx && (
                <text
                  x={(gx(d.x) + gx(x2)) / 2}
                  y={gy(d.y) + (d.dy > 0 ? 20 : -8)}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="800"
                  fill={farbe}
                  stroke="var(--surface)"
                  strokeWidth="4"
                  paintOrder="stroke"
                >
                  {d.textDx}
                </text>
              )}
              {d.textDy && (
                <text
                  x={gx(x2) + (d.dx > 0 ? 7 : -7)}
                  y={(gy(d.y) + gy(y2)) / 2 + 6}
                  textAnchor={d.dx > 0 ? 'start' : 'end'}
                  fontSize="16"
                  fontWeight="800"
                  fill={farbe}
                  stroke="var(--surface)"
                  strokeWidth="4"
                  paintOrder="stroke"
                >
                  {d.textDy}
                </text>
              )}
            </g>
          )
        })}
      </g>
      {winkel.map((wk, i) => {
        const farbe = wk.farbe ?? 'var(--ink)'
        const px = gx(wk.x)
        const py = gy(wk.y)
        const n1 = Math.hypot(1, wk.m1)
        const n2 = Math.hypot(1, wk.m2)
        const d1 = [1 / n1, -wk.m1 / n1]
        let d2 = [1 / n2, -wk.m2 / n2]
        if (d1[0] * d2[0] + d1[1] * d2[1] < 0) d2 = [-d2[0], -d2[1]]
        const grad = winkelZwischen(wk.m1, wk.m2)
        const recht = Math.abs(grad - 90) < 0.5
        if (recht) {
          const s = 18
          // beim rechten Winkel die zweite Richtung so wählen, dass das Quadrat zwischen den Schenkeln liegt
          return (
            <polyline
              key={i}
              points={`${px + d1[0] * s},${py + d1[1] * s} ${px + (d1[0] + d2[0]) * s},${py + (d1[1] + d2[1]) * s} ${px + d2[0] * s},${py + d2[1] * s}`}
              fill="none"
              stroke={farbe}
              strokeWidth="2.5"
            />
          )
        }
        const r = 36
        const kreuz = d1[0] * d2[1] - d1[1] * d2[0]
        const mitte = [d1[0] + d2[0], d1[1] + d2[1]]
        const nm = Math.hypot(mitte[0], mitte[1]) || 1
        return (
          <g key={i}>
            <path
              d={`M ${px + d1[0] * r} ${py + d1[1] * r} A ${r} ${r} 0 0 ${kreuz > 0 ? 1 : 0} ${px + d2[0] * r} ${py + d2[1] * r}`}
              fill="none"
              stroke={farbe}
              strokeWidth="2.5"
            />
            {wk.text && (
              <text
                x={px + (mitte[0] / nm) * (r + 22)}
                y={py + (mitte[1] / nm) * (r + 22) + 6}
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill={farbe}
                stroke="var(--surface)"
                strokeWidth="4"
                paintOrder="stroke"
              >
                {Math.round(grad)}°
              </text>
            )}
          </g>
        )
      })}
      {linien
        .filter((l) => l.name)
        .map((l, i) => {
          const x = l.nameX ?? xMax - 0.6
          return (
            <text
              key={`n${i}`}
              x={gx(x)}
              y={gy(l.m * x + l.t) - 12}
              textAnchor="end"
              fontSize="16"
              fontWeight="800"
              fill={l.farbe ?? 'var(--primary)'}
              stroke="var(--surface)"
              strokeWidth="4"
              paintOrder="stroke"
            >
              {l.name}
            </text>
          )
        })}
      {punkte.map((p) => (
        <g key={p.name}>
          <circle cx={gx(p.x)} cy={gy(p.y)} r="8" fill={p.farbe ?? 'var(--highlight)'} stroke="var(--ink)" strokeWidth="2.5" />
          <text
            x={gx(p.x) + (p.links ? -12 : 12)}
            y={gy(p.y) + (p.unten ? 24 : -11)}
            textAnchor={p.links ? 'end' : 'start'}
            fontSize="17"
            fontWeight="800"
            fill="var(--ink)"
            stroke="var(--surface)"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {p.name}
          </text>
        </g>
      ))}
      {children}
    </svg>
  )
}
