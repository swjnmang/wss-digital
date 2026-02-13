import React, { useState, useEffect, useRef } from 'react'
import styles from './ParallelSenkrecht.module.css'

// ===== MathDisplay Komponente =====
const MathDisplay = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && (window as any).MathJax) {
      (window as any).MathJax.typesetPromise([ref.current]).catch((err: any) =>
        console.log(err)
      )
    }
  }, [latex])

  return <div ref={ref} className={styles.mathDisplay}>{latex}</div>
}

// ===== Hilfsfunktionen =====
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ===== Aufgabengenerator =====
const aufgabenBanks = {
  // Typ 1: Zwei Funktionsgleichungen - Parallel oder Senkrecht?
  gleichungenPrüfen: () => {
    const m1 = randInt(-5, 5)
    const t1 = randInt(-10, 10)
    
    let m2: number
    let t2 = randInt(-10, 10)
    let beziehung: 'parallel' | 'senkrecht' | 'keine'
    
    const typ = Math.random()
    
    if (typ < 0.4) {
      // Parallel: gleiche Steigung
      m2 = m1
      beziehung = 'parallel'
    } else if (typ < 0.8) {
      // Senkrecht: m1 · m2 = -1
      if (m1 === 0) {
        m2 = 1
        beziehung = 'senkrecht'
      } else {
        m2 = -1 / m1
        beziehung = 'senkrecht'
      }
    } else {
      // Keine Beziehung
      m2 = randInt(-5, 5)
      while (m2 === m1 || (m1 !== 0 && Math.abs(m1 * m2 + 1) < 0.01)) {
        m2 = randInt(-5, 5)
      }
      beziehung = 'keine'
    }
    
    return {
      typ: 'gleichungenPrüfen',
      nummer: 1,
      thema: 'Gleichungen prüfen',
      frage: `Gegeben sind die Funktionsgleichungen g₁: y = ${m1}x ${t1 >= 0 ? '+' : '-'} ${Math.abs(t1)} und g₂: y = ${Math.round(m2 * 100) / 100}x ${t2 >= 0 ? '+' : '-'} ${Math.abs(t2)}.\n\nPrüfe rechnerisch, ob die Geraden parallel, senkrecht zueinander oder keine spezielle Beziehung haben.`,
      m1,
      t1,
      m2: Math.round(m2 * 100) / 100,
      t2,
      beziehung,
      lösungsweg: `
      \\text{Bedingungen:}\\n
      \\text{Parallel:} \\quad m_1 = m_2\\n
      \\text{Senkrecht:} \\quad m_1 \\cdot m_2 = -1\\n
      \\text{Vergleich:} \\quad m_1 = ${m1}, \\; m_2 = ${Math.round(m2 * 100) / 100}
      `
    }
  },

  // Typ 2: Gerade durch Punkt parallel/senkrecht zu gegebener Gerade
  geradeDurchPunkt: () => {
    const m1 = randInt(-5, 5)
    const t1 = randInt(-10, 10)
    const x = randInt(-5, 5)
    const y = randInt(-10, 10)
    
    const aufgabentyp = Math.random() < 0.5 ? 'parallel' : 'senkrecht'
    
    let m2: number
    
    if (aufgabentyp === 'parallel') {
      m2 = m1
    } else {
      m2 = m1 === 0 ? 1 : -1 / m1
    }
    
    const t2 = y - m2 * x
    
    return {
      typ: 'geradeDurchPunkt',
      nummer: 2,
      thema: 'Gerade konstruieren',
      aufgabentyp,
      frage: `Gegeben ist die Gerade g: y = ${m1}x ${t1 >= 0 ? '+' : '-'} ${Math.abs(t1)} und der Punkt P(${x}|${y}).\n\nBestimme die Gleichung der Geraden, die ${aufgabentyp === 'parallel' ? 'parallel' : 'senkrecht'} zu g verläuft und durch P geht. Zeige deinen Rechenweg:`,
      m1,
      t1,
      punkt: { x, y },
      m2: Math.round(m2 * 100) / 100,
      t2: Math.round(t2 * 100) / 100,
      lösungsweg: `
      \\text{Schritt 1: Steigung bestimmen}\\n
      ${aufgabentyp === 'parallel' ? `m_2 = m_1 = ${m1}` : `m_1 \\cdot m_2 = -1 \\Rightarrow m_2 = -\\frac{1}{${m1}} = ${Math.round(m2 * 100) / 100}`}\\n\\n
      \\text{Schritt 2: Punkt einsetzen in } y = m \\cdot x + t\\n
      ${y} = ${Math.round(m2 * 100) / 100} \\cdot ${x} + t\\n
      t = ${Math.round(t2 * 100) / 100}
      `
    }
  },

  // Typ 3: Mehrere Geraden - Kategorisieren
  mehrereGeraden: () => {
    const m1 = randInt(-4, 4)
    const t1 = randInt(-8, 8)
    
    // Gerade 2: parallel zu 1
    const m2 = m1
    const t2 = randInt(-8, 8)
    
    // Gerade 3: senkrecht zu 1
    const m3 = m1 === 0 ? 1 : -1 / m1
    const t3 = randInt(-8, 8)
    
    // Gerade 4: keine Beziehung
    let m4 = randInt(-5, 5)
    while (m4 === m1 || (m1 !== 0 && Math.abs(m1 * m4 + 1) < 0.01)) {
      m4 = randInt(-5, 5)
    }
    const t4 = randInt(-8, 8)
    
    return {
      typ: 'mehrereGeraden',
      nummer: 3,
      thema: 'Mehrere Geraden kategorisieren',
      frage: `Gegeben ist die Gerade g₁: y = ${m1}x ${t1 >= 0 ? '+' : '-'} ${Math.abs(t1)}.\n\nOrdne die folgenden Geraden zu:\n\ng₂: y = ${m2}x ${t2 >= 0 ? '+' : '-'} ${Math.abs(t2)}\n\ng₃: y = ${Math.round(m3 * 100) / 100}x ${t3 >= 0 ? '+' : '-'} ${Math.abs(t3)}\n\ng₄: y = ${m4}x ${t4 >= 0 ? '+' : '-'} ${Math.abs(t4)}\n\nWelche Geraden sind parallel zu g₁? Welche sind senkrecht? Zeige deinen Rechenweg.`,
      m1,
      t1,
      geraden: [
        { m: m2, t: t2, label: 'g₂', beziehung: 'parallel' },
        { m: m3, t: t3, label: 'g₃', beziehung: 'senkrecht' },
        { m: m4, t: t4, label: 'g₄', beziehung: 'keine' }
      ],
      lösungsweg: `
      \\text{Vergleiche die Steigungen mit } m_1 = ${m1}:\\n
      g_2: m = ${m2} \\Rightarrow ${m2 === m1 ? 'parallel' : 'senkrecht oder keine'}\\n
      g_3: m = ${Math.round(m3 * 100) / 100} \\Rightarrow ${Math.abs(m1 * m3 + 1) < 0.01 ? 'senkrecht' : 'keine'}\\n
      g_4: m = ${m4} \\Rightarrow \\text{keine Beziehung}
      `
    }
  }
}

// ===== Hauptkomponente =====
export default function ParallelSenkrecht() {
  const [aufgaben, setAufgaben] = useState(
    Array.from({ length: 3 }, (_, i) =>
      i === 0
        ? aufgabenBanks.gleichungenPrüfen()
        : i === 1
        ? aufgabenBanks.geradeDurchPunkt()
        : aufgabenBanks.mehrereGeraden()
    )
  )

  const [antworten, setAntworten] = useState(aufgaben.map(() => ''))
  const [validiert, setValidiert] = useState(aufgaben.map(() => false))
  const [showLösung, setShowLösung] = useState(aufgaben.map(() => false))

  const prüfeAntwort = (index: number) => {
    const aufgabe = aufgaben[index]
    const antwort = antworten[index].trim().toLowerCase()

    let isCorrect = false

    if (aufgabe.typ === 'gleichungenPrüfen') {
      const expected = aufgabe.beziehung
      isCorrect =
        antwort.includes('parallel') && aufgabe.beziehung === 'parallel' ||
        antwort.includes('senkrecht') && aufgabe.beziehung === 'senkrecht' ||
        (antwort.includes('keine') || antwort.includes('egal') || antwort.includes('unterschied')) &&
        aufgabe.beziehung === 'keine'
    }

    setValidiert(prev => {
      const newVal = [...prev]
      newVal[index] = isCorrect
      return newVal
    })
  }

  const neueAufgaben = () => {
    const newAufgaben = [
      aufgabenBanks.gleichungenPrüfen(),
      aufgabenBanks.geradeDurchPunkt(),
      aufgabenBanks.mehrereGeraden()
    ]
    setAufgaben(newAufgaben)
    setAntworten(newAufgaben.map(() => ''))
    setValidiert(newAufgaben.map(() => false))
    setShowLösung(newAufgaben.map(() => false))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Parallele und senkrechte Geraden</h1>
        <p className={styles.subtitle}>
          Untersuche Beziehungen zwischen Geraden rechnerisch
        </p>
      </div>

      <button className={styles.newButton} onClick={neueAufgaben}>
        Neue Aufgaben generieren
      </button>

      <div className={styles.aufgabenContainer}>
        {aufgaben.map((aufgabe, index) => (
          <div
            key={index}
            className={`${styles.aufgabeCard} ${validiert[index] ? styles.cardCorrect : ''}`}
          >
            <div className={styles.aufgabeHeader}>
              <span className={styles.aufgabennummer}>Aufgabe {index + 1}</span>
              <span className={styles.themaLabel}>{aufgabe.thema}</span>
            </div>

            <div className={styles.content}>
              <p className={styles.frage}>{aufgabe.frage}</p>

              <div className={styles.inputGroup}>
                <textarea
                  value={antworten[index]}
                  onChange={e =>
                    setAntworten(prev => {
                      const newA = [...prev]
                      newA[index] = e.target.value
                      return newA
                    })
                  }
                  placeholder="Schreibe deine Lösung hier auf..."
                  className={styles.answerInput}
                  rows={4}
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  className={styles.prüfenButton}
                  onClick={() => prüfeAntwort(index)}
                >
                  Prüfen
                </button>
                <button
                  className={styles.lösungButton}
                  onClick={() =>
                    setShowLösung(prev => {
                      const newSL = [...prev]
                      newSL[index] = !newSL[index]
                      return newSL
                    })
                  }
                >
                  Lösung {showLösung[index] ? 'verbergen' : 'anzeigen'}
                </button>
              </div>

              {validiert[index] && (
                <div className={styles.feedbackBox}>✓ Richtig!</div>
              )}

              {showLösung[index] && (
                <div className={styles.lösungBox}>
                  <h4>Lösungsweg:</h4>

                  {aufgabe.typ === 'gleichungenPrüfen' && (
                    <div className={styles.lösungsDetails}>
                      <p><strong>Bedingungen zur Prüfung:</strong></p>
                      <MathDisplay latex={`$$\\text{Parallel:} \\quad m_1 = m_2$$`} />
                      <MathDisplay latex={`$$\\text{Senkrecht:} \\quad m_1 \\cdot m_2 = -1$$`} />
                      
                      <p style={{ marginTop: '1rem' }}><strong>Steigungen:</strong></p>
                      <MathDisplay latex={`$$m_1 = ${aufgabe.m1} \\quad m_2 = ${aufgabe.m2}$$`} />
                      
                      <p style={{ marginTop: '1rem' }}><strong>Ergebnis:</strong></p>
                      {aufgabe.beziehung === 'parallel' && (
                        <p style={{ color: '#10b981' }}>✓ m₁ = m₂ → die Geraden sind <strong>parallel</strong></p>
                      )}
                      {aufgabe.beziehung === 'senkrecht' && (
                        <p style={{ color: '#10b981' }}>
                          ✓ m₁ · m₂ = {aufgabe.m1} · {aufgabe.m2} = -1 → die Geraden sind <strong>senkrecht</strong>
                        </p>
                      )}
                      {aufgabe.beziehung === 'keine' && (
                        <p style={{ color: '#10b981' }}>Die Geraden haben <strong>keine spezielle Beziehung</strong></p>
                      )}
                    </div>
                  )}

                  {aufgabe.typ === 'geradeDurchPunkt' && (
                    <div className={styles.lösungsDetails}>
                      <p><strong>Schritt 1: Steigung bestimmen</strong></p>
                      {aufgabe.aufgabentyp === 'parallel' ? (
                        <MathDisplay latex={`$$m_2 = m_1 = ${aufgabe.m1}$$`} />
                      ) : (
                        <MathDisplay latex={`$$m_1 \\cdot m_2 = -1 \\Rightarrow m_2 = -\\frac{1}{${aufgabe.m1}} = ${aufgabe.m2}$$`} />
                      )}
                      
                      <p style={{ marginTop: '1rem' }}><strong>Schritt 2: Punkt P({aufgabe.punkt.x}|{aufgabe.punkt.y}) einsetzen</strong></p>
                      <MathDisplay latex={`$$${aufgabe.punkt.y} = ${aufgabe.m2} \\cdot ${aufgabe.punkt.x} + t$$`} />
                      <MathDisplay latex={`$$t = ${aufgabe.t2}$$`} />
                      
                      <p style={{ marginTop: '1rem', color: '#10b981', fontWeight: 'bold' }}>
                        Lösung: y = {aufgabe.m2}x {aufgabe.t2 >= 0 ? '+' : '−'} {Math.abs(aufgabe.t2)}
                      </p>
                    </div>
                  )}

                  {aufgabe.typ === 'mehrereGeraden' && (
                    <div className={styles.lösungsDetails}>
                      <p><strong>Vergleiche die Steigungen mit m₁ = {aufgabe.m1}:</strong></p>
                      {aufgabe.geraden.map((g, i) => (
                        <p key={i} style={{ marginTop: '0.5rem' }}>
                          <strong>{g.label}:</strong> m = {g.m} →{' '}
                          {g.beziehung === 'parallel'
                            ? 'parallel (m₁ = m)'
                            : g.beziehung === 'senkrecht'
                            ? `senkrecht (m₁ · m = -1)`
                            : 'keine Beziehung'}
                        </p>
                      ))}
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
