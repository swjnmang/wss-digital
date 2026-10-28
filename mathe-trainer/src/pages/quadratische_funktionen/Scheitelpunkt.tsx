import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Q, val, parseAnswer, isIncomplete, Tex, GREEN, RED, PRAISE, pick, btnPrimary, btnSecondary, panel } from './quadratischShared'
import { VideoEmbed } from '../../components/VideoButton'
import TaskShell from '../../components/layout/TaskShell'
import EscapeEinstieg from './scheitelpunkt_einstieg/EscapeEinstieg'
import { useBackHandler } from '../../hooks/useBackHandler'
import { type Level, type Feld, LEVEL_LABEL, ANZAHL_AUFGABEN, neueAufgabe } from './scheitelpunkt_uebung/aufgaben'

// Sieben Aufgaben gleichzeitig auf der Seite, von geführt (Lückentext) bis frei (Sachaufgabe)
const TOTAL_TASKS = ANZAHL_AUFGABEN

const VIDEO_ID = 'Im1FRd6_o-w'

// ---------- Live-Auswertung einer Eingabe ----------

type AnswerStatus = 'idle' | 'right' | 'wrong'

// Brüche (z. B. 7/3) werden exakt verglichen, Dezimalzahlen müssen auf zwei Nachkommastellen stimmen.
function getStatus(input: string | undefined, correct: Q): AnswerStatus {
  if (!input || isIncomplete(input)) return 'idle'
  const parsed = parseAnswer(input)
  if (Number.isNaN(parsed)) return 'idle'
  return Math.abs(parsed - val(correct)) < 0.0051 ? 'right' : 'wrong'
}

const statusClass = (status: AnswerStatus) =>
  status === 'right' ? 'border-green-500 bg-green-50 text-green-800' : status === 'wrong' ? 'border-red-500 bg-red-50 text-red-800' : 'border-slate-300'

function NumInput({
  value,
  status,
  onChange,
  placeholder,
  readOnly,
  label,
}: {
  value: string
  status: AnswerStatus
  onChange: (v: string) => void
  placeholder?: string
  readOnly: boolean
  label: string
}) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className={`w-24 text-center border-2 rounded px-2 py-2 text-lg focus:outline-none transition-colors ${statusClass(status)}`}
      placeholder={placeholder}
      inputMode="decimal"
      aria-label={label}
    />
  )
}

/** Status jedes einzelnen Eingabefelds (Schlüssel wie in den Eingaben) mit passendem Tipp */
function auswerten(felder: Feld[], werte: Record<string, string>) {
  const liste: { key: string; status: AnswerStatus; hint: React.ReactNode }[] = []
  for (const feld of felder) {
    if (feld.kind === 'num') liste.push({ key: feld.id, status: getStatus(werte[feld.id], feld.correct), hint: feld.hint })
    else if (feld.kind === 'point') {
      liste.push({ key: `${feld.id}x`, status: getStatus(werte[`${feld.id}x`], feld.xs), hint: feld.hintX })
      liste.push({ key: `${feld.id}y`, status: getStatus(werte[`${feld.id}y`], feld.ys), hint: feld.hintY })
    } else {
      const w = werte[feld.id]
      liste.push({ key: feld.id, status: w === undefined ? 'idle' : Number(w) === feld.correct ? 'right' : 'wrong', hint: feld.hint })
    }
  }
  return liste
}

// ---------- Aufgabenkarte ----------

interface CardProps {
  number: number
  level: Level
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onHelp: () => void
}

function TaskCard({ number, level, onSolvedChange, onResult, onHelp }: CardProps) {
  const [aufgabe, setAufgabe] = useState(() => neueAufgabe(level, number - 1))
  const [werte, setWerte] = useState<Record<string, string>>({})
  const [solved, setSolved] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])
  const [showSolution, setShowSolution] = useState(false)
  // Lösung erst nach einem eigenen, falschen Versuch (bleibt danach für die Aufgabe freigeschaltet)
  const [triedWrong, setTriedWrong] = useState(false)

  const statusListe = auswerten(aufgabe.felder, werte)
  const status = Object.fromEntries(statusListe.map((s) => [s.key, s.status])) as Record<string, AnswerStatus>
  const allRight = statusListe.every((s) => s.status === 'right')
  const anyWrong = statusListe.some((s) => s.status === 'wrong')
  const allFilled = statusListe.every((s) => s.status !== 'idle')
  const ersterFehler = statusListe.find((s) => s.status === 'wrong')
  const werteKey = JSON.stringify(werte)

  useEffect(() => {
    if (anyWrong) setTriedWrong(true)
  }, [anyWrong])

  useEffect(() => {
    if (solved) return
    if (allRight) {
      setSolved(true)
      setPraise(pick(PRAISE))
      setShowSolution(false)
      onSolvedChange(true)
      onResult(true)
      return
    }
    // Falscher Versuch zählt erst, wenn alles ausgefüllt ist und die Eingabe kurz stehen bleibt
    if (anyWrong && allFilled) {
      const timer = setTimeout(() => onResult(false), 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [werteKey, solved])

  const setWert = (key: string, value: string) => setWerte((w) => ({ ...w, [key]: value }))

  function generateNewTask() {
    setAufgabe(neueAufgabe(level, number - 1))
    setWerte({})
    setSolved(false)
    setShowSolution(false)
    setTriedWrong(false)
    onSolvedChange(false)
  }

  function onShowSolution() {
    if (!triedWrong) return
    setShowSolution(true)
    onHelp()
  }

  const hatZahlenfeld = aufgabe.felder.some((f) => f.kind !== 'choice')

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Aufgabe {number}</h2>
      <p className="mb-3">
        <span className="inline-block bg-slate-100 text-slate-700 px-3 py-0.5 rounded-full text-sm font-semibold">{aufgabe.titel}</span>
      </p>
      {aufgabe.auftrag}

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
        {aufgabe.felder.map((feld) => {
          if (feld.kind === 'num') {
            return (
              <label key={feld.id} className={`flex flex-wrap items-center justify-center gap-2 text-lg text-slate-800 ${feld.kurz ? '' : 'w-full'}`}>
                <span>{feld.label}</span>
                <NumInput
                  value={werte[feld.id] ?? ''}
                  status={status[feld.id]}
                  onChange={(v) => setWert(feld.id, v)}
                  readOnly={solved}
                  label={typeof feld.label === 'string' ? feld.label : feld.id}
                />
                {feld.unit && <span>{feld.unit}</span>}
              </label>
            )
          }
          if (feld.kind === 'point') {
            return (
              <div key={feld.id} className="w-full flex items-center justify-center gap-2 text-2xl text-slate-800">
                <Tex tex="S\Big(" />
                <NumInput value={werte[`${feld.id}x`] ?? ''} status={status[`${feld.id}x`]} onChange={(v) => setWert(`${feld.id}x`, v)} placeholder="x" readOnly={solved} label="x-Koordinate des Scheitelpunkts" />
                <Tex tex="\Big|" />
                <NumInput value={werte[`${feld.id}y`] ?? ''} status={status[`${feld.id}y`]} onChange={(v) => setWert(`${feld.id}y`, v)} placeholder="y" readOnly={solved} label="y-Koordinate des Scheitelpunkts" />
                <Tex tex="\Big)" />
              </div>
            )
          }
          return (
            <div key={feld.id} className="w-full">
              <p className="font-semibold text-slate-800 mb-2">{feld.label}</p>
              <div className={feld.grafisch ? 'grid grid-cols-3 gap-2' : 'flex flex-wrap justify-center gap-2'}>
                {feld.options.map((opt, i) => {
                  const gewaehlt = werte[feld.id] === String(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={solved}
                      onClick={() => setWert(feld.id, String(i))}
                      aria-pressed={gewaehlt}
                      className={`border-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
                        gewaehlt ? statusClass(status[feld.id]) : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      } ${feld.grafisch ? 'px-1' : ''}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {solved ? (
        <p className="text-center font-bold mt-3 text-green-600">{praise}</p>
      ) : ersterFehler ? (
        <p className="text-center font-bold mt-3 text-red-600">{ersterFehler.hint}</p>
      ) : null}

      {hatZahlenfeld && !solved && (
        <p className="mt-3 text-sm text-slate-500">
          {level === 'fortgeschritten'
            ? 'Gib Brüche mit Schrägstrich ein (z. B. 7/3) oder als Dezimalzahl, auf zwei Nachkommastellen gerundet.'
            : 'Dezimalzahlen mit Komma eingeben, z. B. 2,5.'}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={generateNewTask} className={btnSecondary}>Neue Aufgabe</button>
        <button
          onClick={onShowSolution}
          disabled={!triedWrong}
          title={triedWrong ? undefined : 'Versuche die Aufgabe zuerst selbst.'}
          className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          Lösung anzeigen
        </button>
      </div>
      {!triedWrong && !solved && (
        <p className="mt-2 text-sm text-slate-500">Die Lösung kannst du dir anzeigen lassen, sobald du die Aufgabe selbst versucht hast.</p>
      )}

      {showSolution && aufgabe.loesung}
    </div>
  )
}

// ---------- Erklärung mit Beispiel (Graph + Rechnung) und Erklärvideo ----------

// Beispiel: f(x) = x² − 4x + 1  →  S(2 | −3)
const SX = 32 // Pixel pro Einheit
const X_MIN = -2, X_MAX = 6, Y_MIN = -4, Y_MAX = 6
const toPx = (x: number, y: number) => ({ px: (x - X_MIN) * SX, py: (Y_MAX - y) * SX })
const exampleF = (x: number) => x * x - 4 * x + 1

function ExampleGraph() {
  const w = (X_MAX - X_MIN) * SX
  const h = (Y_MAX - Y_MIN) * SX
  const o = toPx(0, 0)
  const s = toPx(2, -3)
  const xs = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i)
  const ys = Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => Y_MIN + i)
  // Parabel nur im sichtbaren Bereich zeichnen
  const pts: string[] = []
  for (let x = -0.4; x <= 4.4; x += 0.05) {
    const p = toPx(x, exampleF(x))
    pts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`)
  }
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Parabel f(x) = x² − 4x + 1 mit Scheitelpunkt S(2|−3)">
      {xs.map((x) => (
        <line key={`gx${x}`} x1={toPx(x, 0).px} y1={0} x2={toPx(x, 0).px} y2={h} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={0} y1={toPx(0, y).py} x2={w} y2={toPx(0, y).py} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {/* Achsen */}
      <line x1={0} y1={o.py} x2={w} y2={o.py} stroke="#334155" strokeWidth={1.5} />
      <line x1={o.px} y1={h} x2={o.px} y2={0} stroke="#334155" strokeWidth={1.5} />
      <text x={w - 4} y={o.py - 6} fontSize={13} textAnchor="end" fill="#334155">x</text>
      <text x={o.px + 6} y={12} fontSize={13} fill="#334155">y</text>
      {xs.filter((x) => x !== 0).map((x) => (
        <text key={`lx${x}`} x={toPx(x, 0).px} y={o.py + 14} fontSize={10} textAnchor="middle" fill="#64748b">{x}</text>
      ))}
      {ys.filter((y) => y !== 0).map((y) => (
        <text key={`ly${y}`} x={o.px - 5} y={toPx(0, y).py + 3} fontSize={10} textAnchor="end" fill="#64748b">{y}</text>
      ))}
      {/* Symmetrieachse x = 2 */}
      <line x1={s.px} y1={0} x2={s.px} y2={h} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={s.px + 5} y={14} fontSize={11} fontWeight="bold" fill="#16a34a">x = 2</text>
      {/* Parabel */}
      <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      {/* Scheitelpunkt */}
      <circle cx={s.px} cy={s.py} r={5} fill="#dc2626" />
      <text x={s.px + 8} y={s.py + 4} fontSize={12} fontWeight="bold" fill="#dc2626">S(2|−3)</text>
    </svg>
  )
}

function Erklaerung() {
  return (
    <div className="bk-panel">
      <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">So berechnest du den Scheitelpunkt</h2>
      <p className="text-slate-700 mb-3">
        Der <strong>Scheitelpunkt S</strong> ist der höchste oder tiefste Punkt einer Parabel. Ist die Funktion in der{' '}
        <strong>allgemeinen Form</strong> <Tex tex="f(x) = ax^2 + bx + c" /> gegeben, berechnest du ihn in zwei Schritten:
      </p>
      <ol className="list-decimal pl-5 text-slate-700 space-y-2 mb-3 text-left">
        <li>
          <span className="text-green-700 font-semibold">x-Koordinate</span> mit der Formel berechnen:
          <Tex display tex={`\\textcolor{${GREEN}}{x_S} = -\\frac{b}{2 \\cdot a}`} />
        </li>
        <li>
          <span className="text-red-700 font-semibold">y-Koordinate</span>: <Tex tex="x_S" /> in die Funktionsgleichung einsetzen:{' '}
          <Tex tex="y_S = f(x_S)" />
          <span className="block mt-1">
            <strong>Oder</strong> du nutzt direkt die passende Formel für <Tex tex="y_S" />:
          </span>
          <Tex display tex={`\\textcolor{${RED}}{y_S} = c - \\frac{b^2}{4 \\cdot a}`} />
        </li>
      </ol>
      <div className="border-2 border-green-500 bg-green-50 rounded-xl px-4 py-3 mb-3 text-center">
        <p className="font-semibold text-slate-800 mb-1">Scheitelpunktkoordinaten auf einen Blick</p>
        <Tex
          display
          className="text-lg"
          tex={`S(x_S \\mid y_S) = S\\left(\\textcolor{${GREEN}}{-\\frac{b}{2 \\cdot a}} \\;\\middle|\\; \\textcolor{${RED}}{c - \\frac{b^2}{4 \\cdot a}}\\right)`}
        />
        <p className="text-sm text-slate-600 mt-1">
          Beide Wege für <Tex tex="y_S" /> führen zum selben Ergebnis – nimm den, der dir leichter fällt.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-3">
        <ExampleGraph />
        <div className="text-left text-slate-700">
          <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
          <Tex display tex="f(x) = x^2 - 4x + 1" />
          <p className="mb-2">
            <Tex tex="a = 1,\quad b = -4,\quad c = 1" />
          </p>
          <Tex display tex={`\\textcolor{${GREEN}}{x_S} = -\\frac{-4}{2 \\cdot 1} = \\frac{4}{2} = \\textcolor{${GREEN}}{\\mathbf{2}}`} />
          <Tex display tex={`\\begin{aligned} \\textcolor{${RED}}{y_S} &= f(2) = 2^2 - 4 \\cdot 2 + 1 \\\\ &= 4 - 8 + 1 = \\textcolor{${RED}}{\\mathbf{-3}} \\end{aligned}`} />
          <p className="text-sm">oder mit der Formel:</p>
          <Tex display tex={`\\begin{aligned} \\textcolor{${RED}}{y_S} &= 1 - \\frac{(-4)^2}{4 \\cdot 1} = 1 - \\frac{16}{4} \\\\ &= 1 - 4 = \\textcolor{${RED}}{\\mathbf{-3}} \\end{aligned}`} />
          <p className="text-slate-800 font-bold mt-3">
            Der Scheitelpunkt ist <Tex tex="S(2 \mid -3)" />.
          </p>
        </div>
      </div>
      <ul className="list-disc pl-5 mt-3 text-slate-700 space-y-1 text-sm text-left">
        <li>
          <Tex tex="a > 0" />: Die Parabel ist nach oben geöffnet, S ist der tiefste Punkt. <Tex tex="a < 0" />: nach unten geöffnet, S ist der höchste Punkt.
        </li>
        <li>
          Achte auf Vorzeichen: Ist b negativ, wird <Tex tex="-b" /> positiv, z. B. <Tex tex="-(-4) = 4" />.
        </li>
        <li>
          Beim Einsetzen negative Zahlen in Klammern setzen: <Tex tex="(-3)^2 = 9" />, aber <Tex tex="-3^2 = -9" />.
        </li>
      </ul>
      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2 text-center">Erklärvideo</h3>
      <VideoEmbed src={`https://www.youtube.com/embed/${VIDEO_ID}`} title="Erklärvideo: Scheitelpunkt berechnen" />
    </div>
  )
}

// ---------- Seite: sieben Aufgaben auf einmal ----------

const LEVEL_KARTEN: { level: Level; farbe: string; tex: string; text: string }[] = [
  {
    level: 'einfach',
    farbe: 'bg-green-600 hover:bg-green-700',
    tex: 'f(x) = \\pm x^2 + bx + c',
    text: 'Ohne Streckfaktor (a = 1 oder a = −1), der Scheitelpunkt hat ganzzahlige Koordinaten.',
  },
  {
    level: 'mittel',
    farbe: 'bg-amber-500 hover:bg-amber-600',
    tex: 'f(x) = 2x^2 - 8x + 3',
    text: 'Mit Streckfaktor: ganze Zahlen wie 2 oder −3 und Dezimalzahlen wie 0,5.',
  },
  {
    level: 'fortgeschritten',
    farbe: 'bg-red-600 hover:bg-red-700',
    tex: 'f(x) = \\frac{1}{2}x^2 - 3x + \\frac{5}{2}',
    text: 'Mit Brüchen in der Funktionsgleichung – rechne mit Bruchrechnung.',
  },
  {
    level: 'anwendung',
    farbe: 'bg-blue-600 hover:bg-blue-700',
    tex: 'h(x) = -0{,}25x^2 + 2{,}5x',
    text: 'Sieben Sachaufgaben mit Skizze: Passt der Lkw durch den Tunnel? Erreicht die Rakete die Mindesthöhe? Und mehr.',
  },
]

export default function Scheitelpunkt() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  // Einstiegs-Lernsituation „Eingeschlossen im Lichtwerk“ als eigener Modus neben den Schwierigkeitsgraden
  const [lernsituation, setLernsituation] = useState(false)
  // Zurück-Button im Kopf führt zuerst zur Auswahl auf dieser Seite
  useBackHandler(lernsituation || level !== null, () => { setLernsituation(false); chooseLevel(null) })

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  const completionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseLevel = (next: Level | null) => {
    setLevel(next)
    startNewRound()
    setStreak(0)
  }

  const header = (
    <div>
      <p className="text-center text-slate-600">Berechne den Scheitelpunkt einer Parabel aus der allgemeinen Form <Tex tex="f(x) = ax^2 + bx + c" />.</p>
    </div>
  )

  if (lernsituation) {
    return (
      <EscapeEinstieg
        erklaerung={<Erklaerung />}
        onBack={() => {
          setLernsituation(false)
          window.scrollTo({ top: 0 })
        }}
        onPractice={() => {
          setLernsituation(false)
          chooseLevel('einfach')
        }}
      />
    )
  }

  if (!level) {
    return (
      <TaskShell title="Scheitelpunkt berechnen" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          <div className={`${panel} flex flex-col`}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
            <button
              onClick={() => {
                setLernsituation(true)
                window.scrollTo({ top: 0 })
              }}
              style={{ background: 'var(--primary)' }}
              className="rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
            >
              <p className="text-lg font-bold mb-1 text-white">Eingeschlossen im Lichtwerk</p>
              <p className="text-xl mb-2 text-white">
                <i className="fa-solid fa-door-closed" aria-hidden="true" />
              </p>
              <p className="text-sm text-white/90">
                Neu beim Thema? Knackt den Türcode im Escape-Room und findet dabei heraus, wie du den Scheitelpunkt einer Parabel aus der allgemeinen Form berechnest.
              </p>
            </button>
          </div>
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Übungsaufgaben</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LEVEL_KARTEN.map((karte) => (
                <button
                  key={karte.level}
                  onClick={() => chooseLevel(karte.level)}
                  className={`rounded-2xl ${karte.farbe} text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5`}
                >
                  <p className="text-lg font-bold mb-1 text-white">{LEVEL_LABEL[karte.level]}</p>
                  <Tex display className="text-xl mb-2 text-white" tex={karte.tex} />
                  <p className="text-sm text-white/90">{karte.text}</p>
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Jede Runde besteht aus sieben verschiedenen Aufgabenarten: von „Schritt für Schritt“ über Fehlersuche bis zur Sachaufgabe.
            </p>
          </div>
        </div>
      </TaskShell>
    )
  }

  return (
    <TaskShell title="Scheitelpunkt berechnen" width="narrow">
        <div className="flex flex-col gap-6">
        {header}
        <Erklaerung />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]}
          </span>
          <button onClick={() => chooseLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        {Array.from({ length: TOTAL_TASKS }, (_, i) => (
          // Nach einem Neustart per key getrennt (frischer Zustand)
          <React.Fragment key={`${level}-${round}-${i}`}>
            <TaskCard
              number={i + 1}
              level={level}
              onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
              onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
              onHelp={() => setStreak(0)}
            />
          </React.Fragment>
        ))}

        <div className="flex justify-center gap-3 flex-wrap">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
            Gelöst: {solvedCount} / {TOTAL_TASKS}
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Richtig in Folge: {streak}</div>
        </div>

        {allSolved && (
          <div ref={completionRef} className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center">
            {finished ? (
              <>
                <p className="text-green-800 font-semibold mb-4">Alles klar – bis zum nächsten Mal!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={startNewRound} className={btnPrimary}>Doch noch neue Aufgaben</button>
                  <button onClick={() => navigate('/quadratische_funktionen')} className={btnSecondary}>Zur Übersicht</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-green-800 text-lg font-semibold mb-1">Super, toll gemacht!</p>
                <p className="text-green-800 mb-4">Du hast alle {TOTAL_TASKS} Aufgaben richtig gelöst.</p>
                <p className="text-slate-700 mb-4">Möchtest du neue Aufgaben üben oder hörst du hier auf?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={startNewRound} className={btnPrimary}>Neue Aufgaben</button>
                  <button onClick={() => setFinished(true)} className={btnSecondary}>Fertig für heute</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </TaskShell>
  )
}
