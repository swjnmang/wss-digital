// Zufall, Zahlformat (deutsch) und Einheiten für den Bereich Raum & Form.

export const PI = Math.PI;

export function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Zufallszahl im Raster `step`, z. B. rs(2, 9, 0.5) → 2; 2,5; … 9 */
export function rs(min: number, max: number, step: number): number {
  const n = Math.round((max - min) / step);
  return round(min + ri(0, n) * step, 6);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function round(x: number, d = 2): number {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

/** Deutsche Zahl als Text: höchstens `d` Nachkommastellen, mit Tausenderpunkt. */
export function de(x: number, d = 2, fixed = false): string {
  return x.toLocaleString('de-DE', {
    maximumFractionDigits: d,
    minimumFractionDigits: fixed ? d : 0,
  });
}

/** Ergebnis gerundet auf d Stellen, immer mit d Nachkommastellen (wie in der Prüfung). */
export function df(x: number, d = 2): string {
  return de(x, d, true);
}

/** Zahl für KaTeX (Komma ohne Abstand). */
export function tx(x: number, d = 2, fixed = false): string {
  return de(x, d, fixed).replace(/,/g, '{,}');
}

export function txf(x: number, d = 2): string {
  return tx(x, d, true);
}

// ---------------------------------------------------------------------------
// Einheiten
// ---------------------------------------------------------------------------

export type Dim = 'length' | 'area' | 'volume' | 'money' | 'percent' | 'angle' | 'time' | 'count';

export type UnitId =
  | 'mm' | 'cm' | 'dm' | 'm' | 'km'
  | 'mm²' | 'cm²' | 'dm²' | 'm²' | 'km²'
  | 'mm³' | 'cm³' | 'dm³' | 'm³' | 'ml' | 'l'
  | '€' | '%' | '°' | 'min' | 'h' | 'Stück';

interface UnitDef {
  dim: Dim;
  /** Umrechnungsfaktor in die Basiseinheit (m, m², m³, …) */
  f: number;
  tex: string;
}

export const UNITS: Record<UnitId, UnitDef> = {
  mm: { dim: 'length', f: 0.001, tex: '\\text{mm}' },
  cm: { dim: 'length', f: 0.01, tex: '\\text{cm}' },
  dm: { dim: 'length', f: 0.1, tex: '\\text{dm}' },
  m: { dim: 'length', f: 1, tex: '\\text{m}' },
  km: { dim: 'length', f: 1000, tex: '\\text{km}' },
  'mm²': { dim: 'area', f: 1e-6, tex: '\\text{mm}^2' },
  'cm²': { dim: 'area', f: 1e-4, tex: '\\text{cm}^2' },
  'dm²': { dim: 'area', f: 1e-2, tex: '\\text{dm}^2' },
  'm²': { dim: 'area', f: 1, tex: '\\text{m}^2' },
  'km²': { dim: 'area', f: 1e6, tex: '\\text{km}^2' },
  'mm³': { dim: 'volume', f: 1e-9, tex: '\\text{mm}^3' },
  'cm³': { dim: 'volume', f: 1e-6, tex: '\\text{cm}^3' },
  'dm³': { dim: 'volume', f: 1e-3, tex: '\\text{dm}^3' },
  'm³': { dim: 'volume', f: 1, tex: '\\text{m}^3' },
  ml: { dim: 'volume', f: 1e-6, tex: '\\text{ml}' },
  l: { dim: 'volume', f: 1e-3, tex: '\\text{l}' },
  '€': { dim: 'money', f: 1, tex: '\\text{€}' },
  '%': { dim: 'percent', f: 1, tex: '\\,\\%' },
  '°': { dim: 'angle', f: 1, tex: '^\\circ' },
  min: { dim: 'time', f: 60, tex: '\\text{min}' },
  h: { dim: 'time', f: 3600, tex: '\\text{h}' },
  Stück: { dim: 'count', f: 1, tex: '\\text{Stück}' },
};

export const UNIT_GROUPS: { label: string; units: UnitId[] }[] = [
  { label: 'Länge', units: ['mm', 'cm', 'dm', 'm', 'km'] },
  { label: 'Fläche', units: ['mm²', 'cm²', 'dm²', 'm²', 'km²'] },
  { label: 'Volumen', units: ['mm³', 'cm³', 'dm³', 'm³', 'ml', 'l'] },
  { label: 'Sonstige', units: ['€', '%', '°', 'min', 'h', 'Stück'] },
];

export const DIM_LABEL: Record<Dim, string> = {
  length: 'eine Länge (z. B. cm, m)',
  area: 'eine Fläche (z. B. cm², m²)',
  volume: 'ein Volumen (z. B. cm³, l)',
  money: 'ein Geldbetrag (€)',
  percent: 'ein Prozentsatz (%)',
  angle: 'ein Winkel (°)',
  time: 'eine Zeit (min, h)',
  count: 'eine Anzahl (Stück)',
};

/** Wert mit Einheit für KaTeX, z. B. q(4.5,'cm²') → 4{,}5\,\text{cm}^2 */
export function q(x: number, unit: UnitId, d = 2, fixed = false): string {
  const u = UNITS[unit];
  const sep = unit === '%' || unit === '°' ? '' : '\\,';
  return `${tx(x, d, fixed)}${sep}${u.tex}`;
}

/** Ergebnis mit genau d Nachkommastellen und Einheit für KaTeX */
export function qf(x: number, unit: UnitId, d = 2): string {
  return q(x, unit, d, true);
}

/** Wert mit Einheit als normaler Text, z. B. "4,5 cm" */
export function qt(x: number, unit: UnitId, d = 2): string {
  return `${de(x, d)} ${unit}`;
}

/** Rechnet einen Wert von Einheit `from` in Einheit `to` um (gleiche Dimension). */
export function convert(x: number, from: UnitId, to: UnitId): number {
  return (x * UNITS[from].f) / UNITS[to].f;
}

/**
 * Liest eine Schülereingabe. Erlaubt Komma oder Punkt als Dezimaltrennzeichen,
 * Tausenderpunkte (5.513,50) und verschiedene Minuszeichen.
 */
export function parseNum(raw: string): number {
  let s = raw.trim().replace(/\s+/g, '').replace(/[−–—‐]/g, '-');
  if (s === '' || s === '-' || s === ',' || s === '.') return NaN;
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  if (!/^-?\d*\.?\d+$|^-?\d+\.$/.test(s)) return NaN;
  return Number(s);
}
