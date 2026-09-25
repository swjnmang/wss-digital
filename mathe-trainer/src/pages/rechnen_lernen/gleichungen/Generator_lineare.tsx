import React, { useCallback, useEffect, useState } from 'react';
import RechenwegDisplay from '../../../components/RechenwegDisplay';

// ============================================================================
// ALGEBRA-KERN: Terme, Klammern und eine generische Gleichungs-Engine.
// Aus zufällig zusammengesetzten Termen (Segmente/Klammern) wird sowohl die
// Anzeige als auch ein IMMER korrekter, echter Rechenweg berechnet - nicht
// von Hand getippt, sondern aus der tatsächlichen Rechnung abgeleitet.
// ============================================================================

interface Term {
  coeff: number;
  isX: boolean;
}

type Piece =
  | { kind: 'term'; coeff: number; isX: boolean }
  | { kind: 'bracket'; factor: number; inner: Term[] };

function term(coeff: number, isX = false): Piece {
  return { kind: 'term', coeff, isX };
}

function xterm(coeff: number): Piece {
  return { kind: 'term', coeff, isX: true };
}

function bracket(factor: number, inner: Term[]): Piece {
  return { kind: 'bracket', factor, inner };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function fmtNum(n: number): string {
  const r = round4(n);
  const v = Object.is(r, -0) ? 0 : r;
  return String(v).replace('.', ',');
}

function absTermStr(t: Term): string {
  const c = Math.abs(t.coeff);
  if (t.isX) return Math.abs(c - 1) < 1e-9 ? 'x' : `${fmtNum(c)}x`;
  return fmtNum(c);
}

/** Reiht Terme mit ihren eigenen Vorzeichen aneinander, ohne zusammenzufassen. */
function joinTerms(terms: Term[]): string {
  if (terms.length === 0) return '0';
  let out = '';
  terms.forEach((t, i) => {
    const neg = t.coeff < 0;
    if (i === 0) out = (neg ? '-' : '') + absTermStr(t);
    else out += (neg ? ' - ' : ' + ') + absTermStr(t);
  });
  return out;
}

function pieceTerms(p: Piece): Term[] {
  if (p.kind === 'term') return [{ coeff: p.coeff, isX: p.isX }];
  return p.inner.map((t) => ({ coeff: round4(t.coeff * p.factor), isX: t.isX }));
}

function pieceSign(p: Piece): 1 | -1 {
  return (p.kind === 'term' ? p.coeff : p.factor) < 0 ? -1 : 1;
}

function pieceAbsDisplay(p: Piece): string {
  if (p.kind === 'term') return absTermStr({ coeff: Math.abs(p.coeff), isX: p.isX });
  const af = Math.abs(p.factor);
  const inner = joinTerms(p.inner);
  return (Math.abs(af - 1) < 1e-9 ? '' : `${fmtNum(af)} · `) + `(${inner})`;
}

function buildSide(pieces: Piece[]): { display: string; terms: Term[] } {
  let display = '';
  const terms: Term[] = [];
  pieces.forEach((p, i) => {
    const sign = pieceSign(p);
    const abs = pieceAbsDisplay(p);
    if (i === 0) display = (sign === -1 ? '-' : '') + abs;
    else display += (sign === -1 ? ' - ' : ' + ') + abs;
    terms.push(...pieceTerms(p));
  });
  return { display, terms };
}

function sumX(terms: Term[]): number {
  return round4(terms.filter((t) => t.isX).reduce((s, t) => s + t.coeff, 0));
}
function sumC(terms: Term[]): number {
  return round4(terms.filter((t) => !t.isX).reduce((s, t) => s + t.coeff, 0));
}
function evalAt(terms: Term[], xVal: number): number {
  return round4(terms.reduce((s, t) => s + t.coeff * (t.isX ? xVal : 1), 0));
}

/** Kombinierte Darstellung einer Seite aus x-Koeffizient und Konstante. */
function sideStr(x: number, c: number): string {
  const list: Term[] = [];
  if (Math.abs(x) > 1e-9) list.push({ coeff: x, isX: true });
  if (Math.abs(c) > 1e-9 || list.length === 0) list.push({ coeff: c, isX: false });
  return joinTerms(list);
}

/** Löst eine "freie" Konstante so, dass die Gleichung bei x = xVal exakt aufgeht. */
function solveConstant(fixedLeft: Piece[], fixedRight: Piece[], xVal: number, side: 'left' | 'right'): number {
  const leftVal = evalAt(buildSide(fixedLeft).terms, xVal);
  const rightVal = evalAt(buildSide(fixedRight).terms, xVal);
  return side === 'right' ? round4(leftVal - rightVal) : round4(rightVal - leftVal);
}

interface GleichungResult {
  aufgabe: string;
  loesung: number;
  rechenweg: string[];
}

/** Baut Aufgabentext + einen vollständig korrekten, aus der Rechnung abgeleiteten Rechenweg. */
function buildEquation(leftPieces: Piece[], rightPieces: Piece[]): GleichungResult {
  const left = buildSide(leftPieces);
  const right = buildSide(rightPieces);
  const original = `${left.display} = ${right.display}`;
  const steps: string[] = [original];

  const hasBrackets = leftPieces.some((p) => p.kind === 'bracket') || rightPieces.some((p) => p.kind === 'bracket');
  if (hasBrackets) {
    steps.push(`${joinTerms(left.terms)} = ${joinTerms(right.terms)}   | Ausmultiplizieren`);
  }

  const leftX = sumX(left.terms);
  const leftC = sumC(left.terms);
  const rightX = sumX(right.terms);
  const rightC = sumC(right.terms);

  const needsCombine =
    left.terms.filter((t) => t.isX).length > 1 ||
    left.terms.filter((t) => !t.isX).length > 1 ||
    right.terms.filter((t) => t.isX).length > 1 ||
    right.terms.filter((t) => !t.isX).length > 1;
  if (needsCombine) {
    steps.push(`${sideStr(leftX, leftC)} = ${sideStr(rightX, rightC)}   | Zusammenfassen`);
  }

  const finalCoeff = round4(leftX - rightX);
  const finalConst = round4(rightC - leftC);
  const moveNeeded = Math.abs(rightX) > 1e-9 || Math.abs(leftC) > 1e-9;

  if (moveNeeded) {
    const annoParts: string[] = [];
    if (Math.abs(rightX) > 1e-9) annoParts.push(`${rightX > 0 ? '-' : '+'}${fmtNum(Math.abs(rightX))}x`);
    if (Math.abs(leftC) > 1e-9) annoParts.push(`${leftC > 0 ? '-' : '+'}${fmtNum(Math.abs(leftC))}`);

    let moveLeft = sideStr(leftX, 0);
    if (Math.abs(rightX) > 1e-9) moveLeft += ` ${rightX > 0 ? '-' : '+'} ${fmtNum(Math.abs(rightX))}x`;
    let moveRight = Math.abs(rightC) > 1e-9 ? fmtNum(rightC) : '0';
    if (Math.abs(leftC) > 1e-9) moveRight += ` ${leftC > 0 ? '-' : '+'} ${fmtNum(Math.abs(leftC))}`;

    steps.push(`${moveLeft} = ${moveRight}   | ${annoParts.join(' ')}`);
    steps.push(`${sideStr(finalCoeff, 0)} = ${fmtNum(finalConst)}`);
  }

  const solutionExact = finalConst / finalCoeff;
  const rounded2 = Math.round(solutionExact * 100) / 100;
  // "≈" nur zeigen, wenn beim Runden auf 2 Nachkommastellen tatsächlich
  // Genauigkeit verloren geht (z.B. 13/12 = 1,0833...) - ein exakter Wert
  // wie 2,75 ist keine Näherung und bekommt daher ein "=".
  const needsApprox = Math.abs(solutionExact - rounded2) > 1e-9;

  if (Math.abs(finalCoeff - 1) < 1e-9) {
    if (!moveNeeded) steps.push(`x = ${fmtNum(finalConst)}`);
    // sonst steht "x = ..." bereits als letzte Zeile aus dem Umstell-Schritt da
  } else if (Math.abs(finalCoeff + 1) < 1e-9) {
    steps.push(`x = ${fmtNum(-finalConst)}   | · (-1)`);
  } else {
    const divisor = finalCoeff < 0 ? `(${fmtNum(finalCoeff)})` : fmtNum(finalCoeff);
    steps.push(`x ${needsApprox ? '≈' : '='} ${fmtNum(rounded2)}   | : ${divisor}`);
  }

  const loesung = round4(solutionExact);
  return { aufgabe: original, loesung, rechenweg: steps };
}

// ============================================================================
// ZUFALLS-HELFER
// ============================================================================

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Zufallszahl ungleich 0 aus [min, max] (verschiebt 0 auf 1). */
function nonZero(min: number, max: number): number {
  const v = randInt(min, max);
  return v === 0 ? 1 : v;
}

// ============================================================================
// STUFE "EINFACH": Ein-Schritt-Gleichungen, mehrere Strukturen
// ============================================================================

function genEinfach(): GleichungResult {
  const variant = randInt(1, 8);
  const xVal = randInt(-15, 20);

  switch (variant) {
    case 1: {
      const b = randInt(1, 20);
      const c = xVal + b;
      return { aufgabe: `x + ${b} = ${c}`, loesung: xVal, rechenweg: [`x + ${b} = ${c}`, `x = ${c} - ${b}   | - ${b}`, `x = ${xVal}`] };
    }
    case 2: {
      const b = randInt(1, 20);
      const c = xVal - b;
      return { aufgabe: `x - ${b} = ${c}`, loesung: xVal, rechenweg: [`x - ${b} = ${c}`, `x = ${c} + ${b}   | + ${b}`, `x = ${xVal}`] };
    }
    case 3: {
      const b = randInt(1, 20);
      const c = xVal + b;
      return { aufgabe: `${b} + x = ${c}`, loesung: xVal, rechenweg: [`${b} + x = ${c}`, `x = ${c} - ${b}   | - ${b}`, `x = ${xVal}`] };
    }
    case 4: {
      const b = randInt(1, 20);
      const c = b - xVal;
      return {
        aufgabe: `${b} - x = ${c}`,
        loesung: xVal,
        rechenweg: [`${b} - x = ${c}`, `-x = ${c} - ${b}   | - ${b}`, `-x = ${c - b}`, `x = ${xVal}   | · (-1)`],
      };
    }
    case 5: {
      const a = randInt(2, 12);
      const c = a * xVal;
      return { aufgabe: `${a}x = ${c}`, loesung: xVal, rechenweg: [`${a}x = ${c}`, `x = ${c} : ${a}`, `x = ${xVal}   | : ${a}`] };
    }
    case 6: {
      const a = randInt(2, 9);
      const c = randInt(-10, 15);
      const x = a * c;
      return { aufgabe: `x : ${a} = ${c}`, loesung: x, rechenweg: [`x : ${a} = ${c}`, `x = ${c} · ${a}`, `x = ${x}   | · ${a}`] };
    }
    case 7: {
      const b = randInt(1, 20);
      const c = xVal + b;
      return { aufgabe: `${c} = x + ${b}`, loesung: xVal, rechenweg: [`${c} = x + ${b}`, `${c} - ${b} = x   | - ${b}`, `x = ${xVal}`] };
    }
    default: {
      const a = randInt(2, 12);
      const c = a * xVal;
      return { aufgabe: `${c} = ${a}x`, loesung: xVal, rechenweg: [`${c} = ${a}x`, `${c} : ${a} = x`, `x = ${xVal}   | : ${a}`] };
    }
  }
}

// ============================================================================
// STUFE "MITTEL": Zwei-Schritt-Gleichungen, x auf beiden Seiten, eine Klammer
// (Ergebnis wird bewusst auf einen "schönen" Zielwert zurückgerechnet)
// ============================================================================

function genMittelPieces(): { left: Piece[]; right: Piece[] } {
  const variant = randInt(1, 9);
  const xVal = randInt(-10, 12);

  switch (variant) {
    case 1: {
      const a = randInt(2, 9);
      const b = randInt(1, 20);
      const fixedLeft: Piece[] = [xterm(a), term(b)];
      const c = solveConstant(fixedLeft, [], xVal, 'right');
      return { left: fixedLeft, right: [term(c)] };
    }
    case 2: {
      const a = randInt(2, 9);
      const b = randInt(1, 20);
      const fixedLeft: Piece[] = [xterm(a), term(-b)];
      const c = solveConstant(fixedLeft, [], xVal, 'right');
      return { left: fixedLeft, right: [term(c)] };
    }
    case 3: {
      const a = randInt(2, 9);
      const b = randInt(1, 20);
      const fixedRight: Piece[] = [xterm(a), term(b)];
      const c = solveConstant([], fixedRight, xVal, 'left');
      return { left: [term(c)], right: fixedRight };
    }
    case 4: {
      const a = randInt(2, 9);
      let d = randInt(2, 9);
      while (d === a) d = randInt(2, 9);
      const b = randInt(1, 20);
      const fixedLeft: Piece[] = [xterm(a), term(b)];
      const e = solveConstant(fixedLeft, [xterm(d)], xVal, 'right');
      return { left: fixedLeft, right: [xterm(d), term(e)] };
    }
    case 5: {
      const a = randInt(2, 9);
      let d = randInt(2, 9);
      while (d === a) d = randInt(2, 9);
      const b = randInt(1, 20);
      const fixedLeft: Piece[] = [xterm(a), term(-b)];
      const e = solveConstant(fixedLeft, [xterm(d)], xVal, 'right');
      return { left: fixedLeft, right: [xterm(d), term(e)] };
    }
    case 6: {
      const a = randInt(5, 30);
      const b = randInt(2, 9);
      const fixedLeft: Piece[] = [term(a), xterm(-b)];
      const c = solveConstant(fixedLeft, [], xVal, 'right');
      return { left: fixedLeft, right: [term(c)] };
    }
    case 7: {
      const a = randInt(2, 9);
      const b = nonZero(-10, 10);
      const fixedLeft: Piece[] = [bracket(a, [{ coeff: 1, isX: true }, { coeff: b, isX: false }])];
      const c = solveConstant(fixedLeft, [], xVal, 'right');
      return { left: fixedLeft, right: [term(c)] };
    }
    case 8: {
      const a = randInt(2, 9);
      const d = randInt(2, 9);
      const b = nonZero(-8, 8);
      const fixedLeft: Piece[] = [bracket(a, [{ coeff: 1, isX: true }, { coeff: b, isX: false }])];
      const e = solveConstant(fixedLeft, [xterm(d)], xVal, 'right');
      return { left: fixedLeft, right: [xterm(d), term(e)] };
    }
    default: {
      const a = randInt(3, 9);
      let b = randInt(2, 8);
      while (b === a) b = randInt(2, 8);
      const c0 = nonZero(-8, 8);
      const fixedLeft: Piece[] = [xterm(a), bracket(-b, [{ coeff: 1, isX: true }, { coeff: -c0, isX: false }])];
      const d = solveConstant(fixedLeft, [], xVal, 'right');
      return { left: fixedLeft, right: [term(d)] };
    }
  }
}

function genMittel(): GleichungResult {
  for (let attempt = 0; attempt < 25; attempt++) {
    const { left, right } = genMittelPieces();
    const lt = buildSide(left).terms;
    const rt = buildSide(right).terms;
    if (Math.abs(sumX(lt) - sumX(rt)) < 1e-6) continue;
    return buildEquation(left, right);
  }
  return buildEquation([xterm(2), term(4)], [term(10)]);
}

// ============================================================================
// STUFE "SCHWER": Klammern auf beiden Seiten, mehrere Klammern, Dezimalzahlen
// (Zahlen frei zufällig - Ergebnis darf krumm/gerundet sein, wie im Original)
// ============================================================================

function genSchwerPieces(): { left: Piece[]; right: Piece[] } {
  const variant = randInt(1, 8);

  switch (variant) {
    case 1: {
      const a = randInt(2, 9);
      const b = randInt(1, 9);
      const c = randInt(2, 9);
      const d = randInt(1, 9);
      return {
        left: [bracket(a, [{ coeff: 1, isX: true }, { coeff: b, isX: false }])],
        right: [bracket(c, [{ coeff: 1, isX: true }, { coeff: -d, isX: false }])],
      };
    }
    case 2: {
      const outerFactor = randInt(2, 9);
      const innerXCoeff = randInt(2, 6);
      const innerConst = randInt(1, 9);
      const rightXCoeff = randInt(2, 9);
      const rightConst = randInt(1, 30);
      return {
        left: [bracket(outerFactor, [{ coeff: innerXCoeff, isX: true }, { coeff: innerConst, isX: false }])],
        right: [xterm(rightXCoeff), term(rightConst)],
      };
    }
    case 3: {
      const a = randInt(2, 9);
      const b = randInt(1, 9);
      const c = randInt(2, 9);
      const d = randInt(1, 9);
      const e = randInt(1, 40);
      return {
        left: [
          bracket(a, [{ coeff: 1, isX: true }, { coeff: -b, isX: false }]),
          bracket(c, [{ coeff: 1, isX: true }, { coeff: d, isX: false }]),
        ],
        right: [term(e)],
      };
    }
    case 4: {
      const a = randInt(2, 9);
      const b = randInt(1, 9);
      const c = randInt(2, 9);
      const d = randInt(1, 9);
      const e = randInt(1, 40);
      return {
        left: [
          bracket(a, [{ coeff: 1, isX: true }, { coeff: -b, isX: false }]),
          bracket(-c, [{ coeff: 1, isX: true }, { coeff: d, isX: false }]),
        ],
        right: [term(e)],
      };
    }
    case 5: {
      const leadConst = randInt(5, 30);
      const innerX = randInt(2, 9);
      const innerC = randInt(1, 9);
      const rightXCoeff = randInt(2, 9);
      const rightConst = randInt(1, 20);
      return {
        left: [term(leadConst), bracket(-1, [{ coeff: innerX, isX: true }, { coeff: -innerC, isX: false }])],
        right: [xterm(rightXCoeff), term(rightConst)],
      };
    }
    case 6: {
      const c1 = round4(randInt(1, 9) + choice([0, 0.5]));
      const x1 = round4(randInt(2, 9) + choice([0, 0.5]));
      const x2 = round4(randInt(2, 9) + choice([0, 0.5]));
      const c2 = round4(randInt(1, 9) + choice([0, 0.5]));
      return { left: [term(c1), xterm(-x1)], right: [term(c2), xterm(-x2)] };
    }
    case 7: {
      const outerXCoeff = randInt(2, 9);
      const bracketFactor = randInt(2, 8);
      const innerXCoeff = randInt(1, 6);
      const innerConst = randInt(1, 9);
      const rhsConst = randInt(1, 40);
      return {
        left: [xterm(outerXCoeff), bracket(-bracketFactor, [{ coeff: innerXCoeff, isX: true }, { coeff: -innerConst, isX: false }])],
        right: [term(rhsConst)],
      };
    }
    default: {
      const a1 = randInt(2, 9);
      const b1 = randInt(1, 9);
      const c1 = randInt(2, 9);
      const d1 = randInt(1, 9);
      const f1 = randInt(1, 15);
      const g1 = randInt(1, 50);
      return {
        left: [
          bracket(a1, [{ coeff: 1, isX: true }, { coeff: b1, isX: false }]),
          bracket(-c1, [{ coeff: 1, isX: true }, { coeff: -d1, isX: false }]),
          term(f1),
        ],
        right: [term(g1)],
      };
    }
  }
}

function genSchwer(): GleichungResult {
  for (let attempt = 0; attempt < 30; attempt++) {
    const { left, right } = genSchwerPieces();
    const lt = buildSide(left).terms;
    const rt = buildSide(right).terms;
    if (Math.abs(sumX(lt) - sumX(rt)) < 1e-6) continue;
    return buildEquation(left, right);
  }
  return buildEquation([xterm(3), term(5)], [xterm(1), term(17)]);
}

// ============================================================================
// KATEGORIEN UND AUFGABEN-SET-ERZEUGUNG
// ============================================================================

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesung: number;
  rechenweg: string[];
}

const KATEGORIE_NAMEN = ['Einfach', 'Mittel', 'Schwer'] as const;

const GENERATORS: Record<(typeof KATEGORIE_NAMEN)[number], () => GleichungResult> = {
  Einfach: genEinfach,
  Mittel: genMittel,
  Schwer: genSchwer,
};

const AUFGABEN_PRO_SET = 16;

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `gen_${idCounter}`;
}

function generiereSet(kategorieName: (typeof KATEGORIE_NAMEN)[number]): Aufgabe[] {
  const gen = GENERATORS[kategorieName];
  const list: Aufgabe[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (list.length < AUFGABEN_PRO_SET && guard < 500) {
    guard++;
    const raw = gen();
    if (seen.has(raw.aufgabe)) continue;
    seen.add(raw.aufgabe);
    list.push({ id: nextId(), ...raw });
  }
  return list;
}

// ============================================================================
// EINGABEPRÜFUNG
// ============================================================================

function areEquivalentSolutions(input: string, expectedSolution: number): boolean {
  try {
    // Deutsches Komma als Dezimaltrennzeichen zulassen (z.B. "-5,14")
    const normalized = input.trim().replace(',', '.');
    const userSolution = parseFloat(normalized);
    if (isNaN(userSolution)) return false;
    // Toleranz von 0,01 statt 0,0001: viele Lösungen sind krumme Brüche
    // (z.B. -36/7 ≈ -5,142857...), im Rechenweg auf 2 Nachkommastellen
    // gerundet dargestellt (≈ -5,14) - genau dieser gerundete Wert muss
    // als richtig gelten.
    return Math.abs(userSolution - expectedSolution) < 0.01;
  } catch {
    return false;
  }
}

// ============================================================================
// KOMPONENTE
// ============================================================================

const LineareGleichungen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>(() => generiereSet(KATEGORIE_NAMEN[0]));
  const [answers, setAnswers] = useState<Record<string, { value: string; isCorrect: boolean | null }>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  const neueAufgaben = useCallback((katName: (typeof KATEGORIE_NAMEN)[number]) => {
    setAufgaben(generiereSet(katName));
    setAnswers({});
    setShowSolutions({});
  }, []);

  useEffect(() => {
    neueAufgaben(KATEGORIE_NAMEN[selectedCategory]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const currentAufgaben = aufgaben;

  const handleInputChange = (aufgabenId: string, value: string) => {
    const trimmedValue = value.trim();

    const aufgabe = currentAufgaben.find((a) => a.id === aufgabenId);
    if (!aufgabe) return;

    const isCorrect = trimmedValue ? areEquivalentSolutions(trimmedValue, aufgabe.loesung) : null;

    setAnswers({
      ...answers,
      [aufgabenId]: { value: trimmedValue, isCorrect },
    });
  };

  const toggleSolution = (aufgabenId: string) => {
    setShowSolutions({
      ...showSolutions,
      [aufgabenId]: !showSolutions[aufgabenId],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-orange-900 mb-1">Lineare Gleichungen lösen</h1>
          <p className="text-xs text-gray-600">
            Löse die Gleichung und gib nur die Lösung für x ein (z.B.: 5, -2, 1,5 oder 1.5). Jede
            Aufgabe wird neu für dich erzeugt.
          </p>
        </div>

        {/* Kategorie Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {KATEGORIE_NAMEN.map((name, index) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(index)}
              className={`px-3 py-1 text-sm rounded font-semibold transition-all ${
                selectedCategory === index
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'
              }`}
            >
              {name} ({AUFGABEN_PRO_SET})
            </button>
          ))}
        </div>

        {/* Aufgaben */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <div className="col-span-full flex items-center justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-700">Löse die Gleichung</p>
            <button
              onClick={() => neueAufgaben(KATEGORIE_NAMEN[selectedCategory])}
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition-all shadow"
            >
              Neue Aufgaben
            </button>
          </div>
          {currentAufgaben.map((aufgabe, index) => {
            const answer = answers[aufgabe.id] || { value: '', isCorrect: null };
            const showSolution = showSolutions[aufgabe.id] || false;

            return (
              <div key={aufgabe.id} className="space-y-1 col-span-1">
                <div className="bg-white rounded shadow border-l-2 border-orange-300 overflow-hidden">
                  {/* Zeile 1: Aufgabe */}
                  <div className="p-2.5 flex items-start gap-2">
                    <span className="text-sm font-bold text-gray-600 whitespace-nowrap pt-1.5">
                      {index + 1})
                    </span>
                    <div className="flex-1 text-sm sm:text-base font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200 break-words">
                      {aufgabe.aufgabe}
                    </div>
                  </div>

                  {/* Zeile 2: Lösungszeile */}
                  <div className="px-2.5 pb-2.5 pt-1 border-t border-gray-100 flex items-center gap-2">
                    <span className="text-base font-bold text-gray-500 whitespace-nowrap pl-6">
                      x =
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="..."
                      value={answer.value}
                      onChange={(e) => handleInputChange(aufgabe.id, e.target.value)}
                      className={`flex-1 min-w-0 px-3 py-2.5 rounded border-2 font-mono text-base transition-all ${
                        answer.isCorrect === null
                          ? 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-200'
                          : answer.isCorrect
                          ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                          : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                      }`}
                    />

                    {/* Status Indicator */}
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {answer.isCorrect === true && (
                        <span className="text-green-600 font-bold text-base">✓</span>
                      )}
                      {answer.isCorrect === false && (
                        <span className="text-red-600 font-bold text-base">✗</span>
                      )}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => toggleSolution(aufgabe.id)}
                      className="text-sm px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all whitespace-nowrap font-semibold flex-shrink-0"
                    >
                      {showSolution ? '✕' : '?'}
                    </button>
                  </div>
                </div>

                {/* Rechenweg - ausklappbar unter der Aufgabe */}
                {showSolution && (
                  <div className="p-2 bg-orange-50 rounded border-l-2 border-orange-400 text-sm">
                    <RechenwegDisplay steps={aufgabe.rechenweg} />
                    <p className="font-semibold text-orange-900 mt-1">
                      Lösung: <span className="font-mono bg-white px-1 rounded">x = {fmtNum(aufgabe.loesung)}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fortschritt */}
        <div className="mt-4 p-3 bg-white rounded shadow border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            Fortschritt: {Object.values(answers).filter((a) => a.isCorrect === true).length} /{' '}
            {currentAufgaben.length} korrekt
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  (Object.values(answers).filter((a) => a.isCorrect === true).length /
                    currentAufgaben.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineareGleichungen;
