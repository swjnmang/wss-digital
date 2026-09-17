// Parst Schülereingaben tolerant: erlaubt Leerzeichen ("- 3"), verschachtelte
// Vorzeichen ("+(-1)", "-(-1)"), Komma als Dezimaltrennzeichen, und verschiedene
// Minus-Schreibweisen (Bindestrich, En-Dash, Em-Dash von Apple-Geräten).
export function parseFlexibleNumber(raw: unknown): number {
  if (raw === undefined || raw === null) return NaN
  let s = String(raw).trim()
  if (s === '') return NaN
  // Normalisiere alle Minus-Varianten (Bindestrich, En-Dash U+2013, Em-Dash U+2014, Minus U+2212)
  s = s.replace(/[−–—‐]/g, '-')
  s = s.replace(/,/g, '.').replace(/\s+/g, '').replace(/[()]/g, '')
  const match = s.match(/^([+-]*)(\d+(?:\.\d+)?)$/)
  if (!match) return Number(s)
  const minusCount = (match[1].match(/-/g) || []).length
  const sign = minusCount % 2 === 0 ? 1 : -1
  return sign * parseFloat(match[2])
}
