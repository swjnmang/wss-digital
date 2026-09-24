import React, { useEffect, useState, useRef } from 'react'
import styles from './Wertetabelle.module.css'
import { roundHalfAwayFromZero } from '../../utils/numbers'

declare global {
  interface Window {
    GGBApplet: any
  }
}

// Mindestanzahl korrekt gesetzter Punkte, bevor die Parabel automatisch
// eingezeichnet wird. Mathematisch würden 3 Punkte genügen, 4 von 8 machen
// die Parabelform aber deutlicher erkennbar, ohne dass alle 8 Werte
// einzeln angeklickt werden müssen.
const PLOT_MIN_POINTS = 4
const PLOT_WIDTH = 460
const PLOT_HEIGHT = 300

// Erzwingt ein kartesisches Koordinatensystem: 1 Einheit auf der x-Achse
// entspricht optisch genauso vielen Pixeln wie 1 Einheit auf der y-Achse.
// Dazu wird die knappere der beiden benötigten Spannen (x oder y) auf das
// Seitenverhältnis von Breite/Höhe der Zeichenfläche aufgeweitet.
function computeCartesianView(xMin: number, xMax: number, yMin: number, yMax: number, width: number, height: number) {
  const xCenter = (xMin + xMax) / 2
  const yCenter = (yMin + yMax) / 2
  let rangeX = Math.max(xMax - xMin, 0.0001)
  let rangeY = Math.max(yMax - yMin, 0.0001)

  const neededRangeXForY = rangeY * (width / height)
  if (rangeX < neededRangeXForY) {
    rangeX = neededRangeXForY
  } else {
    rangeY = rangeX * (height / width)
  }

  return {
    viewXMin: xCenter - rangeX / 2,
    viewXMax: xCenter + rangeX / 2,
    viewYMin: yCenter - rangeY / 2,
    viewYMax: yCenter + rangeY / 2,
  }
}

function injectPlotApplet(containerId: string, width: number, height: number, onLoad: (api: any) => void) {
  const params: any = {
    appName: 'classic',
    width,
    height,
    showToolBar: false,
    showAlgebraInput: false,
    showMenuBar: false,
    perspective: 'G',
    useBrowserForJS: true,
    enableShiftDragZoom: true,
    showResetIcon: true,
    showZoomButtons: true,
    appletOnLoad: onLoad,
  }
  try {
    const applet = new window.GGBApplet(params, true)
    applet.inject(containerId)
  } catch (e) {
    console.error(`GeoGebra Error (${containerId}):`, e)
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

  return <div ref={ref}>{latex}</div>
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Anzahl der Wertepaare pro Wertetabelle (mindestens 8, Schrittweite 0,5)
const ANZAHL_WERTEPAARE = 8

// Generiert x-Werte mit Schrittweite 0,5, verteilt über ein 10 Einheiten
// breites Fenster um `zentrum`, damit sich der Graph anschließend vernünftig
// zeichnen lässt. Bei y = a·x² bzw. y = a·x² + c liegt der Scheitelpunkt immer
// bei x = 0 (Standardwert von `zentrum`), sodass z.B. auch die linke
// Parabelhälfte sichtbar ist. Bei "schwer" (y = a·x² + b·x + c) ist der
// Scheitelpunkt bei x_s = -b/(2a) meist verschoben – dort wird `zentrum`
// entsprechend auf x_s gesetzt, damit der Scheitelpunkt im Blickfeld bleibt.
// Dazu wird das Raster in `anzahl` etwa gleich große Abschnitte geteilt und aus
// jedem Abschnitt ein zufälliger Wert gewählt – der gesamte Bereich ist so
// abgedeckt, ohne dass zwingend jeder einzelne Rasterwert vorkommen muss.
function generateXWerte(anzahl: number = ANZAHL_WERTEPAARE, zentrum: number = 0): number[] {
  const zentrumGerundet = Math.round(zentrum * 2) / 2
  const halbspanne = 5

  const raster: number[] = []
  for (let v = zentrumGerundet - halbspanne; v <= zentrumGerundet + halbspanne; v += 0.5) {
    raster.push(Math.round(v * 10) / 10)
  }

  const xWerte: number[] = []
  for (let i = 0; i < anzahl; i++) {
    const abschnittStart = Math.floor((i * raster.length) / anzahl)
    const abschnittEnde = Math.floor(((i + 1) * raster.length) / anzahl) - 1
    const index = randInt(abschnittStart, abschnittEnde)
    xWerte.push(raster[index])
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

  // key ist bereits auf 2 Nachkommastellen gerundet; das ist auch der korrekte
  // Fallback für Zahlen außerhalb der Bruch-Tabelle (z.B. 4/3), statt der vollen,
  // nicht abbrechenden Dezimalzahl (num.toString()).
  const key = num.toFixed(2)
  return fractions[key] || key
}

// Generiert a, b, c mit Brüchen für schwere Aufgaben: a ∈ [-3, 3], b, c ∈ [-5, 5]
// Die Werte bleiben als exakte Brüche (z.B. 2/3) erhalten und werden NICHT auf
// 2 Nachkommastellen gerundet, da sonst die angezeigte Bruchdarstellung
// (z.B. \frac{2}{3}) und die für die y-Werte verwendete Zahl auseinanderlaufen
// würden – das hätte bei größeren x-Werten schnell zu Rundungsfehlern über der
// Toleranz geführt, obwohl der Schüler korrekt mit dem Bruch gerechnet hat.
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

  return { a, b, c }
}

// Formatiert die Funktionsgleichung als Klartext (mit Unicode x²).
// a, b, c werden nur für die ANZEIGE auf 2 Nachkommastellen gerundet (z.B. bei
// Brüchen wie 2/3 = 0.6666...); für die y-Wert-Berechnung wird weiterhin der
// exakte Wert verwendet.
function formatEquation(a: number, b: number, c: number): string {
  const aDisp = roundHalfAwayFromZero(a)
  const bDisp = roundHalfAwayFromZero(b)
  const cDisp = roundHalfAwayFromZero(c)

  const aStr = aDisp === 1 ? 'x²' : aDisp === -1 ? '-x²' : `${aDisp}x²`

  let bPart = ''
  if (bDisp !== 0) {
    if (bDisp === 1) bPart = ' + x'
    else if (bDisp === -1) bPart = ' - x'
    else bPart = bDisp > 0 ? ` + ${bDisp}x` : ` - ${Math.abs(bDisp)}x`
  }

  let cPart = ''
  if (cDisp !== 0) {
    cPart = cDisp > 0 ? ` + ${cDisp}` : ` - ${Math.abs(cDisp)}`
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

  // a, b, c werden für die Textdarstellung gerundet (z.B. Brüche wie 2/3), die
  // y-Berechnung selbst nutzt weiterhin die exakten Werte.
  const aDisp = roundHalfAwayFromZero(a)
  const bDisp = roundHalfAwayFromZero(b)
  const cDisp = roundHalfAwayFromZero(c)

  xWerte.forEach(x => {
    const y = berechneY(a, b, c, x)

    const xDisplay = x < 0 ? '(-' + Math.abs(x) + ')' : '' + x

    // a * x² Teil
    let axText = ''
    if (aDisp === 1) axText = `${xDisplay}²`
    else if (aDisp === -1) axText = `-${xDisplay}²`
    else axText = `${aDisp} · ${xDisplay}²`

    // b * x Teil mit Vorzeichen
    let bxText = ''
    if (bDisp !== 0) {
      if (bDisp === 1) bxText = ' + ' + xDisplay
      else if (bDisp === -1) bxText = ' - ' + xDisplay
      else bxText = bDisp > 0 ? ` + ${bDisp} · ${xDisplay}` : ` - ${Math.abs(bDisp)} · ${xDisplay}`
    }

    // c Teil mit Vorzeichen
    let cText = ''
    if (cDisp !== 0) {
      cText = cDisp > 0 ? ` + ${cDisp}` : ` - ${Math.abs(cDisp)}`
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
  const [validierteZellen, setValidierteZellen] = useState<{ [key: string]: boolean }>({})
  const [fehlerhafteZellen, setFehlerhafteZellen] = useState<{ [key: string]: boolean }>({})
  const [punkte, setPunkte] = useState<number>(0)
  const [schwierigkeitsgrad, setSchwierigkeitsgrad] = useState<'einfach' | 'mittel' | 'schwer' | null>(null)

  // --- Interaktives Einzeichnen der Punkte/Parabel (pro Aufgabe) ---
  const plotApiRefs = useRef<{ [index: number]: any }>({})
  const plotAchievedRefs = useRef<{ [index: number]: Set<string> }>({})
  const plotDoneRefs = useRef<{ [index: number]: boolean }>({})
  const [plotAchievedCount, setPlotAchievedCount] = useState<{ [index: number]: number }>({})
  const [plotDone, setPlotDone] = useState<{ [index: number]: boolean }>({})
  const [plotFeedback, setPlotFeedback] = useState<{ [index: number]: string | null }>({})
  const [plotScored, setPlotScored] = useState<{ [index: number]: boolean }>({})

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

  // GeoGebra-Skript einmalig laden
  useEffect(() => {
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.geogebra.org/apps/deployggb.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Die Zielpunkte einer Aufgabe: x ist bei quadratischen Wertetabellen stets
  // vorgegeben, daher direkt aus xWerte/yWerte ableitbar (unabhängig vom Typ).
  function getTargetPoints(aufgabe: Aufgabe): { x: number; y: number }[] {
    return aufgabe.xWerte.map((x: number, i: number) => ({ x, y: aufgabe.yWerte[i] }))
  }

  // Richtet die Zeichenfläche für eine Aufgabe ein: Punkt-Werkzeug aktivieren,
  // Koordinatensystem passend zu den Zielpunkten wählen und auf Klicks reagieren.
  function setupPlot(index: number, aufgabe: Aufgabe, api: any) {
    const targets = getTargetPoints(aufgabe)
    if (targets.length < PLOT_MIN_POINTS) return

    const xs = targets.map(p => p.x).concat(0)
    const ys = targets.map(p => p.y).concat(0)
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const yMin = Math.min(...ys)
    const yMax = Math.max(...ys)
    const xPad = Math.max((xMax - xMin) * 0.2, 1)
    const yPad = Math.max((yMax - yMin) * 0.2, 1)
    const { viewXMin, viewXMax, viewYMin, viewYMax } = computeCartesianView(
      xMin - xPad, xMax + xPad, yMin - yPad, yMax + yPad, PLOT_WIDTH, PLOT_HEIGHT
    )
    const rangeX = viewXMax - viewXMin
    const rangeY = viewYMax - viewYMin

    plotAchievedRefs.current[index] = new Set()
    plotDoneRefs.current[index] = false
    setPlotAchievedCount(prev => ({ ...prev, [index]: 0 }))
    setPlotDone(prev => ({ ...prev, [index]: false }))
    setPlotFeedback(prev => ({ ...prev, [index]: null }))

    try {
      api.reset()
      api.setCoordSystem(viewXMin, viewXMax, viewYMin, viewYMax)
      api.setMode(1) // Punkt-Werkzeug: Klicks erzeugen einen Punkt

      api.registerAddListener((objName: string) => {
        if (plotDoneRefs.current[index]) return

        let rawX = 0
        let rawY = 0
        try {
          rawX = api.getXcoord(objName)
          rawY = api.getYcoord(objName)
        } catch (e) {
          return
        }

        let nearest: { x: number; y: number } | null = null
        let nearestDist = Infinity
        for (const t of targets) {
          const dx = (rawX - t.x) / rangeX
          const dy = (rawY - t.y) / rangeY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < nearestDist) {
            nearestDist = dist
            nearest = t
          }
        }

        const captureRadius = 0.06
        const achieved = plotAchievedRefs.current[index] || new Set<string>()

        if (nearest && nearestDist <= captureRadius) {
          const key = `${nearest.x}|${nearest.y}`
          if (achieved.has(key)) {
            try { api.deleteObject(objName) } catch (e) { /* ignore */ }
            return
          }
          try {
            api.setCoords(objName, nearest.x, nearest.y)
            api.setColor(objName, 22, 163, 74)
          } catch (e) { /* ignore */ }

          achieved.add(key)
          plotAchievedRefs.current[index] = achieved
          setPlotAchievedCount(prev => ({ ...prev, [index]: achieved.size }))
          setPlotFeedback(prev => ({ ...prev, [index]: null }))

          if (achieved.size >= PLOT_MIN_POINTS) {
            plotDoneRefs.current[index] = true
            setPlotDone(prev => ({ ...prev, [index]: true }))
            try {
              api.evalCommand(`p(x) = ${aufgabe.a}*x^2 + ${aufgabe.b}*x + ${aufgabe.c}`)
              api.setColor('p', 37, 99, 235)
              api.setMode(0)
            } catch (e) { /* ignore */ }
          }
        } else {
          try { api.setColor(objName, 220, 38, 38) } catch (e) { /* ignore */ }
          setPlotFeedback(prev => ({ ...prev, [index]: 'Dieser Punkt passt zu keinem Wertepaar deiner Tabelle. Versuch es noch einmal!' }))
          setTimeout(() => {
            try { api.deleteObject(objName) } catch (e) { /* ignore */ }
          }, 900)
        }
      })
    } catch (e) {
      console.error('GeoGebra Plot-Setup-Error:', e)
    }
  }

  // Injiziert (bzw. richtet erneut ein) die Zeichenfläche für eine Aufgabe
  function initPlotForIndex(index: number, aufgabe: Aufgabe) {
    const containerId = `ggb-plot-${index}`
    let attempts = 0
    const tryInject = () => {
      attempts++
      if (!window.GGBApplet || !document.getElementById(containerId)) {
        if (attempts < 50) setTimeout(tryInject, 100)
        return
      }
      injectPlotApplet(containerId, PLOT_WIDTH, PLOT_HEIGHT, (api: any) => {
        plotApiRefs.current[index] = api
        setupPlot(index, aufgabe, api)
      })
    }
    tryInject()
  }

  // Sobald eine Aufgabe als richtig validiert wird, Zeichenfläche einrichten
  useEffect(() => {
    aufgaben.forEach((aufgabe, index) => {
      if (validiert[index] && !plotApiRefs.current[index]) {
        initPlotForIndex(index, aufgabe)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validiert, aufgaben])

  function resetPlot(index: number) {
    const aufgabe = aufgaben[index]
    const api = plotApiRefs.current[index]
    if (!api || !aufgabe) return
    setupPlot(index, aufgabe, api)
  }

  // Entfernt die Zeichenfläche und ihren Zustand für eine Aufgabe (z.B. wenn
  // die Tabelle erneut bearbeitet wird und damit nicht mehr als geprüft gilt)
  function clearPlotForIndex(index: number) {
    delete plotApiRefs.current[index]
    delete plotAchievedRefs.current[index]
    delete plotDoneRefs.current[index]
    setPlotAchievedCount(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
    setPlotDone(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
    setPlotFeedback(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  // Vergibt einen Zusatzpunkt, sobald in einer Aufgabe die Parabel fertig
  // eingezeichnet wurde (einmalig pro Aufgabe/Runde)
  useEffect(() => {
    Object.keys(plotDone).forEach(key => {
      const index = Number(key)
      if (plotDone[index] && !plotScored[index]) {
        setPunkte(p => p + 1)
        setPlotScored(prev => ({ ...prev, [index]: true }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotDone])

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

      const graphHinweis = ` Sobald die Wertetabelle richtig ist, zeichne mindestens ${PLOT_MIN_POINTS} deiner Wertepaare als Punkte in das erscheinende Koordinatensystem ein - die passende Parabel wird dann automatisch ergänzt.`
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
        } else {
          aufgabe.lösungsweg = `Setze die gegebenen x-Werte in die Funktionsgleichung ${formatEquationLatex(a, 0, 0)} ein und berechne die zugehörigen y-Werte.`
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
        } else {
          aufgabe.lösungsweg = `Setze die gegebenen x-Werte in die Funktionsgleichung ${formatEquationLatex(a, 0, c)} ein und berechne die zugehörigen y-Werte.`
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

        // Bei "schwer" ist der Scheitelpunkt x_s = -b/(2a) meist nicht mehr 0,
        // daher die x-Werte neu um den tatsächlichen Scheitelpunkt zentrieren,
        // statt sie (wie bei einfach/mittel passend) um x = 0 zu verteilen.
        const scheitelpunktXs = -bBruch / (2 * aBruch)
        aufgabe.xWerte = generateXWerte(ANZAHL_WERTEPAARE, scheitelpunktXs)

        const funktionsgleichungText = formatEquation(aBruch, bBruch, cBruch)
        aufgabe.funktionsgleichung = funktionsgleichungText
        aufgabe.funktionsgleichungLatex = formatEquationLatex(aBruch, bBruch, cBruch)
        aufgabe.frage = `Gegeben ist die Funktionsgleichung ${funktionsgleichungText}. ${aufgabenTyp === 'leereTabelleAusfüllen' ? 'Berechne für die vorgegebenen x-Werte die zugehörigen y-Werte.' : 'Vervollständige die Wertetabelle.'}${graphHinweis}`
        aufgabe.yWerte = aufgabe.xWerte.map((x: number) => berechneY(aBruch, bBruch, cBruch, x))

        if (aufgabenTyp === 'leereTabelleAusfüllen') {
          aufgabe.rechenbeispiele = generateRechenbeispiele(aBruch, bBruch, cBruch)
        } else {
          aufgabe.lösungsweg = `Setze die gegebenen x-Werte in die Funktionsgleichung ${formatEquationLatex(aBruch, bBruch, cBruch)} ein und berechne die zugehörigen y-Werte.`
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
    setValidierteZellen({})
    setFehlerhafteZellen({})

    // Zeichenflächen der vorherigen Runde vollständig zurücksetzen
    plotApiRefs.current = {}
    plotAchievedRefs.current = {}
    plotDoneRefs.current = {}
    setPlotAchievedCount({})
    setPlotDone({})
    setPlotFeedback({})
    setPlotScored({})
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

    if (validiert[aufgabeIndex]) {
      clearPlotForIndex(aufgabeIndex)
    }
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

                  {/* Punkte einzeichnen: erscheint automatisch, sobald die Wertetabelle richtig ist */}
                  {validiert[index] && (
                    <div className={styles.graphBox}>
                      <h4>Punkte einzeichnen:</h4>
                      <p className={styles.plotHint}>
                        Klicke im Koordinatensystem auf mindestens {PLOT_MIN_POINTS} deiner Wertepaare. Richtige Punkte werden grün markiert; sobald genug Punkte gesetzt sind, zeichnet die App automatisch die passende Parabel ein.
                      </p>
                      <div id={`ggb-plot-${index}`} style={{ width: `${PLOT_WIDTH}px`, height: `${PLOT_HEIGHT}px`, margin: '0 auto' }}></div>
                      <div className={styles.plotControls}>
                        <span className={styles.plotBadge}>
                          {plotAchievedCount[index] || 0} / {PLOT_MIN_POINTS} Punkte gesetzt
                        </span>
                        <button onClick={() => resetPlot(index)} className={styles.solutionBtn}>
                          Punkte zurücksetzen
                        </button>
                      </div>
                      {plotFeedback[index] && (
                        <p className={styles.plotFeedbackError}>{plotFeedback[index]}</p>
                      )}
                      {plotDone[index] && (
                        <p className={styles.plotSuccess}>
                          Super! Die Parabel {aufgabe.funktionsgleichung} wurde eingezeichnet.
                        </p>
                      )}
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
