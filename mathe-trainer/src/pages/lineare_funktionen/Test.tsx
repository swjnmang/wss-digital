import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './LFCommon.module.css'
import GeoGebraApplet from '../../components/GeoGebraApplet'

type QuestionType = 'slope' | 'missing_coord' | 'equation_ps' | 'equation_2p' | 'zero' | 'intersection' | 'graph'
type AnswerFormat = 'single_number' | 'point' | 'equation'
type Question = {
  type: QuestionType
  text: string
  data: any
  answer: any
  answerFormat: AnswerFormat
  inputPrefix?: string
  displayHTML?: string
}

const TOTAL_QUESTIONS = 15

function formatNumber(num: number) { return Math.round(num * 100) / 100 }
function randomInt(max: number, min = 0) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function createSlopeQuestion(): Question {
  let x1, y1, x2, y2
  do { x1 = randomInt(10, -10); x2 = randomInt(10, -10) } while (x1 === x2)
  y1 = randomInt(10, -10); y2 = randomInt(10, -10)
  return {
    type: 'slope',
    text: `Berechne die Steigung m der Geraden durch P₁(${x1}|${y1}) und P₂(${x2}|${y2}).`,
    data: {},
    answer: { m: formatNumber((y2 - y1) / (x2 - x1)) },
    answerFormat: 'single_number',
    inputPrefix: 'm ='
  }
}
function createMissingCoordinateQuestion(): Question {
  const m = randomInt(5, -5) || 1
  const t = randomInt(10, -10)
  const x = randomInt(10, -10)
  const y = m * x + t
  const findX = Math.random() < 0.5
  return {
    type: 'missing_coord',
    text: `Ein Punkt P liegt auf der Geraden y = ${m}x + ${t}. Berechne die fehlende Koordinate.`,
    data: { point: findX ? `P(x|${y})` : `P(${x}|y)` },
    answer: findX ? { val: x } : { val: y },
    answerFormat: 'single_number',
    inputPrefix: findX ? 'x =' : 'y ='
  }
}
function createEquationFromPointSlopeQuestion(): Question {
  const m = randomInt(3, -3) || 1
  const t = randomInt(8, -8)
  const x = randomInt(10, -10)
  const y = m * x + t
  return {
    type: 'equation_ps',
    text: `Bestimme die Geradengleichung (y=mx+t) mit der Steigung m=${m} durch den Punkt P(${x}|${y}).`,
    data: {},
    answer: { m, t },
    answerFormat: 'equation'
  }
}
function createEquationFromTwoPointsQuestion(): Question {
  const m = randomChoice([1, -1, 2, -2, 0.5, -0.5, 3, -3])
  const t = randomInt(8, -8)
  const x1 = randomInt(5, -5)
  const y1 = formatNumber(m * x1 + t)
  let x2
  do { x2 = randomInt(5, -5) } while (x1 === x2)
  const y2 = formatNumber(m * x2 + t)
  return {
    type: 'equation_2p',
    text: `Bestimme die Geradengleichung (y=mx+t), die durch die Punkte P₁(${x1}|${y1}) und P₂(${x2}|${y2}) verläuft.`,
    data: {},
    answer: { m, t },
    answerFormat: 'equation'
  }
}
function createZeroQuestion(): Question {
  const m = randomInt(5, -5) || 1
  const x_zero = randomInt(10, -10)
  const t = -m * x_zero
  return {
    type: 'zero',
    text: `Berechne die Nullstelle der Funktion y = ${m}x + ${t}.`,
    data: {},
    answer: { val: x_zero },
    answerFormat: 'single_number',
    inputPrefix: 'x ='
  }
}
function createIntersectionQuestion(): Question {
  const isParallel = Math.random() < 0.15
  const m1 = randomInt(5, -5) || 1
  const t1 = randomInt(10, -10)
  let m2, t2, answer
  if (isParallel) {
    m2 = m1
    t2 = t1 + randomInt(5, 1) * (Math.random() < 0.5 ? 1 : -1)
    answer = 'none'
  } else {
    do { m2 = randomInt(5, -5) || -1 } while (m1 === m2)
    const x_intersect = randomInt(8, -8)
    t2 = (m1 - m2) * x_intersect + t1
    const y_intersect = m1 * x_intersect + t1
    answer = { x: formatNumber(x_intersect), y: formatNumber(y_intersect) }
  }
  return {
    type: 'intersection',
    text: 'Bestimme den Schnittpunkt der Geraden.',
    data: { g1: `g₁: y = ${m1}x + ${t1}`, g2: `g₂: y = ${m2}x + ${t2}` },
    answer,
    answerFormat: 'point'
  }
}
function createGraphQuestion(): Question {
  const m = randomChoice([1, -1, 2, -2, 0.5, -0.5])
  const t = randomInt(4, -4)
  return {
    type: 'graph',
    text: 'Bestimme die Funktionsgleichung (y=mx+t) des abgebildeten Graphen.',
    data: { m, t },
    answer: { m, t },
    answerFormat: 'equation'
  }
}

const questionTypes = [
  createSlopeQuestion, createMissingCoordinateQuestion, createEquationFromPointSlopeQuestion,
  createZeroQuestion, createIntersectionQuestion, createGraphQuestion, createEquationFromTwoPointsQuestion
]



export default function Test() {
  // Alle States und Effects müssen immer am Anfang stehen!
  const [started, setStarted] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [showResult, setShowResult] = useState(false)
  const [inputState, setInputState] = useState<{ [key: number]: any }>({})

  // Starte Test erst, wenn Fragen geladen
  useEffect(() => {
    if (questions.length > 0 && !started) {
      setStarted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions])

  // Initialisiere Input-States beim Fragenwechsel
  const q = questions[current]
  useEffect(() => {
    if (!q) return;
    if (!inputState[current]) {
      if (q.answerFormat === 'single_number') {
        setInputState(s => ({ ...s, [current]: { singleVal: '' } }))
      } else if (q.answerFormat === 'point') {
        setInputState(s => ({ ...s, [current]: { xVal: '', yVal: '', isNone: false } }))
      } else if (q.answerFormat === 'equation') {
        setInputState(s => ({ ...s, [current]: { mVal: '', tVal: '' } }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, q?.answerFormat])

  function startTest() {
    setQuestions(Array.from({ length: TOTAL_QUESTIONS }, () => randomChoice(questionTypes)()))
    setUserAnswers([])
    setCurrent(0)
    setShowResult(false)
    // setStarted wird durch useEffect gesetzt
  }

  function handleAnswer(ans: any) {
    setUserAnswers(prev => {
      const next = [...prev]
      next[current] = ans
      return next
    })
  }

  function nextQuestion() {
    if (current < TOTAL_QUESTIONS - 1) setCurrent(c => c + 1)
    else setShowResult(true)
  }

  function restart() {
    setStarted(false)
    setConfirmed(false)
    setShowResult(false)
    setQuestions([])
    setUserAnswers([])
    setCurrent(0)
  }

  // Scoring
  function isCorrect(q: Question, user: any) {
    if (!user) return false
    if (q.answerFormat === 'single_number') {
      return Math.abs(Number(user.val) - Number(q.answer.val)) < 0.01
    } else if (q.answerFormat === 'point') {
      if (user.isNone) return q.answer === 'none'
      if (q.answer === 'none') return false
      return Math.abs(Number(user.x) - Number(q.answer.x)) < 0.01 && Math.abs(Number(user.y) - Number(q.answer.y)) < 0.01
    } else if (q.answerFormat === 'equation') {
      return Math.abs(Number(user.m) - Number(q.answer.m)) < 0.01 && Math.abs(Number(user.t) - Number(q.answer.t)) < 0.01
    }
    return false
  }

  // Grade
  function getGrade(score: number) {
    if (score >= 14) return '1 (sehr gut)'
    if (score >= 12) return '2 (gut)'
    if (score >= 10) return '3 (befriedigend)'
    if (score >= 8) return '4 (ausreichend)'
    if (score >= 6) return '5 (mangelhaft)'
    return '6 (ungenügend)'
  }

  // Render
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 py-8 px-2">
        <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col items-center">
          <Link to="/lineare_funktionen" className="self-start text-blue-700 hover:underline mb-2">← Zurück</Link>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-900">Digitale Prüfung: Lineare Funktionen</h2>
          <p className="mb-1 text-blue-800">Dieser Test besteht aus 15 zufälligen Aufgaben zu allen wichtigen Themen der linearen Funktionen.</p>
          <p className="mb-2 text-gray-700"><b>Wichtiger Hinweis:</b> Halte bitte Stift und Papier bereit, um alle Berechnungen schriftlich festzuhalten.</p>
          <div className="mt-4">
            <label className="text-gray-700"><input type="checkbox" checked={confirmed} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmed(e.target.checked)} className="mr-2" /> Ich habe die Information gelesen.</label>
          </div>
          <button className="generator-button mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors disabled:opacity-50" onClick={startTest} disabled={!confirmed}>Test starten</button>
        </div>
      </div>
    )
  }

  if (showResult) {
    const correctCount = questions.filter((q, i) => isCorrect(q, userAnswers[i])).length
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 py-8 px-2">
        <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col items-center">
          <Link to="/lineare_funktionen" className="self-start text-blue-700 hover:underline mb-2">← Zurück</Link>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-900">Dein Ergebnis</h2>
          <div className="score text-3xl font-bold my-2">{correctCount} / {TOTAL_QUESTIONS}</div>
          <div className="grade text-xl mb-2">Note: {getGrade(correctCount)}</div>
          <div className="feedback mb-4">{correctCount >= 12 ? 'Sehr gut! Du beherrschst die linearen Funktionen.' : correctCount >= 8 ? 'Du hast die Grundlagen verstanden, aber übe noch etwas.' : 'Bitte wiederhole die Themen noch einmal.'}</div>
          <hr className="w-full my-4" />
          <h3 className="mt-4 text-lg font-semibold">Detailauswertung:</h3>
          <div className="mt-2 w-full">
            {questions.map((q, i) => (
              <div key={i} className="result-item border-b pb-3 mb-3">
                <div className="result-question font-bold">{q.text}</div>
                <div className={isCorrect(q, userAnswers[i]) ? 'user-answer correct' : 'user-answer incorrect'}>
                  Deine Antwort: {q.answerFormat === 'single_number' ? userAnswers[i]?.val : q.answerFormat === 'point' ? (userAnswers[i]?.isNone ? 'Kein Schnittpunkt' : `S(${userAnswers[i]?.x}|${userAnswers[i]?.y})`) : q.answerFormat === 'equation' ? `y = ${userAnswers[i]?.m}x + ${userAnswers[i]?.t}` : ''}
                </div>
                {!isCorrect(q, userAnswers[i]) && (
                  <div className="correct-answer">Richtig: {q.answerFormat === 'single_number' ? q.answer.val : q.answerFormat === 'point' ? (q.answer === 'none' ? 'Kein Schnittpunkt' : `S(${q.answer.x}|${q.answer.y})`) : q.answerFormat === 'equation' ? `y = ${q.answer.m}x + ${q.answer.t}` : ''}</div>
                )}
              </div>
            ))}
          </div>
          <button className="generator-button mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors" onClick={restart}>Neuen Test starten</button>
        </div>
      </div>
    )
  }

  // Schutz: erst rendern, wenn q existiert
  if (!q) {
    return (
      <div className={`prose ${styles.container}`}>
        <div className={styles.card}>
          <div>Lade Aufgaben ...</div>
        </div>
      </div>
    )
  }

  function handleInputChange(field: string, value: string | boolean) {
    setInputState(s => ({
      ...s,
      [current]: {
        ...s[current],
        [field]: value
      }
    }))
  }

  function handleNext() {
    let ans: any = {}
    const state = inputState[current] || {}
    if (q.answerFormat === 'single_number') {
      ans.val = (state.singleVal || '').replace(',', '.')
    } else if (q.answerFormat === 'point') {
      ans.x = (state.xVal || '').replace(',', '.')
      ans.y = (state.yVal || '').replace(',', '.')
      ans.isNone = !!state.isNone
    } else if (q.answerFormat === 'equation') {
      ans.m = (state.mVal || '').replace(',', '.')
      ans.t = (state.tVal || '').replace(',', '.')
    }
    handleAnswer(ans)
    nextQuestion()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 py-8 px-2">
      <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col items-center">
        <Link to="/lineare_funktionen" className="self-start text-blue-700 hover:underline mb-2">← Zurück</Link>
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-900">Aufgabe {current + 1}</h2>
        <div className="w-full bg-gray-200 rounded mb-4"><div className="bg-blue-600 h-2 rounded" style={{ width: `${((current + 1) / TOTAL_QUESTIONS) * 100}%` }} /></div>
        <div className="bg-gray-100 border rounded-md p-6 mb-4 text-center min-h-[80px] w-full">
          <div>{q.text}</div>
          {/* GeoGebra-Graph für graph-Fragen */}
          {q.type === 'graph' && q.data?.m !== undefined && q.data?.t !== undefined && (
            <div className="flex justify-center my-4">
              <GeoGebraApplet m={q.data.m} t={q.data.t} width={400} height={300} />
            </div>
          )}
          {q.data.point && <div className="task-data text-lg font-bold text-sky-800 mt-2" dangerouslySetInnerHTML={{__html: q.data.point}} />}
          {q.data.g1 && <div className="task-data text-lg font-bold text-sky-800 mt-2" dangerouslySetInnerHTML={{__html: q.data.g1}} />}
          {q.data.g2 && <div className="task-data text-lg font-bold text-sky-800 mt-2" dangerouslySetInnerHTML={{__html: q.data.g2}} />}
        </div>
        {/* Input masks */}
        {q.answerFormat === 'single_number' && (
          <div className="flex justify-center items-center gap-2 mb-4">
            <span>{q.inputPrefix}</span>
            <input type="text" className="border rounded px-3 py-2 text-lg w-24 text-center" value={inputState[current]?.singleVal || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('singleVal', e.target.value)} placeholder="Ergebnis" />
          </div>
        )}
        {q.answerFormat === 'point' && (
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-2 text-xl font-mono mb-2">
              <span>S(</span>
              <input type="text" className="border rounded px-3 py-2 text-lg w-20 text-center" value={inputState[current]?.xVal || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('xVal', e.target.value)} placeholder="x" disabled={inputState[current]?.isNone} />
              <span>|</span>
              <input type="text" className="border rounded px-3 py-2 text-lg w-20 text-center" value={inputState[current]?.yVal || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('yVal', e.target.value)} placeholder="y" disabled={inputState[current]?.isNone} />
              <span>)</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="no-intersection-checkbox" checked={!!inputState[current]?.isNone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isNone', e.target.checked)} />
              <label htmlFor="no-intersection-checkbox">Kein Schnittpunkt</label>
            </div>
          </div>
        )}
        {q.answerFormat === 'equation' && (
          <div className="flex justify-center items-center gap-2 mb-4">
            <span>y =</span>
            <input type="text" className="border rounded px-3 py-2 text-lg w-16 text-center" value={inputState[current]?.mVal || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mVal', e.target.value)} placeholder="m" />
            <span>x +</span>
            <input type="text" className="border rounded px-3 py-2 text-lg w-16 text-center" value={inputState[current]?.tVal || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tVal', e.target.value)} placeholder="t" />
          </div>
        )}
        <button className="generator-button mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors" onClick={handleNext}>Nächste Frage</button>
      </div>
    </div>
  )
}
