import { useState, type ReactNode } from 'react'
import { useSpielPunkte } from './punkte'
import './auswahlspiel.css'

// Bonus-Spiel-Baustein „Auswahl-Spiel“: In jeder Runde eine kurze Rechenaufgabe und drei oder vier Ziele (Tresore, Tore, Säcke …).
// Genau ein Ziel ist richtig, die anderen bilden typische Fehler ab und werden nach dem Tippen erklärt. Jede richtige Runde bringt
// eine Münze (je 2 Punkte über useSpielPunkte, nur das beste Ergebnis zählt). Keine Zeitnot, Tablet zuerst (große Knöpfe).
// Nutzung: <AuswahlSpiel neueRunden={() => [...]} symbol="fa-vault" start="…" />, jede Runde: { frage, ziele: [{ text, richtig?, erklaerung }] }.

export type AuswahlZiel = { text: ReactNode; richtig?: boolean; erklaerung: ReactNode }
export type AuswahlRunde = { frage: ReactNode; ziele: AuswahlZiel[] }

export const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
export const zufall = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

export default function AuswahlSpiel({
  neueRunden,
  start,
  symbol = 'fa-coins',
  lob = 'Perfekt!',
  tipp,
}: {
  /** erzeugt die Runden eines Durchgangs (meist 4) */
  neueRunden: () => AuswahlRunde[]
  /** Einleitung vor dem Start */
  start: ReactNode
  /** Font-Awesome-Symbol auf den Zielen */
  symbol?: string
  lob?: string
  /** Tipp am Ende, wenn weniger als die Hälfte richtig war */
  tipp: ReactNode
}) {
  const [phase, setPhase] = useState<'start' | 'wahl' | 'ergebnis' | 'ende'>('start')
  const [runden, setRunden] = useState(neueRunden)
  const [nr, setNr] = useState(0)
  const [wahl, setWahl] = useState<number | null>(null)
  const [muenzen, setMuenzen] = useState(0)
  const meldeSpiel = useSpielPunkte()
  const anzahl = runden.length
  const r = runden[nr]

  const waehle = (i: number) => {
    if (phase !== 'wahl') return
    setWahl(i)
    if (r.ziele[i].richtig) setMuenzen((m) => m + 1)
    setPhase('ergebnis')
  }
  const weiter = () => {
    if (nr + 1 >= anzahl) {
      meldeSpiel(muenzen, anzahl)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setWahl(null)
    setPhase('wahl')
  }
  const nochmal = () => {
    setRunden(neueRunden())
    setNr(0)
    setWahl(null)
    setMuenzen(0)
    setPhase('start')
  }
  const gewaehlt = wahl !== null ? r.ziele[wahl] : null

  return (
    <div className="as-spiel">
      <div className="as-kopf">
        <span>
          Runde {Math.min(nr + 1, anzahl)} von {anzahl}
        </span>
        <span aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: anzahl }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins ${i < muenzen ? 'as-muenze-an' : 'as-muenze-aus'}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <div className="as-text">
          <div>{start}</div>
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            Spiel starten
          </button>
        </div>
      )}
      {(phase === 'wahl' || phase === 'ergebnis') && (
        <>
          <div className="as-frage">{r.frage}</div>
          <div className="as-ziele" role="group" aria-label="Wähle die richtige Antwort">
            {r.ziele.map((z, i) => (
              <button
                key={i}
                type="button"
                className={`bk-btn as-ziel ${phase === 'ergebnis' && z.richtig ? 'as-richtig' : phase === 'ergebnis' && i === wahl ? 'as-falsch' : ''}`}
                disabled={phase !== 'wahl'}
                onClick={() => waehle(i)}
              >
                <i className={`fa-solid ${symbol}`} aria-hidden="true" />
                <span>{z.text}</span>
              </button>
            ))}
          </div>
          {phase === 'ergebnis' && gewaehlt && (
            <div className={`bk-feedback lp-feedback ${gewaehlt.richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
              <div>{gewaehlt.erklaerung}</div>
              <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                {nr + 1 >= anzahl ? 'Ergebnis ansehen' : 'Nächste Runde'}
              </button>
            </div>
          )}
        </>
      )}
      {phase === 'ende' && (
        <div className="as-text">
          <p>
            <strong>
              {muenzen} von {anzahl} Runden richtig.
            </strong>{' '}
            {muenzen === anzahl ? lob : muenzen * 2 >= anzahl ? 'Gut gemacht.' : tipp}
          </p>
          <button type="button" className="bk-btn" onClick={nochmal}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
          </button>
        </div>
      )}
    </div>
  )
}
