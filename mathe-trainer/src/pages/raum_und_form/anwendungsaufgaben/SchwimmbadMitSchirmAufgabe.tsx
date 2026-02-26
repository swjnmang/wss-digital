import React, { useState } from 'react'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface Solution {
  type: 'number' | 'text'
  answer?: string | number
  tolerance?: number
  unit?: string
  unitOptions?: string[]
}

interface Task {
  id: number
  title: string
  question: string
  solution: Solution
  hint?: string
  image?: string
  imageAlt?: string
}

export default function SchwimmbadMitSchirmAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, { value: string; unit: string }>>({})
  const [feedback, setFeedback] = useState<Record<number, { status: 'correct' | 'incorrect' | ''; message?: string }>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 1',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Familie Frisch möchte in ihrem Garten ein Schwimmbecken bauen. Die Beckenwanne wird aus Beton gegossen, wobei die Bodenplatte 30 cm hoch und die auf der Bodenplatte senkrecht stehenden Seitenwände 20 cm dick sind. Die Beckentiefe beträgt 1,50 m.\n\nBerechnen Sie den Innenradius des Beckens.',
      solution: {
        type: 'number',
        answer: 1.8,
        unit: 'm',
        unitOptions: ['m', 'cm', 'mm'],
        tolerance: 0.009,
      },
      hint: 'r_{innen} = 2\\text{ m} - 0{,}2\\text{ m} = 1{,}80\\text{ m}',
    },
    {
      id: 2,
      title: 'Aufgabe 2',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Am Boden des Schwimmbeckens sollen Spezialfliesen verlegt werden.\n\nBerechnen Sie die zu fliesende Bodenfläche.',
      solution: {
        type: 'number',
        answer: 28.18,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.1409,
      },
      hint: 'A_{kreis} = 1{,}80^2 \\cdot \\pi = 10{,}18\\text{ m}^2 \\quad A_{rechteck} = 5 \\cdot 3{,}60 = 18\\text{ m}^2 \\quad A_{boden} = 28{,}18\\text{ m}^2',
    },
    {
      id: 3,
      title: 'Aufgabe 3',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Berechnen Sie das Wasservolumen bei einer Füllhöhe von 1,40 m.',
      solution: {
        type: 'number',
        answer: 39.45,
        unit: 'm³',
        unitOptions: ['m³', 'Liter', 'cm³'],
        tolerance: 0.19725,
      },
      hint: 'V_{wasser} = 28{,}18 \\cdot 1{,}40 = 39{,}45\\text{ m}^3',
    },
    {
      id: 4,
      title: 'Aufgabe 4',
      image: '/images/schwimmbad1.jpg',
      imageAlt: 'Schwimmbecken mit Beton und Seitenwänden',
      question:
        'Die Innenwand des Schwimmbeckens bekommt einen wasserdichten Anstrich.\n\nBerechnen Sie die Fläche, die gestrichen werden muss.',
      solution: {
        type: 'number',
        answer: 31.96,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.1598,
      },
      hint: 'U_{innenwand} = 2 \\cdot 1{,}80 \\cdot \\pi + 2 \\cdot 5 = 21{,}31\\text{ m} \\quad A_{innenwand} = 21{,}31 \\cdot 1{,}50 = 31{,}96\\text{ m}^2',
    },
    {
      id: 5,
      title: 'Aufgabe 5',
      image: '/images/schwimmbad2.jpg',
      imageAlt: 'Pyramidenförmiger Sonnenschirm',
      question:
        'An einer Seite des Schwimmbeckens wird zur Beschattung ein pyramidenförmiger Sonnenschirm aufgestellt, dessen untere Kanten a = 3 m ein Quadrat bilden. Die Innenhöhe h des Schirmes beträgt 0,50 m.\n\nBerechnen Sie die Stofffläche des Schirmes.',
      solution: {
        type: 'number',
        answer: 9.48,
        unit: 'm²',
        unitOptions: ['m', 'm²', 'm³'],
        tolerance: 0.0474,
      },
      hint: 'h_s^2 = 0{,}5^2 + 1{,}5^2 = 1{,}58\\text{ m} \\quad M = 4 \\cdot \\frac{3 \\cdot 1{,}58}{2} = 9{,}48\\text{ m}^2',
    },
    {
      id: 6,
      title: 'Aufgabe 6',
      image: '/images/schwimmbad2.jpg',
      imageAlt: 'Pyramidenförmiger Sonnenschirm',
      question:
        'Berechnen Sie die Gesamtlänge der 4 Streben s, die von den Ecken des Schirmes zur Spitze verlaufen.',
      solution: {
        type: 'number',
        answer: 8.72,
        unit: 'm',
        unitOptions: ['m', 'cm', 'mm'],
        tolerance: 0.0436,
      },
      hint: 's^2 = 1{,}5^2 + 1{,}58^2 \\Rightarrow s = 2{,}18\\text{ m} \\quad \\text{Gesamtlänge} = 4 \\cdot 2{,}18 = 8{,}72\\text{ m}',
    },
  ]

  const currentTaskData = tasks[currentTask]
  const currentInput = inputs[currentTask] || { value: '', unit: '' }

  const handleInputChange = (value: string) => {
    setInputs({
      ...inputs,
      [currentTask]: { ...currentInput, value },
    })
    setFeedback({ ...feedback, [currentTask]: { status: '' } })
  }

  const handleUnitChange = (unit: string) => {
    setInputs({
      ...inputs,
      [currentTask]: { ...currentInput, unit },
    })
    setFeedback({ ...feedback, [currentTask]: { status: '' } })
  }

  const normalizeNumber = (input: string): number | null => {
    let normalized = input.trim()
    normalized = normalized.replace(/\s/g, '')
    const lastDotIndex = normalized.lastIndexOf('.')
    const lastCommaIndex = normalized.lastIndexOf(',')

    if (lastCommaIndex > lastDotIndex) {
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else if (lastDotIndex > lastCommaIndex && lastCommaIndex > -1) {
      normalized = normalized.replace(/,/g, '')
    } else if (lastCommaIndex > -1 && lastDotIndex === -1) {
      normalized = normalized.replace(',', '.')
    }

    const num = parseFloat(normalized)
    return isNaN(num) ? null : num
  }

  const validateAnswer = () => {
    const solution = currentTaskData.solution

    if (!currentInput.value) {
      setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Bitte gib eine Antwort ein.' } })
      return
    }

    if (!currentInput.unit) {
      setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Bitte wähle eine Einheit aus.' } })
      return
    }

    let isCorrect = false

    if (solution.type === 'number') {
      const numInput = normalizeNumber(currentInput.value)

      if (numInput === null) {
        setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Bitte gib eine gültige Zahl ein.' } })
        return
      }

      if (currentInput.unit !== solution.unit) {
        setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: `Falsche Einheit! Die richtige Einheit ist ${solution.unit}.` } })
        return
      }

      const expectedAnswer = solution.answer as number
      const tolerance = solution.tolerance || expectedAnswer * 0.005

      isCorrect = Math.abs(numInput - expectedAnswer) <= tolerance
    }

    if (isCorrect) {
      setFeedback({ ...feedback, [currentTask]: { status: 'correct' } })
    } else {
      setFeedback({ ...feedback, [currentTask]: { status: 'incorrect', message: 'Leider nicht richtig. Versuche es nochmal!' } })
    }
  }

  const nextTask = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1)
    }
  }

  const prevTask = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1)
    }
  }

  const feedbackState = feedback[currentTask]?.status || ''
  const feedbackMessage = feedback[currentTask]?.message

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">☀️ Schwimmbad mit Schirm</h1>
        <p className="text-lg text-blue-800">Berechne verschiedene Größen rund um ein Schwimmbecken mit Sonnenschirm</p>
      </header>

      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
          <p className="text-blue-900 font-semibold">💡 Tipp: Gib deine Antwort mit der richtigen Einheit ein! Wähle die Einheit aus der Liste.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">{currentTaskData.title}</h2>

            {currentTaskData.image && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <img
                  src={currentTaskData.image}
                  alt={currentTaskData.imageAlt}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <p className="text-lg text-gray-800 mb-6 whitespace-pre-wrap leading-relaxed">{currentTaskData.question}</p>

            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Wert:</label>
                <input
                  type="text"
                  value={currentInput.value}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="z.B. 1,8 oder 1.8"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    feedbackState === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : feedbackState === 'incorrect'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Einheit:</label>
                <select
                  value={currentInput.unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    feedbackState === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : feedbackState === 'incorrect'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Wählen...</option>
                  {currentTaskData.solution.unitOptions?.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {feedbackState === 'correct' && <div className="p-3 bg-green-100 text-green-800 rounded-lg mb-4 font-semibold">✓ Richtig!</div>}

            {feedbackState === 'incorrect' && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-4 font-semibold">
                ✗ {feedbackMessage || 'Leider nicht richtig. Versuche es nochmal!'}
              </div>
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
                <p className="font-semibold text-yellow-900 mb-3">Hinweis:</p>
                <div className="text-yellow-800 flex justify-center">
                  <BlockMath math={currentTaskData.hint} />
                </div>
              </div>
            )}

            <button
              onClick={validateAnswer}
              disabled={feedbackState === 'correct'}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition ${
                feedbackState === 'correct'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
              }`}
            >
              {feedbackState === 'correct' ? 'Korrekt gelöst ✓' : 'Antwort überprüfen'}
            </button>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevTask}
              disabled={currentTask === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentTask === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              ← Zurück
            </button>

            <div className="text-center text-gray-600 font-semibold">
              Aufgabe {currentTask + 1} von {tasks.length}
            </div>

            <button
              onClick={nextTask}
              disabled={currentTask === tasks.length - 1}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentTask === tasks.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              Weiter →
            </button>
          </div>

          <div className="mt-6 flex gap-2 justify-center">
            {tasks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTask(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentTask ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
