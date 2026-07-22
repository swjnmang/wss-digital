import React, { useEffect, useState, useRef } from 'react'
import styles from './GemischteAufgaben.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'
import GeoGebraMultiGraph from '../../components/GeoGebraMultiGraph'

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
      // Toleranz: 1% des erwarteten Wertes oder 0.02, je größer
      const maxError = Math.max(Math.abs(expectedY) * 0.01, 0.02)
      
      // Überprüfe, ob dieses Wertepaar bereits existiert (Duplikat-Prüfung)
      let isDuplicate = false
      for (let i = 0; i < numRows; i++) {
        if (i !== rowIndex && newValues[i]?.x && newValues[i]?.y) {
          const otherX = parseFloat(newValues[i].x.replace(',', '.'))
          const otherY = parseFloat(newValues[i].y.replace(',', '.'))
          if (!isNaN(otherX) && !isNaN(otherY) && otherX === x && otherY === y) {
            isDuplicate = true
            break
          }
        }
      }
      
      newValidierteZellen[cellKey] = !isDuplicate && Math.abs(y - expectedY) <= maxError
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
            {Array.from({ length: numRows }).map((_, idx) => (
              <td key={`x-input-${idx}`} className={styles.tableCell}>
                <input
                  type="text"
                  placeholder="x"
                  value={value?.[idx]?.x || ''}
                  onChange={(e) => handleChange(idx, 'x', e.target.value)}
                  className={`${styles.tableInput} ${validierteZellen[`graph-${idx}`] === true ? styles.inputCorrect : validierteZellen[`graph-${idx}`] === false ? styles.inputIncorrect : ''}`}
                />
              </td>
            ))}
          </tr>
          <tr>
            <th className={styles.tableHeader}>y</th>
            {Array.from({ length: numRows }).map((_, idx) => (
              <td key={`y-input-${idx}`} className={styles.tableCell}>
                <input
                  type="text"
                  placeholder="y"
                  value={value?.[idx]?.y || ''}
                  onChange={(e) => handleChange(idx, 'y', e.target.value)}
                  className={`${styles.tableInput} ${validierteZellen[`graph-${idx}`] === true ? styles.inputCorrect : validierteZellen[`graph-${idx}`] === false ? styles.inputIncorrect : ''}`}
                />
              </td>
            ))}
          </tr>
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
      frage: `Wie lautet die Funktionsgleichung des abgebildeten Funktionsgraphen? Lies m und t aus dem Graphen ab.`,
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
      lösungsweg: `Schritt 1: Steigung m berechnen\n$$m = \\dfrac{${y2} - (${y1})}{${x2} - (${x1})} = \\dfrac{${y2 - y1}}{${x2 - x1}} = ${mRound}$$\nSchritt 2: m und einen Punkt, z.B. P₁(${x1}|${y1}), in die allgemeine Form y = mx + t einsetzen\n$$${y1} = ${mRound} \\cdot (${x1}) + t$$\nSchritt 3: Gleichung nach t auflösen\n$$t = ${y1} - ${mRound} \\cdot (${x1}) = ${tRound}$$\nLösung: Funktionsgleichung\n$$y = ${mRound}x ${tRound >= 0 ? '+' : '-'} ${Math.abs(tRound)}$$`
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
      frage: `Liegt der Punkt P(${x}|${testY}) auf y = ${m}x ${t >= 0 ? '+' : '-'} ${Math.abs(t)}? Prüfe durch Rechnung und kontrolliere anschließend dein Ergebnis.`,
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
  },

  // 8. Graphen zuordnen (Zuordnungsaufgaben)
  graphZuordnen: () => {
    // Generiere 3 zufällige Funktionsgleichungen mit unterschiedlichen Steigungen
    const mValues: number[] = [];
    while (mValues.length < 3) {
      let m = 0;
      while (m === 0) {
        m = randInt(-3, 3);
      }
      // Überprüfe, ob dieser m-Wert bereits vorhanden ist
      if (!mValues.includes(m)) {
        mValues.push(m);
      }
    }
    
    const functions = mValues.map((m) => ({
      m,
      t: randInt(-3, 3)
    }));

    // Erstelle die Lösungszuordnung (welche Gleichung zu welchem Graphen)
    const antwort: { [key: number]: string } = {}
    functions.forEach((fn, idx) => {
      const eqStr = `y = ${fn.m}x ${fn.t >= 0 ? '+' : ''} ${fn.t}`
      antwort[idx] = eqStr
    })

    // Generiere alle Gleichungen (echte + Distraktoren)
    const allEquations: string[] = []
    functions.forEach((fn) => {
      const eqStr = `y = ${fn.m}x ${fn.t >= 0 ? '+' : ''} ${fn.t}`
      allEquations.push(eqStr)
    })

    // Generiere 2 Distraktoren (falsche Gleichungen)
    const distractors: string[] = []
    while (distractors.length < 2) {
      let m = 0;
      while (m === 0) {
        m = randInt(-3, 3);
      }
      const t = randInt(-3, 3)
      const eqStr = `y = ${m}x ${t >= 0 ? '+' : ''} ${t}`
      
      // Stelle sicher, dass der Distraktor nicht bereits vorhanden ist
      if (!allEquations.includes(eqStr) && !distractors.includes(eqStr)) {
        distractors.push(eqStr)
      }
    }

    // Kombiniere alle Gleichungen und shuffle sie
    const allOptions = [...allEquations, ...distractors]
    const shuffledEquations = allOptions.sort(() => Math.random() - 0.5)

    const frage = `Ordne die Funktionsgleichungen den Graphen (1, 2, 3) zu.`
    const lösungsweg = `Die Funktionsgleichungen entsprechen den Graphen:\n${functions
      .map((fn, idx) => `Graph ${idx + 1}: y = ${fn.m}x ${fn.t >= 0 ? '+' : '-'} ${Math.abs(fn.t)}`)
      .join('\n')}`

    return {
      typ: 'graphZuordnen',
      thema: '8. Graphen zuordnen',
      frage,
      isGraph: true,
      functions,
      shuffledEquations,
      antwort,
      lösungsweg
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
  const [fieldFeedback, setFieldFeedback] = useState<{ [key: number]: { [field: string]: 'correct' | 'incorrect' } }>({})
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
    
    // Zuerst jeden Aufgabentyp mindestens einmal hinzufügen (shuffled)
    const shuffledThemen = [...themen].sort(() => Math.random() - 0.5)
    shuffledThemen.forEach((thema) => {
      neue.push(aufgabenBanks[thema]())
    })
    
    // Dann die verbleibenden Aufgaben zufällig auswählen (10 - Anzahl Themen)
    for (let i = 0; i < 10 - themen.length; i++) {
      const thema = themen[randInt(0, themen.length - 1)]
      neue.push(aufgabenBanks[thema]())
    }
    
    setAufgaben(neue)
    setAntworten({})
    setValidiert({})
    setShowLösung({})
    setValidierteZellen({})
    setFieldFeedback({})
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
      const toleranzM = Math.max(Math.abs(expectedParts[0]) * 0.01, 0.02)
      const toleranzT = Math.max(Math.abs(expectedParts[1]) * 0.01, 0.02)
      return Math.abs(m - expectedParts[0]) <= toleranzM && Math.abs(t - expectedParts[1]) <= toleranzT
    } else if (aufgabe.typ === 'schnittpunkt') {
      const x = parseFloat((inputData.x || '').replace(',', '.'))
      const y = parseFloat((inputData.y || '').replace(',', '.'))
      if (isNaN(x) || isNaN(y)) return false
      const expected = aufgabe.antwort as { x: number; y: number }
      const toleranzX = Math.max(Math.abs(expected.x) * 0.01, 0.02)
      const toleranzY = Math.max(Math.abs(expected.y) * 0.01, 0.02)
      return Math.abs(x - expected.x) <= toleranzX && Math.abs(y - expected.y) <= toleranzY
    } else if (aufgabe.typ === 'graphZuordnen') {
      // Alle 4 Zuordnungen müssen stimmen
      const mappings = inputData as { [key: number]: string }
      const correctAnswer = aufgabe.antwort as { [key: number]: string }
      
      // Überprüfe alle 3 Graphen
      for (let i = 0; i < 3; i++) {
        if (!mappings[i] || mappings[i] !== correctAnswer[i]) {
          return false
        }
      }
      return true
    } else if (aufgabe.typ === 'punktAufGerade') {
      return (inputData.value || '').toLowerCase() === aufgabe.antwort
    } else {
      const num = parseFloat((inputData.value || '').replace(',', '.'))
      const toleranz = Math.max(Math.abs(aufgabe.antwort) * 0.01, 0.02)
      return Math.abs(num - aufgabe.antwort) <= toleranz
    }
  }

  function checkAnswer(index: number) {
    const isCorrect = validateAnswer(index, antworten[index] || {})
    setValidiert({ ...validiert, [index]: isCorrect })
  }

  // Ermittelt den Erwartungswert eines einzelnen Feldes für die Live-Färbung
  function getFieldExpectation(aufgabe: Aufgabe, field: string): number | null {
    if (aufgabe.typ === 'funktionsgleichung' || aufgabe.typ === 'ablesen') {
      const parts = (aufgabe.antwort as string).split(';').map(p => parseFloat(p.trim()))
      if (field === 'm') return parts[0]
      if (field === 't') return parts[1]
    } else if (aufgabe.typ === 'schnittpunkt') {
      const expected = aufgabe.antwort as { x: number; y: number }
      if (field === 'x') return expected.x
      if (field === 'y') return expected.y
    } else if (field === 'value' && typeof aufgabe.antwort === 'number') {
      return aufgabe.antwort
    }
    return null
  }

  function isFieldCorrect(aufgabe: Aufgabe, field: string, rawValue: string): boolean {
    const expected = getFieldExpectation(aufgabe, field)
    if (expected === null) return false
    const num = parseFloat(rawValue.replace(',', '.'))
    if (isNaN(num)) return false
    const toleranz = Math.max(Math.abs(expected) * 0.01, 0.02)
    return Math.abs(num - expected) <= toleranz
  }

  // Aktualisiert die Live-Färbung (grün/rot) eines einzelnen Eingabefeldes
  function updateFieldFeedback(index: number, field: string, value: string) {
    const aufgabe = aufgaben[index]
    if (!aufgabe) return
    setFieldFeedback(prev => {
      const current = { ...(prev[index] || {}) }
      if (!value.trim()) {
        delete current[field]
      } else {
        current[field] = isFieldCorrect(aufgabe, field, value) ? 'correct' : 'incorrect'
      }
      return { ...prev, [index]: current }
    })
  }

  function fieldClass(index: number, field: string): string {
    const state = fieldFeedback[index]?.[field]
    return state === 'correct' ? styles.correct : state === 'incorrect' ? styles.incorrect : ''
  }

  function handleMtChange(index: number, field: 'm' | 't', value: string) {
    setAntworten({
      ...antworten,
      [index]: {
        ...antworten[index],
        [field]: value
      }
    })
    updateFieldFeedback(index, field, value)
  }

  function handleValueChange(index: number, value: string) {
    setAntworten({
      ...antworten,
      [index]: {
        ...antworten[index],
        value
      }
    })
    updateFieldFeedback(index, 'value', value)
  }

  function handleXYChange(index: number, field: 'x' | 'y', value: string) {
    setAntworten({
      ...antworten,
      [index]: {
        ...antworten[index],
        [field]: value
      }
    })
    updateFieldFeedback(index, field, value)
  }

  function handleYesNo(index: number, answer: 'ja' | 'nein') {
    setAntworten({
      ...antworten,
      [index]: {
        value: answer
      }
    })
    const aufgabe = aufgaben[index]
    const isCorrect = aufgabe?.typ === 'punktAufGerade' && answer === aufgabe.antwort
    setFieldFeedback({
      ...fieldFeedback,
      [index]: { value: isCorrect ? 'correct' : 'incorrect' }
    })
  }

  return (
    <div className={`prose ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Übungsaufgaben</h1>
        <p className={styles.subtitle}>Löse die Aufgaben und überprüfe deine Ergebnisse</p>
        <p className={styles.roundingNote}>💡 Wichtig: Runde deine Ergebnisse auf 2 Stellen nach dem Komma!</p>
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

              {/* Graph-Anzeige - NUR bei ablesen und graphZuordnen */}
              {aufgabe.isGraph && aufgabe.typ !== 'graphZeichnen' && aufgabe.m !== undefined && aufgabe.t !== undefined && (
                <div className={styles.graphContainer}>
                  <GeoGebraGraph m={aufgabe.m} t={aufgabe.t} width={500} height={400} />
                </div>
              )}

              {/* Multi-Graph für graphZuordnen */}
              {aufgabe.typ === 'graphZuordnen' && aufgabe.functions && (
                <div className={styles.graphContainer}>
                  <GeoGebraMultiGraph functions={aufgabe.functions} width={500} height={400} />
                </div>
              )}

              {/* Eingabe-Bereich */}
              <div className={styles.inputSection}>
                {/* ja/nein Buttons */}
                {aufgabe.typ === 'punktAufGerade' && (
                  <div className={styles.yesNoButtons}>
                    <button
                      className={`${styles.yesNoBtn} ${antworten[index]?.value === 'ja' ? styles.selected : ''} ${antworten[index]?.value === 'ja' ? fieldClass(index, 'value') : ''}`}
                      onClick={() => handleYesNo(index, 'ja')}
                    >
                      Ja
                    </button>
                    <button
                      className={`${styles.yesNoBtn} ${antworten[index]?.value === 'nein' ? styles.selected : ''} ${antworten[index]?.value === 'nein' ? fieldClass(index, 'value') : ''}`}
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
                          className={`${styles.mtInput} ${fieldClass(index, 'm')}`}
                        />
                      </div>
                      <div className={styles.mtGroup}>
                        <label>t =</label>
                        <input
                          type="text"
                          placeholder="z.B. -3"
                          value={antworten[index]?.t || ''}
                          onChange={(e) => handleMtChange(index, 't', e.target.value)}
                          className={`${styles.mtInput} ${fieldClass(index, 't')}`}
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
                          className={`${styles.xyInput} ${fieldClass(index, 'x')}`}
                        />
                      </div>
                      <div className={styles.xyGroup}>
                        <label>y =</label>
                        <input
                          type="text"
                          placeholder="z.B. -3"
                          value={antworten[index]?.y || ''}
                          onChange={(e) => handleXYChange(index, 'y', e.target.value)}
                          className={`${styles.xyInput} ${fieldClass(index, 'y')}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Graphen zuordnen */}
                {aufgabe.typ === 'graphZuordnen' && aufgabe.functions && (
                  <div className={styles.zuordnungSection}>
                    {aufgabe.functions.map((fn: any, idx: number) => {
                      const equationStr = `y = ${fn.m}x ${fn.t >= 0 ? '+' : ''} ${fn.t}`
                      return (
                        <div key={idx} className={styles.zuordnungRow}>
                          <span className={styles.graphLabel}>Graph {idx + 1}</span>
                          <select
                            value={antworten[index]?.[idx] || ''}
                            onChange={(e) => {
                              setAntworten({
                                ...antworten,
                                [index]: {
                                  ...antworten[index],
                                  [idx]: e.target.value
                                }
                              })
                            }}
                            className={styles.zuordnungSelect}
                          >
                            <option value="">-- Gleichung wählen --</option>
                            {aufgabe.shuffledEquations.map((eqStr: string, eqIdx: number) => (
                              <option key={eqIdx} value={eqStr}>
                                {eqStr}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Standard Zahleneingabe */}
                {aufgabe.typ !== 'funktionsgleichung' && aufgabe.typ !== 'ablesen' && aufgabe.typ !== 'graphZeichnen' && aufgabe.typ !== 'punktAufGerade' && aufgabe.typ !== 'schnittpunkt' && aufgabe.typ !== 'graphZuordnen' && (
                  <input
                    type="text"
                    placeholder="Ergebnis eingeben"
                    value={antworten[index]?.value || ''}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className={`${styles.standardInput} ${fieldClass(index, 'value')}`}
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
              {validiert[index] === true && (
                <div className={styles.feedbackBox}>
                  ✓ Richtig!
                </div>
              )}
              {validiert[index] === false && (
                <div className={styles.feedbackBoxError}>
                  ✗ Leider noch nicht richtig. Versuche es nochmal!
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
