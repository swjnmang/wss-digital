import { useEffect, useState, type ReactNode } from 'react'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'

// Gemeinsames Gerüst der beiden Bonus-Spiele zum Zinseszins („Münzturm-Duell“ und „Sanduhr-Check“): In jeder Runde gibt es eine
// Frage und vier Münzen mit Beträgen bzw. Werten. Nur eine ist richtig, die anderen bilden typische Fehler ab und bekommen nach der
// Runde eine kurze Erklärung. Jede richtige Münze bringt 2 Punkte (useSpielPunkte, nur das beste Ergebnis zählt).
// Bedienung: Münzen antippen (mindestens 48 px) oder Tasten 1 bis 4. Keine Zeitwertung. Das Bild zeigt den Fortschritt.

export type SpielOption = { text: string; richtig: boolean; grund: ReactNode }
export type SpielRunde = { frage: ReactNode; optionen: SpielOption[] }

/** Optionen mischen; die erste Münze ist nie die richtige (Regel für Auswahlen) */
export function mischen(optionen: SpielOption[]): SpielOption[] {
  const o = [...optionen].sort(() => Math.random() - 0.5)
  if (o[0].richtig) {
    const j = 1 + Math.floor(Math.random() * (o.length - 1))
    ;[o[0], o[j]] = [o[j], o[0]]
  }
  return o
}

export default function MuenzSpiel({
  runden: neueRunden,
  bild,
  lob,
  treffer,
}: {
  /** erzeugt die Runden einer Partie */
  runden: () => SpielRunde[]
  /** Spielbild zum Stand: richtige Münzen von allen Runden */
  bild: (muenzen: number, gesamt: number) => ReactNode
  /** Text am Ende */
  lob: (muenzen: number, gesamt: number) => ReactNode
  /** Rückmeldung bei einem Treffer */
  treffer: string
}) {
  const [runden, setRunden] = useState<SpielRunde[]>(neueRunden)
  const [nr, setNr] = useState(0)
  const [wahl, setWahl] = useState<number | null>(null)
  const [muenzen, setMuenzen] = useState(0)
  const [ende, setEnde] = useState(false)
  const melde = useSpielPunkte()
  const gesamt = runden.length
  const runde = runden[nr]

  const waehle = (i: number) => {
    if (wahl !== null || ende || i >= runde.optionen.length) return
    setWahl(i)
    if (runde.optionen[i].richtig) setMuenzen((m) => m + 1)
  }
  const weiter = () => {
    if (nr + 1 >= gesamt) {
      setEnde(true)
      melde(muenzen, gesamt)
      return
    }
    setNr(nr + 1)
    setWahl(null)
  }
  const nochmal = () => {
    setRunden(neueRunden())
    setNr(0)
    setWahl(null)
    setMuenzen(0)
    setEnde(false)
  }

  useEffect(() => {
    const taste = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      const z = Number(e.key)
      if (z >= 1 && z <= 4) waehle(z - 1)
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  })

  const richtig = runde.optionen.find((o) => o.richtig)
  return (
    <div className="zz-spiel" data-no-autocheck>
      <div className="zz-spiel-kopf">
        <span>{ende ? 'Geschafft!' : `Runde ${nr + 1} von ${gesamt}`}</span>
        <span className="zz-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: gesamt }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' zz-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {bild(muenzen, gesamt)}
      {ende ? (
        <>
          <p className="zz-spiel-ende">
            <i className="fa-solid fa-trophy" aria-hidden="true" /> {lob(muenzen, gesamt)}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="zz-spiel-frage">{runde.frage}</div>
          <div className="zz-spiel-wahl" role="group" aria-label="Wähle die richtige Münze">
            {runde.optionen.map((o, i) => (
              <button
                key={i}
                type="button"
                className={`zz-muenze${wahl !== null && o.richtig ? ' zz-muenze-richtig' : ''}${wahl === i && !o.richtig ? ' zz-muenze-falsch' : ''}`}
                disabled={wahl !== null}
                onClick={() => waehle(i)}
              >
                <small>{i + 1}</small>
                {o.text}
              </button>
            ))}
          </div>
          {wahl !== null && (
            <>
              <div className={`bk-feedback lp-feedback ${runde.optionen[wahl].richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <i className={`fa-solid ${runde.optionen[wahl].richtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
                <span>
                  {runde.optionen[wahl].richtig ? (
                    treffer
                  ) : (
                    <>
                      Leider nicht. {runde.optionen[wahl].grund} Richtig ist {richtig?.text}.
                    </>
                  )}
                </span>
              </div>
              <div className="bk-actions">
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {nr + 1 >= gesamt ? 'Ergebnis ansehen' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
