import React, { useEffect, useState, useRef } from 'react'
import styles from './Funktionsgleichung.module.css'

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

export default function Funktionsgleichung(){
  const [mode, setMode] = useState<'twoPoints'|'pointSlope'>('twoPoints')
  const [p1, setP1] = useState({ x: 1, y: 2 })
  const [p2, setP2] = useState({ x: 4, y: 5 })
  const [mCorrect, setMCorrect] = useState<number>( (p2.y - p1.y) / (p2.x - p1.x) )
  const [tCorrect, setTCorrect] = useState<number>( p1.y - mCorrect * p1.x )
  const [mInput, setMInput] = useState('')
  const [tInput, setTInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const youtubePlayerRef = useRef<any>(null)

  // MathJax laden
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6'
    document.head.appendChild(script)

    const mathjaxScript = document.createElement('script')
    mathjaxScript.id = 'MathJax-script'
    mathjaxScript.async = true
    mathjaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
    document.head.appendChild(mathjaxScript)
  }, [])

  // Load YouTube IFrame API when video modal opens
  useEffect(() => {
    if (!showVideoModal) return

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }

    // Initialize player when API is ready
    const initializePlayer = () => {
      if (window.YT && window.YT.Player && !youtubePlayerRef.current) {
        youtubePlayerRef.current = new window.YT.Player('youtube-player-funktionsgleichung', {
          height: '390',
          width: '640',
          videoId: 'r8vCu72ojYw',
          playerVars: {
            'start': 104  // Start at 1:44 (104 seconds)
          }
        })
      }
    }

    // Check if API is ready, otherwise wait for onYouTubeIframeAPIReady
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    return () => {
      // Cleanup when modal closes
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.destroy === 'function') {
        youtubePlayerRef.current.destroy()
        youtubePlayerRef.current = null
      }
    }
  }, [showVideoModal])

  useEffect(() => {
    const m = (p2.y - p1.y) / (p2.x - p1.x)
    setMCorrect(Number((Math.round(m * 100) / 100).toFixed(2)))
    setTCorrect(Number((Math.round((p1.y - m * p1.x) * 100) / 100).toFixed(2)))
  }, [p1, p2])

  function genTwoPoints() {
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
    setTInput('')
    setFeedback('')
    setShowSolution(false)
  }

  function genPointSlope() {
    const x = randInt(-5, 5)
    const y = randInt(-5, 5)
    const m = randInt(-3, 3) || 1
    setP1({ x, y })
    // represent as point-slope: point P1 and slope m
    setP2({ x: x + 1, y: y + m })
    setMode('pointSlope')
    setMInput('')
    setTInput('')
    setFeedback('')
    setShowSolution(false)
  }

  function check() {
    setFeedback('')
    const mi = parseFloat(mInput.replace(',', '.'))
    const ti = parseFloat(tInput.replace(',', '.'))
    if (isNaN(mi) || isNaN(ti)) {
      setFeedback('Bitte zwei gültige Zahlen für m und t eingeben.')
      return
    }
    const ok = Math.abs(mi - mCorrect) < 0.02 && Math.abs(ti - tCorrect) < 0.02
    if (ok) {
      setFeedback('✓ Richtig!')
      setShowSolution(false)
    } else {
      setFeedback('✗ Leider nicht korrekt. Versuche es noch einmal oder zeige die Lösung.')
      setShowSolution(false)
    }
  }

  function showSol() {
    setShowSolution(true)
  }

  return (
    <div className={`prose ${styles.container}`}>

      <div className={styles.card}>
        <h2>Funktionsgleichung aufstellen</h2>

        <div className={styles.controls}>
          <button onClick={genTwoPoints} className={styles.btn}>Neue Aufgabe: 2 Punkte</button>
          <button onClick={genPointSlope} className={styles.btn}>Neue Aufgabe: Punkt + Steigung</button>
          <button onClick={() => setShowVideoModal(true)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}>🎥 Erklärvideo</button>
        </div>

        <div className={styles.task}>
          {mode === 'twoPoints' ? (
            <div>
              <p>Gegeben sind die Punkte P₁({p1.x}|{p1.y}) und P₂({p2.x}|{p2.y}). Stelle die Gleichung y = mx + t auf.</p>
            </div>
          ) : (
            <div>
              <p>Gegeben ist der Punkt P({p1.x}|{p1.y}) und die Steigung m (oben). Stelle die Gleichung y = mx + t auf.</p>
            </div>
          )}
        </div>

        <div className={styles.inputRow}>
          <label>m = <input value={mInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMInput(e.target.value)} className={styles.input} placeholder="Steigung" /></label>
          <label>t = <input value={tInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTInput(e.target.value)} className={styles.input} placeholder="y-Achsenabschnitt" /></label>
        </div>

        {feedback && (
          <div className={`${styles.feedback} ${feedback.includes('✓') ? styles.success : styles.error}`}>
            {feedback}
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={check} className={styles.primary}>Lösung prüfen</button>
          <button onClick={showSol} className={styles.secondary}>Lösung anzeigen</button>
        </div>

        {showSolution && (
          <div className={styles.solutionOutput}>
            <h3 className={styles.solutionTitle}>Lösungsweg</h3>
            <div className={styles.solutionStep}>
              {mode === 'twoPoints' ? (
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

      {/* Video Modal */}
      {showVideoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', maxWidth: '800px', width: '90%', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Erklärvideo: Funktionsgleichung aufstellen</h3>
              <button onClick={() => setShowVideoModal(false)} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div id="youtube-player-funktionsgleichung" style={{ marginBottom: '1rem' }}></div>
            <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Das Video startet bei 1:44.</p>
            <button onClick={() => setShowVideoModal(false)} style={{ marginTop: '1.5rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  )
}
