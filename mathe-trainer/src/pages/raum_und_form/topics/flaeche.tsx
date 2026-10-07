import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, PI, round, type UnitId } from '../engine/util';
import Scene, { C, ell, type El, type P } from '../figures/Scene';
import { CircleFig, ParaFig, RauteFig, RectFig, RingFig, TrapezFig, TriFig, sl } from '../figures/shapes';
import { areaOf, choice, eq, family, lenUnit, name, num, res, sq } from './helpers';
import { examsFor } from './pruefung';

const L = (x: number, u: UnitId) => `${de(x)} ${u}`;

// ---------------------------------------------------------------------------
// Rechteck & Quadrat
// ---------------------------------------------------------------------------

const F_RECHTECK = ['u = 2 \\cdot (a + b)', 'A = a \\cdot b', 'e = f = \\sqrt{a^2 + b^2}'];
const F_QUADRAT = ['u = 4 \\cdot a', 'A = a^2', 'e = f = a \\cdot \\sqrt{2}'];

const rechteckUA: Gen = () => {
  const u = lenUnit();
  const a = rs(3, 14, 0.5);
  const b = rs(2, 9, 0.5);
  return {
    title: 'Rechteck: Umfang und Flächeninhalt',
    text: `Ein Rechteck hat die Seitenlängen $a = ${q(a, u)}$ und $b = ${q(b, u)}$. Berechne Umfang und Flächeninhalt.`,
    figure: <RectFig a={a} b={b} la={`a = ${L(a, u)}`} lb={`b = ${L(b, u)}`} />,
    parts: [num('$u$', 2 * (a + b), u), num('$A$', a * b, areaOf(u))],
    solution: [
      `$u = 2 \\cdot (a + b) = 2 \\cdot (${q(a, u)} + ${q(b, u)}) = ${q(2 * (a + b), u)}$`,
      `$A = a \\cdot b = ${q(a, u)} \\cdot ${q(b, u)} = ${q(a * b, areaOf(u))}$`,
    ],
  };
};

const rechteckGemischteEinheiten: Gen = () => {
  const a = rs(1.2, 4.8, 0.1);
  const bcm = ri(35, 95);
  const b = bcm / 100;
  return {
    title: 'Rechteck mit verschiedenen Einheiten',
    text: `Ein Rechteck ist $a = ${q(a, 'm')}$ lang und $b = ${q(bcm, 'cm')}$ breit. Berechne Umfang und Flächeninhalt **in Meter bzw. Quadratmeter**.`,
    figure: <RectFig a={a} b={b} la={`a = ${L(a, 'm')}`} lb={`b = ${bcm} cm`} />,
    parts: [num('$u$', 2 * (a + b), 'm', { strict: true }), num('$A$', a * b, 'm²', { strict: true })],
    solution: [
      `Zuerst umrechnen: $b = ${q(bcm, 'cm')} = ${q(b, 'm')}$`,
      `$u = 2 \\cdot (a + b) = 2 \\cdot (${q(a, 'm')} + ${q(b, 'm')}) = ${q(2 * (a + b), 'm')}$`,
      `$A = a \\cdot b = ${q(a, 'm')} \\cdot ${q(b, 'm')} ${res(a * b, 'm²')}$`,
    ],
  };
};

const quadratUA: Gen = () => {
  const u = lenUnit();
  const a = rs(2, 15, 0.5);
  return {
    title: 'Quadrat: Umfang und Flächeninhalt',
    text: `Ein Quadrat hat die Seitenlänge $a = ${q(a, u)}$. Berechne Umfang und Flächeninhalt.`,
    figure: <RectFig a={1} b={1} la={`a = ${L(a, u)}`} />,
    parts: [num('$u$', 4 * a, u), num('$A$', a * a, areaOf(u))],
    solution: [`$u = 4 \\cdot a = 4 \\cdot ${q(a, u)} = ${q(4 * a, u)}$`, `$A = a^2 = (${q(a, u)})^2 = ${q(a * a, areaOf(u))}$`],
  };
};

const rechteckSeiteAusA: Gen = () => {
  const u = lenUnit();
  const a = ri(4, 16);
  const b = rs(2, 12, 0.5);
  const A = a * b;
  return {
    title: 'Rechteck: fehlende Seite',
    text: `Ein Rechteck hat den Flächeninhalt $A = ${q(A, areaOf(u))}$ und die Seite $a = ${q(a, u)}$. Berechne die Seite $b$ und den Umfang.`,
    figure: <RectFig a={a} b={b} la={`a = ${L(a, u)}`} lb="b = ?" />,
    parts: [num('$b$', b, u), num('$u$', 2 * (a + b), u)],
    solution: [
      `$A = a \\cdot b \\;\\Rightarrow\\; b = \\frac{A}{a} = \\frac{${q(A, areaOf(u))}}{${q(a, u)}} = ${q(b, u)}$`,
      `$u = 2 \\cdot (a + b) = 2 \\cdot (${q(a, u)} + ${q(b, u)}) = ${q(2 * (a + b), u)}$`,
    ],
  };
};

const rechteckSeiteAusU: Gen = () => {
  const u = lenUnit();
  const a = rs(3, 15, 0.5);
  const b = rs(2, 10, 0.5);
  const U = 2 * (a + b);
  return {
    title: 'Rechteck: Seite aus dem Umfang',
    text: `Ein Rechteck hat den Umfang $u = ${q(U, u)}$. Die Seite $a$ ist $${q(a, u)}$ lang. Berechne $b$ und den Flächeninhalt.`,
    figure: <RectFig a={a} b={b} la={`a = ${L(a, u)}`} lb="b = ?" />,
    parts: [num('$b$', b, u), num('$A$', a * b, areaOf(u))],
    solution: [
      `$u = 2 \\cdot (a + b) \\;\\Rightarrow\\; b = \\frac{u}{2} - a = \\frac{${q(U, u)}}{2} - ${q(a, u)} = ${q(b, u)}$`,
      `$A = a \\cdot b = ${q(a, u)} \\cdot ${q(b, u)} = ${q(a * b, areaOf(u))}$`,
    ],
  };
};

const quadratSeiteAusA: Gen = () => {
  const u = lenUnit();
  const a = ri(3, 25);
  const A = a * a;
  return {
    title: 'Quadrat: Seite aus der Fläche',
    text: `Ein Quadrat hat den Flächeninhalt $A = ${q(A, areaOf(u))}$. Wie lang ist eine Seite? Wie groß ist der Umfang?`,
    figure: <RectFig a={1} b={1} la="a = ?" />,
    parts: [num('$a$', a, u), num('$u$', 4 * a, u)],
    solution: [`$A = a^2 \\;\\Rightarrow\\; a = \\sqrt{A} = \\sqrt{${q(A, areaOf(u))}} = ${q(a, u)}$`, `$u = 4 \\cdot a = ${q(4 * a, u)}$`],
  };
};

const rechteckDiagonale: Gen = () => {
  const u = lenUnit();
  const a = ri(4, 20);
  const b = ri(3, 15);
  const e = Math.sqrt(a * a + b * b);
  return {
    title: 'Rechteck: Diagonale',
    text: `Berechne die Länge der Diagonale $e$ eines Rechtecks mit $a = ${q(a, u)}$ und $b = ${q(b, u)}$.`,
    figure: <RectFig a={a} b={b} la={`a = ${L(a, u)}`} lb={`b = ${L(b, u)}`} ld="e = ?" />,
    parts: [num('$e$', e, u)],
    solution: [`$e = \\sqrt{a^2 + b^2} = \\sqrt{(${q(a, u)})^2 + (${q(b, u)})^2} ${res(e, u)}$`],
  };
};

// Anwendungen
const teppich: Gen = () => {
  const l = rs(3.5, 6.5, 0.1);
  const b = rs(2.8, 5.0, 0.1);
  const t = pick([0.8, 0.9, 1.0, 1.2]);
  const p = pick([14.9, 19.5, 24.9, 29.0]);
  const n = name();
  const A = l * b;
  return {
    title: 'Neues Kinderzimmer',
    badge: 'Anwendung',
    text: `${n} bekommt ein neues Zimmer. Es ist $${q(l, 'm')}$ lang und $${q(b, 'm')}$ breit. Der Boden wird mit Teppich ausgelegt ($1\\,\\text{m}^2$ kostet $${q(p, '€')}$). Rundherum kommt eine Fußleiste, nur an der Tür ($${q(t, 'm')}$ breit) nicht.`,
    figure: <RectFig a={l} b={b} la={L(l, 'm')} lb={L(b, 'm')} />,
    parts: [
      num('Teppich', A, 'm²', { q: 'a) Wie viel Teppichboden wird benötigt?' }),
      num('Kosten', A * p, '€', { q: 'b) Was kostet der Teppichboden?' }),
      num('Fußleiste', 2 * (l + b) - t, 'm', { q: 'c) Wie viel Meter Fußleiste werden benötigt?' }),
    ],
    solution: [
      `a) $A = a \\cdot b = ${q(l, 'm')} \\cdot ${q(b, 'm')} ${res(A, 'm²')}$`,
      `b) $${tx2(A)}\\,\\text{m}^2 \\cdot ${q(p, '€')} ${res(round(A, 2) * p, '€')}$`,
      `c) $u = 2 \\cdot (a + b) = 2 \\cdot (${q(l, 'm')} + ${q(b, 'm')}) = ${q(2 * (l + b), 'm')}$; ohne Tür: $${q(2 * (l + b), 'm')} - ${q(t, 'm')} = ${q(2 * (l + b) - t, 'm')}$`,
    ],
  };
};

function tx2(x: number) {
  return de(x, 2).replace(',', '{,}');
}

const platten: Gen = () => {
  const s = pick([20, 25, 40, 50]);
  const nl = ri(12, 40);
  const nb = ri(3, 8);
  const lm = (s * nl) / 100;
  const bm = (s * nb) / 100;
  return {
    title: 'Gartenweg pflastern',
    badge: 'Anwendung',
    text: `Ein rechteckiger Gartenweg ist $${q(lm, 'm')}$ lang und $${q(bm, 'm')}$ breit. Er wird mit quadratischen Platten mit der Seitenlänge $${q(s, 'cm')}$ ausgelegt.`,
    parts: [
      num('Fläche', lm * bm, 'm²', { q: 'a) Wie groß ist die Fläche des Weges?' }),
      num('Anzahl', nl * nb, null, { integer: true, q: 'b) Wie viele Platten werden benötigt?' }),
    ],
    solution: [
      `a) $A = ${q(lm, 'm')} \\cdot ${q(bm, 'm')} ${res(lm * bm, 'm²')}$`,
      `b) Eine Platte: $A = (${q(s, 'cm')})^2 = ${q(s * s, 'cm²')} = ${q((s * s) / 10000, 'm²', 4)}$`,
      `$\\text{Anzahl} = ${tx2(lm * bm)}\\,\\text{m}^2 : ${de((s * s) / 10000, 4).replace(',', '{,}')}\\,\\text{m}^2 = ${nl * nb}$ Platten`,
      `(oder: $${nl}$ Platten in der Länge · $${nb}$ Platten in der Breite)`,
    ],
  };
};

const zaun: Gen = () => {
  const a = ri(18, 45);
  const b = ri(12, 30);
  const t = pick([3, 3.5, 4]);
  const p = pick([18.5, 22, 24.9, 32]);
  const f = family();
  const len = 2 * (a + b) - t;
  return {
    title: 'Ein Zaun ums Grundstück',
    badge: 'Anwendung',
    text: `${f} hat ein rechteckiges Grundstück ($${q(a, 'm')}$ × $${q(b, 'm')}$). Es soll rundherum eingezäunt werden, nur für die Einfahrt bleibt eine Lücke von $${q(t, 'm')}$. Ein Meter Zaun kostet $${q(p, '€')}$.`,
    figure: <RectFig a={a} b={b} la={L(a, 'm')} lb={L(b, 'm')} fill={C.green} />,
    parts: [num('Zaunlänge', len, 'm', { q: 'a) Wie lang wird der Zaun?' }), num('Kosten', len * p, '€', { q: 'b) Wie teuer ist der Zaun?' })],
    solution: [
      `a) $u = 2 \\cdot (${q(a, 'm')} + ${q(b, 'm')}) = ${q(2 * (a + b), 'm')}$; minus Einfahrt: $${q(len, 'm')}$`,
      `b) $${q(len, 'm')} \\cdot ${q(p, '€')} = ${q(len * p, '€')}$`,
    ],
  };
};

const glaser: Gen = () => {
  const n = ri(6, 15);
  const k = pick([2, 3, 4]);
  const a = pick([60, 75, 80, 90, 110, 120]);
  const b = pick([45, 50, 55, 65, 70]);
  const A = (n * k * a * b) / 10000;
  return {
    title: 'Glaserarbeiten',
    badge: 'Anwendung',
    text: `Eine Glaserei setzt in einem Neubau $${n}$ Fenster mit je $${k}$ Scheiben ein. Jede Scheibe ist $${q(a, 'cm')}$ × $${q(b, 'cm')}$ groß. Wie viel Quadratmeter Glas werden benötigt?`,
    parts: [num('Glas', A, 'm²', { strict: true })],
    solution: [
      `Eine Scheibe: $A = ${q(a, 'cm')} \\cdot ${q(b, 'cm')} = ${q(a * b, 'cm²')} = ${q((a * b) / 10000, 'm²', 4)}$`,
      `Anzahl Scheiben: $${n} \\cdot ${k} = ${n * k}$`,
      `Gesamt: $${n * k} \\cdot ${q((a * b) / 10000, 'm²', 4)} ${res(A, 'm²')}$`,
    ],
  };
};

const wandStreichen: Gen = () => {
  const l = rs(3.5, 7, 0.1);
  const h = rs(2.4, 2.8, 0.05);
  const fa = 1.2;
  const fb = pick([1.0, 1.2, 1.4]);
  const p = pick([3.5, 4.2, 5.8]);
  const A = l * h - fa * fb;
  return {
    title: 'Wand streichen',
    badge: 'Anwendung',
    text: `Eine Wand ist $${q(l, 'm')}$ lang und $${q(h, 'm')}$ hoch. Darin ist ein Fenster mit $${q(fa, 'm')}$ × $${q(fb, 'm')}$. Das Streichen kostet $${q(p, '€')}$ pro Quadratmeter.`,
    parts: [num('Fläche', A, 'm²', { q: 'a) Wie groß ist die zu streichende Fläche?' }), num('Kosten', A * p, '€', { q: 'b) Was kostet das Streichen?' })],
    solution: [
      `a) $A = ${q(l, 'm')} \\cdot ${q(h, 'm')} - ${q(fa, 'm')} \\cdot ${q(fb, 'm')} ${res(A, 'm²')}$`,
      `b) $${tx2(A)}\\,\\text{m}^2 \\cdot ${q(p, '€')} ${res(round(A, 2) * p, '€')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Dreiecke
// ---------------------------------------------------------------------------

const F_DREIECK = [
  'A = \\frac{g \\cdot h}{2}',
  'u = a + b + c',
  '\\text{gleichseitig: } A = \\frac{a^2}{4} \\cdot \\sqrt{3}',
  'h = \\frac{a}{2} \\cdot \\sqrt{3}',
  '\\text{rechtwinklig: } A = \\frac{a \\cdot b}{2}',
];

const dreieckA: Gen = () => {
  const u = lenUnit();
  const g = rs(4, 16, 0.5);
  const h = rs(2, 10, 0.5);
  return {
    title: 'Dreieck: Flächeninhalt',
    text: `Ein Dreieck hat die Grundlinie $g = ${q(g, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne den Flächeninhalt.`,
    figure: <TriFig g={g} h={h} t={rs(0.2, 0.8, 0.1)} lg={`g = ${L(g, u)}`} lh={`h = ${L(h, u)}`} />,
    parts: [num('$A$', (g * h) / 2, areaOf(u))],
    solution: [`$A = \\frac{g \\cdot h}{2} = \\frac{${q(g, u)} \\cdot ${q(h, u)}}{2} = ${q((g * h) / 2, areaOf(u))}$`],
  };
};

const dreieckUA: Gen = () => {
  const u = pick<UnitId>(['cm', 'm']);
  const g = ri(6, 14);
  const p = ri(2, g - 2);
  const h = ri(3, 9);
  const a = round(Math.hypot(g - p, h), 1);
  const b = round(Math.hypot(p, h), 1);
  return {
    title: 'Dreieck: Umfang und Fläche',
    text: `Im Dreieck $ABC$ ist $c = ${q(g, u)}$, $a = ${q(a, u)}$, $b = ${q(b, u)}$ und die Höhe auf $c$ ist $h_c = ${q(h, u)}$.`,
    figure: <TriFig g={g} h={h} t={p / g} lg={`c = ${L(g, u)}`} la={`a = ${L(a, u)}`} lb={`b = ${L(b, u)}`} lh={`h_c = ${L(h, u)}`} names={['A', 'B', 'C']} />,
    parts: [num('$u$', g + a + b, u, { q: 'a) Berechne den Umfang.' }), num('$A$', (g * h) / 2, areaOf(u), { q: 'b) Berechne den Flächeninhalt.' })],
    solution: [
      `a) $u = a + b + c = ${q(a, u)} + ${q(b, u)} + ${q(g, u)} = ${q(g + a + b, u)}$`,
      `b) $A = \\frac{c \\cdot h_c}{2} = \\frac{${q(g, u)} \\cdot ${q(h, u)}}{2} = ${q((g * h) / 2, areaOf(u))}$`,
    ],
  };
};

const dreieckH: Gen = () => {
  const u = lenUnit();
  const g = ri(4, 16);
  const h = rs(2, 12, 0.5);
  const A = (g * h) / 2;
  return {
    title: 'Dreieck: Höhe berechnen',
    text: `Ein Dreieck hat den Flächeninhalt $A = ${q(A, areaOf(u))}$ und die Grundlinie $g = ${q(g, u)}$. Wie lang ist die Höhe $h$?`,
    figure: <TriFig g={g} h={h} t={0.6} lg={`g = ${L(g, u)}`} lh="h = ?" />,
    parts: [num('$h$', h, u)],
    solution: [
      `$A = \\frac{g \\cdot h}{2} \\;\\Rightarrow\\; h = \\frac{2 \\cdot A}{g}$`,
      `$h = \\frac{2 \\cdot ${q(A, areaOf(u))}}{${q(g, u)}} = ${q(h, u)}$`,
    ],
  };
};

const dreieckRechtwinklig: Gen = () => {
  const u = lenUnit();
  const a = rs(3, 12, 0.5);
  const b = rs(3, 12, 0.5);
  return {
    title: 'Rechtwinkliges Dreieck: Fläche',
    text: `Ein rechtwinkliges Dreieck hat die Katheten $a = ${q(a, u)}$ und $b = ${q(b, u)}$. Berechne den Flächeninhalt.`,
    figure: <TriFig g={b} h={a} t={0} lg={`b = ${L(b, u)}`} lb={`a = ${L(a, u)}`} noHeight />,
    parts: [num('$A$', (a * b) / 2, areaOf(u))],
    solution: [`$A = \\frac{a \\cdot b}{2} = \\frac{${q(a, u)} \\cdot ${q(b, u)}}{2} = ${q((a * b) / 2, areaOf(u))}$`],
  };
};

const dreieckGleichseitig: Gen = () => {
  const u = lenUnit();
  const a = ri(3, 20);
  const h = (a / 2) * Math.sqrt(3);
  const A = ((a * a) / 4) * Math.sqrt(3);
  return {
    title: 'Gleichseitiges Dreieck',
    text: `Ein gleichseitiges Dreieck hat die Seitenlänge $a = ${q(a, u)}$. Berechne die Höhe $h$ und den Flächeninhalt $A$.`,
    figure: <TriFig g={2} h={Math.sqrt(3)} t={0.5} lg={`a = ${L(a, u)}`} lh="h = ?" />,
    parts: [num('$h$', h, u), num('$A$', A, areaOf(u))],
    solution: [
      `$h = \\frac{a}{2} \\cdot \\sqrt{3} = \\frac{${q(a, u)}}{2} \\cdot \\sqrt{3} ${res(h, u)}$`,
      `$A = \\frac{a^2}{4} \\cdot \\sqrt{3} = \\frac{(${q(a, u)})^2}{4} \\cdot \\sqrt{3} ${res(A, areaOf(u))}$`,
    ],
  };
};

const dreieckArt: Gen = () => {
  const u = pick<UnitId>(['cm', 'm']);
  const typ = pick(['gleichseitig', 'gleichschenklig', 'allgemein'] as const);
  let s: number[];
  if (typ === 'gleichseitig') {
    const a = ri(3, 12);
    s = [a, a, a];
  } else if (typ === 'gleichschenklig') {
    const a = ri(4, 12);
    const c = ri(2, 2 * a - 1);
    s = c === a ? [a, a, a + 1] : [a, c, a];
  } else {
    const a = ri(4, 10);
    s = [a, a + ri(1, 3), a + ri(4, 6)];
  }
  const right = `${typ === 'allgemein' ? 'allgemeines' : typ === 'gleichseitig' ? 'gleichseitiges' : 'gleichschenkliges'} Dreieck`;
  const all = ['gleichseitiges Dreieck', 'gleichschenkliges Dreieck', 'allgemeines Dreieck'];
  return {
    title: 'Welches Dreieck ist das?',
    text: `Ein Dreieck hat die Seitenlängen $${q(s[0], u)}$, $${q(s[1], u)}$ und $${q(s[2], u)}$.`,
    parts: [choice('Wie heißt diese Dreiecksart?', right, all.filter((o) => o !== right))],
    solution: [
      '**gleichseitig:** alle drei Seiten gleich lang',
      '**gleichschenklig:** genau zwei Seiten gleich lang',
      '**allgemein:** alle Seiten verschieden lang',
    ],
  };
};

const giebel: Gen = () => {
  const g = rs(6, 12, 0.5);
  const h = rs(2.5, 5, 0.1);
  const p = pick([6.5, 8.9, 12.5]);
  const A = (g * h) / 2;
  return {
    title: 'Giebelwand streichen',
    badge: 'Anwendung',
    text: `Der dreieckige Giebel eines Hauses ist unten $${q(g, 'm')}$ breit und $${q(h, 'm')}$ hoch. Er soll zweimal gestrichen werden. Ein Malerbetrieb verlangt $${q(p, '€')}$ pro Quadratmeter und Anstrich.`,
    figure: <TriFig g={g} h={h} t={0.5} lg={L(g, 'm')} lh={L(h, 'm')} />,
    parts: [num('Giebelfläche', A, 'm²', { q: 'a) Wie groß ist die Giebelfläche?' }), num('Kosten', A * 2 * p, '€', { q: 'b) Was kosten beide Anstriche?' })],
    solution: [`a) $A = \\frac{g \\cdot h}{2} = \\frac{${q(g, 'm')} \\cdot ${q(h, 'm')}}{2} ${res(A, 'm²')}$`, `b) $2 \\cdot ${tx2(A)}\\,\\text{m}^2 \\cdot ${q(p, '€')} ${res(2 * round(A, 2) * p, '€')}$`],
  };
};

const turmdach: Gen = () => {
  const g = rs(2, 4, 0.25);
  const h = rs(6, 11, 0.5);
  const p = pick([95, 110, 125]);
  const A = 4 * (g * h) / 2;
  return {
    title: 'Turmdach aus Kupfer',
    badge: 'Anwendung',
    text: `Ein Turmdach besteht aus vier gleichen Dreiecken mit der Grundseite $${q(g, 'm')}$ und der Höhe $${q(h, 'm')}$. $1\\,\\text{m}^2$ Kupferblech kostet $${q(p, '€')}$.`,
    parts: [num('Dachfläche', A, 'm²', { q: 'a) Wie groß ist die gesamte Dachfläche?' }), num('Kosten', A * p, '€', { q: 'b) Was kostet das Kupferblech?' })],
    solution: [`a) $A = 4 \\cdot \\frac{g \\cdot h}{2} = 4 \\cdot \\frac{${q(g, 'm')} \\cdot ${q(h, 'm')}}{2} ${res(A, 'm²')}$`, `b) $${tx2(A)}\\,\\text{m}^2 \\cdot ${q(p, '€')} ${res(round(A, 2) * p, '€')}$`],
  };
};

const segel: Gen = () => {
  const a = rs(2.5, 5, 0.1);
  const b = rs(1.5, 3.5, 0.1);
  const n = name();
  const A = (a * b) / 2;
  return {
    title: 'Sonnensegel',
    badge: 'Anwendung',
    text: `${n} spannt im Garten ein dreieckiges Sonnensegel. Es hat die Form eines rechtwinkligen Dreiecks mit den Katheten $${q(a, 'm')}$ und $${q(b, 'm')}$. Wie viel Stoff ist das?`,
    figure: <TriFig g={a} h={b} t={0} lg={L(a, 'm')} lb={L(b, 'm')} noHeight />,
    parts: [num('Stoff', A, 'm²')],
    solution: [`$A = \\frac{a \\cdot b}{2} = \\frac{${q(a, 'm')} \\cdot ${q(b, 'm')}}{2} ${res(A, 'm²')}$`],
  };
};

// ---------------------------------------------------------------------------
// Parallelogramm
// ---------------------------------------------------------------------------

const F_PARA = ['u = 2 \\cdot (a + b)', 'A = a \\cdot h_a'];

const paraUA: Gen = () => {
  const u = lenUnit();
  const a = rs(4, 14, 0.5);
  const h = rs(2, 8, 0.5);
  const b = round(h + rs(0.5, 3, 0.5), 1);
  return {
    title: 'Parallelogramm: Umfang und Fläche',
    text: `Ein Parallelogramm hat die Seiten $a = ${q(a, u)}$ und $b = ${q(b, u)}$. Die Höhe auf $a$ beträgt $h_a = ${q(h, u)}$.`,
    figure: <ParaFig a={a} h={h} shift={Math.sqrt(Math.max(b * b - h * h, 0.1)) / a} la={`a = ${L(a, u)}`} lb={`b = ${L(b, u)}`} lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$u$', 2 * (a + b), u, { q: 'a) Berechne den Umfang.' }), num('$A$', a * h, areaOf(u), { q: 'b) Berechne den Flächeninhalt.' })],
    solution: [`a) $u = 2 \\cdot (a + b) = 2 \\cdot (${q(a, u)} + ${q(b, u)}) = ${q(2 * (a + b), u)}$`, `b) $A = a \\cdot h_a = ${q(a, u)} \\cdot ${q(h, u)} = ${q(a * h, areaOf(u))}$`],
  };
};

const paraH: Gen = () => {
  const u = lenUnit();
  const a = ri(4, 15);
  const h = rs(2, 9, 0.5);
  const A = a * h;
  return {
    title: 'Parallelogramm: Höhe berechnen',
    text: `Ein Parallelogramm hat den Flächeninhalt $A = ${q(A, areaOf(u))}$ und die Seite $a = ${q(a, u)}$. Berechne die Höhe $h_a$.`,
    figure: <ParaFig a={a} h={h} la={`a = ${L(a, u)}`} lh="h_a = ?" />,
    parts: [num('$h_a$', h, u)],
    solution: [`$A = a \\cdot h_a \\;\\Rightarrow\\; h_a = \\frac{A}{a} = \\frac{${q(A, areaOf(u))}}{${q(a, u)}} = ${q(h, u)}$`],
  };
};

const paraA: Gen = () => {
  const u = lenUnit();
  const a = rs(3, 14, 0.5);
  const h = ri(2, 9);
  const A = a * h;
  return {
    title: 'Parallelogramm: Seite berechnen',
    text: `Ein Parallelogramm hat den Flächeninhalt $A = ${q(A, areaOf(u))}$ und die Höhe $h_a = ${q(h, u)}$. Wie lang ist die Seite $a$?`,
    figure: <ParaFig a={a} h={h} la="a = ?" lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$a$', a, u)],
    solution: [`$A = a \\cdot h_a \\;\\Rightarrow\\; a = \\frac{A}{h_a} = \\frac{${q(A, areaOf(u))}}{${q(h, u)}} = ${q(a, u)}$`],
  };
};

const paraB: Gen = () => {
  const u = lenUnit();
  const a = rs(4, 14, 0.5);
  const b = rs(2, 9, 0.5);
  const U = 2 * (a + b);
  return {
    title: 'Parallelogramm: Seite aus dem Umfang',
    text: `Ein Parallelogramm hat den Umfang $u = ${q(U, u)}$ und die Seite $a = ${q(a, u)}$. Berechne die Seite $b$.`,
    figure: <ParaFig a={a} h={b * 0.8} la={`a = ${L(a, u)}`} lb="b = ?" />,
    parts: [num('$b$', b, u)],
    solution: [`$u = 2 \\cdot (a + b) \\;\\Rightarrow\\; b = \\frac{u}{2} - a = \\frac{${q(U, u)}}{2} - ${q(a, u)} = ${q(b, u)}$`],
  };
};

const paraGrundstueck: Gen = () => {
  const a = ri(25, 60);
  const h = ri(15, 40);
  const p = pick([180, 240, 320, 450]);
  return {
    title: 'Grundstück kaufen',
    badge: 'Anwendung',
    text: `Ein Grundstück hat die Form eines Parallelogramms. Die Seite an der Straße ist $${q(a, 'm')}$ lang, der Abstand zur gegenüberliegenden Seite beträgt $${q(h, 'm')}$. Ein Quadratmeter kostet $${q(p, '€')}$.`,
    figure: <ParaFig a={a} h={h} la={L(a, 'm')} lh={L(h, 'm')} />,
    parts: [num('Fläche', a * h, 'm²', { q: 'a) Wie groß ist das Grundstück?' }), num('Preis', a * h * p, '€', { q: 'b) Was kostet das Grundstück?' })],
    solution: [`a) $A = a \\cdot h_a = ${q(a, 'm')} \\cdot ${q(h, 'm')} = ${q(a * h, 'm²')}$`, `b) $${q(a * h, 'm²')} \\cdot ${q(p, '€')} = ${q(a * h * p, '€')}$`],
  };
};

// ---------------------------------------------------------------------------
// Raute
// ---------------------------------------------------------------------------

const F_RAUTE = ['u = 4 \\cdot a', 'A = a \\cdot h_a = \\frac{e \\cdot f}{2}', 'a = \\frac{\\sqrt{e^2 + f^2}}{2}'];

const rauteEF: Gen = () => {
  const u = lenUnit();
  const e = ri(4, 16);
  const f = ri(3, 12);
  return {
    title: 'Raute: Fläche aus den Diagonalen',
    text: `Eine Raute hat die Diagonalen $e = ${q(e, u)}$ und $f = ${q(f, u)}$. Berechne den Flächeninhalt.`,
    figure: <RauteFig e={e} f={f} le={`e = ${L(e, u)}`} lf={`f = ${L(f, u)}`} />,
    parts: [num('$A$', (e * f) / 2, areaOf(u))],
    solution: [`$A = \\frac{e \\cdot f}{2} = \\frac{${q(e, u)} \\cdot ${q(f, u)}}{2} = ${q((e * f) / 2, areaOf(u))}$`],
  };
};

const rauteSeite: Gen = () => {
  const u = lenUnit();
  const e = 2 * ri(2, 8);
  const f = 2 * ri(2, 6);
  const a = Math.sqrt(e * e + f * f) / 2;
  return {
    title: 'Raute: Seite und Umfang',
    text: `Eine Raute hat die Diagonalen $e = ${q(e, u)}$ und $f = ${q(f, u)}$. Berechne die Seitenlänge $a$ und den Umfang $u$.`,
    figure: <RauteFig e={e} f={f} le={`e = ${L(e, u)}`} lf={`f = ${L(f, u)}`} la="a = ?" />,
    parts: [num('$a$', a, u), num('$u$', 4 * a, u)],
    solution: [
      `$a = \\frac{\\sqrt{e^2 + f^2}}{2} = \\frac{\\sqrt{(${q(e, u)})^2 + (${q(f, u)})^2}}{2} ${res(a, u)}$`,
      `$u = 4 \\cdot a ${eq(4 * a)} ${q(4 * a, u)}$`,
    ],
  };
};

const rauteAH: Gen = () => {
  const u = lenUnit();
  const a = ri(4, 12);
  const h = rs(2, a - 0.5, 0.5);
  return {
    title: 'Raute: Fläche mit der Höhe',
    text: `Eine Raute hat die Seitenlänge $a = ${q(a, u)}$ und die Höhe $h_a = ${q(h, u)}$. Berechne Flächeninhalt und Umfang.`,
    figure: <ParaFig a={a} h={h} shift={Math.sqrt(a * a - h * h) / a} la={`a = ${L(a, u)}`} lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$A$', a * h, areaOf(u)), num('$u$', 4 * a, u)],
    solution: [`$A = a \\cdot h_a = ${q(a, u)} \\cdot ${q(h, u)} = ${q(a * h, areaOf(u))}$`, `$u = 4 \\cdot a = ${q(4 * a, u)}$`],
  };
};

const rauteF: Gen = () => {
  const u = lenUnit();
  const e = ri(4, 16);
  const f = ri(3, 12);
  const A = (e * f) / 2;
  return {
    title: 'Raute: Diagonale berechnen',
    text: `Eine Raute hat den Flächeninhalt $A = ${q(A, areaOf(u))}$ und die Diagonale $e = ${q(e, u)}$. Wie lang ist die Diagonale $f$?`,
    figure: <RauteFig e={e} f={f} le={`e = ${L(e, u)}`} lf="f = ?" />,
    parts: [num('$f$', f, u)],
    solution: [`$A = \\frac{e \\cdot f}{2} \\;\\Rightarrow\\; f = \\frac{2 \\cdot A}{e} = \\frac{2 \\cdot ${q(A, areaOf(u))}}{${q(e, u)}} = ${q(f, u)}$`],
  };
};

const drachen: Gen = () => {
  const e = pick([60, 70, 80, 90]);
  const f = pick([40, 50, 60]);
  const n = name();
  const a = Math.sqrt(e * e + f * f) / 2;
  return {
    title: 'Ein Drachen aus Stoff',
    badge: 'Anwendung',
    text: `${n} baut einen Drachen in Form einer Raute. Die Diagonalen (Holzleisten) sind $${q(e, 'cm')}$ und $${q(f, 'cm')}$ lang. Der Rand wird mit Band eingefasst.`,
    figure: <RauteFig e={f} f={e} le={L(f, 'cm')} lf={L(e, 'cm')} />,
    parts: [num('Stoff', (e * f) / 2, 'cm²', { q: 'a) Wie viel Stoff wird benötigt?' }), num('Band', 4 * a, 'cm', { q: 'b) Wie lang muss das Band mindestens sein?' })],
    solution: [
      `a) $A = \\frac{e \\cdot f}{2} = \\frac{${q(e, 'cm')} \\cdot ${q(f, 'cm')}}{2} = ${q((e * f) / 2, 'cm²')}$`,
      `b) $a = \\frac{\\sqrt{e^2 + f^2}}{2} = \\frac{\\sqrt{${e}^2 + ${f}^2}}{2} ${res(a, 'cm')}$; $u = 4 \\cdot a ${res(4 * a, 'cm')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Trapez
// ---------------------------------------------------------------------------

const F_TRAPEZ = ['u = a + b + c + d', 'A = m \\cdot h_a = \\frac{a + c}{2} \\cdot h_a'];

const trapezA: Gen = () => {
  const u = lenUnit();
  const a = ri(8, 18);
  const c = ri(3, a - 2);
  const h = rs(2, 9, 0.5);
  const A = ((a + c) / 2) * h;
  return {
    title: 'Trapez: Flächeninhalt',
    text: `Ein Trapez hat die parallelen Seiten $a = ${q(a, u)}$ und $c = ${q(c, u)}$ sowie die Höhe $h_a = ${q(h, u)}$. Berechne den Flächeninhalt.`,
    figure: <TrapezFig a={a} c={c} h={h} la={`a = ${L(a, u)}`} lc={`c = ${L(c, u)}`} lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$A$', A, areaOf(u))],
    solution: [`$A = \\frac{a + c}{2} \\cdot h_a = \\frac{${q(a, u)} + ${q(c, u)}}{2} \\cdot ${q(h, u)} = ${q(A, areaOf(u))}$`],
  };
};

const trapezM: Gen = () => {
  const u = lenUnit();
  const m = rs(4, 14, 0.5);
  const h = rs(2, 8, 0.5);
  return {
    title: 'Trapez: Fläche mit der Mittellinie',
    text: `Die Mittellinie eines Trapezes ist $m = ${q(m, u)}$ lang, die Höhe beträgt $h_a = ${q(h, u)}$. Berechne den Flächeninhalt.`,
    figure: <TrapezFig a={m * 1.3} c={m * 0.7} h={h} lm={`m = ${L(m, u)}`} lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$A$', m * h, areaOf(u))],
    solution: [`$A = m \\cdot h_a = ${q(m, u)} \\cdot ${q(h, u)} = ${q(m * h, areaOf(u))}$`],
  };
};

const trapezU: Gen = () => {
  const u = lenUnit();
  const a = ri(9, 18);
  const c = ri(4, a - 3);
  const h = ri(3, 8);
  const off = (a - c) / 2;
  const b = round(Math.hypot(off, h), 1);
  return {
    title: 'Trapez: Umfang und Fläche',
    text: `Ein gleichschenkliges Trapez hat die Seiten $a = ${q(a, u)}$, $c = ${q(c, u)}$, die Schenkel $b = d = ${q(b, u)}$ und die Höhe $h_a = ${q(h, u)}$.`,
    figure: <TrapezFig a={a} c={c} h={h} la={`a = ${L(a, u)}`} lc={`c = ${L(c, u)}`} lb={`b = ${L(b, u)}`} lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$u$', a + c + 2 * b, u, { q: 'a) Berechne den Umfang.' }), num('$A$', ((a + c) / 2) * h, areaOf(u), { q: 'b) Berechne den Flächeninhalt.' })],
    solution: [
      `a) $u = a + b + c + d = ${q(a, u)} + ${q(b, u)} + ${q(c, u)} + ${q(b, u)} = ${q(a + c + 2 * b, u)}$`,
      `b) $A = \\frac{a + c}{2} \\cdot h_a = \\frac{${q(a, u)} + ${q(c, u)}}{2} \\cdot ${q(h, u)} = ${q(((a + c) / 2) * h, areaOf(u))}$`,
    ],
  };
};

const trapezH: Gen = () => {
  const u = lenUnit();
  const a = ri(8, 18);
  const c = ri(2, a - 2);
  const h = rs(2, 10, 0.5);
  const A = ((a + c) / 2) * h;
  return {
    title: 'Trapez: Höhe berechnen',
    text: `Ein Trapez hat den Flächeninhalt $A = ${q(A, areaOf(u))}$. Die parallelen Seiten sind $a = ${q(a, u)}$ und $c = ${q(c, u)}$ lang. Berechne die Höhe $h_a$.`,
    figure: <TrapezFig a={a} c={c} h={h} la={`a = ${L(a, u)}`} lc={`c = ${L(c, u)}`} lh="h_a = ?" />,
    parts: [num('$h_a$', h, u)],
    solution: [
      `$A = \\frac{a + c}{2} \\cdot h_a \\;\\Rightarrow\\; h_a = \\frac{A}{\\frac{a+c}{2}}$`,
      `$h_a = \\frac{${q(A, areaOf(u))}}{${q((a + c) / 2, u)}} = ${q(h, u)}$`,
    ],
  };
};

const trapezC: Gen = () => {
  const u = lenUnit();
  const a = ri(8, 18);
  const c = ri(2, a - 2);
  const h = ri(2, 10);
  const A = ((a + c) / 2) * h;
  return {
    title: 'Trapez: Seite c berechnen',
    text: `Ein Trapez hat den Flächeninhalt $A = ${q(A, areaOf(u))}$, die Seite $a = ${q(a, u)}$ und die Höhe $h_a = ${q(h, u)}$. Wie lang ist die Seite $c$?`,
    figure: <TrapezFig a={a} c={c} h={h} la={`a = ${L(a, u)}`} lc="c = ?" lh={`h_a = ${L(h, u)}`} />,
    parts: [num('$c$', c, u)],
    solution: [
      `$A = \\frac{a + c}{2} \\cdot h_a \\;\\Rightarrow\\; \\frac{a + c}{2} = \\frac{A}{h_a} = \\frac{${q(A, areaOf(u))}}{${q(h, u)}} = ${q(A / h, u)}$`,
      `$a + c = ${q((2 * A) / h, u)} \\;\\Rightarrow\\; c = ${q((2 * A) / h, u)} - ${q(a, u)} = ${q(c, u)}$`,
    ],
  };
};

const giebelfenster: Gen = () => {
  const a = pick([80, 90, 100, 120]);
  const c = a - pick([20, 30, 40]);
  const h = pick([50, 60, 70, 80]);
  const n = ri(2, 6);
  const Acm = ((a + c) / 2) * h;
  return {
    title: 'Giebelfenster',
    badge: 'Anwendung',
    text: `Ein Fenster hat die Form eines Trapezes: unten $${q(a, 'cm')}$, oben $${q(c, 'cm')}$ breit und $${q(h, 'cm')}$ hoch. Es werden $${n}$ solche Fenster eingebaut. Wie viel Quadratmeter Glas werden benötigt?`,
    figure: <TrapezFig a={a} c={c} h={h} la={L(a, 'cm')} lc={L(c, 'cm')} lh={L(h, 'cm')} />,
    parts: [num('Glas', (n * Acm) / 10000, 'm²', { strict: true })],
    solution: [
      `Ein Fenster: $A = \\frac{a + c}{2} \\cdot h_a = \\frac{${a} + ${c}}{2} \\cdot ${h}\\,\\text{cm}^2 = ${q(Acm, 'cm²')} = ${q(Acm / 10000, 'm²', 4)}$`,
      `$${n}$ Fenster: $${n} \\cdot ${q(Acm / 10000, 'm²', 4)} ${res((n * Acm) / 10000, 'm²')}$`,
    ],
  };
};

const trapezBeet: Gen = () => {
  const a = rs(6, 12, 0.5);
  const c = round(a - rs(1.5, 4, 0.5), 1);
  const h = rs(2, 5, 0.5);
  const k = pick([6, 8, 10, 12]);
  const A = ((a + c) / 2) * h;
  return {
    title: 'Blumenbeet bepflanzen',
    badge: 'Anwendung',
    text: `Ein Beet hat die Form eines Trapezes mit den parallelen Seiten $${q(a, 'm')}$ und $${q(c, 'm')}$. Der Abstand der Seiten ist $${q(h, 'm')}$. Pro Quadratmeter werden $${k}$ Pflanzen gesetzt.`,
    figure: <TrapezFig a={a} c={c} h={h} la={L(a, 'm')} lc={L(c, 'm')} lh={L(h, 'm')} />,
    parts: [num('Fläche', A, 'm²', { q: 'a) Wie groß ist das Beet?' }), num('Pflanzen', Math.ceil(A * k), null, { integer: true, q: 'b) Wie viele Pflanzen werden benötigt (aufrunden)?' })],
    solution: [`a) $A = \\frac{a + c}{2} \\cdot h_a = \\frac{${q(a, 'm')} + ${q(c, 'm')}}{2} \\cdot ${q(h, 'm')} ${res(A, 'm²')}$`, `b) $${tx2(A)} \\cdot ${k} ${eq(A * k)} ${tx2(A * k)} \\;\\Rightarrow\\; ${Math.ceil(A * k)}$ Pflanzen`],
  };
};

// ---------------------------------------------------------------------------
// Kreis
// ---------------------------------------------------------------------------

const F_KREIS = ['u = 2 \\cdot r \\cdot \\pi', 'A = r^2 \\cdot \\pi', 'd = 2 \\cdot r'];

const kreisR: Gen = () => {
  const u = lenUnit();
  const r = rs(1.5, 15, 0.5);
  return {
    title: 'Kreis: Umfang und Fläche (Radius)',
    text: `Ein Kreis hat den Radius $r = ${q(r, u)}$. Berechne Umfang und Flächeninhalt.`,
    figure: <CircleFig lr={`r = ${L(r, u)}`} />,
    parts: [num('$u$', 2 * r * PI, u), num('$A$', r * r * PI, areaOf(u))],
    solution: [`$u = 2 \\cdot r \\cdot \\pi = 2 \\cdot ${q(r, u)} \\cdot \\pi ${res(2 * r * PI, u)}$`, `$A = r^2 \\cdot \\pi = (${q(r, u)})^2 \\cdot \\pi ${res(r * r * PI, areaOf(u))}$`],
  };
};

const kreisD: Gen = () => {
  const u = lenUnit();
  const d = ri(3, 30);
  const r = d / 2;
  return {
    title: 'Kreis: Umfang und Fläche (Durchmesser)',
    text: `Ein Kreis hat den Durchmesser $d = ${q(d, u)}$. Berechne Umfang und Flächeninhalt. **Achtung:** Zuerst den Radius bestimmen!`,
    figure: <CircleFig ld={`d = ${L(d, u)}`} />,
    parts: [num('$u$', 2 * r * PI, u), num('$A$', r * r * PI, areaOf(u))],
    solution: [`$r = \\frac{d}{2} = ${q(r, u)}$`, `$u = 2 \\cdot r \\cdot \\pi = 2 \\cdot ${q(r, u)} \\cdot \\pi ${res(2 * r * PI, u)}$`, `$A = r^2 \\cdot \\pi = (${q(r, u)})^2 \\cdot \\pi ${res(r * r * PI, areaOf(u))}$`],
  };
};

const kreisAusU: Gen = () => {
  const u = lenUnit();
  const r = rs(2, 20, 0.5);
  const U = round(2 * r * PI, 2);
  return {
    title: 'Kreis: Radius aus dem Umfang',
    text: `Ein Kreis hat den Umfang $u = ${q(U, u)}$. Berechne den Radius $r$ und den Durchmesser $d$.`,
    figure: <CircleFig lr="r = ?" />,
    parts: [num('$r$', U / (2 * PI), u), num('$d$', U / PI, u)],
    solution: [`$u = 2 \\cdot r \\cdot \\pi \\;\\Rightarrow\\; r = \\frac{u}{2 \\cdot \\pi} = \\frac{${q(U, u)}}{2 \\cdot \\pi} ${res(U / (2 * PI), u)}$`, `$d = 2 \\cdot r ${res(U / PI, u)}$`],
  };
};

const kreisAusA: Gen = () => {
  const u = lenUnit();
  const r = rs(2, 20, 0.5);
  const A = round(r * r * PI, 2);
  return {
    title: 'Kreis: Radius aus der Fläche',
    text: `Ein Kreis hat den Flächeninhalt $A = ${q(A, areaOf(u))}$. Berechne den Radius $r$.`,
    figure: <CircleFig lr="r = ?" />,
    parts: [num('$r$', Math.sqrt(A / PI), u)],
    solution: [`$A = r^2 \\cdot \\pi \\;\\Rightarrow\\; r = \\sqrt{\\frac{A}{\\pi}} = \\sqrt{\\frac{${q(A, areaOf(u))}}{\\pi}} ${res(Math.sqrt(A / PI), u)}$`],
  };
};

const halbkreis: Gen = () => {
  const u = lenUnit();
  const d = 2 * ri(2, 12);
  const r = d / 2;
  const els: El[] = [
    { t: 'poly', pts: ell([0, 0], 1, 1, 0, 180) },
    { t: 'side', a: [-1, 0], b: [1, 0], text: `d = ${L(d, u)}`, side: -1 },
  ];
  return {
    title: 'Halbkreis',
    text: `Ein Halbkreis hat den Durchmesser $d = ${q(d, u)}$. Berechne den Flächeninhalt und den Umfang (gebogene Linie **und** gerade Seite).`,
    figure: <Scene els={els} maxH={120} />,
    parts: [num('$A$', (r * r * PI) / 2, areaOf(u)), num('$u$', r * PI + d, u)],
    solution: [
      `$r = ${q(r, u)}$`,
      `$A = \\frac{r^2 \\cdot \\pi}{2} = \\frac{(${q(r, u)})^2 \\cdot \\pi}{2} ${res((r * r * PI) / 2, areaOf(u))}$`,
      `$u = \\frac{2 \\cdot r \\cdot \\pi}{2} + d = ${q(r, u)} \\cdot \\pi + ${q(d, u)} ${res(r * PI + d, u)}$`,
    ],
  };
};

const kreisring: Gen = () => {
  const u = lenUnit();
  const R = ri(5, 15);
  const r = ri(2, R - 2);
  const A = (R * R - r * r) * PI;
  return {
    title: 'Kreisring',
    text: `Ein Kreisring hat den Außenradius $r_a = ${q(R, u)}$ und den Innenradius $r_i = ${q(r, u)}$. Berechne die Fläche des Rings.`,
    figure: <RingFig R={R} r={r} lR={`r_a = ${L(R, u)}`} lr={`r_i = ${L(r, u)}`} />,
    parts: [num('$A$', A, areaOf(u))],
    solution: [`$A = r_a^2 \\cdot \\pi - r_i^2 \\cdot \\pi = (${q(R, u)})^2 \\cdot \\pi - (${q(r, u)})^2 \\cdot \\pi ${res(A, areaOf(u))}$`],
  };
};

const pizza: Gen = () => {
  const d = pick([24, 26, 28, 30, 32, 36]);
  const p = pick([7.5, 8.9, 9.5, 10.9, 12.5, 13.9]);
  const A = sq(d / 2) * PI;
  return {
    title: 'Pizza-Vergleich',
    badge: 'Anwendung',
    text: `Eine Pizza hat einen Durchmesser von $${q(d, 'cm')}$ und kostet $${q(p, '€')}$.`,
    figure: <CircleFig ld={L(d, 'cm')} fill={C.fill3} />,
    parts: [
      num('Fläche', A, 'cm²', { q: 'a) Wie groß ist die Pizza?' }),
      num('pro 1 €', A / p, 'cm²', { q: 'b) Wie viel Quadratzentimeter Pizza bekommt man für 1 €?' }),
    ],
    solution: [`a) $r = ${q(d / 2, 'cm')}$; $A = r^2 \\cdot \\pi = (${q(d / 2, 'cm')})^2 \\cdot \\pi ${res(A, 'cm²')}$`, `b) $${tx2(A)}\\,\\text{cm}^2 : ${p.toString().replace('.', '{,}')} ${res(A / p, 'cm²')}$ pro Euro`],
  };
};

const tischdecke: Gen = () => {
  const d = pick([0.9, 1.0, 1.1, 1.2, 1.4]);
  const ue = pick([0.1, 0.15, 0.2]);
  const pr = pick([0.85, 1.2, 1.5, 2.4]);
  const n = name();
  const R = d / 2 + ue;
  const U = 2 * R * PI;
  return {
    title: 'Runde Tischdecke',
    badge: 'Anwendung',
    text: `${n} näht für einen runden Tisch ($d = ${q(d, 'm')}$) eine Tischdecke, die rundherum $${q(ue * 100, 'cm')}$ überhängt. Am Rand wird eine Borte aufgenäht ($1\\,\\text{m}$ kostet $${q(pr, '€')}$).`,
    parts: [
      num('Stoff', R * R * PI, 'm²', { q: 'a) Wie viel Stoff hat die Tischdecke?' }),
      num('Borte', U, 'm', { q: 'b) Wie lang ist die Borte?' }),
      num('Kosten', U * pr, '€', { q: 'c) Was kostet die Borte?' }),
    ],
    solution: [
      `Radius der Decke: $r = ${q(d / 2, 'm')} + ${q(ue, 'm')} = ${q(R, 'm')}$`,
      `a) $A = r^2 \\cdot \\pi = (${q(R, 'm')})^2 \\cdot \\pi ${res(R * R * PI, 'm²')}$`,
      `b) $u = 2 \\cdot r \\cdot \\pi = 2 \\cdot ${q(R, 'm')} \\cdot \\pi ${res(U, 'm')}$`,
      `c) $${tx2(U)}\\,\\text{m} \\cdot ${q(pr, '€')} ${res(round(U, 2) * pr, '€')}$`,
    ],
  };
};

const fahrrad: Gen = () => {
  const d = pick([50, 56, 60, 64, 70]);
  const km = pick([1, 2, 3, 5]);
  const U = d * PI;
  return {
    title: 'Fahrradreifen',
    badge: 'Anwendung',
    text: `Ein Fahrradreifen hat einen Durchmesser von $${q(d, 'cm')}$. Wie oft dreht sich das Rad auf einer Strecke von $${q(km, 'km')}$?`,
    figure: <CircleFig ld={L(d, 'cm')} />,
    parts: [num('Umfang', U, 'cm', { q: 'a) Wie groß ist der Umfang des Rades?' }), num('Umdrehungen', Math.floor((km * 100000) / U), null, { q: 'b) Anzahl der vollen Umdrehungen:', tol: 1 })],
    solution: [
      `a) $u = 2 \\cdot r \\cdot \\pi = 2 \\cdot ${q(d / 2, 'cm')} \\cdot \\pi ${res(U, 'cm')}$`,
      `b) $${q(km, 'km')} = ${q(km * 100000, 'cm')}$`,
      `$${de(km * 100000)}\\,\\text{cm} : ${tx2(U)}\\,\\text{cm} \\approx ${tx2((km * 100000) / U)} \\;\\Rightarrow\\; ${Math.floor((km * 100000) / U)}$ volle Umdrehungen`,
    ],
  };
};

const uhrzeiger: Gen = () => {
  const l = pick([0.8, 1.2, 1.5, 2.1]);
  const U = 2 * l * PI;
  return {
    title: 'Rathausuhr',
    badge: 'Anwendung',
    text: `Der große Zeiger einer Rathausuhr ist $${q(l, 'm')}$ lang. Er dreht sich jede Stunde einmal ganz herum.`,
    figure: <CircleFig lr={L(l, 'm')} />,
    parts: [num('1 Runde', U, 'm', { q: 'a) Welchen Weg legt die Zeigerspitze in einer Stunde zurück?' }), num('1 Tag', 24 * U, 'm', { q: 'b) Welchen Weg legt sie an einem Tag zurück?' })],
    solution: [`a) $u = 2 \\cdot r \\cdot \\pi = 2 \\cdot ${q(l, 'm')} \\cdot \\pi ${res(U, 'm')}$`, `b) $24 \\cdot ${tx2(U)}\\,\\text{m} ${res(24 * U, 'm')}$`],
  };
};

const teichfolie: Gen = () => {
  const d = pick([4, 5, 6, 8, 10, 12]);
  const p = pick([4.5, 6.9, 8.5]);
  const A = sq(d / 2) * PI;
  const f = family();
  return {
    title: 'Teich abdecken',
    badge: 'Anwendung',
    text: `${f} deckt im Winter den kreisrunden Gartenteich ($d = ${q(d, 'm')}$) mit einer Folie ab. $1\\,\\text{m}^2$ Folie kostet $${q(p, '€')}$.`,
    figure: <CircleFig ld={L(d, 'm')} fill={C.water} />,
    parts: [num('Folie', A, 'm²', { q: 'a) Wie viel Folie wird benötigt?' }), num('Kosten', A * p, '€', { q: 'b) Was kostet die Folie?' })],
    solution: [`a) $r = ${q(d / 2, 'm')}$; $A = r^2 \\cdot \\pi = (${q(d / 2, 'm')})^2 \\cdot \\pi ${res(A, 'm²')}$`, `b) $${tx2(A)}\\,\\text{m}^2 \\cdot ${q(p, '€')} ${res(round(A, 2) * p, '€')}$`],
  };
};

// ---------------------------------------------------------------------------
// Zusammengesetzte Flächen
// ---------------------------------------------------------------------------

const F_ZUSAMMEN = ['\\text{Zerlegen in Grundfiguren}', 'A = a \\cdot b', 'A = \\frac{g \\cdot h}{2}', 'A = r^2 \\cdot \\pi', 'u = 2 \\cdot r \\cdot \\pi'];

const lForm: Gen = () => {
  const u = pick<UnitId>(['cm', 'm']);
  const W = ri(8, 14);
  const H = ri(6, 12);
  const w = ri(3, W - 3);
  const h = ri(2, H - 3);
  const ps: P[] = [[0, 0], [W, 0], [W, H - h], [W - w, H - h], [W - w, H], [0, H]];
  const c: P = [W / 3, H / 3];
  const els: El[] = [
    { t: 'poly', pts: ps },
    ...sl(ps[0], ps[1], `${W} ${u}`, c),
    ...sl(ps[1], ps[2], `${H - h} ${u}`, c),
    ...sl(ps[3], ps[2], `${w} ${u}`, [W, 0]),
    ...sl(ps[5], ps[0], `${H} ${u}`, c),
  ];
  const A = W * H - w * h;
  return {
    title: 'L-förmige Fläche',
    text: 'Berechne Flächeninhalt und Umfang der Figur (alle Ecken sind rechte Winkel).',
    figure: <Scene els={els} />,
    parts: [num('$A$', A, areaOf(u)), num('$u$', 2 * (W + H), u)],
    solution: [
      `Großes Rechteck minus fehlendes Rechteck: $A = ${W} \\cdot ${H} - ${w} \\cdot ${h} = ${W * H} - ${w * h} = ${q(A, areaOf(u))}$`,
      `Oben fehlt: $${H} - ${H - h} = ${h}$; oben links: $${W} - ${w} = ${W - w}$`,
      `$u = ${W} + ${H - h} + ${w} + ${h} + ${W - w} + ${H} = ${q(2 * (W + H), u)}$`,
    ],
  };
};

const rundbogenfenster: Gen = () => {
  const a = pick([60, 80, 100, 120]);
  const b = pick([80, 100, 120, 140]);
  const r = a / 2;
  const els: El[] = [
    { t: 'poly', pts: [[0, b], [0, 0], [a, 0], [a, b], ...ell([r, b], r, r, 0, 180)], fill: C.water },
    { t: 'line', pts: [[0, b], [a, b]], dash: true, stroke: C.gray },
    ...sl([0, 0], [a, 0], `${a} cm`, [r, b / 2]),
    ...sl([0, b], [0, 0], `${b} cm`, [r, b / 2]),
  ];
  const A = a * b + (r * r * PI) / 2;
  return {
    title: 'Rundbogenfenster',
    text: 'Ein Fenster besteht aus einem Rechteck mit einem aufgesetzten Halbkreis. Berechne die Glasfläche und die Länge des Rahmens (Umfang).',
    figure: <Scene els={els} />,
    parts: [num('$A$', A, 'cm²'), num('$u$', a + 2 * b + r * PI, 'cm')],
    solution: [
      `Rechteck: $A_1 = ${a} \\cdot ${b} = ${q(a * b, 'cm²')}$`,
      `Halbkreis: $r = ${q(r, 'cm')}$; $A_2 = \\frac{r^2 \\cdot \\pi}{2} ${res((r * r * PI) / 2, 'cm²')}$`,
      `$A = A_1 + A_2 ${res(A, 'cm²')}$`,
      `$u = ${a} + 2 \\cdot ${b} + \\frac{2 \\cdot ${r} \\cdot \\pi}{2} ${res(a + 2 * b + r * PI, 'cm')}$`,
    ],
  };
};

const hausFlaeche: Gen = () => {
  const a = rs(6, 12, 0.5);
  const b = rs(3, 6, 0.5);
  const hD = rs(2, 4.5, 0.5);
  const ps: P[] = [[0, 0], [a, 0], [a, b], [a / 2, b + hD], [0, b]];
  const c: P = [a / 2, b / 2];
  const els: El[] = [
    { t: 'poly', pts: ps, fill: C.fill3 },
    { t: 'line', pts: [[0, b], [a, b]], dash: true, stroke: C.gray },
    { t: 'line', pts: [[a / 2, b], [a / 2, b + hD]], dash: true, stroke: C.blue },
    { t: 'label', at: [a / 2, b + hD / 2], text: `${de(hD)} m`, dx: 6, anchor: 'start' },
    ...sl(ps[0], ps[1], `${de(a)} m`, c),
    ...sl(ps[4], ps[0], `${de(b)} m`, c),
  ];
  const A = a * b + (a * hD) / 2;
  return {
    title: 'Hauswand mit Giebel',
    text: 'Berechne die Fläche der Hauswand (Rechteck mit aufgesetztem Dreieck).',
    figure: <Scene els={els} />,
    parts: [num('$A$', A, 'm²')],
    solution: [`Rechteck: $A_1 = ${q(a, 'm')} \\cdot ${q(b, 'm')} = ${q(a * b, 'm²')}$`, `Dreieck: $A_2 = \\frac{${q(a, 'm')} \\cdot ${q(hD, 'm')}}{2} = ${q((a * hD) / 2, 'm²')}$`, `$A = A_1 + A_2 = ${q(A, 'm²')}$`],
  };
};

const rechteckLoch: Gen = () => {
  const a = ri(10, 20);
  const b = ri(8, 14);
  const r = ri(2, Math.floor(Math.min(a, b) / 2) - 1);
  const els: El[] = [
    { t: 'poly', pts: [[0, 0], [a, 0], [a, b], [0, b]] },
    { t: 'circle', c: [a / 2, b / 2], r, fill: '#ffffff' },
    { t: 'line', pts: [[a / 2, b / 2], [a / 2 + r, b / 2]], stroke: C.blue },
    { t: 'label', at: [a / 2 + r / 2, b / 2], text: `r = ${r} cm`, dy: -10 },
    ...sl([0, 0], [a, 0], `${a} cm`, [a / 2, b / 2]),
    ...sl([0, b], [0, 0], `${b} cm`, [a / 2, b / 2]),
  ];
  const A = a * b - r * r * PI;
  return {
    title: 'Platte mit rundem Loch',
    text: 'Aus einer rechteckigen Platte wird ein Kreis ausgeschnitten. Wie groß ist die Restfläche?',
    figure: <Scene els={els} />,
    parts: [num('$A$', A, 'cm²')],
    solution: [`$A = a \\cdot b - r^2 \\cdot \\pi = ${a} \\cdot ${b} - ${r}^2 \\cdot \\pi ${res(A, 'cm²')}$`],
  };
};

const stadion: Gen = () => {
  const l = ri(40, 100);
  const d = ri(20, 60);
  const r = d / 2;
  const els: El[] = [
    { t: 'poly', pts: [...ell([l, r], r, r, -90, 90), ...ell([0, r], r, r, 90, 270)], fill: C.green },
    { t: 'line', pts: [[0, 0], [0, d]], dash: true, stroke: C.gray },
    { t: 'line', pts: [[l, 0], [l, d]], dash: true, stroke: C.gray },
    ...sl([0, 0], [l, 0], `${l} m`, [l / 2, r]),
    { t: 'side', a: [l, d], b: [l, 0], text: `${d} m`, side: 1, off: 0 },
  ];
  const A = l * d + r * r * PI;
  const U = 2 * l + d * PI;
  return {
    title: 'Sportplatz',
    text: 'Ein Sportplatz besteht aus einem Rechteck und zwei Halbkreisen. Berechne die Rasenfläche und die Länge der Laufbahn (Umfang).',
    figure: <Scene els={els} />,
    parts: [num('$A$', A, 'm²'), num('$u$', U, 'm')],
    solution: [
      `Zwei Halbkreise ergeben einen ganzen Kreis mit $r = ${q(r, 'm')}$.`,
      `$A = ${l} \\cdot ${d} + ${de(r).replace(',', '{,}')}^2 \\cdot \\pi ${res(A, 'm²')}$`,
      `$u = 2 \\cdot ${l} + 2 \\cdot ${de(r).replace(',', '{,}')} \\cdot \\pi ${res(U, 'm')}$`,
    ],
  };
};

const brunnenWeg: Gen = () => {
  const d = pick([8, 10, 12, 14]);
  const w = pick([1.5, 2, 2.5, 3]);
  const R = d / 2 + w;
  const r = d / 2;
  const A = (R * R - r * r) * PI;
  return {
    title: 'Weg um den Brunnen',
    badge: 'Anwendung',
    text: `Um ein kreisrundes Wasserbecken ($d = ${q(d, 'm')}$) wird ein $${q(w, 'm')}$ breiter Kiesweg angelegt. Wie groß ist die Fläche des Weges?`,
    figure: <RingFig R={R} r={r} lR={`r_a = ${de(R)} m`} lr={`r_i = ${de(r)} m`} />,
    parts: [num('Weg', A, 'm²')],
    solution: [`$r_i = ${q(r, 'm')}$; $r_a = ${q(r, 'm')} + ${q(w, 'm')} = ${q(R, 'm')}$`, `$A = r_a^2 \\cdot \\pi - r_i^2 \\cdot \\pi ${res(A, 'm²')}$`],
  };
};

const terrasse: Gen = () => {
  const a = rs(4, 7, 0.5);
  const b = rs(3, 5, 0.5);
  const r = round(Math.min(a, b) * 0.6, 1);
  // Rechteck a×b, rechts unten ein Viertelkreis mit Radius r
  const pts: P[] = [[0, 0], [a, 0], ...ell([a, 0], r, r, 0, 90), [a, b], [0, b]];
  const els: El[] = [
    { t: 'poly', pts, fill: C.fill3 },
    { t: 'line', pts: [[a, 0], [a, r]], dash: true, stroke: C.gray },
    ...sl([0, 0], [a, 0], `${de(a)} m`, [a / 2, b / 2]),
    ...sl([0, b], [0, 0], `${de(b)} m`, [a / 2, b / 2]),
    { t: 'side', a: [a, 0], b: [a + r, 0], text: `r = ${de(r)} m`, side: -1 },
  ];
  const A = a * b + (r * r * PI) / 4;
  const U = a + r + (2 * r * PI) / 4 + (b - r) + a + b;
  const pr = pick([42, 55, 68]);
  return {
    title: 'Neue Terrasse',
    badge: 'Anwendung',
    text: `${family()} gestaltet die Terrasse neu (siehe Skizze: Rechteck mit Viertelkreis). Sie wird mit Platten ausgelegt ($1\\,\\text{m}^2$ kostet $${q(pr, '€')}$) und rundherum mit Kantensteinen eingefasst.`,
    figure: <Scene els={els} />,
    parts: [
      num('Fläche', A, 'm²', { q: 'a) Wie groß ist die Terrasse?' }),
      num('Kosten', A * pr, '€', { q: 'b) Was kosten die Platten?' }),
      num('Kantensteine', U, 'm', { q: 'c) Wie viel Meter Kantensteine werden benötigt?' }),
    ],
    solution: [
      `a) $A = a \\cdot b + \\frac{r^2 \\cdot \\pi}{4} = ${q(a, 'm')} \\cdot ${q(b, 'm')} + \\frac{(${q(r, 'm')})^2 \\cdot \\pi}{4} ${res(A, 'm²')}$`,
      `b) $${tx2(A)}\\,\\text{m}^2 \\cdot ${q(pr, '€')} ${res(round(A, 2) * pr, '€')}$`,
      `c) Viertelkreisbogen: $\\frac{2 \\cdot ${q(r, 'm')} \\cdot \\pi}{4} ${res((2 * r * PI) / 4, 'm')}$`,
      `$u = ${q(a, 'm')} + ${q(r, 'm')} + ${tx2((2 * r * PI) / 4)}\\,\\text{m} + ${q(b - r, 'm')} + ${q(a, 'm')} + ${q(b, 'm')} ${res(U, 'm')}$`,
    ],
  };
};

const fassade: Gen = () => {
  const a = rs(8, 12, 0.5);
  const b = rs(4, 6, 0.5);
  const hD = rs(2.5, 4, 0.5);
  const nF = ri(2, 4);
  const fw = 1.2;
  const fh = 1.4;
  const p = pick([10.5, 12.8, 15]);
  const A = a * b + (a * hD) / 2 - nF * fw * fh;
  return {
    title: 'Fassade streichen',
    badge: 'Anwendung',
    text: `Die Vorderseite eines Ferienhauses ist ein Rechteck ($${q(a, 'm')}$ breit, $${q(b, 'm')}$ hoch) mit einem dreieckigen Giebel ($${q(hD, 'm')}$ hoch). In der Wand sind $${nF}$ Fenster mit je $${q(fw, 'm')}$ × $${q(fh, 'm')}$. Der Anstrich kostet $${q(p, '€')}$ pro $\\text{m}^2$.`,
    parts: [num('Fläche', A, 'm²', { q: 'a) Wie groß ist die zu streichende Fläche?' }), num('Kosten', A * p, '€', { q: 'b) Wie hoch ist der Rechnungsbetrag?' })],
    solution: [
      `Rechteck: $${q(a, 'm')} \\cdot ${q(b, 'm')} = ${q(a * b, 'm²')}$; Giebel: $\\frac{${q(a, 'm')} \\cdot ${q(hD, 'm')}}{2} = ${q((a * hD) / 2, 'm²')}$`,
      `Fenster: $${nF} \\cdot ${q(fw, 'm')} \\cdot ${q(fh, 'm')} = ${q(nF * fw * fh, 'm²')}$`,
      `a) $A = ${q(a * b, 'm²')} + ${q((a * hD) / 2, 'm²')} - ${q(nF * fw * fh, 'm²')} = ${q(A, 'm²')}$`,
      `b) $${q(A, 'm²')} \\cdot ${q(p, '€')} ${res(A * p, '€')}$`,
    ],
  };
};

const ringstrasse: Gen = () => {
  const D = pick([120, 150, 170, 200]);
  const w = pick([10, 12, 13, 15]);
  const r = D / 2 - w;
  return {
    title: 'Platz mit Ringstraße',
    badge: 'Anwendung',
    text: `Ein kreisrunder Platz hat einschließlich einer $${q(w, 'm')}$ breiten Ringstraße einen Durchmesser von $${q(D, 'm')}$. Berechne die Fläche des Platzes ohne Straße (innen) und die Fläche der Straße.`,
    figure: <RingFig R={D / 2} r={r} lR={`${D / 2} m`} lr="?" />,
    parts: [num('Platz innen', r * r * PI, 'm²'), num('Straße', (sq(D / 2) - r * r) * PI, 'm²')],
    solution: [
      `Innenradius: $r = ${q(D / 2, 'm')} - ${q(w, 'm')} = ${q(r, 'm')}$`,
      `Platz innen: $A = r^2 \\cdot \\pi = ${r}^2 \\cdot \\pi ${res(r * r * PI, 'm²')}$`,
      `Straße: $A = ${D / 2}^2 \\cdot \\pi - ${r}^2 \\cdot \\pi ${res((sq(D / 2) - r * r) * PI, 'm²')}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Seiten
// ---------------------------------------------------------------------------

const RECHTECK_GENS = [rechteckUA, rechteckGemischteEinheiten, quadratUA, rechteckSeiteAusA, rechteckSeiteAusU, quadratSeiteAusA, rechteckDiagonale];
const RECHTECK_APPS = [teppich, platten, zaun, glaser, wandStreichen];
const DREIECK_GENS = [dreieckA, dreieckUA, dreieckH, dreieckRechtwinklig, dreieckGleichseitig, dreieckArt];
const DREIECK_APPS = [giebel, turmdach, segel];
const PARA_GENS = [paraUA, paraH, paraA, paraB];
const PARA_APPS = [paraGrundstueck];
const RAUTE_GENS = [rauteEF, rauteSeite, rauteAH, rauteF];
const RAUTE_APPS = [drachen];
const TRAPEZ_GENS = [trapezA, trapezM, trapezU, trapezH, trapezC];
const TRAPEZ_APPS = [giebelfenster, trapezBeet];
const KREIS_GENS = [kreisR, kreisD, kreisAusU, kreisAusA, halbkreis, kreisring];
const KREIS_APPS = [pizza, tischdecke, fahrrad, uhrzeiger, teichfolie];
const ZUS_GENS = [lForm, rundbogenfenster, hausFlaeche, rechteckLoch, stadion];
const ZUS_APPS = [brunnenWeg, terrasse, fassade, ringstrasse];

export const ALL_FLAECHE_APPS = [...RECHTECK_APPS, ...DREIECK_APPS, ...PARA_APPS, ...RAUTE_APPS, ...TRAPEZ_APPS, ...KREIS_APPS, ...ZUS_APPS];

const pages: PracticeConfig[] = [
  {
    slug: 'rechteck',
    title: 'Rechteck und Quadrat',
    description: 'Umfang, Fläche, fehlende Seiten',
    formulas: [...F_RECHTECK, ...F_QUADRAT.slice(0, 2)],
    example: {
      title: 'Rechteck mit a = 8 cm und b = 5 cm',
      text: 'Ein Rechteck ist $8\\,\\text{cm}$ lang und $5\\,\\text{cm}$ breit. Wie groß sind Umfang und Flächeninhalt?',
      figure: <RectFig a={8} b={5} la="a = 8 cm" lb="b = 5 cm" />,
      steps: [
        'Umfang (Strecke rundherum): $u = 2 \\cdot (a + b) = 2 \\cdot (8\\,\\text{cm} + 5\\,\\text{cm}) = 26\\,\\text{cm}$',
        'Flächeninhalt: $A = a \\cdot b = 8\\,\\text{cm} \\cdot 5\\,\\text{cm} = 40\\,\\text{cm}^2$',
      ],
      tip: 'Der **Umfang** ist eine Länge (cm, m), der **Flächeninhalt** hat immer eine Flächeneinheit (cm², m²). Sind verschiedene Einheiten gegeben, rechne zuerst um!',
    },
    gens: RECHTECK_GENS,
    apps: RECHTECK_APPS,
  },
  {
    slug: 'dreiecke',
    title: 'Dreiecke',
    description: 'Fläche, Umfang, Höhe, Dreiecksarten',
    formulas: F_DREIECK,
    example: {
      title: 'Dreieck mit g = 10 cm und h = 6 cm',
      text: 'Ein Dreieck hat die Grundlinie $g = 10\\,\\text{cm}$ und die Höhe $h = 6\\,\\text{cm}$.',
      figure: <TriFig g={10} h={6} t={0.35} lg="g = 10 cm" lh="h = 6 cm" />,
      steps: ['$A = \\frac{g \\cdot h}{2} = \\frac{10\\,\\text{cm} \\cdot 6\\,\\text{cm}}{2} = \\frac{60\\,\\text{cm}^2}{2} = 30\\,\\text{cm}^2$'],
      tip: 'Die Höhe steht immer **senkrecht** auf der Grundlinie. Ein Dreieck ist genau die Hälfte eines Rechtecks mit $g$ und $h$.',
    },
    gens: DREIECK_GENS,
    apps: DREIECK_APPS,
  },
  {
    slug: 'parallelogramm',
    title: 'Parallelogramm',
    description: 'Fläche, Umfang, Höhe',
    formulas: F_PARA,
    example: {
      title: 'Parallelogramm mit a = 9 m und h_a = 4 m',
      text: 'Ein Parallelogramm hat die Seiten $a = 9\\,\\text{m}$, $b = 5\\,\\text{m}$ und die Höhe $h_a = 4\\,\\text{m}$.',
      figure: <ParaFig a={9} h={4} shift={0.33} la="a = 9 m" lb="b = 5 m" lh="h_a = 4 m" />,
      steps: ['$A = a \\cdot h_a = 9\\,\\text{m} \\cdot 4\\,\\text{m} = 36\\,\\text{m}^2$', '$u = 2 \\cdot (a + b) = 2 \\cdot (9\\,\\text{m} + 5\\,\\text{m}) = 28\\,\\text{m}$'],
      tip: 'Achtung: Für die Fläche brauchst du die **Höhe** $h_a$, nicht die schräge Seite $b$!',
    },
    gens: PARA_GENS,
    apps: PARA_APPS,
    nBasic: 5,
    nApp: 1,
  },
  {
    slug: 'raute',
    title: 'Raute',
    description: 'Fläche mit Diagonalen oder Höhe',
    formulas: F_RAUTE,
    example: {
      title: 'Raute mit e = 8 cm und f = 6 cm',
      text: 'Eine Raute hat die Diagonalen $e = 8\\,\\text{cm}$ und $f = 6\\,\\text{cm}$.',
      figure: <RauteFig e={8} f={6} le="e = 8 cm" lf="f = 6 cm" la="a" />,
      steps: [
        '$A = \\frac{e \\cdot f}{2} = \\frac{8\\,\\text{cm} \\cdot 6\\,\\text{cm}}{2} = 24\\,\\text{cm}^2$',
        '$a = \\frac{\\sqrt{e^2 + f^2}}{2} = \\frac{\\sqrt{64 + 36}}{2}\\,\\text{cm} = \\frac{10}{2}\\,\\text{cm} = 5\\,\\text{cm}$',
        '$u = 4 \\cdot a = 4 \\cdot 5\\,\\text{cm} = 20\\,\\text{cm}$',
      ],
    },
    gens: RAUTE_GENS,
    apps: RAUTE_APPS,
    nBasic: 5,
    nApp: 1,
  },
  {
    slug: 'trapez',
    title: 'Trapez',
    description: 'Fläche, Umfang, Höhe und Seiten',
    formulas: F_TRAPEZ,
    example: {
      title: 'Trapez mit a = 10 m, c = 6 m, h = 4 m',
      text: 'Ein Trapez hat die parallelen Seiten $a = 10\\,\\text{m}$ und $c = 6\\,\\text{m}$, die Höhe ist $h_a = 4\\,\\text{m}$.',
      figure: <TrapezFig a={10} c={6} h={4} la="a = 10 m" lc="c = 6 m" lh="h_a = 4 m" />,
      steps: ['Mittellinie: $m = \\frac{a + c}{2} = \\frac{10\\,\\text{m} + 6\\,\\text{m}}{2} = 8\\,\\text{m}$', '$A = m \\cdot h_a = 8\\,\\text{m} \\cdot 4\\,\\text{m} = 32\\,\\text{m}^2$'],
    },
    gens: TRAPEZ_GENS,
    apps: TRAPEZ_APPS,
  },
  {
    slug: 'kreis',
    title: 'Kreis',
    description: 'Umfang, Fläche, Radius',
    formulas: F_KREIS,
    example: {
      title: 'Kreis mit d = 10 cm',
      text: 'Ein Kreis hat den Durchmesser $d = 10\\,\\text{cm}$.',
      figure: <CircleFig ld="d = 10 cm" />,
      steps: [
        'Radius: $r = \\frac{d}{2} = 5\\,\\text{cm}$',
        '$u = 2 \\cdot r \\cdot \\pi = 2 \\cdot 5\\,\\text{cm} \\cdot \\pi \\approx 31{,}42\\,\\text{cm}$',
        '$A = r^2 \\cdot \\pi = (5\\,\\text{cm})^2 \\cdot \\pi \\approx 78{,}54\\,\\text{cm}^2$',
      ],
      tip: 'Nutze die $\\pi$-Taste des Taschenrechners und runde erst das Ergebnis auf zwei Nachkommastellen. Ist der Durchmesser gegeben, berechne zuerst den Radius!',
    },
    gens: KREIS_GENS,
    apps: KREIS_APPS,
  },
  {
    slug: 'zusammengesetzte-flaechen',
    title: 'Zusammengesetzte Flächen',
    description: 'Figuren zerlegen und ergänzen',
    formulas: F_ZUSAMMEN,
    example: {
      title: 'Rechteck mit Halbkreis',
      text: 'Ein Beet besteht aus einem Rechteck ($6\\,\\text{m}$ × $4\\,\\text{m}$) und einem Halbkreis an der kurzen Seite.',
      figure: (
        <Scene
          els={[
            { t: 'poly', pts: [[0, 0], [6, 0], ...ell([6, 2], 2, 2, -90, 90), [0, 4]], fill: C.green },
            { t: 'line', pts: [[6, 0], [6, 4]], dash: true, stroke: C.gray },
            { t: 'side', a: [0, 0], b: [6, 0], text: '6 m', side: -1 },
            { t: 'side', a: [0, 4], b: [0, 0], text: '4 m', side: -1 },
          ]}
        />
      ),
      steps: [
        'Zerlegen: Rechteck + Halbkreis mit $r = 4\\,\\text{m} : 2 = 2\\,\\text{m}$',
        'Rechteck: $A_1 = 6\\,\\text{m} \\cdot 4\\,\\text{m} = 24\\,\\text{m}^2$',
        'Halbkreis: $A_2 = \\frac{r^2 \\cdot \\pi}{2} = \\frac{(2\\,\\text{m})^2 \\cdot \\pi}{2} \\approx 6{,}28\\,\\text{m}^2$',
        'Gesamt: $A = A_1 + A_2 \\approx 30{,}28\\,\\text{m}^2$',
      ],
      tip: 'Beim Umfang zählen nur die **äußeren** Linien – innere Hilfslinien (gestrichelt) gehören nicht dazu.',
    },
    gens: ZUS_GENS,
    apps: ZUS_APPS,
  },
  {
    slug: 'gemischte-aufgaben',
    title: 'Gemischte Übungsaufgaben',
    description: 'Alle Flächen bunt gemischt',
    formulas: ['A = a \\cdot b', 'A = \\frac{g \\cdot h}{2}', 'A = a \\cdot h_a', 'A = \\frac{e \\cdot f}{2}', 'A = \\frac{a + c}{2} \\cdot h_a', 'A = r^2 \\cdot \\pi', 'u = 2 \\cdot r \\cdot \\pi'],
    example: {
      title: 'Erst die Figur erkennen, dann die Formel wählen',
      text: 'Gehe bei jeder Aufgabe in drei Schritten vor:',
      steps: [
        '1. Figur erkennen und Formel aus der Merkhilfe aufschreiben.',
        '2. Gegebene Werte einsetzen – Einheiten vorher angleichen!',
        '3. Ausrechnen, auf zwei Nachkommastellen runden und die passende Einheit wählen.',
      ],
      tip: 'Strecke/Umfang → cm, m · Fläche → cm², m² · Geld → €',
    },
    gens: [...RECHTECK_GENS, ...DREIECK_GENS, ...PARA_GENS, ...RAUTE_GENS, ...TRAPEZ_GENS, ...KREIS_GENS, ...ZUS_GENS],
    apps: ALL_FLAECHE_APPS,
    nBasic: 6,
    nApp: 2,
  },
  {
    slug: 'anwendungs-uebungsaufgaben',
    title: 'Anwendungsaufgaben Flächen',
    description: 'Praxisnahe Aufgaben aus dem Alltag',
    example: {
      title: 'So löst du eine Textaufgabe',
      text: 'Ein Zimmer ist $4{,}5\\,\\text{m}$ lang und $3{,}2\\,\\text{m}$ breit. Wie viel kostet ein Teppich, wenn $1\\,\\text{m}^2$ $20\\,€$ kostet?',
      steps: [
        'Was ist gesucht? → Kosten für die **Fläche** des Bodens.',
        'Formel: $A = a \\cdot b = 4{,}5\\,\\text{m} \\cdot 3{,}2\\,\\text{m} = 14{,}4\\,\\text{m}^2$',
        'Kosten: $14{,}4\\,\\text{m}^2 \\cdot 20\\,€ = 288\\,€$',
      ],
      tip: 'Antworte immer mit der passenden Einheit (m², m, €, Stück).',
    },
    gens: [],
    apps: ALL_FLAECHE_APPS,
    fixed: examsFor('flaeche'),
    nBasic: 0,
    nApp: 5,
    nFixed: 1,
  },
];

export const flaechengeometrie: TopicConfig = {
  slug: 'flaechengeometrie',
  title: 'Flächengeometrie',
  description: 'Dreiecke, Vierecke, Kreis und zusammengesetzte Flächen',
  icon: 'ruler',
  pages,
};

// Für andere Themen (gemischte Anwendungen)
export const FLAECHE_GENS = { kreisR, kreisD, rechteckUA, dreieckA, trapezA };
