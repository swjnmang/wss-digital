import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { F, Fr, ch, chFixed, nm, nz, p, pick, poly, ri, sg, shuffle, t, xm } from '../lib';
import Plot from '../Plot';

// Lernbereich 3: Lineare und quadratische Funktionen

const P = (x: number | Fr, y: number | Fr, n = '') => `${n}(${t(x)} \\mid ${t(y)})`;
const fx = (c: number[]) => (x: number) => c.reduce((s, k) => s * x + k, 0);
/** Faktor vor Klammer/x: 1 → "", -1 → "-" */
const k1 = (a: number | Fr) => {
  const v = a instanceof Fr ? a.v : a;
  return v === 1 ? '' : v === -1 ? '-' : t(a);
};
/** Vorzeichen, Koeffizient und Variable: sgv(-1,'m') → "- m", sgv(3,'m') → "+ 3m" */
const sgv = (c: number, v: string) => (c === 1 ? `+ ${v}` : c === -1 ? `- ${v}` : `${sg(c)}${v}`);
const sq = (a: number, xs: number, ys: number) => `${k1(a)}(${xm(xs)})^2 ${ys ? sg(ys) : ''}`;
const opTex = (op: string) => (/[a-zäöüß]{4,}/i.test(op) && !op.includes('\\') ? `\\text{${op}}` : op);
const step = (l: string, r: string, op?: string) => `$${l} = ${r}${op ? ` \\qquad | ${opTex(op)}` : ''}$`;

// ---------------------------------------------------------------------------
// Funktionsbegriff
// ---------------------------------------------------------------------------

const funktionswert: Gen = () => {
  const quad = Math.random() < 0.5;
  const c = quad ? [pick([1, -1, 2, -2, 0.5]), nz(-5, 5), ri(-6, 6)] : [nz(-4, 4), ri(-8, 8)];
  const x0 = nz(-4, 4);
  const v = fx(c)(x0);
  const parts = quad
    ? `${t(c[0])} \\cdot ${p(x0)}^2 ${sg(c[1])} \\cdot ${p(x0)} ${c[2] ? sg(c[2]) : ''}`
    : `${t(c[0])} \\cdot ${p(x0)} ${c[1] ? sg(c[1]) : ''}`;
  return {
    title: 'Funktionswert berechnen',
    text: `Gegeben ist $f(x) = ${poly(c)}$ mit $D_f = \\mathbb{R}$. Berechne den Funktionswert an der Stelle $x = ${x0}$.`,
    parts: [nm(`$f(${x0})$`, v, { tol: 0.001 })],
    solution: [`Argument $${x0}$ für $x$ einsetzen:`, `$f(${x0}) = ${parts} = ${t(v)}$`],
  };
};

const argumentGesucht: Gen = () => {
  const m = nz(-5, 5);
  const tt = ri(-8, 8);
  const x0 = nz(-6, 6);
  const y0 = m * x0 + tt;
  return {
    title: 'Argument zu einem Funktionswert',
    text: `Für $f(x) = ${poly([m, tt])}$ gilt $f(x) = ${y0}$. Bestimme das zugehörige Argument $x$.`,
    parts: [nm('$x$', x0, { integer: true })],
    solution: [
      step(poly([m, tt]), `${y0}`, tt ? `${tt < 0 ? '+' : '-'} ${Math.abs(tt)}` : `: ${p(m)}`),
      ...(tt ? [step(`${k1(m)}x`, `${y0 - tt}`, `: ${p(m)}`)] : []),
      `$x = ${x0}$`,
    ],
  };
};

const begriffe: Gen = () => {
  const x0 = nz(-5, 5);
  const m = nz(-3, 3);
  const tt = ri(-5, 5);
  const y0 = m * x0 + tt;
  const items: [string, string][] = [
    [`In $f(${x0}) = ${y0}$ heißt die Zahl $${x0}$ …`, 'Argument'],
    [`In $f(${x0}) = ${y0}$ heißt die Zahl $${y0}$ …`, 'Funktionswert'],
    [`$${poly([m, tt])}$ ist der …`, 'Funktionsterm'],
    [`$f(x) = ${poly([m, tt])}$ ist die …`, 'Funktionsgleichung'],
    ['Die Menge aller Zahlen, die man für $x$ einsetzen darf, heißt …', 'Definitionsmenge'],
    ['Die Menge aller Funktionswerte heißt …', 'Wertemenge'],
    ['Eine Stelle $x$ mit $f(x) = 0$ heißt …', 'Nullstelle'],
  ];
  const [q, r] = pick(items);
  const all = ['Argument', 'Funktionswert', 'Funktionsterm', 'Funktionsgleichung', 'Definitionsmenge', 'Wertemenge', 'Nullstelle'];
  return {
    title: 'Begriffe rund um Funktionen',
    text: q,
    parts: [ch('Begriff:', r, shuffle(all.filter((x) => x !== r)).slice(0, 3))],
    solution: [
      'Eine **Funktion** ordnet jedem $x \\in D_f$ **genau ein** $y$ zu. $x$ ist das **Argument**, $f(x)$ der **Funktionswert**.',
      `Richtig: **${r}**.`,
    ],
  };
};

const istFunktion: Gen = () => {
  const xs = shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 5);
  const ys = xs.map(() => ri(-4, 6));
  const bad = Math.random() < 0.5;
  const pairs = xs.map((x, i) => [x, ys[i]]);
  if (bad) {
    const j = ri(0, 4);
    let y = ri(-4, 6);
    while (y === pairs[j][1]) y = ri(-4, 6);
    pairs.push([pairs[j][0], y]);
  } else {
    pairs.push([pick([4, 5, -4]), pairs[0][1]]);
  }
  const sh = shuffle(pairs);
  return {
    title: 'Ist das eine Funktion?',
    text: `Eine Zuordnung besteht aus den Wertepaaren\n$${sh.map(([x, y]) => P(x, y)).join(';\\; ')}$.`,
    parts: [chFixed('Handelt es sich um eine Funktion?', ['ja', 'nein'], bad ? 1 : 0)],
    solution: bad
      ? ['Ein $x$-Wert kommt mit **zwei verschiedenen** $y$-Werten vor – das ist bei einer Funktion nicht erlaubt.', 'Also **keine** Funktion.']
      : ['Jeder $x$-Wert kommt nur einmal vor (gleiche $y$-Werte für verschiedene $x$ sind erlaubt).', 'Also **eine** Funktion.'],
  };
};

const stromtarif: Gen = () => {
  const g = pick([8, 10, 12, 14, 15]);
  const pr = pick([0.28, 0.3, 0.32, 0.35, 0.4]);
  const x1 = pick([150, 200, 250, 300]);
  const x2 = pick([180, 220, 260, 320, 400]);
  const k2 = Math.round((g + pr * x2) * 100) / 100;
  return {
    title: 'Stromtarif',
    badge: 'Anwendung',
    text: `Ein Stromanbieter verlangt im Monat eine Grundgebühr von $${t(g)}$ € und $${t(pr)}$ € pro kWh. $K(x)$ sind die monatlichen Kosten in € bei einem Verbrauch von $x$ kWh.`,
    parts: [
      ch('a) Funktionsgleichung:', `$K(x) = ${t(pr)}x + ${g}$`, [`$K(x) = ${g}x + ${t(pr)}$`, `$K(x) = ${t(pr)}(x + ${g})$`, `$K(x) = ${t(pr + g)}x$`]),
      nm(`$K(${x1})$ in €`, g + pr * x1, { q: `b) Berechne die Kosten bei $${x1}$ kWh.`, tol: 0.01 }),
      nm('$x$ in kWh', x2, { q: `c) Wie viele kWh wurden verbraucht, wenn die Rechnung $${t(k2)}$ € beträgt?`, tol: 0.5 }),
    ],
    solution: [
      `Grundgebühr = $y$-Achsenabschnitt, Preis pro kWh = Steigung: $K(x) = ${t(pr)}x + ${g}$`,
      `b) $K(${x1}) = ${t(pr)} \\cdot ${x1} + ${g} = ${t(g + pr * x1)}$ €`,
      `c) $${t(pr)}x + ${g} = ${t(k2)} \\qquad | - ${g}$`,
      `$${t(pr)}x = ${t(k2 - g)} \\qquad | : ${t(pr)}$`,
      `$x = ${x2}$ kWh`,
    ],
  };
};

const temperatur: Gen = () => {
  const T0 = pick([12, 15, 18, 20, 24]);
  const r = pick([0.6, 0.65, 0.8]);
  const h = (T0 / r) * 100;
  const h1 = pick([500, 1000, 1500, 2000]);
  return {
    title: 'Temperatur und Höhe',
    badge: 'Anwendung',
    text: `In Meereshöhe herrschen $${T0}\\,^\\circ\\text{C}$. Pro $100$ m Höhe sinkt die Temperatur um $${t(r)}\\,^\\circ\\text{C}$. $T(h)$ ist die Temperatur in $^\\circ\\text{C}$ in $h$ Metern Höhe.`,
    parts: [
      nm(`$T(${h1})$`, T0 - (r / 100) * h1, { q: `a) Welche Temperatur herrscht in $${h1}$ m Höhe?`, tol: 0.01 }),
      nm('$h$ in m', h, { q: 'b) In welcher Höhe liegt die Nullstelle von $T$ (Frostgrenze)?', tol: 1 }),
    ],
    solution: [
      `$T(h) = -${t(r / 100, 4)}h + ${T0}$ (Steigung: $-${t(r)} : 100$)`,
      `a) $T(${h1}) = -${t(r / 100, 4)} \\cdot ${h1} + ${T0} = ${t(T0 - (r / 100) * h1)}\\,^\\circ\\text{C}$`,
      `b) $-${t(r / 100, 4)}h + ${T0} = 0 \\iff h = \\frac{${T0}}{${t(r / 100, 4)}} \\approx ${Math.round(h)}$ m`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Lineare Funktionen
// ---------------------------------------------------------------------------

const geradeAblesen: Gen = () => {
  const m = pick([F(1), F(2), F(-1), F(-2), F(1, 2), F(-1, 2), F(3, 2), F(-2, 3), F(1, 3), F(3), F(-3, 2)]);
  const tt = ri(-4, 4);
  const dx = m.d;
  return {
    title: 'Geradengleichung ablesen',
    text: 'Bestimme die Steigung $m$ und den $y$-Achsenabschnitt $t$ der abgebildeten Geraden $g$. (Brüche als z. B. 2/3 eingeben)',
    figure: <Plot x={[-5, 5]} y={[-5, 5]} curves={[{ f: (x) => m.v * x + tt, label: 'g' }]} points={[{ x: 0, y: tt }, { x: dx, y: tt + m.n }]} />,
    parts: [nm('$m$', m, { tol: 0.01 }), nm('$t$', tt, { integer: true })],
    solution: [
      `$y$-Achsenabschnitt ablesen: Die Gerade schneidet die $y$-Achse bei $${P(0, tt)}$, also $t = ${tt}$.`,
      `Steigungsdreieck: $${dx}$ nach rechts, $${m.n}$ ${m.n > 0 ? 'nach oben' : 'nach unten'} → $m = \\frac{${m.n}}{${dx}} = ${m.tex()}$`,
      `$g: y = ${poly([m, tt])}$`,
    ],
  };
};

const zweiPunkte: Gen = () => {
  const x1 = ri(-5, 3);
  const x2 = x1 + ri(1, 5);
  const y1 = ri(-6, 6);
  const y2 = ri(-6, 6);
  const m = F(y2 - y1, x2 - x1);
  const tt = F(y1).sub(m.mul(x1));
  return {
    title: 'Gerade durch zwei Punkte',
    text: `Die Gerade $g$ verläuft durch $A${P(x1, y1)}$ und $B${P(x2, y2)}$. Bestimme $m$ und $t$ in $g: y = mx + t$.`,
    parts: [nm('$m$', m, { tol: 0.002 }), nm('$t$', tt, { tol: 0.002 })],
    solution: [
      `$m = \\frac{y_B - y_A}{x_B - x_A} = \\frac{${y2} - ${p(y1)}}{${x2} - ${p(x1)}} = \\frac{${y2 - y1}}{${x2 - x1}} = ${m.tex()}$`,
      `$A$ einsetzen: $${y1} = ${m.tex()} \\cdot ${p(x1)} + t \\iff t = ${y1} - ${m.mul(x1).ptex()} = ${tt.tex()}$`,
      `$g: y = ${poly([m, tt])}$`,
    ],
  };
};

const punktSteigung: Gen = () => {
  const m = pick([F(2), F(-3), F(1, 2), F(-1, 2), F(3), F(-1), F(2, 3), F(-4)]);
  const x0 = nz(-5, 5);
  const y0 = ri(-6, 6);
  const tt = F(y0).sub(m.mul(x0));
  return {
    title: 'Punkt-Steigungs-Form',
    text: `Eine Gerade hat die Steigung $m = ${m.tex()}$ und verläuft durch $P${P(x0, y0)}$. Gib die Gleichung in der Form $y = mx + t$ an.`,
    parts: [nm('$t$', tt, { tol: 0.002 })],
    solution: [
      '$y = m \\cdot (x - x_0) + y_0$ (Punkt-Steigungs-Form)',
      `$y = ${m.tex()} \\cdot (${xm(x0)}) ${y0 ? sg(y0) : ''}$`,
      `$y = ${poly([m, m.mul(-x0)])} ${y0 ? sg(y0) : ''} = ${poly([m, tt])}$`,
      `Also $t = ${tt.tex()}$.`,
    ],
  };
};

const schnittGeraden: Gen = () => {
  const xs = nz(-4, 4);
  const ys = ri(-5, 5);
  const m1 = nz(-3, 3);
  let m2 = nz(-3, 3);
  while (m2 === m1) m2 = nz(-3, 3);
  const t1 = ys - m1 * xs;
  const t2 = ys - m2 * xs;
  return {
    title: 'Schnittpunkt zweier Geraden',
    text: `Berechne den Schnittpunkt $S$ von $g: y = ${poly([m1, t1])}$ und $h: y = ${poly([m2, t2])}$.`,
    figure: <Plot x={[-6, 6]} y={[-7, 7]} step={2} curves={[{ f: fx([m1, t1]), label: 'g' }, { f: fx([m2, t2]), label: 'h' }]} />,
    parts: [nm('$x_S$', xs, { integer: true }), nm('$y_S$', ys, { integer: true })],
    solution: [
      'Gleichsetzen:',
      step(poly([m1, t1]), poly([m2, t2]), `${m2 < 0 ? '+' : '-'} ${Math.abs(m2) === 1 ? '' : Math.abs(m2)}x ${t1 ? `\\;\\; ${t1 < 0 ? '+' : '-'} ${Math.abs(t1)}` : ''}`),
      step(`${k1(m1 - m2)}x`, `${t2 - t1}`, `: ${p(m1 - m2)}`),
      `$x_S = ${xs}$; in $g$ einsetzen: $y_S = ${m1} \\cdot ${p(xs)} ${t1 ? sg(t1) : ''} = ${ys}$`,
      `$S${P(xs, ys)}$`,
    ],
  };
};

const wertemengeLinear: Gen = () => {
  const m = nz(-3, 3);
  const tt = ri(-5, 5);
  const a = ri(-4, 1);
  const b = a + ri(2, 5);
  const fa = m * a + tt;
  const fb = m * b + tt;
  const lc = Math.random() < 0.6;
  const rc = Math.random() < 0.6;
  return {
    title: 'Wertemenge bei eingeschränkter Definitionsmenge',
    text: `Gegeben ist $f(x) = ${poly([m, tt])}$ mit $D_f = ${lc ? '[' : ']'}${a};\\,${b}${rc ? ']' : '['}$. Bestimme die Grenzen der Wertemenge $W_f$.`,
    figure: <Plot x={[-6, 6]} y={[-10, 10]} step={2} curves={[{ f: fx([m, tt]), from: a, to: b, label: 'Gf' }]} points={[{ x: a, y: fa }, { x: b, y: fb }]} />,
    parts: [
      nm('kleinster Wert', Math.min(fa, fb), { integer: true, q: 'a) untere Grenze von $W_f$' }),
      nm('größter Wert', Math.max(fa, fb), { integer: true, q: 'b) obere Grenze von $W_f$' }),
    ],
    solution: [
      `Eine lineare Funktion ist ${m > 0 ? 'steigend' : 'fallend'}, die Extremwerte liegen an den Rändern:`,
      `$f(${a}) = ${fa}$, $\\; f(${b}) = ${fb}$`,
      m > 0
        ? `$W_f = ${lc ? '[' : ']'}${fa};\\,${fb}${rc ? ']' : '['}$`
        : `$W_f = ${rc ? '[' : ']'}${fb};\\,${fa}${lc ? ']' : '['}$ (fallend: Klammern tauschen die Seiten)`,
    ],
  };
};

const achsenLinear: Gen = () => {
  const m = pick([F(2), F(-3), F(1, 2), F(-1, 2), F(4), F(-2), F(3, 4), F(-1)]);
  const tt = nz(-6, 6);
  const x0 = F(-tt).div(m);
  return {
    title: 'Achsenschnittpunkte einer Geraden',
    text: `Bestimme die Schnittpunkte von $g: y = ${poly([m, tt])}$ mit den Koordinatenachsen.`,
    parts: [nm('Nullstelle $x_N$', x0, { tol: 0.002 }), nm('$y$-Achsenabschnitt', tt, { integer: true })],
    solution: [
      `Nullstelle: $${poly([m, tt])} = 0 \\iff ${m.tex()}x = ${-tt} \\iff x = ${x0.tex()}$ → $N${P(x0, 0)}$`,
      `$y$-Achse: $x = 0$ einsetzen → $T${P(0, tt)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Quadratische Funktionen
// ---------------------------------------------------------------------------

const A_VALUES = [1, -1, 2, -2, 0.5, -0.5, 3];

const scheitelAblesen: Gen = () => {
  const a = pick(A_VALUES);
  const xs = ri(-5, 5);
  const ys = ri(-6, 6);
  return {
    title: 'Scheitelform lesen',
    text: `Gegeben ist $f(x) = ${sq(a, xs, ys)}$.`,
    parts: [nm('$x_S$', xs, { integer: true }), nm('$y_S$', ys, { integer: true }), chFixed('Die Parabel ist …', ['nach oben geöffnet', 'nach unten geöffnet'], a > 0 ? 0 : 1)],
    solution: [
      '$f(x) = a(x - x_S)^2 + y_S$ → Scheitel $S(x_S \\mid y_S)$',
      `Hier: $S${P(xs, ys)}$ – Vorsicht beim Vorzeichen in der Klammer!`,
      `$a = ${t(a)} ${a > 0 ? '> 0' : '< 0'}$ → nach ${a > 0 ? 'oben' : 'unten'} geöffnet${Math.abs(a) > 1 ? ', gestreckt' : Math.abs(a) < 1 ? ', gestaucht' : ''}.`,
    ],
  };
};

const scheitelInAllg: Gen = () => {
  const a = pick([1, -1, 2, -2, 3]);
  const xs = nz(-5, 5);
  const ys = ri(-6, 6);
  const b = -2 * a * xs;
  const c = a * xs * xs + ys;
  return {
    title: 'Scheitelform → allgemeine Form',
    text: `Schreibe $f(x) = ${sq(a, xs, ys)}$ in der Form $f(x) = ax^2 + bx + c$.`,
    parts: [nm('$a$', a, { integer: true }), nm('$b$', b, { integer: true }), nm('$c$', c, { integer: true })],
    solution: [
      `Binomische Formel: $(${xm(xs)})^2 = ${poly([1, -2 * xs, xs * xs])}$`,
      `$f(x) = ${k1(a)}(${poly([1, -2 * xs, xs * xs])}) ${ys ? sg(ys) : ''}$`,
      `$f(x) = ${poly([a, b, a * xs * xs])} ${ys ? sg(ys) : ''} = ${poly([a, b, c])}$`,
    ],
  };
};

const quadErgaenzung: Gen = () => {
  const a = pick([1, 1, -1, 2, -2]);
  const xs = nz(-5, 5);
  const ys = ri(-7, 7);
  const b = -2 * a * xs;
  const c = a * xs * xs + ys;
  const h = -xs; // b/(2a)
  const inner = a === 1 ? '' : `${k1(a)}\\left(`;
  const close = a === 1 ? '' : '\\right)';
  const bOverA = b / a;
  const cOverA = new Fr(c, a);
  return {
    title: 'Allgemeine Form → Scheitelform',
    text: `Bestimme den Scheitel von $f(x) = ${poly([a, b, c])}$ mit quadratischer Ergänzung.`,
    parts: [nm('$x_S$', xs, { integer: true }), nm('$y_S$', ys, { integer: true })],
    solution: [
      ...(a !== 1 ? [`$a = ${a}$ ausklammern: $f(x) = ${k1(a)}\\left(${poly([1, bOverA, 0])} ${cOverA.isZero() ? '' : sg(cOverA)}\\right)$`] : []),
      `Quadratische Ergänzung mit $\\left(\\frac{${bOverA}}{2}\\right)^2 = ${h * h}$:`,
      `$f(x) = ${inner}${poly([1, bOverA, 0])} + ${h * h} - ${h * h} ${cOverA.isZero() ? '' : sg(cOverA)}${close}$`,
      `$f(x) = ${inner}(${xm(xs)})^2 ${sg(cOverA.sub(h * h))}${close}$`,
      ...(a !== 1 ? [`$f(x) = ${sq(a, xs, ys)}$`] : []),
      `Scheitel $S${P(xs, ys)}$`,
      `Probe: $x_S = -\\frac{b}{2a} = -\\frac{${b}}{${2 * a}} = ${xs}$, $\\; y_S = f(${xs}) = ${ys}$`,
    ],
  };
};

const linearfaktor: Gen = () => {
  const a = pick([1, -1, 2, -2, 3, 0.5]);
  const r1 = nz(-6, 6);
  let r2 = ri(-6, 6);
  while (r2 === r1 || (a === 0.5 && (r1 + r2) % 2 !== 0)) r2 = ri(-6, 6);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  if (!Number.isInteger(b) || !Number.isInteger(c)) return linearfaktor();
  const [lo, hi] = [Math.min(r1, r2), Math.max(r1, r2)];
  const D = b * b - 4 * a * c;
  return {
    title: 'Nullstellen und Linearfaktorform',
    text: `Bestimme die Nullstellen von $f(x) = ${poly([a, b, c])}$ und gib $f$ in Linearfaktorform an.`,
    parts: [
      nm('$x_1$ (kleinere)', lo, { integer: true }),
      nm('$x_2$ (größere)', hi, { integer: true }),
      ch('Linearfaktorform:', `$f(x) = ${k1(a)}(${xm(lo)})(${xm(hi)})$`, [
        `$f(x) = ${k1(a)}(${xm(-lo)})(${xm(-hi)})$`,
        `$f(x) = (${xm(lo)})(${xm(hi)})$`,
        `$f(x) = ${k1(-a)}(${xm(lo)})(${xm(hi)})$`,
      ]),
    ],
    solution: [
      `$${poly([a, b, c])} = 0$: $D = ${p(b)}^2 - 4 \\cdot ${p(a)} \\cdot ${p(c)} = ${t(D)}$`,
      `$x_{1;2} = \\frac{${t(-b)} \\pm ${t(Math.sqrt(D))}}{${t(2 * a)}}$ → $x_1 = ${lo}$, $x_2 = ${hi}$`,
      `Linearfaktorform $f(x) = a(x - x_1)(x - x_2)$: $f(x) = ${k1(a)}(${xm(lo)})(${xm(hi)})$`,
    ],
  };
};

const parabelAusGraph: Gen = () => {
  const a = pick([1, -1, 2, -2, 0.5, -0.5]);
  const xs = ri(-3, 3);
  const ys = ri(-3, 3);
  const dx = Math.abs(a) === 0.5 ? 2 : 1;
  const f = (x: number) => a * (x - xs) ** 2 + ys;
  return {
    title: 'Funktionsgleichung aus dem Graphen',
    text: 'Bestimme die Gleichung der abgebildeten Parabel in Scheitelform $f(x) = a(x - x_S)^2 + y_S$.',
    figure: <Plot x={[-6, 6]} y={[-7, 7]} curves={[{ f, label: 'Gf' }]} points={[{ x: xs, y: ys, label: 'S' }, { x: xs + dx, y: f(xs + dx), label: 'P' }]} />,
    parts: [nm('$x_S$', xs, { integer: true }), nm('$y_S$', ys, { integer: true }), nm('$a$', a, { tol: 0.01 })],
    solution: [
      `Scheitel ablesen: $S${P(xs, ys)}$`,
      `Punkt ablesen: $P${P(xs + dx, f(xs + dx))}$`,
      `$P$ einsetzen: $${t(f(xs + dx))} = a \\cdot (${xs + dx} ${sg(-xs)})^2 ${ys ? sg(ys) : ''} \\iff ${t(f(xs + dx) - ys)} = ${k1(dx * dx)}a \\iff a = ${t(a)}$`,
      `$f(x) = ${sq(a, xs, ys)}$`,
    ],
  };
};

const ausNullstellenUndPunkt: Gen = () => {
  const r1 = ri(-5, 1);
  const r2 = r1 + ri(2, 6);
  const a = pick([1, -1, 2, -2, 0.5, -0.5, 3]);
  let px = ri(-6, 6);
  while (px === r1 || px === r2) px = ri(-6, 6);
  const py = a * (px - r1) * (px - r2);
  return {
    title: 'Parabel aus Nullstellen und Punkt',
    text: `Eine Parabel hat die Nullstellen $x_1 = ${r1}$ und $x_2 = ${r2}$ und verläuft durch $P${P(px, py)}$. Bestimme $a$ in $f(x) = a(x - x_1)(x - x_2)$.`,
    parts: [nm('$a$', a, { tol: 0.002 })],
    solution: [
      `$f(x) = a(${xm(r1)})(${xm(r2)})$`,
      `$P$ einsetzen: $${t(py)} = a \\cdot (${px} ${sg(-r1)})(${px} ${sg(-r2)}) = a \\cdot ${(px - r1) * (px - r2)}$`,
      `$a = \\frac{${t(py)}}{${(px - r1) * (px - r2)}} = ${t(a)}$`,
      `$f(x) = ${k1(a)}(${xm(r1)})(${xm(r2)})$`,
    ],
  };
};

const wertemengeQuad: Gen = () => {
  const a = pick([1, -1, 2, -2, 0.5, -0.5]);
  const xs = ri(-3, 3);
  const ys = ri(-5, 5);
  const f = (x: number) => a * (x - xs) ** 2 + ys;
  if (Math.random() < 0.5) {
    const right = a > 0 ? `$W_f = [${ys};\\,+\\infty[$` : `$W_f = ]-\\infty;\\,${ys}]$`;
    return {
      title: 'Wertemenge einer quadratischen Funktion',
      text: `Bestimme die Wertemenge von $f(x) = ${sq(a, xs, ys)}$ mit $D_f = \\mathbb{R}$.`,
      parts: [ch('Wertemenge:', right, [`$W_f = [${ys};\\,+\\infty[$`, `$W_f = ]-\\infty;\\,${ys}]$`, `$W_f = [${xs};\\,+\\infty[$`, '$W_f = \\mathbb{R}$'])],
      solution: [
        `Scheitel $S${P(xs, ys)}$, $a ${a > 0 ? '> 0' : '< 0'}$ → nach ${a > 0 ? 'oben' : 'unten'} geöffnet.`,
        `$y_S = ${ys}$ ist der ${a > 0 ? 'kleinste' : 'größte'} Funktionswert: ${right}`,
      ],
    };
  }
  const d1 = xs - ri(1, 3);
  const d2 = xs + ri(1, 4);
  const vals = [f(d1), f(d2), ys];
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return {
    title: 'Wertemenge bei eingeschränkter Definitionsmenge',
    text: `Gegeben ist $f(x) = ${sq(a, xs, ys)}$ mit $D_f = [${d1};\\,${d2}]$. Bestimme $W_f = [\\,\\ldots;\\,\\ldots\\,]$.`,
    figure: <Plot x={[-7, 7]} y={[-8, 8]} step={2} curves={[{ f, from: d1, to: d2, label: 'Gf' }, { f, dash: true, color: '#cbd5e1' }]} points={[{ x: xs, y: ys, label: 'S' }]} />,
    parts: [nm('untere Grenze', lo, { tol: 0.001 }), nm('obere Grenze', hi, { tol: 0.001 })],
    solution: [
      `Der Scheitel $S${P(xs, ys)}$ liegt in $D_f$.`,
      `Randwerte: $f(${d1}) = ${t(f(d1))}$, $\\; f(${d2}) = ${t(f(d2))}$`,
      a > 0
        ? `Nach oben geöffnet: kleinster Wert $y_S = ${ys}$, größter Wert am Rand: $${t(hi)}$`
        : `Nach unten geöffnet: größter Wert $y_S = ${ys}$, kleinster Wert am Rand: $${t(lo)}$`,
      `$W_f = [${t(lo)};\\,${t(hi)}]$`,
    ],
  };
};

const symmetrie: Gen = () => {
  const a = pick([1, -1, 2, -2, 0.5, 3]);
  const sym = Math.random() < 0.5;
  const b = sym ? 0 : nz(-6, 6);
  const c = ri(-6, 6);
  const xs = F(-b).div(2 * a);
  return {
    title: 'Symmetrie',
    text: `Gegeben ist $f(x) = ${poly([a, b, c])}$.`,
    parts: [
      chFixed('a) Ist der Graph achsensymmetrisch zur $y$-Achse?', ['ja', 'nein'], sym ? 0 : 1),
      nm('$x = $', xs, { tol: 0.002, q: 'b) Gib die Symmetrieachse der Parabel an.' }),
    ],
    solution: [
      sym
        ? `$f(-x) = ${t(a)}(-x)^2 ${c ? sg(c) : ''} = ${poly([a, 0, c])} = f(x)$ → achsensymmetrisch zur $y$-Achse.`
        : `$f(-x) = ${poly([a, -b, c])} \\neq f(x)$ – nicht symmetrisch zur $y$-Achse (der Term enthält $x$ mit ungeradem Exponenten).`,
      `Die Symmetrieachse geht durch den Scheitel: $x_S = -\\frac{b}{2a} = -\\frac{${b}}{${t(2 * a)}} = ${xs.tex()}$`,
    ],
  };
};

const lageXAchse: Gen = () => {
  const a = pick([1, -1, 2, -2, 0.5, -0.5]);
  const xs = ri(-4, 4);
  const ys = nz(-5, 5);
  const above = a > 0 && ys > 0;
  const below = a < 0 && ys < 0;
  const ans = above ? 0 : below ? 1 : 2;
  const b = -2 * a * xs;
  const c = a * xs * xs + ys;
  return {
    title: 'Lage zur x-Achse',
    text: `Untersuche die Lage des Graphen von $f(x) = ${poly([a, b, c])}$ zur $x$-Achse.`,
    parts: [chFixed('Der Graph …', ['liegt ganz oberhalb der $x$-Achse', 'liegt ganz unterhalb der $x$-Achse', 'schneidet die $x$-Achse'], ans)],
    solution: [
      `Scheitel: $x_S = -\\frac{${b}}{${t(2 * a)}} = ${xs}$, $\\; y_S = f(${xs}) = ${ys}$`,
      `$a ${a > 0 ? '> 0' : '< 0'}$ (nach ${a > 0 ? 'oben' : 'unten'} geöffnet), Scheitel ${ys > 0 ? 'oberhalb' : 'unterhalb'} der $x$-Achse.`,
      ans === 0 ? 'Also liegt der ganze Graph oberhalb der $x$-Achse (keine Nullstelle).' : ans === 1 ? 'Also liegt der ganze Graph unterhalb der $x$-Achse.' : 'Also schneidet der Graph die $x$-Achse in zwei Punkten.',
    ],
  };
};

// ---------------------------------------------------------------------------
// Schnittpunkte
// ---------------------------------------------------------------------------

const parabelGerade: Gen = () => {
  const r1 = ri(-4, 2);
  const r2 = r1 + ri(1, 5);
  const a = pick([1, 1, -1, 2, 0.5]);
  const m = nz(-3, 3);
  const n = ri(-4, 4);
  // f = g + a(x − r1)(x − r2)
  const fc = [a, m - a * (r1 + r2), n + a * r1 * r2];
  if (!fc.every((x) => Number.isInteger(x) || Number.isInteger(x * 2))) return parabelGerade();
  const y1 = m * r1 + n;
  const y2 = m * r2 + n;
  const dc = [a, -a * (r1 + r2), a * r1 * r2];
  return {
    title: 'Schnittpunkte Parabel – Gerade',
    text: `Berechne die Schnittpunkte von $f(x) = ${poly(fc)}$ und $g(x) = ${poly([m, n])}$.`,
    figure: <Plot x={[-7, 7]} y={[-9, 9]} step={2} curves={[{ f: fx(fc), label: 'Gf' }, { f: fx([m, n]), label: 'Gg' }]} />,
    parts: [
      nm('$x_1$ (kleinere)', r1, { integer: true }),
      nm('$y_1$', y1, { integer: true }),
      nm('$x_2$ (größere)', r2, { integer: true }),
      nm('$y_2$', y2, { integer: true }),
    ],
    solution: [
      `Gleichsetzen: $${poly(fc)} = ${poly([m, n])}$`,
      `Alles auf eine Seite: $${poly(dc)} = 0$`,
      `$D = ${t(dc[1] * dc[1] - 4 * dc[0] * dc[2])}$ → $x_{1;2} = \\frac{${t(-dc[1])} \\pm ${t(Math.sqrt(dc[1] * dc[1] - 4 * dc[0] * dc[2]))}}{${t(2 * a)}}$ → $x_1 = ${r1}$, $x_2 = ${r2}$`,
      `In $g$ einsetzen: $g(${r1}) = ${y1}$, $g(${r2}) = ${y2}$`,
      `$S_1${P(r1, y1)}$, $S_2${P(r2, y2)}$`,
    ],
  };
};

const parabelParabel: Gen = () => {
  const r1 = ri(-4, 1);
  const r2 = r1 + ri(1, 5);
  const a1 = pick([1, 2, -1]);
  let a2 = pick([-1, 1, 2, -2]);
  while (a2 === a1) a2 = pick([-1, 1, 2, -2]);
  const k = a1 - a2;
  const g = [a2, nz(-4, 4), ri(-5, 5)];
  const f = [a1, g[1] - k * (r1 + r2), g[2] + k * r1 * r2];
  const gf = fx(g);
  return {
    title: 'Schnittpunkte zweier Parabeln',
    text: `Berechne die $x$-Koordinaten der Schnittpunkte von $f(x) = ${poly(f)}$ und $g(x) = ${poly(g)}$ sowie die zugehörigen $y$-Werte.`,
    parts: [
      nm('$x_1$ (kleinere)', r1, { integer: true }),
      nm('$y_1$', gf(r1), { integer: true }),
      nm('$x_2$ (größere)', r2, { integer: true }),
      nm('$y_2$', gf(r2), { integer: true }),
    ],
    solution: [
      `$f(x) = g(x) \\iff ${poly(f)} - (${poly(g)}) = 0$`,
      `$${poly([k, -k * (r1 + r2), k * r1 * r2])} = 0$`,
      `${k !== 1 ? `$: ${p(k)}$ → ` : ''}$${poly([1, -(r1 + r2), r1 * r2])} = 0 \\iff (${xm(r1)})(${xm(r2)}) = 0$`,
      `$x_1 = ${r1}$, $x_2 = ${r2}$; $g(${r1}) = ${gf(r1)}$, $g(${r2}) = ${gf(r2)}$`,
    ],
  };
};

const anzahlSchnittpunkte: Gen = () => {
  const kind = ri(0, 2);
  let a = 1;
  let b = 0;
  let c = 0;
  let m = 1;
  let n = 0;
  for (let i = 0; i < 400; i++) {
    a = pick([1, -1, 2]);
    b = nz(-4, 4);
    c = ri(-4, 4);
    m = nz(-3, 3);
    n = ri(-8, 8);
    const D0 = (b - m) ** 2 - 4 * a * (c - n);
    if ((kind === 0 && D0 > 0) || (kind === 1 && D0 === 0) || (kind === 2 && D0 < 0)) break;
  }
  const bb = b - m;
  const cc = c - n;
  const D = bb * bb - 4 * a * cc;
  const ans = D > 0 ? 0 : D === 0 ? 1 : 2;
  return {
    title: 'Lage von Parabel und Gerade',
    text: `Untersuche rechnerisch die Lage von $f(x) = ${poly([a, b, c])}$ und $g(x) = ${poly([m, n])}$.`,
    parts: [
      nm('$D$', D, { integer: true, q: 'a) Diskriminante der Schnittgleichung' }),
      chFixed('b) Die Gerade ist eine …', ['Sekante (2 Schnittpunkte)', 'Tangente (1 Berührpunkt)', 'Passante (kein gemeinsamer Punkt)'], ans),
    ],
    solution: [
      `$f(x) = g(x) \\iff ${poly([a, bb, cc])} = 0$`,
      `$D = ${p(bb)}^2 - 4 \\cdot ${p(a)} \\cdot ${p(cc)} = ${D}$`,
      D > 0 ? '$D > 0$: zwei Schnittpunkte → Sekante' : D === 0 ? '$D = 0$: ein Berührpunkt → Tangente' : '$D < 0$: kein gemeinsamer Punkt → Passante',
    ],
  };
};

// ---------------------------------------------------------------------------
// Ungleichungen mit Graphenskizze
// ---------------------------------------------------------------------------

const quadUngleichung: Gen = () => {
  const r1 = ri(-5, 1);
  const r2 = r1 + ri(2, 6);
  const a = pick([1, -1, 2, -0.5, 0.5]);
  const rel = pick(['<', '\\leq', '>', '\\geq'] as const);
  const c = [a, -a * (r1 + r2), a * r1 * r2];
  if (!c.every(Number.isInteger)) return quadUngleichung();
  const wantPos = rel === '>' || rel === '\\geq';
  const closed = rel === '\\leq' || rel === '\\geq';
  // zwischen den Nullstellen hat f das Vorzeichen von −a
  const between = (a > 0) !== wantPos;
  const L_between = `${closed ? '[' : ']'}${r1};\\,${r2}${closed ? ']' : '['}`;
  const L_out = `]-\\infty;\\,${r1}${closed ? ']' : '['} \\cup ${closed ? '[' : ']'}${r2};\\,+\\infty[`;
  const L = between ? L_between : L_out;
  const desc = between
    ? `\\{x \\mid ${r1} ${closed ? '\\leq' : '<'} x ${closed ? '\\leq' : '<'} ${r2}\\}`
    : `\\{x \\mid x ${closed ? '\\leq' : '<'} ${r1} \\lor x ${closed ? '\\geq' : '>'} ${r2}\\}`;
  const altClosed = !closed;
  const L_between2 = `${altClosed ? '[' : ']'}${r1};\\,${r2}${altClosed ? ']' : '['}`;
  const L_out2 = `]-\\infty;\\,${r1}${altClosed ? ']' : '['} \\cup ${altClosed ? '[' : ']'}${r2};\\,+\\infty[`;
  return {
    title: 'Quadratische Ungleichung',
    text: `Löse mithilfe einer Skizze des Graphen von $f(x) = ${poly(c)}$:\n$${poly(c)} ${rel} 0$`,
    figure: (
      <Plot
        x={[-7, 7]}
        y={[-8, 8]}
        step={2}
        curves={[{ f: fx(c), label: 'Gf' }]}
        points={[{ x: r1, y: 0 }, { x: r2, y: 0 }]}
      />
    ),
    parts: [ch('$L =$', `$${L}$`, [`$${between ? L_out : L_between}$`, `$${between ? L_between2 : L_out2}$`, `$${between ? L_out2 : L_between2}$`])],
    solution: [
      `Nullstellen: $${poly(c)} = 0 \\iff x = ${r1} \\lor x = ${r2}$`,
      `$a = ${t(a)}$: Parabel nach ${a > 0 ? 'oben' : 'unten'} geöffnet, also liegt der Graph **zwischen** den Nullstellen ${a > 0 ? 'unterhalb' : 'oberhalb'} der $x$-Achse.`,
      `Gesucht: $f(x) ${rel} 0$ → Graph ${wantPos ? 'oberhalb' : 'unterhalb'} der $x$-Achse${closed ? ' (Nullstellen gehören dazu)' : ''}.`,
      `$L = ${desc} = ${L}$`,
    ],
  };
};

const linUnglGraph: Gen = () => {
  const xs = ri(-3, 3);
  const ys = ri(-3, 3);
  const m1 = nz(-2, 2);
  let m2 = nz(-2, 2);
  while (m2 === m1) m2 = nz(-2, 2);
  const t1 = ys - m1 * xs;
  const t2 = ys - m2 * xs;
  const above = Math.random() < 0.5;
  // f(x) − g(x) = (m1 − m2)(x − xs): > 0 für x > xs, wenn m1 > m2
  const right = (m1 > m2) === above;
  const L = right ? `]${xs};\\,+\\infty[` : `]-\\infty;\\,${xs}[`;
  return {
    title: 'Ungleichung grafisch lösen',
    text: `Für welche $x$ liegt der Graph von $f(x) = ${poly([m1, t1])}$ ${above ? 'oberhalb' : 'unterhalb'} des Graphen von $g(x) = ${poly([m2, t2])}$?`,
    figure: <Plot x={[-6, 6]} y={[-7, 7]} step={2} curves={[{ f: fx([m1, t1]), label: 'Gf' }, { f: fx([m2, t2]), label: 'Gg' }]} points={[{ x: xs, y: ys, label: 'S' }]} />,
    parts: [ch('$L =$', `$${L}$`, [`$${right ? `]-\\infty;\\,${xs}[` : `]${xs};\\,+\\infty[`}$`, `$]${ys};\\,+\\infty[$`, `$]-\\infty;\\,${xs}]$`])],
    solution: [
      `Schnittpunkt: $${poly([m1, t1])} = ${poly([m2, t2])} \\iff x = ${xs}$ → $S${P(xs, ys)}$`,
      `Rechts von $S$ liegt die Gerade mit der größeren Steigung oben (${m1 > m2 ? '$G_f$' : '$G_g$'}).`,
      `$f(x) ${above ? '>' : '<'} g(x)$ für $L = ${L}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Funktionen mit Parameter (Scharen)
// ---------------------------------------------------------------------------

const geradenbuendel: Gen = () => {
  const a = nz(-4, 4);
  const b = ri(-4, 4);
  // g_m(x) = m x − a m + b
  const mv = [-1, 0.5, 2];
  return {
    title: 'Gemeinsamer Punkt eines Geradenbüschels',
    text: `Gegeben ist die Geradenschar $g_m(x) = mx ${sgv(-a, 'm')} ${b ? sg(b) : ''}$ mit $m \\in \\mathbb{R}$. Alle Geraden haben einen gemeinsamen Punkt $B$. Bestimme ihn.`,
    figure: <Plot x={[-6, 6]} y={[-7, 7]} step={2} curves={mv.map((m) => ({ f: (x: number) => m * x - a * m + b, label: `m=${String(m).replace('.', ',')}` }))} />,
    parts: [nm('$x_B$', a, { integer: true }), nm('$y_B$', b, { integer: true })],
    solution: [
      `$m$ ausklammern: $g_m(x) = m(${xm(a)}) ${b ? sg(b) : ''}$`,
      `Für $x = ${a}$ wird die Klammer null – unabhängig von $m$ gilt dann $g_m(${a}) = ${b}$.`,
      `Gemeinsamer Punkt: $B${P(a, b)}$`,
    ],
  };
};

const scharDurchPunkt: Gen = () => {
  const a = nz(-4, 4);
  const b = ri(-4, 4);
  let px = ri(-5, 5);
  while (px === a) px = ri(-5, 5);
  const m = pick([F(1), F(-1), F(2), F(-2), F(1, 2), F(3), F(-1, 2)]);
  const py = m.mul(px - a).add(b);
  return {
    title: 'Schargerade durch einen Punkt',
    text: `Für welches $m$ verläuft die Gerade $g_m(x) = mx ${sgv(-a, 'm')} ${b ? sg(b) : ''}$ durch $A${P(px, py)}$?`,
    parts: [nm('$m$', m, { tol: 0.002 })],
    solution: [
      `$A$ einsetzen: $${py.tex()} = m \\cdot ${p(px)} ${sgv(-a, 'm')} ${b ? sg(b) : ''}$`,
      `$${py.sub(b).tex()} = ${k1(px - a)}m \\iff m = ${m.tex()}$`,
    ],
  };
};

const scharNullstellen: Gen = () => {
  const c = pick([1, 4, 9, 16]);
  const r = Math.sqrt(c);
  // f_t(x) = x² − 2t x + c, D = 4t² − 4c
  const q = pick(['zwei', 'genau eine', 'keine'] as const);
  const right = q === 'zwei' ? `$t < -${r} \\lor t > ${r}$` : q === 'genau eine' ? `$t = -${r} \\lor t = ${r}$` : `$-${r} < t < ${r}$`;
  return {
    title: 'Anzahl der Nullstellen einer Parabelschar',
    text: `Gegeben ist $f_t(x) = x^2 - 2tx + ${c}$ mit $t \\in \\mathbb{R}$.`,
    figure: <Plot x={[-6, 6]} y={[-6, 10]} step={2} curves={[-r - 1, 0, r].map((tv) => ({ f: (x: number) => x * x - 2 * tv * x + c, label: `t=${tv}` }))} />,
    parts: [
      nm('$D(t)$ für $t = 0$', -4 * c, { integer: true, q: 'a) Berechne die Diskriminante $D(t)$ und setze $t = 0$ ein.' }),
      ch(`b) Für welche $t$ hat $f_t$ **${q}** Nullstelle${q === 'zwei' ? 'n' : ''}?`, right, [`$t < -${r} \\lor t > ${r}$`, `$t = -${r} \\lor t = ${r}$`, `$-${r} < t < ${r}$`, `$t > ${r * r}$`]),
    ],
    solution: [
      `$D(t) = (-2t)^2 - 4 \\cdot 1 \\cdot ${c} = 4t^2 - ${4 * c}$, also $D(0) = ${-4 * c}$`,
      `$D(t) = 0 \\iff t^2 = ${c} \\iff t = \\pm ${r}$`,
      `$D(t)$ ist eine nach oben geöffnete Parabel in $t$: $D > 0$ für $t < -${r}$ oder $t > ${r}$ (zwei Nullstellen), $D < 0$ für $-${r} < t < ${r}$ (keine Nullstelle).`,
    ],
  };
};

const scheitelInAbhaengigkeit: Gen = () => {
  const c = ri(-4, 6);
  const t0 = nz(-3, 3);
  return {
    title: 'Scheitel in Abhängigkeit vom Parameter',
    text: `Gegeben ist $f_t(x) = x^2 - 2tx ${c ? sg(c) : ''}$ mit $t \\in \\mathbb{R}$.`,
    parts: [
      ch('a) Scheitelpunkt:', `$S(t \\mid ${c ? `${c} - t^2` : '-t^2'})$`, [`$S(-t \\mid ${c ? `${c} - t^2` : '-t^2'})$`, `$S(t \\mid ${c ? `${c} + t^2` : 't^2'})$`, `$S(2t \\mid ${c})$`]),
      nm(`$y_S$ für $t = ${t0}$`, c - t0 * t0, { integer: true, q: `b) Berechne $y_S$ für $t = ${t0}$.` }),
    ],
    solution: [
      `Quadratische Ergänzung: $f_t(x) = x^2 - 2tx + t^2 - t^2 ${c ? sg(c) : ''} = (x - t)^2 ${c ? sg(c) : ''} - t^2$`,
      `Scheitel $S(t \\mid ${c ? `${c} - t^2` : '-t^2'})$`,
      `b) $y_S = ${c} - ${p(t0)}^2 = ${c - t0 * t0}$`,
    ],
  };
};

const scharLinearfaktor: Gen = () => {
  const a = nz(-5, 5);
  const v = Math.random() < 0.5;
  return v
    ? {
        title: 'Scheitel auf der y-Achse',
        text: `Gegeben ist $p_k(x) = (${xm(a)})(x - k)$ mit $k \\in \\mathbb{R}$. Für welchen Wert von $k$ liegt der Scheitel auf der $y$-Achse?`,
        parts: [nm('$k$', -a, { integer: true })],
        solution: [
          `Nullstellen: $x_1 = ${a}$, $x_2 = k$. Der Scheitel liegt in der Mitte: $x_S = \\frac{${a} + k}{2}$`,
          `Scheitel auf der $y$-Achse: $x_S = 0 \\iff ${a} + k = 0 \\iff k = ${-a}$`,
        ],
      }
    : {
        title: 'Doppelte Nullstelle',
        text: `Gegeben ist $p_k(x) = (${xm(a)})(x - k)$ mit $k \\in \\mathbb{R}$. Für welchen Wert von $k$ besitzt $p_k$ eine doppelte Nullstelle?`,
        parts: [nm('$k$', a, { integer: true })],
        solution: [`Nullstellen: $x_1 = ${a}$ und $x_2 = k$.`, `Doppelte Nullstelle, wenn beide zusammenfallen: $k = ${a}$, dann $p_{${a}}(x) = (${xm(a)})^2$.`],
      };
};

const scharUndGerade: Gen = () => {
  const b = nz(-4, 4);
  const m = b + 2 * nz(-2, 2);
  const n = ri(-4, 4);
  const bb = b - m;
  const t0 = -n - (bb * bb) / 4;
  // x² + b x − t = m x + n → x² + (b − m)x − t − n = 0; D = (b − m)² + 4(t + n)
  return {
    title: 'Parabelschar und Gerade',
    text: `Gegeben sind $f_t(x) = ${poly([1, b, 0])} - t$ ($t \\in \\mathbb{R}$) und $g(x) = ${poly([m, n])}$.`,
    parts: [
      nm('$t$', t0, { integer: true, q: 'a) Für welches $t$ **berührt** der Graph von $f_t$ die Gerade?' }),
      ch('b) Für welche $t$ gibt es **zwei** Schnittpunkte?', `$t > ${t0}$`, [`$t < ${t0}$`, `$t = ${t0}$`, `$t > ${-t0}$`]),
    ],
    solution: [
      `Gleichsetzen: $${poly([1, b, 0])} - t = ${poly([m, n])} \\iff ${poly([1, bb, 0])} - t ${sg(-n)} = 0$`.replace(' + 0', ''),
      `$D(t) = ${p(bb)}^2 - 4 \\cdot 1 \\cdot (-t ${sg(-n)}) = ${bb * bb} + 4t ${sg(4 * n)}$`,
      `Berühren: $D(t) = 0 \\iff 4t = ${-(bb * bb) - 4 * n} \\iff t = ${t0}$`,
      `Zwei Schnittpunkte: $D(t) > 0 \\iff t > ${t0}$; für $t < ${t0}$ kein gemeinsamer Punkt.`,
    ],
  };
};

const scharDurchPunktParabel: Gen = () => {
  const a = pick([1, 2, -1]);
  const b = nz(-4, 4);
  const px = nz(-3, 3);
  const k = ri(-6, 6);
  const py = a * px * px + b * px + k;
  return {
    title: 'Scharparabel durch einen Punkt',
    text: `Für welches $k$ verläuft der Graph von $f_k(x) = ${poly([a, b, 0])} + k$ durch $P${P(px, py)}$?`,
    parts: [nm('$k$', k, { integer: true })],
    solution: [`$P$ einsetzen: $${py} = ${t(a)} \\cdot ${p(px)}^2 ${sg(b)} \\cdot ${p(px)} + k$`, `$${py} = ${a * px * px + b * px} + k \\iff k = ${k}$`],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'funktionsbegriff',
    title: 'Funktionsbegriff',
    description: 'Argument, Funktionswert, Funktionsterm, Definitions- und Wertemenge, Anwendungen',
    intro:
      'Eine **Funktion** $f$ ordnet jedem Element $x$ der **Definitionsmenge** $D_f$ **genau ein** Element $y = f(x)$ zu. $x$ heißt **Argument**, $f(x)$ **Funktionswert**. $f(x) = 2x + 1$ ist die **Funktionsgleichung**, $2x + 1$ der **Funktionsterm**. Die Menge aller Funktionswerte ist die **Wertemenge** $W_f$, eine Stelle mit $f(x) = 0$ heißt **Nullstelle**.\n\nIn Anwendungen ist eine Funktion oft ein Modell: Bei linearen Kosten ist die Grundgebühr der $y$-Achsenabschnitt und der Preis pro Einheit die Steigung.',
    formulas: ['y = m \\cdot x + t', 'f(x_0) = y_0'],
    example: {
      title: 'Argument bestimmen',
      text: 'Für $f(x) = 3x - 2$ gilt $f(x) = 13$. Bestimme $x$.',
      steps: ['$3x - 2 = 13 \\qquad | + 2$', '$3x = 15 \\qquad | : 3$', '$x = 5$'],
    },
    gens: [funktionswert, argumentGesucht, begriffe, istFunktion],
    apps: [stromtarif, temperatur],
  },
  {
    slug: 'lineare-funktionen',
    title: 'Lineare Funktionen',
    description: 'Graph ablesen, Gerade durch zwei Punkte, Punkt-Steigungs-Form, Schnittpunkte, Wertemenge',
    intro:
      'Der Graph einer linearen Funktion $y = mx + t$ ist eine Gerade mit **Steigung** $m$ und **$y$-Achsenabschnitt** $t$. Mit dem **Steigungsdreieck** liest man $m = \\frac{\\Delta y}{\\Delta x}$ ab.\n\nKennt man einen Punkt $P(x_0 \\mid y_0)$ und die Steigung, hilft die **Punkt-Steigungs-Form** $y = m(x - x_0) + y_0$. Schnittpunkte zweier Graphen erhält man durch **Gleichsetzen** der Funktionsterme.',
    formulas: ['y = m \\cdot x + t', 'y = m \\cdot (x - x_0) + y_0', 'm = \\frac{y_2 - y_1}{x_2 - x_1}'],
    example: {
      title: 'Gerade durch zwei Punkte',
      text: 'Gerade durch $A(1 \\mid 2)$ und $B(3 \\mid 8)$.',
      steps: ['$m = \\frac{8 - 2}{3 - 1} = 3$', '$y = 3(x - 1) + 2 = 3x - 1$'],
    },
    gens: [geradeAblesen, zweiPunkte, punktSteigung, schnittGeraden, wertemengeLinear, achsenLinear],
  },
  {
    slug: 'quadratische-funktionen',
    title: 'Quadratische Funktionen',
    description: 'Allgemeine Form, Scheitelform, Linearfaktorform, Graph, Wertemenge, Symmetrie',
    intro:
      'Quadratische Funktionen haben drei Schreibweisen: **allgemeine Form** $f(x) = ax^2 + bx + c$ (zeigt den $y$-Achsenabschnitt $c$), **Scheitelform** $f(x) = a(x - x_S)^2 + y_S$ (zeigt den Scheitel) und **Linearfaktorform** $f(x) = a(x - x_1)(x - x_2)$ (zeigt die Nullstellen).\n\n$a > 0$: nach oben geöffnet, $a < 0$: nach unten; $|a| > 1$ gestreckt, $|a| < 1$ gestaucht. Von der allgemeinen Form zur Scheitelform kommt man mit **quadratischer Ergänzung** oder mit $x_S = -\\frac{b}{2a}$, $y_S = f(x_S)$. Die Parabel ist symmetrisch zur Geraden $x = x_S$.',
    formulas: ['y = ax^2 + bx + c', 'y = a \\cdot (x - x_S)^2 + y_S', 'y = a \\cdot (x - x_1) \\cdot (x - x_2)', 'x_S = -\\frac{b}{2a}'],
    example: {
      title: 'Quadratische Ergänzung',
      text: 'Scheitel von $f(x) = x^2 - 6x + 5$.',
      steps: ['$f(x) = x^2 - 6x + 9 - 9 + 5$', '$f(x) = (x - 3)^2 - 4$', '$S(3 \\mid -4)$'],
    },
    gens: [scheitelAblesen, scheitelInAllg, quadErgaenzung, linearfaktor, parabelAusGraph, ausNullstellenUndPunkt, wertemengeQuad, symmetrie, lageXAchse],
    nBasic: 8,
  },
  {
    slug: 'schnittpunkte',
    title: 'Schnittpunkte von Graphen',
    description: 'Parabel und Gerade, zwei Parabeln, Sekante – Tangente – Passante',
    intro:
      'Gemeinsame Punkte zweier Graphen findet man durch **Gleichsetzen** $f(x) = g(x)$. Bei Parabel und Gerade entsteht eine quadratische Gleichung. Ihre **Diskriminante** entscheidet: $D > 0$ zwei Schnittpunkte (**Sekante**), $D = 0$ ein Berührpunkt (**Tangente**), $D < 0$ kein gemeinsamer Punkt (**Passante**). Die $y$-Koordinaten erhält man durch Einsetzen in eine der beiden Funktionen.',
    formulas: ['f(x) = g(x)', 'x_{1;2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'],
    example: {
      title: 'Parabel und Gerade',
      text: '$f(x) = x^2 - 1$, $g(x) = x + 1$',
      steps: ['$x^2 - 1 = x + 1 \\iff x^2 - x - 2 = 0$', '$(x + 1)(x - 2) = 0 \\iff x = -1 \\lor x = 2$', '$S_1(-1 \\mid 0)$, $S_2(2 \\mid 3)$'],
    },
    gens: [parabelGerade, parabelParabel, anzahlSchnittpunkte],
    nBasic: 4,
  },
  {
    slug: 'ungleichungen-graphisch',
    title: 'Ungleichungen mit Graphenskizze',
    description: 'Lineare und quadratische Ungleichungen grafisch lösen, Intervall- und Mengenschreibweise',
    intro:
      'Eine Ungleichung $f(x) > 0$ fragt: **Wo liegt der Graph oberhalb der $x$-Achse?** Dazu bestimmt man die Nullstellen und skizziert den Graphen. Bei einer nach oben geöffneten Parabel ist $f(x) < 0$ **zwischen** den Nullstellen und $f(x) > 0$ **außerhalb**.\n\nDie Lösungsmenge gibt man beschreibend, z. B. $\\{x \\mid -1 < x < 3\\}$, oder als Intervall $]-1;\\,3[$ an. Bei $\\leq$ bzw. $\\geq$ gehören die Nullstellen dazu.',
    formulas: ['\\{x \\mid a < x < b\\} = ]a;\\,b[', '\\{x \\mid x \\leq a \\lor x \\geq b\\} = ]-\\infty;\\,a] \\cup [b;\\,+\\infty['],
    example: {
      title: 'Quadratische Ungleichung',
      text: 'Löse $x^2 - 2x - 3 \\leq 0$.',
      steps: ['Nullstellen: $x = -1$ und $x = 3$', 'Nach oben geöffnet: zwischen den Nullstellen unterhalb der $x$-Achse.', '$L = [-1;\\,3]$'],
    },
    gens: [quadUngleichung, linUnglGraph],
    nBasic: 4,
  },
  {
    slug: 'funktionsscharen',
    title: 'Funktionen mit Parameter (Scharen)',
    description: 'Geradenbüschel, Parabelscharen, gemeinsame Punkte, Lage in Abhängigkeit vom Parameter',
    intro:
      'Enthält ein Funktionsterm einen **Parameter** (z. B. $k$, $t$ oder $m$), beschreibt er eine **Schar** von Graphen. Typische Fragen: Gibt es einen **gemeinsamen Punkt** aller Graphen? (Parameter ausklammern – wenn der Faktor beim Parameter null wird, ist der Funktionswert unabhängig vom Parameter.) Für welchen Parameterwert geht der Graph durch einen Punkt? (Punkt einsetzen, nach dem Parameter auflösen.)\n\nAnzahl der Nullstellen oder Schnittpunkte: Die **Diskriminante** hängt vom Parameter ab. Man löst $D = 0$, $D > 0$ und $D < 0$ nach dem Parameter auf.',
    formulas: ['D = b^2 - 4ac', 'y = m \\cdot (x - x_0) + y_0'],
    example: {
      title: 'Parabelschar',
      text: 'Für welche $k$ hat $f_k(x) = 2x^2 + 4x + k$ zwei Nullstellen?',
      steps: ['$D = 16 - 8k$', '$D > 0 \\iff 16 - 8k > 0 \\iff k < 2$', '$k = 2$: eine doppelte Nullstelle, $k > 2$: keine Nullstelle'],
    },
    gens: [geradenbuendel, scharDurchPunkt, scharNullstellen, scheitelInAbhaengigkeit, scharLinearfaktor, scharUndGerade, scharDurchPunktParabel],
  },
];

export const lb3: TopicConfig = {
  slug: 'funktionen',
  title: 'Lineare und quadratische Funktionen',
  description: 'Lernbereich 3: Funktionsbegriff, Geraden, Parabeln, Schnittpunkte, Ungleichungen und Funktionsscharen',
  icon: 'chart',
  pages,
};
