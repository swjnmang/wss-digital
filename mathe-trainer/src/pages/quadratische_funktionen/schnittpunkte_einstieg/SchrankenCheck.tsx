import { useState } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'

// Bonus-Spiel „Schranken-Check“ am Ende der Lernsituation „Der Skatepark“: In jeder Runde gibt es eine Sprungbahn (Parabel) und eine
// Lichtschranke (Gerade). Die SuS setzen gleich, berechnen die Zahl unter der Wurzel der Mitternachtsformel und tippen auf das Tor
// „2-mal“, „1-mal“ oder „gar nicht“. Erst danach werden Bahn und Schranke gezeichnet und die Zahl unter der Wurzel aufgelöst.
// Vier Runden, jede richtige Antwort bringt eine Münze (je 2 Punkte, zusammen höchstens 8 wie die beste Übungsaufgabe).

type Runde = { a: number; b: number; c: number; m: number; t: number }
type Phase = 'start' | 'wahl' | 'ergebnis' | 'ende'
const RUNDEN = 4
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

/** Zahl unter der Wurzel nach dem Gleichsetzen: a·x² + (b − m)·x + (c − t) = 0 */
const wurzel = (r: Runde) => (r.b - r.m) ** 2 - 4 * r.a * (r.c - r.t)
const anzahl = (r: Runde) => {
  const d = wurzel(r)
  return Math.abs(d) < 1e-9 ? 1 : d > 0 ? 2 : 0
}

function neueRunde(soll: number): Runde {
  for (;;) {
    const a = pick([-1, -0.5, -0.25])
    const b = pick([0, 1, 2])
    const c = pick([2, 3, 4])
    const m = pick([-1, -0.5, 0, 0.5])
    // t so wählen, dass die gewünschte Anzahl entsteht: Berührung bei d = 0 ⇔ t = c + (b − m)² / (4a)
    const tBer = c + (b - m) ** 2 / (4 * a)
    const t = soll === 1 ? tBer : soll === 2 ? tBer - pick([1, 1.5, 2]) : tBer + pick([0.5, 1, 1.5])
    const r = { a, b, c, m, t: Math.round(t * 100) / 100 }
    if (Math.abs(r.t * 4 - Math.round(r.t * 4)) < 1e-9 && anzahl(r) === soll && Math.abs(r.t) <= 8) return r
  }
}
const neueRunden = () => [2, 1, 0, pick([0, 1, 2])].sort(() => Math.random() - 0.5).map(neueRunde)

const parabelTex = (r: Runde) => `y = ${r.a === -1 ? '-' : tx(r.a)}x^2${r.b ? ` + ${r.b === 1 ? '' : tx(r.b)}x` : ''} + ${tx(r.c)}`
const geradeTex = (r: Runde) => {
  const mx = r.m === 0 ? '' : `${r.m === 1 ? '' : r.m === -1 ? '-' : tx(r.m)}x`
  if (!mx) return `y = ${tx(r.t)}`
  return `y = ${mx} ${r.t < 0 ? '-' : '+'} ${tx(Math.abs(r.t))}`
}

const G = { w: 680, h: 300, xMin: -5, xMax: 7, yMin: -3, yMax: 8 }
const gx = (x: number) => ((x - G.xMin) / (G.xMax - G.xMin)) * G.w
const gy = (y: number) => G.h - ((y - G.yMin) / (G.yMax - G.yMin)) * G.h
const TORE = [
  { n: 2, text: '2-mal' },
  { n: 1, text: '1-mal' },
  { n: 0, text: 'gar nicht' },
]

export default function SchrankenCheck() {
  const [phase, setPhase] = useState<Phase>('start')
  const [runden, setRunden] = useState<Runde[]>(neueRunden)
  const [nr, setNr] = useState(0)
  const [wahl, setWahl] = useState<number | null>(null)
  const [muenzen, setMuenzen] = useState(0)
  const meldeSpiel = useSpielPunkte()
  const r = runden[nr]

  const waehle = (n: number) => {
    if (phase !== 'wahl') return
    setWahl(n)
    if (n === anzahl(r)) setMuenzen((m) => m + 1)
    setPhase('ergebnis')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      meldeSpiel(muenzen, RUNDEN)
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
  const kurve = Array.from({ length: 121 }, (_, i) => G.xMin + (i / 120) * (G.xMax - G.xMin))
    .map((x) => `${gx(x)},${gy(r.a * x * x + r.b * x + r.c)}`)
    .join(' ')
  const d = wurzel(r)

  return (
    <div className="sk-spiel">
      <div className="sk-kopf">
        <span>
          Runde {Math.min(nr + 1, RUNDEN)} von {RUNDEN}
        </span>
        <span aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins ${i < muenzen ? 'sk-muenze-an' : 'sk-muenze-aus'}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <div className="sk-text">
          <p>
            In jeder Runde siehst du eine Sprungbahn und eine Lichtschranke. Setze die Terme gleich, berechne die Zahl unter der Wurzel und entscheide: Wie oft löst der Sprung
            die Schranke aus?
          </p>
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            Spiel starten
          </button>
        </div>
      )}
      {(phase === 'wahl' || phase === 'ergebnis') && (
        <>
          <p className="sk-gleichung">
            Sprungbahn: <M>{parabelTex(r)}</M>
            <br />
            Lichtschranke: <M>{geradeTex(r)}</M>
          </p>
          <div className="sk-tore" role="group" aria-label="Wie oft löst der Sprung die Schranke aus?">
            {TORE.map((t) => (
              <button
                key={t.n}
                type="button"
                className={`bk-btn ${phase === 'ergebnis' && t.n === anzahl(r) ? 'sk-richtig' : phase === 'ergebnis' && t.n === wahl ? 'sk-falsch' : ''}`}
                disabled={phase !== 'wahl'}
                onClick={() => waehle(t.n)}
              >
                {t.text}
              </button>
            ))}
          </div>
          {phase === 'ergebnis' && (
            <>
              <svg viewBox={`0 0 ${G.w} ${G.h}`} className="sk-feld" role="img" aria-label="Sprungbahn und Lichtschranke im Koordinatensystem">
                <rect width={G.w} height={G.h} fill="var(--primary-soft)" />
                <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="1.5" />
                <line x1={gx(0)} x2={gx(0)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
                <polyline points={kurve} fill="none" stroke="var(--primary)" strokeWidth="4" />
                <line x1={gx(G.xMin)} y1={gy(r.m * G.xMin + r.t)} x2={gx(G.xMax)} y2={gy(r.m * G.xMax + r.t)} stroke="var(--ink)" strokeWidth="3" strokeDasharray="12 7" />
              </svg>
              <div className={`bk-feedback lp-feedback ${wahl === anzahl(r) ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
                <p>
                  Unter der Wurzel steht <M>{tx(Math.round(d * 1000) / 1000)}</M>
                  {Math.abs(d) < 1e-9 ? ', also genau 0: Die Schranke berührt die Bahn einmal.' : d > 0 ? ': positiv, also zwei Schnittpunkte.' : ': negativ, also kein Schnittpunkt.'}
                </p>
                <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
                  {nr + 1 >= RUNDEN ? 'Ergebnis ansehen' : 'Nächste Runde'}
                </button>
              </div>
            </>
          )}
        </>
      )}
      {phase === 'ende' && (
        <div className="sk-text">
          <p>
            <strong>
              {muenzen} von {RUNDEN} Runden richtig.
            </strong>{' '}
            {muenzen === RUNDEN ? 'Perfekt!' : muenzen >= 2 ? 'Gut gemacht.' : 'Tipp: Bring alles auf eine Seite und rechne die Zahl unter der Wurzel aus.'}
          </p>
          <button type="button" className="bk-btn" onClick={nochmal}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
          </button>
        </div>
      )}
    </div>
  )
}
