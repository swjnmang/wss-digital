import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
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
  const [equationLatex, setEquationLatex] = useState<string>('y = 2x + 1')

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

  function generateEquationLatex(m: number, t: number): string {
    let m_str = ''
    let t_str = ''

    if (m === 1) m_str = 'x'
    else if (m === -1) m_str = '-x'
    else if (!Number.isInteger(m) && Math.abs(m) > 0.1) {
      const mLatex = valueToLatex(m)
      m_str = `${mLatex}x`
    } else m_str = `${valueToLatex(m)}x`

    if (t === 0) t_str = ''
    else if (t > 0) t_str = ` + ${valueToLatex(t)}`
    else t_str = ` - ${valueToLatex(Math.abs(t))}`

    return `y = ${m_str}${t_str}`
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
        // m constraint: -3 bis 3
        m = Math.max(-3, Math.min(3, m))
        // t constraint: -4 bis 4
        t = randomChoice<number>([randomInt(4, -4), randomInt(8, -8) / 2])
        t = Math.max(-4, Math.min(4, t))
        break
      case 'hard':
        const numerators = [-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9]
        const denominators = [3,4,5]
        m = randomChoice(numerators) / randomChoice(denominators)
        m = Math.max(-3, Math.min(3, m))
        if (Math.abs(m) < 0.1) m = 2/3
        t = randomChoice(numerators.slice(4,-4)) / randomChoice(denominators)
        t = Math.round(t * 4) / 4
        // t constraint: -4 bis 4
        t = Math.max(-4, Math.min(4, t))
        break
      case 'easy':
      default:
        // m constraint: -3 bis 3
        m = randomInt(3, -3)
        if (m === 0) m = 1
        // t = 0: nur Funktionen vom Typ y = m*x
        t = 0
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
    setEquationLatex(generateEquationLatex(m, t))

    setRangeHint('Ein guter Zeichenbereich für die x-Achse ist von -5 bis +5, die Länge der y-Achse musst du selbst festlegen, häufig reicht hier ebenfalls -5 bis +5.')

    setM(m)
    setT(t)
    setShowSolution(false)
  }

  function openGeoGebra(){
    setShowSolution(true)
  }

  // Kleinster Nenner, mit dem sich die Zahl als Bruch darstellen lässt.
  function getDenominator(value: number): number {
    for (let d = 1; d <= 60; d++) {
      if (Math.abs(value * d - Math.round(value * d)) < 1e-9) return d
    }
    return 1
  }

  function valueToLatex(value: number): string {
    const d = getDenominator(value)
    const n = Math.round(value * d)
    if (d === 1) return String(n)
    return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
  }

  // Negative Zahlen beim Einsetzen in Klammern schreiben.
  function withParens(value: number): string {
    return value < 0 ? `(${valueToLatex(value)})` : valueToLatex(value)
  }

  function buildTipps(m: number, t: number) {
    const denominator = getDenominator(m)
    const xValues = denominator === 1 ? [-2, -1, 0, 1, 2] : [-denominator, 0, denominator]
    const tTerm = t === 0 ? '' : t > 0 ? ` + ${valueToLatex(t)}` : ` - ${valueToLatex(Math.abs(t))}`

    const rows = xValues.map((x) => {
      const product = m * x
      const y = product + t
      const mTerm = m === 1 ? withParens(x) : `${valueToLatex(m)} \\cdot ${withParens(x)}`
      let calculation = `y = ${mTerm}${tTerm}`
      if (t !== 0) calculation += ` = ${valueToLatex(product)}${tTerm}`
      calculation += ` = ${valueToLatex(y)}`
      return {
        x,
        xLatex: valueToLatex(x),
        calculation,
        yLatex: valueToLatex(y),
        point: `(${valueToLatex(x)} \\mid ${valueToLatex(y)})`
      }
    })

    const rise = Math.round(Math.abs(m) * denominator)
    const direction = m > 0 ? 'nach oben' : 'nach unten'
    const right = denominator === 1 ? '1 Einheit' : `${denominator} Einheiten`
    const slopeText =
      `Gehst du von einem deiner Punkte ${right} nach rechts, musst du ${rise} ${rise === 1 ? 'Einheit' : 'Einheiten'} ${direction} gehen, ` +
      `um den nächsten Punkt auf der Geraden zu erreichen. Die Gerade verläuft deshalb von ` +
      `${m > 0 ? 'links unten nach rechts oben' : 'links oben nach rechts unten'}.`

    return { denominator, rows, mLatex: valueToLatex(m), slopeText }
  }

  const tipps = buildTipps(m, t)

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
            <div id="task-equation" className="text-2xl font-bold text-sky-800 mt-2">
              <InlineMath math={equationLatex} />
            </div>
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
                width={700} 
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
            
            <div className="p-6 space-y-6 text-left">
              <p className="text-gray-700">
                Diese Tipps passen zu deiner aktuellen Aufgabe: <InlineMath math={equationLatex} />
              </p>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">1. Wertetabelle erstellen</h4>
                <p className="text-gray-700 mb-3">
                  Wähle einige x-Werte aus und schreibe sie in die erste Spalte. Setze dann jeden x-Wert für{' '}
                  <InlineMath math="x" /> in die Funktionsgleichung ein und rechne aus. Das Ergebnis ist der passende
                  y-Wert. Jede Zeile der Tabelle ergibt einen Punkt <InlineMath math="(x \mid y)" />.
                </p>
                {tipps.denominator > 1 && (
                  <p className="text-gray-700 mb-3">
                    <strong>Tipp:</strong> Vor dem <InlineMath math="x" /> steht ein Bruch mit dem Nenner {tipps.denominator}. Wähle deshalb
                    x-Werte, die durch {tipps.denominator} teilbar sind – dann kürzt sich der Bruch weg und das Rechnen wird
                    leichter.
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm text-gray-800 not-prose">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-300 px-3 py-2 text-center">x</th>
                        <th className="border border-blue-300 px-3 py-2 text-left">x einsetzen und ausrechnen</th>
                        <th className="border border-blue-300 px-3 py-2 text-center">y</th>
                        <th className="border border-blue-300 px-3 py-2 text-center">Punkt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tipps.rows.map((row) => (
                        <tr key={row.x} className="odd:bg-white even:bg-blue-50">
                          <td className="border border-blue-200 px-3 py-2 text-center"><InlineMath math={row.xLatex} /></td>
                          <td className="border border-blue-200 px-3 py-2"><InlineMath math={row.calculation} /></td>
                          <td className="border border-blue-200 px-3 py-2 text-center font-semibold"><InlineMath math={row.yLatex} /></td>
                          <td className="border border-blue-200 px-3 py-2 text-center"><InlineMath math={row.point} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Achte beim Einsetzen von negativen Zahlen auf die Klammern und auf die Vorzeichenregeln: Minus mal Minus ergibt Plus.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">2. Punkte ins Koordinatensystem eintragen</h4>
                <p className="text-gray-700 mb-3">
                  Trage die Punkte aus der letzten Spalte genau ins Koordinatensystem ein. Gehe beim x-Wert nach rechts
                  (positiv) oder links (negativ) und beim y-Wert nach oben (positiv) oder unten (negativ). Markiere jeden
                  Punkt als kleines Kreuz.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">3. Kontrolle mit der Steigung</h4>
                <p className="text-gray-700 mb-3">
                  Die Zahl vor dem <InlineMath math="x" /> ist die Steigung <InlineMath math={`m = ${tipps.mLatex}`} />. {tipps.slopeText}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-blue-600 mb-2">4. Gerade zeichnen</h4>
                <p className="text-gray-700 mb-3">
                  Verbinde die Punkte mit einem Lineal zu einer geraden Linie. Verlängere die Linie über die markierten Punkte
                  hinaus bis zum Rand des Koordinatensystems.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4">
                <h4 className="font-bold text-green-700 mb-2">💡 Profi-Tipp:</h4>
                <p className="text-gray-700">
                  Für eine Gerade reichen eigentlich zwei Punkte. Mit einem dritten Punkt kannst du aber prüfen, ob du dich
                  verrechnet hast: Liegen alle Punkte auf einer Linie, hast du richtig gerechnet!
                </p>
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
