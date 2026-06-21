import React, { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import styles from './ExerciseSheet.module.css'
import GeoGebraGraph from '../../components/GeoGebraGraph'

type Difficulty = 'easy' | 'medium' | 'hard'
type Theme = 'wertetabelle' | 'ablesen' | 'funktionsgleichung' | 'steigung' | 'punkt_gerade' | 'parallel' | 'nullstellen' | 'schnittpunkt' | 'graph_zeichnen'

interface ExerciseSheetGeneratorProps {}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generiere einen hochauflösenden Canvas-Graph mit besserem Spacing
function generateGraphSVG(m: number, t: number, width: number = 300, height: number = 300): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    // Höhere Auflösung für schärferes Rendering
    canvas.width = width * 2
    canvas.height = height * 2
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)
    
    // Gleiche Skalierung auf beiden Achsen
    const xMin = -5, xMax = 5
    const yMin = -5, yMax = 5
    
    const scale = width / (xMax - xMin) // Gleich für x und y
    const xCenter = width / 2
    const yCenter = height / 2
    
    const toCanvasX = (x: number) => xCenter + x * scale
    const toCanvasY = (y: number) => yCenter - y * scale
    
    // Weißer Hintergrund
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    // Gitter - dünn und hell
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 0.4
    for (let i = xMin; i <= xMax; i++) {
      const x = toCanvasX(i)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let i = yMin; i <= yMax; i++) {
      const y = toCanvasY(i)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Achsen - dünn
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(0, yCenter)
    ctx.lineTo(width, yCenter)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(xCenter, 0)
    ctx.lineTo(xCenter, height)
    ctx.stroke()
    
    // Tick-Marken und Beschriftungen
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.5
    ctx.fillStyle = '#000000'
    ctx.font = 'normal 9px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    for (let i = xMin; i <= xMax; i++) {
      if (i !== 0) {
        const x = toCanvasX(i)
        ctx.beginPath()
        ctx.moveTo(x, yCenter - 3)
        ctx.lineTo(x, yCenter + 3)
        ctx.stroke()
        ctx.fillText(i.toString(), x, yCenter + 5)
      }
    }
    
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = yMin; i <= yMax; i++) {
      if (i !== 0) {
        const y = toCanvasY(i)
        ctx.beginPath()
        ctx.moveTo(xCenter - 3, y)
        ctx.lineTo(xCenter + 3, y)
        ctx.stroke()
        ctx.fillText(i.toString(), xCenter - 5, y)
      }
    }
    
    // Funktionslinie - scharf und sauber
    ctx.strokeStyle = '#0066ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    let started = false
    for (let x = xMin - 0.5; x <= xMax + 0.5; x += 0.02) {
      const y = m * x + t
      const canvasX = toCanvasX(x)
      const canvasY = toCanvasY(y)
      
      if (!started) {
        ctx.moveTo(canvasX, canvasY)
        started = true
      } else {
        ctx.lineTo(canvasX, canvasY)
      }
    }
    ctx.stroke()
    
    resolve(canvas.toDataURL('image/png'))
  })
}

// Aufgabengeneratoren für jedes Thema
const generateExercises = (theme: Theme, difficulty: Difficulty, count: number) => {
  const exercises: any[] = []
  
  for (let i = 0; i < count; i++) {
    switch (theme) {
      case 'wertetabelle':
        exercises.push(generateWertetabelleExercise(difficulty))
        break
      case 'ablesen':
        exercises.push(generateAblesenExercise(difficulty))
        break
      case 'funktionsgleichung':
        exercises.push(generateFunktionsgleichungExercise(difficulty))
        break
      case 'steigung':
        exercises.push(generateSteigungExercise(difficulty))
        break
      case 'punkt_gerade':
        exercises.push(generatePunktGeradeExercise(difficulty))
        break
      case 'parallel':
        exercises.push(generateParallelExercise(difficulty))
        break
      case 'nullstellen':
        exercises.push(generateNullstellenExercise(difficulty))
        break
      case 'schnittpunkt':
        exercises.push(generateSchnittpunktExercise(difficulty))
        break
      case 'graph_zeichnen':
        exercises.push(generateGraphZeichnenExercise(difficulty))
        break
    }
  }
  
  return exercises
}

function generateWertetabelleExercise(difficulty: Difficulty) {
  const m = difficulty === 'easy' ? randInt(1, 3) : difficulty === 'medium' ? randInt(-3, 3) : randInt(-5, 5)
  const t = difficulty === 'easy' ? randInt(0, 3) : randInt(-5, 5)
  const x_values = [0, 1, 2, 3, 4]
  const y_values = x_values.map(x => m * x + t)
  
  return {
    type: 'wertetabelle',
    question: `Erstellen Sie eine Wertetabelle für die Funktion y = ${m}x ${t >= 0 ? '+' : ''} ${t} für die x-Werte 0, 1, 2, 3, 4.`,
    solution: `x | y\n` + x_values.map((x, i) => `${x} | ${y_values[i]}`).join('\n'),
    m, t, x_values, y_values
  }
}

function generateAblesenExercise(difficulty: Difficulty) {
  const m = difficulty === 'easy' ? randInt(1, 2) : randInt(-3, 3) || 1
  const t = randInt(-3, 3)
  
  return {
    type: 'ablesen',
    question: `Lesen Sie die Funktionsgleichung aus dem dargestellten Funktionsgraph ab.`,
    solution: `y-Achsenabschnitt (t): ${t}\\nSteigung (m): ${m}\\nGleichung: y = ${m}x ${t >= 0 ? '+' : ''}${t}`,
    m, t
  }
}

function generateFunktionsgleichungExercise(difficulty: Difficulty) {
  let x1, x2, y1, y2
  do {
    x1 = randInt(-3, 3)
    x2 = randInt(-3, 3)
  } while (x1 === x2)
  
  y1 = randInt(-5, 5)
  y2 = randInt(-5, 5)
  
  const m = (y2 - y1) / (x2 - x1)
  const t = y1 - m * x1
  const mRounded = Math.round(m * 100) / 100
  const tRounded = Math.round(t * 100) / 100
  
  return {
    type: 'funktionsgleichung',
    question: `Berechnen Sie die Funktionsgleichung durch die Punkte P1(${x1}|${y1}) und P2(${x2}|${y2}).`,
    solution: `Steigung: m = (${y2} - (${y1})) / (${x2} - (${x1})) = ${Math.round(m * 100) / 100}\nGleichung: y = ${mRounded}x ${tRounded >= 0 ? '+' : ''}${tRounded}`,
    m, t, x1, y1, x2, y2
  }
}

function generateSteigungExercise(difficulty: Difficulty) {
  let x1, x2, y1, y2
  do {
    x1 = randInt(-3, 3)
    x2 = randInt(-3, 3)
  } while (x1 === x2)
  
  y1 = randInt(-5, 5)
  y2 = randInt(-5, 5)
  
  const m = (y2 - y1) / (x2 - x1)
  const mRounded = Math.round(m * 100) / 100
  
  return {
    type: 'steigung',
    question: `Berechnen Sie die Steigung zwischen den Punkten P1(${x1}|${y1}) und P2(${x2}|${y2}).`,
    solution: `Steigung: m = Δy/Δx\nm = (${y2} - (${y1})) / (${x2} - (${x1}))\nm = ${y2 - y1} / ${x2 - x1}\nm = ${mRounded}`,
    m, x1, y1, x2, y2
  }
}

function generatePunktGeradeExercise(difficulty: Difficulty) {
  const m = randInt(-3, 3) || 1
  const t = randInt(-3, 3)
  const x = randInt(-3, 3)
  const y = m * x + t + (Math.random() > 0.5 ? 0 : randInt(-2, 2))
  const isOn = y === m * x + t
  const yCalc = m * x + t
  
  return {
    type: 'punkt_gerade',
    question: `Prüfen Sie rechnerisch, ob der Punkt P(${x}|${y}) auf der Geraden y = ${m}x ${t >= 0 ? '+' : ''} ${t} liegt.`,
    solution: `Einsetzen: y = ${m} · ${x} ${t >= 0 ? '+' : ''} ${t}\\ny = ${yCalc}\\nDa ${y} ${isOn ? '=' : '≠'} ${yCalc} liegt P ${isOn ? 'auf' : 'nicht auf'} der Geraden.`,
    m, t, x, y, isOn
  }
}

function generateParallelExercise(difficulty: Difficulty) {
  const m1 = randInt(-3, 3) || 1
  const m2 = m1 // parallel
  const t1 = randInt(-3, 3)
  const t2 = randInt(-3, 3)
  
  return {
    type: 'parallel',
    question: `Prüfen Sie, ob die Geraden g1: y = ${m1}x ${t1 >= 0 ? '+' : ''} ${t1} und g2: y = ${m2}x ${t2 >= 0 ? '+' : ''} ${t2} parallel sind.`,
    solution: `Bedingung für Parallelität: m1 = m2\\nm1 = ${m1}\\nm2 = ${m2}\\nJa, die Geraden sind parallel.`,
    m1, m2, t1, t2
  }
}

function generateNullstellenExercise(difficulty: Difficulty) {
  const m = randInt(-3, 3) || 1
  const t = randInt(-3, 3)
  const nullstelle = -t / m
  const nsRounded = Math.round(nullstelle * 100) / 100
  
  return {
    type: 'nullstellen',
    question: `Berechnen Sie die Nullstelle der Funktion y = ${m}x ${t >= 0 ? '+' : ''} ${t}.`,
    solution: `Nullstelle (y = 0):\n0 = ${m}x ${t >= 0 ? '+' : ''} ${t}\n${m}x = ${-t}\nx = ${nsRounded}`,
    m, t, nullstelle
  }
}

function generateSchnittpunktExercise(difficulty: Difficulty) {
  const m1 = randInt(-3, 3) || 1
  const m2 = randInt(-3, 3) || -1
  if (m1 === m2) return generateSchnittpunktExercise(difficulty)
  
  const t1 = randInt(-3, 3)
  const t2 = randInt(-3, 3)
  
  const x = (t2 - t1) / (m1 - m2)
  const y = m1 * x + t1
  const xRounded = Math.round(x * 100) / 100
  const yRounded = Math.round(y * 100) / 100
  
  return {
    type: 'schnittpunkt',
    question: `Berechnen Sie den Schnittpunkt: g1: y = ${m1}x ${t1 >= 0 ? '+' : ''} ${t1} und g2: y = ${m2}x ${t2 >= 0 ? '+' : ''} ${t2}.`,
    solution: `Gleichsetzen: ${m1}x ${t1 >= 0 ? '+' : ''} ${t1} = ${m2}x ${t2 >= 0 ? '+' : ''} ${t2}\nSchnittpunkt S(${xRounded} | ${yRounded})`,
    m1, m2, t1, t2, x, y
  }
}

function generateGraphZeichnenExercise(difficulty: Difficulty) {
  const m = difficulty === 'easy' ? randInt(1, 2) : randInt(-3, 3) || 1
  const t = randInt(-3, 3)
  
  return {
    type: 'graph_zeichnen',
    question: `Zeichnen Sie den Graphen der Funktion y = ${m}x ${t >= 0 ? '+' : ''} ${t} in ein Koordinatensystem.`,
    solution: `Gerade mit Steigung m = ${m} und y-Achsenabschnitt t = ${t}. Wichtige Punkte: (0|${t}) und (1|${m + t}).`,
    m, t
  }
}

export default function ExerciseSheetGenerator() {
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [exercises, setExercises] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const pdfContainerRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const themes: { id: Theme; label: string }[] = [
    { id: 'wertetabelle', label: '1. Wertetabelle' },
    { id: 'graph_zeichnen', label: '2. Graph zeichnen' },
    { id: 'ablesen', label: '3. Graph ablesen' },
    { id: 'steigung', label: '4. Steigung' },
    { id: 'funktionsgleichung', label: '5. Funktionsgleichung' },
    { id: 'punkt_gerade', label: '6. Punkt auf Gerade' },
    { id: 'parallel', label: '7. Parallel & Senkrecht' },
    { id: 'nullstellen', label: '8. Nullstellen' },
    { id: 'schnittpunkt', label: '9. Schnittpunkt' }
  ]

  const toggleTheme = (theme: Theme) => {
    setSelectedThemes(prev => 
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    )
  }

  const generateSheet = () => {
    if (selectedThemes.length === 0) {
      alert('Bitte wähle mindestens eine Themenbereich aus!')
      return
    }

    const allExercises: any[] = []
    selectedThemes.forEach(theme => {
      const count = randInt(2, 3)
      const themeExercises = generateExercises(theme, difficulty, count)
      allExercises.push(...themeExercises)
    })

    setExercises(allExercises)
    setShowPreview(true)
  }

  const downloadPDF = async () => {
    setIsGeneratingPdf(true)
    
    try {
      // Generiere alle Graphen vorab
      const graphCache: { [key: number]: string } = {}
      for (let i = 0; i < exercises.length; i++) {
        if (exercises[i].type === 'ablesen') {
          graphCache[i] = await generateGraphSVG(exercises[i].m, exercises[i].t, 100, 100)
        }
      }
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = 210
      const pageHeight = 297
      const margin = 12
      const contentWidth = pageWidth - 2 * margin
      let yPosition = margin
      
      // Titel
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'bold')
      doc.text('Übungsblatt - Lineare Funktionen', margin, yPosition)
      yPosition += 8
      
      // Schwierigkeitsstufe
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Schwierigkeitsstufe: ${difficulty === 'easy' ? 'Leicht' : difficulty === 'medium' ? 'Mittel' : 'Schwer'}`, margin, yPosition)
      yPosition += 8
      
      // Trennlinie
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.3)
      doc.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 6
      
      // AUFGABEN
      exercises.forEach((exercise, index) => {
        // Seiteumbruch wenn nötig
        if (yPosition + 15 > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        
        // Aufgabennummer
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`${index + 1}. `, margin, yPosition)
        
        // Aufgabentext
        doc.setFont(undefined, 'normal')
        const textLines = doc.splitTextToSize(exercise.question, contentWidth - 5)
        doc.text(textLines, margin + 5, yPosition)
        
        yPosition += textLines.length * 4 + 5
        
        // Graph UNTER der Aufgabe einfügen (falls ablesen)
        if (exercise.type === 'ablesen' && graphCache[index]) {
          if (yPosition + 85 > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
          }
          
          // Graph-Bild zentriert und größer
          doc.addImage(graphCache[index], 'PNG', margin + contentWidth / 2 - 40, yPosition, 80, 80)
          yPosition += 85
        }
      })
      
      // LÖSUNGSSEITE
      doc.addPage()
      yPosition = margin
      
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Lösungen', margin, yPosition)
      yPosition += 8
      
      // Trennlinie
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.3)
      doc.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 6
      
      // Lösungen
      exercises.forEach((exercise, index) => {
        // Seiteumbruch wenn nötig - mehr Platz für mehzeilige Lösungen
        if (yPosition + 20 > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        
        // Aufgabennummer
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`${index + 1}. `, margin, yPosition)
        yPosition += 5
        
        // Lösung
        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        
        // Spezialformatierung für Wertetabellen
        if (exercise.type === 'wertetabelle' && exercise.x_values && exercise.y_values) {
          // x-Zeile besser formatiert
          const xStr = exercise.x_values.map(v => v.toString().padStart(3)).join(' ')
          const yStr = exercise.y_values.map(v => v.toString().padStart(3)).join(' ')
          
          doc.setFont(undefined, 'bold')
          doc.text('Wertetabelle:', margin + 3, yPosition)
          yPosition += 4
          
          doc.setFont(undefined, 'normal')
          doc.text(`x:  ${xStr}`, margin + 5, yPosition)
          yPosition += 4
          doc.text(`y:  ${yStr}`, margin + 5, yPosition)
          yPosition += 6
        } else {
          // Normale Lösung - mehzeilig formatiert
          const solutionLines = exercise.solution.split('\n')
          
          solutionLines.forEach(line => {
            // Mathematische Symbole verbessern
            let formattedLine = line
              .replace(/\*/g, '·')
              .replace(/Δy\/Δx/g, 'Δy/Δx')
            
            // Text umbrechen für lange Zeilen
            const wrappedLines = doc.splitTextToSize(formattedLine, contentWidth - 3)
            doc.text(wrappedLines, margin + 3, yPosition)
            yPosition += wrappedLines.length * 3.5 + 1
          })
          yPosition += 2
        }
      })
      
      // Footer mit Seitenzahlen
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text(`Seite ${i} / ${totalPages}`, pageWidth - margin - 15, pageHeight - 5)
      }
      
      doc.save(`Übungsblatt_LineareFunktionen_${difficulty}.pdf`)
      setIsGeneratingPdf(false)
    } catch (error) {
      console.error('PDF-Generierung fehlgeschlagen:', error)
      alert('Fehler bei der PDF-Generierung')
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className={`${styles.container}`}>
      <div className={styles.card}>
        <h2 className={styles.title}>Übungsblatt-Generator</h2>
        <p className={styles.subtitle}>Stelle dir dein eigenes Übungsblatt zusammen!</p>

        {!showPreview ? (
          <>
            {/* Schwierigkeit */}
            <div className={styles.section}>
              <h3>Schwierigkeitsstufe:</h3>
              <div className={styles.difficultyButtons}>
                {(['easy', 'medium', 'hard'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`${styles.diffBtn} ${difficulty === level ? styles.active : ''}`}
                  >
                    {level === 'easy' ? '⭐ Leicht' : level === 'medium' ? '⭐⭐ Mittel' : '⭐⭐⭐ Schwer'}
                  </button>
                ))}
              </div>
            </div>

            {/* Themenbereiche */}
            <div className={styles.section}>
              <h3>Wähle Themenbereiche:</h3>
              <div className={styles.checkboxGrid}>
                {themes.map(theme => (
                  <label key={theme.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedThemes.includes(theme.id)}
                      onChange={() => toggleTheme(theme.id)}
                    />
                    <span>{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button onClick={generateSheet} className={styles.primaryBtn}>
                Übungsblatt generieren
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Vorschau */}
            <div className={styles.preview}>
              <h3>Vorschau ({exercises.length} Aufgaben):</h3>
              <div className={styles.exerciseList}>
                {exercises.map((exercise, index) => (
                  <div key={index} className={styles.exerciseItem}>
                    <strong>Aufgabe {index + 1}:</strong> {exercise.question}
                  </div>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div className={styles.buttonGroup}>
              <button 
                onClick={downloadPDF} 
                disabled={isGeneratingPdf}
                className={styles.primaryBtn}
              >
                {isGeneratingPdf ? '⏳ PDF wird generiert...' : '📥 PDF herunterladen'}
              </button>
              <button onClick={() => setShowPreview(false)} className={styles.secondaryBtn}>
                ← Zurück
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
