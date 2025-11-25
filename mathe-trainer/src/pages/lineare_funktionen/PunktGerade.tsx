import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './LFCommon.module.css'

type Difficulty = 'easy' | 'medium' | 'hard'
type TaskType = 'check_point' | 'find_y' | 'find_x'

function formatNumber(num: number): number {
  return Math.round(num * 100) / 100
}

function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function PunktGerade() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [taskType, setTaskType] = useState<TaskType>('check_point')
  const [equation, setEquation] = useState('g: y = x + 1')
  const [pointDisplay, setPointDisplay] = useState('A(1|2)')
  const [taskText, setTaskText] = useState('Klicke auf "Neue Aufgabe" um zu starten.')
  const [inputValue, setInputValue] = useState('')
  const [inputPrefix, setInputPrefix] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackClass, setFeedbackClass] = useState('')
  const [showAnswerBtnDisabled, setShowAnswerBtnDisabled] = useState(true)
  const [solution, setSolution] = useState('')
  const [solutionVisible, setSolutionVisible] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState<number|boolean>(true)

  function handleDifficulty(level: Difficulty) {
    setDifficulty(level)
    generateNewTask(level)
  }

  function generateNewTask(level: Difficulty = difficulty) {
    setFeedback('')
    setFeedbackClass('')
    setInputValue('')
    setSolutionVisible(false)
    setShowAnswerBtnDisabled(true)

    let m: number, t: number
    switch (level) {
      case 'medium':
        m = randomChoice([0.5, -0.5, 1.5, -1.5, 2.5, -2.5, randomInt(3, -3)])
        if (m === 0) m = 1.5
        t = randomInt(10, -10) / randomChoice([1, 2])
        break
      case 'hard':
        m = randomInt(300, -300) / 100
        if (m === 0) m = 1.25
        t = randomInt(1000, -1000) / 100
        break
      case 'easy':
      default:
        m = randomInt(5, -5)
        if (m === 0) m = 1
        t = randomInt(10, -10)
        break
    }
    m = formatNumber(m)
    t = formatNumber(t)
    let m_str = m === 1 ? '' : m === -1 ? '-' : m
    let t_str = t === 0 ? '' : t > 0 ? ` + ${t}` : ` - ${Math.abs(t)}`
    setEquation(`g: y = ${m_str}x${t_str}`)

    // Choose task type
    const taskTypeRand = Math.random()
    let newTaskType: TaskType = taskTypeRand < 0.33 ? 'check_point' : taskTypeRand < 0.66 ? 'find_y' : 'find_x'
    setTaskType(newTaskType)

    let p = { x: randomInt(10, -10), y: 0 }
    const pointName = String.fromCharCode(65 + randomInt(15))
    let task = ''
    let pointDisp = ''
    let sol = ''
    let answer: number|boolean = true

    if (newTaskType === 'check_point') {
      const isOnLine = Math.random() < 0.5
      if (isOnLine) {
        p.y = formatNumber(m * p.x + t)
        answer = true
      } else {
        p.y = formatNumber(m * p.x + t + randomInt(5, 1) * (Math.random() < 0.5 ? 1 : -1))
        answer = false
      }
      task = 'Berechne, ob der nachfolgende Punkt auf der Geraden liegt.'
      pointDisp = `${pointName}(${p.x}|${p.y})`
      const calcResult = formatNumber(m * p.x + t)
      sol = `<strong>Probe:</strong> Setze die Koordinaten von ${pointName}(${p.x}|${p.y}) ein.<br />${p.y} = ${m} * ${p.x} + ${t}<br />${p.y} = ${calcResult}<br /><strong>Ergebnis:</strong> Die Aussage ist <strong>${Math.abs(p.y - calcResult) < 0.01 ? 'wahr' : 'falsch'}</strong>.`
      setInputPrefix('')
    } else if (newTaskType === 'find_y') {
      answer = formatNumber(m * p.x + t)
      task = `Der Punkt ${pointName} liegt auf der Geraden. Berechne die fehlende y-Koordinate.`
      pointDisp = `${pointName}(${p.x}|y)`
      setInputPrefix('y = ')
      sol = `<strong>Ansatz:</strong> Setze die x-Koordinate in die Geradengleichung ein.<br />y = ${m} * ${p.x} + ${t}<br />y = ${formatNumber(m * p.x)} + ${t}<br /><strong>Ergebnis:</strong> y = ${answer}`
    } else {
      const temp_x = randomInt(10, -10)
      p.y = formatNumber(m * temp_x + t)
      answer = temp_x
      task = `Der Punkt ${pointName} liegt auf der Geraden. Berechne die fehlende x-Koordinate.`
      pointDisp = `${pointName}(x|${p.y})`
      setInputPrefix('x = ')
      sol = `<strong>Ansatz:</strong> Setze die y-Koordinate ein und löse nach x auf.<br />${p.y} = ${m} * x + ${t}<br />${formatNumber(p.y - t)} = ${m} * x<br /><strong>Ergebnis:</strong> x = ${answer}`
    }
    setTaskText(task)
    setPointDisplay(pointDisp)
    setSolution(sol)
    setCorrectAnswer(answer)
  }

  function checkSolution(userAnswer?: boolean) {
    let isCorrect = false
    if (taskType === 'check_point') {
      isCorrect = (userAnswer === correctAnswer)
    } else {
      if (inputValue.trim() === '') {
        setFeedback('Bitte gib eine Lösung ein.')
        setFeedbackClass('incorrect')
        return
      }
      const userCoord = parseFloat(inputValue.replace(',', '.'))
      isCorrect = Math.abs(Number(userCoord) - Number(correctAnswer)) < 0.01
    }
    if (isCorrect) {
      setFeedback('Richtig! Sehr gut!')
      setFeedbackClass('correct')
      setShowAnswerBtnDisabled(true)
    } else {
      setFeedback('Leider nicht richtig. Versuche es noch einmal!')
      setFeedbackClass('incorrect')
      setShowAnswerBtnDisabled(false)
    }
  }

  function showAnswer() {
    setSolutionVisible(true)
    setShowAnswerBtnDisabled(true)
  }

  function openVideo() {
    window.open('https://youtu.be/W14DzAUEMCA?si=Mxaz6IO3p8T-N_A', '_blank')
  }

  // On mount, generate first task
  useEffect(() => {
    generateNewTask(difficulty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`prose ${styles.container}`}>
      <Link to="/lineare_funktionen" className={styles.back}>← Zurück</Link>
      <div className={styles.card}>
        <h2 className={styles.title}>Punktprobe bei Geraden</h2>
        <div className={styles.content}>
          <div className="flex justify-center gap-3 mb-4">
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('easy')}>Leicht</button>
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('medium')}>Mittel</button>
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('hard')}>Schwer</button>
          </div>
          <div className="bg-gray-100 border rounded-md p-6 mb-4 text-center min-h-[80px]">
            <div>{taskText}</div>
            <div className="equation-display text-xl font-bold text-sky-800 mt-2" dangerouslySetInnerHTML={{__html: equation}} />
            <div className="point-display text-xl font-bold text-sky-800 mt-3" dangerouslySetInnerHTML={{__html: pointDisplay}} />
          </div>
          {/* Input masks */}
          {taskType === 'find_y' && (
            <div className="flex justify-center items-center gap-2 mb-2">
              <span>{inputPrefix}</span>
              <input type="text" className="border rounded px-3 py-2 text-lg w-24 text-center" value={inputValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)} placeholder="Ergebnis" />
            </div>
          )}
          {taskType === 'find_x' && (
            <div className="flex justify-center items-center gap-2 mb-2">
              <span>{inputPrefix}</span>
              <input type="text" className="border rounded px-3 py-2 text-lg w-24 text-center" value={inputValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)} placeholder="Ergebnis" />
            </div>
          )}
          {taskType === 'check_point' && (
            <div className="flex justify-center gap-4 mb-2">
              <button className="generator-button bg-green-600 text-white rounded-md px-5 py-2" onClick={() => checkSolution(true)}>Ja</button>
              <button className="generator-button bg-red-600 text-white rounded-md px-5 py-2" onClick={() => checkSolution(false)}>Nein</button>
            </div>
          )}
          {/* Feedback */}
          <div className={`min-h-[20px] font-bold mb-2 ${feedbackClass === 'correct' ? 'text-green-700' : feedbackClass === 'incorrect' ? 'text-red-600' : ''}`}>{feedback}</div>
          {/* Buttons */}
          <div className="flex justify-center gap-3 flex-wrap mb-2">
            <button className="generator-button bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-md px-5 py-2 shadow" onClick={() => generateNewTask(difficulty)}>Neue Aufgabe</button>
            {(taskType === 'find_y' || taskType === 'find_x') && (
              <button className="generator-button bg-green-700 text-white rounded-md px-5 py-2" onClick={() => checkSolution()}>Lösung prüfen</button>
            )}
            <button className="generator-button bg-gray-600 text-white rounded-md px-5 py-2" onClick={showAnswer} disabled={showAnswerBtnDisabled}>Lösung anzeigen</button>
            <button className="generator-button bg-red-700 text-white rounded-md px-5 py-2" onClick={openVideo}>Erklärvideo</button>
          </div>
          {/* Lösungsausgabe */}
          {solutionVisible && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mt-2 text-left text-base" dangerouslySetInnerHTML={{__html: solution}} />
          )}
        </div>
      </div>
    </div>
  )
}
