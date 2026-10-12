// Hilfsfunktionen für den Bereich „Vorbereitung FOS/BOS“:
// exakte Brüche, Terme als KaTeX und Auswahl-/Zahl-Teilaufgaben.

import type { ChoicePart, NumPart } from '../raum_und_form/engine/types';
import { pick, round, shuffle, tx } from '../raum_und_form/engine/util';

export { pick, ri, rs, round, shuffle, tx, de } from '../raum_und_form/engine/util';

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

/** Zufällige ganze Zahl ≠ 0 */
export function nz(min: number, max: number): number {
  let x = 0;
  while (x === 0) x = Math.floor(Math.random() * (max - min + 1)) + min;
  return x;
}

// ---------------------------------------------------------------------------
// Exakte Brüche
// ---------------------------------------------------------------------------

export class Fr {
  readonly n: number;
  readonly d: number;
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('Nenner 0');
    const g = gcd(n, d);
    const s = d < 0 ? -1 : 1;
    this.n = (s * n) / g;
    this.d = (s * d) / g;
  }
  static of(x: Fr | number) {
    return x instanceof Fr ? x : new Fr(x);
  }
  add(o: Fr | number) {
    const b = Fr.of(o);
    return new Fr(this.n * b.d + b.n * this.d, this.d * b.d);
  }
  sub(o: Fr | number) {
    return this.add(Fr.of(o).neg());
  }
  mul(o: Fr | number) {
    const b = Fr.of(o);
    return new Fr(this.n * b.n, this.d * b.d);
  }
  div(o: Fr | number) {
    const b = Fr.of(o);
    return new Fr(this.n * b.d, this.d * b.n);
  }
  neg() {
    return new Fr(-this.n, this.d);
  }
  get v() {
    return this.n / this.d;
  }
  get isInt() {
    return this.d === 1;
  }
  isZero() {
    return this.n === 0;
  }
  /** KaTeX, z. B. -\frac{3}{4} */
  tex(): string {
    if (this.d === 1) return `${this.n}`;
    return `${this.n < 0 ? '-' : ''}\\frac{${Math.abs(this.n)}}{${this.d}}`;
  }
  /** in Klammern, falls negativ */
  ptex(): string {
    return this.n < 0 ? `\\left(${this.tex()}\\right)` : this.tex();
  }
  /** als Text für Lösungen: 3/4 */
  text(): string {
    return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`;
  }
}

export const F = (n: number, d = 1) => new Fr(n, d);

// ---------------------------------------------------------------------------
// Zahlen und Terme als KaTeX
// ---------------------------------------------------------------------------

/** Zahl oder Bruch als KaTeX */
export function t(x: number | Fr, d = 4): string {
  if (x instanceof Fr) return x.tex();
  return tx(round(x, d), d);
}
/** in Klammern, wenn negativ */
export function p(x: number | Fr, d = 4): string {
  const v = x instanceof Fr ? x.v : x;
  return v < 0 ? `(${t(x, d)})` : t(x, d);
}
/** mit Vorzeichen als Rechenzeichen: "+ 3" bzw. "- 3" */
export function sg(x: number | Fr, d = 4): string {
  const v = x instanceof Fr ? x.v : x;
  const a = x instanceof Fr ? (v < 0 ? x.neg() : x) : Math.abs(x);
  return `${v < 0 ? '-' : '+'} ${t(a, d)}`;
}

/**
 * Polynom mit Koeffizienten (höchster Grad zuerst) als KaTeX.
 * poly([2,-3,1]) → 2x^2 - 3x + 1
 */
export function poly(coefs: (number | Fr)[], v = 'x'): string {
  const deg = coefs.length - 1;
  const out: string[] = [];
  coefs.forEach((c0, i) => {
    const c = Fr.of(typeof c0 === 'number' && !Number.isInteger(c0) ? decToFr(c0) : c0);
    if (c.isZero()) return;
    const e = deg - i;
    const neg = c.v < 0;
    const a = neg ? c.neg() : c;
    const varPart = e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`;
    let coef = a.tex();
    if (e > 0 && a.n === 1 && a.d === 1) coef = '';
    if (typeof c0 === 'number' && !Number.isInteger(c0)) coef = e > 0 && Math.abs(c0) === 1 ? '' : tx(Math.abs(c0), 4);
    const term = `${coef}${varPart}`;
    if (out.length === 0) out.push(`${neg ? '-' : ''}${term}`);
    else out.push(`${neg ? '-' : '+'} ${term}`);
  });
  return out.length ? out.join(' ') : '0';
}

function decToFr(x: number): Fr {
  for (const d of [1, 2, 4, 5, 10, 20, 25, 50, 100, 1000]) {
    if (Math.abs(Math.round(x * d) - x * d) < 1e-9) return new Fr(Math.round(x * d), d);
  }
  return new Fr(Math.round(x * 1000), 1000);
}

/** (x - a) mit richtigem Vorzeichen: x - 3, x + 2, x */
export function xm(a: number | Fr, v = 'x'): string {
  const val = a instanceof Fr ? a.v : a;
  if (val === 0) return v;
  return `${v} ${sg(a instanceof Fr ? a.neg() : -a)}`;
}

/** Faktor vor einer Klammer: 1 → "", -1 → "-", sonst Zahl mit Malpunkt */
export function fac(a: number | Fr): string {
  const v = a instanceof Fr ? a.v : a;
  if (v === 1) return '';
  if (v === -1) return '-';
  return `${t(a)} \\cdot `;
}

/** Menge als KaTeX: {1; 2; 3} */
export const setTex = (xs: (number | string)[]) =>
  xs.length === 0 ? '\\{\\,\\}' : `\\{${xs.map((x) => (typeof x === 'number' ? t(x) : x)).join('; ')}\\}`;

// ---------------------------------------------------------------------------
// Teilaufgaben
// ---------------------------------------------------------------------------

/** Zahl-Eingabe ohne Einheit */
export function nm(label: string, value: number | Fr, opts: Partial<NumPart> = {}): NumPart {
  return { kind: 'num', label, value: value instanceof Fr ? value.v : value, unit: null, ...opts };
}

/** Auswahl; die erste Option ist richtig. Doppelte Distraktoren werden entfernt. */
export function ch(q: string, right: string, wrong: string[], label?: string): ChoicePart {
  const ws = [...new Set(wrong.filter((w) => w !== right))];
  const opts = shuffle([right, ...ws]);
  return { kind: 'choice', q, label, options: opts, correct: opts.indexOf(right) };
}

/** Auswahl mit fester Reihenfolge (z. B. wahr/falsch) */
export function chFixed(q: string, options: string[], correct: number, label?: string): ChoicePart {
  return { kind: 'choice', q, label, options, correct };
}

export const WF = (q: string, val: boolean) => chFixed(q, ['wahr', 'falsch'], val ? 0 : 1);

export const NAMES = ['Lena', 'Mehmet', 'Sophie', 'Jonas', 'Aylin', 'Luca', 'Mia', 'Elias', 'Hannah', 'Noah', 'Zeynep', 'Ben', 'Lara', 'Tim', 'Sara', 'Leon'];
export const name = () => pick(NAMES);

/** "=" bei exaktem Ergebnis, sonst "≈" */
export const eqs = (x: number, d = 2) => (Math.abs(x - round(x, d)) < 1e-9 ? '=' : '\\approx');
