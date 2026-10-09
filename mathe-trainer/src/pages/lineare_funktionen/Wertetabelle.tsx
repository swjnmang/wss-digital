import React, { useEffect, useState, useRef } from 'react'
import styles from './Wertetabelle.module.css'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'

declare global {
  interface Window {
    GGBApplet: any
  }
}

// "Gut zeichenbarer" Bereich für das Koordinatensystem im Heft:
// beide Achsen von -6 bis 6 (1 Einheit = 1 cm passt bequem auf eine Heftseite).
const ZEICHEN_X_MIN = -6
const ZEICHEN_X_MAX = 6
const ZEICHEN_Y_MAX = 6

const GRAPH_WIDTH = 500
const GRAPH_HEIGHT = 330

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

function injectGraphApplet(containerId: string, width: number, height: number, onLoad: (api: any) => void) {
  const params: any = {
    appName: 'classic',
    width,
    height,
    showToolBar: false,
    showAlgebraInput: false,
    showMenuBar: false,
    perspective: 'G',
    useBrowserForJS: true,
    enableRightClick: false,
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

// Generiert zufällige m und t Werte: m ∈ [-3, 3] mit Schrittweite 0.5, t ∈ [-5, 5] mit Schrittweite 0.5
function generateRandomMT() {
  const mWerte = []
  for (let v = -3; v <= 3; v += 0.5) {
    mWerte.push(Math.round(v * 10) / 10)
  }
  
  const tWerte = []
  for (let v = -5; v <= 5; v += 0.5) {
    tWerte.push(Math.round(v * 10) / 10)
  }
  
  let m = mWerte[randInt(0, mWerte.length - 1)]
  const t = tWerte[randInt(0, tWerte.length - 1)]
  
  // m darf nicht 0 sein
  while (m === 0) {
    m = mWerte[randInt(0, mWerte.length - 1)]
  }
  
  return { m, t }
}

// Konvertiere Dezimalzahl zu LaTeX-Bruch: 0.5 → \frac{1}{2}, 0.75 → \frac{3}{4}, etc.
function toFractionLatex(num: number): string {
  if (num === Math.round(num)) return Math.round(num).toString() // Ganze Zahl
  
  // Mapping von Dezimalzahlen zu LaTeX-Brüchen
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

// Konvertiere Dezimalzahl zu lesbarem Format: 0.5 → "1/2", 0.75 → "3/4", etc. (für nicht-LaTeX Anzeige)
function toFraction(num: number): string {
  if (num === Math.round(num)) return Math.round(num).toString() // Ganze Zahl
  
  // Einfache Standardbrüche
  const fractions: Record<string, string> = {
    '0.5': '1/2',
    '-0.5': '-1/2',
    '0.25': '1/4',
    '-0.25': '-1/4',
    '0.75': '3/4',
    '-0.75': '-3/4',
    '0.33': '1/3',
    '-0.33': '-1/3',
    '0.67': '2/3',
    '-0.67': '-2/3',
    '0.2': '1/5',
    '-0.2': '-1/5',
    '0.4': '2/5',
    '-0.4': '-2/5',
    '0.6': '3/5',
    '-0.6': '-3/5',
    '0.8': '4/5',
    '-0.8': '-4/5'
  }
  
  const key = num.toFixed(2)
  return fractions[key] || num.toString()
}

// Generiert m und t Werte mit Brüchen für schwere Aufgaben: m ∈ [-3, 3], t ∈ [-5, 5]
function generateRandomMTMitBrüchen() {
  // Zähler und Nenner für Brüche: m bleibt in [-3, 3]
  const zählerM = [-3, -2, -1, 1, 2, 3]
  const nenner = [1, 2, 3, 4]
  
  // Zähler für t: kann größer sein da t ∈ [-5, 5]
  const zählerT = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
  
  // Generiere m mit Brüchen
  let m = 0
  while (m === 0) {
    const z = zählerM[randInt(0, zählerM.length - 1)]
    const n = nenner[randInt(0, nenner.length - 1)]
    m = z / n
  }
  
  // Generiere t mit Brüchen
  const z_t = zählerT[randInt(0, zählerT.length - 1)]
  const n_t = nenner[randInt(0, nenner.length - 1)]
  const t = z_t / n_t
  
  return { m: Math.round(m * 100) / 100, t: Math.round(t * 100) / 100 }
}

// Formatiert die Funktionsgleichung mit LaTeX-Bruchdarstellung
function formatEquation(m: number, t: number): string {
  const mStr = toFractionLatex(m)
  const tStr = toFractionLatex(t)
  
  let equation = `y = ${mStr}x`
  
  if (t !== 0) {
    const tDisplay = tStr.startsWith('-') ? tStr : tStr
    equation += t > 0 ? ` + ${tDisplay}` : ` - ${tDisplay.replace('-', '')}`
  }
  
  return equation
}

// LaTeX-Version für MathJax
function formatEquationLatex(m: number, t: number): string {
  return `$$${formatEquation(m, t)}$$`
}

// Ganzzahlige x-Werte im Heft-Zeichenbereich, deren y-Werte ebenfalls gut
// zeichenbar sind: |y| <= ZEICHEN_Y_MAX und y ein Vielfaches von 0,5
// (lässt sich auf Karopapier mit 1 Einheit = 2 Kästchen exakt eintragen).
function gutZeichenbareXWerte(m: number, t: number): number[] {
  const werte: number[] = []
  for (let x = ZEICHEN_X_MIN; x <= ZEICHEN_X_MAX; x++) {
    const y = m * x + t
    const istHalbzahlig = Math.abs(y * 2 - Math.round(y * 2)) < 1e-9
    if (Math.abs(y) <= ZEICHEN_Y_MAX + 1e-9 && istHalbzahlig) werte.push(x)
  }
  return werte
}

// Wählt bis zu `anzahl` möglichst gleichmäßig verteilte Werte aus einer sortierten Liste
function verteilteAuswahl(werte: number[], anzahl: number): number[] {
  if (werte.length <= anzahl) return [...werte]
  const auswahl: number[] = []
  for (let i = 0; i < anzahl; i++) {
    auswahl.push(werte[Math.round((i * (werte.length - 1)) / (anzahl - 1))])
  }
  return auswahl
}

function berechneY(m: number, t: number, x: number) {
  return Math.round((m * x + t) * 100) / 100
}

// Generiert 2 Rechenbeispiele für die Lösungsanzeige
function generateRechenbeispiele(m: number, t: number, xPool: number[]): Array<{ x: number; y: number; berechnung: string }> {
  const beispiele: Array<{ x: number; y: number; berechnung: string }> = []
  
  // Wähle 2 verschiedene zufällige x-Werte aus dem gut zeichenbaren Bereich
  const xWerte = new Set<number>()
  while (xWerte.size < Math.min(2, xPool.length)) {
    xWerte.add(xPool[randInt(0, xPool.length - 1)])
  }
  
  xWerte.forEach(x => {
    const y = berechneY(m, t, x)
    
    // Formatiere x-Wert mit Klammern wenn negativ
    let xDisplay = ''
    if (x < 0) {
      xDisplay = '(-' + Math.abs(x) + ')'
    } else {
      xDisplay = '' + x
    }
    
    // Baue die Berechnung als normalen Text (kein LaTeX)
    let berechnung = ''
    
    // m * x Teil
    let mxText = ''
    if (m === 1) {
      mxText = xDisplay
    } else if (m === -1) {
      mxText = '-' + xDisplay
    } else {
      mxText = m + ' · ' + xDisplay
    }
    
    // t Teil mit Vorzeichen
    let tText = ''
    if (t > 0) {
      tText = '+ ' + t
    } else if (t < 0) {
      tText = '- ' + Math.abs(t)
    }
    
    // Komplette Berechnung als normaler mathematischer Text
    berechnung = 'y = ' + mxText + ' ' + tText + ' = ' + y
    
    beispiele.push({ x, y, berechnung })
  })
  
  return beispiele
}

// ===== Aufgabengenerator =====
// xPool: gut zeichenbare x-Werte (siehe gutZeichenbareXWerte), mindestens 5 Stück
const aufgabenBanks = {
  // Typ 1: Völlig leere Wertetabelle ausfüllen
  leereTabelleAusfüllen: (m: number, t: number, xPool: number[], funktionsgleichung: string) => {
    const xVon = xPool[0]
    const xBis = xPool[xPool.length - 1]
    // Sind nicht alle ganzen Zahlen im Bereich gut zeichenbar (Brüche), konkrete Vorschläge nennen
    const lückenlos = xPool.length === xBis - xVon + 1
    const vorschläge = verteilteAuswahl(xPool, 4)
    const xTipp = lückenlos
      ? `Wähle x-Werte zwischen ${xVon} und ${xBis}, damit du den Graphen gut zeichnen kannst.`
      : `Wähle x-Werte, bei denen sich "schöne" y-Werte ergeben, z. B. x = ${vorschläge.join('; ')}.`

    return {
      typ: 'leereTabelleAusfüllen',
      thema: '1. Wertetabelle aus Funktionsgleichung',
      frage: `Gegeben ist die Funktionsgleichung ${funktionsgleichung}. Erstelle eine Wertetabelle mit mindestens 4 Wertepaaren. ${xTipp}`,
      numZeilen: 4,
      // Beispiel-Wertetabelle für die Lösung
      xWerte: vorschläge,
      yWerte: vorschläge.map(x => berechneY(m, t, x)),
      lösungsweg: `Setze verschiedene x-Werte in die Funktionsgleichung ein und berechne die entsprechenden y-Werte.`,
    }
  },

  // Typ 2: Teilweise gefüllte Wertetabelle vervollständigen
  teilweisgefülltVervollständigen: (m: number, t: number, xPool: number[], funktionsgleichung: string, nurYGesucht: boolean) => {
    // 5 verschiedene zufällige x-Werte aus dem gut zeichenbaren Bereich, aufsteigend sortiert
    const pool = [...xPool]
    const xWerte: number[] = []
    while (xWerte.length < 5) {
      xWerte.push(pool.splice(randInt(0, pool.length - 1), 1)[0])
    }
    xWerte.sort((a, b) => a - b)
    const yWerte = xWerte.map(x => berechneY(m, t, x))
    // true = x gegeben, y versteckt; false = y gegeben, x versteckt
    const gebenXWert = xWerte.map(() => nurYGesucht || Math.random() > 0.5)

    return {
      typ: 'teilweisgefülltVervollständigen',
      thema: '2. Wertetabelle vervollständigen',
      frage: `Vervollständige die Wertetabelle für die Funktionsgleichung ${funktionsgleichung}.`,
      xWerte,
      yWerte,
      gebenXWert,
      lösungsweg: `Nutze die Funktionsgleichung ${formatEquationLatex(m, t)} und berechne den fehlenden Wert (x oder y) aus dem gegebenen Wert.`,
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
  // Pro Runde gibt es 4 parallele Aufgaben -> je ein Tracking-Hook (feste Anzahl, Hook-Regeln bleiben erfüllt)
  const trackings = [
    useTaskTracking('Wertetabelle', { shownOnMount: false }),
    useTaskTracking('Wertetabelle', { shownOnMount: false }),
    useTaskTracking('Wertetabelle', { shownOnMount: false }),
    useTaskTracking('Wertetabelle', { shownOnMount: false })
  ]
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([])
  const [antworten, setAntworten] = useState<{ [key: number]: Array<{ x: string; y: string }> }>({})
  const [validiert, setValidiert] = useState<{ [key: number]: boolean }>({})
  const [showLösung, setShowLösung] = useState<{ [key: number]: boolean }>({})
  const [validierteZellen, setValidierteZellen] = useState<{ [key: string]: boolean }>({})
  const [fehlerhafteZellen, setFehlerhafteZellen] = useState<{ [key: string]: boolean }>({})
  const [punkte, setPunkte] = useState<number>(0)
  const [schwierigkeitsgrad, setSchwierigkeitsgrad] = useState<'einfach' | 'mittel' | 'schwer' | null>(null)

  // GeoGebra-Applets der Lösungsgraphen (pro Aufgabe), damit jeder Graph nur einmal injiziert wird
  const lösungGraphRefs = useRef<{ [index: number]: boolean }>({})

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

  // Zeichnet in der Lösung den Funktionsgraphen samt Punkten der Wertetabelle
  function setupLösungGraph(aufgabe: Aufgabe, api: any, width: number) {
    const punkte = aufgabe.xWerte.map((x: number, i: number) => ({ x, y: aufgabe.yWerte[i] }))
    const xs = punkte.map((p: { x: number }) => p.x).concat(0)
    const ys = punkte.map((p: { y: number }) => p.y).concat(0)
    const { viewXMin, viewXMax, viewYMin, viewYMax } = computeCartesianView(
      Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...ys) - 1, Math.max(...ys) + 1, width, GRAPH_HEIGHT
    )
    try {
      api.setCoordSystem(viewXMin, viewXMax, viewYMin, viewYMax)
      try { api.setGridVisible(true) } catch (e) { /* ignore */ }
      api.evalCommand(`f(x) = ${aufgabe.m}*x + ${aufgabe.t}`)
      api.setColor('f', 37, 99, 235)
      api.setLineThickness('f', 6)
      api.setFixed('f', true, false)
      punkte.forEach((p: { x: number; y: number }, i: number) => {
        const name = `P_{${i + 1}}`
        api.evalCommand(`${name} = (${p.x}, ${p.y})`)
        api.setColor(name, 220, 38, 38)
        api.setPointSize(name, 5)
        api.setFixed(name, true, false)
      })
    } catch (e) {
      console.error('GeoGebra Lösungsgraph-Error:', e)
    }
  }

  // Lösungsgraphen injizieren, sobald die Lösung eingeblendet wird
  useEffect(() => {
    aufgaben.forEach((aufgabe, index) => {
      if (!showLösung[index]) {
        // Beim Ausblenden wird der Container entfernt -> beim nächsten Einblenden neu injizieren
        delete lösungGraphRefs.current[index]
        return
      }
      if (lösungGraphRefs.current[index]) return
      lösungGraphRefs.current[index] = true

      const containerId = `ggb-loesung-${index}`
      let attempts = 0
      const tryInject = () => {
        attempts++
        const container = document.getElementById(containerId)
        if (!window.GGBApplet || !container) {
          if (attempts < 50) setTimeout(tryInject, 100)
          return
        }
        // Auf schmalen Bildschirmen (Tablet hochkant, Handy) nicht breiter als der verfügbare Platz
        const width = Math.min(GRAPH_WIDTH, container.parentElement?.clientWidth || GRAPH_WIDTH)
        container.style.width = `${width}px`
        injectGraphApplet(containerId, width, GRAPH_HEIGHT, (api: any) => setupLösungGraph(aufgabe, api, width))
      }
      tryInject()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLösung, aufgaben])

  // Aufgaben generieren basierend auf Schwierigkeitsgrad
  function generiereAufgaben(grad: 'einfach' | 'mittel' | 'schwer') {
    const gradLabel = grad === 'einfach' ? 'Einfach' : grad === 'mittel' ? 'Mittel' : 'Schwer'
    trackings.forEach(t => t.onTaskStart(`Wertetabelle (${gradLabel})`))
    const neue: Aufgabe[] = []
    const usedCombinations = new Set<string>() // Tracke verwendete (m, t) Kombinationen
    
    // Generiere 4 verschiedene Aufgaben mit unterschiedlichen Funktionsgleichungen
    let attempts = 0
    const maxAttempts = 1000 // Verhindere infinite Loop
    
    while (neue.length < 4 && attempts < maxAttempts) {
      attempts++
      
      // Passe Schwierigkeitsgrad an und generiere m/t basierend darauf
      let m: number
      let t: number
      let funktionsgleichung: string
      if (grad === 'einfach') {
        // Einfach: y = m*x (ohne t)
        m = generateRandomMT().m
        t = 0
        funktionsgleichung = `y = ${m}x`
      } else if (grad === 'mittel') {
        // Mittel: y = m*x + t mit ganzen Zahlen
        ;({ m, t } = generateRandomMT())
        funktionsgleichung = formatEquation(m, t)
      } else {
        // Schwer: y = m*x + t mit Brüchen
        ;({ m, t } = generateRandomMTMitBrüchen())
        funktionsgleichung = formatEquation(m, t)
      }

      // Prüfe ob diese Kombination bereits verwendet wurde
      const kombinationKey = `${m}|${t}`
      if (usedCombinations.has(kombinationKey)) continue

      // Nur Funktionen, für die es genug gut zeichenbare Wertepaare gibt
      const xPool = gutZeichenbareXWerte(m, t)
      if (xPool.length < 5) continue
      usedCombinations.add(kombinationKey)

      // Zufällig zwischen Typ 1 und Typ 2 wählen
      const teil = Math.random() > 0.5
        ? aufgabenBanks.leereTabelleAusfüllen(m, t, xPool, funktionsgleichung)
        : aufgabenBanks.teilweisgefülltVervollständigen(m, t, xPool, funktionsgleichung, grad === 'einfach')

      neue.push({
        ...teil,
        frage: `${teil.frage} Sobald deine Wertetabelle richtig ist, zeichnest du den Graphen in dein Heft.`,
        m,
        t,
        funktionsgleichung,
        funktionsgleichungLatex: `$$${funktionsgleichung}$$`,
        rechenbeispiele: generateRechenbeispiele(m, t, xPool)
      })
    }
    
    setAufgaben(neue)
    setAntworten({})
    setValidiert({})
    setShowLösung({})
    setValidierteZellen({})
    setFehlerhafteZellen({})
    lösungGraphRefs.current = {}
  }

  // Markiert fehlerhafte Zellen rot
  function markFehlerhafteZellen(index: number, aufgabe: Aufgabe) {
    const eingaben = antworten[index]
    if (!eingaben) return
    
    const m = aufgabe.m
    const t = aufgabe.t
    const tolerance = 0.02
    const fehler = { ...fehlerhafteZellen }
    
    if (aufgabe.typ === 'leereTabelleAusfüllen') {
      // Typ 1: Beide x und y müssen korrekt sein
      for (let i = 0; i < eingaben.length; i++) {
        const x = parseFloat(eingaben[i].x.replace(',', '.').replace(/[−–—‐]/g, '-'))
        const y = parseFloat(eingaben[i].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
        const cellKey = `${index}-${i}`
        
        if (isNaN(x) || isNaN(y)) {
          fehler[cellKey] = true
        } else {
          const expectedY = Math.round((m * x + t) * 100) / 100
          if (Math.abs(y - expectedY) > tolerance) {
            fehler[cellKey] = true
          } else {
            delete fehler[cellKey]
          }
        }
      }
    } else {
      // Typ 2: Basierend auf gebenXWert
      for (let i = 0; i < eingaben.length; i++) {
        const cellKey = `${index}-${i}`
        
        if (aufgabe.gebenXWert[i]) {
          // X ist gegeben, y muss geprüft werden
          const y = parseFloat(eingaben[i].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
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
        } else {
          // Y ist gegeben, x muss geprüft werden
          const x = parseFloat(eingaben[i].x.replace(',', '.').replace(/[−–—‐]/g, '-'))
          if (isNaN(x)) {
            fehler[cellKey] = true
          } else {
            const expectedX = aufgabe.xWerte[i]
            if (Math.abs(x - expectedX) > tolerance) {
              fehler[cellKey] = true
            } else {
              delete fehler[cellKey]
            }
          }
        }
      }
    }
    
    setFehlerhafteZellen(fehler)
  }

  function validateAnswer(index: number, aufgabe: Aufgabe): boolean {
    const eingaben = antworten[index]
    if (!eingaben || eingaben.length === 0) return false
    
    const m = aufgabe.m
    const t = aufgabe.t
    const tolerance = 0.02
    
    // Markiere fehlerhafte Zellen
    markFehlerhafteZellen(index, aufgabe)

    // Alle eingegebenen Wertepaare prüfen
    for (const eintrag of eingaben) {
      const x = parseFloat(eintrag.x.replace(',', '.').replace(/[−–—‐]/g, '-'))
      const y = parseFloat(eintrag.y.replace(',', '.').replace(/[−–—‐]/g, '-'))
      
      if (isNaN(x) || isNaN(y)) return false
      
      // Prüfe, ob y = m*x + t
      const expectedY = Math.round((m * x + t) * 100) / 100
      if (Math.abs(y - expectedY) > tolerance) {
        return false
      }
    }
    
    // Alle korrekt - Punkt hinzufügen!
    if (!validiert[index]) {
      setPunkte(punkte + 1)
    }

    return true
  }

  function validateType2(index: number, aufgabe: Aufgabe): boolean {
    const eingaben = antworten[index]
    if (!eingaben) return false
    
    const m = aufgabe.m
    const t = aufgabe.t
    const tolerance = 0.02
    
    // Markiere fehlerhafte Zellen
    markFehlerhafteZellen(index, aufgabe)
    
    // Prüfe alle Wertepaare basierend auf gebenXWert
    for (let i = 0; i < eingaben.length; i++) {
      if (aufgabe.gebenXWert[i]) {
        // X ist gegeben, y muss geprüft werden
        const y = parseFloat(eingaben[i].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
        if (isNaN(y)) return false
        
        const expectedY = aufgabe.yWerte[i]
        if (Math.abs(y - expectedY) > tolerance) {
          return false
        }
      } else {
        // Y ist gegeben, x muss geprüft werden
        const x = parseFloat(eingaben[i].x.replace(',', '.').replace(/[−–—‐]/g, '-'))
        if (isNaN(x)) return false
        
        const expectedX = aufgabe.xWerte[i]
        if (Math.abs(x - expectedX) > tolerance) {
          return false
        }
      }
    }

    // Alle korrekt - Punkt hinzufügen!
    if (!validiert[index]) {
      setPunkte(punkte + 1)
    }

    return true
  }

  function validateSingleCell(aufgabeIndex: number, rowIndex: number, aufgabe: Aufgabe): boolean {
    const eingaben = antworten[aufgabeIndex]
    if (!eingaben || !eingaben[rowIndex]) return false
    
    const m = aufgabe.m
    const t = aufgabe.t
    const tolerance = 0.02
    
    if (aufgabe.typ === 'teilweisgefülltVervollständigen') {
      if (aufgabe.gebenXWert[rowIndex]) {
        // X ist gegeben, y muss geprüft werden
        const y = parseFloat(eingaben[rowIndex].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
        if (isNaN(y)) return false
        const expectedY = aufgabe.yWerte[rowIndex]
        return Math.abs(y - expectedY) <= tolerance
      } else {
        // Y ist gegeben, x muss geprüft werden
        const x = parseFloat(eingaben[rowIndex].x.replace(',', '.').replace(/[−–—‐]/g, '-'))
        if (isNaN(x)) return false
        const expectedX = aufgabe.xWerte[rowIndex]
        return Math.abs(x - expectedX) <= tolerance
      }
    }
    
    return false
  }

  function checkAnswer(index: number) {
    const aufgabe = aufgaben[index]
    const isCorrect = aufgabe.typ === 'leereTabelleAusfüllen' 
      ? validateAnswer(index, aufgabe)
      : validateType2(index, aufgabe)
    if (antworten[index]?.length) trackings[index]?.onCheck(isCorrect)
    setValidiert({ ...validiert, [index]: isCorrect })
  }

  function updateTableValue(aufgabeIndex: number, rowIndex: number, field: 'x' | 'y', value: string) {
    const currentAnswers = antworten[aufgabeIndex] || []
    
    // Ensure array is long enough
    while (currentAnswers.length <= rowIndex) {
      currentAnswers.push({ x: '', y: '' })
    }
    
    currentAnswers[rowIndex][field] = value
    if (value.trim() !== '') trackings[aufgabeIndex]?.onInput()
    
    // Validiere diese Zelle
    const aufgabe = aufgaben[aufgabeIndex]
    const cellKey = `${aufgabeIndex}-${rowIndex}`
    
    if (aufgabe?.typ === 'leereTabelleAusfüllen') {
      // Typ 1: Beide Felder müssen gefüllt sein
      const xFilled = currentAnswers[rowIndex].x.trim() !== ''
      const yFilled = currentAnswers[rowIndex].y.trim() !== ''
      
      if (xFilled && yFilled) {
        // Validiere die Zelle
        const x = parseFloat(currentAnswers[rowIndex].x.replace(',', '.').replace(/[−–—‐]/g, '-'))
        const y = parseFloat(currentAnswers[rowIndex].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
        
        if (!isNaN(x) && !isNaN(y)) {
          const m = aufgabe.m
          const t = aufgabe.t
          const tolerance = 0.02
          
          // Prüfe, ob y = m*x + t
          const expectedY = Math.round((m * x + t) * 100) / 100
          const isValid = Math.abs(y - expectedY) <= tolerance
          
          setValidierteZellen({
            ...validierteZellen,
            [cellKey]: isValid
          })
        } else {
          // Ungültige Zahlen eingegeben
          const newValidierteZellen = { ...validierteZellen }
          delete newValidierteZellen[cellKey]
          setValidierteZellen(newValidierteZellen)
        }
      } else {
        // Noch nicht komplett gefüllt, clear validation
        const newValidierteZellen = { ...validierteZellen }
        delete newValidierteZellen[cellKey]
        setValidierteZellen(newValidierteZellen)
      }
    } else if (aufgabe?.typ === 'teilweisgefülltVervollständigen') {
      // Typ 2: Entweder x ODER y ist gegeben
      // Prüfe ob beide Felder filled sind
      const xFilled = aufgabe.gebenXWert[rowIndex] || currentAnswers[rowIndex].x.trim() !== ''
      const yFilled = !aufgabe.gebenXWert[rowIndex] || currentAnswers[rowIndex].y.trim() !== ''
      
      if (xFilled && yFilled) {
        // Validiere die Zelle
        const m = aufgabe.m
        const t = aufgabe.t
        const tolerance = 0.02
        let isValid = false
        
        if (aufgabe.gebenXWert[rowIndex]) {
          // X gegeben, y eingegeben
          const y = parseFloat(currentAnswers[rowIndex].y.replace(',', '.').replace(/[−–—‐]/g, '-'))
          if (!isNaN(y)) {
            const expectedY = aufgabe.yWerte[rowIndex]
            isValid = Math.abs(y - expectedY) <= tolerance
          }
        } else {
          // Y gegeben, x eingegeben
          const x = parseFloat(currentAnswers[rowIndex].x.replace(',', '.').replace(/[−–—‐]/g, '-'))
          if (!isNaN(x)) {
            const expectedX = aufgabe.xWerte[rowIndex]
            isValid = Math.abs(x - expectedX) <= tolerance
          }
        }
        
        setValidierteZellen({
          ...validierteZellen,
          [cellKey]: isValid
        })
      } else {
        // Noch nicht komplett gefüllt, clear validation
        const newValidierteZellen = { ...validierteZellen }
        delete newValidierteZellen[cellKey]
        setValidierteZellen(newValidierteZellen)
      }
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
          <p className={styles.subtitle}>Erstelle oder vervollständige Wertetabellen für lineare Funktionen</p>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.score}>
            ⭐ {punkte} <span className={styles.scoreLabel}>Punkte</span>
          </div>
        </div>
      </div>

      {/* Schwierigkeitsgrad Auswahl - Nur anzeigen wenn noch nicht ausgewählt */}
      {schwierigkeitsgrad === null ? (
        <div className={styles.difficultySelector}>
          <h2 className={styles.difficultyTitle}>Schwierigkeitsgrad wählen:</h2>
          <div className={styles.difficultyButtonGroup}>
            <button
              onClick={() => {
                setSchwierigkeitsgrad('einfach')
                // Nach kurzem Delay aufgaben generieren
                setTimeout(() => {
                  generiereAufgaben('einfach')
                }, 100)
              }}
              className={`${styles.difficultyButton} ${styles.einfach}`}
            >
              <span className={styles.difficultyLabel}>Einfach</span>
              <span className={styles.difficultyDescription}>y = m·x ohne Brüche</span>
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
              <span className={styles.difficultyDescription}>y = m·x + t ganze Zahlen</span>
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
              <span className={styles.difficultyDescription}>y = m·x + t mit Brüchen</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Aufgaben anzeigen + "Schwierigkeitsgrad ändern" Button */}
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
                              className={`${styles.tableInput} ${fehlerhafteZellen[`${index}-${i}`] ? styles.inputError : ''} ${validierteZellen[`${index}-${i}`] ? styles.inputCorrect : ''}`}
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
                              className={`${styles.tableInput} ${fehlerhafteZellen[`${index}-${i}`] ? styles.inputError : ''} ${validierteZellen[`${index}-${i}`] ? styles.inputCorrect : ''}`}
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
                          <td key={`x-${i}`}>
                            {aufgabe.gebenXWert[i] ? (
                              <span className={styles.givenValue}>{x}</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="?"
                                value={antworten[index]?.[i]?.x || ''}
                                onChange={(e) => updateTableValue(index, i, 'x', e.target.value)}
                                className={`${styles.tableInput} ${fehlerhafteZellen[`${index}-${i}`] ? styles.inputError : ''} ${validierteZellen[`${index}-${i}`] ? styles.inputCorrect : ''}`}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className={styles.yRow}>
                        <th>y</th>
                        {aufgabe.yWerte.map((y: number, i: number) => (
                          <td key={`y-${i}`}>
                            {!aufgabe.gebenXWert[i] ? (
                              <span className={styles.givenValue}>{y}</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="?"
                                value={antworten[index]?.[i]?.y || ''}
                                onChange={(e) => updateTableValue(index, i, 'y', e.target.value)}
                                className={`${styles.tableInput} ${fehlerhafteZellen[`${index}-${i}`] ? styles.inputError : ''} ${validierteZellen[`${index}-${i}`] ? styles.inputCorrect : ''}`}
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
                  onClick={() => {
                    if (!showLösung[index]) trackings[index]?.onHintShown()
                    setShowLösung({ ...showLösung, [index]: !showLösung[index] })
                  }}
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

              {/* Aufforderung: Graph ins Heft zeichnen */}
              {validiert[index] && (
                <div className={styles.graphBox}>
                  <h4>✏️ Zeichne jetzt den Graphen in dein Heft:</h4>
                  <ol className={styles.heftSchritte}>
                    <li>Zeichne ein Koordinatensystem: x-Achse und y-Achse jeweils von {ZEICHEN_X_MIN} bis {ZEICHEN_X_MAX} (1 Einheit = 1 cm = 2 Kästchen).</li>
                    <li>Trage die Wertepaare aus deiner Tabelle als Punkte ein.</li>
                    <li>Verbinde die Punkte mit dem Lineal zu einer Geraden und beschrifte sie mit {aufgabe.funktionsgleichung}.</li>
                  </ol>
                  <p className={styles.plotHint}>Zur Kontrolle kannst du dir unter „Lösung anzeigen" den Graphen ansehen.</p>
                </div>
              )}

              {/* Lösung */}
              {showLösung[index] && (
                <div className={styles.lösungBox}>
                  <h4>Tipp:</h4>
                  <MathDisplay latex={aufgabe.lösungsweg} />
                  
                  {/* Rechenbeispiele */}
                  {aufgabe.rechenbeispiele && aufgabe.rechenbeispiele.length > 0 && (
                    <div className={styles.rechenbeispiele}>
                      <h5>Rechenbeispiele:</h5>
                      {aufgabe.rechenbeispiele.map((beispiel: any, i: number) => {
                        const m = aufgabe.m
                        const t = aufgabe.t
                        const x = beispiel.x
                        const y = beispiel.y
                        
                        // Formatiere x-Wert mit Klammern wenn negativ
                        const xDisplay = x < 0 ? `(-${Math.abs(x)})` : `${x}`
                        
                        // Baue m · x Teil (mit speziellen Fällen für m=1, m=-1)
                        let mxText = ''
                        if (m === 1) {
                          mxText = xDisplay
                        } else if (m === -1) {
                          mxText = '-' + xDisplay
                        } else {
                          mxText = m + ' · ' + xDisplay
                        }
                        
                        // t Teil mit Vorzeichen
                        let tText = ''
                        if (t > 0) {
                          tText = '+ ' + t
                        } else if (t < 0) {
                          tText = '- ' + Math.abs(t)
                        }
                        
                        return (
                          <div key={i} className={styles.beispiel}>
                            <p className={styles.beispielErklaerung}>
                              Wir setzen für x = <span className={styles.xWertRot}>{beispiel.x}</span> ein:
                            </p>
                            <p className={styles.berechnung}>
                              y = {m} · <span className={styles.xWertRot}>{xDisplay}</span> {tText} = {y}
                            </p>
                            <p className={styles.beispielText}>→ Punkt: ({beispiel.x} | {beispiel.y})</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  <div className={styles.lösungTabelle}>
                    {aufgabe.typ === 'leereTabelleAusfüllen' && (
                      <p className={styles.plotHint}>Beispiel-Wertetabelle (du kannst natürlich auch andere x-Werte wählen):</p>
                    )}
                    <table className={styles.wertetabelle}>
                      <tbody>
                        <tr>
                          <th>x</th>
                          {aufgabe.xWerte.map((x: number, i: number) => (
                            <td key={`sol-x-${i}`} className={aufgabe.gebenXWert && !aufgabe.gebenXWert[i] ? styles.sollution : styles.xCell}>{x}</td>
                          ))}
                        </tr>
                        <tr className={styles.yRow}>
                          <th>y</th>
                          {aufgabe.yWerte.map((y: number, i: number) => (
                            <td key={`sol-y-${i}`} className={!aufgabe.gebenXWert || aufgabe.gebenXWert[i] ? styles.sollution : ''}>
                              {y}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Funktionsgraph zur Kontrolle der Zeichnung im Heft */}
                  <div className={styles.graphBox}>
                    <h4>Graph der Funktion {aufgabe.funktionsgleichung}:</h4>
                    <p className={styles.plotHint}>
                      Die roten Punkte sind die Wertepaare aus der Tabelle. Vergleiche mit deiner Zeichnung im Heft.
                    </p>
                    <div id={`ggb-loesung-${index}`} style={{ width: `${GRAPH_WIDTH}px`, maxWidth: '100%', height: `${GRAPH_HEIGHT}px`, margin: '0 auto' }}></div>
                  </div>
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
