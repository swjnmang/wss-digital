// Aufgaben-Generatoren für „Quadratische Gleichungen“.
// Bewusst NUR reinquadratische Gleichungen (Form ax² = d bzw. ax² + c = d, ggf. nach Termumformung):
// Sie werden durch Umformen nach x² und Wurzelziehen gelöst – nie mit der Lösungsformel (kein Term mit bx).

export type Modus = 'zwei' | 'anzahl' | 'sach'

export interface Zeile {
  l: string
  r: string
  /** Äquivalenzumformung rechts, z. B. '\\mid -3' */
  u?: string
}

export interface Aufgabe {
  id: string
  /** Gleichung in TeX (bei Sachaufgaben leer) */
  tex: string
  /** Sachaufgabe: Aufgabentext */
  text?: string
  /** Sachaufgabe/Zahlenrätsel: Ansatz in Worten */
  ansatz?: string
  /** Sachaufgabe: Beschriftung und Einheit des Antwortfelds */
  frage?: string
  einheit?: string
  modus: Modus
  /** Lösungen aufsteigend: [] keine, [0] eine, [-w, w] zwei */
  loesungen: number[]
  /** Ergebnisse auf zwei Nachkommastellen gerundet */
  runden: boolean
  /** Rechenweg mit Äquivalenzumformungen */
  weg: Zeile[]
  /** Text- oder TeX-Zeilen nach der Rechnung (Lösungsmenge, Antwortsatz) */
  schluss: { tex?: string; text?: string }[]
}

// ---------- Hilfsfunktionen ----------

let zaehler = 0
const neueId = () => `q${Date.now().toString(36)}${(zaehler++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
export const wahl = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const r6 = (n: number) => Math.round(n * 1e6) / 1e6
const r2 = (n: number) => Math.round(n * 100) / 100

const QUADRATE = new Set(Array.from({ length: 41 }, (_, i) => i * i))

/** Zahl als TeX mit deutschem Dezimalkomma */
export function num(n: number): string {
  const s = String(r6(n))
  return s.replace('.', '{,}')
}
/** Zahl als Text mit deutschem Dezimalkomma (für Fließtext) */
export function txt(n: number): string {
  return String(r6(n)).replace('-', '−').replace('.', ',')
}

/** a·x² als TeX */
function ax2(a: number, v = 'x'): string {
  if (a === 1) return `${v}^2`
  if (a === -1) return `-${v}^2`
  return `${num(a)}${v}^2`
}
/** + c / − c als TeX (0 = leer) */
function plus(c: number): string {
  if (c === 0) return ''
  return c > 0 ? ` + ${num(c)}` : ` - ${num(-c)}`
}
/** Umformung, die +c beseitigt */
function wegC(c: number): string {
  return c > 0 ? `\\mid -${num(c)}` : `\\mid +${num(-c)}`
}
function teile(a: number): string {
  return a < 0 ? `\\mid\\ {:}\\,(${num(a)})` : `\\mid\\ {:}\\,${num(a)}`
}

/**
 * Schritte ab „a·x² = d“ bis zu den Lösungen. Liefert die Zeilen, die Lösungen und die Lösungsmenge.
 * Für runden = true wird auf zwei Nachkommastellen gerundet.
 */
function loeseAb(a: number, d: number, _runden: boolean, v = 'x'): { weg: Zeile[]; loesungen: number[]; menge: string } {
  const weg: Zeile[] = []
  const q = r6(d / a)
  if (a !== 1) {
    weg.push({ l: ax2(a, v), r: num(d), u: teile(a) })
  }
  weg.push({ l: `${v}^2`, r: num(q) })
  const letzte = weg[weg.length - 1]
  if (q < 0) {
    letzte.u = '\\text{kein Wurzelziehen möglich}'
    return { weg, loesungen: [], menge: '\\mathbb{L} = \\{\\,\\}' }
  }
  if (q === 0) {
    letzte.u = '\\mid \\sqrt{\\phantom{x}}'
    weg.push({ l: v, r: '0' })
    return { weg, loesungen: [0], menge: '\\mathbb{L} = \\{0\\}' }
  }
  letzte.u = '\\mid \\sqrt{\\phantom{x}}'
  const w = Math.sqrt(q)
  const exakt = Math.abs(w - Math.round(w * 100) / 100) < 1e-9
  const wert = exakt ? r6(w) : r2(w)
  const gl = exakt ? '=' : '\\approx'
  weg.push({ l: `${v}_1`, r: `\\sqrt{${num(q)}} ${gl} ${num(wert)}` })
  weg.push({ l: `${v}_2`, r: `-\\sqrt{${num(q)}} ${gl} ${num(-wert)}` })
  return { weg, loesungen: [-wert, wert], menge: `\\mathbb{L} = \\{${num(-wert)};\\ ${num(wert)}\\}` }
}

function fertig(p: Omit<Aufgabe, 'id'>): Aufgabe {
  return { id: neueId(), ...p }
}

/** Nicht-Quadratzahl zwischen min und max (für Aufgaben mit Runden) */
function nichtQuadrat(min: number, max: number): number {
  let q = rnd(min, max)
  while (QUADRATE.has(q)) q = rnd(min, max)
  return q
}

// ---------- Thema 1: x² = d ----------

export function erzeugeXQuadrat(stufe: number): Aufgabe {
  let d: number
  let runden = false
  if (stufe === 1) {
    d = rnd(1, 15) ** 2
  } else if (stufe === 2) {
    const art = rnd(0, 1)
    d = art === 0 ? r6((rnd(1, 12) / 10) ** 2) : rnd(16, 25) ** 2
  } else {
    d = nichtQuadrat(2, 99)
    runden = true
  }
  const { weg, loesungen, menge } = loeseAb(1, d, runden)
  return fertig({ tex: `x^2 = ${num(d)}`, modus: 'zwei', loesungen, runden, weg, schluss: [{ tex: menge }] })
}

// ---------- Thema 2: a·x² = d ----------

export function erzeugeAXQuadrat(stufe: number): Aufgabe {
  let a: number
  let q: number
  let runden = false
  if (stufe === 1) {
    a = rnd(2, 9)
    q = rnd(1, 10) ** 2
  } else if (stufe === 2) {
    a = wahl([-2, -3, -4, -5, 0.5, 0.25, -0.5, 1.5, 2.5])
    q = rnd(1, 10) ** 2
  } else {
    a = wahl([2, 3, 4, 5, -2, -3, 0.5])
    q = nichtQuadrat(2, 50)
    runden = true
  }
  const d = r6(a * q)
  const { weg, loesungen, menge } = loeseAb(a, d, runden)
  return fertig({ tex: `${ax2(a)} = ${num(d)}`, modus: 'zwei', loesungen, runden, weg, schluss: [{ tex: menge }] })
}

// ---------- Thema 3: a·x² + c = d ----------

export function erzeugeAXQuadratC(stufe: number): Aufgabe {
  let a: number
  let c: number
  let q: number
  let rechts: number
  let runden = false
  if (stufe === 1) {
    a = 1
    q = rnd(1, 12) ** 2
    c = wahl([-1, 1]) * rnd(1, 30)
    rechts = rnd(0, 2) === 0 ? 0 : r6(q + c)
    if (rechts === 0) c = -q
    rechts = r6(q + c)
  } else if (stufe === 2) {
    a = rnd(2, 6)
    q = rnd(1, 10) ** 2
    c = wahl([-1, 1]) * rnd(1, 40)
    rechts = rnd(0, 3) === 0 ? 0 : r6(a * q + c)
    if (rechts === 0) c = -a * q
    rechts = r6(a * q + c)
  } else {
    a = wahl([-2, -3, -4, 0.5, -0.5, 3, 2])
    c = wahl([-1, 1]) * rnd(1, 50)
    if (rnd(0, 1) === 0) {
      q = nichtQuadrat(2, 40)
      runden = true
    } else {
      q = rnd(1, 10) ** 2
    }
    rechts = r6(a * q + c)
  }
  const weg: Zeile[] = [{ l: `${ax2(a)}${plus(c)}`, r: num(rechts), u: wegC(c) }]
  const rest = loeseAb(a, r6(rechts - c), runden)
  return fertig({
    tex: `${ax2(a)}${plus(c)} = ${num(rechts)}`,
    modus: 'zwei',
    loesungen: rest.loesungen,
    runden,
    weg: [...weg, ...rest.weg],
    schluss: [{ tex: rest.menge }],
  })
}

// ---------- Thema 4: Anzahl der Lösungen ----------

export function erzeugeAnzahl(stufe: number): Aufgabe {
  const fall = wahl(['zwei', 'eine', 'keine', 'zwei', 'keine'] as const)
  const q = fall === 'zwei' ? rnd(1, 12) ** 2 : fall === 'eine' ? 0 : -(rnd(1, 12) ** 2)
  if (stufe === 1) {
    const a = rnd(0, 1) === 0 ? 1 : rnd(2, 5)
    const d = r6(a * q)
    const { weg, loesungen, menge } = loeseAb(a, d, false)
    return fertig({ tex: `${ax2(a)} = ${num(d)}`, modus: 'anzahl', loesungen, runden: false, weg, schluss: [{ tex: menge }, ...anzahlSatz(q)] })
  }
  const a = wahl([1, 2, 3, 4, -2, -3, 0.5])
  let c = wahl([-1, 1]) * rnd(1, 40)
  let rechts = r6(a * q + c)
  if (rechts === 0) {
    c += 1
    rechts = r6(a * q + c)
  }
  const rest = loeseAb(a, r6(rechts - c), false)
  return fertig({
    tex: `${ax2(a)}${plus(c)} = ${num(rechts)}`,
    modus: 'anzahl',
    loesungen: rest.loesungen,
    runden: false,
    weg: [{ l: `${ax2(a)}${plus(c)}`, r: num(rechts), u: wegC(c) }, ...rest.weg],
    schluss: [{ tex: rest.menge }, ...anzahlSatz(q)],
  })
}

function anzahlSatz(q: number): { text: string }[] {
  if (q > 0) return [{ text: `Rechts steht nach dem Umformen eine positive Zahl (${txt(q)}) → zwei Lösungen.` }]
  if (q === 0) return [{ text: 'Rechts steht nach dem Umformen 0 → genau eine Lösung (x = 0).' }]
  return [{ text: `Rechts steht nach dem Umformen eine negative Zahl (${txt(q)}). Kein Quadrat ist negativ → keine Lösung.` }]
}

// ---------- Thema 5: Erst umformen (Termumformungen) ----------

export function erzeugeUmformen(stufe: number): Aufgabe {
  // Ziel nach dem Zusammenfassen: A·x² = D mit D = A·q
  const qWahl = () => (rnd(0, 5) === 0 ? -(rnd(1, 6) ** 2) : rnd(0, 7) === 0 ? 0 : rnd(1, 10) ** 2)
  if (stufe === 1) {
    // p·x² + c1 = s·x² + c2, p > s
    const q = qWahl()
    const s = rnd(1, 4)
    const A = rnd(1, 4)
    const p = s + A
    const c1 = wahl([-1, 1]) * rnd(1, 20)
    const c2 = r6(A * q + c1)
    const links = `${ax2(p)}${plus(c1)}`
    const rechtsT = `${ax2(s)}${plus(c2)}`
    const weg: Zeile[] = [
      { l: links, r: rechtsT, u: `\\mid -${ax2(s)}` },
      { l: `${ax2(A)}${plus(c1)}`, r: num(c2), u: wegC(c1) },
    ]
    const rest = loeseAb(A, r6(c2 - c1), false)
    return fertig({ tex: `${links} = ${rechtsT}`, modus: 'anzahl', loesungen: rest.loesungen, runden: false, weg: [...weg, ...rest.weg], schluss: [{ tex: rest.menge }] })
  }
  if (stufe === 2) {
    // k·(x² + m) = s·x² + c2  →  (k − s)·x² = c2 − k·m
    const q = qWahl()
    const k = rnd(2, 5)
    const s = rnd(1, k - 1)
    const A = k - s
    const m = wahl([-1, 1]) * rnd(1, 9)
    const c2 = r6(A * q + k * m)
    const links = `${k}(x^2${plus(m)})`
    const rechtsT = `${ax2(s)}${plus(c2)}`
    const weg: Zeile[] = [
      { l: links, r: rechtsT, u: '\\text{Klammer auflösen}' },
      { l: `${ax2(k)}${plus(k * m)}`, r: rechtsT, u: `\\mid -${ax2(s)}` },
      { l: `${ax2(A)}${plus(k * m)}`, r: num(c2), u: wegC(k * m) },
    ]
    const rest = loeseAb(A, r6(c2 - k * m), false)
    return fertig({ tex: `${links} = ${rechtsT}`, modus: 'anzahl', loesungen: rest.loesungen, runden: false, weg: [...weg, ...rest.weg], schluss: [{ tex: rest.menge }] })
  }
  // Stufe 3: binomische Formeln, bei denen sich die x-Glieder aufheben
  if (rnd(0, 1) === 0) {
    // (x + b)(x − b) = r  →  x² − b² = r
    const b = rnd(1, 9)
    const q = qWahl() >= 0 ? rnd(1, 12) ** 2 : -(rnd(1, 4) ** 2)
    const r = r6(q - b * b)
    const weg: Zeile[] = [
      { l: `(x + ${b})(x - ${b})`, r: num(r), u: '\\text{3. binomische Formel}' },
      { l: `x^2 - ${b * b}`, r: num(r), u: `\\mid +${b * b}` },
    ]
    const rest = loeseAb(1, q, false)
    return fertig({ tex: `(x + ${b})(x - ${b}) = ${num(r)}`, modus: 'anzahl', loesungen: rest.loesungen, runden: false, weg: [...weg, ...rest.weg], schluss: [{ tex: rest.menge }] })
  }
  // (x + b)² + (x − b)² = r  →  2x² + 2b² = r
  const b = rnd(1, 6)
  const q = rnd(0, 6) === 0 ? 0 : rnd(1, 10) ** 2
  const r = r6(2 * q + 2 * b * b)
  const weg: Zeile[] = [
    { l: `(x + ${b})^2 + (x - ${b})^2`, r: num(r), u: '\\text{1. und 2. binomische Formel}' },
    { l: `x^2 + ${2 * b}x + ${b * b} + x^2 - ${2 * b}x + ${b * b}`, r: num(r), u: '\\text{zusammenfassen}' },
    { l: `2x^2 + ${2 * b * b}`, r: num(r), u: `\\mid -${2 * b * b}` },
  ]
  const rest = loeseAb(2, 2 * q, false)
  return fertig({ tex: `(x + ${b})^2 + (x - ${b})^2 = ${num(r)}`, modus: 'anzahl', loesungen: rest.loesungen, runden: false, weg: [...weg, ...rest.weg], schluss: [{ tex: rest.menge }] })
}

// ---------- Thema 6: Anwendungsaufgaben ----------

/** Sachaufgabe: Ansatz (Text) und Gleichung a·v² = d (ggf. mit vorgeschalteten Zeilen), gesucht ist die positive Lösung */
function sach(p: {
  text: string
  frage: string
  einheit: string
  ansatz: string
  vorZeilen?: Zeile[]
  a: number
  d: number
  runden: boolean
  v?: string
  antwort: (w: string) => string
  grund: string
}): Aufgabe {
  const v = p.v ?? 'x'
  const rest = loeseAb(p.a, p.d, p.runden, v)
  const w = rest.loesungen[rest.loesungen.length - 1]
  const rund = !gleich(w * w * p.a, p.d, false)
  return fertig({
    tex: '',
    text: p.text,
    frage: p.frage,
    einheit: p.einheit,
    ansatz: p.ansatz,
    modus: 'sach',
    loesungen: [w],
    runden: p.runden,
    weg: [...(p.vorZeilen ?? []), ...rest.weg],
    schluss: [
      { text: `Die negative Lösung ${v}₂ ${rund ? '≈' : '='} ${txt(-w)} entfällt, ${p.grund}` },
      { text: p.antwort(`${rund ? 'etwa ' : ''}${txt(w)}`) },
    ],
  })
}

export function erzeugeSach(stufe: number): Aufgabe {
  const runden = stufe >= 2
  const art = wahl(stufe === 1 ? ['quadrat', 'rechteck', 'zahl', 'wuerfel'] as const : ['quadrat', 'rechteck', 'kreis', 'fall', 'wuerfel', 'zahl'] as const)
  if (art === 'quadrat') {
    const A = runden ? nichtQuadrat(50, 900) : rnd(5, 40) ** 2
    return sach({
      text: `Ein quadratisches Grundstück hat einen Flächeninhalt von ${txt(A)} m².`,
      frage: 'Wie lang ist eine Seite des Grundstücks?',
      einheit: 'm',
      ansatz: 'Ansatz: Seitenlänge x (in m), Flächeninhalt A = x²',
      a: 1, d: A, runden,
      antwort: (w) => `Eine Seite des Grundstücks ist ${w} m lang.`,
      grund: 'denn eine Länge kann nicht negativ sein.',
    })
  }
  if (art === 'rechteck') {
    const k = rnd(2, 4)
    const A = runden ? k * nichtQuadrat(10, 120) : k * rnd(3, 15) ** 2
    const fakt = ['', '', 'doppelt', 'dreimal', 'viermal'][k]
    return sach({
      text: `Ein rechteckiges Beet ist ${fakt} so lang wie breit. Sein Flächeninhalt beträgt ${txt(A)} m².`,
      frage: 'Wie breit ist das Beet?',
      einheit: 'm',
      ansatz: `Ansatz: Breite x (in m), Länge ${k}x, Flächeninhalt A = Länge · Breite`,
      vorZeilen: [{ l: `${k}x \\cdot x`, r: num(A), u: '\\text{zusammenfassen}' }],
      a: k, d: A, runden,
      antwort: (w) => `Das Beet ist ${w} m breit.`,
      grund: 'denn eine Breite kann nicht negativ sein.',
    })
  }
  if (art === 'kreis') {
    const A = rnd(20, 500)
    const q = A / Math.PI
    const rr = r2(Math.sqrt(q))
    return fertig({
      tex: '',
      text: `Ein kreisrunder Teich hat einen Flächeninhalt von ${A} m².`,
      frage: 'Wie groß ist sein Radius?',
      einheit: 'm',
      ansatz: 'Ansatz: Radius r (in m), Flächeninhalt A = r² · π',
      modus: 'sach',
      loesungen: [rr],
      runden: true,
      weg: [
        { l: 'r^2 \\cdot \\pi', r: `${A}`, u: '\\mid\\ {:}\\,\\pi' },
        { l: 'r^2', r: `\\dfrac{${A}}{\\pi} \\approx ${num(r2(q))}`, u: '\\mid \\sqrt{\\phantom{x}}' },
        { l: 'r_1', r: `\\sqrt{\\dfrac{${A}}{\\pi}} \\approx ${num(rr)}` },
        { l: 'r_2', r: `-\\sqrt{\\dfrac{${A}}{\\pi}} \\approx ${num(-rr)}` },
      ],
      schluss: [
        { text: `Die negative Lösung r₂ ≈ ${txt(-rr)} entfällt, denn ein Radius kann nicht negativ sein.` },
        { text: `Der Teich hat einen Radius von etwa ${txt(rr)} m.` },
      ],
    })
  }
  if (art === 'fall') {
    const s = rnd(10, 150)
    return sach({
      text: `Ein Stein fällt von einer ${s} m hohen Brücke. Für den Fallweg gilt näherungsweise s = 5 · t² (s in m, t in s).`,
      frage: 'Nach wie vielen Sekunden kommt der Stein unten an?',
      einheit: 's',
      ansatz: `Ansatz: s = ${s} in s = 5 · t² einsetzen`,
      a: 5, d: s, runden: true, v: 't',
      antwort: (w) => `Der Stein kommt nach ${w} Sekunden unten an.`,
      grund: 'denn eine Zeit kann nicht negativ sein.',
    })
  }
  if (art === 'wuerfel') {
    const O = runden ? 6 * nichtQuadrat(5, 150) : 6 * rnd(2, 15) ** 2
    return sach({
      text: `Ein Würfel hat eine Oberfläche von ${txt(O)} cm².`,
      frage: 'Wie lang ist eine Kante des Würfels?',
      einheit: 'cm',
      ansatz: 'Ansatz: Kantenlänge a (in cm), Oberfläche O = 6 · a²',
      a: 6, d: O, runden, v: 'a',
      antwort: (w) => `Eine Kante des Würfels ist ${w} cm lang.`,
      grund: 'denn eine Kantenlänge kann nicht negativ sein.',
    })
  }
  // Zahlenrätsel: beide Lösungen gesucht
  const k = rnd(2, 5)
  const x = rnd(2, 10)
  const c = rnd(1, 30)
  const minus = rnd(0, 1) === 0
  const rechts = minus ? k * x * x - c : k * x * x + c
  const fakt = ['', '', 'Das Doppelte', 'Das Dreifache', 'Das Vierfache', 'Das Fünffache'][k]
  const weg: Zeile[] = [{ l: `${k}x^2 ${minus ? '-' : '+'} ${c}`, r: `${rechts}`, u: minus ? `\\mid +${c}` : `\\mid -${c}` }]
  const rest = loeseAb(k, k * x * x, false)
  return fertig({
    tex: '',
    text: `${fakt} des Quadrats einer Zahl ${minus ? 'vermindert' : 'vermehrt'} um ${c} ergibt ${rechts}. Bestimme alle Zahlen, für die das gilt.`,
    ansatz: 'Ansatz: gesuchte Zahl x, ihr Quadrat x²',
    modus: 'zwei',
    loesungen: rest.loesungen,
    runden: false,
    weg: [...weg, ...rest.weg],
    schluss: [{ tex: rest.menge }, { text: `Beide Zahlen erfüllen das Rätsel: ${txt(x)} und ${txt(-x)}.` }],
  })
}

// ---------- Gemischt ----------

export function erzeugeGemischt(stufe: number): Aufgabe {
  const gen = wahl([erzeugeXQuadrat, erzeugeAXQuadrat, erzeugeAXQuadratC, erzeugeAnzahl, erzeugeUmformen])
  const a = gen(stufe)
  // Im gemischten Training immer zuerst die Anzahl der Lösungen angeben
  return { ...a, modus: a.modus === 'sach' ? 'sach' : 'anzahl', schluss: a.schluss.filter((s) => s.tex) }
}

// ---------- Prüfen ----------

/** Eingabe (deutsches Komma, Unicode-Minus) als Zahl, sonst null */
export function leseZahl(s: string): number | null {
  const t = s.replace(/\s/g, '').replace(/−|–/g, '-').replace(',', '.').replace(/^\+/, '')
  if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(t)) return null
  return Number(t)
}

export function gleich(a: number, b: number, runden: boolean): boolean {
  return Math.abs(a - b) <= (runden ? 0.011 : 1e-6)
}
