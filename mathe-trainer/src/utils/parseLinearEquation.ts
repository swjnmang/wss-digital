// Liest eine vollständig eingetippte lineare Funktionsgleichung, z. B. "y = 2x + 3", "y=-0,5x-2", "y = 2/3x + 1",
// "y = 3 + 2x", "y = -x", "y = 4". Erlaubt Leerzeichen, Komma/Punkt, alle Minus-Varianten, "·"/"*" zwischen Zahl und x,
// Brüche (2/3x, (2/3)x, x/2) und ein großes Y/X (iPad-Autokorrektur).
//
// Ergebnis: { ok: true, m, t } oder { ok: false, fehler } mit einer verständlichen Rückmeldung für die SuS.

export type LinearParse =
  | { ok: true; m: number; t: number }
  | { ok: false; fehler: string }

/** Eine Zahl oder ein Bruch ("3", "0.5", "2/3", "(2/3)"); leer = 1 */
function parseKoeffizient(s: string): number {
  const k = s.replace(/^\((.*)\)$/, '$1')
  if (k === '') return 1
  const bruch = k.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/)
  if (bruch) {
    const nenner = parseFloat(bruch[2])
    return nenner === 0 ? NaN : parseFloat(bruch[1]) / nenner
  }
  if (!/^\d+(?:\.\d+)?$/.test(k)) return NaN
  return parseFloat(k)
}

export function parseLinearEquation(raw: string): LinearParse {
  const s = String(raw ?? '')
    .toLowerCase()
    .replace(/[−–—‐]/g, '-')
    .replace(/,/g, '.')
    .replace(/[·⋅×*]/g, '')
    .replace(/\s+/g, '')
    .replace(/\(([+-]+)/g, '$1(') // "+(-3)" → "+-(3)", "(-2/3)x" → "-(2/3)x"

  if (s === '') return { ok: false, fehler: 'Bitte die Funktionsgleichung eintragen.' }
  if (!s.includes('=')) return { ok: false, fehler: 'Schreibe die vollständige Gleichung, also mit „y =“ am Anfang (z. B. y = 2x + 3).' }

  const teile = s.split('=')
  if (teile.length !== 2) return { ok: false, fehler: 'In der Gleichung darf nur ein Gleichheitszeichen stehen.' }
  let [links, rechts] = teile
  // "f(x)=" wird wie "y=" behandelt, Gleichung darf auch andersherum stehen ("2x+3=y")
  if (links === 'f(x)') links = 'y'
  if (rechts === 'y' && links !== 'y') [links, rechts] = [rechts, links]
  if (links !== 'y') return { ok: false, fehler: 'Links vom Gleichheitszeichen steht nur „y“: y = …' }
  if (rechts === '') return { ok: false, fehler: 'Rechts vom Gleichheitszeichen fehlt noch der Term.' }
  if (/[\^²]/.test(rechts)) return { ok: false, fehler: 'Eine lineare Funktion hat kein x², nur x.' }
  if (/[^0-9x.+\-/()]/.test(rechts)) return { ok: false, fehler: 'In der Gleichung dürfen nur Zahlen, x, +, − und Brüche vorkommen.' }

  // In Summanden zerlegen; doppelte Vorzeichen ("+-3", "--3") zusammenfassen
  const summanden = rechts.match(/[+-]*[^+-]+/g)
  if (!summanden || summanden.join('') !== rechts) return { ok: false, fehler: 'Die Gleichung ist unvollständig, z. B. steht am Ende noch ein Rechenzeichen.' }

  let m = 0
  let t = 0
  let xTerme = 0
  let zahlTerme = 0
  for (const roh of summanden) {
    const vz = roh.match(/^[+-]*/)![0]
    const sign = (vz.match(/-/g) || []).length % 2 === 0 ? 1 : -1
    const term = roh.slice(vz.length)
    if (term.includes('x')) {
      if (term.indexOf('x') !== term.lastIndexOf('x')) return { ok: false, fehler: 'Schreibe die Steigung als eine Zahl vor x, z. B. 2x.' }
      let k: number
      const nachX = term.match(/^(.*)x\/(\d+(?:\.\d+)?)$/) // x/2, 3x/4
      if (nachX) k = parseKoeffizient(nachX[1]) / parseFloat(nachX[2])
      else if (term.endsWith('x')) k = parseKoeffizient(term.slice(0, -1))
      else return { ok: false, fehler: 'Die Zahl gehört vor das x: z. B. 2x statt x2.' }
      if (isNaN(k) || !isFinite(k)) return { ok: false, fehler: 'Die Steigung vor dem x kann ich nicht lesen.' }
      m += sign * k
      xTerme++
    } else {
      const k = parseKoeffizient(term)
      if (isNaN(k) || !isFinite(k)) return { ok: false, fehler: `„${term}“ kann ich nicht als Zahl lesen.` }
      t += sign * k
      zahlTerme++
    }
  }
  if (xTerme > 1 || zahlTerme > 1) return { ok: false, fehler: 'Fasse zusammen: Die Gleichung hat die Form y = mx + t mit nur einem x-Glied und einer Zahl.' }
  return { ok: true, m, t }
}

/** Deutsche Zahl ohne überflüssige Nullen, max. 2 Nachkommastellen */
function zahl(v: number): string {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',')
}

/** Gleichung schön schreiben: y = 2x + 3, y = −x, y = 4, y = 0,5x (für Text) */
export function formatLinearEquation(m: number, t: number): string {
  const mr = Math.round(m * 100) / 100
  const tr = Math.round(t * 100) / 100
  let s = 'y = '
  if (mr !== 0) s += mr === 1 ? 'x' : mr === -1 ? '−x' : `${zahl(mr).replace('-', '−')}x`
  if (tr !== 0) s += mr === 0 ? zahl(tr).replace('-', '−') : ` ${tr < 0 ? '−' : '+'} ${zahl(Math.abs(tr))}`
  if (mr === 0 && tr === 0) s += '0'
  return s
}

/** Dieselbe Gleichung als TeX (Komma als {,}) */
export function texLinearEquation(m: number, t: number): string {
  return formatLinearEquation(m, t).replace(/−/g, '-').replace(/,/g, '{,}')
}

/** Vergleich mit der richtigen Gleichung samt genauer Rückmeldung (welcher Teil falsch ist) */
export function checkLinearEquation(raw: string, m: number, t: number, tol = 0.02): { status: 'ok' | 'no' | 'invalid'; text: string; mOk?: boolean; tOk?: boolean } {
  const p = parseLinearEquation(raw)
  if (!p.ok) return { status: 'invalid', text: p.fehler }
  const mOk = Math.abs(p.m - m) <= tol + 1e-9
  const tOk = Math.abs(p.t - t) <= tol + 1e-9
  if (mOk && tOk) return { status: 'ok', text: '', mOk, tOk }
  if (!mOk && !tOk) {
    if (Math.abs(p.m - t) <= tol && Math.abs(p.t - m) <= tol && Math.abs(m - t) > tol)
      return { status: 'no', text: 'Steigung und y-Achsenabschnitt sind vertauscht: Die Steigung m steht vor dem x, t ist die Zahl ohne x.', mOk, tOk }
    return { status: 'no', text: 'Steigung m und y-Achsenabschnitt t stimmen beide noch nicht. Berechne zuerst m.', mOk, tOk }
  }
  if (!mOk) {
    if (Math.abs(p.m + m) <= tol) return { status: 'no', text: 'Der y-Achsenabschnitt t stimmt, aber bei der Steigung m ist das Vorzeichen falsch.', mOk, tOk }
    if (m !== 0 && Math.abs(p.m - 1 / m) <= tol) return { status: 'no', text: 'Der y-Achsenabschnitt t stimmt. Bei m hast du den Bruch umgedreht: m = Δy : Δx (y-Unterschied oben).', mOk, tOk }
    return { status: 'no', text: 'Der y-Achsenabschnitt t stimmt, aber die Steigung m noch nicht.', mOk, tOk }
  }
  if (Math.abs(p.t + t) <= tol) return { status: 'no', text: 'Die Steigung m stimmt, aber beim y-Achsenabschnitt t ist das Vorzeichen falsch.', mOk, tOk }
  return { status: 'no', text: 'Die Steigung m stimmt, aber der y-Achsenabschnitt t noch nicht.', mOk, tOk }
}
