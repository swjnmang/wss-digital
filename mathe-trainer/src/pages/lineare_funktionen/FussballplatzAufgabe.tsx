import React, { useState } from 'react'

interface Solution {
  type: 'number' | 'text'
  answer: string | number
  tolerance?: number
}

interface Task {
  id: number
  title: string
  question: string
  solution: Solution
  hint?: string
}

export default function FussballplatzAufgabe() {
  const [currentTask, setCurrentTask] = useState(0)
  const [inputs, setInputs] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Aufgabe 2.1',
      question:
        'Eine Fußballspielerin steht direkt auf Punkt A (−6|−3) und spielt den Ball mit einem geradlinigen Pass zu ihrer Mitspielerin, die in Punkt B (4|3) steht. Berechne die dazugehörige Funktionsgleichung in der Form y = mx + t',
      solution: {
        type: 'text',
        answer: 'y = 0.6x + 0.6',
      },
      hint: 'Nutze die zwei Punkte A(-6|-3) und B(4|3) um m und t zu berechnen.',
    },
    {
      id: 2,
      title: 'Aufgabe 2.2',
      question: 'Berechne die Stelle, an der der Pass von Spielerin A zu Spielerin B den grünen Mittelkreis zum ersten Mal berührt. Gib die x-Koordinate an.',
      solution: {
        type: 'number',
        answer: -1,
        tolerance: 0.1,
      },
      hint: 'Der Mittelkreis hat den Mittelpunkt im Ursprung. Setze die Funktionsgleichung mit dem Kreis gleich.',
    },
    {
      id: 3,
      title: 'Aufgabe 2.3',
      question: 'An welcher Stelle überquert der Pass aus Aufgabe 2.1 die Mittellinie? Eine Berechnung ist nicht notwendig. Gib die y-Koordinate an (Mittellinie = y-Achse).',
      solution: {
        type: 'number',
        answer: 0.6,
        tolerance: 0.1,
      },
      hint: 'Auf der y-Achse ist x = 0. Berechne y für x = 0.',
    },
    {
      id: 4,
      title: 'Aufgabe 2.4',
      question: 'In Punkt H steht ein Spieler, der einen Pass Richtung Punkt I nach rechts spielt. Die dazugehörige Funktionsgleichung laute v: y = −0.3x + 2.2. An welcher Stelle kreuzen sich die beiden Pässe theoretisch? Berechne die x-Koordinate des Schnittpunkts.',
      solution: {
        type: 'number',
        answer: 1.78,
        tolerance: 0.1,
      },
      hint: 'Setze beide Funktionsgleichungen gleich: 0.6x + 0.6 = -0.3x + 2.2',
    },
    {
      id: 5,
      title: 'Aufgabe 2.5',
      question: 'Das Tor zwischen den Punkten F und G ist genau 1 Längeneinheit breit und steht bei x = −8. Ein Spieler schießt den Ball Richtung Tor (Gerade u: y = 2.07x + 16.43). Berechne, ob der Ball in das Tor trifft. Gib die y-Koordinate an, wenn der Ball x = -8 erreicht.',
      solution: {
        type: 'number',
        answer: -0.13,
        tolerance: 0.1,
      },
      hint: 'Berechne y für x = -8: y = 2.07 * (-8) + 16.43',
    },
    {
      id: 6,
      title: 'Aufgabe 2.6',
      question: 'Eine Mitspielerin steht in Punkt K (2|2). Wird sie dem geradlinigen Pass von Spielerin A aus Aufgabe 2.1 im Weg stehen? Berechne die y-Koordinate der Funktionsgleichung bei x = 2.',
      solution: {
        type: 'number',
        answer: 1.8,
        tolerance: 0.1,
      },
      hint: 'Setze x = 2 in die Funktionsgleichung y = 0.6x + 0.6 ein.',
    },
  ]

  const currentTaskData = tasks[currentTask]

  const handleInputChange = (value: string) => {
    setInputs({ ...inputs, [currentTask]: value })
    setFeedback({ ...feedback, [currentTask]: '' })
  }

  const validateAnswer = () => {
    const input = inputs[currentTask]?.trim() || ''
    if (!input) {
      setFeedback({ ...feedback, [currentTask]: 'Bitte gib eine Antwort ein.' })
      return
    }

    const solution = currentTaskData.solution
    let isCorrect = false

    if (solution.type === 'number') {
      const numInput = parseFloat(input.replace(',', '.'))
      if (!isNaN(numInput)) {
        const tolerance = solution.tolerance || 0.01
        isCorrect = Math.abs(numInput - (solution.answer as number)) <= tolerance
      }
    } else {
      isCorrect = input.toLowerCase().replace(/\s+/g, '') === (solution.answer as string).toLowerCase().replace(/\s+/g, '')
    }

    if (isCorrect) {
      setFeedback({ ...feedback, [currentTask]: 'correct' })
    } else {
      setFeedback({ ...feedback, [currentTask]: 'incorrect' })
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

  const feedbackState = feedback[currentTask]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <header className="w-full py-8 px-4 md:px-12 flex flex-col items-center bg-white/80 shadow-sm rounded-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Der Fußballplatz</h1>
        <p className="text-lg text-blue-800">Löse die Aufgaben rechnerisch mit Hilfe des Koordinatensystems</p>
      </header>

      <div className="max-w-4xl mx-auto w-full bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Einleitungstext */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-800 leading-relaxed">
            Im nachfolgenden Bild siehst du ein Fußballfeld, das aus der Vogelperspektive (also von oben) abgebildet ist. Die
            Mittellinie wird durch die y-Achse dargestellt. Alle nachfolgenden Aufgaben müssen rechnerisch gelöst werden. Die
            Ergebnisse dürfen nicht aus dem Koordinatensystem abgelesen werden.
          </p>
        </div>

        {/* Bild Platzhalter */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-400">
          <div className="w-full h-64 flex items-center justify-center bg-white rounded">
            <p className="text-gray-500 text-center">
              [Fußballfeld-Koordinatensystem mit Mittellinie, Mittelkreis, Tor, Punkten A, B, H, I, K, F, G]
              <br />
              <small>Das Bild wird hier eingefügt</small>
            </p>
          </div>
        </div>

        {/* Aktuelle Aufgabe */}
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">{currentTaskData.title}</h2>
          <p className="text-lg text-gray-800 mb-6">{currentTaskData.question}</p>

          {/* Input */}
          <div className="mb-4">
            <input
              type="text"
              value={inputs[currentTask] || ''}
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

          {/* Feedback */}
          {feedbackState === 'correct' && <div className="p-3 bg-green-100 text-green-800 rounded-lg mb-4 font-semibold">✓ Richtig!</div>}

          {feedbackState === 'incorrect' && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-4 font-semibold">✗ Leider nicht richtig. Versuche es nochmal!</div>
          )}

          {/* Lösung anzeigen Button */}
          {feedbackState === 'incorrect' && (
            <button
              onClick={() => setShowSolution({ ...showSolution, [currentTask]: !showSolution[currentTask] })}
              className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"
            >
              {showSolution[currentTask] ? 'Lösung verbergen' : 'Lösung anzeigen'}
            </button>
          )}

          {/* Musterlösung */}
          {showSolution[currentTask] && feedbackState === 'incorrect' && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mb-4">
              <p className="font-semibold text-yellow-900 mb-2">Musterlösung:</p>
              <p className="text-yellow-800">{currentTaskData.hint}</p>
            </div>
          )}

          {/* Button zum Überprüfen */}
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevTask}
            disabled={currentTask === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              currentTask === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
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

        {/* Fortschrittsanzeige */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}
