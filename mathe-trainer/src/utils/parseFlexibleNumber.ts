// Parst Schülereingaben tolerant: erlaubt Leerzeichen ("- 3"), verschachtelte
// Vorzeichen ("+(-1)", "-(-1)") und Komma als Dezimaltrennzeichen.
export function parseFlexibleNumber(raw: unknown): number {
  if (raw === undefined || raw === null) return NaN
  let s = String(raw).trim()
  if (s === '') return NaN
  s = s.replace(/,/g, '.').replace(/\s+/g, '').replace(/[()]/g, '')
  const match = s.match(/^([+-]*)(\d+(?:\.\d+)?)$/)
  if (!match) return Number(s)
  const minusCount = (match[1].match(/-/g) || []).length
  const sign = minusCount % 2 === 0 ? 1 : -1
  return sign * parseFloat(match[2])
}
