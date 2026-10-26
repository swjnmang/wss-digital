import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'
import { winkelZwischen } from './Koordinaten'

// Bonus-Spiel „Brückenbauer“ am Ende der Lernsituation „Der neue Radweg“: Auf dem Gitter liegt eine Bahnlinie y = mx + t
// und ein Punkt P. Gesucht ist die Steigung einer Brücke (senkrecht über die Gleise in P) oder eines Radwegs (parallel durch P).
// Die SuS wählen eine von vier Steigungen, der Bautrupp baut die Gerade von P aus. Falsche Steigungen bilden die typischen Fehler ab:
// nur das Vorzeichen gewechselt, nur der Kehrwert, parallel und senkrecht verwechselt. Vier Runden, keine Uhr.
// Bedienung: Tippen auf A bis D, Pfeiltasten wechseln zwischen den Knöpfen, Enter baut.

type Auftrag = 'senkrecht' | 'parallel'
type Option = { m: number; fehler: string | null }
type Runde = { auftrag: Auftrag; m: number; t: number; p: [number, number]; optionen: Option[] }
type Phase = 'start' | 'wahl' | 'bau' | 'ergebnis' | 'ende'

const RUNDEN = 4 // je Rundenmünze 2 Punkte: höchstens 8, also nicht mehr als die beste Übungsaufgabe
const BAU_DAUER = 1.1 // Sekunden, bis die Gerade fertig gebaut ist

const G = { w: 600, h: 440, xMin: -7, xMax: 7, yMin: -5, yMax: 5, rand: 20 }
const einheit = Math.min((G.w - 2 * G.rand) / (G.xMax - G.xMin), (G.h - 2 * G.rand) / (G.yMax - G.yMin))
const ox = G.w / 2
const oy = G.h / 2
const gx = (x: number) => ox + x * einheit
const gy = (y: number) => oy - y * einheit

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mische = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const gleich = (a: number, b: number) => Math.abs(a - b) < 1e-9

/** Steigung als TeX: ganze Zahlen und Halbe als Dezimalzahl, Drittel als Bruch */
function mTex(v: number) {
  const s = v < 0 ? '-' : ''
  const a = Math.abs(v)
  if (Number.isInteger(a) || Number.isInteger(a * 2)) return s + String(a).replace('.', '{,}')
  for (const d of [3, 4]) if (Number.isInteger(Math.round(a * d * 1e6) / 1e6)) return `${s}\\tfrac{${Math.round(a * d)}}{${d}}`
  return s + String(Math.round(a * 100) / 100).replace('.', '{,}')
}

function neueRunde(nr: number, alt?: Runde): Runde {
  for (;;) {
    const m = pick([-3, -2, -1.5, -0.5, 0.5, 1.5, 2, 3, 1 / 3, -1 / 3])
    if (alt && gleich(alt.m, m)) continue
    // In den Runden 2 und 4 ein Radweg (parallel), sonst eine Brücke (senkrecht)
    const auftrag: Auftrag = nr % 2 === 1 ? 'parallel' : 'senkrecht'
    const p: [number, number] = [pick([-2, -1, 0, 1, 2]), pick([-2, -1, 1, 2])]
    // Brücke: P liegt auf der Bahnlinie. Radweg: die Bahnlinie liegt 3 Einheiten über oder unter P.
    const t = p[1] - m * p[0] + (auftrag === 'parallel' ? pick([-3, 3]) : 0)
    const senk = -1 / m
    const optionen: Option[] =
      auftrag === 'senkrecht'
        ? [
            { m: senk, fehler: null },
            { m: -m, fehler: 'Nur das Vorzeichen gewechselt: Die Gerade ist bloß gespiegelt.' },
            { m: 1 / m, fehler: 'Nur den Kehrwert genommen: Das Vorzeichen muss auch wechseln.' },
            { m, fehler: 'Gleiche Steigung: Das wäre parallel zu den Gleisen, nicht senkrecht.' },
          ]
        : [
            { m, fehler: null },
            { m: senk, fehler: 'Das ist die Steigung einer senkrechten Geraden. Parallel heißt: gleiche Steigung.' },
            { m: -m, fehler: 'Nur das Vorzeichen gewechselt: Der Radweg würde die Gleise kreuzen.' },
            { m: 1 / m, fehler: 'Der Kehrwert ändert die Richtung. Parallel heißt: gleiche Steigung.' },
          ]
    // Antwort A ist nie die richtige
    let gemischt = mische(optionen)
    while (gemischt[0].fehler === null) gemischt = mische(optionen)
    return { auftrag, m, t, p, optionen: gemischt }
  }
}

/** Sichtbarer x-Bereich einer Geraden durch P mit Steigung m */
function bereich(m: number, p: [number, number]): [number, number] {
  const t = p[1] - m * p[0]
  let lo = G.xMin
  let hi = G.xMax
  if (m !== 0) {
    const a = (G.yMin - t) / m
    const b = (G.yMax - t) / m
    lo = Math.max(lo, Math.min(a, b))
    hi = Math.min(hi, Math.max(a, b))
  }
  return [lo, hi]
}

export default function BrueckenBauer() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(() => neueRunde(0))
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([])
  const meldeSpiel = useSpielPunkte()

  useEffect(() => {
    if (phase !== 'bau') return
    let start: number | undefined
    const tick = (zeit: number) => {
      start ??= zeit
      const neu = Math.min(1, (zeit - start) / 1000 / BAU_DAUER)
      setP(neu)
      if (neu < 1) frame.current = requestAnimationFrame(tick)
      else setPhase('ergebnis')
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const bauen = (i: number) => {
    if (phase !== 'wahl') return
    setWahl(i)
    if (runde.optionen[i].fehler === null) setMuenzen((m) => m + 1)
    setP(0)
    setPhase('bau')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde((alt) => neueRunde(nr + 1, alt))
    setWahl(null)
    setP(0)
    setPhase('wahl')
  }
  const nochmal = () => {
    setNr(0)
    setMuenzen(0)
    setRunde(neueRunde(0))
    setWahl(null)
    setP(0)
    setPhase('start')
  }
  const pfeile = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = knoepfe.current.findIndex((k) => k === document.activeElement)
    const schritt = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!schritt) return
    e.preventDefault()
    knoepfe.current[(i + schritt + 4) % 4]?.focus()
  }

  const gewaehlt = wahl !== null ? runde.optionen[wahl] : null
  const richtig = gewaehlt?.fehler === null
  const [lo, hi] = gewaehlt ? bereich(gewaehlt.m, runde.p) : [0, 0]
  // Die Gerade wächst von P aus in beide Richtungen
  const x1 = runde.p[0] + (lo - runde.p[0]) * p
  const x2 = runde.p[0] + (hi - runde.p[0]) * p
  const yAuf = (x: number) => (gewaehlt ? runde.p[1] + gewaehlt.m * (x - runde.p[0]) : 0)
  const bahnLo = bereich(runde.m, [0, runde.t])
  const was = runde.auftrag === 'senkrecht' ? 'die Brücke' : 'der Radweg'

  return (
    <div className="rw-spiel" data-no-autocheck>
      <div className="rw-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Brückenbauer' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="rw-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' rw-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Das Bauamt hat neue Aufträge. In jeder Runde liegt eine Bahnlinie auf dem Plan. Mal soll eine Brücke senkrecht über die Gleise führen, mal ein Radweg parallel
          daneben. Wähle die richtige Steigung, dann baut der Bautrupp los. Für jeden richtigen Bau gibt es eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="rw-spiel-frage">
          Bahnlinie: <M>{`y = ${mTex(runde.m)}x${Math.abs(runde.t) < 1e-9 ? '' : ` ${runde.t < 0 ? '-' : '+'} ${mTex(Math.abs(runde.t))}`}`}</M>.{' '}
          {runde.auftrag === 'senkrecht' ? (
            <>
              Die <strong>Brücke</strong> soll im Punkt <M>P</M> <strong>senkrecht</strong> über die Gleise führen.
            </>
          ) : (
            <>
              Der <strong>Radweg</strong> soll durch <M>P</M> <strong>parallel</strong> zu den Gleisen laufen.
            </>
          )}{' '}
          Welche Steigung braucht {was}?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <svg
          viewBox={`0 0 ${G.w} ${G.h}`}
          className="rw-spiel-bild"
          role="img"
          aria-label={`Plan mit einer Bahnlinie mit der Steigung ${String(Math.round(runde.m * 100) / 100).replace('.', ',')} und dem Punkt P(${runde.p[0]} | ${runde.p[1]}).`}
        >
          <rect x="0" y="0" width={G.w} height={G.h} rx="12" fill="var(--primary-soft)" />
          {Array.from({ length: G.xMax - G.xMin + 1 }, (_, i) => G.xMin + i).map((v) => (
            <line key={`x${v}`} x1={gx(v)} x2={gx(v)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
          ))}
          {Array.from({ length: G.yMax - G.yMin + 1 }, (_, i) => G.yMin + i).map((v) => (
            <line key={`y${v}`} x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
          ))}
          <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={oy} y2={oy} stroke="var(--ink-muted)" strokeWidth="1.5" />
          <line x1={ox} x2={ox} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--ink-muted)" strokeWidth="1.5" />
          {/* Bahnlinie */}
          <line
            x1={gx(bahnLo[0])}
            y1={gy(runde.m * bahnLo[0] + runde.t)}
            x2={gx(bahnLo[1])}
            y2={gy(runde.m * bahnLo[1] + runde.t)}
            stroke="var(--ink)"
            strokeWidth="8"
          />
          <line
            x1={gx(bahnLo[0])}
            y1={gy(runde.m * bahnLo[0] + runde.t)}
            x2={gx(bahnLo[1])}
            y2={gy(runde.m * bahnLo[1] + runde.t)}
            stroke="var(--surface)"
            strokeWidth="4"
            strokeDasharray="10 8"
          />
          {/* gebaute Gerade */}
          {gewaehlt && (
            <line
              x1={gx(x1)}
              y1={gy(yAuf(x1))}
              x2={gx(x2)}
              y2={gy(yAuf(x2))}
              stroke={phase === 'ergebnis' ? (richtig ? 'var(--correct)' : 'var(--wrong)') : 'var(--primary)'}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
          <circle cx={gx(runde.p[0])} cy={gy(runde.p[1])} r="10" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
          <text x={gx(runde.p[0]) + 14} y={gy(runde.p[1]) - 12} fontSize="18" fontWeight="800" fill="var(--ink)" stroke="var(--primary-soft)" strokeWidth="4" paintOrder="stroke">
            P
          </text>
        </svg>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <div className="rw-optionen" role="group" aria-label="Steigung wählen">
          {runde.optionen.map((o, i) => (
            <button
              key={i}
              ref={(el: HTMLButtonElement | null) => {
                knoepfe.current[i] = el
              }}
              type="button"
              className={`bk-btn${wahl === i ? (phase === 'ergebnis' ? (o.fehler === null ? ' rw-opt-ok' : ' rw-opt-no') : ' bk-btn-primary') : ''}`}
              disabled={phase !== 'wahl'}
              onKeyDown={pfeile}
              onClick={() => bauen(i)}
            >
              <strong>{'ABCD'[i]})</strong> <M>{`m = ${mTex(o.m)}`}</M>
            </button>
          ))}
        </div>
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
          <div className={`bk-feedback lp-feedback ${richtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${richtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {richtig ? (
                runde.auftrag === 'senkrecht' ? (
                  <>
                    Rechter Winkel, die Brücke steht! Probe: <M>{`${mTex(runde.m)} \\cdot (${mTex(gewaehlt.m)}) = -1`}</M>.
                  </>
                ) : (
                  <>Parallel, der Radweg kreuzt die Gleise nie. Gleiche Steigung, nur verschoben.</>
                )
              ) : (
                <>
                  {gewaehlt.fehler}{' '}
                  {runde.auftrag === 'senkrecht' && !gleich(gewaehlt.m, runde.m) && <>Der Winkel ist {Math.round(winkelZwischen(runde.m, gewaehlt.m))}°. </>}
                  Richtig ist <M>{`m = ${mTex(runde.optionen.find((o) => o.fehler === null)!.m)}`}</M>.
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
          <p className="rw-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-helmet-safety'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Bauten richtig geplant.{' '}
            {muenzen === RUNDEN ? 'Perfekt, das Bauamt stellt dich sofort ein!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
