import React, { useEffect, useState, useRef } from 'react'
import styles from './Wertetabelle.module.css'
import GeoGebraQuadraticGraph from '../../components/GeoGebraQuadraticGraph'
import { roundHalfAwayFromZero } from '../../utils/numbers'

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

// Anzahl der Wertepaare pro Wertetabelle (mindestens 8, Schrittweite 0,5)
const ANZAHL_WERTEPAARE = 8

// Generiert eine zusammenhängende Folge von x-Werten mit Schrittweite 0,5,
// die vollständig im Bereich [-5, 5] liegt, damit sie sich sinnvoll in ein
// Koordinatensystem einzeichnen lässt.
function generateXWerte(anzahl: number = ANZAHL_WERTEPAARE): number[] {
  const spanne = (anzahl - 1) * 0.5
  const minStart = -5
  const maxStart = 5 - spanne
  const schritte = Math.round((maxStart - minStart) / 0.5)
  const start = minStart + randInt(0, schritte) * 0.5

  const xWerte: number[] = []
  for (let i = 0; i < anzahl; i++) {
    xWerte.push(Math.round((start + i * 0.5) * 10) / 10)
  }
  return xWerte
}

// Generiert zufällige a, b, c Werte: a ∈ [-3, 3] \ {0} mit Schrittweite 0.5,
// b, c ∈ [-5, 5] mit Schrittweite 0.5
function generateRandomABC() {
  const aWerte: number[] = []
  for (let v = -3; v <= 3; v += 0.5) {
    if (v !== 0) aWerte.push(Math.round(v * 10) / 10)
  }

  const bcWerte: number[] = []
  for (let v = -5; v <= 5; v += 0.5) {
    bcWerte.push(Math.round(v * 10) / 10)
  }

  const a = aWerte[randInt(0, aWerte.length - 1)]
  const b = bcWerte[randInt(0, bcWerte.length - 1)]
  const c = bcWerte[randInt(0, bcWerte.length - 1)]

  return { a, b, c }
}

// Konvertiere Dezimalzahl zu LaTeX-Bruch: 0.5 → \frac{1}{2}, 0.75 → \frac{3}{4}, etc.
function toFractionLatex(num: number): string {
  if (num === Math.round(num)) return Math.round(num).toString()

  const fractions: Record<string, string> = {
    '0.5': '\\frac{1}{2}',
    '-0.5': '-\\frac{1}{2}',
    '0.25': '\\frac{1}{4}',
    '-0.25': '-\\frac{1}{4}',
    '0.75': '\\frac{3}{4}',
    '-0.75': '-\\frac{3}{4}',
    '0.33': '\\frac{1}{3}',
    '-0.33': '-\\frac{1}{3}',
    '0.67': '\\frac{2}{3}',
    '-0.67': '-\\frac{2}{3}',
    '0.2': '\\frac{1}{5}',
    '-0.2': '-\\frac{1}{5}',
    '0.4': '\\frac{2}{5}',
    '-0.4': '-\\frac{2}{5}',
    '0.6': '\\frac{3}{5}',
    '-0.6': '-\\frac{3}{5}',
    '0.8': '\\frac{4}{5}',
    '-0.8': '-\\frac{4}{5}'
  }

  const key = num.toFixed(2)
  return fractions[key] || num.toString()
}

// Generiert a, b, c mit Brüchen für schwere Aufgaben: a ∈ [-3, 3], b, c ∈ [-5, 5]
function generateRandomABCMitBrüchen() {
  const zählerA = [-3, -2, -1, 1, 2, 3]
  const nenner = [1, 2, 3, 4]
  const zählerBC = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]

  let a = 0
  while (a === 0) {
    const z = zählerA[randInt(0, zählerA.length - 1)]
    const n = nenner[randInt(0, nenner.length - 1)]
    a = z / n
  }

  const z_b = zählerBC[randInt(0, zählerBC.length - 1)]
  const n_b = nenner[randInt(0, nenner.length - 1)]
  const b = z_b / n_b

  const z_c = zählerBC[randInt(0, zählerBC.length - 1)]
  const n_c = nenner[randInt(0, nenner.length - 1)]
  const c = z_c / n_c

  return {
    a: roundHalfAwayFromZero(a),
    b: roundHalfAwayFromZero(b),
    c: roundHalfAwayFromZero(c)
  }
}

// Formatiert die Funktionsgleichung als Klartext (mit Unicode x²)
function formatEquation(a: number, b: number, c: number): string {
  const aStr = a === 1 ? 'x²' : a === -1 ? '-x²' : `${a}x²`

  let bPart = ''
  if (b !== 0) {
    if (b === 1) bPart = ' + x'
    else if (b === -1) bPart = ' - x'
    else bPart = b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`
  }

  let cPart = ''
  if (c !== 0) {
    cPart = c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`
  }

  return `y = ${aStr}${bPart}${cPart}`
}

// LaTeX-Version für MathJax (mit Bruchdarstellung und x^2)
function formatEquationLatex(a: number, b: number, c: number): string {
  const aStr = toFractionLatex(a)
  const bAbsStr = toFractionLatex(Math.abs(b))
  const cAbsStr = toFractionLatex(Math.abs(c))

  let eq = a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${aStr}x^2`

  if (b !== 0) {
    if (Math.abs(b) === 1) {
      eq += b > 0 ? ' + x' : ' - x'
    } else {
      eq += b > 0 ? ` + ${bAbsStr}x` : ` - ${bAbsStr}x`
    }
  }

  if (c !== 0) {
    eq += c > 0 ? ` + ${cAbsStr}` : ` - ${cAbsStr}`
  }

  return `$$y = ${eq}$$`
}

// Berechnet y = a*x² + b*x + c
function berechneY(a: number, b: number, c: number, x: number): number {
  return roundHalfAwayFromZero(a * x * x + b * x + c)
}

// Generiert 2 Rechenbeispiele für die Lösungsanzeige
function generateRechenbeispiele(a: number, b: number, c: number): Array<{ x: number; y: number; berechnung: string }> {
  const beispiele: Array<{ x: number; y: number; berechnung: string }> = []

  const xWerte = new Set<number>()
  while (xWerte.size < 2) {
    const x = randInt(-3, 3)
    xWerte.add(x)
  }

  xWerte.forEach(x => {
    const y = berechneY(a, b, c, x)

    const xDisplay = x < 0 ? '(-' + Math.abs(x) + ')' : '' + x

    // a * x² Teil
    let axText = ''
    if (a === 1) axText = `${xDisplay}²`
    else if (a === -1) axText = `-${xDisplay}²`
    else axText = `${a} · ${xDisplay}²`

    // b * x Teil mit Vorzeichen
    let bxText = ''
    if (b !== 0) {
      if (b === 1) bxText = ' + ' + xDisplay
      else if (b === -1) bxText = ' - ' + xDisplay
      else bxText = b > 0 ? ` + ${b} · ${xDisplay}` : ` - ${Math.abs(b)} · ${xDisplay}`
    }

    // c Teil mit Vorzeichen
    let cText = ''
    if (c !== 0) {
      cText = c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`
    }

    const berechnung = `y = ${axText}${bxText}${cText} = ${y}`

    beispiele.push({ x, y, berechnung })
  })

  return beispiele
}

// ===== Aufgabengenerator =====
const aufgabenBanks = {
  // Typ 1: Wertetabelle zu vorgegebenen x-Werten berechnen
  leereTabelleAusfüllen: () => {
    const { a, b, c } = generateRandomABC()
    const rechenbeispiele = generateRechenbeispiele(a, b, c)

    const xWerte = generateXWerte()
    const yWerte = xWerte.map(x => berechneY(a, b, c, x))

    return {
      typ: 'leereTabelleAusfüllen',
      thema: '1. Wertetabelle aus Funktionsgleichung',
      frage: `Gegeben ist die Funktionsgleichung ${formatEquation(a, b, c)}. Berechne für die vorgegebenen x-Werte die zugehörigen y-Werte.`,
      a,
      b,
      c,
      funktionsgleichung: formatEquation(a, b, c),
      funktionsgleichungLatex: formatEquationLatex(a, b, c),
      xWerte,
      yWerte,
      lösungsweg: `Setze die vorgegebenen x-Werte in die Funktionsgleichung ein und berechne die entsprechenden y-Werte.`,
      rechenbeispiele
    }
  },

  // Typ 2: Teilweise gefüllte Wertetabelle vervollständigen
  // (bei quadratischen Funktionen wird stets x vorgegeben und y gesucht, da ein
  // gegebener y-Wert i.A. zu zwei möglichen x-Werten gehören könnte)
  teilweisgefülltVervollständigen: () => {
    const { a, b, c } = generateRandomABC()
    const rechenbeispiele = generateRechenbeispiele(a, b, c)

    const xWerte = generateXWerte()
    const yWerte = xWerte.map(x => berechneY(a, b, c, x))

    return {
      typ: 'teilweisgefülltVervollständigen',
      thema: '1. Wertetabelle vervollständigen',
      frage: `Vervollständige die Wertetabelle für die Funktionsgleichung ${formatEquation(a, b, c)}.`,
      a,
      b,
      c,
      funktionsgleichung: formatEquation(a, b, c),
      funktionsgleichungLatex: formatEquationLatex(a, b, c),
      xWerte,
      yWerte,
      lösungsweg: `Setze die gegebenen x-Werte in die Funktionsgleichung ${formatEquationLatex(a, b, c)} ein und berechne die zugehörigen y-Werte.`,
      rechenbeispiele
    }
  }
}

interface Aufgabe {
  typ: string
  thema: string
  frage: string
  a: number
  b: number
  c: number
  funktionsgleichung: string
  funktionsgleichungLatex: string
  [key: string]: any
}

export default function Wertetabelle() {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([])
  const [antworten, setAntworten] = useState<{ [key: number]: Array<{ y: string }> }>({})
  const [validiert, setValidiert] = useState<{ [key: number]: boolean }>({})
  const [showLösung, setShowLösung] = useState<{ [key: number]: boolean }>({})
  const [showGraph, setShowGraph] = useState<{ [key: number]: boolean }>({})
  const [validierteZellen, setValidierteZellen] = useState<{ [key: string]: boolean }>({})
  const [fehlerhafteZellen, setFehlerhafteZellen] = useState<{ [key: string]: boolean }>({})
  const [punkte, setPunkte] = useState<number>(0)
  const [schwierigkeitsgrad, setSchwierigkeitsgrad] = useState<'einfach' | 'mittel' | 'schwer' | null>(null)

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

  // Aufgaben generieren basierend auf Schwierigkeitsgrad
  function generiereAufgaben(grad: 'einfach' | 'mittel' | 'schwer') {
    const neue: Aufgabe[] = []
    const usedCombinations = new Set<string>()

    let attempts = 0
    const maxAttempts = 100

    while (neue.length < 4 && attempts < maxAttempts) {
      attempts++

      const aufgabenTyp = Math.random() > 0.5 ? 'leereTabelleAusfüllen' : 'teilweisgefülltVervollständigen'
      let aufgabe = aufgabenBanks[aufgabenTyp as keyof typeof aufgabenBanks]()

      const graphHinweis = ' Zeichne den Graph anschließend in ein von dir selbst erstelltes Koordinatensystem.'
      let a = aufgabe.a
      let b = aufgabe.b
      let c = aufgabe.c
      let kombinationKey = ''

      if (grad === 'einfach') {
        // Einfach: y = a·x² (weder linearer Term noch Konstante)
        b = 0
        c = 0
        kombinationKey = `${a}|0|0`

        aufgabe.a = a
        aufgabe.b = 0
        aufgabe.c = 0
        aufgabe.funktionsgleichung = formatEquation(a, 0, 0)
        aufgabe.funktionsgleichungLatex = formatEquationLatex(a, 0, 0)
        aufgabe.frage = `Gegeben ist die Funktionsgleichung ${aufgabe.funktionsgleichung}. ${aufgabenTyp === 'leereTabelleAusfüllen' ? 'Berechne für die vorgegebenen x-Werte die zugehörigen y-Werte.' : 'Vervollständige die Wertetabelle.'}${graphHinweis}`
        aufgabe.yWerte = aufgabe.xWerte.map((x: number) => berechneY(a, 0, 0, x))

        if (aufgabenTyp === 'leereTabelleAusfüllen') {
          aufgabe.rechenbeispiele = generateRechenbeispiele(a, 0, 0)
        }
      } else if (grad === 'mittel') {
        // Mittel: y = a·x² + c (vertikale Verschiebung, kein linearer Term)
        b = 0
        kombinationKey = `${a}|0|${c}`

        aufgabe.b = 0
        aufgabe.funktionsgleichung = formatEquation(a, 0, c)
        aufgabe.funktionsgleichungLatex = formatEquationLatex(a, 0, c)
        aufgabe.frage = `Gegeben ist die Funktionsgleichung ${aufgabe.funktionsgleichung}. ${aufgabenTyp === 'leereTabelleAusfüllen' ? 'Berechne für die vorgegebenen x-Werte die zugehörigen y-Werte.' : 'Vervollständige die Wertetabelle.'}${graphHinweis}`
        aufgabe.yWerte = aufgabe.xWerte.map((x: number) => berechneY(a, 0, c, x))

        if (aufgabenTyp === 'leereTabelleAusfüllen') {
          aufgabe.rechenbeispiele = generateRechenbeispiele(a, 0, c)
        }
      } else if (grad === 'schwer') {
        // Schwer: y = a·x² + b·x + c mit Brüchen
        const { a: aBruch, b: bBruch, c: cBruch } = generateRandomABCMitBrüchen()
        a = aBruch
        b = bBruch
        c = cBruch
        kombinationKey = `${aBruch}|${bBruch}|${cBruch}`

        aufgabe.a = aBruch
        aufgabe.b = bBruch
        aufgabe.c = cBruch

        const funktionsgleichungText = formatEquation(aBruch, bBruch, cBruch)
        aufgabe.funktionsgleichung = funktionsgleichungText
        aufgabe.funktionsgleichungLatex = formatEquationLatex(aBruch, bBruch, cBruch)
        aufgabe.frage = `Gegeben ist die Funktionsgleichung ${funktionsgleichungText}. ${aufgabenTyp === 'leereTabelleAusfüllen' ? 'Berechne für die vorgegebenen x-Werte die zugehörigen y-Werte.' : 'Vervollständige die Wertetabelle.'}${graphHinweis}`
        aufgabe.yWerte = aufgabe.xWerte.map((x: number) => berechneY(aBruch, bBruch, cBruch, x))

        if (aufgabenTyp === 'leereTabelleAusfüllen') {
          aufgabe.rechenbeispiele = generateRechenbeispiele(aBruch, bBruch, cBruch)
        }
      }

      if (!usedCombinations.has(kombinationKey)) {
        usedCombinations.add(kombinationKey)
        neue.push(aufgabe)
      }
    }

    setAufgaben(neue)
    setAntworten({})
    setValidiert({})
    setShowLösung({})
    setShowGraph({})
    setValidierteZellen({})
    setFehlerhafteZellen({})
  }

  // Markiert fehlerhafte Zellen rot (x ist stets vorgegeben, nur y wird geprüft)
  function markFehlerhafteZellen(index: number, aufgabe: Aufgabe) {
    const eingaben = antworten[index]
    if (!eingaben) return

    const tolerance = 0.02
    const fehler = { ...fehlerhafteZellen }

    for (let i = 0; i < aufgabe.xWerte.length; i++) {
      const cellKey = `${index}-${i}`
      const y = parseFloat((eingaben[i]?.y || '').replace(',', '.').replace(/[−–—‐]/g, '-'))
      if (isNaN(y)) {
        fehler[cellKey] = true
      } else {
        const expectedY = aufgabe.yWerte[i]
        if (Math.abs(y - expectedY) > tolerance) {
          fehler[cellKey] = true
        } else {
          delete fehler[cellKey]
        }
      }
    }

    setFehlerhafteZellen(fehler)
  }

  function validateWertetabelle(index: number, aufgabe: Aufgabe): boolean {
    const eingaben = antworten[index]
    if (!eingaben) return false

    const tolerance = 0.02

    markFehlerhafteZellen(index, aufgabe)

    for (let i = 0; i < aufgabe.xWerte.length; i++) {
      const eintrag = eingaben[i]
      if (!eintrag) return false
      const y = parseFloat(eintrag.y.replace(',', '.').replace(/[−–—‐]/g, '-'))
      if (isNaN(y)) return false

      const expectedY = aufgabe.yWerte[i]
      if (Math.abs(y - expectedY) > tolerance) {
        return false
      }
    }

    if (!validiert[index]) {
      setPunkte(punkte + 1)
    }

    return true
  }

  function checkAnswer(index: number) {
    const aufgabe = aufgaben[index]
    const isCorrect = validateWertetabelle(index, aufgabe)
    setValidiert({ ...validiert, [index]: isCorrect })
  }

  function updateTableValue(aufgabeIndex: number, rowIndex: number, value: string) {
    const currentAnswers = antworten[aufgabeIndex] || []

    while (currentAnswers.length <= rowIndex) {
      currentAnswers.push({ y: '' })
    }

    currentAnswers[rowIndex].y = value

    const aufgabe = aufgaben[aufgabeIndex]
    const cellKey = `${aufgabeIndex}-${rowIndex}`

    const yFilled = currentAnswers[rowIndex].y.trim() !== ''

    if (yFilled && aufgabe) {
      const tolerance = 0.02
      const y = parseFloat(currentAnswers[rowIndex].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
      let isValid = false
      if (!isNaN(y)) {
        const expectedY = aufgabe.yWerte[rowIndex]
        isValid = Math.abs(y - expectedY) <= tolerance
      }

      setValidierteZellen({
        ...validierteZellen,
        [cellKey]: isValid
      })
    } else {
      const newValidierteZellen = { ...validierteZellen }
      delete newValidierteZellen[cellKey]
      setValidierteZellen(newValidierteZellen)
    }

    setAntworten({
      ...antworten,
      [aufgabeIndex]: currentAnswers
    })

    setValidiert({ ...validiert, [aufgabeIndex]: false })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Wertetabellen</h1>
          <p className={styles.subtitle}>Berechne die y-Werte zu vorgegebenen x-Werten für quadratische Funktionen</p>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.score}>
            ⭐ {punkte} <span className={styles.scoreLabel}>Punkte</span>
          </div>
        </div>
      </div>

      {schwierigkeitsgrad === null ? (
        <div className={styles.difficultySelector}>
          <h2 className={styles.difficultyTitle}>Schwierigkeitsgrad wählen:</h2>
          <div className={styles.difficultyButtonGroup}>
            <button
              onClick={() => {
                setSchwierigkeitsgrad('einfach')
                setTimeout(() => {
                  generiereAufgaben('einfach')
                }, 100)
              }}
              className={`${styles.difficultyButton} ${styles.einfach}`}
            >
              <span className={styles.difficultyLabel}>Einfach</span>
              <span className={styles.difficultyDescription}>y = a·x²</span>
            </button>
            <button
              onClick={() => {
                setSchwierigkeitsgrad('mittel')
                setTimeout(() => {
                  generiereAufgaben('mittel')
                }, 100)
              }}
              className={`${styles.difficultyButton} ${styles.mittel}`}
            >
              <span className={styles.difficultyLabel}>Mittel</span>
              <span className={styles.difficultyDescription}>y = a·x² + c</span>
            </button>
            <button
              onClick={() => {
                setSchwierigkeitsgrad('schwer')
                setTimeout(() => {
                  generiereAufgaben('schwer')
                }, 100)
              }}
              className={`${styles.difficultyButton} ${styles.schwer}`}
            >
              <span className={styles.difficultyLabel}>Schwer</span>
              <span className={styles.difficultyDescription}>y = a·x² + b·x + c mit Brüchen</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.actionBar}>
            <button onClick={() => generiereAufgaben(schwierigkeitsgrad)} className={styles.newButton}>
              🔄 Neue Aufgaben
            </button>
            <button
              onClick={() => setSchwierigkeitsgrad(null)}
              className={styles.difficultyChangeButton}
            >
              📊 Schwierigkeitsgrad ändern
            </button>
          </div>

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

                  {/* x-Werte sind stets vorgegeben, nur die y-Werte werden eingetragen */}
                  <div className={styles.tableSection}>
                    <table className={styles.wertetabelle}>
                      <tbody>
                        <tr>
                          <th>x</th>
                          {aufgabe.xWerte.map((x: number, i: number) => (
                            <td key={`x-${i}`}>
                              <span className={styles.givenValue}>{x}</span>
                            </td>
                          ))}
                        </tr>
                        <tr className={styles.yRow}>
                          <th>y</th>
                          {aufgabe.yWerte.map((y: number, i: number) => (
                            <td key={`y-${i}`}>
                              <input
                                type="text"
                                placeholder="?"
                                value={antworten[index]?.[i]?.y || ''}
                                onChange={(e) => updateTableValue(index, i, e.target.value)}
                                className={`${styles.tableInput} ${fehlerhafteZellen[`${index}-${i}`] ? styles.inputError : ''} ${validierteZellen[`${index}-${i}`] ? styles.inputCorrect : ''}`}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
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
                    <button
                      onClick={() => setShowGraph({ ...showGraph, [index]: !showGraph[index] })}
                      className={styles.graphBtn}
                    >
                      {showGraph[index] ? 'Graph ausblenden' : 'Graph anzeigen'}
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

                      {aufgabe.rechenbeispiele && aufgabe.rechenbeispiele.length > 0 && (
                        <div className={styles.rechenbeispiele}>
                          <h5>Rechenbeispiele:</h5>
                          {aufgabe.rechenbeispiele.map((beispiel: any, i: number) => (
                            <div key={i} className={styles.beispiel}>
                              <p className={styles.beispielErklaerung}>
                                Wir setzen für x = <span className={styles.xWertRot}>{beispiel.x}</span> ein:
                              </p>
                              <p className={styles.berechnung}>{beispiel.berechnung}</p>
                              <p className={styles.beispielText}>→ Punkt: ({beispiel.x} | {beispiel.y})</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {aufgabe.xWerte && aufgabe.yWerte && (
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
                                  <td key={`sol-y-${i}`} className={styles.sollution}>{y}</td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Graph */}
                  {showGraph[index] && (
                    <div className={styles.graphBox}>
                      <h4>Funktionsgraph:</h4>
                      <GeoGebraQuadraticGraph a={aufgabe.a} b={aufgabe.b} c={aufgabe.c} width={600} height={400} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
