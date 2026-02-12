import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './LFCommon.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'

export default function Zeichnen(){
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('easy')
  const [equation, setEquation] = useState<string>('y = 2x + 1')
  const [rangeHint, setRangeHint] = useState<string>('')
  const [showTipps, setShowTipps] = useState<boolean>(false)
  const [showSolution, setShowSolution] = useState<boolean>(false)
  const [m, setM] = useState<number>(2)
  const [t, setT] = useState<number>(1)

  useEffect(() => {
    generateNewTask(difficulty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  function toFraction(decimal: number): string | number {
    if (decimal === 0) return '0'
    if (Math.abs(decimal) === 0.5) return (decimal > 0 ? '' : '-') + '1/2'
    if (Math.abs(decimal) === 0.25) return (decimal > 0 ? '' : '-') + '1/4'
    if (Math.abs(decimal) === 0.75) return (decimal > 0 ? '' : '-') + '3/4'
    if (Math.abs(decimal) === 1/3) return (decimal > 0 ? '' : '-') + '1/3'
    if (Math.abs(decimal) === 2/3) return (decimal > 0 ? '' : '-') + '2/3'
    return decimal
  }

  function formatNumber(num: number): string | number {
    const roundedNum = Math.round(num * 100) / 100
    const fraction = toFraction(roundedNum)
    if (fraction !== roundedNum) return fraction
    return roundedNum
  }

  function generateNewTask(level: 'easy'|'medium'|'hard'){
    let m: number, t: number
    let m_str: string, t_str: string

    const randomInt = (max: number, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min
    const randomChoice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

    switch (level) {
      case 'medium':
        m = randomChoice<number | any>([randomInt(2, -2), 0.5, -0.5, 1.5, -1.5, 2.5, -2.5])
        if (m === 0) m = 1.5
        t = randomChoice<number>([randomInt(5, -5), randomInt(9, -9) / 2])
        break
      case 'hard':
        const numerators = [-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9]
        const denominators = [3,4,5]
        m = randomChoice(numerators) / randomChoice(denominators)
        m = Math.max(-3, Math.min(3, m))
        if (Math.abs(m) < 0.1) m = 2/3
        t = randomChoice(numerators.slice(4,-4)) / randomChoice(denominators)
        t = Math.round(t * 4) / 4
        break
      case 'easy':
      default:
        m = randomInt(3, -3)
        if (m === 0) m = 1
        t = randomInt(8, -8)
        break
    }

    if (m === 1) m_str = 'x'
    else if (m === -1) m_str = '-x'
    else if (level === 'hard') m_str = `(${formatNumber(m)})x`
    else m_str = `${formatNumber(m)}x`

    if (t === 0) t_str = ''
    else if (t > 0) t_str = ` + ${formatNumber(t)}`
    else t_str = ` - ${formatNumber(Math.abs(t))}`

    const eq = `y = ${m_str}${t_str}`
    setEquation(eq)

    setRangeHint('Ein guter Zeichenbereich für die x-Achse ist von -5 bis +5, die Länge der y-Achse musst du selbst festlegen, häufig reicht hier ebenfalls -5 bis +5.')

    setM(m)
    setT(t)
    setShowSolution(false)
  }

  function openGeoGebra(){
    setShowSolution(true)
  }

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.card}>
        <h2 className={styles.title}>Lineare Funktionen zeichnen</h2>

        <div className={styles.content}>
          <div id="difficulty-selector" className="flex justify-center gap-3 mb-4">
            <button
              className={`px-4 py-2 rounded-md border ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setDifficulty('easy')}
            >Leicht</button>
            <button
              className={`px-4 py-2 rounded-md border ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setDifficulty('medium')}
            >Mittel</button>
            <button
              className={`px-4 py-2 rounded-md border ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setDifficulty('hard')}
            >Schwer</button>
          </div>

          <div id="task-output" className="bg-gray-100 border rounded-md p-6 mb-4 text-center">
            <div id="task-text">Zeichne den Graphen der folgenden Funktion in ein Koordinatensystem.</div>
            <div id="task-equation" className="text-2xl font-bold text-sky-800 mt-2">{equation}</div>
            <div id="drawing-range-hint" className="text-sm text-gray-600 mt-3">{rangeHint}</div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="generator-button bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-md px-5 py-3 shadow" onClick={() => generateNewTask(difficulty)}>Neue Aufgabe</button>
            <button className="generator-button bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-md px-5 py-3 shadow" onClick={() => setShowTipps(true)}>Tipps</button>
            <button className="generator-button bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-md px-5 py-3 shadow" onClick={openGeoGebra}>Lösungskontrolle anzeigen</button>
          </div>

          {showSolution && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-600">Lösungsgraph</h3>
                <button
                  onClick={() => setShowSolution(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
              <GeoGebraGraph 
                m={m} 
                t={t} 
                width="100%" 
                height={500}
              />
            </div>
          )}
        </div>
      </div>

      {showTipps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-blue-600">Tipps zum Zeichnen von Funktionsgraphen</h3>
              <button
                onClick={() => setShowTipps(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">1. Wertetabelle erstellen</h4>
                <p className="text-gray-700 mb-3">Erstelle eine Wertetabelle, indem du mehrere x-Werte in die Funktionsgleichung einsetzt und die entsprechenden y-Werte berechnest.</p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 text-sm text-gray-700">
                  <strong>Beispiel:</strong> Für y = 2x - 1<br/>
                  x = -1 → y = 2(-1) - 1 = -3<br/>
                  x = 0 → y = 2(0) - 1 = -1<br/>
                  x = 1 → y = 2(1) - 1 = 1<br/>
                  x = 2 → y = 2(2) - 1 = 3
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">2. Zwei wichtige Punkte berechnen</h4>
                <p className="text-gray-700 mb-3">Du brauchst mindestens zwei Punkte, um eine Gerade zu zeichnen. Besonders einfach sind:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Y-Achsenabschnitt:</strong> Setze x = 0 ein. Der y-Wert ist direkt der konstante Term in der Gleichung.</li>
                  <li><strong>X-Achsenabschnitt (Nullstelle):</strong> Setze y = 0 und löse nach x auf.</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 text-sm text-gray-700 mt-3">
                  <strong>Beispiel:</strong> Für y = 2x - 1<br/>
                  Y-Achsenabschnitt: x = 0 → y = -1, also Punkt (0 | -1)<br/>
                  X-Achsenabschnitt: 0 = 2x - 1 → x = 0,5, also Punkt (0,5 | 0)
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">3. Steigung ablesen und nutzen</h4>
                <p className="text-gray-700 mb-3">Die Steigung m zeigt dir, wie steil die Gerade ist. Wenn du einen Punkt hast, kannst du von dort aus die Steigung nutzen, um weitere Punkte zu finden:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Positive Steigung: Gerade verläuft von links unten nach rechts oben</li>
                  <li>Negative Steigung: Gerade verläuft von links oben nach rechts unten</li>
                  <li>Steigung m = 2 bedeutet: Wenn du 1 Einheit nach rechts gehst, gehst du 2 Einheiten nach oben</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">4. Punkte ins Koordinatensystem eintragen</h4>
                <p className="text-gray-700 mb-3">Trage die berechneten Punkte genau ins Koordinatensystem ein. Markiere sie deutlich als kleine Kreuze oder Punkte.</p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">5. Gerade zeichnen</h4>
                <p className="text-gray-700 mb-3">Verbinde die Punkte mit einem Lineal zu einer geraden Linie. Verlängere die Linie über die markierten Punkte hinaus, um zu zeigen, dass sie sich unendlich fortsetzt.</p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4">
                <h4 className="font-bold text-green-700 mb-2">💡 Profi-Tipp:</h4>
                <p className="text-gray-700">Verwende mindestens 3-4 Punkte, um sicherzugehen, dass deine Gerade korrekt ist. Wenn alle Punkte auf einer Linie liegen, hast du alles richtig gemacht!</p>
              </div>
            </div>

            <div className="bg-gray-100 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowTipps(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
