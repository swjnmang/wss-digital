import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import TaskShell from '../../components/layout/TaskShell'
import { X_COL, Y_COL, originPath } from '../../components/CoordSystem'
import { CoordSystem, M, PlotTask, fmtN, pick, stepsX, stepsY } from './punktkoordinaten/shared'
import type { Level, Result } from './punktkoordinaten/shared'
import { Task } from './punktkoordinaten/tasks'
import type { Kind } from './punktkoordinaten/tasks'

// Kapitel "Punktkoordinaten verstehen": Koordinaten ablesen, Punkte einzeichnen, x und y nicht verwechseln.
// Aufgabenlogik: punktkoordinaten/shared.tsx (Aufgabentypen) und punktkoordinaten/tasks.tsx (Generatoren).

type StepId = 'erklaerung' | 'lesen' | 'zeichnen' | 'xy' | 'achsen' | 'fehler' | 'schatz' | 'test'

const STEPS: { id: StepId; label: string; goal: number }[] = [
  { id: 'erklaerung', label: 'Erklärung', goal: 1 },
  { id: 'lesen', label: 'Ablesen', goal: 5 },
  { id: 'zeichnen', label: 'Einzeichnen', goal: 6 },
  { id: 'xy', label: 'x oder y?', goal: 5 },
  { id: 'achsen', label: 'Achsen & Quadranten', goal: 5 },
  { id: 'fehler', label: 'Fehler finden', goal: 3 },
  { id: 'schatz', label: 'Schatzkarte', goal: 5 },
  { id: 'test', label: 'Abschlusstest', goal: 10 },
]

const QUADS: { n: 1 | 2 | 3 | 4; roman: string; signs: string; where: string; text: string }[] = [
  { n: 1, roman: 'I', signs: '(+|+)', where: 'rechts oben', text: 'x positiv, y positiv' },
  { n: 2, roman: 'II', signs: '(−|+)', where: 'links oben', text: 'x negativ, y positiv' },
  { n: 3, roman: 'III', signs: '(−|−)', where: 'links unten', text: 'x negativ, y negativ' },
  { n: 4, roman: 'IV', signs: '(+|−)', where: 'rechts unten', text: 'x positiv, y negativ' },
]

// ---------------------------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------------------------

function Frame({ title, intro, goal, score, children }: { title: string; intro: ReactNode; goal?: number; score?: number; children: ReactNode }) {
  const done = goal ? Math.min(score ?? 0, goal) : 0
  return (
    <div className="bk-stack">
      <div className="bk-panel">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--ink)' }}>{intro}</p>
        {goal ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm font-bold mb-1">
              <span>
                Ziel: {goal} Aufgaben lösen
              </span>
              <span>
                {done} / {goal} {done >= goal ? '⭐' : ''}
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
              <div style={{ width: `${(done / goal) * 100}%`, height: '100%', background: 'var(--correct)', transition: 'width .3s' }} />
            </div>
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function LevelPicker({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <div className="bk-seg">
      <button type="button" onClick={() => onChange('q1')} className={`bk-seg-btn ${value === 'q1' ? 'bk-seg-btn-on' : ''}`}>
        Stufe 1: nur Quadrant I
      </button>
      <button type="button" onClick={() => onChange('all')} className={`bk-seg-btn ${value === 'all' ? 'bk-seg-btn-on' : ''}`}>
        Stufe 2: alle vier Quadranten
      </button>
    </div>
  )
}

/** Endlos neue Aufgaben der angegebenen Arten; jede gelöste Aufgabe zählt einen Punkt. */
function Practice({ kinds, level, guides, onScore }: { kinds: Kind[]; level: Level; guides?: boolean; onScore: () => void }) {
  const [n, setN] = useState(0)
  const prev = useRef<Kind | null>(null)
  const kind = useMemo(() => {
    const options = kinds.length > 1 ? kinds.filter((k) => k !== prev.current) : kinds
    const k = pick(options)
    prev.current = k
    return k
  }, [n])
  return <Task key={n} kind={kind} level={level} guides={guides} onDone={onScore} onNext={() => setN(n + 1)} />
}

function Stepper({ label, color, value, onChange }: { label: string; color: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-bold text-xl" style={{ color }}>
        {label} =
      </span>
      <button type="button" className="bk-seg-btn" style={{ minHeight: 40, padding: '0 14px' }} onClick={() => onChange(Math.max(-5, value - 1))} aria-label={`${label} verkleinern`}>
        −
      </button>
      <span className="font-bold text-xl text-center" style={{ minWidth: 32 }}>
        {fmtN(value)}
      </span>
      <button type="button" className="bk-seg-btn" style={{ minHeight: 40, padding: '0 14px' }} onClick={() => onChange(Math.min(5, value + 1))} aria-label={`${label} vergrößern`}>
        +
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Schritt 1: Erklärung
// ---------------------------------------------------------------------------------------------

function Erklaerung({ onScore }: { onScore: () => void }) {
  const [quad, setQuad] = useState<1 | 2 | 3 | 4 | null>(null)
  const [dx, setDx] = useState(3)
  const [dy, setDy] = useState(2)
  const p = { x: dx, y: dy }
  const q = QUADS.find((e) => e.n === quad)

  useEffect(() => {
    onScore()
  }, [])

  return (
    <div className="bk-stack">
      <div className="bk-panel">
        <h2 className="text-lg font-bold mb-3">So ist das Koordinatensystem aufgebaut</h2>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <CoordSystem quadrantLabels shade={quad} />
          <div className="bk-stack" style={{ gap: 10 }}>
            <p>
              <b style={{ color: X_COL }}>x-Achse:</b> waagrecht, nach rechts wird x größer.
            </p>
            <p>
              <b style={{ color: Y_COL }}>y-Achse:</b> senkrecht, nach oben wird y größer.
            </p>
            <p>
              <b>Ursprung:</b> Hier schneiden sich die Achsen. Er hat die Koordinaten <M t="O(0\,|\,0)" />.
            </p>
            <p>
              <b>Quadranten:</b> Die Achsen teilen das Koordinatensystem in vier Teile, die gegen den Uhrzeigersinn von I bis IV nummeriert sind. Tippe auf einen Quadranten:
            </p>
            <div className="bk-seg">
              {QUADS.map((e) => (
                <button key={e.n} type="button" onClick={() => setQuad(quad === e.n ? null : e.n)} className={`bk-seg-btn ${quad === e.n ? 'bk-seg-btn-on' : ''}`}>
                  {e.roman}
                </button>
              ))}
            </div>
            {q && (
              <div className="bk-feedback bk-feedback-info">
                <span>
                  Quadrant {q.roman} liegt {q.where}. Hier gilt: {q.text}, also <M t={`(${q.signs.slice(1, -1).replace('|', '\\,|\\,')})`} />.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bk-panel">
        <h2 className="text-lg font-bold mb-1">
          Ein Punkt hat zwei Koordinaten: <M t="P(x\,|\,y)" />
        </h2>
        <p className="mb-4">
          Die Reihenfolge ist fest: <b style={{ color: X_COL }}>zuerst x</b>, <b style={{ color: Y_COL }}>dann y</b>. Der senkrechte Strich | trennt die beiden Werte.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-5">
          <div className="bk-taskbox">
            <p className="font-bold mb-1">🏠 Erst zur Tür, dann die Treppe hoch</p>
            <p style={{ fontSize: 15 }}>
              Du gehst zuerst <b style={{ color: X_COL }}>waagrecht</b> zur Haustür (x). Danach gehst du <b style={{ color: Y_COL }}>senkrecht</b> die Treppe hinauf (y).
            </p>
          </div>
          <div className="bk-taskbox">
            <p className="font-bold mb-1">🔤 x kommt vor y</p>
            <p style={{ fontSize: 15 }}>
              Im Alphabet steht x vor y. Genauso steht in der Klammer immer erst der x-Wert und danach der y-Wert.
            </p>
          </div>
          <div className="bk-taskbox">
            <p className="font-bold mb-1">➕ Rechts und oben ist plus</p>
            <p style={{ fontSize: 15 }}>
              Nach <b>rechts</b> und nach <b>oben</b> sind die Werte positiv. Nach <b>links</b> und nach <b>unten</b> sind sie negativ.
            </p>
          </div>
        </div>

        <p className="font-bold mb-2">Probiere es aus: Stelle x und y ein und beobachte den Weg.</p>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <CoordSystem points={[{ ...p, label: 'P', color: '#1e293b' }]} segments={originPath(p)} />
          <div className="bk-stack" style={{ gap: 12 }}>
            <Stepper label="x" color={X_COL} value={dx} onChange={setDx} />
            <Stepper label="y" color={Y_COL} value={dy} onChange={setDy} />
            <div className="bk-taskbox">
              <p>
                1. Starte im Ursprung <M t="O(0\,|\,0)" />.
              </p>
              <p>
                2. <b style={{ color: X_COL }}>x = {fmtN(dx)}:</b> Gehe {stepsX(dx)}.
              </p>
              <p>
                3. <b style={{ color: Y_COL }}>y = {fmtN(dy)}:</b> Gehe {stepsY(dy)}.
              </p>
              <p className="mt-1">
                Du landest bei <M t={`P(${dx}\\,|\\,${dy})`} />.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bk-panel">
        <h2 className="text-lg font-bold mb-2">Merke</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Ein Punkt wird als <M t="P(x\,|\,y)" /> geschrieben: <b>erst x (waagrecht), dann y (senkrecht)</b>.
          </li>
          <li>
            Rechts und oben ist <b>+</b>, links und unten ist <b>−</b>.
          </li>
          <li>
            Auf der x-Achse ist <M t="y = 0" />, auf der y-Achse ist <M t="x = 0" />.
          </li>
          <li>
            Der Ursprung ist <M t="O(0\,|\,0)" />.
          </li>
        </ul>
        <p className="mt-3">Auf dieser Seite sind x immer blau und y immer orange. Das hilft dir beim Merken. Weiter geht es mit dem Ablesen.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Schritte 2-7: Übungen
// ---------------------------------------------------------------------------------------------

function Lesen({ score, onScore }: { score: number; onScore: () => void }) {
  const [level, setLevel] = useState<Level>('q1')
  const [guides, setGuides] = useState(true)
  return (
    <Frame
      title="Koordinaten ablesen"
      intro="Ein Punkt ist eingezeichnet. Lies zuerst den x-Wert ab (waagrecht), dann den y-Wert (senkrecht). Die gestrichelten Hilfslinien zeigen dir, wo du auf den Achsen ablesen musst."
      goal={5}
      score={score}
    >
      <div className="bk-actions">
        <LevelPicker value={level} onChange={setLevel} />
        <button type="button" onClick={() => setGuides(!guides)} className={`bk-seg-btn ${guides ? 'bk-seg-btn-on' : ''}`}>
          Hilfslinien {guides ? 'an' : 'aus'}
        </button>
      </div>
      <Practice key={`${level}-${guides}`} kinds={['read']} level={level} guides={guides} onScore={onScore} />
    </Frame>
  )
}

function PlotRound({ level, onScore }: { level: Level; onScore: () => void }) {
  const [round, setRound] = useState(0)
  return <PlotRoundInner key={round} level={level} onScore={onScore} onAgain={() => setRound(round + 1)} />
}

function PlotRoundInner({ level, onScore, onAgain }: { level: Level; onScore: () => void; onAgain: () => void }) {
  const [targets] = useState(() => {
    // Drei Punkte, die nicht auf einer Geraden liegen, damit ein Dreieck entsteht
    for (;;) {
      const arr = [] as { x: number; y: number }[]
      while (arr.length < 3) {
        const x = level === 'q1' ? 1 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 11) - 5
        const y = level === 'q1' ? 1 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 11) - 5
        if (x === 0 || y === 0 || x === y || arr.some((t) => t.x === x && t.y === y)) continue
        arr.push({ x, y })
      }
      const [a, b, c] = arr
      if ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) !== 0) return arr
    }
  })
  const names = ['A', 'B', 'C']
  const [idx, setIdx] = useState(0)

  if (idx >= 3) {
    return (
      <div className="bk-panel bk-stack">
        <p className="bk-taskbox-strong">Geschafft! Die Punkte A, B und C bilden ein Dreieck.</p>
        <CoordSystem points={targets.map((t, i) => ({ ...t, label: names[i], color: '#16a34a' }))} polygon={targets} />
        <div className="bk-actions">
          <button type="button" onClick={onAgain} className="bk-btn bk-btn-primary">
            Neue Runde
          </button>
        </div>
      </div>
    )
  }

  const placed = targets.slice(0, idx).map((t, i) => ({ ...t, label: names[i], color: '#16a34a' }))
  return (
    <TaskPlot
      key={idx}
      name={names[idx]}
      target={targets[idx]}
      placed={placed}
      counter={`Punkt ${idx + 1} von 3`}
      onDone={onScore}
      onNext={() => setIdx(idx + 1)}
      nextLabel={idx < 2 ? 'Nächster Punkt' : 'Fertig'}
    />
  )
}

const TaskPlot = (props: Omit<ComponentProps<typeof PlotTask>, 'topic'>) => <PlotTask topic="Punktkoordinaten – Einzeichnen" {...props} />

function Zeichnen({ score, onScore }: { score: number; onScore: () => void }) {
  const [level, setLevel] = useState<Level>('q1')
  return (
    <Frame
      title="Punkte einzeichnen"
      intro="Du bekommst Koordinaten und tippst auf die richtige Stelle im Koordinatensystem. Gehe immer erst waagrecht (x) und dann senkrecht (y). Bei einem Fehler erfährst du, was schiefgelaufen ist."
      goal={6}
      score={score}
    >
      <LevelPicker value={level} onChange={setLevel} />
      <PlotRound key={level} level={level} onScore={onScore} />
    </Frame>
  )
}

function XY({ score, onScore }: { score: number; onScore: () => void }) {
  const [level, setLevel] = useState<Level>('q1')
  return (
    <Frame
      title="x oder y? Nicht mehr verwechseln"
      intro="Hier lernst du, den häufigsten Fehler zu vermeiden. Zu jedem Punkt gibt es eine Antwort, bei der x und y vertauscht sind. Erst x (waagrecht), dann y (senkrecht)!"
      goal={5}
      score={score}
    >
      <LevelPicker value={level} onChange={setLevel} />
      <Practice key={level} kinds={['whichSystem', 'whichCoords']} level={level} onScore={onScore} />
    </Frame>
  )
}

function Achsen({ score, onScore }: { score: number; onScore: () => void }) {
  return (
    <Frame
      title="Achsen und Quadranten"
      intro="Punkte auf den Achsen und die vier Quadranten: Mit den Vorzeichen von x und y weißt du sofort, wo ein Punkt liegt."
      goal={5}
      score={score}
    >
      <Practice kinds={['quadrant', 'axisWhich', 'axisValue', 'axisPlot']} level="all" onScore={onScore} />
    </Frame>
  )
}

function Fehler({ score, onScore }: { score: number; onScore: () => void }) {
  return (
    <Frame
      title="Fehler finden"
      intro="Vier Punkte sollten eingezeichnet werden, aber einer ist falsch. Prüfe jeden Punkt: erst x waagrecht, dann y senkrecht. Danach bestimmst du, wo der falsche Punkt wirklich liegt."
      goal={3}
      score={score}
    >
      <Practice kinds={['error']} level="all" onScore={onScore} />
    </Frame>
  )
}

function Schatz({ score, onScore }: { score: number; onScore: () => void }) {
  return (
    <Frame
      title="Anwendung: Die Schatzkarte"
      intro="Auf der Karte der Schatzinsel ist jeder Ort ein Punkt im Koordinatensystem. Lies Orte ab, finde Orte zu Koordinaten und folge Wegbeschreibungen bis zum Ziel."
      goal={5}
      score={score}
    >
      <Practice kinds={['mapRead', 'mapWhich', 'walk']} level="all" onScore={onScore} />
    </Frame>
  )
}

// ---------------------------------------------------------------------------------------------
// Schritt 8: Abschlusstest
// ---------------------------------------------------------------------------------------------

const TEST_KINDS: { kind: Kind; label: string; step: StepId }[] = [
  { kind: 'read', label: 'Punkt ablesen', step: 'lesen' },
  { kind: 'read', label: 'Punkt ablesen', step: 'lesen' },
  { kind: 'plot', label: 'Punkt einzeichnen', step: 'zeichnen' },
  { kind: 'plot', label: 'Punkt einzeichnen', step: 'zeichnen' },
  { kind: 'whichSystem', label: 'Richtiges Koordinatensystem wählen', step: 'xy' },
  { kind: 'whichCoords', label: 'Koordinaten zum Punkt wählen', step: 'xy' },
  { kind: 'quadrant', label: 'Quadrant bestimmen', step: 'achsen' },
  { kind: 'axisWhich', label: 'Punkt auf der Achse erkennen', step: 'achsen' },
  { kind: 'error', label: 'Fehler finden', step: 'fehler' },
  { kind: 'walk', label: 'Weg auf der Schatzkarte', step: 'schatz' },
]

function Test({ score, onScore, goTo }: { score: number; onScore: () => void; goTo: (s: StepId) => void }) {
  const N = TEST_KINDS.length
  const [run, setRun] = useState(0)
  const [idx, setIdx] = useState(0)
  const [res, setRes] = useState<(Result | null)[]>(() => TEST_KINDS.map(() => null))

  const restart = () => {
    setRun(run + 1)
    setIdx(0)
    setRes(TEST_KINDS.map(() => null))
  }

  if (idx >= N) {
    const right = res.filter((r) => r?.firstTry).length
    const swaps = res.filter((r) => r?.swapped).length
    const weak = Array.from(new Set(TEST_KINDS.filter((_, i) => !res[i]?.firstTry).map((t) => t.step)))
    const verdict = right >= 9 ? 'Koordinaten-Profi! Du kannst jetzt mit den linearen Funktionen weitermachen.' : right >= 7 ? 'Sehr sicher! Wiederhole noch die Aufgaben, die nicht sofort geklappt haben.' : right >= 5 ? 'Du bist auf einem guten Weg. Übe die markierten Schritte noch einmal.' : 'Hier lohnt sich noch Übung. Beginne mit der Erklärung und den markierten Schritten.'
    return (
      <div className="bk-panel bk-stack">
        <h2 className="text-lg font-bold">Auswertung</h2>
        <p className="bk-taskbox-strong">
          {right} von {N} Aufgaben gleich beim ersten Versuch richtig
        </p>
        <p>{verdict}</p>
        {swaps > 0 && (
          <div className="bk-feedback bk-feedback-info">
            <span>
              Bei {swaps} {swaps === 1 ? 'Aufgabe' : 'Aufgaben'} hast du x und y verwechselt. Merke: erst zur Tür (x), dann die Treppe hoch (y). Der Schritt „x oder y?“ hilft dir dabei.
            </span>
          </div>
        )}
        <ul className="space-y-1">
          {TEST_KINDS.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <span aria-hidden="true">{res[i]?.firstTry ? '✅' : '❌'}</span>
              <span>
                Aufgabe {i + 1}: {t.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="bk-actions">
          {weak.map((s) => (
            <button key={s} type="button" className="bk-btn" onClick={() => goTo(s)}>
              Üben: {STEPS.find((e) => e.id === s)?.label}
            </button>
          ))}
          <button type="button" className="bk-btn bk-btn-primary" onClick={restart}>
            Test wiederholen
          </button>
        </div>
      </div>
    )
  }

  return (
    <Frame
      title="Abschlusstest"
      intro="Zehn gemischte Aufgaben mit allen vier Quadranten, ohne Lösungsweg. Gewertet wird, ob du gleich beim ersten Versuch richtig liegst."
      goal={N}
      score={score}
    >
      <p className="font-bold">
        Aufgabe {idx + 1} von {N}
      </p>
      <Task
        key={`${run}-${idx}`}
        kind={TEST_KINDS[idx].kind}
        level="all"
        guides={false}
        exam
        onDone={(r) => {
          setRes((old) => old.map((x, i) => (i === idx ? r : x)))
          onScore()
        }}
        onNext={() => setIdx(idx + 1)}
        nextLabel={idx === N - 1 ? 'Auswertung' : 'Weiter'}
      />
    </Frame>
  )
}

// ---------------------------------------------------------------------------------------------
// Seite
// ---------------------------------------------------------------------------------------------

export default function PunktKoordinaten() {
  const [step, setStep] = useState<StepId>('erklaerung')
  const [scores, setScores] = useState<Record<string, number>>({})
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const add = (id: StepId) => setScores((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }))
  const total = Object.entries(scores)
    .filter(([id]) => id !== 'erklaerung')
    .reduce((a, [, v]) => a + v, 0)
  const idx = STEPS.findIndex((s) => s.id === step)
  const score = scores[step] ?? 0
  const onScore = () => add(step)

  let content: ReactNode
  switch (step) {
    case 'erklaerung':
      content = <Erklaerung onScore={onScore} />
      break
    case 'lesen':
      content = <Lesen score={score} onScore={onScore} />
      break
    case 'zeichnen':
      content = <Zeichnen score={score} onScore={onScore} />
      break
    case 'xy':
      content = <XY score={score} onScore={onScore} />
      break
    case 'achsen':
      content = <Achsen score={score} onScore={onScore} />
      break
    case 'fehler':
      content = <Fehler score={score} onScore={onScore} />
      break
    case 'schatz':
      content = <Schatz score={score} onScore={onScore} />
      break
    case 'test':
      content = <Test score={score} onScore={onScore} goTo={setStep} />
      break
  }

  return (
    <TaskShell title="Punktkoordinaten verstehen" width="wide">
      <div className="bk-stack">
        <Link to="/lineare_funktionen" className="bk-btn bk-btn-ghost" style={{ marginLeft: -12, alignSelf: 'flex-start' }}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Übersicht
        </Link>
        <p style={{ color: 'var(--ink-muted)' }}>
          Bevor wir Geraden zeichnen, musst du Punkte sicher im Koordinatensystem finden. Hier übst du Schritt für Schritt: Koordinaten ablesen, Punkte einzeichnen und x und y nicht mehr verwechseln.
        </p>

        <div className="bk-actions">
          <div className="bk-seg">
            {STEPS.map((s, i) => {
              const done = (scores[s.id] ?? 0) >= s.goal
              return (
                <button key={s.id} type="button" onClick={() => setStep(s.id)} className={`bk-seg-btn ${step === s.id ? 'bk-seg-btn-on' : ''}`} aria-current={step === s.id ? 'step' : undefined}>
                  {done ? '✓ ' : `${i + 1} · `}
                  {s.label}
                </button>
              )
            })}
          </div>
          <span className="bk-streak">Punkte: {total}</span>
        </div>

        {content}

        <div className="bk-actions" style={{ justifyContent: 'space-between' }}>
          {idx > 0 ? (
            <button type="button" className="bk-btn" onClick={() => setStep(STEPS[idx - 1].id)}>
              ← {STEPS[idx - 1].label}
            </button>
          ) : (
            <span />
          )}
          {idx < STEPS.length - 1 ? (
            <button type="button" className="bk-btn bk-btn-primary" onClick={() => setStep(STEPS[idx + 1].id)}>
              Weiter: {STEPS[idx + 1].label} →
            </button>
          ) : (
            <Link to="/lineare_funktionen/was_ist_linear" className="bk-btn bk-btn-primary">
              Weiter: Was ist eine lineare Funktion? →
            </Link>
          )}
        </div>
      </div>
    </TaskShell>
  )
}
