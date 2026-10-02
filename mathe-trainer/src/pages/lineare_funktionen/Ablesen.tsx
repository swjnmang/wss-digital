import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const TOTAL_TASKS = 5
const VIDEO_ID = 'r8vCu72ojYw'

const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Steigung und y-Achsenabschnitt (beide ungleich 0, damit jede Gleichung die Form y = mx ± t hat)
const SLOPES = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]
function newLine() {
  let t = 0
  while (t === 0) t = randInt(-4, 4)
  return { m: SLOPES[Math.floor(Math.random() * SLOPES.length)], t }
}

const fmt = (n: number) => String(n).replace('.', ',').replace('-', '−')

function equationText(m: number, t: number) {
  const mPart = m === 1 ? '' : m === -1 ? '−' : fmt(m)
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

// ---------- Graph in passender Größe ----------

function ResponsiveGraph({ m, t }: { m: number; t: number }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(400)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    // Größe in 40-px-Schritten, damit der Graph nicht bei jedem Pixel neu lädt
    const update = () => setSize(Math.max(240, Math.min(480, Math.floor((el.clientWidth - 24) / 40) * 40)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={boxRef} className="flex justify-center mb-4 w-full overflow-hidden">
      <div key={size}>
        <GeoGebraGraph m={m} t={t} width={size} height={size} />
      </div>
    </div>
  )
}

// ---------- Eine Aufgabe ----------

interface CardProps {
  number: number
  onSolvedChange: (solved: boolean) => void
  onResult: (correct: boolean) => void
  onVideo: () => void
}

function TaskCard({ number, onSolvedChange, onResult, onVideo }: CardProps) {
  const tracking = useTaskTracking('Funktionsgleichung ablesen')
  const [{ m, t }, setLine] = useState(newLine)
  const [mInput, setMInput] = useState('')
  const [tInput, setTInput] = useState('')
  const [solved, setSolved] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  const ms = mStatus(mInput, m)
  const { status: ts, hint } = tStatus(tInput, t)
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
    setLine(newLine())
  }

  // Live mitgerenderte Gleichung aus den Eingaben des Schülers
  const tShown = tInput.trim().replace(/\s+/g, '').replace(/^([+\-−–—‐])/, (c) => (/[+]/.test(c) ? '+ ' : '− '))
  const preview = (
    <>
      y = <span className={mInput.trim() ? '' : 'text-slate-400'}>{mInput.trim() ? mInput.trim().replace(/[\-–—‐]/g, '−') : 'm'}</span>x{' '}
      <span className={tInput.trim() ? '' : 'text-slate-400'}>{tInput.trim() ? tShown : '± t'}</span>
    </>
  )

  return (
    <div className={panel}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Aufgabe {number}: Funktionsgleichung ablesen</h2>
      <p className="text-slate-700 mb-4">
        Lies Steigung m und y-Achsenabschnitt t aus dem Graphen ab und trage sie in die Gleichung ein.
      </p>

      <ResponsiveGraph m={m} t={t} />

      <p className="text-sm text-slate-600 mb-3">Gegeben: y = m · x + t</p>

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
        <input
          aria-label="Vorzeichen und Wert für t"
          value={tInput}
          readOnly={solved}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTInput(e.target.value)}
          className={fieldCls(ts)}
          inputMode="decimal"
        />
      </div>

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
        <button onClick={onVideo} className={btnSecondary}>Erklärvideo</button>
      </div>

      {showSolution && (
        <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-800">
          <h3 className="text-base font-bold mb-2">Lösung</h3>
          <p>Steigung m = {fmt(m)}</p>
          <p>y-Achsenabschnitt t = {fmt(t)}</p>
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
  const playerRef = useRef<any>(null)
  const completionRef = useRef<HTMLDivElement>(null)

  const solvedCount = Object.values(solved).filter(Boolean).length
  const allSolved = solvedCount === TOTAL_TASKS

  useEffect(() => {
    if (allSolved) completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  // YouTube-Player im Erklärvideo-Fenster (pausiert bei 1:44)
  useEffect(() => {
    if (!showVideo) return
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }
    const init = () => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '390',
          width: '640',
          videoId: VIDEO_ID,
          events: {
            onReady: (e: any) => e.target.playVideo(),
            onStateChange: (e: any) => {
              const player = e.target
              if (player && typeof player.getCurrentTime === 'function' && player.getCurrentTime() >= 104 && player.getPlayerState() === 1) {
                player.pauseVideo()
              }
            },
          },
        })
      }
    }
    if (window.YT && window.YT.Player) init()
    else window.onYouTubeIframeAPIReady = init
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [showVideo])

  const startNewRound = () => {
    setRound((r) => r + 1)
    setSolved({})
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="mx-auto px-4 py-8 max-w-3xl w-full flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Funktionsgleichung ablesen</h1>
          <p className="text-center text-slate-600">Lies m und t aus dem Graphen ab und setze sie in die Gleichung ein.</p>
        </div>

        {Array.from({ length: TOTAL_TASKS }, (_, i) => (
          <TaskCard
            key={`${round}-${i}`}
            number={i + 1}
            onSolvedChange={(value) => setSolved((s) => ({ ...s, [i]: value }))}
            onResult={(correct) => setStreak((s) => (correct ? s + 1 : 0))}
            onVideo={() => setShowVideo(true)}
          />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Erklärvideo: Funktionsgleichung ablesen</h3>
              <button onClick={() => setShowVideo(false)} className="text-slate-500 hover:text-slate-800 text-xl" aria-label="Schließen">✕</button>
            </div>
            <div className="overflow-x-auto"><div id="youtube-player" /></div>
            <p className="text-sm text-slate-500 mt-3">Das Video wird bei 1:44 automatisch pausiert.</p>
          </div>
        </div>
      )}
    </div>
  )
}
