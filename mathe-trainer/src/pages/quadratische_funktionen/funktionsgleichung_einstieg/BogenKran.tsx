import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'

// Bonus-Spiel „Bogen-Kran“ am Ende der Lernsituation „Der Torbogen“: Jede Runde kommt ein neuer Auftrag mit Scheitelpunkt S und
// linkem Pfosten P. Am Kran hängen drei Bögen aus der Biegemaschine, jeder mit seiner Gleichung in Scheitelform. Die SuS rechnen a aus,
// wählen den passenden Bogen und der Kran senkt ihn auf die Pfosten. Passt er, gibt es eine Münze. Die falschen Bögen sind typische
// Fehler: Vorzeichen von a, Klammer nicht quadriert, y_S vergessen. Vier Runden, keine Zeitnot.
// Bedienung: Tippen auf einen Bogen oder Pfeiltasten links/rechts, dann „Bogen einsetzen“ (oder Enter).

type Fehler = 'richtig' | 'vorzeichen' | 'quadrat' | 'ohneYs'
type Bogen = { a: number; art: Fehler }
type Auftrag = { xs: number; ys: number; d: number; yp: number; boegen: Bogen[] }
type Phase = 'start' | 'wahl' | 'senken' | 'ergebnis' | 'ende'

const RUNDEN = 4
const DAUER = 2.8 // Sekunden, bis der Bogen auf den Pfosten sitzt
const SCHNELL = 0.5

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

/** Neuer Auftrag; der richtige Bogen steht nie an erster Stelle */
function neuerAuftrag(): Auftrag {
  for (;;) {
    const d = pick([1, 2, 2, 3])
    const xs = pick([3, 4].filter((x) => x - d >= 0 && x + d <= 7))
    const yp = pick([1, 1.5, 2])
    const diff = d === 3 ? pick([2.25, 4.5]) : d === 2 ? pick([1, 2, 3]) : pick([1, 2])
    const ys = yp + diff
    if (ys > 5.5) continue
    const a = (yp - ys) / (d * d)
    const fehler = ([
      { a: -a, art: 'vorzeichen' },
      { a: (yp - ys) / d, art: 'quadrat' },
      { a: yp / (d * d), art: 'ohneYs' },
    ] as Bogen[]).filter((b) => Math.abs(b.a - a) > 1e-9)
    const zwei = fehler.sort(() => Math.random() - 0.5).filter((b, i, arr) => arr.findIndex((c) => Math.abs(c.a - b.a) < 1e-9) === i).slice(0, 2)
    if (zwei.length < 2) continue
    const pos = 1 + Math.floor(Math.random() * 2)
    const boegen = [...zwei]
    boegen.splice(pos, 0, { a, art: 'richtig' })
    return { xs, ys, d, yp, boegen }
  }
}

const ERKLAERUNG: Record<Fehler, ReactNode> = {
  richtig: 'Der Bogen sitzt genau auf beiden Pfosten.',
  vorzeichen: (
    <>
      Das Vorzeichen von <M>a</M> stimmt nicht: Der Bogen hängt durch, statt oben rund zu sein. Ein Torbogen braucht ein negatives <M>a</M>.
    </>
  ),
  quadrat: (
    <>
      Hier wurde die Klammer nicht quadriert. Beim Einsetzen von <M>P</M> rechnest du <M>{'(x_P - x_S)^2'}</M>.
    </>
  ),
  ohneYs: (
    <>
      Hier fehlt <M>{'y_S'}</M>. Nach dem Einsetzen von <M>P</M> ziehst du zuerst <M>{'y_S'}</M> ab und teilst erst dann durch die Zahl vor <M>a</M>.
    </>
  ),
}

/* Spielfläche: Einfahrt im Koordinatensystem, oben der Kran mit drei Bögen */
const W = 760
const H = 420
const XMIN = -0.5
const XMAX = 7.5
const YMAX = 7.2
const L = 30
const R = 20
const B = 40
const T = 20
const gx = (x: number) => L + ((x - XMIN) / (XMAX - XMIN)) * (W - L - R)
const gy = (y: number) => H - B - (y / YMAX) * (H - T - B)

/** Bogen als Polyline zwischen den Pfosten (etwas darüber hinaus, damit man sieht, wo er landet) */
function bogenPunkte(a: number, xs: number, ys: number, d: number, dy = 0) {
  const von = xs - d - 0.35
  const bis = xs + d + 0.35
  return Array.from({ length: 41 }, (_, i) => von + ((bis - von) * i) / 40)
    .map((x) => {
      const y = Math.min(YMAX + 3, a * (x - xs) ** 2 + ys)
      return `${gx(x)},${gy(y) - dy}`
    })
    .join(' ')
}

const scheitelTex = (a: number, xs: number, ys: number) => `y = ${tx(a)}(x - ${tx(xs)})^2 + ${tx(ys)}`

export default function BogenKran() {
  const [phase, setPhase] = useState<Phase>('start')
  const [runde, setRunde] = useState(0)
  const [auftrag, setAuftrag] = useState<Auftrag>(neuerAuftrag)
  const [wahl, setWahl] = useState(0)
  const [hoehe, setHoehe] = useState(1) // 1 = oben am Kran, 0 = auf den Pfosten
  const [schnell, setSchnell] = useState(false)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const letzte = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  useEffect(() => {
    if (phase === 'ende') meldeSpiel(muenzen, RUNDEN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (phase !== 'senken') return
    const tick = (t: number) => {
      const dt = letzte.current === undefined ? 0 : (t - letzte.current) / 1000
      letzte.current = t
      setHoehe((h) => Math.max(0, h - dt / (schnell ? SCHNELL : DAUER)))
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
      letzte.current = undefined
    }
  }, [phase, schnell])

  useEffect(() => {
    if (phase !== 'senken' || hoehe > 0) return
    if (auftrag.boegen[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setPhase('ergebnis')
  }, [hoehe, phase, auftrag, wahl])

  const starteRunde = () => {
    setWahl(0)
    setHoehe(1)
    setSchnell(false)
    setPhase('wahl')
  }
  const einsetzen = () => {
    if (phase !== 'wahl') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setHoehe(0)
    setPhase('senken')
  }
  const weiter = () => {
    if (runde + 1 >= RUNDEN) return setPhase('ende')
    setRunde(runde + 1)
    setAuftrag(neuerAuftrag())
    starteRunde()
  }
  const nochmal = () => {
    setRunde(0)
    setMuenzen(0)
    setAuftrag(neuerAuftrag())
    setHoehe(1)
    setPhase('start')
  }
  const taste = (e: KeyboardEvent) => {
    if (phase !== 'wahl') return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setWahl((w) => Math.max(0, w - 1))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setWahl((w) => Math.min(2, w + 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      einsetzen()
    }
  }

  const { xs, ys, d, yp, boegen } = auftrag
  const gewaehlt = boegen[wahl]
  const richtig = boegen.find((b) => b.art === 'richtig')!
  const zeigeBogen = phase === 'senken' || phase === 'ergebnis'
  const absenk = hoehe * (gy(0) - 40)

  return (
    <div className="tb-spiel" onKeyDown={taste} tabIndex={0} aria-label="Bogen-Kran, Bogen wählen mit den Pfeiltasten, einsetzen mit Enter" data-no-autocheck>
      <div className="tb-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : `Auftrag ${runde + 1} von ${RUNDEN}`}</span>
        <span className="tb-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' tb-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Die Biegemaschine hat für jeden Auftrag drei Bögen gebogen, aber nur einer passt. Berechne mit dem Scheitelpunkt und dem linken Pfosten den Formfaktor <M>a</M>, wähle den
          passenden Bogen und lass ihn vom Kran auf die Pfosten setzen. Für jeden Bogen, der passt, bekommst du eine Münze.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="tb-spiel-frage">
          Scheitelpunkt <M>{`S(${tx(xs)} \\mid ${tx(ys)})`}</M>, linker Pfosten <M>{`P(${tx(xs - d)} \\mid ${tx(yp)})`}</M>. Welcher Bogen passt?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <div className="tb-kran-wahl" role="radiogroup" aria-label="Bögen am Kran">
          {boegen.map((b, i) => {
            const zustand = phase === 'ergebnis' ? (b.art === 'richtig' ? ' tb-kran-ok' : i === wahl ? ' tb-kran-no' : '') : ''
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={i === wahl}
                className={`tb-kran-bogen${i === wahl ? ' tb-kran-an' : ''}${zustand}`}
                onClick={() => phase === 'wahl' && setWahl(i)}
                disabled={phase !== 'wahl' && i !== wahl}
              >
                <span className="tb-kran-nr">Bogen {i + 1}</span>
                <M>{scheitelTex(b.a, xs, ys)}</M>
              </button>
            )
          })}
        </div>
      )}
      {phase !== 'ende' && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={
            phase === 'start'
              ? 'Hofeinfahrt mit zwei Pfosten und einem Kran darüber'
              : `Hofeinfahrt im Koordinatensystem mit dem Scheitelpunkt und zwei Pfosten bei x = ${fmt(xs - d)} und x = ${fmt(xs + d)}, jeweils ${fmt(yp)} m hoch. Darüber der Kran.`
          }
          className="tb-spiel-bild"
        >
          <defs>
            <clipPath id="tb-kran-clip">
              <rect x="0" y="16" width={W} height={gy(0) - 16} />
            </clipPath>
          </defs>
          <rect x="0" y="0" width={W} height={H} rx="12" fill="var(--surface-sunken)" />
          {Array.from({ length: 8 }, (_, x) => (
            <g key={`x${x}`}>
              <line x1={gx(x)} x2={gx(x)} y1={gy(0)} y2={gy(YMAX)} stroke="var(--grid)" />
              <text x={gx(x)} y={gy(0) + 26} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
                {x}
              </text>
            </g>
          ))}
          {Array.from({ length: 7 }, (_, y) => y + 1).map((y) => (
            <line key={`y${y}`} x1={gx(XMIN)} x2={gx(XMAX)} y1={gy(y)} y2={gy(y)} stroke="var(--grid)" />
          ))}
          <line x1={gx(XMIN)} x2={gx(XMAX)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
          {/* Kranausleger */}
          <rect x="0" y="0" width={W} height="16" fill="var(--ink-muted)" />
          {phase !== 'start' && (
            <>
              <line x1={gx(xs)} x2={gx(xs)} y1="16" y2={zeigeBogen ? Math.max(16, gy(ys) - absenk - 6) : 56} stroke="var(--ink)" strokeWidth="2" />
              {!zeigeBogen && <path d={`M${gx(xs)} 56 q0 12 -10 12`} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />}
              {[xs - d, xs + d].map((x) => (
                <rect key={x} x={gx(x) - 8} y={gy(yp)} width="16" height={gy(0) - gy(yp)} fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
              ))}
              {zeigeBogen && (
                <polyline
                  clipPath="url(#tb-kran-clip)"
                  points={bogenPunkte(gewaehlt.a, xs, ys, d, absenk)}
                  fill="none"
                  stroke={phase === 'ergebnis' ? (gewaehlt.art === 'richtig' ? 'var(--correct)' : 'var(--wrong)') : 'var(--primary)'}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              )}
              <circle cx={gx(xs)} cy={gy(ys)} r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
              <text x={gx(xs) + 14} y={gy(ys) + 24} fontSize="18" fontWeight="700" fill="var(--ink)">
                S
              </text>
              <circle cx={gx(xs - d)} cy={gy(yp)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
              <text x={gx(xs - d) - 12} y={gy(yp) + 6} textAnchor="end" fontSize="18" fontWeight="700" fill="var(--ink)">
                P
              </text>
            </>
          )}
          <text x={gx(XMAX) - 4} y={gy(0) - 10} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
            x in m
          </text>
        </svg>
      )}
      {phase === 'start' && (
        <div className="bk-actions">
          <button type="button" className="bk-btn bk-btn-primary" onClick={starteRunde}>
            <i className="fa-solid fa-play" aria-hidden="true" /> Ersten Auftrag holen
          </button>
        </div>
      )}
      {phase === 'wahl' && (
        <div className="bk-actions tb-steuer">
          <button type="button" className="bk-btn bk-btn-primary" onClick={einsetzen}>
            <i className="fa-solid fa-arrow-down" aria-hidden="true" /> Bogen {wahl + 1} einsetzen
          </button>
        </div>
      )}
      {phase === 'senken' && (
        <div className="bk-actions tb-steuer">
          <button type="button" className="bk-btn" onClick={() => setSchnell(true)}>
            <i className="fa-solid fa-forward" aria-hidden="true" /> Schneller absenken
          </button>
        </div>
      )}
      {phase === 'ergebnis' && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Passt, Münze eingesammelt! ' : <>Der Bogen passt nicht. {ERKLAERUNG[gewaehlt.art]} </>}
              Richtig ist <M>{`a = ${tx(richtig.a)}`}</M>, denn <M>{`${tx(yp)} = a \\cdot (${tx(xs - d)} - ${tx(xs)})^2 + ${tx(ys)}`}</M>.
            </span>
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {runde + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächster Auftrag'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {phase === 'ende' && (
        <>
          <p className="tb-spiel-ende">
            <i className={`fa-solid ${muenzen >= RUNDEN - 1 ? 'fa-trophy' : 'fa-archway'}`} aria-hidden="true" /> {muenzen} von {RUNDEN} Bögen haben gepasst.{' '}
            {muenzen === RUNDEN ? 'Perfekt, alle Einfahrten haben ihren Torbogen!' : muenzen >= RUNDEN - 1 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
