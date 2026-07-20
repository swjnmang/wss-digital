// ============================================================================
// Aufgaben-Generator für "Terme zusammenfassen":
// Kategorien mit aufeinander aufbauenden Stufen, alle Aufgaben werden
// zufällig parametrisiert erzeugt (inkl. Rechenweg).
// ============================================================================

import {
  Monom,
  Poly,
  monom,
  varKey,
  simplifyPoly,
  scalePoly,
  mulPolys,
  evalPoly,
  formatPoly,
  formatNumber,
  formatMonomBody,
  formatSignedMonom,
  formatVars,
} from './termAlgebra';

export interface GeneratedTask {
  id: string;
  format: 'eingabe' | 'auswahl';
  /** Optionaler Aufgabentext (Sonderformate), steht über dem Term */
  frage?: string;
  /** Der angezeigte Term (Monospace); kann leer sein (z. B. Terme aufstellen) */
  ausdruck: string;
  /** Erwartetes Ergebnis für Eingabe-Aufgaben */
  expected: Poly;
  loesungText: string;
  rechenweg: string[];
  /** Beschriftung vor dem Eingabefeld (Standard: "=") */
  eingabeLabel?: string;
  /** Ausklammer-Aufgaben: Eingabe muss Faktor · Klammer enthalten */
  requireBracket?: boolean;
  /** Für Auswahl-Aufgaben (Fehlersuche) */
  choices?: string[];
  correctChoice?: number;
}

export interface Stufe {
  name: string;
  beschreibung: string;
  generate: () => GeneratedTask;
}

export interface Kategorie {
  name: string;
  stufen: Stufe[];
}

// ============================================================================
// Zufalls-Helfer
// ============================================================================

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `gen_${idCounter}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const VARS = ['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

function randVars(n: number): string[] {
  return shuffle(VARS).slice(0, n).sort();
}

function ggT(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Koeffizient + Variable ohne "1"-Koeffizient: cv(1, 'x') = "x", cv(3, 'x') = "3x" */
function cv(c: number, v: string): string {
  return c === 1 ? v : `${c}${v}`;
}

/** Vorzeichenkette für Rechenweg-Zeilen: "10 - 4,5 + 2" */
function koeffKette(coeffs: number[]): string {
  return coeffs
    .map((c, i) =>
      i === 0 ? formatNumber(c) : c < 0 ? ` - ${formatNumber(-c)}` : ` + ${formatNumber(c)}`
    )
    .join('');
}

/** Faktor-Darstellung im Rechenweg, negative in Klammern: "(-3x)" */
function fmtFaktor(m: Monom): string {
  const s = formatSignedMonom(m);
  return m.coeff < 0 ? `(${s})` : s;
}

/**
 * Standard-Rechenweg fürs Zusammenfassen einer Monom-Liste:
 * gruppiert nach Variablenanteil, zeigt die Koeffizienten-Rechnung.
 */
function zusammenfassenWeg(monoms: Monom[]): string[] {
  const groups: { key: string; vars: Record<string, number>; coeffs: number[] }[] = [];
  for (const m of monoms) {
    const key = varKey(m.vars);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, vars: m.vars, coeffs: [] };
      groups.push(g);
    }
    g.coeffs.push(m.coeff);
  }
  const lines: string[] = [];
  for (const g of groups) {
    const label = formatVars(g.vars);
    const name = label === '' ? 'Zahlen' : `${label}-Terme`;
    if (g.coeffs.length === 1) {
      lines.push(
        `${name}: ${formatSignedMonom(monom(g.coeffs[0], g.vars))} hat keinen gleichartigen Partner und bleibt stehen.`
      );
    } else {
      const total = g.coeffs.reduce((a, b) => a + b, 0);
      const ergebnis =
        label === '' ? formatNumber(total) : formatSignedMonom(monom(total, g.vars));
      lines.push(`${name}: ${koeffKette(g.coeffs)} = ${formatNumber(total)} → ${ergebnis}`);
    }
  }
  lines.push(`Ergebnis: ${formatPoly(simplifyPoly(monoms))}`);
  return lines;
}

function eingabeTask(
  ausdruck: string,
  expectedRaw: Poly,
  rechenweg: string[],
  extras: Partial<GeneratedTask> = {}
): GeneratedTask {
  const expected = simplifyPoly(expectedRaw);
  return {
    id: nextId(),
    format: 'eingabe',
    ausdruck,
    expected,
    loesungText: extras.loesungText ?? formatPoly(expected),
    rechenweg,
    ...extras,
  };
}

// ============================================================================
// Kategorie 1: Terme vereinfachen (Addition/Subtraktion)
// ============================================================================

function genV1(): GeneratedTask {
  const v = choice(VARS);
  const n = randInt(3, 4);
  const coeffs = Array.from({ length: n }, () => randInt(1, 6));
  const monoms = coeffs.map((c) => monom(c, { [v]: 1 }));
  const sum = coeffs.reduce((a, b) => a + b, 0);
  return eingabeTask(formatPoly(monoms), monoms, [
    `Alle Terme sind gleichartig – sie enthalten dieselbe Variable ${v}.`,
    `Beachte: ${v} = 1${v}. Addiere die Koeffizienten: ${coeffs.join(' + ')} = ${sum}`,
    `Ergebnis: ${formatPoly(simplifyPoly(monoms))}`,
  ]);
}

function genV2(): GeneratedTask {
  const v = choice(VARS);
  const n = randInt(3, 4);
  const dezimal = Math.random() < 0.4;
  const coeffs: number[] = [];
  for (let i = 0; i < n; i++) {
    let c = dezimal ? randInt(3, 24) / 2 : randInt(2, 15);
    if (i > 0 && Math.random() < 0.55) c = -c;
    coeffs.push(c);
  }
  if (!coeffs.some((c) => c < 0)) coeffs[n - 1] = -coeffs[n - 1];
  const monoms = coeffs.map((c) => monom(c, { [v]: 1 }));
  return eingabeTask(formatPoly(monoms), monoms, [
    `Alle Terme enthalten ${v} – rechne die Koeffizienten mit Vorzeichen zusammen:`,
    ...zusammenfassenWeg(monoms),
  ]);
}

function genV3(): GeneratedTask {
  const nVars = Math.random() < 0.3 ? 3 : 2;
  const vs = randVars(nVars);
  const monoms: Monom[] = [];
  for (const v of vs) {
    const c1 = randInt(2, 12);
    let c2 = Math.random() < 0.6 ? -randInt(1, 9) : randInt(1, 9);
    if (c1 + c2 === 0) c2 += 1;
    monoms.push(monom(c1, { [v]: 1 }), monom(c2, { [v]: 1 }));
  }
  const order = shuffle(monoms);
  return eingabeTask(formatPoly(order), order, [
    'Sortiere nach Variablen und fasse nur gleichartige Terme zusammen:',
    ...zusammenfassenWeg(order),
  ]);
}

function genV4(): GeneratedTask {
  const [v1, v2] = randVars(2);
  const monoms: Monom[] = [];
  const a1 = randInt(2, 9);
  let a2 = Math.random() < 0.6 ? -randInt(1, 7) : randInt(1, 7);
  if (a1 + a2 === 0) a2 += 1;
  monoms.push(monom(a1, { [v1]: 1 }), monom(a2, { [v1]: 1 }));
  monoms.push(monom(randInt(2, 9), { [v2]: 1 }));
  if (Math.random() < 0.5) {
    monoms.push(monom(Math.random() < 0.5 ? -randInt(1, 6) : randInt(1, 6), { [v2]: 1 }));
  }
  monoms.push(monom(randInt(1, 12)), monom(-randInt(1, 9)));
  if (Math.random() < 0.35) {
    monoms.push(monom(randInt(2, 5), { [v1]: 1, [v2]: 1 }));
  }
  const order = shuffle(monoms);
  return eingabeTask(formatPoly(order), order, [
    `Achtung: ${v1}, ${v2}, ${v1}${v2} und Zahlen sind NICHT gleichartig – nur gleiche Sorten zusammenfassen!`,
    ...zusammenfassenWeg(order),
  ]);
}

// ============================================================================
// Kategorie 2: Terme multiplizieren & dividieren
// ============================================================================

function genM1(): GeneratedTask {
  const v = choice(VARS);
  if (Math.random() < 0.5) {
    const a = randInt(2, 12);
    const k = randInt(2, 9);
    const zuerst = Math.random() < 0.5;
    const ausdruck = zuerst ? `${a}${v} · ${k}` : `${k} · ${a}${v}`;
    return eingabeTask(ausdruck, [monom(a * k, { [v]: 1 })], [
      'Multipliziere die Zahlen (Koeffizienten) miteinander:',
      `${zuerst ? `${a} · ${k}` : `${k} · ${a}`} = ${a * k}`,
      `Die Variable ${v} bleibt erhalten.`,
      `Ergebnis: ${a * k}${v}`,
    ]);
  }
  const d = randInt(2, 9);
  const r = randInt(2, 12);
  return eingabeTask(`${d * r}${v} : ${d}`, [monom(r, { [v]: 1 })], [
    'Dividiere den Koeffizienten durch die Zahl:',
    `${d * r} : ${d} = ${r}`,
    `Die Variable ${v} bleibt erhalten.`,
    `Ergebnis: ${r}${v}`,
  ]);
}

function genM2(): GeneratedTask {
  const [v, w] = randVars(2);
  const a = randInt(2, 12);
  const b = randInt(2, 9);
  const variante = randInt(1, 3);
  let ausdruck: string;
  let coeffZeile: string;
  let gesamt: number;
  if (variante === 1) {
    ausdruck = `${a}${v} · ${b}${w}`;
    coeffZeile = `${a} · ${b} = ${a * b}`;
    gesamt = a * b;
  } else if (variante === 2) {
    const k = randInt(2, 5);
    ausdruck = `${k} · ${a}${v} · ${b}${w}`;
    coeffZeile = `${k} · ${a} · ${b} = ${k * a * b}`;
    gesamt = k * a * b;
  } else {
    ausdruck = `${a}${v} · ${w}`;
    coeffZeile = `${a} · 1 = ${a}`;
    gesamt = a;
  }
  const expected = [monom(gesamt, { [v]: 1, [w]: 1 })];
  return eingabeTask(ausdruck, expected, [
    'Multipliziere zuerst alle Zahlen, dann alle Variablen:',
    coeffZeile,
    `${v} · ${w} = ${v}${w}`,
    `Ergebnis: ${formatPoly(simplifyPoly(expected))}`,
  ]);
}

function genM3(): GeneratedTask {
  const [v, w] = randVars(2);
  const variante = randInt(1, 3);
  if (variante === 1) {
    return eingabeTask(`${v} · ${v}`, [monom(1, { [v]: 2 })], [
      'Gleiche Variablen multipliziert ergeben eine Potenz:',
      `${v} · ${v} = ${v}²`,
      `Ergebnis: ${v}²`,
    ]);
  }
  const a = randInt(2, 8);
  const b = randInt(2, 6);
  if (variante === 2) {
    return eingabeTask(`${a}${v} · ${b}${v}`, [monom(a * b, { [v]: 2 })], [
      `Zahlen multiplizieren: ${a} · ${b} = ${a * b}`,
      `Gleiche Variablen ergeben eine Potenz: ${v} · ${v} = ${v}²`,
      `Ergebnis: ${a * b}${v}²`,
    ]);
  }
  return eingabeTask(`${a}${v} · ${b}${v} · ${w}`, [monom(a * b, { [v]: 2, [w]: 1 })], [
    `Zahlen multiplizieren: ${a} · ${b} = ${a * b}`,
    `Variablen multiplizieren: ${v} · ${v} · ${w} = ${v}²${w}`,
    `Ergebnis: ${formatPoly(simplifyPoly([monom(a * b, { [v]: 2, [w]: 1 })]))}`,
  ]);
}

function genM4(): GeneratedTask {
  const [v, w] = randVars(2);
  const variante = randInt(1, 3);
  if (variante === 1) {
    const d = choice([2, 3, 4, 6]);
    const a = d * randInt(1, 4);
    const b = randInt(2, 8);
    const ergebnis = (a * b) / d;
    return eingabeTask(`${a}${v} · ${b}${w} : ${d}`, [monom(ergebnis, { [v]: 1, [w]: 1 })], [
      `Erst multiplizieren: ${a} · ${b} = ${a * b}`,
      `Dann dividieren: ${a * b} : ${d} = ${formatNumber(ergebnis)}`,
      `Variablen: ${v} · ${w} = ${v}${w}`,
      `Ergebnis: ${formatNumber(ergebnis)}${v}${w}`,
    ]);
  }
  if (variante === 2) {
    const d = randInt(2, 9);
    const r = randInt(2, 9);
    return eingabeTask(`${d * r}${v} : (-${d})`, [monom(-r, { [v]: 1 })], [
      'Beachte das Vorzeichen: positiv durch negativ ergibt negativ.',
      `${d * r} : (-${d}) = -${r}`,
      `Ergebnis: -${r}${v}`,
    ]);
  }
  const a = randInt(2, 9);
  const b = randInt(2, 7);
  return eingabeTask(`${a}${v} · (-${b}${w})`, [monom(-a * b, { [v]: 1, [w]: 1 })], [
    'Beachte das Vorzeichen: plus mal minus ergibt minus.',
    `${a} · (-${b}) = -${a * b}`,
    `Variablen: ${v} · ${w} = ${v}${w}`,
    `Ergebnis: -${a * b}${v}${w}`,
  ]);
}

// ============================================================================
// Kategorie 3: Klammern auflösen (Plus-/Minusklammern)
// ============================================================================

function genK1(): GeneratedTask {
  const [v1, v2] = randVars(2);
  const outer = monom(randInt(2, 9), { [v1]: 1 });
  const inner: Monom[] = [
    monom(randInt(2, 9), { [v1]: 1 }),
    monom(Math.random() < 0.5 ? -randInt(1, 8) : randInt(1, 8), { [v2]: 1 }),
  ];
  if (Math.random() < 0.4) {
    inner.push(monom(Math.random() < 0.5 ? -randInt(1, 9) : randInt(1, 9)));
  }
  const expanded = [outer, ...inner];
  return eingabeTask(`${formatPoly([outer])} + (${formatPoly(inner)})`, expanded, [
    'Plusklammer: Die Klammer kann einfach weggelassen werden, alle Vorzeichen bleiben.',
    `= ${formatPoly(expanded)}`,
    ...zusammenfassenWeg(expanded),
  ]);
}

function genK2(): GeneratedTask {
  const [v1, v2] = randVars(2);
  const outer = monom(randInt(3, 12), { [v1]: 1 });
  const inner: Monom[] = [monom(randInt(1, 8), { [v1]: 1 })];
  if (Math.random() < 0.5) {
    inner.push(monom(Math.random() < 0.5 ? -randInt(1, 9) : randInt(1, 9)));
  } else {
    inner.push(monom(Math.random() < 0.5 ? -randInt(1, 8) : randInt(1, 8), { [v2]: 1 }));
  }
  const expanded = [outer, ...inner.map((m) => monom(-m.coeff, m.vars))];
  return eingabeTask(`${formatPoly([outer])} - (${formatPoly(inner)})`, expanded, [
    'Minusklammer: Beim Weglassen der Klammer drehen sich ALLE Vorzeichen darin um.',
    `= ${formatPoly(expanded)}`,
    ...zusammenfassenWeg(expanded),
  ]);
}

function genK3(): GeneratedTask {
  const [v1, v2] = randVars(2);
  const e1: Monom[] = [
    monom(randInt(3, 13), { [v1]: 1 }),
    monom(Math.random() < 0.5 ? -randInt(1, 8) : randInt(1, 8), { [v2]: 1 }),
  ];
  const e2: Monom[] = [
    monom(randInt(1, 9), { [v1]: 1 }),
    monom(Math.random() < 0.5 ? -randInt(1, 6) : randInt(1, 6), { [v2]: 1 }),
  ];
  const mitExtra = Math.random() < 0.4;
  const extra = monom(randInt(2, 7), { [v2]: 1 });
  const ausdruck =
    `(${formatPoly(e1)}) - (${formatPoly(e2)})` + (mitExtra ? ` + ${formatMonomBody(extra)}` : '');
  const expanded = [...e1, ...e2.map((m) => monom(-m.coeff, m.vars)), ...(mitExtra ? [extra] : [])];
  return eingabeTask(ausdruck, expanded, [
    'Erste Klammer (Plus davor bzw. am Anfang): Vorzeichen bleiben.',
    'Zweite Klammer (Minus davor): alle Vorzeichen drehen sich um.',
    `= ${formatPoly(expanded)}`,
    ...zusammenfassenWeg(expanded),
  ]);
}

function genK4(): GeneratedTask {
  const [v1, v2] = randVars(2);
  const a = randInt(2, 9);
  const b = randInt(2, 8);
  const c = randInt(1, 6);
  const d = randInt(1, 6);
  const e = randInt(1, 9);
  if (Math.random() < 0.5) {
    // a·v1 + (b·v2 - [c·v1 - d·v2] + e)
    const ausdruck = `${cv(a, v1)} + (${cv(b, v2)} - [${cv(c, v1)} - ${cv(d, v2)}] + ${e})`;
    const expanded = [
      monom(a, { [v1]: 1 }),
      monom(b, { [v2]: 1 }),
      monom(-c, { [v1]: 1 }),
      monom(d, { [v2]: 1 }),
      monom(e),
    ];
    return eingabeTask(ausdruck, expanded, [
      `Innerste Klammer zuerst: -[${cv(c, v1)} - ${cv(d, v2)}] = -${cv(c, v1)} + ${cv(d, v2)}`,
      `Runde Klammer (Plus davor): Vorzeichen bleiben.`,
      `= ${formatPoly(expanded)}`,
      ...zusammenfassenWeg(expanded),
    ]);
  }
  // a·v1 - (b·v1 - [c·v1 + d])
  const ausdruck = `${a + b + c}${v1} - (${cv(b, v1)} - [${cv(c, v1)} + ${d}])`;
  const expanded = [
    monom(a + b + c, { [v1]: 1 }),
    monom(-b, { [v1]: 1 }),
    monom(c, { [v1]: 1 }),
    monom(d),
  ];
  return eingabeTask(ausdruck, expanded, [
    `Innerste Klammer zuerst: -[${cv(c, v1)} + ${d}] = -${cv(c, v1)} - ${d}`,
    `In der runden Klammer steht dann: ${cv(b, v1)} - ${cv(c, v1)} - ${d}`,
    `Minusklammer: alle Vorzeichen drehen sich um: -${cv(b, v1)} + ${cv(c, v1)} + ${d}`,
    `= ${formatPoly(expanded)}`,
    ...zusammenfassenWeg(expanded),
  ]);
}

// ============================================================================
// Kategorie 4: Distributivgesetz & Ausklammern
// ============================================================================

function genD1(): GeneratedTask {
  const v = choice(VARS);
  const variante = randInt(1, 3);
  const a = randInt(2, 9);
  const bNeg = Math.random() < 0.4;
  const b = bNeg ? -randInt(1, 9) : randInt(1, 9);
  const inner = [monom(a, { [v]: 1 }), monom(b)];
  const k = randInt(2, 9);
  if (variante === 3) {
    const expanded = inner;
    const ausdruck = `(${formatPoly(scalePoly(inner, k))}) : ${k}`;
    return eingabeTask(ausdruck, expanded, [
      `Teile JEDEN Term in der Klammer durch ${k}:`,
      `${k * a}${v} : ${k} = ${a}${v}`,
      `${formatNumber(Math.abs(k * b))} : ${k} = ${formatNumber(Math.abs(b))}`,
      `Ergebnis: ${formatPoly(simplifyPoly(expanded))}`,
    ]);
  }
  const expanded = scalePoly(inner, k);
  const ausdruck =
    variante === 1 ? `${k} · (${formatPoly(inner)})` : `(${formatPoly(inner)}) · ${k}`;
  return eingabeTask(ausdruck, expanded, [
    `Distributivgesetz: Multipliziere ${k} mit JEDEM Term in der Klammer:`,
    `${k} · ${a}${v} = ${k * a}${v}`,
    `${k} · ${fmtFaktor(monom(b))} = ${formatSignedMonom(monom(k * b))}`,
    `Ergebnis: ${formatPoly(simplifyPoly(expanded))}`,
  ]);
}

function genD2(): GeneratedTask {
  const [v, w] = randVars(2);
  const a = randInt(2, 8);
  const b = randInt(1, 9);
  const variante = randInt(1, 3);
  if (variante === 1) {
    const expanded = [monom(a, { [v]: 2 }), monom(b, { [v]: 1 })];
    return eingabeTask(`${v} · (${a}${v} + ${b})`, expanded, [
      `Multipliziere ${v} mit jedem Term in der Klammer:`,
      `${v} · ${a}${v} = ${a}${v}² (gleiche Variablen ergeben eine Potenz!)`,
      `${v} · ${b} = ${b}${v}`,
      `Ergebnis: ${formatPoly(simplifyPoly(expanded))}`,
    ]);
  }
  if (variante === 2) {
    const expanded = [monom(a, { [v]: 1, [w]: 1 }), monom(-b, { [v]: 1 })];
    return eingabeTask(`${v} · (${a}${w} - ${b})`, expanded, [
      `Multipliziere ${v} mit jedem Term in der Klammer:`,
      `${v} · ${a}${w} = ${a}${v}${w}`,
      `${v} · (-${b}) = -${b}${v}`,
      `Ergebnis: ${formatPoly(simplifyPoly(expanded))}`,
    ]);
  }
  const k = randInt(2, 6);
  const expanded = [monom(-k * a, { [v]: 1 }), monom(k * b)];
  return eingabeTask(`-${k} · (${a}${v} - ${b})`, expanded, [
    `Multipliziere -${k} mit jedem Term – beachte die Vorzeichen:`,
    `-${k} · ${a}${v} = -${k * a}${v}`,
    `-${k} · (-${b}) = +${k * b} (minus mal minus ergibt plus!)`,
    `Ergebnis: ${formatPoly(simplifyPoly(expanded))}`,
  ]);
}

function genD3(): GeneratedTask {
  const g = choice([2, 3, 4, 5, 6, 7]);
  const [v, w] = randVars(2);
  const a = randInt(2, 6);
  let b = randInt(1, 9);
  let guard = 0;
  while (ggT(a, b) > 1 && guard < 20) {
    b = randInt(1, 9);
    guard++;
  }
  const minus = Math.random() < 0.4;
  const zweiteVariable = Math.random() < 0.4;
  const inner: Monom[] = [
    monom(a, { [v]: 1 }),
    zweiteVariable ? monom(minus ? -b : b, { [w]: 1 }) : monom(minus ? -b : b),
  ];
  const expanded = scalePoly(inner, g);
  const loesung = `${g} · (${formatPoly(inner)})`;
  return eingabeTask(formatPoly(expanded), expanded, [
    `Suche den größten gemeinsamen Teiler der Koeffizienten ${g * a} und ${g * b}: ggT = ${g}`,
    `Teile jeden Term durch ${g}:`,
    `${g * a}${v} : ${g} = ${a}${v}`,
    `${formatSignedMonom(expanded[1])} : ${g} = ${formatSignedMonom(inner[1])}`,
    `Ergebnis: ${loesung}`,
  ], {
    frage: 'Klammere den größten gemeinsamen Faktor aus:',
    loesungText: loesung,
    requireBracket: true,
  });
}

function genD4(): GeneratedTask {
  const v = choice(VARS);
  const variante = randInt(1, 2);
  let p1: Poly;
  let p2: Poly;
  let ausdruck: string;
  if (variante === 1) {
    const a = Math.random() < 0.4 ? -randInt(1, 6) : randInt(1, 6);
    const b = Math.random() < 0.4 ? -randInt(1, 6) : randInt(1, 6);
    p1 = [monom(1, { [v]: 1 }), monom(a)];
    p2 = [monom(1, { [v]: 1 }), monom(b)];
    ausdruck = `(${formatPoly(p1)}) · (${formatPoly(p2)})`;
  } else {
    const a = randInt(2, 4);
    const b = Math.random() < 0.4 ? -randInt(1, 5) : randInt(1, 5);
    const c = randInt(2, 3);
    const d = Math.random() < 0.4 ? -randInt(1, 5) : randInt(1, 5);
    p1 = [monom(a, { [v]: 1 }), monom(b)];
    p2 = [monom(c, { [v]: 1 }), monom(d)];
    ausdruck = `(${formatPoly(p1)}) · (${formatPoly(p2)})`;
  }
  const produkte: string[] = [];
  const raw: Monom[] = [];
  for (const m1 of p1) {
    for (const m2 of p2) {
      const prod = mulPolys([m1], [m2])[0];
      raw.push(prod);
      produkte.push(`${fmtFaktor(m1)} · ${fmtFaktor(m2)} = ${formatSignedMonom(prod)}`);
    }
  }
  const expected = mulPolys(p1, p2);
  return eingabeTask(ausdruck, expected, [
    'Jeder Term der ersten Klammer wird mit jedem Term der zweiten Klammer multipliziert:',
    ...produkte,
    ...zusammenfassenWeg(raw),
  ]);
}

// ============================================================================
// Kategorie 5: Vermischte Aufgaben
// ============================================================================

const MIX_LEICHT = [genV1, genV2, genM1, genK1];
const MIX_MITTEL = [genV3, genM2, genK2, genD1];
const MIX_SCHWER = [genV4, genM3, genM4, genK3, genK4, genD2, genD4];

// ============================================================================
// Kategorie 6: Sonderformate
// ============================================================================

function genFehlersuche(): GeneratedTask {
  const [v, w] = randVars(2);
  const template = randInt(1, 3);
  const fehlerfrei = Math.random() < 0.25;

  let aufgabe: string;
  let schritte: string[];
  let fehlerIndex: number; // Index in schritte (0-basiert), -1 = kein Fehler
  let erklaerung: string[];
  let loesung: string;

  if (template === 1) {
    // Minusklammer
    const a = randInt(5, 12);
    const b = randInt(2, 4);
    const c = randInt(1, 9);
    aufgabe = `${a}${v} - (${b}${v} - ${c})`;
    loesung = `${a - b}${v} + ${c}`;
    if (fehlerfrei) {
      schritte = [`${a}${v} - ${b}${v} + ${c}`, `${a - b}${v} + ${c}`];
      fehlerIndex = -1;
      erklaerung = [
        'Die Rechnung ist fehlerfrei: Die Minusklammer wurde richtig aufgelöst (beide Vorzeichen gedreht).',
      ];
    } else {
      schritte = [`${a}${v} - ${b}${v} - ${c}`, `${a - b}${v} - ${c}`];
      fehlerIndex = 0;
      erklaerung = [
        `Fehler in Schritt 1: Bei einer Minusklammer drehen sich ALLE Vorzeichen um – auch das vor ${c}.`,
        `Richtig: ${a}${v} - ${b}${v} + ${c} = ${loesung}`,
      ];
    }
  } else if (template === 2) {
    // Distributivgesetz
    const k = randInt(2, 6);
    const a = randInt(2, 8);
    const b = randInt(1, 9);
    aufgabe = `${k} · (${a}${v} + ${b})`;
    loesung = `${k * a}${v} + ${k * b}`;
    if (fehlerfrei) {
      schritte = [`${k} · ${a}${v} + ${k} · ${b}`, loesung];
      fehlerIndex = -1;
      erklaerung = [
        'Die Rechnung ist fehlerfrei: Der Faktor wurde mit beiden Termen der Klammer multipliziert.',
      ];
    } else {
      schritte = [`${k} · ${a}${v} + ${b}`, `${k * a}${v} + ${b}`];
      fehlerIndex = 0;
      erklaerung = [
        `Fehler in Schritt 1: ${k} muss mit JEDEM Term in der Klammer multipliziert werden – auch mit ${b}.`,
        `Richtig: ${k} · ${a}${v} + ${k} · ${b} = ${loesung}`,
      ];
    }
  } else {
    // Nicht gleichartige Terme
    const a = randInt(2, 8);
    const b = randInt(2, 8);
    const c = randInt(2, 6);
    aufgabe = `${a}${v} + ${b}${w} + ${c}${v}`;
    loesung = `${a + c}${v} + ${b}${w}`;
    if (fehlerfrei) {
      schritte = [`${a}${v} + ${c}${v} + ${b}${w}`, loesung];
      fehlerIndex = -1;
      erklaerung = [
        'Die Rechnung ist fehlerfrei: Nur die gleichartigen Terme wurden zusammengefasst.',
      ];
    } else {
      schritte = [`${a + b + c}${v}${w}`];
      fehlerIndex = 0;
      erklaerung = [
        `Fehler in Schritt 1: ${v}-Terme und ${w}-Terme sind NICHT gleichartig und dürfen nicht zusammengefasst werden.`,
        `Richtig: ${a}${v} + ${c}${v} + ${b}${w} = ${loesung}`,
      ];
    }
  }

  const choices = [
    ...schritte.map((s, i) => `Schritt ${i + 1}: ${s}`),
    'Die Rechnung ist fehlerfrei.',
  ];
  const correctChoice = fehlerIndex === -1 ? choices.length - 1 : fehlerIndex;

  return {
    id: nextId(),
    format: 'auswahl',
    frage: 'Wo steckt der Fehler in dieser Rechnung?',
    ausdruck: `${aufgabe}  →  ${schritte.join('  →  ')}`,
    expected: [],
    loesungText: loesung,
    rechenweg: erklaerung,
    choices,
    correctChoice,
  };
}

function genLuecke(): GeneratedTask {
  const v = choice(VARS);
  const template = randInt(1, 4);
  if (template === 1) {
    const a = randInt(2, 9);
    const plus = Math.random() < 0.6;
    const diff = plus ? randInt(1, 8) : randInt(1, a - 1);
    const c = plus ? a + diff : a - diff;
    const ausdruck = plus ? `${a}${v} + ▢ = ${c}${v}` : `${a}${v} - ▢ = ${c}${v}`;
    return eingabeTask(ausdruck, [monom(diff, { [v]: 1 })], [
      plus
        ? `Wie kommt man von ${a}${v} auf ${c}${v}? Rechne ${c} - ${a} = ${diff}.`
        : `Wie kommt man von ${a}${v} auf ${c}${v}? Rechne ${a} - ${c} = ${diff}.`,
      `In die Lücke gehört: ${diff}${v}`,
    ], {
      frage: 'Welcher Term gehört in die Lücke?',
      eingabeLabel: '▢ =',
      loesungText: `${diff}${v}`,
    });
  }
  if (template === 2) {
    const k = randInt(2, 9);
    const a = randInt(2, 9);
    return eingabeTask(`${k} · ▢ = ${k * a}${v}`, [monom(a, { [v]: 1 })], [
      `Umkehraufgabe: Dividiere ${k * a}${v} durch ${k}.`,
      `${k * a} : ${k} = ${a}`,
      `In die Lücke gehört: ${a}${v}`,
    ], {
      frage: 'Welcher Term gehört in die Lücke?',
      eingabeLabel: '▢ =',
      loesungText: `${a}${v}`,
    });
  }
  if (template === 3) {
    const k = randInt(2, 6);
    const a = randInt(2, 8);
    const b = randInt(1, 9);
    return eingabeTask(`${k} · (${a}${v} + ▢) = ${k * a}${v} + ${k * b}`, [monom(b)], [
      `Vergleiche: ${k} · ▢ muss ${k * b} ergeben.`,
      `${k * b} : ${k} = ${b}`,
      `In die Lücke gehört: ${b}`,
    ], {
      frage: 'Welche Zahl gehört in die Lücke?',
      eingabeLabel: '▢ =',
      loesungText: `${b}`,
    });
  }
  const d = randInt(2, 8);
  const r = randInt(2, 9);
  return eingabeTask(`▢ : ${d} = ${r}${v}`, [monom(d * r, { [v]: 1 })], [
    `Umkehraufgabe: Multipliziere ${r}${v} mit ${d}.`,
    `${r} · ${d} = ${d * r}`,
    `In die Lücke gehört: ${d * r}${v}`,
  ], {
    frage: 'Welcher Term gehört in die Lücke?',
    eingabeLabel: '▢ =',
    loesungText: `${d * r}${v}`,
  });
}

const WORTZAHLEN: [string, number][] = [
  ['Doppelte', 2],
  ['Dreifache', 3],
  ['Vierfache', 4],
  ['Fünffache', 5],
  ['Sechsfache', 6],
];

function genAufstellen(): GeneratedTask {
  const template = randInt(1, 5);
  if (template === 1) {
    const [wort, n] = choice(WORTZAHLEN);
    const b = randInt(1, 12);
    const plus = Math.random() < 0.5;
    const expected = [monom(n, { x: 1 }), monom(plus ? b : -b)];
    return eingabeTask('', expected, [
      `„Das ${wort} einer Zahl x" bedeutet: ${n}x`,
      `„${plus ? 'vermehrt' : 'vermindert'} um ${b}" bedeutet: ${plus ? '+' : '-'} ${b}`,
      `Term: ${formatPoly(simplifyPoly(expected))}`,
    ], {
      frage: `Stelle den Term auf: Das ${wort} einer Zahl x, ${plus ? 'vermehrt' : 'vermindert'} um ${b}.`,
      eingabeLabel: 'Term =',
    });
  }
  if (template === 2) {
    const [w1, n1] = choice(WORTZAHLEN);
    const [w2, n2] = choice(WORTZAHLEN);
    const expected = [monom(n1, { a: 1 }), monom(n2, { b: 1 })];
    return eingabeTask('', expected, [
      `„Das ${w1} von a" bedeutet: ${n1}a`,
      `„Das ${w2} von b" bedeutet: ${n2}b`,
      `„Die Summe" bedeutet: addieren`,
      `Term: ${formatPoly(simplifyPoly(expected))}`,
    ], {
      frage: `Stelle den Term auf: Die Summe aus dem ${w1}n von a und dem ${w2}n von b.`,
      eingabeLabel: 'Term =',
    });
  }
  if (template === 3) {
    const k = randInt(2, 6);
    const b = randInt(1, 9);
    const expected = [monom(k, { x: 1 }), monom(k * b)];
    return eingabeTask('', expected, [
      `„Die Summe aus x und ${b}" bedeutet: (x + ${b}) – Klammer nicht vergessen!`,
      `„multipliziert mit ${k}" bedeutet: ${k} · (x + ${b})`,
      `Ausmultipliziert: ${k}x + ${k * b}`,
    ], {
      frage: `Stelle den Term auf: Multipliziere die Summe aus x und ${b} mit ${k}.`,
      eingabeLabel: 'Term =',
      loesungText: `${k} · (x + ${b}) = ${k}x + ${k * b}`,
    });
  }
  if (template === 4) {
    const b = randInt(1, 12);
    const expected = [monom(0.5, { x: 1 }), monom(b)];
    return eingabeTask('', expected, [
      `„Die Hälfte einer Zahl x" bedeutet: x : 2 = 0,5x`,
      `„vermehrt um ${b}" bedeutet: + ${b}`,
      `Term: 0,5x + ${b} (auch richtig: x/2 + ${b})`,
    ], {
      frage: `Stelle den Term auf: Die Hälfte einer Zahl x, vermehrt um ${b}.`,
      eingabeLabel: 'Term =',
      loesungText: `0,5x + ${b}`,
    });
  }
  const [wort, n] = choice(WORTZAHLEN);
  const b = randInt(1, 12);
  const expected = [monom(n, { y: 1 }), monom(-b)];
  return eingabeTask('', expected, [
    `„Das ${wort} von y" bedeutet: ${n}y`,
    `„Subtrahiere ${b}" bedeutet: - ${b}`,
    `Term: ${n}y - ${b}`,
  ], {
    frage: `Stelle den Term auf: Subtrahiere ${b} vom ${wort}n von y.`,
    eingabeLabel: 'Term =',
    loesungText: `${n}y - ${b}`,
  });
}

function genTermwert(): GeneratedTask {
  const xval = choice([-3, -2, 2, 3, 4, 5]);
  const mitKlammer = Math.random() < 0.4;
  let monoms: Monom[];
  let ausdruck: string;
  const weg: string[] = [];
  if (mitKlammer) {
    const k = randInt(2, 5);
    const a = randInt(2, 6);
    const b = randInt(1, 8);
    const c = randInt(2, k * a - 1);
    ausdruck = `${k} · (${a}x + ${b}) - ${c}x`;
    monoms = [monom(k * a, { x: 1 }), monom(k * b), monom(-c, { x: 1 })];
    weg.push(`Erst die Klammer auflösen: ${k * a}x + ${k * b} - ${c}x`);
  } else {
    const a = randInt(2, 9);
    let b = Math.random() < 0.5 ? -randInt(1, 6) : randInt(1, 6);
    if (a + b === 0) b += 1;
    const c = randInt(1, 12);
    const d = Math.random() < 0.5 ? -randInt(1, 9) : randInt(1, 9);
    monoms = [monom(a, { x: 1 }), monom(c), monom(b, { x: 1 }), monom(d)];
    ausdruck = formatPoly(monoms);
  }
  const simplified = simplifyPoly(monoms);
  const value = evalPoly(simplified, { x: xval });
  weg.push(`Vereinfacht: ${formatPoly(simplified)}`);
  const einsetzen = simplified
    .map((m, i) => {
      const teil =
        Object.keys(m.vars).length > 0
          ? `${formatNumber(Math.abs(m.coeff))} · (${formatNumber(xval)})`
          : formatNumber(Math.abs(m.coeff));
      if (i === 0) return (m.coeff < 0 ? '-' : '') + teil;
      return (m.coeff < 0 ? ' - ' : ' + ') + teil;
    })
    .join('');
  weg.push(`Setze x = ${formatNumber(xval)} ein: ${einsetzen}`);
  weg.push(`Termwert: ${formatNumber(value)}`);
  return eingabeTask(ausdruck, [monom(value)], weg, {
    frage: `Vereinfache zuerst und berechne dann den Termwert für x = ${formatNumber(xval)}:`,
    loesungText: formatNumber(value),
  });
}

// ============================================================================
// Kategorien-Definition
// ============================================================================

export const KATEGORIEN: Kategorie[] = [
  {
    name: 'Terme vereinfachen',
    stufen: [
      {
        name: 'Stufe 1: Nur Plus',
        beschreibung: 'Gleichartige Terme mit einer Variablen addieren.',
        generate: genV1,
      },
      {
        name: 'Stufe 2: Plus & Minus',
        beschreibung: 'Mit Minus, Vorzeichen und Dezimalzahlen.',
        generate: genV2,
      },
      {
        name: 'Stufe 3: Mehrere Variablen',
        beschreibung: 'Erst nach Variablen sortieren, dann zusammenfassen.',
        generate: genV3,
      },
      {
        name: 'Stufe 4: Mit Zahlen & Fallen',
        beschreibung: 'Variablen, Zahlen und nicht-gleichartige Terme gemischt.',
        generate: genV4,
      },
    ],
  },
  {
    name: 'Multiplizieren & Dividieren',
    stufen: [
      {
        name: 'Stufe 1: Zahl mal Term',
        beschreibung: 'Einen Term mit einer Zahl multiplizieren oder dividieren.',
        generate: genM1,
      },
      {
        name: 'Stufe 2: Variablen multiplizieren',
        beschreibung: 'Verschiedene Variablen und mehrere Faktoren.',
        generate: genM2,
      },
      {
        name: 'Stufe 3: Potenzen entstehen',
        beschreibung: 'Gleiche Variablen multipliziert: x · x = x²',
        generate: genM3,
      },
      {
        name: 'Stufe 4: Ketten & Vorzeichen',
        beschreibung: 'Multiplikation und Division gemischt, mit negativen Zahlen.',
        generate: genM4,
      },
    ],
  },
  {
    name: 'Klammern auflösen',
    stufen: [
      {
        name: 'Stufe 1: Plusklammern',
        beschreibung: 'Plus vor der Klammer: Vorzeichen bleiben.',
        generate: genK1,
      },
      {
        name: 'Stufe 2: Minusklammern',
        beschreibung: 'Minus vor der Klammer: alle Vorzeichen drehen sich.',
        generate: genK2,
      },
      {
        name: 'Stufe 3: Mehrere Klammern',
        beschreibung: 'Plus- und Minusklammern in einer Aufgabe.',
        generate: genK3,
      },
      {
        name: 'Stufe 4: Verschachtelt',
        beschreibung: 'Eckige Klammern in runden Klammern – von innen nach außen.',
        generate: genK4,
      },
    ],
  },
  {
    name: 'Distributivgesetz',
    stufen: [
      {
        name: 'Stufe 1: Zahl mal Klammer',
        beschreibung: 'Eine Zahl wird mit jedem Term der Klammer multipliziert.',
        generate: genD1,
      },
      {
        name: 'Stufe 2: Variable mal Klammer',
        beschreibung: 'Eine Variable als Faktor – hier entstehen Potenzen.',
        generate: genD2,
      },
      {
        name: 'Stufe 3: Ausklammern',
        beschreibung: 'Die Umkehrung: den gemeinsamen Faktor herausziehen.',
        generate: genD3,
      },
      {
        name: 'Stufe 4: Klammer mal Klammer',
        beschreibung: 'Jeder Term der ersten mit jedem Term der zweiten Klammer.',
        generate: genD4,
      },
    ],
  },
  {
    name: 'Vermischte Aufgaben',
    stufen: [
      {
        name: 'Leicht',
        beschreibung: 'Grundlagen aus allen Kategorien gemischt.',
        generate: () => choice(MIX_LEICHT)(),
      },
      {
        name: 'Mittel',
        beschreibung: 'Mehrere Variablen, Minusklammern und Distributivgesetz.',
        generate: () => choice(MIX_MITTEL)(),
      },
      {
        name: 'Schwer',
        beschreibung: 'Potenzen, verschachtelte Klammern und Klammer mal Klammer.',
        generate: () => choice(MIX_SCHWER)(),
      },
    ],
  },
  {
    name: 'Sonderformate',
    stufen: [
      {
        name: 'Fehlersuche',
        beschreibung: 'Finde den Fehler in der vorgerechneten Lösung.',
        generate: genFehlersuche,
      },
      {
        name: 'Lückenaufgaben',
        beschreibung: 'Welcher Term fehlt in der Gleichung?',
        generate: genLuecke,
      },
      {
        name: 'Terme aufstellen',
        beschreibung: 'Übersetze den Text in einen Term.',
        generate: genAufstellen,
      },
      {
        name: 'Termwert berechnen',
        beschreibung: 'Erst vereinfachen, dann einsetzen und ausrechnen.',
        generate: genTermwert,
      },
    ],
  },
];
