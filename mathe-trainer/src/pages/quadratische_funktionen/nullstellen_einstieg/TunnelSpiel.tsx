import { useEffect, useRef, useState } from 'react'
import { M, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { useSpielPunkte } from '../../lineare_funktionen/lernsituation_kit/punkte'

// Bonus-Spiel „Folie spannen“ am Ende der Lernsituation „Der Folientunnel“: Gegeben ist die Gleichung eines neuen Tunnelbogens
// y = ax² + bx + c. Die SuS berechnen die Fußpunkte (Nullstellen) mit der Mitternachtsformel und wählen eines von vier Pflock-Paaren.
// Erst danach wird der Bogen gespannt (er wächst aus dem Boden), damit man die Nullstellen nicht vorher ablesen kann.
// Die falschen Paare sind typische Fehler: −b vergessen (Vorzeichen beider Nullstellen vertauscht), nur durch 2 statt durch 2a geteilt,
// nur die Wurzel durch 2a geteilt (Bruchstrich nicht über den ganzen Zähler). Vier Runden, jeder Treffer bringt eine Münze.
// Bedienung: Paar antippen oder Pfeiltasten, dann „Folie spannen“ bzw. Enter. Keine Zeitwertung.

type Fehler = 'richtig' | 'vorzeichen' | 'nenner' | 'bruch'
type Paar = { x1: number; x2: number; art: Fehler }
type Runde = { a: number; b: number; c: number; paare: Paar[] }
type Phase = 'start' | 'wahl' | 'lauf' | 'ergebnis' | 'ende'

const RUNDEN = 4 // je Münze 2 Punkte: höchstens 8, also nicht mehr als die beste Übungsaufgabe
const LAUF_DAUER = 1.4

const G = { w: 760, h: 300, l: 20, r: 20, t: 18, b: 48, xMin: -7, xMax: 7, yMax: 5 }
const gx = (x: number) => G.l + ((x - G.xMin) / (G.xMax - G.xMin)) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]
const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const rund = (v: number) => Math.round(v * 100) / 100
const zahl = (v: number) => fmt(v, 2).replace('-', '−')
const tz = (v: number) => fmt(Math.abs(v), 3).replace(/\./g, '').replace(',', '{,}')
/** Zahl mit Vorzeichen für KaTeX */
const tzs = (v: number) => `${v < 0 ? '-' : ''}${tz(v)}`

/** y = ax² + bx + c als TeX, z. B. „y = -0{,}5x^2 + x + 4“ */
function gleichung(a: number, b: number, c: number) {
  const glied = (k: number, v: string, erstes: boolean) => {
    if (k === 0) return ''
    const betrag = Math.abs(k) === 1 && v ? '' : tz(k)
    const zeichen = k < 0 ? '-' : erstes ? '' : '+'
    return `${erstes ? '' : ' '}${zeichen}${erstes ? '' : ' '}${betrag}${v}`
  }
  return `y = ${glied(a, 'x^2', true)}${glied(b, 'x', false)}${glied(c, '', false)}`
}

function neueRunde(): Runde {
  for (;;) {
    const r1 = pick([-3, -2.5, -2, -1.5, -1])
    const r2 = pick([1, 1.5, 2, 2.5, 3])
    if (r1 + r2 === 0) continue
    const a = pick([-0.5, -2])
    const b = rund(-a * (r1 + r2))
    const c = rund(a * r1 * r2)
    // Scheitel muss ins Bild passen
    if (c - (b * b) / (4 * a) > G.yMax - 0.3) continue
    const w = Math.sqrt(b * b - 4 * a * c)
    const sort = (p: number, q: number) => (p < q ? [p, q] : [q, p])
    const kandidaten: Paar[] = [
      { art: 'vorzeichen', ...((([p, q]) => ({ x1: p, x2: q }))(sort(-r2, -r1))) },
      { art: 'nenner', ...((([p, q]) => ({ x1: p, x2: q }))(sort(rund((-b + w) / 2), rund((-b - w) / 2)))) },
      { art: 'bruch', ...((([p, q]) => ({ x1: p, x2: q }))(sort(rund(-b + w / (2 * a)), rund(-b - w / (2 * a))))) },
    ]
    const paare: Paar[] = [{ x1: r1, x2: r2, art: 'richtig' }, ...kandidaten]
    const schluessel = paare.map((p) => `${p.x1}|${p.x2}`)
    if (new Set(schluessel).size < 4) continue
    // Die erste Option ist nie die richtige
    let gemischt = mischen(paare)
    while (gemischt[0].art === 'richtig') gemischt = mischen(paare)
    return { a, b, c, paare: gemischt }
  }
}

const ERKLAERUNG: Record<Fehler, string> = {
  richtig: 'Die Folie sitzt! Beide Pflöcke stehen genau an den Fußpunkten.',
  vorzeichen: 'Hier wurde −b vergessen: Am Anfang der Formel steht −b, also das Gegenteil von b. Dadurch sind beide Vorzeichen vertauscht.',
  nenner: 'Hier wurde nur durch 2 geteilt. Im Nenner steht 2 · a, also auch das a mit seinem Vorzeichen.',
  bruch: 'Hier wurde nur die Wurzel durch 2a geteilt. Der Bruchstrich gilt für den ganzen Zähler: Setze ihn im Taschenrechner in Klammern.',
}

export default function TunnelSpiel() {
  const [phase, setPhase] = useState<Phase>('start')
  const [nr, setNr] = useState(0)
  const [runde, setRunde] = useState<Runde>(neueRunde)
  const [wahl, setWahl] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [muenzen, setMuenzen] = useState(0)
  const frame = useRef<number | undefined>(undefined)
  const meldeSpiel = useSpielPunkte()

  // Folie spannen: Der Bogen wächst aus dem Boden (y wird von 0 auf den vollen Wert gestreckt, die Fußpunkte bleiben fest)
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

  const spannen = () => {
    if (phase !== 'wahl' || wahl === null) return
    if (runde.paare[wahl].art === 'richtig') setMuenzen((m) => m + 1)
    setP(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 0)
    setPhase('lauf')
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
  const spannenRef = useRef(spannen)
  spannenRef.current = spannen
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
        spannenRef.current()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [phase])

  const zeigeBogen = phase === 'lauf' || phase === 'ergebnis'
  const gewaehlt = wahl === null ? null : runde.paare[wahl]
  const richtig = runde.paare.find((q) => q.art === 'richtig')!
  const f = (x: number) => runde.a * x * x + runde.b * x + runde.c
  const pfad: string[] = []
  for (let i = 0; i <= 80; i++) {
    const x = richtig.x1 + ((richtig.x2 - richtig.x1) * i) / 80
    pfad.push(`${i ? 'L' : 'M'}${gx(x).toFixed(1)} ${gy(Math.min(G.yMax + 0.6, f(x) * p)).toFixed(1)}`)
  }
  const pflock = (x: number, farbe: string, k: string) =>
    x < G.xMin || x > G.xMax ? null : (
      <g key={k}>
        <rect x={gx(x) - 6} y={gy(0) - 26} width="12" height="34" rx="2" fill={farbe} stroke="var(--ink)" strokeWidth="2" />
        <text x={gx(x)} y={gy(0) + 30} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">
          {zahl(x)}
        </text>
      </g>
    )

  return (
    <div className="ft-spiel" data-no-autocheck>
      <div className="ft-spiel-kopf">
        <span>{phase === 'ende' ? 'Geschafft!' : phase === 'start' ? 'Folie spannen' : `Tunnel ${nr + 1} von ${RUNDEN}`}</span>
        <span className="ft-muenzen" aria-label={`${muenzen} Münzen`}>
          {Array.from({ length: RUNDEN }, (_, i) => (
            <i key={i} className={`fa-solid fa-coins${i < muenzen ? ' ft-muenze-an' : ''}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      {phase === 'start' && (
        <p className="sl-text">
          Die Gärtnerei baut neue Folientunnel auf. Für jeden Bogen bekommst du die Gleichung. Berechne die Fußpunkte in deinem Heft, wähle das passende Pflock-Paar und spanne die
          Folie. Stehen die Pflöcke richtig, bekommst du eine Münze. Lass dir Zeit, es gibt keine Uhr.
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <p className="ft-spiel-frage">
          Neuer Bogen: <M>{gleichung(runde.a, runde.b, runde.c)}</M>. Wo setzt du die Pflöcke?
        </p>
      )}
      {phase !== 'start' && phase !== 'ende' && (
        <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Feld mit Boden als x-Achse. Nach dem Spannen erscheint der Bogen und die gewählten Pflöcke." className="ft-spiel-bild">
          <rect x="0" y="0" width={G.w} height={G.h} rx="6" fill="var(--primary-soft)" />
          {Array.from({ length: G.xMax - G.xMin + 1 }, (_, i) => G.xMin + i).map((v) => (
            <g key={`x${v}`}>
              <line x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--surface)" strokeWidth="1.5" />
              {v % 2 === 0 && !zeigeBogen && (
                <text x={gx(v)} y={gy(0) + 30} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
                  {zahl(v)}
                </text>
              )}
            </g>
          ))}
          <rect x="0" y={gy(0)} width={G.w} height={G.b} fill="#8a6a4a" opacity=".25" />
          <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
          <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          {zeigeBogen && (
            <path d={`${pfad.join(' ')} Z`} fill="var(--surface)" fillOpacity=".55" stroke="var(--primary)" strokeWidth="5" strokeLinejoin="round" />
          )}
          {zeigeBogen && gewaehlt && (
            <>
              {pflock(gewaehlt.x1, phase === 'ergebnis' ? (gewaehlt.art === 'richtig' ? 'var(--correct)' : 'var(--wrong)') : 'var(--highlight)', 'p1')}
              {pflock(gewaehlt.x2, phase === 'ergebnis' ? (gewaehlt.art === 'richtig' ? 'var(--correct)' : 'var(--wrong)') : 'var(--highlight)', 'p2')}
            </>
          )}
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
          <div className="ft-paare" role="radiogroup" aria-label="Wo setzt du die Pflöcke?">
            {runde.paare.map((q, i) => (
              <button key={i} type="button" role="radio" aria-checked={wahl === i} className={`bk-btn${wahl === i ? ' bk-btn-primary' : ''}`} onClick={() => setWahl(i)}>
                <M>{`x = ${tzs(q.x1)} \\text{ und } x = ${tzs(q.x2)}`}</M>
              </button>
            ))}
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={spannen} disabled={wahl === null}>
              <i className="fa-solid fa-arrows-up-down" aria-hidden="true" /> Folie spannen
            </button>
            <span className="sl-hinweis">{wahl === null ? 'Tippe ein Pflock-Paar an.' : `Gewählt: x = ${zahl(runde.paare[wahl].x1)} und x = ${zahl(runde.paare[wahl].x2)}`}</span>
          </div>
        </>
      )}
      {phase === 'ergebnis' && gewaehlt && (
        <>
          <div className={`bk-feedback lp-feedback ${gewaehlt.art === 'richtig' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
            <i className={`fa-solid ${gewaehlt.art === 'richtig' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />{' '}
            <span>
              {gewaehlt.art === 'richtig' ? 'Münze eingesammelt! ' : 'Die Folie hängt schief. '}
              {ERKLAERUNG[gewaehlt.art]}{' '}
              {gewaehlt.art !== 'richtig' && (
                <>
                  Richtig ist <M>{`N_1(${tzs(richtig.x1)} \\mid 0)`}</M> und <M>{`N_2(${tzs(richtig.x2)} \\mid 0)`}</M>.
                </>
              )}
            </span>
          </div>
          <div className="bk-actions">
            <button type="button" className="bk-btn bk-btn-primary" onClick={weiter}>
              {nr + 1 >= RUNDEN ? 'Zum Ergebnis' : 'Nächster Tunnel'} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
      {phase === 'ende' && (
        <>
          <p className="ft-spiel-ende">
            <i className={`fa-solid ${muenzen >= 3 ? 'fa-trophy' : 'fa-leaf'}`} aria-hidden="true" /> Du hast {muenzen} von {RUNDEN} Tunneln richtig abgesteckt.{' '}
            {muenzen === RUNDEN ? 'Perfekt, Frau Kaya ist begeistert!' : muenzen >= 3 ? 'Stark, fast alles richtig!' : 'Probier es noch einmal, du schaffst mehr!'}
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
