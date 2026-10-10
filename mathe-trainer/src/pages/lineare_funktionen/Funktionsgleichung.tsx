import React, { useEffect, useState, useRef } from 'react'
import styles from './Funktionsgleichung.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import VideoButton from '../../components/VideoButton'
import TaskShell from '../../components/layout/TaskShell'

declare global {
  interface Window { 
    MathJax: any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// MathJax-Komponente
const MathDisplay = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current && (window as any).MathJax) {
      (window as any).MathJax.contentDocument = document
      ;(window as any).MathJax.typesetPromise?.([ref.current]).catch((err: any) => console.log(err))
    }
  }, [latex])
  
  return <div ref={ref} className={styles.mathDisplay}>{latex}</div>
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function validateInput(value: string, correctValue: number, tolerance: number): 'correct' | 'incorrect' | null {
  if (value.trim() === '') return null
  const parsed = parseFlexibleNumber(value)
  if (isNaN(parsed)) return 'incorrect'
  return Math.abs(parsed - correctValue) <= tolerance ? 'correct' : 'incorrect'
}

function formatEquationPreview(m: string, sign: string, t: string): string {
  if (!m && !sign && !t) return 'y = ? \\cdot x + ?'
  
  const mVal = m || '?'
  const signVal = sign || '?'
  const tVal = t || '?'
  
  const mDisplay = m ? `${m}` : '?'
  const signDisplay = sign ? ` ${sign} ` : ' ? '
  const tDisplay = t ? `${t}` : '?'
  
  return `y = ${mDisplay} \\cdot x${signDisplay}${tDisplay}`
}

export default function Funktionsgleichung(){
  const tracking = useTaskTracking('Funktionsgleichung aufstellen')
  const [mode, setMode] = useState<'twoPoints'|'pointSlope'|'readGraph'>('twoPoints')
  const [p1, setP1] = useState({ x: 1, y: 2 })
  const [p2, setP2] = useState({ x: 4, y: 5 })
  const [mCorrect, setMCorrect] = useState<number>( (p2.y - p1.y) / (p2.x - p1.x) )
  const [tCorrect, setTCorrect] = useState<number>( p1.y - mCorrect * p1.x )
  const [mInput, setMInput] = useState('')
  const [signInput, setSignInput] = useState('')
  const [tInput, setTInput] = useState('')
  const [mCorrectness, setMCorrectness] = useState<'correct' | 'incorrect' | null>(null)
  const [signCorrectness, setSignCorrectness] = useState<'correct' | 'incorrect' | null>(null)
  const [tCorrectness, setTCorrectness] = useState<'correct' | 'incorrect' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [punkte, setPunkte] = useState(0)

  // MathJax laden
  useEffect(() => {

    const mathjaxScript = document.createElement('script')
    mathjaxScript.id = 'MathJax-script'
    mathjaxScript.async = true
    mathjaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
    document.head.appendChild(mathjaxScript)
  }, [])


  useEffect(() => {
    const m = (p2.y - p1.y) / (p2.x - p1.x)
    setMCorrect(Number((Math.round(m * 100) / 100).toFixed(2)))
    setTCorrect(Number((Math.round((p1.y - m * p1.x) * 100) / 100).toFixed(2)))
  }, [p1, p2])

  function genTwoPoints() {
    tracking.onTaskStart()
    let x1, x2
    do {
      x1 = randInt(-5, 5)
      x2 = randInt(-5, 5)
    } while (x1 === x2)
    const y1 = randInt(-5, 5)
    const y2 = randInt(-5, 5)
    setP1({ x: x1, y: y1 })
    setP2({ x: x2, y: y2 })
    setMode('twoPoints')
    setMInput('')
    setSignInput('')
    setTInput('')
    setMCorrectness(null)
    setSignCorrectness(null)
    setTCorrectness(null)
    setFeedback('')
    setShowSolution(false)
  }

  function genPointSlope() {
    tracking.onTaskStart()
    const x = randInt(-5, 5)
    const y = randInt(-5, 5)
    const m = randInt(-3, 3) || 1
    setP1({ x, y })
    // represent as point-slope: point P1 and slope m
    setP2({ x: x + 1, y: y + m })
    setMode('pointSlope')
    setMInput('')
    setSignInput('')
    setTInput('')
    setMCorrectness(null)
    setSignCorrectness(null)
    setTCorrectness(null)
    setFeedback('')
    setShowSolution(false)
  }

  function genReadGraph() {
    tracking.onTaskStart()
    // Generiere zufällige m und t für den Graph
    let m: number, t: number
    
    // m: -3 bis 3
    m = randInt(-3, 3)
    if (m === 0) m = 1

    // t: -4 bis 4
    t = randInt(-4, 4)
    
    setMCorrect(m)
    setTCorrect(t)
    setP1({ x: 0, y: t })
    setP2({ x: 1, y: t + m })
    
    setMode('readGraph')
    setMInput('')
    setSignInput('')
    setTInput('')
    setMCorrectness(null)
    setSignCorrectness(null)
    setTCorrectness(null)
    setFeedback('')
    setShowSolution(false)
  }

  function check() {
    setFeedback('')
    const mi = parseFlexibleNumber(mInput)
    const ti = parseFlexibleNumber(tInput)
    const sign = signInput.trim()

    if (isNaN(mi) || isNaN(ti) || !sign) {
      setFeedback('Bitte alle Werte eingeben.')
      return
    }

    if (sign !== '+' && sign !== '-') {
      setFeedback('Bitte + oder - eingeben.')
      return
    }

    // Die Validierung hat bereits stattgefunden, daher prüften wir nur die Status
    const allCorrect = mCorrectness === 'correct' && signCorrectness === 'correct' && tCorrectness === 'correct'
    tracking.onCheck(allCorrect)
    if (allCorrect) {
      setFeedback('✓ Perfekt! Alle Werte sind korrekt!')
      // Punkte vergeben nur wenn Lösung nicht angezeigt wurde
      if (!showSolution) {
        setPunkte(punkte + 3)
        setFeedback('✓ Perfekt! +3 Punkte! 🎉')
      }
    } else {
      setFeedback('✗ Leider nicht vollständig korrekt. Überprüfe deine Eingaben.')
    }
  }

  function showSol() {
    setShowSolution(true)
    tracking.onHintShown()
  }

  return (
    <TaskShell title="Funktionsgleichung aufstellen" width="narrow" actions={<div className={styles.pointsCounter} aria-label={`${punkte} Punkte`}><i className="fa-solid fa-star" aria-hidden="true" /><span className={styles.pointsText}>{punkte}</span></div>}>
      <div className={styles.card}>

        <div className={styles.controls}>
          <button onClick={genTwoPoints} className={styles.btn}>Neue Aufgabe: 2 Punkte</button>
          <button onClick={genReadGraph} className={styles.btn}>Neue Aufgabe: Graph ablesen</button>
        </div>

        {/* Task - nur Text, kein Kasten */}
        <div className={styles.taskText}>
          {mode === 'twoPoints' ? (
            <p>Gegeben sind die Punkte P₁({p1.x}|{p1.y}) und P₂({p2.x}|{p2.y}). Stelle die Gleichung y = mx + t auf.<br/><small>(Ergebnisse dürfen auf 2 Dezimalstellen gerundet werden.)</small></p>
          ) : mode === 'pointSlope' ? (
            <p>Gegeben ist der Punkt P({p1.x}|{p1.y}) und die Steigung m (oben). Stelle die Gleichung y = mx + t auf.<br/><small>(Ergebnisse dürfen auf 2 Dezimalstellen gerundet werden.)</small></p>
          ) : (
            <p>Betrachte den dargestellten Funktionsgraphen. Wähle dir zwei passende Punkte aus und berechne die Funktionsgleichung y = mx + t!<br/><small>(Ergebnisse dürfen auf 2 Dezimalstellen gerundet werden.)</small></p>
          )}
        </div>

        {/* GeoGebra Graph für readGraph Mode */}
        {mode === 'readGraph' && (
          <div className={styles.graphContainer}>
            <GeoGebraGraph 
              m={mCorrect} 
              t={tCorrect} 
              width={600} 
              height={450}
            />
          </div>
        )}

        {/* Solution Input - 3 Boxen */}
        <div className={styles.solutionInputContainer}>
          <div>Die Funktionsgleichung lautet: y = </div>
          <input 
            type="text"
            value={mInput}
            onChange={(e) => {
              setMInput(e.target.value)
              const tolerance = mode === 'readGraph' ? 0 : 0.02
              setMCorrectness(validateInput(e.target.value, mCorrect, tolerance))
            }}
            className={`${styles.solutionInputBox} ${mCorrectness === 'correct' ? styles.correct : mCorrectness === 'incorrect' ? styles.incorrect : ''}`}
            placeholder="m"
          />
          <div>*x</div>
          <input 
            type="text"
            value={signInput}
            onChange={(e) => {
              const val = e.target.value.trim().toUpperCase()
              if (val === '' || val === '+' || val === '-') {
                setSignInput(val)
                if (val === '') {
                  setSignCorrectness(null)
                } else {
                  const correctSign = tCorrect >= 0 ? '+' : '-'
                  setSignCorrectness(val === correctSign ? 'correct' : 'incorrect')
                }
              }
            }}
            maxLength={1}
            className={`${styles.solutionInputBox} ${styles.signBox} ${signCorrectness === 'correct' ? styles.correct : signCorrectness === 'incorrect' ? styles.incorrect : ''}`}
            placeholder="±"
          />
          <input 
            type="text"
            value={tInput}
            onChange={(e) => {
              setTInput(e.target.value)
              const tolerance = mode === 'readGraph' ? 0 : 0.02
              setTCorrectness(validateInput(e.target.value, Math.abs(tCorrect), tolerance))
            }}
            className={`${styles.solutionInputBox} ${tCorrectness === 'correct' ? styles.correct : tCorrectness === 'incorrect' ? styles.incorrect : ''}`}
            placeholder="t"
          />
        </div>

        {/* Live-Vorschau der Gleichung */}
        <div className={styles.equationPreview}>
          <MathDisplay latex={`$$${formatEquationPreview(mInput, signInput, tInput)}$$`} />
        </div>

        {feedback && (
          <div className={`${styles.feedback} ${feedback.includes('✓') ? styles.success : styles.error}`}>
            {feedback}
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={check} className={styles.primary}>Lösung prüfen</button>
          <button onClick={showSol} className={styles.secondary}>Lösung anzeigen</button>
          <VideoButton url="https://youtu.be/r8vCu72ojYw" title="Erklärvideo: Funktionsgleichung aufstellen" start={104} />
        </div>

        {showSolution && (
          <div className={styles.solutionOutput}>
            <h3 className={styles.solutionTitle}>Lösungsweg</h3>
            <div className={styles.solutionStep}>
              {mode === 'readGraph' ? (
                <>
                  {(() => {
                    return (
                      <>
                        <MathDisplay latex={`$$\\textbf{Lösungsweg: Graph ablesen}$$`} />
                        <MathDisplay latex={`$$\\textbf{Schritt 1: Zwei Punkte ablesen}$$`} />
                        <MathDisplay latex={`$$P_1(0|${tCorrect}) \\quad \\textbf{(Y-Achsenabschnitt)}$$`} />
                        <MathDisplay latex={`$$P_2(1|${tCorrect + mCorrect})$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 2: Steigung m berechnen}$$`} />
                        <MathDisplay latex={`$$m = \\dfrac{${tCorrect + mCorrect} - (${tCorrect})}{1 - 0} = \\dfrac{${mCorrect}}{1} = ${mCorrect}$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 3: Y-Achsenabschnitt ablesen}$$`} />
                        <MathDisplay latex={`$$t = ${tCorrect}$$`} />
                      </>
                    )
                  })()}
                </>
              ) : mode === 'twoPoints' ? (
                <>
                  {(() => {
                    const product = Math.round(mCorrect * p1.x * 100) / 100
                    const operation = product < 0 ? '+' : '-'
                    const operand = Math.abs(product)
                    return (
                      <>
                        <MathDisplay latex={`$$\\textbf{Schritt 1: Punkte aufschreiben}$$`} />
                        <MathDisplay latex={`$$P_1(${p1.x}|${p1.y}) \\quad P_2(${p2.x}|${p2.y})$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 2: Ansatz}$$`} />
                        <MathDisplay latex={`$$y = m \\cdot x + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 3: Steigung m berechnen}$$`} />
                        <MathDisplay latex={`$$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${p2.y} - (${p1.y})}{${p2.x} - (${p1.x})} = \\dfrac{${p2.y - p1.y}}{${p2.x - p1.x}} = ${mCorrect}$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 4: m einsetzen}$$`} />
                        <MathDisplay latex={`$$y = ${mCorrect} \\cdot x + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 5: Punkt } P_1(${p1.x}|${p1.y}) \\textbf{ einsetzen}$$`} />
                        <MathDisplay latex={`$$${p1.y} = ${mCorrect} \\cdot ${p1.x} + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 6: Nach t auflösen}$$`} />
                        <MathDisplay latex={`$$${p1.y} = ${product} + t \\quad | ${operation} ${operand}$$`} />
                        <MathDisplay latex={`$$t = ${p1.y} ${operation} ${operand} = ${tCorrect}$$`} />
                      </>
                    )
                  })()}
                </>
              ) : (
                <>
                  {(() => {
                    const product = Math.round(mCorrect * p1.x * 100) / 100
                    const operation = product < 0 ? '+' : '-'
                    const operand = Math.abs(product)
                    return (
                      <>
                        <MathDisplay latex={`$$\\textbf{Schritt 1: Punkt und Steigung}$$`} />
                        <MathDisplay latex={`$$P(${p1.x}|${p1.y}) \\quad m = ${mCorrect}$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 2: Ansatz}$$`} />
                        <MathDisplay latex={`$$y = m \\cdot x + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 3: m einsetzen}$$`} />
                        <MathDisplay latex={`$$y = ${mCorrect} \\cdot x + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 4: Punkt } P(${p1.x}|${p1.y}) \\textbf{ einsetzen}$$`} />
                        <MathDisplay latex={`$$${p1.y} = ${mCorrect} \\cdot ${p1.x} + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 5: Nach t auflösen}$$`} />
                        <MathDisplay latex={`$$${p1.y} = ${product} + t \\quad | ${operation} ${operand}$$`} />
                        <MathDisplay latex={`$$t = ${p1.y} ${operation} ${operand} = ${tCorrect}$$`} />
                      </>
                    )
                  })()}
                </>
              )}
            </div>
            <div className={styles.answerBox}>
              <MathDisplay latex={`$$y = ${mCorrect}x ${tCorrect >= 0 ? '+' : '-'} ${Math.abs(tCorrect)}$$`} />
            </div>
          </div>
        )}
      </div>

    </TaskShell>
  )
}
