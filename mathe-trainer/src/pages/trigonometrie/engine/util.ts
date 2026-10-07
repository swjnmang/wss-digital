// Hilfsfunktionen für die Trigonometrie-Übungsseiten.

export const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export const randFloat = (min: number, max: number, digits = 1) =>
  round(Math.random() * (max - min) + min, digits);
export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p = 0.5) => Math.random() < p;

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const round = (x: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round(x * f) / f;
};

export const rad = (deg: number) => (deg * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;
export const sinD = (d: number) => Math.sin(rad(d));
export const cosD = (d: number) => Math.cos(rad(d));
export const tanD = (d: number) => Math.tan(rad(d));

/** Zahl im deutschen Format (Komma), höchstens `digits` Nachkommastellen. */
export const fmt = (x: number, digits = 2) => {
  const s = String(round(x, digits));
  return s.replace('-', '−').replace('.', ',');
};

/** Zahl für KaTeX: Komma ohne Leerraum. */
export const tex = (x: number, digits = 2) => String(round(x, digits)).replace('.', '{,}');

/** Zahl mit Einheit für KaTeX, z. B. 4{,}5\,\text{cm}. */
export const texU = (x: number, unit: string, digits = 2) =>
  unit ? `${tex(x, digits)}\\,\\text{${unit}}` : tex(x, digits);

/** Zahl mit Einheit als Text, z. B. 4,5 cm. */
export const fmtU = (x: number, unit: string, digits = 2) =>
  unit ? `${fmt(x, digits)} ${unit}` : fmt(x, digits);

export const texDeg = (x: number, digits = 1) => `${tex(x, digits)}^\\circ`;
export const fmtDeg = (x: number, digits = 1) => `${fmt(x, digits)}°`;

/** Großbuchstabe am Satzanfang. */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Buchstaben-Schemata für Dreiecke ----------

const GREEK: Record<string, { sym: string; tex: string }> = {
  A: { sym: 'α', tex: '\\alpha' },
  B: { sym: 'β', tex: '\\beta' },
  C: { sym: 'γ', tex: '\\gamma' },
  D: { sym: 'δ', tex: '\\delta' },
  E: { sym: 'ε', tex: '\\varepsilon' },
  F: { sym: 'φ', tex: '\\varphi' },
};

export interface Naming {
  /** Eckpunkte, z. B. ['A','B','C'] */
  V: [string, string, string];
  /** Seite gegenüber der Ecke i (Kleinbuchstabe) */
  s: [string, string, string];
  /** Winkel an Ecke i als Zeichen (α) */
  w: [string, string, string];
  /** Winkel an Ecke i für KaTeX (\alpha) */
  wt: [string, string, string];
}

const SCHEMES: [string, string, string][] = [
  ['A', 'B', 'C'],
  ['B', 'C', 'D'],
  ['C', 'D', 'E'],
  ['D', 'E', 'F'],
  ['A', 'B', 'D'],
  ['A', 'C', 'E'],
];

export function makeNaming(letters: [string, string, string]): Naming {
  return {
    V: letters,
    s: letters.map((l) => l.toLowerCase()) as [string, string, string],
    w: letters.map((l) => GREEK[l].sym) as [string, string, string],
    wt: letters.map((l) => GREEK[l].tex) as [string, string, string],
  };
}

export const STANDARD = makeNaming(['A', 'B', 'C']);

/** Zufälliges Buchstaben-Schema (bei `standard` immer A, B, C). */
export const randomNaming = (standard = false) =>
  makeNaming(standard ? ['A', 'B', 'C'] : pick(SCHEMES));

export const UNITS = ['cm', 'm', 'dm', 'mm'] as const;
