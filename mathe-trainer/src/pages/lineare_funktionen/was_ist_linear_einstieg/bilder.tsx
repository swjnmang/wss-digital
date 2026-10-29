import { useId, type ReactNode } from 'react'
import { fmt } from '../../daten_und_zufall/lernpfad/kit'

// Bilder der Lernsituation „Die Funktionsmaschine“: Koordinatensystem, die Maschine (Leitobjekt), Titelbild und Karteikarte.
// Flächen in Themenfarbe und Themenfarbe-hell, Linien in --ink, Ausgaben und neue Punkte in --highlight.

/** Zahl als Text mit Komma und echtem Minus, z. B. „−1,5“ */
export const zahl = (v: number) => fmt(v).replace('-', '−')

/* ── Koordinatensystem ───────────────────────────────────────────────────── */

/** unten: Beschriftung rechts unterhalb statt rechts oberhalb des Punktes */
export type Pkt = { x: number; y: number; art?: 'fest' | 'alt' | 'neu'; text?: string; unten?: boolean }
/** Gerade y = m · x + t (in dieser Lernsituation fast immer t = 0) */
export type Linie = { m: number; t?: number; art?: 'haupt' | 'blass' | 'live' }

/**
 * Koordinatensystem mit x von −6 bis 6. yMax und yStep legen die y-Achse fest (z. B. 15 und 3 für y = 3x).
 * Punkte: fest (weiß), alt (Themenfarbe), neu (hervorgehoben); Linien: haupt (kräftig), blass, live (gestrichelt, eingetippt).
 */
export function KoSystem({
  yMax,
  yStep,
  punkte = [],
  linien = [],
  label,
  w = 680,
  h = 340,
  xMax = 6,
}: {
  yMax: number
  yStep: number
  punkte?: Pkt[]
  linien?: Linie[]
  label: string
  w?: number
  h?: number
  xMax?: number
}) {
  const clip = `fm-clip-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const K = { l: 44, r: 26, t: 22, b: 30 }
  const fs = w < 400 ? 15 : 17
  const sx = (x: number) => K.l + ((x + xMax) / (2 * xMax)) * (w - K.l - K.r)
  const sy = (y: number) => K.t + ((yMax - y) / (2 * yMax)) * (h - K.t - K.b)
  const xs = Array.from({ length: 2 * xMax + 1 }, (_, i) => i - xMax)
  const ys = Array.from({ length: Math.floor((2 * yMax) / yStep) + 1 }, (_, i) => -yMax + i * yStep)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
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

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild der Startbox: Zahlen wandern in die Maschine, die Ausgabe ist noch offen; rechts deuten Punkte auf einer Geraden den Graphen an */
export function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 250"
      role="img"
      aria-label="Eine Funktionsmaschine mit Zahnrädern. Oben wird die Zahl 2 eingeworfen, in der Mitte steht eine geheime Regel mit Fragezeichen, rechts kommt eine unbekannte Zahl y heraus. Daneben liegen drei Zahlenkärtchen und ein Koordinatensystem mit Punkten auf einer Geraden."
    >
      {/* Zahlenkärtchen, die auf den Einwurf warten */}
      {[
        { x: 22, y: 30, n: '5', r: -8 },
        { x: 70, y: 18, n: '−3', r: 6 },
        { x: 128, y: 34, n: '0', r: -4 },
      ].map((k) => (
        <g key={k.n} transform={`rotate(${k.r} ${k.x + 22} ${k.y + 22})`}>
          <rect x={k.x} y={k.y} width="44" height="44" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
          <text x={k.x + 22} y={k.y + 30} textAnchor="middle" fontSize="21" fontWeight="800" fill="var(--ink)">
            {k.n}
          </text>
        </g>
      ))}
      <MaschinenBild name="Funktionsmaschine" ein="2" label="" platz={{ x: 140, y: 44, width: 440, height: 196 }} />
      {/* Koordinatensystem mit drei Punkten auf einer Geraden durch den Ursprung */}
      <g transform="translate(652 130)">
        <line x1="-54" x2="54" y1="0" y2="0" stroke="var(--ink)" strokeWidth="2" />
        <line x1="0" x2="0" y1="80" y2="-80" stroke="var(--ink)" strokeWidth="2" />
        <line x1="-44" y1="66" x2="44" y2="-66" stroke="var(--primary)" strokeWidth="3" strokeDasharray="8 6" />
        {[-24, 12, 34].map((x) => (
          <circle key={x} cx={x} cy={-1.5 * x} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
        ))}
      </g>
    </svg>
  )
}

/** Handlungsprodukt: Karteikarte „Maschinen-Steckbrief“ mit vier Feldern und Stift */
export function SteckbriefBild() {
  return (
    <svg
      viewBox="0 0 720 200"
      role="img"
      aria-label="Eine Karteikarte mit der Überschrift Maschinen-Steckbrief. Sie ist in vier Felder geteilt: Regel in Worten, Wertetabelle, Graph und Gleichung. Daneben liegt ein Stift."
    >
      <rect x="120" y="10" width="460" height="182" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="120" y="10" width="460" height="38" rx="8" fill="var(--primary-soft)" />
      <line x1="120" x2="580" y1="48" y2="48" stroke="var(--primary)" strokeWidth="2" />
      <text x="140" y="37" fontSize="20" fontWeight="800" fill="var(--ink)">
        Maschinen-Steckbrief: Maschine B
      </text>
      <line x1="350" x2="350" y1="48" y2="192" stroke="var(--line-strong)" strokeWidth="2" />
      <line x1="120" x2="580" y1="120" y2="120" stroke="var(--line-strong)" strokeWidth="2" />
      <text x="134" y="70" fontSize="15" fontWeight="700" fill="var(--primary)">
        Regel in Worten
      </text>
      <line x1="134" x2="320" y1="96" y2="96" stroke="var(--line-strong)" strokeWidth="2" />
      <text x="364" y="70" fontSize="15" fontWeight="700" fill="var(--primary)">
        Wertetabelle
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={364 + i * 40} y="80" width="40" height="30" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
      ))}
      <text x="134" y="142" fontSize="15" fontWeight="700" fill="var(--primary)">
        Graph
      </text>
      <line x1="200" x2="300" y1="158" y2="158" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="250" x2="250" y1="126" y2="188" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="226" y1="134" x2="274" y2="182" stroke="var(--primary)" strokeWidth="3" />
      <text x="364" y="142" fontSize="15" fontWeight="700" fill="var(--primary)">
        Gleichung
      </text>
      <text x="364" y="174" fontSize="22" fontWeight="800" fontStyle="italic" fill="var(--ink)">
        y = …
      </text>
      <g transform="rotate(-35 650 120)">
        <rect x="600" y="110" width="110" height="18" rx="4" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        <polygon points="600,110 584,119 600,128" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      </g>
    </svg>
  )
}

/** Protokoll einer Maschine als Wertetabelle (Spalten brechen auf schmalen Bildschirmen um). neu: x-Wert der zuletzt eingeworfenen Zahl */
export function Protokoll({ paare, neu, label }: { paare: { x: number; y: number }[]; neu?: number; label: string }) {
  return (
    <div className="fm-tabelle" role="table" aria-label={label}>
      <div className="fm-spalte fm-kopf" role="row">
        <span role="rowheader">
          <i>x</i>
        </span>
        <span role="rowheader">
          <i>y</i>
        </span>
      </div>
      {paare.map((p, i) => (
        <div key={i} className={`fm-spalte${p.x === neu ? ' fm-neu' : ''}`} role="row">
          <span role="cell">{zahl(p.x)}</span>
          <span role="cell">{zahl(p.y)}</span>
        </div>
      ))}
    </div>
  )
}
