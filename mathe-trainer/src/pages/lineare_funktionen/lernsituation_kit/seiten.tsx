import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { PHASEN, type PhaseArt } from './phasen'
import './phasen.css'
import './seiten.css'

// Seitenansicht einer Lernsituation: zuerst eine Startbox, in der die SuS bestätigen, dass sie alle Rechenschritte im Heft
// dokumentieren. Danach genau eine Aufgabe pro Seite. „Weiter“ wird erst frei, wenn die Seite erledigt ist (fertig() wurde
// aufgerufen) oder die Seite als frei markiert ist (reine Info-Seiten). Alle Seiten bleiben eingehängt, damit Eingaben beim
// Zurückblättern erhalten bleiben. Jede Seite muss auf ein Tablet im Querformat passen (ohne Scrollen).

export type Seite = {
  art: PhaseArt
  titel: string
  /** Info-Seite: „Weiter“ ist sofort frei */
  frei?: boolean
  /** Hinweis, was zum Freischalten nötig ist (Standard: Aufgabe richtig lösen) */
  bedingung?: string
  inhalt: (fertig: () => void) => ReactNode
}

export function SeitenLernsituation({ ziel, seiten }: { ziel: ReactNode; seiten: Seite[] }) {
  const [bestaetigt, setBestaetigt] = useState(false)
  const [haken, setHaken] = useState(false)
  const [nr, setNr] = useState(0)
  const [erledigt, setErledigt] = useState<boolean[]>(() => seiten.map((s) => !!s.frei))

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [nr, bestaetigt])

  if (!bestaetigt) {
    return (
      <div className="sl-start">
        <div className="sl-start-icon">
          <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
        </div>
        <h2>Bevor es losgeht</h2>
        <p className="sl-start-ziel">{ziel}</p>
        <div className="sl-start-regel">
          <strong>Deine Arbeitsweise:</strong> Bearbeite jede Aufgabe in deinem Heft und schreibe dabei <strong>alle Rechenschritte</strong> vollständig auf, nicht nur
          das Ergebnis. Erst dann trägst du das Ergebnis hier ein und prüfst es.
        </div>
        <label className="sl-start-check">
          <input type="checkbox" checked={haken} onChange={(e: ChangeEvent<HTMLInputElement>) => setHaken(e.target.checked)} />
          <span>Ich dokumentiere bei jeder Aufgabe alle Rechenschritte schriftlich in meinem Heft.</span>
        </label>
        <button type="button" className="bk-btn bk-btn-primary" disabled={!haken} onClick={() => setBestaetigt(true)}>
          Bestätigen und starten <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const seite = seiten[nr]
  const phaseIdx = PHASEN.findIndex((p) => p.art === seite.art)
  const frei = erledigt[nr]
  const fertig = (i: number) => () => setErledigt((e) => (e[i] ? e : e.map((v, j) => (j === i ? true : v))))

  return (
    <div className="sl">
      <div className="sl-bar">
        <button type="button" className="bk-btn bk-btn-sm" disabled={nr === 0} onClick={() => setNr(nr - 1)} aria-label="Vorherige Seite">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>
        <ol className="sl-phasen" aria-label="Phasen der Lernsituation">
          {PHASEN.map((p, i) => (
            <li key={p.art} className={`et-bar-${p.art}${i === phaseIdx ? ' sl-on' : ''}${i < phaseIdx ? ' sl-done' : ''}`} aria-current={i === phaseIdx ? 'step' : undefined}>
              <span className="sl-no">{i < phaseIdx ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}</span>
              <span className="sl-name">{p.title}</span>
            </li>
          ))}
        </ol>
        <span className="sl-zaehler">
          Seite {nr + 1} von {seiten.length}
        </span>
        {nr < seiten.length - 1 && (
          <button
            type="button"
            className="bk-btn bk-btn-sm bk-btn-primary"
            disabled={!frei}
            title={frei ? undefined : seite.bedingung ?? 'Löse zuerst die Aufgabe richtig.'}
            onClick={() => setNr(nr + 1)}
          >
            Weiter <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
      {seiten.map((s, i) => (
        <section key={i} hidden={i !== nr} className={`sl-seite et-${s.art}`} aria-label={s.titel}>
          <div className="sl-kopf">
            <h2 className="sl-titel">
              <span className="sl-kicker">{PHASEN.find((p) => p.art === s.art)?.title}</span>
              {s.titel}
            </h2>
            {s.bedingung && !erledigt[i] && <p className="sl-sperre">{s.bedingung}</p>}
          </div>
          {s.inhalt(fertig(i))}
        </section>
      ))}
    </div>
  )
}

/** Zwei Spalten nebeneinander (ab Tablet-Breite), z. B. Grafik links und Aufgabe rechts */
export function ZweiSpalten({ links, rechts }: { links: ReactNode; rechts: ReactNode }) {
  return (
    <div className="sl-zwei">
      <div>{links}</div>
      <div>{rechts}</div>
    </div>
  )
}
