import { createContext, useContext, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { useTaskTracking } from '../../../hooks/useTaskTracking'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { Beispiel, M, MB, Merke, QuerTabelle, checkNumber, fmt, pick } from '../../daten_und_zufall/lernpfad/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './fahrschule.css'

// Einstiegs-Lernsituation „Welche Fahrschule lohnt sich für dich?“ zum Schnittpunkt zweier Geraden.
// Phasen: Aktivieren → Situation & Vorhersage → Erkunden → Austausch → Sichern → Check.
// Die Vorhersage bleibt nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Schnittpunkt zweier Geraden“ angezeigt; der Infoteil
// (Erklärung mit Erklärvideo) kommt von dort, damit er nur an einer Stelle gepflegt wird.

/** Infoteil der Übungsseite (Erklärung, Beispiel, Erklärvideo) */
const ErklaerungCtx = createContext<ReactNode>(null)

/** Infoteil zum Aufklappen, z. B. in den Hilfen */
function ErklaerungAufklappen({ label = 'Erklärung mit Video öffnen' }: { label?: string }) {
  const erklaerung = useContext(ErklaerungCtx)
  const [open, setOpen] = useState(false)
  if (!erklaerung) return null
  return (
    <div className="ls-help">
      <div>
        <button type="button" className="bk-btn bk-btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <i className="fa-solid fa-circle-play" aria-hidden="true" /> {open ? 'Erklärung schließen' : label}
        </button>
      </div>
      {open && erklaerung}
    </div>
  )
}

/* ── Situation ───────────────────────────────────────────────────────────── */

const A = { t: 450, m: 60 }
const B = { t: 300, m: 70 }
const kostenA = (x: number) => A.t + A.m * x
const kostenB = (x: number) => B.t + B.m * x
const XS = (A.t - B.t) / (B.m - A.m) // 15
const YS = kostenA(XS) // 1350
const TABLE_X = [0, 5, 10, 15, 20, 25, 30]

const euro = (x: number) => `${fmt(x, 2)} €`

const PRAISE = ['Super, richtig! 🎉', 'Klasse, genau so!', 'Stark, richtig gelöst! 💪', 'Perfekt, das stimmt!', 'Richtig! Weiter so!']

type Prediction = { choice: 'A' | 'B' | 'kommt' | null; hours: number; saved: boolean }

const CHOICE_TEXT: Record<'A' | 'B' | 'kommt', string> = {
  A: 'Fahrschule A ist günstiger',
  B: 'Fahrschule B ist günstiger',
  kommt: 'Es kommt darauf an',
}

/* ── Kleine Bausteine ────────────────────────────────────────────────────── */

type Social = 'EA' | 'PA' | 'Plenum'
const SOCIAL: Record<Social, { label: string; icon: string }> = {
  EA: { label: 'Einzelarbeit', icon: 'fa-user' },
  PA: { label: 'Partnerarbeit', icon: 'fa-user-group' },
  Plenum: { label: 'Klasse', icon: 'fa-users' },
}

function Phase({ no, title, social, minutes, children }: { no: number; title: string; social: Social; minutes: number; children: ReactNode }) {
  return (
    <section className="lp-section" aria-labelledby={`phase-${no}`}>
      <div>
        <h2 className="lp-h2" id={`phase-${no}`}>
          <span className="lp-h2-no">{no}</span>
          {title}
        </h2>
        <div className="ls-meta">
          <span className="ls-chip ls-chip-social">
            <i className={`fa-solid ${SOCIAL[social].icon}`} aria-hidden="true" /> {SOCIAL[social].label}
          </span>
          <span className="ls-chip">
            <i className="fa-regular fa-clock" aria-hidden="true" /> ca. {minutes} min
          </span>
        </div>
      </div>
      {children}
    </section>
  )
}

type Level = 'basis' | 'standard' | 'erweiterung'
const LEVEL_TEXT: Record<Level, string> = { basis: 'Basis', standard: 'Standard', erweiterung: 'Erweiterung' }

function LevelTag({ level }: { level: Level }) {
  return (
    <span className={`ls-level ls-level-${level}`}>
      {'★'.repeat(level === 'basis' ? 1 : level === 'standard' ? 2 : 3)} {LEVEL_TEXT[level]}
    </span>
  )
}

function CardHead({ title, level }: { title: ReactNode; level?: Level }) {
  return (
    <div className="lp-ex-head">
      <h3 className="lp-ex-title">{title}</h3>
      {level && <LevelTag level={level} />}
    </div>
  )
}

/** Gestufte Hilfekarten: Denkanstoß → Strategie → erster Schritt, nacheinander aufdecken */
function Hilfen({ steps }: { steps: [ReactNode, ReactNode, ReactNode] }) {
  const [shown, setShown] = useState(0)
  const titles = ['Hilfe 1 · Denkanstoß', 'Hilfe 2 · Strategie', 'Hilfe 3 · Erster Schritt']
  return (
    <div className="ls-help">
      {steps.slice(0, shown).map((s, i) => (
        <div key={i} className="ls-help-card">
          <div className="ls-help-card-title">{titles[i]}</div>
          {s}
        </div>
      ))}
      {shown < 3 && (
        <div>
          <button type="button" className="bk-btn bk-btn-sm" onClick={() => setShown(shown + 1)}>
            <i className="fa-solid fa-life-ring" aria-hidden="true" /> {shown === 0 ? 'Hilfe 1 anzeigen' : `Hilfe ${shown + 1} anzeigen`}
          </button>
        </div>
      )}
    </div>
  )
}

type Tracking = { onInput: () => void; onCheck: (ok: boolean) => void; onHintShown: () => void }
const NO_TRACKING: Tracking = { onInput: () => {}, onCheck: () => {}, onHintShown: () => {} }

type NumField = { kind: 'num'; key: string; label: ReactNode; expected: number; unit?: string; tol?: number }
type SelectField = { kind: 'select'; key: string; label: ReactNode; options: string[]; expected: number }
type CField = NumField | SelectField

/** Aufgabenkarte mit Zahlenfeldern / Auswahllisten, Prüfen, Lob und Lösungsweg */
function CheckCard({
  title,
  level,
  prompt,
  fields,
  solution,
  help,
  tracking = NO_TRACKING,
}: {
  title: ReactNode
  level?: Level
  prompt: ReactNode
  fields: CField[]
  solution?: ReactNode
  /** Gestufte Hilfekarten unter der Aufgabe */
  help?: ReactNode
  tracking?: Tracking
}) {
  const uid = useId()
  const [values, setValues] = useState<Record<string, string>>({})
  const [marks, setMarks] = useState<Record<string, boolean | undefined>>({})
  const [status, setStatus] = useState<'idle' | 'ok' | 'no' | 'empty'>('idle')
  const [praise, setPraise] = useState(PRAISE[0])
  const [showSolution, setShowSolution] = useState(false)

  const setValue = (key: string, v: string) => {
    setValues((p) => ({ ...p, [key]: v }))
    setMarks((p) => ({ ...p, [key]: undefined }))
    setStatus('idle')
    tracking.onInput()
  }

  const check = () => {
    const m: Record<string, boolean | undefined> = {}
    for (const f of fields) {
      const v = values[f.key] ?? ''
      m[f.key] = f.kind === 'select' ? (v === '' ? undefined : Number(v) === f.expected) : checkNumber(v, f.expected, f.tol)
    }
    setMarks(m)
    if (fields.some((f) => m[f.key] === undefined)) return setStatus('empty')
    const ok = fields.every((f) => m[f.key])
    setStatus(ok ? 'ok' : 'no')
    if (ok) setPraise(pick(PRAISE))
    tracking.onCheck(ok)
  }

  return (
    <div className="lp-ex bk-panel">
      <CardHead title={title} level={level} />
      <div className="lp-ex-prompt">{prompt}</div>
      <div className="lp-fields">
        {fields.map((f) => (
          <div key={f.key} className="lp-field">
            <label className="lp-label" htmlFor={`${uid}-${f.key}`}>
              {f.label}
            </label>
            {f.kind === 'select' ? (
              <select
                id={`${uid}-${f.key}`}
                className={`bk-input lp-select ${fieldCheckClass(marks[f.key])}`}
                value={values[f.key] ?? ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setValue(f.key, e.target.value)}
              >
                <option value="">–</option>
                {f.options.map((o, i) => (
                  <option key={i} value={i}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <span className="lp-num">
                <input
                  id={`${uid}-${f.key}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="?"
                  className={`bk-input lp-input lp-input-md ${fieldCheckClass(marks[f.key])}`}
                  value={values[f.key] ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(f.key, e.target.value)}
                />
                {f.unit && <span className="lp-unit">{f.unit}</span>}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="bk-actions lp-ex-actions">
        <button type="button" className="bk-btn bk-btn-primary" onClick={check}>
          Prüfen
        </button>
        {solution && (
          <button
            type="button"
            className="bk-btn"
            onClick={() => {
              if (!showSolution) tracking.onHintShown()
              setShowSolution((s) => !s)
            }}
          >
            <i className="fa-solid fa-route" aria-hidden="true" /> {showSolution ? 'Lösungsweg ausblenden' : 'Lösungsweg zeigen'}
          </button>
        )}
      </div>
      <Feedback status={status} praise={praise} />
      {help}
      {showSolution && solution && (
        <div className="bk-solution lp-solution">
          <div className="bk-solution-title">Lösungsweg</div>
          {solution}
        </div>
      )}
    </div>
  )
}

function Feedback({ status, praise, wrongText }: { status: 'idle' | 'ok' | 'no' | 'empty'; praise: string; wrongText?: ReactNode }) {
  if (status === 'ok')
    return (
      <div className="bk-feedback bk-feedback-ok lp-feedback" role="status">
        <i className="fa-solid fa-circle-check" aria-hidden="true" /> {praise}
      </div>
    )
  if (status === 'no')
    return (
      <div className="bk-feedback bk-feedback-no lp-feedback" role="status">
        <i className="fa-solid fa-circle-xmark" aria-hidden="true" />{' '}
        {wrongText ?? 'Leider noch nicht ganz richtig. Die roten Felder stimmen noch nicht – rechne sie noch einmal nach.'}
      </div>
    )
  if (status === 'empty')
    return (
      <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
        <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage zuerst in alle Felder etwas ein.
      </div>
    )
  return null
}

type McOption = { text: ReactNode; correct?: boolean; feedback: ReactNode }

/** Auswahlaufgabe; jede falsche Antwort steht für eine typische Fehlvorstellung und bekommt eine eigene Rückmeldung. */
function McCard({ title, level, prompt, options, tracking = NO_TRACKING }: { title: ReactNode; level?: Level; prompt: ReactNode; options: McOption[]; tracking?: Tracking }) {
  const uid = useId()
  const [choice, setChoice] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'no' | 'empty'>('idle')
  const [praise, setPraise] = useState(PRAISE[0])

  const check = () => {
    if (choice === null) return setStatus('empty')
    const ok = !!options[choice].correct
    setStatus(ok ? 'ok' : 'no')
    if (ok) setPraise(pick(PRAISE))
    tracking.onCheck(ok)
  }
  const mark = status === 'ok' ? true : status === 'no' ? false : undefined

  return (
    <div className="lp-ex bk-panel">
      <CardHead title={title} level={level} />
      <div className="lp-ex-prompt">{prompt}</div>
      <div className="ls-options" role="radiogroup">
        {options.map((o, i) => (
          <label key={i} className={`bk-choice ls-option ${choice === i ? fieldCheckClass(mark) : ''}`}>
            <input
              type="radio"
              name={uid}
              checked={choice === i}
              onChange={() => {
                setChoice(i)
                setStatus('idle')
                tracking.onInput()
              }}
            />
            <span>{o.text}</span>
          </label>
        ))}
      </div>
      <div className="bk-actions lp-ex-actions">
        <button type="button" className="bk-btn bk-btn-primary" onClick={check}>
          Prüfen
        </button>
      </div>
      {status === 'ok' && choice !== null && (
        <div className="bk-feedback bk-feedback-ok lp-feedback" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" /> {praise} {options[choice].feedback}
        </div>
      )}
      {status === 'no' && choice !== null && (
        <Feedback status="no" praise={praise} wrongText={<>Leider nicht richtig. {options[choice].feedback}</>} />
      )}
      {status === 'empty' && <Feedback status="empty" praise={praise} />}
    </div>
  )
}

/** Karten im Check: jede Aufgabe einzeln im Nachverfolgungsmodus */
function TrackedMc(props: Omit<Parameters<typeof McCard>[0], 'tracking'> & { topic: string }) {
  const tracking = useTaskTracking(props.topic)
  return <McCard {...props} tracking={tracking} />
}
function TrackedCheck(props: Omit<Parameters<typeof CheckCard>[0], 'tracking'> & { topic: string }) {
  const tracking = useTaskTracking(props.topic)
  return <CheckCard {...props} tracking={tracking} />
}

/* ── Graph mit Schieberegler ─────────────────────────────────────────────── */

const G = { w: 620, h: 420, l: 70, r: 20, t: 30, b: 56, xMax: 30, yMax: 2500 }
const gx = (x: number) => G.l + (x / G.xMax) * (G.w - G.l - G.r)
const gy = (y: number) => G.h - G.b - (y / G.yMax) * (G.h - G.t - G.b)

function KostenGraph() {
  const [x, setX] = useState(5)
  const a = kostenA(x)
  const b = kostenB(x)
  return (
    <div className="lp-ex bk-panel">
      <CardHead title="Weg 2: Graph" level="standard" />
      <div className="lp-ex-prompt">
        <p>
          Die blaue Gerade zeigt die Kosten bei A, die braune die Kosten bei B. Bewegt den Regler und beobachtet beide Punkte: Wo sind die Kosten gleich?
        </p>
      </div>
      <div className="bk-graph ls-graph">
        <svg viewBox={`0 0 ${G.w} ${G.h}`} role="img" aria-label="Graphen der Kosten von Fahrschule A und B">
          {[0, 5, 10, 15, 20, 25, 30].map((v) => (
            <g key={`x${v}`}>
              <line x1={gx(v)} x2={gx(v)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--grid)" />
              <text x={gx(v)} y={gy(0) + 24} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
                {v}
              </text>
            </g>
          ))}
          {[0, 500, 1000, 1500, 2000, 2500].map((v) => (
            <g key={`y${v}`}>
              <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(v)} y2={gy(v)} stroke="var(--grid)" />
              <text x={gx(0) - 8} y={gy(v) + 5} textAnchor="end" fontSize="19" fill="var(--ink-muted)">
                {fmt(v, 0)}
              </text>
            </g>
          ))}
          <line x1={gx(0)} x2={gx(G.xMax)} y1={gy(0)} y2={gy(0)} stroke="var(--ink)" strokeWidth="1.5" />
          <line x1={gx(0)} x2={gx(0)} y1={gy(0)} y2={gy(G.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
          <text x={gx(G.xMax)} y={G.h - 6} textAnchor="end" fontSize="19" fill="var(--ink)">
            Fahrstunden x
          </text>
          <text x={gx(0) + 6} y={G.t + 4} fontSize="19" fill="var(--ink)">
            Kosten in €
          </text>
          <line x1={gx(0)} y1={gy(kostenA(0))} x2={gx(30)} y2={gy(kostenA(30))} stroke="var(--primary)" strokeWidth="3.5" />
          <line x1={gx(0)} y1={gy(kostenB(0))} x2={gx(30)} y2={gy(kostenB(30))} stroke="var(--hint)" strokeWidth="3.5" strokeDasharray="10 5" />
          <text x={gx(30) - 4} y={gy(kostenA(30)) + 24} textAnchor="end" fontSize="22" fontWeight="700" fill="var(--primary)">
            A
          </text>
          <text x={gx(30) - 4} y={gy(kostenB(30)) - 10} textAnchor="end" fontSize="22" fontWeight="700" fill="var(--hint)">
            B
          </text>
          <line x1={gx(x)} x2={gx(x)} y1={gy(0)} y2={gy(Math.max(a, b))} stroke="var(--ink-muted)" strokeDasharray="4 4" />
          <circle cx={gx(x)} cy={gy(a)} r="7" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
          <circle cx={gx(x)} cy={gy(b)} r="7" fill="var(--hint)" stroke="var(--surface)" strokeWidth="2" />
        </svg>
      </div>
      <div className="ls-slider">
        <label htmlFor="ls-graph-x">
          Fahrstunden: <span className="ls-slider-value">{x}</span>
        </label>
        <input id="ls-graph-x" type="range" min={0} max={30} step={1} value={x} onChange={(e: ChangeEvent<HTMLInputElement>) => setX(Number(e.target.value))} />
      </div>
      <div className="ls-readout">
        <div className="ls-readout-box ls-readout-a">
          <strong>A:</strong> <M>{`450 + 60 \\cdot ${x} = ${fmt(a, 0).replace('.', '{.}')}`}</M> €
        </div>
        <div className="ls-readout-box ls-readout-b">
          <strong>B:</strong> <M>{`300 + 70 \\cdot ${x} = ${fmt(b, 0).replace('.', '{.}')}`}</M> €
        </div>
      </div>
      {a === b && (
        <div className="ls-equal" role="status">
          <i className="fa-solid fa-equals" aria-hidden="true" /> Hier treffen sich die Geraden: Beide Fahrschulen kosten gleich viel!
        </div>
      )}
      <p className="lp-hint">
        Im Heft: Zeichnet beide Geraden in ein Koordinatensystem (x-Achse: 1 cm für 5 Stunden, y-Achse: 1 cm für 250 €) und markiert, wo sie sich schneiden.
      </p>
      <Hilfen
        steps={[
          <>Was passiert mit dem Abstand der beiden Punkte, wenn ihr den Regler nach rechts schiebt?</>,
          <>Sucht die Stelle, an der die beiden Punkte genau aufeinanderliegen. Dort schneiden sich die Geraden.</>,
          <>Bei 10 Stunden liegt B noch 50 € unter A, bei 20 Stunden schon 50 € über A. Die gesuchte Stelle liegt also genau dazwischen.</>,
        ]}
      />
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function FahrschuleEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [pred, setPred] = useState<Prediction>({ choice: null, hours: 20, saved: false })

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
    <TaskShell title="Schnittpunkt zweier Geraden" subtitle="Lernsituation: Welche Fahrschule lohnt sich für dich?" width="wide">
      <div className="lp">
        <div>
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
        </div>
        <div className="lp-goal">
          <i className="fa-solid fa-bullseye" aria-hidden="true" />
          <div>
            <strong>Das lernst du hier:</strong> Du findest heraus, wann zwei Angebote gleich viel kosten, mit Tabelle, Graph und Gleichung. So kannst du
            begründet entscheiden, welches Angebot sich für dich lohnt.
          </div>
        </div>

        {/* 1 Aktivieren */}
        <Phase no={1} title="Fit für den Start" social="EA" minutes={5}>
          <p>Diese vier kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
          <div className="lp-exlist">
            <CheckCard
              title="a) Kosten ausrechnen"
              prompt={<p>Eine Fahrschule verlangt 450 € Grundbetrag und 60 € pro Fahrstunde. Was kosten 10 Fahrstunden insgesamt?</p>}
              fields={[{ kind: 'num', key: 'k', label: 'Kosten', expected: 1050, unit: '€' }]}
              solution={<MB>{'450 + 60 \\cdot 10 = 450 + 600 = 1050 \\text{ €}'}</MB>}
            />
            <McCard
              title="b) Term finden"
              prompt={
                <p>
                  Welche Funktionsgleichung beschreibt die Kosten <M>y</M> (in €) dieser Fahrschule bei <M>x</M> Fahrstunden?
                </p>
              }
              options={[
                { text: <M>{'y = 60x + 450'}</M>, correct: true, feedback: 'Pro Stunde kommen 60 € dazu (Steigung m), 450 € zahlst du immer (y-Achsenabschnitt t).' },
                { text: <M>{'y = 450x + 60'}</M>, feedback: 'Hier sind m und t vertauscht. Die 450 € zahlst du nur einmal, nicht pro Stunde.' },
                { text: <M>{'y = 60x'}</M>, feedback: 'Hier fehlt der Grundbetrag, den du auch bei 0 Stunden zahlst.' },
                { text: <M>{'y = 510x'}</M>, feedback: 'Grundbetrag und Stundenpreis darf man nicht zusammenzählen: Der Grundbetrag kommt nur einmal dazu.' },
              ]}
            />
            <CheckCard
              title="c) Gleichung lösen"
              prompt={<MB>{'10x = 150'}</MB>}
              fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 15 }]}
              solution={<MB>{'\\begin{aligned} 10x &= 150 && \\mid :10 \\\\ x &= 15 \\end{aligned}'}</MB>}
            />
            <CheckCard
              title="d) Gleichung lösen"
              prompt={<MB>{'4x + 3 = 23'}</MB>}
              fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 5 }]}
              solution={<MB>{'\\begin{aligned} 4x + 3 &= 23 && \\mid -3 \\\\ 4x &= 20 && \\mid :4 \\\\ x &= 5 \\end{aligned}'}</MB>}
            />
          </div>
        </Phase>

        {/* 2 Situation & Vorhersage */}
        <Phase no={2} title="Die Situation: Zwei Fahrschulen" social="EA" minutes={5}>
          <p>
            Du willst den Autoführerschein (Klasse B) machen. In deiner Stadt gibt es zwei Fahrschulen. Beide verlangen einen Grundbetrag (Anmeldung, Theorieunterricht,
            Lern-App) und einen Preis pro Übungsfahrstunde (45 Minuten). Die Pflicht-Sonderfahrten und die Prüfungsgebühren kosten bei beiden gleich viel, die lassen wir
            weg.
          </p>
          <div className="ls-flyers">
            <div className="ls-flyer ls-flyer-a">
              <div className="ls-flyer-name">Fahrschule A</div>
              <div className="ls-flyer-sub">„Neue Autos, entspannt lernen“</div>
              <div className="ls-flyer-price">
                Grundbetrag <strong>450 €</strong>
              </div>
              <div className="ls-flyer-price">
                pro Fahrstunde <strong>60 €</strong>
              </div>
            </div>
            <div className="ls-flyer ls-flyer-b">
              <div className="ls-flyer-name">Fahrschule B</div>
              <div className="ls-flyer-sub">„Günstig einsteigen!“</div>
              <div className="ls-flyer-price">
                Grundbetrag <strong>300 €</strong>
              </div>
              <div className="ls-flyer-price">
                pro Fahrstunde <strong>70 €</strong>
              </div>
            </div>
          </div>
          <p>Wie viele Übungsstunden man braucht, ist sehr verschieden: Manche schaffen es mit 10, andere brauchen 30 oder mehr.</p>
          <div className="ls-question">
            <i className="fa-solid fa-circle-question" aria-hidden="true" />
            <span>Welche Fahrschule würdest du wählen?</span>
          </div>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Deine Vermutung" />
            {pred.saved && pred.choice ? (
              <>
                <div className="ls-saved" role="status">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Du schätzt, dass du etwa{' '}
                  <strong>{pred.hours} Fahrstunden</strong> brauchst. Am Ende schauen wir, ob du recht hattest.
                </div>
                <div>
                  <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                    Vermutung ändern
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Rechne noch nicht! Entscheide spontan und schreibe einen Satz als Begründung in dein Heft.</p>
                <div className="ls-options" role="radiogroup" aria-label="Vermutung">
                  {(['A', 'B', 'kommt'] as const).map((c) => (
                    <label key={c} className="bk-choice ls-option">
                      <input type="radio" name="ls-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                      <span>{CHOICE_TEXT[c]}</span>
                    </label>
                  ))}
                </div>
                <div className="ls-slider">
                  <label htmlFor="ls-hours">
                    So viele Fahrstunden werde ich wohl brauchen: <span className="ls-slider-value">{pred.hours}</span>
                  </label>
                  <input id="ls-hours" type="range" min={5} max={40} step={1} value={pred.hours} onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, hours: Number(e.target.value) })} />
                </div>
                <div>
                  <button type="button" className="bk-btn bk-btn-primary" disabled={!pred.choice} onClick={() => setPred({ ...pred, saved: true })}>
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
                  </button>
                </div>
              </>
            )}
          </div>
        </Phase>

        {/* 3 Erkunden */}
        <Phase no={3} title="Findet es heraus" social="PA" minutes={12}>
          <p>
            <strong>Auftrag:</strong> Findet zu zweit heraus, für wen sich welche Fahrschule lohnt. Ihr habt zwei Wege: Tabelle und Graph. Fangt mit einem an, wer fertig
            ist, probiert auch den anderen. Jede Person tippt auf dem eigenen Gerät.
          </p>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Weg 1: Tabelle" level="basis" />
            <div className="lp-ex-prompt">
              <p>Füllt die Tabelle aus. Die Felder färben sich von selbst grün oder rot.</p>
            </div>
            <QuerTabelle
              rows={[
                { head: 'Fahrstunden x', cells: TABLE_X.map((x) => <strong key={x}>{x}</strong>) },
                {
                  head: 'Kosten A in €',
                  cells: TABLE_X.map((x) => (x === 0 ? <span key={x}>{kostenA(0)}</span> : <span key={x}><CheckedNumberInput expected={kostenA(x)} className="bk-input lp-input lp-input-sm" /></span>)),
                },
                {
                  head: 'Kosten B in €',
                  cells: TABLE_X.map((x) => (x === 0 ? <span key={x}>{kostenB(0)}</span> : <span key={x}><CheckedNumberInput expected={kostenB(x)} className="bk-input lp-input lp-input-sm" /></span>)),
                },
              ]}
            />
            <p className="lp-hint">Vergleicht die beiden Zeilen Spalte für Spalte: Was fällt euch auf?</p>
            <Hilfen
              steps={[
                <>Bei 0 Stunden zahlt man nur den Grundbetrag. Um wie viel Euro steigen die Kosten bei A, wenn 5 Stunden dazukommen?</>,
                <>Rechnet immer: Grundbetrag + Stundenpreis · Stunden. Oder rechnet vom vorigen Feld aus weiter: A wird pro 5 Stunden um 300 € teurer, B um 350 €.</>,
                <>
                  Für 5 Stunden: A kostet <M>{'450 + 60 \\cdot 5 = 750'}</M> €, B kostet <M>{'300 + 70 \\cdot 5 = 650'}</M> €.
                </>,
              ]}
            />
          </div>

          <KostenGraph />

          <CheckCard
            title="Euer Ergebnis"
            prompt={<p>Egal, welchen Weg ihr genommen habt: Haltet euer Ergebnis fest.</p>}
            fields={[
              { kind: 'num', key: 'x', label: 'Beide gleich teuer bei … Fahrstunden', expected: XS },
              { kind: 'num', key: 'y', label: 'Kosten dann', expected: YS, unit: '€' },
              { kind: 'select', key: 'wenig', label: 'Wer wenige Stunden braucht (z. B. 10), wählt …', options: ['Fahrschule A', 'Fahrschule B'], expected: 1 },
              { kind: 'select', key: 'viel', label: 'Wer viele Stunden braucht (z. B. 25), wählt …', options: ['Fahrschule A', 'Fahrschule B'], expected: 0 },
            ]}
          />
        </Phase>

        {/* 4 Austausch */}
        <Phase no={4} title="Vergleicht eure Wege" social="Plenum" minutes={5}>
          <div className="ls-stop">
            <div className="ls-stop-title">
              <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
            </div>
            <ul>
              <li>Wo sieht man in der Tabelle und im Graphen, dass beide gleich teuer sind?</li>
              <li>Was ist links vom Schnittpunkt los, was rechts davon?</li>
              <li>Angenommen, A kostet 57 € pro Stunde statt 60 €. Findet ihr den Punkt mit Tabelle oder Graph dann noch genau?</li>
            </ul>
          </div>
          <p>
            <strong>Du arbeitest allein?</strong> So haben zwei andere Jugendliche gedacht. Klappe die Wege auf und vergleiche sie mit deinem.
          </p>
          <div className="ls-ways">
            <details className="ls-way">
              <summary>Jonas hat eine Tabelle gemacht</summary>
              <div className="ls-way-body">
                <p>„Bei 10 Stunden kostet A 1050 €, B 1000 €. Bei 20 Stunden kostet A 1650 €, B 1700 €. Irgendwo dazwischen wechselt es. Bei 15 Stunden kosten beide 1350 €.“</p>
                <p>
                  <strong>Gut:</strong> sehr anschaulich. <strong>Aber:</strong> Liegt die Grenze nicht genau in der Tabelle, sieht man sie nur ungefähr.
                </p>
              </div>
            </details>
            <details className="ls-way">
              <summary>Aylin hat die Graphen gezeichnet</summary>
              <div className="ls-way-body">
                <p>„Die Gerade von B startet tiefer, ist aber steiler. Bei 15 Stunden kreuzen sich die Geraden. Rechts davon liegt B oben, also ist B dort teurer.“</p>
                <p>
                  <strong>Gut:</strong> Man sieht auf einen Blick, wo welche Fahrschule günstiger ist. <strong>Aber:</strong> Ablesen ist nur so genau wie die Zeichnung.
                </p>
              </div>
            </details>
          </div>
          <p>
            Beide Wege haben einen Haken: Liegt der Schnittpunkt nicht genau in der Tabelle oder auf einer Gitterlinie, findet man ihn nur ungefähr. Im nächsten Abschnitt
            lernst du ein Verfahren, mit dem du ihn immer genau ausrechnest.
          </p>
        </Phase>

        {/* 5 Verfahren und Sichern */}
        <Phase no={5} title="So rechnest du den Schnittpunkt aus" social="EA" minutes={8}>
          <Rueckbezug pred={pred} />
          <p>
            Tabelle und Graph zeigen den Schnittpunkt gut, aber oft nur ungefähr. Mit dem <strong>Gleichsetzungsverfahren</strong> rechnest du ihn immer genau aus.
            Decke das Beispiel Schritt für Schritt auf.
          </p>
          <Beispiel
            title="Die Fahrschulen rechnerisch vergleichen"
            aufgabe={<p>Fahrschule A: 450 € Grundbetrag und 60 € pro Fahrstunde. Fahrschule B: 300 € Grundbetrag und 70 € pro Fahrstunde.</p>}
            steps={[
              {
                title: 'Funktionsgleichungen aufstellen',
                body: (
                  <>
                    <p>
                      <M>x</M> = Anzahl der Fahrstunden, <M>y</M> = Kosten in €. Der Grundbetrag ist der y-Achsenabschnitt <M>t</M>, der Preis pro Stunde ist die
                      Steigung <M>m</M>:
                    </p>
                    <MB>{'\\text{A: } y = 60x + 450 \\qquad \\text{B: } y = 70x + 300'}</MB>
                  </>
                ),
              },
              {
                title: 'Gleichsetzen',
                body: (
                  <>
                    <p>Im Schnittpunkt sind beide y-Werte gleich. Also darfst du die rechten Seiten gleichsetzen:</p>
                    <MB>{'60x + 450 = 70x + 300'}</MB>
                  </>
                ),
              },
              {
                title: 'Nach x auflösen',
                body: (
                  <>
                    <p>Alle x auf eine Seite, alle Zahlen auf die andere. Tipp: Ziehe das kleinere x ab, dann bleibt kein Minus vor dem x.</p>
                    <MB>{'\\begin{aligned} 60x + 450 &= 70x + 300 && \\mid -60x \\\\ 450 &= 10x + 300 && \\mid -300 \\\\ 150 &= 10x && \\mid :10 \\\\ 15 &= x \\end{aligned}'}</MB>
                  </>
                ),
              },
              {
                title: 'x einsetzen und y ausrechnen',
                body: (
                  <>
                    <p>Setze x = 15 in eine der beiden Gleichungen ein. Zur Probe in die andere:</p>
                    <MB>{'\\text{A: } y = 60 \\cdot 15 + 450 = 1350 \\qquad \\text{Probe B: } 70 \\cdot 15 + 300 = 1350 \\;\\checkmark'}</MB>
                  </>
                ),
              },
              {
                title: 'Schnittpunkt angeben und deuten',
                body: (
                  <>
                    <MB>{'S(15 \\mid 1350)'}</MB>
                    <p>Bei 15 Fahrstunden kosten beide Fahrschulen 1350 €. Wer weniger Stunden braucht, fährt mit B günstiger, wer mehr braucht, mit A.</p>
                  </>
                ),
              },
            ]}
          />
          <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
          <Merke title="Schnittpunkt zweier Geraden">
            <p>
              Im <strong>Schnittpunkt</strong> <M>{'S(x_S \\mid y_S)'}</M> haben beide Geraden denselben <M>x</M>-Wert <strong>und</strong> denselben <M>y</M>-Wert.
            </p>
            <p>So berechnest du ihn (Gleichsetzungsverfahren):</p>
            <ol>
              <li>
                Beide Funktionsterme gleichsetzen: <M>{'m_1 x + t_1 = m_2 x + t_2'}</M>
              </li>
              <li>
                Nach <M>x</M> auflösen, das ergibt <M>{'x_S'}</M>.
              </li>
              <li>
                <M>{'x_S'}</M> in eine der beiden Gleichungen einsetzen, das ergibt <M>{'y_S'}</M>.
              </li>
              <li>
                Schnittpunkt angeben: <M>{'S(x_S \\mid y_S)'}</M>, bei Sachaufgaben mit Antwortsatz.
              </li>
            </ol>
            <p>
              Fahrschule: <M>{'S(15 \\mid 1350)'}</M>: Bei 15 Fahrstunden kosten beide 1350 €. Unter 15 Stunden ist B günstiger, über 15 Stunden A.
            </p>
          </Merke>
          <div className="lp-ex bk-panel">
            <CardHead title="Dein Hefteintrag" />
            <p>
              Übertrage den Merkkasten in dein Heft und ergänze ihn mit dem Fahrschul-Beispiel. Hake ab, was du schon hast:
            </p>
            <div className="ls-criteria">
              {[
                'Überschrift „Schnittpunkt zweier Geraden“ und die beiden Funktionsgleichungen der Fahrschulen',
                'Beide Geraden in einem Koordinatensystem, Achsen beschriftet (Fahrstunden, Kosten in €), Schnittpunkt S(15 | 1350) markiert',
                'Gleichsetzen mit allen Rechenschritten und dem Einsetzen für y',
                'Antwortsatz: Für wen lohnt sich welche Fahrschule?',
              ].map((c) => (
                <label key={c}>
                  <input type="checkbox" /> <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </Phase>

        {/* 6 Üben */}
        <Phase no={6} title="Jetzt du: Schritt für Schritt üben" social="EA" minutes={7}>
          <p>Hier rechnest du das Verfahren selbst. Die erste Aufgabe gibt dir die Schritte vor, bei der zweiten stellst du auch die Gleichungen selbst auf.</p>
          <div className="lp-exlist">
            <CheckCard
              title="Übung 1: Mit Geländer"
              level="basis"
              prompt={
                <>
                  <p>Berechne den Schnittpunkt der beiden Geraden. Fülle die Lücken der Rechnung aus.</p>
                  <MB>{'f(x) = 4x + 1 \\qquad g(x) = 2x + 7'}</MB>
                  <MB>{'\\begin{aligned} 4x + 1 &= 2x + 7 && \\mid -2x \\\\ 2x + 1 &= 7 && \\mid -1 \\\\ 2x &= \\;\\fbox{?} && \\mid :2 \\\\ x &= \\;\\fbox{?} \\end{aligned}'}</MB>
                  <p>
                    Dann <M>x</M> in <M>f</M> einsetzen: <M>{'y = 4 \\cdot x + 1'}</M>
                  </p>
                </>
              }
              fields={[
                { kind: 'num', key: 'zweix', label: <M>{'2x ='}</M>, expected: 6 },
                { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 3 },
                { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 13 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 4x + 1 &= 2x + 7 && \\mid -2x \\\\ 2x + 1 &= 7 && \\mid -1 \\\\ 2x &= 6 && \\mid :2 \\\\ x &= 3 \\end{aligned}'}</MB>
                  <MB>{'y = 4 \\cdot 3 + 1 = 13 \\qquad \\Rightarrow \\qquad S(3 \\mid 13)'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Rechne Schritt für Schritt: Was bleibt übrig, wenn du auf beiden Seiten 1 abziehst?</>,
                    <>
                      Nach dem Abziehen steht links nur noch <M>2x</M>. Teile dann beide Seiten durch 2.
                    </>,
                    <>
                      <M>{'2x = 6'}</M>, also <M>{'x = 3'}</M>. Für <M>y</M>: <M>{'4 \\cdot 3 + 1'}</M>
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Übung 2: Zwei Fitnessstudios"
              level="standard"
              prompt={
                <>
                  <p>
                    Studio A verlangt 80 € Aufnahmegebühr und 25 € pro Monat. Studio B verlangt 20 € Aufnahmegebühr und 30 € pro Monat. <M>x</M> = Anzahl der
                    Monate, <M>y</M> = Gesamtkosten in €.
                  </p>
                  <p>Stelle beide Funktionsgleichungen auf und berechne, nach wie vielen Monaten beide gleich viel gekostet haben.</p>
                </>
              }
              fields={[
                { kind: 'num', key: 'mA', label: <>A: Steigung <M>m</M></>, expected: 25 },
                { kind: 'num', key: 'tA', label: <>A: <M>t</M></>, expected: 80 },
                { kind: 'num', key: 'mB', label: <>B: Steigung <M>m</M></>, expected: 30 },
                { kind: 'num', key: 'tB', label: <>B: <M>t</M></>, expected: 20 },
                { kind: 'num', key: 'x', label: 'Gleich teuer nach … Monaten', expected: 12 },
                { kind: 'num', key: 'y', label: 'Kosten dann', expected: 380, unit: '€' },
              ]}
              solution={
                <>
                  <MB>{'\\text{A: } y = 25x + 80 \\qquad \\text{B: } y = 30x + 20'}</MB>
                  <MB>{'\\begin{aligned} 25x + 80 &= 30x + 20 && \\mid -25x \\\\ 80 &= 5x + 20 && \\mid -20 \\\\ 60 &= 5x && \\mid :5 \\\\ 12 &= x \\end{aligned}'}</MB>
                  <MB>{'y = 25 \\cdot 12 + 80 = 380 \\qquad \\Rightarrow \\qquad S(12 \\mid 380)'}</MB>
                  <p>Nach 12 Monaten haben beide Studios 380 € gekostet. Danach ist Studio A günstiger.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>
                      Welcher Betrag fällt nur einmal an, welcher jeden Monat neu? Der einmalige Betrag ist <M>t</M>, der monatliche ist <M>m</M>.
                    </>,
                    <>
                      A: <M>{'y = 25x + 80'}</M>. Stelle B genauso auf und setze beide rechten Seiten gleich. Ziehe dann das kleinere x ab (<M>{'\\mid -25x'}</M>).
                    </>,
                    <>
                      <M>{'25x + 80 = 30x + 20 \\;\\Rightarrow\\; 80 = 5x + 20 \\;\\Rightarrow\\; 60 = 5x'}</M>. Jetzt noch durch 5 teilen und x in A einsetzen.
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Übung 3: Umgekehrt gedacht"
              level="erweiterung"
              prompt={
                <p>
                  Fahrschule B will ihren Grundbetrag so ändern, dass beide Fahrschulen erst bei <strong>20 Fahrstunden</strong> gleich teuer sind. Der Preis pro Stunde (70 €)
                  bleibt. Welchen Grundbetrag muss B dann verlangen?
                </p>
              }
              fields={[{ kind: 'num', key: 't', label: 'Neuer Grundbetrag von B', expected: 250, unit: '€' }]}
              solution={
                <>
                  <p>
                    Im Schnittpunkt ist <M>{'x = 20'}</M>. Bei 20 Stunden kostet A <M>{'60 \\cdot 20 + 450 = 1650'}</M> €. B soll dann genauso viel kosten:
                  </p>
                  <MB>{'\\begin{aligned} 70 \\cdot 20 + t &= 1650 \\\\ 1400 + t &= 1650 && \\mid -1400 \\\\ t &= 250 \\end{aligned}'}</MB>
                  <p>B muss also 250 € Grundbetrag verlangen, 50 € weniger als bisher.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal kennst du den x-Wert des Schnittpunkts schon: 20 Stunden. Was kostet A bei 20 Stunden?</>,
                    <>
                      Im Schnittpunkt kosten beide gleich viel. Setze <M>{'x = 20'}</M> in die Gleichung von B ein, der Grundbetrag <M>t</M> ist die Unbekannte:{' '}
                      <M>{'y = 70 \\cdot 20 + t'}</M>
                    </>,
                    <>
                      A kostet <M>{'60 \\cdot 20 + 450 = 1650'}</M> €. Also gilt <M>{'1400 + t = 1650'}</M>. Jetzt nur noch nach <M>t</M> auflösen.
                    </>,
                  ]}
                />
              }
            />
          </div>
        </Phase>

        {/* 7 Check */}
        <Phase no={7} title="Check: Hast du es verstanden?" social="EA" minutes={6}>
          <div className="lp-exlist">
            <TrackedMc
              topic="Schnittpunkt-Einstieg: Bedeutung (Basis)"
              title="Check 1: Was bedeutet der Schnittpunkt?"
              level="basis"
              prompt={
                <p>
                  Für die beiden Fahrschulen gilt <M>{'S(15 \\mid 1350)'}</M>. Was bedeutet das?
                </p>
              }
              options={[
                { text: 'Bei 1350 Fahrstunden kosten beide Fahrschulen 15 €.', feedback: 'Hier sind x und y vertauscht: Zuerst steht der x-Wert (Fahrstunden), dann der y-Wert (Kosten).' },
                { text: 'Bei 15 Fahrstunden kosten beide Fahrschulen 1350 €.', correct: true, feedback: 'x = 15 Fahrstunden, y = 1350 € Kosten, und zwar bei beiden.' },
                { text: 'Ab 15 Fahrstunden ist Fahrschule B günstiger.', feedback: 'Prüfe die Richtung: Bei 20 Stunden kostet B 1700 €, A nur 1650 €. Ab 15 Stunden ist also A günstiger.' },
                { text: 'B ist immer günstiger, weil der Grundbetrag kleiner ist.', feedback: 'B startet zwar günstiger, wird aber pro Stunde schneller teurer. Nach 15 Stunden hat A sie eingeholt.' },
              ]}
            />
            <TrackedMc
              topic="Schnittpunkt-Einstieg: Gleichsetzen (Standard)"
              title="Check 2: Schnittpunkt berechnen"
              level="standard"
              prompt={
                <>
                  <p>Berechne den Schnittpunkt der beiden Geraden im Heft und wähle dann aus.</p>
                  <MB>{'f(x) = 2x + 1 \\qquad g(x) = -x + 7'}</MB>
                </>
              }
              options={[
                { text: <M>{'x = 2'}</M>, feedback: 'Der x-Wert stimmt, aber ein Schnittpunkt hat zwei Koordinaten. Setze x = 2 noch in f(x) ein.' },
                { text: <M>{'S(5 \\mid 2)'}</M>, feedback: 'Die Zahlen stimmen, aber x und y sind vertauscht. Zuerst kommt der x-Wert.' },
                { text: <M>{'S(6 \\mid 13)'}</M>, feedback: 'Beim Umstellen ist ein Vorzeichen verloren gegangen: Aus 2x + 1 = −x + 7 wird mit +x die Gleichung 3x + 1 = 7.' },
                { text: <M>{'S(2 \\mid 5)'}</M>, correct: true, feedback: '2x + 1 = −x + 7 ergibt 3x = 6, also x = 2 und y = 2 · 2 + 1 = 5.' },
              ]}
            />
            <TrackedCheck
              topic="Schnittpunkt-Einstieg: Gleichsetzen (Erweiterung)"
              title="Check 3: Jetzt ganz allein"
              level="erweiterung"
              prompt={
                <>
                  <p>Berechne den Schnittpunkt durch Gleichsetzen.</p>
                  <MB>{'f(x) = 3x - 2 \\qquad g(x) = x + 4'}</MB>
                </>
              }
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 3 },
                { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 7 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 3x - 2 &= x + 4 && \\mid -x \\\\ 2x - 2 &= 4 && \\mid +2 \\\\ 2x &= 6 && \\mid :2 \\\\ x &= 3 \\end{aligned}'}</MB>
                  <MB>{'y = 3 \\cdot 3 - 2 = 7 \\qquad \\Rightarrow \\qquad S(3 \\mid 7)'}</MB>
                  <p>
                    Probe mit <M>{'g'}</M>: <M>{'3 + 4 = 7'}</M>. Stimmt!
                  </p>
                </>
              }
            />
          </div>
        </Phase>

        <nav className="lp-nav" aria-label="Weiter">
          <button type="button" className="bk-btn" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
          <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
            Weiter üben: Schnittpunkt berechnen (Einfach) <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ pred }: { pred: Prediction }) {
  if (!pred.saved || !pred.choice) {
    return (
      <div className="ls-back">
        <p>
          Du hast in Abschnitt 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.
        </p>
      </div>
    )
  }
  const h = pred.hours
  const a = kostenA(h)
  const b = kostenB(h)
  const best = a < b ? 'A' : b < a ? 'B' : null
  let verdict: ReactNode
  if (pred.choice === 'kommt') verdict = <>Genau so ist es: Die günstigere Fahrschule hängt davon ab, wie viele Stunden man braucht. Die Grenze liegt bei 15 Stunden.</>
  else if (pred.choice === best)
    verdict = (
      <>
        Für dich passt das. Aber Vorsicht: Wer {best === 'A' ? 'weniger' : 'mehr'} als 15 Stunden braucht, fährt mit der anderen Fahrschule günstiger. Eine allgemeine Antwort ist
        also „Es kommt darauf an“.
      </>
    )
  else
    verdict = (
      <>
        Bei deiner Stundenzahl stimmt das nicht. Fahrschule {pred.choice} ist nur günstiger, wenn man {pred.choice === 'A' ? 'mehr' : 'weniger'} als 15 Stunden braucht.
      </>
    )

  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}. Du schätzt, dass du etwa <strong>{h} Fahrstunden</strong> brauchst.
      </p>
      <p>
        Bei {h} Stunden kostet A <strong>{euro(a)}</strong> und B <strong>{euro(b)}</strong>.{' '}
        {best ? (
          <>
            Für dich lohnt sich also <strong>Fahrschule {best}</strong> (Ersparnis: {euro(Math.abs(a - b))}).
          </>
        ) : (
          <>Beide kosten für dich genau gleich viel.</>
        )}
      </p>
      <p>{verdict}</p>
    </div>
  )
}
