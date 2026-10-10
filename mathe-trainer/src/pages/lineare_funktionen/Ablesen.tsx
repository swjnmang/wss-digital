import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResponsiveGraph from '../../components/ResponsiveGeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'
import { VideoModal } from '../../components/VideoButton'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const TOTAL_TASKS = 5
const VIDEO_ID = 'r8vCu72ojYw'

const btnPrimary = 'bk-btn bk-btn-primary'
const btnSecondary = 'bk-btn'
const panel = 'bk-panel text-center'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Steigung und y-Achsenabschnitt (beide ungleich 0, damit jede Gleichung die Form y = mx ± t hat)
const SLOPES = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]

// Einfach: nur Ursprungsgeraden y = m·x, Fortgeschritten: Geraden y = m·x + t
type Level = 'einfach' | 'fortgeschritten'
const LEVEL_LABEL: Record<Level, string> = { einfach: 'Einfach', fortgeschritten: 'Fortgeschritten' }

function newLine(level: Level) {
  if (level === 'einfach') return { m: SLOPES[Math.floor(Math.random() * SLOPES.length)], t: 0 }
  let t = 0
  while (t === 0) t = randInt(-4, 4)
  return { m: SLOPES[Math.floor(Math.random() * SLOPES.length)], t }
}

const fmt = (n: number) => String(n).replace('.', ',').replace('-', '−')

function equationText(m: number, t: number) {
  const mPart = m === 1 ? '' : m === -1 ? '−' : fmt(m)
  if (t === 0) return `y = ${mPart}x`
  return `y = ${mPart}x ${t < 0 ? '−' : '+'} ${fmt(Math.abs(t))}`
}

// ---------- Auswertung der beiden Felder ----------

type Status = 'idle' | 'right' | 'wrong'
const isSign = (c: string) => /[+\-−–—‐]/.test(c)

function mStatus(raw: string, m: number): Status {
  const s = raw.trim()
  if (s === '' || (s.length === 1 && (isSign(s) || s === ',' || s === '.'))) return 'idle'
  const v = parseFlexibleNumber(s)
  if (Number.isNaN(v)) return 'wrong'
  return Math.abs(v - m) < 0.03 ? 'right' : 'wrong'
}

/** Das zweite Feld enthält Vorzeichen und Wert von t, z. B. "+3" oder "−2": Das Vorzeichen muss der Schüler selbst setzen. */
function tStatus(raw: string, t: number): { status: Status; hint: string } {
  const s = raw.trim()
  if (s === '' || (s.length === 1 && (isSign(s) || s === ',' || s === '.'))) return { status: 'idle', hint: '' }
  const match = s.replace(/\s+/g, '').match(/^([+\-−–—‐])(\d+(?:[.,]\d+)?)$/)
  if (!match) {
    return /^\d/.test(s)
      ? { status: 'wrong', hint: 'Setze ein Vorzeichen (+ oder −) davor.' }
      : { status: 'wrong', hint: '' }
  }
  const value = (/[\-−–—‐]/.test(match[1]) ? -1 : 1) * parseFloat(match[2].replace(',', '.'))
  return Math.abs(value - t) < 0.03 ? { status: 'right', hint: '' } : { status: 'wrong', hint: '' }
}

const fieldCls = (status: Status) =>
  `w-20 text-center border-2 rounded px-2 py-2 focus:outline-none ${
    status === 'right' ? 'border-green-500 bg-green-50' : status === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-300'
  }`

// ---------- Eine Aufgabe ----------

interface CardProps {
  number: number
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onVideo: () => void
  level: Level
}

function TaskCard({ number, onSolvedChange, onResult, onVideo, level }: CardProps) {
  const tracking = useTaskTracking(`Funktionsgleichung ablesen (${LEVEL_LABEL[level]})`)
  const easy = level === 'einfach'
  const [{ m, t }, setLine] = useState(() => newLine(level))
  const [mInput, setMInput] = useState('')
  const [tInput, setTInput] = useState('')
  const [solved, setSolved] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  const ms = mStatus(mInput, m)
  // Einfach: Ursprungsgerade, es gibt kein Feld für t
  const { status: ts, hint } = easy ? { status: 'right' as Status, hint: '' } : tStatus(tInput, t)
  const bothRight = ms === 'right' && ts === 'right'
  const anyWrong = ms === 'wrong' || ts === 'wrong'

  useEffect(() => {
    if (solved) return
    if (bothRight) {
      setSolved(true)
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
      setShowSolution(false)
      return
    }
    if (anyWrong) {
      // Ein falscher Versuch zählt erst, wenn die Eingabe kurz stehen bleibt
      const timer = setTimeout(() => {
        tracking.onCheck(false)
        onResult(false)
      }, 900)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mInput, tInput, solved])

  function newTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    setSolved(false)
    setShowSolution(false)
    setMInput('')
    setTInput('')
    setLine(newLine(level))
  }

  // Live mitgerenderte Gleichung aus den Eingaben des Schülers
  const tShown = tInput.trim().replace(/\s+/g, '').replace(/^([+\-−–—‐])/, (c) => (/[+]/.test(c) ? '+ ' : '− '))
  const preview = (
    <>
      y = <span className={mInput.trim() ? '' : 'text-slate-400'}>{mInput.trim() ? mInput.trim().replace(/[\-–—‐]/g, '−') : 'm'}</span>x
      {!easy && (
        <>
          {' '}
          <span className={tInput.trim() ? '' : 'text-slate-400'}>{tInput.trim() ? tShown : '± t'}</span>
        </>
      )}
    </>
  )

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Funktionsgleichung ablesen</h2>
      <p className="text-slate-700 mb-4">
        {easy
          ? 'Die Gerade ist eine Ursprungsgerade. Lies die Steigung m aus dem Graphen ab und trage sie in die Gleichung ein.'
          : 'Lies Steigung m und y-Achsenabschnitt t aus dem Graphen ab und trage sie in die Gleichung ein.'}
      </p>

      <ResponsiveGraph m={m} t={t} />

      <p className="text-sm text-slate-600 mb-3">Gegeben: {easy ? 'y = m · x' : 'y = m · x + t'}</p>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xl font-semibold text-slate-800">
        <span>y =</span>
        <input
          aria-label="Wert für m"
          value={mInput}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMInput(e.target.value)}
          className={fieldCls(ms)}
          inputMode="decimal"
        />
        <span>x</span>
        {!easy && (
        <input
          aria-label="Vorzeichen und Wert für t"
          value={tInput}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTInput(e.target.value)}
          className={fieldCls(ts)}
          inputMode="text"
        />
        )}
      </div>
      {/* Auf Handys fehlt auf der Zahlentastatur das Plus: Tasten setzen das Vorzeichen (der Schüler entscheidet selbst, welches) */}
      {!solved && !easy && (
        <div className="flex justify-center items-center gap-2 mt-2 text-sm text-slate-600">
          <span>Vorzeichen für t:</span>
          {(['+', '−'] as const).map((sign) => (
            <button
              key={sign}
              type="button"
              onClick={() => setTInput((v) => sign + v.trim().replace(/^[+\-−–—‐]\s*/, ''))}
              className="w-9 h-9 rounded border border-slate-300 bg-white hover:bg-slate-100 text-lg font-semibold text-slate-700"
              aria-label={sign === '+' ? 'Plus einsetzen' : 'Minus einsetzen'}
            >
              {sign}
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 text-xl text-slate-800 min-h-8">{preview}</p>

      {solved && <p className="text-center font-bold mt-2 text-green-600">Richtig! Die Funktionsgleichung lautet {equationText(m, t)}.</p>}
      {!solved && hint && <p className="text-center font-bold mt-2 text-red-600">{hint}</p>}
      {!solved && !hint && anyWrong && <p className="text-center font-bold mt-2 text-red-600">Noch nicht richtig.</p>}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={newTask} className={btnSecondary}>Neue Aufgabe</button>
        <button
          onClick={() => {
            setShowSolution(true)
            tracking.onHintShown()
          }}
          className={btnSecondary}
        >
          Lösung anzeigen
        </button>
        <button onClick={onVideo} className={btnSecondary}><i className="fa-solid fa-play" aria-hidden="true" /> Erklärvideo</button>
      </div>

      {showSolution && (
        <div className="mt-6 bk-taskbox text-slate-800">
          <h3 className="text-base font-bold mb-2">Lösung</h3>
          <p>Steigung m = {fmt(m)}</p>
          {easy ? (
            <p>Ursprungsgerade: Die Gerade geht durch O(0|0), also ist t = 0.</p>
          ) : (
            <p>y-Achsenabschnitt t = {fmt(t)}</p>
          )}
          <p className="font-bold mt-1">{equationText(m, t)}</p>
        </div>
      )}
    </div>
  )
}

// ---------- Seite ----------

export default function Ablesen() {
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState<Record<number, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const completionRef = useRef<HTMLDivElement>(null)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])


  const [level, setLevel] = useState<Level | null>(null)

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
      <p className="text-center text-slate-600">Lies m und t aus dem Graphen ab und setze sie in die Gleichung ein.</p>
    </div>
  )

  if (!level) {
    return (
      <TaskShell title="Funktionsgleichung ablesen" width="narrow">
        <div className="flex flex-col gap-6">
          {header}
          <div className={panel}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => chooseLevel('einfach')}
                className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = m · x</p>
                <p className="text-sm text-white/90">Nur Ursprungsgeraden: Alle Geraden gehen durch den Punkt O(0|0).</p>
              </button>
              <button
                onClick={() => chooseLevel('fortgeschritten')}
                className="rounded-2xl bg-red-600 hover:bg-red-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
              >
                <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                <p className="text-xl font-serif italic mb-2 text-white">y = m · x + t</p>
                <p className="text-sm text-white/90">Beliebige Geraden, die die y-Achse an einer anderen Stelle schneiden.</p>
              </button>
            </div>
          </div>
        </div>
      </TaskShell>
    )
  }

  return (
    <TaskShell title="Funktionsgleichung ablesen" width="narrow">
        <div className="flex flex-col gap-6">
        {header}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Schwierigkeitsgrad: {LEVEL_LABEL[level]} ({level === 'einfach' ? 'y = m · x' : 'y = m · x + t'})
          </span>
          <button onClick={() => chooseLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            Schwierigkeitsgrad wechseln
          </button>
        </div>

        {Array.from({ length: TOTAL_TASKS }, (_, i) => (
          <React.Fragment key={`${level}-${round}-${i}`}>
            <TaskCard
              number={i + 1}
              onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
              onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
              onVideo={() => setShowVideo(true)}
              level={level}
            />
          </React.Fragment>
        ))}

        <div className="flex justify-center gap-3 flex-wrap">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Gelöst: {solvedCount} / {TOTAL_TASKS}</div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">Richtig in Folge: {streak}</div>
        </div>

        {allSolved && (
          <div ref={completionRef} className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center">
            {finished ? (
              <>
                <p className="text-green-800 font-semibold mb-4">Alles klar – bis zum nächsten Mal!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={startNewRound} className={btnPrimary}>Doch noch neue Aufgaben</button>
                  <button onClick={() => navigate('/lineare_funktionen')} className={btnSecondary}>Zur Übersicht</button>
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

      {showVideo && (
        <VideoModal url={`https://youtu.be/${VIDEO_ID}`} title="Erklärvideo: Funktionsgleichung ablesen" end={104} note="Das Video wird bei 1:44 automatisch pausiert." onClose={() => setShowVideo(false)} />
      )}
    </TaskShell>
  )
}
