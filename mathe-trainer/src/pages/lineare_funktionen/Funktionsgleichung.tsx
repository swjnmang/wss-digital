import React, { useEffect, useState, useRef } from 'react'
import styles from './Funktionsgleichung.module.css'
import KlickGraph from '../../components/KlickGraph'
import type { Pt } from '../../components/CoordSystem'
import { checkLinearEquation, parseLinearEquation, texLinearEquation } from '../../utils/parseLinearEquation'
import { fieldCheckClass } from '../../utils/fieldCheck'
import GleichungEingabe from '../../components/GleichungEingabe'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import VideoButton from '../../components/VideoButton'
import TaskShell from '../../components/layout/TaskShell'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { useBackHandler } from '../../hooks/useBackHandler'
import { LernsituationKarte } from './lernsituation_kit/seiten'
import ScooterEinstieg from './funktionsgleichung_einstieg/ScooterEinstieg'

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
  // Beim Öffnen steht zuerst die Auswahl „Lernsituation“ / „Übungsaufgaben“, noch keine Aufgabe
  const tracking = useTaskTracking('Funktionsgleichung aufstellen', { shownOnMount: false })
  const [ansicht, setAnsicht] = useState<'auswahl' | 'lernsituation' | 'ueben'>('auswahl')
  // Zurück-Button im Kopf führt zuerst zur Auswahl auf dieser Seite
  useBackHandler(ansicht !== 'auswahl', () => setAnsicht('auswahl'))
  const [mode, setMode] = useState<'twoPoints'|'pointSlope'|'readGraph'>('twoPoints')
  const [p1, setP1] = useState({ x: 1, y: 2 })
  const [p2, setP2] = useState({ x: 4, y: 5 })
  const [mCorrect, setMCorrect] = useState<number>( (p2.y - p1.y) / (p2.x - p1.x) )
  const [tCorrect, setTCorrect] = useState<number>( p1.y - mCorrect * p1.x )
  const [eingabe, setEingabe] = useState('')
  const [eingabeStatus, setEingabeStatus] = useState<'correct' | 'incorrect' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [punkte, setPunkte] = useState(0)
  // Vom Schüler im Graphen angeklickte Punkte (höchstens zwei) und Hinweis bei einem Fehlklick
  const [gewaehlt, setGewaehlt] = useState<Pt[]>([])
  const [klickHinweis, setKlickHinweis] = useState('')

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
    // Wie im Lösungsweg wird mit dem gerundeten m weitergerechnet
    const mRund = Math.round(m * 100) / 100
    setMCorrect(Number(mRund.toFixed(2)))
    setTCorrect(Number((Math.round((p1.y - mRund * p1.x) * 100) / 100).toFixed(2)))
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
    setEingabe('')
    setEingabeStatus(null)
    setFeedback('')
    setShowSolution(false)
    setGewaehlt([])
    setKlickHinweis('')
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
    setEingabe('')
    setEingabeStatus(null)
    setFeedback('')
    setShowSolution(false)
    setGewaehlt([])
    setKlickHinweis('')
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
    setEingabe('')
    setEingabeStatus(null)
    setFeedback('')
    setShowSolution(false)
    setGewaehlt([])
    setKlickHinweis('')
  }

  function pickPunkt(p: Pt | null) {
    if (!p) {
      setKlickHinweis('Dort liegt kein Punkt des Graphen. Klicke genau auf die Gerade, am besten dort, wo sie durch ein Gitterkreuz läuft.')
      return
    }
    setKlickHinweis('')
    setGewaehlt((alt) => {
      if (alt.some((q) => q.x === p.x && q.y === p.y)) return alt.filter((q) => q.x !== p.x || q.y !== p.y)
      return alt.length < 2 ? [...alt, p] : [alt[1], p]
    })
    tracking.onInput()
  }

  function check() {
    const tol = mode === 'readGraph' ? 0 : 0.02
    let r = checkLinearEquation(eingabe, mCorrect, tCorrect, tol)
    if (r.status === 'no' && mode !== 'readGraph') {
      // Auch t aus dem ungerundeten m gilt als richtig
      const tExakt = p1.y - ((p2.y - p1.y) / (p2.x - p1.x)) * p1.x
      const r2 = checkLinearEquation(eingabe, mCorrect, tExakt, tol)
      if (r2.status === 'ok') r = r2
    }
    if (r.status === 'invalid') {
      // Eingabefehler (Form der Gleichung): Hinweis, aber kein Prüfversuch
      setEingabeStatus('incorrect')
      setFeedback(r.text)
      return
    }
    const ok = r.status === 'ok'
    setEingabeStatus(ok ? 'correct' : 'incorrect')
    tracking.onCheck(ok)
    if (ok) {
      if (!showSolution) {
        setPunkte(punkte + 3)
        setFeedback('✓ Perfekt, die Gleichung stimmt! +3 Punkte! 🎉')
      } else setFeedback('✓ Richtig, die Gleichung stimmt!')
    } else {
      setFeedback(`✗ ${r.text}`)
    }
  }

  function showSol() {
    setShowSolution(true)
    tracking.onHintShown()
  }

  const gelesen = mode === 'readGraph' && gewaehlt.length === 2
  const s1 = gelesen ? gewaehlt[0] : p1
  const s2 = gelesen ? gewaehlt[1] : p2

  const ueben = (art: 'twoPoints' | 'readGraph') => {
    if (art === 'twoPoints') genTwoPoints()
    else genReadGraph()
    setAnsicht('ueben')
    window.scrollTo({ top: 0 })
  }

  if (ansicht === 'lernsituation') {
    return (
      <ScooterEinstieg
        onBack={() => {
          setAnsicht('auswahl')
          window.scrollTo({ top: 0 })
        }}
        onPractice={() => ueben('twoPoints')}
      />
    )
  }

  if (ansicht === 'auswahl') {
    return (
      <TaskShell title="Funktionsgleichung aufstellen" width="narrow">
        <div className="flex flex-col gap-6">
          <p className="text-center text-slate-600">Aus zwei Punkten oder einem Graphen die Gleichung y = mx + t einer Geraden aufstellen.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bk-panel text-center flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Lernsituation</h2>
              <LernsituationKarte
                className="flex-1"
                thema={{ name: 'Die Scooter-App', farbe: 'petrol', icon: 'fa-mobile-screen-button' }}
                beschreibung="Neu beim Thema? Knacke den Tarif deiner E-Scooter-App aus zwei Fahrten und lerne dabei, wie man die Funktionsgleichung aus zwei Punkten aufstellt."
                onClick={() => setAnsicht('lernsituation')}
              />
            </div>
            <div className="bk-panel text-center sm:col-span-2 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Übungsaufgaben</h2>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => ueben('twoPoints')}
                  className="rounded-2xl bg-green-600 hover:bg-green-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-lg font-bold mb-1 text-white">Aus zwei Punkten</p>
                  <p className="text-xl font-serif italic mb-2 text-white">P₁(1|2), P₂(4|5)</p>
                  <p className="text-sm text-white/90">Zwei Punkte sind gegeben. Du tippst die ganze Gleichung ein.</p>
                </button>
                <button
                  type="button"
                  onClick={() => ueben('readGraph')}
                  className="rounded-2xl bg-red-600 hover:bg-red-700 text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-lg font-bold mb-1 text-white">Graph ablesen</p>
                  <p className="text-xl font-serif italic mb-2 text-white">y = ?</p>
                  <p className="text-sm text-white/90">Klicke zwei Punkte auf dem Graphen an und bestimme rechnerisch die Gleichung.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TaskShell>
    )
  }

  return (
    <TaskShell title="Funktionsgleichung aufstellen" width="wide" actions={<div className={styles.pointsCounter} aria-label={`${punkte} Punkte`}><i className="fa-solid fa-star" aria-hidden="true" /><span className={styles.pointsText}>{punkte}</span></div>}>
      <div className={styles.card}>

        <div className={styles.controls}>
          <button onClick={genTwoPoints} className={styles.btn}>Neue Aufgabe: 2 Punkte</button>
          <button onClick={genReadGraph} className={styles.btn}>Neue Aufgabe: Graph ablesen</button>
        </div>

        <div className={styles.layout}>
        <div className={styles.colTask}>
        {/* Task - nur Text, kein Kasten */}
        <div className={styles.taskText}>
          {mode === 'twoPoints' ? (
            <p>Gegeben sind die Punkte P₁({p1.x}|{p1.y}) und P₂({p2.x}|{p2.y}). Stelle die Funktionsgleichung auf und tippe sie vollständig ein.<br/><small>(Runde auf 2 Nachkommastellen, auch das Zwischenergebnis für m. Rechne mit dem gerundeten m weiter.)</small></p>
          ) : mode === 'pointSlope' ? (
            <p>Gegeben ist der Punkt P({p1.x}|{p1.y}) und die Steigung m (oben). Stelle die Funktionsgleichung auf und tippe sie vollständig ein.<br/><small>(Runde auf 2 Nachkommastellen, auch das Zwischenergebnis für m. Rechne mit dem gerundeten m weiter.)</small></p>
          ) : (
            <p>Lies zwei Punkte aus dem Funktionsgraphen ab und bestimme anschließend rechnerisch die Funktionsgleichung y = mx + t.<br/><small>Klicke dazu zwei Punkte an, die du genau ablesen kannst. Tippe die Gleichung dann vollständig ein.</small></p>
          )}
        </div>

        {mode === 'readGraph' && (
          <>
            <div className={styles.graphContainer}>
              <KlickGraph m={mCorrect} t={tCorrect} points={gewaehlt} onPick={pickPunkt} />
            </div>
            <p className={styles.punktInfo} aria-live="polite">
              {klickHinweis ? (
                <span className={styles.punktFehler}>{klickHinweis}</span>
              ) : gewaehlt.length === 0 ? (
                'Klicke zwei Punkte auf dem Graphen an.'
              ) : (
                <>Abgelesen: {gewaehlt.map((p, i) => <strong key={i}>P<sub>{i + 1}</sub>({p.x}|{p.y}){i < gewaehlt.length - 1 ? '  ' : ''}</strong>)}{gewaehlt.length < 2 && ' – noch ein Punkt fehlt.'}</>
              )}
            </p>
          </>
        )}
        </div>

        <div className={styles.colWork}>

        {/* Eingabe: die komplette Funktionsgleichung, z. B. y = 2x + 3 */}
        <div className={styles.solutionInputContainer}>
          <label htmlFor="fg-eingabe">Funktionsgleichung:</label>
          <GleichungEingabe
            id="fg-eingabe"
            value={eingabe}
            onChange={(v) => {
              setEingabe(v)
              setEingabeStatus(null)
              setFeedback('')
              tracking.onInput()
            }}
            className={fieldCheckClass(eingabeStatus)}
            vorschau={false}
          />
        </div>
        <p className={styles.eingabeHinweis}>Tippe die ganze Gleichung ein, mit „y =“, Steigung, x und y-Achsenabschnitt (z. B. y = −0,5x + 2).</p>

        {/* Live-Vorschau: so wird die Eingabe gelesen */}
        {(() => {
          const p = parseLinearEquation(eingabe)
          return p.ok ? (
            <div className={styles.equationPreview} aria-live="polite">
              <span className={styles.previewLabel}>So lese ich deine Eingabe:</span>
              <span className={styles.previewMath}><InlineMath math={texLinearEquation(p.m, p.t)} /></span>
            </div>
          ) : null
        })()}

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
              {mode === 'readGraph' || mode === 'twoPoints' ? (
                <>
                  {(() => {
                    const product = Math.round(mCorrect * s1.x * 100) / 100
                    const operation = product < 0 ? '+' : '-'
                    const operand = Math.abs(product)
                    return (
                      <>
                        <MathDisplay latex={`$$\\textbf{Schritt 1: Punkte aufschreiben}$$`} />
                        <MathDisplay latex={`$$P_1(${s1.x}|${s1.y}) \\quad P_2(${s2.x}|${s2.y})$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 2: Ansatz}$$`} />
                        <MathDisplay latex={`$$y = m \\cdot x + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 3: Steigung m berechnen}$$`} />
                        <MathDisplay latex={`$$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${s2.y} - (${s1.y})}{${s2.x} - (${s1.x})} = \\dfrac{${s2.y - s1.y}}{${s2.x - s1.x}} = ${mCorrect}$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 4: m einsetzen}$$`} />
                        <MathDisplay latex={`$$y = ${mCorrect} \\cdot x + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 5: Punkt } P_1(${s1.x}|${s1.y}) \\textbf{ einsetzen}$$`} />
                        <MathDisplay latex={`$$${s1.y} = ${mCorrect} \\cdot ${s1.x} + t$$`} />
                        
                        <MathDisplay latex={`$$\\textbf{Schritt 6: Nach t auflösen}$$`} />
                        <MathDisplay latex={`$$${s1.y} = ${product} + t \\quad | ${operation} ${operand}$$`} />
                        <MathDisplay latex={`$$t = ${s1.y} ${operation} ${operand} = ${tCorrect}$$`} />
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
              <MathDisplay latex={`$$${texLinearEquation(mCorrect, tCorrect)}$$`} />
            </div>
          </div>
        )}
        </div>
        </div>
      </div>

    </TaskShell>
  )
}
