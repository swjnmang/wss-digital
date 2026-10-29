import { useEffect, useRef, useState } from 'react'
import { fmt } from '../../lernpfad/kit'
import { PUNKTE, usePunkteAufgabe } from '../../../lineare_funktionen/lernsituation_kit/punkte'
import { FELDER, FELD_NAME, Gluecksrad, type Feld } from './GluecksradBilder'

// „Problem erkennen“: Das Glücksrad der SMV zum Ausprobieren. Jeder Dreh landet in der Strichliste, der Graph zeigt, wie sich die
// relative Häufigkeit für „Gewinn“ nach und nach entwickelt. Ab 50 Drehungen ist das Ausprobieren erledigt. Die berechnete
// Wahrscheinlichkeit verrät nichts davon.

const MIN_DREHUNGEN = 50
const MAX_VERLAUF = 400

export type Zaehlung = { n: number; gewinne: number }

const reduziert = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Verlauf({ verlauf }: { verlauf: number[] }) {
  const n = verlauf.length
  const maxX = Math.max(50, n)
  const x = (i: number) => 60 + (i / maxX) * 620
  const y = (h: number) => 20 + (1 - h) * 170
  const punkte = verlauf.map((h, i) => `${x(i + 1)},${y(h)}`).join(' ')
  return (
    <svg
      viewBox="0 0 720 250"
      role="img"
      aria-label={`Graph: relative Häufigkeit für Gewinn nach jeder der ${n} Drehungen. Zu Beginn schwankt die Linie stark, später wird sie ruhiger.`}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((h) => (
        <g key={h}>
          <line x1="60" x2="690" y1={y(h)} y2={y(h)} stroke="var(--line)" strokeWidth="1.5" />
          <text x="52" y={y(h) + 5} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
            {h * 100} %
          </text>
        </g>
      ))}
      <line x1="60" x2="60" y1="20" y2="190" stroke="var(--ink)" strokeWidth="2" />
      <line x1="60" x2="690" y1="190" y2="190" stroke="var(--ink)" strokeWidth="2" />
      {[0, 0.5, 1].map((t) => (
        <text key={t} x={60 + t * 620} y="212" textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
          {Math.round(t * maxX)}
        </text>
      ))}
      <text x="375" y="238" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
        Anzahl der Drehungen
      </text>
      <polyline points={punkte} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

export default function GluecksradLabor({ onZaehlung, onGenug }: { onZaehlung: (z: Zaehlung) => void; onGenug: () => void }) {
  const [anzahl, setAnzahl] = useState<Record<Feld, number>>({ H: 0, T: 0, N: 0 })
  const [verlauf, setVerlauf] = useState<number[]>([])
  const [winkel, setWinkel] = useState(0)
  const [animiert, setAnimiert] = useState(false)
  const [dreht, setDreht] = useState(false)
  const [letztes, setLetztes] = useState<Feld | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const gemeldet = useRef(false)

  const n = anzahl.H + anzahl.T + anzahl.N
  const gewinne = anzahl.H + anzahl.T

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    onZaehlung({ n, gewinne })
    if (n >= MIN_DREHUNGEN && !gemeldet.current) {
      gemeldet.current = true
      pt.geloest()
      onGenug()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, gewinne])

  /** Dreht k-mal; nur bei einem einzelnen Dreh läuft die Animation */
  const drehe = (k: number) => {
    if (dreht) return
    const neu = { ...anzahl }
    let g = gewinne
    let m = n
    const h: number[] = []
    let feld = 0
    for (let i = 0; i < k; i++) {
      feld = Math.floor(Math.random() * 12)
      const art = FELDER[feld]
      neu[art] += 1
      m += 1
      if (art !== 'N') g += 1
      h.push(g / m)
    }
    // Rad so drehen, dass das gewürfelte Feld unter dem Zeiger liegt
    const ziel = -(feld * 30 + 15)
    const aktuell = ((winkel % 360) + 360) % 360
    const delta = ((ziel - aktuell) % 360 + 360) % 360
    const animation = k === 1 && !reduziert()
    setAnimiert(animation)
    setWinkel(winkel + delta + (animation ? 720 : 0))
    const fertig = () => {
      setAnzahl(neu)
      setVerlauf((v) => [...v, ...h].slice(-MAX_VERLAUF))
      setLetztes(FELDER[feld])
      setDreht(false)
    }
    if (animation) {
      setDreht(true)
      timer.current = window.setTimeout(fertig, 1250)
    } else fertig()
  }

  const neuBeginnen = () => {
    setAnzahl({ H: 0, T: 0, N: 0 })
    setVerlauf([])
    setLetztes(null)
  }

  const zeile = (art: Feld) => (
    <tr key={art}>
      <th scope="row">{FELD_NAME[art]}</th>
      <td>{anzahl[art]}</td>
      <td>{n ? `${fmt((anzahl[art] / n) * 100, 1)} %` : '–'}</td>
    </tr>
  )

  return (
    <div className="gr-labor" data-no-autocheck>
      <div className="zk-bild gr-rad">
        <Gluecksrad winkel={winkel} animiert={animiert} />
      </div>
      <div className="bk-actions gr-steuer">
        <button type="button" className="bk-btn bk-btn-primary" onClick={() => drehe(1)} disabled={dreht}>
          <i className="fa-solid fa-rotate-right" aria-hidden="true" /> 1-mal drehen
        </button>
        <button type="button" className="bk-btn" onClick={() => drehe(10)} disabled={dreht}>
          10-mal drehen
        </button>
        <button type="button" className="bk-btn" onClick={() => drehe(50)} disabled={dreht}>
          50-mal drehen
        </button>
        <button type="button" className="bk-btn bk-btn-ghost" onClick={neuBeginnen} disabled={dreht || n === 0}>
          Neu beginnen
        </button>
      </div>
      <p className="sl-text gr-status" role="status" aria-live="polite">
        {letztes && <>Letzter Dreh: <strong>{FELD_NAME[letztes]}</strong>. </>}
        {n >= MIN_DREHUNGEN ? (
          <>Du hast {n}-mal gedreht. Das reicht, um dich festzulegen.</>
        ) : (
          <>Dreh insgesamt mindestens {MIN_DREHUNGEN}-mal ({n} von {MIN_DREHUNGEN}).</>
        )}
      </p>
      <table className="gr-tabelle">
        <caption>Strichliste nach {n} Drehungen</caption>
        <thead>
          <tr>
            <th scope="col">Ergebnis</th>
            <th scope="col">Anzahl</th>
            <th scope="col">Anteil an allen Drehungen</th>
          </tr>
        </thead>
        <tbody>
          {(['H', 'T', 'N'] as Feld[]).map(zeile)}
          <tr className="gr-summe">
            <th scope="row">Gewinn (Hauptgewinn oder Trostpreis)</th>
            <td>{gewinne}</td>
            <td>{n ? `${fmt((gewinne / n) * 100, 1)} %` : '–'}</td>
          </tr>
        </tbody>
      </table>
      {verlauf.length >= 2 && (
        <div className="zk-bild">
          <Verlauf verlauf={verlauf} />
        </div>
      )}
    </div>
  )
}
