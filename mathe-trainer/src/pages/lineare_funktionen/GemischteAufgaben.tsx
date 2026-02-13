import React, { useEffect, useState, useRef } from 'react'
import styles from './GemischteAufgaben.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'

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

// ===== Aufgabengenerator für alle 7 Themen =====
const aufgabenBanks = {
  // 1. Graph zeichnen (30 Variationen)
  graphZeichnen: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3]
    const m = slopes[randInt(0, slopes.length - 1)]
    const t = randInt(-4, 4)
    return {
      typ: 'graphZeichnen',
      thema: '1. Graph zeichnen',
      frage: `Skizziere den Graphen für: y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)}`,
      isGraph: true,
      m,
      t,
      antwort: { m, t },
      lösungsweg: `Der y-Achsenabschnitt ist t = ${t}. Die Steigung ist m = ${m}.`
    }
  },

  // 2. Funktionsgleichung ablesen (30 Variationen)
  ablesen: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3]
    const m = slopes[randInt(0, slopes.length - 1)]
    const t = randInt(-4, 4)
    return {
      typ: 'ablesen',
      thema: '2. Funktionsgleichung ablesen',
      frage: `Lies m und t ab! Gib ein: m; t (z.B. 2;-3)`,
      isGraph: true,
      m,
      t,
      antwort: `${m};${t}`,
      lösungsweg: `Der y-Achsenabschnitt ist t = ${t}. Die Steigung ist m = ${m}. Also: y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)}`
    }
  },

  // 3. Steigung berechnen (30 Variationen)
  steigungBerechnen: () => {
    let x1, x2
    do {
      x1 = randInt(-5, 5)
      x2 = randInt(-5, 5)
    } while (x1 === x2)
    const y1 = randInt(-5, 5)
    const y2 = randInt(-5, 5)
    const m = (y2 - y1) / (x2 - x1)
    const mRound = Math.round(m * 100) / 100
    return {
      typ: 'steigungBerechnen',
      thema: '3. Steigung berechnen',
      frage: `Berechne m zwischen P₁(${x1}|${y1}) und P₂(${x2}|${y2})`,
      antwort: mRound,
      lösungsweg: `$$m = \\dfrac{${y2} - (${y1})}{${x2} - (${x1})} = \\dfrac{${y2 - y1}}{${x2 - x1}} = ${mRound}$$`
    }
  },

  // 4. Funktionsgleichung aufstellen (30 Variationen)
  funktionsgleichung: () => {
    let x1, x2
    do {
      x1 = randInt(-5, 5)
      x2 = randInt(-5, 5)
    } while (x1 === x2)
    const y1 = randInt(-5, 5)
    const y2 = randInt(-5, 5)
    const m = (y2 - y1) / (x2 - x1)
    const t = y1 - m * x1
    const mRound = Math.round(m * 100) / 100
    const tRound = Math.round(t * 100) / 100
    return {
      typ: 'funktionsgleichung',
      thema: '4. Funktionsgleichung aufstellen',
      frage: `Stelle die Gleichung auf: P₁(${x1}|${y1}), P₂(${x2}|${y2}). Gib ein: m; t`,
      antwort: `${mRound};${tRound}`,
      lösungsweg: `$$m = \\dfrac{${y2 - y1}}{${x2 - x1}} = ${mRound}$$\n$$t = ${y1} - ${mRound} \\cdot ${x1} = ${tRound}$$\n$$y = ${mRound}x ${tRound >= 0 ? '+' : '-'} ${Math.abs(tRound)}$$`
    }
  },

  // 5. Punkt auf Gerade prüfen (30 Variationen)
  punktAufGerade: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3]
    const m = slopes[randInt(0, slopes.length - 1)]
    const t = randInt(-4, 4)
    const x = randInt(-3, 3)
    const y = Math.round((m * x + t) * 100) / 100
    const variantIdx = randInt(0, 2)
    let testY = y
    if (variantIdx === 1) {
      testY = y + 1
    } else if (variantIdx === 2) {
      testY = y - 1
    }
    const antwort = testY === y ? 'ja' : 'nein'
    return {
      typ: 'punktAufGerade',
      thema: '5. Punkt auf Gerade prüfen',
      frage: `Liegt P(${x}|${testY}) auf y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)}? (ja/nein)`,
      antwort,
      lösungsweg: `Einsetzen: y = ${m} \\cdot ${x} ${t >= 0 ? '+' : '-'} ${Math.abs(t)} = ${y}. Der Punkt ${antwort === 'ja' ? 'liegt' : 'liegt nicht'} auf der Geraden.`
    }
  },

  // 6. Nullstellen berechnen (30 Variationen)
  nullstellen: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3]
    let m = slopes[randInt(0, slopes.length - 1)]
    let t = randInt(-4, 4)
    if (m === 0 || t === 0) return aufgabenBanks.nullstellen()
    const nullstelle = Math.round((-t / m) * 100) / 100
    return {
      typ: 'nullstellen',
      thema: '6. Nullstellen berechnen',
      frage: `Berechne die Nullstelle: y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)}`,
      antwort: nullstelle,
      lösungsweg: `$$0 = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)} \\quad | ${t >= 0 ? '-' : '+'} ${Math.abs(t)}$$\n$$${t >= 0 ? '-' : ''}${Math.abs(t)} = ${m}x \\quad | \\div ${m}$$\n$$x = ${nullstelle}$$`
    }
  },

  // 7. Schnittpunkt zweier Geraden (30 Variationen)
  schnittpunkt: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3]
    let m1, m2
    do {
      m1 = slopes[randInt(0, slopes.length - 1)]
      m2 = slopes[randInt(0, slopes.length - 1)]
    } while (m1 === m2)
    const t1 = randInt(-3, 3)
    const t2 = randInt(-3, 3)
    const x = Math.round(((t2 - t1) / (m1 - m2)) * 100) / 100
    const y = Math.round((m1 * x + t1) * 100) / 100
    return {
      typ: 'schnittpunkt',
      thema: '7. Schnittpunkt zweier Geraden',
      frage: `Schnittpunkt: g₁: y = ${m1}x ${t1 >= 0 ? '+' : '-'} ${Math.abs(t1)} und g₂: y = ${m2}x ${t2 >= 0 ? '+' : '-'} ${Math.abs(t2)}. Gib x ein:`,
      antwort: x,
      lösungsweg: `Gleichsetzen: ${m1}x ${t1 >= 0 ? '+' : '-'} ${Math.abs(t1)} = ${m2}x ${t2 >= 0 ? '+' : '-'} ${Math.abs(t2)}\n$$x = ${x}, \\quad y = ${y}$$\nSchnittpunkt: (${x}|${y})`
    }
  }
}

interface Aufgabe {
  typ: string
  thema: string
  frage: string
  antwort: any
  lösungsweg: string
  m?: number
  t?: number
  isGraph?: boolean
}

export default function GemischteAufgaben() {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([])
  const [antworten, setAntworten] = useState<{ [key: number]: string }>({})
  const [validiert, setValidiert] = useState<{ [key: number]: boolean }>({})
  const [showLösung, setShowLösung] = useState<{ [key: number]: boolean }>({})

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

  // 10 vermischte Aufgaben generieren
  function generiereAufgaben() {
    const neue: Aufgabe[] = []
    const themen = Object.keys(aufgabenBanks) as (keyof typeof aufgabenBanks)[]
    
    // Zufällig Themen auswählen
    for (let i = 0; i < 10; i++) {
      const thema = themen[randInt(0, themen.length - 1)]
      neue.push(aufgabenBanks[thema]())
    }
    
    setAufgaben(neue)
    setAntworten({})
    setValidiert({})
    setShowLösung({})
  }

  useEffect(() => {
    generiereAufgaben()
  }, [])

  function validateAnswer(index: number, value: string): boolean {
    const aufgabe = aufgaben[index]
    if (!aufgabe) return false

    const inputVal = value.replace(',', '.').trim()
    
    if (inputVal === '') return false

    // Verschiedene Validierungslogiken
    if (aufgabe.typ === 'funktionsgleichung' || aufgabe.typ === 'ablesen') {
      const parts = inputVal.split(';').map(p => p.trim())
      if (parts.length !== 2) return false
      const m = parseFloat(parts[0])
      const t = parseFloat(parts[1])
      const expectedParts = (aufgabe.antwort as string).split(';').map(p => parseFloat(p.trim()))
      return Math.abs(m - expectedParts[0]) < 0.02 && Math.abs(t - expectedParts[1]) < 0.02
    } else if (aufgabe.typ === 'punktAufGerade') {
      return inputVal.toLowerCase() === aufgabe.antwort
    } else {
      const num = parseFloat(inputVal)
      return Math.abs(num - aufgabe.antwort) < 0.02
    }
  }

  function handleAnswerChange(index: number, value: string) {
    setAntworten({ ...antworten, [index]: value })
  }

  function checkAnswer(index: number) {
    const isCorrect = validateAnswer(index, antworten[index] || '')
    setValidiert({ ...validiert, [index]: isCorrect })
  }

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gemischte Übungsaufgaben</h1>
        <p className={styles.subtitle}>Löse die Aufgaben und überprüfe deine Ergebnisse!</p>
      </div>

      <button onClick={generiereAufgaben} className={styles.newButton}>
        🔄 Neue Aufgaben
      </button>

      <div className={styles.aufgabenContainer}>
        {aufgaben.map((aufgabe, index) => (
          <div key={index} className={styles.aufgabeCard}>
            <div className={styles.aufgabeHeader}>
              <span className={styles.aufgabenNummer}>Aufgabe {index + 1}</span>
              <span className={styles.themaLabel}>{aufgabe.thema}</span>
            </div>

            <p className={styles.frage}>{aufgabe.frage}</p>

            {/* Graph-Anzeige für Ablesen und Graph-Zeichnen */}
            {aufgabe.isGraph && aufgabe.m !== undefined && aufgabe.t !== undefined && (
              <div className={styles.graphContainer}>
                <GeoGebraGraph m={aufgabe.m} t={aufgabe.t} width={400} height={400} />
              </div>
            )}

            {/* Eingabe-Feld */}
            <div className={styles.eingabeContainer}>
              <input
                type="text"
                placeholder={aufgabe.typ === 'funktionsgleichung' || aufgabe.typ === 'ablesen' ? 'm; t' : 'Ergebnis'}
                value={antworten[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`${styles.input} ${validiert[index] ? styles.correct : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer(index)}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={() => checkAnswer(index)} className={styles.checkBtn}>
                ✓ Prüfen
              </button>
              <button 
                onClick={() => setShowLösung({ ...showLösung, [index]: !showLösung[index] })} 
                className={styles.solutionBtn}
              >
                {showLösung[index] ? '✕ Lösung ausblenden' : '? Lösung anzeigen'}
              </button>
            </div>

            {validiert[index] && (
              <div className={styles.feedbackBox}>
                ✓ Richtig!
              </div>
            )}

            {showLösung[index] && (
              <div className={styles.lösungBox}>
                <h4 className={styles.lösungTitle}>Lösungsweg:</h4>
                <MathDisplay latex={`$$${aufgabe.lösungsweg}$$`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
