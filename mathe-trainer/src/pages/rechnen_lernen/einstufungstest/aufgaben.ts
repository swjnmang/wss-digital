// Einstufungstest „Rechnen lernen“: Aufgaben-Generatoren und Prüfung.
// 7 Bereiche × 4 Zufallsaufgaben, Taschenrechner erlaubt, ohne quadratische Gleichungen und binomische Formeln.
// Terme und Ausklammern nutzen die vorhandenen Generatoren und Prüfer der Übungsseiten.

import { KATEGORIEN } from '../terme/termAufgaben'
import { checkAnswer, formatPoly, type Poly } from '../terme/termAlgebra'
import { generiereSet as generiereAusklammern, pruefeAntwort as pruefeAusklammern, type Aufgabe as AusklammernAufgabe, type StufeId } from '../ausklammern/ausklammernAufgaben'

export type BereichId = 'terme' | 'ausklammern' | 'brueche' | 'potenzen' | 'wurzeln' | 'prozent' | 'gleichungen'

export interface Link {
  label: string
  to: string
}

export interface Bereich {
  id: BereichId
  name: string
  /** Übungen, mit denen die SuS Lücken schließen */
  links: Link[]
}

export const BEREICHE: Bereich[] = [
  { id: 'terme', name: 'Terme', links: [{ label: 'Terme', to: '/rechnen_lernen/terme' }] },
  { id: 'ausklammern', name: 'Ausklammern', links: [{ label: 'Ausklammern / Faktorisieren', to: '/rechnen_lernen/ausklammern' }] },
  { id: 'brueche', name: 'Brüche', links: [{ label: 'Brüche', to: '/rechnen_lernen/brueche' }] },
  { id: 'potenzen', name: 'Potenzen', links: [{ label: 'Potenzen', to: '/rechnen_lernen/potenzen' }] },
  { id: 'wurzeln', name: 'Wurzeln', links: [{ label: 'Wurzeln', to: '/rechnen_lernen/wurzeln/wurzeln' }] },
  { id: 'prozent', name: 'Prozentrechnung', links: [{ label: 'Grundlagen der Prozentrechnung', to: '/rechnen_lernen/prozentrechnung/prozentrechnung' }] },
  {
    id: 'gleichungen',
    name: 'Gleichungen',
    links: [
      { label: 'Lineare Gleichungen', to: '/rechnen_lernen/gleichungen/generator_lineare' },
      { label: 'Bruchgleichungen', to: '/rechnen_lernen/gleichungen/bruchgleichungen' },
    ],
  },
]

export const AUFGABEN_JE_BEREICH = 4
export const DAUER_MINUTEN = 45

/** Art der Eingabe und wie sie geprüft wird */
export type Feld =
  | { art: 'zahl'; soll: number; toleranz: number; label?: string; einheit?: string; loesung: string }
  | { art: 'bruch'; z: number; n: number; label?: string; loesung: string }
  | { art: 'term'; soll: Poly; label?: string; loesung: string; loesungTex?: string }
  | { art: 'ausklammern'; aufgabe: AusklammernAufgabe; label?: string; loesung: string; loesungTex?: string }

export interface TestAufgabe {
  id: string
  bereich: BereichId
  /** Arbeitsauftrag */
  frage: string
  /** Aufgabe als KaTeX (optional) */
  tex?: string
  /** Aufgabe als Text (z. B. Textaufgabe oder Term der Term-Generatoren) */
  text?: string
  /** Eingabehinweis unter dem Feld */
  hinweis?: string
  feld: Feld
  /** passende Übung zum Lücken schließen */
  uebung: Link
}

// ---------- Hilfen ----------

let zaehler = 0
const id = () => `e${Date.now().toString(36)}${(zaehler++).toString(36)}${Math.random().toString(36).slice(2, 5)}`
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const wahl = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const r6 = (n: number) => Math.round(n * 1e6) / 1e6
const r2 = (n: number) => Math.round(n * 100) / 100
const ggT = (a: number, b: number): number => (b === 0 ? Math.abs(a) : ggT(b, a % b))

/** Zahl in deutscher Schreibweise (Text) */
export function zahlText(n: number, nk?: number): string {
  const s = nk === undefined ? String(r6(n)) : n.toFixed(nk)
  const [ganz, dez] = s.replace('-', '').split('.')
  const mitPunkt = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${n < 0 ? '−' : ''}${mitPunkt}${dez ? ',' + dez : ''}`
}
/** Zahl als TeX mit Dezimalkomma */
const tz = (n: number) => String(r6(n)).replace('.', '{,}')
const euro = (n: number) => `${zahlText(n, 2)} €`

/** gekürzter Bruch */
function kuerze(z: number, n: number): [number, number] {
  if (n < 0) {
    z = -z
    n = -n
  }
  const g = ggT(Math.abs(z), n) || 1
  return [z / g, n / g]
}
const bruchTex = (z: number, n: number) => (n === 1 ? `${z}` : `${z < 0 ? '-' : ''}\\frac{${Math.abs(z)}}{${n}}`)
const bruchText = (z: number, n: number) => (n === 1 ? `${z}`.replace('-', '−') : `${z}/${n}`.replace('-', '−'))

function bruchFeld(z: number, n: number): Feld {
  const [kz, kn] = kuerze(z, n)
  return { art: 'bruch', z: kz, n: kn, loesung: bruchText(kz, kn) }
}
const BRUCH_HINWEIS = 'Ergebnis als vollständig gekürzten Bruch eingeben, z. B. 3/4 oder −5/2 (ganze Zahlen ohne Bruchstrich).'

// ---------- Terme (vorhandene Generatoren) ----------

function termAufgabe(kategorie: string, stufe: number, uebung: Link): TestAufgabe {
  const kat = KATEGORIEN.find((k) => k.name === kategorie)!
  let t = kat.stufen[stufe - 1].generate()
  for (let i = 0; i < 20 && t.format !== 'eingabe'; i++) t = kat.stufen[stufe - 1].generate()
  return {
    id: id(),
    bereich: 'terme',
    frage: 'Vereinfache den Term so weit wie möglich.',
    text: t.ausdruck,
    hinweis: 'Potenzen als x^2 oder x², das Malzeichen kannst du weglassen.',
    feld: { art: 'term', soll: t.expected, loesung: formatPoly(t.expected) },
    uebung,
  }
}

function terme(): TestAufgabe[] {
  const u = { label: 'Terme zusammenfassen', to: '/rechnen_lernen/terme' }
  return [
    termAufgabe('Terme vereinfachen', 4, u),
    termAufgabe('Multiplizieren & Dividieren', wahl([3, 4]), u),
    termAufgabe('Klammern auflösen', wahl([2, 3]), u),
    termAufgabe('Distributivgesetz', wahl([1, 2]), u),
  ]
}

// ---------- Ausklammern (vorhandener Generator) ----------

function ausklammern(): TestAufgabe[] {
  return ([1, 2, 3, 4] as StufeId[]).map((st) => {
    const a = generiereAusklammern(st, 1)[0]
    return {
      id: id(),
      bereich: 'ausklammern' as const,
      frage: st === 4 ? 'Klammere den gemeinsamen Faktor (die Klammer) aus.' : 'Klammere so viel wie möglich aus.',
      tex: a.aufgabeTex,
      hinweis: 'Z. B. 3x(2x+5) oder (a+2)(3x+5).',
      feld: { art: 'ausklammern', aufgabe: a, loesung: texZuText(a.loesungTex.split(' = ')[0]), loesungTex: a.loesungTex.split(' = ')[0] },
      uebung: { label: 'Ausklammern / Faktorisieren', to: '/rechnen_lernen/ausklammern' },
    }
  })
}

// ---------- Brüche ----------

function bruch(): [number, number] {
  const n = rnd(2, 12)
  let z = rnd(1, n - 1)
  while (ggT(z, n) !== 1) z = rnd(1, n - 1)
  return [z, n]
}

function brueche(): TestAufgabe[] {
  const out: TestAufgabe[] = []
  // 1) Kürzen
  {
    const [z, n] = bruch()
    const k = rnd(6, 24)
    out.push({
      id: id(), bereich: 'brueche', frage: 'Kürze den Bruch vollständig.', tex: `\\frac{${z * k}}{${n * k}}`,
      hinweis: BRUCH_HINWEIS, feld: bruchFeld(z, n), uebung: { label: 'Kürzen und Erweitern', to: '/rechnen_lernen/brueche/kuerzenerweitern' },
    })
  }
  // 2) Addieren / Subtrahieren mit verschiedenen Nennern
  {
    let [a, b] = bruch()
    let [c, d] = bruch()
    while (b === d) [c, d] = bruch()
    const minus = rnd(0, 1) === 0
    if (minus && a / b < c / d) [a, b, c, d] = [c, d, a, b]
    out.push({
      id: id(), bereich: 'brueche', frage: 'Berechne.', tex: `\\frac{${a}}{${b}} ${minus ? '-' : '+'} \\frac{${c}}{${d}}`,
      hinweis: BRUCH_HINWEIS, feld: bruchFeld(minus ? a * d - c * b : a * d + c * b, b * d),
      uebung: { label: 'Brüche addieren und subtrahieren', to: '/rechnen_lernen/brueche/addierensubtrahieren' },
    })
  }
  // 3) Multiplizieren mit gemischter Zahl
  {
    const g = rnd(1, 4)
    const [a, b] = bruch()
    const [c, d] = bruch()
    out.push({
      id: id(), bereich: 'brueche', frage: 'Berechne.', tex: `${g}\\frac{${a}}{${b}} \\cdot \\frac{${c}}{${d}}`,
      hinweis: BRUCH_HINWEIS, feld: bruchFeld((g * b + a) * c, b * d),
      uebung: { label: 'Brüche multiplizieren und dividieren', to: '/rechnen_lernen/brueche/multiplizierendividieren' },
    })
  }
  // 4) Klammer und Division
  {
    const [a, b] = bruch()
    let [c, d] = bruch()
    while (b === d) [c, d] = bruch()
    const [e, f] = bruch()
    // (a/b + c/d) : e/f = (ad + cb)/(bd) · f/e
    out.push({
      id: id(), bereich: 'brueche', frage: 'Berechne.', tex: `\\left(\\frac{${a}}{${b}} + \\frac{${c}}{${d}}\\right) : \\frac{${e}}{${f}}`,
      hinweis: BRUCH_HINWEIS, feld: bruchFeld((a * d + c * b) * f, b * d * e),
      uebung: { label: 'Gemischte Aufgaben zu Brüchen', to: '/rechnen_lernen/brueche/gemischt' },
    })
  }
  return out
}

// ---------- Potenzen ----------

const VARS = ['x', 'a', 'b', 'y', 'z', 'm', 'n', 'r', 't'] as const
const mono = (k: number, v: string, e: number): Poly => [{ coeff: k, vars: { [v]: e } }]
const monoTex = (k: number, v: string, e: number) => `${k === 1 ? '' : k === -1 ? '-' : k}${v}${e === 1 ? '' : `^{${e}}`}`
const termFeld = (k: number, v: string, e: number): Feld => ({ art: 'term', soll: mono(k, v, e), loesung: formatPoly(mono(k, v, e)), loesungTex: monoTex(k, v, e) })
const POT_HINWEIS = 'Potenzen als x^5 oder x⁵ eingeben, z. B. 12x^7.'

function potenzen(): TestAufgabe[] {
  const out: TestAufgabe[] = []
  const u = (label: string, to: string): Link => {
    return { label, to }
  }
  // 1) Multiplizieren
  {
    const v = wahl(VARS)
    const k1 = rnd(2, 9), k2 = rnd(2, 9) * wahl([1, -1])
    const e1 = rnd(2, 7), e2 = rnd(2, 7)
    out.push({
      id: id(), bereich: 'potenzen', frage: 'Vereinfache.', tex: `${monoTex(k1, v, e1)} \\cdot ${k2 < 0 ? `(${monoTex(k2, v, e2)})` : monoTex(k2, v, e2)} \\cdot ${v}`,
      hinweis: POT_HINWEIS, feld: termFeld(k1 * k2, v, e1 + e2 + 1),
      uebung: u('Potenzen multiplizieren und dividieren', '/rechnen_lernen/potenzen/multiplizierendividieren'),
    })
  }
  // 2) Dividieren
  {
    const v = wahl(VARS)
    const k = rnd(2, 9), q = rnd(2, 8)
    const e2 = rnd(2, 5), e = rnd(2, 6)
    out.push({
      id: id(), bereich: 'potenzen', frage: 'Vereinfache.', tex: `${monoTex(k * q, v, e + e2)} : ${monoTex(q, v, e2)}`,
      hinweis: POT_HINWEIS, feld: termFeld(k, v, e),
      uebung: u('Potenzen multiplizieren und dividieren', '/rechnen_lernen/potenzen/multiplizierendividieren'),
    })
  }
  // 3) Potenzieren
  {
    const v = wahl(VARS)
    const k = rnd(2, 4), e = rnd(2, 5), n = rnd(2, 3)
    out.push({
      id: id(), bereich: 'potenzen', frage: 'Vereinfache.', tex: `\\left(${monoTex(k, v, e)}\\right)^{${n}}`,
      hinweis: POT_HINWEIS, feld: termFeld(k ** n, v, e * n),
      uebung: u('Potenzieren von Potenzen', '/rechnen_lernen/potenzen/potenzieren'),
    })
  }
  // 4) Wissenschaftliche Schreibweise
  {
    const m = rnd(11, 99) / 10
    const n = wahl([-6, -5, -4, -3, 4, 5, 6, 7, 8])
    const zahl = n < 0 ? `0,${'0'.repeat(-n - 1)}${String(m).replace('.', '')}` : zahlText(Math.round(m * 10 ** n))
    out.push({
      id: id(), bereich: 'potenzen', frage: `Schreibe die Zahl ${zahl} in wissenschaftlicher Schreibweise. Welche Hochzahl n gehört in die Lücke?`,
      tex: `${zahl.replace(/\./g, '{.}').replace(',', '{,}')} = ${tz(m)} \\cdot 10^{n}`,
      feld: { art: 'zahl', soll: n, toleranz: 0, label: 'n =', loesung: String(n).replace('-', '−') },
      uebung: u('Zehnerpotenzen', '/rechnen_lernen/potenzen/zehnerpotenzen'),
    })
  }
  return out
}

// ---------- Wurzeln ----------

function wurzeln(): TestAufgabe[] {
  const u = { label: 'Wurzeln', to: '/rechnen_lernen/wurzeln/wurzeln' }
  const out: TestAufgabe[] = []
  // 1) Produkt von Wurzeln
  {
    const m = wahl([2, 3, 5, 6, 7])
    const a = rnd(1, 5), b = rnd(2, 6)
    out.push({ id: id(), bereich: 'wurzeln', frage: 'Berechne ohne Runden.', tex: `\\sqrt{${a * a * m}} \\cdot \\sqrt{${b * b * m}}`, feld: { art: 'zahl', soll: a * b * m, toleranz: 0, loesung: String(a * b * m) }, uebung: u })
  }
  // 2) Teilweise Wurzelziehen
  {
    const m = wahl([2, 3, 5, 6, 7])
    const k = rnd(2, 9)
    out.push({
      id: id(), bereich: 'wurzeln', frage: `Ziehe teilweise die Wurzel: Schreibe die Wurzel in der Form k · √${m}. Gib k an.`,
      tex: `\\sqrt{${k * k * m}} = k \\cdot \\sqrt{${m}}`, feld: { art: 'zahl', soll: k, toleranz: 0, label: 'k =', loesung: String(k) }, uebung: u,
    })
  }
  // 3) Wurzel aus Term
  {
    const v = wahl(VARS)
    const k = rnd(2, 12), e = rnd(1, 5)
    out.push({
      id: id(), bereich: 'wurzeln', frage: `Vereinfache (${v} > 0).`, tex: `\\sqrt{${k * k}${v}^{${2 * e}}}`,
      hinweis: POT_HINWEIS, feld: termFeld(k, v, e), uebung: u,
    })
  }
  // 4) Anwendung: Seitenlänge eines Quadrats bzw. Kubikwurzel
  if (rnd(0, 1) === 0) {
    const s = rnd(11, 49) / 10
    out.push({
      id: id(), bereich: 'wurzeln', frage: `Ein quadratisches Beet hat einen Flächeninhalt von ${zahlText(r2(s * s))} m². Wie lang ist eine Seite?`,
      feld: { art: 'zahl', soll: s, toleranz: 0.005, label: 'Seite =', einheit: 'm', loesung: `${zahlText(s)} m` }, uebung: u,
    })
  } else {
    const a = rnd(2, 9)
    out.push({ id: id(), bereich: 'wurzeln', frage: 'Berechne.', tex: `\\sqrt[3]{${a ** 3}}`, feld: { art: 'zahl', soll: a, toleranz: 0, loesung: String(a) }, uebung: u })
  }
  return out
}

// ---------- Prozentrechnung (ohne Kalkulation) ----------

function prozent(): TestAufgabe[] {
  const u = { label: 'Grundlagen der Prozentrechnung', to: '/rechnen_lernen/prozentrechnung/prozentrechnung' }
  const H = 'Runde Geldbeträge auf zwei Nachkommastellen.'
  const out: TestAufgabe[] = []
  // 1) Prozentwert
  {
    const lohn = rnd(0, 1) === 0
    const G = lohn ? rnd(360, 900) * 5 : rnd(400, 9000) * 10
    const p = lohn ? wahl([9.3, 1.3, 1.7, 2.5, 3.6]) : wahl([2.5, 4, 7.5, 12, 15, 18, 22.5, 35])
    const ctx = lohn
      ? `Eine Mitarbeiterin verdient ${euro(G)} brutto im Monat. Davon gehen ${zahlText(p)} % an eine Versicherung. Wie viel Euro sind das?`
      : `Eine Firma hat im Jahr Ausgaben von ${euro(G)}. ${zahlText(p)} % davon entfallen auf Werbung. Wie viel Euro sind das?`
    out.push({ id: id(), bereich: 'prozent', frage: ctx, hinweis: H, feld: { art: 'zahl', soll: r2((G * p) / 100), toleranz: 0.011, label: 'Prozentwert =', einheit: '€', loesung: euro(r2((G * p) / 100)) }, uebung: u })
  }
  // 2) Grundwert
  {
    const G = rnd(40, 900) * 10
    const p = wahl([5, 8, 12.5, 16, 20, 25, 40])
    const W = r2((G * p) / 100)
    out.push({
      id: id(), bereich: 'prozent', frage: `Ein Sparer bekommt ${zahlText(p)} % Bonus auf seine Einlage. Das sind ${euro(W)}. Wie hoch ist die Einlage?`,
      hinweis: H, feld: { art: 'zahl', soll: G, toleranz: 0.011, label: 'Grundwert =', einheit: '€', loesung: euro(G) }, uebung: u,
    })
  }
  // 3) Prozentsatz
  {
    let G = 400
    let p = 15
    for (let i = 0; i < 100; i++) {
      G = wahl([320, 400, 480, 640, 800, 1200, 1250])
      p = wahl([2.5, 7.5, 12.5, 15, 17.5, 22.5, 35, 45])
      if (Number.isInteger((G * p) / 100)) break
    }
    const W = (G * p) / 100
    const ctx = wahl([
      `An einer Schule mit ${G} Schülerinnen und Schülern kommen ${zahlText(W)} mit dem Fahrrad. Wie viel Prozent sind das?`,
      `Von ${G} produzierten Teilen sind ${zahlText(W)} fehlerhaft. Wie viel Prozent sind das?`,
    ])
    out.push({ id: id(), bereich: 'prozent', frage: ctx, feld: { art: 'zahl', soll: p, toleranz: 0.011, label: 'Prozentsatz =', einheit: '%', loesung: `${zahlText(p)} %` }, uebung: u })
  }
  // 4) vermehrter / verminderter Grundwert
  {
    const G = rnd(20, 400) * 5
    const p = wahl([5, 8, 12, 15, 20, 25])
    if (rnd(0, 1) === 0) {
      const neu = r2(G * (1 - p / 100))
      out.push({
        id: id(), bereich: 'prozent', frage: `Nach einem Rabatt von ${p} % kostet ein Fahrrad noch ${euro(neu)}. Wie viel kostete es vorher?`,
        hinweis: H, feld: { art: 'zahl', soll: G, toleranz: 0.011, label: 'alter Preis =', einheit: '€', loesung: euro(G) }, uebung: u,
      })
    } else {
      const neu = r2(G * (1 + p / 100))
      out.push({
        id: id(), bereich: 'prozent', frage: `Ein Preis wird um ${p} % erhöht und beträgt jetzt ${euro(neu)}. Wie hoch war der Preis vor der Erhöhung?`,
        hinweis: H, feld: { art: 'zahl', soll: G, toleranz: 0.011, label: 'alter Preis =', einheit: '€', loesung: euro(G) }, uebung: u,
      })
    }
  }
  return out
}

// ---------- Gleichungen (linear und Bruchgleichungen) ----------

const plusTex = (c: number) => (c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`)
const xTex = (k: number) => (k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`)
const G_HINWEIS = 'Gib x als ganze Zahl, Dezimalzahl oder Bruch (z. B. 5/2) ein.'

function gleichungen(): TestAufgabe[] {
  const lin = { label: 'Lineare Gleichungen', to: '/rechnen_lernen/gleichungen/generator_lineare' }
  const bru = { label: 'Bruchgleichungen', to: '/rechnen_lernen/gleichungen/bruchgleichungen' }
  const feld = (x: number): Feld => ({ art: 'zahl', soll: x, toleranz: 0.011, label: 'x =', loesung: zahlText(x) })
  const out: TestAufgabe[] = []
  // 1) a(x + b) − c = d·x + e
  {
    const x = rnd(-9, 12)
    const a = rnd(2, 7), b = rnd(-8, 8) || 3, c = rnd(1, 20)
    let d = rnd(-4, 6)
    if (d === a) d = a - 1
    const e = a * (x + b) - c - d * x
    out.push({ id: id(), bereich: 'gleichungen', frage: 'Löse die Gleichung.', tex: `${a}(x${plusTex(b)}) - ${c} = ${d === 0 ? '' : xTex(d)}${d === 0 ? e : plusTex(e)}`, hinweis: G_HINWEIS, feld: feld(x), uebung: lin })
  }
  // 2) mit Brüchen: x/p + c = x/q + d
  {
    const [p, q] = wahl([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5]] as const)
    const x = (p * q) * rnd(-3, 4) || p * q
    const c = rnd(-10, 10)
    const d = x / p + c - x / q
    out.push({ id: id(), bereich: 'gleichungen', frage: 'Löse die Gleichung.', tex: `\\frac{x}{${p}}${plusTex(c)} = \\frac{x}{${q}}${plusTex(d)}`, hinweis: G_HINWEIS, feld: feld(x), uebung: lin })
  }
  // 3) Bruchgleichung a/(x + b) = c
  {
    const c = rnd(2, 6) * wahl([1, -1])
    const k = rnd(1, 6) * wahl([1, -1])
    const a = c * k
    const b = rnd(-6, 6) || 2
    const x = k - b
    out.push({ id: id(), bereich: 'gleichungen', frage: 'Löse die Bruchgleichung.', tex: `\\frac{${a}}{x${plusTex(b)}} = ${c}`, hinweis: G_HINWEIS, feld: feld(x), uebung: bru })
  }
  // 4) Bruchgleichung a/(x − b) = c/(x + d)
  {
    let tex = ''
    let x = 0
    for (let i = 0; i < 200; i++) {
      const a = rnd(2, 9), c = rnd(2, 9), b = rnd(1, 6), d = rnd(1, 6)
      if (a === c) continue
      // a(x + d) = c(x − b)  →  (a − c)x = −cb − ad
      const xs = (-c * b - a * d) / (a - c)
      if (!Number.isInteger(xs * 2) || xs === b || xs === -d) continue
      tex = `\\frac{${a}}{x - ${b}} = \\frac{${c}}{x + ${d}}`
      x = xs
      break
    }
    out.push({ id: id(), bereich: 'gleichungen', frage: 'Löse die Bruchgleichung.', tex, hinweis: G_HINWEIS, feld: feld(x), uebung: bru })
  }
  return out
}

// ---------- TeX → Text (für das PDF) ----------

/** Wandelt einfaches TeX in lesbaren Text um (Brüche, Wurzeln, Potenzen, Malpunkt) */
export function texZuText(tex: string): string {
  let s = tex
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot/g, '·')
    .replace(/\{,\}/g, ',')
    .replace(/\{\.\}/g, '.')
    .replace(/(\d)\\frac/g, '$1 \\frac')
  for (let i = 0; i < 4; i++) {
    s = s
      .replace(/\\sqrt\[3\]\{([^{}]*)\}/g, '3.Wurzel($1)')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'Wurzel($1)')
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => `${/^[\w.,]+$/.test(a) ? a : `(${a})`}/${/^[\w.,]+$/.test(b) ? b : `(${b})`}`)
      .replace(/\^\{([^{}]*)\}/g, '^$1')
  }
  return s.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()
}

// ---------- Test zusammenstellen ----------

export function erzeugeTest(): TestAufgabe[] {
  return [...terme(), ...ausklammern(), ...brueche(), ...potenzen(), ...wurzeln(), ...prozent(), ...gleichungen()]
}

// ---------- Prüfen ----------

/** Zahl aus Eingabe (Komma, Tausenderpunkte, Minus-Varianten, Bruch a/b) */
export function leseZahl(s: string): number | null {
  // Einheit am Ende (€, %, m, s, cm …) ist erlaubt
  let t = s.replace(/\s/g, '').replace(/[−–]/g, '-').replace(/(€|%|[a-zA-Z²³]+)$/, '').replace(/^\+/, '')
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '')
  t = t.replace(',', '.')
  const b = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(t)
  if (b) return Number(b[2]) === 0 ? null : Number(b[1]) / Number(b[2])
  if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(t)) return null
  return Number(t)
}

/** Bruch-Eingabe: „a/b“, ganze Zahl oder gemischte Zahl „1 2/3“; muss vollständig gekürzt sein */
function pruefeBruch(eingabe: string, z: number, n: number): boolean {
  const t = eingabe.trim().replace(/[−–]/g, '-')
  const gemischt = /^(-?)(\d+)\s+(\d+)\/(\d+)$/.exec(t)
  if (gemischt) {
    const [, minus, g, a, b] = gemischt
    const nn = Number(b), zz = Number(g) * nn + Number(a)
    if (ggT(Number(a), nn) !== 1) return false
    return (minus ? -zz : zz) * n === z * nn
  }
  const m = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(t.replace(/\s/g, ''))
  if (m) {
    let zz = Number(m[1]), nn = Number(m[2])
    if (nn === 0) return false
    if (nn < 0) { zz = -zz; nn = -nn }
    return ggT(Math.abs(zz), nn) === 1 && zz === z && nn === n
  }
  if (/^-?\d+$/.test(t.replace(/\s/g, ''))) return n === 1 && Number(t.replace(/\s/g, '')) === z
  return false
}

export function istRichtig(a: TestAufgabe, eingabe: string): boolean {
  if (!eingabe || !eingabe.trim()) return false
  const f = a.feld
  try {
    switch (f.art) {
      case 'zahl': {
        const w = leseZahl(eingabe)
        return w !== null && Math.abs(w - f.soll) <= f.toleranz + 1e-9
      }
      case 'bruch':
        return pruefeBruch(eingabe, f.z, f.n)
      case 'term':
        return checkAnswer(eingabe, f.soll)
      case 'ausklammern':
        return pruefeAusklammern(f.aufgabe, eingabe).status === 'richtig'
    }
  } catch {
    return false
  }
  return false
}

// ---------- Auswertung ----------

export type Ampel = 'gruen' | 'gelb' | 'rot'

export interface BereichErgebnis {
  bereich: Bereich
  richtig: number
  gesamt: number
  prozent: number
  ampel: Ampel
}

export function ampelFuer(prozent: number): Ampel {
  if (prozent >= 75) return 'gruen'
  if (prozent >= 50) return 'gelb'
  return 'rot'
}

export const AMPEL_TEXT: Record<Ampel, string> = {
  gruen: 'sitzt – weiter so',
  gelb: 'nochmal üben',
  rot: 'dringend üben',
}

export function werteAus(aufgaben: TestAufgabe[], antworten: Record<string, string>): { bereiche: BereichErgebnis[]; richtig: number; gesamt: number } {
  const bereiche = BEREICHE.map((b) => {
    const liste = aufgaben.filter((a) => a.bereich === b.id)
    const richtig = liste.filter((a) => istRichtig(a, antworten[a.id] ?? '')).length
    const prozent = liste.length ? Math.round((richtig / liste.length) * 100) : 0
    return { bereich: b, richtig, gesamt: liste.length, prozent, ampel: ampelFuer(prozent) }
  })
  const richtig = bereiche.reduce((s, b) => s + b.richtig, 0)
  return { bereiche, richtig, gesamt: aufgaben.length }
}
