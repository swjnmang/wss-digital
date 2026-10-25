import { useEffect, useRef, useState } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../lernsituation_kit/kit'
import { useSpielPunkte } from '../lernsituation_kit/punkte'

// Bonus-Spiel „Akku-Countdown“ am Ende der Lernsituation „Der Stromspeicher“: Gegeben ist der Ladestand eines Akkus als
// Gerade y = −mx + t. Auf der x-Achse stehen vier Fähnchen, eines davon an der Nullstelle. Die SuS rechnen die Nullstelle
// aus, wählen das Fähnchen und starten den Countdown. Erst dann läuft der Akku die Gerade entlang leer, damit man die Nullstelle
// nicht vorher ablesen kann. Die falschen Fähnchen sind typische Fehler: Vorzeichenfehler (−x_N), y-Achsenabschnitt t statt
// Nullstelle, falsch herum geteilt (m : t) und mal statt geteilt (m · t). Vier Runden, jeder Treffer bringt eine Münze.
// Bedienung: Fähnchen antippen oder Pfeiltasten, dann „Countdown starten“ bzw. Enter.

type Fehler = 'richtig' | 'vorzeichen' | 'achse' | 'kehrwert' | 'mal'
type Ziel = { x: number; art: Fehler }
type Runde = { geraet: string; m: number; t: number; ziele: Ziel[] }
type Phase = 'start' | 'wahl' | 'lauf' | 'ergebnis' | 'ende'

const RUNDEN = 4 // je Münze 2 Punkte: höchstens 8, also nicht mehr als die beste Übungsaufgabe
const LAUF_DAUER = 1.6 // Sekunden, bis der Akku an der Nullstelle angekommen ist

const G = { w: 760, h: 300, l: 24, r: 24, t: 20, b: 46, xMin: -9, xMax: 10, yMax: 6.5 }
const gx = (x: number) => G.l + ((x - G.xMin) / (G.xMax - G.xMin)) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

const GERAETE = ['E-Scooter-Akku', 'Powerbank', 'Stromspeicher', 'Laptop-Akku', 'Akku der Bluetooth-Box']
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const rund = (v: number) => Math.round(v * 100) / 100
/** Zahl als Text mit Komma und echtem Minus, z. B. „−2,5“ */
const zahl = (v: number) => fmt(v, 2).replace('-', '−')

function neueRunde(): Runde {
  for (;;) {
    const xn = pick([2, 3, 4, 5, 6, 8])
    const m = pick([0.5, 0.75, 1, 1.5, 2])
    const t = rund(m * xn)
    if (t < 1.5 || t > 6 || t === xn) continue
    const kandidaten: Ziel[] = [
      { x: -xn, art: 'vorzeichen' },
      { x: t, art: 'achse' },
      { x: rund(m / t), art: 'kehrwert' },
      { x: rund(m * t), art: 'mal' },
    ]
    const ziele: Ziel[] = [{ x: xn, art: 'richtig' }]
    for (const k of mischen(kandidaten)) {
      if (ziele.length === 4) break
      if (k.x >= G.xMin + 0.5 && k.x <= G.xMax - 0.5 && ziele.every((z) => Math.abs(z.x - k.x) > 1.1)) ziele.push(k)
    }
    if (ziele.length === 4) return { geraet: pick(GERAETE), m, t, ziele: mischen(ziele) }
  }
}

const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Treffer! Genau hier ist der Ladestand 0.',
  vorzeichen: 'Hier fehlt ein Minus beim Teilen: Minus durch Minus ergibt Plus. Der Akku wird außerdem erst nach dem Start leer, nicht vorher.',
  achse: 'Das ist der y-Achsenabschnitt t, also der Ladestand am Anfang. Die Nullstelle liegt dort, wo y = 0 ist.',
  kehrwert: 'Hier wurde falsch herum geteilt. Aus −mx + t = 0 folgt x = t : m, nicht m : t.',
  mal: 'Hier wurde malgenommen statt geteilt. Aus −mx = −t folgt x = (−t) : (−m).',
}

export default function AkkuCountdown() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Countdown: Der Akku läuft die Gerade entlang bis zur Nullstelle, danach Auswertung
  useEffect(() => {
    if (phase !== 'lauf') return
    let start: number | undefined
    const tick = (t: number) => {
      start ??= t
      const neu = Math.min(1, (t - start) / 1000 / LAUF_DAUER)
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
    setPhase('lauf')
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
  // Pfeiltasten wählen ein Fähnchen, Enter startet den Countdown (nur während der Wahl, nicht in Eingabefeldern)
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

  const zeigeLauf = phase === 'lauf' || phase === 'ergebnis'
  const gewaehlt = wahl === null ? null : runde.ziele[wahl]
  const xn = runde.t / runde.m
  const xAkku = xn * p
  const yAkku = runde.t - runde.m * xAkku
  // Fähnchen nach x sortiert, damit die Knöpfe in derselben Reihenfolge wie im Bild stehen
  const reihenfolge = runde.ziele.map((z, i) => ({ z, i })).sort((a, b) => a.z.x - b.z.x)

  return (
    <div className="ss-spiel" data-no-autocheck>
      <div className="ss-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Akku-Countdown' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="ss-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' ss-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Ein Akku wird leer, aber wann? Auf der x-Achse stehen vier Fähnchen, nur eines an der Nullstelle. Berechne die Nullstelle in deinem Heft, tippe das richtige
          Fähnchen an und starte den Countdown. Für jeden Treffer bekommst du eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="ss-spiel-frage">
          {runde.geraet}: <M>{`y = -${tx(runde.m)}x + ${tx(runde.t)}`}</M> (<M>x</M> in Stunden). Nach wie vielen Stunden ist er leer?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Koordinatensystem mit vier Fähnchen auf der x-Achse. Unter jedem Fähnchen steht sein x-Wert." className="ss-spiel-bild">
          <rect x="0" y="0" width={G.w} height={G.h} rx="12" fill="var(--primary-soft)" />
          {Array.from({ length: G.xMax - G.xMin + 1 }, (_, i) => G.xMin + i).map((v) => (
            <line key={`x${v}`} x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
          ))}
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <g key={`y${v}`}>
              <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
              <text x={gx(0) - 7} y={gy(v) + 6} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
          <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          {/* Startwert auf der y-Achse ist gegeben */}
          <circle cx={gx(0)} cy={gy(runde.t)} r="7" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
          {zeigeLauf && (
            <g>
              <line x1={gx(0)} y1={gy(runde.t)} x2={gx(xAkku)} y2={gy(yAkku)} stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
              {/* Akku mit sinkendem Ladestand */}
              <g transform={`translate(${gx(xAkku) - 14} ${gy(yAkku) - 44})`}>
                <rect x="0" y="4" width="28" height="36" rx="5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
                <rect x="9" y="0" width="10" height="5" rx="1.5" fill="var(--ink)" />
                <rect x="4" y={8 + 28 * p} width="20" height={Math.max(0, 28 * (1 - p))} rx="2" fill="var(--primary)" />
              </g>
            </g>
          )}
          {runde.ziele.map((z, i) => {
            const an = wahl === i
            const aus = phase === 'ergebnis'
            const fill = aus && z.art === 'richtig' ? 'var(--correct)' : aus && an ? 'var(--wrong)' : an ? 'var(--highlight)' : 'var(--surface)'
            return (
              <g key={i} onClick={() => phase === 'wahl' && setWahl(i)} style={{ cursor: phase === 'wahl' ? 'pointer' : 'default' }}>
                {/* große, unsichtbare Tippfläche (mindestens 44 px) */}
                <rect x={gx(z.x) - 24} y={gy(0) - 64} width="48" height="104" fill="transparent" />
                <line x1={gx(z.x)} x2={gx(z.x)} y1={gy(0)} y2={gy(0) - 52} stroke="var(--ink)" strokeWidth="2.5" />
                <polygon
                  points={`${gx(z.x)},${gy(0) - 52} ${gx(z.x) + (an ? 30 : 26)},${gy(0) - 43} ${gx(z.x)},${gy(0) - 34}`}
                  fill={fill}
                  stroke="var(--ink)"
                  strokeWidth={an ? 2.5 : 2}
                />
                <text x={gx(z.x)} y={gy(0) + 28} textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--ink)" pointerEvents="none">
                  {zahl(z.x)}
                </text>
              </g>
            )
          })}
        </svg>
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
          <div className="ss-wahl" role="radiogroup" aria-label="An welchem Fähnchen ist der Akku leer?">
            {reihenfolge.map(({ z, i }) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                x = {zahl(z.x)}
              </button>
            ))}
          </div>
          <div className="bk-actions ss-steuer">
            <button type="button" className="bk-btn bk-btn-primary" onClick={starten} disabled={wahl === null}>
              <i className="fa-solid fa-battery-quarter" aria-hidden="true" /> Countdown starten
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe ein Fähnchen oder einen Wert an.' : `Gewählt: x = ${zahl(runde.ziele[wahl].x)}`}</span>
          </div>
        </>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : 'Daneben. '}
              {ERKLAERUNG[gewaehlt.art]} {gewaehlt.art !== 'richtig' && <>Richtig ist <M>{`N(${tx(xn, 2)} \\mid 0)`}</M>.</>}
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
          <p className="ss-spiel-ende">
            <i className={`fa-solid ${muenzen >= 4 ? 'fa-trophy' : 'fa-battery-half'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Nullstellen getroffen.{' '}
            {muenzen === RUNDEN ? 'Perfekt, kein Akku überrascht dich mehr!' : muenzen >= 4 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
