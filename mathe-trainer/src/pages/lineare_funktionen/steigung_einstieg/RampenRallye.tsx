import { useEffect, useRef, useState } from 'react'
import { M } from '../../daten_und_zufall/lernpfad/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'
import { zahl } from './grafik'

// Bonus-Spiel „Rampen-Check“ am Ende der Lernsituation „Der Bikepark“: Eine neue Auffahrt (oder Abfahrt) ist als Ursprungsgerade
// gezeichnet, ein Punkt auf einer Kästchenecke hilft beim Steigungsdreieck. Die SuS wählen die Steigung, dann fährt das Rad die Rampe hoch.
// Nur bei der richtigen Steigung sammelt es die Münze ein. Falsche Antworten sind typische Fehler: Kehrwert (Δx : Δy), nur Δy, Vorzeichen.
// Nur Geraden vom Typ y = m · x. Vier Runden, je 2 Punkte (zusammen höchstens 8 wie die beste Übungsaufgabe). Keine Uhr.

type Fehler = 'richtig' | 'kehrwert' | 'dy' | 'vorzeichen'
type Wahl = { tex: string; art: Fehler }
type Runde = { dx: number; dy: number; wahl: Wahl[] }
type Phase = 'start' | 'wahl' | 'fahren' | 'ergebnis' | 'ende'

const RUNDEN = 4
const DAUER = 1.4
/** Steigungsdreiecke (Δx, Δy) mit Δx ≥ 2, damit „nur Δy“ nie zufällig die richtige Antwort ist */
const PAARE: [number, number][] = [
  [2, 1], [2, 3], [4, 3], [3, 2], [4, 1], [3, 1], [2, -1], [4, -3], [3, -2], [2, -3], [4, -1],
]

const R = { l: 40, r: 30, t: 22, b: 30, xMax: 6, yMax: 4, u: 46 }
const G = { ...R, w: R.l + R.r + R.xMax * R.u, h: R.t + R.b + 2 * R.yMax * R.u }
const gx = (x: number) => G.l + x * G.u
const gy = (y: number) => G.t + (G.yMax - y) * G.u

const ggt = (a: number, b: number): number => (b === 0 ? Math.abs(a) : ggt(b, a % b))
/** Bruch z/n als TeX: als Dezimalzahl, wenn sie abbricht und kurz ist, sonst gekürzt als Bruch */
function bruch(z: number, n: number) {
  const g = ggt(z, n)
  let a = z / g
  let b = n / g
  if (b < 0) {
    a = -a
    b = -b
  }
  if ([1, 2, 4, 5].includes(b)) return zahl(a / b).replace(',', '{,}').replace('−', '-')
  return `${a < 0 ? '-' : ''}\\tfrac{${Math.abs(a)}}{${b}}`
}
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

function neueRunde(alt?: Runde): Runde {
  let p: [number, number]
  do p = PAARE[Math.floor(Math.random() * PAARE.length)]
  while (alt && p[0] === alt.dx && p[1] === alt.dy)
  const [dx, dy] = p
  const wahl: Wahl[] = [
    { tex: bruch(dy, dx), art: 'richtig' },
    { tex: bruch(dx, dy), art: 'kehrwert' },
    { tex: bruch(dy, 1), art: 'dy' },
    { tex: bruch(-dy, dx), art: 'vorzeichen' },
  ]
  return { dx, dy, wahl: mischen(wahl) }
}

const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Die Steigung passt, das Rad schafft die Rampe.',
  kehrwert: 'Hier wurde Δx durch Δy gerechnet. Die Steigung ist Δy durch Δx: nach oben geteilt durch nach rechts.',
  dy: 'Das ist nur Δy. Du musst noch durch Δx teilen, also durch die Kästchen nach rechts.',
  vorzeichen: 'Das Vorzeichen stimmt nicht. Steigt die Gerade, ist m positiv; fällt sie, ist m negativ.',
}

export default function RampenRallye() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(() => neueRunde())
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()
  const m = runde.dy / runde.dx

  // Fahrt: Das Rad fährt vom Ursprung aus die Gerade entlang, danach Auswertung
  useEffect(() => {
    if (phase !== 'fahren') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
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

  const losfahren = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.wahl[wahl].art === 'richtig') setMuenzen((n) => n + 1)
    setP(0)
    setPhase('fahren')
  }
  const weiter = () => {
    if (nr + 1 >= RUNDEN) {
      meldeSpiel(muenzen, RUNDEN)
      return setPhase('ende')
    }
    setNr(nr + 1)
    setRunde((r) => neueRunde(r))
    setWahl(null)
    setP(0)
    setPhase('wahl')
  }
  const nochmal = () => {
    setNr(0)
    setMuenzen(0)
    setRunde((r) => neueRunde(r))
    setWahl(null)
    setP(0)
    setPhase('start')
  }
  // Pfeiltasten wählen, Enter fährt los (nicht in Eingabefeldern)
  const losRef = useRef(losfahren)
  losRef.current = losfahren
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
        losRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const gewaehlt = wahl === null ? null : runde.wahl[wahl]
  const richtig = runde.wahl.find((w) => w.art === 'richtig')!
  // Ende der Rampe: x = 6 oder Rand des Bildes; dort liegt die Münze
  const xEnde = Math.min(G.xMax, (G.yMax - 0.4) / Math.abs(m))
  const rad = { x: xEnde * p, y: m * xEnde * p }
  const ok = gewaehlt?.art === 'richtig'

  return (
    <div className="bp-spiel" data-no-autocheck>
      <div className="bp-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Rampen-Check' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="bp-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' bp-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Der Planer zeigt dir neue Rampen. Lies mit einem Steigungsdreieck die Steigung ab: Der Punkt auf der Geraden liegt genau auf einer Kästchenecke. Bei der richtigen
          Steigung fährt das Rad hoch und holt die Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <>
          <p className="bp-spiel-frage">Welche Steigung hat diese Rampe?</p>
          <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label={`Ursprungsgerade durch den Punkt (${zahl(runde.dx)} | ${zahl(runde.dy)}). Am Ende liegt eine Münze.`} className="bp-spiel-bild">
            <rect x="0" y="0" width={G.w} height={G.h} rx="18" fill="var(--primary-soft)" />
            {Array.from({ length: G.xMax + 1 }, (_, i) => i).map((v) => (
              <g key={`x${v}`}>
                <line x1={gx(v)} x2={gx(v)} y1={gy(G.yMax)} y2={gy(-G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
                {v !== 0 && (
                  <text x={gx(v)} y={gy(0) + 20} textAnchor="middle" fontSize="16" fill="var(--ink-muted)">
                    {zahl(v)}
                  </text>
                )}
              </g>
            ))}
            {Array.from({ length: 2 * G.yMax + 1 }, (_, i) => i - G.yMax).map((v) => (
              <g key={`y${v}`}>
                <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
                {v !== 0 && (
                  <text x={gx(0) - 7} y={gy(v) + 6} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
                    {zahl(v)}
                  </text>
                )}
              </g>
            ))}
            <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="2" />
            <line x1={gx(0)} x2={gx(0)} y1={gy(-G.yMax)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="2" />
            {/* Rampe als Keil */}
            <polygon points={`${gx(0)},${gy(0)} ${gx(xEnde)},${gy(0)} ${gx(xEnde)},${gy(m * xEnde)}`} fill="var(--primary)" opacity="0.18" />
            <line x1={gx(0)} y1={gy(0)} x2={gx(xEnde)} y2={gy(m * xEnde)} stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
            <circle cx={gx(runde.dx)} cy={gy(runde.dy)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
            {/* Münze am Ende */}
            {!(phase === 'ergebnis' && ok) && (
              <circle cx={gx(xEnde)} cy={gy(m * xEnde) - 22} r="13" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
            )}
            {/* Rad */}
            {(phase === 'fahren' || phase === 'ergebnis') && (
              <g transform={`translate(${gx(phase === 'ergebnis' && !ok ? rad.x * 0.5 : rad.x)} ${gy(phase === 'ergebnis' && !ok ? rad.y * 0.5 : rad.y)}) rotate(${(-Math.atan(m) * 180) / Math.PI})`}>
                <g stroke="var(--ink)" strokeWidth="3" fill="var(--surface)">
                  <circle cx="-12" cy="-10" r="9" />
                  <circle cx="12" cy="-10" r="9" />
                </g>
                <path d="M-12 -10 L-3 -24 L9 -24 L12 -10 M-3 -24 L1 -10 L9 -24" stroke="var(--primary)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
            )}
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
          <div className="bp-wahl" role="radiogroup" aria-label="Welche Steigung hat die Rampe?">
            {runde.wahl.map((w, i) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                <M>{`m = ${w.tex}`}</M>
              </button>
            ))}
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={losfahren} disabled={wahl === null}>
              <i className="fa-solid fa-person-biking" aria-hidden="true" /> Losfahren!
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe eine Steigung an.' : 'Gewählt. Jetzt losfahren!'}</span>
          </div>
        </>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${ok ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {ok ? 'Münze eingesammelt! ' : 'Das Rad bleibt stecken. '}
              {ERKLAERUNG[gewaehlt.art]} Steigungsdreieck: <M>{`\\Delta x = ${runde.dx}`}</M>, <M>{`\\Delta y = ${runde.dy}`}</M>, also <M>{`m = ${richtig.tex}`}</M>.
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
          <p className="bp-spiel-ende">
            <i className={`fa-solid ${muenzen >= RUNDEN - 1 ? 'fa-trophy' : 'fa-person-biking'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Münzen eingesammelt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, du bist bereit für den Bikepark!' : muenzen >= RUNDEN - 1 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
