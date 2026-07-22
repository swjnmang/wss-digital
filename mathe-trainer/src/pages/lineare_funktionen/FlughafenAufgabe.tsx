import React, { useState } from 'react'

interface Solution {
  type: 'number' | 'text' | 'wertetabelle'
  answer?: string | number
  tolerance?: number
  labels?: string[] // für mehrteilige Antworten (z.B. x, y)
  answers?: (string | number)[] // für mehrteilige Antworten
}

interface Task {
  id: number
  title: string
  question: string
  solution: Solution
  hint?: string
}

// --- Koordinatensystem-Hilfsfunktionen für die Skizze ---
const X_MIN = -9
const X_MAX = 8
const Y_MIN = -3
const Y_MAX = 10
const SVG_W = 900
const SVG_H = 600
const PAD_L = 50
const PAD_R = 30
const PAD_T = 25
const PAD_B = 35
const PLOT_W = SVG_W - PAD_L - PAD_R
const PLOT_H = SVG_H - PAD_T - PAD_B
const SCALE = Math.min(PLOT_W / (X_MAX - X_MIN), PLOT_H / (Y_MAX - Y_MIN))
const OFFSET_X = PAD_L + (PLOT_W - (X_MAX - X_MIN) * SCALE) / 2
const OFFSET_Y = PAD_T + (PLOT_H - (Y_MAX - Y_MIN) * SCALE) / 2
const px = (x: number) => OFFSET_X + (x - X_MIN) * SCALE
const py = (y: number) => OFFSET_Y + (Y_MAX - y) * SCALE

const X_TICKS: number[] = []
for (let x = Math.ceil(X_MIN); x <= Math.floor(X_MAX); x++) X_TICKS.push(x)
const Y_TICKS: number[] = []
for (let y = Math.ceil(Y_MIN); y <= Math.floor(Y_MAX); y++) Y_TICKS.push(y)

function Flugzeug({ x, y, angleDeg, color = '#dc2626' }: { x: number; y: number; angleDeg: number; color?: string }) {
  const cx = px(x)
  const cy = py(y)
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angleDeg})`}>
      <path d="M 0,-14 L 4,4 L 14,10 L 14,13 L 4,10 L 5,17 L 9,20 L 9,22 L 0,20 L -9,22 L -9,20 L -5,17 L -4,10 L -14,13 L -14,10 L -4,4 Z" fill={color} stroke="#7f1d1d" strokeWidth={0.8} />
    </g>
  )
}

function FlughafenSkizze() {
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" role="img" aria-label="Skizze des Flughafens mit zwei Start- und Landebahnen im Koordinatensystem">
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#ffffff" />
      <rect x={px(X_MIN)} y={py(Y_MAX)} width={px(X_MAX) - px(X_MIN)} height={py(Y_MIN) - py(Y_MAX)} fill="#eaf6ec" />

      {/* Gitternetz */}
      {X_TICKS.map(x => (
        <line key={`gx${x}`} x1={px(x)} y1={py(Y_MIN)} x2={px(x)} y2={py(Y_MAX)} stroke="#d9e8dc" strokeWidth={1} />
      ))}
      {Y_TICKS.map(y => (
        <line key={`gy${y}`} x1={px(X_MIN)} y1={py(y)} x2={px(X_MAX)} y2={py(y)} stroke="#d9e8dc" strokeWidth={1} />
      ))}

      {/* Achsen */}
      <line x1={px(X_MIN)} y1={py(0)} x2={px(X_MAX)} y2={py(0)} stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={px(0)} y1={py(Y_MIN)} x2={px(0)} y2={py(Y_MAX)} stroke="#94a3b8" strokeWidth={1.5} />
      {X_TICKS.filter(x => x % 2 === 0).map(x => (
        <text key={`xt${x}`} x={px(x)} y={py(Y_MIN) + 16} fontSize={12} textAnchor="middle" fill="#64748b">
          {x}
        </text>
      ))}
      {Y_TICKS.filter(y => y % 2 === 0).map(y => (
        <text key={`yt${y}`} x={px(X_MIN) - 10} y={py(y) + 4} fontSize={12} textAnchor="end" fill="#64748b">
          {y}
        </text>
      ))}
      <text x={px(X_MAX) - 4} y={py(0) - 8} fontSize={11} fill="#94a3b8" textAnchor="end">
        Flughafenzaun
      </text>

      {/* Rollweg (Taxiway), y = -x */}
      <line x1={px(-6)} y1={py(6)} x2={px(2)} y2={py(-2)} stroke="#57534e" strokeWidth={9} strokeLinecap="round" />
      <line x1={px(-6)} y1={py(6)} x2={px(2)} y2={py(-2)} stroke="#facc15" strokeWidth={1.5} strokeDasharray="6 6" />
      <text x={px(-4.6)} y={py(4.2)} fontSize={12} fontWeight={700} fill="#57534e" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        Rollweg
      </text>

      {/* Startbahn 2 (Gleichung nur im Aufgabentext gegeben) */}
      <line x1={px(-1.75)} y1={py(10.5)} x2={px(4.75)} y2={py(-2.5)} stroke="#475569" strokeWidth={16} strokeLinecap="round" />
      <line x1={px(-1.75)} y1={py(10.5)} x2={px(4.75)} y2={py(-2.5)} stroke="#f8fafc" strokeWidth={2} strokeDasharray="10 8" />

      {/* Startbahn 1, verläuft durch P und Q (siehe Aufgabe 1) */}
      <line x1={px(-8.9)} y1={py(-2.45)} x2={px(6.1)} y2={py(5.05)} stroke="#334155" strokeWidth={16} strokeLinecap="round" />
      <line x1={px(-8.9)} y1={py(-2.45)} x2={px(6.1)} y2={py(5.05)} stroke="#f8fafc" strokeWidth={2} strokeDasharray="10 8" />

      <text x={px(-3)} y={py(-0.8)} fontSize={12} fontWeight={700} fill="#1e293b" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        Startbahn 1
      </text>
      <text x={px(1.9)} y={py(6.6)} fontSize={12} fontWeight={700} fill="#475569" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        Startbahn 2
      </text>

      {/* Tower */}
      <g>
        <rect x={px(-6) - 7} y={py(6)} width={14} height={py(0) - py(6) - 40} fill="#78716c" />
        <circle cx={px(-6)} cy={py(6) - 10} r={12} fill="#e2e8f0" stroke="#78716c" strokeWidth={2} />
      </g>
      <text x={px(-6)} y={py(6) - 28} fontSize={12} fontWeight={700} fill="#57534e" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        Tower
      </text>

      {/* Punkte - nur P und Q sind beschriftet (werden für Aufgabe 1 benötigt).
          Der Kreuzungspunkt der Bahnen wird bewusst NICHT markiert, da er die
          Lösung von Aufgabe 3 ist und rechnerisch ermittelt werden muss. */}
      {[
        { p: [-8.4, -2.2], label: 'P(-8,4|-2,2)', dy: 18 },
        { p: [5.6, 4.8], label: 'Q(5,6|4,8)', dy: -12 },
      ].map(({ p, label, dy }) => (
        <g key={label}>
          <circle cx={px(p[0])} cy={py(p[1])} r={5} fill="#1e3a8a" />
          <text x={px(p[0])} y={py(p[1]) + dy} fontSize={13} fontWeight={700} fill="#1e3a8a" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
            {label}
          </text>
        </g>
      ))}

      {/* Flugzeug am Punkt F(4|3.8) */}
      <Flugzeug x={4} y={3.8} angleDeg={-27} />
      <text x={px(4)} y={py(3.8) - 24} fontSize={13} fontWeight={700} fill="#be185d" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        F(4|3,8)
      </text>
    </svg>
  )
}

export default function FlughafenAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, string | Record<string, string>>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [fieldFeedback, setFieldFeedback] = useState<Record<number, Record<string, 'correct' | 'incorrect' | ''>>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 1',
      question:
        'Bestimme die Funktionsgleichung von Startbahn 1, die durch die Punkte P (-8,4|-2,2) und Q (5,6|4,8) verläuft. Die Gleichung hat die Form y = m·x + t. Gib m und t ein.',
      solution: {
        type: 'number',
        labels: ['m', 't'],
        answers: [0.5, 2],
        tolerance: 0.02,
      },
      hint: 'Nutze die zwei Punkte P(-8,4|-2,2) und Q(5,6|4,8). Berechne m = (4,8-(-2,2))/(5,6-(-8,4)) = 7/14 = 0,5. Setze einen Punkt ein, um t zu ermitteln: -2,2 = 0,5·(-8,4) + t → t = 2.',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      question:
        'Ein Flugzeug befindet sich kurz vor dem Start am Punkt F (4|3,8). Prüfe rechnerisch, ob sich das Flugzeug exakt auf der Mittellinie von Startbahn 1 (y = 0,5x + 2) befindet. Antworte mit "ja" oder "nein".',
      solution: {
        type: 'text',
        answer: 'nein',
      },
      hint: 'Setze x = 4 in die Gleichung ein: y = 0,5 · 4 + 2 = 4. Da der tatsächliche y-Wert 3,8 ist und 4 ≠ 3,8, liegt das Flugzeug nicht exakt auf der Mittellinie. Antwort: nein.',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      question:
        'Startbahn 1 (y = 0,5x + 2) und Startbahn 2 (y = -2x + 7) kreuzen sich am Punkt K. Berechne rechnerisch die vollständigen Koordinaten dieses Kreuzungspunkts (x- und y-Wert).',
      solution: {
        type: 'number',
        labels: ['x-Wert', 'y-Wert'],
        answers: [2, 3],
        tolerance: 0.1,
      },
      hint: 'Setze beide Funktionsgleichungen gleich: 0,5x + 2 = -2x + 7. Das ergibt 2,5x = 5, also x = 2. Einsetzen liefert y = 0,5 · 2 + 2 = 3. Der Kreuzungspunkt ist K(2|3).',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      question:
        'Aus Sicherheitsgründen dürfen sich kreuzende Start- und Landebahnen nur in einem rechten Winkel schneiden. Prüfe rechnerisch, ob Startbahn 1 und Startbahn 2 senkrecht zueinander verlaufen. Antworte mit "ja" oder "nein".',
      solution: {
        type: 'text',
        answer: 'ja',
      },
      hint: 'Zwei Geraden sind senkrecht zueinander, wenn das Produkt ihrer Steigungen -1 ergibt. Startbahn 1: m₁ = 0,5. Startbahn 2: m₂ = -2. Prüfe: 0,5 · (-2) = -1 ✓. Die Bahnen kreuzen sich im rechten Winkel.',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      question:
        'Beide Startbahnen überqueren den Flughafenzaun, der durch die x-Achse dargestellt wird. Eine Längeneinheit entspricht 100 Metern. Wie weit liegen die beiden Punkte, an denen die Startbahnen den Zaun kreuzen, auseinander? Gib das Ergebnis in Metern an.',
      solution: {
        type: 'number',
        answer: 750,
        tolerance: 20,
      },
      hint: 'Nullstelle Startbahn 1: 0 = 0,5x + 2 → x = -4. Nullstelle Startbahn 2: 0 = -2x + 7 → x = 3,5. Abstand: |3,5 - (-4)| = 7,5 Längeneinheiten. In Metern: 7,5 · 100 = 750 m.',
    },
    {
      id: 6,
      title: 'Aufgabe 6',
      question: 'Ergänze die abgebildete Wertetabelle, die zu Startbahn 1 mit y = 0,5x + 2 gehört. Gib die fehlenden Werte ein.',
      solution: {
        type: 'wertetabelle',
        labels: ['y₁ (x=-4)', 'x₂ (y=1)', 'y₃ (x=0)', 'x₄ (y=3)', 'y₅ (x=4)'],
        answers: [0, -2, 2, 2, 4],
        tolerance: 0.05,
      },
      hint: 'Verwende die Gleichung y = 0,5x + 2. Für fehlende y-Werte setze x ein, für fehlende x-Werte löse nach x auf. z.B. y₁: y = 0,5·(-4) + 2 = 0. x₂: 1 = 0,5x + 2 → x = -2.',
    },
  ]

  const currentTaskData = tasks[currentTask]

  const handleInputChange = (value: string) => {
    setInputs({ ...inputs, [currentTask]: value })
    setFeedback({ ...feedback, [currentTask]: '' })
  }

  const handleMultiInputChange = (key: string, value: string) => {
    const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
    setInputs({ ...inputs, [currentTask]: { ...currentInputs, [key]: value } })
    setFeedback({ ...feedback, [currentTask]: '' })

    if (currentTaskData.solution.type === 'wertetabelle' && value.trim()) {
      validateTableField(key, value)
    } else if (!value.trim()) {
      setFieldFeedback({
        ...fieldFeedback,
        [currentTask]: { ...((fieldFeedback[currentTask] as Record<string, string>) || {}), [key]: '' },
      })
    }
  }

  const validateTableField = (key: string, value: string) => {
    const solution = currentTaskData.solution
    const roundTo2Decimals = (num: number): number => Math.round(num * 100) / 100

    if (!solution.labels || !solution.answers) return

    const labelIndex = solution.labels.indexOf(key)
    if (labelIndex === -1) return

    const normalizedInput = value.replace(/,/g, '.')
    const numInput = parseFloat(normalizedInput)
    const expectedAnswer = solution.answers[labelIndex] as number

    let isCorrect = false
    if (!isNaN(numInput)) {
      if (solution.tolerance !== undefined) {
        isCorrect = Math.abs(numInput - expectedAnswer) <= solution.tolerance
      } else {
        isCorrect = roundTo2Decimals(numInput) === roundTo2Decimals(expectedAnswer)
      }
    }

    setFieldFeedback({
      ...fieldFeedback,
      [currentTask]: { ...((fieldFeedback[currentTask] as Record<string, string>) || {}), [key]: isCorrect ? 'correct' : 'incorrect' },
    })
  }

  const validateAnswer = () => {
    const solution = currentTaskData.solution
    let isCorrect = false

    const roundTo2Decimals = (num: number): number => Math.round(num * 100) / 100

    if (solution.answers && solution.labels) {
      const currentInputs = (inputs[currentTask] as Record<string, string>) || {}

      const allFilled = solution.labels.every(label => currentInputs[label]?.trim())
      if (!allFilled) {
        setFeedback({ ...feedback, [currentTask]: 'Bitte fülle alle Felder aus.' })
        return
      }

      isCorrect = true
      for (let i = 0; i < solution.labels.length; i++) {
        const label = solution.labels[i]
        const input = currentInputs[label]?.trim() || ''
        const normalizedInput = input.replace(/,/g, '.')
        const numInput = parseFloat(normalizedInput)
        const expectedAnswer = solution.answers[i] as number

        if (isNaN(numInput) || roundTo2Decimals(numInput) !== roundTo2Decimals(expectedAnswer)) {
          isCorrect = false
          break
        }
      }
    } else {
      const input = (inputs[currentTask] as string)?.trim() || ''
      if (!input) {
        setFeedback({ ...feedback, [currentTask]: 'Bitte gib eine Antwort ein.' })
        return
      }

      if (solution.type === 'number') {
        const normalizedInput = input.replace(/,/g, '.')
        const numInput = parseFloat(normalizedInput)
        if (!isNaN(numInput)) {
          const expectedAnswer = solution.answer as number
          if (solution.tolerance !== undefined) {
            isCorrect = Math.abs(numInput - expectedAnswer) <= solution.tolerance
          } else {
            isCorrect = roundTo2Decimals(numInput) === roundTo2Decimals(expectedAnswer)
          }
        }
      } else {
        const normalizedInput = input.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.')
        const normalizedAnswer = (solution.answer as string).toLowerCase().replace(/\s+/g, '').replace(/,/g, '.')
        isCorrect = normalizedInput === normalizedAnswer
      }
    }

    setFeedback({ ...feedback, [currentTask]: isCorrect ? 'correct' : 'incorrect' })
  }

  const nextTask = () => {
    if (currentTask < tasks.length - 1) setCurrentTask(currentTask + 1)
  }

  const prevTask = () => {
    if (currentTask > 0) setCurrentTask(currentTask - 1)
  }

  const feedbackState = feedback[currentTask]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 to-cyan-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-sky-900">✈️ Der Flughafen</h1>
        <p className="text-lg text-sky-800">Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems</p>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
          <p className="text-yellow-900 font-semibold">💡 Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6 p-4 bg-sky-50 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              In der Vogelperspektive siehst du einen Flughafen mit zwei sich kreuzenden Start- und Landebahnen sowie einem
              Rollweg zum Tower. Löse die folgenden Aufgaben zu den Bahnen des Flughafens.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <FlughafenSkizze />
          </div>

          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-sky-500">
            <h2 className="text-2xl font-bold text-sky-900 mb-3">{currentTaskData.title}</h2>
            <p className="text-lg text-gray-800 mb-6 whitespace-normal">{currentTaskData.question}</p>

            {currentTaskData.solution.type === 'wertetabelle' && (
              <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
                <p className="text-sm font-semibold text-sky-900 mb-3">Wertetabelle zu Startbahn 1: y = 0,5x + 2</p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-sky-200">
                      <th className="border border-sky-300 px-3 py-2 text-sm font-bold">x</th>
                      <th className="border border-sky-300 px-3 py-2 text-sm font-bold">-4</th>
                      <th className="border border-sky-300 px-3 py-2 text-sm font-bold">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['x₂ (y=1)'] || ''}
                          onChange={(e) => handleMultiInputChange('x₂ (y=1)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₂ (y=1)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₂ (y=1)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-sky-300'
                          }`}
                        />
                      </th>
                      <th className="border border-sky-300 px-3 py-2 text-sm font-bold">0</th>
                      <th className="border border-sky-300 px-3 py-2 text-sm font-bold">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['x₄ (y=3)'] || ''}
                          onChange={(e) => handleMultiInputChange('x₄ (y=3)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₄ (y=3)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₄ (y=3)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-sky-300'
                          }`}
                        />
                      </th>
                      <th className="border border-sky-300 px-3 py-2 text-sm font-bold">4</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-sky-300 px-3 py-2 font-bold bg-sky-100">y</td>
                      <td className="border border-sky-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₁ (x=-4)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₁ (x=-4)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₁ (x=-4)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₁ (x=-4)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-sky-300'
                          }`}
                        />
                      </td>
                      <td className="border border-sky-300 px-3 py-2 text-center">1</td>
                      <td className="border border-sky-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₃ (x=0)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₃ (x=0)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₃ (x=0)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₃ (x=0)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-sky-300'
                          }`}
                        />
                      </td>
                      <td className="border border-sky-300 px-3 py-2 text-center">3</td>
                      <td className="border border-sky-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₅ (x=4)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₅ (x=4)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₅ (x=4)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₅ (x=4)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-sky-300'
                          }`}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {currentTaskData.solution.answers && currentTaskData.solution.labels ? (
              currentTaskData.solution.type === 'wertetabelle' ? null : (
                <div className="mb-4 space-y-3">
                  {currentTaskData.solution.labels.map((label, index) => {
                    const currentInputs = (inputs[currentTask] as Record<string, string>) || {}
                    return (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                        <input
                          type="text"
                          value={currentInputs[label] || ''}
                          onChange={(e) => handleMultiInputChange(label, e.target.value)}
                          placeholder={`Gib den ${label} ein...`}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                            feedbackState === 'correct'
                              ? 'border-green-500 bg-green-50'
                              : feedbackState === 'incorrect'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-sky-500'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  value={(inputs[currentTask] as string) || ''}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Gib deine Antwort ein..."
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    feedbackState === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : feedbackState === 'incorrect'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-sky-500'
                  }`}
                />
              </div>
            )}

            {feedbackState === 'correct' && <div className="p-3 bg-green-100 text-green-800 rounded-lg mb-4 font-semibold">✓ Richtig!</div>}

            {feedbackState === 'incorrect' && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-4 font-semibold">✗ Leider nicht richtig. Versuche es nochmal!</div>
            )}

            {feedbackState === 'incorrect' && (
              <button
                onClick={() => setShowSolution({ ...showSolution, [currentTask]: !showSolution[currentTask] })}
                className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"
              >
                {showSolution[currentTask] ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            )}

            {showSolution[currentTask] && feedbackState === 'incorrect' && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mb-4">
                <p className="font-semibold text-yellow-900 mb-2">Hinweis:</p>
                <p className="text-yellow-800">{currentTaskData.hint}</p>
              </div>
            )}

            <button
              onClick={validateAnswer}
              disabled={feedbackState === 'correct'}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition ${
                feedbackState === 'correct' ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 cursor-pointer'
              }`}
            >
              {feedbackState === 'correct' ? 'Korrekt gelöst ✓' : 'Antwort überprüfen'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={prevTask}
              disabled={currentTask === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentTask === 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white cursor-pointer'
              }`}
            >
              ← Zurück
            </button>

            <div className="text-gray-700 font-semibold">
              Aufgabe {currentTask + 1} von {tasks.length}
            </div>

            <button
              onClick={nextTask}
              disabled={currentTask === tasks.length - 1}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentTask === tasks.length - 1
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 text-white cursor-pointer'
              }`}
            >
              Weiter →
            </button>
          </div>

          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
