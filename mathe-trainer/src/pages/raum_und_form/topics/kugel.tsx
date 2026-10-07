import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, tx, PI, type UnitId } from '../engine/util';
import { KugelFig } from '../figures/shapes';
import { areaOf, lenUnit, name, num, res, volOf } from './helpers';
import { examsFor } from './pruefung';

const F_KUGEL = ['O = 4 \\cdot r^2 \\cdot \\pi', 'V = \\frac{4}{3} \\cdot r^3 \\cdot \\pi', 'd = 2 \\cdot r'];
const V = (r: number) => (4 / 3) * r ** 3 * PI;
const O = (r: number) => 4 * r * r * PI;

const kugelV: Gen = () => {
  const u = lenUnit();
  const r = rs(1.5, 12, 0.5);
  return {
    title: 'Kugel: Volumen',
    text: `Eine Kugel hat den Radius $r = ${q(r, u)}$. Berechne ihr Volumen.`,
    figure: <KugelFig lr={`r = ${de(r)} ${u}`} />,
    parts: [num('$V$', V(r), volOf(u))],
    solution: [`$V = \\frac{4}{3} \\cdot r^3 \\cdot \\pi = \\frac{4}{3} \\cdot (${q(r, u)})^3 \\cdot \\pi ${res(V(r), volOf(u))}$`],
  };
};

const kugelVd: Gen = () => {
  const u = lenUnit();
  const d = ri(3, 30);
  const r = d / 2;
  return {
    title: 'Kugel: Volumen aus dem Durchmesser',
    text: `Eine Kugel hat den Durchmesser $d = ${q(d, u)}$. Berechne ihr Volumen.`,
    figure: <KugelFig ld={`d = ${d} ${u}`} />,
    parts: [num('$V$', V(r), volOf(u))],
    solution: [`$r = \\frac{d}{2} = ${q(r, u)}$`, `$V = \\frac{4}{3} \\cdot (${q(r, u)})^3 \\cdot \\pi ${res(V(r), volOf(u))}$`],
  };
};

const kugelO: Gen = () => {
  const u = lenUnit();
  const r = rs(1.5, 12, 0.5);
  return {
    title: 'Kugel: Oberfläche',
    text: `Eine Kugel hat den Radius $r = ${q(r, u)}$. Berechne ihre Oberfläche.`,
    figure: <KugelFig lr={`r = ${de(r)} ${u}`} />,
    parts: [num('$O$', O(r), areaOf(u))],
    solution: [`$O = 4 \\cdot r^2 \\cdot \\pi = 4 \\cdot (${q(r, u)})^2 \\cdot \\pi ${res(O(r), areaOf(u))}$`],
  };
};

const kugelOV: Gen = () => {
  const u = lenUnit();
  const d = ri(4, 30);
  const r = d / 2;
  return {
    title: 'Kugel: Oberfläche und Volumen',
    text: `Eine Kugel hat den Durchmesser $d = ${q(d, u)}$. Berechne Oberfläche und Volumen.`,
    figure: <KugelFig ld={`d = ${d} ${u}`} />,
    parts: [num('$O$', O(r), areaOf(u)), num('$V$', V(r), volOf(u))],
    solution: [`$r = ${q(r, u)}$`, `$O = 4 \\cdot r^2 \\cdot \\pi ${res(O(r), areaOf(u))}$`, `$V = \\frac{4}{3} \\cdot r^3 \\cdot \\pi ${res(V(r), volOf(u))}$`],
  };
};

const rAusO: Gen = () => {
  const u = lenUnit();
  const r = rs(2, 15, 0.5);
  const Ov = round(O(r), 2);
  return {
    title: 'Radius aus der Oberfläche',
    text: `Eine Kugel hat die Oberfläche $O = ${q(Ov, areaOf(u))}$. Berechne Radius und Durchmesser.`,
    figure: <KugelFig lr="r = ?" />,
    parts: [num('$r$', Math.sqrt(Ov / (4 * PI)), u), num('$d$', 2 * Math.sqrt(Ov / (4 * PI)), u)],
    solution: [
      `$O = 4 \\cdot r^2 \\cdot \\pi \\quad | : (4 \\cdot \\pi) \\quad | \\sqrt{\\;}$`,
      `$r = \\sqrt{\\frac{O}{4 \\cdot \\pi}} = \\sqrt{\\frac{${tx(Ov)}}{4 \\cdot \\pi}} ${res(Math.sqrt(Ov / (4 * PI)), u)}$`,
      `$d = 2 \\cdot r ${res(2 * Math.sqrt(Ov / (4 * PI)), u)}$`,
    ],
  };
};

const rAusV: Gen = () => {
  const u = lenUnit();
  const r = rs(2, 15, 0.5);
  const Vv = round(V(r), 2);
  const rr = Math.cbrt((3 * Vv) / (4 * PI));
  return {
    title: 'Radius aus dem Volumen',
    text: `Eine Kugel hat das Volumen $V = ${q(Vv, volOf(u))}$. Berechne den Radius.`,
    figure: <KugelFig lr="r = ?" />,
    parts: [num('$r$', rr, u)],
    solution: [
      `$V = \\frac{4}{3} \\cdot r^3 \\cdot \\pi \\quad | \\cdot 3 \\quad | : (4 \\cdot \\pi) \\quad | \\sqrt[3]{\\;}$`,
      `$r = \\sqrt[3]{\\frac{3 \\cdot V}{4 \\cdot \\pi}} = \\sqrt[3]{\\frac{3 \\cdot ${tx(Vv)}}{4 \\cdot \\pi}} ${res(rr, u)}$`,
    ],
  };
};

const OausV: Gen = () => {
  const u: UnitId = pick(['cm', 'dm', 'm']);
  const Vv = pick([500, 1000, 2500, 5000, 50000]);
  const r = Math.cbrt((3 * Vv) / (4 * PI));
  return {
    title: 'Oberfläche aus dem Volumen',
    text: `Das Volumen einer Kugel beträgt $${q(Vv, volOf(u))}$. Berechne zuerst den Radius und dann die Oberfläche.`,
    figure: <KugelFig lr="r" />,
    parts: [num('$r$', r, u), num('$O$', O(round(r, 2)), areaOf(u), { tol: O(r) * 0.01 })],
    solution: [`$r = \\sqrt[3]{\\frac{3 \\cdot ${tx(Vv)}}{4 \\cdot \\pi}} ${res(r, u)}$`, `$O = 4 \\cdot (${q(round(r, 2), u)})^2 \\cdot \\pi ${res(O(round(r, 2)), areaOf(u))}$`],
  };
};

const halbkugel: Gen = () => {
  const u = lenUnit();
  const r = rs(2, 12, 0.5);
  return {
    title: 'Halbkugel',
    text: `Eine massive Halbkugel hat den Radius $r = ${q(r, u)}$. Berechne ihr Volumen und ihre gesamte Oberfläche (gewölbte Fläche **und** ebene Kreisfläche).`,
    figure: <KugelFig half lr={`r = ${de(r)} ${u}`} />,
    parts: [num('$V$', V(r) / 2, volOf(u)), num('$O$', O(r) / 2 + r * r * PI, areaOf(u))],
    solution: [
      `$V = \\frac{1}{2} \\cdot \\frac{4}{3} \\cdot r^3 \\cdot \\pi ${res(V(r) / 2, volOf(u))}$`,
      `gewölbt: $\\frac{1}{2} \\cdot 4 \\cdot r^2 \\cdot \\pi ${res(O(r) / 2, areaOf(u))}$; Kreis: $r^2 \\cdot \\pi ${res(r * r * PI, areaOf(u))}$`,
      `$O ${res(O(r) / 2 + r * r * PI, areaOf(u))}$`,
    ],
  };
};

// Anwendungen
const baellebad: Gen = () => {
  const l = pick([1.5, 2, 2.5]);
  const b = pick([1.2, 1.5, 2]);
  const h = pick([0.4, 0.5, 0.6]);
  const rc = pick([3, 3.5, 4, 5]);
  const r = rc / 100;
  const Vb = l * b * h;
  const n = Vb / V(r);
  return {
    title: 'Bällebad füllen',
    badge: 'Anwendung',
    text: `${name()} möchte ein Bällebad ($${q(l, 'm')}$ × $${q(b, 'm')}$, $${q(h, 'm')}$ hoch) mit Bällen füllen. Jeder Ball hat einen Radius von $${q(rc, 'cm')}$. (Die Lücken zwischen den Bällen werden vernachlässigt.)`,
    parts: [
      num('Becken', Vb, 'm³', { q: 'a) Wie groß ist das Volumen des Beckens?' }),
      num('ein Ball', V(rc), 'cm³', { q: 'b) Wie groß ist das Volumen eines Balls?' }),
      num('Anzahl', Math.round(n), null, { q: 'c) Wie viele Bälle passen ungefähr hinein?', tol: n * 0.02 }),
    ],
    solution: [
      `a) $V = ${q(l, 'm')} \\cdot ${q(b, 'm')} \\cdot ${q(h, 'm')} ${res(Vb, 'm³')}$`,
      `b) $V = \\frac{4}{3} \\cdot (${q(rc, 'cm')})^3 \\cdot \\pi ${res(V(rc), 'cm³')}$`,
      `c) Einheiten angleichen: $${q(Vb, 'm³')} = ${q(Vb * 1e6, 'cm³')}$`,
      `$${de(Vb * 1e6)} : ${tx(round(V(rc), 2))} \\approx ${de(Math.round(n), 0)}$ Bälle`,
    ],
  };
};

const strandball: Gen = () => {
  const d = pick([50, 60, 75, 85]);
  const r = d / 2;
  return {
    title: 'Strandball',
    badge: 'Anwendung',
    text: `Ein Strandball hat einen Durchmesser von $${q(d, 'cm')}$ und besteht aus sechs gleich großen Farbfeldern.`,
    figure: <KugelFig ld={`${d} cm`} />,
    parts: [
      num('Farbfeld', O(r) / 6, 'cm²', { q: 'a) Wie groß ist ein Farbfeld?' }),
      num('Luft', V(r / 10), 'l', { q: 'b) Wie viel Liter Luft enthält der Ball?', strict: true }),
    ],
    solution: [
      `a) $O = 4 \\cdot (${q(r, 'cm')})^2 \\cdot \\pi ${res(O(r), 'cm²')}$; $: 6 ${res(O(r) / 6, 'cm²')}$`,
      `b) Für Liter in dm rechnen: $r = ${q(r / 10, 'dm')}$`,
      `$V = \\frac{4}{3} \\cdot (${q(r / 10, 'dm')})^3 \\cdot \\pi ${res(V(r / 10), 'dm³')} = ${tx(V(r / 10))}\\,\\text{l}$`,
    ],
  };
};

const handball: Gen = () => {
  const U = pick([54, 55, 58, 59]);
  const vs = pick([15, 20, 25]);
  const r = U / (2 * PI);
  return {
    title: 'Leder für einen Handball',
    badge: 'Anwendung',
    text: `Die Größe eines Handballs wird über den Umfang angegeben. Ein Ball hat einen Umfang von $${q(U, 'cm')}$. Für die Herstellung rechnet man mit $${vs}\\,\\%$ Verschnitt.`,
    parts: [
      num('$r$', r, 'cm', { q: 'a) Berechne den Radius.' }),
      num('Leder', O(r), 'cm²', { q: 'b) Wie viel Leder ist ohne Verschnitt nötig?', tol: O(r) * 0.01 }),
      num('mit Verschnitt', O(r) * (1 + vs / 100), 'cm²', { q: 'c) Wie viel Leder ist mit Verschnitt nötig?', tol: O(r) * 0.012 }),
    ],
    solution: [
      `a) $u = 2 \\cdot r \\cdot \\pi \\;\\Rightarrow\\; r = \\frac{${U}}{2 \\cdot \\pi} ${res(r, 'cm')}$`,
      `b) $O = 4 \\cdot r^2 \\cdot \\pi ${res(O(r), 'cm²')}$`,
      `c) $${tx(round(O(r), 2))} \\cdot 1{,}${vs} ${res(O(r) * (1 + vs / 100), 'cm²')}$`,
    ],
  };
};

const bank: Gen = () => {
  const r = pick([1.5, 2, 2.5, 3]);
  const p = pick([1.25, 2.5, 3.8]);
  return {
    title: 'Sitzbank als Halbkugel',
    badge: 'Anwendung',
    text: `Auf einem Spielplatz wird eine Sitzgelegenheit in Form einer Halbkugel ($r = ${q(r, 'm')}$) aus Beton gegossen. Die gewölbte Fläche wird mit wetterfester Farbe gestrichen ($${q(p, '€')}$ pro $\\text{m}^2$).`,
    figure: <KugelFig half lr={`${de(r)} m`} />,
    parts: [num('Beton', V(r) / 2, 'm³', { q: 'a) Wie viel Beton wird benötigt?' }), num('Farbe', (O(r) / 2) * p, '€', { q: 'b) Was kostet die Farbe?' })],
    solution: [`a) $V = \\frac{1}{2} \\cdot \\frac{4}{3} \\cdot (${q(r, 'm')})^3 \\cdot \\pi ${res(V(r) / 2, 'm³')}$`, `b) $\\frac{1}{2} \\cdot 4 \\cdot (${q(r, 'm')})^2 \\cdot \\pi ${res(O(r) / 2, 'm²')}$; $\\cdot ${q(p, '€')} ${res((O(r) / 2) * p, '€')}$`],
  };
};

const eiskugeln: Gen = () => {
  const l = pick([4, 5, 6]);
  const d = pick([5, 6, 7]);
  const n = Math.floor((l * 1000) / V(d / 2));
  return {
    title: 'Eiskugeln portionieren',
    badge: 'Anwendung',
    text: `Ein Eisbehälter fasst $${q(l, 'l')}$ Eis. Ein Portionierer formt Kugeln mit $${q(d, 'cm')}$ Durchmesser. Wie viele **ganze** Kugeln erhält man aus einem vollen Behälter?`,
    parts: [num('Kugeln', n, null, { integer: true })],
    solution: [`$V_{Kugel} = \\frac{4}{3} \\cdot (${q(d / 2, 'cm')})^3 \\cdot \\pi ${res(V(d / 2), 'cm³')}$`, `$${q(l, 'l')} = ${q(l * 1000, 'cm³')}$`, `$${de(l * 1000)} : ${tx(round(V(d / 2), 2))} \\approx ${tx((l * 1000) / V(d / 2))}$ → $${n}$ Kugeln`],
  };
};

const orange: Gen = () => {
  const r = rs(3.5, 5, 0.1);
  const Ov = round(O(r), 2);
  return {
    title: 'Wie groß ist die Orange?',
    badge: 'Anwendung',
    text: `Die Schale einer kugelrunden Orange hat eine Fläche von $${q(Ov, 'cm²')}$. Berechne den Durchmesser der Orange.`,
    parts: [num('$d$', 2 * Math.sqrt(Ov / (4 * PI)), 'cm')],
    solution: [`$r = \\sqrt{\\frac{${tx(Ov)}}{4 \\cdot \\pi}} ${res(Math.sqrt(Ov / (4 * PI)), 'cm')}$`, `$d = 2 \\cdot r ${res(2 * Math.sqrt(Ov / (4 * PI)), 'cm')}$`],
  };
};

const lackieren: Gen = () => {
  const n = pick([200, 500, 1000]);
  const d = pick([6, 8, 10]);
  const p = pick([5, 9.9, 14.99]);
  const Ag = (n * O(d / 2)) / 10000;
  return {
    title: 'Holzkugeln lackieren',
    badge: 'Anwendung',
    text: `Ein Spielzeughersteller lackiert $${n}$ Holzkugeln mit je $${q(d, 'cm')}$ Durchmesser. Die Lackiererei verlangt $${q(p, '€')}$ pro $\\text{m}^2$.`,
    parts: [num('Fläche', Ag, 'm²', { q: 'a) Wie groß ist die gesamte Oberfläche aller Kugeln in m²?' }), num('Kosten', Ag * p, '€', { q: 'b) Was kostet das Lackieren?', tol: Ag * p * 0.01 })],
    solution: [`a) Eine Kugel: $O = 4 \\cdot (${q(d / 2, 'cm')})^2 \\cdot \\pi ${res(O(d / 2), 'cm²')}$`, `$${n} \\cdot ${tx(round(O(d / 2), 2))}\\,\\text{cm}^2 ${res(n * O(d / 2), 'cm²')} ${res(Ag, 'm²')}$`, `b) $${tx(round(Ag, 2))} \\cdot ${q(p, '€')} ${res(round(Ag, 2) * p, '€')}$`],
  };
};

const BASIC_V = [kugelV, kugelVd, rAusV, halbkugel];
const BASIC_O = [kugelO, kugelOV, rAusO, halbkugel];
const APPS = [baellebad, strandball, handball, bank, eiskugeln, orange, lackieren];

const ex = {
  title: 'Kugel mit d = 12 cm',
  text: 'Eine Kugel hat den Durchmesser $d = 12\\,\\text{cm}$.',
  figure: <KugelFig ld="d = 12 cm" />,
  steps: [
    'Radius: $r = 12\\,\\text{cm} : 2 = 6\\,\\text{cm}$',
    '$V = \\frac{4}{3} \\cdot r^3 \\cdot \\pi = \\frac{4}{3} \\cdot (6\\,\\text{cm})^3 \\cdot \\pi \\approx 904{,}78\\,\\text{cm}^3$',
    '$O = 4 \\cdot r^2 \\cdot \\pi = 4 \\cdot (6\\,\\text{cm})^2 \\cdot \\pi \\approx 452{,}39\\,\\text{cm}^2$',
  ],
  tip: 'Oberfläche → cm² (Fläche), Volumen → cm³ (Rauminhalt). Bei Liter: Radius vorher in dm umrechnen!',
};

const pages: PracticeConfig[] = [
  { slug: 'volumen', title: 'Volumen der Kugel', description: 'V aus r oder d, r aus V', formulas: F_KUGEL, example: ex, gens: BASIC_V, apps: APPS },
  { slug: 'oberflaeche', title: 'Oberfläche der Kugel', description: 'O aus r oder d, r aus O', formulas: F_KUGEL, example: ex, gens: BASIC_O, apps: APPS },
  {
    slug: 'gemischt',
    title: 'Gemischt und Umstellen',
    description: 'Formeln umstellen, alles gemischt',
    formulas: [...F_KUGEL, 'r = \\sqrt{\\frac{O}{4 \\cdot \\pi}}', 'r = \\sqrt[3]{\\frac{3 \\cdot V}{4 \\cdot \\pi}}'],
    example: {
      title: 'Radius aus dem Volumen',
      text: 'Eine Kugel hat das Volumen $V = 523{,}6\\,\\text{cm}^3$. Wie groß ist der Radius?',
      steps: [
        '$523{,}6 = \\frac{4}{3} \\cdot r^3 \\cdot \\pi \\quad | \\cdot 3 \\quad | : (4 \\cdot \\pi)$',
        '$r^3 = \\frac{3 \\cdot 523{,}6}{4 \\cdot \\pi} \\approx 125 \\quad | \\sqrt[3]{\\;}$',
        '$r \\approx 5\\,\\text{cm}$',
      ],
      tip: 'Die dritte Wurzel findest du auf dem Taschenrechner unter $\\sqrt[3]{\\;}$ oder $\\sqrt[x]{\\;}$.',
    },
    gens: [kugelV, kugelO, rAusO, rAusV, OausV, halbkugel, kugelOV],
    apps: APPS,
  },
  {
    slug: 'anwendungsaufgaben',
    title: 'Anwendungsaufgaben',
    description: 'Alltag und Abschlussprüfung',
    formulas: F_KUGEL,
    example: {
      title: 'Wie viele Bälle passen in die Kiste?',
      text: 'Eine Kiste hat ein Volumen von $0{,}2\\,\\text{m}^3$. Ein Ball hat $r = 4\\,\\text{cm}$.',
      steps: ['Ball: $V = \\frac{4}{3} \\cdot (4\\,\\text{cm})^3 \\cdot \\pi \\approx 268{,}08\\,\\text{cm}^3$', 'Einheiten angleichen: $0{,}2\\,\\text{m}^3 = 200.000\\,\\text{cm}^3$', '$200.000 : 268{,}08 \\approx 746$ Bälle (ohne Lücken)'],
    },
    gens: [],
    apps: APPS,
    fixed: examsFor('kugel'),
    nBasic: 0,
    nApp: 3,
    nFixed: 2,
  },
];

export const kugel: TopicConfig = { slug: 'kugel', title: 'Kugel', description: 'Oberfläche und Volumen berechnen', icon: 'circle', pages };

export { APPS as KUGEL_APPS };
