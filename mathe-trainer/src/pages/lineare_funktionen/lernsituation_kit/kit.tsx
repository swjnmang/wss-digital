import { createContext, useContext, useEffect, useId, useRef, useState, type ChangeEvent, type FocusEvent, type ReactNode } from 'react'
import { InlineMath } from 'react-katex'
import { useTaskTracking } from '../../../hooks/useTaskTracking'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { checkNumber, fmt, pick } from '../../daten_und_zufall/lernpfad/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './kit.css'

// Gemeinsame Bausteine der Einstiegs-Lernsituationen (Schnittpunkt, Nullstellen …). Die vier festen Phasen stehen in phasen.tsx.
// Hier: Sozialformen, Niveaustufen, gestufte Hilfen, Aufgabenkarten mit automatischer Prüfung je Feld, Auswahlaufgaben mit Prüfen
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

/** true, sobald die SuS in der Startbox bestätigt haben, alle Rechenschritte im Heft festzuhalten (SeitenLernsituation).
 *  Dann entfällt der Heft-Hinweis an den einzelnen Aufgaben. */
export const HeftBestaetigtCtx = createContext(false)

/** Hinweis an einer Rechenaufgabe: erst im Heft rechnen, dann eintragen (entfällt nach der Bestätigung in der Startbox) */
export function HeftHinweis({ children }: { children?: ReactNode }) {
  const bestaetigt = useContext(HeftBestaetigtCtx)
  if (bestaetigt) return null
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

// Hilfen je Rechenschritt: Die SuS wählen den Schritt, bei dem sie hängen; es ist immer nur eine Hilfe offen.
export function SchrittHilfen({ schritte }: { schritte: { kurz: ReactNode; titel: ReactNode; hilfe: ReactNode }[] }) {
  const [offen, setOffen] = useState<number | null>(null)
  return (
    <div className="ls-help ls-help-schritte">
      <div className="ls-help-wahl">
        <span>Hilfe zu:</span>
        {schritte.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`bk-btn bk-btn-sm ${offen === i ? 'bk-btn-primary' : ''}`}
            aria-pressed={offen === i}
            onClick={() => setOffen(offen === i ? null : i)}
          >
            {s.kurz}
          </button>
        ))}
      </div>
      {offen !== null && (
        <div className="ls-help-card">
          <div className="ls-help-card-title">Hilfe: {schritte[offen].titel}</div>
          {schritte[offen].hilfe}
        </div>
      )}
    </div>
  )
}

type Tracking = { onInput: () => void; onCheck: (ok: boolean) => void; onHintShown: () => void }
const NO_TRACKING: Tracking = { onInput: () => {}, onCheck: () => {}, onHintShown: () => {} }

const TIPP_PAUSE_MS = 1200

/**
 * Automatische Prüfung je Feld (ohne Prüfen-Button): Ein richtiger Wert wird sofort grün,
 * ein falscher nach einer kurzen Tipp-Pause oder beim Verlassen des Feldes rot.
 * Sobald alle Felder richtig sind, kommt das Lob und onSolved wird aufgerufen.
 */
export function useLiveCheck(
  felder: { key: string; pruefe: (v: string) => boolean | undefined; sofort?: boolean }[],
  { onSolved, tracking = NO_TRACKING }: { onSolved?: () => void; tracking?: Tracking } = {},
) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [marks, setMarks] = useState<Record<string, boolean | undefined>>({})
  const [status, setStatus] = useState<'idle' | 'ok' | 'no'>('idle')
  const [praise, setPraise] = useState(PRAISE[0])
  const [malFalsch, setMalFalsch] = useState(false)
  const timer = useRef<Record<string, number>>({})
  const letzte = useRef('')

  useEffect(() => () => Object.values(timer.current).forEach((t) => window.clearTimeout(t)), [])

  const pruefe = (key: string, v: string) => felder.find((f) => f.key === key)?.pruefe(v)
  const markiere = (key: string, m: boolean | undefined) => setMarks((p) => (p[key] === m ? p : { ...p, [key]: m }))

  const setValue = (key: string, v: string) => {
    setValues((p) => ({ ...p, [key]: v }))
    tracking.onInput()
    window.clearTimeout(timer.current[key])
    const m = pruefe(key, v)
    if (m === true || felder.find((f) => f.key === key)?.sofort) return markiere(key, m)
    markiere(key, undefined)
    if (m === false) timer.current[key] = window.setTimeout(() => markiere(key, false), TIPP_PAUSE_MS)
  }
  const blur = (key: string, v: string) => {
    window.clearTimeout(timer.current[key])
    markiere(key, pruefe(key, v))
  }

  useEffect(() => {
    const alle = felder.every((f) => marks[f.key] !== undefined)
    const falsch = felder.some((f) => marks[f.key] === false)
    const ok = alle && !falsch
    setStatus(ok ? 'ok' : falsch ? 'no' : 'idle')
    if (falsch) setMalFalsch(true)
    const sig = JSON.stringify(felder.map((f) => marks[f.key] ?? null))
    if (alle && sig !== letzte.current) {
      letzte.current = sig
      tracking.onCheck(ok)
      if (ok) {
        setPraise(pick(PRAISE))
        onSolved?.()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks])

  return { values, marks, status, praise, malFalsch, setValue, blur }
}

type NumField = { kind: 'num'; key: string; label: ReactNode; expected: number; unit?: string; tol?: number }

/** Teil einer Lückenrechnung: TeX-Text oder eine Lücke (Schlüssel eines Zahlenfelds der Karte) */
export type Seg = string | { luecke: string; breit?: boolean }
/** Zeile einer Lückenrechnung: linke Seite = rechte Seite, optional mit Umformung (TeX, z. B. '\\mid -3') */
export type Zeile = { l: Seg[]; r: Seg[]; u?: string }
type SelectField = { kind: 'select'; key: string; label: ReactNode; options: string[]; expected: number }
type CField = NumField | SelectField

/** Aufgabenkarte mit Zahlenfeldern / Auswahllisten: jedes Feld prüft sich selbst (richtig sofort grün, falsch nach kurzer Pause rot), Lob und Lösungsweg */
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
  onSolved,
  loesungNachFehler = false,
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
  /** Wird aufgerufen, sobald alle Felder richtig sind (z. B. um in der Seitenansicht „Weiter“ freizuschalten) */
  onSolved?: () => void
  /** Lösungsweg erst anbieten, nachdem einmal falsch geprüft wurde (eigene Rechnung ohne Vorstrukturierung) */
  loesungNachFehler?: boolean
}) {
  const uid = useId()
  const [showSolution, setShowSolution] = useState(false)
  const { values, marks, status, praise, malFalsch, setValue, blur } = useLiveCheck(
    fields.map((f) => ({
      key: f.key,
      sofort: f.kind === 'select',
      pruefe: (v: string) => (f.kind === 'select' ? (v === '' ? undefined : Number(v) === f.expected) : checkNumber(v, f.expected, f.tol)),
    })),
    { onSolved, tracking },
  )

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
        onBlur={(e: FocusEvent<HTMLInputElement>) => blur(f.key, e.currentTarget.value)}
      />
    )
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
                    onBlur={(e: FocusEvent<HTMLInputElement>) => blur(f.key, e.currentTarget.value)}
                  />
                  {f.unit && <span className="lp-unit">{f.unit}</span>}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {solution && (!loesungNachFehler || malFalsch || status === 'ok') && (
        <div className="bk-actions lp-ex-actions">
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
        </div>
      )}
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
        <span>{wrongText ?? 'Leider noch nicht ganz richtig. Die roten Felder stimmen noch nicht – rechne sie noch einmal nach.'}</span>
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
  onSolved,
}: {
  title: ReactNode
  level?: Level
  prompt: ReactNode
  options: McOption[]
  /** Auswahl erst nach einer Rechnung: Heft-Hinweis anzeigen */
  rechnen?: boolean
  tracking?: Tracking
  /** Wird aufgerufen, sobald die richtige Antwort geprüft wurde */
  onSolved?: () => void
}) {
  const uid = useId()
  // Regel aus dem Lernsituationen-Skill: Antwort A ist nie die richtige.
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV && options[0]?.correct) console.warn('McCard: Die erste Antwort (A) darf nicht die richtige sein.', title)
  const [choice, setChoice] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'no' | 'empty'>('idle')
  const [praise, setPraise] = useState(PRAISE[0])

  const check = () => {
    if (choice === null) return setStatus('empty')
    const ok = !!options[choice].correct
    setStatus(ok ? 'ok' : 'no')
    if (ok) {
      setPraise(pick(PRAISE))
      onSolved?.()
    }
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
          <i className="fa-solid fa-circle-check" aria-hidden="true" />{' '}
          <span>
            {praise} {options[choice].feedback}
          </span>
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

