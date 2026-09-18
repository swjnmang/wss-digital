// Globale Hilfsfunktionen für Zahleneingaben.
// Erlaubt sowohl Komma als auch Punkt als Dezimaltrennzeichen und entfernt Tausendertrennpunkte
// sowie Leerzeichen. "0,0002" und "0.0002" werden identisch geparst.

export function parseLocalizedNumber(str: string): number {
  if (str == null) return NaN;
  const cleaned = str.trim()
    .replace(/[−–—‐]/g, '-') // normalisiere Minus-Varianten (Bindestrich, En-Dash, Em-Dash von Apple-Geräten)
    .replace(/\s+/g, '') // Leerzeichen
    .replace(/\.(?=\d{3}(?:\D|$))/g, '') // entferne Punkte vor 3er-Gruppen (rudimentärer Tausendertrenner)
    .replace(/,/g, '.'); // ersetze Komma durch Punkt
  return parseFloat(cleaned);
}

export function isNumericInput(str: string): boolean {
  if (!str) return false;
  const n = parseLocalizedNumber(str);
  return !isNaN(n);
}

export function formatGerman(n: number, maxDecimals = 6): string {
  return n.toLocaleString('de-DE', { maximumFractionDigits: maxDecimals });
}

// Kaufmännisches Runden (round half away from zero) auf `decimals` Nachkommastellen.
// JavaScripts Math.round() rundet bei negativen .5-Werten systematisch falsch, z.B.
// Math.round(-0.625 * 100) / 100 ergibt -0.62 statt der schulüblichen -0.63, weil
// Math.round() bei .5 immer Richtung +Infinity rundet statt vom Nullpunkt weg.
export function roundHalfAwayFromZero(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return (Math.sign(n) || 1) * Math.round(Math.abs(n) * factor) / factor;
}
