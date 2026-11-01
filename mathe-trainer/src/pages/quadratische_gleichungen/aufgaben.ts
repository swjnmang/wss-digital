// Aufgaben-Generatoren für „Quadratische Gleichungen“.
// Bewusst NUR reinquadratische Gleichungen (Form ax² = d bzw. ax² + c = d, ggf. nach Termumformung):
// Sie werden durch Umformen nach x² und Wurzelziehen gelöst – nie mit der Lösungsformel (kein Term mit bx).

export type Modus = 'zwei' | 'anzahl'

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
  if (stufe >= 2) {
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
  return erzeugeUmformen(2)
}

// ---------- Thema 6: Satz vom Nullprodukt (ax² + bx = 0) ----------

/** Lösung einer linearen Gleichung p·x + r = 0 als Rechenzeilen (für den zweiten Faktor) */
function linearZeilen(p: number, r: number): { zeilen: Zeile[]; x: number } {
  const x = r6(-r / p)
  const zeilen: Zeile[] = []
  const lin = `${p === 1 ? '' : p === -1 ? '-' : num(p)}x`
  if (p === 1) {
    zeilen.push({ l: 'x_2', r: num(x) })
  } else {
    zeilen.push({ l: lin, r: num(-r), u: teile(p) })
    zeilen.push({ l: 'x_2', r: num(x) })
  }
  return { zeilen, x }
}

/** zweiter Faktor p·x + r als TeX */
function linTerm(p: number, r: number): string {
  const lin = p === 1 ? 'x' : p === -1 ? '-x' : `${num(p)}x`
  return `${lin}${plus(r)}`
}

/** x-Glied b·x als TeX mit Vorzeichen (für ax² + bx) */
function plusX(b: number): string {
  if (b === 1) return ' + x'
  if (b === -1) return ' - x'
  return b > 0 ? ` + ${num(b)}x` : ` - ${num(-b)}x`
}

function nullproduktAufgabe(tex: string, vorZeilen: Zeile[], p: number, r: number): Aufgabe {
  // x · (p·x + r) = 0
  const faktor = `x(${linTerm(p, r)})`
  const lin = linearZeilen(p, r)
  const weg: Zeile[] = [
    ...vorZeilen,
    { l: faktor, r: '0', u: '\\text{Satz vom Nullprodukt}' },
    { l: `x_1 = 0 \\quad \\text{oder} \\quad ${linTerm(p, r)}`, r: '0', u: wegC(r) },
    ...lin.zeilen,
  ]
  const loesungen = [0, lin.x].sort((u, v) => u - v)
  return fertig({
    tex,
    modus: 'zwei',
    loesungen,
    runden: false,
    weg,
    schluss: [{ tex: `\\mathbb{L} = \\{${num(loesungen[0])};\\ ${num(loesungen[1])}\\}` }],
  })
}

export function erzeugeNullprodukt(stufe: number): Aufgabe {
  const nz = (min: number, max: number) => wahl([-1, 1]) * rnd(min, max)
  if (stufe === 1) {
    // schon faktorisiert: x(x + r) = 0 oder k·x(x + r) = 0
    const r = nz(1, 12)
    const k = rnd(0, 2) === 0 ? rnd(2, 5) : 1
    const tex = `${k === 1 ? '' : k}x(x${plus(r)}) = 0`
    const x2 = -r
    const weg: Zeile[] = [
      { l: `${k === 1 ? '' : k}x(x${plus(r)})`, r: '0', u: '\\text{Satz vom Nullprodukt}' },
      { l: `${k === 1 ? 'x_1 = 0' : `${k}x = 0 \;\\Rightarrow\; x_1 = 0`} \\quad \\text{oder} \\quad x${plus(r)}`, r: '0', u: wegC(r) },
      { l: 'x_2', r: num(x2) },
    ]
    const loesungen = [0, x2].sort((u, v) => u - v)
    return fertig({ tex, modus: 'zwei', loesungen, runden: false, weg, schluss: [{ tex: `\\mathbb{L} = \\{${num(loesungen[0])};\\ ${num(loesungen[1])}\\}` }] })
  }
  if (stufe === 2) {
    // x² + bx = 0
    const b = nz(1, 15)
    const tex = `x^2${plusX(b)} = 0`
    return nullproduktAufgabe(tex, [{ l: `x^2${plusX(b)}`, r: '0', u: '\\text{x ausklammern}' }], 1, b)
  }
  if (stufe === 3) {
    // a·x² + b·x = 0, Lösung ganzzahlig oder ,5
    const a = wahl([2, 3, 4, 5, -2, -3])
    const x2 = rnd(0, 3) === 0 ? nz(1, 9) + 0.5 * wahl([-1, 1]) : nz(1, 10)
    const b = r6(-a * x2)
    const tex = `${ax2(a)}${plusX(b)} = 0`
    return nullproduktAufgabe(tex, [{ l: `${ax2(a)}${plusX(b)}`, r: '0', u: '\\text{x ausklammern}' }], a, b)
  }
  // Stufe 4: erst auf eine Seite bringen: a·x² = c·x  bzw.  a·x² + b·x = c·x
  const a = wahl([1, 2, 3, 4, -2])
  const x2 = nz(1, 10)
  const b = r6(-a * x2)
  if (rnd(0, 1) === 0) {
    // a·x² = −b·x
    const c = -b
    const tex = `${ax2(a)} = ${c === 1 ? '' : c === -1 ? '-' : num(c)}x`
    return nullproduktAufgabe(tex, [
      { l: ax2(a), r: `${c === 1 ? '' : c === -1 ? '-' : num(c)}x`, u: c > 0 ? `\\mid -${c === 1 ? '' : num(c)}x` : `\\mid +${c === -1 ? '' : num(-c)}x` },
      { l: `${ax2(a)}${plusX(b)}`, r: '0', u: '\\text{x ausklammern}' },
    ], a, b)
  }
  // a·x² + b1·x = c·x mit b1 − c = b
  const c = nz(1, 9)
  const b1 = r6(b + c)
  const links = `${ax2(a)}${b1 === 0 ? '' : plusX(b1)}`
  const rechts = `${c === 1 ? '' : c === -1 ? '-' : num(c)}x`
  return nullproduktAufgabe(`${links} = ${rechts}`, [
    { l: links, r: rechts, u: c > 0 ? `\\mid -${c === 1 ? '' : num(c)}x` : `\\mid +${c === -1 ? '' : num(-c)}x` },
    { l: `${ax2(a)}${plusX(b)}`, r: '0', u: '\\text{x ausklammern}' },
  ], a, b)
}

// ---------- Gemischt ----------

export function erzeugeGemischt(stufe: number): Aufgabe {
  const gen = wahl([erzeugeXQuadrat, erzeugeAXQuadrat, erzeugeAXQuadratC, erzeugeAnzahl, erzeugeUmformen, erzeugeNullprodukt])
  const a = gen(gen === erzeugeNullprodukt ? stufe + 1 : stufe)
  // Im gemischten Training immer zuerst die Anzahl der Lösungen angeben
  return { ...a, modus: 'anzahl', schluss: a.schluss.filter((s) => s.tex) }
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
