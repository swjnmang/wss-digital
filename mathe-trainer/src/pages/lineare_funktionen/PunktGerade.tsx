import { useState, useEffect } from 'react'
import TaskShell from '../../components/layout/TaskShell'
import VideoButton from '../../components/VideoButton'

type Difficulty = 'easy' | 'medium' | 'hard'
type TaskType = 'check_point' | 'find_correct_point_among_three' | 'calculate_missing_coordinate'

interface Point {
  name: string
  x: number
  y: number
}

interface TaskData {
  id: string
  taskType: TaskType
  difficulty: Difficulty
  equation: string
  m: number
  t: number
  points?: Point[]
  correctPointIndex?: number
  missingCoordinate?: 'x' | 'y'
  taskText: string
  inputValue: string
  selectedPoint?: number
  feedback: string
  feedbackClass: string
  solution: string
  solutionVisible: boolean
  correctAnswer: number | boolean | string
}

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
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [points, setPoints] = useState(0)

  function handleDifficulty(level: Difficulty) {
    setDifficulty(level)
    generateAllTasks(level)
  }

  function generateAllTasks(level: Difficulty = difficulty || 'easy') {
    const newTasks: TaskData[] = [
      generateTask('check_point', level, '1'),
      generateTask('find_correct_point_among_three', level, '2'),
      generateTask('calculate_missing_coordinate', level, '3'),
    ]
    setTasks(newTasks)
  }

  function generateTask(taskType: TaskType, level: Difficulty, id: string): TaskData {
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
        t = 0
        break
    }
    m = formatNumber(m)
    t = formatNumber(t)
    let m_str = m === 1 ? '' : m === -1 ? '-' : m
    let t_str = t === 0 ? '' : t > 0 ? ` + ${t}` : ` - ${Math.abs(t)}`
    const equation = `g: y = ${m_str}x${t_str}`

    let taskData: TaskData = {
      id,
      taskType,
      difficulty: level,
      equation,
      m,
      t,
      taskText: '',
      inputValue: '',
      feedback: '',
      feedbackClass: '',
      solution: '',
      solutionVisible: false,
      correctAnswer: true,
    }

    if (taskType === 'check_point') {
      const p = { x: randomInt(10, -10), y: 0 }
      const pointName = String.fromCharCode(65 + randomInt(15))
      const isOnLine = Math.random() < 0.5
      if (isOnLine) {
        p.y = formatNumber(m * p.x + t)
        taskData.correctAnswer = true
      } else {
        p.y = formatNumber(m * p.x + t + randomInt(5, 1) * (Math.random() < 0.5 ? 1 : -1))
        taskData.correctAnswer = false
      }
      taskData.taskText = `Prüfe rechnerisch, ob der Punkt auf dem Funktionsgraph zu ${equation.replace('g: ', '')} liegt.`
      const calcResult = formatNumber(m * p.x + t)
      taskData.solution = `<strong>Rechnerische Probe:</strong> Setze x = ${p.x} in die Geradengleichung ein.<br />y = ${m} * ${p.x} + ${t}<br />y = ${calcResult}<br /><strong>Ergebnis:</strong> Die Gleichung ${p.y} = ${calcResult} ist <strong>${Math.abs(p.y - calcResult) < 0.01 ? 'wahr' : 'falsch'}</strong>, also liegt der Punkt ${Math.abs(p.y - calcResult) < 0.01 ? 'auf' : 'nicht auf'} der Geraden.`
      taskData.points = [{ name: pointName, x: p.x, y: p.y }]
    } else if (taskType === 'find_correct_point_among_three') {
      // Generate 3 points, one correct, two incorrect
      const correctX = randomInt(10, -10)
      const correctY = formatNumber(m * correctX + t)
      const correctIdx = randomInt(2)
      
      const points: Point[] = []
      const pointNames = ['A', 'B', 'C']
      
      for (let i = 0; i < 3; i++) {
        if (i === correctIdx) {
          points.push({ name: pointNames[i], x: correctX, y: correctY })
        } else {
          const randomX = randomInt(10, -10)
          const randomY = formatNumber(m * randomX + t + randomInt(5, 1) * (Math.random() < 0.5 ? 1 : -1))
          points.push({ name: pointNames[i], x: randomX, y: randomY })
        }
      }
      
      taskData.points = points
      taskData.correctPointIndex = correctIdx
      taskData.correctAnswer = correctIdx
      taskData.taskText = `Prüfe rechnerisch, welcher der drei Punkte auf dem Funktionsgraph zu ${equation.replace('g: ', '')} liegt.`
      
      let solutionHTML = '<strong>Rechnerische Probe für alle Punkte:</strong><br />'
      for (let i = 0; i < 3; i++) {
        const p = points[i]
        const calcY = formatNumber(m * p.x + t)
        const isCorrect = Math.abs(p.y - calcY) < 0.01
        solutionHTML += `${p.name}(${p.x}|${p.y}): y = ${m} * ${p.x} + ${t} = ${calcY} ${isCorrect ? '✓' : '✗'}<br />`
      }
      solutionHTML += `<strong>Ergebnis:</strong> Der Punkt ${points[correctIdx].name} liegt auf der Geraden.`
      taskData.solution = solutionHTML
    } else if (taskType === 'calculate_missing_coordinate') {
      // Generate a point with either x or y missing
      const missingCoordinate = Math.random() < 0.5 ? 'x' : 'y'
      const pointName = 'A'
      
      let givenX: number, givenY: number
      if (missingCoordinate === 'x') {
        givenY = randomInt(10, -10)
        givenX = formatNumber((givenY - t) / m)
      } else {
        givenX = randomInt(10, -10)
        givenY = formatNumber(m * givenX + t)
      }
      
      taskData.missingCoordinate = missingCoordinate
      const correctAnswer = missingCoordinate === 'x' ? givenX : givenY
      taskData.correctAnswer = correctAnswer.toString()
      
      const displayX = missingCoordinate === 'x' ? '?' : givenX
      const displayY = missingCoordinate === 'y' ? '?' : givenY
      
      taskData.taskText = `Der Punkt ${pointName}(${displayX}|${displayY}) liegt auf der Geraden ${equation.replace('g: ', '')}. Berechne die fehlende Koordinate.`
      taskData.points = [{ name: pointName, x: givenX, y: givenY }]
      
      if (missingCoordinate === 'x') {
        taskData.solution = `<strong>Berechnung von x:</strong><br />Setze y = ${givenY} in die Geradengleichung ein:<br />${givenY} = ${m} * x + ${t}<br />${givenY} - ${t} = ${m} * x<br />x = (${givenY} - ${t}) / ${m}<br /><strong>x = ${givenX}</strong><br /><br />Der Punkt ist ${pointName}(${givenX}|${givenY})`
      } else {
        taskData.solution = `<strong>Berechnung von y:</strong><br />Setze x = ${givenX} in die Geradengleichung ein:<br />y = ${m} * ${givenX} + ${t}<br />y = ${formatNumber(m * givenX)} + ${t}<br /><strong>y = ${givenY}</strong><br /><br />Der Punkt ist ${pointName}(${givenX}|${givenY})`
      }
    }

    return taskData
  }

  function checkSolution(taskId: string, userAnswer?: number | boolean | string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    let isCorrect = false
    if (task.taskType === 'check_point') {
      isCorrect = (userAnswer === task.correctAnswer)
    } else if (task.taskType === 'find_correct_point_among_three') {
      isCorrect = (userAnswer === task.correctAnswer)
    } else if (task.taskType === 'calculate_missing_coordinate') {
      const userNum = parseFloat(userAnswer as string)
      const correctNum = parseFloat(task.correctAnswer as string)
      isCorrect = Math.abs(userNum - correctNum) < 0.01
    }

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          feedback: isCorrect ? 'Richtig! Sehr gut!' : 'Leider nicht richtig. Versuche es noch einmal!',
          feedbackClass: isCorrect ? 'correct' : 'incorrect',
          selectedPoint: task.taskType === 'find_correct_point_among_three' ? (userAnswer as number) : undefined,
          inputValue: task.taskType === 'calculate_missing_coordinate' ? (userAnswer as string) : '',
        }
      }
      return t
    })
    setTasks(updatedTasks)

    if (isCorrect) {
      setPoints(points + 1)
    }

    // Check if all 3 tasks are now correct
    if (updatedTasks.every(t => t.feedbackClass === 'correct')) {
      setTimeout(() => {
        generateAllTasks(difficulty)
      }, 1500)
    }
  }

  function showAnswer(taskId: string) {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, solutionVisible: true }
      }
      return t
    })
    setTasks(updatedTasks)
  }

  function generateNewTask(taskId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newTask = generateTask(task.taskType, difficulty, taskId)
    const updatedTasks = tasks.map(t => (t.id === taskId ? newTask : t))
    setTasks(updatedTasks)
  }

  // On mount, generate first tasks
  useEffect(() => {
    generateAllTasks(difficulty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const themaLabels: Record<TaskType, string> = {
    'check_point': 'Punktprobe - Ja/Nein',
    'find_correct_point_among_three': 'Welcher Punkt liegt auf der Geraden?',
    'calculate_missing_coordinate': 'Berechne die fehlende Koordinate'
  }

  return (
    <TaskShell
      title="Punktprobe bei Geraden"
      subtitle="Prüfe rechnerisch, ob Punkte auf Geraden liegen"
      width="full"
      actions={<span className="bk-streak"><i className="fa-solid fa-star" aria-hidden="true" /> {points} <span style={{ fontSize: 14, fontWeight: 700 }}>Punkte</span></span>}
    >
      {/* Difficulty Selection - Only show when not selected */}
      {difficulty === null ? (
        <div className="bk-panel">
          <h2 className="text-xl font-extrabold text-ink mb-4 text-left">Schwierigkeitsgrad wählen:</h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <button
              onClick={() => {
                setDifficulty('easy')
                setTimeout(() => handleDifficulty('easy'), 100)
              }}
              className="bk-btn flex-col items-start text-left py-4"
              style={{ minHeight: 84 }}
            >
              <span className="text-lg font-extrabold">Leicht</span>
              <span className="text-sm font-medium text-muted">y = m·x ohne Brüche</span>
            </button>
            <button
              onClick={() => {
                setDifficulty('medium')
                setTimeout(() => handleDifficulty('medium'), 100)
              }}
              className="bk-btn flex-col items-start text-left py-4"
              style={{ minHeight: 84 }}
            >
              <span className="text-lg font-extrabold">Mittel</span>
              <span className="text-sm font-medium text-muted">y = m·x + t ganze Zahlen</span>
            </button>
            <button
              onClick={() => {
                setDifficulty('hard')
                setTimeout(() => handleDifficulty('hard'), 100)
              }}
              className="bk-btn flex-col items-start text-left py-4"
              style={{ minHeight: 84 }}
            >
              <span className="text-lg font-extrabold">Schwer</span>
              <span className="text-sm font-medium text-muted">y = m·x + t mit Brüchen</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="bk-actions mb-6">
            <button onClick={() => generateAllTasks(difficulty)} className="bk-btn">
              <i className="fa-solid fa-rotate" aria-hidden="true" /> Neue Aufgaben
            </button>
            <VideoButton url="https://youtu.be/W14DzAUEMCA?si=Mxaz6IO3p8T-N_A" title="Erklärvideo: Punktprobe" />
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => setDifficulty(null)} className="bk-btn">
                <i className="fa-solid fa-sliders" aria-hidden="true" /> Schwierigkeitsgrad ändern
              </button>
            </div>
          </div>

          {/* Tasks Container */}
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border-2 border-edge overflow-hidden flex flex-col"
                style={{ boxShadow: 'var(--shadow-hard)', outline: task.feedbackClass === 'correct' ? '3px solid var(--correct)' : 'none', outlineOffset: -5 }}
              >
                {/* Card Header */}
                <div className="px-4 py-3 bg-sunken border-b-2 border-edge flex justify-between items-center gap-2">
                  <span className="font-extrabold text-ink">Aufgabe {index + 1}</span>
                  <span className="bk-chip" style={{ fontSize: 12 }}>{themaLabels[task.taskType]}</span>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1">
                  <div className="bk-taskbox mb-3 text-center flex flex-col justify-center" style={{ minHeight: 60 }}>
                    <div className="text-sm font-semibold text-ink mb-2">{task.taskText}</div>
                    <div className="text-lg font-bold text-ink mb-2 font-display" dangerouslySetInnerHTML={{__html: task.equation}} />
                    {task.points && task.points.length === 1 && task.taskType !== 'calculate_missing_coordinate' && (
                      <div className="text-lg font-bold text-ink font-display">
                        {task.points[0].name}({task.points[0].x}|{task.points[0].y})
                      </div>
                    )}
                    {task.points && task.points.length === 3 && (
                      <div>
                        {task.points.map((p, idx) => (
                          <div key={idx} className="text-lg font-bold text-ink font-display">
                            {p.name}({p.x}|{p.y})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Answer Buttons for check_point */}
                  {task.taskType === 'check_point' && (
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => checkSolution(task.id, true)} className="bk-btn flex-1">Ja</button>
                      <button onClick={() => checkSolution(task.id, false)} className="bk-btn flex-1">Nein</button>
                    </div>
                  )}

                  {task.taskType === 'find_correct_point_among_three' && task.points && (
                    <div className="flex flex-col gap-2 mb-3">
                      {task.points.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => checkSolution(task.id, idx)}
                          className={`bk-btn ${task.selectedPoint === idx ? 'bk-btn-primary' : ''}`}
                          style={{ minHeight: 48, fontSize: 16 }}
                        >
                          {p.name}({p.x}|{p.y})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Field for calculate_missing_coordinate */}
                  {task.taskType === 'calculate_missing_coordinate' && (
                    <div className="mb-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Dein Ergebnis..."
                          value={task.inputValue}
                          onChange={(e) => {
                            const updatedTasks = tasks.map(t =>
                              t.id === task.id ? { ...t, inputValue: e.target.value } : t
                            )
                            setTasks(updatedTasks)
                          }}
                          className="bk-input flex-1 min-w-0"
                        />
                        <button onClick={() => checkSolution(task.id, task.inputValue)} className="bk-btn bk-btn-primary" style={{ minHeight: 52 }}>
                          Prüfen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {task.feedback && (
                    <div className={`bk-feedback mb-3 ${task.feedbackClass === 'correct' ? 'bk-feedback-ok' : 'bk-feedback-no'}`} style={{ fontSize: 14 }}>
                      {task.feedback}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {task.feedbackClass === 'incorrect' && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => showAnswer(task.id)} className="bk-btn">
                        {task.solutionVisible ? 'Lösung ausblenden' : 'Lösung anzeigen'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Solution */}
                {task.solutionVisible && (
                  <div className="px-4 py-3 bg-sunken border-t-2 border-edge text-ink text-sm" style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{__html: task.solution}} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </TaskShell>
  )
}
