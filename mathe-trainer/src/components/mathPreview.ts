// Wandelt eine Schülereingabe wie „3/4+x^2“ für die Vorschau der Mathe-Tastatur in LaTeX um:
// Brüche werden gestapelt, Exponenten hochgestellt. Die Eingabe selbst bleibt unverändert Text,
// damit die Auswertung der Trainer weiter funktioniert. Optional wird die Cursorposition markiert.
// Klammern um Zähler, Nenner oder Exponent entfallen in der Anzeige: (x+1)/2 → Bruch mit x+1 im Zähler.

type Tok = {
  t: 'num' | 'id' | 'op' | 'lp' | 'rp' | 'pow' | 'div' | 'sup'
  v: string
  start: number
  end: number
  before?: boolean // Cursor vor dem Token
  after?: boolean // Cursor nach dem Token
  at?: number // Cursor innerhalb einer Zahl
  slot?: boolean // Cursor im leeren Feld hinter „/“, „^“ bzw. „(“
}

const CARET = '\\textcolor{#e8590c}{\\rule[-0.2em]{0.09em}{1.15em}}'
const BOX = '\\textcolor{#9aa3b2}{\\square}'
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'

const OPS: Record<string, string> = {
  '+': '+', '-': '-', '−': '-', '–': '-', '*': '\\cdot ', '·': '\\cdot ', '×': '\\cdot ',
  ':': ':', '=': '=', '<': '<', '>': '>', '%': '\\%', '[': '[', ']': ']', '{': '\\{', '}': '\\}',
  '#': '\\#', '$': '\\$', '&': '\\&', '_': '\\_', '~': '\\sim ', '\\': '\\backslash ', '÷': ':',
}

function tokenize(s: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/\s/.test(c)) { i++; continue }
    const start = i
    if (/[0-9.,]/.test(c)) {
      while (i < s.length && /[0-9.,]/.test(s[i])) i++
      out.push({ t: 'num', v: s.slice(start, i), start, end: i })
    } else if (SUP.includes(c)) {
      while (i < s.length && SUP.includes(s[i])) i++
      out.push({ t: 'sup', v: s.slice(start, i), start, end: i })
    } else {
      i++
      const t: Tok['t'] = c === '(' ? 'lp' : c === ')' ? 'rp' : c === '^' ? 'pow' : c === '/' ? 'div' : /\p{L}/u.test(c) ? 'id' : 'op'
      out.push({ t, v: c, start, end: i })
    }
  }
  return out
}

function placeCaret(toks: Tok[], caret: number): boolean {
  const inside = toks.find((t) => t.t === 'num' && t.start < caret && caret < t.end)
  if (inside) { inside.at = caret - inside.start; return true }
  const prev = [...toks].reverse().find((t) => t.end <= caret)
  const next = toks.find((t) => t.start >= caret)
  if (!prev || prev.t === 'div' || prev.t === 'pow' || prev.t === 'lp') {
    if (next && (next.t === 'num' || next.t === 'id' || next.t === 'lp' || next.t === 'sup')) next.before = true
    else if (prev) prev.slot = true
    else if (next) next.before = true
    else return false
  } else {
    prev.after = true
  }
  return true
}

function esc(c: string) {
  if (OPS[c] !== undefined) return OPS[c]
  if (/\p{L}/u.test(c)) return c
  return `\\text{${c}}`
}

function num(v: string) {
  return v.replace(/,/g, '{,}')
}

export function toLatex(input: string, caret?: number): string {
  const toks = tokenize(input)
  const hasCaret = caret !== undefined && placeCaret(toks, caret)
  if (!toks.length) return hasCaret || caret !== undefined ? CARET : ''
  let pos = 0
  const peek = () => toks[pos]
  const wrap = (t: Tok, body: string) => (t.before ? CARET : '') + body + (t.after ? CARET : '')

  type Node = { tex: string; bare?: string } // bare: Inhalt einer Klammer ohne die Klammern

  const atom = (): Node => {
    const t = peek()
    const slot = toks[pos - 1]?.slot ? CARET : ''
    if (!t || !(t.t === 'num' || t.t === 'id' || t.t === 'lp')) return { tex: slot + (t?.before && t.t !== 'op' ? CARET : '') + BOX }
    pos++
    if (t.t === 'num') {
      const body = t.at !== undefined ? num(t.v.slice(0, t.at)) + CARET + num(t.v.slice(t.at)) : num(t.v)
      return { tex: slot + wrap(t, body) }
    }
    if (t.t === 'id') return { tex: slot + wrap(t, esc(t.v)) }
    const inner = (t.slot ? CARET : '') + seq()
    const close = peek()?.t === 'rp' ? toks[pos++] : null
    const body = `\\left(${inner || '\\,'}\\right${close ? ')' : '.'}`
    const tex = slot + (t.before ? CARET : '') + body + (close?.after ? CARET : '')
    const bare = close ? slot + (t.before ? CARET : '') + inner + (close.after ? CARET : '') : undefined
    return { tex, bare }
  }

  const power = (): Node => {
    let base = atom()
    for (;;) {
      const t = peek()
      if (t?.t === 'pow') {
        pos++
        const exp = atom()
        base = { tex: `{${base.tex}}^{${exp.bare ?? exp.tex}}` }
      } else if (t?.t === 'sup') {
        pos++
        const digits = t.v.split('').map((c) => SUP.indexOf(c)).join('')
        base = { tex: `{${base.tex}}^{${wrap(t, digits)}}` }
      } else {
        return base
      }
    }
  }

  const fraction = (): string => {
    let left = power()
    while (peek()?.t === 'div') {
      pos++
      const right = power()
      left = { tex: `\\dfrac{${left.bare ?? left.tex}}{${right.bare ?? right.tex}}` }
    }
    return left.tex
  }

  function seq(): string {
    let out = ''
    for (;;) {
      const t = peek()
      if (!t || t.t === 'rp') return out
      if (t.t === 'op') { pos++; out += wrap(t, esc(t.v)); continue }
      out += fraction()
    }
  }

  let out = ''
  while (pos < toks.length) {
    out += seq()
    const t = peek()
    if (t?.t === 'rp') { pos++; out += wrap(t, ')') } // Klammer ohne öffnendes Gegenstück
  }
  return out
}
