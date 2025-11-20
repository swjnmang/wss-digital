import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './LFCommon.module.css'

type Difficulty = 'easy' | 'medium' | 'hard'
type CorrectAnswer = { x: number, y: number } | 'none'

function formatNumber(num: number): number {
  return Math.round(num * 100) / 100
}
function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function Schnittpunkt() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [g1, setG1] = useState('g₁: y = x + 1')
  const [g2, setG2] = useState('g₂: y = -x + 2')
  const [taskText, setTaskText] = useState('Klicke auf "Neue Aufgabe" um zu starten.')
  const [xInput, setXInput] = useState('')
  const [yInput, setYInput] = useState('')
  const [noIntersection, setNoIntersection] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackClass, setFeedbackClass] = useState('')
  const [showAnswerBtnDisabled, setShowAnswerBtnDisabled] = useState(true)
  const [solution, setSolution] = useState('')
  const [solutionVisible, setSolutionVisible] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer>('none')
  const [geoGebraURL, setGeoGebraURL] = useState('')
  const [isFirstTask, setIsFirstTask] = useState(true)

  function handleDifficulty(level: Difficulty) {
    setDifficulty(level)
    generateNewTask(level, true)
  }

  function openGeoGebra() {
    if (geoGebraURL) window.open(geoGebraURL, '_blank')
  }

  function generateNewTask(level: Difficulty = difficulty, forceNotParallel = false) {
    setFeedback('')
    setFeedbackClass('')
    setXInput('')
    setYInput('')
    setNoIntersection(false)
    setSolutionVisible(false)
    setShowAnswerBtnDisabled(true)

    let m1: number, t1: number, m2: number, t2: number
    const task = 'Bestimme den Schnittpunkt der beiden Geraden. Runde auf zwei Nachkommastellen.'
    let generateParallel: boolean
    if (isFirstTask || forceNotParallel) {
      generateParallel = false
      setIsFirstTask(false)
    } else {
      generateParallel = Math.random() < 0.1
    }

    switch (level) {
      case 'medium':
        m1 = randomChoice([0.5, -0.5, 1.5, -1.5, 2.5, -2.5, randomInt(3, -3)])
        if (m1 === 0) m1 = 1.5
        t1 = randomInt(10, -10) / randomChoice([1, 2])
        m2 = generateParallel ? m1 : m1 + randomChoice([0.5, -0.5, 1, -1])
        t2 = generateParallel ? t1 : randomInt(10, -10) / randomChoice([1, 2])
        break
      case 'hard':
        m1 = randomInt(300, -300) / 100
        if (m1 === 0) m1 = 1.25
        t1 = randomInt(1000, -1000) / 100
        m2 = generateParallel ? m1 : formatNumber(m1 + (randomInt(200, -200) / 100) + 0.1)
        t2 = generateParallel ? t1 : randomInt(1000, -1000) / 100
        break
      case 'easy':
      default:
        m1 = randomInt(5, -5)
        if (m1 === 0) m1 = 1
        t1 = randomInt(10, -10)
        do {
          m2 = randomInt(5, -5)
        } while (m1 === m2)
        const x_intersect = randomInt(10, -10)
        t2 = (m1 - m2) * x_intersect + t1
        if (generateParallel) {
          m2 = m1
          t2 = t1 + randomInt(5,1) * (Math.random() < 0.5 ? 1 : -1)
        }
        break
    }
    m1 = formatNumber(m1); t1 = formatNumber(t1)
    m2 = formatNumber(m2); t2 = formatNumber(t2)

    const formatG = (m: number, t: number, name: string) => {
      let m_str = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`
      let t_str = t === 0 ? '' : t > 0 ? ` + ${t}` : ` - ${Math.abs(t)}`
      return `${name}: y = ${m_str}${t_str}`
    }
    setG1(formatG(m1, t1, 'g₁'))
    setG2(formatG(m2, t2, 'g₂'))
    setTaskText(task)

    // GeoGebra
    const geogebra_g1 = `y=${m1}*x+(${t1})`
    const geogebra_g2 = `y=${m2}*x+(${t2})`
    let combined_commands = `${geogebra_g1};${geogebra_g2}`

    let sol = ''
    let answer: CorrectAnswer
    if (Math.abs(m1 - m2) < 0.001) {
      answer = 'none'
      sol = `<strong>1. Steigungen vergleichen:</strong><br />m₁ = ${m1}, m₂ = ${m2}.<br />Da die Steigungen gleich sind (m₁ = m₂), aber die y-Achsenabschnitte verschieden (t₁ ≠ t₂), sind die Geraden parallel.<br /><br /><strong>Ergebnis: Es gibt keinen Schnittpunkt.</strong>`
    } else {
      const x = (t2 - t1) / (m1 - m2)
      const y = m1 * x + t1
      answer = { x: formatNumber(x), y: formatNumber(y) }
      const intersect_command = `S=(${answer.x}, ${answer.y})`
      const label_command = `SetCaption(S, "%v")`
      combined_commands += `;${intersect_command};${label_command}`
      sol = `<strong>1. Gleichungen gleichsetzen:</strong><br />g₁ = g₂<br />${m1}x + ${t1} = ${m2}x + ${t2}<br /><br /><strong>2. Nach x auflösen:</strong><br />${formatNumber(m1 - m2)}x = ${formatNumber(t2 - t1)}<br />x = ${answer.x}<br /><br /><strong>3. x in g₁ (oder g₂) einsetzen, um y zu finden:</strong><br />y = ${m1} * ${answer.x} + ${t1}<br />y = ${answer.y}<br /><br /><strong>Schnittpunkt: S(${answer.x}|${answer.y})</strong>`
    }
    setCorrectAnswer(answer)
    setSolution(sol)
    setGeoGebraURL(`https://www.geogebra.org/graphing?command=${encodeURIComponent(combined_commands)}`)
  }

  function checkSolution() {
    let isCorrect = false
    if (noIntersection) {
      isCorrect = (correctAnswer === 'none')
    } else {
      if (xInput.trim() === '' || yInput.trim() === '') {
        setFeedback('Bitte fülle beide Koordinatenfelder aus.')
        setFeedbackClass('incorrect')
        return
      }
      if (correctAnswer === 'none') {
        isCorrect = false
      } else {
        const xUser = parseFloat(xInput.replace(',', '.'))
        const yUser = parseFloat(yInput.replace(',', '.'))
        isCorrect = (Math.abs(xUser - correctAnswer.x) < 0.01 && Math.abs(yUser - correctAnswer.y) < 0.01)
      }
    }
    if (isCorrect) {
      setFeedback('Richtig! Sehr gut!')
      setFeedbackClass('correct')
      setShowAnswerBtnDisabled(true)
    } else {
      setFeedback('Leider nicht richtig. Überprüfe deine Rechnung!')
      setFeedbackClass('incorrect')
      setShowAnswerBtnDisabled(false)
    }
  }

  function showAnswer() {
    setSolutionVisible(true)
    setShowAnswerBtnDisabled(true)
  }

  useEffect(() => {
    generateNewTask(difficulty, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`prose ${styles.container}`}>
      <Link to="/lineare_funktionen" className={styles.back}>← Zurück</Link>
      <div className={styles.card}>
        <h2 className={styles.title}>Schnittpunkt zweier Geraden berechnen</h2>
        <div className={styles.content}>
          <div className="flex justify-center gap-3 mb-4">
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('easy')}>Leicht</button>
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('medium')}>Mittel</button>
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('hard')}>Schwer</button>
          </div>
          <div className="bg-gray-100 border rounded-md p-6 mb-4 text-center min-h-[80px]">
            <div>{taskText}</div>
            <div className="task-data text-lg font-bold text-sky-800 mt-2" dangerouslySetInnerHTML={{__html: g1}} />
            <div className="task-data text-lg font-bold text-sky-800 mt-2" dangerouslySetInnerHTML={{__html: g2}} />
          </div>
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center gap-2 text-xl font-mono mb-2">
              <span>S(</span>
              <input type="text" className="border rounded px-3 py-2 text-lg w-20 text-center" value={xInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXInput(e.target.value)} placeholder="x" disabled={noIntersection} />
              <span>|</span>
              <input type="text" className="border rounded px-3 py-2 text-lg w-20 text-center" value={yInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYInput(e.target.value)} placeholder="y" disabled={noIntersection} />
              <span>)</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="no-intersection-checkbox" checked={noIntersection} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoIntersection(e.target.checked)} />
              <label htmlFor="no-intersection-checkbox">Die Geraden haben keinen Schnittpunkt.</label>
            </div>
          </div>
          <div className={`min-h-[20px] font-bold mb-2 ${feedbackClass === 'correct' ? 'text-green-700' : feedbackClass === 'incorrect' ? 'text-red-600' : ''}`}>{feedback}</div>
          <div className="flex justify-center gap-3 flex-wrap mb-2">
            <button className="generator-button bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-md px-5 py-2 shadow" onClick={() => generateNewTask(difficulty)}>Neue Aufgabe</button>
            <button className="generator-button bg-green-700 text-white rounded-md px-5 py-2" onClick={checkSolution}>Lösung prüfen</button>
            <button className="generator-button bg-gray-600 text-white rounded-md px-5 py-2" onClick={showAnswer} disabled={showAnswerBtnDisabled}>Lösung anzeigen</button>
            <button className="generator-button bg-blue-700 text-white rounded-md px-5 py-2" onClick={openGeoGebra}>Zeichnerische Lösung</button>
          </div>
          {solutionVisible && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mt-2 text-left text-base" dangerouslySetInnerHTML={{__html: solution}} />
          )}
        </div>
      </div>
    </div>
  )
}
