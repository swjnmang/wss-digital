import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { Beispiel, M, MB, Merke, QuerTabelle, checkNumber, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, HeftHinweis, Hilfen, McCard, Phase, PRAISE } from '../../lineare_funktionen/lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './escape.css'

// Einstiegs-Lernsituation „Eingeschlossen im Lichtwerk“ zum Scheitelpunkt aus der allgemeinen Form.
// Format Rätsel/Escape-Room, Look Levelmap mit Code-Schloss (Stepper), Lernprodukt digital (Merkkarte).
// Instruktionsreihenfolge: Problem zuerst. Die SuS kennen Normalparabel und Scheitelform und können die Symmetrie der
// Parabel selbst entdecken; die Formel x_S = −b/(2a) wird erst nach Raum 3 als Infokarte gesichert.
// Stationen: 0 Einstieg und Festlegung → 1 Vorwissen → 2 Symmetrie → 3 Muster → 4 Tresor → 5 Austausch → 6 Merkkarte → 7 Check.
// Die Räume 1 bis 4 liefern je einen Teil des Türcodes (Ziffern 2, 3, 5 und die Höhe 5,9 m) und schalten den nächsten Raum frei.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Scheitelpunkt berechnen“ angezeigt; der Infoteil (Erklärung mit Erklärvideo)
// kommt von dort, damit er nur an einer Stelle gepflegt wird.

/* ── Situation: Wasserstrahl-Brunnen ─────────────────────────────────────── */

// 1 LE = 1 m. Düse bei (0|1), Beckenrand bei (7|1), höchster Punkt S(3,5|5,9). Der Scheitelpunkt liegt bewusst nicht
// auf glatten Zahlen, damit eine Schätzung immer etwas danebenliegt und man rechnen muss.
const strahl = (x: number) => -0.4 * x * x + 2.8 * x + 1
const CODE = ['2', '3', '5', '5,9']

type Prediction = { x: number; y: number; saved: boolean }

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
                {v}
              </text>
            )}
          </g>
        ))}
        {ys.map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(xMin)} x2={bx(xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            {v !== 0 && (
              <text x={bx(xMin) - 6} y={by(v) + 6} textAnchor="end" fontSize="17" fill="var(--ink-muted)">
                {v}
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

/** Brunnen von der Seite; mit Vermutung (Marke) oder mit dem berechneten höchsten Punkt */
function BrunnenBild({ guess, showS = false }: { guess?: { x: number; y: number }; showS?: boolean }) {
  return (
    <Diagramm f={strahl} xMin={-0.5} xMax={9} yMin={-1} yMax={10} yStep={2} label="Wasserstrahl des Brunnens als Parabel, Düse bei 0 Meter und Beckenrand bei 7 Meter">
      {(bx, by) => (
        <>
          <rect x={bx(-0.5)} y={by(0)} width={bx(9) - bx(-0.5)} height={by(-1) - by(0)} fill="var(--surface-sunken)" />
          <line x1={bx(-0.5)} x2={bx(9)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
          <rect x={bx(0) - 8} y={by(1)} width="16" height={by(0) - by(1)} fill="var(--ink)" />
          <text x={bx(0) + 14} y={by(1) + 4} fontSize="15" fontWeight="700" fill="var(--ink)">
            Düse
          </text>
          <rect x={bx(7)} y={by(1)} width={bx(8.5) - bx(7)} height={by(0) - by(1)} fill="var(--hint)" opacity="0.5" stroke="var(--ink)" strokeWidth="2" />
          <text x={bx(7) + 4} y={by(1) - 6} fontSize="15" fontWeight="700" fill="var(--ink)">
            Becken
          </text>
          {guess && (
            <g>
              <line x1={bx(guess.x)} x2={bx(guess.x)} y1={by(0)} y2={by(guess.y)} stroke="var(--wrong)" strokeDasharray="6 4" strokeWidth="2" />
              <circle cx={bx(guess.x)} cy={by(guess.y)} r="9" fill="var(--wrong)" stroke="var(--ink)" strokeWidth="2.5" />
              <text x={bx(guess.x) + 14} y={by(guess.y) - 8} fontSize="16" fontWeight="700" fill="var(--wrong-ink)">
                deine Vermutung
              </text>
            </g>
          )}
          {showS && (
            <g>
              <line x1={bx(3.5)} x2={bx(3.5)} y1={by(0)} y2={by(5.9)} stroke="var(--correct)" strokeDasharray="6 4" strokeWidth="2" />
              <circle cx={bx(3.5)} cy={by(5.9)} r="9" fill="var(--correct)" stroke="var(--ink)" strokeWidth="2.5" />
              <text x={bx(3.5) + 14} y={by(5.9) + 22} fontSize="16" fontWeight="700" fill="var(--correct-ink)">
                S(3,5 | 5,9)
              </text>
            </g>
          )}
        </>
      )}
    </Diagramm>
  )
}

/* ── Bausteine ───────────────────────────────────────────────────────────── */

/** Raumkarte im Levelmap-Look */
function Raum({ no, title, children }: { no: number | string; title: string; children: ReactNode }) {
  return (
    <div className="esc-room">
      <span className="esc-room-tag">{typeof no === 'number' ? `Raum ${no}` : no}</span>
      <h3 className="lab-title" style={{ margin: 0, font: '800 20px/1.25 var(--font-display)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

/** Schloss: Die richtige Ziffer schaltet den nächsten Raum frei */
function CodeLock({ index, task, expected, solved, onSolved }: { index: number; task: ReactNode; expected: number; solved: boolean; onSolved: () => void }) {
  const uid = useId()
  const [value, setValue] = useState('')
  const [mark, setMark] = useState<boolean | undefined>(undefined)
  const [msg, setMsg] = useState<'idle' | 'empty' | 'no' | 'ok'>('idle')

  const check = () => {
    if (solved) return
    const ok = checkNumber(value, expected, 0.001)
    setMark(ok)
    if (ok === undefined) return setMsg('empty')
    setMsg(ok ? 'ok' : 'no')
    if (ok) onSolved()
  }

  return (
    <div className={`esc-lock ${solved ? 'is-open' : ''}`} data-no-autocheck>
      <div className="esc-lock-title">
        <i className={`fa-solid ${solved ? 'fa-lock-open' : 'fa-lock'}`} aria-hidden="true" /> Schloss {index}: Teil {index} des Türcodes
      </div>
      <div>{task}</div>
      <div className="esc-lock-row">
        <label htmlFor={uid} className="ls-label">
          Eingabe
        </label>
        <input
          id={uid}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="?"
          disabled={solved}
          className={`bk-input lp-input lp-input-md ${fieldCheckClass(solved ? true : mark)}`}
          value={solved ? String(expected).replace('.', ',') : value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value)
            setMark(undefined)
            setMsg('idle')
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        {!solved && (
          <button type="button" className="bk-btn bk-btn-primary" onClick={check}>
            Code prüfen
          </button>
        )}
      </div>
      {(solved || msg === 'ok') && (
        <div className="bk-feedback bk-feedback-ok lp-feedback" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> {PRAISE[index % PRAISE.length]} Das Schloss springt auf, der nächste Raum ist frei.
        </div>
      )}
      {msg === 'no' && (
        <div className="bk-feedback bk-feedback-no lp-feedback" role="status">
          <i className="fa-solid fa-circle-xmark" aria-hidden="true" /> Das Schloss bleibt zu. Rechne noch einmal nach oder nimm eine Hilfe.
        </div>
      )}
      {msg === 'empty' && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Trage zuerst eine Zahl ein.
        </div>
      )}
    </div>
  )
}

/** Selbstprüfendes Tabellenfeld */
const feld = (expected: number, key: string | number) => (
  <span key={key}>
    <CheckedNumberInput expected={expected} tolerance={0.001} className="bk-input lp-input lp-input-sm" />
  </span>
)

/* ── Experiment Raum 2: Linie gleicher Höhe ──────────────────────────────── */

const symF = (x: number) => x * x - 6 * x + 5

function SymmetrieLabor() {
  const id = useId()
  const [h, setH] = useState(5)
  const w = Math.sqrt(4 + h)
  const x1 = 3 - w
  const x2 = 3 + w
  return (
    <div className="lp-ex bk-panel">
      <div className="lp-ex-prompt">
        <p>
          Das ist die Parabel <M>{'f(x) = x^2 - 6x + 5'}</M>. Zieht die Linie mit dem Regler auf verschiedene Höhen. Die beiden roten Punkte liegen auf der <strong>gleichen Höhe</strong>.
          Wo liegt ihre Mitte?
        </p>
      </div>
      <Diagramm f={symF} xMin={-1} xMax={7} yMin={-5} yMax={6} label="Parabel f(x) = x² − 6x + 5 mit waagerechter Linie und zwei Punkten gleicher Höhe">
        {(bx, by) => (
          <>
            <line x1={bx(-1)} x2={bx(7)} y1={by(h)} y2={by(h)} stroke="var(--hint)" strokeWidth="3" strokeDasharray="10 5" />
            <line x1={bx(3)} x2={bx(3)} y1={by(-5)} y2={by(6)} stroke="var(--correct)" strokeWidth="2" strokeDasharray="4 4" />
            {[x1, x2].map((x, i) => (
              <circle key={i} cx={bx(x)} cy={by(h)} r="8" fill="var(--wrong)" stroke="var(--ink)" strokeWidth="2.5" />
            ))}
          </>
        )}
      </Diagramm>
      <div className="ls-slider">
        <label htmlFor={id}>
          Höhe der Linie <M>{'y'}</M> = <span className="ls-slider-value">{h}</span>
        </label>
        <input id={id} type="range" min={-4} max={5} step={1} value={h} onChange={(e: ChangeEvent<HTMLInputElement>) => setH(Number(e.target.value))} />
      </div>
      <div className="ls-readout">
        <div className="ls-readout-box ls-readout-a">
          <strong>Punkte auf Höhe {h}:</strong> <M>{`x_1 \\approx ${fmt(x1, 2).replace(',', '{,}')}`}</M> und <M>{`x_2 \\approx ${fmt(x2, 2).replace(',', '{,}')}`}</M>
        </div>
        <div className="ls-readout-box ls-readout-c">
          <strong>Mitte der beiden x-Werte:</strong> <M>{`\\frac{x_1 + x_2}{2} = ${fmt((x1 + x2) / 2, 2).replace(',', '{,}')}`}</M>
        </div>
      </div>
    </div>
  )
}

/* ── Merkkarte (Lernprodukt) ─────────────────────────────────────────────── */

const SCHRITTE = [
  'a, b und c aus f(x) = ax² + bx + c ablesen',
  'x_S mit der Formel berechnen',
  'x_S in f(x) einsetzen und y_S berechnen',
  'Scheitelpunkt S(x_S | y_S) angeben',
]

function Merkkarte() {
  const [beispiel, setBeispiel] = useState('')
  const [symmetrie, setSymmetrie] = useState('')
  const [haken, setHaken] = useState<boolean[]>([false, false, false])
  const kriterien = [
    'Die Formel für x_S steht richtig auf der Karte.',
    'Mein Beispiel zeigt den Rechenweg für x_S und y_S.',
    'Ein Satz erklärt, warum die Mitte der Parabel der Scheitelpunkt ist.',
  ]
  return (
    <>
      <CheckCard
        title="Baustein 1: Die Schritte in die richtige Reihenfolge bringen"
        rechnen={false}
        prompt={<p>Ordne die vier Schritte so, wie du beim Berechnen des Scheitelpunkts vorgehst.</p>}
        fields={[0, 1, 2, 3].map((i) => ({
          kind: 'select' as const,
          key: `s${i}`,
          label: <>Schritt {i + 1}</>,
          options: [SCHRITTE[2], SCHRITTE[0], SCHRITTE[3], SCHRITTE[1]],
          expected: [1, 3, 0, 2][i],
        }))}
        help={
          <Hilfen
            steps={[
              <>Denke an die Räume: Was musstest du zuerst wissen, bevor du x_S berechnen konntest?</>,
              <>Zuerst brauchst du die Zahlen a und b. Dann kommt die x-Koordinate, erst danach die y-Koordinate. Am Ende steht die Antwort.</>,
              <>Reihenfolge: ablesen, x_S berechnen, y_S berechnen, Scheitelpunkt angeben.</>,
            ]}
          />
        }
      />
      <CheckCard
        title="Baustein 2: Die Formel"
        rechnen={false}
        prompt={<p>Wähle die richtige Formel für die x-Koordinate des Scheitelpunkts.</p>}
        fields={[
          {
            kind: 'select',
            key: 'f',
            label: <M>{'x_S ='}</M>,
            options: ['b / (2a)', '−b / (2a)', '−b / a', '−2a / b'],
            expected: 1,
          },
        ]}
        solution={<MB>{'x_S = -\\frac{b}{2a}'}</MB>}
      />
      <div className="lp-ex bk-panel" data-no-autocheck>
        <CardHead title="Baustein 3: Dein Beispiel und deine Erklärung" />
        <p>Schreibe ein eigenes Beispiel mit Rechenweg und einen Satz zur Symmetrie. Beides erscheint unten auf deiner Merkkarte.</p>
        <label className="ls-label" htmlFor="esc-beispiel">
          Mein Beispiel (Funktion, x_S, y_S, Scheitelpunkt)
        </label>
        <textarea id="esc-beispiel" className="bk-input esc-textarea" value={beispiel} onChange={(e) => setBeispiel(e.target.value)} placeholder="z. B. f(x) = x² − 10x + 3 …" />
        <label className="ls-label" htmlFor="esc-symmetrie">
          Warum liegt der Scheitelpunkt in der Mitte zwischen zwei Punkten gleicher Höhe?
        </label>
        <textarea id="esc-symmetrie" className="bk-input esc-textarea" value={symmetrie} onChange={(e) => setSymmetrie(e.target.value)} placeholder="Die Parabel ist symmetrisch, weil …" />
        <div className="ls-criteria">
          {kriterien.map((k, i) => (
            <label key={k}>
              <input type="checkbox" checked={haken[i]} onChange={() => setHaken(haken.map((v, j) => (j === i ? !v : v)))} /> <span>{k}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="esc-karte" aria-label="Deine Merkkarte">
        <h3 className="esc-karte-title">
          <i className="fa-solid fa-note-sticky" aria-hidden="true" /> Merkkarte: Scheitelpunkt aus der allgemeinen Form
        </h3>
        <MB>{'f(x) = ax^2 + bx + c \\qquad x_S = -\\frac{b}{2a} \\qquad y_S = f(x_S)'}</MB>
        <ol>
          {[0, 1, 2, 3].map((i) => (
            <li key={i}>{[SCHRITTE[0], SCHRITTE[1], SCHRITTE[2], SCHRITTE[3]][i]}</li>
          ))}
        </ol>
        {beispiel.trim() && <div className="esc-karte-own">{beispiel}</div>}
        {symmetrie.trim() && <div className="esc-karte-own">{symmetrie}</div>}
        {haken.every(Boolean) && (
          <div className="bk-feedback bk-feedback-ok lp-feedback" role="status">
            <i className="fa-solid fa-circle-check" aria-hidden="true" /> Deine Merkkarte erfüllt alle Kriterien. Mach ein Foto davon oder schreibe sie in dein Heft.
          </div>
        )}
      </div>
    </>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

const STEPS = [
  { label: 'Einstieg', icon: 'fa-door-closed' },
  { label: 'Vorwissen', icon: 'fa-lightbulb' },
  { label: 'Symmetrie', icon: 'fa-arrows-left-right' },
  { label: 'Muster', icon: 'fa-table' },
  { label: 'Tresor', icon: 'fa-vault' },
  { label: 'Austausch', icon: 'fa-comments' },
  { label: 'Merkkarte', icon: 'fa-note-sticky' },
  { label: 'Check', icon: 'fa-circle-check' },
]

export default function EscapeEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [pred, setPred] = useState<Prediction>({ x: 3, y: 5, saved: false })
  const [step, setStep] = useState(0)
  // Ziffern 1 bis 4 gelöst
  const [digits, setDigits] = useState<boolean[]>([false, false, false, false])

  // Tor für Station i: Vermutung festgehalten (0), Ziffer i gelöst (1 bis 4), danach frei
  const gate = (i: number) => (i === 0 ? pred.saved : i <= 4 ? digits[i - 1] : true)
  const reachable = (i: number) => Array.from({ length: i }, (_, j) => j).every(gate)
  const doorOpen = digits.every(Boolean)
  const solve = (i: number) => setDigits((d) => d.map((v, j) => (j === i - 1 ? true : v)))

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const hide = (i: number) => (step === i ? undefined : true)

  const weiter = (i: number) => (
    <div className="esc-step-nav">
      {i > 0 ? (
        <button type="button" className="bk-btn" onClick={() => setStep(i - 1)}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück
        </button>
      ) : (
        <span />
      )}
      {i < STEPS.length - 1 && (
        <button type="button" className="bk-btn bk-btn-primary" disabled={!gate(i)} onClick={() => setStep(i + 1)}>
          Weiter: {STEPS[i + 1].label} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      )}
    </div>
  )

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Scheitelpunkt berechnen" subtitle="Lernsituation: Eingeschlossen im Lichtwerk" width="wide">
        <div className="lp">
          <div>
            <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
          </div>
          <div className="lp-goal">
            <i className="fa-solid fa-bullseye" aria-hidden="true" />
            <div>
              <strong>Das lernst du hier:</strong> Du findest heraus, wo der höchste oder tiefste Punkt einer Parabel liegt, auch wenn die Funktion nicht in Scheitelform steht,
              und berechnest ihn mit einer Formel.
            </div>
          </div>
          <Arbeitsweise />

          <ol className="esc-map" aria-label="Levelmap">
            {STEPS.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  className={`esc-map-btn ${step === i ? 'is-current' : i > 0 && gate(i) && reachable(i) && step !== i ? 'is-done' : ''}`}
                  disabled={!reachable(i)}
                  onClick={() => setStep(i)}
                  aria-current={step === i ? 'step' : undefined}
                >
                  <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                  {i}. {s.label}
                </button>
              </li>
            ))}
          </ol>

          <div className="esc-code" role="status" aria-label="Türcode">
            <span className="esc-code-label">
              <i className="fa-solid fa-lock" aria-hidden="true" /> Türcode
            </span>
            <div className="esc-digits">
              {CODE.map((c, i) => (
                <span key={i} className={`esc-digit ${digits[i] ? 'is-on' : ''}`}>
                  {digits[i] ? c : '?'}
                </span>
              ))}
            </div>
            {doorOpen && (
              <span className="esc-open">
                <i className="fa-solid fa-door-open" aria-hidden="true" /> Die Tür ist offen!
              </span>
            )}
          </div>

          {/* 0 Einstieg und Festlegung */}
          <div hidden={hide(0)}>
            <Phase no={0} title="Ausgesperrt: Wie hoch spritzt der Brunnen?" social="EA" minutes={5}>
              <Raum no="Start" title="Freitag, 19:05 Uhr im Lichtwerk">
                <p className="esc-story">
                  Du bist Azubi bei der Werbetechnik-Firma „Lichtwerk“. Beim Abschließen fällt die Lagertür ins Schloss, und alle anderen sind schon weg. Am Türdisplay blinkt:
                  <strong> „Code: 4 Teile. Die Zahlen stecken in der Brunnen-Anlage, die du letzte Woche für den Kunden mitgebaut hast.“</strong>
                </p>
                <BrunnenBild guess={pred.saved || pred.x !== 3 || pred.y !== 5 ? { x: pred.x, y: pred.y } : undefined} />
                <p>
                  Der Brunnen spritzt aus der Düse (1 m hoch) in ein Becken, dessen Rand 7 m entfernt ebenfalls 1 m hoch ist. Der Wasserstrahl ist eine Parabel mit
                  <strong>
                    {' '}
                    <M>{'h(x) = -0{,}4x^2 + 2{,}8x + 1'}</M>
                  </strong>{' '}
                  (<M>x</M> und <M>h</M> in Metern).
                </p>
                <div className="ls-question">
                  <i className="fa-solid fa-circle-question" aria-hidden="true" />
                  <span>Wo ist der höchste Punkt des Strahls, und wie hoch ist er dort? Kannst du ihn genau ablesen?</span>
                </div>
                <div className="lp-ex bk-panel" data-no-autocheck>
                  <CardHead title="Deine Vermutung" />
                  {pred.saved ? (
                    <>
                      <div className="ls-saved" role="status">
                        <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: Höchster Punkt bei <strong>x ≈ {fmt(pred.x, 1)} m</strong> in <strong>{fmt(pred.y, 1)} m</strong> Höhe. In
                        Raum 4 schauen wir nach, wie gut du geschätzt hast.
                      </div>
                      <div>
                        <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                          Vermutung ändern
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Rechne noch nicht! Schätze nur mit dem Bild. Verschiebe die rote Marke an die Stelle, wo du den höchsten Punkt vermutest. Die Regler arbeiten in 0,1-m-Schritten.</p>
                      <div className="ls-slider">
                        <label htmlFor="esc-px">
                          Entfernung von der Düse <M>x</M> ≈ <span className="ls-slider-value">{fmt(pred.x, 1)}</span> m
                        </label>
                        <input id="esc-px" type="range" min={0} max={8} step={0.1} value={pred.x} onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, x: Number(e.target.value) })} />
                      </div>
                      <div className="ls-slider">
                        <label htmlFor="esc-py">
                          Höhe <M>h</M> ≈ <span className="ls-slider-value">{fmt(pred.y, 1)}</span> m
                        </label>
                        <input id="esc-py" type="range" min={0} max={10} step={0.1} value={pred.y} onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, y: Number(e.target.value) })} />
                      </div>
                      <div>
                        <button type="button" className="bk-btn bk-btn-primary" onClick={() => setPred({ ...pred, saved: true })}>
                          <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {weiter(0)}
              </Raum>
            </Phase>
          </div>

          {/* 1 Vorwissen */}
          <div hidden={hide(1)}>
            <Phase no={1} title="Raum 1: Das Werkstatt-Tor" social="EA" minutes={6}>
              <Raum no={1} title="Scheitelform lesen">
                <p className="esc-story">Das erste Schloss ist ein Rätsel-Panel. Zeig, dass du Parabeln in Scheitelform lesen kannst.</p>
                <CheckCard
                  title="a) Scheitelpunkt ablesen"
                  rechnen={false}
                  prompt={
                    <p>
                      Gib den Scheitelpunkt der Parabel <M>{'f(x) = (x - 3)^2 + 2'}</M> an. Halte deinen Gedanken schriftlich fest.
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 3 },
                    { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 2 },
                  ]}
                  solution={
                    <p>
                      In der Scheitelform <M>{'f(x) = (x - x_S)^2 + y_S'}</M> ist <M>{'S(x_S \\mid y_S)'}</M>. Hier ist <M>{'x_S = 3'}</M> und <M>{'y_S = 2'}</M>, also <M>{'S(3 \\mid 2)'}</M>.
                    </p>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Wie wird die Normalparabel verschoben, wenn in der Klammer <M>{'x - 3'}</M> steht?</>,
                        <>Die Zahl in der Klammer verschiebt in x-Richtung, aber mit dem entgegengesetzten Vorzeichen. Die Zahl hinter der Klammer verschiebt in y-Richtung.</>,
                        <>Nach rechts um 3 und nach oben um 2. Der Scheitelpunkt der Normalparabel ist <M>{'S(0 \\mid 0)'}</M>.</>,
                      ]}
                    />
                  }
                />
                <CheckCard
                  title="b) Hoch- oder Tiefpunkt?"
                  rechnen={false}
                  level="standard"
                  prompt={
                    <p>
                      Gib den Scheitelpunkt von <M>{'g(x) = -(x + 1)^2 + 4'}</M> an und entscheide, ob er ein Hoch- oder Tiefpunkt ist.
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: -1 },
                    { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 4 },
                    { kind: 'select', key: 's', label: 'Der Scheitelpunkt ist ein', options: ['Tiefpunkt', 'Hochpunkt'], expected: 1 },
                  ]}
                  solution={
                    <p>
                      Aus <M>{'(x + 1)^2 = (x - (-1))^2'}</M> folgt <M>{'x_S = -1'}</M>, außerdem <M>{'y_S = 4'}</M>. Wegen des Minuszeichens vor der Klammer ist die Parabel nach unten geöffnet, also ist S ein
                      Hochpunkt.
                    </p>
                  }
                />
                <McCard
                  title="c) Das Problem am Tor"
                  level="standard"
                  prompt={
                    <p>
                      Das nächste Display zeigt <M>{'f(x) = x^2 - 6x + 5'}</M> und verlangt den Scheitelpunkt. Welche Aussage stimmt?
                    </p>
                  }
                  options={[
                    { text: 'Die Funktion steht in der allgemeinen Form, den Scheitelpunkt kann man nicht einfach ablesen.', correct: true, feedback: 'Es gibt keine Klammer mit Verschiebung. Wie man S trotzdem findet, klärst du in Raum 2.' },
                    { text: 'Man liest ab: S(−6 | 5).', feedback: 'Das geht nur bei der Scheitelform. Hier sind −6 und 5 keine Verschiebungen.' },
                    { text: 'Man liest ab: S(6 | 5).', feedback: 'Auch mit anderem Vorzeichen stimmt es nicht: Die Zahlen gehören hier zu −6x und +5, nicht zu einer Klammer.' },
                    { text: 'Das ist keine Parabel, also gibt es keinen Scheitelpunkt.', feedback: 'Doch, wegen des x² ist es eine Parabel. Sie steht nur in einer anderen Schreibweise.' },
                  ]}
                />
                <CodeLock
                  index={1}
                  task={
                    <p>
                      Das Tor verlangt Teil 1 des Codes: die <strong>y-Koordinate des Scheitelpunkts</strong> aus Aufgabe a).
                    </p>
                  }
                  expected={2}
                  solved={digits[0]}
                  onSolved={() => solve(1)}
                />
                {weiter(1)}
              </Raum>
            </Phase>
          </div>

          {/* 2 Symmetrie */}
          <div hidden={hide(2)}>
            <Phase no={2} title="Raum 2: Die Mitte der Parabel" social="PA" minutes={10}>
              <Raum no={2} title="Punkte gleicher Höhe">
                <p className="esc-story">Im Lager steht eine Werkbank mit einer Parabel-Schablone, <M>{'f(x) = x^2 - 6x + 5'}</M>. Zu zweit findet ihr heraus, wie sich ihr Scheitelpunkt versteckt.</p>
                <div className="lp-ex bk-panel">
                  <CardHead title="Versuch 1: Wertetabelle" level="basis" />
                  <p>Füllt die Tabelle zu zweit aus. Die Felder färben sich von selbst grün oder rot. Welche Werte kommen doppelt vor?</p>
                  <HeftHinweis><strong>Im Heft:</strong> Rechne die Tabellenwerte mit Rechenweg in deinem Heft aus. Trage dann nur die Ergebnisse ein.</HeftHinweis>
                  <QuerTabelle
                    rows={[
                      { head: 'x', cells: [0, 1, 2, 3, 4, 5, 6].map((x) => <strong key={x}>{x}</strong>) },
                      { head: <M>{'f(x)'}</M>, cells: [0, 1, 2, 3, 4, 5, 6].map((x) => feld(symF(x), x)) },
                    ]}
                  />
                  <Hilfen
                    steps={[
                      <>Setzt jeden x-Wert für das <M>x</M> in <M>{'x^2 - 6x + 5'}</M> ein.</>,
                      <>Beispiel <M>{'x = 2'}</M>: Erst <M>{'2^2 = 4'}</M>, dann <M>{'6 \\cdot 2 = 12'}</M>, also <M>{'4 - 12 + 5'}</M>.</>,
                      <>Das Ergebnis für <M>{'x = 2'}</M> ist <M>{'-3'}</M>. Rechnet die anderen Werte genauso.</>,
                    ]}
                  />
                </div>
                <div className="lp-ex bk-panel">
                  <CardHead title="Versuch 2: Die Linie gleicher Höhe" level="standard" />
                  <p>Nutzt jetzt den Regler. Findet heraus, was bei allen Höhen mit der Mitte der beiden Punkte passiert.</p>
                </div>
                <SymmetrieLabor />
                <McCard
                  title="Was fällt euch auf?"
                  prompt={<p>Wähle die Beobachtung, die zu allen Höhen des Reglers passt.</p>}
                  options={[
                    { text: 'Die Mitte der beiden x-Werte ist immer dieselbe, nämlich x = 3.', correct: true, feedback: 'Diese Mitte liegt genau senkrecht über dem tiefsten Punkt der Parabel. Die Parabel ist symmetrisch, und ihre Symmetrieachse geht durch den Scheitelpunkt.' },
                    { text: 'Je höher die Linie, desto weiter rechts liegt die Mitte.', feedback: 'Beobachtet noch einmal die grüne gestrichelte Linie: Sie bewegt sich nicht.' },
                    { text: 'Je höher die Linie, desto kleiner wird der Abstand der Punkte.', feedback: 'Es ist umgekehrt: Je höher die Linie, desto weiter liegen die Punkte auseinander. Außerdem ging es um die Mitte.' },
                    { text: 'Es gibt immer genau einen Punkt auf der Linie.', feedback: 'Nur auf der Höhe des tiefsten Punkts gibt es einen Punkt, sonst zwei.' },
                  ]}
                />
                <CheckCard
                  title="Den Scheitelpunkt finden"
                  level="standard"
                  prompt={
                    <p>
                      Die Punkte <M>{'(0 \\mid 5)'}</M> und <M>{'(?\\mid 5)'}</M> liegen auf gleicher Höhe. Bestimmt damit den Scheitelpunkt von <M>{'f(x) = x^2 - 6x + 5'}</M>.
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'x2', label: <>zweiter x-Wert auf Höhe 5:</>, expected: 6 },
                    { kind: 'num', key: 'xs', label: <M>{'x_S ='}</M>, expected: 3 },
                    { kind: 'num', key: 'ys', label: <M>{'y_S ='}</M>, expected: -4 },
                  ]}
                  solution={
                    <>
                      <p>Auf der Höhe 5 liegen die Punkte bei <M>{'x = 0'}</M> und <M>{'x = 6'}</M>. Ihre Mitte ist der Scheitel:</p>
                      <MB>{'x_S = \\frac{0 + 6}{2} = 3 \\qquad y_S = f(3) = 9 - 18 + 5 = -4'}</MB>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Auf welcher Höhe liegt der Punkt bei <M>{'x = 0'}</M>? Welchen zweiten x-Wert hat die Tabelle auf derselben Höhe?</>,
                        <>Der Scheitelpunkt liegt in der Mitte zwischen diesen beiden x-Werten. Danach setzt du das <M>{'x_S'}</M> in die Funktion ein.</>,
                        <><M>{'x_S = \\frac{0 + 6}{2} = 3'}</M>. Rechne nun <M>{'f(3)'}</M> aus.</>,
                      ]}
                    />
                  }
                />
                <CodeLock
                  index={2}
                  task={
                    <p>
                      Schloss 2 verlangt Teil 2 des Codes: die <strong>x-Koordinate des Scheitelpunkts</strong> von <M>{'f(x) = x^2 - 6x + 5'}</M>.
                    </p>
                  }
                  expected={3}
                  solved={digits[1]}
                  onSolved={() => solve(2)}
                />
                {weiter(2)}
              </Raum>
            </Phase>
          </div>

          {/* 3 Muster */}
          <div hidden={hide(3)}>
            <Phase no={3} title="Raum 3: Das Muster hinter der Mitte" social="PA" minutes={10}>
              <Raum no={3} title="Eine Formel für x_S entdecken">
                <p className="esc-story">Ein Zettel an der Wand: „Nicht jede Parabel hat Punkte, die du so leicht findest. Finde die Regel, dann geht es immer.“</p>
                <div className="lp-ex bk-panel">
                  <CardHead title="Versuch 3: Punkte auf der Höhe von x = 0" level="standard" />
                  <p>
                    Bei <M>{'f(x) = x^2 + bx + c'}</M> liegt der Punkt bei <M>x = 0</M> auf der Höhe <M>c</M>. Es gibt einen zweiten Punkt auf dieser Höhe. Berechnet ihn und den Scheitelpunkt-x-Wert in der Tabelle. Vergleicht danach <M>b</M> und <M>{'x_S'}</M>.
                  </p>
                  <QuerTabelle
                    rows={[
                      { head: 'Funktion', cells: ['x² − 2x + 7', 'x² − 4x + 1', 'x² − 6x − 5', 'x² + 4x + 3'].map((t) => <strong key={t}>{t}</strong>) },
                      { head: 'zweiter x-Wert auf Höhe c', cells: [2, 4, 6, -4].map((v, i) => feld(v, i)) },
                      { head: <M>{'x_S'}</M>, cells: [1, 2, 3, -2].map((v, i) => feld(v, `s${i}`)) },
                    ]}
                  />
                  <Hilfen
                    steps={[
                      <>Bei <M>{'x^2 - 2x + 7'}</M> ist die Höhe bei <M>x = 0</M> gleich 7. Für welches andere <M>x</M> ist <M>{'x^2 - 2x = 0'}</M>?</>,
                      <>Klammere <M>x</M> aus: <M>{'x \\cdot (x - 2) = 0'}</M>. Ein Faktor muss 0 sein.</>,
                      <>Neben <M>{'x = 0'}</M> ist <M>{'x = 2'}</M> die zweite Lösung. Die Mitte von 0 und 2 ist 1.</>,
                    ]}
                  />
                </div>
                <McCard
                  title="Wie hängt x_S mit b zusammen?"
                  level="standard"
                  prompt={<p>Vergleicht eure Tabelle: Welcher Zusammenhang gilt, wenn vor <M>{'x^2'}</M> keine Zahl steht (<M>a = 1</M>)?</p>}
                  options={[
                    { text: <><M>{'x_S = -\\frac{b}{2}'}</M></>, correct: true, feedback: 'Bei b = −4 ist x_S = 2, bei b = 4 ist x_S = −2. Das Vorzeichen dreht sich um, und es wird halbiert.' },
                    { text: <><M>{'x_S = \\frac{b}{2}'}</M></>, feedback: 'Prüft das Vorzeichen: Bei b = −4 kommt x_S = 2 heraus, nicht −2.' },
                    { text: <><M>{'x_S = -b'}</M></>, feedback: 'Das ist der zweite x-Wert auf Höhe c, aber nicht die Mitte. Die Mitte ist halb so groß.' },
                    { text: <><M>{'x_S = c'}</M></>, feedback: 'c verschiebt die Parabel nur nach oben oder unten. Die Mitte ändert sich dadurch nicht.' },
                  ]}
                />
                <div className="lp-ex bk-panel">
                  <CardHead title="Infokarte: Warum das so ist" />
                  <p>
                    Der zweite Punkt auf Höhe <M>c</M> ergibt sich aus <M>{'ax^2 + bx + c = c'}</M>, also <M>{'ax^2 + bx = 0'}</M>, also <M>{'x \\cdot (ax + b) = 0'}</M>. Die Lösungen sind <M>{'x = 0'}</M> und{' '}
                    <M>{'x = -\\frac{b}{a}'}</M>. Der Scheitelpunkt liegt in der Mitte:
                  </p>
                  <MB>{'x_S = \\frac{0 + \\left(-\\frac{b}{a}\\right)}{2} = -\\frac{b}{2a}'}</MB>
                  <p>
                    Danach rechnest du <M>{'y_S = f(x_S)'}</M>. Die Zahl <M>c</M> bewirkt nur, dass die Parabel höher oder tiefer liegt.
                  </p>
                  <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
                </div>
                <CheckCard
                  title="Jetzt mit Streckfaktor"
                  level="standard"
                  prompt={
                    <p>
                      Bestimmt den Scheitelpunkt-x-Wert von <M>{'f(x) = 2x^2 - 20x + 5'}</M>. Lest <M>a</M> und <M>b</M> ab und setzt in die Formel ein.
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 2 },
                    { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -20 },
                    { kind: 'num', key: 'xs', label: <M>{'x_S ='}</M>, expected: 5 },
                  ]}
                  solution={<MB>{'x_S = -\\frac{b}{2a} = -\\frac{-20}{2 \\cdot 2} = \\frac{20}{4} = 5'}</MB>}
                  help={
                    <Hilfen
                      steps={[
                        <>Welche Zahl steht vor <M>{'x^2'}</M>, welche vor <M>x</M>? Achte auf das Vorzeichen.</>,
                        <>Setze in <M>{'x_S = -\\frac{b}{2a}'}</M> ein. Der Nenner ist <M>{'2 \\cdot a'}</M>, nicht nur <M>a</M>.</>,
                        <><M>{'x_S = -\\frac{-20}{2 \\cdot 2} = \\frac{20}{4}'}</M>.</>,
                      ]}
                    />
                  }
                />
                <CheckCard
                  title="Umgekehrt gedacht (Erweiterung)"
                  level="erweiterung"
                  prompt={
                    <p>
                      Für welches <M>b</M> liegt der Scheitelpunkt von <M>{'f(x) = x^2 + bx + 1'}</M> bei <M>{'x_S = 3'}</M>? Wie groß ist dann <M>{'y_S'}</M>?
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -6 },
                    { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: -8 },
                  ]}
                  solution={
                    <>
                      <MB>{'3 = -\\frac{b}{2 \\cdot 1} \\Rightarrow b = -6'}</MB>
                      <MB>{'f(x) = x^2 - 6x + 1 \\qquad y_S = f(3) = 9 - 18 + 1 = -8'}</MB>
                    </>
                  }
                />
                <CodeLock
                  index={3}
                  task={
                    <>
                      <p>
                        Schloss 3 verlangt Teil 3 des Codes: die <strong>x-Koordinate des Scheitelpunkts</strong> von <M>{'f(x) = 2x^2 - 20x + 5'}</M>.
                      </p>
                      <HeftHinweis />
                    </>
                  }
                  expected={5}
                  solved={digits[2]}
                  onSolved={() => solve(3)}
                />
                {weiter(3)}
              </Raum>
            </Phase>
          </div>

          {/* 4 Tresor */}
          <div hidden={hide(4)}>
            <Phase no={4} title="Raum 4: Der Tresor" social="PA" minutes={5}>
              <Raum no={4} title="Wie hoch spritzt der Brunnen wirklich?">
                <p className="esc-story">Der Tresor steht neben dem Brunnen-Modell. Der letzte Teil des Codes ist die größte Höhe des Wasserstrahls in Metern, mit Komma. Ablesen reicht hier nicht, aber ihr kennt jetzt eine Methode, die genau rechnet.</p>
                <BrunnenBild showS={digits[3]} guess={pred.saved ? { x: pred.x, y: pred.y } : undefined} />
                <CheckCard
                  title="Höchster Punkt des Strahls"
                  prompt={
                    <p>
                      Strahl: <M>{'h(x) = -0{,}4x^2 + 2{,}8x + 1'}</M>. Berechnet den höchsten Punkt (<M>x_S</M> und <M>y_S</M>).
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'xs', label: <>Entfernung <M>{'x_S ='}</M></>, expected: 3.5, unit: 'm' },
                    { kind: 'num', key: 'ys', label: <>Höhe <M>{'y_S ='}</M></>, expected: 5.9, unit: 'm' },
                  ]}
                  solution={
                    <>
                      <p>Es ist <M>{'a = -0{,}4'}</M>, <M>{'b = 2{,}8'}</M> und <M>{'c = 1'}</M>.</p>
                      <MB>{'x_S = -\\frac{2{,}8}{2 \\cdot (-0{,}4)} = -\\frac{2{,}8}{-0{,}8} = 3{,}5'}</MB>
                      <MB>{'y_S = h(3{,}5) = -0{,}4 \\cdot 12{,}25 + 2{,}8 \\cdot 3{,}5 + 1 = -4{,}9 + 9{,}8 + 1 = 5{,}9'}</MB>
                      <p>Der höchste Punkt ist <M>{'S(3{,}5 \\mid 5{,}9)'}</M>.</p>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Welche Zahlen sind <M>a</M>, <M>b</M> und <M>c</M> in <M>{'-0{,}4x^2 + 2{,}8x + 1'}</M>?</>,
                        <>Rechne zuerst <M>{'x_S = -\\frac{b}{2a}'}</M>, dann setze das Ergebnis in <M>h(x)</M> ein.</>,
                        <>Im Nenner steht <M>{'2 \\cdot (-0{,}4) = -0{,}8'}</M>. Das Minus vor dem Bruch und das Minus im Nenner heben sich auf. Für <M>{'y_S'}</M> rechnest du <M>{'3{,}5^2 = 12{,}25'}</M>.</>,
                      ]}
                    />
                  }
                />
                {pred.saved && (
                  <div className="ls-back">
                    <p>
                      <strong>Du hattest vermutet:</strong> höchster Punkt bei x ≈ {fmt(pred.x, 1)} m in {fmt(pred.y, 1)} m Höhe.
                    </p>
                    <p>
                      Berechnet wurde <strong>S(3,5 | 5,9)</strong>. Abweichung: {fmt(Math.abs(pred.x - 3.5), 1)} m in x-Richtung und {fmt(Math.abs(pred.y - 5.9), 1)} m in der Höhe. Ganz genau trifft man den Scheitelpunkt beim Schätzen kaum. Die Symmetrie verrät dir die Mitte, die genauen Koordinaten liefert aber erst die Rechnung.
                    </p>
                  </div>
                )}
                <CodeLock
                  index={4}
                  task={
                    <p>
                      Schloss 4 verlangt Teil 4 des Codes: die <strong>größte Höhe des Strahls in Metern</strong> (mit Komma).
                    </p>
                  }
                  expected={5.9}
                  solved={digits[3]}
                  onSolved={() => solve(4)}
                />
                {weiter(4)}
              </Raum>
            </Phase>
          </div>

          {/* 5 Austausch */}
          <div hidden={hide(5)}>
            <Phase no={5} title="Vergleicht eure Wege" social="Plenum" minutes={4}>
              <Raum no={5} title="Die Tür ist offen">
                <div className="ls-stop">
                  <div className="ls-stop-title">
                    <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
                  </div>
                  <ul>
                    <li>Warum liegt der Scheitelpunkt genau in der Mitte zwischen zwei Punkten gleicher Höhe?</li>
                    <li>Was bewirkt c in <M>{'ax^2 + bx + c'}</M> für die x-Koordinate des Scheitelpunkts?</li>
                    <li>Wie weit lagen eure Vermutungen aus dem Einstieg vom richtigen Wert S(3,5 | 5,9) entfernt? Warum kann man den Scheitelpunkt nicht einfach ablesen?</li>
                  </ul>
                </div>
                <p>
                  <strong>Du arbeitest allein?</strong> So haben drei andere Jugendliche gedacht. Klappe die Wege auf und vergleiche sie mit deinem.
                </p>
                <div className="ls-ways">
                  <details className="ls-way">
                    <summary>Lena hat die Wertetabelle genutzt</summary>
                    <div className="ls-way-body">
                      <p>„Ich habe die Höhen in 0,5-m-Schritten ausgerechnet. Am größten war es bei x = 3,5 mit 5,9 m. Ob es dazwischen noch höher geht, weiß ich nicht sicher.“</p>
                      <p>
                        <strong>Gut:</strong> Funktioniert immer und ist leicht zu verstehen. <strong>Aber:</strong> Es dauert lange und bei Werten zwischen den Schritten bleibt man unsicher.
                      </p>
                    </div>
                  </details>
                  <details className="ls-way">
                    <summary>Jonas hat die Symmetrie genutzt</summary>
                    <div className="ls-way-body">
                      <p>„Düse und Beckenrand liegen beide auf 1 m. Die Mitte ist bei x = 3,5, also ist dort der höchste Punkt.“</p>
                      <p>
                        <strong>Gut:</strong> Sehr schnell, wenn man zwei Punkte gleicher Höhe kennt. <strong>Aber:</strong> Man findet nur x_S, die Höhe muss man noch ausrechnen.
                      </p>
                    </div>
                  </details>
                  <details className="ls-way">
                    <summary>Mira hat die Formel genutzt</summary>
                    <div className="ls-way-body">
                      <p>„Ich habe a = −0,4 und b = 2,8 abgelesen und x_S = −b/(2a) = 3,5 gerechnet. Dann h(3,5) = 5,9.“</p>
                      <p>
                        <strong>Gut:</strong> Klappt bei jeder Parabel in allgemeiner Form. <strong>Aber:</strong> Man muss auf die Vorzeichen achten.
                      </p>
                    </div>
                  </details>
                </div>
                {weiter(5)}
              </Raum>
            </Phase>
          </div>

          {/* 6 Merkkarte */}
          <div hidden={hide(6)}>
            <Phase no={6} title="Das hältst du fest: Merkkarte" social="PA" minutes={6}>
              <Merke title="Scheitelpunkt aus der allgemeinen Form">
                <p>
                  Zu <M>{'f(x) = ax^2 + bx + c'}</M> gehört der Scheitelpunkt <M>{'S(x_S \\mid y_S)'}</M> mit
                </p>
                <MB>{'x_S = -\\frac{b}{2a} \\qquad y_S = f(x_S)'}</MB>
                <p>
                  Der Scheitelpunkt liegt in der Mitte zwischen zwei Punkten gleicher Höhe. Ist <M>{'a > 0'}</M>, ist S der tiefste Punkt, ist <M>{'a < 0'}</M>, der höchste.
                </p>
              </Merke>
              <Beispiel
                title="Beispiel aus Raum 4"
                aufgabe={<p>Berechne den höchsten Punkt von <M>{'h(x) = -0{,}4x^2 + 2{,}8x + 1'}</M>.</p>}
                steps={[
                  { title: 'a, b, c ablesen', body: <MB>{'a = -0{,}4 \\qquad b = 2{,}8 \\qquad c = 1'}</MB> },
                  { title: 'x_S berechnen', body: <MB>{'x_S = -\\frac{b}{2a} = -\\frac{2{,}8}{2 \\cdot (-0{,}4)} = 3{,}5'}</MB> },
                  { title: 'y_S berechnen', body: <MB>{'y_S = h(3{,}5) = -0{,}4 \\cdot 3{,}5^2 + 2{,}8 \\cdot 3{,}5 + 1 = 5{,}9'}</MB> },
                  { title: 'Antwort', body: <MB>{'S(3{,}5 \\mid 5{,}9)'}</MB> },
                ]}
              />
              <Merkkarte />
              {weiter(6)}
            </Phase>
          </div>

          {/* 7 Check */}
          <div hidden={hide(7)}>
            <Phase no={7} title="Check: Hast du es verstanden?" social="EA" minutes={5}>
              <div className="lp-exlist">
                <McCard
                  title="Check 1: Welcher Scheitelpunkt stimmt?"
                  rechnen
                  level="basis"
                  prompt={
                    <p>
                      Berechne den Scheitelpunkt von <M>{'f(x) = 2x^2 - 8x + 3'}</M>.
                    </p>
                  }
                  options={[
                    { text: 'S(2 | −5)', correct: true, feedback: 'x_S = 8 / 4 = 2 und y_S = f(2) = 8 − 16 + 3 = −5.' },
                    { text: 'S(−2 | 27)', feedback: 'Das Vorzeichen von b wurde nicht umgedreht. Es gilt x_S = −b/(2a) = −(−8)/4 = 2.' },
                    { text: 'S(4 | 3)', feedback: 'Hier wurde durch a statt durch 2a geteilt. Der Nenner ist 2 · 2 = 4.' },
                    { text: 'S(2 | 3)', feedback: 'Der x-Wert stimmt, aber y_S ist nicht c. Setze x_S = 2 in f(x) ein.' },
                  ]}
                />
                <McCard
                  title="Check 2: Wer hat recht?"
                  rechnen
                  level="standard"
                  prompt={
                    <p>
                      Mia sagt: „Bei <M>{'f(x) = x^2 + 6x + 2'}</M> liegt der Scheitelpunkt bei <M>{'x_S = 3'}</M>.“ Leon sagt: „Nein, bei <M>{'x_S = -3'}</M>.“ Rechne nach und entscheide.
                    </p>
                  }
                  options={[
                    { text: 'Leon hat recht: x_S = −6 / 2 = −3.', correct: true, feedback: 'Bei positivem b wird x_S negativ. Der Scheitelpunkt liegt links von der y-Achse.' },
                    { text: 'Mia hat recht: x_S = 6 / 2 = 3.', feedback: 'Das Minus in der Formel fehlt. Es gilt x_S = −b/(2a) = −6/2.' },
                    { text: 'Beide haben unrecht: x_S = −6.', feedback: 'Durch 2a muss noch geteilt werden: −6 / (2 · 1) = −3.' },
                    { text: 'Beide haben unrecht: x_S = 2, denn c bestimmt die Mitte.', feedback: 'c verschiebt die Parabel nur nach oben oder unten, nicht seitlich.' },
                  ]}
                />
                <CheckCard
                  title="Check 3: Jetzt ganz allein"
                  level="erweiterung"
                  prompt={
                    <p>
                      Eine Parabel hat den Scheitelpunkt <M>{'S(2 \\mid 1)'}</M> und die Form <M>{'f(x) = x^2 + bx + c'}</M>. Bestimme <M>b</M> und <M>c</M>.
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -4 },
                    { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 5 },
                  ]}
                  solution={
                    <>
                      <MB>{'2 = -\\frac{b}{2 \\cdot 1} \\Rightarrow b = -4'}</MB>
                      <MB>{'f(2) = 4 - 8 + c = 1 \\Rightarrow c = 5'}</MB>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Du kennst x_S. Welche Formel verbindet x_S und b?</>,
                        <>Setze x_S = 2 und a = 1 in die Formel ein und löse nach b auf. Danach brauchst du noch f(2) = 1.</>,
                        <>Mit b = −4 gilt <M>{'f(2) = 2^2 - 4 \\cdot 2 + c = 1'}</M>. Löse nach c auf.</>,
                      ]}
                    />
                  }
                />
              </div>
              <nav className="lp-nav" aria-label="Weiter">
                <button type="button" className="bk-btn" onClick={onBack}>
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
                </button>
                <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                  Weiter üben: Scheitelpunkt berechnen (Einfach) <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </nav>
            </Phase>
          </div>
        </div>
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}
