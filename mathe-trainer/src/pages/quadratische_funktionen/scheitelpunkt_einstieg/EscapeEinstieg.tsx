import { useEffect, useId, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungCtx, Hilfen, Loesungsweg, McCard, TrackedCheck, TrackedMc } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Bildwelt, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, standardKriterien } from '../../finanzmathe/zins_kit/zins_kit'
import ScheitelJagd from './ScheitelJagd'
import titelBild from './bilder/lichtwerk-titel.webp'
import merkkarteBild from './bilder/lichtwerk-merkkarte.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './escape.css'

// Lernsituation „Das Lichtwerk“: Scheitelpunkt aus der allgemeinen Form berechnen (ca. 60–90 min), Neuaufbau nach dem aktuellen Skill.
// Format Rätsel / Escape-Room: Azubi bei der Werbetechnik-Firma „Lichtwerk“, die Lagertür fällt ins Schloss. Der vierteilige Türcode
// steckt im Brunnen-Modell: Teil 1 und 2 ist der Scheitelpunkt der Parabel-Schablone y = x² − 6x + 5 (über die Symmetrie: S(3 | −4)),
// Teil 3 und 4 der höchste Punkt des Wasserstrahls y = −0,4x² + 2,8x + 1 (mit x_S = −b/(2a): S(3,5 | 5,9)).
// Problem erkennen: Festlegung am Bild des Brunnens (höchster Punkt geschätzt). Aha: Genau trifft man den Scheitel durch Schätzen kaum.
// Problem lösen in zwei Teilen auf je einer eigenen Seite: Teil 1 Symmetrie (Punkte gleicher Höhe, Mitte), Teil 2 Formel x_S = −b/(2a)
// am Brunnen, dazu Handlungsprodukt analog: Merkkarte „Scheitelpunkt berechnen“, Rückbezug und Merke.
// Phase 4: Scheitelpunkt wählen (Fehloptionen Vorzeichen, Nenner a, y_S = c), Wer hat recht?, umgekehrt b und c bestimmen, Profi b aus x_S.
// Bonus-Spiel „Scheitel-Jagd“.
// Punkte nach Aufwand: Warm-up 2/3/2/2/3 = 12, Festlegung 3, Teil 1 10, Teil 2 12, Merkkarte 5, Übungen 4/6/8, Profi 9
// (Pflicht zusammen 60: Warm-up 20 %, Problem lösen 27 = 45 %, Übungen 18 = 30 %), Bonus-Spiel 4 Runden à 2.
// Identität: Themenfarbe Schiefer, Symbol fa-door-closed, Titelbild Comic in drei Bildern (Tür fällt zu, Türcode, Brunnen-Strahl),
// Leitobjekt der Türcode. Bildwelt Comic / Manga: Titelbild und Merkkarte sind gerenderte WebP-Dateien aus bilder-quelle/lichtwerk-*.bild.html
// (Bausteine in bilder-quelle/_comic.js); Diagramme und das Symmetrie-Labor bleiben Inline-SVG.

/** Lernvideo aus den Übungsaufgaben „Scheitelpunkt berechnen“ */
const VIDEO_SCHEITEL = 'https://www.youtube.com/watch?v=Im1FRd6_o-w'

const THEMA: Thema = {
  name: 'Das Lichtwerk',
  farbe: 'schiefer',
  icon: 'fa-door-closed',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Comic in drei Bildern, schwarzweiß: Eine Tür fällt mit Klack ins Schloss, Freitag 19:05 Uhr. Ein Türdisplay zeigt einen Türcode mit vier Fragezeichen, eine Sprechblase sagt: Die Zahlen stecken im Brunnen, den ich letzte Woche gebaut hab. Im dritten Bild spritzt ein Wasserstrahl als Parabel von der Düse ins Becken, über dem höchsten Punkt steht ein Fragezeichen."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'comic', variante: 'manga' }

/* ── Situation ───────────────────────────────────────────────────────────── */

// Wasserstrahl: 1 LE = 1 m, Düse (0 | 1), Beckenrand (7 | 1), höchster Punkt S(3,5 | 5,9).
const strahl = (x: number) => -0.4 * x * x + 2.8 * x + 1
// Parabel-Schablone der Werkbank: y = x² − 6x + 5, S(3 | −4)
const symF = (x: number) => x * x - 6 * x + 5
const CODE = ['3', '−4', '3,5', '5,9']

type Schaetzung = { x: number; y: number; fest: boolean }

/* ── Diagramm ────────────────────────────────────────────────────────────── */

const G = { w: 640, h: 330, l: 44, r: 14, t: 12, b: 34 }

function Diagramm({
  f,
  xMin,
  xMax,
  yMin,
  yMax,
  yStep = 1,
  label,
  children,
}: {
  f: (x: number) => number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  yStep?: number
  label: string
  children?: (bx: (x: number) => number, by: (y: number) => number) => ReactNode
}) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  const bx = (x: number) => G.l + ((x - xMin) / (xMax - xMin)) * (G.w - G.l - G.r)
  const by = (y: number) => G.h - G.b - ((y - yMin) / (yMax - yMin)) * (G.h - G.t - G.b)
  const pts = Array.from({ length: 241 }, (_, i) => xMin + ((xMax - xMin) * i) / 240)
    .map((x) => `${bx(x)},${by(f(x))}`)
    .join(' ')
  const xs: number[] = []
  for (let v = Math.ceil(xMin); v <= xMax; v++) xs.push(v)
  const ys: number[] = []
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) ys.push(v)
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label={label}>
        <defs>
          <clipPath id={clip}>
            <rect x={bx(xMin)} y={G.t} width={bx(xMax) - bx(xMin)} height={by(yMin) - G.t} />
          </clipPath>
        </defs>
        {xs.map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(yMin)} y2={by(yMax)} stroke="var(--grid)" />
            {v !== 0 && (
              <text x={bx(v)} y={by(yMin) + 22} textAnchor="middle" fontSize="17" fill="var(--ink-muted)">
                {String(v).replace('-', '−')}
              </text>
            )}
          </g>
        ))}
        {ys.map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(xMin)} x2={bx(xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            {v !== 0 && (
              <text x={bx(xMin) - 6} y={by(v) + 6} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
                {String(v).replace('-', '−')}
              </text>
            )}
          </g>
        ))}
        {yMin <= 0 && yMax >= 0 && <line x1={bx(xMin)} x2={bx(xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="2" />}
        {xMin <= 0 && xMax >= 0 && <line x1={bx(0)} x2={bx(0)} y1={by(yMin)} y2={by(yMax)} stroke="var(--ink)" strokeWidth="2" />}
        <g clipPath={`url(#${clip})`}>
          <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        </g>
        {children?.(bx, by)}
      </svg>
    </div>
  )
}

/** Brunnen von der Seite; mit Schätzung (Marke) und ggf. dem berechneten höchsten Punkt */
function BrunnenBild({ guess, showS = false }: { guess?: { x: number; y: number }; showS?: boolean }) {
  return (
    <Diagramm f={strahl} xMin={-0.5} xMax={9} yMin={-1} yMax={8} yStep={2} label="Wasserstrahl des Brunnens als Parabel, Düse bei 0 m in 1 m Höhe, Beckenrand bei 7 m in 1 m Höhe">
      {(bx, by) => (
        <>
          <rect x={bx(-0.5)} y={by(0)} width={bx(9) - bx(-0.5)} height={by(-1) - by(0)} fill="var(--surface-sunken)" />
          <line x1={bx(-0.5)} x2={bx(9)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
          <rect x={bx(0) - 8} y={by(1)} width="16" height={by(0) - by(1)} fill="var(--ink)" />
          <text x={bx(0) + 14} y={by(1) + 4} fontSize="16" fontWeight="700" fill="var(--ink)">
            Düse
          </text>
          <rect x={bx(7)} y={by(1)} width={bx(8.5) - bx(7)} height={by(0) - by(1)} fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
          <text x={bx(7) + 4} y={by(1) - 6} fontSize="16" fontWeight="700" fill="var(--ink)">
            Becken
          </text>
          {guess && (
            <g>
              <line x1={bx(guess.x)} x2={bx(guess.x)} y1={by(0)} y2={by(guess.y)} stroke="var(--ink-muted)" strokeDasharray="6 4" strokeWidth="2" />
              <circle cx={bx(guess.x)} cy={by(guess.y)} r="9" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
              <text x={bx(guess.x) + 14} y={by(guess.y) - 8} fontSize="16" fontWeight="700" fill="var(--ink)">
                deine Schätzung
              </text>
            </g>
          )}
          {showS && (
            <g>
              <circle cx={bx(3.5)} cy={by(5.9)} r="9" fill="var(--correct)" stroke="var(--ink)" strokeWidth="2.5" />
              <text x={bx(3.5) + 14} y={by(5.9) + 24} fontSize="16" fontWeight="700" fill="var(--correct-ink)">
                S(3,5 | 5,9)
              </text>
            </g>
          )}
        </>
      )}
    </Diagramm>
  )
}

/** Werkbank: Parabel-Schablone mit waagerechter Linie, zwei Punkte gleicher Höhe und ihre Mitte */
function SymmetrieLabor() {
  const id = useId()
  const [h, setH] = useSitzungState('lw-hoehe', 5)
  const w = Math.sqrt(4 + h)
  const x1 = 3 - w
  const x2 = 3 + w
  const z = (v: number) => fmt(v, 2).replace('-', '−').replace(',', '{,}')
  return (
    <div className="lw-regler">
      <Diagramm f={symF} xMin={-1} xMax={7} yMin={-5} yMax={6} label="Parabel y = x² − 6x + 5 mit waagerechter Linie und zwei Punkten gleicher Höhe">
        {(bx, by) => (
          <>
            <line x1={bx(-1)} x2={bx(7)} y1={by(h)} y2={by(h)} stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 5" />
            <line x1={bx((x1 + x2) / 2)} x2={bx((x1 + x2) / 2)} y1={by(-5)} y2={by(6)} stroke="var(--ink-muted)" strokeWidth="2" strokeDasharray="4 4" />
            {[x1, x2].map((x, i) => (
              <circle key={i} cx={bx(x)} cy={by(h)} r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
            ))}
          </>
        )}
      </Diagramm>
      <div className="ls-slider">
        <label htmlFor={id}>
          Höhe der Linie <M>y</M> = <span className="ls-slider-value">{h}</span>
        </label>
        <input id={id} type="range" min={-4} max={5} step={1} value={h} onChange={(e: ChangeEvent<HTMLInputElement>) => setH(Number(e.target.value))} />
      </div>
      <div className="lw-anzeige">
        <span>
          Punkte auf Höhe {h}: <M>{`x_1 \\approx ${z(x1)}`}</M> und <M>{`x_2 \\approx ${z(x2)}`}</M>
        </span>
        <span>
          Mitte: <M>{`\\dfrac{x_1 + x_2}{2} = ${z((x1 + x2) / 2)}`}</M>
        </span>
      </div>
    </div>
  )
}

/** Leitobjekt: der Türcode des Lagers */
function Tuercode({ teile }: { teile: number }) {
  return (
    <div className="lw-code" role="status" aria-label="Türcode">
      <span>
        <i className={`fa-solid ${teile === 4 ? 'fa-door-open' : 'fa-lock'}`} aria-hidden="true" /> Türcode
      </span>
      <span className="lw-ziffern">
        {CODE.map((c, i) => (
          <span key={i} className={`lw-ziffer ${i < teile ? 'is-on' : ''}`}>
            {i < teile ? c : '?'}
          </span>
        ))}
      </span>
      {teile === 4 && <strong>Die Tür ist offen!</strong>}
    </div>
  )
}

/** Festlegung: höchsten Punkt des Strahls schätzen */
function Schaetzen({ wert, onChange, onFest }: { wert: Schaetzung; onChange: (s: Schaetzung) => void; onFest: () => void }) {
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  useEffect(() => {
    if (wert.fest) pt.geloest()
  }, [wert.fest, pt])
  return (
    <div className="lp-ex bk-panel" data-no-autocheck>
      {wert.fest ? (
        <p className="ls-saved" role="status">
          <i className="fa-solid fa-lock" aria-hidden="true" /> Festgehalten: höchster Punkt bei <strong>x ≈ {fmt(wert.x, 1)} m</strong> in <strong>{fmt(wert.y, 1)} m</strong> Höhe.
        </p>
      ) : (
        <>
          <p>Schätze nur mit dem Bild. Verschiebe die Marke an die Stelle, wo du den höchsten Punkt vermutest.</p>
          <div className="ls-slider">
            <label htmlFor="lw-sx">
              Entfernung von der Düse <M>x</M> ≈ <span className="ls-slider-value">{fmt(wert.x, 1)}</span> m
            </label>
            <input id="lw-sx" type="range" min={0} max={7} step={0.1} value={wert.x} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...wert, x: Number(e.target.value) })} />
          </div>
          <div className="ls-slider">
            <label htmlFor="lw-sy">
              Höhe <M>y</M> ≈ <span className="ls-slider-value">{fmt(wert.y, 1)}</span> m
            </label>
            <input id="lw-sy" type="range" min={0} max={8} step={0.1} value={wert.y} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...wert, y: Number(e.target.value) })} />
          </div>
          <div>
            <button
              type="button"
              className="bk-btn bk-btn-primary"
              onClick={() => {
                onChange({ ...wert, fest: true })
                onFest()
              }}
            >
              <i className="fa-solid fa-lock" aria-hidden="true" /> Schätzung festhalten
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Rechenbeispiele (andere Zahlen) und Lösungswege ─────────────────────── */

const BSP1_AUFGABE = (
  <p>
    Bestimme den Scheitelpunkt der Parabel <M>{'y = x^2 - 4x + 1'}</M> mit zwei Punkten gleicher Höhe.
  </p>
)
const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Zwei Punkte gleicher Höhe suchen',
    body: (
      <>
        <p>
          Bei <M>{'x = 0'}</M> ist <M>{'y = 1'}</M>. Auf derselben Höhe liegt auch <M>{'x = 4'}</M>:
        </p>
        <MB>{'x = 4{:}\\; y = 16 - 16 + 1 = 1'}</MB>
      </>
    ),
  },
  {
    title: 'Die Mitte der beiden x-Werte ist x_S',
    body: (
      <>
        <p>Die Parabel ist symmetrisch. Ihr Scheitel liegt genau in der Mitte zwischen zwei Punkten gleicher Höhe:</p>
        <MB>{'x_S = \\dfrac{0 + 4}{2} = 2'}</MB>
      </>
    ),
  },
  {
    title: <><M>{'x_S'}</M> einsetzen und <M>{'y_S'}</M> berechnen</>,
    body: <MB>{'y_S = 2^2 - 4 \\cdot 2 + 1 = -3'}</MB>,
  },
  {
    title: 'Scheitelpunkt angeben',
    body: <MB>{'S(2 \\mid -3)'}</MB>,
  },
]

const BSP2_AUFGABE = (
  <p>
    Berechne den Scheitelpunkt der Parabel <M>{'y = 2x^2 - 20x + 5'}</M>.
  </p>
)
const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Warum die Formel gilt',
    body: (
      <>
        <p>
          Bei <M>{'x = 0'}</M> ist <M>{'y = c'}</M>. Auf derselben Höhe liegt ein zweiter Punkt: <M>{'ax^2 + bx = 0'}</M>, also <M>{'x \\cdot (ax + b) = 0'}</M> mit den Lösungen{' '}
          <M>{'x = 0'}</M> und <M>{'x = -\\dfrac{b}{a}'}</M>. Der Scheitel liegt in der Mitte:
        </p>
        <MB>{'x_S = \\dfrac{0 + \\left(-\\frac{b}{a}\\right)}{2} = -\\dfrac{b}{2a}'}</MB>
      </>
    ),
  },
  {
    title: <><M>a</M> und <M>b</M> ablesen</>,
    body: <MB>{'a = 2 \\qquad b = -20'}</MB>,
  },
  {
    title: <><M>{'x_S'}</M> mit der Formel berechnen</>,
    body: <MB>{'x_S = -\\dfrac{-20}{2 \\cdot 2} = \\dfrac{20}{4} = 5'}</MB>,
  },
  {
    title: <><M>{'x_S'}</M> einsetzen und <M>{'y_S'}</M> berechnen</>,
    body: <MB>{'y_S = 2 \\cdot 5^2 - 20 \\cdot 5 + 5 = 50 - 100 + 5 = -45'}</MB>,
  },
  {
    title: 'Scheitelpunkt angeben',
    body: <MB>{'S(5 \\mid -45)'}</MB>,
  },
]

const LOESUNG1 = (
  <Loesungsweg
    schritte={[
      { titel: <>Punkt bei <M>{'x = 0'}</M></>, tex: 'x = 0{:}\\; y = 5' },
      { titel: 'Zweiter Punkt auf Höhe 5', tex: 'x = 6{:}\\; y = 36 - 36 + 5 = 5' },
      { titel: 'Mitte der beiden x-Werte', tex: 'x_S = \\dfrac{0 + 6}{2} = 3' },
      { titel: <><M>{'x_S'}</M> einsetzen</>, tex: 'y_S = 3^2 - 6 \\cdot 3 + 5 = -4' },
      { titel: 'Scheitelpunkt', tex: 'S(3 \\mid -4)', text: 'Teil 1 und 2 des Türcodes: 3 und −4.' },
    ]}
  />
)

const LOESUNG2 = (
  <Loesungsweg
    schritte={[
      { titel: <><M>a</M> und <M>b</M> ablesen</>, tex: 'a = -0{,}4 \\qquad b = 2{,}8' },
      { titel: <><M>{'x_S'}</M> mit der Formel</>, tex: ['x_S = -\\dfrac{2{,}8}{2 \\cdot (-0{,}4)}', 'x_S = -\\dfrac{2{,}8}{-0{,}8} = 3{,}5'] },
      { titel: <><M>{'x_S'}</M> einsetzen</>, tex: ['y_S = -0{,}4 \\cdot 3{,}5^2 + 2{,}8 \\cdot 3{,}5 + 1', 'y_S = -4{,}9 + 9{,}8 + 1 = 5{,}9'] },
      { titel: 'Höchster Punkt', tex: 'S(3{,}5 \\mid 5{,}9)', text: 'Teil 3 und 4 des Türcodes: 3,5 und 5,9.' },
    ]}
  />
)

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function EscapeEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [schaetzung, setSchaetzung] = useSitzungState<Schaetzung>('lw-schaetzung', { x: 3, y: 5, fest: false })
  const [teile, setTeile] = useSitzungState('lw-teile', 0)
  const [uebungen, setUebungen] = useSitzungState<string[]>('lw-uebungen', [])
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
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 8 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            rechnen={false}
            title="a) Scheitelpunkt ablesen"
            prompt={
              <p>
                Gib den Scheitelpunkt der Parabel <M>{'y = (x - 3)^2 + 2'}</M> an.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 3 },
              { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 2 },
            ]}
            solution={
              <p>
                In der Scheitelform <M>{'y = (x - x_S)^2 + y_S'}</M> ist <M>{'x_S = 3'}</M> und <M>{'y_S = 2'}</M>, also <M>{'S(3 \\mid 2)'}</M>.
              </p>
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={3}
            rechnen={false}
            title="b) Hoch- oder Tiefpunkt?"
            prompt={
              <p>
                Gib den Scheitelpunkt von <M>{'y = -(x + 1)^2 + 4'}</M> an und entscheide, ob er ein Hoch- oder Tiefpunkt ist.
              </p>
            }
            fieldsRow
            fields={[
              { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: -1 },
              { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 4 },
              { kind: 'select', key: 's', label: 'Der Scheitelpunkt ist ein', options: ['Tiefpunkt', 'Hochpunkt'], expected: 1 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Klammer umschreiben', tex: '(x + 1)^2 = (x - (-1))^2', text: <>Also <M>{'x_S = -1'}</M> und <M>{'y_S = 4'}</M>.</> },
                  { titel: 'Öffnung', text: 'Wegen des Minuszeichens vor der Klammer ist die Parabel nach unten geöffnet: S ist ein Hochpunkt.' },
                ]}
              />
            }
          />
          <McCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Allgemeine Form erkennen"
            prompt={
              <p>
                Ein Display zeigt <M>{'y = x^2 - 6x + 5'}</M> und verlangt den Scheitelpunkt. Welche Aussage stimmt?
              </p>
            }
            options={[
              { text: 'Man liest ab: S(−6 | 5).', feedback: 'Das geht nur bei der Scheitelform. Hier sind −6 und 5 keine Verschiebungen.' },
              { text: 'Man liest ab: S(6 | 5).', feedback: 'Die Zahlen gehören hier zu −6x und +5, nicht zu einer Klammer.' },
              { text: 'Die Funktion steht in der allgemeinen Form, den Scheitelpunkt kann man nicht einfach ablesen.', correct: true, feedback: 'Genau. Wie man S trotzdem findet, lernst du gleich.' },
              { text: 'Das ist keine Parabel, also gibt es keinen Scheitelpunkt.', feedback: 'Doch, wegen des x² ist es eine Parabel. Sie steht nur in einer anderen Schreibweise.' },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) x einsetzen"
            prompt={
              <p>
                Berechne den y-Wert von <M>{'y = x^2 - 6x + 5'}</M> an der Stelle <M>{'x = 2'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: -3 }]}
            solution={<MB>{'x = 2{:}\\; y = 4 - 12 + 5 = -3'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Bruch mit Minuszeichen"
            prompt={
              <p>
                Berechne <M>{'-\\dfrac{-20}{2 \\cdot 2}'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'w', label: 'Ergebnis:', expected: 5 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Nenner ausrechnen', tex: '2 \\cdot 2 = 4' },
                  { titel: 'Minus vor dem Bruch und Minus im Zähler heben sich auf', tex: '-\\dfrac{-20}{4} = \\dfrac{20}{4} = 5' },
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Eingeschlossen im Lichtwerk',
      pflicht: ['fest'],
      bedingung: 'Halte deine Schätzung fest, dann geht es weiter.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du bist Azubi bei der Werbetechnik-Firma „Lichtwerk“. Beim Abschließen fällt die Lagertür ins Schloss, alle anderen sind schon weg. Das Türdisplay blinkt: „Code:
            4 Teile. Die Zahlen stecken in der Brunnen-Anlage, die du letzte Woche mitgebaut hast.“
          </p>
          <p className="sl-text">
            Der Wasserstrahl des Brunnens ist eine Parabel mit <M>{'y = -0{,}4x^2 + 2{,}8x + 1'}</M> (<M>x</M> und <M>y</M> in Metern). Die Düse ist 1 m hoch, der Beckenrand
            7 m entfernt ebenfalls 1 m hoch. Gesucht ist der höchste Punkt des Strahls.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Schätze den höchsten Punkt, ohne zu rechnen</p>
            <p>Wo ist der Strahl am höchsten, und wie hoch ist er dort? Lege dich mit den Reglern fest.</p>
          </div>
          <p className="sl-hinweis">Einzelarbeit, ca. 5 Minuten.</p>
          <Tuercode teile={teile} />
          <BrunnenBild guess={{ x: schaetzung.x, y: schaetzung.y }} />
          <Schaetzen wert={schaetzung} onChange={setSchaetzung} onFest={fertig.teil('fest')} />
          {schaetzung.fest && (
            <p className="sl-hinweis">
              Liegt deine Marke genau auf dem höchsten Punkt? Im Bild sieht man das nur ungefähr, und das Schloss will die Zahlen genau. Gleich lernst du, den Scheitelpunkt zu
              berechnen.
            </p>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 1: Die Mitte der Parabel',
      bedingung: 'Bestimme den Scheitelpunkt der Schablone richtig, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 15 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Finde den Scheitelpunkt der Schablone</p>
            <p>
              Auf der Werkbank liegt eine Parabel-Schablone mit <M>{'y = x^2 - 6x + 5'}</M>. Bestimme ihren Scheitelpunkt mit zwei Punkten gleicher Höhe: Der Punkt bei{' '}
              <M>{'x = 0'}</M> hat einen Partner auf derselben Höhe. Der Scheitelpunkt ergibt Teil 1 und 2 des Türcodes.
            </p>
          </div>
          <Tuercode teile={teile} />
          <SymmetrieLabor />
          <BeispielMitVideo video={VIDEO_SCHEITEL} videoTitel="Lernvideo: Scheitelpunkt berechnen">
            <Beispiel offen title="Scheitelpunkt über die Symmetrie" aufgabe={BSP1_AUFGABE} steps={BSP1_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig()
                setTeile((t) => Math.max(t, 2))
              }}
              punkte={10}
              title="Der Scheitelpunkt der Schablone"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 'x2', label: 'Zweiter x-Wert auf der Höhe 5:', expected: 6 },
                { kind: 'num', key: 'xs', label: <M>{'x_S ='}</M>, expected: 3 },
                { kind: 'num', key: 'ys', label: <M>{'y_S ='}</M>, expected: -4 },
              ]}
              loesungNachFehler
              solution={LOESUNG1}
              help={
                <Hilfen
                  steps={[
                    <>Bei <M>{'x = 0'}</M> ist <M>{'y = 5'}</M>. Stelle die Linie im Labor auf die Höhe 5: Wo liegt der zweite Punkt?</>,
                    <>Der Scheitel liegt in der Mitte zwischen den beiden x-Werten. Danach setzt du <M>{'x_S'}</M> in die Gleichung ein.</>,
                    <>
                      <M>{'x_S = \\dfrac{0 + 6}{2} = 3'}</M>. Jetzt <M>{'3^2 - 6 \\cdot 3 + 5'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 2: Der höchste Punkt des Brunnens',
      pflicht: ['teil2', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne den höchsten Punkt des Wasserstrahls</p>
            <p>
              Strahl: <M>{'y = -0{,}4x^2 + 2{,}8x + 1'}</M>. Punkte gleicher Höhe findest du hier nicht so leicht, deshalb rechnest du mit der Formel{' '}
              <M>{'x_S = -\\dfrac{b}{2a}'}</M>. Berechne <M>{'x_S'}</M> und <M>{'y_S'}</M>. Sie ergeben Teil 3 und 4 des Türcodes.
            </p>
          </div>
          <Tuercode teile={teile} />
          <BrunnenBild showS={teile === 4} guess={schaetzung.fest ? { x: schaetzung.x, y: schaetzung.y } : undefined} />
          <BeispielMitVideo video={VIDEO_SCHEITEL} videoTitel="Lernvideo: Scheitelpunkt berechnen">
            <Beispiel offen title="Scheitelpunkt mit der Formel" aufgabe={BSP2_AUFGABE} steps={BSP2_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('teil2')()
                setTeile(4)
              }}
              punkte={12}
              title="Der höchste Punkt des Strahls"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 'xs', label: <>In welcher Entfernung ist der Strahl am höchsten? <M>{'x_S ='}</M></>, expected: 3.5, unit: 'm' },
                { kind: 'num', key: 'ys', label: <>Wie hoch ist er dort? <M>{'y_S ='}</M></>, expected: 5.9, unit: 'm' },
              ]}
              loesungNachFehler
              solution={LOESUNG2}
              help={
                <Hilfen
                  steps={[
                    <>Welche Zahlen sind <M>a</M> und <M>b</M> in <M>{'-0{,}4x^2 + 2{,}8x + 1'}</M>? Achte auf die Vorzeichen.</>,
                    <>
                      Rechne <M>{'x_S = -\\dfrac{b}{2a}'}</M>, dann setze das Ergebnis in die Gleichung ein.
                    </>,
                    <>
                      Im Nenner steht <M>{'2 \\cdot (-0{,}4) = -0{,}8'}</M>. Für <M>{'y_S'}</M> rechnest du <M>{'3{,}5^2 = 12{,}25'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Handlungsprodukt titel="Merkkarte „Scheitelpunkt berechnen“">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={merkkarteBild}
                width={800}
                height={400}
                alt="Comic-Bild einer Karteikarte: Scheitelpunkt berechnen mit vier Schritten: a, b, c ablesen; x_S = −b : (2a); x_S einsetzen, um y_S zu berechnen; S angeben. Daneben eine nach unten geöffnete Parabel mit Symmetrieachse und markiertem Scheitel."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft oder auf einer Karteikarte eine Merkkarte „Scheitelpunkt berechnen“: die Formel, die Schritte, eine kleine Skizze mit der Symmetrieachse und
              deine Rechnung für den Brunnen als Beispiel.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Steht die Parabel in der allgemeinen Form, lese ich zuerst … ab.“</li>
                <li>„Die x-Koordinate berechne ich mit …, weil der Scheitel in der Mitte …“</li>
                <li>„Die y-Koordinate bekomme ich, indem ich …“</li>
                <li>„Ist a negativ, ist der Scheitelpunkt ein …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist deine Merkkarte vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien()} />
          </Abschnitt>
          {teile === 4 && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug schaetzung={schaetzung} />
              <Merke title="Scheitelpunkt aus der allgemeinen Form">
                <p>
                  Zu <M>{'y = ax^2 + bx + c'}</M> gehört der Scheitelpunkt <M>{'S(x_S \\mid y_S)'}</M> mit
                </p>
                <MB>{'x_S = -\\dfrac{b}{2a}'}</MB>
                <p>
                  <M>{'y_S'}</M> erhältst du, indem du <M>{'x_S'}</M> in die Gleichung einsetzt. Der Scheitelpunkt liegt in der Mitte zwischen zwei Punkten gleicher Höhe. Ist{' '}
                  <M>{'a > 0'}</M>, ist S der tiefste Punkt, ist <M>{'a < 0'}</M>, der höchste.
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
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit drei Aufgaben, die vierte ist für Profis. Wenn du die drei Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich. Einzelarbeit,
            ca. 15 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Welcher Scheitelpunkt stimmt?">
            <TrackedMc
              topic="Scheitelpunkt berechnen (Lernsituation, Basis)"
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              rechnen
              prompt={
                <p>
                  Berechne den Scheitelpunkt von <M>{'y = 2x^2 - 8x + 3'}</M>.
                </p>
              }
              options={[
                { text: 'S(−2 | 27)', feedback: 'Das Vorzeichen von b wurde nicht umgedreht. Es gilt x_S = −(−8) : 4 = 2.' },
                { text: 'S(4 | 3)', feedback: 'Hier wurde durch a statt durch 2a geteilt. Der Nenner ist 2 · 2 = 4.' },
                { text: 'S(2 | −5)', correct: true, feedback: 'x_S = 8 : 4 = 2 und y_S = 8 − 16 + 3 = −5.' },
                { text: 'S(2 | 3)', feedback: 'Der x-Wert stimmt, aber y_S ist nicht c. Setze x_S = 2 in die Gleichung ein.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              topic="Scheitelpunkt berechnen (Lernsituation, Standard)"
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              title="Übung 2"
              level="standard"
              rechnen
              prompt={
                <p>
                  Mia sagt: „Bei <M>{'y = x^2 + 6x + 2'}</M> liegt der Scheitelpunkt bei <M>{'x_S = 3'}</M>.“ Leon sagt: „Nein, bei <M>{'x_S = -3'}</M>.“ Rechne nach und entscheide.
                </p>
              }
              options={[
                { text: 'Mia hat recht: x_S = 6 : 2 = 3.', feedback: 'Das Minus in der Formel fehlt. Es gilt x_S = −b : (2a) = −6 : 2.' },
                { text: 'Beide haben unrecht: x_S = −6.', feedback: 'Durch 2a muss noch geteilt werden: −6 : (2 · 1) = −3.' },
                { text: 'Beide haben unrecht: x_S = 2, denn c bestimmt die Mitte.', feedback: 'c verschiebt die Parabel nur nach oben oder unten, nicht seitlich.' },
                { text: 'Leon hat recht: x_S = −6 : 2 = −3.', correct: true, feedback: 'Bei positivem b wird x_S negativ. Der Scheitelpunkt liegt links von der y-Achse.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Umgekehrt gedacht">
            <TrackedCheck
              topic="Scheitelpunkt berechnen (Lernsituation, Erweiterung)"
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={8}
              title="Übung 3"
              level="erweiterung"
              prompt={
                <p>
                  Eine Parabel hat den Scheitelpunkt <M>{'S(2 \\mid 1)'}</M> und die Form <M>{'y = x^2 + bx + c'}</M>. Bestimme <M>b</M> und <M>c</M>.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -4 },
                { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 5 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <><M>{'x_S = 2'}</M> in die Formel einsetzen</>, tex: ['2 = -\\dfrac{b}{2 \\cdot 1} \\quad \\mid \\cdot 2', '4 = -b', 'b = -4'] },
                    { titel: <>Scheitelpunkt einsetzen und nach <M>c</M> auflösen</>, tex: ['1 = 2^2 - 4 \\cdot 2 + c', '1 = -4 + c \\quad \\mid +4', 'c = 5'] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Du kennst <M>{'x_S'}</M>. Welche Formel verbindet <M>{'x_S'}</M> und <M>b</M>?</>,
                    <>
                      Setze <M>{'x_S = 2'}</M> und <M>{'a = 1'}</M> in <M>{'x_S = -\\dfrac{b}{2a}'}</M> ein. Danach muss bei <M>{'x = 2'}</M> genau <M>{'y = 1'}</M> herauskommen.
                    </>,
                    <>
                      Mit <M>{'b = -4'}</M> gilt <M>{'2^2 - 4 \\cdot 2 + c = 1'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Der Scheitel an der richtigen Stelle">
            <CheckCard
              profi
              punkte={9}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Für welches <M>b</M> liegt der Scheitelpunkt von <M>{'y = x^2 + bx + 1'}</M> bei <M>{'x_S = 3'}</M>? Wie groß ist dann <M>{'y_S'}</M>?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -6 },
                { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: -8 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <><M>b</M> aus der Formel</>, tex: ['3 = -\\dfrac{b}{2} \\quad \\mid \\cdot 2', 'b = -6'] },
                    { titel: <><M>{'y_S'}</M> berechnen</>, tex: 'y_S = 3^2 - 6 \\cdot 3 + 1 = -8' },
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Scheitel-Jagd">
            <ScheitelJagd />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt den Scheitelpunkt einer Parabel in allgemeiner Form berechnen, über die Symmetrie oder mit der Formel.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Scheitelpunkt berechnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Scheitelpunkt: Das Lichtwerk" width="wide" kompakt parent={{ to: '/quadratische_funktionen/scheitelpunkt', label: 'Scheitelpunkt berechnen' }}>
        <SeitenLernsituation
          ruhig
          punkte
          thema={THEMA}
          bildwelt={BILDWELT}
          ziel={<>Du bist im Lager eingeschlossen und knackst den Türcode. Du lernst, den Scheitelpunkt einer Parabel in allgemeiner Form zu berechnen.</>}
          seiten={seiten}
        />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Schätzung aus „Problem erkennen“ */
function Rueckbezug({ schaetzung }: { schaetzung: Schaetzung }) {
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest geschätzt:</strong> höchster Punkt bei x ≈ {fmt(schaetzung.x, 1)} m in {fmt(schaetzung.y, 1)} m Höhe.
      </p>
      <p>
        Berechnet: <M>{'S(3{,}5 \\mid 5{,}9)'}</M>. Abweichung: {fmt(Math.abs(schaetzung.x - 3.5), 1)} m in x-Richtung und {fmt(Math.abs(schaetzung.y - 5.9), 1)} m in der Höhe. Die
        Symmetrie verrät die Mitte, die genauen Koordinaten liefert die Rechnung.
      </p>
    </div>
  )
}
