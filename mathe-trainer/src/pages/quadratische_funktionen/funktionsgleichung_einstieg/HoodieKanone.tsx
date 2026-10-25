import { useEffect, useRef, useState } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'

// Bonus-Spiel „Hoodie-Kanone“ am Ende der Lernsituation „Die Hoodie-Bestellung“: Am Sommerfest schießt eine Kanone
// Hoodies ins Publikum. Bekannt sind die Abschusshöhe c und zwei Ringe P und Q, durch die der Hoodie fliegen soll.
// Die SuS stellen das Gleichungssystem auf (oder machen mit den vier Angeboten die Punktprobe) und wählen die Flugbahn.
// Die Flugbahn wird erst beim Abschuss gezeichnet. Falsche Angebote sind typische Fehler: Vorzeichen von a oder b
// verdreht, a und b vertauscht. Fünf Runden, jeder Hoodie durch beide Ringe bringt eine Münze.
// Bedienung: Flugbahn antippen oder Pfeiltasten, dann „Feuer!“ bzw. Enter.

type Fehler = 'richtig' | 'vorzeichenA' | 'vorzeichenB' | 'vertauscht'
type Bahn = { a: number; b: number; art: Fehler }
type Ring = { x: number; y: number }
type Runde = { c: number; p: Ring; q: Ring; bahnen: Bahn[] }
type Phase = 'start' | 'wahl' | 'flug' | 'ergebnis' | 'ende'

const RUNDEN = 5
const FLUG_DAUER = 2.2 // Sekunden für den ganzen Flug

const G = { w: 760, h: 340, l: 40, r: 16, t: 16, b: 40, xMax: 12, yMax: 10 }
const gx = (x: number) => G.l + (x / G.xMax) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
/** Zahl als Text mit Komma und echtem Minus, z. B. „−0,5“ */
const zahl = (v: number) => fmt(v).replace('-', '−')
const hoehe = (r: Runde, bahn: Bahn, x: number) => bahn.a * x * x + bahn.b * x + r.c

function neueRunde(): Runde {
  for (;;) {
    const a = pick([-0.25, -0.5, -1])
    const b = pick([1, 2, 3, 4])
    const c = pick([1, 2, 3])
    const x1 = pick([1, 2, 3])
    const x2 = x1 + pick([2, 3, 4])
    const f = (x: number) => a * x * x + b * x + c
    const top = c - (b * b) / (4 * a)
    // Landestelle: positive Nullstelle der Flugbahn; der Hoodie soll weit genug über die Wiese fliegen
    const lande = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)
    if (top > 9.5 || f(x1) < 1 || f(x2) < 1 || x2 >= lande || lande < 5 || lande > 12) continue
    const bahnen: Bahn[] = mischen([
      { a, b, art: 'richtig' },
      { a: -a, b, art: 'vorzeichenA' },
      { a, b: -b, art: 'vorzeichenB' },
      { a: b, b: a, art: 'vertauscht' },
    ])
    return { c, p: { x: x1, y: f(x1) }, q: { x: x2, y: f(x2) }, bahnen }
  }
}

/** Flugbahn als TeX, z. B. „y = −0,5x² + 3x + 2“ */
const gleichung = (bahn: Bahn, c: number) => {
  const a = bahn.a === 1 ? '' : bahn.a === -1 ? '-' : tx(bahn.a)
  const b = bahn.b === 1 ? ' + x' : bahn.b === -1 ? ' - x' : bahn.b > 0 ? ` + ${tx(bahn.b)}x` : ` - ${tx(-bahn.b)}x`
  return `y = ${a}x^2${b} + ${tx(c)}`
}

const TIPP: Record<Fehler, string> = {
  richtig: 'Volltreffer! Der Hoodie fliegt durch beide Ringe.',
  vorzeichenA: 'Hier hat a das falsche Vorzeichen. Mit a > 0 ist die Parabel nach oben geöffnet, der Hoodie fliegt davon. Beim Subtrahieren wird jeder Summand abgezogen.',
  vorzeichenB: 'Hier hat b das falsche Vorzeichen. Achte beim Einsetzen in Gleichung I auf das Minus.',
  vertauscht: 'Hier sind a und b vertauscht. a steht vor x², b vor x.',
}

/** Punkte der Flugbahn von der Kanone bis zum Boden bzw. Bildrand, gekürzt auf den Anteil p */
function flugPunkte(r: Runde, bahn: Bahn, p: number) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= 240; i++) {
    const x = (i / 240) * G.xMax
    const y = hoehe(r, bahn, x)
    pts.push({ x, y })
    if (y < 0 || y > G.yMax + 0.5) break
  }
  const n = Math.max(1, Math.round(pts.length * p))
  return pts.slice(0, n)
}

function HoodieForm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 -12 L-6 -16 Q0 -22 6 -16 L14 -12 L20 -2 L14 1 L11 -5 L11 14 L-11 14 L-11 -5 L-14 1 L-20 -2 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M-5 6 h10" stroke="var(--primary-soft)" strokeWidth="2" />
    </g>
  )
}

export default function HoodieKanone() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Abschuss: Der Hoodie fliegt die gewählte Bahn entlang, danach Auswertung
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

  const feuern = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.bahnen[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setP(0)
    setPhase('flug')
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
  // Pfeiltasten wählen eine Flugbahn, Enter feuert (nur während der Wahl, nicht in Eingabefeldern)
  const feuernRef = useRef(feuern)
  feuernRef.current = feuern
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
        feuernRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const gewaehlt = wahl === null ? null : runde.bahnen[wahl]
  const richtig = runde.bahnen.find((b) => b.art === 'richtig')!
  const flug = gewaehlt && (phase === 'flug' || phase === 'ergebnis') ? flugPunkte(runde, gewaehlt, p) : []
  const kopf = flug[flug.length - 1]
  const durch = (r: Ring) => gewaehlt !== null && Math.abs(hoehe(runde, gewaehlt, r.x) - r.y) < 0.01

  return (
    <div className="hb-spiel" data-no-autocheck>
      <div className="hb-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Hoodie-Kanone' : `Runde ${nr + 1} von ${RUNDEN}`}</span>
        <span className="hb-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' hb-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Am Sommerfest schießt die Hoodie-Kanone Hoodies ins Publikum. Jeder Hoodie soll durch zwei Ringe fliegen. Stelle die Flugbahn auf (oder prüfe die Angebote mit
          den Ringen), wähle die richtige Gleichung und feuere. Für jeden Hoodie durch beide Ringe bekommst du eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="hb-spiel-frage">
          Abschusshöhe <M>{`c = ${tx(runde.c)}`}</M>, Ring 1 bei <M>{`P(${tx(runde.p.x)} \\mid ${tx(runde.p.y)})`}</M>, Ring 2 bei{' '}
          <M>{`Q(${tx(runde.q.x)} \\mid ${tx(runde.q.y)})`}</M>. Welche Flugbahn ist richtig?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <svg
          viewBox={`0 0 ${G.w} ${G.h}`}
          role="img"
          aria-label={`Festwiese mit der Hoodie-Kanone in ${zahl(runde.c)} m Höhe und zwei Ringen bei P(${zahl(runde.p.x)} | ${zahl(runde.p.y)}) und Q(${zahl(runde.q.x)} | ${zahl(runde.q.y)}).`}
          className="hb-spiel-bild"
        >
          <rect x="0" y="0" width={G.w} height={G.h} rx="12" fill="var(--primary-soft)" />
          {Array.from({ length: G.xMax + 1 }, (_, i) => i).map((v) => (
            <g key={`x${v}`}>
              <line x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
              <text x={gx(v)} y={gy(0) + 26} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          {[2, 4, 6, 8, 10].map((v) => (
            <g key={`y${v}`}>
              <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--surface)" strokeWidth="1.5" />
              <text x={gx(0) - 7} y={gy(v) + 6} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
          <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          {/* Kanone auf einem Podest in Höhe c */}
          <rect x={gx(0) - 2} y={gy(runde.c)} width="22" height={gy(0) - gy(runde.c)} fill="var(--line-strong)" stroke="var(--ink)" strokeWidth="1.5" />
          <rect x={gx(0) - 4} y={gy(runde.c) - 12} width="40" height="16" rx="6" fill="var(--ink)" transform={`rotate(-30 ${gx(0)} ${gy(runde.c)})`} />
          {/* Ringe */}
          {[runde.p, runde.q].map((r, i) => {
            const ok = phase === 'ergebnis' && durch(r)
            const vorbei = phase === 'ergebnis' && !durch(r)
            return (
              <g key={i}>
                <line x1={gx(r.x)} x2={gx(r.x)} y1={gy(0)} y2={gy(r.y) + 20} stroke="var(--ink)" strokeWidth="2" />
                <ellipse
                  cx={gx(r.x)}
                  cy={gy(r.y)}
                  rx="9"
                  ry="20"
                  fill="none"
                  stroke={ok ? 'var(--correct)' : vorbei ? 'var(--wrong)' : 'var(--highlight)'}
                  strokeWidth="6"
                />
                <text x={gx(r.x) + 16} y={gy(r.y) - 18} fontSize="17" fontWeight="700" fill="var(--ink)">
                  {i === 0 ? 'P' : 'Q'}({zahl(r.x)} | {zahl(r.y)})
                </text>
              </g>
            )
          })}
          {flug.length > 1 && (
            <polyline
              points={flug.map((pt) => `${gx(pt.x)},${gy(Math.max(-0.5, Math.min(G.yMax + 0.5, pt.y)))}`).join(' ')}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          )}
          {kopf && <HoodieForm x={gx(kopf.x)} y={gy(Math.max(0, Math.min(G.yMax, kopf.y)))} />}
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
          <div className="hb-wahl" role="radiogroup" aria-label="Welche Flugbahn geht durch beide Ringe?">
            {runde.bahnen.map((b, i) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                <M>{gleichung(b, runde.c)}</M>
              </button>
            ))}
          </div>
          <div className="bk-actions hb-steuer">
            <button type="button" className="bk-btn bk-btn-primary" onClick={feuern} disabled={wahl === null}>
              <i className="fa-solid fa-shirt" aria-hidden="true" /> Feuer!
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe eine Flugbahn an.' : 'Flugbahn gewählt. Bereit?'}</span>
          </div>
        </>
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
                  Probe mit Ring 1: <M>{`x = ${tx(runde.p.x)}{:}\\; y = ${tx(hoehe(runde, gewaehlt, runde.p.x))}`}</M> statt <M>{tx(runde.p.y)}</M>. Richtig ist{' '}
                  <M>{gleichung(richtig, runde.c)}</M>.
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
          <p className="hb-spiel-ende">
            <i className={`fa-solid ${muenzen >= 4 ? 'fa-trophy' : 'fa-shirt'}`} aria-hidden="true" /> {muenzen} von {RUNDEN} Hoodies sind durch beide Ringe geflogen.{' '}
            {muenzen === RUNDEN ? 'Perfekt, das Publikum jubelt!' : muenzen >= 4 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
