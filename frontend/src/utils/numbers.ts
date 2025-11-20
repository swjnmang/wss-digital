// Globale Hilfsfunktionen für Zahleneingaben.
// Erlaubt sowohl Komma als auch Punkt als Dezimaltrennzeichen und entfernt Tausendertrennpunkte
// sowie Leerzeichen. "0,0002" und "0.0002" werden identisch geparst.

export function parseLocalizedNumber(str: string): number {
  if (str == null) return NaN;
  const cleaned = str.trim()
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
