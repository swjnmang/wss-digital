import { useState } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'

// Bonus-Spiel „Scheitel-Jagd“ am Ende der Lernsituation „Das Lichtwerk“: Zu einer Parabel in allgemeiner Form leuchten vier Punkte auf.
// Nur einer ist der Scheitelpunkt. Die SuS berechnen x_S = −b/(2a) und y_S und tippen den richtigen Punkt an.
// Die falschen Punkte sind typische Fehler: Vorzeichen von b nicht umgedreht, nur durch a statt durch 2a geteilt, c als y_S genommen.
// Vier Runden, jede richtige Antwort bringt eine Münze (je 2 Punkte, zusammen höchstens 8 wie die beste Übungsaufgabe).

type Art = 'richtig' | 'vorzeichen' | 'nenner' | 'c'
type Ziel = { x: number; y: number; art: Art }
type Runde = { a: number; b: number; c: number; ziele: Ziel[] }
type Phase = 'start' | 'wahl' | 'ergebnis' | 'ende'
const RUNDEN = 4
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

function neueRunde(): Runde {
  for (;;) {
    const a = pick([1, -1, 2, -2, 0.5])
    const xs = pick([-3, -2, -1, 1, 2, 3])
    const b = -2 * a * xs
    const c = pick([-3, -1, 1, 2, 4])
    const f = (x: number) => a * x * x + b * x + c
    const ziele: Ziel[] = [
      { x: xs, y: f(xs), art: 'richtig' },
      { x: -xs, y: f(-xs), art: 'vorzeichen' },
      { x: -b / a, y: f(-b / a), art: 'nenner' },
      { x: xs, y: c, art: 'c' },
    ]
    const verschieden = ziele.every((z, i) => ziele.every((w, j) => i === j || z.x !== w.x || z.y !== w.y))
    if (verschieden && b !== 0) return { a, b, c, ziele: mischen(ziele) }
  }
}

const parabelTex = (r: Runde) => {
  const a = r.a === 1 ? '' : r.a === -1 ? '-' : tx(r.a)
  const b = r.b === 1 ? '+ x' : r.b === -1 ? '- x' : `${r.b < 0 ? '-' : '+'} ${tx(Math.abs(r.b))}x`
  const c = `${r.c < 0 ? '-' : '+'} ${tx(Math.abs(r.c))}`
  return `y = ${a}x^2 ${b} ${c}`
}
const zahl = (v: number) => tx(v)

const ERKLAERUNG: Record<Art, string> = {
  richtig: 'Getroffen! Das ist der Scheitelpunkt.',
  vorzeichen: 'Hier wurde das Vorzeichen von b nicht umgedreht. Es gilt x_S = −b : (2a).',
  nenner: 'Hier wurde nur durch a geteilt. Im Nenner steht 2a.',
  c: 'Der x-Wert stimmt, aber y_S ist nicht einfach c. Setze x_S in die Gleichung ein.',
}

export default function ScheitelJagd() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [muenzen, setMuenzen] = useState(0)
  const meldeSpiel = useSpielPunkte()

  const waehle = (i: number) => {
    if (phase !== 'wahl') return
    setWahl(i)
    if (runde.ziele[i].art === 'richtig') setMuenzen((m) => m + 1)
    setPhase('ergebnis')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde(neueRunde())
    setWahl(null)
    setPhase('wahl')
  }
  const nochmal = () => {
    setNr(0)
    setMuenzen(0)
    setRunde(neueRunde())
    setWahl(null)
    setPhase('start')
  }
  const gewaehlt = wahl !== null ? runde.ziele[wahl] : null

  return (
    <div className="sj-spiel">
      <div className="sj-kopf">
        <span>
          Runde {Math.min(nr + 1, RUNDEN)} von {RUNDEN}
        </span>
        <span aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins ${i < muenzen ? 'sj-muenze-an' : 'sj-muenze-aus'}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <div className="sj-text">
          <p>In jeder Runde leuchten vier Punkte auf, nur einer ist der Scheitelpunkt der Parabel. Berechne ihn und tippe den richtigen Punkt an.</p>
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            Spiel starten
          </button>
        </div>
      )}
      {(phase === 'wahl' || phase === 'ergebnis') && (
        <>
          <p className="sj-gleichung">
            Parabel: <M>{parabelTex(runde)}</M>
          </p>
          <div className="sj-ziele" role="group" aria-label="Welcher Punkt ist der Scheitelpunkt?">
            {runde.ziele.map((z, i) => (
              <button
                key={i}
                type="button"
                className={`bk-btn ${phase === 'ergebnis' && z.art === 'richtig' ? 'sj-richtig' : phase === 'ergebnis' && i === wahl ? 'sj-falsch' : ''}`}
                disabled={phase !== 'wahl'}
                onClick={() => waehle(i)}
              >
                <M>{`(${zahl(z.x)} \\mid ${zahl(z.y)})`}</M>
              </button>
            ))}
          </div>
          {phase === 'ergebnis' && gewaehlt && (
            <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
              <p>{ERKLAERUNG[gewaehlt.art]}</p>
              <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                {nr + 1 >= RUNDEN ? 'Ergebnis ansehen' : 'Nächste Runde'}
              </button>
            </div>
          )}
        </>
      )}
      {phase === 'ende' && (
        <div className="sj-text">
          <p>
            <strong>
              {muenzen} von {RUNDEN} Scheitelpunkten gefunden.
            </strong>{' '}
            {muenzen === RUNDEN ? 'Perfekt!' : muenzen >= 2 ? 'Gut gemacht.' : 'Tipp: Erst x_S = −b : (2a), dann x_S einsetzen.'}
          </p>
          <button type="button" className="bk-btn" onClick={nochmal}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
          </button>
        </div>
      )}
    </div>
  )
}
