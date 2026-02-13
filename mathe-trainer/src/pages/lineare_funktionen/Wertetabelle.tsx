import React, { useEffect, useState, useRef } from 'react'
import styles from './Wertetabelle.module.css'

// MathJax-Komponente
const MathDisplay = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current && (window as any).MathJax) {
      (window as any).MathJax.contentDocument = document
      ;(window as any).MathJax.typesetPromise?.([ref.current]).catch((err: any) => console.log(err))
    }
  }, [latex])
  
  return <div ref={ref}>{latex}</div>
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generiert zufällige m und t Werte im Bereich -10 bis 10 mit Schrittweite 0.5
function generateRandomMT() {
  const möglicheWerte = []
  for (let v = -10; v <= 10; v += 0.5) {
    möglicheWerte.push(Math.round(v * 10) / 10)
  }
  
  let m = möglicheWerte[randInt(0, möglicheWerte.length - 1)]
  let t = möglicheWerte[randInt(0, möglicheWerte.length - 1)]
  
  // m darf nicht 0 sein
  while (m === 0) {
    m = möglicheWerte[randInt(0, möglicheWerte.length - 1)]
  }
  
  return { m, t }
}

// Formatiert die Funktionsgleichung korrekt
function formatEquation(m: number, t: number): string {
  let equation = `y = ${m}x`
  
  if (t !== 0) {
    equation += t > 0 ? ` + ${t}` : ` - ${Math.abs(t)}`
  }
  
  return equation
}

// LaTeX-Version für MathJax
function formatEquationLatex(m: number, t: number): string {
  let equation = `y = ${m}x`
  
  if (t !== 0) {
    equation += t > 0 ? ` + ${t}` : ` - ${Math.abs(t)}`
  }
  
  return `$$${equation}$$`
}

// ===== Aufgabengenerator =====
const aufgabenBanks = {
  // Typ 1: Völlig leere Wertetabelle ausfüllen
  leereTabelleAusfüllen: () => {
    const { m, t } = generateRandomMT()
    
    return {
      typ: 'leereTabelleAusfüllen',
      thema: '1. Wertetabelle aus Funktionsgleichung',
      frage: `Gegeben ist die Funktionsgleichung ${formatEquation(m, t)}. Erstelle eine Wertetabelle mit mindestens 4 Wertepaaren.`,
      m,
      t,
      funktionsgleichung: formatEquation(m, t),
      funktionsgleichungLatex: formatEquationLatex(m, t),
      numZeilen: 4,
      lösungsweg: `Setze verschiedene x-Werte in die Funktionsgleichung ein und berechne die entsprechenden y-Werte.`
    }
  },

  // Typ 2: Teilweise gefüllte Wertetabelle vervollständigen
  teilweisgefülltVervollständigen: () => {
    const { m, t } = generateRandomMT()
    
    // X-Werte fix
    const xWerte = [-2, -1, 0, 1, 2]
    const yWerte = xWerte.map(x => Math.round((m * x + t) * 100) / 100)
    
    // Zufällig einige y-Werte verstecken (mindestens 2, maximal 4)
    const verstecktIndizes: number[] = []
    const anzahlVersteckt = randInt(2, 4)
    while (verstecktIndizes.length < anzahlVersteckt) {
      const idx = randInt(0, xWerte.length - 1)
      if (!verstecktIndizes.includes(idx)) {
        verstecktIndizes.push(idx)
      }
    }
    
    return {
      typ: 'teilweisgefülltVervollständigen',
      thema: '2. Wertetabelle vervollständigen',
      frage: `Vervollständige die Wertetabelle für die Funktionsgleichung ${formatEquation(m, t)}.`,
      m,
      t,
      funktionsgleichung: formatEquation(m, t),
      funktionsgleichungLatex: formatEquationLatex(m, t),
      xWerte,
      yWerte,
      gebenY: yWerte.map((_, idx) => !verstecktIndizes.includes(idx)),
      verstecktIndizes,
      lösungsweg: `Setze die x-Werte in die Funktionsgleichung ein: ${formatEquationLatex(m, t)}`
    }
  }
}

interface Aufgabe {
  typ: string
  thema: string
  frage: string
  m: number
  t: number
  funktionsgleichung: string
  funktionsgleichungLatex: string
  [key: string]: any
}

export default function Wertetabelle() {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([])
  const [antworten, setAntworten] = useState<{ [key: number]: Array<{ x: string; y: string }> }>({})
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

  // 10 vermischte Aufgaben generieren (unterschiedliche m/t Kombinationen)
  function generiereAufgaben() {
    const neue: Aufgabe[] = []
    
    // Generiere 10 verschiedene Aufgaben mit zufälligen m/t
    for (let i = 0; i < 10; i++) {
      // Zufällig zwischen Typ 1 und Typ 2 wählen
      const typ = Math.random() > 0.5 ? 'leereTabelleAusfüllen' : 'teilweisgefülltVervollständigen'
      const aufgabenGenerator = aufgabenBanks[typ as keyof typeof aufgabenBanks]
      neue.push(aufgabenGenerator())
    }
    
    setAufgaben(neue)
    setAntworten({})
    setValidiert({})
    setShowLösung({})
  }

  useEffect(() => {
    generiereAufgaben()
  }, [])

  function validateAnswer(index: number, aufgabe: Aufgabe): boolean {
    const eingaben = antworten[index]
    if (!eingaben || eingaben.length === 0) return false
    
    const m = aufgabe.m
    const t = aufgabe.t
    const tolerance = 0.02

    // Alle eingegebenen Wertepaare prüfen
    for (const eintrag of eingaben) {
      const x = parseFloat(eintrag.x.replace(',', '.'))
      const y = parseFloat(eintrag.y.replace(',', '.'))
      
      if (isNaN(x) || isNaN(y)) return false
      
      // Prüfe, ob y = m*x + t
      const expectedY = Math.round((m * x + t) * 100) / 100
      if (Math.abs(y - expectedY) > tolerance) {
        return false
      }
    }
    
    return true
  }

  function validateType2(index: number, aufgabe: Aufgabe): boolean {
    const eingaben = antworten[index]
    if (!eingaben) return false
    
    const m = aufgabe.m
    const t = aufgabe.t
    const tolerance = 0.02
    
    // Prüfe nur die y-Werte für versteckte Indizes
    for (let i = 0; i < eingaben.length; i++) {
      if (!aufgabe.gebenY[i]) {
        const y = parseFloat(eingaben[i].y.replace(',', '.'))
        if (isNaN(y)) return false
        
        const expectedY = aufgabe.yWerte[i]
        if (Math.abs(y - expectedY) > tolerance) {
          return false
        }
      }
    }
    
    return true
  }

  function checkAnswer(index: number) {
    const aufgabe = aufgaben[index]
    const isCorrect = aufgabe.typ === 'leereTabelleAusfüllen' 
      ? validateAnswer(index, aufgabe)
      : validateType2(index, aufgabe)
    setValidiert({ ...validiert, [index]: isCorrect })
  }

  function updateTableValue(aufgabeIndex: number, rowIndex: number, field: 'x' | 'y', value: string) {
    const currentAnswers = antworten[aufgabeIndex] || []
    
    // Ensure array is long enough
    while (currentAnswers.length <= rowIndex) {
      currentAnswers.push({ x: '', y: '' })
    }
    
    currentAnswers[rowIndex][field] = value
    setAntworten({
      ...antworten,
      [aufgabeIndex]: currentAnswers
    })
    
    setValidiert({ ...validiert, [aufgabeIndex]: false })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wertetabellen</h1>
        <p className={styles.subtitle}>Erstelle oder vervollständige Wertetabellen für lineare Funktionen</p>
      </div>

      <button onClick={generiereAufgaben} className={styles.newButton}>
        🔄 Neue Aufgaben
      </button>

      <div className={styles.aufgabenContainer}>
        {aufgaben.map((aufgabe, index) => (
          <div key={index} className={`${styles.aufgabeCard} ${validiert[index] ? styles.cardCorrect : ''}`}>
            <div className={styles.aufgabeHeader}>
              <span className={styles.aufgabenNummer}>Aufgabe {index + 1}</span>
              <span className={styles.themaLabel}>{aufgabe.thema}</span>
            </div>

            <div className={styles.content}>
              <p className={styles.frage}>{aufgabe.frage}</p>
              
              <MathDisplay latex={aufgabe.funktionsgleichungLatex} />

              {/* Typ 1: Leere Wertetabelle */}
              {aufgabe.typ === 'leereTabelleAusfüllen' && (
                <div className={styles.tableSection}>
                  <table className={styles.wertetabelle}>
                    <tbody>
                      <tr>
                        <th>x</th>
                        {Array.from({ length: aufgabe.numZeilen }).map((_, i) => (
                          <td key={`x-${i}`}>
                            <input
                              type="text"
                              placeholder="x"
                              value={antworten[index]?.[i]?.x || ''}
                              onChange={(e) => updateTableValue(index, i, 'x', e.target.value)}
                              className={styles.tableInput}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr className={styles.yRow}>
                        <th>y</th>
                        {Array.from({ length: aufgabe.numZeilen }).map((_, i) => (
                          <td key={`y-${i}`}>
                            <input
                              type="text"
                              placeholder="y"
                              value={antworten[index]?.[i]?.y || ''}
                              onChange={(e) => updateTableValue(index, i, 'y', e.target.value)}
                              className={styles.tableInput}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Typ 2: Teilweise gefüllte Wertetabelle */}
              {aufgabe.typ === 'teilweisgefülltVervollständigen' && (
                <div className={styles.tableSection}>
                  <table className={styles.wertetabelle}>
                    <tbody>
                      <tr>
                        <th>x</th>
                        {aufgabe.xWerte.map((x: number, i: number) => (
                          <td key={`x-${i}`} className={styles.xCell}>{x}</td>
                        ))}
                      </tr>
                      <tr className={styles.yRow}>
                        <th>y</th>
                        {aufgabe.yWerte.map((y: number, i: number) => (
                          <td key={`y-${i}`}>
                            {aufgabe.gebenY[i] ? (
                              <span className={styles.givenValue}>{y}</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="?"
                                value={antworten[index]?.[i]?.y || ''}
                                onChange={(e) => updateTableValue(index, i, 'y', e.target.value)}
                                className={styles.tableInput}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Buttons */}
              <div className={styles.buttonGroup}>
                <button onClick={() => checkAnswer(index)} className={styles.checkBtn}>
                  Prüfen
                </button>
                <button 
                  onClick={() => setShowLösung({ ...showLösung, [index]: !showLösung[index] })} 
                  className={styles.solutionBtn}
                >
                  {showLösung[index] ? 'Lösung ausblenden' : 'Lösung anzeigen'}
                </button>
              </div>

              {/* Feedback */}
              {validiert[index] && (
                <div className={styles.feedbackBox}>
                  ✓ Richtig!
                </div>
              )}

              {/* Lösung */}
              {showLösung[index] && (
                <div className={styles.lösungBox}>
                  <h4>Tipp:</h4>
                  <MathDisplay latex={aufgabe.lösungsweg} />
                  {aufgabe.typ === 'teilweisgefülltVervollständigen' && (
                    <div className={styles.lösungTabelle}>
                      <table className={styles.wertetabelle}>
                        <tbody>
                          <tr>
                            <th>x</th>
                            {aufgabe.xWerte.map((x: number, i: number) => (
                              <td key={`sol-x-${i}`} className={styles.xCell}>{x}</td>
                            ))}
                          </tr>
                          <tr className={styles.yRow}>
                            <th>y</th>
                            {aufgabe.yWerte.map((y: number, i: number) => (
                              <td key={`sol-y-${i}`} className={!aufgabe.gebenY[i] ? styles.sollution : ''}>
                                {y}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
