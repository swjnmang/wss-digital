// ============================================================================
// Algebra-Kern für die Term-Trainer:
// - Polynom-Darstellung (Monome mit Koeffizient + Variablen-Exponenten)
// - Parser für Schülereingaben (inkl. Potenzen x², Brüchen, Klammern)
// - Formatierung in deutscher Schreibweise (Dezimalkomma, Hochzahlen)
// ============================================================================

export interface Monom {
  coeff: number;
  vars: Record<string, number>;
}

export type Poly = Monom[];

export function monom(coeff: number, vars: Record<string, number> = {}): Monom {
  return { coeff, vars: { ...vars } };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Eindeutiger Schlüssel für den Variablenanteil eines Monoms, z. B. "x^2*y^1" */
export function varKey(vars: Record<string, number>): string {
  return Object.keys(vars)
    .filter((v) => vars[v] !== 0)
    .sort()
    .map((v) => `${v}^${vars[v]}`)
    .join('*');
}

/** Fasst gleichartige Monome zusammen, entfernt Null-Terme und sortiert. */
export function simplifyPoly(p: Poly): Poly {
  const map = new Map<string, Monom>();
  for (const m of p) {
    const key = varKey(m.vars);
    const existing = map.get(key);
    if (existing) {
      existing.coeff = round4(existing.coeff + m.coeff);
    } else {
      const cleanVars: Record<string, number> = {};
      for (const v of Object.keys(m.vars)) {
        if (m.vars[v] !== 0) cleanVars[v] = m.vars[v];
      }
      map.set(key, { coeff: round4(m.coeff), vars: cleanVars });
    }
  }
  const result = [...map.values()].filter((m) => Math.abs(m.coeff) > 1e-9);
  const deg = (m: Monom) => Object.values(m.vars).reduce((s, e) => s + e, 0);
  result.sort((m1, m2) => {
    if (deg(m2) !== deg(m1)) return deg(m2) - deg(m1);
    return varKey(m1.vars).localeCompare(varKey(m2.vars));
  });
  return result;
}

export function addPolys(a: Poly, b: Poly): Poly {
  return simplifyPoly([...a, ...b]);
}

export function scalePoly(p: Poly, k: number): Poly {
  return p.map((m) => monom(round4(m.coeff * k), m.vars));
}

export function mulMonoms(a: Monom, b: Monom): Monom {
  const vars: Record<string, number> = { ...a.vars };
  for (const v of Object.keys(b.vars)) vars[v] = (vars[v] || 0) + b.vars[v];
  return { coeff: round4(a.coeff * b.coeff), vars };
}

export function mulPolys(a: Poly, b: Poly): Poly {
  const out: Poly = [];
  for (const ma of a) for (const mb of b) out.push(mulMonoms(ma, mb));
  return simplifyPoly(out);
}

/** Division durch ein einzelnes Monom (Zahl oder z. B. 3x). */
export function dividePoly(a: Poly, b: Poly): Poly | null {
  const bs = simplifyPoly(b);
  if (bs.length !== 1) return null;
  const d = bs[0];
  if (Math.abs(d.coeff) < 1e-9) return null;
  const out: Poly = [];
  for (const m of a) {
    const vars: Record<string, number> = { ...m.vars };
    for (const v of Object.keys(d.vars)) {
      vars[v] = (vars[v] || 0) - d.vars[v];
      if (vars[v] < 0) return null;
    }
    out.push({ coeff: round4(m.coeff / d.coeff), vars });
  }
  return simplifyPoly(out);
}

export function evalPoly(p: Poly, values: Record<string, number>): number {
  let sum = 0;
  for (const m of p) {
    let prod = m.coeff;
    for (const v of Object.keys(m.vars)) prod *= Math.pow(values[v] ?? 0, m.vars[v]);
    sum += prod;
  }
  return round4(sum);
}

// ============================================================================
// Formatierung
// ============================================================================

export function formatNumber(n: number): string {
  return String(round4(n)).replace('.', ',');
}

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

export function toSuperscript(e: number): string {
  return String(e)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('');
}

export function formatVars(vars: Record<string, number>): string {
  return Object.keys(vars)
    .filter((v) => vars[v] !== 0)
    .sort()
    .map((v) => (vars[v] === 1 ? v : v + toSuperscript(vars[v])))
    .join('');
}

/** Betrag eines Monoms ohne Vorzeichen, z. B. "4,5x²" oder "7" oder "xy" */
export function formatMonomBody(m: Monom): string {
  const abs = Math.abs(m.coeff);
  const varStr = formatVars(m.vars);
  if (varStr === '') return formatNumber(abs);
  if (Math.abs(abs - 1) < 1e-9) return varStr;
  return formatNumber(abs) + varStr;
}

/** Monom mit Vorzeichen, z. B. "-4,5x" */
export function formatSignedMonom(m: Monom): string {
  return (m.coeff < 0 ? '-' : '') + formatMonomBody(m);
}

/** Formatiert eine Monom-Liste in der gegebenen Reihenfolge (ohne zu vereinfachen). */
export function formatPoly(p: Poly): string {
  if (p.length === 0) return '0';
  let out = '';
  p.forEach((m, i) => {
    const body = formatMonomBody(m);
    if (i === 0) out = (m.coeff < 0 ? '-' : '') + body;
    else out += (m.coeff < 0 ? ' - ' : ' + ') + body;
  });
  return out;
}

// ============================================================================
// Parser für Schülereingaben
// ============================================================================

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'op'; op: string };

function tokenize(s: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const value = parseFloat(s.slice(i, j));
      if (isNaN(value)) return null;
      tokens.push({ kind: 'num', value });
      i = j;
    } else if (/[a-z]/.test(c)) {
      tokens.push({ kind: 'var', name: c });
      i++;
    } else if ('+-*/^()'.includes(c)) {
      tokens.push({ kind: 'op', op: c });
      i++;
    } else {
      return null;
    }
  }
  return tokens;
}

/**
 * Parst eine Schülereingabe zu einem Polynom.
 * Unterstützt: 3x², 3x^2, 12ab, 5/9r, -5,25fkc, 3·(2x+3), (x+2)(x+3), 4y : 2 …
 * Gibt null zurück, wenn die Eingabe nicht lesbar ist.
 */
export function parseExpression(raw: string): Poly | null {
  let s = raw.replace(/\s+/g, '').toLowerCase();
  if (!s) return null;
  s = s.replace(/,/g, '.');
  s = s.replace(/[−–]/g, '-');
  s = s.replace(/[·×*]/g, '*');
  s = s.replace(/[:∶]/g, '/');
  s = s.replace(/\[/g, '(').replace(/\]/g, ')');
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) =>
    '^' + m.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')
  );

  const tokenized = tokenize(s);
  if (!tokenized || tokenized.length === 0) return null;
  const tokens: Token[] = tokenized;

  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];
  const isOp = (t: Token | undefined, op: string): boolean =>
    !!t && t.kind === 'op' && t.op === op;

  function parseAtom(): Poly | null {
    const t = peek();
    if (!t) return null;
    if (t.kind === 'num') {
      pos++;
      return [monom(t.value)];
    }
    if (t.kind === 'var') {
      pos++;
      return [monom(1, { [t.name]: 1 })];
    }
    if (isOp(t, '(')) {
      pos++;
      const inner = parseExpr();
      if (!inner) return null;
      if (!isOp(peek(), ')')) return null;
      pos++;
      return inner;
    }
    return null;
  }

  function parseFactor(): Poly | null {
    const t = peek();
    if (isOp(t, '+')) {
      pos++;
      return parseFactor();
    }
    if (isOp(t, '-')) {
      pos++;
      const f = parseFactor();
      return f ? scalePoly(f, -1) : null;
    }
    let base = parseAtom();
    if (!base) return null;
    if (isOp(peek(), '^')) {
      pos++;
      const e = peek();
      if (!e || e.kind !== 'num' || !Number.isInteger(e.value) || e.value < 0 || e.value > 6) {
        return null;
      }
      pos++;
      let result: Poly = [monom(1)];
      for (let k = 0; k < e.value; k++) result = mulPolys(result, base);
      base = result;
    }
    return base;
  }

  function parseTerm(): Poly | null {
    let left = parseFactor();
    if (!left) return null;
    for (;;) {
      const t = peek();
      if (isOp(t, '*') || isOp(t, '/')) {
        const op = (t as { kind: 'op'; op: string }).op;
        pos++;
        const right = parseFactor();
        if (!right) return null;
        if (op === '*') {
          left = mulPolys(left, right);
        } else {
          const q = dividePoly(left, right);
          if (!q) return null;
          left = q;
        }
      } else if (t && (t.kind === 'num' || t.kind === 'var' || isOp(t, '('))) {
        // implizite Multiplikation: "3x", "2(x+1)", "xy", "(a+b)(c+d)"
        const right = parseFactor();
        if (!right) return null;
        left = mulPolys(left, right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseExpr(): Poly | null {
    let left = parseTerm();
    if (!left) return null;
    while (isOp(peek(), '+') || isOp(peek(), '-')) {
      const op = (tokens[pos] as { kind: 'op'; op: string }).op;
      pos++;
      const right = parseTerm();
      if (!right) return null;
      left = addPolys(left, op === '+' ? right : scalePoly(right, -1));
    }
    return left;
  }

  const result = parseExpr();
  if (!result || pos !== tokens.length) return null;
  return simplifyPoly(result);
}

// ============================================================================
// Antwort-Prüfung
// ============================================================================

export function polysEquivalent(a: Poly, b: Poly): boolean {
  const sa = simplifyPoly(a);
  const sb = simplifyPoly(b);
  if (sa.length !== sb.length) return false;
  const map = new Map(sa.map((m) => [varKey(m.vars), m.coeff]));
  for (const m of sb) {
    const c = map.get(varKey(m.vars));
    if (c === undefined || Math.abs(c - m.coeff) > 1e-4) return false;
  }
  return true;
}

export function checkAnswer(input: string, expected: Poly): boolean {
  const p = parseExpression(input);
  if (p === null) return false;
  return polysEquivalent(p, expected);
}

/**
 * Prüft, ob die Eingabe einen Faktor AUSSERHALB der Klammer enthält
 * (für Ausklammer-Aufgaben: "3(2x+3)" ja, "(6x+9)" nein).
 */
export function hasFactorOutsideBrackets(raw: string): boolean {
  const s = raw.replace(/\s+/g, '');
  const first = s.indexOf('(');
  const last = s.lastIndexOf(')');
  if (first === -1 || last === -1) return false;
  const outside = s.slice(0, first) + s.slice(last + 1);
  return /[0-9a-zA-Z]/.test(outside);
}
