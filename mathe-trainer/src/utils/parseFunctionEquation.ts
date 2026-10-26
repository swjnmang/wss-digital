// Liest eine vollständig eingetippte Funktionsgleichung mit beliebigem Term in x, z. B.
// "y = 2x^2 - 3x + 1", "y = -0,5(x - 2)² + 3", "f(x) = 2(x+1)(x-3)", "y = 1/2x² + 4".
// Der Term wird zu einem Polynom ausmultipliziert, so dass jede gleichwertige Schreibweise erkannt wird.
// Zusätzlich lässt sich prüfen, ob die verlangte Form eingehalten ist (allgemeine Form bzw. Scheitelform).
//
// Für lineare Funktionen gibt es die feineren Rückmeldungen in parseLinearEquation.ts.

export type Polynom = number[] // Koeffizienten c0, c1, c2, …

export type PolynomParse = { ok: true; koeff: Polynom; rechts: string } | { ok: false; fehler: string }

/** Eingabe vereinheitlichen: Minus-Varianten, Komma, Malpunkt, Hochzahlen, Leerzeichen */
export function normalizeEquation(raw: string): string {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[−–—‐]/g, '-')
    .replace(/,/g, '.')
    .replace(/[·⋅×]/g, '*')
    .replace(/:/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\s+/g, '')
}

const trim = (p: Polynom): Polynom => {
  const r = [...p]
  while (r.length > 1 && Math.abs(r[r.length - 1]) < 1e-12) r.pop()
  return r
}
const add = (a: Polynom, b: Polynom, s = 1): Polynom =>
  trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + s * (b[i] ?? 0)))
const mul = (a: Polynom, b: Polynom): Polynom => {
  const r = new Array(a.length + b.length - 1).fill(0)
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y)))
  return trim(r)
}
const isConst = (p: Polynom) => p.length === 1

class ParseError extends Error {}

/** Rekursiver Parser für + − · / ^ ( ) mit unsichtbarem Malzeichen (2x, 3(x+1), (x−1)(x+2)) */
function parseTerm(s: string): Polynom {
  let i = 0
  const peek = () => s[i]
  const fail = (msg: string): never => {
    throw new ParseError(msg)
  }

  const expr = (): Polynom => {
    let p = signedTerm()
    while (peek() === '+' || peek() === '-') p = add(p, signedTerm())
    return p
  }
  // Vorzeichen vor einem Summanden (auch doppelt: "+-3", "--3")
  const signedTerm = (): Polynom => {
    let sign = 1
    let had = false
    while (peek() === '+' || peek() === '-') {
      if (peek() === '-') sign = -sign
      i++
      had = true
    }
    if (i >= s.length) fail(had ? 'Am Ende steht noch ein Rechenzeichen.' : 'Rechts vom Gleichheitszeichen fehlt noch der Term.')
    const t = term()
    return sign === 1 ? t : t.map((c) => -c)
  }
  const startsFactor = (c: string | undefined) => c !== undefined && /[0-9.x(]/.test(c)
  const term = (): Polynom => {
    let p = power()
    for (;;) {
      const c = peek()
      if (c === '*') {
        i++
        p = mul(p, signedFactor())
      } else if (c === '/') {
        i++
        const d = signedFactor()
        if (!isConst(d)) fail('Durch x teilen geht hier nicht – schreibe die Zahl als Bruch vor das x, z. B. 1/2x.')
        if (Math.abs(d[0]) < 1e-12) fail('Durch 0 kann man nicht teilen.')
        p = p.map((v) => v / d[0])
      } else if (startsFactor(c)) {
        p = mul(p, power())
      } else return p
    }
  }
  const signedFactor = (): Polynom => {
    if (peek() === '-' || peek() === '+') {
      const neg = s[i++] === '-'
      const f = signedFactor()
      return neg ? f.map((c) => -c) : f
    }
    return power()
  }
  const power = (): Polynom => {
    const base = atom()
    if (peek() !== '^') return base
    i++
    let e: Polynom
    if (peek() === '(') {
      i++
      e = expr()
      if (peek() !== ')') fail('Beim Exponenten fehlt die schließende Klammer.')
      i++
    } else if (peek() !== undefined && /[0-9]/.test(peek()!)) {
      const st = i
      while (i < s.length && /[0-9]/.test(s[i])) i++
      e = [parseInt(s.slice(st, i), 10)]
    } else return fail('Nach ^ fehlt die Hochzahl, z. B. x^2.')
    if (!isConst(e) || !Number.isInteger(e[0]) || e[0] < 0 || e[0] > 4) fail('Als Hochzahl sind hier nur ganze Zahlen wie 2 erlaubt.')
    let r: Polynom = [1]
    for (let k = 0; k < e[0]; k++) r = mul(r, base)
    return r
  }
  const atom = (): Polynom => {
    const c = peek()
    if (c === undefined) return fail('Am Ende fehlt noch etwas.')
    if (c === 'x') {
      i++
      return [0, 1]
    }
    if (c === '(') {
      i++
      if (peek() === ')') fail('In der Klammer steht nichts.')
      const p = expr()
      if (peek() !== ')') fail('Es fehlt eine schließende Klammer „)“.')
      i++
      return p
    }
    if (/[0-9.]/.test(c)) {
      const st = i
      while (i < s.length && /[0-9.]/.test(s[i])) i++
      const txt = s.slice(st, i)
      if (!/^(\d+(\.\d*)?|\.\d+)$/.test(txt)) fail(`„${txt.replace('.', ',')}“ kann ich nicht als Zahl lesen.`)
      return [parseFloat(txt)]
    }
    if (c === ')') return fail('Da ist eine Klammer „)“ zu viel.')
    if (c === '^') return fail('Vor ^ fehlt die Grundzahl, z. B. x^2.')
    if (c === '*' || c === '/') return fail('Zwei Rechenzeichen stehen direkt hintereinander.')
    return fail(`Das Zeichen „${c}“ gehört nicht in die Gleichung. Erlaubt sind Zahlen, x, + − · /, ^ und Klammern.`)
  }

  const p = expr()
  if (i < s.length) {
    if (s[i] === ')') fail('Da ist eine Klammer „)“ zu viel.')
    fail(`An der Stelle „${s.slice(i)}“ komme ich nicht weiter.`)
  }
  return p
}

/** Ganze Gleichung lesen: links y (oder f(x), g(x), p(x) …), rechts ein Term in x */
export function parsePolynomEquation(raw: string): PolynomParse {
  const s = normalizeEquation(raw)
  if (s === '') return { ok: false, fehler: 'Bitte die Funktionsgleichung eintragen.' }
  if (!s.includes('=')) return { ok: false, fehler: 'Schreibe die vollständige Gleichung, also mit „y =“ am Anfang.' }
  const teile = s.split('=')
  if (teile.length !== 2) return { ok: false, fehler: 'In der Gleichung darf nur ein Gleichheitszeichen stehen.' }
  let [links, rechts] = teile
  const istY = (t: string) => t === 'y' || /^[a-wz]\(x\)$/.test(t)
  if (!istY(links) && istY(rechts)) [links, rechts] = [rechts, links]
  if (!istY(links)) return { ok: false, fehler: 'Links vom Gleichheitszeichen steht nur „y“: y = …' }
  if (rechts === '') return { ok: false, fehler: 'Rechts vom Gleichheitszeichen fehlt noch der Term.' }
  try {
    return { ok: true, koeff: parseTerm(rechts), rechts }
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, fehler: e.message }
    throw e
  }
}

// ---------- Form der Eingabe ----------

const ZAHL = String.raw`(?:\d+(?:\.\d+)?|\.\d+)(?:\/(?:\d+(?:\.\d+)?))?`
const ZAHL_K = String.raw`(?:${ZAHL}|\(-?${ZAHL}\))` // auch geklammert: (1/2), (-3)
const FAKTOR = String.raw`(?:-?${ZAHL_K}\*?|-)?`
const QUADRAT = String.raw`(?:\(x(?:[+-]${ZAHL_K})?\)\^2|x\^2)`
const SCHEITEL_A = new RegExp(String.raw`^[+]?${FAKTOR}${QUADRAT}(?:[+-]${ZAHL_K})?$`)
const SCHEITEL_B = new RegExp(String.raw`^-?${ZAHL_K}[+-]${ZAHL_K.replace('-?', '')}?\*?${QUADRAT}$`)

/** Scheitelform y = a(x − d)² + e (auch ohne Klammer bei d = 0 oder mit e vorne) */
export function istScheitelform(rechts: string): boolean {
  return SCHEITEL_A.test(rechts) || SCHEITEL_B.test(rechts)
}

/** Allgemeine Form y = ax² + bx + c: keine Klammer mit x, jede Potenz von x höchstens einmal */
export function istAllgemeineForm(rechts: string): boolean {
  if (/\([^()]*x[^()]*\)/.test(rechts)) return false
  const summanden = rechts.match(/[+-]*[^+-]+/g)
  if (!summanden) return false
  const gesehen = new Set<number>()
  for (const roh of summanden) {
    const t = roh.replace(/^[+-]+/, '')
    let grad: number
    if (new RegExp(String.raw`^${ZAHL_K}?\*?x\^2$|^x\^2\/${ZAHL}$`).test(t)) grad = 2
    else if (new RegExp(String.raw`^${ZAHL_K}?\*?x$|^x\/${ZAHL}$`).test(t)) grad = 1
    else if (new RegExp(String.raw`^${ZAHL_K}$`).test(t)) grad = 0
    else return false
    if (gesehen.has(grad)) return false
    gesehen.add(grad)
  }
  return true
}

// ---------- Prüfen quadratischer Funktionsgleichungen ----------

export type QuadForm = 'allgemein' | 'scheitel' | 'beliebig'
export type EquationCheck = { status: 'ok' | 'no' | 'invalid'; text: string }

const nahe = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol + 1e-9

/** Vergleicht eine eingetippte quadratische Funktionsgleichung mit y = ax² + bx + c */
export function checkQuadraticEquation(
  raw: string,
  soll: { a: number; b: number; c: number },
  form: QuadForm = 'beliebig',
  tol = 0.02,
): EquationCheck {
  const p = parsePolynomEquation(raw)
  if (!p.ok) return { status: 'invalid', text: p.fehler }
  const [c = 0, b = 0, a = 0, ...rest] = p.koeff
  if (rest.some((k) => Math.abs(k) > 1e-9)) return { status: 'invalid', text: 'Eine quadratische Funktion hat höchstens x², kein x³.' }
  if (Math.abs(a) < 1e-12) return { status: 'invalid', text: 'In der Gleichung fehlt noch das x² – sonst ist es keine Parabel.' }

  const istFormOk = form === 'beliebig' || (form === 'scheitel' ? istScheitelform(p.rechts) : istAllgemeineForm(p.rechts))
  const formName = form === 'scheitel' ? 'Scheitelform y = a(x − xₛ)² + yₛ' : 'allgemeinen Form y = ax² + bx + c'

  if (form === 'scheitel') {
    const xs = -soll.b / (2 * soll.a)
    const ys = soll.c - (soll.b * soll.b) / (4 * soll.a)
    const uxs = -b / (2 * a)
    const uys = c - (b * b) / (4 * a)
    const aOk = nahe(a, soll.a, tol)
    const xOk = nahe(uxs, xs, tol)
    const yOk = nahe(uys, ys, tol)
    if (aOk && xOk && yOk) {
      return istFormOk
        ? { status: 'ok', text: '' }
        : { status: 'invalid', text: `Die Gleichung stimmt, aber schreibe sie in der ${formName}.` }
    }
    if (!istFormOk) return { status: 'no', text: `Schreibe die Gleichung in der ${formName} – und prüfe dabei a, xₛ und yₛ.` }
    const falsch: string[] = []
    if (!aOk) falsch.push(nahe(a, -soll.a, tol) ? 'beim Faktor a ist das Vorzeichen falsch' : 'der Faktor a stimmt noch nicht')
    if (!xOk) falsch.push(nahe(uxs, -xs, tol) ? 'in der Klammer ist das Vorzeichen falsch (aus xₛ = 3 wird (x − 3))' : 'die Zahl in der Klammer (xₛ) stimmt noch nicht')
    if (!yOk) falsch.push(nahe(uys, -ys, tol) ? 'bei yₛ hinter der Klammer ist das Vorzeichen falsch' : 'die Zahl hinter der Klammer (yₛ) stimmt noch nicht')
    return { status: 'no', text: `Noch nicht ganz: ${falsch.join(', ')}.` }
  }

  const ok = [nahe(a, soll.a, tol), nahe(b, soll.b, tol), nahe(c, soll.c, tol)]
  if (ok.every(Boolean)) {
    return istFormOk ? { status: 'ok', text: '' } : { status: 'invalid', text: `Die Gleichung stimmt, aber schreibe sie in der ${formName} (Klammern ausmultiplizieren und zusammenfassen).` }
  }
  if (!istFormOk) return { status: 'no', text: `Schreibe die Gleichung in der ${formName} und prüfe a, b und c.` }
  const namen = ['a (vor x²)', 'b (vor x)', 'c (Zahl ohne x)']
  const werte = [a, b, c]
  const sollW = [soll.a, soll.b, soll.c]
  const falsch = namen.filter((_, k) => !ok[k])
  const nurVorzeichen = falsch.length > 0 && [0, 1, 2].every((k) => ok[k] || nahe(werte[k], -sollW[k], tol))
  if (falsch.length === 1) return { status: 'no', text: `${nurVorzeichen ? 'Fast: Bei' : 'Noch nicht ganz:'} ${falsch[0]} ${nurVorzeichen ? 'ist das Vorzeichen falsch' : 'stimmt noch nicht'}.` }
  return { status: 'no', text: `Noch nicht ganz: ${falsch.join(' und ')} stimmen noch nicht${nurVorzeichen ? ' – schau auf die Vorzeichen' : ''}.` }
}
