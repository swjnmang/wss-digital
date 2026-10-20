import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { M, fmt, tex } from '../../daten_und_zufall/lernpfad/kit'
import { CardHead } from '../../lineare_funktionen/lernsituation_kit/kit'
import './chat.css'

// Gemeinsame Bausteine der Zinseszins-Lernsituation (Teil 1 und Teil 2): Chat-Look, Festlegung per Regler,
// Zahlenhelfer, Wachstumsgraph, Stopp-Kasten, „So haben andere gedacht“ und Kriterienliste für das Lernprodukt.

/* ── Zahlen ──────────────────────────────────────────────────────────────── */

/** Zinsfaktor q aus dem Zinssatz p in Prozent */
export const faktor = (p: number) => 1 + p / 100
/** Endkapital nach n Jahren mit Zinseszins */
export const kn = (k0: number, p: number, n: number) => k0 * faktor(p) ** n
/** Kapital nach n Jahren, wenn die Zinsen jedes Jahr ausgezahlt werden (einfacher Zins) */
export const knEinfach = (k0: number, p: number, n: number) => k0 + ((k0 * p) / 100) * n

/** Eurobetrag als Text, z. B. „6.719,58 €“ */
export const eur = (x: number) => `${fmt(x, 2, true)} €`
/** Eurobetrag für KaTeX, z. B. „6719{,}58\text{ €}“ (ohne Tausenderpunkt, wie in den anderen Lernsituationen) */
export const eurTex = (x: number) => `${tex(x, 2, true).replace(/\./g, '')}\\text{ €}`
/** Zahl ohne Tausenderpunkt für KaTeX */
export const zt = (x: number, d = 2) => tex(x, d).replace(/\./g, '')

/* ── Chat ────────────────────────────────────────────────────────────────── */

export type Sprecher = 'mira' | 'jonas' | 'du'
const NAME: Record<Sprecher, string> = { mira: 'Mira', jonas: 'Jonas', du: 'Du' }
const INITIAL: Record<Sprecher, string> = { mira: 'M', jonas: 'J', du: 'Du' }

export function Chat({ children }: { children: ReactNode }) {
  return (
    <div className="zz-chat">
      <div className="zz-chat-head">
        <span className="zz-avatar zz-avatar-mira" aria-hidden="true">
          <i className="fa-solid fa-users" />
        </span>
        <div>
          <div className="zz-chat-title">Gruppenchat „Gewinnspiel“</div>
          <div className="zz-chat-sub">Jonas, Mira, Du</div>
        </div>
      </div>
      <div className="zz-chat-body" role="log" aria-label="Chatverlauf">
        {children}
      </div>
    </div>
  )
}

export function Msg({ who, children }: { who: Sprecher; children: ReactNode }) {
  return (
    <div className={`zz-msg zz-msg-${who}`}>
      <span className={`zz-avatar zz-avatar-${who}`} aria-hidden="true">
        {INITIAL[who]}
      </span>
      <div className="zz-bubble">
        <span className="zz-who">{NAME[who]}</span>
        {children}
      </div>
    </div>
  )
}

/* ── Leitfrage, Stopp, Wege, Kriterien ───────────────────────────────────── */

export function Frage({ children }: { children: ReactNode }) {
  return (
    <div className="ls-question">
      <i className="fa-solid fa-circle-question" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function Stopp({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <div className="ls-stop">
      <div className="ls-stop-title">
        <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: {title}
      </div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  )
}

/** „So haben andere gedacht“: aufklappbare Lösungswege zum Vergleichen (für selbstständiges Arbeiten ohne Lehrkraft) */
export function Wege({ items }: { items: { summary: ReactNode; body: ReactNode }[] }) {
  return (
    <div className="ls-ways">
      {items.map((w, i) => (
        <details key={i} className="ls-way">
          <summary>{w.summary}</summary>
          <div className="ls-way-body">{w.body}</div>
        </details>
      ))}
    </div>
  )
}

export function Kriterien({ intro, items }: { intro: ReactNode; items: string[] }) {
  return (
    <div className="lp-ex bk-panel">
      <CardHead title="Dein Lernprodukt: Concept Map" />
      {intro}
      <div className="ls-criteria">
        {items.map((c) => (
          <label key={c}>
            <input type="checkbox" /> <span>{c}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

/* ── Festlegung per Regler ───────────────────────────────────────────────── */

export function Festlegung({
  title = 'Deine Vermutung',
  frage,
  min,
  max,
  step,
  einheit,
  value,
  onChange,
  saved,
  onSave,
  onReset,
  savedText,
}: {
  title?: string
  frage: ReactNode
  min: number
  max: number
  step: number
  einheit: string
  value: number
  onChange: (v: number) => void
  saved: boolean
  onSave: () => void
  onReset: () => void
  savedText: ReactNode
}) {
  const id = useId()
  return (
    <div className="lp-ex bk-panel" data-no-autocheck>
      <CardHead title={title} />
      {saved ? (
        <>
          <div className="ls-saved" role="status">
            <i className="fa-solid fa-lock" aria-hidden="true" /> {savedText}
          </div>
          <div>
            <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onReset}>
              Vermutung ändern
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="lp-ex-prompt">
            <p>{frage}</p>
          </div>
          <div className="ls-slider">
            <label htmlFor={id}>
              Meine Schätzung: <span className="ls-slider-value">{fmt(value, 0)}</span> {einheit}
            </label>
            <input
              id={id}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
            />
          </div>
          <div className="bk-actions lp-ex-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={onSave}>
              <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festlegen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Wachstumsgraph: Jonas (Zinsen ausgezahlt) gegen Mira (Zinsen bleiben) ── */

const G = { w: 680, h: 330, l: 66, r: 16, t: 14, b: 40, yMax: 13000 }

export function WachstumGraph({ k0, p, nMax = 30, startN = 10 }: { k0: number; p: number; nMax?: number; startN?: number }) {
  const id = useId()
  const [n, setN] = useState(startN)
  const x = (v: number) => G.l + (v / nMax) * (G.w - G.l - G.r)
  const y = (v: number) => G.h - G.b - (v / G.yMax) * (G.h - G.t - G.b)
  const jahre = Array.from({ length: nMax + 1 }, (_, i) => i)
  const linieMira = jahre.map((j) => `${x(j)},${y(kn(k0, p, j))}`).join(' ')
  const linieJonas = jahre.map((j) => `${x(j)},${y(knEinfach(k0, p, j))}`).join(' ')
  const mira = kn(k0, p, n)
  const jonas = knEinfach(k0, p, n)
  return (
    <div className="lp-ex bk-panel">
      <div className="lp-ex-prompt">
        <p>Schiebe den Regler und beobachte, wie sich beide Konten entwickeln. Achte auf den Abstand der Linien.</p>
      </div>
      <div className="bk-graph ls-graph zz-graph">
        <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Graph: Kapital von Jonas (gerade Linie) und Mira (steigende Kurve) über die Jahre">
          {[0, 5000, 10000].map((v) => (
            <g key={v}>
              <line x1={G.l} x2={G.w - G.r} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
              <text x={G.l - 8} y={y(v) + 6} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
                {fmt(v, 0)}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25, 30].filter((v) => v <= nMax).map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1={y(0)} y2={y(G.yMax)} stroke="var(--grid)" />
              <text x={x(v)} y={y(0) + 24} textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          <text x={G.w - G.r} y={y(0) + 38} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
            Jahre
          </text>
          <text x={G.l + 6} y={G.t + 12} fontSize="14" fill="var(--ink-muted)">
            Kapital in €
          </text>
          <line x1={G.l} x2={G.l} y1={y(0)} y2={y(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          <line x1={G.l} x2={G.w - G.r} y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth="2" />
          <polyline points={linieJonas} fill="none" stroke="var(--hint)" strokeWidth="3.5" strokeDasharray="9 5" />
          <polyline points={linieMira} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
          <line x1={x(n)} x2={x(n)} y1={y(0)} y2={y(Math.max(mira, jonas))} stroke="var(--ink)" strokeDasharray="4 4" />
          <circle cx={x(n)} cy={y(jonas)} r="7" fill="var(--hint)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx={x(n)} cy={y(mira)} r="7" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        </svg>
      </div>
      <div className="zz-legend">
        <span className="zz-legend-mira">
          <i /> Mira (Zinsen bleiben auf dem Konto)
        </span>
        <span className="zz-legend-jonas">
          <i style={{ borderTopStyle: 'dashed' }} /> Jonas (Zinsen werden ausgezahlt)
        </span>
      </div>
      <div className="ls-slider">
        <label htmlFor={id}>
          Laufzeit <M>n</M> = <span className="ls-slider-value">{n}</span> Jahre
        </label>
        <input id={id} type="range" min={1} max={nMax} step={1} value={n} onChange={(e: ChangeEvent<HTMLInputElement>) => setN(Number(e.target.value))} />
      </div>
      <div className="ls-readout ls-readout-3">
        <div className="ls-readout-box ls-readout-f">
          <strong>Mira:</strong> <M>{`K_{${n}} = ${zt(k0, 0)} \\cdot ${zt(faktor(p), 2)}^{${n}} = ${eurTex(mira)}`}</M>
        </div>
        <div className="ls-readout-box ls-readout-g">
          <strong>Jonas:</strong> <M>{`${zt(k0, 0)} + ${n} \\cdot ${zt((k0 * p) / 100, 0)} = ${eurTex(jonas)}`}</M>
        </div>
        <div className="ls-readout-box ls-readout-h">
          <strong>Vorsprung von Mira:</strong> {eur(mira - jonas)}
        </div>
      </div>
    </div>
  )
}
