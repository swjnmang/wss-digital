// Aufgabentypen für „Scheitelpunkt berechnen“: Jede Runde mischt verschiedene Formate
// (von geführt bis frei, mit Sachaufgabe). Rechnerisch geht es immer um x_S = −b/(2a) und y_S = f(x_S).
import React from 'react'
import { type Q, q, add, sub, mul, neg, val, isInt, tq, tn, round2, pick, shuffle, randomInt, Tex, Steps } from '../quadratischShared'

export type Level = 'einfach' | 'mittel' | 'fortgeschritten' | 'anwendung'
type RechenLevel = Exclude<Level, 'anwendung'>

export const LEVEL_LABEL: Record<Level, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  fortgeschritten: 'Fortgeschritten',
  anwendung: 'Anwendung',
}

// ---------- Zahlen als LaTeX: Brüche (Fortgeschritten) oder Dezimalzahlen ----------

interface Fmt {
  n: (x: Q) => string
  bruch: boolean
}
const FRAC: Fmt = { n: tq, bruch: true }
const DEZ: Fmt = { n: (x) => tn(val(x)), bruch: false }
export const fmtFuer = (level: Level) => (level === 'fortgeschritten' ? FRAC : DEZ)

/** In Klammern, wenn negativ (für Einsetzen) */
const np = (f: Fmt, x: Q) => (x.n < 0 ? `\\left(${f.n(x)}\\right)` : f.n(x))
/** Mit Rechenzeichen davor, z. B. "+ 3" oder "- 0{,}5" */
const sg = (f: Fmt, x: Q) => (x.n < 0 ? `- ${f.n(neg(x))}` : `+ ${f.n(x)}`)
/** Koeffizient vor x bzw. x² (1 und −1 werden weggelassen) */
const coef = (f: Fmt, x: Q) => (x.n === x.d ? '' : x.n === -x.d ? '-' : f.n(x))
const absQ = (x: Q) => q(Math.abs(x.n), x.d)

type Summand = [Q, 0 | 1 | 2]

/** Summanden in der angegebenen Reihenfolge, Summanden mit 0 entfallen */
function polyT(f: Fmt, terms: Summand[], v = 'x') {
  const parts: string[] = []
  for (const [k, pow] of terms) {
    if (k.n === 0) continue
    const varTex = pow === 2 ? `${v}^2` : pow === 1 ? v : ''
    if (parts.length === 0) parts.push(pow === 0 ? f.n(k) : `${coef(f, k)}${varTex}`)
    else parts.push(`${k.n < 0 ? '-' : '+'} ${pow === 0 ? f.n(absQ(k)) : coef(f, absQ(k))}${varTex}`)
  }
  return parts.length ? parts.join(' ') : '0'
}
const poly = (f: Fmt, k: Koeff, v = 'x') => polyT(f, [[k.a, 2], [k.b, 1], [k.c, 0]], v)

// ---------- Koeffizienten erzeugen ----------

export interface Koeff {
  a: Q
  b: Q
  c: Q
  xs: Q
  ys: Q
}

/** Aus Streckfaktor, x_S und c: b = −2a·x_S, y_S = f(x_S) */
const ausXsC = (a: Q, xs: Q, c: Q): Koeff => {
  const b = mul(q(-2), mul(a, xs))
  return { a, b, c, xs, ys: add(mul(b, xs), add(mul(a, mul(xs, xs)), c)) }
}

/** Zahl hat höchstens zwei Nachkommastellen */
const dez2 = (x: Q) => 100 % x.d === 0

const A_MITTEL = [[2, 1], [-2, 1], [3, 1], [-3, 1], [1, 2], [-1, 2], [3, 2], [-3, 2]] as const
const A_FORTGESCHRITTEN = [[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 4], [-1, 4], [3, 4], [-3, 4], [3, 2], [-3, 2], [2, 1], [-2, 1]] as const
const XS_FORTGESCHRITTEN = Array.from({ length: 17 }, (_, i) => q(i - 8, 2)).filter((x) => x.n !== 0)
const C_FORTGESCHRITTEN = [
  ...Array.from({ length: 13 }, (_, i) => q(i - 6)),
  ...[-5, -3, -1, 1, 3, 5].map((n) => q(n, 2)),
  ...[-3, -1, 1, 3].map((n) => q(n, 4)),
  ...[-2, -1, 1, 2].map((n) => q(n, 3)),
].filter((c) => c.n !== 0)

interface KoeffOpt {
  /** b = 0 (Scheitel auf der y-Achse) */
  b0?: boolean
  /** c = 0 */
  c0?: boolean
  /** Scheitelpunkt mit ganzzahligen Koordinaten (z. B. für Graphen) */
  ganzS?: boolean
  xsNicht0?: boolean
  ysNicht0?: boolean
  /** Höchstbeträge für x_S und y_S */
  max?: [number, number]
}

function nonZeroInt(max: number) {
  let n: number
  do n = randomInt(max, -max)
  while (n === 0)
  return n
}

export function koeff(level: RechenLevel, opt: KoeffOpt = {}): Koeff {
  for (;;) {
    let k: Koeff
    if (level === 'einfach') {
      k = ausXsC(q(pick([1, -1])), q(opt.b0 ? 0 : nonZeroInt(5)), q(opt.c0 ? 0 : nonZeroInt(9)))
    } else if (level === 'mittel') {
      const [an, ad] = pick(A_MITTEL)
      k = ausXsC(q(an, ad), q(opt.b0 ? 0 : nonZeroInt(5)), q(opt.c0 ? 0 : nonZeroInt(9)))
      if (Math.abs(val(k.b)) > 16 || Math.abs(val(k.ys)) > 30) continue
    } else {
      const [an, ad] = pick(A_FORTGESCHRITTEN)
      k = ausXsC(q(an, ad), opt.b0 ? q(0) : pick(XS_FORTGESCHRITTEN), opt.c0 ? q(0) : pick(C_FORTGESCHRITTEN))
      // Mindestens ein Bruch in der Gleichung, überschaubare Nenner und Beträge
      const mitBruch = !isInt(k.a) || !isInt(k.b) || !isInt(k.c)
      if (!mitBruch || k.b.d > 4 || Math.abs(val(k.b)) > 12 || k.ys.d > 6 || Math.abs(val(k.ys)) > 12) continue
      if (!opt.b0 && k.b.n === 0) continue
    }
    if (opt.ganzS && !(isInt(k.xs) && isInt(k.ys))) continue
    if (opt.xsNicht0 && k.xs.n === 0) continue
    if (opt.ysNicht0 && k.ys.n === 0) continue
    if (opt.max && (Math.abs(val(k.xs)) > opt.max[0] || Math.abs(val(k.ys)) > opt.max[1])) continue
    return k
  }
}

// ---------- Aufgabenmodell ----------

export type Feld =
  | { kind: 'num'; id: string; label: React.ReactNode; correct: Q; unit?: string; hint: React.ReactNode; kurz?: boolean }
  | { kind: 'point'; id: string; xs: Q; ys: Q; hintX: React.ReactNode; hintY: React.ReactNode }
  | { kind: 'choice'; id: string; label: React.ReactNode; options: React.ReactNode[]; correct: number; hint: React.ReactNode; grafisch?: boolean }

export interface Aufgabe {
  titel: string
  auftrag: React.ReactNode
  felder: Feld[]
  loesung: React.ReactNode
}

const HINT_X = (
  <>
    x stimmt noch nicht. Tipp: <Tex tex="x_S = -\frac{b}{2a}" />
  </>
)
const HINT_Y = (
  <>
    y stimmt noch nicht. Setze <Tex tex="x_S" /> in <Tex tex="f(x)" /> ein oder nutze <Tex tex="y_S = c - \frac{b^2}{4a}" />.
  </>
)
const punkt = (k: Koeff, hintX: React.ReactNode = HINT_X, hintY: React.ReactNode = HINT_Y): Feld => ({ kind: 'point', id: 'S', xs: k.xs, ys: k.ys, hintX, hintY })

/** Bruch als gerundete Dezimalzahl, z. B. "\approx 2{,}33" */
const naeherung = (f: Fmt, x: Q) => (f.bruch && !isInt(x) ? ` ${Math.abs(val(x) - round2(val(x))) < 1e-9 ? '=' : '\\approx'} ${tn(val(x))}` : '')

function ergebnisTex(f: Fmt, k: Koeff) {
  const exakt = `S\\left({${f.n(k.xs)}} \\;\\middle|\\; {${f.n(k.ys)}}\\right)`
  if (!f.bruch || (isInt(k.xs) && isInt(k.ys))) return exakt
  return `${exakt} \\approx S\\left({${tn(val(k.xs))}} \\;\\middle|\\; {${tn(val(k.ys))}}\\right)`
}

// ---------- Lösungswege ----------

function xRechnung(f: Fmt, k: Koeff, name = 'x') {
  return `${name}_S = -\\frac{b}{2 \\cdot a} = -\\frac{${f.n(k.b)}}{2 \\cdot ${np(f, k.a)}} = \\frac{${f.n(neg(k.b))}}{${f.n(mul(q(2), k.a))}} = \\mathbf{${f.n(k.xs)}}`
}

function yEinsetzen(f: Fmt, k: Koeff, fn = 'f', yName = 'y') {
  const t1 = mul(k.a, mul(k.xs, k.xs))
  const t2 = mul(k.b, k.xs)
  // Summanden mit b = 0 bzw. c = 0 entfallen
  const bTerm = k.b.n !== 0 ? ` ${sg(f, k.b)} \\cdot ${np(f, k.xs)}` : ''
  const cTerm = k.c.n !== 0 ? ` ${sg(f, k.c)}` : ''
  const zwischen = `${f.n(t1)}${k.b.n !== 0 ? ` ${sg(f, t2)}` : ''}${cTerm}`
  return `\\begin{aligned} ${yName}_S &= ${fn}\\left(${f.n(k.xs)}\\right) = ${f.n(k.a)} \\cdot ${np(f, k.xs)}^2${bTerm}${cTerm} \\\\ &= ${zwischen} = \\mathbf{${f.n(k.ys)}}${naeherung(f, k.ys)} \\end{aligned}`
}

function yFormel(f: Fmt, k: Koeff, yName = 'y') {
  const bb = mul(k.b, k.b)
  const vierA = mul(q(4), k.a)
  const quot = q(bb.n * vierA.d, bb.d * vierA.n)
  const c0 = k.c.n === 0
  const cTex = c0 ? '' : `${f.n(k.c)} `
  const rest = c0 ? '' : ` \\\\ &= ${f.n(k.c)} ${sg(f, neg(quot))}`
  return `\\begin{aligned} ${yName}_S &= ${cTex}- \\frac{${np(f, k.b)}^2}{4 \\cdot ${np(f, k.a)}} = ${cTex}- \\frac{${f.n(bb)}}{${f.n(vierA)}}${rest} = \\mathbf{${f.n(k.ys)}}${naeherung(f, k.ys)} \\end{aligned}`
}

function Loesungsweg({ f, k, vorab, fn = 'f', v = 'x', yName = 'y', ohneErgebnis, children }: { f: Fmt; k: Koeff; vorab?: React.ReactNode; fn?: string; v?: string; yName?: string; ohneErgebnis?: boolean; children?: React.ReactNode }) {
  return (
    <div className="mt-6 bk-taskbox text-left text-slate-700 space-y-3">
      <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
      {vorab}
      <p>
        Ablesen: <Tex tex={`a = ${f.n(k.a)},\\quad b = ${f.n(k.b)},\\quad c = ${f.n(k.c)}`} />
      </p>
      <div>
        <p className="font-semibold text-slate-800">Schritt 1: {v}-Koordinate berechnen</p>
        <Tex display tex={xRechnung(f, k, v)} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">
          Schritt 2: <Tex tex={`${v}_S`} /> in <Tex tex={`${fn}(${v})`} /> einsetzen
        </p>
        <Tex display tex={yEinsetzen(f, k, fn, yName)} />
        <p className="mt-2">
          oder mit der Formel <Tex tex={`${yName}_S = c - \\frac{b^2}{4 \\cdot a}`} />:
        </p>
        <Tex display tex={yFormel(f, k, yName)} />
      </div>
      {!ohneErgebnis && (
        <div className="font-bold text-slate-800 text-center text-lg">
          <Tex display tex={ergebnisTex(f, k)} />
        </div>
      )}
      {children}
    </div>
  )
}

const Gleichung = ({ tex }: { tex: string }) => (
  <div className="text-center text-2xl text-slate-800 my-4">
    <Tex tex={tex} />
  </div>
)

// ---------- 1. Schritt für Schritt (Lückentext) ----------

function lueckentext(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level)
  const abl = (name: string) => (
    <>
      {name} stimmt noch nicht. <Tex tex="a" /> steht vor <Tex tex="x^2" />, <Tex tex="b" /> vor <Tex tex="x" />, <Tex tex="c" /> ohne{' '}
      <Tex tex="x" />. Das Vorzeichen davor gehört dazu.
    </>
  )
  return {
    titel: 'Schritt für Schritt',
    auftrag: (
      <>
        <p className="text-slate-700">Lies zuerst a, b und c ab. Berechne dann die beiden Koordinaten des Scheitelpunkts.</p>
        <Gleichung tex={`f(x) = ${poly(f, k)}`} />
      </>
    ),
    felder: [
      { kind: 'num', id: 'a', label: <Tex tex="a =" />, correct: k.a, hint: abl('a'), kurz: true },
      { kind: 'num', id: 'b', label: <Tex tex="b =" />, correct: k.b, hint: abl('b'), kurz: true },
      { kind: 'num', id: 'c', label: <Tex tex="c =" />, correct: k.c, hint: abl('c'), kurz: true },
      { kind: 'num', id: 'xs', label: <Tex tex="x_S = -\dfrac{b}{2 \cdot a} =" />, correct: k.xs, hint: HINT_X },
      { kind: 'num', id: 'ys', label: <Tex tex="y_S = f(x_S) =" />, correct: k.ys, hint: HINT_Y },
    ],
    loesung: <Loesungsweg f={f} k={k} />,
  }
}

// ---------- 2. x ist schon berechnet, nur noch y ----------

function nurY(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level)
  return {
    titel: 'Halb gelöst',
    auftrag: (
      <>
        <p className="text-slate-700">Die x-Koordinate ist schon berechnet. Berechne die y-Koordinate des Scheitelpunkts.</p>
        <Gleichung tex={`f(x) = ${poly(f, k)}`} />
        <div className="bk-taskbox text-slate-700 mb-4">
          <Tex display tex={xRechnung(f, k)} />
        </div>
      </>
    ),
    felder: [
      {
        kind: 'num',
        id: 'ys',
        label: <Tex tex={`y_S = f\\left(${f.n(k.xs)}\\right) =`} />,
        correct: k.ys,
        hint: (
          <>
            Noch nicht richtig. Setze <Tex tex={`x = ${f.n(k.xs)}`} /> in <Tex tex="f(x)" /> ein, negative Zahlen in Klammern: <Tex tex="(-3)^2 = 9" />.
          </>
        ),
      },
    ],
    loesung: <Loesungsweg f={f} k={k} />,
  }
}

// ---------- 3a. Summanden in ungewohnter Reihenfolge ----------

function ungeordnet(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level)
  const reihenfolgen: (0 | 1 | 2)[][] = [[0, 1, 2], [1, 0, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0]]
  const terms: Summand[] = pick(reihenfolgen).map((pow) => [pow === 2 ? k.a : pow === 1 ? k.b : k.c, pow])
  const original = `f(x) = ${polyT(f, terms)}`
  return {
    titel: 'Genau hinschauen',
    auftrag: (
      <>
        <p className="text-slate-700">Berechne den Scheitelpunkt S der Parabel.</p>
        <Gleichung tex={original} />
      </>
    ),
    felder: [
      punkt(
        k,
        <>
          x stimmt noch nicht. Ordne zuerst nach der Form <Tex tex="f(x) = ax^2 + bx + c" />: <Tex tex="b" /> ist die Zahl vor <Tex tex="x" />, nicht die erste Zahl.
        </>,
      ),
    ],
    loesung: (
      <Loesungsweg
        f={f}
        k={k}
        vorab={
          <p>
            Die Summanden stehen nicht in der Reihenfolge <Tex tex="ax^2 + bx + c" />. Erst ordnen:
            <Tex display tex={`${original} \\quad\\Rightarrow\\quad f(x) = ${poly(f, k)}`} />
          </p>
        }
      />
    ),
  }
}

// ---------- 3b. Sonderfall: b = 0 oder c = 0 ----------

function sonderfall(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const ohneB = Math.random() < 0.5
  const k = koeff(level, ohneB ? { b0: true } : { c0: true, xsNicht0: true })
  const fehlt = ohneB ? (
    <>
      Es gibt keinen Summanden mit <Tex tex="x" />, also ist <Tex tex="b = 0" />.
    </>
  ) : (
    <>
      Es gibt keine Zahl ohne <Tex tex="x" />, also ist <Tex tex="c = 0" />.
    </>
  )
  return {
    titel: 'Sonderfall',
    auftrag: (
      <>
        <p className="text-slate-700">Berechne den Scheitelpunkt S. Achtung: In dieser Gleichung fehlt ein Summand.</p>
        <Gleichung tex={`f(x) = ${poly(f, k)}`} />
      </>
    ),
    felder: [punkt(k, <>x stimmt noch nicht. {fehlt}</>, <>y stimmt noch nicht. {fehlt} Setze dann <Tex tex="x_S" /> in <Tex tex="f(x)" /> ein.</>)],
    loesung: <Loesungsweg f={f} k={k} vorab={<p>{fehlt}</p>} />,
  }
}

// ---------- 4. Erst überlegen, dann rechnen ----------

function schaetzen(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level)
  const hoch = k.a.n < 0
  return {
    titel: 'Erst überlegen, dann rechnen',
    auftrag: (
      <>
        <p className="text-slate-700">Überlege zuerst ohne zu rechnen, ob der Scheitelpunkt ein Hoch- oder ein Tiefpunkt ist. Berechne ihn danach.</p>
        <Gleichung tex={`f(x) = ${poly(f, k)}`} />
      </>
    ),
    felder: [
      {
        kind: 'choice',
        id: 'art',
        label: 'Ist S der höchste oder der tiefste Punkt der Parabel?',
        options: ['Hochpunkt', 'Tiefpunkt'],
        correct: hoch ? 0 : 1,
        hint: (
          <>
            Schau auf <Tex tex="a" />: Bei <Tex tex="a > 0" /> ist die Parabel nach oben geöffnet (Tiefpunkt), bei <Tex tex="a < 0" /> nach unten (Hochpunkt).
          </>
        ),
      },
      punkt(k),
    ],
    loesung: (
      <Loesungsweg
        f={f}
        k={k}
        vorab={
          <p>
            <Tex tex={`a = ${f.n(k.a)} ${hoch ? '< 0' : '> 0'}`} />: Die Parabel ist nach {hoch ? 'unten' : 'oben'} geöffnet, S ist ein <strong>{hoch ? 'Hochpunkt' : 'Tiefpunkt'}</strong>.
          </p>
        }
      />
    ),
  }
}

// ---------- 5a. Rückwärts: b aus dem Scheitelpunkt bestimmen ----------

function rueckwaerts(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level, { xsNicht0: true })
  const zweiA = mul(q(2), k.a)
  const gleichung = `f(x) = ${coef(f, k.a)}x^2 + bx${k.c.n !== 0 ? ` ${sg(f, k.c)}` : ''}`
  return {
    titel: 'Rückwärts denken',
    auftrag: (
      <>
        <p className="text-slate-700">
          Bei dieser Parabel fehlt die Zahl <Tex tex="b" />. Bekannt ist: Der Scheitelpunkt hat die x-Koordinate <Tex tex={`x_S = ${f.n(k.xs)}`} />.
          Bestimme <Tex tex="b" /> und berechne dann die y-Koordinate des Scheitelpunkts.
        </p>
        <Gleichung tex={gleichung} />
      </>
    ),
    felder: [
      {
        kind: 'num',
        id: 'b',
        label: <Tex tex="b =" />,
        correct: k.b,
        hint: (
          <>
            b stimmt noch nicht. Setze in <Tex tex="x_S = -\frac{b}{2a}" /> die bekannten Werte ein und löse nach <Tex tex="b" /> auf.
          </>
        ),
      },
      {
        kind: 'num',
        id: 'ys',
        label: <Tex tex="y_S =" />,
        correct: k.ys,
        hint: (
          <>
            y stimmt noch nicht. Setze <Tex tex={`x_S = ${f.n(k.xs)}`} /> in die vollständige Gleichung (mit deinem b) ein.
          </>
        ),
      },
    ],
    loesung: (
      <div className="mt-6 bk-taskbox text-left text-slate-700 space-y-3">
        <h3 className="text-base font-bold text-slate-800 text-center">Lösungsweg</h3>
        <p className="font-semibold text-slate-800">Schritt 1: b mit der Formel für x_S bestimmen</p>
        <p>
          In <Tex tex="x_S = -\frac{b}{2 \cdot a}" /> setzt du <Tex tex={`x_S = ${f.n(k.xs)}`} /> und <Tex tex={`a = ${f.n(k.a)}`} /> ein und stellst nach b um:
        </p>
        <Steps
          lines={[
            { tex: `${f.n(k.xs)} = -\\frac{b}{2 \\cdot ${np(f, k.a)}}` },
            { tex: `${f.n(k.xs)} = -\\frac{b}{${f.n(zweiA)}}`, op: `\\cdot ${np(f, zweiA)}` },
            { tex: `${f.n(mul(k.xs, zweiA))} = -b`, op: '\\cdot (-1)' },
            { tex: `b = ${f.n(k.b)}` },
          ]}
        />
        <p>
          Die Gleichung lautet also <Tex tex={`f(x) = ${poly(f, k)}`} />.
        </p>
        <p className="font-semibold text-slate-800">Schritt 2: y-Koordinate berechnen</p>
        <Tex display tex={yEinsetzen(f, k)} />
        <div className="font-bold text-slate-800 text-center text-lg">
          <Tex display tex={ergebnisTex(f, k)} />
        </div>
      </div>
    ),
  }
}

// ---------- 5b. Passenden Graphen finden ----------

const G_MAX = 7
function MiniGraph({ a, sx, sy }: { a: number; sx: number; sy: number }) {
  const s = 10
  const size = 2 * G_MAX * s
  const px = (x: number) => (x + G_MAX) * s
  const py = (y: number) => (G_MAX - y) * s
  const pts: string[] = []
  for (let x = -G_MAX; x <= G_MAX; x += 0.1) {
    const y = a * (x - sx) ** 2 + sy
    if (Math.abs(y) <= G_MAX + 1) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`)
  }
  const ticks = Array.from({ length: 2 * G_MAX + 1 }, (_, i) => i - G_MAX)
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className="w-full max-w-[160px] mx-auto" role="img" aria-label="Parabel im Koordinatensystem">
      <defs>
        <clipPath id="mg-clip">
          <rect x={0} y={0} width={size} height={size} />
        </clipPath>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={0} x2={px(t)} y2={size} stroke="#e2e8f0" strokeWidth={0.8} />
          <line x1={0} y1={py(t)} x2={size} y2={py(t)} stroke="#e2e8f0" strokeWidth={0.8} />
        </g>
      ))}
      <line x1={0} y1={py(0)} x2={size} y2={py(0)} stroke="#334155" strokeWidth={1.2} />
      <line x1={px(0)} y1={0} x2={px(0)} y2={size} stroke="#334155" strokeWidth={1.2} />
      {[-6, -4, -2, 2, 4, 6].map((t) => (
        <g key={`l${t}`}>
          <text x={px(t)} y={py(0) + 9} fontSize={7} textAnchor="middle" fill="#64748b">{t}</text>
          <text x={px(0) - 3} y={py(t) + 2.5} fontSize={7} textAnchor="end" fill="#64748b">{t}</text>
        </g>
      ))}
      <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2} clipPath="url(#mg-clip)" />
      <circle cx={px(sx)} cy={py(sy)} r={2.8} fill="#dc2626" />
    </svg>
  )
}

function graphZuordnen(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level, { ganzS: true, xsNicht0: true, ysNicht0: true, max: [5, 6] })
  const a = val(k.a)
  const kandidaten = shuffle([
    { sx: val(k.xs), sy: val(k.ys), richtig: true },
    { sx: -val(k.xs), sy: val(k.ys), richtig: false },
    { sx: val(k.xs), sy: -val(k.ys), richtig: false },
  ])
  const namen = ['A', 'B', 'C']
  return {
    titel: 'Passenden Graphen finden',
    auftrag: (
      <>
        <p className="text-slate-700">Berechne den Scheitelpunkt S. Welcher der drei Graphen gehört zu dieser Funktion?</p>
        <Gleichung tex={`f(x) = ${poly(f, k)}`} />
      </>
    ),
    felder: [
      punkt(k),
      {
        kind: 'choice',
        id: 'graph',
        label: 'Welcher Graph gehört zu f?',
        grafisch: true,
        options: kandidaten.map((g, i) => (
          <span key={i} className="block">
            <span className="block font-bold mb-1">Graph {namen[i]}</span>
            <MiniGraph a={a} sx={g.sx} sy={g.sy} />
          </span>
        )),
        correct: kandidaten.findIndex((g) => g.richtig),
        hint: <>Das ist nicht der richtige Graph. Vergleiche den roten Scheitelpunkt jedes Graphen mit deinem berechneten S.</>,
      },
    ],
    loesung: (
      <Loesungsweg f={f} k={k}>
        <p className="text-center">
          Richtig ist <strong>Graph {namen[kandidaten.findIndex((g) => g.richtig)]}</strong>: Nur dort liegt der Scheitelpunkt bei <Tex tex={ergebnisTex(f, k)} />.
        </p>
      </Loesungsweg>
    ),
  }
}

// ---------- 6. Fehler finden ----------

function fehlerFinden(level: RechenLevel): Aufgabe {
  const f = fmtFuer(level)
  const k = koeff(level, { xsNicht0: true })
  const fehlerSchritt = pick([1, 2, 3] as const)
  const quadratFehler = k.xs.n < 0

  // Werte im (fehlerhaften) Lösungsweg
  const cF = fehlerSchritt === 1 ? neg(k.c) : k.c
  const xF = fehlerSchritt === 2 ? neg(k.xs) : k.xs
  let t1 = mul(k.a, mul(xF, xF))
  let t2 = mul(k.b, xF)
  if (fehlerSchritt === 3) {
    if (quadratFehler) t1 = neg(t1)
    else t2 = neg(t2)
  }
  const yF = add(add(t1, t2), cF)

  const schritt1 = `a = ${f.n(k.a)},\\quad b = ${f.n(k.b)},\\quad c = ${f.n(cF)}`
  const schritt2 =
    fehlerSchritt === 2
      ? `x_S = -\\frac{b}{2 \\cdot a} = -\\frac{${f.n(k.b)}}{2 \\cdot ${np(f, k.a)}} = \\frac{${f.n(k.b)}}{${f.n(mul(q(2), k.a))}} = ${f.n(xF)}`
      : `x_S = -\\frac{b}{2 \\cdot a} = -\\frac{${f.n(k.b)}}{2 \\cdot ${np(f, k.a)}} = \\frac{${f.n(neg(k.b))}}{${f.n(mul(q(2), k.a))}} = ${f.n(xF)}`
  const schritt3 = `\\begin{aligned} y_S &= f\\left(${f.n(xF)}\\right) = ${f.n(k.a)} \\cdot ${np(f, xF)}^2 ${sg(f, k.b)} \\cdot ${np(f, xF)} ${sg(f, cF)} \\\\ &= ${f.n(t1)} ${sg(f, t2)} ${sg(f, cF)} = ${f.n(yF)} \\end{aligned}`

  const erklaerung =
    fehlerSchritt === 1 ? (
      <>
        In Schritt 1 wurde <Tex tex="c" /> mit dem falschen Vorzeichen abgelesen: Richtig ist <Tex tex={`c = ${f.n(k.c)}`} />.
      </>
    ) : fehlerSchritt === 2 ? (
      <>
        In Schritt 2 ist das Minus vor dem Bruch verloren gegangen: <Tex tex={`-\\frac{${f.n(k.b)}}{${f.n(mul(q(2), k.a))}} = ${f.n(k.xs)}`} />.
      </>
    ) : quadratFehler ? (
      <>
        In Schritt 3 wurde falsch quadriert: Das Quadrat einer negativen Zahl ist positiv, <Tex tex={`${np(f, k.xs)}^2 = ${f.n(mul(k.xs, k.xs))}`} />.
      </>
    ) : (
      <>
        In Schritt 3 ist beim Produkt <Tex tex={`${f.n(k.b)} \\cdot ${np(f, k.xs)}`} /> das Vorzeichen falsch: Richtig ist <Tex tex={f.n(mul(k.b, k.xs))} />.
      </>
    )

  return {
    titel: 'Fehler finden',
    auftrag: (
      <>
        <p className="text-slate-700">Ein Mitschüler hat den Scheitelpunkt von</p>
        <Gleichung tex={`f(x) = ${poly(f, k)}`} />
        <p className="text-slate-700 mb-2">berechnet. Leider hat sich ein Fehler eingeschlichen. In welchem Schritt steckt er? Gib danach den richtigen Scheitelpunkt an.</p>
        <div className="bk-taskbox text-left text-slate-700 space-y-2 mb-4">
          <p className="font-semibold text-slate-800">Schritt 1: Ablesen</p>
          <Tex display tex={schritt1} />
          <p className="font-semibold text-slate-800">Schritt 2: x-Koordinate</p>
          <Tex display tex={schritt2} />
          <p className="font-semibold text-slate-800">Schritt 3: y-Koordinate</p>
          <Tex display tex={schritt3} />
          <p className="font-semibold text-slate-800 text-center">
            Ergebnis: <Tex tex={`S\\left(${f.n(xF)} \\mid ${f.n(yF)}\\right)`} />
          </p>
        </div>
      </>
    ),
    felder: [
      {
        kind: 'choice',
        id: 'schritt',
        label: 'In welchem Schritt steckt der Fehler?',
        options: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
        correct: fehlerSchritt - 1,
        hint: <>Dieser Schritt stimmt. Rechne jeden Schritt selbst nach: Vorzeichen beim Ablesen, das Minus in der Formel und das Quadrieren.</>,
      },
      punkt(k),
    ],
    loesung: (
      <Loesungsweg f={f} k={k} vorab={<p className="font-semibold text-slate-800">{erklaerung}</p>} />
    ),
  }
}

// ---------- 7. Sachaufgaben: Scheitelpunkt berechnen und geometrisch deuten ----------

type SkizzenObjekt =
  | { typ: 'fahrzeug'; x: number; h: number; label: string }
  | { typ: 'linie'; y: number; label: string }
  | { typ: 'mast'; x: number; h: number; label?: string }

/** Skizze der Situation (nicht maßstabsgetreu): Parabel über dem Boden bzw. Wasser, dazu Fahrzeuge, Masten oder Höhenlinien */
function Skizze({ k, x1, objekte = [], wasser, v = 'x' }: { k: Koeff; x1: number; objekte?: SkizzenObjekt[]; wasser?: boolean; v?: string }) {
  const W = 320
  const H = 170
  const pad = 24
  const fx = (x: number) => val(k.a) * x * x + val(k.b) * x + val(k.c)
  const hoehen = [fx(0), fx(x1), val(k.ys), ...objekte.map((o) => (o.typ === 'linie' ? o.y : o.h))]
  const yMax = Math.max(...hoehen) * 1.18
  const px = (x: number) => pad + (x / x1) * (W - 2 * pad)
  const py = (y: number) => H - pad - (y / yMax) * (H - 2 * pad)
  const pts: string[] = []
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * x1
    const y = fx(x)
    if (y >= -1e-9) pts.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`)
  }
  return (
    <figure className="my-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto" role="img" aria-label="Skizze der Situation">
        <line x1={pad - 10} y1={py(0)} x2={W - pad + 10} y2={py(0)} stroke={wasser ? '#0284c7' : '#334155'} strokeWidth={wasser ? 3 : 2} />
        <text x={W - pad + 8} y={py(0) + 14} fontSize={10} textAnchor="end" fill="#64748b">{v}</text>
        {objekte.map((o, i) =>
          o.typ === 'linie' ? (
            <g key={i}>
              <line x1={pad - 10} y1={py(o.y)} x2={W - pad + 10} y2={py(o.y)} stroke="#c2410c" strokeWidth={1.5} strokeDasharray="6 4" />
              <text x={W - pad + 8} y={py(o.y) - 5} fontSize={11} fontWeight="bold" textAnchor="end" fill="#c2410c">{o.label}</text>
            </g>
          ) : o.typ === 'mast' ? (
            <g key={i}>
              <line x1={px(o.x)} y1={py(0)} x2={px(o.x)} y2={py(o.h)} stroke="#475569" strokeWidth={4} />
              {o.label && <text x={px(o.x) + (o.x < x1 / 2 ? 6 : -6)} y={py(o.h / 2)} fontSize={11} textAnchor={o.x < x1 / 2 ? 'start' : 'end'} fill="#475569">{o.label}</text>}
            </g>
          ) : (
            <g key={i}>
              <rect x={px(o.x) - 22} y={py(o.h)} width={44} height={py(0) - py(o.h)} rx={3} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />
              <text x={px(o.x)} y={py(o.h / 2) + 4} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#92400e">{o.label}</text>
            </g>
          ),
        )}
        <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      </svg>
      <figcaption className="text-xs text-slate-500 text-center">Skizze, nicht maßstabsgetreu</figcaption>
    </figure>
  )
}

interface Kontext {
  titel: string
  text: React.ReactNode
  /** Text unter der Funktionsgleichung */
  zusatz?: React.ReactNode
  fn: string
  v: string
  k: Koeff
  skizze: React.ReactNode
  /** Felder für die Koordinaten des Scheitelpunkts */
  frageX: string
  einheitX: string
  frageY: string
  einheitY: string
  /** Deutung: Ja/Nein-Entscheidung oder ein Abstand */
  deutung: Feld
  /** Erklärung der Deutung im Lösungsweg */
  erklaerung: React.ReactNode
  antwort: string
}

const dez = (x: number) => q(Math.round(x * 100), 100)
/** Zahl im Fließtext mit Komma */
const zahl = (x: Q | number) => String(round2(typeof x === 'number' ? x : val(x))).replace('.', ',')
const JA_NEIN = ['Ja', 'Nein']
/** Zufälliger Unterschied zum Scheitelwert, mal darüber, mal darunter */
const knapp = (werte: number[]) => pick(werte) * pick([1, -1])

const vergleichHint = (
  <>
    Noch nicht richtig. Vergleiche die geforderte Höhe mit der y-Koordinate des Scheitelpunkts, denn das ist die größte bzw. kleinste Höhe.
  </>
)

const KONTEXTE: (() => Kontext)[] = [
  // Tunnel: passt das Fahrzeug durch?
  () => {
    for (;;) {
      const w = pick([8, 10, 12])
      const a = dez(pick([-0.15, -0.18, -0.2, -0.24, -0.25, -0.3, -0.35]))
      const k = ausXsC(a, q(w / 2), q(0))
      if (!dez2(k.ys) || val(k.ys) < 3.5 || val(k.ys) > 7) continue
      const fahrzeug = pick(['Lkw', 'Reisebus', 'Wohnmobil'])
      const hoehe = round2(val(k.ys) + knapp([0.1, 0.2, 0.3, 0.4]))
      const passt = val(k.ys) > hoehe
      return {
        titel: 'Tunnel',
        text: (
          <>
            Eine Straße führt durch einen parabelförmigen Tunnel. Die Höhe <Tex tex="h" /> der Tunneldecke über der Fahrbahn (in m) in der Entfernung <Tex tex="x" /> vom linken
            Tunnelrand (in m) beträgt:
          </>
        ),
        zusatz: <>Ein {fahrzeug} ist {zahl(hoehe)} m hoch und fährt genau in der Tunnelmitte.</>,
        fn: 'h',
        v: 'x',
        k,
        skizze: <Skizze k={k} x1={w} objekte={[{ typ: 'fahrzeug', x: w / 2, h: val(k.ys), label: fahrzeug }]} />,
        frageX: 'In welcher Entfernung vom linken Rand ist der Tunnel am höchsten?',
        einheitX: 'm',
        frageY: 'Wie hoch ist der Tunnel an dieser Stelle?',
        einheitY: 'm',
        deutung: { kind: 'choice', id: 'deutung', label: `Passt der ${fahrzeug} (${zahl(hoehe)} m) unter der Tunneldecke durch?`, options: JA_NEIN, correct: passt ? 0 : 1, hint: vergleichHint },
        erklaerung: (
          <>
            Der Tunnel ist an seiner höchsten Stelle {zahl(k.ys)} m hoch. Der {fahrzeug} ist {zahl(hoehe)} m hoch:{' '}
            <Tex tex={`${tn(val(k.ys))} ${passt ? '>' : '<'} ${tn(hoehe)}`} />.
          </>
        ),
        antwort: passt
          ? `Der ${fahrzeug} passt durch, oben bleiben ${zahl(val(k.ys) - hoehe)} m Platz.`
          : `Der ${fahrzeug} passt nicht durch, er ist ${zahl(hoehe - val(k.ys))} m zu hoch.`,
      }
    }
  },
  // Brückenbogen über einem Fluss: Platz über dem Schiffsmast
  () => {
    for (;;) {
      const xs = pick([10, 15, 20, 25])
      const a = dez(pick([-0.02, -0.03, -0.04, -0.05]))
      const k = ausXsC(a, q(xs), q(0))
      if (!dez2(k.ys) || val(k.ys) < 5 || val(k.ys) > 20) continue
      const mast = round2(val(k.ys) - pick([0.5, 0.75, 1, 1.5, 2, 2.5]))
      const platz = dez(val(k.ys) - mast)
      return {
        titel: 'Brücke und Schiff',
        text: (
          <>
            Eine Brücke überspannt einen Fluss mit einem parabelförmigen Bogen. Die Höhe <Tex tex="h" /> des Bogens über dem Wasser (in m) in der Entfernung <Tex tex="x" /> vom linken
            Ufer (in m) beträgt:
          </>
        ),
        zusatz: <>Ein Segelschiff mit einer Masthöhe von {zahl(mast)} m fährt genau unter der höchsten Stelle des Bogens hindurch.</>,
        fn: 'h',
        v: 'x',
        k,
        skizze: <Skizze k={k} x1={2 * xs} wasser objekte={[{ typ: 'mast', x: xs, h: val(k.ys) * 0.8, label: 'Mast' }]} />,
        frageX: 'In welcher Entfernung vom linken Ufer ist der Bogen am höchsten?',
        einheitX: 'm',
        frageY: 'Wie hoch ist der Bogen dort über dem Wasser?',
        einheitY: 'm',
        deutung: {
          kind: 'num',
          id: 'deutung',
          label: 'Wie viel Platz bleibt zwischen Mastspitze und Brückenbogen?',
          unit: 'm',
          correct: platz,
          hint: <>Noch nicht richtig. Ziehe die Masthöhe von der Höhe des Bogens an seiner höchsten Stelle ab.</>,
        },
        erklaerung: <Tex tex={`${tn(val(k.ys))} - ${tn(mast)} = ${tn(val(platz))}`} />,
        antwort: `Zwischen Mastspitze und Brückenbogen bleiben ${zahl(platz)} m Platz.`,
      }
    }
  },
  // Stromleitung zwischen zwei Masten: Mindesthöhe eingehalten?
  () => {
    for (;;) {
      const xs = pick([10, 15, 20, 25])
      const a = dez(pick([0.01, 0.02, 0.03, 0.04]))
      const c = q(randomInt(20, 10))
      const k = ausXsC(a, q(xs), c)
      if (!dez2(k.ys) || val(k.ys) < 4 || val(k.ys) > val(c) - 2) continue
      const mindest = round2(val(k.ys) + knapp([0.2, 0.3, 0.5]))
      const ok = val(k.ys) > mindest
      return {
        titel: 'Stromleitung',
        text: (
          <>
            Zwischen zwei gleich hohen Masten hängt eine Stromleitung über einem Feld. Ihre Höhe <Tex tex="h" /> über dem Boden (in m) in der Entfernung <Tex tex="x" /> vom linken Mast
            (in m) beträgt:
          </>
        ),
        zusatz: <>Vorgeschrieben ist, dass die Leitung überall mindestens {zahl(mindest)} m über dem Boden hängt.</>,
        fn: 'h',
        v: 'x',
        k,
        skizze: (
          <Skizze
            k={k}
            x1={2 * xs}
            objekte={[
              { typ: 'mast', x: 0, h: val(c) },
              { typ: 'mast', x: 2 * xs, h: val(c) },
              { typ: 'linie', y: val(k.ys), label: `${zahl(mindest)} m` },
            ]}
          />
        ),
        frageX: 'In welcher Entfernung vom linken Mast hängt die Leitung am tiefsten?',
        einheitX: 'm',
        frageY: 'Wie hoch hängt sie an dieser Stelle?',
        einheitY: 'm',
        deutung: { kind: 'choice', id: 'deutung', label: `Hält die Leitung die Mindesthöhe von ${zahl(mindest)} m ein?`, options: JA_NEIN, correct: ok ? 0 : 1, hint: vergleichHint },
        erklaerung: (
          <>
            Weil <Tex tex="a > 0" /> ist, ist S der <strong>tiefste</strong> Punkt der Leitung. Dort hängt sie {zahl(k.ys)} m hoch:{' '}
            <Tex tex={`${tn(val(k.ys))} ${ok ? '>' : '<'} ${tn(mindest)}`} />.
          </>
        ),
        antwort: ok
          ? `Die Leitung hält die Vorschrift ein, sie hängt an der tiefsten Stelle noch ${zahl(val(k.ys) - mindest)} m höher als vorgeschrieben.`
          : `Die Leitung hängt an der tiefsten Stelle ${zahl(mindest - val(k.ys))} m zu tief, die Vorschrift ist nicht erfüllt.`,
      }
    }
  },
  // Feuerwerksrakete: Mindesthöhe erreicht?
  () => {
    const xs = dez(pick([3, 3.5, 4, 4.5, 5]))
    const k = ausXsC(q(-5), xs, dez(pick([0.5, 1, 1.5])))
    const mindest = Math.round(val(k.ys)) + knapp([2, 3, 5])
    const ok = val(k.ys) > mindest
    return {
      titel: 'Feuerwerk',
      text: (
        <>
          Eine Feuerwerksrakete wird senkrecht nach oben geschossen. Ihre Höhe <Tex tex="h" /> (in m) nach <Tex tex="t" /> Sekunden beträgt:
        </>
      ),
      zusatz: <>Die Rakete zündet an ihrem höchsten Punkt. Damit alle Zuschauer das Feuerwerk über den Bäumen sehen, muss sie dort mindestens {mindest} m hoch sein.</>,
      fn: 'h',
      v: 't',
      k,
      skizze: <Skizze k={k} x1={2 * val(xs)} v="t" objekte={[{ typ: 'linie', y: val(k.ys), label: `${mindest} m` }]} />,
      frageX: 'Nach wie vielen Sekunden zündet die Rakete?',
      einheitX: 's',
      frageY: 'In welcher Höhe zündet sie?',
      einheitY: 'm',
      deutung: { kind: 'choice', id: 'deutung', label: `Erreicht die Rakete die Mindesthöhe von ${mindest} m?`, options: JA_NEIN, correct: ok ? 0 : 1, hint: vergleichHint },
      erklaerung: (
        <>
          Die Rakete erreicht höchstens {zahl(k.ys)} m: <Tex tex={`${tn(val(k.ys))} ${ok ? '>' : '<'} ${mindest}`} />.
        </>
      ),
      antwort: ok
        ? `Die Rakete zündet nach ${zahl(xs)} s in ${zahl(k.ys)} m Höhe und erreicht damit die Mindesthöhe.`
        : `Die Rakete zündet nach ${zahl(xs)} s in nur ${zahl(k.ys)} m Höhe, das sind ${zahl(mindest - val(k.ys))} m zu wenig.`,
    }
  },
  // Springbrunnen unter einem Glasdach
  () => {
    for (;;) {
      const a = dez(pick([-0.25, -0.5, -1]))
      const xs = dez(pick([1, 1.5, 2, 2.5]))
      const k = ausXsC(a, xs, dez(pick([0.5, 1])))
      if (!dez2(k.b) || !dez2(k.ys) || val(k.ys) < 2 || val(k.ys) > 6) continue
      const dach = round2(val(k.ys) + knapp([0.1, 0.2, 0.3, 0.4]))
      const stoesst = val(k.ys) > dach
      const ende = (-val(k.b) - Math.sqrt(val(k.b) ** 2 - 4 * val(k.a) * val(k.c))) / (2 * val(k.a))
      return {
        titel: 'Springbrunnen',
        text: (
          <>
            In einem Einkaufszentrum steht ein Springbrunnen unter einem Glasdach, das {zahl(dach)} m hoch ist. Die Höhe <Tex tex="h" /> des Wasserstrahls (in m) in der waagrechten
            Entfernung <Tex tex="x" /> von der Düse (in m) beträgt:
          </>
        ),
        fn: 'h',
        v: 'x',
        k,
        skizze: <Skizze k={k} x1={ende} objekte={[{ typ: 'linie', y: val(k.ys), label: `Dach ${zahl(dach)} m` }]} />,
        frageX: 'In welcher Entfernung von der Düse ist der Strahl am höchsten?',
        einheitX: 'm',
        frageY: 'Wie hoch ist der Strahl dort?',
        einheitY: 'm',
        deutung: { kind: 'choice', id: 'deutung', label: 'Spritzt der Strahl an das Glasdach?', options: JA_NEIN, correct: stoesst ? 0 : 1, hint: vergleichHint },
        erklaerung: (
          <>
            Der Strahl wird höchstens {zahl(k.ys)} m hoch, das Dach ist {zahl(dach)} m hoch: <Tex tex={`${tn(val(k.ys))} ${stoesst ? '>' : '<'} ${tn(dach)}`} />.
          </>
        ),
        antwort: stoesst
          ? `Der Strahl spritzt an das Dach, er wäre ohne Dach ${zahl(val(k.ys) - dach)} m höher.`
          : `Der Strahl erreicht das Dach nicht, es bleiben ${zahl(dach - val(k.ys))} m Abstand.`,
      }
    }
  },
  // Basketball: wie hoch über dem Korb?
  () => {
    for (;;) {
      const a = dez(pick([-0.2, -0.25, -0.4, -0.5]))
      const xs = dez(pick([2, 2.5, 3]))
      const k = ausXsC(a, xs, dez(pick([2, 2.1, 2.2])))
      if (!dez2(k.b) || !dez2(k.ys) || val(k.ys) < 3.3 || val(k.ys) > 5.5) continue
      const ueber = dez(val(k.ys) - 3.05)
      return {
        titel: 'Basketball',
        text: (
          <>
            Bei einem Wurf auf den Korb beschreibt der Ball eine Parabel. Seine Höhe <Tex tex="h" /> (in m) in der waagrechten Entfernung <Tex tex="x" /> vom Abwurfpunkt (in m) beträgt:
          </>
        ),
        zusatz: <>Der Korbring hängt in 3,05 m Höhe.</>,
        fn: 'h',
        v: 'x',
        k,
        skizze: <Skizze k={k} x1={2 * val(xs) + 0.6} objekte={[{ typ: 'linie', y: 3.05, label: 'Korb 3,05 m' }]} />,
        frageX: 'In welcher waagrechten Entfernung vom Abwurfpunkt ist der Ball am höchsten?',
        einheitX: 'm',
        frageY: 'Wie hoch ist der Ball an seinem höchsten Punkt?',
        einheitY: 'm',
        deutung: {
          kind: 'num',
          id: 'deutung',
          label: 'Wie viel höher als der Korbring ist der Ball an seinem höchsten Punkt?',
          unit: 'm',
          correct: ueber,
          hint: <>Noch nicht richtig. Ziehe die Höhe des Korbrings (3,05 m) von der größten Höhe des Balls ab.</>,
        },
        erklaerung: <Tex tex={`${tn(val(k.ys))} - 3{,}05 = ${tn(val(ueber))}`} />,
        antwort: `Der Ball fliegt an seinem höchsten Punkt ${zahl(ueber)} m über den Korbring.`,
      }
    }
  },
  // Halfpipe: Tiefe der Rampe
  () => {
    for (;;) {
      const a = dez(pick([0.2, 0.25, 0.4, 0.5]))
      const xs = dez(pick([2, 2.5, 3, 4]))
      const k = ausXsC(a, xs, dez(pick([2, 2.5, 3, 3.5, 4])))
      if (!dez2(k.ys) || val(k.ys) < 0.2 || val(k.ys) > 1.2) continue
      const tiefe = sub(k.c, k.ys)
      return {
        titel: 'Halfpipe',
        text: (
          <>
            Im Querschnitt hat eine Halfpipe im Skatepark die Form einer Parabel. Die Höhe <Tex tex="h" /> der Fahrfläche über dem Boden (in m) in der Entfernung <Tex tex="x" /> vom
            linken Rand (in m) beträgt:
          </>
        ),
        fn: 'h',
        v: 'x',
        k,
        skizze: <Skizze k={k} x1={2 * val(xs)} objekte={[{ typ: 'mast', x: 0, h: val(k.c) }, { typ: 'mast', x: 2 * val(xs), h: val(k.c) }]} />,
        frageX: 'In welcher Entfernung vom linken Rand liegt die tiefste Stelle?',
        einheitX: 'm',
        frageY: 'Wie hoch liegt die tiefste Stelle über dem Boden?',
        einheitY: 'm',
        deutung: {
          kind: 'num',
          id: 'deutung',
          label: 'Wie groß ist der Höhenunterschied zwischen dem Rand und der tiefsten Stelle?',
          unit: 'm',
          correct: tiefe,
          hint: (
            <>
              Noch nicht richtig. Der Rand liegt bei <Tex tex="x = 0" />, also in der Höhe <Tex tex="h(0) = c" />. Ziehe davon die Höhe der tiefsten Stelle ab.
            </>
          ),
        },
        erklaerung: (
          <>
            Der Rand ist <Tex tex={`h(0) = ${tn(val(k.c))}`} /> m hoch, die tiefste Stelle {zahl(k.ys)} m: <Tex tex={`${tn(val(k.c))} - ${tn(val(k.ys))} = ${tn(val(tiefe))}`} />.
          </>
        ),
        antwort: `Die tiefste Stelle liegt ${zahl(xs)} m vom linken Rand entfernt und ${zahl(tiefe)} m tiefer als der Rand.`,
      }
    }
  },
]

export const ANZAHL_KONTEXTE = KONTEXTE.length

function sachaufgabe(kontextNr?: number): Aufgabe {
  const kx = (kontextNr === undefined ? pick(KONTEXTE) : KONTEXTE[kontextNr % KONTEXTE.length])()
  const f = DEZ
  const { k, fn, v } = kx
  return {
    titel: `Sachaufgabe: ${kx.titel}`,
    auftrag: (
      <>
        <p className="text-slate-700 text-left">{kx.text}</p>
        <Gleichung tex={`${fn}(${v}) = ${poly(f, k, v)}`} />
        {kx.zusatz && <p className="text-slate-700 text-left">{kx.zusatz}</p>}
        {kx.skizze}
      </>
    ),
    felder: [
      {
        kind: 'num',
        id: 'xs',
        label: kx.frageX,
        unit: kx.einheitX,
        correct: k.xs,
        hint: (
          <>
            Noch nicht richtig. Gesucht ist die {v}-Koordinate des Scheitelpunkts: <Tex tex={`${v}_S = -\\frac{b}{2a}`} />.
          </>
        ),
      },
      {
        kind: 'num',
        id: 'ys',
        label: kx.frageY,
        unit: kx.einheitY,
        correct: k.ys,
        hint: (
          <>
            Noch nicht richtig. Setze <Tex tex={`${v}_S`} /> in <Tex tex={`${fn}(${v})`} /> ein. Das ist die y-Koordinate des Scheitelpunkts.
          </>
        ),
      },
      kx.deutung,
    ],
    loesung: (
      <Loesungsweg f={f} k={k} fn={fn} v={v} ohneErgebnis>
        <p className="font-semibold text-slate-800">
          Scheitelpunkt: <Tex tex={`S\\left(${f.n(k.xs)} \\mid ${f.n(k.ys)}\\right)`} />
        </p>
        <div>
          <p className="font-semibold text-slate-800">Schritt 3: Ergebnis deuten</p>
          <p>{kx.erklaerung}</p>
        </div>
        <p className="font-bold text-slate-800">Antwort: {kx.antwort}</p>
      </Loesungsweg>
    ),
  }
}

// ---------- Runde: Reihenfolge von geführt bis frei ----------

export const ANZAHL_AUFGABEN = 7

/** Aufgabe für Platz `nr` (0–6) einer Runde; bei Platz 3 und 5 wechselt das Format zufällig */
export function neueAufgabe(level: Level, nr: number): Aufgabe {
  if (level === 'anwendung') return sachaufgabe(nr)
  switch (nr) {
    case 0:
      return lueckentext(level)
    case 1:
      return nurY(level)
    case 2:
      return Math.random() < 0.5 ? ungeordnet(level) : sonderfall(level)
    case 3:
      return schaetzen(level)
    case 4:
      return Math.random() < 0.5 ? rueckwaerts(level) : graphZuordnen(level)
    case 5:
      return fehlerFinden(level)
    default:
      return sachaufgabe()
  }
}
