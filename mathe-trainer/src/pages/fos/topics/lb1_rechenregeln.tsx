// Lernbereich 1, Thema „Rechenregeln, ganze Zahlen und Brüche“:
// acht Unterthemen mit eigener Erklärung und je mehreren Aufgabentypen.
// Jeder Aufgabentyp erzeugt viele verschiedene Aufgaben (feste Vorlagen ≥ 20 bzw. Zufallszahlen).

import type { Gen, PracticeSection } from '../../raum_und_form/engine/types';
import { F, Fr, ch, chFixed, gcd, lcm, nm, nz, p, pick, ri, shuffle, t, WF } from '../lib';

const EXACT = { tol: 1e-6 };
const INT = { integer: true };
const FR_HINT = '(Eingabe als Bruch, z. B. -5/6)';
const r9 = () => ri(2, 9);

const ARTEN = ['Summe', 'Differenz', 'Produkt', 'Quotient', 'Potenz'];
const VERB: Record<string, string> = {
  Summe: 'die Addition',
  Differenz: 'die Subtraktion',
  Produkt: 'die Multiplikation',
  Quotient: 'die Division',
  Potenz: 'das Potenzieren',
};
const termArtPart = (art: string, q = 'Der Term ist eine …') => chFixed(q, ARTEN, ARTEN.indexOf(art));

// ---------------------------------------------------------------------------
// 1. Termart bestimmen
// ---------------------------------------------------------------------------

interface ZT {
  tex: string;
  art: string;
  val: number;
  steps: string[];
}

const zahlTerme: (() => ZT)[] = [
  () => {
    const [a, b, c] = [r9(), r9(), r9()];
    return { tex: `(${a} + ${b}) \\cdot ${c}`, art: 'Produkt', val: (a + b) * c, steps: [`Klammer: $${a} + ${b} = ${a + b}$`, `zuletzt multiplizieren: $${a + b} \\cdot ${c} = ${(a + b) * c}$`] };
  },
  () => {
    const [a, b, c] = [r9(), r9(), r9()];
    return { tex: `${a} \\cdot ${b} + ${c}`, art: 'Summe', val: a * b + c, steps: [`Punkt vor Strich: $${a} \\cdot ${b} = ${a * b}$`, `zuletzt addieren: $${a * b} + ${c} = ${a * b + c}$`] };
  },
  () => {
    const [a, b, c] = [r9(), r9(), r9()];
    return { tex: `${a} + ${b} \\cdot ${c}`, art: 'Summe', val: a + b * c, steps: [`Punkt vor Strich: $${b} \\cdot ${c} = ${b * c}$`, `zuletzt addieren: $${a} + ${b * c} = ${a + b * c}$`] };
  },
  () => {
    const [a, b, c] = [r9(), r9(), r9()];
    return { tex: `${a} \\cdot ${b} - ${c}`, art: 'Differenz', val: a * b - c, steps: [`Punkt vor Strich: $${a} \\cdot ${b} = ${a * b}$`, `zuletzt subtrahieren: $${a * b} - ${c} = ${a * b - c}$`] };
  },
  () => {
    const [a, b, c] = [ri(20, 60), r9(), r9()];
    return { tex: `${a} - ${b} \\cdot ${c}`, art: 'Differenz', val: a - b * c, steps: [`Punkt vor Strich: $${b} \\cdot ${c} = ${b * c}$`, `zuletzt subtrahieren: $${a} - ${b * c} = ${a - b * c}$`] };
  },
  () => {
    const c = r9();
    const s = c * r9();
    const a = ri(1, s - 1);
    return { tex: `(${a} + ${s - a}) : ${c}`, art: 'Quotient', val: s / c, steps: [`Klammer: $${a} + ${s - a} = ${s}$`, `zuletzt dividieren: $${s} : ${c} = ${s / c}$`] };
  },
  () => {
    const a = r9();
    const b = ri(6, 15);
    const c = ri(1, b - 1);
    return { tex: `${a} \\cdot (${b} - ${c})`, art: 'Produkt', val: a * (b - c), steps: [`Klammer: $${b} - ${c} = ${b - c}$`, `zuletzt multiplizieren: $${a} \\cdot ${b - c} = ${a * (b - c)}$`] };
  },
  () => {
    const [a, b] = [r9(), r9()];
    return { tex: `${a}^{2} + ${b}`, art: 'Summe', val: a * a + b, steps: [`Potenz zuerst: $${a}^{2} = ${a * a}$`, `zuletzt addieren: $${a * a} + ${b} = ${a * a + b}$`] };
  },
  () => {
    const [a, b] = [ri(1, 6), ri(1, 6)];
    return { tex: `(${a} + ${b})^{2}`, art: 'Potenz', val: (a + b) ** 2, steps: [`Klammer: $${a} + ${b} = ${a + b}$`, `zuletzt quadrieren: $${a + b}^{2} = ${(a + b) ** 2}$`] };
  },
  () => {
    const [a, b, c] = [r9(), r9(), ri(2, 5)];
    return { tex: `${a} \\cdot ${b} \\cdot ${c}`, art: 'Produkt', val: a * b * c, steps: [`von links nach rechts: $${a} \\cdot ${b} = ${a * b}$`, `zuletzt multiplizieren: $${a * b} \\cdot ${c} = ${a * b * c}$`] };
  },
  () => {
    const [a, b, c] = [ri(10, 40), r9(), r9()];
    return { tex: `${a} + ${b} - ${c}`, art: 'Differenz', val: a + b - c, steps: [`von links nach rechts: $${a} + ${b} = ${a + b}$`, `zuletzt subtrahieren: $${a + b} - ${c} = ${a + b - c}$`] };
  },
  () => {
    const [a, b, c] = [ri(10, 40), r9(), r9()];
    return { tex: `${a} - ${b} + ${c}`, art: 'Summe', val: a - b + c, steps: [`von links nach rechts: $${a} - ${b} = ${a - b}$`, `zuletzt addieren: $${a - b} + ${c} = ${a - b + c}$`] };
  },
  () => {
    const c = r9();
    const a = c * ri(1, 5);
    const b = r9();
    return { tex: `${a} \\cdot ${b} : ${c}`, art: 'Quotient', val: (a * b) / c, steps: [`von links nach rechts: $${a} \\cdot ${b} = ${a * b}$`, `zuletzt dividieren: $${a * b} : ${c} = ${(a * b) / c}$`] };
  },
  () => {
    const [b, q, c] = [r9(), r9(), r9()];
    return { tex: `${b * q} : ${b} \\cdot ${c}`, art: 'Produkt', val: q * c, steps: [`von links nach rechts: $${b * q} : ${b} = ${q}$`, `zuletzt multiplizieren: $${q} \\cdot ${c} = ${q * c}$`] };
  },
  () => {
    const a = ri(6, 15);
    const b = ri(1, a - 1);
    const [c, d] = [r9(), r9()];
    return {
      tex: `(${a} - ${b}) \\cdot (${c} + ${d})`,
      art: 'Produkt',
      val: (a - b) * (c + d),
      steps: [`beide Klammern: $${a} - ${b} = ${a - b}$ und $${c} + ${d} = ${c + d}$`, `zuletzt multiplizieren: $${a - b} \\cdot ${c + d} = ${(a - b) * (c + d)}$`],
    };
  },
  () => {
    const [a, b, c, d] = [r9(), r9(), r9(), r9()];
    return { tex: `${a} \\cdot ${b} + ${c} \\cdot ${d}`, art: 'Summe', val: a * b + c * d, steps: [`Punkt vor Strich: $${a} \\cdot ${b} = ${a * b}$ und $${c} \\cdot ${d} = ${c * d}$`, `zuletzt addieren: $${a * b} + ${c * d} = ${a * b + c * d}$`] };
  },
  () => {
    const [a, b, c, d] = [r9(), r9(), r9(), r9()];
    return { tex: `${a} \\cdot ${b} - ${c} \\cdot ${d}`, art: 'Differenz', val: a * b - c * d, steps: [`Punkt vor Strich: $${a} \\cdot ${b} = ${a * b}$ und $${c} \\cdot ${d} = ${c * d}$`, `zuletzt subtrahieren: $${a * b} - ${c * d} = ${a * b - c * d}$`] };
  },
  () => {
    const [b, q, c] = [r9(), r9(), r9()];
    return { tex: `${b * q} : ${b} + ${c}`, art: 'Summe', val: q + c, steps: [`Punkt vor Strich: $${b * q} : ${b} = ${q}$`, `zuletzt addieren: $${q} + ${c} = ${q + c}$`] };
  },
  () => {
    const c = r9();
    const s = c * r9();
    const a = ri(1, s - 1);
    return { tex: `\\frac{${a} + ${s - a}}{${c}}`, art: 'Quotient', val: s / c, steps: [`Zähler: $${a} + ${s - a} = ${s}$`, `zuletzt dividieren (Bruchstrich): $${s} : ${c} = ${s / c}$`] };
  },
  () => {
    const [n, a] = [ri(2, 4), r9()];
    return { tex: `2^{${n}} \\cdot ${a}`, art: 'Produkt', val: 2 ** n * a, steps: [`Potenz zuerst: $2^{${n}} = ${2 ** n}$`, `zuletzt multiplizieren: $${2 ** n} \\cdot ${a} = ${2 ** n * a}$`] };
  },
  () => {
    const [a, b, c, d] = [r9(), r9(), r9(), r9()];
    return {
      tex: `${a} \\cdot (${b} + ${c} \\cdot ${d})`,
      art: 'Produkt',
      val: a * (b + c * d),
      steps: [`in der Klammer Punkt vor Strich: $${c} \\cdot ${d} = ${c * d}$, $${b} + ${c * d} = ${b + c * d}$`, `zuletzt multiplizieren: $${a} \\cdot ${b + c * d} = ${a * (b + c * d)}$`],
    };
  },
  () => {
    const [a, b, c, d] = [r9(), r9(), r9(), r9()];
    return { tex: `(${a} + ${b}) \\cdot ${c} - ${d}`, art: 'Differenz', val: (a + b) * c - d, steps: [`Klammer: $${a} + ${b} = ${a + b}$`, `Punkt vor Strich: $${a + b} \\cdot ${c} = ${(a + b) * c}$`, `zuletzt subtrahieren: $${(a + b) * c} - ${d} = ${(a + b) * c - d}$`] };
  },
  () => {
    const [a, b, c] = [r9(), ri(2, 5), r9()];
    return { tex: `${a} + ${b}^{2} \\cdot ${c}`, art: 'Summe', val: a + b * b * c, steps: [`Potenz: $${b}^{2} = ${b * b}$`, `Punkt vor Strich: $${b * b} \\cdot ${c} = ${b * b * c}$`, `zuletzt addieren: $${a} + ${b * b * c} = ${a + b * b * c}$`] };
  },
  () => {
    const [a, b] = [r9(), r9()];
    return { tex: `${a}^{2} - ${b}^{2}`, art: 'Differenz', val: a * a - b * b, steps: [`Potenzen zuerst: $${a}^{2} = ${a * a}$ und $${b}^{2} = ${b * b}$`, `zuletzt subtrahieren: $${a * a} - ${b * b} = ${a * a - b * b}$`] };
  },
  () => {
    const a = ri(3, 7);
    const b = ri(1, a - 1);
    return { tex: `(${a} - ${b})^{3}`, art: 'Potenz', val: (a - b) ** 3, steps: [`Klammer: $${a} - ${b} = ${a - b}$`, `zuletzt potenzieren: $${a - b}^{3} = ${(a - b) ** 3}$`] };
  },
  () => {
    const [a, c, q, d] = [r9(), r9(), r9(), ri(2, 5)];
    return {
      tex: `(${a} + ${c * q} : ${c}) \\cdot ${d}`,
      art: 'Produkt',
      val: (a + q) * d,
      steps: [`in der Klammer Punkt vor Strich: $${c * q} : ${c} = ${q}$, $${a} + ${q} = ${a + q}$`, `zuletzt multiplizieren: $${a + q} \\cdot ${d} = ${(a + q) * d}$`],
    };
  },
];

const termArtZahlen: Gen = () => {
  const z = pick(zahlTerme)();
  return {
    title: 'Termart bestimmen und berechnen',
    text: `Gegeben ist der Term $${z.tex}$.\na) Wie heißt der Term? (Entscheidend ist die Rechenart, die **zuletzt** ausgeführt wird.)\nb) Berechne den Wert des Terms.`,
    parts: [termArtPart(z.art, 'a) Der Term ist eine …'), nm('b) Wert', z.val, INT)],
    solution: [
      'Reihenfolge: **Klammer → Potenz → Punkt → Strich**, Gleichrangiges von links nach rechts.',
      ...z.steps,
      `Zuletzt wird ${VERB[z.art]} ausgeführt, also ist der Term eine **${z.art}**. Wert: $${z.val}$`,
    ],
  };
};

const termArtVariablen: Gen = () => {
  const k = r9();
  const m = r9();
  const items: [string, string, string][] = [
    [`${k}x + ${m}`, 'Summe', `Erst $${k} \\cdot x$, zuletzt wird $${m}$ addiert.`],
    [`${k}(x + ${m})`, 'Produkt', `Erst die Klammer, zuletzt wird mit $${k}$ multipliziert.`],
    [`${k}a - ${m}`, 'Differenz', `Erst $${k} \\cdot a$, zuletzt wird $${m}$ subtrahiert.`],
    [`\\frac{x}{${k}} + ${m}`, 'Summe', 'Erst der Bruch (Division), zuletzt die Addition.'],
    [`\\frac{x + ${m}}{${k}}`, 'Quotient', `Der Zähler wird zuerst berechnet, zuletzt wird durch $${k}$ geteilt (Bruchstrich).`],
    [`(x - ${m})^{2}`, 'Potenz', 'Erst die Klammer, zuletzt wird quadriert.'],
    [`x^{2} - ${m}`, 'Differenz', 'Erst das Quadrat, zuletzt die Subtraktion.'],
    [`${k}x \\cdot y`, 'Produkt', 'Es kommen nur Multiplikationen vor.'],
    [`(a + b) : ${k}`, 'Quotient', `Erst die Klammer, zuletzt wird durch $${k}$ geteilt.`],
    [`a + b : ${k}`, 'Summe', `Punkt vor Strich: erst $b : ${k}$, zuletzt die Addition.`],
    [`${m + 10} - ${k}x`, 'Differenz', `Erst $${k} \\cdot x$, zuletzt die Subtraktion.`],
    [`(${k}x + 1)(x - ${m})`, 'Produkt', 'Beide Klammern zuerst, zuletzt werden sie miteinander multipliziert.'],
    [`x^{2} + ${k}x + ${m}`, 'Summe', 'Potenz und Produkt zuerst, zuletzt wird addiert.'],
    [`(x + ${m})^{3}`, 'Potenz', 'Erst die Klammer, zuletzt wird hoch 3 genommen.'],
    [`${k}x^{3}`, 'Produkt', `Der Exponent gehört nur zu $x$: erst $x^{3}$, zuletzt mit $${k}$ multiplizieren.`],
    [`\\frac{${k}}{x} - ${m}`, 'Differenz', 'Erst der Bruch, zuletzt die Subtraktion.'],
    ['\\frac{a - b}{a + b}', 'Quotient', 'Zähler und Nenner zuerst, zuletzt die Division (Bruchstrich).'],
    [`a \\cdot (b - c) + ${m}`, 'Summe', 'Klammer, dann Produkt, zuletzt die Addition.'],
    [`(a - b)^{2} \\cdot ${k}`, 'Produkt', 'Klammer, dann Quadrat, zuletzt die Multiplikation.'],
    [`x : (y + ${m})`, 'Quotient', 'Erst die Klammer, zuletzt die Division.'],
    [`${3 * k} - (x + y)`, 'Differenz', 'Erst die Klammer, zuletzt wird sie subtrahiert.'],
    [`(${k}x)^{2}`, 'Potenz', 'Erst die Klammer, zuletzt wird quadriert.'],
    ['x + y \\cdot z', 'Summe', 'Punkt vor Strich: erst $y \\cdot z$, zuletzt die Addition.'],
    ['r^{2} \\cdot \\pi', 'Produkt', 'Erst das Quadrat, zuletzt die Multiplikation mit $\\pi$.'],
    ['\\frac{1}{2} \\cdot g \\cdot h', 'Produkt', 'Es kommen nur Multiplikationen vor.'],
    ['(a + c) \\cdot h : 2', 'Quotient', 'Klammer, dann von links nach rechts: zuletzt wird durch $2$ geteilt.'],
  ];
  const [tex, art, why] = pick(items);
  return {
    title: 'Termart bei Termen mit Variablen',
    text: `Wie heißt der Term $${tex}$?`,
    parts: [termArtPart(art)],
    solution: ['Die Termart richtet sich nach der Rechenart, die **zuletzt** ausgeführt wird – auch wenn Variablen vorkommen.', why, `Der Term ist eine **${art}**.`],
  };
};

interface TS {
  art: string;
  nums: () => number[];
  desc: (n: number[]) => string;
  tex: (n: number[]) => string;
  val: (n: number[]) => number;
  steps: (n: number[]) => string[];
}

const VIELFACH: Record<number, string> = { 2: 'Doppelte', 3: 'Dreifache', 4: 'Vierfache', 5: 'Fünffache' };

const textStrukturen: TS[] = [
  {
    art: 'Produkt',
    nums: () => [r9(), r9(), r9(), r9()],
    desc: ([a, b, c]) => `das Produkt aus der Summe von ${a} und ${b} und der Zahl ${c}`,
    tex: ([a, b, c]) => `(${a} + ${b}) \\cdot ${c}`,
    val: ([a, b, c]) => (a + b) * c,
    steps: ([a, b, c]) => [`$${a} + ${b} = ${a + b}$`, `$${a + b} \\cdot ${c} = ${(a + b) * c}$`],
  },
  {
    art: 'Produkt',
    nums: () => [r9(), r9(), r9(), r9()],
    desc: ([a, b, c]) => `das Produkt aus ${a} und der Summe von ${b} und ${c}`,
    tex: ([a, b, c]) => `${a} \\cdot (${b} + ${c})`,
    val: ([a, b, c]) => a * (b + c),
    steps: ([a, b, c]) => [`$${b} + ${c} = ${b + c}$`, `$${a} \\cdot ${b + c} = ${a * (b + c)}$`],
  },
  {
    art: 'Differenz',
    nums: () => [ri(20, 60), r9(), r9(), r9()],
    desc: ([a, b, c]) => `die Differenz aus ${a} und dem Produkt von ${b} und ${c}`,
    tex: ([a, b, c]) => `${a} - ${b} \\cdot ${c}`,
    val: ([a, b, c]) => a - b * c,
    steps: ([a, b, c]) => [`$${b} \\cdot ${c} = ${b * c}$`, `$${a} - ${b * c} = ${a - b * c}$`],
  },
  {
    art: 'Quotient',
    nums: () => {
      const c = r9();
      const s = c * r9();
      const a = ri(1, s - 1);
      return [a, s - a, c, r9()];
    },
    desc: ([a, b, c]) => `der Quotient aus der Summe von ${a} und ${b} und der Zahl ${c}`,
    tex: ([a, b, c]) => `(${a} + ${b}) : ${c}`,
    val: ([a, b, c]) => (a + b) / c,
    steps: ([a, b, c]) => [`$${a} + ${b} = ${a + b}$`, `$${a + b} : ${c} = ${(a + b) / c}$`],
  },
  {
    art: 'Summe',
    nums: () => {
      const d = r9();
      return [r9(), r9(), d * r9(), d];
    },
    desc: ([a, b, c, d]) => `die Summe aus dem Produkt von ${a} und ${b} und dem Quotienten von ${c} und ${d}`,
    tex: ([a, b, c, d]) => `${a} \\cdot ${b} + ${c} : ${d}`,
    val: ([a, b, c, d]) => a * b + c / d,
    steps: ([a, b, c, d]) => [`$${a} \\cdot ${b} = ${a * b}$ und $${c} : ${d} = ${c / d}$`, `$${a * b} + ${c / d} = ${a * b + c / d}$`],
  },
  {
    art: 'Produkt',
    nums: () => {
      const a = ri(8, 20);
      return [a, ri(1, a - 1), r9(), r9()];
    },
    desc: ([a, b, c, d]) => `das Produkt aus der Differenz von ${a} und ${b} und der Summe von ${c} und ${d}`,
    tex: ([a, b, c, d]) => `(${a} - ${b}) \\cdot (${c} + ${d})`,
    val: ([a, b, c, d]) => (a - b) * (c + d),
    steps: ([a, b, c, d]) => [`$${a} - ${b} = ${a - b}$ und $${c} + ${d} = ${c + d}$`, `$${a - b} \\cdot ${c + d} = ${(a - b) * (c + d)}$`],
  },
  {
    art: 'Differenz',
    nums: () => [r9(), r9(), r9(), r9()],
    desc: ([a, b]) => `die Differenz aus dem Quadrat von ${a} und dem Doppelten von ${b}`,
    tex: ([a, b]) => `${a}^{2} - 2 \\cdot ${b}`,
    val: ([a, b]) => a * a - 2 * b,
    steps: ([a, b]) => [`$${a}^{2} = ${a * a}$ und $2 \\cdot ${b} = ${2 * b}$`, `$${a * a} - ${2 * b} = ${a * a - 2 * b}$`],
  },
  {
    art: 'Produkt',
    nums: () => {
      const a = ri(8, 20);
      return [a, ri(1, a - 1), ri(2, 5), r9()];
    },
    desc: ([a, b, k]) => `das ${VIELFACH[k] ?? `${k}-Fache`} der Differenz von ${a} und ${b}`,
    tex: ([a, b, k]) => `${k} \\cdot (${a} - ${b})`,
    val: ([a, b, k]) => k * (a - b),
    steps: ([a, b, k]) => [`$${a} - ${b} = ${a - b}$`, `$${k} \\cdot ${a - b} = ${k * (a - b)}$`],
  },
  {
    art: 'Quotient',
    nums: () => {
      const d = r9();
      const c = ri(1, 9);
      return [d * r9(), c + d, c, r9()];
    },
    desc: ([a, b, c]) => `der Quotient aus ${a} und der Differenz von ${b} und ${c}`,
    tex: ([a, b, c]) => `${a} : (${b} - ${c})`,
    val: ([a, b, c]) => a / (b - c),
    steps: ([a, b, c]) => [`$${b} - ${c} = ${b - c}$`, `$${a} : ${b - c} = ${a / (b - c)}$`],
  },
  {
    art: 'Quotient',
    nums: () => {
      const a = ri(3, 30);
      return [a, a % 2 === 0 ? 2 * ri(1, 10) : 2 * ri(1, 10) - 1, r9(), r9()];
    },
    desc: ([a, b]) => `die Hälfte der Summe aus ${a} und ${b}`,
    tex: ([a, b]) => `(${a} + ${b}) : 2`,
    val: ([a, b]) => (a + b) / 2,
    steps: ([a, b]) => [`$${a} + ${b} = ${a + b}$`, `$${a + b} : 2 = ${(a + b) / 2}$`],
  },
  {
    art: 'Potenz',
    nums: () => [ri(1, 7), ri(1, 7), r9(), r9()],
    desc: ([a, b]) => `das Quadrat der Summe von ${a} und ${b}`,
    tex: ([a, b]) => `(${a} + ${b})^{2}`,
    val: ([a, b]) => (a + b) ** 2,
    steps: ([a, b]) => [`$${a} + ${b} = ${a + b}$`, `$${a + b}^{2} = ${(a + b) ** 2}$`],
  },
  {
    art: 'Summe',
    nums: () => [ri(3, 30), r9(), r9(), r9()],
    desc: ([a, b]) => `die Summe aus ${a} und dem Quadrat von ${b}`,
    tex: ([a, b]) => `${a} + ${b}^{2}`,
    val: ([a, b]) => a + b * b,
    steps: ([a, b]) => [`$${b}^{2} = ${b * b}$`, `$${a} + ${b * b} = ${a + b * b}$`],
  },
  {
    art: 'Differenz',
    nums: () => [r9(), r9(), r9(), r9()],
    desc: ([a, b, c, d]) => `die Differenz aus dem Produkt von ${a} und ${b} und der Summe von ${c} und ${d}`,
    tex: ([a, b, c, d]) => `${a} \\cdot ${b} - (${c} + ${d})`,
    val: ([a, b, c, d]) => a * b - (c + d),
    steps: ([a, b, c, d]) => [`$${a} \\cdot ${b} = ${a * b}$ und $${c} + ${d} = ${c + d}$`, `$${a * b} - ${c + d} = ${a * b - (c + d)}$`],
  },
  {
    art: 'Summe',
    nums: () => {
      const b = r9();
      return [b * r9(), b, r9(), r9()];
    },
    desc: ([a, b, c]) => `die Summe aus dem Quotienten von ${a} und ${b} und der Zahl ${c}`,
    tex: ([a, b, c]) => `${a} : ${b} + ${c}`,
    val: ([a, b, c]) => a / b + c,
    steps: ([a, b, c]) => [`$${a} : ${b} = ${a / b}$`, `$${a / b} + ${c} = ${a / b + c}$`],
  },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const textZuTerm: Gen = () => {
  const s = pick(textStrukturen);
  const n = s.nums();
  return {
    title: 'Vom Text zum Term',
    text: `Schreibe als Term und berechne:\n„${cap(s.desc(n))}“`,
    parts: [termArtPart(s.art, 'a) Welche Termart beschreibt der Text?'), nm('b) Wert', s.val(n), INT)],
    solution: [
      `Das erste Wort nennt die Rechenart, die **zuletzt** ausgeführt wird → **${s.art}**.`,
      `Term: $${s.tex(n)}$`,
      ...s.steps(n),
      `Wert: $${s.val(n)}$`,
    ],
  };
};

const termZuText: Gen = () => {
  const i = ri(0, textStrukturen.length - 1);
  const s = textStrukturen[i];
  const n = s.nums();
  const right = cap(s.desc(n));
  const others = shuffle(textStrukturen.filter((_, j) => j !== i))
    .slice(0, 3)
    .map((o) => cap(o.desc(n)));
  return {
    title: 'Vom Term zum Text',
    text: `Welche Beschreibung passt zum Term $${s.tex(n)}$?`,
    parts: [ch('Beschreibung:', right, others)],
    solution: [`Zuletzt wird ${VERB[s.art]} ausgeführt – der Term ist eine **${s.art}**.`, `Richtig ist: „${right}“`],
  };
};

// ---------------------------------------------------------------------------
// 2. Fachbegriffe
// ---------------------------------------------------------------------------

const NAMEN = ['Summand', 'Minuend', 'Subtrahend', 'Faktor', 'Dividend', 'Divisor'];
const NAMEN_WHY: Record<string, string> = {
  Summand: 'Der eingerahmte Teil wird addiert → **Summand**.',
  Minuend: 'Der eingerahmte Teil steht **vor** dem Minuszeichen, von ihm wird abgezogen → **Minuend**.',
  Subtrahend: 'Der eingerahmte Teil steht **hinter** dem Minuszeichen, er wird abgezogen → **Subtrahend**.',
  Faktor: 'Der eingerahmte Teil wird multipliziert → **Faktor**.',
  Dividend: 'Der eingerahmte Teil wird geteilt (steht vor $:$ bzw. im Zähler) → **Dividend**.',
  Divisor: 'Durch den eingerahmten Teil wird geteilt (steht hinter $:$ bzw. im Nenner) → **Divisor**.',
  Basis: 'Die Zahl, die mit sich selbst multipliziert wird, heißt **Basis**.',
  Exponent: 'Die hochgestellte Zahl gibt an, wie oft die Basis multipliziert wird → **Exponent**.',
};
const bx = (s: string | number) => `\\boxed{${s}}`;

const operandName: Gen = () => {
  const a = ri(12, 60);
  const [b, c, d] = [r9(), r9(), r9()];
  const items: [string, string][] = [
    [`${a} + ${bx(b)}`, 'Summand'],
    [`${bx(a)} + ${b}`, 'Summand'],
    [`${bx(a)} - ${b}`, 'Minuend'],
    [`${a} - ${bx(b)}`, 'Subtrahend'],
    [`${a} \\cdot ${bx(b)}`, 'Faktor'],
    [`${bx(a)} \\cdot ${b}`, 'Faktor'],
    [`${bx(a * b)} : ${b}`, 'Dividend'],
    [`${a * b} : ${bx(b)}`, 'Divisor'],
    [`${bx(`(${b} + ${c})`)} \\cdot ${d}`, 'Faktor'],
    [`${a} - ${bx(`${b} \\cdot ${c}`)}`, 'Subtrahend'],
    [`${bx(`${b} \\cdot ${c}`)} - ${d}`, 'Minuend'],
    [`${bx(`(${a} - ${b})`)} : ${c}`, 'Dividend'],
    [`${a} : ${bx(`(${b} + ${c})`)}`, 'Divisor'],
    [`${a} + ${bx(`${b * c} : ${c}`)}`, 'Summand'],
    [`${b} \\cdot ${c} + ${bx(`${d} \\cdot ${b}`)}`, 'Summand'],
    [`(${a} + ${b}) \\cdot ${bx(`(${c} + ${d})`)}`, 'Faktor'],
    [`${bx(b)}^{${c}}`, 'Basis'],
    [`${b}^{${bx(c)}}`, 'Exponent'],
    [`${a} - ${bx(`(${b} + ${c})`)}`, 'Subtrahend'],
    [`${bx(`${a * b} : ${b}`)} - ${c}`, 'Minuend'],
    [`(${a} \\cdot ${b}) : ${bx(c)}`, 'Divisor'],
    [`\\frac{${bx(`${b} + ${c}`)}}{${d}}`, 'Dividend'],
    [`\\frac{${a}}{${bx(`${b} + ${c}`)}}`, 'Divisor'],
    [`${bx(`(${b} + ${c})^{2}`)} + ${d}`, 'Summand'],
  ];
  const [tex, name] = pick(items);
  const pool = name === 'Basis' || name === 'Exponent' ? ['Basis', 'Exponent', 'Faktor', 'Summand'] : NAMEN;
  return {
    title: 'Fachbegriffe: Operanden benennen',
    text: `Wie heißt der eingerahmte Teil im Term $${tex}$?`,
    parts: [ch('Bezeichnung:', name, shuffle(pool.filter((x) => x !== name)).slice(0, 3))],
    solution: [
      'Summand $+$ Summand $=$ Summe · Minuend $-$ Subtrahend $=$ Differenz · Faktor $\\cdot$ Faktor $=$ Produkt · Dividend $:$ Divisor $=$ Quotient · $\\text{Basis}^{\\text{Exponent}}$ $=$ Potenz',
      'Ein ganzer Teilterm (z. B. eine Klammer) zählt als **ein** Operand der Rechnung, die zuletzt ausgeführt wird.',
      NAMEN_WHY[name],
    ],
  };
};

const fachbegriffRechnen: Gen = () => {
  const k = ri(0, 11);
  const a = ri(25, 80);
  const b = r9();
  const q = ri(3, 15);
  if (k === 0) return fb(`Der erste Summand ist $${a}$, der zweite Summand ist $${b * 7}$. Berechne die Summe.`, a + 7 * b, [`$${a} + ${7 * b} = ${a + 7 * b}$`]);
  if (k === 1) return fb(`Der Minuend ist $${a}$, der Subtrahend ist $${b + 10}$. Berechne die Differenz.`, a - b - 10, [`Minuend $-$ Subtrahend: $${a} - ${b + 10} = ${a - b - 10}$`]);
  if (k === 2) return fb(`Die beiden Faktoren sind $${q}$ und $${b}$. Berechne das Produkt.`, q * b, [`$${q} \\cdot ${b} = ${q * b}$`]);
  if (k === 3) return fb(`Der Dividend ist $${b * q}$, der Divisor ist $${b}$. Berechne den Quotienten.`, q, [`Dividend $:$ Divisor: $${b * q} : ${b} = ${q}$`]);
  if (k === 4) {
    const s = a + 25;
    return fb(`Die Summe ist $${s}$, ein Summand ist $${a}$. Wie groß ist der andere Summand?`, 25, [`$${a} + x = ${s} \\quad | -${a}$`, `$x = ${s} - ${a} = 25$`]);
  }
  if (k === 5) {
    const D = ri(5, 40);
    return fb(`Die Differenz ist $${D}$, der Subtrahend ist $${a}$. Bestimme den Minuenden.`, D + a, [`$x - ${a} = ${D} \\quad | +${a}$`, `$x = ${D} + ${a} = ${D + a}$`]);
  }
  if (k === 6) {
    const D = ri(2, a - 2);
    return fb(`Die Differenz ist $${D}$, der Minuend ist $${a}$. Bestimme den Subtrahenden.`, a - D, [
      `$${a} - x = ${D} \\quad | +x$`,
      `$${a} = ${D} + x \\quad | -${D}$`,
      `$x = ${a - D}$`,
    ]);
  }
  if (k === 7) return fb(`Das Produkt ist $${b * q}$, ein Faktor ist $${b}$. Bestimme den anderen Faktor.`, q, [`$${b} \\cdot x = ${b * q} \\quad | :${b}$`, `$x = ${b * q} : ${b} = ${q}$`]);
  if (k === 8) return fb(`Der Quotient ist $${q}$, der Divisor ist $${b}$. Bestimme den Dividenden.`, q * b, [`$x : ${b} = ${q} \\quad | \\cdot ${b}$`, `$x = ${q} \\cdot ${b} = ${q * b}$`]);
  if (k === 9)
    return fb(`Der Quotient ist $${q}$, der Dividend ist $${q * b}$. Bestimme den Divisor.`, b, [
      `$${q * b} : x = ${q} \\quad | \\cdot x$`,
      `$${q * b} = ${q} \\cdot x \\quad | :${q}$`,
      `$x = ${b}$`,
    ]);
  if (k === 10) {
    const [c, d] = [r9(), r9()];
    const m = b * q;
    return fb(`Der Minuend ist das Produkt aus $${b}$ und $${q}$, der Subtrahend ist die Summe aus $${c}$ und $${d}$. Berechne die Differenz.`, m - c - d, [
      `Term: $${b} \\cdot ${q} - (${c} + ${d})$`,
      `$= ${m} - ${c + d} = ${m - c - d}$`,
    ]);
  }
  const s = b * q;
  const x = ri(1, s - 1);
  return fb(`Der Dividend ist die Summe aus $${x}$ und $${s - x}$, der Divisor ist $${b}$. Berechne den Quotienten.`, q, [`Term: $(${x} + ${s - x}) : ${b}$`, `$= ${s} : ${b} = ${q}$`]);
};

function fb(text: string, val: number, steps: string[]) {
  return {
    title: 'Mit Fachbegriffen rechnen',
    text,
    parts: [nm('Ergebnis', val, INT)],
    solution: ['Summand $+$ Summand $=$ Summe · Minuend $-$ Subtrahend $=$ Differenz · Faktor $\\cdot$ Faktor $=$ Produkt · Dividend $:$ Divisor $=$ Quotient', ...steps],
  };
}

const rechenanweisung: Gen = () => {
  const [a, b, c] = [r9(), r9(), r9()];
  const big = ri(20, 80);
  const items: [string, string, number, string[]][] = (() => {
    const x = ri(5, 60);
    let y = ri(5, 60);
    while (y === x) y = ri(5, 60);
    const q = r9();
    const s = c * r9();
    const u = ri(1, s - 1);
    return [
      [`Subtrahiere $${y}$ von $${x}$.`, `${x} - ${y}`, x - y, [`„$${y}$ von $${x}$ subtrahieren“: Von $${x}$ wird $${y}$ abgezogen.`, `$${x} - ${y} = ${x - y}$`]],
      [`Vermindere das Produkt aus $${a}$ und $${b}$ um $${c}$.`, `${a} \\cdot ${b} - ${c}`, a * b - c, [`„vermindern um“ heißt subtrahieren.`, `$${a * b} - ${c} = ${a * b - c}$`]],
      [`Subtrahiere von $${big}$ die Summe aus $${b}$ und $${c}$.`, `${big} - (${b} + ${c})`, big - b - c, [`$${b} + ${c} = ${b + c}$`, `$${big} - ${b + c} = ${big - b - c}$`]],
      [`Dividiere $${2 * b * q}$ durch das Doppelte von $${b}$.`, `${2 * b * q} : (2 \\cdot ${b})`, q, [`$2 \\cdot ${b} = ${2 * b}$`, `$${2 * b * q} : ${2 * b} = ${q}$`]],
      [`Vergrößere den Quotienten aus $${b * q}$ und $${b}$ um $${c}$.`, `${b * q} : ${b} + ${c}`, q + c, [`„vergrößern um“ heißt addieren.`, `$${b * q} : ${b} = ${q}$`, `$${q} + ${c} = ${q + c}$`]],
      [`Multipliziere $${a}$ mit der Differenz von $${big}$ und $${b}$.`, `${a} \\cdot (${big} - ${b})`, a * (big - b), [`$${big} - ${b} = ${big - b}$`, `$${a} \\cdot ${big - b} = ${a * (big - b)}$`]],
      [`Addiere zur Differenz von $${b}$ und $${big}$ die Zahl $${c}$.`, `(${b} - ${big}) + ${c}`, b - big + c, [`$${b} - ${big} = ${b - big}$`, `$${b - big} + ${c} = ${b - big + c}$`]],
      [`Ziehe vom Dreifachen von $${big}$ die Zahl $${a * 7}$ ab.`, `3 \\cdot ${big} - ${a * 7}`, 3 * big - 7 * a, [`$3 \\cdot ${big} = ${3 * big}$`, `$${3 * big} - ${7 * a} = ${3 * big - 7 * a}$`]],
      [`Teile die Summe aus $${u}$ und $${s - u}$ durch $${c}$.`, `(${u} + ${s - u}) : ${c}`, s / c, [`$${u} + ${s - u} = ${s}$`, `$${s} : ${c} = ${s / c}$`]],
      [`Verringere $${big}$ um das Quadrat von $${b}$.`, `${big} - ${b}^{2}`, big - b * b, [`$${b}^{2} = ${b * b}$`, `$${big} - ${b * b} = ${big - b * b}$`]],
      [`Vermehre das Produkt aus $${b * q}$ und $${b}$ um ihren Quotienten.`, `${b * q} \\cdot ${b} + ${b * q} : ${b}`, b * q * b + q, [`$${b * q} \\cdot ${b} = ${b * q * b}$ und $${b * q} : ${b} = ${q}$`, `$${b * q * b} + ${q} = ${b * q * b + q}$`]],
      [`Multipliziere die Summe aus $${a + 5}$ und $${b}$ mit ihrer Differenz.`, `(${a + 5} + ${b}) \\cdot (${a + 5} - ${b})`, (a + 5 + b) * (a + 5 - b), [`$${a + 5} + ${b} = ${a + 5 + b}$ und $${a + 5} - ${b} = ${a + 5 - b}$`, `$${a + 5 + b} \\cdot ${a + 5 - b} = ${(a + 5 + b) * (a + 5 - b)}$`]],
    ];
  })();
  const [text, tex, val, steps] = pick(items);
  return {
    title: 'Rechenanweisungen ausführen',
    text: `${text}\nSchreibe zuerst einen Term auf und berechne dann.`,
    parts: [nm('Ergebnis', val, INT)],
    solution: [`Term: $${tex}$`, ...steps],
  };
};

// ---------------------------------------------------------------------------
// 3. Rechengesetze
// ---------------------------------------------------------------------------

const GESETZE = ['Kommutativgesetz', 'Assoziativgesetz', 'Distributivgesetz'];
const GESETZ_WHY: Record<string, string> = {
  Kommutativgesetz: '**Kommutativgesetz** (Vertauschungsgesetz): Die Reihenfolge der Summanden bzw. Faktoren wird vertauscht.',
  Assoziativgesetz: '**Assoziativgesetz** (Verbindungsgesetz): Die Zahlen bleiben in derselben Reihenfolge, nur die Klammern werden versetzt.',
  Distributivgesetz: '**Distributivgesetz** (Verteilungsgesetz): Ein Faktor wird auf jeden Summanden in der Klammer verteilt (ausmultiplizieren) bzw. vor die Klammer gezogen (ausklammern).',
};

const gesetzErkennen: Gen = () => {
  const [a, b, c] = [r9(), r9(), r9()];
  const items: [string, string][] = [
    [`${a} + ${b + 10} = ${b + 10} + ${a}`, 'Kommutativgesetz'],
    [`${a} \\cdot ${b + 10} = ${b + 10} \\cdot ${a}`, 'Kommutativgesetz'],
    [`x + ${a} = ${a} + x`, 'Kommutativgesetz'],
    [`${a} \\cdot y = y \\cdot ${a}`, 'Kommutativgesetz'],
    [`${a} + ${b} + ${c + 10} = ${a} + ${c + 10} + ${b}`, 'Kommutativgesetz'],
    [`${a} \\cdot ${b} \\cdot ${c + 10} = ${b} \\cdot ${a} \\cdot ${c + 10}`, 'Kommutativgesetz'],
    ['a \\cdot b = b \\cdot a', 'Kommutativgesetz'],
    [`(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`, 'Assoziativgesetz'],
    [`(${a} \\cdot ${b}) \\cdot ${c} = ${a} \\cdot (${b} \\cdot ${c})`, 'Assoziativgesetz'],
    [`(x + ${a}) + ${b} = x + (${a} + ${b})`, 'Assoziativgesetz'],
    [`(${a} \\cdot y) \\cdot ${b} = ${a} \\cdot (y \\cdot ${b})`, 'Assoziativgesetz'],
    [`${a} + (${b} + x) = (${a} + ${b}) + x`, 'Assoziativgesetz'],
    ['(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)', 'Assoziativgesetz'],
    [`${a} \\cdot (${b} + ${c}) = ${a} \\cdot ${b} + ${a} \\cdot ${c}`, 'Distributivgesetz'],
    [`${a} \\cdot ${b + 10} - ${a} \\cdot ${c} = ${a} \\cdot (${b + 10} - ${c})`, 'Distributivgesetz'],
    [`(${a} + ${b}) \\cdot ${c} = ${a} \\cdot ${c} + ${b} \\cdot ${c}`, 'Distributivgesetz'],
    [`(${a * c} + ${b * c}) : ${c} = ${a * c} : ${c} + ${b * c} : ${c}`, 'Distributivgesetz'],
    [`${a}x + ${a}y = ${a}(x + y)`, 'Distributivgesetz'],
    [`${a}(x - ${b}) = ${a}x - ${a * b}`, 'Distributivgesetz'],
    [`${a} \\cdot 98 = ${a} \\cdot 100 - ${a} \\cdot 2`, 'Distributivgesetz'],
    ['a \\cdot (b + c) = a \\cdot b + a \\cdot c', 'Distributivgesetz'],
  ];
  const [eq, law] = pick(items);
  return {
    title: 'Rechengesetze erkennen',
    text: `Welches Rechengesetz wird angewendet?\n$${eq}$`,
    parts: [chFixed('Gesetz:', GESETZE, GESETZE.indexOf(law))],
    solution: [GESETZ_WHY[law], `Hier: **${law}**.`],
  };
};

const geschicktRechnen: Gen = () => {
  const a = ri(12, 89);
  const s = r9();
  const items: [string, number, string[]][] = (() => {
    const b = ri(13, 87);
    const x = ri(11, 89);
    const y = ri(11, 89);
    return [
      [`25 \\cdot ${s} \\cdot 4`, 100 * s, [`**Kommutativgesetz**: $25 \\cdot 4 \\cdot ${s}$`, `**Assoziativgesetz**: $(25 \\cdot 4) \\cdot ${s} = 100 \\cdot ${s} = ${100 * s}$`]],
      [`4 \\cdot ${a} \\cdot 25`, 100 * a, [`**Kommutativgesetz**: $4 \\cdot 25 \\cdot ${a}$`, `**Assoziativgesetz**: $(4 \\cdot 25) \\cdot ${a} = 100 \\cdot ${a} = ${100 * a}$`]],
      [`125 \\cdot ${s} \\cdot 8`, 1000 * s, [`**Kommutativgesetz**: $125 \\cdot 8 \\cdot ${s}$`, `**Assoziativgesetz**: $(125 \\cdot 8) \\cdot ${s} = 1000 \\cdot ${s} = ${1000 * s}$`]],
      [`2 \\cdot ${a} \\cdot 50`, 100 * a, [`**Kommutativgesetz**: $2 \\cdot 50 \\cdot ${a}$`, `$= 100 \\cdot ${a} = ${100 * a}$`]],
      [`5 \\cdot ${a} \\cdot 20`, 100 * a, [`**Kommutativgesetz**: $5 \\cdot 20 \\cdot ${a}$`, `$= 100 \\cdot ${a} = ${100 * a}$`]],
      [`${x} + ${y} + ${100 - x}`, 100 + y, [`**Kommutativgesetz**: $${x} + ${100 - x} + ${y}$`, `**Assoziativgesetz**: $(${x} + ${100 - x}) + ${y} = 100 + ${y} = ${100 + y}$`]],
      [`${a} \\cdot 99`, 99 * a, [`**Distributivgesetz**: $${a} \\cdot (100 - 1) = ${a} \\cdot 100 - ${a} \\cdot 1$`, `$= ${100 * a} - ${a} = ${99 * a}$`]],
      [`${a} \\cdot 101`, 101 * a, [`**Distributivgesetz**: $${a} \\cdot (100 + 1) = ${a} \\cdot 100 + ${a} \\cdot 1$`, `$= ${100 * a} + ${a} = ${101 * a}$`]],
      [`${a} \\cdot 98`, 98 * a, [`**Distributivgesetz**: $${a} \\cdot (100 - 2) = ${a} \\cdot 100 - ${a} \\cdot 2$`, `$= ${100 * a} - ${2 * a} = ${98 * a}$`]],
      [`${a} \\cdot 102`, 102 * a, [`**Distributivgesetz**: $${a} \\cdot (100 + 2) = ${a} \\cdot 100 + ${a} \\cdot 2$`, `$= ${100 * a} + ${2 * a} = ${102 * a}$`]],
      [`${s} \\cdot ${b} + ${s} \\cdot ${100 - b}`, 100 * s, [`**Distributivgesetz** (ausklammern): $${s} \\cdot (${b} + ${100 - b})$`, `$= ${s} \\cdot 100 = ${100 * s}$`]],
      [`${s} \\cdot ${b} - ${s} \\cdot ${b - 10}`, 10 * s, [`**Distributivgesetz** (ausklammern): $${s} \\cdot (${b} - ${b - 10})$`, `$= ${s} \\cdot 10 = ${10 * s}$`]],
      [`4 \\cdot (25 + ${a})`, 100 + 4 * a, [`**Distributivgesetz** (ausmultiplizieren): $4 \\cdot 25 + 4 \\cdot ${a}$`, `$= 100 + ${4 * a} = ${100 + 4 * a}$`]],
    ];
  })();
  const [term, val, steps] = pick(items);
  return {
    title: 'Geschickt rechnen',
    text: `Rechne geschickt im Kopf, indem du ein Rechengesetz nutzt:\n$${term}$`,
    parts: [nm('Ergebnis', val, INT)],
    solution: steps,
  };
};

const gesetzWahrFalsch: Gen = () => {
  const [a, b, c] = [r9(), r9(), r9()];
  const x = ri(10, 30);
  const y = ri(2, 9);
  const q = r9();
  const cc = pick([2, 3]);
  const bb = cc * ri(2, 3);
  const aa = bb * cc * ri(1, 3);
  const items: [string, boolean, string][] = [
    ['Für die Addition gilt das Kommutativgesetz: $a + b = b + a$.', true, 'Summanden dürfen vertauscht werden.'],
    ['Für die Subtraktion gilt das Kommutativgesetz: $a - b = b - a$.', false, `Gegenbeispiel: $${x} - ${y} = ${x - y}$, aber $${y} - ${x} = ${y - x}$.`],
    ['Für die Division gilt das Kommutativgesetz: $a : b = b : a$.', false, `Gegenbeispiel: $${q * y} : ${y} = ${q}$, aber $${y} : ${q * y} = ${F(y, q * y).tex()}$.`],
    ['Für die Multiplikation gilt das Assoziativgesetz: $(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)$.', true, 'Bei reinen Produkten dürfen Klammern beliebig gesetzt werden.'],
    ['Für die Subtraktion gilt das Assoziativgesetz: $(a - b) - c = a - (b - c)$.', false, `Gegenbeispiel: $(${x} - ${y}) - ${c} = ${x - y - c}$, aber $${x} - (${y} - ${c}) = ${x - (y - c)}$.`],
    ['Für die Division gilt das Assoziativgesetz: $(a : b) : c = a : (b : c)$.', false, `Gegenbeispiel: $(${aa} : ${bb}) : ${cc} = ${aa / bb / cc}$, aber $${aa} : (${bb} : ${cc}) = ${aa / (bb / cc)}$.`],
    ['$(a + b) : c = a : c + b : c$', true, 'Distributivgesetz für die Division: Jeder Summand wird durch $c$ geteilt.'],
    ['$a : (b + c) = a : b + a : c$', false, 'Gegenbeispiel: $12 : (2 + 4) = 2$, aber $12 : 2 + 12 : 4 = 9$. Steht die Summe hinter dem Divisionszeichen, darf man nicht verteilen.'],
    ['$a - (b + c) = a - b - c$', true, 'Ein Minus vor der Klammer dreht beim Auflösen alle Vorzeichen in der Klammer um.'],
    ['$a - (b + c) = a - b + c$', false, `Das Minus gilt für die ganze Klammer: $a - (b + c) = a - b - c$. Beispiel: $${x} - (${y} + ${c}) = ${x - y - c} \\neq ${x - y + c}$.`],
    ['$a - (b - c) = a - b + c$', true, 'Minus vor der Klammer: Aus $-c$ in der Klammer wird $+c$.'],
    ['$(a + b)^{2} = a^{2} + b^{2}$', false, `Gegenbeispiel: $(${a} + ${b})^{2} = ${(a + b) ** 2}$, aber $${a}^{2} + ${b}^{2} = ${a * a + b * b}$. Richtig ist $(a + b)^{2} = a^{2} + 2ab + b^{2}$.`],
    ['$a \\cdot (b \\cdot c) = (a \\cdot b) \\cdot (a \\cdot c)$', false, 'Bei einem Produkt in der Klammer wird **nicht** verteilt: $a \\cdot (b \\cdot c) = a \\cdot b \\cdot c$.'],
    [`$${x} - ${y} = ${y} - ${x}$`, false, `Links steht $${x - y}$, rechts $${y - x}$. Bei der Subtraktion darf man nicht vertauschen.`],
    [`$${a} \\cdot ${b} \\cdot ${c} = ${c} \\cdot ${a} \\cdot ${b}$`, true, `Kommutativgesetz: Beide Seiten ergeben $${a * b * c}$.`],
    [`$${a} \\cdot (${b} + ${c}) = ${a} \\cdot ${b} + ${c}$`, false, `Der Faktor muss mit **jedem** Summanden multipliziert werden: $${a} \\cdot ${b} + ${a} \\cdot ${c} = ${a * (b + c)}$, rechts steht aber $${a * b + c}$.`],
    [`$${a} \\cdot (${b} + ${c}) = ${a * b} + ${a * c}$`, true, `Distributivgesetz: $${a} \\cdot ${b} + ${a} \\cdot ${c} = ${a * b} + ${a * c}$.`],
    [`$(${a * c} - ${b * c}) : ${c} = ${a} - ${b}$`, true, `Distributivgesetz für die Division: $${a * c} : ${c} - ${b * c} : ${c} = ${a} - ${b}$.`],
    ['$-(a + b) = -a - b$', true, 'Ein Minus vor der Klammer dreht alle Vorzeichen in der Klammer um.'],
    ['$-(a - b) = -a - b$', false, 'Richtig ist $-(a - b) = -a + b$: Auch das Vorzeichen von $b$ dreht sich um.'],
    ['Beim Ausmultiplizieren $a(b + c)$ wird nur der erste Summand mit $a$ multipliziert.', false, 'Beim Distributivgesetz wird **jeder** Summand mit $a$ multipliziert: $a(b + c) = ab + ac$.'],
    ['Für die Multiplikation gilt das Kommutativgesetz: $a \\cdot b = b \\cdot a$.', true, 'Faktoren dürfen vertauscht werden.'],
  ];
  const [stmt, val, why] = pick(items);
  return {
    title: 'Rechengesetze: wahr oder falsch?',
    text: `Ist die Aussage wahr oder falsch?\n${stmt}`,
    parts: [WF('Die Aussage ist …', val)],
    solution: [why, `Die Aussage ist **${val ? 'wahr' : 'falsch'}**.`],
  };
};

// ---------------------------------------------------------------------------
// 4. Rechnen mit ganzen Zahlen
// ---------------------------------------------------------------------------

const ganzAddSub: Gen = () => {
  const n = pick([2, 2, 3, 3, 4]);
  const nums = Array.from({ length: n }, () => nz(-20, 20));
  const ops = Array.from({ length: n - 1 }, () => pick(['+', '-'] as const));
  if (nums.slice(1).every((v) => v > 0)) nums[1] = -nums[1];
  let tex = `${nums[0]}`;
  let simple = `${nums[0]}`;
  let val = nums[0];
  const lines: string[] = [];
  for (let i = 1; i < n; i++) {
    const eff = (ops[i - 1] === '+' ? 1 : -1) * Math.sign(nums[i]);
    const abs = Math.abs(nums[i]);
    tex += ` ${ops[i - 1]} ${p(nums[i])}`;
    simple += ` ${eff < 0 ? '-' : '+'} ${abs}`;
    const next = val + eff * abs;
    lines.push(`$${val} ${eff < 0 ? '-' : '+'} ${abs} = ${next}$`);
    val = next;
  }
  return {
    title: 'Ganze Zahlen addieren und subtrahieren',
    text: `Berechne $${tex}$.`,
    parts: [nm('Ergebnis', val, INT)],
    solution: [
      'Rechenzeichen und Vorzeichen zusammenfassen: $+(+) = +$, $-(-) = +$, $+(-) = -$, $-(+) = -$',
      `$${tex} = ${simple}$`,
      'Von links nach rechts rechnen (am Zahlenstrahl: $+$ nach rechts, $-$ nach links):',
      ...lines,
    ],
  };
};

const ganzMulDiv: Gen = () => {
  const sgn = () => (Math.random() < 0.5 ? -1 : 1);
  let v = sgn() * ri(2, 12);
  const nums = [v];
  const ops: string[] = [];
  const k = ri(1, 3);
  for (let i = 0; i < k; i++) {
    const divs: number[] = [];
    for (let d = 2; d <= 12; d++) if (v % d === 0) divs.push(d);
    if (divs.length && (Math.random() < 0.45 || Math.abs(v) > 150)) {
      const d = sgn() * pick(divs);
      ops.push(':');
      nums.push(d);
      v = v / d;
    } else {
      const f = sgn() * ri(2, Math.abs(v) > 40 ? 3 : 6);
      ops.push('\\cdot');
      nums.push(f);
      v = v * f;
    }
  }
  if (nums.every((x) => x > 0)) {
    nums[nums.length - 1] *= -1;
    v = -v;
  }
  const tex = nums.map((x, i) => (i === 0 ? `${x}` : ` ${ops[i - 1]} ${p(x)}`)).join('');
  const absTex = nums.map((x, i) => (i === 0 ? `${Math.abs(x)}` : ` ${ops[i - 1]} ${Math.abs(x)}`)).join('');
  const neg = nums.filter((x) => x < 0).length;
  return {
    title: 'Ganze Zahlen multiplizieren und dividieren',
    text: `Berechne $${tex}$.`,
    parts: [nm('Ergebnis', v, INT)],
    solution: [
      'Vorzeichenregel: Bei einer **geraden** Anzahl negativer Zahlen ist das Ergebnis positiv, bei einer **ungeraden** Anzahl negativ.',
      `Hier ${neg === 1 ? 'ist $1$ Zahl' : `sind $${neg}$ Zahlen`} negativ → ${neg % 2 === 0 ? 'gerade → Ergebnis **positiv**' : 'ungerade → Ergebnis **negativ**'}.`,
      `Mit den Beträgen von links nach rechts rechnen: $${absTex} = ${Math.abs(v)}$`,
      `Ergebnis: $${v}$`,
    ],
  };
};

const ganzReihenfolge: Gen = () => {
  const k = ri(0, 6);
  let term: string;
  let steps: string[];
  let val: number;
  if (k === 0) {
    const a = nz(-12, 12);
    const b = nz(-6, 6);
    const c = nz(-6, 6);
    val = a - b * c;
    term = `${a} - ${p(b)} \\cdot ${p(c)}`;
    steps = [`Punkt vor Strich: $${p(b)} \\cdot ${p(c)} = ${b * c}$`, `$${a} - ${p(b * c)} = ${val}$`];
  } else if (k === 1) {
    const a = nz(-9, 9);
    const b = nz(-9, 9);
    const c = nz(-5, 5);
    const d = nz(-9, 9);
    val = (a + b) * c - d;
    term = `(${a} + ${p(b)}) \\cdot ${p(c)} - ${p(d)}`;
    steps = [`Klammer: $${a} + ${p(b)} = ${a + b}$`, `Punkt vor Strich: $${p(a + b)} \\cdot ${p(c)} = ${(a + b) * c}$`, `$${(a + b) * c} - ${p(d)} = ${val}$`];
  } else if (k === 2) {
    const b = nz(-6, 6);
    const q = nz(-8, 8);
    const a = b * q;
    const c = nz(-6, 6);
    const d = nz(-6, 6);
    val = q + c * d;
    term = `${p(a)} : ${p(b)} + ${p(c)} \\cdot ${p(d)}`;
    steps = [`Punktrechnungen zuerst: $${p(a)} : ${p(b)} = ${q}$ und $${p(c)} \\cdot ${p(d)} = ${c * d}$`, `$${q} + ${p(c * d)} = ${val}$`];
  } else if (k === 3) {
    const a = nz(-4, 4);
    const e = pick([2, 3]);
    const b = nz(-9, 9);
    val = a ** e - b;
    term = `${p(a)}^{${e}} - ${p(b)}`;
    steps = [`Potenz zuerst: $${p(a)}^{${e}} = ${a ** e}$`, `$${a ** e} - ${p(b)} = ${val}$`];
  } else if (k === 4) {
    const [a, b, c, d] = [nz(-9, 9), nz(-9, 9), nz(-9, 9), nz(-9, 9)];
    val = a * b - c * d;
    term = `${p(a)} \\cdot ${p(b)} - ${p(c)} \\cdot ${p(d)}`;
    steps = [`Punkt vor Strich: $${p(a)} \\cdot ${p(b)} = ${a * b}$ und $${p(c)} \\cdot ${p(d)} = ${c * d}$`, `$${a * b} - ${p(c * d)} = ${val}$`];
  } else if (k === 5) {
    const c = nz(-6, 6);
    const q = nz(-8, 8);
    const b = nz(-9, 9);
    const a = c * q + b;
    const d = nz(-9, 9);
    val = q + d;
    term = `(${a} - ${p(b)}) : ${p(c)} + ${p(d)}`;
    steps = [`Klammer: $${a} - ${p(b)} = ${c * q}$`, `Punkt vor Strich: $${p(c * q)} : ${p(c)} = ${q}$`, `$${q} + ${p(d)} = ${val}$`];
  } else {
    const [a, b, c, d] = [nz(-15, 15), nz(-9, 9), nz(-9, 9), nz(-5, 5)];
    val = a - (b - c) * d;
    term = `${a} - (${b} - ${p(c)}) \\cdot ${p(d)}`;
    steps = [`Klammer: $${b} - ${p(c)} = ${b - c}$`, `Punkt vor Strich: $${p(b - c)} \\cdot ${p(d)} = ${(b - c) * d}$`, `$${a} - ${p((b - c) * d)} = ${val}$`];
  }
  return {
    title: 'Rechenreihenfolge mit ganzen Zahlen',
    text: `Berechne $${term}$.`,
    parts: [nm('Ergebnis', val, INT)],
    solution: ['Reihenfolge: **Klammer → Potenz → Punkt → Strich**', ...steps],
  };
};

const ganzKlammern: Gen = () => {
  const [a, b, c, d, e] = [nz(-12, 12), nz(-9, 9), nz(-9, 9), nz(-9, 9), nz(-9, 9)];
  const k = ri(0, 5);
  let term: string;
  let steps: string[];
  let val: number;
  if (k === 0) {
    const i1 = c - d;
    const i2 = b - i1;
    val = a - i2;
    term = `${a} - \\left[${b} - (${c} - ${p(d)})\\right]`;
    steps = [`innere Klammer: $${c} - ${p(d)} = ${i1}$`, `eckige Klammer: $${b} - ${p(i1)} = ${i2}$`, `$${a} - ${p(i2)} = ${val}$`];
  } else if (k === 1) {
    const i1 = c - d;
    const i2 = b + i1;
    val = a * i2;
    term = `${a} \\cdot \\left[${b} + (${c} - ${p(d)})\\right]`;
    steps = [`innere Klammer: $${c} - ${p(d)} = ${i1}$`, `eckige Klammer: $${b} + ${p(i1)} = ${i2}$`, `$${a} \\cdot ${p(i2)} = ${val}$`];
  } else if (k === 2) {
    const i1 = b + c;
    const i2 = a - i1;
    val = i2 * d - e;
    term = `\\left[${a} - (${b} + ${p(c)})\\right] \\cdot ${p(d)} - ${p(e)}`;
    steps = [`innere Klammer: $${b} + ${p(c)} = ${i1}$`, `eckige Klammer: $${a} - ${p(i1)} = ${i2}$`, `Punkt vor Strich: $${p(i2)} \\cdot ${p(d)} = ${i2 * d}$`, `$${i2 * d} - ${p(e)} = ${val}$`];
  } else if (k === 3) {
    val = -(a - b) + (c - d) * e;
    term = `-(${a} - ${p(b)}) + (${c} - ${p(d)}) \\cdot ${p(e)}`;
    steps = [`Klammern: $${a} - ${p(b)} = ${a - b}$ und $${c} - ${p(d)} = ${c - d}$`, `$-${p(a - b)} + ${p(c - d)} \\cdot ${p(e)}$`, `Punkt vor Strich: $${p(c - d)} \\cdot ${p(e)} = ${(c - d) * e}$`, `$${-(a - b)} + ${p((c - d) * e)} = ${val}$`];
  } else if (k === 4) {
    val = (a - b) * (c + d) - e;
    term = `(${a} - ${p(b)}) \\cdot (${c} + ${p(d)}) - ${p(e)}`;
    steps = [`Klammern: $${a} - ${p(b)} = ${a - b}$ und $${c} + ${p(d)} = ${c + d}$`, `Punkt vor Strich: $${p(a - b)} \\cdot ${p(c + d)} = ${(a - b) * (c + d)}$`, `$${(a - b) * (c + d)} - ${p(e)} = ${val}$`];
  } else {
    const i1 = c - d;
    const i2 = b * i1 + e;
    val = a - i2;
    term = `${a} - \\left[${p(b)} \\cdot (${c} - ${p(d)}) + ${p(e)}\\right]`;
    steps = [`innere Klammer: $${c} - ${p(d)} = ${i1}$`, `in der eckigen Klammer Punkt vor Strich: $${p(b)} \\cdot ${p(i1)} = ${b * i1}$, $${b * i1} + ${p(e)} = ${i2}$`, `$${a} - ${p(i2)} = ${val}$`];
  }
  return {
    title: 'Verschachtelte Klammern',
    text: `Berechne $${term}$.`,
    parts: [nm('Ergebnis', val, INT)],
    solution: ['Klammern von **innen nach außen** auflösen, in jeder Klammer gilt Punkt vor Strich.', ...steps],
  };
};

// ---------------------------------------------------------------------------
// 5. Brüche kürzen, erweitern, vergleichen, umwandeln
// ---------------------------------------------------------------------------

/** gekürzter Bruch n/d mit 0 < n, n kein Vielfaches von d */
function baseFr(maxD = 12, improper = false): Fr {
  for (;;) {
    const d = ri(2, maxD);
    const n = ri(1, improper ? 2 * d : d - 1);
    if (n % d !== 0 && gcd(n, d) === 1) return F(n, d);
  }
}

const kuerzen: Gen = () => {
  const f = baseFr(12, Math.random() < 0.25);
  const k = ri(2, 12);
  const N = f.n * k;
  const D = f.d * k;
  return {
    title: 'Brüche kürzen',
    text: `Kürze den Bruch $\\frac{${N}}{${D}}$ vollständig.`,
    parts: [nm('Zähler', f.n, INT), nm('Nenner', f.d, INT)],
    solution: [
      `Größter gemeinsamer Teiler: $\\text{ggT}(${N};\\,${D}) = ${k}$`,
      `Zähler und Nenner durch $${k}$ teilen: $\\frac{${N}}{${D}} = \\frac{${N} : ${k}}{${D} : ${k}} = ${f.tex()}$`,
      'Du kannst auch schrittweise kürzen (z. B. erst durch $2$, dann durch $3$), bis Zähler und Nenner keinen gemeinsamen Teiler mehr haben.',
    ],
  };
};

const erweitern: Gen = () => {
  const f = baseFr(10);
  const k = ri(2, 12);
  if (Math.random() < 0.6) {
    return {
      title: 'Brüche erweitern',
      text: `Erweitere $${f.tex()}$ auf den Nenner $${f.d * k}$.`,
      parts: [nm(`Zähler (über dem Nenner $${f.d * k}$)`, f.n * k, INT)],
      solution: [`Erweiterungszahl: $${f.d * k} : ${f.d} = ${k}$`, `$${f.tex()} = \\frac{${f.n} \\cdot ${k}}{${f.d} \\cdot ${k}} = \\frac{${f.n * k}}{${f.d * k}}$`],
    };
  }
  return {
    title: 'Brüche erweitern',
    text: `Erweitere $${f.tex()}$ mit $${k}$.`,
    parts: [nm('Zähler', f.n * k, INT), nm('Nenner', f.d * k, INT)],
    solution: ['Erweitern: Zähler **und** Nenner mit derselben Zahl multiplizieren – der Wert bleibt gleich.', `$${f.tex()} = \\frac{${f.n} \\cdot ${k}}{${f.d} \\cdot ${k}} = \\frac{${f.n * k}}{${f.d * k}}$`],
  };
};

const NENNER = [2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24];

function vielfachenZeile(ds: number[], hn: number): string {
  const max = Math.max(...ds);
  const n = hn / max;
  if (n > 8) return `$\\text{kgV}(${ds.join(';\\,')}) = ${hn}$`;
  const mult = Array.from({ length: n }, (_, i) => `${max * (i + 1)}`).join(';\\,');
  return `Vielfache von $${max}$: $${mult}$ – die erste Zahl, die durch ${ds.filter((d) => d !== max).map((d) => `$${d}$`).join(' und ')} teilbar ist, ist $${hn}$.`;
}

const hauptnenner: Gen = () => {
  const cnt = Math.random() < 0.65 ? 2 : 3;
  let ds: number[] = [];
  do ds = shuffle(NENNER).slice(0, cnt);
  while (ds.reduce((h, d) => lcm(h, d), 1) > 120);
  const hn = ds.reduce((h, d) => lcm(h, d), 1);
  const frs = ds.map((d) => {
    let n = ri(1, d - 1);
    while (gcd(n, d) !== 1) n = ri(1, d - 1);
    return F(n, d);
  });
  const tex = frs.map((f) => f.tex()).join(';\\quad ');
  return {
    title: 'Hauptnenner bestimmen',
    text: `Bestimme den Hauptnenner der Brüche $${tex}$ und erweitere die Brüche darauf.`,
    parts: [nm('Hauptnenner', hn, INT), ...frs.map((f) => nm(`Zähler von $${f.tex()}$`, (f.n * hn) / f.d, INT))],
    solution: [
      'Der Hauptnenner ist das **kleinste gemeinsame Vielfache** (kgV) aller Nenner.',
      vielfachenZeile(ds, hn),
      ...frs.map((f) => `$${f.tex()} = \\frac{${f.n} \\cdot ${hn / f.d}}{${f.d} \\cdot ${hn / f.d}} = \\frac{${(f.n * hn) / f.d}}{${hn}}$`),
    ],
  };
};

const vergleichen: Gen = () => {
  const a = baseFr(12, Math.random() < 0.2);
  let b: Fr;
  if (Math.random() < 0.2) {
    const k = ri(2, 5);
    const hn0 = a.d * k;
    const opts = ['$<$', '$=$', '$>$'];
    return {
      title: 'Brüche vergleichen',
      text: `Setze das richtige Zeichen ein: $${a.tex()} \\;\\square\\; \\frac{${a.n * k}}{${hn0}}$`,
      parts: [chFixed('Zeichen:', opts, 1)],
      solution: [`$\\frac{${a.n * k}}{${hn0}}$ lässt sich mit $${k}$ zu $${a.tex()}$ kürzen.`, `Also: $${a.tex()} = \\frac{${a.n * k}}{${hn0}}$`],
    };
  }
  do b = baseFr(12, Math.random() < 0.2);
  while (b.v === a.v || b.d === a.d);
  const hn = lcm(a.d, b.d);
  const an = (a.n * hn) / a.d;
  const bn = (b.n * hn) / b.d;
  const rel = a.v < b.v ? 0 : 2;
  const opts = ['$<$', '$=$', '$>$'];
  const sym = rel === 0 ? '<' : '>';
  return {
    title: 'Brüche vergleichen',
    text: `Setze das richtige Zeichen ein: $${a.tex()} \\;\\square\\; ${b.tex()}$`,
    parts: [chFixed('Zeichen:', opts, rel)],
    solution: [
      `Auf den Hauptnenner $${hn}$ bringen: $${a.tex()} = \\frac{${an}}{${hn}}$ und $${b.tex()} = \\frac{${bn}}{${hn}}$`,
      `Bei gleichem Nenner entscheidet der Zähler: $${an} ${sym} ${bn}$`,
      `Also: $${a.tex()} ${sym} ${b.tex()}$`,
    ],
  };
};

const ENDL_NENNER = [2, 4, 5, 8, 10, 20, 25, 40, 50];

const umwandeln: Gen = () => {
  const k = ri(0, 3);
  if (k === 0) {
    const g = ri(1, 6);
    const f = baseFr(9);
    const z = g * f.d + f.n;
    return {
      title: 'Gemischte Zahl → Bruch',
      text: `Schreibe die gemischte Zahl $${g}\\tfrac{${f.n}}{${f.d}}$ als (unechten) Bruch.`,
      parts: [nm(`Zähler (über dem Nenner $${f.d}$)`, z, INT)],
      solution: [`$${g}\\tfrac{${f.n}}{${f.d}} = ${g} + ${f.tex()} = \\frac{${g} \\cdot ${f.d} + ${f.n}}{${f.d}} = \\frac{${z}}{${f.d}}$`],
    };
  }
  if (k === 1) {
    const g = ri(1, 6);
    const f = baseFr(9);
    const z = g * f.d + f.n;
    return {
      title: 'Bruch → gemischte Zahl',
      text: `Schreibe $\\frac{${z}}{${f.d}}$ als gemischte Zahl.`,
      parts: [nm('Ganze', g, INT), nm(`Zähler des Restbruchs (Nenner $${f.d}$)`, f.n, INT)],
      solution: [`$${z} : ${f.d} = ${g}$ Rest $${f.n}$, denn $${g} \\cdot ${f.d} = ${g * f.d}$`, `$\\frac{${z}}{${f.d}} = ${g}\\tfrac{${f.n}}{${f.d}}$`],
    };
  }
  const d = pick(ENDL_NENNER);
  let n = ri(1, d - 1);
  while (gcd(n, d) !== 1) n = ri(1, d - 1);
  const f = F(n, d);
  let pow = 10;
  while (pow % d !== 0) pow *= 10;
  const m = pow / d;
  if (k === 2) {
    return {
      title: 'Dezimalzahl → Bruch',
      text: `Schreibe $${t(f.v)}$ als vollständig gekürzten Bruch.`,
      parts: [nm('Zähler', n, INT), nm('Nenner', d, INT)],
      solution: [
        `Nachkommastellen als Zehnerbruch: $${t(f.v)} = \\frac{${n * m}}{${pow}}$`,
        m > 1 ? `Kürzen mit $${m}$: $\\frac{${n * m}}{${pow}} = ${f.tex()}$` : 'Der Bruch lässt sich nicht kürzen.',
      ],
    };
  }
  return {
    title: 'Bruch → Dezimalzahl',
    text: `Schreibe $${f.tex()}$ als Dezimalzahl.`,
    parts: [nm('Dezimalzahl', f.v, EXACT)],
    solution: [
      m > 1 ? `Auf einen Zehnernenner erweitern (mit $${m}$): $${f.tex()} = \\frac{${n * m}}{${pow}}$` : `Der Nenner ist bereits $${pow}$.`,
      `$\\frac{${n * m}}{${pow}} = ${t(f.v)}$`,
      `Alternativ: $${n} : ${d} = ${t(f.v)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 6. Brüche addieren und subtrahieren
// ---------------------------------------------------------------------------

const rawFrac = (n: number, d: number) => (n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`);
const pRawFrac = (n: number, d: number) => (n < 0 ? `\\left(${rawFrac(n, d)}\\right)` : rawFrac(n, d));

interface STerm {
  s: 1 | -1;
  f: Fr;
  /** Anzeige, falls abweichend (z. B. gemischte Zahl) */
  show?: string;
}

const sumTex = (ts: STerm[], show = true) =>
  ts.map((x, i) => {
    const disp = show && x.show ? x.show : i === 0 ? x.f.tex() : x.f.ptex();
    return i === 0 ? (x.s < 0 ? `-${disp}` : disp) : ` ${x.s < 0 ? '-' : '+'} ${disp}`;
  }).join('');

function sumSteps(ts: STerm[]): { res: Fr; steps: string[] } {
  const hn = ts.reduce((h, x) => lcm(h, x.f.d), 1);
  const nums = ts.map((x) => (x.f.n * hn) / x.f.d);
  const total = nums.reduce((s, n, i) => s + ts[i].s * n, 0);
  const res = F(total, hn);
  const steps: string[] = [];
  const allSame = ts.every((x) => x.f.d === hn);
  if (!allSame) {
    const ds = [...new Set(ts.map((x) => x.f.d))];
    steps.push(ds.length > 1 ? `Hauptnenner: $\\text{kgV}(${ds.join(';\\,')}) = ${hn}$` : `Hauptnenner: $${hn}$`);
    const exp = ts
      .map((x, i) => {
        const body = i === 0 ? rawFrac(nums[i], hn) : pRawFrac(nums[i], hn);
        return i === 0 ? (x.s < 0 ? `-${body}` : body) : ` ${x.s < 0 ? '-' : '+'} ${body}`;
      })
      .join('');
    steps.push(`Erweitern: $${sumTex(ts, false)} = ${exp}$`);
  } else {
    steps.push('Gleiche Nenner: Nur die Zähler werden addiert bzw. subtrahiert, der Nenner bleibt.');
  }
  const zExpr = nums.map((n, i) => (i === 0 ? `${ts[0].s < 0 ? '-' : ''}${p(n)}` : ` ${ts[i].s < 0 ? '-' : '+'} ${p(n)}`)).join('');
  steps.push(`Zähler zusammenfassen: $= \\frac{${zExpr}}{${hn}} = ${rawFrac(total, hn)}$`);
  const g = gcd(total, hn);
  if (total === 0) steps.push('Ergebnis: $0$');
  else if (g > 1) steps.push(`Kürzen mit $${g}$: $${rawFrac(total, hn)} = ${res.tex()}$`);
  else steps.push('Der Bruch lässt sich nicht weiter kürzen.');
  return { res, steps };
}

function randFr(maxD = 9, negChance = 0.3): Fr {
  const f = baseFr(maxD, Math.random() < 0.2);
  return Math.random() < negChance ? f.neg() : f;
}

const gleicheNenner: Gen = () => {
  const d = ri(3, 15);
  const cnt = pick([2, 3]);
  const ts: STerm[] = [];
  for (let i = 0; i < cnt; i++) {
    const n = ri(1, 2 * d);
    ts.push({ s: i === 0 || Math.random() < 0.5 ? 1 : -1, f: new Fr(n, d) });
  }
  // Brüche ungekürzt anzeigen, damit die Nenner gleich bleiben
  const tex = ts.map((x, i) => (i === 0 ? `\\frac{${x.f.n * (d / x.f.d)}}{${d}}` : ` ${x.s < 0 ? '-' : '+'} \\frac{${x.f.n * (d / x.f.d)}}{${d}}`)).join('');
  const raw = ts.map((x) => x.f.n * (d / x.f.d));
  const total = raw.reduce((s, n, i) => s + ts[i].s * n, 0);
  const res = F(total, d);
  const g = gcd(total, d);
  return {
    title: 'Brüche mit gleichem Nenner',
    text: `Berechne $${tex}$ und kürze vollständig. ${FR_HINT}`,
    parts: [nm('Ergebnis', res, EXACT)],
    solution: [
      'Gleiche Nenner: Nur die Zähler werden addiert bzw. subtrahiert, der Nenner bleibt.',
      `$${tex} = \\frac{${raw.map((n, i) => (i === 0 ? `${n}` : ` ${ts[i].s < 0 ? '-' : '+'} ${n}`)).join('')}}{${d}} = ${rawFrac(total, d)}$`,
      total === 0 ? 'Ergebnis: $0$' : g > 1 ? `Kürzen mit $${g}$: $${rawFrac(total, d)} = ${res.tex()}$` : 'Der Bruch lässt sich nicht weiter kürzen.',
    ],
  };
};

const bruchAddSub: Gen = () => {
  const a = randFr(10, 0.2);
  let b = randFr(10, 0.3);
  while (b.d === a.d) b = randFr(10, 0.3);
  const ts: STerm[] = [
    { s: 1, f: a },
    { s: Math.random() < 0.5 ? 1 : -1, f: b },
  ];
  const { res, steps } = sumSteps(ts);
  return {
    title: 'Brüche addieren und subtrahieren',
    text: `Berechne $${sumTex(ts)}$ und kürze vollständig. ${FR_HINT}`,
    parts: [nm('Ergebnis', res, EXACT)],
    solution: steps,
  };
};

const dreiBrueche: Gen = () => {
  const ds = [2, 3, 4, 5, 6, 8, 10, 12];
  const mk = () => {
    const d = pick(ds);
    let n = ri(1, d - 1);
    while (gcd(n, d) !== 1) n = ri(1, d - 1);
    return F(n, d);
  };
  const ts: STerm[] = [
    { s: 1, f: mk() },
    { s: Math.random() < 0.5 ? 1 : -1, f: mk() },
    { s: Math.random() < 0.5 ? 1 : -1, f: mk() },
  ];
  const { res, steps } = sumSteps(ts);
  return {
    title: 'Drei Brüche zusammenfassen',
    text: `Berechne $${sumTex(ts)}$ und kürze vollständig. ${FR_HINT}`,
    parts: [nm('Ergebnis', res, EXACT)],
    solution: steps,
  };
};

const gemischteZahlen: Gen = () => {
  const k = ri(0, 2);
  const f = baseFr(9);
  let ts: STerm[];
  const pre: string[] = [];
  if (k === 0) {
    const n = ri(1, 6);
    ts = [
      { s: 1, f: F(n) },
      { s: -1, f },
    ];
    pre.push(`Die ganze Zahl als Bruch: $${n} = \\frac{${n * f.d}}{${f.d}}$`);
  } else if (k === 1) {
    const n = nz(-5, 5);
    ts = [
      { s: 1, f },
      { s: Math.random() < 0.5 ? 1 : -1, f: F(n) },
    ];
  } else {
    const g = ri(1, 4);
    const h = baseFr(6);
    const mixed = F(g * h.d + h.n, h.d);
    let other = baseFr(8);
    while (other.d === h.d) other = baseFr(8);
    ts = [
      { s: 1, f: mixed, show: `${g}\\tfrac{${h.n}}{${h.d}}` },
      { s: Math.random() < 0.5 ? 1 : -1, f: other },
    ];
    pre.push(`Gemischte Zahl umwandeln: $${g}\\tfrac{${h.n}}{${h.d}} = \\frac{${mixed.n}}{${mixed.d}}$`);
  }
  const { res, steps } = sumSteps(ts);
  return {
    title: 'Brüche und ganze Zahlen',
    text: `Berechne $${sumTex(ts)}$ und kürze vollständig. ${FR_HINT}`,
    parts: [nm('Ergebnis', res, EXACT)],
    solution: [...pre, ...steps],
  };
};

// ---------------------------------------------------------------------------
// 7. Brüche multiplizieren und dividieren
// ---------------------------------------------------------------------------

function mulSteps(a: Fr, b: Fr): string[] {
  const r = a.mul(b);
  const g1 = gcd(a.n, b.d);
  const g2 = gcd(b.n, a.d);
  const out = [`$${a.tex()} \\cdot ${b.ptex()} = \\frac{${a.n} \\cdot ${p(b.n)}}{${a.d} \\cdot ${b.d}}$`];
  if (g1 > 1 || g2 > 1) {
    const parts: string[] = [];
    if (g1 > 1) parts.push(`$${Math.abs(a.n)}$ und $${b.d}$ durch $${g1}$`);
    if (g2 > 1) parts.push(`$${Math.abs(b.n)}$ und $${a.d}$ durch $${g2}$`);
    out.push(`Vor dem Ausrechnen über Kreuz kürzen: ${parts.join(', ')}`);
  }
  out.push(`$= ${r.tex()}$`);
  return out;
}

const bruchMulDiv: Gen = () => {
  const a = randFr(10);
  const b = randFr(10);
  const mul = Math.random() < 0.5;
  const r = mul ? a.mul(b) : a.div(b);
  const inv = F(b.d, b.n);
  return {
    title: 'Brüche multiplizieren und dividieren',
    text: `Berechne $${a.tex()} ${mul ? '\\cdot' : ':'} ${b.ptex()}$ und kürze vollständig. ${FR_HINT}`,
    parts: [nm('Ergebnis', r, EXACT)],
    solution: mul
      ? ['Zähler mal Zähler, Nenner mal Nenner:', ...mulSteps(a, b)]
      : ['Durch einen Bruch dividieren heißt: mit dem **Kehrbruch** multiplizieren.', `$${a.tex()} : ${b.ptex()} = ${a.tex()} \\cdot ${inv.ptex()}$`, ...mulSteps(a, inv)],
  };
};

const bruchGanze: Gen = () => {
  const f = baseFr(12);
  const n = ri(2, 12);
  const k = ri(0, 3);
  if (k === 0) {
    const r = f.mul(n);
    return {
      title: 'Bruch und ganze Zahl',
      text: `Berechne $${f.tex()} \\cdot ${n}$. ${FR_HINT}`,
      parts: [nm('Ergebnis', r, EXACT)],
      solution: ['Nur der Zähler wird mit der ganzen Zahl multipliziert:', `$${f.tex()} \\cdot ${n} = \\frac{${f.n} \\cdot ${n}}{${f.d}} = \\frac{${f.n * n}}{${f.d}}${r.d !== f.d ? ` = ${r.tex()}` : ''}$`],
    };
  }
  if (k === 1) {
    const r = f.div(n);
    return {
      title: 'Bruch und ganze Zahl',
      text: `Berechne $${f.tex()} : ${n}$. ${FR_HINT}`,
      parts: [nm('Ergebnis', r, EXACT)],
      solution: [`$${n} = \\frac{${n}}{1}$, Kehrbruch $\\frac{1}{${n}}$:`, `$${f.tex()} : ${n} = ${f.tex()} \\cdot \\frac{1}{${n}} = \\frac{${f.n}}{${f.d} \\cdot ${n}} = \\frac{${f.n}}{${f.d * n}}${r.d !== f.d * n ? ` = ${r.tex()}` : ''}$`],
    };
  }
  if (k === 2) {
    const r = F(n).div(f);
    return {
      title: 'Ganze Zahl durch Bruch',
      text: `Berechne $${n} : ${f.tex()}$. ${FR_HINT}`,
      parts: [nm('Ergebnis', r, EXACT)],
      solution: ['Mit dem Kehrbruch multiplizieren:', `$${n} : ${f.tex()} = ${n} \\cdot \\frac{${f.d}}{${f.n}} = \\frac{${n * f.d}}{${f.n}}${r.d !== f.n || r.n !== n * f.d ? ` = ${r.tex()}` : ''}$`],
    };
  }
  const m = f.d * ri(1, 4);
  const r = f.mul(m);
  return {
    title: 'Bruch und ganze Zahl',
    text: `Berechne $${m} \\cdot ${f.tex()}$.`,
    parts: [nm('Ergebnis', r, EXACT)],
    solution: [`$${m} \\cdot ${f.tex()} = \\frac{${m} \\cdot ${f.n}}{${f.d}} = \\frac{${m * f.n}}{${f.d}} = ${r.tex()}$`, `Tipp: Vorher kürzen: $${m} : ${f.d} = ${m / f.d}$, dann $${m / f.d} \\cdot ${f.n} = ${r.tex()}$`],
  };
};

const BRUCHTEIL: { von: (G: number, f: string) => string; ganz: (x: number, f: string) => string; unit: string; G: [number, number] }[] = [
  { von: (G, f) => `Lena hat $${G}$ € gespart und gibt $${f}$ davon für ein Konzertticket aus. Wie viel Euro kostet das Ticket?`, ganz: (x, f) => `Ein Ticket kostet $${x}$ €, das ist $${f}$ von Lenas Ersparnissen. Wie viel Euro hat sie gespart?`, unit: '€', G: [60, 600] },
  { von: (G, f) => `Eine Wanderung ist $${G}$ km lang. Nach der Mittagspause sind $${f}$ der Strecke geschafft. Wie viele Kilometer sind das?`, ganz: (x, f) => `Nach $${x}$ km ist $${f}$ einer Wanderung geschafft. Wie lang ist die ganze Wanderung?`, unit: 'km', G: [12, 60] },
  { von: (G, f) => `An einer Schule sind $${G}$ Schülerinnen und Schüler. $${f}$ davon kommen mit dem Bus. Wie viele sind das?`, ganz: (x, f) => `$${x}$ Schülerinnen und Schüler kommen mit dem Bus, das ist $${f}$ aller Schüler. Wie viele Schüler hat die Schule?`, unit: '', G: [240, 900] },
  { von: (G, f) => `Ein Fass enthält $${G}$ Liter Apfelsaft. $${f}$ davon werden abgefüllt. Wie viele Liter sind das?`, ganz: (x, f) => `$${x}$ Liter sind $${f}$ des Fassinhalts. Wie viele Liter passen in das Fass?`, unit: 'l', G: [40, 400] },
  { von: (G, f) => `Ein Film dauert $${G}$ Minuten. $${f}$ des Films sind vorbei. Wie viele Minuten sind das?`, ganz: (x, f) => `Nach $${x}$ Minuten ist $${f}$ eines Films vorbei. Wie lange dauert der Film?`, unit: 'min', G: [90, 180] },
  { von: (G, f) => `Ein Betrieb hat $${G}$ Beschäftigte. $${f}$ davon arbeiten in Teilzeit. Wie viele sind das?`, ganz: (x, f) => `$${x}$ Beschäftigte arbeiten in Teilzeit, das ist $${f}$ der Belegschaft. Wie viele Beschäftigte hat der Betrieb?`, unit: '', G: [60, 480] },
];

const bruchteil: Gen = () => {
  const c = pick(BRUCHTEIL);
  const f = baseFr(8);
  const k = ri(0, 2);
  // Ganzes so wählen, dass der Anteil ganzzahlig ist
  const lo = Math.ceil(c.G[0] / f.d);
  const hi = Math.max(lo, Math.floor(c.G[1] / f.d));
  const G = f.d * ri(lo, hi);
  const x = (G * f.n) / f.d;
  if (k === 0) {
    return {
      title: 'Bruchteil berechnen',
      text: c.von(G, f.tex()),
      parts: [nm(`Anteil${c.unit ? ` (in ${c.unit})` : ''}`, x, INT)],
      solution: [`„$${f.tex()}$ von $${G}$“ heißt $${f.tex()} \\cdot ${G}$`, `$\\frac{1}{${f.d}}$ von $${G}$: $${G} : ${f.d} = ${G / f.d}$`, `$${G / f.d} \\cdot ${f.n} = ${x}$`],
    };
  }
  if (k === 1) {
    return {
      title: 'Das Ganze berechnen',
      text: c.ganz(x, f.tex()),
      parts: [nm(`Ganzes${c.unit ? ` (in ${c.unit})` : ''}`, G, INT)],
      solution: [`$${f.tex()} \\cdot G = ${x} \\quad | : ${f.tex()}$`, `$G = ${x} : ${f.tex()} = ${x} \\cdot \\frac{${f.d}}{${f.n}}$`, `$G = ${x / f.n} \\cdot ${f.d} = ${G}$`],
    };
  }
  return {
    title: 'Anteil als Bruch angeben',
    text: `Von $${G}$ Losen sind $${x}$ Gewinne. Welcher Anteil der Lose gewinnt? Gib den Anteil als vollständig gekürzten Bruch an.`,
    parts: [nm('Zähler', f.n, INT), nm('Nenner', f.d, INT)],
    solution: [`Anteil $= \\frac{\\text{Teil}}{\\text{Ganzes}} = \\frac{${x}}{${G}}$`, `Kürzen mit $${G / f.d}$: $\\frac{${x}}{${G}} = ${f.tex()}$`],
  };
};

const doppelbruch: Gen = () => {
  const a = baseFr(9);
  const b = baseFr(9);
  const k = ri(0, 2);
  if (k === 0) {
    const r = a.div(b);
    return {
      title: 'Doppelbrüche',
      text: `Vereinfache den Doppelbruch $\\dfrac{${a.tex()}}{${b.tex()}}$. ${FR_HINT}`,
      parts: [nm('Ergebnis', r, EXACT)],
      solution: ['Der Hauptbruchstrich bedeutet „geteilt durch“:', `$\\dfrac{${a.tex()}}{${b.tex()}} = ${a.tex()} : ${b.tex()} = ${a.tex()} \\cdot \\frac{${b.d}}{${b.n}}$`, ...mulSteps(a, F(b.d, b.n))],
    };
  }
  const n = ri(2, 9);
  if (k === 1) {
    const r = a.div(n);
    return {
      title: 'Doppelbrüche',
      text: `Vereinfache $\\dfrac{${a.tex()}}{${n}}$. ${FR_HINT}`,
      parts: [nm('Ergebnis', r, EXACT)],
      solution: [`$\\dfrac{${a.tex()}}{${n}} = ${a.tex()} : ${n} = ${a.tex()} \\cdot \\frac{1}{${n}} = \\frac{${a.n}}{${a.d * n}}${r.d !== a.d * n ? ` = ${r.tex()}` : ''}$`],
    };
  }
  const r = F(n).div(a);
  return {
    title: 'Doppelbrüche',
    text: `Vereinfache $\\dfrac{${n}}{${a.tex()}}$. ${FR_HINT}`,
    parts: [nm('Ergebnis', r, EXACT)],
    solution: [`$\\dfrac{${n}}{${a.tex()}} = ${n} : ${a.tex()} = ${n} \\cdot \\frac{${a.d}}{${a.n}} = \\frac{${n * a.d}}{${a.n}}${r.d !== a.n || r.n !== n * a.d ? ` = ${r.tex()}` : ''}$`],
  };
};

// ---------------------------------------------------------------------------
// 8. Gemischte Bruchterme
// ---------------------------------------------------------------------------

const ln = (x: Fr, op: string, y: Fr, r: Fr) => `$${x.tex()} ${op} ${y.ptex()} = ${r.tex()}$`;

const bruchtermGemischt: Gen = () => {
  const a = randFr(6, 0.25);
  const b = randFr(6, 0.25);
  const c = randFr(6, 0.25);
  const d = randFr(6, 0.25);
  const k = ri(0, 5);
  let tex: string;
  let r: Fr;
  let steps: string[];
  if (k === 0) {
    const s = a.add(b);
    if (s.isZero()) return bruchtermGemischt();
    r = s.div(c);
    tex = `\\left(${a.tex()} + ${b.ptex()}\\right) : ${c.ptex()}`;
    steps = [`Klammer zuerst: ${ln(a, '+', b, s)}`, `Mit dem Kehrbruch multiplizieren: $${s.ptex()} : ${c.ptex()} = ${s.ptex()} \\cdot ${F(c.d, c.n).ptex()} = ${r.tex()}$`];
  } else if (k === 1) {
    const m = b.mul(c);
    r = a.add(m);
    tex = `${a.tex()} + ${b.ptex()} \\cdot ${c.ptex()}`;
    steps = [`Punkt vor Strich: ${ln(b, '\\cdot', c, m)}`, `Addieren (Hauptnenner $${lcm(a.d, m.d)}$): ${ln(a, '+', m, r)}`];
  } else if (k === 2) {
    const m = a.mul(b);
    const q = c.div(d);
    r = m.sub(q);
    tex = `${a.tex()} \\cdot ${b.ptex()} - ${c.ptex()} : ${d.ptex()}`;
    steps = [`Punkt vor Strich: ${ln(a, '\\cdot', b, m)}`, `und $${c.ptex()} : ${d.ptex()} = ${c.ptex()} \\cdot ${F(d.d, d.n).ptex()} = ${q.tex()}$`, `Subtrahieren (Hauptnenner $${lcm(m.d, q.d)}$): ${ln(m, '-', q, r)}`];
  } else if (k === 3) {
    const s1 = a.sub(b);
    const s2 = c.add(d);
    r = s1.mul(s2);
    tex = `\\left(${a.tex()} - ${b.ptex()}\\right) \\cdot \\left(${c.tex()} + ${d.ptex()}\\right)`;
    steps = [`Erste Klammer: ${ln(a, '-', b, s1)}`, `Zweite Klammer: ${ln(c, '+', d, s2)}`, `Multiplizieren: ${ln(s1, '\\cdot', s2, r)}`];
  } else if (k === 4) {
    const s = b.sub(c);
    if (s.isZero()) return bruchtermGemischt();
    r = a.div(s);
    tex = `${a.tex()} : \\left(${b.tex()} - ${c.ptex()}\\right)`;
    steps = [`Klammer zuerst: ${ln(b, '-', c, s)}`, `Mit dem Kehrbruch multiplizieren: $${a.tex()} : ${s.ptex()} = ${a.tex()} \\cdot ${F(s.d, s.n).ptex()} = ${r.tex()}$`];
  } else {
    const s = a.add(b);
    const m = s.mul(c);
    r = m.sub(d);
    tex = `\\left(${a.tex()} + ${b.ptex()}\\right) \\cdot ${c.ptex()} - ${d.ptex()}`;
    steps = [`Klammer zuerst: ${ln(a, '+', b, s)}`, `Punkt vor Strich: ${ln(s, '\\cdot', c, m)}`, `Subtrahieren: ${ln(m, '-', d, r)}`];
  }
  return {
    title: 'Bruchterme berechnen',
    text: `Berechne $${tex}$ und kürze vollständig. ${FR_HINT}`,
    parts: [nm('Ergebnis', r, EXACT)],
    solution: ['Auch bei Brüchen gilt: **Klammer → Punkt → Strich**.', ...steps],
  };
};

const bruchDoppelterm: Gen = () => {
  const a = baseFr(6);
  let b = baseFr(6);
  while (b.d === a.d) b = baseFr(6);
  const c = baseFr(6);
  let d = baseFr(6);
  while (d.v === c.v) d = baseFr(6);
  const z = a.add(b);
  const nn = c.sub(d);
  const r = z.div(nn);
  return {
    title: 'Doppelbruch mit Summen',
    text: `Vereinfache $\\dfrac{${a.tex()} + ${b.tex()}}{${c.tex()} - ${d.tex()}}$. ${FR_HINT}`,
    parts: [nm('Ergebnis', r, EXACT)],
    solution: [
      'Zähler und Nenner zuerst getrennt ausrechnen, dann teilen.',
      `Zähler: ${ln(a, '+', b, z)}`,
      `Nenner: ${ln(c, '-', d, nn)}`,
      `$${z.ptex()} : ${nn.ptex()} = ${z.ptex()} \\cdot ${F(nn.d, nn.n).ptex()} = ${r.tex()}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Unterthemen
// ---------------------------------------------------------------------------

export const rechenregelnSections: PracticeSection[] = [
  {
    slug: 'termart',
    title: 'Termart bestimmen',
    description: 'Summe, Differenz, Produkt, Quotient, Potenz – Text ↔ Term',
    intro:
      'Ein **Term** wird nach der Rechenart benannt, die **zuletzt** ausgeführt wird. Dazu musst du die Rechenreihenfolge kennen: **Klammer → Potenz → Punkt → Strich**; gleichrangige Rechenarten werden von links nach rechts ausgeführt.\n\nZuletzt addiert → **Summe**, zuletzt subtrahiert → **Differenz**, zuletzt multipliziert → **Produkt**, zuletzt dividiert (auch Bruchstrich) → **Quotient**, zuletzt potenziert → **Potenz**.\n\nIn Textaufgaben nennt das **erste** Wort die Termart: „das Produkt aus der Summe von 3 und 4 und der Zahl 5“ ist ein Produkt: $(3 + 4) \\cdot 5$.',
    formulas: ['a + b \\;\\text{Summe}', 'a - b \\;\\text{Differenz}', 'a \\cdot b \\;\\text{Produkt}', 'a : b = \\frac{a}{b} \\;\\text{Quotient}', 'a^{n} \\;\\text{Potenz}'],
    example: {
      title: 'Termart bestimmen',
      text: 'Wie heißt der Term $5 + 3 \\cdot (8 - 2)$?',
      steps: ['Klammer: $8 - 2 = 6$', 'Punkt vor Strich: $3 \\cdot 6 = 18$', 'Zuletzt: $5 + 18 = 23$ – die letzte Rechenart ist die Addition, also eine **Summe**.'],
    },
    gens: [termArtZahlen, termArtVariablen, textZuTerm, termZuText],
  },
  {
    slug: 'fachbegriffe',
    title: 'Fachbegriffe',
    description: 'Summand, Minuend, Subtrahend, Faktor, Dividend, Divisor',
    intro:
      'Jede Grundrechenart hat eigene Namen für ihre Zahlen (Operanden). Bei der **Subtraktion** und **Division** kommt es auf die Reihenfolge an: Der **Minuend** bzw. **Dividend** steht vorne, der **Subtrahend** bzw. **Divisor** hinten.\n\nIst ein Operand selbst ein Term (z. B. eine Klammer), zählt er als **ein** Operand. In $(3 + 4) \\cdot 5$ ist $(3 + 4)$ ein Faktor.\n\nAchtung bei Sprechweisen: „Subtrahiere $3$ von $10$“ bedeutet $10 - 3$, „vermindere um“ heißt subtrahieren, „vermehre/vergrößere um“ heißt addieren.',
    formulas: ['\\text{Summand} + \\text{Summand} = \\text{Summe}', '\\text{Minuend} - \\text{Subtrahend} = \\text{Differenz}', '\\text{Faktor} \\cdot \\text{Faktor} = \\text{Produkt}', '\\text{Dividend} : \\text{Divisor} = \\text{Quotient}', '\\text{Basis}^{\\text{Exponent}} = \\text{Potenz}'],
    example: {
      title: 'Fehlenden Operanden bestimmen',
      text: 'Die Differenz ist $17$, der Minuend ist $45$. Bestimme den Subtrahenden.',
      steps: ['$45 - x = 17 \\quad | +x$', '$45 = 17 + x \\quad | -17$', '$x = 28$'],
    },
    gens: [operandName, fachbegriffRechnen, rechenanweisung],
  },
  {
    slug: 'rechengesetze',
    title: 'Rechengesetze',
    description: 'Kommutativ-, Assoziativ- und Distributivgesetz, geschickt rechnen',
    intro:
      '**Kommutativgesetz** (Vertauschungsgesetz): Summanden bzw. Faktoren dürfen vertauscht werden. **Assoziativgesetz** (Verbindungsgesetz): Bei reinen Summen bzw. reinen Produkten dürfen Klammern beliebig gesetzt werden. **Distributivgesetz** (Verteilungsgesetz): Ein Faktor wird auf jeden Summanden der Klammer verteilt (ausmultiplizieren) – rückwärts heißt das ausklammern.\n\nFür **Subtraktion und Division** gelten Kommutativ- und Assoziativgesetz **nicht**!\n\nMit den Gesetzen kannst du geschickt rechnen: $25 \\cdot 7 \\cdot 4 = (25 \\cdot 4) \\cdot 7 = 700$ oder $13 \\cdot 99 = 13 \\cdot 100 - 13 = 1287$.',
    formulas: ['a + b = b + a, \\quad a \\cdot b = b \\cdot a', '(a + b) + c = a + (b + c)', '(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)', 'a \\cdot (b + c) = a \\cdot b + a \\cdot c', '(a + b) : c = a : c + b : c'],
    example: {
      title: 'Geschickt rechnen',
      text: 'Berechne $17 \\cdot 38 + 17 \\cdot 62$.',
      steps: ['Distributivgesetz (ausklammern): $17 \\cdot (38 + 62)$', '$= 17 \\cdot 100 = 1700$'],
    },
    gens: [gesetzErkennen, geschicktRechnen, gesetzWahrFalsch],
  },
  {
    slug: 'ganze-zahlen',
    title: 'Rechnen mit ganzen Zahlen',
    description: 'Vorzeichenregeln, Rechenreihenfolge, Klammern',
    intro:
      '**Addieren und Subtrahieren**: Zuerst Rechen- und Vorzeichen zusammenfassen: $+(-3) = -3$ und $-(-3) = +3$. Dann am Zahlenstrahl denken: $+$ geht nach rechts, $-$ nach links.\n\n**Multiplizieren und Dividieren**: Gleiche Vorzeichen ergeben ein positives, verschiedene ein negatives Ergebnis. Bei mehreren Faktoren zählst du die negativen Zahlen: gerade Anzahl → positiv, ungerade Anzahl → negativ.\n\nNegative Zahlen schreibt man in Rechnungen in Klammern: $5 \\cdot (-3)$. Bei Potenzen gilt: $(-2)^{2} = 4$, aber $-2^{2} = -4$.',
    formulas: ['a - (-b) = a + b', 'a + (-b) = a - b', '(+) \\cdot (-) = (-), \\quad (-) \\cdot (-) = (+)', '(+) : (-) = (-), \\quad (-) : (-) = (+)'],
    example: {
      title: 'Vorzeichen und Reihenfolge',
      text: 'Berechne $-8 - (-3) \\cdot 4$.',
      steps: ['Punkt vor Strich: $(-3) \\cdot 4 = -12$', '$-8 - (-12) = -8 + 12 = 4$'],
    },
    gens: [ganzAddSub, ganzMulDiv, ganzReihenfolge, ganzKlammern],
  },
  {
    slug: 'brueche-grundlagen',
    title: 'Brüche kürzen und erweitern',
    description: 'Kürzen, Erweitern, Hauptnenner, Vergleichen, Umwandeln',
    intro:
      '**Kürzen**: Zähler und Nenner durch dieselbe Zahl teilen. Vollständig gekürzt ist ein Bruch, wenn Zähler und Nenner keinen gemeinsamen Teiler mehr haben – am schnellsten mit dem **ggT**. **Erweitern**: Zähler und Nenner mit derselben Zahl multiplizieren. Der Wert des Bruchs ändert sich dabei nicht.\n\nDer **Hauptnenner** ist das kleinste gemeinsame Vielfache (kgV) der Nenner. Brüche mit gleichem Nenner kann man direkt vergleichen.\n\nEine **gemischte Zahl** wie $2\\tfrac{1}{3}$ bedeutet $2 + \\frac{1}{3} = \\frac{7}{3}$. Dezimalzahlen sind Zehnerbrüche: $0{,}75 = \\frac{75}{100} = \\frac{3}{4}$.',
    formulas: ['\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k} = \\frac{a : k}{b : k}', 'g\\tfrac{a}{b} = \\frac{g \\cdot b + a}{b}'],
    example: {
      title: 'Kürzen mit dem ggT',
      text: 'Kürze $\\frac{36}{84}$ vollständig.',
      steps: ['$\\text{ggT}(36;\\,84) = 12$', '$\\frac{36}{84} = \\frac{36 : 12}{84 : 12} = \\frac{3}{7}$'],
    },
    gens: [kuerzen, erweitern, hauptnenner, vergleichen, umwandeln],
  },
  {
    slug: 'brueche-addieren',
    title: 'Brüche addieren und subtrahieren',
    description: 'Gleiche Nenner, Hauptnenner, mehrere Brüche, gemischte Zahlen',
    intro:
      'Brüche lassen sich nur addieren oder subtrahieren, wenn sie **denselben Nenner** haben. Dann werden nur die Zähler verrechnet, der Nenner bleibt.\n\nSonst: 1. Hauptnenner bestimmen, 2. alle Brüche darauf erweitern, 3. Zähler zusammenfassen, 4. vollständig kürzen.\n\nGanze Zahlen schreibst du als Bruch mit dem Hauptnenner ($2 = \\frac{8}{4}$), gemischte Zahlen wandelst du vorher in Brüche um.',
    formulas: ['\\frac{a}{c} \\pm \\frac{b}{c} = \\frac{a \\pm b}{c}', '\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{a \\cdot d \\pm c \\cdot b}{b \\cdot d}'],
    example: {
      title: 'Brüche addieren',
      text: 'Berechne $\\frac{3}{4} - \\frac{5}{6}$.',
      steps: ['Hauptnenner: $\\text{kgV}(4;\\,6) = 12$', 'Erweitern: $\\frac{9}{12} - \\frac{10}{12}$', '$= \\frac{9 - 10}{12} = -\\frac{1}{12}$'],
    },
    gens: [gleicheNenner, bruchAddSub, dreiBrueche, gemischteZahlen],
  },
  {
    slug: 'brueche-multiplizieren',
    title: 'Brüche multiplizieren und dividieren',
    description: 'Kehrbruch, über Kreuz kürzen, Bruchteile, Doppelbrüche',
    intro:
      '**Multiplizieren**: Zähler mal Zähler und Nenner mal Nenner. Vorher **über Kreuz kürzen** spart Arbeit: In $\\frac{4}{9} \\cdot \\frac{3}{8}$ kürzt du $4$ mit $8$ und $3$ mit $9$.\n\n**Dividieren**: Mit dem **Kehrbruch** (Zähler und Nenner vertauscht) multiplizieren.\n\n**Bruchteil** „$\\frac{3}{4}$ von $60$“ bedeutet $\\frac{3}{4} \\cdot 60 = 45$. Ein **Doppelbruch** ist eine Division: Der Hauptbruchstrich bedeutet „geteilt durch“.',
    formulas: ['\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}', '\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}', '\\dfrac{\\frac{a}{b}}{\\frac{c}{d}} = \\frac{a}{b} : \\frac{c}{d}'],
    example: {
      title: 'Durch einen Bruch dividieren',
      text: 'Berechne $\\frac{5}{6} : \\frac{10}{9}$.',
      steps: ['Mit dem Kehrbruch multiplizieren: $\\frac{5}{6} \\cdot \\frac{9}{10}$', 'Über Kreuz kürzen: $5$ und $10$ durch $5$, $9$ und $6$ durch $3$', '$= \\frac{1 \\cdot 3}{2 \\cdot 2} = \\frac{3}{4}$'],
    },
    gens: [bruchMulDiv, bruchGanze, bruchteil, doppelbruch],
  },
  {
    slug: 'bruchterme-gemischt',
    title: 'Gemischte Bruchterme',
    description: 'Klammer vor Punkt vor Strich mit Brüchen',
    intro:
      'Für Terme mit Brüchen gelten dieselben Regeln wie für ganze Zahlen: **Klammer → Potenz → Punkt → Strich**. Rechne Schritt für Schritt und kürze Zwischenergebnisse, so bleiben die Zahlen klein.\n\nBei einem Doppelbruch mit Summen berechnest du zuerst Zähler und Nenner getrennt und teilst dann.',
    formulas: ['\\frac{a}{b} + \\frac{c}{d} \\cdot \\frac{e}{f} = \\frac{a}{b} + \\frac{c \\cdot e}{d \\cdot f}', '\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}'],
    example: {
      title: 'Punkt vor Strich',
      text: 'Berechne $\\frac{1}{2} + \\frac{2}{3} \\cdot \\frac{3}{4}$.',
      steps: ['Punkt vor Strich: $\\frac{2}{3} \\cdot \\frac{3}{4} = \\frac{2}{4} = \\frac{1}{2}$', '$\\frac{1}{2} + \\frac{1}{2} = 1$'],
    },
    gens: [bruchtermGemischt, bruchDoppelterm],
  },
];

/** Für „Alles gemischt“: je ein Aufgabentyp aus jedem Unterthema */
export const rechenregelnGens: Gen[] = rechenregelnSections.flatMap((s) => s.gens);
