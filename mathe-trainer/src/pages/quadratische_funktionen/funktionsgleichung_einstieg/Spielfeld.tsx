import { useId } from 'react'

// Seitenansicht des Basketballfelds für „Trifft der Korbwurf?“ und das Bonus-Spiel „Korbjäger“: Koordinatensystem in Metern
// (x = Entfernung vom Abwurf, y = Höhe), Korb mit Brett, Wurfbahnen y = ax² + bx + c, Messpunkte und Ball.

/** Höhe der Korbmitte (Ring) in m */
export const KORB_H = 3.05

export const F = { w: 680, h: 380, l: 48, r: 16, t: 14, b: 44, xMax: 5.5, yMax: 5.5 }
export const fx = (x: number) => F.l + (x / F.xMax) * (F.w - F.l - F.r)
export const fy = (y: number) => F.h - F.b - (y / F.yMax) * (F.h - F.t - F.b)

export type Bahn = { a: number; b: number; c: number }
export type BahnBild = Bahn & {
  /** alt: frühere Versuche (blass), aktuell: kräftig in Themenfarbe, treffer: grün, zweit: gestrichelt in --ink */
  art: 'alt' | 'aktuell' | 'treffer' | 'zweit'
  /** Bahn nur bis zu dieser Stelle zeichnen (Flug im Spiel) */
  bis?: number
  name?: string
}
export type Messpunkt = { x: number; y: number; text: string; unten?: boolean }

export const hoehe = (bahn: Bahn, x: number) => bahn.a * x * x + bahn.b * x + bahn.c

/** Punkte einer Wurfbahn vom Abwurf bis zum Boden bzw. Bildrand */
export function bahnPunkte(bahn: Bahn, bis = F.xMax) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= 220; i++) {
    const x = (i / 220) * F.xMax
    if (x > bis) break
    const y = hoehe(bahn, x)
    pts.push({ x, y })
    if (y < 0 || y > F.yMax + 0.3) break
  }
  return pts
}

export function Spielfeld({
  bahnen = [],
  punkte = [],
  korb = 4,
  ball,
  frage,
  label,
}: {
  bahnen?: BahnBild[]
  punkte?: Messpunkt[]
  /** x-Wert der Korbmitte, null ohne Korb */
  korb?: number | null
  ball?: { x: number; y: number }
  /** kurzer Text oben links, z. B. „Bahn: y = ?“ */
  frage?: string
  label: string
}) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox={`0 0 ${F.w} ${F.h}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={fx(0)} y={fy(F.yMax)} width={fx(F.xMax) - fx(0)} height={fy(0) - fy(F.yMax)} />
        </clipPath>
      </defs>
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <g key={`x${v}`}>
          <line x1={fx(v)} x2={fx(v)} y1={fy(0)} y2={fy(F.yMax)} stroke="var(--grid)" />
          <text x={fx(v)} y={fy(0) + 24} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
            {v}
          </text>
        </g>
      ))}
      {[1, 2, 3, 4, 5].map((v) => (
        <g key={`y${v}`}>
          <line x1={fx(0)} x2={fx(F.xMax)} y1={fy(v)} y2={fy(v)} stroke="var(--grid)" />
          <text x={fx(0) - 8} y={fy(v) + 6} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
            {v}
          </text>
        </g>
      ))}
      <rect x={fx(0)} y={fy(0)} width={fx(F.xMax) - fx(0)} height="6" fill="var(--primary-soft)" />
      <line x1={fx(0)} x2={fx(F.xMax)} y1={fy(0)} y2={fy(0)} stroke="var(--ink)" strokeWidth="3" />
      <line x1={fx(0)} x2={fx(0)} y1={fy(0)} y2={fy(F.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
      <text x={fx(F.xMax) - 4} y={fy(0) + 42} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
        Entfernung x in m
      </text>
      <text x={fx(0) + 8} y={fy(F.yMax) + 18} fontSize="15" fill="var(--ink-muted)">
        Höhe y in m
      </text>
      {korb !== null && (
        <g>
          {/* Ständer, Brett, Ring und Netz */}
          <line x1={fx(korb + 0.6)} x2={fx(korb + 0.6)} y1={fy(0)} y2={fy(3.5)} stroke="var(--ink)" strokeWidth="5" />
          <line x1={fx(korb + 0.6)} x2={fx(korb + 0.32)} y1={fy(3.5)} y2={fy(3.5)} stroke="var(--ink)" strokeWidth="4" />
          <rect x={fx(korb + 0.3)} y={fy(4.1)} width="7" height={fy(2.95) - fy(4.1)} fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
          <path
            d={`M${fx(korb - 0.23)} ${fy(KORB_H)} L${fx(korb - 0.16)} ${fy(KORB_H - 0.4)} L${fx(korb + 0.16)} ${fy(KORB_H - 0.4)} L${fx(korb + 0.23)} ${fy(KORB_H)}`}
            fill="none"
            stroke="var(--ink-muted)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line x1={fx(korb - 0.23)} x2={fx(korb + 0.3)} y1={fy(KORB_H)} y2={fy(KORB_H)} stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
          <text x={fx(korb + 0.3) + 12} y={fy(4.1) + 16} fontSize="16" fontWeight="700" fill="var(--ink)">
            Korb
          </text>
        </g>
      )}
      <g clipPath={`url(#${clip})`}>
        {bahnen.map((k, i) => (
          <polyline
            key={i}
            points={bahnPunkte(k, k.bis)
              .map((p) => `${fx(p.x)},${fy(Math.max(-0.3, Math.min(F.yMax + 0.3, p.y)))}`)
              .join(' ')}
            fill="none"
            stroke={k.art === 'treffer' ? 'var(--correct)' : k.art === 'aktuell' ? 'var(--primary)' : k.art === 'zweit' ? 'var(--ink)' : 'var(--line-strong)'}
            strokeWidth={k.art === 'alt' ? 2 : 4}
            strokeDasharray={k.art === 'zweit' ? '12 7' : undefined}
            strokeLinecap="round"
            opacity={k.art === 'alt' ? 0.7 : 1}
          />
        ))}
      </g>
      {bahnen
        .filter((k) => k.name)
        .map((k) => (
          <text
            key={k.name}
            x={fx(1.15)}
            y={fy(hoehe(k, 1.15)) + (k.art === 'zweit' ? 30 : -14)}
            fontSize="18"
            fontWeight="800"
            fill={k.art === 'zweit' ? 'var(--ink)' : k.art === 'treffer' ? 'var(--correct-ink)' : 'var(--primary)'}
          >
            {k.name}
          </text>
        ))}
      {punkte.map((p) => (
        <g key={p.text}>
          <circle cx={fx(p.x)} cy={fy(p.y)} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
          <text x={fx(p.x) + 10} y={fy(p.y) + (p.unten ? 26 : -12)} fontSize="17" fontWeight="700" fill="var(--ink)">
            {p.text.replace(/\./g, ',').replace(/-/g, '−')}
          </text>
        </g>
      ))}
      {ball && (
        <g>
          <circle cx={fx(ball.x)} cy={fy(ball.y)} r="13" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
          <path
            d={`M${fx(ball.x) - 13} ${fy(ball.y)} h26 M${fx(ball.x)} ${fy(ball.y) - 13} v26`}
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
        </g>
      )}
      {frage && (
        <text x={fx(0) + 16} y={fy(F.yMax) + 48} fontSize="20" fontWeight="800" fill="var(--ink)">
          {frage}
        </text>
      )}
    </svg>
  )
}
