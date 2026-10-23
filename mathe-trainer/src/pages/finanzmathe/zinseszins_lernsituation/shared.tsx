import { useId, useState, type ChangeEvent } from 'react'
import { M, fmt, tex } from '../../daten_und_zufall/lernpfad/kit'
import './zinseszins.css'

// Gemeinsame Bausteine der beiden Zinseszins-Lernsituationen („Wer hat nach 10 Jahren mehr?“ und „Miras drei Fragen“):
// Zahlenhelfer und der Wachstumsgraph (Jonas: Zinsen ausgezahlt, Mira: Zinsen bleiben auf dem Konto).

/* ── Zahlen ──────────────────────────────────────────────────────────────── */

/** Zinsfaktor q aus dem Zinssatz p in Prozent */
export const faktor = (p: number) => 1 + p / 100
/** Endkapital nach n Jahren mit Zinseszins */
export const kn = (k0: number, p: number, n: number) => k0 * faktor(p) ** n
/** Kapital nach n Jahren, wenn die Zinsen jedes Jahr ausgezahlt werden (einfacher Zins) */
export const knEinfach = (k0: number, p: number, n: number) => k0 + ((k0 * p) / 100) * n

/** Eurobetrag als Text, z. B. „6.719,58 €“ */
export const eur = (x: number) => `${fmt(x, 2, true)} €`
/** Eurobetrag für KaTeX, z. B. „6719{,}58\text{ €}“ (ohne Tausenderpunkt) */
export const eurTex = (x: number) => `${tex(x, 2, true).replace(/\./g, '')}\\text{ €}`
/** Zahl ohne Tausenderpunkt für KaTeX */
export const zt = (x: number, d = 2) => tex(x, d).replace(/\./g, '')

/* ── Wachstumsgraph ──────────────────────────────────────────────────────── */

const G = { w: 680, h: 300, l: 72, r: 16, t: 14, b: 44, yMax: 13000 }

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
    <div className="zz-wachstum">
      <div className="zk-bild">
        <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Graph: Kapital von Jonas (gerade Linie) und Mira (steigende Kurve) über die Jahre">
          {[0, 5000, 10000].map((v) => (
            <g key={v}>
              <line x1={G.l} x2={G.w - G.r} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
              <text x={G.l - 8} y={y(v) + 6} textAnchor="end" fontSize="18" fill="var(--ink-muted)">
                {fmt(v, 0)}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25, 30]
            .filter((v) => v <= nMax)
            .map((v) => (
              <g key={v}>
                <line x1={x(v)} x2={x(v)} y1={y(0)} y2={y(G.yMax)} stroke="var(--grid)" />
                <text x={x(v)} y={y(0) + 24} textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
                  {v}
                </text>
              </g>
            ))}
          <text x={G.w - G.r} y={y(G.yMax) + 18} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
            x: Jahre, y: Kapital in €
          </text>
          <line x1={G.l} x2={G.l} y1={y(0)} y2={y(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          <line x1={G.l} x2={G.w - G.r} y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth="2" />
          <polyline points={linieJonas} fill="none" stroke="var(--ink-muted)" strokeWidth="3.5" strokeDasharray="9 5" />
          <polyline points={linieMira} fill="none" stroke="var(--primary)" strokeWidth="4.5" strokeLinecap="round" />
          <line x1={x(n)} x2={x(n)} y1={y(0)} y2={y(Math.max(mira, jonas))} stroke="var(--ink)" strokeDasharray="4 4" />
          <circle cx={x(n)} cy={y(jonas)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
          <circle cx={x(n)} cy={y(mira)} r="8" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        </svg>
      </div>
      <div className="zz-legende">
        <span>
          <i className="zz-linie-mira" /> Mira: Zinsen bleiben auf dem Konto
        </span>
        <span>
          <i className="zz-linie-jonas" /> Jonas: Zinsen werden ausgezahlt
        </span>
      </div>
      <div className="ls-slider">
        <label htmlFor={id}>
          Laufzeit <M>n</M> = <span className="ls-slider-value">{n}</span> Jahre
        </label>
        <input id={id} type="range" min={1} max={nMax} step={1} value={n} onChange={(e: ChangeEvent<HTMLInputElement>) => setN(Number(e.target.value))} />
      </div>
      <p className="sl-text">
        Mira: <strong>{eur(mira)}</strong>, Jonas: <strong>{eur(jonas)}</strong>, Vorsprung von Mira: <strong>{eur(mira - jonas)}</strong>
      </p>
    </div>
  )
}
