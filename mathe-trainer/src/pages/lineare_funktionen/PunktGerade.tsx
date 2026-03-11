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

  const themaLabels: Record<TaskType, string> = {
    'check_point': 'Punktprobe - Ja/Nein',
    'check_point_calculation': 'Rechnerische Prüfung',
    'find_correct_point': 'Punkt aus 3 Optionen wählen'
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111' }}>Punktprobe bei Geraden</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>Prüfe rechnerisch, ob Punkte auf Geraden liegen</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>⭐ {points} <span style={{ fontSize: '14px', color: '#666', marginLeft: '4px' }}>Punkte</span></div>
        </div>
      </div>

      {/* Difficulty Selection - Only show when not selected */}
      {difficulty === null ? (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>Schwierigkeitsgrad wählen:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => {
                setDifficulty('easy')
                setTimeout(() => handleDifficulty('easy'), 100)
              }}
              style={{
                padding: '16px',
                backgroundColor: '#e5e7eb',
                border: '2px solid #9ca3af',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>Leicht</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>y = m·x ohne Brüche</div>
            </button>
            <button
              onClick={() => {
                setDifficulty('medium')
                setTimeout(() => handleDifficulty('medium'), 100)
              }}
              style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                border: '2px solid #9ca3af',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>Mittel</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>y = m·x + t ganze Zahlen</div>
            </button>
            <button
              onClick={() => {
                setDifficulty('hard')
                setTimeout(() => handleDifficulty('hard'), 100)
              }}
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                border: '2px solid #9ca3af',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>Schwer</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>y = m·x + t mit Brüchen</div>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'flex-start', alignItems: 'center' }}>
            <button
              onClick={() => generateAllTasks(difficulty)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
            >
              🔄 Neue Aufgaben
            </button>
            <button
              onClick={openVideo}
              style={{
                padding: '12px 24px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6d28d9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
            >
              🎥 Erklärvideo
            </button>
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={() => setDifficulty(null)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9ca3af')}
              >
                📊 Schwierigkeitsgrad ändern
              </button>
            </div>
          </div>

          {/* Tasks Container */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  border: task.feedbackClass === 'correct' ? '2px solid #6b7280' : 'none'
                }}
              >
                {/* Card Header */}
                <div style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Aufgabe {index + 1}</span>
                    <span style={{ fontSize: '12px', backgroundColor: '#dbeafe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                      {themaLabels[task.taskType]}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px' }}>
                  <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', marginBottom: '12px', textAlign: 'center', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>{task.taskText}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0369a1', marginBottom: '8px' }} dangerouslySetInnerHTML={{__html: task.equation}} />
                    {task.points && task.points.length === 1 && (
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0369a1' }}>
                        {task.points[0].name}({task.points[0].x}|{task.points[0].y})
                      </div>
                    )}
                    {task.points && task.points.length === 3 && (
                      <div>
                        {task.points.map((p, idx) => (
                          <div key={idx} style={{ fontSize: '14px', fontWeight: 'bold', color: '#0369a1' }}>
                            {p.name}({p.x}|{p.y})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Answer Buttons */}
                  {(task.taskType === 'check_point' || task.taskType === 'check_point_calculation') && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button
                        onClick={() => checkSolution(task.id, true)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => checkSolution(task.id, false)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#9ca3af',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9ca3af')}
                      >
                        Nein
                      </button>
                    </div>
                  )}

                  {task.taskType === 'find_correct_point' && task.points && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {task.points.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => checkSolution(task.id, idx)}
                          style={{
                            padding: '10px',
                            backgroundColor: task.selectedPoint === idx ? '#7c3aed' : '#d1d5db',
                            color: task.selectedPoint === idx ? 'white' : '#1f2937',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            if (task.selectedPoint !== idx) {
                              e.currentTarget.style.backgroundColor = '#b4b8bd'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (task.selectedPoint !== idx) {
                              e.currentTarget.style.backgroundColor = '#d1d5db'
                            }
                          }}
                        >
                          {p.name}({p.x}|{p.y})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  {task.feedback && (
                    <div style={{
                      padding: '10px',
                      marginBottom: '12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: task.feedbackClass === 'correct' ? '#e0f2fe' : '#fef2f2',
                      color: task.feedbackClass === 'correct' ? '#0c4a6e' : '#7f1d1d'
                    }}>
                      {task.feedback}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => showAnswer(task.id)}
                      style={{
                        padding: '10px',
                        backgroundColor: '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9ca3af')}
                    >
                      {task.solutionVisible ? 'Lösung ausblenden' : 'Lösung anzeigen'}
                    </button>
                  </div>
                </div>

                {/* Solution */}
                {task.solutionVisible && (
                  <div style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', borderTop: '1px solid #e5e7eb', color: '#374151', fontSize: '12px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{__html: task.solution}} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
