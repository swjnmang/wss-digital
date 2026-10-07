import type { ChoicePart, NumPart } from '../engine/types';
import { pick, q, round, shuffle, type UnitId } from '../engine/util';

export function num(label: string, value: number, unit: UnitId | null, opts: Partial<NumPart> = {}): NumPart {
  return { kind: 'num', label, value, unit, ...opts };
}

/** Auswahlaufgabe; die erste Option ist die richtige, die Reihenfolge wird gemischt. */
export function choice(q: string, right: string, wrong: string[], label?: string): ChoicePart {
  const opts = shuffle([right, ...wrong]);
  return { kind: 'choice', q, label, options: opts, correct: opts.indexOf(right) };
}

/** "=" bei exaktem Ergebnis, sonst "≈" */
export const eq = (x: number, d = 2) => (Math.abs(x - round(x, d)) < 1e-9 ? '=' : '\\approx');

/** "= 12,57 cm²" bzw. "≈ 12,57 cm²" */
export const res = (x: number, unit: UnitId, d = 2) => `${eq(x, d)} ${q(x, unit, d, eq(x, d) !== '=')}`;

export const NAMES = [
  'Lena', 'Mehmet', 'Sophie', 'Jonas', 'Aylin', 'Luca', 'Mia', 'Elias', 'Hannah', 'Noah', 'Emily', 'Finn',
  'Zeynep', 'Ben', 'Lara', 'Tim', 'Sara', 'Leon', 'Nele', 'Can', 'Marie', 'David', 'Ida', 'Emil',
];
export const FAMILIES = ['Familie Huber', 'Familie Yilmaz', 'Familie Wagner', 'Familie Bauer', 'Familie Schneider', 'Familie Kaya', 'Familie Maier', 'Familie Lehmann'];

export const name = () => pick(NAMES);
export const family = () => pick(FAMILIES);

export const sq = (x: number) => x * x;

/** Längen-Einheit zufällig, eher cm/m */
export const lenUnit = (): UnitId => pick(['cm', 'cm', 'm', 'm', 'mm', 'dm'] as UnitId[]);
export const areaOf = (u: UnitId): UnitId => (`${u}²` as UnitId);
export const volOf = (u: UnitId): UnitId => (`${u}³` as UnitId);
