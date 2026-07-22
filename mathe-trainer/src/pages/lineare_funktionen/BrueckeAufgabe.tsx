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
const X_MIN = -8
const X_MAX = 8
const Y_MIN = -3
const Y_MAX = 10.5
const SVG_W = 900
const SVG_H = 640
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

const CABLES = [
  { name: 'a', from: [-6, 0] as [number, number], to: [0, 9] as [number, number], color: '#dc2626', eq: 'y = 1,5x + 9', eqAt: [-4.3, 4.05] as [number, number] },
  { name: 'b', from: [4, 0] as [number, number], to: [0, 9] as [number, number], color: '#2563eb', eq: 'y = -2,25x + 9', eqAt: [2.6, 3.4] as [number, number] },
  { name: 'c', from: [6, 0] as [number, number], to: [0, 9] as [number, number], color: '#059669', eq: 'y = -1,5x + 9', eqAt: [4.6, 3.9] as [number, number] },
]

function BrueckenSkizze() {
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" role="img" aria-label="Skizze der Schrägseilbrücke im Koordinatensystem">
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#ffffff" />

      {/* Wasser */}
      <rect x={px(X_MIN)} y={py(0)} width={px(X_MAX) - px(X_MIN)} height={py(Y_MIN) - py(0)} fill="#bfe3f5" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d={`M ${px(X_MIN) + i * 130} ${py(-1) + (i % 2) * 10} q 30 10 60 0 t 60 0`}
          stroke="#8fcbe8"
          strokeWidth={2}
          fill="none"
          opacity={0.7}
        />
      ))}

      {/* Gitternetz */}
      {X_TICKS.map(x => (
        <line key={`gx${x}`} x1={px(x)} y1={py(Y_MIN)} x2={px(x)} y2={py(Y_MAX)} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {Y_TICKS.map(y => (
        <line key={`gy${y}`} x1={px(X_MIN)} y1={py(y)} x2={px(X_MAX)} y2={py(y)} stroke="#e5e7eb" strokeWidth={1} />
      ))}

      {/* Achsen */}
      <line x1={px(X_MIN)} y1={py(0)} x2={px(X_MAX)} y2={py(0)} stroke="#9ca3af" strokeWidth={1.5} />
      <line x1={px(0)} y1={py(Y_MIN)} x2={px(0)} y2={py(Y_MAX)} stroke="#9ca3af" strokeWidth={1.5} />
      {X_TICKS.filter(x => x % 2 === 0).map(x => (
        <text key={`xt${x}`} x={px(x)} y={py(Y_MIN) + 16} fontSize={12} textAnchor="middle" fill="#6b7280">
          {x}
        </text>
      ))}
      {Y_TICKS.filter(y => y % 2 === 0).map(y => (
        <text key={`yt${y}`} x={px(X_MIN) - 10} y={py(y) + 4} fontSize={12} textAnchor="end" fill="#6b7280">
          {y}
        </text>
      ))}

      {/* Pfeiler ins Wasser */}
      {[-6, 6].map(ax => (
        <polygon
          key={`pillar${ax}`}
          points={`${px(ax) - 8},${py(0)} ${px(ax) + 8},${py(0)} ${px(ax) + 4},${py(-1.8)} ${px(ax) - 4},${py(-1.8)}`}
          fill="#94a3b8"
        />
      ))}

      {/* Fahrbahn */}
      <rect x={px(X_MIN + 0.5)} y={py(0.3)} width={px(X_MAX - 0.5) - px(X_MIN + 0.5)} height={py(-0.3) - py(0.3)} fill="#475569" rx={2} />
      <line
        x1={px(X_MIN + 0.5)}
        y1={py(0)}
        x2={px(X_MAX - 0.5)}
        y2={py(0)}
        stroke="#f8fafc"
        strokeWidth={2}
        strokeDasharray="14 10"
      />

      {/* Pylon */}
      <polygon points={`${px(-0.35)},${py(0.3)} ${px(0.35)},${py(0.3)} ${px(0.09)},${py(9)} ${px(-0.09)},${py(9)}`} fill="#334155" />

      {/* Kabel */}
      {CABLES.map(c => (
        <line key={c.name} x1={px(c.from[0])} y1={py(c.from[1])} x2={px(c.to[0])} y2={py(c.to[1])} stroke={c.color} strokeWidth={3.5} />
      ))}
      {CABLES.map(c => (
        <text
          key={`eq${c.name}`}
          x={px(c.eqAt[0])}
          y={py(c.eqAt[1])}
          fontSize={14}
          fontWeight={700}
          fill={c.color}
          stroke="#ffffff"
          strokeWidth={3}
          paintOrder="stroke"
        >
          {c.eq}
        </text>
      ))}

      {/* Inspektionsstrebe (gelb, y = -2/3 x + 5) */}
      <line x1={px(-3)} y1={py(7)} x2={px(3)} y2={py(3)} stroke="#d97706" strokeWidth={3} strokeDasharray="8 6" />
      <text x={px(-3.6)} y={py(7.6)} fontSize={13} fontWeight={700} fill="#d97706" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        Inspektionsstrebe
      </text>

      {/* Punkte */}
      <circle cx={px(0)} cy={py(9)} r={5} fill="#1e3a8a" />
      <text x={px(0.25)} y={py(9) - 10} fontSize={14} fontWeight={700} fill="#1e3a8a" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        T(0|9)
      </text>

      <circle cx={px(-6)} cy={py(0)} r={5} fill="#1e3a8a" />
      <text x={px(-6)} y={py(0) + 22} fontSize={14} fontWeight={700} fill="#1e3a8a" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        A(-6|0)
      </text>

      <circle cx={px(4)} cy={py(0)} r={5} fill="#1e3a8a" />
      <text x={px(4)} y={py(0) + 22} fontSize={14} fontWeight={700} fill="#1e3a8a" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        B(4|0)
      </text>

      <circle cx={px(6)} cy={py(0)} r={5} fill="#1e3a8a" />
      <text x={px(6)} y={py(0) + 22} fontSize={14} fontWeight={700} fill="#1e3a8a" textAnchor="middle" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        C(6|0)
      </text>

      <circle cx={px(1)} cy={py(6)} r={5} fill="#be185d" />
      <text x={px(1.25)} y={py(6) - 10} fontSize={14} fontWeight={700} fill="#be185d" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
        R(1|6)
      </text>
    </svg>
  )
}

export default function BrueckeAufgabe() {
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
        'Bestimme die Funktionsgleichung des roten Kabels a, das durch die Pylon-Spitze T (0|9) und den Ankerpunkt A (-6|0) auf der Fahrbahn verläuft. Die Gleichung hat die Form y = m·x + t. Gib m und t ein.',
      solution: {
        type: 'number',
        labels: ['m', 't'],
        answers: [1.5, 9],
        tolerance: 0.02,
      },
      hint: 'Nutze die zwei Punkte A(-6|0) und T(0|9). Berechne die Steigung m = (9-0)/(0-(-6)) = 1,5. Da T auf der y-Achse liegt, ist t direkt ablesbar: t = 9.',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      question:
        'Ein Wartungsroboter befindet sich am Punkt R (1|6) auf einem der Stahlseile. Das blaue Kabel b verläuft durch die Pylon-Spitze T (0|9) und den Ankerpunkt B (4|0). Prüfe rechnerisch, ob sich der Roboter auf Kabel b befindet. Antworte mit "ja" oder "nein".',
      solution: {
        type: 'text',
        answer: 'nein',
      },
      hint: 'Berechne zuerst die Gleichung von Kabel b: m = (9-0)/(0-4) = -2,25, t = 9, also y = -2,25x + 9. Setze x = 1 ein: y = -2,25 · 1 + 9 = 6,75. Da 6,75 ≠ 6, liegt R nicht auf Kabel b. Antwort: nein.',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      question:
        'Das blaue Kabel b (y = -2,25x + 9) und das grüne Kabel c (y = -1,5x + 9) treffen sich beide oben an der Pylon-Spitze. Berechne rechnerisch die vollständigen Koordinaten dieses Treffpunkts (x- und y-Wert).',
      solution: {
        type: 'number',
        labels: ['x-Wert', 'y-Wert'],
        answers: [0, 9],
        tolerance: 0.1,
      },
      hint: 'Setze beide Funktionsgleichungen gleich: -2,25x + 9 = -1,5x + 9. Das ergibt -0,75x = 0, also x = 0. Einsetzen liefert y = 9. Der Treffpunkt ist die Pylon-Spitze T(0|9).',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      question:
        'Die äußeren Ankerpunkte A (Kabel a) und C (Kabel c) liegen beide auf der Fahrbahn. Eine Längeneinheit entspricht 5 Metern. Wie weit sind die beiden Ankerpunkte entlang der Fahrbahn voneinander entfernt? Gib das Ergebnis in Metern an.',
      solution: {
        type: 'number',
        answer: 60,
        tolerance: 2,
      },
      hint: 'A liegt bei x = -6 und C liegt bei x = 6 (jeweils Nullstellen der Kabelgleichungen). Der Abstand beträgt |6 - (-6)| = 12 Längeneinheiten. In Metern: 12 · 5 = 60 m.',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      question:
        'Für Wartungsarbeiten wird eine gelbe Inspektionsstrebe mit der Funktionsgleichung y = [BRUCH]-2/3[/BRUCH]·x + 5 zwischen zwei Kabeln montiert. Prüfe rechnerisch, ob diese Strebe senkrecht zum roten Kabel a (y = 1,5x + 9) verläuft. Antworte mit "ja" oder "nein".',
      solution: {
        type: 'text',
        answer: 'ja',
      },
      hint: 'Zwei Geraden sind senkrecht zueinander, wenn das Produkt ihrer Steigungen -1 ergibt. Kabel a: m₁ = 1,5 = 3/2. Strebe: m₂ = -2/3. Prüfe: (3/2) · (-2/3) = -1 ✓. Die Strebe ist senkrecht zu Kabel a montiert.',
    },
    {
      id: 6,
      title: 'Aufgabe 6',
      question: 'Ergänze die abgebildete Wertetabelle, die zum grünen Kabel c mit y = -1,5x + 9 gehört. Gib die fehlenden Werte ein.',
      solution: {
        type: 'wertetabelle',
        labels: ['y₁ (x=1)', 'x₂ (y=6)', 'y₃ (x=3)', 'x₄ (y=3)', 'y₅ (x=5)'],
        answers: [7.5, 2, 4.5, 4, 1.5],
        tolerance: 0.05,
      },
      hint: 'Verwende die Gleichung y = -1,5x + 9. Für fehlende y-Werte setze x ein, für fehlende x-Werte löse nach x auf. z.B. y₁: y = -1,5·1 + 9 = 7,5. x₂: 6 = -1,5x + 9 → x = 2.',
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

  const renderQuestion = (question: string) => {
    const parts = question.split(/(\[BRUCH\].*?\[\/BRUCH\])/g)
    return parts.map((part, index) => {
      if (part.startsWith('[BRUCH]') && part.endsWith('[/BRUCH]')) {
        const fractionText = part.replace('[BRUCH]', '').replace('[/BRUCH]', '')
        const [numerator, denominator] = fractionText.split('/')
        return (
          <span key={index} className="inline-flex flex-col items-center mx-0.5 align-middle">
            <span className="text-base font-semibold leading-none">{numerator}</span>
            <span className="border-t-2 border-gray-800 w-6"></span>
            <span className="text-base font-semibold leading-none">{denominator}</span>
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">🌉 Die Schrägseilbrücke</h1>
        <p className="text-lg text-blue-800">Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems</p>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
          <p className="text-yellow-900 font-semibold">💡 Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              Über einen Fluss führt eine Schrägseilbrücke. Von der Spitze des Pylons T aus spannen sich mehrere Stahlseile
              (Kabel) schräg nach unten zur Fahrbahn und werden dort verankert. Die Fahrbahn entspricht der x-Achse. Löse die
              folgenden Aufgaben zu den Kabeln der Brücke.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <BrueckenSkizze />
          </div>

          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">{currentTaskData.title}</h2>
            <p className="text-lg text-gray-800 mb-6 whitespace-normal">{renderQuestion(currentTaskData.question)}</p>

            {currentTaskData.solution.type === 'wertetabelle' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-3">Wertetabelle zum grünen Kabel c: y = -1,5x + 9</p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">x</th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">1</th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['x₂ (y=6)'] || ''}
                          onChange={(e) => handleMultiInputChange('x₂ (y=6)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₂ (y=6)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['x₂ (y=6)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">3</th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">
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
                                : 'border border-blue-300'
                          }`}
                        />
                      </th>
                      <th className="border border-blue-300 px-3 py-2 text-sm font-bold">5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-blue-300 px-3 py-2 font-bold bg-blue-100">y</td>
                      <td className="border border-blue-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₁ (x=1)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₁ (x=1)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₁ (x=1)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₁ (x=1)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </td>
                      <td className="border border-blue-300 px-3 py-2 text-center">6</td>
                      <td className="border border-blue-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₃ (x=3)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₃ (x=3)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₃ (x=3)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₃ (x=3)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
                          }`}
                        />
                      </td>
                      <td className="border border-blue-300 px-3 py-2 text-center">3</td>
                      <td className="border border-blue-300 px-3 py-2 text-center">
                        <input
                          type="text"
                          value={((inputs[currentTask] as Record<string, string>) || {})['y₅ (x=5)'] || ''}
                          onChange={(e) => handleMultiInputChange('y₅ (x=5)', e.target.value)}
                          placeholder="?"
                          className={`w-full px-2 py-1 rounded text-center text-sm focus:outline-none transition ${
                            ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₅ (x=5)'] === 'correct'
                              ? 'border-2 border-green-500 bg-green-50'
                              : ((fieldFeedback[currentTask] as Record<string, string>) || {})['y₅ (x=5)'] === 'incorrect'
                                ? 'border-2 border-red-500 bg-red-50'
                                : 'border border-blue-300'
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
                                : 'border-gray-300 focus:border-blue-500'
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
                        : 'border-gray-300 focus:border-blue-500'
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
                feedbackState === 'correct' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
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
                currentTask === 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
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
                  : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              }`}
            >
              Weiter →
            </button>
          </div>

          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
