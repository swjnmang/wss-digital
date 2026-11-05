import { useEffect, useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungCtx, Hilfen, McCard, SchrittHilfen, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Bildwelt, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import TunnelSpiel from './TunnelSpiel'
import titelBild from './bilder/titel.webp'
import beetplanBild from './bilder/beetplan.webp'
import anleitungBild from './bilder/anleitung.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './folientunnel.css'

// Lernsituation „Der Folientunnel“: Nullstellen quadratischer Funktionen mit der Mitternachtsformel berechnen (ca. 45–60 min).
// Bewusst noch ohne Diskriminante (Anzahl der Nullstellen kommt später): Alle Aufgaben haben zwei Nullstellen.
// Format Entscheidungsfall: Eine Gärtnerei hat einen gebrauchten Folientunnel gekauft. Im Datenblatt steht nur die Gleichung des Bogens
// y = −0,8x² − 0,16x + 2,442 (x und y in m, x = 0 am Wasseranschluss, nicht in der Mitte). Die Meisterin will drei Beete à 0,85 m und
// zwei Wege à 0,45 m anlegen, zusammen 3,45 m. Passt das auf den Boden? Die Fußpunkte liegen bei −1,85 und 1,65 (Breite 3,50 m):
// Es passt mit 5 cm Luft. Aha: Am Graphen liest man „etwa 3,4 bis 3,6 m“ ab, damit lässt sich nicht sicher entscheiden.
// Problem erkennen: Festlegung (passt / passt nicht / nicht sicher), dann mit der Messlatte Stellen ausprobieren (Live-Graph).
// Problem lösen: Problem → Beispielrechnung 2x² + x − 2 = 0 (Rechenschema der Lehrkraft) mit Lernvideo → Ergebnisse abgleichen
// (beide Fußpunkte, Breite) → Entscheidung → Handlungsprodukt analog: Arbeitsanweisung „Nullstellen berechnen“ für die Azubis
// (Schritt-für-Schritt-Anleitung mit dem Folientunnel als Beispiel). Danach Rückbezug und Merke.
// Phase 4: a, b, c ablesen (ungeordnet), Wer hat recht? (−b vergessen, −4² statt (−4)²), Lückenrechnung mit Schritt-Hilfen,
// Sprinkler (eine Nullstelle hat keine Bedeutung), Profi c = 0. Bonus-Spiel „Folie spannen“.
// Punkte nach Aufwand: Warm-up 2/2/2/4/3 = 13, Festlegung 3, Ausprobieren 3, Kernaufgabe 15, Entscheidung 4, Anleitung 5,
// Übungen 4/5/6/8, Profi 8 (Pflicht zusammen 66: Warm-up 13 = 20 %, Problem lösen 24 = 36 %, Übungen 23 = 35 %),
// Bonus-Spiel 4 Runden à 2 = 8 wie die beste Übung.
// Identität: Themenfarbe Beere (Tomaten), Symbol fa-leaf, Titelbild Folientunnel im Abendlicht mit „Breite am Boden: ? m“,
// Leitobjekt der Folientunnel (Bogen). Bildwelt Reportage / Abendlicht: Titelbild, Beetplan und Arbeitsanweisung sind gerenderte
// WebP-Dateien aus bilder-quelle/*.bild.html (node scripts/bilder-rendern.cjs src/pages/quadratische_funktionen/nullstellen_einstieg).
// Der Graph mit Live-Rückmeldung bleibt Inline-SVG.

const THEMA: Thema = {
  name: 'Der Folientunnel',
  farbe: 'beere',
  icon: 'fa-leaf',
  kicker: 'Aus der Ausbildung in der Gärtnerei',
  bildzeile: 'Der gebrauchte Folientunnel nach dem Aufbau. Illustration: Mathe-Trainer',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Ein Folientunnel mit parabelförmigen Bögen im Abendlicht auf dem Feld einer Gärtnerei. Am Boden liegt ein Maßband zwischen den Fußpunkten des vorderen Bogens, darunter steht: Breite am Boden: ? m."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'reportage', variante: 'abendlicht' }

/** Lernvideo aus den Übungsaufgaben „Nullstellen berechnen“ */
const VIDEO_NULLSTELLEN = 'https://www.youtube.com/embed/ldoXVAEAyLQ'

/* ── Der Bogen des Folientunnels (Leitobjekt) ────────────────────────────── */

const A = -0.8
const B = -0.16
const C = 2.442
const bogen = (x: number) => A * x * x + B * x + C
const X_LINKS = -1.85
const X_RECHTS = 1.65
const PLAN = 3.45

/** Zahl als Text mit Komma und echtem Minus */
const zahl = (v: number, d = 2) => fmt(v, d).replace('-', '−')
/** Zahl für KaTeX */
const tz = (v: number, d = 2) => fmt(v, d).replace(/\./g, '').replace(',', '{,}')

/* ── Graph des Bogens (Inline-SVG mit Live-Rückmeldung) ──────────────────── */

const G = { u: 104, l: 50, r: 24, t: 24, b: 54, xMin: -2.5, xMax: 2.5, yMin: -0.5, yMax: 3 }
const GW = G.l + G.r + (G.xMax - G.xMin) * G.u
const GH = G.t + G.b + (G.yMax - G.yMin) * G.u
const gx = (x: number) => G.l + (x - G.xMin) * G.u
const gy = (y: number) => G.t + (G.yMax - y) * G.u

type Messung = { x: number; aktuell?: boolean }

function BogenGraph({
  messungen = [],
  frage = false,
  live = [],
  label,
}: {
  messungen?: Messung[]
  frage?: boolean
  live?: (number | null)[]
  label: string
}) {
  const pfad: string[] = []
  for (let i = 0; i <= 120; i++) {
    const x = G.xMin + ((G.xMax - G.xMin) * i) / 120
    const y = bogen(x)
    if (y >= G.yMin - 0.05) pfad.push(`${pfad.length ? 'L' : 'M'}${gx(x).toFixed(1)} ${gy(Math.max(y, G.yMin)).toFixed(1)}`)
  }
  const raster: number[] = []
  for (let v = G.xMin; v <= G.xMax + 1e-9; v += 0.5) raster.push(Math.round(v * 2) / 2)
  const rasterY: number[] = []
  for (let v = G.yMin; v <= G.yMax + 1e-9; v += 0.5) rasterY.push(Math.round(v * 2) / 2)
  return (
    <div className="bk-graph ft-graph">
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={label}>
        <rect x={gx(G.xMin)} y={gy(0)} width={gx(G.xMax) - gx(G.xMin)} height={gy(G.yMin) - gy(0)} fill="var(--surface-sunken)" />
        {raster.map((v) => (
          <g key={`x${v}`}>
            <line x1={gx(v)} x2={gx(v)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--grid)" />
            {Number.isInteger(v) && v !== 0 && !(frage && Math.abs(v) === 2) && (
              <text x={gx(v)} y={gy(0) + 26} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
                {zahl(v)}
              </text>
            )}
          </g>
        ))}
        {rasterY.map((v) => (
          <g key={`y${v}`}>
            <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--grid)" />
            {Number.isInteger(v) && v > 0 && (
              <text x={gx(0) - 10} y={gy(v) + 7} textAnchor="end" fontSize="19" fill="var(--ink-muted)">
                {v}
              </text>
            )}
          </g>
        ))}
        <line x1={gx(0)} x2={gx(0)} y1={gy(G.yMin)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        <line x1={gx(G.xMin)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="3" />
        <text x={gx(G.xMax) - 4} y={gy(0) + 46} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
          x in m
        </text>
        <text x={gx(0) + 10} y={gy(G.yMax) + 16} fontSize="17" fill="var(--ink-muted)">
          y in m (Höhe)
        </text>
        <path d={pfad.join(' ')} fill="none" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
        {frage &&
          [X_LINKS, X_RECHTS].map((x) => (
            <g key={x}>
              <circle cx={gx(x)} cy={gy(0)} r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
              <text x={gx(x) + (x < 0 ? -26 : 26)} y={gy(0) + 32} textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--ink)">
                ?
              </text>
            </g>
          ))}
        {messungen.map((m, i) => {
          const y = bogen(m.x)
          const treffer = Math.abs(y) < 0.005
          return (
            <g key={i} opacity={m.aktuell ? 1 : 0.55}>
              {y > 0 && <line x1={gx(m.x)} x2={gx(m.x)} y1={gy(0)} y2={gy(y)} stroke={m.aktuell ? 'var(--ink)' : 'var(--line-strong)'} strokeWidth={m.aktuell ? 3 : 2} strokeDasharray="6 5" />}
              <circle cx={gx(m.x)} cy={gy(Math.max(y, G.yMin))} r={m.aktuell ? 9 : 6} fill={treffer ? 'var(--correct)' : m.aktuell ? 'var(--ink)' : 'var(--line-strong)'} stroke="var(--surface)" strokeWidth="2.5" />
            </g>
          )
        })}
        {live.map((x, i) =>
          x === null || x < G.xMin || x > G.xMax ? null : (
            <g key={`l${i}`}>
              <line x1={gx(x)} x2={gx(x)} y1={gy(0) - 30} y2={gy(0) + 6} stroke="var(--ink)" strokeWidth="3" />
              <polygon points={`${gx(x)},${gy(0) - 30} ${gx(x) + 22},${gy(0) - 23} ${gx(x)},${gy(0) - 16}`} fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
            </g>
          ),
        )}
      </svg>
    </div>
  )
}

/* ── Phase 2: Festlegung und Ausprobieren mit der Messlatte ─────────────── */

const WAHL: { wert: string; text: string }[] = [
  { wert: 'nein', text: 'Nein, der Boden ist zu schmal.' },
  { wert: 'ja', text: 'Ja, der Plan passt.' },
  { wert: 'unsicher', text: 'Kann ich nicht sicher sagen.' },
]

function Festlegung({ wahl, fest, onWahl, onFest }: { wahl: string | null; fest: boolean; onWahl: (w: string) => void; onFest: () => void }) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  if (fest) {
    return (
      <p className="ls-saved" role="status">
        <i className="fa-solid fa-lock" aria-hidden="true" /> Deine Vermutung: <strong>{WAHL.find((w) => w.wert === wahl)?.text}</strong> Gleich prüfst du sie mit der Messlatte.
      </p>
    )
  }
  return (
    <div className="ft-wahl-block" data-no-autocheck>
      <p className="sl-text">Sieh dir den Graphen des Bogens unten an. Passt der Beetplan mit 3,45 m auf den Boden des Tunnels?</p>
      <div className="ft-wahl" role="radiogroup" aria-label="Passt der Beetplan auf den Boden?">
        {WAHL.map((w) => (
          <button key={w.wert} type="button" role="radio" aria-checked={wahl === w.wert} className={`bk-btn${wahl === w.wert ? ' bk-btn-primary' : ''}`} onClick={() => onWahl(w.wert)}>
            {w.text}
          </button>
        ))}
      </div>
      <div>
        <button
          type="button"
          className="bk-btn bk-btn-primary"
          disabled={wahl === null}
          onClick={() => {
            pt.geloest()
            onFest()
          }}
        >
          <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
        </button>
      </div>
    </div>
  )
}

const MIND_VERSUCHE = 4

function Messlatte({ frei, messungen, onMessen, onFertig }: { frei: boolean; messungen: number[]; onMessen: (x: number) => void; onFertig: () => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const fertig = messungen.length >= MIND_VERSUCHE
  useEffect(() => {
    if (fertig) {
      pt.geloest()
      onFertig()
    }
  }, [fertig, pt, onFertig])
  const letzter = messungen[messungen.length - 1]
  const messen = () => {
    const p = parseInput(eingabe)
    if (!p) return setFehler('Bitte gib eine Zahl ein, z. B. 1,5 oder −2.')
    if (p.value < -2.5 || p.value > 2.5) return setFehler('Der Tunnel steht zwischen −2,5 m und 2,5 m. Probiere eine Stelle in diesem Bereich.')
    setFehler(null)
    onMessen(p.value)
  }
  const hoehe = letzter === undefined ? null : bogen(letzter)
  return (
    <div className="ft-labor" data-no-autocheck>
      <BogenGraph
        messungen={messungen.map((x, i) => ({ x, aktuell: i === messungen.length - 1 }))}
        label={`Graph des Bogens: Er beginnt links am Boden, steigt bis etwa 2,45 m und fällt rechts wieder auf den Boden. Gemessene Stellen: ${messungen.length ? messungen.map((x) => zahl(x)).join(', ') : 'noch keine'}.`}
      />
      {!frei ? (
        <p className="sl-hinweis">Halte zuerst oben deine Vermutung fest. Dann kannst du mit der Messlatte messen.</p>
      ) : (
        <div className="ft-eingabe">
          <label htmlFor={`${uid}-x`}>
            Messlatte an die Stelle <M>{'x ='}</M>
          </label>
          <input
            id={`${uid}-x`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="?"
            className="bk-input lp-input lp-input-sm ls-gap"
            value={eingabe}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') messen()
            }}
          />
          <span>m</span>
          <button type="button" className="bk-btn bk-btn-primary" onClick={messen}>
            <i className="fa-solid fa-ruler-vertical" aria-hidden="true" /> Höhe messen
          </button>
        </div>
      )}
      {fehler && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> {fehler}
        </div>
      )}
      {letzter !== undefined && hoehe !== null && (
        <div className={`ft-anzeige${Math.abs(hoehe) < 0.005 ? ' ft-anzeige-ok' : ''}`} role="status">
          <i className="fa-solid fa-ruler-vertical" aria-hidden="true" />
          <span>
            <strong>Messung {messungen.length}:</strong> An der Stelle <M>{`x = ${tz(letzter)}`}</M>{' '}
            {Math.abs(hoehe) < 0.005
              ? 'berührt der Bogen genau den Boden. Treffer!'
              : hoehe > 0
                ? `ist der Bogen ${zahl(hoehe)} m hoch.`
                : 'liegt kein Tunnel mehr: Die Stelle ist außerhalb, der Bogen wäre dort unter dem Boden.'}
          </span>
        </div>
      )}
      {frei && !fertig && (
        <p className="sl-hinweis">
          Finde die beiden Stellen, an denen der Bogen den Boden berührt. Noch {MIND_VERSUCHE - messungen.length} {MIND_VERSUCHE - messungen.length === 1 ? 'Messung' : 'Messungen'}, dann geht es weiter.
        </p>
      )}
    </div>
  )
}

function Erkenntnis({ messungen }: { messungen: number[] }) {
  const treffer = messungen.filter((x) => Math.abs(bogen(x)) < 0.005).length
  return (
    <p className="sl-text" role="status">
      {treffer === 2
        ? 'Du hast beide Fußpunkte gefunden, aber erst nach vielen Messungen. '
        : treffer === 1
          ? 'Einen Fußpunkt hast du getroffen, aber nur mit Glück und vielen Messungen. '
          : 'Ungefähr siehst du, wo der Bogen den Boden berührt: links bei etwa −1,8 oder −1,9, rechts bei etwa 1,6 oder 1,7. '}
      Damit liegt die Breite irgendwo zwischen 3,4 m und 3,6 m, der Plan braucht 3,45 m. <strong>Ablesen und Probieren reichen hier nicht für eine sichere Entscheidung.</strong> Auf
      der nächsten Seite lernst du, wie du die Stellen genau berechnest: mit der Mitternachtsformel.
    </p>
  )
}

/* ── Phase 3: Beispielrechnung nach dem Rechenschema ────────────────────── */

const BSP_AUFGABE = (
  <p>
    Berechne die Nullstellen der Funktion <M>{'y = 2x^2 + 1x - 2'}</M>.
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Setze <M>{'y = 0'}</M></>,
    body: (
      <>
        <p>An den Nullstellen ist die Höhe 0. Das ist die Voraussetzung für die folgenden Schritte.</p>
        <MB>{'2x^2 + 1x - 2 = 0'}</MB>
      </>
    ),
  },
  {
    title: <>Notiere die Koeffizienten <M>a</M>, <M>b</M> und <M>c</M></>,
    body: (
      <>
        <p>
          <M>a</M> steht vor dem <M>{'x^2'}</M>, <M>b</M> vor dem <M>x</M>, <M>c</M> ist die Zahl ohne <M>x</M>. Achtung: Vorzeichen mitnehmen.
        </p>
        <MB>{'a = 2, \\qquad b = 1, \\qquad c = -2'}</MB>
      </>
    ),
  },
  {
    title: 'Setze in die Mitternachtsformel ein',
    body: (
      <>
        <p>Die Formel steht in deiner Formelsammlung (Lösungsformel). Negative Zahlen setzt du in Klammern, wie hier <M>{'c = (-2)'}</M>.</p>
        <MB>{'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4 \\cdot a \\cdot c}}{2 \\cdot a}'}</MB>
        <MB>{'x_{1,2} = \\frac{-1 \\pm \\sqrt{1^2 - 4 \\cdot 2 \\cdot (-2)}}{2 \\cdot 2}'}</MB>
        <p>
          Das Zeichen <M>{'\\pm'}</M> (gesprochen: plus-minus) bedeutet: Den Wert der Wurzel addierst du einmal und subtrahierst ihn einmal. Dieses Zeichen gibt es auf dem
          Taschenrechner nicht. Du rechnest also zwei Rechnungen.
        </p>
      </>
    ),
  },
  {
    title: <>Rechne einmal mit <M>+</M> und einmal mit <M>-</M></>,
    body: (
      <>
        <p>
          Unter der Wurzel steht <M>{'1 + 16 = 17'}</M>, also <M>{'\\sqrt{17} \\approx 4{,}123'}</M>.
        </p>
        <MB>{'x_1 = \\frac{-1 + \\sqrt{17}}{4} \\approx 0{,}78 \\qquad x_2 = \\frac{-1 - \\sqrt{17}}{4} \\approx -1{,}28'}</MB>
        <p>
          Tipp für den Taschenrechner: Setze Zähler und Nenner in Klammern, z. B. <M>{'(-1 + \\sqrt{17}) : (2 \\cdot 2)'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Gib die vollständigen Koordinaten an',
    body: (
      <>
        <p>
          Nullstellen liegen auf der x-Achse, ihre y-Koordinate ist immer 0.
        </p>
        <MB>{'N_1(0{,}78 \\mid 0) \\quad \\text{und} \\quad N_2(-1{,}28 \\mid 0)'}</MB>
      </>
    ),
  },
  {
    title: 'Stolpersteine',
    body: (
      <ul className="zk-liste">
        <li>
          Negative Koeffizienten immer in Klammern setzen, wie bei <M>{'c = -2'}</M>. Ist <M>b</M> negativ, z. B. <M>{'b = -2'}</M>, beginnt die Formel mit{' '}
          <M>{'-(-2) \\pm \\ldots'}</M>, also mit <M>{'+2'}</M>.
        </li>
        <li>
          Quadrat mit Klammer: <M>{'(-2)^2 = 4'}</M>, aber <M>{'-2^2 = -4'}</M>. Tippe deshalb die Klammer mit ein.
        </li>
        <li>
          <M>{'x_1'}</M> ist nicht immer der linke Punkt: Ist <M>a</M> negativ, liegt <M>{'x_1'}</M> (mit <M>+</M>) links.
        </li>
        <li>Tippfehler vermeiden: Lass dir bei der Eingabe Zeit.</li>
      </ul>
    ),
  },
]

const LOESUNG_KERN = (
  <>
    <MB>{'-0{,}8x^2 - 0{,}16x + 2{,}442 = 0 \\qquad a = -0{,}8, \\; b = -0{,}16, \\; c = 2{,}442'}</MB>
    <MB>{'x_{1,2} = \\frac{-(-0{,}16) \\pm \\sqrt{(-0{,}16)^2 - 4 \\cdot (-0{,}8) \\cdot 2{,}442}}{2 \\cdot (-0{,}8)} = \\frac{0{,}16 \\pm \\sqrt{7{,}84}}{-1{,}6} = \\frac{0{,}16 \\pm 2{,}8}{-1{,}6}'}</MB>
    <MB>{'x_1 = \\frac{0{,}16 + 2{,}8}{-1{,}6} = -1{,}85 \\qquad x_2 = \\frac{0{,}16 - 2{,}8}{-1{,}6} = 1{,}65'}</MB>
    <MB>{'N_1(-1{,}85 \\mid 0), \\quad N_2(1{,}65 \\mid 0), \\qquad \\text{Breite} = 1{,}65 - (-1{,}85) = 3{,}5 \\text{ m}'}</MB>
  </>
)

/** Eingetippte Zahl, sonst null (für die Fähnchen im Graphen) */
const alsZahl = (v?: string) => {
  const p = v ? parseInput(v) : null
  return p ? p.value : null
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function FolientunnelEinstieg({ erklaerung, onBack, onPractice }: { erklaerung?: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [wahl, setWahl] = useSitzungState<string | null>('ft-wahl', null)
  const [fest, setFest] = useSitzungState('ft-fest', false)
  const [messungen, setMessungen] = useSitzungState<number[]>('ft-messungen', [])
  const [live, setLive] = useState<(number | null)[]>([null, null])
  const [geloest, setGeloest] = useSitzungState('ft-geloest', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('ft-uebungen', [])
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Den Taschenrechner darfst du benutzen. Einzelarbeit, ca. 8 Minuten.</p>
          <McCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Was ist eine Nullstelle?"
            prompt={<p>An einer Nullstelle schneidet der Graph die x-Achse. Was gilt dort immer?</p>}
            options={[
              { text: <M>{'x = 0'}</M>, feedback: 'x = 0 ist die y-Achse. An der Nullstelle ist die Höhe y gleich 0.' },
              { text: <M>{'x = y'}</M>, feedback: 'Das gilt nur auf der Winkelhalbierenden. Auf der x-Achse ist y immer 0.' },
              { text: <M>{'y = 0'}</M>, correct: true, feedback: 'Genau: Auf der x-Achse ist y = 0. Deshalb setzt man zum Berechnen y = 0.' },
              { text: 'Der Graph hat dort seinen höchsten Punkt.', feedback: 'Der höchste Punkt ist der Scheitelpunkt. Die Nullstelle liegt auf der x-Achse.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title={<>b) <M>a</M>, <M>b</M> und <M>c</M> ablesen</>}
            prompt={
              <p>
                Jede quadratische Funktion in allgemeiner Form heißt <M>{'y = ax^2 + bx + c'}</M>. Lies die Koeffizienten von <M>{'y = -x^2 + 4x - 7'}</M> ab, mit Vorzeichen.
              </p>
            }
            rechnung={[
              { l: ['a'], r: [{ luecke: 'a' }] },
              { l: ['b'], r: [{ luecke: 'b' }] },
              { l: ['c'], r: [{ luecke: 'c' }] },
            ]}
            fields={[
              { kind: 'num', key: 'a', label: 'a', expected: -1 },
              { kind: 'num', key: 'b', label: 'b', expected: 4 },
              { kind: 'num', key: 'c', label: 'c', expected: -7 },
            ]}
            solution={<p><M>{'-x^2'}</M> heißt <M>{'-1 \\cdot x^2'}</M>, also <M>{'a = -1'}</M>. Dazu <M>{'b = 4'}</M> und <M>{'c = -7'}</M> (das Minus gehört dazu).</p>}
            help={
              <Hilfen
                steps={[
                  <>Vergleiche Stück für Stück mit <M>{'ax^2 + bx + c'}</M>.</>,
                  <>Vor <M>{'x^2'}</M> steht nur ein Minus. Das ist <M>{'-1 \\cdot x^2'}</M>.</>,
                  <><M>{'a = -1'}</M>, <M>{'b = 4'}</M>, und das Minus vor der 7 gehört zu <M>c</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Quadrieren mit Klammer"
            prompt={<p>Rechne mit dem Taschenrechner. Tippe die Klammer mit ein.</p>}
            rechnung={[
              { l: ['(-3)^2'], r: [{ luecke: 'c1' }] },
              { l: ['(-0{,}5)^2'], r: [{ luecke: 'c2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'c1', label: 'minus 3 in Klammern zum Quadrat', expected: 9 },
              { kind: 'num', key: 'c2', label: 'minus 0,5 in Klammern zum Quadrat', expected: 0.25 },
            ]}
            solution={<MB>{'(-3)^2 = (-3) \\cdot (-3) = 9 \\qquad (-0{,}5)^2 = 0{,}25'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Quadrieren heißt: die Zahl mit sich selbst malnehmen.</>,
                  <>Minus mal Minus ergibt Plus. Ein Quadrat ist also nie negativ.</>,
                  <>Ohne Klammer rechnet der Taschenrechner <M>{'-(3^2) = -9'}</M>. Mit Klammer: <M>{'(-3) \\cdot (-3) = 9'}</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={4}
            title="d) Term unter der Wurzel"
            prompt={
              <p>
                Berechne <M>{'b^2 - 4 \\cdot a \\cdot c'}</M> für <M>{'a = 2'}</M>, <M>{'b = -3'}</M> und <M>{'c = -2'}</M>. Ziehe dann die Wurzel.
              </p>
            }
            rechnung={[
              { l: ['(-3)^2 - 4 \\cdot 2 \\cdot (-2)'], r: [{ luecke: 'd1' }] },
              { l: ['\\sqrt{25}'], r: [{ luecke: 'd2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'd1', label: 'Wert des Terms', expected: 25 },
              { kind: 'num', key: 'd2', label: 'Wurzel aus 25', expected: 5 },
            ]}
            solution={<MB>{'(-3)^2 - 4 \\cdot 2 \\cdot (-2) = 9 - (-16) = 9 + 16 = 25 \\qquad \\sqrt{25} = 5'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Rechne zuerst <M>{'(-3)^2'}</M>, dann <M>{'4 \\cdot 2 \\cdot (-2)'}</M>.</>,
                  <><M>{'4 \\cdot 2 \\cdot (-2) = -16'}</M>. Minus minus 16 ergibt plus 16.</>,
                  <><M>{'9 + 16 = 25'}</M>, und <M>{'5 \\cdot 5 = 25'}</M>.</>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Einmal plus, einmal minus"
            prompt={<p>Berechne beide Brüche. Rechne zuerst den Zähler und den Nenner aus.</p>}
            rechnung={[
              { l: ['\\frac{3 + 5}{2 \\cdot 2}'], r: [{ luecke: 'e1' }] },
              { l: ['\\frac{3 - 5}{2 \\cdot 2}'], r: [{ luecke: 'e2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'e1', label: 'Bruch mit plus', expected: 2 },
              { kind: 'num', key: 'e2', label: 'Bruch mit minus', expected: -0.5 },
            ]}
            solution={<MB>{'\\frac{3 + 5}{4} = \\frac{8}{4} = 2 \\qquad \\frac{3 - 5}{4} = \\frac{-2}{4} = -0{,}5'}</MB>}
            help={
              <Hilfen
                steps={[
                  <>Der Bruchstrich wirkt wie eine Klammer um Zähler und Nenner.</>,
                  <>Zähler: <M>{'3 + 5 = 8'}</M> bzw. <M>{'3 - 5 = -2'}</M>. Nenner: <M>{'2 \\cdot 2 = 4'}</M>.</>,
                  <><M>{'8 : 4 = 2'}</M> und <M>{'-2 : 4 = -0{,}5'}</M>.</>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Passt der Beetplan in den Folientunnel?',
      bedingung: 'Halte deine Vermutung fest und miss an mindestens vier Stellen.',
      pflicht: ['fest', 'messen'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst eine Ausbildung in einer Gärtnerei. Der Betrieb hat einen gebrauchten Folientunnel gekauft, in dem ab dem Frühjahr Tomaten und Salat wachsen sollen. Die
            Maße sind verloren gegangen. Im Datenblatt steht nur die Gleichung des Bogens.
          </p>
          <blockquote className="sl-zitat">
            <p>„Ich will die Beete am Montag abstecken. Aber nur, wenn ich sicher weiß, dass alles auf den Boden passt.“</p>
            <footer>Frau Kaya, Gärtnermeisterin und deine Ausbilderin</footer>
          </blockquote>
          <p className="sl-text">
            Der Bogen hat die Gleichung <M>{'y = -0{,}8x^2 - 0{,}16x + 2{,}442'}</M>, <M>x</M> und <M>y</M> in Metern. <M>y</M> ist die Höhe über dem Boden, <M>{'x = 0'}</M> ist
            der Wasseranschluss am Boden, er liegt nicht genau in der Mitte. Frau Kayas Plan: drei Beete mit je 0,85 m und zwei Wege mit je 0,45 m, zusammen 3,45 m. Gesucht ist,
            wie breit der Tunnel am Boden ist, also wo der Bogen den Boden berührt.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
            <p>Lege dich zuerst fest, ob der Plan passt. Miss dann mit der Messlatte die Höhe des Bogens an verschiedenen Stellen und suche die Stellen, an denen er den Boden berührt.</p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 8 Minuten.</p>
          <figure className="sl-foto">
            <img
              src={beetplanBild}
              width={1200}
              height={600}
              alt="Handgezeichneter Beetplan auf der Werkbank: der Bogen des Tunnels im Querschnitt, darunter drei Beete mit je 0,85 m und zwei Wege mit je 0,45 m, zusammen 3,45 m. Daneben die Notiz: Passt das auf den Boden?"
            />
            <figcaption>Frau Kayas Beetplan: drei Beete, zwei Wege, zusammen 3,45 m.</figcaption>
          </figure>
          <Abschnitt titel="1. Deine Vermutung">
            <Festlegung
              wahl={wahl}
              fest={fest}
              onWahl={setWahl}
              onFest={() => {
                setFest(true)
                fertig.teil('fest')()
              }}
            />
          </Abschnitt>
          <Abschnitt titel="2. Miss mit der Messlatte">
            <Messlatte frei={fest} messungen={messungen} onMessen={(x) => setMessungen((m) => [...m, x])} onFertig={fertig.teil('messen')} />
            {messungen.length >= MIND_VERSUCHE && <Erkenntnis messungen={messungen} />}
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Fußpunkte des Bogens berechnen',
      pflicht: ['kern', 'entscheidung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne, wie breit der Folientunnel am Boden ist</p>
            <p>
              Gegeben ist der Bogen <M>{'y = -0{,}8x^2 - 0{,}16x + 2{,}442'}</M>. Gesucht sind die beiden <strong>Nullstellen</strong>: die Fußpunkte, an denen der Bogen den Boden
              berührt (<M>{'y = 0'}</M>). Berechne sie in deinem Heft mit der Mitternachtsformel, gib sie als Punkte <M>{'N_1'}</M> und <M>{'N_2'}</M> an und berechne die Breite
              am Boden. Entscheide dann, ob Frau Kayas Plan mit 3,45 m passt.
            </p>
          </div>
          <BogenGraph frage live={live} label="Graph des Bogens mit zwei Fragezeichen an den Stellen, an denen er die x-Achse schneidet. Gelbe Fähnchen zeigen deine eingetippten Fußpunkte." />
          <BeispielMitVideo video={VIDEO_NULLSTELLEN} videoTitel="Lernvideo: Nullstellen berechnen">
            <Beispiel offen title="Nullstellen mit der Mitternachtsformel" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('kern')()
                setGeloest(true)
              }}
              punkte={15}
              title="Breite des Folientunnels"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt. Deine Fußpunkte erscheinen als Fähnchen im Graphen oben.</p>}
              fields={[
                { kind: 'num', key: 'links', label: <>An welcher Stelle berührt der Bogen links den Boden? <M>{'N_1(x \\mid 0)'}</M> mit <M>{'x ='}</M></>, expected: X_LINKS, tol: 0.005 },
                { kind: 'num', key: 'rechts', label: <>An welcher Stelle berührt er rechts den Boden? <M>{'N_2(x \\mid 0)'}</M> mit <M>{'x ='}</M></>, expected: X_RECHTS, tol: 0.005 },
                { kind: 'num', key: 'breite', label: 'Wie breit ist der Tunnel am Boden?', expected: 3.5, unit: 'm', tol: 0.005 },
              ]}
              onEingabe={(w) => setLive([alsZahl(w.links), alsZahl(w.rechts)])}
              loesungNachFehler
              solution={LOESUNG_KERN}
              help={
                <Hilfen
                  steps={[
                    <>
                      Setze <M>{'y = 0'}</M>: <M>{'-0{,}8x^2 - 0{,}16x + 2{,}442 = 0'}</M>. Lies mit Vorzeichen ab: <M>{'a = -0{,}8'}</M>, <M>{'b = -0{,}16'}</M>,{' '}
                      <M>{'c = 2{,}442'}</M>.
                    </>,
                    <>
                      Einsetzen, negative Zahlen in Klammern: <M>{'x_{1,2} = \\frac{-(-0{,}16) \\pm \\sqrt{(-0{,}16)^2 - 4 \\cdot (-0{,}8) \\cdot 2{,}442}}{2 \\cdot (-0{,}8)}'}</M>.
                    </>,
                    <>
                      Unter der Wurzel kommt <M>{'7{,}84'}</M> heraus, <M>{'\\sqrt{7{,}84} = 2{,}8'}</M>. Rechne <M>{'(0{,}16 + 2{,}8) : (-1{,}6)'}</M> und{' '}
                      <M>{'(0{,}16 - 2{,}8) : (-1{,}6)'}</M>. Die Breite ist rechter minus linker Fußpunkt.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Entscheidung">
            <McCard
              onSolved={fertig.teil('entscheidung')}
              punkte={4}
              title="Passt der Beetplan?"
              prompt={<p>Frau Kayas Plan braucht 3,45 m. Was sagst du ihr?</p>}
              options={[
                { text: 'Nein, denn 1,65 m ist viel weniger als 3,45 m.', feedback: '1,65 ist nur der rechte Fußpunkt. Die Breite ist der Abstand zwischen beiden Fußpunkten.' },
                { text: 'Ja, der Tunnel ist am Boden 3,50 m breit. Es bleiben 5 cm Luft.', correct: true, feedback: 'Genau: 1,65 − (−1,85) = 3,50 m, und 3,50 m sind mehr als 3,45 m.' },
                { text: 'Nein, denn −1,85 + 1,65 = −0,2 m.', feedback: 'Die Breite ist der Abstand: rechter minus linker Fußpunkt, 1,65 − (−1,85) = 3,50 m.' },
                { text: 'Ja, denn der Tunnel ist 2,442 m breit.', feedback: '2,442 ist c, also die Höhe des Bogens an der Stelle x = 0, nicht die Breite.' },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Arbeitsanweisung „Nullstellen berechnen“">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={anleitungBild}
                width={1200}
                height={480}
                alt="Karteikarte an einer Pinnwand mit der Überschrift Arbeitsanweisung: Nullstellen berechnen. Links stehen fünf Schritte: y = 0 setzen, a, b, c notieren, Mitternachtsformel, x₁ mit plus und x₂ mit minus, N₁ und N₂ angeben. Rechts die Überschriften Stolpersteine und Beispiel: Folientunnel mit leeren Zeilen."
              />
              <figcaption>So ähnlich kann deine Arbeitsanweisung aussehen.</figcaption>
            </figure>
            <p className="sl-text">
              Frau Kaya möchte, dass auch die anderen Azubis solche Bögen berechnen können. Schreibe dafür eine Arbeitsanweisung auf eine Karteikarte oder ins Heft: die fünf
              Schritte mit dem Folientunnel als Beispiel, darunter die Stolpersteine und deine Antwort an Frau Kaya.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Schritt 1: Setze y = 0, denn an den Fußpunkten ist die Höhe …“</li>
                <li>„Schritt 2: Lies a, b und c mit Vorzeichen ab: a = …, b = …, c = …“</li>
                <li>„Pass auf: Negative Zahlen kommen in Klammern, zum Beispiel …“</li>
                <li>„Liebe Frau Kaya, der Tunnel ist am Boden … m breit, deshalb …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Arbeitsanweisung vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                <>
                  Alle fünf Schritte stehen in der richtigen Reihenfolge da, jeweils mit der Rechnung für den Folientunnel: <M>{'y = 0'}</M> setzen, <M>a</M>, <M>b</M>, <M>c</M>{' '}
                  notieren, Mitternachtsformel, <M>{'x_1'}</M> und <M>{'x_2'}</M> getrennt rechnen, <M>{'N_1'}</M> und <M>{'N_2'}</M> angeben.
                </>,
                <>Mindestens zwei Stolpersteine sind erklärt, z. B. Klammern um negative Zahlen und zwei Rechnungen wegen <M>{'\\pm'}</M>.</>,
                'Am Ende steht die Breite am Boden mit Rechnung und deine Antwort an Frau Kaya in einem Satz.',
                <>
                  Darunter steht, was die Begriffe und Abkürzungen bedeuten: Nullstelle, Koeffizienten <M>a</M>, <M>b</M>, <M>c</M>, <M>{'x_1'}</M> und <M>{'x_2'}</M>,{' '}
                  <M>{'N_1'}</M> und <M>{'N_2'}</M>, das Zeichen <M>{'\\pm'}</M> (plus-minus) und Mitternachtsformel (Lösungsformel). Erkläre auch alle anderen Wörter, die für dich
                  neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug wahl={wahl} messungen={messungen} />
              <Merke title="Nullstellen mit der Mitternachtsformel berechnen">
                <ol className="zk-liste">
                  <li>
                    <M>{'y = 0'}</M> setzen: <M>{'ax^2 + bx + c = 0'}</M>
                  </li>
                  <li>
                    <M>a</M>, <M>b</M> und <M>c</M> mit Vorzeichen notieren
                  </li>
                  <li>
                    In die Mitternachtsformel einsetzen, negative Zahlen in Klammern: <M>{'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4 \\cdot a \\cdot c}}{2 \\cdot a}'}</M>
                  </li>
                  <li>
                    Zwei Rechnungen: <M>{'x_1'}</M> mit <M>+</M>, <M>{'x_2'}</M> mit <M>-</M>
                  </li>
                  <li>
                    Koordinaten angeben: <M>{'N_1(x_1 \\mid 0)'}</M> und <M>{'N_2(x_2 \\mid 0)'}</M>
                  </li>
                </ol>
                <p>Der Abstand zweier Nullstellen ist „rechte minus linke Nullstelle“.</p>
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
            Einzelarbeit, ca. 15 Minuten.
          </p>
          <Abschnitt titel={<>Übung 1: <M>a</M>, <M>b</M> und <M>c</M> finden</>}>
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Folientunnel: Koeffizienten ablesen (Basis)"
              title="Übung 1"
              level="basis"
              prompt={
                <p>
                  Ein zweiter Bogen hat die Gleichung <M>{'y = 3 - x^2 + 2x'}</M>. Welche Werte setzt du in die Mitternachtsformel ein?
                </p>
              }
              options={[
                { text: <M>{'a = 3, \\; b = -1, \\; c = 2'}</M>, feedback: 'Die Reihenfolge in der Gleichung ist egal. a gehört immer zu x², b zu x und c ist die Zahl ohne x.' },
                { text: <M>{'a = 1, \\; b = 2, \\; c = 3'}</M>, feedback: 'Das Vorzeichen fehlt: −x² heißt a = −1.' },
                { text: <M>{'a = -1, \\; b = 2, \\; c = 3'}</M>, correct: true, feedback: 'Genau: Ordne zuerst: y = −x² + 2x + 3.' },
                { text: <M>{'a = -x^2, \\; b = 2x, \\; c = 3'}</M>, feedback: 'a, b und c sind nur die Zahlen vor x² und x, ohne das x.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              topic="Folientunnel: typische Fehler in der Mitternachtsformel (Standard)"
              title="Übung 2"
              level="standard"
              prompt={
                <>
                  <p>
                    Drei Azubis berechnen die Nullstellen von <M>{'y = x^2 - 4x - 5'}</M>. Wer hat richtig gerechnet?
                  </p>
                  <div className="ft-plaene">
                    <div className="ft-plan">
                      <span className="ft-plan-name">Tom</span>
                      <MB>{'x_{1,2} = \\frac{-4 \\pm \\sqrt{(-4)^2 - 4 \\cdot 1 \\cdot (-5)}}{2} = \\frac{-4 \\pm 6}{2} \\;\\Rightarrow\\; x_1 = 1, \\; x_2 = -5'}</MB>
                    </div>
                    <div className="ft-plan">
                      <span className="ft-plan-name">Mia</span>
                      <MB>{'x_{1,2} = \\frac{4 \\pm \\sqrt{-4^2 - 4 \\cdot 1 \\cdot (-5)}}{2} = \\frac{4 \\pm 2}{2} \\;\\Rightarrow\\; x_1 = 3, \\; x_2 = 1'}</MB>
                    </div>
                    <div className="ft-plan">
                      <span className="ft-plan-name">Lena</span>
                      <MB>{'x_{1,2} = \\frac{-(-4) \\pm \\sqrt{(-4)^2 - 4 \\cdot 1 \\cdot (-5)}}{2 \\cdot 1} = \\frac{4 \\pm 6}{2} \\;\\Rightarrow\\; x_1 = 5, \\; x_2 = -1'}</MB>
                    </div>
                  </div>
                </>
              }
              options={[
                { text: 'Tom', feedback: 'Tom hat −b falsch eingesetzt: Bei b = −4 ist −b = −(−4) = +4, nicht −4.' },
                { text: 'Mia', feedback: 'Mia hat −4² gerechnet, das ist −16. Richtig ist (−4)² = 16, unter der Wurzel steht dann 36.' },
                { text: 'Alle drei, die Ergebnisse unterscheiden sich nur in der Reihenfolge.', feedback: 'Die Ergebnisse sind verschieden: 1 und −5, 3 und 1, 5 und −1. Nur eines kann stimmen.' },
                { text: 'Lena: N₁(5 | 0) und N₂(−1 | 0)', correct: true, feedback: 'Genau: −(−4) = 4 und (−4)² = 16. Probe: 5² − 4 · 5 − 5 = 0.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Schritt für Schritt">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Folientunnel: Nullstellen mit Lückenrechnung (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Berechne die Nullstellen von <M>{'y = -2x^2 + 3x + 4'}</M>. Runde auf zwei Nachkommastellen.
                </p>
              }
              rechnung={[
                { l: ['a'], r: [{ luecke: 'a' }] },
                { l: ['b'], r: [{ luecke: 'b' }] },
                { l: ['c'], r: [{ luecke: 'c' }] },
                { l: ['x_1 = \\frac{-b + \\sqrt{b^2 - 4ac}}{2a}'], r: [{ luecke: 'x1' }] },
                { l: ['x_2 = \\frac{-b - \\sqrt{b^2 - 4ac}}{2a}'], r: [{ luecke: 'x2' }] },
              ]}
              fields={[
                { kind: 'num', key: 'a', label: 'a', expected: -2 },
                { kind: 'num', key: 'b', label: 'b', expected: 3 },
                { kind: 'num', key: 'c', label: 'c', expected: 4 },
                { kind: 'num', key: 'x1', label: 'x1 mit plus', expected: -0.85, tol: 0.006 },
                { kind: 'num', key: 'x2', label: 'x2 mit minus', expected: 2.35, tol: 0.006 },
              ]}
              solution={
                <>
                  <MB>{'x_{1,2} = \\frac{-3 \\pm \\sqrt{3^2 - 4 \\cdot (-2) \\cdot 4}}{2 \\cdot (-2)} = \\frac{-3 \\pm \\sqrt{41}}{-4}'}</MB>
                  <MB>{'x_1 = \\frac{-3 + 6{,}403}{-4} \\approx -0{,}85 \\qquad x_2 = \\frac{-3 - 6{,}403}{-4} \\approx 2{,}35'}</MB>
                  <p>
                    Also <M>{'N_1(-0{,}85 \\mid 0)'}</M> und <M>{'N_2(2{,}35 \\mid 0)'}</M>. Weil <M>a</M> negativ ist, liegt <M>{'x_1'}</M> links.
                  </p>
                </>
              }
              help={
                <SchrittHilfen
                  schritte={[
                    { kurz: 'a, b, c', titel: 'Koeffizienten', hilfe: <p>Vor <M>{'x^2'}</M> steht <M>{'-2'}</M>, vor <M>x</M> steht <M>3</M>, ohne <M>x</M> steht <M>4</M>.</p> },
                    {
                      kurz: 'Wurzel',
                      titel: 'Unter der Wurzel',
                      hilfe: (
                        <p>
                          <M>{'3^2 - 4 \\cdot (-2) \\cdot 4 = 9 + 32 = 41'}</M>, also <M>{'\\sqrt{41} \\approx 6{,}403'}</M>. Der Nenner ist <M>{'2 \\cdot (-2) = -4'}</M>.
                        </p>
                      ),
                    },
                    { kurz: <M>{'x_1'}</M>, titel: 'x₁ mit plus', hilfe: <p><M>{'(-3 + 6{,}403) : (-4) = 3{,}403 : (-4)'}</M>. Plus durch Minus ergibt Minus.</p> },
                    { kurz: <M>{'x_2'}</M>, titel: 'x₂ mit minus', hilfe: <p><M>{'(-3 - 6{,}403) : (-4) = -9{,}403 : (-4)'}</M>. Minus durch Minus ergibt Plus.</p> },
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Der Sprinkler">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Folientunnel: Nullstellen im Sachzusammenhang deuten (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Im Tunnel steht ein Sprinkler an der Stelle <M>{'x = 0'}</M>. Er spritzt nach rechts, seine Düse ist 0,6 m hoch. Der Wasserstrahl hat die Gleichung{' '}
                  <M>{'y = -0{,}25x^2 + x + 0{,}6'}</M> (<M>x</M> und <M>y</M> in m). Berechne beide Nullstellen, gerundet auf zwei Nachkommastellen, und entscheide, welche angibt,
                  wo das Wasser auf den Boden trifft.
                </p>
              }
              fields={[
                { kind: 'num', key: 'x1', label: <><M>{'x_1'}</M> (mit <M>+</M>) =</>, expected: -0.53, tol: 0.006 },
                { kind: 'num', key: 'x2', label: <><M>{'x_2'}</M> (mit <M>-</M>) =</>, expected: 4.53, tol: 0.006 },
                {
                  kind: 'select',
                  key: 'deutung',
                  label: 'Wo trifft das Wasser auf den Boden?',
                  options: ['bei x₁ (links vom Sprinkler)', 'bei x₂ (rechts vom Sprinkler)', 'an beiden Stellen'],
                  expected: 1,
                },
              ]}
              solution={
                <>
                  <MB>{'x_{1,2} = \\frac{-1 \\pm \\sqrt{1^2 - 4 \\cdot (-0{,}25) \\cdot 0{,}6}}{2 \\cdot (-0{,}25)} = \\frac{-1 \\pm \\sqrt{1{,}6}}{-0{,}5}'}</MB>
                  <MB>{'x_1 \\approx \\frac{-1 + 1{,}265}{-0{,}5} \\approx -0{,}53 \\qquad x_2 \\approx \\frac{-1 - 1{,}265}{-0{,}5} \\approx 4{,}53'}</MB>
                  <p>
                    Das Wasser kommt erst ab <M>{'x = 0'}</M> aus der Düse. Die Nullstelle <M>{'x_1 \\approx -0{,}53'}</M> liegt hinter dem Sprinkler und hat hier keine Bedeutung. Das
                    Wasser trifft 4,53 m rechts vom Sprinkler auf den Boden.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Lies ab: <M>{'a = -0{,}25'}</M>, <M>{'b = 1'}</M>, <M>{'c = 0{,}6'}</M>.</>,
                    <>Unter der Wurzel: <M>{'1 - 4 \\cdot (-0{,}25) \\cdot 0{,}6 = 1 + 0{,}6 = 1{,}6'}</M>. Der Nenner ist <M>{'-0{,}5'}</M>.</>,
                    <>Der Strahl beginnt bei <M>{'x = 0'}</M> und fliegt nach rechts. Welche Nullstelle liegt rechts davon?</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel={<>Übung 5 für Profis: Wenn <M>c</M> fehlt</>}>
            <McCard
              title="Übung 5"
              profi
              punkte={8}
              level="erweiterung"
              rechnen
              prompt={
                <p>
                  Ein Rankbogen für Bohnen hat die Gleichung <M>{'y = -0{,}5x^2 + 2x'}</M>. Kann man die Mitternachtsformel benutzen, obwohl kein <M>c</M> dasteht?
                </p>
              }
              options={[
                { text: <>Nein, ohne <M>c</M> funktioniert die Formel nicht.</>, feedback: 'Steht keine Zahl ohne x da, ist c = 0. Die Formel funktioniert trotzdem.' },
                { text: <>Ja, mit <M>{'c = 0'}</M>: <M>{'N_1(0 \\mid 0)'}</M> und <M>{'N_2(4 \\mid 0)'}</M></>, correct: true, feedback: 'Genau: Unter der Wurzel steht 2² − 0 = 4, also x = (−2 ± 2) : (−1). Das ergibt 0 und 4.' },
                { text: <>Ja, mit <M>{'c = 2'}</M>, weil die 2 die letzte Zahl ist.</>, feedback: 'Die 2 steht vor dem x, sie ist b. c ist die Zahl ohne x, hier also 0.' },
                { text: <>Ja, aber es gibt nur die Nullstelle <M>{'N(4 \\mid 0)'}</M>.</>, feedback: 'Rechne beide Fälle: (−2 + 2) : (−1) = 0 ergibt auch die Nullstelle (0 | 0). Der Bogen beginnt im Ursprung.' },
              ]}
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 4} titel="Folie spannen">
            <TunnelSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt die Nullstellen einer quadratischen Funktion mit der Mitternachtsformel berechnen. In den Übungsaufgaben rechnest du viele weitere Funktionen.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Nullstellen berechnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Nullstellen berechnen: Der Folientunnel" width="wide" kompakt>
      <ErklaerungCtx.Provider value={erklaerung ?? null}>
        <SeitenLernsituation
          ruhig
          punkte
          thema={THEMA}
          bildwelt={BILDWELT}
          ziel={
            <>
              In einer Gärtnerei prüfst du, ob ein Beetplan in einen gebrauchten Folientunnel passt. Dabei lernst du, wie du die Nullstellen einer quadratischen Funktion mit der
              Mitternachtsformel berechnest, auch wenn du sie im Graphen nicht genau ablesen kannst.
            </>
          }
          seiten={seiten}
        />
      </ErklaerungCtx.Provider>
    </TaskShell>
  )
}

/** Rückbezug auf Vermutung und Messungen aus „Problem erkennen“ */
function Rueckbezug({ wahl, messungen }: { wahl: string | null; messungen: number[] }) {
  if (wahl === null) return null
  return (
    <div className="ls-back">
      <p>
        <strong>Deine Vermutung war: „{WAHL.find((w) => w.wert === wahl)?.text}“</strong> Mit {messungen.length} Messungen bist du den Fußpunkten nahegekommen, aber auf den
        Zentimeter genau ging es nur mit der Rechnung: Der Tunnel ist am Boden <M>{'1{,}65 - (-1{,}85) = 3{,}5'}</M> m breit. Frau Kayas Plan mit {zahl(PLAN)} m passt, es bleiben
        nur 5 cm Luft. {wahl === 'unsicher' ? 'Du warst zu Recht unsicher: Am Graphen allein war das nicht zu entscheiden.' : wahl === 'ja' ? 'Dein Gefühl hat gestimmt, jetzt hast du es auch belegt.' : 'Am Graphen sah es knapp aus, die Rechnung zeigt: Es reicht.'}
      </p>
    </div>
  )
}
