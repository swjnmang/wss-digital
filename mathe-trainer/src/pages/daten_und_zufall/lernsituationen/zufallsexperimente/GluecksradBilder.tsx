// Bilder der Lernsituation „Das Glücksrad“: das Rad der SMV (Leitobjekt), das Titelbild und die Aushang-Skizze.

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

/** Titelbild: der Stand der SMV auf dem Schulfest mit dem Glücksrad */
export function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Der Stand der SMV auf dem Schulfest: ein Tresen mit gestreifter Markise und einem großen Glücksrad mit Zeiger. Links ein Fähnchen-Band, rechts ein Preisschild mit 1 Euro Einsatz."
    >
      <rect x="0" y="206" width="720" height="46" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="206" y2="206" stroke="var(--ink)" strokeWidth="2" />
      {/* Fähnchen */}
      <path d="M20 40 Q180 80 340 40" fill="none" stroke="var(--ink)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = 40 + i * 44
        const y = 40 + Math.sin(((x - 20) / 320) * Math.PI) * 24
        return <polygon key={i} points={`${x},${y} ${x + 24},${y} ${x + 12},${y + 26}`} fill={i % 2 ? 'var(--highlight)' : 'var(--primary)'} stroke="var(--ink)" strokeWidth="1.5" />
      })}
      {/* Tresen und Markise */}
      <rect x="260" y="150" width="300" height="56" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="250" y="26" width="320" height="10" fill="var(--ink)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${255 + i * 38.75} 36 h38.75 v26 q-19.4 14 -38.75 0 z`} fill={i % 2 ? 'var(--surface)' : 'var(--primary)'} stroke="var(--ink)" strokeWidth="1.5" />
      ))}
      <rect x="262" y="36" width="8" height="114" fill="var(--ink)" />
      <rect x="550" y="36" width="8" height="114" fill="var(--ink)" />
      {/* Rad auf dem Tresen */}
      <g transform="translate(410 98)">
        <Sektoren cx={0} cy={0} r={50} n={12} farbe={(i) => FARBE[FELDER[i]]} />
        <circle cx="0" cy="0" r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <polygon points="0,-46 -7,-62 7,-62" fill="var(--ink)" />
      </g>
      {/* Preisschild */}
      <line x1="640" x2="640" y1="206" y2="120" stroke="var(--ink)" strokeWidth="3" />
      <rect x="580" y="86" width="126" height="48" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="643" y="108" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
        Einsatz
      </text>
      <text x="643" y="127" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        1 € pro Dreh
      </text>
      {/* Beschriftung am Tresen */}
      <text x="410" y="186" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--ink)">
        SMV-Glücksrad
      </text>
    </svg>
  )
}

/** Handlungsprodukt: Aushang am Stand */
export function AushangBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Aushang am Stand mit der Überschrift: Unser faires Glücksrad. Links ein kleines Rad, rechts eine Liste mit drei Zeilen für die Wahrscheinlichkeiten und eine Zeile für den Hinweis."
      >
        <rect x="110" y="6" width="500" height="178" rx="10" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="140" y="18" width="440" height="156" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <circle cx="360" cy="18" r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="50" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
          Unser faires Glücksrad
        </text>
        <g transform="translate(205 112)">
          <Sektoren cx={0} cy={0} r={44} n={12} farbe={(i) => FARBE[FELDER[i]]} />
        </g>
        {['Hauptgewinn: P = …', 'Trostpreis: P = …', 'Gewinn insgesamt: P = …', 'Niete: P = …'].map((t, i) => (
          <text key={t} x="280" y={84 + i * 24} fontSize="17" fill="var(--ink)">
            {t}
          </text>
        ))}
      </svg>
    </div>
  )
}
