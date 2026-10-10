import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import styles from './LFCommon.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import TaskShell from '../../components/layout/TaskShell'

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

  function numberToLatex(num: number): string {
    if (num === 0) return '0'
    if (Math.abs(num) === 0.5) return (num > 0 ? '' : '-') + '\\frac{1}{2}'
    if (Math.abs(num) === 0.25) return (num > 0 ? '' : '-') + '\\frac{1}{4}'
    if (Math.abs(num) === 0.75) return (num > 0 ? '' : '-') + '\\frac{3}{4}'
    if (Math.abs(num) === 1/3) return (num > 0 ? '' : '-') + '\\frac{1}{3}'
    if (Math.abs(num) === 2/3) return (num > 0 ? '' : '-') + '\\frac{2}{3}'
    if (Math.abs(num) === 2/5) return (num > 0 ? '' : '-') + '\\frac{2}{5}'
    if (Math.abs(num) === 3/5) return (num > 0 ? '' : '-') + '\\frac{3}{5}'
    if (Math.abs(num) === 1/5) return (num > 0 ? '' : '-') + '\\frac{1}{5}'
    if (Math.abs(num) === 3/4) return (num > 0 ? '' : '-') + '\\frac{3}{4}'
    if (Math.abs(num) === 4/5) return (num > 0 ? '' : '-') + '\\frac{4}{5}'
    if (Math.abs(num) === 1/6) return (num > 0 ? '' : '-') + '\\frac{1}{6}'
    if (Math.abs(num) === 5/6) return (num > 0 ? '' : '-') + '\\frac{5}{6}'
    const rounded = Math.round(num * 100) / 100
    return rounded.toString()
  }

  function generateEquationLatex(m: number, t: number): string {
    let m_str = ''
    let t_str = ''

    if (m === 1) m_str = 'x'
    else if (m === -1) m_str = '-x'
    else if (!Number.isInteger(m) && Math.abs(m) > 0.1) {
      const mLatex = numberToLatex(m)
      m_str = `${mLatex}x`
    } else m_str = `${numberToLatex(m)}x`

    if (t === 0) t_str = ''
    else if (t > 0) t_str = ` + ${numberToLatex(t)}`
    else t_str = ` - ${numberToLatex(Math.abs(t))}`

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

  return (
    <TaskShell title="Lineare Funktionen zeichnen" width="wide">
      <div className={styles.card}>

        <div className={styles.content}>
          <div id="difficulty-selector" className="bk-seg mb-4">
            <button
              className={`bk-seg-btn ${difficulty === 'easy' ? 'bk-seg-btn-on' : ''}`}
              onClick={() => setDifficulty('easy')}
            >Leicht</button>
            <button
              className={`bk-seg-btn ${difficulty === 'medium' ? 'bk-seg-btn-on' : ''}`}
              onClick={() => setDifficulty('medium')}
            >Mittel</button>
            <button
              className={`bk-seg-btn ${difficulty === 'hard' ? 'bk-seg-btn-on' : ''}`}
              onClick={() => setDifficulty('hard')}
            >Schwer</button>
          </div>

          <div id="task-output" className="bk-taskbox mb-4">
            <div id="task-text">Zeichne den Graphen der folgenden Funktion in ein Koordinatensystem.</div>
            <div id="task-equation" className="text-3xl font-bold text-ink mt-2">
              <InlineMath math={equationLatex} />
            </div>
            <div id="drawing-range-hint" className="text-sm text-gray-600 mt-3">{rangeHint}</div>
          </div>

          <div className="bk-actions">
            <button className="bk-btn" onClick={() => generateNewTask(difficulty)}>Neue Aufgabe</button>
            <button className="bk-btn" onClick={() => setShowTipps(true)}>Tipps</button>
            <button className="bk-btn bk-btn-primary" onClick={openGeoGebra}>Lösungskontrolle anzeigen</button>
          </div>

          {showSolution && (
            <div className="bk-solution">
              <div className="flex items-center justify-between mb-4">
                <h3 className="bk-solution-title" style={{ margin: 0 }}>Lösungsgraph</h3>
                <button
                  onClick={() => setShowSolution(false)}
                  className="bk-icon-btn"
                  aria-label="Lösungsgraph schließen"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
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
        <div className="bk-modal-backdrop">
          <div className="bk-modal" style={{ padding: 0, maxWidth: 720 }}>
            <div className="sticky top-0 bg-white border-b-2 border-edge p-5 flex items-center justify-between gap-4">
              <h3 className="text-2xl font-extrabold text-ink text-left">Tipps zum Zeichnen von Funktionsgraphen</h3>
              <button
                onClick={() => setShowTipps(false)}
                className="bk-icon-btn"
                aria-label="Tipps schließen"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-extrabold text-lg text-ink mb-2 text-left">1. Wertetabelle erstellen</h4>
                <p className="text-gray-700 mb-3">Erstelle eine Wertetabelle, indem du mehrere x-Werte in die Funktionsgleichung einsetzt und die entsprechenden y-Werte berechnest.</p>
                <div className="bk-taskbox text-sm">
                  <strong>Beispiel:</strong> Für <InlineMath math="y = 2x - 1" /><br/>
                  <InlineMath math="x = -1 \Rightarrow y = 2(-1) - 1 = -3" /><br/>
                  <InlineMath math="x = 0 \Rightarrow y = 2(0) - 1 = -1" /><br/>
                  <InlineMath math="x = 1 \Rightarrow y = 2(1) - 1 = 1" /><br/>
                  <InlineMath math="x = 2 \Rightarrow y = 2(2) - 1 = 3" />
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-ink mb-2 text-left">2. Zwei wichtige Punkte berechnen</h4>
                <p className="text-gray-700 mb-3">Du brauchst mindestens zwei Punkte, um eine Gerade zu zeichnen. Besonders einfach sind:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Y-Achsenabschnitt:</strong> Setze <InlineMath math="x = 0" /> ein. Der y-Wert ist direkt der konstante Term in der Gleichung.</li>
                  <li><strong>X-Achsenabschnitt (Nullstelle):</strong> Setze <InlineMath math="y = 0" /> und löse nach <InlineMath math="x" /> auf.</li>
                </ul>
                <div className="bk-taskbox text-sm mt-3">
                  <strong>Beispiel:</strong> Für <InlineMath math="y = 2x - 1" /><br/>
                  Y-Achsenabschnitt: <InlineMath math="x = 0 \Rightarrow y = -1" />, also Punkt <InlineMath math="(0 \mid -1)" /><br/>
                  X-Achsenabschnitt: <InlineMath math="0 = 2x - 1 \Rightarrow x = 0{,}5" />, also Punkt <InlineMath math="(0{,}5 \mid 0)" />
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-ink mb-2 text-left">3. Steigung ablesen und nutzen</h4>
                <p className="text-gray-700 mb-3">Die Steigung <InlineMath math="m" /> zeigt dir, wie steil die Gerade ist. Wenn du einen Punkt hast, kannst du von dort aus die Steigung nutzen, um weitere Punkte zu finden:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Positive Steigung: Gerade verläuft von links unten nach rechts oben</li>
                  <li>Negative Steigung: Gerade verläuft von links oben nach rechts unten</li>
                  <li>Steigung <InlineMath math="m = 2" /> bedeutet: Wenn du 1 Einheit nach rechts gehst, gehst du 2 Einheiten nach oben</li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-ink mb-2 text-left">4. Punkte ins Koordinatensystem eintragen</h4>
                <p className="text-gray-700 mb-3">Trage die berechneten Punkte genau ins Koordinatensystem ein. Markiere sie deutlich als kleine Kreuze oder Punkte.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-ink mb-2 text-left">5. Gerade zeichnen</h4>
                <p className="text-gray-700 mb-3">Verbinde die Punkte mit einem Lineal zu einer geraden Linie. Verlängere die Linie über die markierten Punkte hinaus, um zu zeigen, dass sie sich unendlich fortsetzt.</p>
              </div>

              <div className="bk-feedback bk-feedback-info" style={{ display: 'block' }}>
                <h4 className="font-extrabold text-ink mb-2 text-left"><i className="fa-solid fa-lightbulb" aria-hidden="true" /> Profi-Tipp:</h4>
                <p className="text-gray-700">Verwende mindestens 3-4 Punkte, um sicherzugehen, dass deine Gerade korrekt ist. Wenn alle Punkte auf einer Linie liegen, hast du alles richtig gemacht!</p>
              </div>
            </div>

            <div className="bg-sunken border-t-2 border-edge p-4 flex justify-end">
              <button
                onClick={() => setShowTipps(false)}
                className="bk-btn bk-btn-primary"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </TaskShell>
  )
}
