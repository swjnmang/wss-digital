import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './LFCommon.module.css'

export default function Zeichnen(){
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('easy')
  const [equation, setEquation] = useState<string>('y = 2x + 1')
  const [geogebraURL, setGeogebraURL] = useState<string>('')
  const [rangeHint, setRangeHint] = useState<string>('')

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

    const geogebra_equation = `y = ${m}*x + ${t}`
    setGeogebraURL(`https://www.geogebra.org/graphing?command=${encodeURIComponent(geogebra_equation)}`)
  }

  function openGeoGebra(){
    if (geogebraURL) window.open(geogebraURL, '_blank')
  }

  return (
    <div className={`prose ${styles.container}`}>
      <Link to="/lineare_funktionen" className={styles.back}>← Zurück</Link>

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
            <button className="generator-button bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-md px-5 py-3 shadow" onClick={openGeoGebra}>Lösungskontrolle anzeigen</button>
          </div>
        </div>
      </div>
    </div>
  )
}
