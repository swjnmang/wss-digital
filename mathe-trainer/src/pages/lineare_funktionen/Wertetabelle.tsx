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

// ===== Aufgabengenerator =====
const aufgabenBanks = {
  // Typ 1: Völlig leere Wertetabelle ausfüllen
  leereTabelleAusfüllen: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]
    const m = slopes[randInt(0, slopes.length - 1)]
    const t = randInt(-3, 3)
    
    return {
      typ: 'leereTabelleAusfüllen',
      thema: '1. Wertetabelle aus Funktionsgleichung',
      frage: `Gegeben ist die Funktionsgleichung y = ${m}x ${t >= 0 ? '+' : ''} ${t === 0 ? '' : Math.abs(t)}. Erstelle eine Wertetabelle mit mindestens 4 Wertepaaren.`,
      m,
      t,
      funktionsgleichung: `y = ${m}x ${t >= 0 ? '+' : ''} ${t === 0 ? '' : Math.abs(t)}`,
      numZeilen: 4,
      lösungsweg: `Setze verschiedene x-Werte in die Funktionsgleichung ein und berechne die entsprechenden y-Werte.`
    }
  },

  // Typ 2: Teilweise gefüllte Wertetabelle vervollständigen
  teilweisgefülltVervollständigen: () => {
    const slopes = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]
    const m = slopes[randInt(0, slopes.length - 1)]
    const t = randInt(-3, 3)
    
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
      frage: `Vervollständige die Wertetabelle für die Funktionsgleichung y = ${m}x ${t >= 0 ? '+' : ''} ${t === 0 ? '' : Math.abs(t)}.`,
      m,
      t,
      funktionsgleichung: `y = ${m}x ${t >= 0 ? '+' : ''} ${t === 0 ? '' : Math.abs(t)}`,
      xWerte,
      yWerte,
      gebenY: yWerte.map((_, idx) => !verstecktIndizes.includes(idx)),
      verstecktIndizes,
      lösungsweg: `Setze die x-Werte in die Funktionsgleichung ein: $$y = ${m} \\cdot x ${t >= 0 ? '+' : ''} ${t === 0 ? '' : Math.abs(t)}$$`
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
    
    // Validate button wird angeklickt, nicht auto-validate
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
              
              <MathDisplay latex={`$$${aufgabe.funktionsgleichung}$$`} />

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
