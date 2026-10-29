import { useEffect, useState } from 'react'
import { M, frac, gcd } from '../../lernpfad/kit'
import { useSpielPunkte } from '../../../lineare_funktionen/lernsituation_kit/punkte'
import { Sektoren } from './GluecksradBilder'

// Bonus-Spiel „Rad-Casino“: Vier Räder mit zufälliger Feldzahl. Zu jedem Rad gibt es eine Frage nach P(E) oder P(kein E) und drei
// Brüche zur Auswahl. Die falschen Brüche sind typische Fehler: Gegenereignis verwechselt, günstige zu ungünstigen Feldern
// (statt zu allen) ins Verhältnis gesetzt, nur ein Feld gezählt. Jede richtige Antwort bringt eine Münze.

const RUNDEN = 4

type Art = 'richtig' | 'gegen' | 'verhaeltnis' | 'einzel'
type Option = { z: number; n: number; art: Art }
type Aufgabe = { n: number; k: number; gegen: boolean; optionen: Option[] }

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const wert = (o: { z: number; n: number }) => o.z / o.n

function neueAufgabe(): Aufgabe {
  for (;;) {
    const n = pick([8, 10, 12])
    const k = pick([1, 2, 3, 4, 5].filter((v) => v < n - 1))
    const gegen = Math.random() < 0.4
    const richtig: Option = gegen ? { z: n - k, n, art: 'richtig' } : { z: k, n, art: 'richtig' }
    const kandidaten: Option[] = [
      gegen ? { z: k, n, art: 'gegen' } : { z: n - k, n, art: 'gegen' },
      { z: gegen ? n - k : k, n: gegen ? k : n - k, art: 'verhaeltnis' },
      { z: 1, n, art: 'einzel' },
    ]
    const falsche: Option[] = []
    for (const o of kandidaten) {
      if (Math.abs(wert(o) - wert(richtig)) < 1e-9) continue
      if (falsche.some((f) => Math.abs(wert(f) - wert(o)) < 1e-9)) continue
      falsche.push(o)
    }
    if (falsche.length < 2) continue
    const optionen = [richtig, ...falsche.sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5)
    return { n, k, gegen, optionen }
  }
}

const ERKLAERUNG: Record<Art, string> = {
  richtig: 'Richtig!',
  gegen: 'Das ist die Wahrscheinlichkeit des Gegenereignisses. Lies die Frage noch einmal genau.',
  verhaeltnis: 'Hier wurden die gesuchten Felder mit den übrigen Feldern verglichen. Im Nenner stehen immer alle Felder des Rades.',
  einzel: 'Das wäre die Wahrscheinlichkeit für ein einziges bestimmtes Feld. Zähle alle gesuchten Felder.',
}

const texBruch = (o: { z: number; n: number }) => {
  const g = gcd(o.z, o.n)
  return o.n / g === 1 ? `${o.z / g}` : frac(o.z, o.n).replace('tfrac', 'dfrac')
}

export default function GluecksradSpiel() {
  const [runde, setRunde] = useState(0)
  const [aufgabe, setAufgabe] = useState<Aufgabe>(neueAufgabe)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const [muenzen, setMuenzen] = useState(0)
  const [ende, setEnde] = useState(false)
  const meldeSpiel = useSpielPunkte()

  useEffect(() => {
    if (ende) meldeSpiel(muenzen, RUNDEN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ende])

  const waehle = (i: number) => {
    if (gewaehlt !== null) return
    setGewaehlt(i)
    if (aufgabe.optionen[i].art === 'richtig') setMuenzen((m) => m + 1)
  }
  const weiter = () => {
    if (runde + 1 >= RUNDEN) return setEnde(true)
    setRunde(runde + 1)
    setAufgabe(neueAufgabe())
    setGewaehlt(null)
  }
  const nochmal = () => {
    setRunde(0)
    setMuenzen(0)
    setEnde(false)
    setGewaehlt(null)
    setAufgabe(neueAufgabe())
  }

  const { n, k, gegen, optionen } = aufgabe
  const richtigIndex = optionen.findIndex((o) => o.art === 'richtig')
  const gewaehlteArt = gewaehlt !== null ? optionen[gewaehlt].art : null

  return (
    <div className="gr-spiel" data-no-autocheck>
      <div className="gr-spiel-kopf">
        <span>{ende ? 'Geschafft!' : `Runde ${runde + 1} von ${RUNDEN}`}</span>
        <span className="gr-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' gr-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {!ende && (
        <>
          <p className="gr-spiel-frage">
            Das Rad hat <strong>{n}</strong> gleich große Felder. <strong>{k}</strong> davon sind golden. Das Rad wird einmal gedreht. Wie
            wahrscheinlich ist das Ereignis „{gegen ? 'nicht golden' : 'golden'}“?
          </p>
          <div className="zk-bild gr-spiel-bild">
            <svg viewBox="0 0 320 330" role="img" aria-label={`Glücksrad mit ${n} gleich großen Feldern, davon ${k} goldene.`}>
              <Sektoren cx={160} cy={175} r={140} n={n} farbe={(i) => (i < k ? 'var(--highlight)' : 'var(--primary-soft)')} />
              <circle cx="160" cy="175" r="16" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
              <polygon points="160,50 144,14 176,14" fill="var(--ink)" />
            </svg>
          </div>
          <div className="gr-wahl" role="group" aria-label="Wähle die richtige Wahrscheinlichkeit">
            {optionen.map((o, i) => (
              <button
                key={i}
                type="button"
                className={`bk-btn${gewaehlt === null ? '' : o.art === 'richtig' ? ' gr-richtig' : gewaehlt === i ? ' gr-falsch' : ''}`}
                aria-pressed={gewaehlt === i}
                disabled={gewaehlt !== null}
                onClick={() => waehle(i)}
              >
                <M>{`P = ${texBruch(o)}`}</M>
              </button>
            ))}
          </div>
          {gewaehlteArt && (
            <>
              <div className={`bk-feedback lp-feedback ${gewaehlteArt === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <i className={`fa-solid ${gewaehlteArt === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
                <span>
                  {gewaehlteArt === 'richtig' ? 'Münze eingesammelt! ' : `${ERKLAERUNG[gewaehlteArt]} `}
                  Richtig ist <M>{`P = ${texBruch(optionen[richtigIndex])}`}</M>.
                </span>
              </div>
              <div className="bk-actions">
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {runde + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      )}
      {ende && (
        <>
          <p className="gr-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-dice'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Münzen
            eingesammelt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, du bist der Boss am Glücksrad!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
          </p>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={nochmal}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
            </button>
          </div>
        </>
      )}
    </div>
  )
}
