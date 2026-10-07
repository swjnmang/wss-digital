import type { NumPart } from './types';
import { UNITS, DIM_LABEL, convert, parseNum, type UnitId } from './util';

export type Status = 'empty' | 'incomplete' | 'correct' | 'wrong';

export interface CheckResult {
  status: Status;
  msg?: string;
}

function close(x: number, v: number, part: NumPart): boolean {
  if (part.integer) return Math.abs(x - v) < 1e-9;
  const tol = part.tol ?? Math.max(0.011, Math.abs(v) * 0.006);
  return Math.abs(x - v) <= tol;
}

export function checkNum(part: NumPart, raw: string, unit: UnitId | ''): CheckResult {
  const res = checkValue(part, raw, unit, parseNum(raw));
  // "2.500" kann Tausenderpunkt oder Dezimalpunkt sein – beide Lesarten zulassen
  const t = raw.trim();
  if (res.status === 'wrong' && /^-?\d{1,3}\.\d{3}$/.test(t)) {
    const alt = checkValue(part, raw, unit, Number(t));
    if (alt.status === 'correct') return alt;
  }
  return res;
}

function checkValue(part: NumPart, raw: string, unit: UnitId | '', x: number): CheckResult {
  if (raw.trim() === '') return { status: 'empty' };
  if (Number.isNaN(x)) return { status: 'wrong', msg: 'Bitte nur eine Zahl eingeben (z. B. 12,5).' };

  if (part.unit === null) {
    return close(x, part.value, part) ? { status: 'correct' } : { status: 'wrong', msg: 'Das stimmt noch nicht.' };
  }

  if (unit === '') {
    return { status: 'incomplete', msg: 'Wähle noch die passende Einheit aus.' };
  }

  const expected = UNITS[part.unit];
  const chosen = UNITS[unit];

  if (chosen.dim !== expected.dim) {
    const numberOk = close(x, part.value, part);
    return {
      status: 'wrong',
      msg: numberOk
        ? `Die Zahl stimmt, aber die Einheit passt nicht. Gesucht ist ${DIM_LABEL[expected.dim]}.`
        : `Falsche Einheit: Gesucht ist ${DIM_LABEL[expected.dim]}.`,
    };
  }

  if (part.strict && unit !== part.unit) {
    return { status: 'wrong', msg: `Gib das Ergebnis in ${part.unit} an.` };
  }

  const inExpected = convert(x, unit, part.unit);
  if (close(inExpected, part.value, part)) return { status: 'correct' };

  // typischer Fehler: richtige Zahl, aber falsche Einheit derselben Größe
  if (unit !== part.unit && close(x, part.value, part)) {
    return { status: 'wrong', msg: `Die Zahl passt zu ${part.unit}, nicht zu ${unit}. Prüfe die Einheit.` };
  }
  return { status: 'wrong', msg: 'Das Ergebnis stimmt noch nicht.' };
}
