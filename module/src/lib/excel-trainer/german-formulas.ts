import type { FUniver } from '@univerjs/core/facade';

type Primitive = number | string | boolean | null;

function unwrapScalar(v: unknown): Primitive {
  if (Array.isArray(v)) return unwrapScalar(v[0]);
  if (v !== null && typeof v === 'object' && typeof (v as { getValue?: () => unknown }).getValue === 'function') {
    return unwrapScalar((v as { getValue: () => unknown }).getValue());
  }
  if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' || v === null) return v;
  return null;
}

function flatten(args: unknown[]): Primitive[] {
  const out: Primitive[] = [];
  for (const a of args) {
    if (Array.isArray(a)) {
      for (const row of a) {
        if (Array.isArray(row)) {
          for (const v of row) out.push(unwrapScalar(v));
        } else {
          out.push(unwrapScalar(row));
        }
      }
    } else {
      out.push(unwrapScalar(a));
    }
  }
  return out;
}

function numbersOnly(values: Primitive[]): number[] {
  return values.filter((v): v is number => typeof v === 'number');
}

/**
 * Univer's formula engine only recognizes English function names (SUM, AVERAGE, IF, ...)
 * even with the de-DE UI locale active. Since this trainer is built for German Excel
 * users, register the German equivalents actually used in the exercises as custom
 * functions so typing =SUMME(...)/=MITTELWERT(...)/=WENN(...) works as expected.
 */
export function registerGermanFormulaAliases(univerAPI: FUniver) {
  const formula = univerAPI.getFormula();

  formula.registerFunction(
    'SUMME',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => numbersOnly(flatten(args)).reduce((a, b) => a + b, 0),
    'Addiert alle Zahlen in den angegebenen Zellen (wie SUM).',
  );

  formula.registerFunction(
    'MITTELWERT',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => {
      const nums = numbersOnly(flatten(args));
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    },
    'Berechnet den Mittelwert der angegebenen Zahlen (wie AVERAGE).',
  );

  formula.registerFunction(
    'WENN',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (condition: any, ifTrue: any, ifFalse: any) => {
      const cond = unwrapScalar(condition);
      const result = cond ? unwrapScalar(ifTrue) : (unwrapScalar(ifFalse) ?? false);
      return result;
    },
    'Prüft eine Bedingung und liefert je nach Ergebnis einen von zwei Werten (wie IF).',
  );
}
