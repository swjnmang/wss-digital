import { useState, useEffect } from 'react'
import styles from './LFCommon.module.css'

type Difficulty = 'easy' | 'medium' | 'hard'
type TaskType = 'check_point' | 'check_point_calculation' | 'find_correct_point'

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
  taskText: string
  inputValue: string
  selectedPoint?: number
  feedback: string
  feedbackClass: string
  solution: string
  solutionVisible: boolean
  correctAnswer: number | boolean
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
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [tasks, setTasks] = useState<TaskData[]>([])

  function handleDifficulty(level: Difficulty) {
    setDifficulty(level)
    generateAllTasks(level)
  }

  function generateAllTasks(level: Difficulty = difficulty) {
    const newTasks: TaskData[] = [
      generateTask('check_point', level, '1'),
      generateTask('check_point_calculation', level, '2'),
      generateTask('find_correct_point', level, '3'),
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
        t = randomInt(10, -10)
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
      taskData.taskText = 'Berechne, ob der nachfolgende Punkt auf der Geraden liegt.'
      const calcResult = formatNumber(m * p.x + t)
      taskData.solution = `<strong>Probe:</strong> Setze die Koordinaten von ${pointName}(${p.x}|${p.y}) ein.<br />${p.y} = ${m} * ${p.x} + ${t}<br />${p.y} = ${calcResult}<br /><strong>Ergebnis:</strong> Die Aussage ist <strong>${Math.abs(p.y - calcResult) < 0.01 ? 'wahr' : 'falsch'}</strong>.`
      taskData.points = [{ name: pointName, x: p.x, y: p.y }]
    } else if (taskType === 'check_point_calculation') {
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
    } else if (taskType === 'find_correct_point') {
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
    }

    return taskData
  }

  function checkSolution(taskId: string, userAnswer?: number | boolean) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    let isCorrect = false
    if (task.taskType === 'check_point') {
      isCorrect = (userAnswer === task.correctAnswer)
    } else if (task.taskType === 'check_point_calculation') {
      isCorrect = (userAnswer === task.correctAnswer)
    } else if (task.taskType === 'find_correct_point') {
      isCorrect = (userAnswer === task.correctAnswer)
    }

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          feedback: isCorrect ? 'Richtig! Sehr gut!' : 'Leider nicht richtig. Versuche es noch einmal!',
          feedbackClass: isCorrect ? 'correct' : 'incorrect',
          selectedPoint: task.taskType === 'find_correct_point' ? (userAnswer as number) : undefined,
        }
      }
      return t
    })
    setTasks(updatedTasks)
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

  function openVideo() {
    window.open('https://youtu.be/W14DzAUEMCA?si=Mxaz6IO3p8T-N_A', '_blank')
  }

  // On mount, generate first tasks
  useEffect(() => {
    generateAllTasks(difficulty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.card}>
        <h2 className={styles.title}>Punktprobe bei Geraden</h2>
        <div className={styles.content}>
          <div className="flex justify-center gap-3 mb-6">
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('easy')}>Leicht</button>
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('medium')}>Mittel</button>
            <button className={`px-4 py-2 rounded-md border ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => handleDifficulty('hard')}>Schwer</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white border rounded-lg shadow-md p-4">
                <div className="bg-gray-100 border rounded-md p-4 mb-4 text-center min-h-[80px]">
                  <div className="text-sm font-semibold mb-2">{task.taskText}</div>
                  <div className="equation-display text-lg font-bold text-sky-800 mb-2" dangerouslySetInnerHTML={{__html: task.equation}} />
                  {task.points && task.points.length === 1 && (
                    <div className="point-display text-lg font-bold text-sky-800">
                      {task.points[0].name}({task.points[0].x}|{task.points[0].y})
                    </div>
                  )}
                  {task.points && task.points.length === 3 && (
                    <div className="space-y-1">
                      {task.points.map((p, idx) => (
                        <div key={idx} className="text-lg font-bold text-sky-800">
                          {p.name}({p.x}|{p.y})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons for check_point */}
                {task.taskType === 'check_point' && (
                  <div className="flex justify-center gap-2 mb-2">
                    <button className="generator-button bg-green-600 text-white rounded-md px-4 py-2 text-sm" onClick={() => checkSolution(task.id, true)}>Ja</button>
                    <button className="generator-button bg-red-600 text-white rounded-md px-4 py-2 text-sm" onClick={() => checkSolution(task.id, false)}>Nein</button>
                  </div>
                )}

                {/* Buttons for check_point_calculation */}
                {task.taskType === 'check_point_calculation' && (
                  <div className="flex justify-center gap-2 mb-2">
                    <button className="generator-button bg-green-600 text-white rounded-md px-4 py-2 text-sm" onClick={() => checkSolution(task.id, true)}>Ja</button>
                    <button className="generator-button bg-red-600 text-white rounded-md px-4 py-2 text-sm" onClick={() => checkSolution(task.id, false)}>Nein</button>
                  </div>
                )}

                {/* Point selection for find_correct_point */}
                {task.taskType === 'find_correct_point' && task.points && (
                  <div className="space-y-2 mb-3">
                    {task.points.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => checkSolution(task.id, idx)}
                        className={`w-full py-2 px-3 rounded-md text-sm font-semibold transition ${
                          task.selectedPoint === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {p.name}({p.x}|{p.y})
                      </button>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                <div className={`min-h-[20px] font-bold mb-2 text-sm ${task.feedbackClass === 'correct' ? 'text-green-700' : task.feedbackClass === 'incorrect' ? 'text-red-600' : ''}`}>
                  {task.feedback}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button className="generator-button bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-md px-3 py-2 text-sm shadow" onClick={() => generateNewTask(task.id)}>
                    Neue Aufgabe
                  </button>
                  <button className="generator-button bg-gray-600 text-white rounded-md px-3 py-2 text-sm" onClick={() => showAnswer(task.id)}>
                    Lösung anzeigen
                  </button>
                  <button className="generator-button bg-red-700 text-white rounded-md px-3 py-2 text-sm" onClick={openVideo}>
                    Erklärvideo
                  </button>
                </div>

                {/* Solution */}
                {task.solutionVisible && (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mt-3 text-left text-xs" dangerouslySetInnerHTML={{__html: task.solution}} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
