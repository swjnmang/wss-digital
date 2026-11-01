// Aufgaben-Generatoren für „Quadratische Gleichungen“.
// Nur Gleichungen, die ohne Lösungsformel und ohne binomische Formeln lösbar sind:
// - reinquadratisch (a·v² + c = d, ggf. nach Termumformung): nach v² auflösen, Wurzel ziehen
// - a·v² + b·v = 0: v ausklammern, Satz vom Nullprodukt
// Stufe 1 eines Themas folgt immer demselben Grundschema (Variable x). Ab Stufe 2 wechseln Schreibweisen
// (Seiten getauscht, Zahl vorne, „= 0“, Brüche, Klammern) und Variablen, damit die SuS nicht nur ein Muster abarbeiten.

export type Modus = 'zwei' | 'anzahl'

export interface Zeile {
  l: string
  r: string
  /** Äquivalenzumformung rechts, z. B. '\\mid -3' */
  u?: string
}

export interface Aufgabe {
  id: string
  /** Gleichung in TeX */
  tex: string
  /** Variable der Gleichung (Standard x) */
  v?: string
  /** optionaler Aufgabentext und Ansatz (derzeit ungenutzt) */
  text?: string
  ansatz?: string
  frage?: string
  einheit?: string
  modus: Modus
  /** Lösungen aufsteigend: [] keine, [w] eine, [w1, w2] zwei */
  loesungen: number[]
  /** Ergebnisse auf zwei Nachkommastellen gerundet */
  runden: boolean
  /** Rechenweg mit Äquivalenzumformungen */
  weg: Zeile[]
  /** Text- oder TeX-Zeilen nach der Rechnung (Lösungsmenge, Begründung) */
  schluss: { tex?: string; text?: string }[]
}

// ---------- Hilfsfunktionen ----------

let zaehler = 0
const neueId = () => `q${Date.now().toString(36)}${(zaehler++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
export const wahl = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const r6 = (n: number) => Math.round(n * 1e6) / 1e6
const r2 = (n: number) => Math.round(n * 100) / 100
const vz = () => wahl([-1, 1])
const nz = (min: number, max: number) => vz() * rnd(min, max)

const QUADRATE = new Set(Array.from({ length: 41 }, (_, i) => i * i))

/** Variable ab Stufe 2: meist x, oft aber auch andere Buchstaben */
const VARIABLEN = ['x', 'x', 'z', 'a', 't', 'u', 'r', 's', 'k'] as const
const variable = () => wahl(VARIABLEN)

/** Zahl als TeX mit deutschem Dezimalkomma */
export function num(n: number): string {
  return String(r6(n)).replace('.', '{,}')
}
/** Zahl als Text mit deutschem Dezimalkomma (für Fließtext) */
export function txt(n: number): string {
  return String(r6(n)).replace('-', '−').replace('.', ',')
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
 * Koeffizient vor v²: als Dezimalzahl (3x², −0,5x²) oder als Bruch (½x² bzw. x²/4).
 * Bei Brüchen ist a = ±1/K.
 */
type Stil = 'dez' | 'bruch1' | 'bruchV'
interface Koef {
  a: number
  stil: Stil
}
const dez = (a: number): Koef => ({ a, stil: 'dez' })
const bruchNenner = (k: Koef) => Math.round(1 / Math.abs(k.a))

/** a·v² als TeX (mit Vorzeichen) */
function koefTex(k: Koef, v: string): string {
  const minus = k.a < 0 ? '-' : ''
  if (k.stil === 'bruch1') return `${minus}\\frac{1}{${bruchNenner(k)}}${v}^2`
  if (k.stil === 'bruchV') return `${minus}\\frac{${v}^2}{${bruchNenner(k)}}`
  if (k.a === 1) return `${v}^2`
  if (k.a === -1) return `-${v}^2`
  return `${num(k.a)}${v}^2`
}
/** a·v² mit Rechenzeichen davor, z. B. „ + 3x^2“ */
function plusKoef(k: Koef, v: string): string {
  return k.a < 0 ? ` - ${koefTex({ ...k, a: -k.a }, v)}` : ` + ${koefTex(k, v)}`
}
/** Umformung, die den Koeffizienten vor v² beseitigt (null, wenn a = 1) */
function koefSchritt(k: Koef): string | null {
  if (k.stil !== 'dez') {
    const n = bruchNenner(k)
    return k.a > 0 ? `\\mid \\cdot ${n}` : `\\mid \\cdot (-${n})`
  }
  return k.a === 1 ? null : teile(k.a)
}

/**
 * Schritte ab „a·v² = d“ bis zu den Lösungen (Wurzelziehen). Ergebnisse, die keine glatten Zahlen sind,
 * werden auf zwei Nachkommastellen gerundet.
 */
function loeseAb(k: Koef, d: number, v: string): { weg: Zeile[]; loesungen: number[]; menge: string } {
  const weg: Zeile[] = []
  const q = r6(d / k.a)
  const schritt = koefSchritt(k)
  if (schritt) weg.push({ l: koefTex(k, v), r: num(d), u: schritt })
  weg.push({ l: `${v}^2`, r: num(q) })
  const letzte = weg[weg.length - 1]
  if (q < 0) {
    letzte.u = '\\text{kein Wurzelziehen möglich}'
    return { weg, loesungen: [], menge: '\\mathbb{L} = \\{\\,\\}' }
  }
  letzte.u = '\\mid \\sqrt{\\phantom{x}}'
  if (q === 0) {
    weg.push({ l: v, r: '0' })
    return { weg, loesungen: [0], menge: '\\mathbb{L} = \\{0\\}' }
  }
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
function nichtQuadrat(min: number, max: number, teiler = 1): number {
  let q = rnd(min, max)
  for (let i = 0; i < 200 && (QUADRATE.has(q) || q % teiler !== 0); i++) q = rnd(min, max)
  return q
}
/** Quadratzahl n² (n zwischen min und max), die durch teiler teilbar ist */
function quadrat(min: number, max: number, teiler = 1): number {
  let n = rnd(min, max)
  for (let i = 0; i < 200 && (n * n) % teiler !== 0; i++) n = rnd(min, max)
  return n * n
}

/**
 * Schreibweisen für a·v² + c = d:
 * std    a·v² + c = d
 * tausch d = a·v² + c
 * cvorn  c + a·v² = d   (z. B. 50 − 2x² = 18)
 */
type Form = 'std' | 'tausch' | 'cvorn'

interface Teil {
  tex: string
  weg: Zeile[]
  loesungen: number[]
  menge: string
}

/** Gleichung a·v² + c = (a·q + c) in der gewünschten Schreibweise mit vollständigem Rechenweg */
function gleichung(k: Koef, c: number, q: number, v: string, form: Form): Teil {
  const d = r6(k.a * q + c)
  const links = form === 'cvorn' && c !== 0 ? `${num(c)}${plusKoef(k, v)}` : `${koefTex(k, v)}${plus(c)}`
  const tex = form === 'tausch' ? `${num(d)} = ${links}` : `${links} = ${num(d)}`
  const weg: Zeile[] = []
  if (form === 'tausch') weg.push({ l: num(d), r: links, u: '\\text{Seiten tauschen}' })
  if (c !== 0) weg.push({ l: links, r: num(d), u: wegC(c) })
  const rest = loeseAb(k, r6(d - c), v)
  return { tex, weg: [...weg, ...rest.weg], loesungen: rest.loesungen, menge: rest.menge }
}

function ausTeil(t: Teil, v: string, modus: Modus, runden: boolean, extra: { text: string }[] = []): Aufgabe {
  return fertig({ tex: t.tex, v, modus, loesungen: t.loesungen, runden, weg: t.weg, schluss: [{ tex: t.menge }, ...extra] })
}

/** Koeffizient für Stufe 2/3: negativ, Dezimalzahl oder Bruch */
function bunterKoef(mitBruch: boolean): Koef {
  // ganzzahlig positiv (wie in Stufe 1) nur selten
  const art = rnd(0, mitBruch ? 6 : 4)
  if (art <= 1) return dez(-rnd(1, 5))
  if (art <= 3) return dez(wahl([0.5, 1.5, 2.5, 0.2, -0.5, 0.25]))
  if (art === 4) return dez(rnd(2, 9))
  return { a: vz() * (1 / wahl([2, 3, 4, 5])), stil: wahl(['bruch1', 'bruchV'] as const) }
}
/** Bei Bruch-Koeffizienten muss q durch den Nenner teilbar sein, damit rechts eine ganze Zahl steht */
const teilerVon = (k: Koef) => (k.stil === 'dez' ? 1 : bruchNenner(k))
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

// ---------- Thema 1: x² = d ----------

export function erzeugeXQuadrat(stufe: number): Aufgabe {
  if (stufe === 1) {
    // Grundschema: x² = n²
    return ausTeil(gleichung(dez(1), 0, rnd(1, 15) ** 2, 'x', 'std'), 'x', 'zwei', false)
  }
  const v = variable()
  if (stufe === 2) {
    const art = rnd(0, 5)
    if (art === 0) {
      // Bruch rechts: v² = 9/16
      const n = wahl([2, 4, 5, 10])
      let z = rnd(1, n - 1)
      while (gcd(z, n) !== 1) z = rnd(1, n - 1)
      const w = z / n
      return fertig({
        tex: `${v}^2 = \\frac{${z * z}}{${n * n}}`,
        v,
        modus: 'zwei',
        loesungen: [-w, w],
        runden: false,
        weg: [
          { l: `${v}^2`, r: `\\frac{${z * z}}{${n * n}}`, u: '\\mid \\sqrt{\\phantom{x}}' },
          { l: `${v}_1`, r: `\\sqrt{\\frac{${z * z}}{${n * n}}} = \\frac{${z}}{${n}} = ${num(w)}` },
          { l: `${v}_2`, r: `-\\frac{${z}}{${n}} = ${num(-w)}` },
        ],
        schluss: [{ tex: `\\mathbb{L} = \\{${num(-w)};\\ ${num(w)}\\}` }],
      })
    }
    const q = art === 1 ? r6((rnd(1, 12) / 10) ** 2) : art === 2 ? rnd(16, 25) ** 2 : rnd(1, 15) ** 2
    // Schreibweisen: Seiten getauscht, „− d = 0“, Zahl vorne
    const form = wahl(['std', 'tausch', 'null', 'cvorn'] as const)
    if (form === 'null' || form === 'cvorn') return ausTeil(gleichung(dez(1), -q, q, v, form === 'null' ? 'std' : 'cvorn'), v, 'zwei', false)
    return ausTeil(gleichung(dez(1), 0, q, v, form), v, 'zwei', false)
  }
  // Stufe 3: Runden, gemischte Schreibweisen
  const q = rnd(0, 3) === 0 ? r6(nichtQuadrat(2, 99) / 10) : nichtQuadrat(2, 150)
  const form = wahl(['std', 'tausch', 'null', 'cvorn'] as const)
  const c = form === 'null' || form === 'cvorn' ? -q : 0
  return ausTeil(gleichung(dez(1), c, q, v, form === 'null' ? 'std' : form), v, 'zwei', true)
}

// ---------- Thema 2: a·x² = d ----------

export function erzeugeAXQuadrat(stufe: number): Aufgabe {
  if (stufe === 1) {
    // Grundschema: a·x² = d, a positiv und ganzzahlig
    return ausTeil(gleichung(dez(rnd(2, 9)), 0, rnd(1, 10) ** 2, 'x', 'std'), 'x', 'zwei', false)
  }
  const v = variable()
  const k = bunterKoef(true)
  const form = wahl(['std', 'tausch', 'tausch'] as const)
  if (stufe === 2) {
    const q = quadrat(1, 12, teilerVon(k))
    return ausTeil(gleichung(k, 0, q, v, form), v, 'zwei', false)
  }
  const q = nichtQuadrat(2, 60, teilerVon(k))
  return ausTeil(gleichung(k, 0, q, v, form), v, 'zwei', true)
}

// ---------- Thema 3: a·x² + c = d ----------

export function erzeugeAXQuadratC(stufe: number): Aufgabe {
  if (stufe === 1) {
    // Grundschema: x² + c = d
    const q = rnd(1, 12) ** 2
    const c = rnd(0, 3) === 0 ? -q : nz(1, 30)
    return ausTeil(gleichung(dez(1), c, q, 'x', 'std'), 'x', 'zwei', false)
  }
  const v = variable()
  const form = wahl(['std', 'tausch', 'cvorn', 'cvorn'] as const)
  if (stufe === 2) {
    const k = rnd(0, 2) === 0 ? dez(-rnd(1, 4)) : dez(rnd(1, 6))
    const q = rnd(1, 10) ** 2
    // „= 0“ oder beliebige rechte Seite
    const c = rnd(0, 3) === 0 ? r6(-k.a * q) : nz(1, 40)
    return ausTeil(gleichung(k, c, q, v, form), v, 'zwei', false)
  }
  // Stufe 3: Brüche, Dezimalzahlen, Runden
  const k = bunterKoef(true)
  const runden = rnd(0, 1) === 0
  const q = runden ? nichtQuadrat(2, 60, teilerVon(k)) : quadrat(1, 12, teilerVon(k))
  const c = rnd(0, 3) === 0 ? r6(-k.a * q) : nz(1, 50)
  return ausTeil(gleichung(k, c, q, v, form), v, 'zwei', runden)
}

// ---------- Thema 4: Anzahl der Lösungen ----------

function anzahlSatz(q: number): { text: string }[] {
  if (q > 0) return [{ text: `Nach dem Umformen steht rechts eine positive Zahl (${txt(q)}) → zwei Lösungen.` }]
  if (q === 0) return [{ text: 'Nach dem Umformen steht rechts 0 → genau eine Lösung.' }]
  return [{ text: `Nach dem Umformen steht rechts eine negative Zahl (${txt(q)}). Kein Quadrat ist negativ → keine Lösung.` }]
}

export function erzeugeAnzahl(stufe: number): Aufgabe {
  const fall = wahl(['zwei', 'eine', 'keine', 'zwei', 'keine'] as const)
  const q = fall === 'zwei' ? rnd(1, 12) ** 2 : fall === 'eine' ? 0 : -(rnd(1, 12) ** 2)
  if (stufe === 1) {
    // Grundschema: a·x² = d
    const k = dez(rnd(0, 1) === 0 ? 1 : rnd(2, 5))
    return ausTeil(gleichung(k, 0, q, 'x', 'std'), 'x', 'anzahl', false, anzahlSatz(q))
  }
  const v = variable()
  const k = rnd(0, 3) === 0 ? bunterKoef(false) : dez(wahl([1, 2, 3, 4, -1, -2, -3]))
  // Bei Brüchen q·K²: bleibt eine Quadratzahl, und a·q ist ganzzahlig
  const qq = q * teilerVon(k) ** 2
  let c = nz(1, 40)
  if (r6(k.a * qq + c) === 0) c += 1
  return ausTeil(gleichung(k, c, qq, v, wahl(['std', 'tausch', 'cvorn'] as const)), v, 'anzahl', false, anzahlSatz(qq))
}

// ---------- Thema 5: Erst umformen (Termumformungen, ohne binomische Formeln) ----------

/** Rechenweg ab „A·v² + C = D“ (danach wie gewohnt) */
function abschluss(A: number, C: number, D: number, v: string): { weg: Zeile[]; loesungen: number[]; menge: string } {
  const k = dez(A)
  const weg: Zeile[] = C !== 0 ? [{ l: `${koefTex(k, v)}${plus(C)}`, r: num(D), u: wegC(C) }] : []
  const rest = loeseAb(k, r6(D - C), v)
  return { weg: [...weg, ...rest.weg], loesungen: rest.loesungen, menge: rest.menge }
}

const klammer = (k: number, m: number, v: string) => `${k === -1 ? '-' : k === 1 ? '' : num(k)}(${v}^2${plus(m)})`
const minusV2 = (s: number, v: string) => (s > 0 ? `\\mid -${koefTex(dez(s), v)}` : `\\mid +${koefTex(dez(-s), v)}`)

export function erzeugeUmformen(stufe: number): Aufgabe {
  const qWahl = () => (rnd(0, 5) === 0 ? -(rnd(1, 6) ** 2) : rnd(0, 7) === 0 ? 0 : rnd(1, 10) ** 2)
  const q = qWahl()
  const mk = (tex: string, v: string, vor: Zeile[], A: number, C: number, D: number) => {
    const r = abschluss(A, C, D, v)
    return fertig({ tex, v, modus: 'anzahl', loesungen: r.loesungen, runden: false, weg: [...vor, ...r.weg], schluss: [{ tex: r.menge }] })
  }

  if (stufe === 1) {
    // Grundschema: p·x² + c1 = s·x² + c2 mit p > s
    const s = rnd(1, 4)
    const A = rnd(1, 4)
    const c1 = nz(1, 20)
    const c2 = r6(A * q + c1)
    const links = `${koefTex(dez(s + A), 'x')}${plus(c1)}`
    const rechts = `${koefTex(dez(s), 'x')}${plus(c2)}`
    return mk(`${links} = ${rechts}`, 'x', [{ l: links, r: rechts, u: minusV2(s, 'x') }], A, c1, c2)
  }

  const v = variable()
  const art = stufe === 2 ? wahl(['rechtsMehr', 'klammerLinks', 'klammerRechts', 'klammerZahl'] as const) : wahl(['zweiKlammern', 'klammerMinus', 'klammerPlusN', 'klammerLinks'] as const)

  if (art === 'rechtsMehr') {
    // mehr v² rechts als links: 2x² + 5 = 5x² − 22
    const p = rnd(1, 4)
    const s = p + rnd(1, 3)
    const A = p - s
    const c1 = nz(1, 20)
    const c2 = r6(A * q + c1)
    const links = `${koefTex(dez(p), v)}${plus(c1)}`
    const rechts = `${koefTex(dez(s), v)}${plus(c2)}`
    return mk(`${links} = ${rechts}`, v, [{ l: links, r: rechts, u: minusV2(s, v) }], A, c1, c2)
  }
  if (art === 'klammerLinks') {
    // k(v² + m) = s·v² + c2
    const k = stufe === 3 ? -rnd(2, 4) : rnd(2, 5)
    const s = stufe === 3 ? -rnd(5, 8) : rnd(1, k - 1)
    const A = k - s
    const m = nz(1, 9)
    const c2 = r6(A * q + k * m)
    const links = klammer(k, m, v)
    const rechts = `${koefTex(dez(s), v)}${plus(c2)}`
    return mk(`${links} = ${rechts}`, v, [
      { l: links, r: rechts, u: '\\text{Klammer auflösen}' },
      { l: `${koefTex(dez(k), v)}${plus(k * m)}`, r: rechts, u: minusV2(s, v) },
    ], A, k * m, c2)
  }
  if (art === 'klammerRechts') {
    // s·v² + c2 = k(v² + m)
    const k = rnd(2, 5)
    const s = k + rnd(1, 3)
    const A = s - k
    const m = nz(1, 9)
    const c2 = r6(k * m - A * q)
    const links = `${koefTex(dez(s), v)}${plus(c2)}`
    const rechts = klammer(k, m, v)
    return mk(`${links} = ${rechts}`, v, [
      { l: links, r: rechts, u: '\\text{Klammer auflösen}' },
      { l: links, r: `${koefTex(dez(k), v)}${plus(k * m)}`, u: minusV2(k, v) },
    ], A, c2, k * m)
  }
  if (art === 'klammerZahl') {
    // k(v² + m) = D
    const k = wahl([2, 3, 4, 5, -2, -3])
    const m = nz(1, 9)
    const D = r6(k * q + k * m)
    const links = klammer(k, m, v)
    return mk(`${links} = ${num(D)}`, v, [{ l: links, r: num(D), u: '\\text{Klammer auflösen}' }], k, k * m, D)
  }
  if (art === 'zweiKlammern') {
    // k1(v² + m1) = k2(v² + m2) + n
    const k2 = rnd(1, 4)
    const k1 = k2 + wahl([-2, -1, 1, 2, 3].filter((x) => k2 + x >= 1))
    const m1 = nz(1, 8)
    const m2 = nz(1, 8)
    const A = k1 - k2
    const D = r6(A * q + k1 * m1)
    const n = r6(D - k2 * m2)
    const links = klammer(k1, m1, v)
    const rechts = `${klammer(k2, m2, v)}${plus(n)}`
    return mk(`${links} = ${rechts}`, v, [
      { l: links, r: rechts, u: '\\text{Klammern auflösen}' },
      { l: `${koefTex(dez(k1), v)}${plus(k1 * m1)}`, r: `${koefTex(dez(k2), v)}${plus(k2 * m2)}${plus(n)}`, u: '\\text{zusammenfassen}' },
      { l: `${koefTex(dez(k1), v)}${plus(k1 * m1)}`, r: `${koefTex(dez(k2), v)}${plus(D)}`, u: minusV2(k2, v) },
    ], A, k1 * m1, D)
  }
  if (art === 'klammerMinus') {
    // k1(v² + m1) − k2(v² + m2) = D
    const k2 = rnd(1, 4)
    const k1 = k2 + wahl([-2, -1, 1, 2, 3].filter((x) => k2 + x >= 1))
    const m1 = nz(1, 8)
    const m2 = nz(1, 8)
    const A = k1 - k2
    const C = r6(k1 * m1 - k2 * m2)
    const D = r6(A * q + C)
    const links = `${klammer(k1, m1, v)} - ${klammer(k2, m2, v)}`
    const aufgeloest = `${koefTex(dez(k1), v)}${plus(k1 * m1)} - ${koefTex(dez(k2), v)}${plus(-k2 * m2)}`
    return mk(`${links} = ${num(D)}`, v, [
      { l: links, r: num(D), u: '\\text{Klammern auflösen (Minus vor der Klammer!)}' },
      { l: aufgeloest, r: num(D), u: '\\text{zusammenfassen}' },
    ], A, C, D)
  }
  // klammerPlusN: n + k(v² + m) = s·v² + c2
  const k = rnd(2, 5)
  const s = rnd(1, k - 1)
  const A = k - s
  const m = nz(1, 9)
  const n = nz(1, 15)
  const C = k * m + n
  const c2 = r6(A * q + C)
  const links = `${num(n)} + ${klammer(k, m, v)}`
  const rechts = `${koefTex(dez(s), v)}${plus(c2)}`
  return mk(`${links} = ${rechts}`, v, [
    { l: links, r: rechts, u: '\\text{Klammer auflösen}' },
    { l: `${num(n)}${plus(k * m)} + ${koefTex(dez(k), v)}`, r: rechts, u: '\\text{zusammenfassen}' },
    { l: `${koefTex(dez(k), v)}${plus(C)}`, r: rechts, u: minusV2(s, v) },
  ], A, C, c2)
}

// ---------- Thema 6: Satz vom Nullprodukt (a·v² + b·v = 0) ----------

/** p·v als TeX (mit Vorzeichen) */
function vTerm(p: number, v: string): string {
  return p === 1 ? v : p === -1 ? `-${v}` : `${num(p)}${v}`
}
/** + p·v als TeX */
function plusV(p: number, v: string): string {
  return p < 0 ? ` - ${vTerm(-p, v)}` : ` + ${vTerm(p, v)}`
}

/**
 * Rechenweg ab „a·v² + b·v = 0“: v ausklammern, Satz vom Nullprodukt, zweiten Faktor nach v auflösen.
 */
function nullproduktAufgabe(tex: string, v: string, vorZeilen: Zeile[], a: number, b: number, mitAusklammern = true): Aufgabe {
  const linTerm = `${vTerm(a, v)}${plus(b)}`
  const x2 = r6(-b / a)
  const weg: Zeile[] = [...vorZeilen]
  if (mitAusklammern) weg.push({ l: `${koefTex(dez(a), v)}${plusV(b, v)}`, r: '0', u: `${v}\\text{ ausklammern}` })
  weg.push({ l: `${v}(${linTerm})`, r: '0', u: '\\text{Satz vom Nullprodukt}' })
  weg.push({ l: `${v}_1 = 0 \\quad \\text{oder} \\quad ${linTerm}`, r: '0', u: wegC(b) })
  if (a !== 1) weg.push({ l: vTerm(a, v), r: num(-b), u: teile(a) })
  weg.push({ l: `${v}_2`, r: num(x2) })
  const loesungen = [0, x2].sort((u, w) => u - w)
  return fertig({
    tex,
    v,
    modus: 'zwei',
    loesungen,
    runden: false,
    weg,
    schluss: [{ tex: `\\mathbb{L} = \\{${num(loesungen[0])};\\ ${num(loesungen[1])}\\}` }],
  })
}

export function erzeugeNullprodukt(stufe: number): Aufgabe {
  if (stufe === 1) {
    // Grundschema: x(x + r) = 0 – schon ausgeklammert
    const r = nz(1, 12)
    return nullproduktAufgabe(`x(x${plus(r)}) = 0`, 'x', [], 1, r, false)
  }
  const v = variable()
  if (stufe === 2 || stufe === 3) {
    // Stufe 2: v² + b·v = 0, Stufe 3: a·v² + b·v = 0 – in verschiedenen Reihenfolgen
    const a = stufe === 2 ? 1 : wahl([2, 3, 4, 5, -1, -2, -3])
    const x2 = stufe === 2 ? nz(1, 15) : rnd(0, 3) === 0 ? nz(1, 9) + 0.5 * vz() : nz(1, 10)
    const b = r6(-a * x2)
    const std = `${koefTex(dez(a), v)}${plusV(b, v)}`
    const form = wahl(['std', 'vorn', 'tausch'] as const)
    if (form === 'std') return nullproduktAufgabe(`${std} = 0`, v, [], a, b)
    if (form === 'tausch') return nullproduktAufgabe(`0 = ${std}`, v, [{ l: '0', r: std, u: '\\text{Seiten tauschen}' }], a, b)
    const vorn = `${vTerm(b, v)}${plusKoef(dez(a), v)}`
    return nullproduktAufgabe(`${vorn} = 0`, v, [{ l: vorn, r: '0', u: '\\text{ordnen}' }], a, b)
  }
  // Stufe 4: erst alles auf eine Seite bringen
  const a = wahl([1, 2, 3, 4, -2])
  const x2 = nz(1, 10)
  const b = r6(-a * x2)
  const art = wahl(['rechtsV', 'linksV', 'beideV', 'mitZahl'] as const)
  const wegV = (c: number) => (c > 0 ? `\\mid -${vTerm(c, v)}` : `\\mid +${vTerm(-c, v)}`)
  if (art === 'rechtsV') {
    // a·v² = c·v
    const c = -b
    const tex = `${koefTex(dez(a), v)} = ${vTerm(c, v)}`
    return nullproduktAufgabe(tex, v, [{ l: koefTex(dez(a), v), r: vTerm(c, v), u: wegV(c) }], a, b)
  }
  if (art === 'linksV') {
    // c·v = a·v²
    const c = -b
    const tex = `${vTerm(c, v)} = ${koefTex(dez(a), v)}`
    return nullproduktAufgabe(tex, v, [
      { l: vTerm(c, v), r: koefTex(dez(a), v), u: '\\text{Seiten tauschen}' },
      { l: koefTex(dez(a), v), r: vTerm(c, v), u: wegV(c) },
    ], a, b)
  }
  const c = nz(1, 9)
  const b1 = r6(b + c)
  const links = `${koefTex(dez(a), v)}${b1 === 0 ? '' : plusV(b1, v)}`
  if (art === 'beideV') {
    // a·v² + b1·v = c·v
    return nullproduktAufgabe(`${links} = ${vTerm(c, v)}`, v, [{ l: links, r: vTerm(c, v), u: wegV(c) }], a, b)
  }
  // a·v² + b1·v + n = c·v + n  (die Zahlen heben sich auf)
  const n = nz(1, 20)
  const l2 = `${links}${plus(n)}`
  const r2t = `${vTerm(c, v)}${plus(n)}`
  return nullproduktAufgabe(`${l2} = ${r2t}`, v, [
    { l: l2, r: r2t, u: wegC(n) },
    { l: links, r: vTerm(c, v), u: wegV(c) },
  ], a, b)
}

// ---------- Gemischt ----------

export function erzeugeGemischt(stufe: number): Aufgabe {
  const gen = wahl([erzeugeXQuadrat, erzeugeAXQuadrat, erzeugeAXQuadratC, erzeugeAnzahl, erzeugeUmformen, erzeugeNullprodukt])
  // In den gemischten Übungen ab Stufe 2 der Themen, damit die Schreibweisen wechseln
  const a = gen(gen === erzeugeNullprodukt ? Math.min(4, stufe + 1) : Math.min(3, stufe + 1))
  // Immer zuerst die Anzahl der Lösungen angeben
  return { ...a, modus: 'anzahl', schluss: a.schluss.filter((s) => s.tex) }
}

// ---------- Prüfen ----------

/** Eingabe (deutsches Komma, Unicode-Minus, auch Bruch wie 3/4) als Zahl, sonst null */
export function leseZahl(s: string): number | null {
  const t = s.replace(/\s/g, '').replace(/−|–/g, '-').replace(/,/g, '.').replace(/^\+/, '')
  const bruch = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t)
  if (bruch) {
    const nenner = Number(bruch[2])
    return nenner === 0 ? null : Number(bruch[1]) / nenner
  }
  if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(t)) return null
  return Number(t)
}

export function gleich(a: number, b: number, runden: boolean): boolean {
  return Math.abs(a - b) <= (runden ? 0.011 : 1e-6)
}
