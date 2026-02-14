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

// Wertetabelle-Komponente für graphZeichnen (leere Tabelle zum Ausfüllen)
interface WertetabelleProps {
  m: number
  t: number
  value: any
  onChange: (newValues: any, newValidierteZellen: any) => void
  validierteZellen: { [key: string]: boolean }
}

const Wertetabelle = ({ m, t, value, onChange, validierteZellen }: WertetabelleProps) => {
  const numRows = 4 // Schüler kann 4 Wertepaare eingeben
  const tolerance = 0.02

  const handleChange = (rowIndex: number, field: 'x' | 'y', inputValue: string) => {
    const newValues = { ...value }
    if (!newValues[rowIndex]) {
      newValues[rowIndex] = { x: '', y: '' }
    }
    newValues[rowIndex][field] = inputValue

    // Live-Validierung
    const cellKey = `graph-${rowIndex}`
    const newValidierteZellen = { ...validierteZellen }

    const x = parseFloat(newValues[rowIndex].x.replace(',', '.'))
    const y = parseFloat(newValues[rowIndex].y.replace(',', '.'))

    // Beide Felder müssen gefüllt sein UND gültige Zahlen sein
    if (!isNaN(x) && !isNaN(y) && newValues[rowIndex].x !== '' && newValues[rowIndex].y !== '') {
      const expectedY = Math.round((m * x + t) * 100) / 100
      newValidierteZellen[cellKey] = Math.abs(y - expectedY) <= tolerance
    } else {
      delete newValidierteZellen[cellKey]
    }

    onChange(newValues, newValidierteZellen)
  }

  const correctCount = Object.values(validierteZellen).filter(Boolean).length

  return (
    <div className={styles.wertetabelleContainer}>
      <table className={styles.wertetabelle}>
        <tbody>
          <tr>
            <th className={styles.tableHeader}>x</th>
            <th className={styles.tableHeader}>y</th>
          </tr>
          {Array.from({ length: numRows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              <td className={styles.tableCell}>
                <input
                  type="text"
                  placeholder="x eingeben"
                  value={value?.[rowIndex]?.x || ''}
                  onChange={(e) => handleChange(rowIndex, 'x', e.target.value)}
                  className={`${styles.tableInput} ${validierteZellen[`graph-${rowIndex}`] ? styles.inputCorrect : ''}`}
                />
              </td>
              <td className={styles.tableCell}>
                <input
                  type="text"
                  placeholder="y eingeben"
                  value={value?.[rowIndex]?.y || ''}
                  onChange={(e) => handleChange(rowIndex, 'y', e.target.value)}
                  className={`${styles.tableInput} ${validierteZellen[`graph-${rowIndex}`] ? styles.inputCorrect : ''}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.hint}>
        {correctCount} / {numRows} korrekte Wertepaare
      </p>
    </div>
  )
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
      frage: `Erstelle eine Wertetabelle für y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)} und zeichne den Funktionsgraph in ein selbst erstelltes Koordinatensystem.`,
      isGraph: true,
      m,
      t,
      antwort: `${m};${t}`,
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
      frage: `Lies m und t aus dem Graphen ab`,
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
      frage: `Wie groß ist die Steigung m zwischen P₁(${x1}|${y1}) und P₂(${x2}|${y2})? Berechne!`,
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
      frage: `Wie lautet die Funktionsgleichung der Geraden, die durch die Punkte P₁(${x1}|${y1}), P₂(${x2}|${y2}) verläuft? Berechne!`,
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
      frage: `Liegt P(${x}|${testY}) auf y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)}?`,
      antwort,
      lösungsweg: `Einsetzen: $$y = ${m} \\cdot ${x} ${t >= 0 ? '+' : '-'} ${Math.abs(t)} = ${y}$$. Der Punkt ${antwort === 'ja' ? 'liegt' : 'liegt nicht'} auf der Geraden.`
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
      frage: `Berechne die Koordinaten des Schnittpunktes der beiden Geraden g₁: y = ${m1}x ${t1 >= 0 ? '+' : '-'} ${Math.abs(t1)} und g₂: y = ${m2}x ${t2 >= 0 ? '+' : '-'} ${Math.abs(t2)}.`,
      antwort: { x, y },
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
  const [antworten, setAntworten] = useState<{ [key: number]: { m?: string; t?: string; x?: string; y?: string; value?: string; [key: number]: any } }>({})
  const [validiert, setValidiert] = useState<{ [key: number]: boolean }>({})
  const [showLösung, setShowLösung] = useState<{ [key: number]: boolean }>({})
  const [validierteZellen, setValidierteZellen] = useState<{ [key: number | string]: { [key: string]: boolean } }>({})
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

  function validateAnswer(index: number, inputData: any): boolean {
    const aufgabe = aufgaben[index]
    if (!aufgabe) return false
    
    if (aufgabe.typ === 'graphZeichnen') {
      // Wertetabelle: mindestens 2 von 4 Wertepaaren korrekt
      const cellsForThisTask = validierteZellen[index] || {}
      const correctCount = Object.values(cellsForThisTask).filter(Boolean).length
      return correctCount >= 2
    } else if (aufgabe.typ === 'funktionsgleichung' || aufgabe.typ === 'ablesen') {
      const m = parseFloat((inputData.m || '').replace(',', '.'))
      const t = parseFloat((inputData.t || '').replace(',', '.'))
      if (isNaN(m) || isNaN(t)) return false
      const expectedParts = (aufgabe.antwort as string).split(';').map(p => parseFloat(p.trim()))
      return Math.abs(m - expectedParts[0]) < 0.02 && Math.abs(t - expectedParts[1]) < 0.02
    } else if (aufgabe.typ === 'schnittpunkt') {
      const x = parseFloat((inputData.x || '').replace(',', '.'))
      const y = parseFloat((inputData.y || '').replace(',', '.'))
      if (isNaN(x) || isNaN(y)) return false
      const expected = aufgabe.antwort as { x: number; y: number }
      return Math.abs(x - expected.x) < 0.02 && Math.abs(y - expected.y) < 0.02
    } else if (aufgabe.typ === 'punktAufGerade') {
      return (inputData.value || '').toLowerCase() === aufgabe.antwort
    } else {
      const num = parseFloat((inputData.value || '').replace(',', '.'))
      return Math.abs(num - aufgabe.antwort) < 0.02
    }
  }

  function checkAnswer(index: number) {
    const isCorrect = validateAnswer(index, antworten[index] || {})
    setValidiert({ ...validiert, [index]: isCorrect })
  }

  function handleMtChange(index: number, field: 'm' | 't', value: string) {
    setAntworten({
      ...antworten,
      [index]: {
        ...antworten[index],
        [field]: value
      }
    })
  }

  function handleValueChange(index: number, value: string) {
    setAntworten({
      ...antworten,
      [index]: {
        ...antworten[index],
        value
      }
    })
  }

  function handleXYChange(index: number, field: 'x' | 'y', value: string) {
    setAntworten({
      ...antworten,
      [index]: {
        ...antworten[index],
        [field]: value
      }
    })
  }

  function handleYesNo(index: number, answer: 'ja' | 'nein') {
    setAntworten({
      ...antworten,
      [index]: {
        value: answer
      }
    })
  }

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Übungsaufgaben</h1>
        <p className={styles.subtitle}>Löse die Aufgaben und überprüfe deine Ergebnisse</p>
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

              {/* Graph-Anzeige - NUR bei ablesen, nicht bei graphZeichnen */}
              {aufgabe.isGraph && aufgabe.typ !== 'graphZeichnen' && aufgabe.m !== undefined && aufgabe.t !== undefined && (
                <div className={styles.graphContainer}>
                  <GeoGebraGraph m={aufgabe.m} t={aufgabe.t} width={500} height={400} />
                </div>
              )}

              {/* Eingabe-Bereich */}
              <div className={styles.inputSection}>
                {/* ja/nein Buttons */}
                {aufgabe.typ === 'punktAufGerade' && (
                  <div className={styles.yesNoButtons}>
                    <button 
                      className={`${styles.yesNoBtn} ${antworten[index]?.value === 'ja' ? styles.selected : ''}`}
                      onClick={() => handleYesNo(index, 'ja')}
                    >
                      Ja
                    </button>
                    <button 
                      className={`${styles.yesNoBtn} ${antworten[index]?.value === 'nein' ? styles.selected : ''}`}
                      onClick={() => handleYesNo(index, 'nein')}
                    >
                      Nein
                    </button>
                  </div>
                )}

                {/* M und T Eingabe mit Live-Anzeige */}
                {(aufgabe.typ === 'funktionsgleichung' || aufgabe.typ === 'ablesen') && (
                  <div className={styles.mtSection}>
                    <div className={styles.mtInputs}>
                      <div className={styles.mtGroup}>
                        <label>m =</label>
                        <input
                          type="text"
                          placeholder="z.B. 2"
                          value={antworten[index]?.m || ''}
                          onChange={(e) => handleMtChange(index, 'm', e.target.value)}
                          className={styles.mtInput}
                        />
                      </div>
                      <div className={styles.mtGroup}>
                        <label>t =</label>
                        <input
                          type="text"
                          placeholder="z.B. -3"
                          value={antworten[index]?.t || ''}
                          onChange={(e) => handleMtChange(index, 't', e.target.value)}
                          className={styles.mtInput}
                        />
                      </div>
                    </div>

                    {/* Live-Anzeige */}
                    {antworten[index]?.m && antworten[index]?.t && (
                      <div className={styles.livePreview}>
                        <MathDisplay latex={`$$y = ${antworten[index]?.m}x ${parseFloat(antworten[index]?.t || '0') >= 0 ? '+' : ''} ${antworten[index]?.t}$$`} />
                      </div>
                    )}
                  </div>
                )}

                {/* Wertetabelle für graphZeichnen */}
                {aufgabe.typ === 'graphZeichnen' && aufgabe.m !== undefined && aufgabe.t !== undefined && (
                  <div className={styles.wertetabelleWrapper}>
                    <p className={styles.wertetabelleHint}>Fülle die Wertetabelle aus. Die Zellen werden grün, wenn dein y-Wert korrekt ist.</p>
                    <Wertetabelle
                      m={aufgabe.m}
                      t={aufgabe.t}
                      value={antworten[index] || {}}
                      onChange={(newValues: any, newValidierteZellen: any) => {
                        setAntworten({ ...antworten, [index]: newValues })
                        setValidierteZellen({ ...validierteZellen, [index]: newValidierteZellen })
                      }}
                      validierteZellen={validierteZellen[index] || {}}
                    />
                  </div>
                )}

                {/* Schnittpunkt: X und Y Eingabe */}
                {aufgabe.typ === 'schnittpunkt' && (
                  <div className={styles.xySection}>
                    <div className={styles.xyInputs}>
                      <div className={styles.xyGroup}>
                        <label>x =</label>
                        <input
                          type="text"
                          placeholder="z.B. 2"
                          value={antworten[index]?.x || ''}
                          onChange={(e) => handleXYChange(index, 'x', e.target.value)}
                          className={styles.xyInput}
                        />
                      </div>
                      <div className={styles.xyGroup}>
                        <label>y =</label>
                        <input
                          type="text"
                          placeholder="z.B. -3"
                          value={antworten[index]?.y || ''}
                          onChange={(e) => handleXYChange(index, 'y', e.target.value)}
                          className={styles.xyInput}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Standard Zahleneingabe */}
                {aufgabe.typ !== 'funktionsgleichung' && aufgabe.typ !== 'ablesen' && aufgabe.typ !== 'graphZeichnen' && aufgabe.typ !== 'punktAufGerade' && aufgabe.typ !== 'schnittpunkt' && (
                  <input
                    type="text"
                    placeholder="Ergebnis eingeben"
                    value={antworten[index]?.value || ''}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className={styles.standardInput}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer(index)}
                  />
                )}
              </div>

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
                  <h4>Lösungsweg:</h4>
                  <MathDisplay latex={aufgabe.lösungsweg} />
                  
                  {/* Graph für graphZeichnen */}
                  {aufgabe.typ === 'graphZeichnen' && aufgabe.m !== undefined && aufgabe.t !== undefined && (
                    <div className={styles.graphContainer} style={{ marginTop: '1.5rem' }}>
                      <p style={{ marginBottom: '1rem', fontWeight: 500 }}>So sieht dein Graph aus:</p>
                      <GeoGebraGraph m={aufgabe.m} t={aufgabe.t} width={500} height={400} />
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
