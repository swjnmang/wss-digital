import { useEffect, useRef, useState } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../lernsituation_kit/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'
import { zahl } from './bilder'

// Bonus-Spiel „Zeichenroboter“ am Ende der Lernsituation „Die Funktionsmaschine“: Zwei Münzen liegen im Koordinatensystem
// auf einer Geraden durch den Ursprung. Die SuS wählen die Funktionsgleichung, mit der der Roboter eine Gerade durch beide
// Münzen zeichnet. Die Gerade wird erst nach der Wahl gezeichnet, damit man sie nicht ablesen kann.
// Die falschen Gleichungen sind typische Fehler: Vorzeichen von m falsch, Kehrwert (x : y statt y : x), plus statt mal.
// Vier Runden, jede Runde mit beiden Münzen bringt eine Münze (je 2 Punkte, zusammen höchstens 8 wie die beste Übungsaufgabe).
// Bedienung: Gleichung antippen oder Pfeiltasten, dann „Zeichnen!“ bzw. Enter. Keine Uhr.

type Fehler = 'richtig' | 'vorzeichen' | 'kehrwert' | 'plus'
type Wahl = { m: number; t: number; art: Fehler }
type Runde = { muenzen: { x: number; y: number }[]; wahl: Wahl[] }
type Phase = 'start' | 'wahl' | 'zeichnen' | 'ergebnis' | 'ende'

const RUNDEN = 4
const DAUER = 1.4 // Sekunden, bis die Gerade ganz gezeichnet ist

const G = { w: 680, h: 360, l: 44, r: 26, t: 20, b: 30, xMax: 6, yMax: 10 }
const gx = (x: number) => G.l + ((x + G.xMax) / (2 * G.xMax)) * (G.w - G.l - G.r)
const gy = (y: number) => G.t + ((G.yMax - y) / (2 * G.yMax)) * (G.h - G.t - G.b)

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

function neueRunde(): Runde {
  for (;;) {
    const m = pick([-3, -2, -0.5, 0.5, 2, 3])
    // Münzen auf ganzzahligen Punkten, eine links und eine rechts der y-Achse
    const passt = (x: number) => Number.isInteger(m * x) && Math.abs(m * x) <= 9
    const links = [-5, -4, -3, -2, -1].filter(passt)
    const rechts = [1, 2, 3, 4, 5].filter(passt)
    if (!links.length || !rechts.length) continue
    const x1 = pick(rechts)
    const x2 = pick(links)
    const muenzen = [
      { x: x1, y: m * x1 },
      { x: x2, y: m * x2 },
    ]
    const wahl: Wahl[] = [
      { m, t: 0, art: 'richtig' },
      { m: -m, t: 0, art: 'vorzeichen' },
      { m: 1 / m, t: 0, art: 'kehrwert' },
      { m: 1, t: m * x1 - x1, art: 'plus' },
    ]
    return { muenzen, wahl: mischen(wahl) }
  }
}

const gleichung = (w: Wahl) => {
  // Kehrwert von ±3 als Bruch statt 0,333
  const drittel = Math.abs(Math.abs(w.m) - 1 / 3) < 1e-9
  const m = w.m === 1 ? '' : w.m === -1 ? '-' : drittel ? `${w.m < 0 ? '-' : ''}\\tfrac{1}{3}` : tx(w.m)
  const t = w.t === 0 ? '' : w.t > 0 ? ` + ${tx(w.t)}` : ` - ${tx(-w.t)}`
  return `y = ${m}x${t}`
}
const trifft = (w: Wahl, p: { x: number; y: number }) => Math.abs(w.m * p.x + w.t - p.y) < 1e-6
const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Treffer! Die Gerade geht durch beide Münzen.',
  vorzeichen: 'Bei dieser Gleichung stimmt das Vorzeichen von m nicht: Die Gerade steigt statt zu fallen (oder umgekehrt). Rechne bei einer Münze y : x und achte auf das Minus.',
  kehrwert: 'Hier wurde x : y statt y : x gerechnet. m bekommst du, wenn du y durch x teilst.',
  plus: 'Hier wurde eine Zahl addiert statt malgenommen. Die Gerade geht nicht durch den Ursprung und trifft nur eine Münze.',
}

export default function ZeichenRoboter() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Zeichnen: Der Roboter fährt vom Ursprung aus in beide Richtungen, danach Auswertung
  useEffect(() => {
    if (phase !== 'zeichnen') return
    const ruhig = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (ruhig) {
      setP(1)
      setPhase('ergebnis')
      return
    }
    let start: number | undefined
    const tick = (t: number) => {
      start ??= t
      const neu = Math.min(1, (t - start) / 1000 / DAUER)
      setP(neu)
      if (neu < 1) frame.current = requestAnimationFrame(tick)
      else setPhase('ergebnis')
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const zeichnen = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.wahl[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setP(0)
    setPhase('zeichnen')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      // Ergebnis an die Punkte melden (nur das beste Ergebnis zählt)
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde(neueRunde())
    setWahl(null)
    setP(0)
    setPhase('wahl')
  }
  const nochmal = () => {
    setNr(0)
    setMuenzen(0)
    setRunde(neueRunde())
    setWahl(null)
    setP(0)
    setPhase('start')
  }
  // Pfeiltasten wählen eine Gleichung, Enter startet den Roboter (nur während der Wahl, nicht in Eingabefeldern)
  const zeichnenRef = useRef(zeichnen)
  zeichnenRef.current = zeichnen
  useEffect(() => {
    if (phase !== 'wahl') return
    const taste = (e: globalThis.KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setWahl((w) => (w === null ? 0 : (w + 1) % 4))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setWahl((w) => (w === null ? 3 : (w + 3) % 4))
      } else if (e.key === 'Enter' && !(e.target as HTMLElement | null)?.closest('button')) {
        e.preventDefault()
        zeichnenRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const gewaehlt = wahl === null ? null : runde.wahl[wahl]
  const richtig = runde.wahl.find((w) => w.art === 'richtig')!
  const zeigeLinie = (phase === 'zeichnen' || phase === 'ergebnis') && gewaehlt
  // Die Gerade wächst vom Punkt (0 | t) aus in beide Richtungen; der Roboter sitzt an der rechten Spitze
  const ende = (s: number) => {
    if (!gewaehlt) return { x: 0, y: 0 }
    const x = s * G.xMax * p
    return { x, y: gewaehlt.m * x + gewaehlt.t }
  }
  const spitze = ende(1)

  return (
    <div className="fm-spiel" data-no-autocheck>
      <div className="fm-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Zeichenroboter' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="fm-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' fm-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Der Zeichenroboter zeichnet jede Gerade, deren Funktionsgleichung du ihm gibst. Zwei Münzen liegen im Koordinatensystem. Wähle die Gleichung, mit der die Gerade durch
          beide Münzen geht. Rechne im Heft: Teile bei einer Münze <M>y</M> durch <M>x</M>. Für jede Runde mit beiden Münzen bekommst du eine Münze. Lass dir Zeit, es gibt keine
          Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <>
          <p className="fm-spiel-frage">
            Münzen bei <M>{`(${tx(runde.muenzen[0].x)} \\mid ${tx(runde.muenzen[0].y)})`}</M> und <M>{`(${tx(runde.muenzen[1].x)} \\mid ${tx(runde.muenzen[1].y)})`}</M>. Welche
            Gleichung bekommt der Roboter?
          </p>
          <svg
            viewBox={`0 0 ${G.w} ${G.h}`}
            role="img"
            aria-label="Koordinatensystem mit zwei Münzen. Nach der Wahl zeichnet der Roboter die gewählte Gerade."
            className="fm-spiel-bild"
          >
            <rect x="0" y="0" width={G.w} height={G.h} rx="12" fill="var(--primary-soft)" />
            {Array.from({ length: 2 * G.xMax + 1 }, (_, i) => i - G.xMax).map((v) => (
              <g key={`x${v}`}>
                <line x1={gx(v)} x2={gx(v)} y1={gy(G.yMax)} y2={gy(-G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
                {v !== 0 && (
                  <text x={gx(v)} y={gy(0) + 20} textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
                    {zahl(v)}
                  </text>
                )}
              </g>
            ))}
            {Array.from({ length: G.yMax + 1 }, (_, i) => -G.yMax + 2 * i).map((v) => (
              <g key={`y${v}`}>
                <line x1={gx(-G.xMax)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
                {v !== 0 && (
                  <text x={gx(0) - 6} y={gy(v) + 6} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
                    {zahl(v)}
                  </text>
                )}
              </g>
            ))}
            <line x1={gx(-G.xMax)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="2" />
            <line x1={gx(0)} x2={gx(0)} y1={gy(-G.yMax)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="2" />
            <clipPath id="fm-spiel-clip">
              <rect x={gx(-G.xMax)} y={gy(G.yMax)} width={gx(G.xMax) - gx(-G.xMax)} height={gy(-G.yMax) - gy(G.yMax)} />
            </clipPath>
            {zeigeLinie && (
              <g clipPath="url(#fm-spiel-clip)">
                <line x1={gx(ende(-1).x)} y1={gy(ende(-1).y)} x2={gx(spitze.x)} y2={gy(spitze.y)} stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
                {/* Zeichenroboter an der Spitze der Linie */}
                {phase === 'zeichnen' && (
                  <g transform={`translate(${gx(spitze.x)} ${gy(spitze.y)})`}>
                    <rect x="-14" y="-30" width="28" height="22" rx="5" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
                    <circle cx="-5" cy="-19" r="3" fill="var(--surface)" />
                    <circle cx="5" cy="-19" r="3" fill="var(--surface)" />
                    <line x1="0" y1="-8" x2="0" y2="0" stroke="var(--ink)" strokeWidth="3" />
                  </g>
                )}
              </g>
            )}
            {runde.muenzen.map((c, i) => {
              const getroffen = phase === 'ergebnis' && gewaehlt && trifft(gewaehlt, c)
              return (
                <g key={i}>
                  <circle cx={gx(c.x)} cy={gy(c.y)} r="13" fill={phase === 'ergebnis' ? (getroffen ? 'var(--correct)' : 'var(--wrong)') : 'var(--highlight)'} stroke="var(--ink)" strokeWidth="2" />
                  <text x={gx(c.x) + 18} y={gy(c.y) - 12} fontSize="17" fontWeight="800" fill="var(--ink)" paintOrder="stroke" stroke="var(--primary-soft)" strokeWidth="4">
                    ({zahl(c.x)} | {zahl(c.y)})
                  </text>
                </g>
              )
            })}
          </svg>
        </>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            <i className="fa-solid fa-play" aria-hidden="true" /> Spiel starten
          </button>
        </div>
      )}
      {phase === 'wahl' && (
        <>
          <div className="fm-wahl" role="radiogroup" aria-label="Welche Gleichung bekommt der Roboter?">
            {runde.wahl.map((w, i) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                <M>{gleichung(w)}</M>
              </button>
            ))}
          </div>
          <div className="bk-actions fm-steuer">
            <button type="button" className="bk-btn bk-btn-primary" onClick={zeichnen} disabled={wahl === null}>
              <i className="fa-solid fa-pen-ruler" aria-hidden="true" /> Zeichnen!
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe eine Gleichung an.' : 'Gewählt. Jetzt zeichnen lassen!'}</span>
          </div>
        </>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : 'Daneben. '}
              {ERKLAERUNG[gewaehlt.art]} {gewaehlt.art !== 'richtig' && <>Richtig ist <M>{gleichung(richtig)}</M>.</>}
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
          <p className="fm-spiel-ende">
            <i className={`fa-solid ${muenzen >= RUNDEN - 1 ? 'fa-trophy' : 'fa-gears'}`} aria-hidden="true" /> Du hast in {muenzen} von {RUNDEN} Runden beide Münzen eingesammelt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, der Roboter ist begeistert!' : muenzen >= RUNDEN - 1 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
