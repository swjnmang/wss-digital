import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './LFCommon.module.css'
import VideoButton from '../../components/VideoButton'
import TaskShell from '../../components/layout/TaskShell'

declare global {
  interface Window { 
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

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
        if (m2 === 0) m2 = 0.5
        t2 = generateParallel ? t1 : randomInt(10, -10) / randomChoice([1, 2])
        break
      case 'hard':
        m1 = randomInt(300, -300) / 100
        if (m1 === 0) m1 = 1.25
        t1 = randomInt(1000, -1000) / 100
        m2 = generateParallel ? m1 : formatNumber(m1 + (randomInt(200, -200) / 100) + 0.1)
        if (m2 === 0) m2 = 1.25
        t2 = generateParallel ? t1 : randomInt(1000, -1000) / 100
        break
      case 'easy':
      default:
        m1 = randomInt(5, -5)
        if (m1 === 0) m1 = 1
        t1 = randomInt(10, -10)
        do {
          m2 = randomInt(5, -5)
        } while (m1 === m2 || m2 === 0)
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
    <TaskShell title="Schnittpunkt zweier Geraden berechnen" width="narrow">
      <div className={styles.card}>
        <div className={styles.content}>
          <div className="bk-seg mb-4">
            <button className={`bk-seg-btn ${difficulty === 'easy' ? 'bk-seg-btn-on' : ''}`} onClick={() => handleDifficulty('easy')}>Leicht</button>
            <button className={`bk-seg-btn ${difficulty === 'medium' ? 'bk-seg-btn-on' : ''}`} onClick={() => handleDifficulty('medium')}>Mittel</button>
            <button className={`bk-seg-btn ${difficulty === 'hard' ? 'bk-seg-btn-on' : ''}`} onClick={() => handleDifficulty('hard')}>Schwer</button>
          </div>
          <div className="bk-taskbox mb-4 min-h-[80px]">
            <div>{taskText}</div>
            <div className="task-data text-xl font-bold text-ink mt-2" dangerouslySetInnerHTML={{__html: g1}} />
            <div className="task-data text-xl font-bold text-ink mt-2" dangerouslySetInnerHTML={{__html: g2}} />
          </div>
          <div className="flex flex-col items-start mb-2">
            <div className="flex items-center gap-2 text-2xl font-display font-bold mb-3">
              <span>S(</span>
              <input type="text" className="bk-input w-24 text-center" value={xInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXInput(e.target.value)} placeholder="x" disabled={noIntersection} />
              <span>|</span>
              <input type="text" className="bk-input w-24 text-center" value={yInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYInput(e.target.value)} placeholder="y" disabled={noIntersection} />
              <span>)</span>
            </div>
            <div className="flex items-center gap-3 mt-1 min-h-[44px]">
              <input type="checkbox" className="w-6 h-6 accent-black" id="no-intersection-checkbox" checked={noIntersection} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoIntersection(e.target.checked)} />
              <label htmlFor="no-intersection-checkbox">Die Geraden haben keinen Schnittpunkt.</label>
            </div>
          </div>
          {feedback && <div className={`bk-feedback mb-3 ${feedbackClass === 'correct' ? 'bk-feedback-ok' : feedbackClass === 'incorrect' ? 'bk-feedback-no' : 'bk-feedback-info'}`}>{feedback}</div>}
          <div className="bk-actions mb-2">
            <button className="bk-btn" onClick={() => generateNewTask(difficulty)}>Neue Aufgabe</button>
            <button className="bk-btn bk-btn-primary" onClick={checkSolution}>Lösung prüfen</button>
            <button className="bk-btn" onClick={showAnswer} disabled={showAnswerBtnDisabled}>Lösung anzeigen</button>
            <VideoButton url="https://youtu.be/zbc5WmfLDiY" title="Erklärvideo: Schnittpunkt zweier Geraden" />
            <button className="bk-btn" onClick={openGeoGebra}>Zeichnerische Lösung</button>
          </div>
          {solutionVisible && (
            <div className="bk-solution" dangerouslySetInnerHTML={{__html: solution}} />
          )}
        </div>
      </div>
    </TaskShell>
  )
}
