import { useEffect, useRef, useState } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'
import GleichungEingabe from '../../../components/GleichungEingabe'
import { checkLinearEquation, parseLinearEquation, texLinearEquation } from '../../../utils/parseLinearEquation'

// Bonus-Spiel „Scooter-Route“ am Ende der Lernsituation „Die Scooter-App“: Auf dem Koordinatengitter liegen zwei Münzen.
// Die SuS stellen die Gleichung der Geraden durch beide Münzen auf, tippen sie vollständig ein (y = …) und schicken den Scooter los.
// Er fährt genau ihre Gerade entlang und sammelt jede Münze ein, die darauf liegt. Nur wenn er beide erwischt, gibt es die Rundenmünze.
// Falsche Gleichungen bekommen eine Rückmeldung zum typischen Fehler (Vorzeichen, m und t vertauscht, Bruch umgedreht).
// Vier Runden, keine Uhr. Bedienung: Gleichung tippen (mit Zeichenleiste), Enter oder „Losfahren“.

type Runde = { m: number; t: number; p1: [number, number]; p2: [number, number] }
type Phase = 'start' | 'eingabe' | 'fahrt' | 'ergebnis' | 'ende'

const RUNDEN = 4 // je Rundenmünze 2 Punkte: höchstens 8, also nicht mehr als die beste Übungsaufgabe
const FAHRT_DAUER = 1.8 // Sekunden für die Fahrt quer über das Gitter

const G = { w: 600, h: 440, xMin: -7, xMax: 7, yMin: -5, yMax: 5, rand: 20 }
const einheit = Math.min((G.w - 2 * G.rand) / (G.xMax - G.xMin), (G.h - 2 * G.rand) / (G.yMax - G.yMin))
const ox = G.w / 2
const oy = G.h / 2
const gx = (x: number) => ox + x * einheit
const gy = (y: number) => oy - y * einheit

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

function neueRunde(alt?: Runde): Runde {
  for (;;) {
    const m = pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3])
    const t = pick([-3, -2, -1, 1, 2, 3])
    const xs = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].filter((x) => Number.isInteger(m * x + t) && Math.abs(m * x + t) <= 4)
    if (xs.length < 2) continue
    const x1 = pick(xs)
    const x2 = pick(xs.filter((x) => Math.abs(x - x1) >= 2))
    if (x2 === undefined) continue
    if (alt && alt.m === m && alt.t === t) continue
    const [a, b] = x1 < x2 ? [x1, x2] : [x2, x1]
    return { m, t, p1: [a, m * a + t], p2: [b, m * b + t] }
  }
}

/** Sichtbarer Teil der Geraden y = mx + t im Gitter (x-Bereich) */
function sichtbar(m: number, t: number): [number, number] | null {
  let lo = G.xMin
  let hi = G.xMax
  if (m !== 0) {
    const a = (G.yMin - t) / m
    const b = (G.yMax - t) / m
    lo = Math.max(lo, Math.min(a, b))
    hi = Math.min(hi, Math.max(a, b))
  } else if (t < G.yMin || t > G.yMax) return null
  return lo < hi ? [lo, hi] : null
}

const aufGerade = (m: number, t: number, p: [number, number]) => Math.abs(m * p[0] + t - p[1]) < 0.02

export default function ScooterRoute() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(() => neueRunde())
  const [eingabe, setEingabe] = useState('')
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [fahrt, setFahrt] = useState<{ m: number; t: number } | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const [ergebnis, setErgebnis] = useState<{ ok: boolean; text: string } | null>(null)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  useEffect(() => {
    if (phase !== 'fahrt') return
    let start: number | undefined
    const tick = (zeit: number) => {
      start ??= zeit
      const neu = Math.min(1, (zeit - start) / 1000 / FAHRT_DAUER)
      setP(neu)
      if (neu < 1) frame.current = requestAnimationFrame(tick)
      else setPhase('ergebnis')
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const losfahren = () => {
    if (phase !== 'eingabe') return
    const g = parseLinearEquation(eingabe)
    if (!g.ok) return setHinweis(g.fehler)
    setHinweis(null)
    const r = checkLinearEquation(eingabe, runde.m, runde.t, 0)
    const ok = r.status === 'ok'
    if (ok) setMuenzen((m) => m + 1)
    setErgebnis({ ok, text: r.text })
    setFahrt({ m: g.m, t: g.t })
    setP(0)
    setPhase('fahrt')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde((alt) => neueRunde(alt))
    setEingabe('')
    setFahrt(null)
    setErgebnis(null)
    setP(0)
    setPhase('eingabe')
  }
  const nochmal = () => {
    setNr(0)
    setMuenzen(0)
    setRunde(neueRunde())
    setEingabe('')
    setFahrt(null)
    setErgebnis(null)
    setP(0)
    setPhase('start')
  }

  // Sichtbarer Abschnitt der gefahrenen Geraden und Position des Scooters
  const bereich = fahrt ? sichtbar(fahrt.m, fahrt.t) : null
  const xScooter = bereich ? bereich[0] + (bereich[1] - bereich[0]) * p : 0
  const yScooter = fahrt ? fahrt.m * xScooter + fahrt.t : 0
  const eingesammelt = (pt: [number, number]) => !!fahrt && !!bereich && aufGerade(fahrt.m, fahrt.t, pt) && xScooter >= pt[0] - 0.01

  return (
    <div className="es-spiel" data-no-autocheck>
      <div className="es-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Scooter-Route' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="es-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' es-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Auf dem Gitter liegen zwei Münzen. Stelle in deinem Heft die Gleichung der Geraden durch beide Münzen auf, tippe sie vollständig ein und schick den Scooter los. Er
          fährt genau deine Gerade entlang. Erwischt er beide Münzen, bekommst du eine Rundenmünze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="es-spiel-frage">
          Die Münzen liegen bei <M>{`A(${runde.p1[0]} \\mid ${runde.p1[1]})`}</M> und <M>{`B(${runde.p2[0]} \\mid ${runde.p2[1]})`}</M>. Welche Gerade geht durch beide?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <svg
          viewBox={`0 0 ${G.w} ${G.h}`}
          className="es-spiel-bild"
          role="img"
          aria-label={`Koordinatensystem mit zwei Münzen bei A(${runde.p1[0]} | ${runde.p1[1]}) und B(${runde.p2[0]} | ${runde.p2[1]}).`}
        >
          <rect x="0" y="0" width={G.w} height={G.h} rx="12" fill="var(--primary-soft)" />
          {Array.from({ length: G.xMax - G.xMin + 1 }, (_, i) => G.xMin + i).map((v) => (
            <line key={`x${v}`} x1={gx(v)} x2={gx(v)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
          ))}
          {Array.from({ length: G.yMax - G.yMin + 1 }, (_, i) => G.yMin + i).map((v) => (
            <line key={`y${v}`} x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
          ))}
          <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={oy} y2={oy} stroke="var(--ink)" strokeWidth="2" />
          <line x1={ox} x2={ox} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="2" />
          {[-6, -4, -2, 2, 4, 6].map((v) => (
            <text key={`tx${v}`} x={gx(v)} y={oy + 20} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
              {v}
            </text>
          ))}
          {[-4, -2, 2, 4].map((v) => (
            <text key={`ty${v}`} x={ox - 8} y={gy(v) + 5} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
              {v}
            </text>
          ))}
          {/* gefahrene Strecke */}
          {fahrt && bereich && (
            <line
              x1={gx(bereich[0])}
              y1={gy(fahrt.m * bereich[0] + fahrt.t)}
              x2={gx(xScooter)}
              y2={gy(yScooter)}
              stroke={phase === 'ergebnis' ? (ergebnis?.ok ? 'var(--correct)' : 'var(--wrong)') : 'var(--primary)'}
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
          {/* Münzen */}
          {[runde.p1, runde.p2].map((pt, i) => {
            const an = eingesammelt(pt)
            return (
              <g key={i} opacity={an ? 0.35 : 1}>
                <circle cx={gx(pt[0])} cy={gy(pt[1])} r="13" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
                <text x={gx(pt[0])} y={gy(pt[1]) + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--ink)">
                  {i === 0 ? 'A' : 'B'}
                </text>
              </g>
            )
          })}
          {/* Scooter */}
          {fahrt && bereich && (
            <g transform={`translate(${gx(xScooter)} ${gy(yScooter)})`}>
              <circle r="11" fill="var(--primary)" stroke="var(--surface)" strokeWidth="3" />
              <circle r="4" fill="var(--surface)" />
            </g>
          )}
          {fahrt && !bereich && (
            <text x={ox} y={36} textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--ink)">
              Deine Gerade liegt außerhalb des Gitters.
            </text>
          )}
        </svg>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('eingabe')}>
            <i className="fa-solid fa-play" aria-hidden="true" /> Spiel starten
          </button>
        </div>
      )}
      {phase === 'eingabe' && (
        <div
          className="es-steuer">
          <GleichungEingabe onEnter={losfahren} value={eingabe} onChange={(v) => { setEingabe(v); setHinweis(null) }} ariaLabel="Gleichung der Route" />
          <button type="button" className="bk-btn bk-btn-primary" onClick={losfahren} disabled={eingabe.trim() === ''}>
            <i className="fa-solid fa-route" aria-hidden="true" /> Losfahren
          </button>
        </div>
      )}
      {hinweis && phase === 'eingabe' && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {hinweis}
        </div>
      )}
      {phase === 'ergebnis' && ergebnis && (
        <>
          <div className={`bk-feedback lp-feedback ${ergebnis.ok ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${ergebnis.ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {ergebnis.ok ? 'Beide Münzen eingesammelt! ' : 'Daneben. '}
              {!ergebnis.ok && (
                <>
                  {ergebnis.text} Richtig ist <M>{texLinearEquation(runde.m, runde.t)}</M>.
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
          <p className="es-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-route'}`} aria-hidden="true" /> Du hast in {muenzen} von {RUNDEN} Runden beide Münzen erwischt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, jede Route sitzt!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
