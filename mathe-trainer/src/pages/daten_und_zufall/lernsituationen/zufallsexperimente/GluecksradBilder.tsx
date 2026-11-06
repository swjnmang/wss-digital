// Bilder der Lernsituation „Das Glücksrad“: das Rad der SMV (Leitobjekt); Titelbild und Aushang sind WebP-Dateien in bilder/.

/** Die 12 gleich großen Felder: H = Hauptgewinn, T = Trostpreis, N = Niete (1 : 3 : 8) */
export type Feld = 'H' | 'T' | 'N'
export const FELDER: Feld[] = ['H', 'N', 'N', 'T', 'N', 'N', 'N', 'T', 'N', 'N', 'T', 'N']
export const FELD_NAME: Record<Feld, string> = { H: 'Hauptgewinn', T: 'Trostpreis', N: 'Niete' }

const punkt = (cx: number, cy: number, r: number, grad: number) => {
  const a = (grad * Math.PI) / 180
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const
}

/** Felder eines Rades mit n gleich großen Sektoren; farbe(i) liefert die Füllfarbe, text(i) die Beschriftung */
export function Sektoren({
  cx,
  cy,
  r,
  n,
  farbe,
  text,
  textGroesse = 24,
}: {
  cx: number
  cy: number
  r: number
  n: number
  farbe: (i: number) => string
  text?: (i: number) => string
  textGroesse?: number
}) {
  const w = 360 / n
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const [x0, y0] = punkt(cx, cy, r, i * w)
        const [x1, y1] = punkt(cx, cy, r, (i + 1) * w)
        const [tx, ty] = punkt(cx, cy, r * 0.72, i * w + w / 2)
        return (
          <g key={i}>
            <path d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={farbe(i)} stroke="var(--ink)" strokeWidth="2" />
            {text && (
              <text x={tx} y={ty + textGroesse * 0.35} textAnchor="middle" fontSize={textGroesse} fontWeight="800" fill="var(--ink)">
                {text(i)}
              </text>
            )}
          </g>
        )
      })}
    </>
  )
}

const FARBE: Record<Feld, string> = { H: 'var(--highlight)', T: 'var(--primary)', N: 'var(--primary-soft)' }
const ZEICHEN: Record<Feld, string> = { H: '★', T: '●', N: '' }

/** Das Glücksrad der SMV. winkel dreht das Rad (Grad im Uhrzeigersinn); der Zeiger oben steht fest. */
export function Gluecksrad({ winkel = 0, animiert = false }: { winkel?: number; animiert?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 330"
      role="img"
      aria-label="Glücksrad mit 12 gleich großen Feldern: ein goldenes Feld mit Stern (Hauptgewinn), drei Felder mit Punkt (Trostpreis) und acht leere helle Felder (Niete). Oben steht ein fester Zeiger."
    >
      <g
        style={{
          transformOrigin: '160px 175px',
          transform: `rotate(${winkel}deg)`,
          transition: animiert ? 'transform 1.2s cubic-bezier(0.15, 0.7, 0.2, 1)' : 'none',
        }}
      >
        <Sektoren cx={160} cy={175} r={140} n={12} farbe={(i) => FARBE[FELDER[i]]} text={(i) => ZEICHEN[FELDER[i]]} />
      </g>
      <circle cx="160" cy="175" r="16" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <polygon points="160,50 144,14 176,14" fill="var(--ink)" />
    </svg>
  )
}
