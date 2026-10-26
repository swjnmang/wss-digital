import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { glTex, type Gl } from './gleichungen'

// Bonus-Spiel „Ballon-Labor“ am Ende der Lernsituation „Das Gleichungs-Labor“: Über dem Labortisch schweben vier Ballons mit
// Lösungspaaren. Die SuS lösen das Gleichungssystem (oder machen mit den Ballons die Probe) und lassen den Ballon mit dem richtigen
// Lösungspaar platzen. Die falschen Ballons sind typische Fehler: Vorzeichen von x oder von y verdreht, x und y vertauscht.
// Jede Runde ein anderer Weg (subtrahieren, addieren, erst multiplizieren). Vier Runden, jeder richtige Ballon bringt eine Münze.
// Bedienung: Ballon antippen oder mit den Pfeiltasten wählen und Enter drücken. Keine Uhr, die Ballons schweben nur sanft.

type Fehler = 'richtig' | 'vorzeichenX' | 'vorzeichenY' | 'vertauscht'
type Ballon = { x: number; y: number; art: Fehler }
type Weg = 'sub' | 'add' | 'mult'
type Runde = { I: Gl; II: Gl; weg: Weg; ballons: Ballon[] }
type Phase = 'start' | 'wahl' | 'ergebnis' | 'ende'

const RUNDEN = 4 // 4 Münzen à 2 Punkte: das Spiel bringt nicht mehr als die größte Übungsaufgabe (8)
const W = 760
const H = 340
const BX = [110, 290, 470, 650]

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const paar = (b: { x: number; y: number }) => `(${tx(b.x)} \\mid ${tx(b.y)})`
const paarText = (b: { x: number; y: number }) => `(${b.x} | ${b.y})`.replace(/-/g, '−')

function neueRunde(weg: Weg): Runde {
  for (;;) {
    const x = pick([-3, -2, -1, 1, 2, 3, 4, 5])
    const y = pick([-3, -2, -1, 1, 2, 3, 4, 5])
    if (Math.abs(x) === Math.abs(y)) continue
    const a1 = pick([1, 2, 3, 4, 5])
    const a2 = pick([1, 2, 3, 4, 5])
    const b = pick([1, 2, 3, 4])
    let I: Gl
    let II: Gl
    if (weg === 'sub') {
      if (a1 === a2) continue
      I = { a: a1, b, c: 0 }
      II = { a: a2, b, c: 0 }
    } else if (weg === 'add') {
      I = { a: a1, b, c: 0 }
      II = { a: a2, b: -b, c: 0 }
    } else {
      // Gleichung II muss erst mit k multipliziert werden, damit vor y dieselbe Zahl steht
      const k = pick([2, 3])
      if (a1 === k * a2) continue
      I = { a: a1, b: k * b, c: 0 }
      II = { a: a2, b, c: 0 }
    }
    I.c = I.a * x + I.b * y
    II.c = II.a * x + II.b * y
    const ballons: Ballon[] = mischen([
      { x, y, art: 'richtig' },
      { x: -x, y, art: 'vorzeichenX' },
      { x, y: -y, art: 'vorzeichenY' },
      { x: y, y: x, art: 'vertauscht' },
    ])
    return { I, II, weg, ballons }
  }
}

const neueWege = () => mischen<Weg>(['sub', 'add', 'mult', pick<Weg>(['sub', 'add', 'mult'])])

const TIPP: Record<Fehler, string> = {
  richtig: 'Peng! Das Lösungspaar erfüllt beide Gleichungen.',
  vorzeichenX: 'Hier hat x das falsche Vorzeichen. Achte beim Subtrahieren darauf, dass jedes Vorzeichen der zweiten Gleichung umdreht.',
  vorzeichenY: 'Hier hat y das falsche Vorzeichen. Prüfe den Schritt, in dem du x einsetzt und nach y auflöst.',
  vertauscht: 'Hier sind x und y vertauscht. Im Lösungspaar (x | y) steht x immer vorne.',
}
const WEG_TEXT: Record<Weg, string> = {
  sub: 'Tipp: Schau, vor welcher Variablen dieselbe Zahl steht.',
  add: 'Tipp: Schau, vor welcher Variablen Gegenzahlen stehen.',
  mult: 'Tipp: Hier musst du erst eine Gleichung multiplizieren.',
}

/** Probe: linke Seite einer Gleichung für ein Lösungspaar */
const links = (g: Gl, b: { x: number; y: number }) => g.a * b.x + g.b * b.y

export default function BallonLabor() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [wege, setWege] = useState<Weg[]>(neueWege)
  const [runde, setRunde] = useState<Runde>(() => neueRunde(wege[0]))
  const [wahl, setWahl] = useState<number | null>(null)
  const [markiert, setMarkiert] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const [t, setT] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Die Ballons schweben sanft auf und ab (ohne Bewegung bei prefers-reduced-motion)
  useEffect(() => {
    if (phase !== 'wahl') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const tick = (zeit: number) => {
      setT(zeit)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const platzen = (i: number) => {
    if (phase !== 'wahl') return
    setWahl(i)
    if (runde.ballons[i].art === 'richtig') setMuenzen((m) => m + 1)
    setPhase('ergebnis')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      // Ergebnis an die Punkte melden (nur das beste Ergebnis zählt)
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde(neueRunde(wege[nr + 1]))
    setWahl(null)
    setPhase('wahl')
  }
  const nochmal = () => {
    const neu = neueWege()
    setWege(neu)
    setNr(0)
    setMuenzen(0)
    setRunde(neueRunde(neu[0]))
    setWahl(null)
    setPhase('start')
  }

  // Pfeiltasten wählen einen Ballon, Enter lässt ihn platzen (nur während der Wahl, nicht in Eingabefeldern)
  const platzenRef = useRef(platzen)
  platzenRef.current = platzen
  const markiertRef = useRef(markiert)
  markiertRef.current = markiert
  useEffect(() => {
    if (phase !== 'wahl') return
    const taste = (e: globalThis.KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select, button')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setMarkiert((m) => (m + 1) % 4)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setMarkiert((m) => (m + 3) % 4)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        platzenRef.current(markiertRef.current)
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const gewaehlt = wahl === null ? null : runde.ballons[wahl]
  const richtig = runde.ballons.find((b) => b.art === 'richtig')!

  return (
    <div className="gl-spiel" data-no-autocheck>
      <div className="gl-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Ballon-Labor' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="gl-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' gl-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Über dem Labortisch schweben vier Ballons. Auf jedem steht ein Lösungspaar, aber nur eines löst das Gleichungssystem. Rechne im Heft oder mach mit den Ballons die
          Probe, dann lass den richtigen Ballon platzen. Für jeden richtigen Ballon bekommst du eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {(phase === 'wahl' || phase === 'ergebnis') && (
        <>
          <div className="gl-spiel-frage">
            <span className="gl-spiel-gleichungen">
              <M>{`\\text{I: } ${glTex(runde.I)}`}</M>
              <M>{`\\text{II: } ${glTex(runde.II)}`}</M>
            </span>
            <span className="sl-hinweis">{WEG_TEXT[runde.weg]}</span>
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="group"
            aria-label="Vier Ballons mit Lösungspaaren über dem Labortisch. Tippe den Ballon mit dem richtigen Lösungspaar an."
            className="gl-spiel-bild"
          >
            <rect x="0" y="0" width={W} height={H} rx="12" fill="var(--primary-soft)" />
            <rect x="0" y={H - 40} width={W} height="40" fill="var(--primary)" />
            {runde.ballons.map((b, i) => {
              const cx = BX[i]
              const cy = 140 + Math.sin(t / 700 + i * 1.7) * 8
              const geplatzt = phase === 'ergebnis' && wahl === i
              const zeigeRichtig = phase === 'ergebnis' && b.art === 'richtig'
              const fuell = zeigeRichtig ? 'var(--correct-soft)' : geplatzt ? 'var(--wrong-soft)' : 'var(--surface)'
              const rand = zeigeRichtig ? 'var(--correct)' : geplatzt ? 'var(--wrong)' : markiert === i && phase === 'wahl' ? 'var(--primary)' : 'var(--ink)'
              return (
                <g
                  key={i}
                  className="gl-ballon"
                  role="button"
                  tabIndex={phase === 'wahl' ? 0 : -1}
                  aria-label={`Ballon ${i + 1}: Lösungspaar ${paarText(b)}`}
                  onClick={() => platzen(i)}
                  onFocus={() => setMarkiert(i)}
                  onKeyDown={(e: ReactKeyboardEvent<SVGGElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      platzen(i)
                    }
                  }}
                >
                  <path d={`M${cx} ${cy + 84} q-14 40 6 ${H - 40 - cy - 84}`} fill="none" stroke="var(--ink)" strokeWidth="2" />
                  {geplatzt && b.art !== 'richtig' ? (
                    <polygon
                      points={Array.from({ length: 16 }, (_, k) => {
                        const r = k % 2 ? 40 : 78
                        const w = (k / 16) * Math.PI * 2
                        return `${cx + Math.cos(w) * r},${cy + Math.sin(w) * r}`
                      }).join(' ')}
                      fill={fuell}
                      stroke={rand}
                      strokeWidth="3"
                    />
                  ) : (
                    <>
                      <ellipse cx={cx} cy={cy} rx="72" ry="84" fill={fuell} stroke={rand} strokeWidth={markiert === i && phase === 'wahl' ? 5 : 3} />
                      <polygon points={`${cx - 8},${cy + 92} ${cx + 8},${cy + 92} ${cx},${cy + 82}`} fill={rand} />
                    </>
                  )}
                  <text x={cx} y={cy + 9} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
                    {paarText(b)}
                  </text>
                </g>
              )
            })}
          </svg>
          {phase === 'wahl' && <p className="sl-hinweis">Tippe einen Ballon an oder wähle ihn mit den Pfeiltasten und drücke Enter.</p>}
        </>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            <i className="fa-solid fa-play" aria-hidden="true" /> Spiel starten
          </button>
        </div>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : 'Daneben. '}
              {TIPP[gewaehlt.art]}{' '}
              {gewaehlt.art !== 'richtig' && (
                <>
                  Probe in I: <M>{`${tx(links(runde.I, gewaehlt))}`}</M> statt <M>{tx(runde.I.c)}</M>
                  {links(runde.I, gewaehlt) === runde.I.c && (
                    <>
                      , in II: <M>{tx(links(runde.II, gewaehlt))}</M> statt <M>{tx(runde.II.c)}</M>
                    </>
                  )}
                  . Richtig ist <M>{paar(richtig)}</M>.
                </>
              )}
            </span>
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {nr + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächste Runde'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {phase === 'ende' && (
        <>
          <p className="gl-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-flask'}`} aria-hidden="true" /> {muenzen} von {RUNDEN} Ballons richtig zum Platzen gebracht.{' '}
            {muenzen === RUNDEN ? 'Perfekt, du bist Laborchefin oder Laborchef!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
