// ============================================================================
// Binomische Formeln: Aufgaben-Generator, KaTeX-Formatierung und Prüfung
//   1. (a + b)² = a² + 2ab + b²
//   2. (a − b)² = a² − 2ab + b²
//   3. (a + b)(a − b) = a² − b²
// ============================================================================

import {
  type Monom,
  type Poly,
  monom,
  mulMonoms,
  scalePoly,
  addPolys,
  simplifyPoly,
  parseExpression,
  polysEquivalent,
  varKey,
} from '../terme/termAlgebra';
import { monomTex, polyTex } from '../ausklammern/ausklammernAufgaben';

export type StufeId = 1 | 2 | 3 | 4 | 5;
type Formel = 1 | 2 | 3;

export interface Stufe {
  id: StufeId;
  name: string;
  beschreibung: string;
  /** Art der erwarteten Antwort */
  art: 'ausmultiplizieren' | 'faktorisieren';
}

export const STUFEN: Stufe[] = [
  { id: 1, name: 'Stufe 1: Ausmultiplizieren – Grundform', beschreibung: 'Löse die Klammern mit der passenden binomischen Formel auf, z. B. (x + 3)².', art: 'ausmultiplizieren' },
  { id: 2, name: 'Stufe 2: Ausmultiplizieren – mit Faktoren', beschreibung: 'Jetzt stehen Zahlen vor den Variablen oder zwei Variablen in der Klammer, z. B. (2x − 3y)².', art: 'ausmultiplizieren' },
  { id: 3, name: 'Stufe 3: Faktorisieren – Grundform', beschreibung: 'Rückwärts: Schreibe die Summe als Quadrat bzw. Produkt, z. B. x² + 6x + 9 = (x + 3)².', art: 'faktorisieren' },
  { id: 4, name: 'Stufe 4: Faktorisieren – mit Faktoren', beschreibung: 'Rückwärts mit Faktoren und zwei Variablen, z. B. 4x² − 12xy + 9y² = (2x − 3y)².', art: 'faktorisieren' },
  { id: 5, name: 'Stufe 5: Profi – Terme vereinfachen', beschreibung: 'Mehrere binomische Formeln in einem Term: ausmultiplizieren, Minus vor der Klammer beachten, zusammenfassen.', art: 'ausmultiplizieren' },
];

export interface Aufgabe {
  id: string;
  stufe: StufeId;
  aufgabeTex: string;
  /** ausmultiplizierte, vereinfachte Form */
  original: Poly;
  loesungTex: string;
  rechenweg: string[];
  /** typischer Fehler: Mittelglied vergessen bzw. falsches Vorzeichen (nur bei einzelnen Binomen) */
  fehler?: { ohneMitte?: Poly; falschesVorzeichen?: Poly };
}

// ----------------------------------------------------------------------------
// Hilfen
// ----------------------------------------------------------------------------

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const ggT = (a: number, b: number): number => (b === 0 ? a : ggT(b, a % b));

let zaehler = 0;
const neueId = () => `b${Date.now()}_${zaehler++}`;

const FORMEL_TEX: Record<Formel, string> = {
  1: '(a + b)^{2} = a^{2} + 2ab + b^{2}',
  2: '(a - b)^{2} = a^{2} - 2ab + b^{2}',
  3: '(a + b)(a - b) = a^{2} - b^{2}',
};
const FORMEL_NAME: Record<Formel, string> = {
  1: '1. binomische Formel',
  2: '2. binomische Formel',
  3: '3. binomische Formel',
};

interface Binom {
  formel: Formel;
  a: Monom;
  b: Monom; // immer positiver Koeffizient
}

function binomTex(bi: Binom): string {
  const A = monomTex(bi.a);
  const B = monomTex(bi.b);
  if (bi.formel === 1) return `(${A} + ${B})^{2}`;
  if (bi.formel === 2) return `(${A} - ${B})^{2}`;
  return `(${A} + ${B})(${A} - ${B})`;
}

/** Ausmultiplizierte Form in der Reihenfolge a², ±2ab, b² */
function binomSummanden(bi: Binom): Poly {
  const a2 = mulMonoms(bi.a, bi.a);
  const b2 = mulMonoms(bi.b, bi.b);
  const ab2 = mulMonoms(monom(2), mulMonoms(bi.a, bi.b));
  if (bi.formel === 1) return [a2, ab2, b2];
  if (bi.formel === 2) return [a2, monom(-ab2.coeff, ab2.vars), b2];
  return [a2, monom(-b2.coeff, b2.vars)];
}

const istEinfach = (m: Monom) => m.coeff === 1 || varKey(m.vars) === '';

/** (2x)^2 = 4x^2 bzw. x^2 bzw. 3^2 = 9 */
function quadratTex(m: Monom): string {
  const q = monomTex(mulMonoms(m, m));
  const isVar = varKey(m.vars) !== '';
  if (isVar && m.coeff === 1 && Object.keys(m.vars).length === 1 && Object.values(m.vars)[0] === 1) {
    return q;
  }
  const basis = istEinfach(m) && !isVar ? monomTex(m) : `(${monomTex(m)})`;
  return `${basis}^{2} = ${q}`;
}

function rechenwegAusmultiplizieren(bi: Binom): string[] {
  const s = binomSummanden(bi);
  const zeilen = [
    `\\text{${FORMEL_NAME[bi.formel]}: } ${FORMEL_TEX[bi.formel]}`,
    `\\text{mit } a = ${monomTex(bi.a)} \\text{ und } b = ${monomTex(bi.b)}`,
    `a^{2} = ${quadratTex(bi.a)}`,
  ];
  if (bi.formel !== 3) {
    zeilen.push(`2ab = 2\\cdot ${monomTex(bi.a)}\\cdot ${monomTex(bi.b)} = ${monomTex(s[1]).replace(/^-/, '')}`);
  }
  zeilen.push(`b^{2} = ${quadratTex(bi.b)}`);
  zeilen.push(`\\Rightarrow ${binomTex(bi)} = ${polyTex(s)}`);
  return zeilen;
}

function rechenwegFaktorisieren(bi: Binom): string[] {
  const s = binomSummanden(bi);
  const A = monomTex(bi.a);
  const B = monomTex(bi.b);
  const a2 = monomTex(s[0]);
  const b2 = monomTex(mulMonoms(bi.b, bi.b));
  const zeilen: string[] = [];
  if (bi.formel === 3) {
    zeilen.push(`\\text{Zwei Quadratzahlen mit Minus dazwischen } \\Rightarrow \\text{ 3. binomische Formel: } a^{2} - b^{2} = (a + b)(a - b)`);
  } else if (bi.formel === 1) {
    zeilen.push(`\\text{Drei Summanden, Mittelglied mit Plus } \\Rightarrow \\text{ 1. binomische Formel: } a^{2} + 2ab + b^{2} = (a + b)^{2}`);
  } else {
    zeilen.push(`\\text{Drei Summanden, Mittelglied mit Minus } \\Rightarrow \\text{ 2. binomische Formel: } a^{2} - 2ab + b^{2} = (a - b)^{2}`);
  }
  zeilen.push(`a^{2} = ${a2} \\;\\Rightarrow\\; a = ${A}`);
  zeilen.push(`b^{2} = ${b2} \\;\\Rightarrow\\; b = ${B}`);
  if (bi.formel !== 3) {
    zeilen.push(`\\text{Kontrolle Mittelglied: } 2ab = 2\\cdot ${A}\\cdot ${B} = ${monomTex(s[1]).replace(/^-/, '')}\\ \\checkmark`);
  }
  zeilen.push(`\\Rightarrow ${polyTex(s)} = ${binomTex(bi)}`);
  return zeilen;
}

// ----------------------------------------------------------------------------
// Binome erzeugen
// ----------------------------------------------------------------------------

const VAR_PAARE: [string, string][] = [['x', 'y'], ['p', 'q'], ['m', 'n'], ['r', 's']];

function binomLeicht(formel: Formel = choice([1, 2, 3])): Binom {
  const v = choice(['x', 'y', 'z', 'm', 'n', 'p']);
  return { formel, a: monom(1, { [v]: 1 }), b: monom(randInt(1, 12)) };
}

function binomMittel(formel: Formel = choice([1, 2, 3])): Binom {
  const [v, w] = choice(VAR_PAARE);
  const variante = randInt(1, 4);
  if (variante === 1) {
    const k = randInt(2, 6);
    let b = randInt(1, 9);
    while (ggT(k, b) > 1) b = randInt(1, 9);
    return { formel, a: monom(k, { [v]: 1 }), b: monom(b) };
  }
  if (variante === 2) return { formel, a: monom(1, { [v]: 1 }), b: monom(randInt(2, 6), { [w]: 1 }) };
  if (variante === 3) {
    const k = randInt(2, 5);
    let b = randInt(2, 5);
    while (ggT(k, b) > 1) b = randInt(2, 5);
    return { formel, a: monom(k, { [v]: 1 }), b: monom(b, { [w]: 1 }) };
  }
  // Potenz bzw. Produkt in der Klammer
  return choice([
    { formel, a: monom(1, { [v]: 2 }), b: monom(randInt(1, 6)) },
    { formel, a: monom(randInt(2, 4), { [v]: 1, [w]: 1 }), b: monom(randInt(1, 5)) },
  ]);
}

function ausBinom(stufe: StufeId, bi: Binom, art: 'ausmultiplizieren' | 'faktorisieren'): Aufgabe {
  const s = binomSummanden(bi);
  const original = simplifyPoly(s);
  const a2 = mulMonoms(bi.a, bi.a);
  const b2 = mulMonoms(bi.b, bi.b);
  const fehler =
    bi.formel === 3
      ? undefined
      : {
          ohneMitte: simplifyPoly([a2, b2]),
          falschesVorzeichen: simplifyPoly([a2, monom(-s[1].coeff, s[1].vars), b2]),
        };
  if (art === 'ausmultiplizieren') {
    return {
      id: neueId(), stufe, aufgabeTex: binomTex(bi), original, loesungTex: polyTex(s),
      rechenweg: rechenwegAusmultiplizieren(bi), fehler,
    };
  }
  return {
    id: neueId(), stufe, aufgabeTex: polyTex(s), original, loesungTex: binomTex(bi),
    rechenweg: rechenwegFaktorisieren(bi),
  };
}

/** Stufe 5: k₁·Binom₁ ± k₂·Binom₂ */
function genProfi(): Aufgabe {
  const v = choice(['x', 'y', 'z']);
  const teil = (): { k: number; bi: Binom } => {
    const leicht = Math.random() < 0.6;
    const formel = choice([1, 2, 3] as Formel[]);
    const bi: Binom = leicht
      ? { formel, a: monom(1, { [v]: 1 }), b: monom(randInt(1, 9)) }
      : { formel, a: monom(randInt(2, 4), { [v]: 1 }), b: monom(randInt(1, 6)) };
    return { k: Math.random() < 0.3 ? randInt(2, 3) : 1, bi };
  };
  for (let guard = 0; guard < 100; guard++) {
    const t1 = teil();
    const t2 = teil();
    if (binomTex(t1.bi) === binomTex(t2.bi)) continue;
    const minus = Math.random() < 0.6;
    const p1 = scalePoly(binomSummanden(t1.bi), t1.k);
    const p2 = scalePoly(binomSummanden(t2.bi), minus ? -t2.k : t2.k);
    const original = addPolys(p1, p2);
    if (original.length < 2) continue;

    const kTex = (k: number) => (k === 1 ? '' : `${k}`);
    const aufgabeTex = `${kTex(t1.k)}${binomTex(t1.bi)} ${minus ? '-' : '+'} ${kTex(t2.k)}${binomTex(t2.bi)}`;
    const s1 = binomSummanden(t1.bi);
    const s2 = binomSummanden(t2.bi);
    const rechenweg = [
      `\\text{1. Jede Klammer mit der passenden binomischen Formel auflösen:}`,
      `\\quad ${binomTex(t1.bi)} = ${polyTex(s1)} \\quad (\\text{${FORMEL_NAME[t1.bi.formel]}})`,
      `\\quad ${binomTex(t2.bi)} = ${polyTex(s2)} \\quad (\\text{${FORMEL_NAME[t2.bi.formel]}})`,
      `\\text{2. Ergebnisse in Klammern einsetzen:}`,
      `\\quad ${kTex(t1.k)}${t1.k === 1 ? '' : '\\cdot '}(${polyTex(s1)}) ${minus ? '-' : '+'} ${kTex(t2.k)}${t2.k === 1 ? '' : '\\cdot '}(${polyTex(s2)})`,
      `\\text{3. Klammern auflösen${minus ? ' – Minus vor der Klammer dreht alle Vorzeichen um' : ''}:}`,
      `\\quad = ${polyTex(p1)} ${polyTex(p2).startsWith('-') ? '' : '+ '}${polyTex(p2)}`,
      `\\text{4. Zusammenfassen: } ${polyTex(original)}`,
    ];
    return { id: neueId(), stufe: 5, aufgabeTex, original, loesungTex: polyTex(original), rechenweg };
  }
  return ausBinom(5, binomMittel(), 'ausmultiplizieren');
}

const GENERATOREN: Record<StufeId, () => Aufgabe> = {
  1: () => ausBinom(1, binomLeicht(), 'ausmultiplizieren'),
  2: () => ausBinom(2, binomMittel(), 'ausmultiplizieren'),
  3: () => ausBinom(3, binomLeicht(), 'faktorisieren'),
  4: () => ausBinom(4, binomMittel(), 'faktorisieren'),
  5: genProfi,
};

export function generiereSet(stufe: StufeId, anzahl: number): Aufgabe[] {
  const list: Aufgabe[] = [];
  const seen = new Set<string>();
  for (let guard = 0; list.length < anzahl && guard < 300; guard++) {
    const a = GENERATOREN[stufe]();
    if (seen.has(a.aufgabeTex)) continue;
    seen.add(a.aufgabeTex);
    list.push(a);
  }
  return list;
}

// ----------------------------------------------------------------------------
// Prüfung
// ----------------------------------------------------------------------------

export type Ergebnis = { status: 'richtig' } | { status: 'falsch'; hinweis: string };

function normalisiere(raw: string): string {
  return raw
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/[·×]/g, '*')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')');
}

/** Ist die Eingabe ein Produkt aus Binomen, z. B. (x+3)^2, (x+3)(x+3), (2a-b)(2a+b)? */
function istProduktAusBinomen(raw: string): boolean {
  const s = normalisiere(raw);
  let tiefe = 0;
  let aktuell = '';
  const klammern: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') {
      if (tiefe > 0) aktuell += c;
      else aktuell = '';
      tiefe++;
    } else if (c === ')') {
      tiefe--;
      if (tiefe < 0) return false;
      if (tiefe === 0) klammern.push(aktuell);
      else aktuell += c;
    } else if (tiefe > 0) {
      aktuell += c;
    } else if ((c === '+' || c === '-') && i > 0) {
      return false;
    }
  }
  if (tiefe !== 0 || klammern.length === 0) return false;
  const polys = klammern.map((k) => parseExpression(k));
  if (polys.some((p) => !p)) return false;
  const binome = (polys as Poly[]).filter((p) => p.length >= 2);
  return binome.length > 0 && binome.every((p) => p.length === 2);
}

export function pruefeAntwort(aufgabe: Aufgabe, eingabe: string): Ergebnis {
  const p = parseExpression(eingabe);
  if (!p) {
    return { status: 'falsch', hinweis: 'Diese Eingabe kann ich nicht lesen. Potenzen als x² oder x^2, Klammern vollständig schließen.' };
  }
  const gleichwertig = polysEquivalent(p, aufgabe.original);
  const art = STUFEN.find((s) => s.id === aufgabe.stufe)!.art;

  if (art === 'faktorisieren') {
    if (!gleichwertig) {
      return { status: 'falsch', hinweis: 'Leider falsch. Multipliziere dein Ergebnis zur Probe aus – es muss wieder der Ausgangsterm herauskommen.' };
    }
    if (!istProduktAusBinomen(eingabe)) {
      return { status: 'falsch', hinweis: 'Der Wert stimmt, aber der Term ist noch nicht faktorisiert. Schreibe ihn als (…)² oder (…)(…).' };
    }
    return { status: 'richtig' };
  }

  if (gleichwertig) {
    if (/[()[\]]/.test(eingabe)) {
      return { status: 'falsch', hinweis: 'Der Wert stimmt, aber löse die Klammern noch vollständig auf und fasse zusammen.' };
    }
    return { status: 'richtig' };
  }
  if (aufgabe.fehler?.ohneMitte && polysEquivalent(p, aufgabe.fehler.ohneMitte)) {
    return { status: 'falsch', hinweis: 'Achtung, typischer Fehler: Du hast das Mittelglied 2ab vergessen! (a ± b)² ist nicht a² ± b².' };
  }
  if (aufgabe.fehler?.falschesVorzeichen && polysEquivalent(p, aufgabe.fehler.falschesVorzeichen)) {
    return { status: 'falsch', hinweis: 'Fast! Prüfe das Vorzeichen des Mittelglieds 2ab.' };
  }
  if (aufgabe.stufe === 5) {
    return { status: 'falsch', hinweis: 'Leider falsch. Tipp: Setze jedes Ergebnis einer binomischen Formel in Klammern – ein Minus davor dreht alle Vorzeichen um.' };
  }
  return { status: 'falsch', hinweis: 'Leider falsch. Welche binomische Formel passt? Bestimme a und b und rechne a², 2ab und b² einzeln aus.' };
}
