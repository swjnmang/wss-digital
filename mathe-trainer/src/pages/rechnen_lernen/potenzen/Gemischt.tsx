import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';

type Level = 1 | 2 | 3 | 4;
type Solution = { coeff: number; base1?: string; exp1?: number; base2?: string; exp2?: number };
type Task = { html: string; solution: Solution; hint?: string };

const AVAILABLE_BASES = ['a', 'b', 'c', 'm', 'n', 'p', 'x', 'y', 'z'];

function getRandomBase(exclude?: string) {
  const filtered = exclude ? AVAILABLE_BASES.filter((b) => b !== exclude) : AVAILABLE_BASES;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Display helpers mirroring legacy formatting
function formatSolutionDisplay(sol: Solution): string {
  if (sol.coeff === 0) return '0 (Der gesamte Term vereinfacht sich zu 0)';
  let term = '';
  const hasAnyBase = !!(sol.base1 || sol.base2);
  if (sol.coeff === 1 && hasAnyBase) {
    // omit 1
  } else if (sol.coeff === -1 && hasAnyBase) {
    term = '-';
  } else {
    term = sol.coeff.toString();
  }
  if (sol.base1) {
    if (term !== '' && term !== '-') term += ' * ';
    term += sol.base1;
    if (sol.exp1 !== undefined && sol.exp1 !== 1) term += `<sup>${sol.exp1}</sup>`;
  }
  if (sol.base2) {
    if (term !== '' && term !== '-') term += ' * ';
    term += sol.base2;
    if (sol.exp2 !== undefined && sol.exp2 !== 1) term += `<sup>${sol.exp2}</sup>`;
  }
  return term || sol.coeff.toString();
}

function formatPreview(coeffStr: string, base1: string, exp1Str: string, base2: string, exp2Str: string): string {
  const coeff = parseLocalizedNumber(coeffStr);
  const exp1 = parseLocalizedNumber(exp1Str);
  const exp2 = parseLocalizedNumber(exp2Str);
  const cStr = coeffStr.trim() === '' || isNaN(coeff) ? '' : `${coeff}`;
  const b1Str = base1.trim();
  const e1Str = exp1Str.trim() === '' || isNaN(exp1) ? '' : `${exp1}`;
  const b2Str = base2.trim();
  const e2Str = exp2Str.trim() === '' || isNaN(exp2) ? '' : `${exp2}`;
  if (!cStr && !b1Str && !e1Str && !b2Str && !e2Str) return 'Vorschau: -';
  let term = '';
  let hasContent = false;
  if (cStr) {
    if (cStr === '1' && (b1Str || b2Str)) {
      // implicit 1
    } else if (cStr === '-1' && (b1Str || b2Str)) {
      term = '-';
    } else {
      term = cStr;
    }
    hasContent = true;
  }
  if (b1Str) {
    if (term !== '' && term !== '-') term += ' * ';
    term += b1Str;
    if (e1Str && e1Str !== '1') term += `<sup>${e1Str}</sup>`;
    else if (!e1Str) term += `<sup>?</sup>`;
    hasContent = true;
  } else if (e1Str && e1Str !== '0') {
    if (term !== '' && term !== '-') term += ' * ';
    term += `?<sup>${e1Str}</sup>`;
    hasContent = true;
  }
  if (b2Str) {
    if (term !== '' && term !== '-') term += ' * ';
    term += b2Str;
    if (e2Str && e2Str !== '1') term += `<sup>${e2Str}</sup>`;
    else if (!e2Str) term += `<sup>?</sup>`;
    hasContent = true;
  } else if (e2Str && e2Str !== '0') {
    if (term !== '' && term !== '-') term += ' * ';
    term += `?<sup>${e2Str}</sup>`;
    hasContent = true;
  }
  if (!hasContent && cStr) term = cStr;
  return `Vorschau: ${term || (cStr || '-')}`;
}

// Task templates ported from legacy gemischt.html
type Template = {
  text: (b1: string, b2?: string) => string;
  solution: (b1: string, b2?: string) => Solution;
  hint: string;
};

// Fraction helper: numerator & denominator same font-size and width, centered.
function frac(n: string, d: string) {
  return `<span class="inline-flex flex-col items-stretch align-middle mx-1 fraction"><span class='px-1 border-b border-current flex justify-center text-base leading-tight min-w-[2.5ch]'>${n}</span><span class='px-1 flex justify-center text-base leading-tight min-w-[2.5ch]'>${d}</span></span>`;
}

const TEMPLATES: Record<Level, Template[]> = {
  1: [
    { text: (b1) => `${b1}<sup>2</sup> * ${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 5 }), hint: 'Potenzen mit gleicher Basis werden multipliziert, indem man die Exponenten addiert.' },
    { text: (b1) => `${frac(`${b1}<sup>5</sup>`, `${b1}<sup>2</sup>`)} `, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 3 }), hint: 'Potenzen mit gleicher Basis werden dividiert, indem man die Exponenten subtrahiert.' },
    { text: (b1) => `(${b1}<sup>3</sup>)<sup>2</sup>`, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 6 }), hint: 'Eine Potenz wird potenziert, indem man die Exponenten multiplizieren.' },
    { text: (b1) => `2${b1}<sup>4</sup> + 3${b1}<sup>4</sup>`, solution: (b1) => ({ coeff: 5, base1: b1, exp1: 4 }), hint: 'Gleichartige Terme: Koeffizienten addieren.' },
    { text: (b1) => `7${b1}<sup>3</sup> - 4${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 3, base1: b1, exp1: 3 }), hint: 'Gleichartige Terme: Koeffizienten subtrahieren.' },
    { text: (b1) => `${frac(`${b1}<sup>2</sup> * ${b1}<sup>4</sup>`, `${b1}<sup>3</sup>`)} `, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 3 }), hint: 'Zähler erst multiplizieren, dann dividieren.' },
    { text: (b1) => `${frac(`6${b1}<sup>5</sup>`, `2${b1}<sup>2</sup>`)} `, solution: (b1) => ({ coeff: 3, base1: b1, exp1: 3 }), hint: 'Koeffizienten dividieren, Exponenten subtrahieren.' },
    { text: (b1) => `4${b1}<sup>2</sup> * 2${b1}<sup>0</sup>`, solution: (b1) => ({ coeff: 8, base1: b1, exp1: 2 }), hint: 'a^0 = 1 (a ≠ 0).'},
    { text: (b1) => `${frac(`10${b1}<sup>7</sup>`, `${b1}<sup>3</sup>`)} - 3${b1}<sup>4</sup>`, solution: (b1) => ({ coeff: 7, base1: b1, exp1: 4 }), hint: 'Punkt vor Strich: erst dividieren, dann subtrahieren.' },
    { text: (b1) => `${frac(`${b1}<sup>4</sup>`, `${b1}<sup>1</sup>`)} + 5${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 6, base1: b1, exp1: 3 }), hint: 'Erst dividieren, dann gleichartige Terme addieren.' },
    { text: (b1) => `(3${b1}<sup>2</sup>)<sup>2</sup>`, solution: (b1) => ({ coeff: 9, base1: b1, exp1: 4 }), hint: '(ab)^n = a^n b^n: auch Koeffizient potenzieren.' },
    { text: (b1) => `8${b1}<sup>3</sup> - ${b1}<sup>3</sup> + 2${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 9, base1: b1, exp1: 3 }), hint: 'Koeffizienten gleichartiger Terme zusammenfassen.' },
    { text: (b1) => `5${b1} * 3${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 15, base1: b1, exp1: 4 }), hint: 'Hinweis: Eine Basis ohne Exponent hat Exponent 1.' },
    { text: (b1) => `${frac(`12${b1}<sup>4</sup>`, `4${b1}`)} `, solution: (b1) => ({ coeff: 3, base1: b1, exp1: 3 }), hint: 'Koeffizienten teilen, Exponenten subtrahieren.' },
  ],
  2: [
    { text: (b1) => `2${b1}<sup>3</sup> * 3${b1}<sup>2</sup> + 4${b1}<sup>5</sup>`, solution: (b1) => ({ coeff: 10, base1: b1, exp1: 5 }), hint: 'Zuerst multiplizieren, dann addieren.' },
  { text: (b1) => `${frac(`15${b1}<sup>6</sup>`, `3${b1}<sup>2</sup>`)} - 2${b1}<sup>4</sup>`, solution: (b1) => ({ coeff: 3, base1: b1, exp1: 4 }), hint: 'Zuerst dividieren, dann subtrahieren.' },
    { text: (b1) => `(2${b1}<sup>2</sup>)<sup>3</sup> - 5${b1}<sup>6</sup>`, solution: (b1) => ({ coeff: 3, base1: b1, exp1: 6 }), hint: 'Klammer potenzieren, dann subtrahieren.' },
  { text: (b1) => `${frac(`12${b1}<sup>6</sup>`, `2${b1}<sup>2</sup>`)} * 3${b1}<sup>1</sup> - 10${b1}<sup>5</sup>`, solution: (b1) => ({ coeff: 8, base1: b1, exp1: 5 }), hint: 'Klammer: dividieren; dann multiplizieren; dann subtrahieren.' },
    { text: (b1) => `3 * (4${b1}<sup>2</sup> - ${b1}<sup>2</sup>) + 2${b1}<sup>2</sup>`, solution: (b1) => ({ coeff: 11, base1: b1, exp1: 2 }), hint: 'Klammer ausrechnen, dann multiplizieren, dann addieren.' },
  { text: (b1) => `${frac(`10${b1}<sup>4</sup> + 5${b1}<sup>4</sup>`, `3${b1}<sup>1</sup>`)} `, solution: (b1) => ({ coeff: 5, base1: b1, exp1: 3 }), hint: 'Zähler addieren, dann dividieren.' },
    { text: (b1) => `(3${b1}<sup>3</sup>)<sup>2</sup> + (2${b1}<sup>2</sup>)<sup>3</sup> - ${b1}<sup>6</sup>`, solution: (b1) => ({ coeff: 16, base1: b1, exp1: 6 }), hint: 'Beide potenzieren, dann zusammenfassen.' },
  { text: (b1) => `${frac(`20${b1}<sup>7</sup>`, `5${b1}<sup>0</sup> * 2${b1}<sup>3</sup>`)} + 3${b1}<sup>4</sup>`, solution: (b1) => ({ coeff: 5, base1: b1, exp1: 4 }), hint: 'b^0=1 beachten; Nenner vereinfachen, dividieren, addieren.' },
    { text: (b1) => `(4${b1} * 2${b1}<sup>2</sup>) - (${b1}<sup>4</sup> / ${b1}<sup>1</sup>) + 5${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 10, base1: b1, exp1: 3 }), hint: 'Klammern getrennt (Punkt vor Strich), dann zusammenfassen.' },
  { text: (b1) => `${frac(`(2${b1})<sup>3</sup> * ${b1}<sup>2</sup>`, `4${b1}`)} - ${b1}<sup>4</sup>`, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 4 }), hint: 'Potenziere, multipliziere, dividiere, dann subtrahiere.' },
    { text: (b1) => `(6${b1}<sup>2</sup> - 2${b1}<sup>2</sup>) * 3${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 12, base1: b1, exp1: 5 }), hint: 'Klammer zuerst (Subtraktion), dann multiplizieren.' },
  { text: (b1) => `2${b1} * ${frac(`(5${b1}<sup>3</sup> - ${b1}<sup>3</sup>)`, `${b1}<sup>2</sup>`)} `, solution: (b1) => ({ coeff: 8, base1: b1, exp1: 2 }), hint: 'Klammer zuerst, dann mal, dann geteilt.' },
  ],
  3: [
  { text: (b1) => `${frac(`(2${b1}<sup>2</sup>)<sup>3</sup> * 3${b1}`, `6${b1}<sup>5</sup>`)} + 2${b1}<sup>2</sup>`, solution: (b1) => ({ coeff: 6, base1: b1, exp1: 2 }), hint: 'Reihenfolge beachten: Potenzieren, multiplizieren, dividieren, addieren.' },
  { text: (b1) => `${frac(`(5${b1}<sup>3</sup>)<sup>2</sup> - 10${b1}<sup>6</sup>`, `3${b1}<sup>2</sup> * ${b1}<sup>1</sup>`)} + ${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 6, base1: b1, exp1: 3 }), hint: 'Klammern zuerst: Zähler potenzieren/subtrahieren; Nenner multiplizieren; dann teilen und addieren.' },
  { text: (b1) => `2 * ${frac(`(3${b1}<sup>2</sup>)<sup>2</sup> + ${b1}<sup>4</sup>`, `5${b1}<sup>3</sup>`)} - ${b1}`, solution: (b1) => ({ coeff: 3, base1: b1, exp1: 1 }), hint: 'Innen potenzieren, addieren, mal 2, dann teilen und subtrahieren.' },
    { text: (b1) => `((4${b1}<sup>3</sup> * 2${b1}<sup>2</sup>) / ${b1}<sup>0</sup>) - ( (2${b1}) * (4${b1}<sup>4</sup>) )`, solution: (b1) => ({ coeff: 0, base1: b1, exp1: 5 }), hint: 'b^0 = 1. Ergebnis 0 ist möglich!' },
    { text: (b1) => `( ( (2${b1}<sup>3</sup>)<sup>4</sup> / (4${b1}<sup>2</sup>) ) - 2${b1}<sup>10</sup> ) * 3`, solution: (b1) => ({ coeff: 6, base1: b1, exp1: 10 }), hint: 'Von innen nach außen: potenzieren, dividieren, subtrahieren, multiplizieren.' },
  { text: (b1) => `${frac(`5${b1}<sup>2</sup> + (3${b1})<sup>2</sup> - 3${b1}<sup>2</sup>`, `11${b1}<sup>1</sup>`)} `, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 1 }), hint: 'Potenzieren, im Zähler zusammenfassen, dann teilen.' },
  { text: (b1) => `${frac(`(2${b1}<sup>5</sup> * 6${b1}<sup>2</sup>)`, `3${b1}<sup>3</sup>`)} + (4${b1}<sup>0</sup> * ${b1}<sup>4</sup>) - ${b1}<sup>4</sup>`, solution: (b1) => ({ coeff: 4, base1: b1, exp1: 4 }), hint: 'Links: mal, dann geteilt. Mitte: b^0 beachten. Rechts: -b^4. Zusammenfassen.' },
  { text: (b1) => `${frac(`(10${b1}<sup>3</sup> / (2${b1}))<sup>2</sup> + 5${b1}<sup>4</sup>`, `3${b1}<sup>2</sup>`)} `, solution: (b1) => ({ coeff: 10, base1: b1, exp1: 2 }), hint: 'Innere Klammer teilen, dann quadrieren; addieren; am Ende teilen.' },
  { text: (b1) => `3${b1} * ${frac(`(2${b1}<sup>2</sup>)<sup>3</sup>`, `4${b1}<sup>4</sup>`)} - 5${b1}<sup>3</sup>`, solution: (b1) => ({ coeff: 1, base1: b1, exp1: 3 }), hint: 'Klammer potenzieren, dann teilen; mit 3b multiplizieren und -5b^3 addieren.' },
  ],
  4: [
    { text: (b1, b2) => `2${b1}<sup>2</sup>${b2}<sup>3</sup> * 3${b1}<sup>4</sup>${b2}<sup>1</sup>`, solution: (b1, b2) => ({ coeff: 6, base1: b1, exp1: 6, base2: b2, exp2: 4 }), hint: 'Koeffizienten multiplizieren; Exponenten je Basis addieren.' },
  { text: (b1, b2) => `${frac(`10${b1}<sup>5</sup>${b2}<sup>2</sup>`, `2${b1}<sup>2</sup>${b2}<sup>1</sup>`)} `, solution: (b1, b2) => ({ coeff: 5, base1: b1, exp1: 3, base2: b2, exp2: 1 }), hint: 'Koeffizienten teilen; Exponenten je Basis subtrahieren.' },
    { text: (b1, b2) => `(2${b1}${b2}<sup>3</sup>)<sup>3</sup>`, solution: (b1, b2) => ({ coeff: 8, base1: b1, exp1: 3, base2: b2, exp2: 9 }), hint: 'Koeffizient und alle Faktoren potenzieren.' },
    { text: (b1, b2) => `3${b1}<sup>2</sup>${b2} * 4${b1}<sup>1</sup>${b2}<sup>3</sup> + 2${b1}<sup>3</sup>${b2}<sup>4</sup>`, solution: (b1, b2) => ({ coeff: 14, base1: b1, exp1: 3, base2: b2, exp2: 4 }), hint: 'Ersten Term multiplizieren, dann gleichartige Terme addieren.' },
  { text: (b1, b2) => `${frac(`6${b1}<sup>4</sup>${b2}<sup>5</sup>`, `3${b1}<sup>2</sup>${b2}<sup>2</sup>`)} * 2${b1}${b2} - 3${b1}<sup>3</sup>${b2}<sup>4</sup>`, solution: (b1, b2) => ({ coeff: 1, base1: b1, exp1: 3, base2: b2, exp2: 4 }), hint: 'Klammer: Division; dann multiplizieren; dann subtrahieren.' },
  { text: (b1, b2) => `${frac(`${b1}<sup>2</sup>${b2}<sup>0</sup> * 5${b1}<sup>3</sup>${b2}<sup>4</sup>`, `${b2}<sup>2</sup>`)} `, solution: (b1, b2) => ({ coeff: 5, base1: b1, exp1: 5, base2: b2, exp2: 2 }), hint: 'b^0=1 beachten. Zähler multiplizieren, dann durch b2^2 teilen.' },
    { text: (b1, b2) => `(2${b1}<sup>2</sup>${b2})<sup>3</sup> * (${b1}${b2}<sup>2</sup>)<sup>2</sup>`, solution: (b1, b2) => ({ coeff: 8, base1: b1, exp1: 8, base2: b2, exp2: 7 }), hint: 'Beide Klammern potenzieren; dann multiplizieren.' },
  { text: (b1, b2) => `${frac(`12${b1}<sup>3</sup>${b2}<sup>3</sup> + 8${b1}<sup>3</sup>${b2}<sup>3</sup>`, `5${b1}${b2}`)} `, solution: (b1, b2) => ({ coeff: 4, base1: b1, exp1: 2, base2: b2, exp2: 2 }), hint: 'Zähler addieren; dann dividieren.' },
  { text: (b1, b2) => `(3${b1}${b2}<sup>2</sup>)<sup>2</sup> * ${frac(`2${b1}<sup>0</sup>${b2}`, `${b1}${b2}<sup>3</sup>`)} `, solution: (b1, b2) => ({ coeff: 18, base1: b1, exp1: 1, base2: b2, exp2: 2 }), hint: 'Potenziere; b1^0 beachten; multiplizieren; dann teilen.' },
  { text: (b1, b2) => `${frac(`10${b1}<sup>4</sup>${b2} - 5${b1}<sup>4</sup>${b2}`, `5${b1}<sup>3</sup>${b2}`)} * (2${b1}${b2}<sup>2</sup>) `, solution: (b1, b2) => ({ coeff: 2, base1: b1, exp1: 2, base2: b2, exp2: 2 }), hint: 'Klammer; dann mal; dann geteilt.' },
  ],
};

export default function Gemischt() {
  const [level, setLevel] = useState<Level>(1);
  const [task, setTask] = useState<Task | null>(null);
  const [usedIdx, setUsedIdx] = useState<Record<Level, number[]>>({ 1: [], 2: [], 3: [], 4: [] });

  const [coeff, setCoeff] = useState('');
  const [base1, setBase1] = useState('');
  const [exp1, setExp1] = useState('');
  const [base2, setBase2] = useState('');
  const [exp2, setExp2] = useState('');
  const [feedback, setFeedback] = useState('');

  const coeffRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    newTask(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function pickTemplate(): Template | null {
    const list = TEMPLATES[level];
    if (!list || list.length === 0) return null;
    const used = usedIdx[level];
    if (used.length >= list.length) {
      // reset rotation
      setUsedIdx((u) => ({ ...u, [level]: [] }));
    }
    let idx: number;
    const banned = new Set(usedIdx[level] || []);
    const maxTries = 20;
    let tries = 0;
    do {
      idx = Math.floor(Math.random() * list.length);
      tries++;
    } while (banned.has(idx) && tries < maxTries);
    setUsedIdx((u) => ({ ...u, [level]: [...(u[level] || []), idx] }));
    return list[idx];
  }

  function newTask() {
    setFeedback('');
    setCoeff(''); setBase1(''); setExp1(''); setBase2(''); setExp2('');
    const tpl = pickTemplate();
    if (!tpl) { setTask(null); return; }
    const b1 = getRandomBase();
    const b2 = level === 4 ? getRandomBase(b1) : undefined;
    const html = tpl.text(b1, b2);
    const solution = tpl.solution(b1, b2);
    setTask({ html, solution, hint: tpl.hint });
    setTimeout(() => coeffRef.current?.focus(), 50);
  }

  function check() {
    if (!task) return;
    const needBase2 = level === 4 && !!task.solution.base2;
    // Essential fields check mirrors legacy (always require coeff, base1, exp1; and base2/exp2 if used)
    if (!coeff.trim() || !base1.trim() || !exp1.trim() || (needBase2 && (!base2.trim() || !exp2.trim()))) {
      let msg = 'Bitte fülle alle relevanten Felder aus (Vorzahl / Koeffizient, Basis 1, Exponent 1';
      if (needBase2) msg += ', Basis 2, Exponent 2';
      msg += ').';
      setFeedback(`❌ ${msg}`);
      return;
    }
    const c = parseLocalizedNumber(coeff);
    const e1 = parseLocalizedNumber(exp1);
    const e2 = parseLocalizedNumber(exp2);
    if (isNaN(c) || isNaN(e1) || (needBase2 && isNaN(e2))) {
      setFeedback('❌ Vorzahl / Koeffizient und Exponent(en) müssen Zahlen sein.');
      return;
    }
    const sol = task.solution;
    let ok = false;
    if (sol.coeff === 0) {
      ok = c === 0;
    } else if (level === 4) {
      const solHasB2 = !!sol.base2;
      if (solHasB2) {
        const a = base1.trim().toLowerCase();
        const b = base2.trim().toLowerCase();
        const s1 = sol.base1?.toLowerCase();
        const s2 = sol.base2?.toLowerCase();
        ok = c === sol.coeff && ((a === s1 && e1 === sol.exp1 && b === s2 && e2 === sol.exp2) || (a === s2 && e1 === sol.exp2 && b === s1 && e2 === sol.exp1));
      } else {
        ok = c === sol.coeff && base1.trim().toLowerCase() === sol.base1 && e1 === sol.exp1 && (!base2.trim());
      }
    } else {
      ok = c === sol.coeff && base1.trim().toLowerCase() === sol.base1 && e1 === sol.exp1;
    }
    if (ok) {
      setFeedback(`✅ Richtig! Die Lösung ist ${formatSolutionDisplay(sol)}.`);
      setTimeout(newTask, 900);
    } else {
      const hint = task.hint ? ` Tipp: ${task.hint}` : '';
      setFeedback(`❌ Leider falsch. Die richtige Lösung wäre ${formatSolutionDisplay(sol)}.${hint ? ' ' + hint : ''}`);
    }
  }

  const preview = formatPreview(coeff, base1, exp1, base2, exp2);

  function onEnter(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter') check(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[560px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          {/* Local style tweaks for fraction exponent vertical alignment */}
          <style>{`
            .fraction sup {font-size:0.65em; top:-0.2em; position:relative; line-height:1;}
            .fraction span {line-height:1.15;}
          `}</style>
          <a href="/rechnen_lernen/potenzen" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Potenz-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Potenzterme zusammenfassen · Gemischt</h1>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setLevel(1)} className={`px-4 py-2 rounded font-bold transition ${level === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setLevel(2)} className={`px-4 py-2 rounded font-bold transition ${level === 2 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setLevel(3)} className={`px-4 py-2 rounded font-bold transition ${level === 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
            <button onClick={() => setLevel(4)} className={`px-4 py-2 rounded font-bold transition ${level === 4 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Experte</button>
          </div>

          <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center min-h-[160px] flex flex-col justify-center">
            <div className="text-sm text-slate-700 mb-2">Fasse so weit wie möglich zusammen. Beachte Punkt-vor-Strich und Potenzregeln.</div>
            <div className="text-xl md:text-2xl font-semibold text-blue-800" dangerouslySetInnerHTML={{ __html: task?.html || '' }} />
          </div>

          {/* Eingabe als formatiertes Potenz-Konstrukt */}
          <div className="w-full max-w-2xl mb-4 flex flex-col items-center">
            <span className="text-xs text-slate-500 mb-1">Deine Lösung eingeben (Form: Koeffizient · Basis<sup>Exponent</sup>{level===4?' · Basis₂<sup>Exponent₂</sup>':''})</span>
            <div className="flex items-center flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="sr-only">Koeffizient</span>
                <input ref={coeffRef} type="text" value={coeff} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setCoeff(e.target.value)} onKeyDown={onEnter} className="w-24 text-center border-2 rounded py-2 px-2 text-lg font-semibold focus:outline-blue-400" placeholder="z.B. 6" />
              </div>
              <div className="relative inline-flex items-start">
                <span className="sr-only">Basis 1</span>
                <input type="text" value={base1} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setBase1(e.target.value.toLowerCase().slice(0,1))} onKeyDown={onEnter} className="w-16 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" placeholder="x" />
                  <input type="text" value={exp1} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setExp1(e.target.value)} onKeyDown={onEnter} className="absolute -top-3 -right-3 w-14 text-center border rounded py-1 text-sm bg-white shadow focus:outline-blue-400" placeholder="n" />
              </div>
              {level===4 && (
                <>
                  <span className="text-xl font-bold">·</span>
                  <div className="relative inline-flex items-start">
                    <span className="sr-only">Basis 2</span>
                    <input type="text" value={base2} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setBase2(e.target.value.toLowerCase().slice(0,1))} onKeyDown={onEnter} className="w-16 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" placeholder="y" />
                      <input type="text" value={exp2} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setExp2(e.target.value)} onKeyDown={onEnter} className="absolute -top-3 -right-3 w-14 text-center border rounded py-1 text-sm bg-white shadow focus:outline-blue-400" placeholder="m" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full max-w-2xl text-center text-slate-600 mb-2 border border-dashed border-slate-300 rounded p-3" dangerouslySetInnerHTML={{ __html: preview }} />

          <div className="flex flex-wrap gap-3 mb-3">
            <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow">Antwort prüfen</button>
            <button onClick={newTask} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow">Neue Aufgabe</button>
          </div>

          {feedback && (
            <div className={`w-full max-w-2xl text-center font-semibold rounded p-3 ${feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>
          )}
        </div>
      </div>
    </div>
  );
}
