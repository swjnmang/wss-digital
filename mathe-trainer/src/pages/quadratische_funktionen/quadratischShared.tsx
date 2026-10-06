// Gemeinsame Bausteine für die Rechenseiten zu quadratischen Funktionen
// (Nullstellen, Schnittpunkte): exakte Bruchrechnung, LaTeX-Ausgabe, Eingabeauswertung,
// Lösungstabelle und Lösungsweg mit der Mitternachtsformel.
import React, { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'

export const GREEN = '#15803d'
export const RED = '#b91c1c'
export const BLUE = '#1d4ed8'

export const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded shadow-sm transition-colors'
export const btnSecondary = 'bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-5 rounded border border-slate-300 transition-colors'
export const panel = 'text-center bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200'

export const PRAISE = [
  'Richtig! Super gemacht!',
  'Klasse, das stimmt!',
  'Perfekt gelöst!',
  'Sehr gut, weiter so!',
  'Stark! Genau richtig!',
  'Prima, du hast es drauf!',
]

export function randomInt(max: number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const round2 = (n: number) => Math.round(n * 100) / 100

// ---------- Brüche (exakt rechnen, damit Lösungswege sauber aussehen) ----------

export interface Q {
  n: number
  d: number
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function q(n: number, d = 1): Q {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}

export const add = (x: Q, y: Q) => q(x.n * y.d + y.n * x.d, x.d * y.d)
export const sub = (x: Q, y: Q) => add(x, neg(y))
export const mul = (x: Q, y: Q) => q(x.n * y.n, x.d * y.d)
export const neg = (x: Q) => q(-x.n, x.d)
export const val = (x: Q) => x.n / x.d
export const isInt = (x: Q) => x.d === 1
export const eqQ = (x: Q, y: Q) => x.n === y.n && x.d === y.d

/** Wurzel eines Bruchs, falls sie wieder ein Bruch ist (sonst null) */
export function sqrtQ(x: Q): Q | null {
  if (x.n < 0) return null
  const rn = Math.round(Math.sqrt(x.n))
  const rd = Math.round(Math.sqrt(x.d))
  return rn * rn === x.n && rd * rd === x.d ? q(rn, rd) : null
}

/** −6 … 6 in Halbschritten */
export const HALVES = Array.from({ length: 25 }, (_, i) => q(i - 12, 2))

// ---------- LaTeX-Hilfen ----------

/** Dezimalzahl mit deutschem Komma ({,} verhindert den Abstand nach dem Komma) */
export const tn = (n: number) => {
  const r = round2(n)
  return (r < 0 ? '-' : '') + String(Math.abs(r)).replace('.', '{,}')
}

/** "=" bei glatten Werten, sonst "≈" */
export const eqSign = (n: number) => (Math.abs(n - round2(n)) < 1e-9 ? '=' : '\\approx')

/** Bruch als LaTeX, z. B. "-\frac{3}{2}" oder "4" */
export const tq = (x: Q) => (isInt(x) ? String(x.n) : `${x.n < 0 ? '-' : ''}\\frac{${Math.abs(x.n)}}{${x.d}}`)
/** Bruch in Klammern, wenn negativ (für Einsetzen) */
export const tqp = (x: Q) => (x.n < 0 ? `\\left(${tq(x)}\\right)` : tq(x))
/** Bruch mit Rechenzeichen davor, z. B. "+ 3" oder "- \frac{1}{2}" */
export const sgq = (x: Q) => (x.n < 0 ? `- ${tq(neg(x))}` : `+ ${tq(x)}`)

/** Koeffizient vor x bzw. x² (1 und −1 werden weggelassen) */
export const coeff = (x: Q) => (x.n === x.d ? '' : x.n === -x.d ? '-' : tq(x))

/** ax² + bx + c als LaTeX (ohne "y ="), Summanden mit 0 entfallen */
export function polyTex(a: Q, b: Q, c: Q) {
  const parts: string[] = []
  if (a.n !== 0) parts.push(`${coeff(a)}x^2`)
  if (b.n !== 0) parts.push(parts.length ? `${b.n < 0 ? '-' : '+'} ${coeff(q(Math.abs(b.n), b.d))}x` : `${coeff(b)}x`)
  if (c.n !== 0 || parts.length === 0) parts.push(parts.length ? sgq(c) : tq(c))
  return parts.join(' ')
}

/** Gerade mx + t als LaTeX (ohne "y =") */
export const lineTex = (m: Q, t: Q) => polyTex(q(0), m, t)

export const bracketTex = (xs: number) => `(x ${xs < 0 ? '+' : '-'} ${Math.abs(xs)})^2`

/** a(x − x_S)² + y_S als LaTeX (ohne "y =") */
export function vertexTex(a: Q, xs: number, ys: Q) {
  return `${coeff(a)}${bracketTex(xs)}${ys.n !== 0 ? ` ${sgq(ys)}` : ''}`
}

/** KaTeX-Formel; display = abgesetzt (bei Platzmangel horizontal scrollbar) */
export function Tex({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, displayMode: display }), [tex, display])
  return display ? (
    <div className={`overflow-x-auto overflow-y-hidden ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Mehrere Zeilen einer Umformung, rechts daneben die Rechenoperation */
export function Steps({ lines }: { lines: { tex: string; op?: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto">
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td className="py-1 pr-6 text-left whitespace-nowrap">
                <Tex tex={`\\displaystyle ${l.tex}`} />
              </td>
              <td className="py-1 text-left whitespace-nowrap" style={{ color: '#c2410c' }}>
                {l.op && <Tex tex={`| \\; ${l.op}`} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Erklärtabelle: links die Lösungsschritte (grau), rechts das Beispiel. Auf schmalen Bildschirmen untereinander. */
export function StepTable({ rows }: { rows: { step: React.ReactNode; example: React.ReactNode }[] }) {
  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden text-left">
      <div className="hidden sm:grid grid-cols-2 bg-slate-200 font-bold text-slate-800 text-center border-b border-slate-300">
        <div className="p-2 border-r border-slate-300">Lösungsschritte</div>
        <div className="p-2">Lösung Beispielaufgabe</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className={`grid grid-cols-1 sm:grid-cols-2 ${i > 0 ? 'border-t border-slate-300' : ''}`}>
          <div className="bg-slate-100 p-3 text-slate-800 sm:border-r border-slate-300">{r.step}</div>
          <div className="p-3 text-slate-800 min-w-0">{r.example}</div>
        </div>
      ))}
    </div>
  )
}

// ---------- Eingaben auswerten ----------

/** Zahl oder Bruch ("-3/2"), Komma oder Punkt */
export function parseAnswer(raw: string) {
  const s = raw.trim()
  if (s.includes('/')) {
    const [num, den] = s.split('/')
    const v = parseFlexibleNumber(num) / parseFlexibleNumber(den)
    return Number.isFinite(v) ? v : NaN
  }
  return parseFlexibleNumber(s)
}

export type AnswerStatus = 'idle' | 'right' | 'wrong'

export const isIncomplete = (s: string) => {
  const t = s.trim()
  return t === '' || /^[-−–—‐+,./]$/.test(t) || /\/$/.test(t)
}

export const statusBorder = (status: AnswerStatus) =>
  status === 'right' ? 'border-green-500 bg-green-50 text-green-800' : status === 'wrong' ? 'border-red-500 bg-red-50 text-red-800' : 'border-slate-300'

// ---------- Mitternachtsformel ----------

/** Lösungen von ax² + bx + c = 0 in der Reihenfolge der Mitternachtsformel: x₁ mit +, x₂ mit − */
export function solveQuadratic(a: Q, b: Q, c: Q): number[] {
  const D = val(b) * val(b) - 4 * val(a) * val(c)
  if (D < -1e-9) return []
  if (Math.abs(D) < 1e-9) return [-val(b) / (2 * val(a))]
  return [(-val(b) + Math.sqrt(D)) / (2 * val(a)), (-val(b) - Math.sqrt(D)) / (2 * val(a))]
}

export const discriminant = (a: Q, b: Q, c: Q) => sub(mul(b, b), mul(q(4), mul(a, c)))

/** Wurzel als LaTeX: exakt, wenn möglich, sonst als Wurzelzeichen */
export const sqrtTex = (x: Q) => {
  const r = sqrtQ(x)
  return r ? tq(r) : `\\sqrt{${tq(x)}}`
}

/**
 * Lösungsweg ax² + bx + c = 0 mit Diskriminante und Mitternachtsformel.
 * Die Lösungen x₁ (mit +) und x₂ (mit −) werden ausgerechnet; noun = "Nullstelle" bzw. "Schnittpunkt".
 */
export function MitternachtsSteps({ a, b, c, noun }: { a: Q; b: Q; c: Q; noun: 'Nullstelle' | 'Schnittpunkt' }) {
  const b2 = mul(b, b)
  const ac4 = mul(q(4), mul(a, c))
  const D = sub(b2, ac4)
  const twoA = mul(q(2), a)
  const r = sqrtQ(D)
  const plural = noun === 'Nullstelle' ? 'Nullstellen' : 'Schnittpunkte'
  const none = noun === 'Nullstelle' ? 'keine Nullstelle' : 'keinen Schnittpunkt'
  const one = noun === 'Nullstelle' ? 'genau eine Nullstelle' : 'genau einen Schnittpunkt (Berührpunkt)'
  return (
    <>
      <p>
        Ablesen: <Tex tex={`a = ${tq(a)},\\quad b = ${tq(b)},\\quad c = ${tq(c)}`} />
      </p>
      <p>Diskriminante (Wert unter der Wurzel):</p>
      <Tex display tex={`D = b^2 - 4ac = ${tqp(b)}^2 - 4 \\cdot ${tqp(a)} \\cdot ${tqp(c)} = ${tq(b2)} ${sgq(neg(ac4))} = \\mathbf{${tq(D)}}`} />
      <p>
        {D.n > 0 && <>Da <Tex tex="D > 0" /> ist, gibt es <strong>zwei {plural}</strong>.</>}
        {D.n === 0 && <>Da <Tex tex="D = 0" /> ist, gibt es <strong>{one}</strong>.</>}
        {D.n < 0 && <>Da <Tex tex="D < 0" /> ist, gibt es <strong>{none}</strong>: Aus einer negativen Zahl kann man keine Wurzel ziehen.</>}
      </p>
      {D.n === 0 && (
        <Tex display tex={`x = \\frac{-b}{2a} = \\frac{${tq(neg(b))}}{2 \\cdot ${tqp(a)}} = \\frac{${tq(neg(b))}}{${tq(twoA)}} = \\mathbf{${tn(-val(b) / val(twoA))}}`} />
      )}
      {D.n > 0 && (
        <>
          <Tex display tex={`x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{${tq(neg(b))} \\pm \\sqrt{${tq(D)}}}{2 \\cdot ${tqp(a)}} = \\frac{${tq(neg(b))} \\pm ${sqrtTex(D)}}{${tq(twoA)}}`} />
          {(['+', '-'] as const).map((op, i) => {
            const x = (val(neg(b)) + (op === '-' ? -1 : 1) * Math.sqrt(val(D))) / val(twoA)
            const num = r ? add(neg(b), op === '-' ? neg(r) : r) : null
            return (
              <div key={op}>
                <Tex
                  display
                  tex={`x_${i + 1} = \\frac{${tq(neg(b))} ${op} ${sqrtTex(D)}}{${tq(twoA)}} ${num ? `= \\frac{${tq(num)}}{${tq(twoA)}} ${eqSign(x)}` : '\\approx'} \\mathbf{${tn(x)}}`}
                />
              </div>
            )
          })}
        </>
      )}
    </>
  )
}

// ---------- Erklärvideo ----------

export function Video({ id, title }: { id: string; title: string }) {
  return (
    <>
      <h3 className="text-base font-bold text-slate-800 mt-5 mb-2 text-center">Erklärvideo</h3>
      <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-slate-200">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </>
  )
}
