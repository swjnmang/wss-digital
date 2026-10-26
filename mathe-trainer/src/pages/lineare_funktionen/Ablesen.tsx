import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResponsiveGraph from '../../components/ResponsiveGeoGebraGraph'
import { checkLinearEquation } from '../../utils/parseLinearEquation'
import { fieldCheckClass } from '../../utils/fieldCheck'
import GleichungEingabe from '../../components/GleichungEingabe'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import TaskShell from '../../components/layout/TaskShell'
import { VideoModal } from '../../components/VideoButton'
import { useBackHandler } from '../../hooks/useBackHandler'

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
  const [eingabe, setEingabe] = useState('')
  const [solved, setSolved] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  // Rückmeldung erst nach einer kurzen Tipp-Pause, damit eine halb getippte Gleichung nicht gleich rot wird
  const [falsch, setFalsch] = useState<{ text: string } | null>(null)

  useEffect(() => {
    if (solved) return
    setFalsch(null)
    if (eingabe.trim() === '') return
    const r = checkLinearEquation(eingabe, m, t, 0.03)
    if (r.status === 'ok') {
      setSolved(true)
      tracking.onCheck(true)
      onResult(true)
      onSolvedChange(true)
      setShowSolution(false)
      return
    }
    const timer = setTimeout(() => {
      setFalsch({ text: r.text })
      // Eingabefehler (unvollständige Gleichung) zählen nicht als Fehlversuch
      if (r.status === 'no') {
        tracking.onCheck(false)
        onResult(false)
      }
    }, 1200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eingabe, solved])

  function newTask() {
    tracking.onTaskStart()
    onSolvedChange(false)
    setSolved(false)
    setShowSolution(false)
    setEingabe('')
    setFalsch(null)
    setLine(newLine(level))
  }

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Funktionsgleichung ablesen</h2>
      <p className="text-slate-700 mb-4">
        {easy
          ? 'Die Gerade ist eine Ursprungsgerade. Lies die Steigung m aus dem Graphen ab und tippe die vollständige Funktionsgleichung ein.'
          : 'Lies Steigung m und y-Achsenabschnitt t aus dem Graphen ab und tippe die vollständige Funktionsgleichung ein.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <ResponsiveGraph m={m} t={t} />

      <div>
      <p className="text-sm text-slate-600 mb-3">Form: {easy ? 'y = m · x' : 'y = m · x + t'}</p>

      <div className="flex justify-center">
        <GleichungEingabe
          ariaLabel="Funktionsgleichung"
          value={eingabe}
          readOnly={solved}
          onChange={(v) => {
            setEingabe(v)
            tracking.onInput()
          }}
          className={fieldCheckClass(solved ? true : falsch ? false : null)}
          placeholder={easy ? 'z. B. y = 2x' : 'z. B. y = 2x − 1'}
        />
      </div>

      {solved && <p className="text-center font-bold mt-2 text-green-600">Super, richtig gelesen! Die Funktionsgleichung lautet {equationText(m, t)}.</p>}
      {!solved && falsch && <p className="text-center font-bold mt-2 text-red-600">{falsch.text}</p>}

      </div>
      </div>

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
  const [current, setCurrent] = useState(0)
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


  // Zurück-Button im Kopf führt zuerst zur Auswahl auf dieser Seite


  useBackHandler(level !== null, () => chooseLevel(null))

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    setCurrent(0)
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

        <p className="text-center text-sm font-semibold text-slate-600">Aufgabe {current + 1} von {TOTAL_TASKS}</p>

        <TaskCard
          key={`${level}-${round}-${current}`}
          number={current + 1}
          onSolvedChange={(value) => setSolved((s) => ({ ...s, [current]: value }))}
          onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
          onVideo={() => setShowVideo(true)}
          level={level}
        />

        {solved[current] && current < TOTAL_TASKS - 1 && (
          <div className="flex justify-center">
            <button onClick={() => setCurrent((c) => c + 1)} className={btnPrimary}>Nächste Aufgabe</button>
          </div>
        )}

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
