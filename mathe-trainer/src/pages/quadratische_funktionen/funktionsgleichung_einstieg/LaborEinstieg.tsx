import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, SchrittHilfen, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import BallonLabor from './BallonLabor'
import { glTex, type Gl } from './gleichungen'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './labor.css'

// Lernsituation 2 „Das Gleichungs-Labor“: das Additions- und Subtraktionsverfahren für lineare Gleichungssysteme (ca. 90 min).
// Grundlage für Lernsituation 3 (Funktionsgleichung aus einem Wert und zwei Punkten). Bewusst ohne Sachkontext: Im Mittelpunkt
// steht das Verfahren. Vorwissen: Gleichsetzen, wenn beide Gleichungen schon nach y aufgelöst sind.
// Format Experimentierlabor: In „Problem erkennen“ raten die SuS das Lösungspaar von I: 3x + 2y = 12, II: x + 2y = 7 (Lösung (2,5 | 2,25),
// im Graphen nur ungefähr abzulesen, Gleichsetzen geht nicht direkt). Danach probieren sie im Gleichungs-Labor I + II und I − II aus.
// Aha: Bei I − II verschwindet y, übrig bleibt 2x = 5.
// Problem lösen in drei Teilen, je Problem → Beispielrechnung mit Lernvideo → Ergebnisse abgleichen:
// Teil 1 subtrahieren (gleiche Zahl vor einer Variablen), Teil 2 addieren (Gegenzahlen), Teil 3 erst eine Gleichung multiplizieren.
// Handlungsprodukt analog: Entscheidungs-Flussdiagramm „Welcher Weg?“ im Heft (Kriterium Begriffe: LGS, I, II, Koeffizient, Lösungspaar, Gegenzahl, Probe).
// Identität: Themenfarbe Violett, Symbol fa-flask, Titelbild Labortafel mit zwei Gleichungen und zwei Geraden, Leitobjekt das Gleichungs-Labor.
// Punkte nach Aufwand: Warm-up 2/2/2/3/4, Punkt-Test 3, Teil 1 10, Teil 2 10, Teil 3 12, Flussdiagramm 5, Übungen 4/6/7/8, Profi 9,
// Bonus-Spiel 4 Münzen à 2 (Pflicht zusammen 78: Warm-up 17 %, Problem erkennen 4 %, Problem lösen 47 %, Übungen 32 %).

/** Lernvideo zum Additions- und Subtraktionsverfahren */
const VIDEO_VERFAHREN = 'https://www.youtube.com/watch?v=TPOc0kgfkCU'

/* ── Gleichungen ─────────────────────────────────────────────────────────── */

const rund = (v: number) => Math.round(v * 1e6) / 1e6
const mal = (g: Gl, k: number): Gl => ({ a: rund(g.a * k), b: rund(g.b * k), c: rund(g.c * k) })
const erfuellt = (g: Gl, x: number, y: number) => Math.abs(g.a * x + g.b * y - g.c) < 0.0051

// Kernaufgabe (Teil 1): I: 3x + 2y = 12, II: x + 2y = 7 → I − II: 2x = 5 → x = 2,5, y = 2,25
const I1: Gl = { a: 3, b: 2, c: 12 }
const II1: Gl = { a: 1, b: 2, c: 7 }
const LOES1 = { x: 2.5, y: 2.25 }
// Teil 2: I: 2x + 3y = 3, II: 4x − 3y = 15 → I + II: 6x = 18 → x = 3, y = −1
const I2: Gl = { a: 2, b: 3, c: 3 }
const II2: Gl = { a: 4, b: -3, c: 15 }
// Teil 3: I: 2x + 3y = 13, II: x + y = 5 → I − II · 2: y = 3 → x = 2
const I3: Gl = { a: 2, b: 3, c: 13 }
const II3: Gl = { a: 1, b: 1, c: 5 }

/** Ein geratenes Lösungspaar in „Problem erkennen“ */
type Paar = { x: number; y: number }
const treffer = (p: Paar) => erfuellt(I1, p.x, p.y) && erfuellt(II1, p.x, p.y)
const abstand = (p: Paar) => Math.hypot(p.x - LOES1.x, p.y - LOES1.y)

/* ── Identität ───────────────────────────────────────────────────────────── */

/** Titelbild: Labortafel mit zwei Gleichungen, daneben ein Koordinatensystem mit zwei Geraden und zwei Glaskolben */
function Titelbild() {
  return (
    <svg
      viewBox="0 0 720 252"
      role="img"
      aria-label="Eine Labortafel mit den Gleichungen I: 4x + 3y = 18 und II: 4x − y = 2, darunter ein Plus- und ein Minuszeichen. Rechts ein Koordinatensystem mit zwei Geraden, die sich in einem Punkt mit Fragezeichen schneiden. Davor zwei Glaskolben."
    >
      <rect x="0" y="214" width="720" height="38" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="214" y2="214" stroke="var(--ink)" strokeWidth="2" />
      {/* Tafel */}
      <rect x="34" y="22" width="360" height="176" rx="10" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2.5" />
      <rect x="48" y="36" width="332" height="148" rx="6" fill="var(--primary-soft)" />
      <text x="70" y="80" fontSize="26" fontWeight="800" fill="var(--ink)">
        I: 4x + 3y = 18
      </text>
      <text x="70" y="122" fontSize="26" fontWeight="800" fill="var(--ink)">
        II: 4x − y = 2
      </text>
      <line x1="70" x2="300" y1="140" y2="140" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="330" cy="92" r="20" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
      <text x="330" y="101" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">
        ±
      </text>
      <text x="70" y="172" fontSize="24" fontWeight="800" fill="var(--ink)">
        ? = ?
      </text>
      {/* Koordinatensystem */}
      <g>
        <rect x="430" y="22" width="256" height="176" rx="8" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={450 + i * 44} x2={450 + i * 44} y1="36" y2="186" stroke="var(--grid)" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={`h${i}`} x1="444" x2="672" y1={52 + i * 44} y2={52 + i * 44} stroke="var(--grid)" />
        ))}
        <line x1="450" x2="672" y1="176" y2="176" stroke="var(--ink)" strokeWidth="2" />
        <line x1="450" x2="450" y1="36" y2="186" stroke="var(--ink)" strokeWidth="2" />
        <line x1="462" x2="660" y1="48" y2="168" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        <line x1="462" x2="660" y1="150" y2="72" stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 6" strokeLinecap="round" />
        <circle cx="565" cy="110" r="16" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 3" />
        <text x="565" y="117" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">
          ?
        </text>
      </g>
      {/* Glaskolben */}
      {[
        { x: 120, fl: 'var(--primary)' },
        { x: 200, fl: 'var(--highlight)' },
      ].map((k) => (
        <g key={k.x}>
          <path
            d={`M${k.x - 10} 168 v16 L${k.x - 30} 212 h60 L${k.x + 10} 184 v-16 Z`}
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d={`M${k.x - 21} 200 L${k.x - 30} 212 h60 L${k.x + 21} 200 Z`} fill={k.fl} />
          <line x1={k.x - 14} x2={k.x + 14} y1="168" y2="168" stroke="var(--ink)" strokeWidth="2.5" />
        </g>
      ))}
    </svg>
  )
}

const THEMA: Thema = { name: 'Das Gleichungs-Labor', farbe: 'violett', icon: 'fa-flask', bild: <Titelbild /> }

/* ── Graph: zwei Geraden im Koordinatensystem ───────────────────────────── */

const K = { w: 680, h: 380, l: 48, r: 16, t: 14, b: 40, xMin: -0.5, xMax: 6.5, yMin: -0.5, yMax: 7 }
const kx = (x: number) => K.l + ((x - K.xMin) / (K.xMax - K.xMin)) * (K.w - K.l - K.r)
const ky = (y: number) => K.h - K.b - ((y - K.yMin) / (K.yMax - K.yMin)) * (K.h - K.t - K.b)

type PunktBild = Paar & { art: 'alt' | 'aktuell' | 'treffer' }

/**
 * Die beiden Gleichungen der Kernaufgabe als Geraden. versuche: geratene Lösungspaare (alte blass, aktuelles kräftig, Treffer grün);
 * frage: Schnittpunkt mit „S(? | ?)“ markieren, ohne das Ergebnis zu verraten; loesung: Schnittpunkt beschriften (nach dem Lösen)
 */
function GeradenBild({ versuche = [], frage = false, loesung = false, label }: { versuche?: PunktBild[]; frage?: boolean; loesung?: boolean; label: string }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  const gerade = (g: Gl) => {
    const y = (x: number) => (g.c - g.a * x) / g.b
    return `${kx(K.xMin)},${ky(y(K.xMin))} ${kx(K.xMax)},${ky(y(K.xMax))}`
  }
  return (
    <div className="bk-graph ls-graph gl-bild">
      <svg viewBox={`0 0 ${K.w} ${K.h}`} role="img" aria-label={label}>
        <defs>
          <clipPath id={clip}>
            <rect x={kx(K.xMin)} y={ky(K.yMax)} width={kx(K.xMax) - kx(K.xMin)} height={ky(K.yMin) - ky(K.yMax)} />
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4, 5, 6].map((v) => (
          <g key={`x${v}`}>
            <line x1={kx(v)} x2={kx(v)} y1={ky(K.yMin)} y2={ky(K.yMax)} stroke="var(--grid)" />
            {v > 0 && (
              <text x={kx(v)} y={ky(0) + 24} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
                {v}
              </text>
            )}
          </g>
        ))}
        {[1, 2, 3, 4, 5, 6, 7].map((v) => (
          <g key={`y${v}`}>
            <line x1={kx(K.xMin)} x2={kx(K.xMax)} y1={ky(v)} y2={ky(v)} stroke="var(--grid)" />
            <text x={kx(0) - 8} y={ky(v) + 6} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={kx(K.xMin)} x2={kx(K.xMax)} y1={ky(0)} y2={ky(0)} stroke="var(--ink)" strokeWidth="2" />
        <line x1={kx(0)} x2={kx(0)} y1={ky(K.yMin)} y2={ky(K.yMax)} stroke="var(--ink)" strokeWidth="2" />
        <text x={kx(K.xMax) - 4} y={ky(0) - 8} textAnchor="end" fontSize="17" fontWeight="700" fill="var(--ink-muted)">
          x
        </text>
        <text x={kx(0) + 10} y={ky(K.yMax) + 18} fontSize="17" fontWeight="700" fill="var(--ink-muted)">
          y
        </text>
        <g clipPath={`url(#${clip})`}>
          <polyline points={gerade(I1)} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
          <polyline points={gerade(II1)} fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="12 7" strokeLinecap="round" />
        </g>
        <text x={kx(0.55)} y={ky(5.6)} fontSize="18" fontWeight="800" fill="var(--primary)">
          I: 3x + 2y = 12
        </text>
        <text x={kx(4.1)} y={ky(1.85) - 14} fontSize="18" fontWeight="800" fill="var(--ink)">
          II: x + 2y = 7
        </text>
        {versuche.map((p, i) => (
          <circle
            key={i}
            cx={kx(Math.max(K.xMin, Math.min(K.xMax, p.x)))}
            cy={ky(Math.max(K.yMin, Math.min(K.yMax, p.y)))}
            r={p.art === 'alt' ? 6 : 9}
            fill={p.art === 'treffer' ? 'var(--correct)' : p.art === 'aktuell' ? 'var(--highlight)' : 'var(--surface)'}
            stroke={p.art === 'alt' ? 'var(--line-strong)' : 'var(--ink)'}
            strokeWidth="2.5"
            opacity={p.art === 'alt' ? 0.75 : 1}
          />
        ))}
        {frage && (
          <g>
            <circle cx={kx(LOES1.x)} cy={ky(LOES1.y)} r="20" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="5 4" />
            <text x={kx(LOES1.x) - 26} y={ky(LOES1.y) + 40} textAnchor="end" fontSize="20" fontWeight="800" fill="var(--ink)">
              S(? | ?)
            </text>
          </g>
        )}
        {loesung && (
          <g>
            <circle cx={kx(LOES1.x)} cy={ky(LOES1.y)} r="8" fill="var(--correct)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={kx(LOES1.x) - 14} y={ky(LOES1.y) + 36} textAnchor="end" fontSize="20" fontWeight="800" fill="var(--ink)">
              S(2,5 | 2,25)
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

/* ── Phase 2: Lösungspaare testen ────────────────────────────────────────── */

/** Punkt-Test: Lösungspaar eintippen, der Punkt erscheint im Graphen, das Labor setzt ihn in beide Gleichungen ein */
function PunktTest({ versuche, onTesten }: { versuche: Paar[]; onTesten: (p: Paar) => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState({ x: '', y: '' })
  const [fehlt, setFehlt] = useState(false)
  const letzter = versuche[versuche.length - 1]
  const getroffen = versuche.some(treffer)
  // Ausprobieren zählt wie eine Festlegung (PUNKTE.festlegung), sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const frei = versuche.length >= 3 || getroffen
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])
  const bilder: PunktBild[] = versuche.map((p, i) => ({ ...p, art: treffer(p) ? 'treffer' : i === versuche.length - 1 ? 'aktuell' : 'alt' }))

  const testen = () => {
    const x = parseInput(eingabe.x)
    const y = parseInput(eingabe.y)
    if (!x || !y) return setFehlt(true)
    setFehlt(false)
    onTesten({ x: x.value, y: y.value })
  }
  const feld = (k: 'x' | 'y', label: string) => (
    <input
      id={`${uid}-${k}`}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="?"
      aria-label={label}
      className="bk-input lp-input lp-input-sm ls-gap"
      value={eingabe[k]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe({ ...eingabe, [k]: e.target.value })}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') testen()
      }}
    />
  )
  const meldung = (g: Gl, name: string, p: Paar) => {
    const links = g.a * p.x + g.b * p.y
    const ok = erfuellt(g, p.x, p.y)
    const faktor = (k: number, v: number) => `${k === 1 ? '' : `${tx(k)} \\cdot `}${v < 0 ? `(${tx(v)})` : tx(v)}`
    return (
      <li>
        <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" /> Gleichung {name}:{' '}
        <M>{`${faktor(g.a, p.x)} + ${faktor(g.b, p.y)} = ${tx(rund(links))}`}</M>
        {ok ? ', passt.' : <>, es müsste {fmt(g.c)} herauskommen.</>}
      </li>
    )
  }

  return (
    <div className="gl-test" data-no-autocheck>
      <GeradenBild versuche={bilder} label="Koordinatensystem mit den Geraden zu Gleichung I und Gleichung II und den Punkten aus deinen Versuchen" />
      <div className="gl-eingabe">
        <span>Lösungspaar</span>
        <label htmlFor={`${uid}-x`}>
          <M>{'x ='}</M> {feld('x', 'Wert für x')}
        </label>
        <label htmlFor={`${uid}-y`}>
          <M>{'y ='}</M> {feld('y', 'Wert für y')}
        </label>
        <button type="button" className="bk-btn bk-btn-primary" onClick={testen}>
          <i className="fa-solid fa-flask" aria-hidden="true" /> Im Labor testen
        </button>
      </div>
      {fehlt && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage für <M>x</M> und <M>y</M> eine Zahl ein, z. B. 2 oder 1,5.
        </div>
      )}
      {letzter && (
        <div className={`gl-display ${treffer(letzter) ? 'gl-display-ok' : ''}`} role="status">
          <div className="gl-display-head">
            <i className="fa-solid fa-flask" aria-hidden="true" /> Gleichungs-Labor, Versuch {versuche.length}: <M>{`(${tx(letzter.x)} \\mid ${tx(letzter.y)})`}</M>
          </div>
          <ul>
            {meldung(I1, 'I', letzter)}
            {meldung(II1, 'II', letzter)}
          </ul>
        </div>
      )}
      {frei && (
        <p className="sl-hinweis">
          {getroffen
            ? 'Treffer! Aber mit anderen Zahlen hilft dir dieses Glück nicht weiter.'
            : 'Raten bringt dich kaum ans Ziel: Das Paar muss beide Gleichungen gleichzeitig erfüllen, und im Graphen kannst du den Schnittpunkt nur ungefähr ablesen.'}{' '}
          Gleichsetzen geht auch nicht direkt, denn keine der beiden Gleichungen ist nach <M>y</M> aufgelöst.
        </p>
      )}
    </div>
  )
}

/* ── Leitobjekt: das Gleichungs-Labor ────────────────────────────────────── */

type Rechenart = '+' | '-'

/**
 * Das Gleichungs-Labor: zwei Gleichungen untereinander, auf Knopfdruck addiert oder subtrahiert (Seite für Seite).
 * faktoren: Jede Gleichung lässt sich vorher mit 1, 2, 3 oder −1 multiplizieren. onWeg: sobald eine Variable wegfällt (einmal).
 */
function GleichungsLabor({
  I,
  II,
  faktoren = false,
  onWeg,
}: {
  I: Gl
  II: Gl
  faktoren?: boolean
  onWeg?: (rechnung: string) => void
}) {
  const [art, setArt] = useState<Rechenart | null>(null)
  const [k1, setK1] = useState(1)
  const [k2, setK2] = useState(1)
  const [gemeldet, setGemeldet] = useState(false)
  const g1 = mal(I, k1)
  const g2 = mal(II, k2)
  const s = art === '-' ? -1 : 1
  const erg: Gl = { a: rund(g1.a + s * g2.a), b: rund(g1.b + s * g2.b), c: rund(g1.c + s * g2.c) }
  const name1 = k1 === 1 ? '\\text{I}' : `\\text{I} \\cdot ${k1 < 0 ? `(${k1})` : k1}`
  const name2 = k2 === 1 ? '\\text{II}' : `\\text{II} \\cdot ${k2 < 0 ? `(${k2})` : k2}`
  const rechnung = `${name1} ${art === '-' ? '-' : '+'} ${name2}`
  const weg = art !== null && (erg.a === 0) !== (erg.b === 0)
  const beideWeg = art !== null && erg.a === 0 && erg.b === 0

  useEffect(() => {
    if (weg && !gemeldet) {
      setGemeldet(true)
      onWeg?.(rechnung)
    }
  }, [weg, gemeldet, onWeg, rechnung])

  const faktorKnoepfe = (name: string, k: number, setK: (v: number) => void) => (
    <div className="gl-knoepfe" role="group" aria-label={`Gleichung ${name} multiplizieren mit`}>
      <span>Gleichung {name} mal</span>
      {[1, 2, 3, -1].map((v) => (
        <button key={v} type="button" className={`bk-btn bk-btn-sm${k === v ? ' bk-btn-primary' : ''}`} aria-pressed={k === v} onClick={() => setK(v)}>
          {String(v).replace('-', '−')}
        </button>
      ))}
    </div>
  )

  return (
    <div className="gl-labor" data-no-autocheck>
      <p className="gl-labor-kopf">
        <i className="fa-solid fa-flask" aria-hidden="true" /> Das Gleichungs-Labor
      </p>
      {faktoren && (
        <>
          {faktorKnoepfe('I', k1, setK1)}
          {faktorKnoepfe('II', k2, setK2)}
        </>
      )}
      <div className="gl-knoepfe" role="group" aria-label="Rechnung wählen">
        <span>Rechnung</span>
        <button type="button" className={`bk-btn${art === '+' ? ' bk-btn-primary' : ''}`} aria-pressed={art === '+'} onClick={() => setArt('+')}>
          I + II addieren
        </button>
        <button type="button" className={`bk-btn${art === '-' ? ' bk-btn-primary' : ''}`} aria-pressed={art === '-'} onClick={() => setArt('-')}>
          I − II subtrahieren
        </button>
      </div>
      <div className="gl-zeilen">
        <span className="gl-name">
          <M>{name1}</M>
        </span>
        <M>{glTex(g1)}</M>
        <span className="gl-name">
          <M>{name2}</M>
        </span>
        <M>{glTex(g2)}</M>
        {art && (
          <>
            <span className="gl-strich" />
            <span className="gl-name">
              <M>{rechnung}</M>
            </span>
            <M>{glTex(erg, true)}</M>
          </>
        )}
      </div>
      {art === null ? (
        <p className="gl-meldung">Wähle eine Rechnung. Das Labor rechnet Seite für Seite: links mit links, rechts mit rechts.</p>
      ) : beideWeg ? (
        <p className="gl-meldung">Hier fallen beide Variablen weg. Damit kannst du nichts berechnen. Wähle andere Faktoren.</p>
      ) : weg ? (
        <p className="gl-meldung gl-meldung-weg" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> {erg.b === 0 ? <M>y</M> : <M>x</M>} fällt weg! Übrig bleibt eine Gleichung mit nur einer
          Variablen: <M>{glTex(erg)}</M>. Die kannst du lösen.
        </p>
      ) : (
        <p className="gl-meldung" role="status">
          Keine Variable fällt weg: Vor <M>x</M> steht <M>{tx(erg.a)}</M>, vor <M>y</M> steht <M>{tx(erg.b)}</M>. Probiere eine andere Rechnung
          {faktoren ? ' oder multipliziere vorher eine Gleichung' : ''}.
        </p>
      )}
    </div>
  )
}

/* ── Phase 3: Bilder und Rechenbeispiele ─────────────────────────────────── */

/** Handlungsprodukt: Flussdiagramm „Welcher Weg?“ mit Frage-Raute und drei Wegen */
function FlussdiagrammBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Flussdiagramm auf einer Heftseite: oben eine Raute mit der Frage, welche Zahlen vor x oder y stehen. Drei Pfeile führen zu den Kästen subtrahieren, addieren und erst multiplizieren. Alle drei führen zum Kasten einsetzen und Probe."
      >
        <rect x="96" y="6" width="528" height="178" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <polygon points="360,16 470,44 360,72 250,44" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2.5" />
        <text x="360" y="50" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)">
          Zahlen vor x oder y?
        </text>
        {[
          { x: 190, t: 'gleich: I − II' },
          { x: 360, t: 'Gegenzahl: I + II' },
          { x: 530, t: 'sonst: erst mal k' },
        ].map((k) => (
          <g key={k.x}>
            <line x1="360" x2={k.x} y1="72" y2="98" stroke="var(--ink)" strokeWidth="2" />
            <rect x={k.x - 78} y="98" width="156" height="32" rx="6" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2.5" />
            <text x={k.x} y="120" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
              {k.t}
            </text>
            <line x1={k.x} x2="360" y1="130" y2="150" stroke="var(--ink)" strokeWidth="2" />
          </g>
        ))}
        <rect x="270" y="150" width="180" height="28" rx="6" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="170" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">
          einsetzen und Probe
        </text>
      </svg>
    </div>
  )
}

const BSP1_AUFGABE = (
  <>
    <MB>{'\\begin{aligned} \\text{I: } 5x + 3y &= 21 \\\\ \\text{II: } 2x + 3y &= 12 \\end{aligned}'}</MB>
    <p>
      Gesucht ist das Lösungspaar <M>{'(x \\mid y)'}</M>, das beide Gleichungen erfüllt.
    </p>
  </>
)
const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Gleiche Zahl suchen',
    body: (
      <p>
        Vor <M>y</M> steht in beiden Gleichungen <M>{'3'}</M>. Ziehst du Gleichung II von Gleichung I ab, wird aus <M>{'3y - 3y'}</M> genau <M>{'0'}</M>: <M>y</M> fällt weg.
      </p>
    ),
  },
  {
    title: 'Die Gleichungen subtrahieren',
    body: (
      <>
        <p>Rechne Seite für Seite: links minus links, rechts minus rechts.</p>
        <MB>{'\\begin{aligned} \\text{I: } 5x + 3y &= 21 \\\\ \\text{II: } 2x + 3y &= 12 \\\\ \\hline \\text{I} - \\text{II: } 3x + 0y &= 9 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Nach <M>x</M> auflösen</>,
    body: <MB>{'\\begin{aligned} 3x &= 9 && \\mid :3 \\\\ x &= 3 \\end{aligned}'}</MB>,
  },
  {
    title: <>
      <M>x</M> in eine Gleichung einsetzen
    </>,
    body: (
      <>
        <p>Nimm die einfachere Gleichung, hier II:</p>
        <MB>{'\\begin{aligned} 2 \\cdot 3 + 3y &= 12 \\\\ 6 + 3y &= 12 && \\mid -6 \\\\ 3y &= 6 && \\mid :3 \\\\ y &= 2 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: 'Lösung angeben und Probe machen',
    body: (
      <>
        <p>
          Das Lösungspaar ist <M>{'(3 \\mid 2)'}</M>. Probe in Gleichung I: <M>{'5 \\cdot 3 + 3 \\cdot 2 = 15 + 6 = 21 \\;\\checkmark'}</M>
        </p>
      </>
    ),
  },
]

const BSP2_AUFGABE = (
  <MB>{'\\begin{aligned} \\text{I: } x + 2y &= 8 \\\\ \\text{II: } 3x - 2y &= 0 \\end{aligned}'}</MB>
)
const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Gegenzahlen erkennen und addieren',
    body: (
      <>
        <p>
          Vor <M>y</M> stehen <M>{'2'}</M> und <M>{'-2'}</M>, also Gegenzahlen. Beim Addieren wird <M>{'2y + (-2y) = 0'}</M>:
        </p>
        <MB>{'\\begin{aligned} \\text{I: } x + 2y &= 8 \\\\ \\text{II: } 3x - 2y &= 0 \\\\ \\hline \\text{I} + \\text{II: } 4x + 0y &= 8 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Nach <M>x</M> auflösen und einsetzen</>,
    body: <MB>{'\\begin{aligned} 4x &= 8 && \\mid :4 \\\\ x &= 2 \\\\ \\text{in I: } 2 + 2y &= 8 && \\mid -2 \\\\ 2y &= 6 && \\mid :2 \\\\ y &= 3 \\end{aligned}'}</MB>,
  },
  {
    title: 'Lösung und Probe',
    body: (
      <p>
        Lösungspaar <M>{'(2 \\mid 3)'}</M>. Probe in II: <M>{'3 \\cdot 2 - 2 \\cdot 3 = 6 - 6 = 0 \\;\\checkmark'}</M>
      </p>
    ),
  },
]

const BSP3_AUFGABE = (
  <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 16 \\\\ \\text{II: } x + y &= 6 \\end{aligned}'}</MB>
)
const BSP3_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Eine Gleichung passend multiplizieren',
    body: (
      <>
        <p>
          Vor <M>y</M> stehen <M>{'2'}</M> und <M>{'1'}</M>, vor <M>x</M> stehen <M>{'3'}</M> und <M>{'1'}</M>: Nichts fällt sofort weg. Multipliziere Gleichung II auf{' '}
          <strong>beiden</strong> Seiten mit 2. Dann steht vor <M>y</M> in beiden Gleichungen <M>{'2'}</M>:
        </p>
        <MB>{'\\begin{aligned} \\text{II: } x + y &= 6 && \\mid \\cdot 2 \\\\ \\text{II} \\cdot 2{:}\\; 2x + 2y &= 12 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: 'Subtrahieren',
    body: <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 16 \\\\ \\text{II} \\cdot 2{:}\\; 2x + 2y &= 12 \\\\ \\hline \\text{I} - \\text{II} \\cdot 2{:}\\; x + 0y &= 4 \\end{aligned}'}</MB>,
  },
  {
    title: <>Einsetzen und <M>y</M> berechnen</>,
    body: <MB>{'\\begin{aligned} x &= 4 \\\\ \\text{in II: } 4 + y &= 6 && \\mid -4 \\\\ y &= 2 \\end{aligned}'}</MB>,
  },
  {
    title: 'Lösung und Probe',
    body: (
      <p>
        Lösungspaar <M>{'(4 \\mid 2)'}</M>. Probe in I: <M>{'3 \\cdot 4 + 2 \\cdot 2 = 12 + 4 = 16 \\;\\checkmark'}</M>
      </p>
    ),
  },
]

const LOESUNG1 = (
  <>
    <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 12 \\\\ \\text{II: } x + 2y &= 7 \\\\ \\hline \\text{I} - \\text{II: } 2x &= 5 && \\mid :2 \\\\ x &= 2{,}5 \\end{aligned}'}</MB>
    <MB>{'\\begin{aligned} \\text{in II: } 2{,}5 + 2y &= 7 && \\mid -2{,}5 \\\\ 2y &= 4{,}5 && \\mid :2 \\\\ y &= 2{,}25 \\end{aligned}'}</MB>
    <p>
      Lösungspaar <M>{'(2{,}5 \\mid 2{,}25)'}</M>. Probe in I: <M>{'3 \\cdot 2{,}5 + 2 \\cdot 2{,}25 = 7{,}5 + 4{,}5 = 12 \\;\\checkmark'}</M>
    </p>
  </>
)
const LOESUNG2 = (
  <>
    <MB>{'\\begin{aligned} \\text{I: } 2x + 3y &= 3 \\\\ \\text{II: } 4x - 3y &= 15 \\\\ \\hline \\text{I} + \\text{II: } 6x &= 18 && \\mid :6 \\\\ x &= 3 \\end{aligned}'}</MB>
    <MB>{'\\begin{aligned} \\text{in I: } 2 \\cdot 3 + 3y &= 3 && \\mid -6 \\\\ 3y &= -3 && \\mid :3 \\\\ y &= -1 \\end{aligned}'}</MB>
    <p>
      Lösungspaar <M>{'(3 \\mid -1)'}</M>. Probe in II: <M>{'4 \\cdot 3 - 3 \\cdot (-1) = 12 + 3 = 15 \\;\\checkmark'}</M>
    </p>
  </>
)
const LOESUNG3 = (
  <>
    <MB>{'\\begin{aligned} \\text{II} \\cdot 2{:}\\; 2x + 2y &= 10 \\\\ \\text{I} - \\text{II} \\cdot 2{:}\\; (2x + 3y) - (2x + 2y) &= 13 - 10 \\\\ y &= 3 \\end{aligned}'}</MB>
    <MB>{'\\begin{aligned} \\text{in II: } x + 3 &= 5 && \\mid -3 \\\\ x &= 2 \\end{aligned}'}</MB>
    <p>
      Lösungspaar <M>{'(2 \\mid 3)'}</M>. Probe in I: <M>{'2 \\cdot 2 + 3 \\cdot 3 = 4 + 9 = 13 \\;\\checkmark'}</M>
    </p>
  </>
)


/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function LaborEinstieg({
  onBack,
  onPractice,
  onPrev,
  onNext,
}: {
  onBack: () => void
  onPractice: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const [versuche, setVersuche] = useState<Paar[]>([])
  const [entdeckt, setEntdeckt] = useState<string | null>(null)
  const [geloest, setGeloest] = useState<string[]>([])
  const [uebungen, setUebungen] = useState<string[]>([])
  /** Pflicht-Übung melden: schaltet „Weiter“ und das Bonus-Spiel frei */
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }
  const teilGeloest = (k: string, fertig: () => void) => () => {
    fertig()
    setGeloest((g) => (g.includes(k) ? g : [...g, k]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Minus vor der Klammer"
            prompt={<p>Fasse zusammen. Trage die Zahl vor <M>y</M> ein.</p>}
            rechnung={[{ l: ['(4x + 3y) - (4x + y)'], r: [{ luecke: 'k' }, 'y'] }]}
            fields={[{ kind: 'num', key: 'k', label: 'Zahl vor y', expected: 2 }]}
            solution={<MB>{'(4x + 3y) - (4x + y) = 4x + 3y - 4x - y = 2y'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Das Minus vor der Klammer dreht jedes Vorzeichen in der Klammer um.</>,
                  <>
                    <M>{'-(4x + y) = -4x - y'}</M>
                  </>,
                  <>
                    <M>{'4x - 4x = 0'}</M>, die <M>x</M> fallen weg. Übrig bleibt <M>{'3y - y'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Gegenzahlen"
            prompt={<p>Fasse zusammen. Trage die Zahl vor <M>x</M> ein.</p>}
            rechnung={[{ l: ['(2x + 5y) + (3x - 5y)'], r: [{ luecke: 'k' }, 'x'] }]}
            fields={[{ kind: 'num', key: 'k', label: 'Zahl vor x', expected: 5 }]}
            solution={<MB>{'(2x + 5y) + (3x - 5y) = 2x + 3x + 5y - 5y = 5x'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Fasse die <M>x</M> und die <M>y</M> jeweils zusammen.</>,
                  <>
                    <M>{'5y'}</M> und <M>{'-5y'}</M> sind Gegenzahlen: zusammen <M>{'0'}</M>.
                  </>,
                  <>
                    <M>{'2x + 3x = 5x'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Eine Gleichung multiplizieren"
            prompt={<p>Multipliziere die Gleichung auf beiden Seiten mit 2.</p>}
            rechnung={[
              { l: ['x + 3y'], r: ['4'], u: '\\mid \\cdot 2' },
              { l: [{ luecke: 'a' }, 'x +', { luecke: 'b' }, 'y'], r: [{ luecke: 'c' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: 'Zahl vor x', expected: 2 },
              { kind: 'num', key: 'b', label: 'Zahl vor y', expected: 6 },
              { kind: 'num', key: 'c', label: 'rechte Seite', expected: 8 },
            ]}
            solution={<MB>{'(x + 3y) \\cdot 2 = 4 \\cdot 2 \\quad\\Rightarrow\\quad 2x + 6y = 8'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Jeder Summand auf beiden Seiten wird mal 2 genommen.</>,
                  <>
                    Links: <M>{'x \\cdot 2'}</M> und <M>{'3y \\cdot 2'}</M>. Rechts: <M>{'4 \\cdot 2'}</M>.
                  </>,
                  <>Vergiss die rechte Seite nicht, sonst stimmt die Gleichung nicht mehr.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={3}
            title="d) Einsetzen und lösen"
            prompt={
              <p>
                Setze <M>{'x = 2'}</M> in die Gleichung <M>{'2x + 3y = 13'}</M> ein und berechne <M>y</M>.
              </p>
            }
            rechnung={[
              { l: ['2 \\cdot 2 + 3y'], r: ['13'], u: '\\mid -4' },
              { l: ['3y'], r: [{ luecke: 'r' }], u: '\\mid :3' },
              { l: ['y'], r: [{ luecke: 'y' }] },
            ]}
            fields={[
              { kind: 'num', key: 'r', label: 'rechte Seite nach minus 4', expected: 9 },
              { kind: 'num', key: 'y', label: 'Wert von y', expected: 3 },
            ]}
            solution={<MB>{'\\begin{aligned} 4 + 3y &= 13 && \\mid -4 \\\\ 3y &= 9 && \\mid :3 \\\\ y &= 3 \\end{aligned}'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>
                    <M>{'2 \\cdot 2 = 4'}</M>. Bring die 4 auf die andere Seite.
                  </>,
                  <>
                    <M>{'13 - 4 = 9'}</M>, also <M>{'3y = 9'}</M>.
                  </>,
                  <>Teile durch die Zahl vor <M>y</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={4}
            title="e) Gleichsetzen"
            prompt={
              <p>
                Das kannst du schon: Gerade 1: <M>{'y = 2x - 1'}</M>, Gerade 2: <M>{'y = -x + 5'}</M>. Setze die Terme gleich und berechne den Schnittpunkt.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 2 },
              { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3 },
            ]}
            solution={
              <MB>{'\\begin{aligned} 2x - 1 &= -x + 5 && \\mid +x \\\\ 3x - 1 &= 5 && \\mid +1 \\\\ 3x &= 6 && \\mid :3 \\\\ x &= 2 \\qquad y = 2 \\cdot 2 - 1 = 3 \\end{aligned}'}</MB>
            }
            help={
              <Hilfen
                steps={[
                  <>Beide Gleichungen sind schon nach <M>y</M> aufgelöst. Schreibe die rechten Seiten gleich.</>,
                  <>
                    <M>{'2x - 1 = -x + 5'}</M>. Bringe alle <M>x</M> auf eine Seite.
                  </>,
                  <>
                    <M>{'3x = 6'}</M>. Setze <M>x</M> danach in eine der beiden Gleichungen ein.
                  </>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: (
        <>
          Ein Gleichungssystem ohne <M>{'y = \\dots'}</M>
        </>
      ),
      pflicht: ['probieren', 'labor'],
      bedingung: 'Teste dreimal ein Lösungspaar und finde im Labor eine Rechnung, bei der eine Variable wegfällt.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Zwei Gleichungen mit zwei Unbekannten <M>x</M> und <M>y</M> bilden ein <strong>lineares Gleichungssystem</strong> (LGS). Bisher waren beide Gleichungen nach <M>y</M>{' '}
            aufgelöst, dann konntest du die Terme gleichsetzen. Hier ist das anders:
          </p>
          <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 12 \\\\ \\text{II: } x + 2y &= 7 \\end{aligned}'}</MB>
          <p className="sl-text">
            Gesucht ist das <strong>Lösungspaar</strong> <M>{'(x \\mid y)'}</M>, das beide Gleichungen gleichzeitig erfüllt. Im Koordinatensystem ist das der Schnittpunkt der beiden
            Geraden.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
            <p>
              Tippe ein Lösungspaar ein, das du für richtig hältst. Das Gleichungs-Labor zeichnet deinen Punkt ein und setzt ihn in beide Gleichungen ein. Versuche es mindestens
              dreimal.
            </p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 10 Minuten.</p>
          <PunktTest
            versuche={versuche}
            onTesten={(p) => {
              setVersuche((alt) => [...alt, p])
              if (versuche.length + 1 >= 3 || treffer(p)) fertig.teil('probieren')()
            }}
          />
          {(versuche.length >= 3 || versuche.some(treffer)) && (
            <Abschnitt titel="Das Labor kann noch mehr">
              <p className="sl-text">
                Das Labor kann zwei Gleichungen addieren oder subtrahieren, Seite für Seite: links mit links, rechts mit rechts. Probiere beide Rechnungen aus. Bei welcher fällt eine
                Variable weg?
              </p>
              <GleichungsLabor
                I={I1}
                II={II1}
                onWeg={(r) => {
                  setEntdeckt(r)
                  fertig.teil('labor')()
                }}
              />
              {entdeckt && (
                <p className="sl-hinweis">
                  Entdeckt! Wenn vor <M>y</M> in beiden Gleichungen dieselbe Zahl steht, fällt <M>y</M> beim Subtrahieren weg. Wie du daraus das ganze Lösungspaar bekommst und was du
                  tust, wenn nichts sofort wegfällt, lernst du jetzt.
                </p>
              )}
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Das Additions- und Subtraktionsverfahren',
      pflicht: ['t1', 't2', 't3', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, Teil 2 und 3 auch in Partnerarbeit, ca. 45 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne das Lösungspaar, ohne zu raten</p>
            <p>
              Löse das Gleichungssystem <M>{'\\text{I: } 3x + 2y = 12'}</M> und <M>{'\\text{II: } x + 2y = 7'}</M> in deinem Heft. Lass dabei eine Variable wegfallen, berechne{' '}
              <M>x</M> und <M>y</M> und mache die Probe.
            </p>
          </div>
          <GeradenBild frage label="Die Geraden zu Gleichung I und Gleichung II. Ihr Schnittpunkt ist mit S(? | ?) markiert." />
          <Abschnitt titel="Teil 1: Gleiche Zahl, also subtrahieren">
            <BeispielMitVideo video={VIDEO_VERFAHREN} videoTitel="Lernvideo: Additions- und Subtraktionsverfahren">
              <Beispiel offen title="Subtrahieren" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={teilGeloest('t1', fertig.teil('t1'))}
              punkte={10}
              title="Das Lösungspaar"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fields={[
                { kind: 'num', key: 'x', label: <>Welchen Wert hat <M>x</M>? <M>{'x ='}</M></>, expected: LOES1.x },
                { kind: 'num', key: 'y', label: <>Welchen Wert hat <M>y</M>? <M>{'y ='}</M></>, expected: LOES1.y },
              ]}
              loesungNachFehler
              solution={LOESUNG1}
              help={
                <Hilfen
                  steps={[
                    <>Schau auf die Zahlen vor <M>y</M>. Welche Rechnung lässt <M>y</M> wegfallen?</>,
                    <>
                      Rechne <M>{'\\text{I} - \\text{II}'}</M>: links <M>{'3x - x'}</M> und <M>{'2y - 2y'}</M>, rechts <M>{'12 - 7'}</M>.
                    </>,
                    <>
                      <M>{'2x = 5'}</M>, also <M>{'x = 2{,}5'}</M>. Setze das in Gleichung II ein: <M>{'2{,}5 + 2y = 7'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Teil 2: Gegenzahlen, also addieren">
            <p className="sl-text">
              Löse in deinem Heft: <M>{'\\text{I: } 2x + 3y = 3'}</M> und <M>{'\\text{II: } 4x - 3y = 15'}</M>. Vor <M>y</M> stehen hier <M>{'3'}</M> und <M>{'-3'}</M>.
              Subtrahierst du, wird daraus <M>{'3y - (-3y) = 6y'}</M>. Was passiert beim Addieren?
            </p>
            <BeispielMitVideo video={VIDEO_VERFAHREN} videoTitel="Lernvideo: Additions- und Subtraktionsverfahren">
              <Beispiel offen title="Addieren" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={teilGeloest('t2', fertig.teil('t2'))}
              punkte={10}
              title="Teil 2"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein.</p>}
              fields={[
                { kind: 'num', key: 'x', label: <>Welchen Wert hat <M>x</M>? <M>{'x ='}</M></>, expected: 3 },
                { kind: 'num', key: 'y', label: <>Welchen Wert hat <M>y</M>? <M>{'y ='}</M></>, expected: -1 },
              ]}
              loesungNachFehler
              solution={LOESUNG2}
              help={
                <Hilfen
                  steps={[
                    <>
                      Gegenzahlen ergeben zusammen <M>{'0'}</M>: <M>{'3y + (-3y) = 0'}</M>.
                    </>,
                    <>
                      Rechne <M>{'\\text{I} + \\text{II}'}</M>: links <M>{'2x + 4x'}</M>, rechts <M>{'3 + 15'}</M>.
                    </>,
                    <>
                      <M>{'6x = 18'}</M>, also <M>{'x = 3'}</M>. In I: <M>{'6 + 3y = 3'}</M>. Achtung, <M>y</M> wird negativ.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Teil 3: Erst multiplizieren">
            <p className="sl-text">
              Löse in deinem Heft: <M>{'\\text{I: } 2x + 3y = 13'}</M> und <M>{'\\text{II: } x + y = 5'}</M>. Hier fällt weder beim Addieren noch beim Subtrahieren etwas weg.
              Probiere im Labor, womit du eine Gleichung vorher multiplizieren musst.
            </p>
            <GleichungsLabor I={I3} II={II3} faktoren />
            <BeispielMitVideo video={VIDEO_VERFAHREN} videoTitel="Lernvideo: Additions- und Subtraktionsverfahren">
              <Beispiel offen title="Erst multiplizieren, dann subtrahieren" aufgabe={BSP3_AUFGABE} steps={BSP3_SCHRITTE} />
            </BeispielMitVideo>
            <CheckCard
              onSolved={teilGeloest('t3', fertig.teil('t3'))}
              punkte={12}
              title="Teil 3"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein.</p>}
              fields={[
                { kind: 'num', key: 'x', label: <>Welchen Wert hat <M>x</M>? <M>{'x ='}</M></>, expected: 2 },
                { kind: 'num', key: 'y', label: <>Welchen Wert hat <M>y</M>? <M>{'y ='}</M></>, expected: 3 },
              ]}
              loesungNachFehler
              solution={LOESUNG3}
              help={
                <Hilfen
                  steps={[
                    <>Sorge dafür, dass vor <M>x</M> oder vor <M>y</M> in beiden Gleichungen dieselbe Zahl steht.</>,
                    <>
                      Multipliziere Gleichung II auf beiden Seiten mit 2: <M>{'2x + 2y = 10'}</M>. Jetzt steht vor <M>x</M> überall 2.
                    </>,
                    <>
                      <M>{'\\text{I} - \\text{II} \\cdot 2'}</M>: links bleibt <M>{'3y - 2y = y'}</M>, rechts <M>{'13 - 10'}</M>. Setze <M>y</M> dann in II ein.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Handlungsprodukt titel="Flussdiagramm „Welcher Weg?“">
            <FlussdiagrammBild />
            <p className="sl-text">
              Zeichne in deinem Heft ein Flussdiagramm, mit dem du bei jedem Gleichungssystem den passenden Weg findest. Oben steht die Frage, welche Zahlen vor <M>x</M> oder{' '}
              <M>y</M> stehen. Drei Pfeile führen zu den Wegen subtrahieren, addieren und erst multiplizieren. Unten treffen sich alle Wege beim Einsetzen und bei der Probe. Schreibe
              zu jedem Weg ein Gleichungssystem von dieser Seite als Beispiel dazu.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Steht vor einer Variablen in beiden Gleichungen dieselbe Zahl, dann …“</li>
                <li>„Stehen vor einer Variablen Gegenzahlen wie 3 und −3, dann …“</li>
                <li>„Fällt nichts weg, multipliziere ich eine Gleichung auf beiden Seiten mit …, damit …“</li>
                <li>„Zum Schluss setze ich … in eine Gleichung ein und mache die Probe, indem …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Flussdiagramm vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                'Die Startfrage: Welche Zahlen stehen vor x oder vor y?',
                'Drei Wege mit Pfeilen: gleiche Zahl → subtrahieren, Gegenzahlen → addieren, sonst → erst eine Gleichung multiplizieren',
                'Zu jedem Weg ein Beispiel von dieser Seite mit der Rechnung (z. B. „I − II“, „I + II“, „II · 2“)',
                'Der gemeinsame Schluss: die zweite Variable durch Einsetzen berechnen und die Probe machen',
                <>
                  Unter deinem Flussdiagramm erklärst du die Begriffe und Abkürzungen: LGS (lineares Gleichungssystem), I und II (die beiden Gleichungen), Lösungspaar{' '}
                  <M>{'(x \\mid y)'}</M>, Koeffizient (die Zahl vor einer Variablen), Gegenzahl, Probe und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest.length === 3 && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug versuche={versuche} entdeckt={entdeckt} />
              <GeradenBild loesung label="Die Geraden zu Gleichung I und Gleichung II schneiden sich im Punkt S(2,5 | 2,25)." />
              <Merke title="Das Additions- und Subtraktionsverfahren">
                <p>Ein lineares Gleichungssystem löst du, indem du die Gleichungen so addierst oder subtrahierst, dass eine Variable wegfällt.</p>
                <ul className="zk-liste">
                  <li>Gleiche Zahl vor einer Variablen: Gleichungen subtrahieren (I − II).</li>
                  <li>Gegenzahlen vor einer Variablen (z. B. 3y und −3y): Gleichungen addieren (I + II).</li>
                  <li>Sonst vorher eine oder beide Gleichungen auf beiden Seiten mit einer passenden Zahl multiplizieren.</li>
                </ul>
                <p>
                  Danach die übrige Variable berechnen, in eine der Ausgangsgleichungen einsetzen und die zweite Variable berechnen. Das Lösungspaar <M>{'(x \\mid y)'}</M> ist der
                  Schnittpunkt der beiden Geraden. Zum Schluss die Probe in der anderen Gleichung.
                </p>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3', '4'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die fünfte ist freiwillig für Profis. Wenn du die vier Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich.
            Einzelarbeit, ca. 25 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welche Rechnung passt?">
            <McCard
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 4x + 5y &= 22 \\\\ \\text{II: } 4x - y &= 4 \\end{aligned}'}</MB>
                  <p>Mit welcher Rechnung fällt sofort eine Variable weg?</p>
                </>
              }
              options={[
                { text: 'I + II, denn dann fällt y weg.', feedback: <>Beim Addieren wird <M>{'5y + (-y) = 4y'}</M>. Das <M>y</M> bleibt stehen, und aus <M>{'4x + 4x'}</M> wird <M>{'8x'}</M>.</> },
                {
                  text: 'Erst beide Gleichungen nach y auflösen, sonst geht es nicht.',
                  feedback: <>Das geht auch, ist hier aber unnötig umständlich. Vor <M>x</M> steht schon in beiden Gleichungen <M>{'4'}</M>.</>,
                },
                {
                  text: 'I − II, denn vor x steht in beiden Gleichungen 4.',
                  correct: true,
                  feedback: <><M>{'4x - 4x = 0'}</M>. Übrig bleibt <M>{'5y - (-y) = 6y'}</M> und <M>{'22 - 4 = 18'}</M>, also <M>{'6y = 18'}</M> und <M>{'y = 3'}</M>.</>,
                },
                { text: 'I − II, denn dann fällt y weg.', feedback: <>Beim Subtrahieren wird <M>{'5y - (-y) = 6y'}</M>. Wegfallen tut <M>x</M>, weil <M>{'4x - 4x = 0'}</M>.</> },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <McCard
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              title="Übung 2"
              level="standard"
              rechnen
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 2x + 3y &= 12 \\\\ \\text{II: } 2x - y &= 4 \\end{aligned}'}</MB>
                  <p>Lena rechnet I − II und schreibt: „2y = 8, also y = 4.“ Rechne selbst nach. Was stimmt?</p>
                </>
              }
              options={[
                {
                  text: 'Lena hat recht: y = 4.',
                  feedback: <>Probe: Mit <M>{'y = 4'}</M> wäre in II <M>{'2x = 8'}</M>, also <M>{'x = 4'}</M>. In I: <M>{'8 + 12 = 20 \\neq 12'}</M>. Lena hat <M>{'3y - (-y)'}</M> falsch gerechnet.</>,
                },
                { text: 'Falsch, man darf hier nicht subtrahieren, sondern muss addieren.', feedback: <>Subtrahieren ist richtig, denn vor <M>x</M> steht in beiden Gleichungen <M>{'2'}</M>. Lena hat sich nur beim Vorzeichen verrechnet.</> },
                { text: 'Falsch, richtig ist 4y = 16, also y = 4.', feedback: <>Rechts gilt <M>{'12 - 4 = 8'}</M>, nicht 16. Links stimmt <M>{'4y'}</M>.</> },
                {
                  text: 'Falsch, richtig ist 4y = 8, also y = 2 und x = 3.',
                  correct: true,
                  feedback: <><M>{'3y - (-y)'}</M> <M>{'= 3y + y = 4y'}</M>. Das Minus vor dem <M>{'-y'}</M> macht ein Plus. Also <M>{'y = 2'}</M>, dann <M>{'2x - 2 = 4'}</M> und <M>{'x = 3'}</M>.</>,
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Schritt für Schritt">
            <CheckCard
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={7}
              title="Übung 3"
              level="standard"
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 4 \\\\ \\text{II: } 5x - 2y &= 12 \\end{aligned}'}</MB>
                  <p>Löse das Gleichungssystem. Trage jedes Zwischenergebnis direkt in die Rechnung ein.</p>
                </>
              }
              rechnung={[
                { l: ['\\text{I} + \\text{II: }', { luecke: 'k' }, 'x'], r: [{ luecke: 'r' }], u: '\\text{① addieren}' },
                { l: ['x'], r: [{ luecke: 'x' }], u: '\\text{② } \\mid :8' },
                { l: ['2y'], r: [{ luecke: 'zy' }], u: '\\text{③ in I einsetzen}' },
                { l: ['y'], r: [{ luecke: 'y' }], u: '\\text{④ } \\mid :2' },
              ]}
              fields={[
                { kind: 'num', key: 'k', label: 'Zahl vor x', expected: 8 },
                { kind: 'num', key: 'r', label: 'rechte Seite nach dem Addieren', expected: 16 },
                { kind: 'num', key: 'x', label: 'x', expected: 2 },
                { kind: 'num', key: 'zy', label: 'rechte Seite von 2y = …', expected: -2 },
                { kind: 'num', key: 'y', label: 'y', expected: -1 },
              ]}
              solution={
                <MB>{'\\begin{aligned} \\text{I} + \\text{II: } 8x &= 16 && \\mid :8 \\\\ x &= 2 \\\\ \\text{in I: } 3 \\cdot 2 + 2y &= 4 && \\mid -6 \\\\ 2y &= -2 && \\mid :2 \\\\ y &= -1 \\end{aligned}'}</MB>
              }
              help={
                <SchrittHilfen
                  schritte={[
                    { kurz: '①', titel: 'addieren', hilfe: <>Vor <M>y</M> stehen <M>{'2'}</M> und <M>{'-2'}</M>. Addiere links <M>{'3x + 5x'}</M> und rechts <M>{'4 + 12'}</M>.</> },
                    { kurz: '②', titel: 'durch 8 teilen', hilfe: <>Teile beide Seiten durch die Zahl vor <M>x</M>: <M>{'16 : 8'}</M>.</> },
                    { kurz: '③', titel: 'in I einsetzen', hilfe: <><M>{'3 \\cdot 2 + 2y = 4'}</M>, also <M>{'6 + 2y = 4'}</M>. Rechne <M>{'\\mid -6'}</M>: <M>{'4 - 6'}</M>.</> },
                    { kurz: '④', titel: 'nach y auflösen', hilfe: <>Teile durch 2. Minus durch Plus ergibt Minus.</> },
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Beide Gleichungen multiplizieren">
            <CheckCard
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 3x + 2y &= 7 \\\\ \\text{II: } 2x + 3y &= 8 \\end{aligned}'}</MB>
                  <p>Hier reicht es nicht, nur eine Gleichung zu multiplizieren. Löse das Gleichungssystem und schreibe im Heft dazu, womit du welche Gleichung multiplizierst.</p>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 1 },
                { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 2 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} \\text{I} \\cdot 3{:}\\; 9x + 6y &= 21 \\\\ \\text{II} \\cdot 2{:}\\; 4x + 6y &= 16 \\\\ \\hline \\text{I} \\cdot 3 - \\text{II} \\cdot 2{:}\\; 5x &= 5 && \\mid :5 \\\\ x &= 1 \\end{aligned}'}</MB>
                  <MB>{'\\begin{aligned} \\text{in I: } 3 + 2y &= 7 && \\mid -3 \\\\ 2y &= 4 && \\mid :2 \\\\ y &= 2 \\end{aligned}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Vor <M>y</M> stehen 2 und 3. Welche Zahl ist ein gemeinsames Vielfaches?</>,
                    <>
                      6: Multipliziere I mit 3 und II mit 2. Dann steht in beiden Gleichungen <M>{'6y'}</M>.
                    </>,
                    <>
                      <M>{'9x + 6y = 21'}</M> und <M>{'4x + 6y = 16'}</M>. Subtrahiere und setze <M>x</M> dann in I ein.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Erst ordnen">
            <CheckCard
              punkte={9}
              title="Übung 5"
              profi
              level="erweiterung"
              prompt={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 2x &= 11 - 3y \\\\ \\text{II: } 4y + 2x &= 14 \\end{aligned}'}</MB>
                  <p>
                    Die Gleichungen sind durcheinander. Ordne sie zuerst so, dass links <M>x</M> und <M>y</M> untereinander stehen und rechts die Zahl. Löse dann das
                    Gleichungssystem.
                  </p>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 1 },
                { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} \\text{I: } 2x + 3y &= 11 && (\\mid +3y) \\\\ \\text{II: } 2x + 4y &= 14 \\\\ \\hline \\text{II} - \\text{I: } y &= 3 \\end{aligned}'}</MB>
                  <MB>{'\\begin{aligned} \\text{in I: } 2x + 9 &= 11 && \\mid -9 \\\\ 2x &= 2 && \\mid :2 \\\\ x &= 1 \\end{aligned}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Bringe in Gleichung I das <M>{'-3y'}</M> mit <M>{'\\mid +3y'}</M> nach links.</>,
                    <>
                      In II tauschst du nur die Reihenfolge: <M>{'2x + 4y = 14'}</M>.
                    </>,
                    <>
                      Vor <M>x</M> steht jetzt in beiden Gleichungen 2. Rechne <M>{'\\text{II} - \\text{I}'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Ballon-Labor">
            <BallonLabor />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt lineare Gleichungssysteme mit dem Additions- und Subtraktionsverfahren lösen. In Lernsituation 3 brauchst du das, um die Gleichung einer Wurfbahn aus
              zwei Punkten aufzustellen.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onPrev}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zu Lernsituation 1
              </button>
              <button type="button" className="bk-btn" onClick={onBack}>
                Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn" onClick={onPractice}>
                Weiter üben: Gleichungssysteme <i className="fa-solid fa-dumbbell" aria-hidden="true" />
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
                Zu Lernsituation 3 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell
      title="Gleichungssysteme: Das Gleichungs-Labor"
      width="wide"
      kompakt
      parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={
          <>
            Im Gleichungs-Labor lernst du das Additions- und Subtraktionsverfahren kennen. Damit löst du Gleichungssysteme, auch wenn die Gleichungen nicht nach <M>y</M> aufgelöst
            sind. Du brauchst es gleich in Lernsituation 3.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die geratenen Lösungspaare und die Entdeckung im Labor aus Phase 2 */
function Rueckbezug({ versuche, entdeckt }: { versuche: Paar[]; entdeckt: string | null }) {
  const bester = versuche.length ? versuche.reduce((p, q) => (abstand(q) < abstand(p) ? q : p)) : null
  return (
    <div className="ls-back">
      {bester && (
        <p>
          <strong>Du hattest geraten:</strong> {versuche.length} Lösungspaare. Dein bestes war <M>{`(${tx(bester.x)} \\mid ${tx(bester.y)})`}</M>
          {treffer(bester) ? ', ein Treffer!' : <>, es lag {fmt(abstand(bester))} Einheiten neben dem Schnittpunkt.</>} Gerechnet weißt du es sicher:{' '}
          <M>{'(2{,}5 \\mid 2{,}25)'}</M>.
        </p>
      )}
      {entdeckt && (
        <p>
          Im Labor hast du mit <M>{entdeckt}</M> entdeckt, wie eine Variable verschwindet. Genau das ist der Kern des Verfahrens.
        </p>
      )}
    </div>
  )
}
