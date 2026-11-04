import { useId, type ReactNode } from 'react'
import { fmt } from '../../daten_und_zufall/lernpfad/kit'

// Bilder der Lernsituation „Die Funktionsmaschine“: Koordinatensystem und die Maschine (Leitobjekt). Titelbild und Karteikarte sind
// gerenderte WebP-Dateien (bilder-quelle/*.bild.html → bilder/*.webp, Bildwelt Skizzenbuch).
// Flächen in Themenfarbe und Themenfarbe-hell, Linien in --ink, Ausgaben und neue Punkte in --highlight.

/** Zahl als Text mit Komma und echtem Minus, z. B. „−1,5“ */
export const zahl = (v: number) => fmt(v).replace('-', '−')

/* ── Koordinatensystem ───────────────────────────────────────────────────── */

/** unten: Beschriftung rechts unterhalb statt rechts oberhalb des Punktes */
export type Pkt = { x: number; y: number; art?: 'fest' | 'alt' | 'neu'; text?: string; unten?: boolean }
/** Gerade y = m · x + t (in dieser Lernsituation fast immer t = 0) */
export type Linie = { m: number; t?: number; art?: 'haupt' | 'blass' | 'live' }

/**
 * Kartesisches Koordinatensystem: x von −xMax bis xMax, y von −yMax bis yMax, Schrittweite 1 auf beiden Achsen und
 * auf beiden Achsen gleich lang (einheit = Pixel pro Einheit). Jede ganze Zahl ist beschriftet.
 * Punkte: fest (weiß), alt (Themenfarbe), neu (hervorgehoben); Linien: haupt (kräftig), blass, live (gestrichelt, eingetippt).
 */
export function KoSystem({
  xMax,
  yMax,
  einheit = 32,
  punkte = [],
  linien = [],
  label,
}: {
  xMax: number
  yMax: number
  einheit?: number
  punkte?: Pkt[]
  linien?: Linie[]
  label: string
}) {
  const clip = `fm-clip-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const K = { l: 40, r: 30, t: 30, b: 28 }
  const w = K.l + K.r + 2 * xMax * einheit
  const h = K.t + K.b + 2 * yMax * einheit
  const fs = einheit < 30 ? 14 : 16
  const sx = (x: number) => K.l + (x + xMax) * einheit
  const sy = (y: number) => K.t + (yMax - y) * einheit
  const xs = Array.from({ length: 2 * xMax + 1 }, (_, i) => i - xMax)
  const ys = Array.from({ length: 2 * yMax + 1 }, (_, i) => i - yMax)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ maxWidth: Math.round(w * 1.15) }}>
      <defs>
        <clipPath id={clip}>
          <rect x={sx(-xMax)} y={sy(yMax)} width={sx(xMax) - sx(-xMax)} height={sy(-yMax) - sy(yMax)} />
        </clipPath>
      </defs>
      {xs.map((v) => (
        <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={sy(yMax)} y2={sy(-yMax)} stroke="var(--grid)" />
      ))}
      {ys.map((v) => (
        <line key={`gy${v}`} x1={sx(-xMax)} x2={sx(xMax)} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" />
      ))}
      {/* Achsen mit Pfeilspitzen */}
      <line x1={sx(-xMax)} x2={sx(xMax) + 14} y1={sy(0)} y2={sy(0)} stroke="var(--ink)" strokeWidth="2" />
      <line x1={sx(0)} x2={sx(0)} y1={sy(-yMax)} y2={sy(yMax) - 14} stroke="var(--ink)" strokeWidth="2" />
      <polygon points={`${sx(xMax) + 20},${sy(0)} ${sx(xMax) + 10},${sy(0) - 5} ${sx(xMax) + 10},${sy(0) + 5}`} fill="var(--ink)" />
      <polygon points={`${sx(0)},${sy(yMax) - 20} ${sx(0) - 5},${sy(yMax) - 10} ${sx(0) + 5},${sy(yMax) - 10}`} fill="var(--ink)" />
      <text x={sx(xMax) + 6} y={sy(0) - 10} fontSize={fs + 2} fontStyle="italic" fontWeight="700" fill="var(--ink)" textAnchor="middle">
        x
      </text>
      <text x={sx(0) + 12} y={sy(yMax) - 6} fontSize={fs + 2} fontStyle="italic" fontWeight="700" fill="var(--ink)">
        y
      </text>
      {xs
        .filter((v) => v !== 0)
        .map((v) => (
          <text key={`lx${v}`} x={sx(v)} y={sy(0) + fs + 4} textAnchor="middle" fontSize={fs} fill="var(--ink-muted)">
            {zahl(v)}
          </text>
        ))}
      {ys
        .filter((v) => v !== 0)
        .map((v) => (
          <text key={`ly${v}`} x={sx(0) - 6} y={sy(v) + fs / 3} textAnchor="end" fontSize={fs} fill="var(--ink-muted)">
            {zahl(v)}
          </text>
        ))}
      <g clipPath={`url(#${clip})`}>
        {linien.map((l, i) => {
          const t = l.t ?? 0
          return (
            <line
              key={i}
              x1={sx(-xMax)}
              y1={sy(l.m * -xMax + t)}
              x2={sx(xMax)}
              y2={sy(l.m * xMax + t)}
              stroke={l.art === 'blass' ? 'var(--line-strong)' : 'var(--primary)'}
              strokeWidth={l.art === 'blass' ? 2.5 : 3.5}
              strokeDasharray={l.art === 'live' ? '12 6' : undefined}
            />
          )
        })}
      </g>
      {punkte.map((p, i) => (
        <g key={i}>
          <circle
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={p.art === 'neu' ? 9 : 7}
            fill={p.art === 'neu' ? 'var(--highlight)' : p.art === 'alt' ? 'var(--primary)' : 'var(--surface)'}
            stroke="var(--ink)"
            strokeWidth="2"
          />
          {p.text && (
            <text x={sx(p.x) + 12} y={sy(p.y) + (p.unten ? fs + 10 : -10)} fontSize={fs + 1} fontWeight="800" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth="4">
              {p.text}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

/* ── Leitobjekt: die Funktionsmaschine ───────────────────────────────────── */

/** Zahnrad mit acht Zähnen */
function Zahnrad({ cx, cy, r, dreht }: { cx: number; cy: number; r: number; dreht?: string }) {
  return (
    <g className={dreht}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={cx - r * 0.18} y={cy - r - r * 0.28} width={r * 0.36} height={r * 0.5} rx="2" fill="var(--primary)" transform={`rotate(${i * 45} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="var(--primary)" />
      <circle cx={cx} cy={cy} r={r * 0.38} fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
    </g>
  )
}

/**
 * Die Funktionsmaschine: oben der Einwurf mit der Zahl x, in der Mitte das Fenster mit der Regel, rechts unten die Ausgabe y.
 * ein/aus: angezeigte Zahlen (leer: „?“); regel: Text im Regelfenster (Standard „geheim“); fehler: Ausgabe zeigt „Fehler“.
 * lauf: Animation beim Einwerfen (einwurf: Kärtchen fällt in den Trichter, rechnen: Zahnräder drehen sich, die Ausgabe zeigt „…“).
 * wurf: Nummer des Wurfs; ändert sie sich, springt die neue Ausgabe kurz auf.
 */
export function MaschinenBild({
  name,
  ein,
  aus,
  regel = '?',
  fehler = false,
  label,
  platz,
  lauf,
  wurf,
}: {
  name: string
  ein?: string
  aus?: string
  regel?: ReactNode
  fehler?: boolean
  label: string
  /** Lage im Titelbild (verschachteltes SVG) */
  platz?: { x: number; y: number; width: number; height: number }
  lauf?: 'einwurf' | 'rechnen'
  wurf?: number
}) {
  const ausgabe = lauf ? 'y = …' : fehler ? 'Fehler' : `y = ${aus ?? '?'}`
  return (
    <svg viewBox="0 0 560 250" role={platz ? undefined : 'img'} aria-label={platz ? undefined : label} {...platz}>
      {/* Einwurf-Trichter mit Zahl x */}
      <polygon points="150,62 250,62 226,96 174,96" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="140" y="8" width="120" height="46" rx="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
      <text x="200" y="40" textAnchor="middle" fontSize="23" fontWeight="800" fill="var(--ink)">
        x = {ein ?? '?'}
      </text>
      {/* Kärtchen mit der Zahl fällt durch den Trichter in die Maschine */}
      {lauf === 'einwurf' && (
        <g className="fm-karte">
          <rect x="172" y="12" width="56" height="38" rx="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
          <text x="200" y="39" textAnchor="middle" fontSize="21" fontWeight="800" fill="var(--ink)">
            {ein}
          </text>
        </g>
      )}
      {/* Gehäuse */}
      <rect x="70" y="96" width="340" height="122" rx="18" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2.5" />
      <text x="88" y="124" fontSize="17" fontWeight="800" fill="var(--ink)">
        {name}
      </text>
      <Zahnrad cx={118} cy={176} r={22} dreht={lauf === 'rechnen' ? 'fm-dreht' : undefined} />
      <Zahnrad cx={162} cy={160} r={14} dreht={lauf === 'rechnen' ? 'fm-dreht fm-dreht-links' : undefined} />
      {/* Regelfenster */}
      <rect x="206" y="138" width="180" height="58" rx="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <text x="296" y="160" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
        Regel
      </text>
      {lauf === 'rechnen' ? (
        <g className="fm-denkt" fill="var(--primary)">
          <circle cx="276" cy="180" r="5" />
          <circle cx="296" cy="180" r="5" />
          <circle cx="316" cy="180" r="5" />
        </g>
      ) : (
        <text x="296" y="186" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--primary)">
          {regel}
        </text>
      )}
      {/* Füße */}
      <rect x="96" y="218" width="40" height="14" rx="4" fill="var(--ink)" />
      <rect x="344" y="218" width="40" height="14" rx="4" fill="var(--ink)" />
      {/* Ausgabe-Rutsche mit Anzeige y */}
      <polygon points="410,168 448,168 448,204 410,204" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <g key={lauf ? 'lauf' : `wurf-${wurf ?? 0}`} className={!lauf && wurf ? 'fm-pop' : undefined}>
        <rect
          x="444"
          y="150"
          width="108"
          height="72"
          rx="10"
          fill={lauf ? 'var(--surface)' : fehler ? 'var(--wrong-soft)' : aus !== undefined ? 'var(--highlight)' : 'var(--surface)'}
          stroke="var(--ink)"
          strokeWidth="2.5"
        />
        <text x="498" y="181" textAnchor="middle" fontSize="15" fill="var(--ink)">
          Ausgabe
        </text>
        <text x="498" y="208" textAnchor="middle" fontSize={!lauf && fehler ? 19 : 23} fontWeight="800" fill={!lauf && fehler ? 'var(--wrong-ink)' : 'var(--ink)'}>
          {ausgabe}
        </text>
      </g>
    </svg>
  )
}

/** Protokoll einer Maschine als Wertetabelle (Spalten brechen auf schmalen Bildschirmen um). neu: x-Wert der zuletzt eingeworfenen Zahl */
export function Protokoll({ paare, neu, label, faktor }: { paare: { x: number; y: number }[]; neu?: number; label: string; faktor?: string }) {
  return (
    <div className={`fm-tabelle${faktor ? ' fm-mit-faktor' : ''}`} role="table" aria-label={faktor ? `${label}. Jede Spalte: x-Wert mal ${faktor} ergibt den y-Wert.` : label}>
      <div className="fm-spalte fm-kopf" role="row">
        <span role="rowheader">
          <i>x</i>
        </span>
        {faktor && <span className="fm-faktor" aria-hidden="true" />}
        <span role="rowheader">
          <i>y</i>
        </span>
      </div>
      {paare.map((p, i) => (
        <div key={i} className={`fm-spalte${p.x === neu ? ' fm-neu' : ''}`} role="row">
          <span role="cell">{zahl(p.x)}</span>
          {faktor && (
            <span className="fm-faktor" aria-hidden="true">
              ↓ · {faktor}
            </span>
          )}
          <span role="cell">{zahl(p.y)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Brücke vom Satz zur Funktionsgleichung in drei Zeilen: In Worten → Als Rechnung → Als Gleichung.
 * Fehlt gleichung, steht dort ein Fragezeichen (in „Problem erkennen“ ist die Gleichung noch offen).
 */
export function Bruecke({ worte, rechnung, gleichung }: { worte: ReactNode; rechnung: ReactNode; gleichung?: ReactNode }) {
  return (
    <ol className="fm-bruecke">
      <li>
        <span className="fm-bruecke-art">In Worten</span>
        <span>{worte}</span>
      </li>
      <li>
        <span className="fm-bruecke-art">Als Rechnung</span>
        <span>{rechnung}</span>
      </li>
      <li>
        <span className="fm-bruecke-art">Als Gleichung</span>
        <span>{gleichung ?? <strong>?</strong>}</span>
      </li>
    </ol>
  )
}
