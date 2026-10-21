import { createContext, useContext, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { InlineMath } from 'react-katex'
import { useTaskTracking } from '../../../hooks/useTaskTracking'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { checkNumber, fmt, pick } from '../../daten_und_zufall/lernpfad/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './kit.css'

// Gemeinsame Bausteine der Einstiegs-Lernsituationen (Schnittpunkt, Nullstellen …):
// Phasenkopf mit Sozialform und Zeit, Niveaustufen, gestufte Hilfen, Aufgabenkarten mit Prüfen, Auswahlaufgaben
// mit diagnostischem Feedback und der aufklappbare Infoteil der Übungsseite.

/** Infoteil der Übungsseite (Erklärung, Beispiel, Erklärvideo) */
export const ErklaerungCtx = createContext<ReactNode>(null)

/** Infoteil zum Aufklappen, z. B. in den Hilfen */
export function ErklaerungAufklappen({ label = 'Erklärung mit Video öffnen' }: { label?: string }) {
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


/** Zahl mit Komma für KaTeX */
export const tx = (v: number, d = 3) => fmt(v, d).replace(/\./g, '').replace(',', '{,}')

export const PRAISE = ['Super, richtig! 🎉', 'Klasse, genau so!', 'Stark, richtig gelöst! 💪', 'Perfekt, das stimmt!', 'Richtig! Weiter so!']

/* ── Arbeiten im Heft ─────────────────────────────────────────────────────── */
// Alles, was gerechnet wird, rechnen die SuS von Hand im Heft (Rechenweg und Ergebnis). Das Tablet dient nur zur Kontrolle.
// Rechen-Karten zeigen dafür automatisch den Heft-Hinweis; Karten ohne Rechnung (Regler, Ablesen, Auswählen) bekommen rechnen={false}.

/** Arbeitsregel oben auf jeder Lernsituation */
export function Arbeitsweise() {
  return (
    <div className="ls-arbeitsweise">
      <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
      <div>
        <strong>So arbeitest du:</strong> Alles, was du rechnest, rechnest du von Hand in deinem Heft, mit Rechenweg und Ergebnis. Erst dann trägst du das Ergebnis hier ein.
        Das Tablet nutzt du nur, um dein Ergebnis zu überprüfen. Beim Erkunden mit Reglern und Bildern musst du nichts aufschreiben.
      </div>
    </div>
  )
}

/** Hinweis an einer Rechenaufgabe: erst im Heft rechnen, dann eintragen */
export function HeftHinweis({ children }: { children?: ReactNode }) {
  return (
    <p className="ls-heft">
      <i className="fa-solid fa-pen" aria-hidden="true" />
      <span>{children ?? <><strong>Im Heft:</strong> Rechenweg und Ergebnis aufschreiben. Dann das Ergebnis hier eintragen und prüfen.</>}</span>
    </p>
  )
}

/* ── Kleine Bausteine ────────────────────────────────────────────────────── */

export type Social = 'EA' | 'PA' | 'GA' | 'Plenum'
export const SOCIAL: Record<Social, { label: string; icon: string }> = {
  EA: { label: 'Einzelarbeit', icon: 'fa-user' },
  PA: { label: 'Partnerarbeit', icon: 'fa-user-group' },
  GA: { label: 'Gruppenarbeit', icon: 'fa-people-group' },
  Plenum: { label: 'Klasse', icon: 'fa-users' },
}

export function Phase({ no, title, social, minutes, children }: { no: number; title: string; social: Social; minutes: number; children: ReactNode }) {
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

export type Level = 'basis' | 'standard' | 'erweiterung'
const LEVEL_TEXT: Record<Level, string> = { basis: 'Basis', standard: 'Standard', erweiterung: 'Erweiterung' }

export function LevelTag({ level }: { level: Level }) {
  return (
    <span className={`ls-level ls-level-${level}`}>
      {'★'.repeat(level === 'basis' ? 1 : level === 'standard' ? 2 : 3)} {LEVEL_TEXT[level]}
    </span>
  )
}

export function CardHead({ title, level }: { title: ReactNode; level?: Level }) {
  return (
    <div className="lp-ex-head">
      <h3 className="lp-ex-title">{title}</h3>
      {level && <LevelTag level={level} />}
    </div>
  )
}

/** Gestufte Hilfekarten: Denkanstoß → Strategie → erster Schritt, nacheinander aufdecken */
export function Hilfen({ steps }: { steps: [ReactNode, ReactNode, ReactNode] }) {
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

/** Teil einer Lückenrechnung: TeX-Text oder eine Lücke (Schlüssel eines Zahlenfelds der Karte) */
export type Seg = string | { luecke: string; breit?: boolean }
/** Zeile einer Lückenrechnung: linke Seite = rechte Seite, optional mit Umformung (TeX, z. B. '\\mid -3') */
export type Zeile = { l: Seg[]; r: Seg[]; u?: string }
type SelectField = { kind: 'select'; key: string; label: ReactNode; options: string[]; expected: number }
type CField = NumField | SelectField

/** Aufgabenkarte mit Zahlenfeldern / Auswahllisten, Prüfen, Lob und Lösungsweg */
export function CheckCard({
  title,
  level,
  prompt,
  lead,
  rechnung,
  fields,
  fieldsRow = false,
  solution,
  help,
  rechnen = true,
  tracking = NO_TRACKING,
}: {
  title: ReactNode
  level?: Level
  prompt: ReactNode
  /** Gleichung o. Ä., die direkt vor den Feldern in derselben Zeile steht */
  lead?: ReactNode
  /** Rechnung mit Lücken: Die Zahlenfelder, auf die eine Lücke verweist, stehen direkt in der Gleichung statt darunter */
  rechnung?: Zeile[]
  fields: CField[]
  /** Felder nebeneinander statt untereinander */
  fieldsRow?: boolean
  solution?: ReactNode
  /** Gestufte Hilfekarten unter der Aufgabe */
  help?: ReactNode
  /** Rechenaufgabe: Heft-Hinweis anzeigen (aus bei Ablesen, Ordnen, Auswählen) */
  rechnen?: boolean
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

  const inlineKeys = new Set((rechnung ?? []).flatMap((z) => [...z.l, ...z.r]).flatMap((seg) => (typeof seg === 'string' ? [] : [seg.luecke])))
  const listFields = fields.filter((f) => !inlineKeys.has(f.key))

  const segment = (seg: Seg, i: number) => {
    if (typeof seg === 'string') return <InlineMath key={i} math={seg} />
    const f = fields.find((x) => x.key === seg.luecke)
    if (!f) return null
    return (
      <input
        key={i}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="?"
        aria-label={typeof f.label === 'string' ? f.label : 'Lücke'}
        className={`bk-input lp-input ${seg.breit ? 'lp-input-md' : 'lp-input-sm'} ls-gap ${fieldCheckClass(marks[f.key])}`}
        value={values[f.key] ?? ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(f.key, e.target.value)}
      />
    )
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
      {rechnen && <HeftHinweis />}
      {rechnung && (
        <div className="ls-rechnung">
          {rechnung.map((z, i) => (
            <div key={i} className="ls-rechnung-zeile">
              <span className="ls-rechnung-l">{z.l.map(segment)}</span>
              <span className="ls-rechnung-r">
                <InlineMath math="=" /> {z.r.map(segment)}
              </span>
              <span className="ls-rechnung-u">{z.u && <InlineMath math={z.u} />}</span>
            </div>
          ))}
        </div>
      )}
      {(listFields.length > 0 || lead) && (
        <div className={`ls-fields ${fieldsRow || lead ? 'ls-fields-row' : ''}`}>
          {lead && <div className="ls-lead">{lead}</div>}
          {listFields.map((f) => (
            <div key={f.key} className="ls-field">
              <label className="ls-label" htmlFor={`${uid}-${f.key}`}>
                {f.label}
              </label>
              {f.kind === 'select' ? (
                <select
                  id={`${uid}-${f.key}`}
                  className={`bk-input lp-select ls-select ${fieldCheckClass(marks[f.key])}`}
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
      )}
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

export function Feedback({ status, praise, wrongText }: { status: 'idle' | 'ok' | 'no' | 'empty'; praise: string; wrongText?: ReactNode }) {
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
export function McCard({
  title,
  level,
  prompt,
  options,
  rechnen = false,
  tracking = NO_TRACKING,
}: {
  title: ReactNode
  level?: Level
  prompt: ReactNode
  options: McOption[]
  /** Auswahl erst nach einer Rechnung: Heft-Hinweis anzeigen */
  rechnen?: boolean
  tracking?: Tracking
}) {
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
      {rechnen && (
        <HeftHinweis>
          <strong>Im Heft:</strong> Erst selbst mit Rechenweg rechnen, dann die passende Antwort auswählen.
        </HeftHinweis>
      )}
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
export function TrackedMc(props: Omit<Parameters<typeof McCard>[0], 'tracking'> & { topic: string }) {
  const tracking = useTaskTracking(props.topic)
  return <McCard {...props} tracking={tracking} />
}
export function TrackedCheck(props: Omit<Parameters<typeof CheckCard>[0], 'tracking'> & { topic: string }) {
  const tracking = useTaskTracking(props.topic)
  return <CheckCard {...props} tracking={tracking} />
}

