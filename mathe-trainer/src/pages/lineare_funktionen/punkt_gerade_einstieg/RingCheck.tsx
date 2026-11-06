import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../lernsituation_kit/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'

// Bonus-Spiel „Ring-Check“ am Ende der Lernsituation „Der Drohnen-Parcours“: Gegeben ist nur die Gleichung der Flugbahn.
// Vier Leuchtringe hängen im Raum, genau einer liegt auf der Flugbahn. Die SuS machen die Punktprobe, wählen den Ring und starten
// die Drohne. Die Flugbahn wird erst beim Start gezeichnet, damit man sie nicht ablesen kann.
// Die falschen Ringe sind typische Fehler: knapp daneben (0,5 m), Vorzeichen von t vertauscht, y-Achsenabschnitt als Höhe genommen.
// Vier Runden, jeder Treffer bringt eine Münze (je 2 Punkte, zusammen höchstens 8 wie die beste Übungsaufgabe).
// Bedienung: Ring antippen oder Pfeiltasten, dann „Drohne starten“ bzw. Enter.

type Art = 'richtig' | 'knapp' | 'vorzeichen' | 'achse'
type Ziel = { x: number; y: number; art: Art }
type Runde = { m: number; t: number; ziele: Ziel[] }
type Phase = 'start' | 'wahl' | 'flug' | 'ergebnis' | 'ende'

const RUNDEN = 4
const FLUG_DAUER = 1.6

const G = { w: 760, h: 360, l: 40, r: 16, t: 16, b: 40, xMax: 12, yMax: 10 }
const gx = (x: number) => G.l + (x / G.xMax) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const zahl = (v: number) => fmt(v).replace('-', '−')
const imRaum = (z: { x: number; y: number }) => z.x >= 1 && z.x <= 11 && z.y >= 0.5 && z.y <= 9.5

function neueRunde(): Runde {
  for (;;) {
    const m = pick([0.5, -0.5, 1, -1, 0.25])
    const t = m > 0 ? pick([1, 2, 3]) : pick([7, 8, 9])
    const f = (x: number) => m * x + t
    const xs = mischen([2, 3, 4, 5, 6, 7, 8, 9, 10])
    const kandidaten: Ziel[] = [
      { x: xs[0], y: f(xs[0]), art: 'richtig' },
      { x: xs[1], y: f(xs[1]) + pick([0.5, -0.5]), art: 'knapp' },
      { x: xs[2], y: m * xs[2] - t, art: 'vorzeichen' },
      { x: xs[3], y: t, art: 'achse' },
    ]
    const ok =
      kandidaten.every(imRaum) &&
      kandidaten.slice(1).every((z) => Math.abs(f(z.x) - z.y) > 0.01) &&
      kandidaten.every((a, i) => kandidaten.every((b, j) => i === j || Math.hypot(a.x - b.x, a.y - b.y) > 1.2))
    if (ok) return { m, t, ziele: mischen(kandidaten) }
  }
}

const gleichung = (r: Runde) => {
  const m = r.m === 1 ? '' : r.m === -1 ? '-' : tx(r.m)
  return `y = ${m}x + ${tx(r.t)}`
}

const ERKLAERUNG: Record<Art, string> = {
  richtig: 'Treffer! Der berechnete y-Wert ist genau die Höhe des Rings.',
  knapp: 'Knapp daneben: Der Ring hängt 0,5 m neben der Flugbahn. Nur die Rechnung entscheidet sicher.',
  vorzeichen: 'Hier wurde t abgezogen statt addiert. Setze den x-Wert genau in die Gleichung ein.',
  achse: 'Dieser Ring hängt auf der Höhe von t. Das ist aber nur die Höhe beim Start (x = 0).',
}

export default function RingCheck() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  useEffect(() => {
    if (phase !== 'flug') return
    let start: number | undefined
    const tick = (t: number) => {
      start ??= t
      const neu = Math.min(1, (t - start) / 1000 / FLUG_DAUER)
      setP(neu)
      if (neu < 1) frame.current = requestAnimationFrame(tick)
      else setPhase('ergebnis')
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  const starten = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.ziele[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setP(0)
    setPhase('flug')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
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
  const startenRef = useRef(starten)
  startenRef.current = starten
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
        startenRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const f = (x: number) => runde.m * x + runde.t
  const xEnde = 12 * p
  const zeigeBahn = phase === 'flug' || phase === 'ergebnis'
  const gewaehlt = wahl !== null ? runde.ziele[wahl] : null

  return (
    <div className="rc-spiel">
      <div className="rc-kopf">
        <span>
          Runde {Math.min(nr + 1, RUNDEN)} von {RUNDEN}
        </span>
        <span aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins ${i < muenzen ? 'rc-muenze-an' : 'rc-muenze-aus'}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <div className="rc-text">
          <p>
            In jeder Runde siehst du nur die Gleichung der Flugbahn. Genau einer von vier Ringen liegt darauf. Mach die Punktprobe, tippe den Ring an und starte die Drohne.
          </p>
          <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPhase('wahl')}>
            Spiel starten
          </button>
        </div>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <>
          <p className="rc-gleichung">
            Flugbahn: <M>{gleichung(runde)}</M>
          </p>
          <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label={`Spielfeld mit vier Ringen. Flugbahn ${gleichung(runde)}.`} className="rc-feld">
            <rect x={G.l} y={G.t} width={G.w - G.l - G.r} height={G.h - G.t - G.b} fill="var(--primary-soft)" />
            {Array.from({ length: 13 }, (_, i) => i).map((v) => (
              <g key={`x${v}`}>
                <line x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--grid)" />
                {v % 2 === 0 && (
                  <text x={gx(v)} y={gy(0) + 24} textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
                    {v}
                  </text>
                )}
              </g>
            ))}
            {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
              <g key={`y${v}`}>
                <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--grid)" />
                {v % 2 === 0 && (
                  <text x={gx(0) - 8} y={gy(v) + 5} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
                    {v}
                  </text>
                )}
              </g>
            ))}
            <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="2" />
            <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="2" />
            {zeigeBahn && (
              <>
                <line x1={gx(0)} y1={gy(f(0))} x2={gx(xEnde)} y2={gy(f(xEnde))} stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
                <g transform={`translate(${gx(xEnde)} ${gy(f(xEnde))})`}>
                  <rect x="-14" y="-8" width="28" height="16" rx="5" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
                  <line x1="-24" x2="24" y1="-10" y2="-10" stroke="var(--ink)" strokeWidth="3" />
                </g>
              </>
            )}
            {runde.ziele.map((z, i) => {
              const an = wahl === i
              const ergebnis = phase === 'ergebnis'
              const farbe = ergebnis && z.art === 'richtig' ? 'var(--correct)' : ergebnis && an ? 'var(--wrong)' : an ? 'var(--highlight)' : 'var(--surface)'
              return (
                <g
                  key={i}
                  role="button"
                  tabIndex={phase === 'wahl' ? 0 : -1}
                  aria-label={`Ring bei (${zahl(z.x)} | ${zahl(z.y)})`}
                  aria-pressed={an}
                  onClick={() => phase === 'wahl' && setWahl(i)}
                  onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                    if (phase === 'wahl' && (e.key === ' ' || e.key === 'Enter')) {
                      e.preventDefault()
                      setWahl(i)
                    }
                  }}
                  style={{ cursor: phase === 'wahl' ? 'pointer' : 'default' }}
                >
                  <circle cx={gx(z.x)} cy={gy(z.y)} r="26" fill="transparent" />
                  <circle cx={gx(z.x)} cy={gy(z.y)} r="16" fill={farbe} fillOpacity={an || ergebnis ? 0.85 : 0.5} stroke="var(--ink)" strokeWidth={an ? 4.5 : 3} />
                  <text x={gx(z.x)} y={gy(z.y) - 24} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
                    ({zahl(z.x)} | {zahl(z.y)})
                  </text>
                </g>
              )
            })}
          </svg>
          {phase === 'wahl' && (
            <button type="button" className="bk-btn bk-btn-primary" disabled={wahl === null} onClick={starten}>
              <i className="fa-solid fa-plane-up" aria-hidden="true" /> Drohne starten
            </button>
          )}
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
        <div className="rc-text">
          <p>
            <strong>
              {muenzen} von {RUNDEN} Ringen getroffen.
            </strong>{' '}
            {muenzen === RUNDEN ? 'Perfekter Parcours!' : muenzen >= 2 ? 'Gut gemacht, die Punktprobe sitzt.' : 'Rechne bei jedem Ring nach: x einsetzen, y vergleichen.'}
          </p>
          <button type="button" className="bk-btn" onClick={nochmal}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Nochmal spielen
          </button>
        </div>
      )}
    </div>
  )
}
