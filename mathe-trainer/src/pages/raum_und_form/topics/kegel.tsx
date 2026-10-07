import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, tx, PI } from '../engine/util';
import { KegelFig } from '../figures/shapes';
import { areaOf, lenUnit, name, num, res, volOf } from './helpers';
import { examsFor } from './pruefung';

const F_KEGEL = ['G = r^2 \\cdot \\pi', 'M = r \\cdot s \\cdot \\pi', 'O = G + M', 'V = \\frac{1}{3} \\cdot G \\cdot h = \\frac{1}{3} \\cdot r^2 \\cdot \\pi \\cdot h', 's = \\sqrt{r^2 + h^2}'];
const Vk = (r: number, h: number) => (r * r * PI * h) / 3;

const kegelV: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  return {
    title: 'Kegel: Volumen',
    text: `Ein Kegel hat den Radius $r = ${q(r, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne das Volumen.`,
    figure: <KegelFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$V$', Vk(r, h), volOf(u))],
    solution: [`$V = \\frac{1}{3} \\cdot r^2 \\cdot \\pi \\cdot h = \\frac{1}{3} \\cdot (${q(r, u)})^2 \\cdot \\pi \\cdot ${q(h, u)} ${res(Vk(r, h), volOf(u))}$`],
  };
};

const kegelVd: Gen = () => {
  const u = lenUnit();
  const d = ri(2, 24);
  const h = rs(2, 20, 0.5);
  const r = d / 2;
  return {
    title: 'Kegel: Volumen aus dem Durchmesser',
    text: `Ein Kegel hat den Durchmesser $d = ${q(d, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne das Volumen.`,
    figure: <KegelFig r={r} h={h} ld={`d = ${d} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$V$', Vk(r, h), volOf(u))],
    solution: [`$r = ${q(r, u)}$`, `$V = \\frac{1}{3} \\cdot (${q(r, u)})^2 \\cdot \\pi \\cdot ${q(h, u)} ${res(Vk(r, h), volOf(u))}$`],
  };
};

const kegelS: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const s = Math.hypot(r, h);
  return {
    title: 'Kegel: Mantellinie s',
    text: `Ein Kegel hat den Radius $r = ${q(r, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne die Länge der Mantellinie $s$.`,
    figure: <KegelFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh={`h = ${de(h)} ${u}`} ls="s = ?" />,
    parts: [num('$s$', s, u)],
    solution: [`$s = \\sqrt{r^2 + h^2} = \\sqrt{(${q(r, u)})^2 + (${q(h, u)})^2} ${res(s, u)}$`],
  };
};

const kegelMO: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const s = round(Math.hypot(r, h), 2);
  const G = r * r * PI;
  const M = r * s * PI;
  return {
    title: 'Kegel: Mantel und Oberfläche',
    text: `Ein Kegel hat den Radius $r = ${q(r, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne zuerst $s$, dann Mantelfläche und Oberfläche.`,
    figure: <KegelFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh={`h = ${de(h)} ${u}`} ls="s" />,
    parts: [num('$s$', s, u), num('$M$', M, areaOf(u), { tol: M * 0.01 }), num('$O$', G + M, areaOf(u), { tol: (G + M) * 0.01 })],
    solution: [
      `$s = \\sqrt{r^2 + h^2} ${res(Math.hypot(r, h), u)}$`,
      `$M = r \\cdot s \\cdot \\pi = ${tx(r)} \\cdot ${tx(s)} \\cdot \\pi ${res(M, areaOf(u))}$`,
      `$G = r^2 \\cdot \\pi ${res(G, areaOf(u))}$; $O = G + M ${res(G + M, areaOf(u))}$`,
    ],
  };
};

const kegelMs: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const s = round(r + rs(2, 12, 0.5), 1);
  const M = r * s * PI;
  return {
    title: 'Kegel: Mantelfläche',
    text: `Ein Kegel hat den Radius $r = ${q(r, u)}$ und die Mantellinie $s = ${q(s, u)}$. Berechne die Mantelfläche und die Oberfläche.`,
    figure: <KegelFig r={r} h={Math.sqrt(s * s - r * r)} lr={`r = ${de(r)} ${u}`} ls={`s = ${de(s)} ${u}`} />,
    parts: [num('$M$', M, areaOf(u)), num('$O$', M + r * r * PI, areaOf(u))],
    solution: [`$M = r \\cdot s \\cdot \\pi = ${q(r, u)} \\cdot ${q(s, u)} \\cdot \\pi ${res(M, areaOf(u))}$`, `$O = r^2 \\cdot \\pi + M ${res(M + r * r * PI, areaOf(u))}$`],
  };
};

const kegelH: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const V = round(Vk(r, h), 2);
  return {
    title: 'Kegel: Höhe aus dem Volumen',
    text: `Ein Kegel hat das Volumen $V = ${q(V, volOf(u))}$ und den Radius $r = ${q(r, u)}$. Berechne die Höhe.`,
    figure: <KegelFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh="h = ?" />,
    parts: [num('$h$', (3 * V) / (r * r * PI), u)],
    solution: [`$V = \\frac{1}{3} \\cdot r^2 \\cdot \\pi \\cdot h \\;\\Rightarrow\\; h = \\frac{3 \\cdot V}{r^2 \\cdot \\pi} = \\frac{3 \\cdot ${tx(V)}}{${tx(r)}^2 \\cdot \\pi} ${res((3 * V) / (r * r * PI), u)}$`],
  };
};

const kegelR: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const V = round(Vk(r, h), 2);
  const rr = Math.sqrt((3 * V) / (PI * h));
  return {
    title: 'Kegel: Radius aus dem Volumen',
    text: `Ein Kegel hat das Volumen $V = ${q(V, volOf(u))}$ und die Höhe $h = ${q(h, u)}$. Berechne den Radius.`,
    figure: <KegelFig r={r} h={h} lr="r = ?" lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$r$', rr, u)],
    solution: [`$r = \\sqrt{\\frac{3 \\cdot V}{\\pi \\cdot h}} = \\sqrt{\\frac{3 \\cdot ${tx(V)}}{\\pi \\cdot ${tx(h)}}} ${res(rr, u)}$`],
  };
};

const kegelRausS: Gen = () => {
  const u = lenUnit();
  const h = rs(3, 15, 0.5);
  const s = round(h + rs(0.5, 5, 0.5), 1);
  const r = Math.sqrt(s * s - h * h);
  return {
    title: 'Kegel: Radius aus s und h',
    text: `Ein Kegel ist $h = ${q(h, u)}$ hoch, die Mantellinie ist $s = ${q(s, u)}$ lang. Berechne den Radius.`,
    figure: <KegelFig r={r} h={h} lr="r = ?" lh={`h = ${de(h)} ${u}`} ls={`s = ${de(s)} ${u}`} />,
    parts: [num('$r$', r, u)],
    solution: [`$s^2 = r^2 + h^2 \\;\\Rightarrow\\; r = \\sqrt{s^2 - h^2} = \\sqrt{(${q(s, u)})^2 - (${q(h, u)})^2} ${res(r, u)}$`],
  };
};

// Anwendungen
const eiswaffel: Gen = () => {
  const h = pick([10, 11, 12]);
  const d = pick([5, 6, 7]);
  const r = d / 2;
  const Vw = Vk(r, h);
  const Vh = ((4 / 3) * r ** 3 * PI) / 2;
  return {
    title: 'Eiswaffel',
    badge: 'Anwendung',
    text: `Eine kegelförmige Eiswaffel ist $${q(h, 'cm')}$ hoch und hat oben einen Durchmesser von $${q(d, 'cm')}$. Sie ist ganz mit Eis gefüllt, oben liegt zusätzlich eine Halbkugel aus Eis.`,
    figure: <KegelFig r={r} h={h} ld={`${d} cm`} lh={`${h} cm`} />,
    parts: [
      num('Waffel', Vw, 'cm³', { q: 'a) Wie viel Eis ist in der Waffel?' }),
      num('gesamt', Vw + Vh, 'cm³', { q: 'b) Wie viel Eis ist es mit der Halbkugel?' }),
      num('$s$', Math.hypot(r, h), 'cm', { q: 'c) Ein Tropfen rinnt außen vom Rand bis zur Spitze. Wie lang ist sein Weg?' }),
    ],
    solution: [
      `a) $V = \\frac{1}{3} \\cdot (${q(r, 'cm')})^2 \\cdot \\pi \\cdot ${q(h, 'cm')} ${res(Vw, 'cm³')}$`,
      `b) Halbkugel: $\\frac{1}{2} \\cdot \\frac{4}{3} \\cdot (${q(r, 'cm')})^3 \\cdot \\pi ${res(Vh, 'cm³')}$; gesamt: $V ${res(Vw + Vh, 'cm³')}$`,
      `c) $s = \\sqrt{${tx(r)}^2 + ${h}^2} ${res(Math.hypot(r, h), 'cm')}$`,
    ],
  };
};

const sandhaufen: Gen = () => {
  const d = pick([4, 5, 6, 8]);
  const h = pick([1.5, 2, 2.5]);
  const lkw = pick([8, 10, 12]);
  const V = Vk(d / 2, h);
  return {
    title: 'Sandhaufen',
    badge: 'Anwendung',
    text: `Auf einer Baustelle liegt ein kegelförmiger Sandhaufen mit $${q(d, 'm')}$ Durchmesser und $${q(h, 'm')}$ Höhe. Ein Lkw kann $${q(lkw, 'm³')}$ laden.`,
    figure: <KegelFig r={d / 2} h={h} ld={`${d} m`} lh={`${de(h)} m`} />,
    parts: [num('Sand', V, 'm³', { q: 'a) Wie viel Sand liegt dort?' }), num('Fahrten', Math.ceil(V / lkw), null, { integer: true, q: 'b) Wie viele Fahrten sind nötig?' })],
    solution: [`a) $V = \\frac{1}{3} \\cdot (${q(d / 2, 'm')})^2 \\cdot \\pi \\cdot ${q(h, 'm')} ${res(V, 'm³')}$`, `b) $${tx(round(V, 2))} : ${lkw} \\approx ${tx(V / lkw)}$ → $${Math.ceil(V / lkw)}$ Fahrten`],
  };
};

const schultuete: Gen = () => {
  const d = pick([16, 18, 20]);
  const h = pick([60, 65, 70]);
  const r = d / 2;
  const s = Math.hypot(r, h);
  return {
    title: 'Schultüte basteln',
    badge: 'Anwendung',
    text: `${name()} bastelt eine kegelförmige Schultüte aus Karton: Öffnung $${q(d, 'cm')}$ Durchmesser, Höhe $${q(h, 'cm')}$.`,
    figure: <KegelFig r={r} h={h} ld={`${d} cm`} lh={`${h} cm`} ls="s" />,
    parts: [
      num('$s$', s, 'cm', { q: 'a) Berechne die Mantellinie $s$.' }),
      num('Karton', r * round(s, 2) * PI, 'cm²', { q: 'b) Wie viel Karton wird für den Mantel benötigt?', tol: r * s * PI * 0.01 }),
      num('Volumen', Vk(r, h) / 1000, 'l', { q: 'c) Wie viele Liter passen in die Tüte?', strict: true }),
    ],
    solution: [
      `a) $s = \\sqrt{${r}^2 + ${h}^2} ${res(s, 'cm')}$`,
      `b) $M = r \\cdot s \\cdot \\pi = ${r} \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(r * round(s, 2) * PI, 'cm²')}$`,
      `c) $V = \\frac{1}{3} \\cdot ${r}^2 \\cdot \\pi \\cdot ${h} ${res(Vk(r, h), 'cm³')} ${res(Vk(r, h) / 1000, 'l')}$`,
    ],
  };
};

const kegeldach: Gen = () => {
  const d = pick([4, 4.4, 5, 6]);
  const h = pick([2, 2.5, 3]);
  const p = pick([95, 120, 140]);
  const r = d / 2;
  const s = Math.hypot(r, h);
  const M = r * round(s, 2) * PI;
  return {
    title: 'Kegeldach aus Kupfer',
    badge: 'Anwendung',
    text: `Ein runder Turm ($d = ${q(d, 'm')}$) bekommt ein neues kegelförmiges Kupferdach mit $${q(h, 'm')}$ Höhe. $1\\,\\text{m}^2$ Kupferblech kostet $${q(p, '€')}$.`,
    figure: <KegelFig r={r} h={h} ld={`${de(d)} m`} lh={`${de(h)} m`} ls="s" />,
    parts: [num('$s$', s, 'm', { q: 'a) Wie lang ist eine Dachschräge $s$?' }), num('$M$', M, 'm²', { q: 'b) Wie groß ist die Dachfläche?', tol: M * 0.01 }), num('Kosten', M * p, '€', { q: 'c) Was kostet das Kupfer?', tol: M * p * 0.01 })],
    solution: [`a) $s = \\sqrt{${tx(r)}^2 + ${tx(h)}^2} ${res(s, 'm')}$`, `b) $M = ${tx(r)} \\cdot ${tx(round(s, 2))} \\cdot \\pi ${res(M, 'm²')}$`, `c) $${tx(round(M, 2))} \\cdot ${p} ${res(round(M, 2) * p, '€')}$`],
  };
};

const trichter: Gen = () => {
  const d = pick([16, 20, 24]);
  const h = pick([15, 18, 20]);
  const V = Vk(d / 20, h / 10);
  return {
    title: 'Trichter',
    badge: 'Anwendung',
    text: `Ein kegelförmiger Trichter hat oben einen Durchmesser von $${q(d, 'cm')}$ und ist $${q(h, 'cm')}$ tief. Wie viel Liter fasst er?`,
    figure: <KegelFig r={d / 2} h={h} ld={`${d} cm`} lh={`${h} cm`} />,
    parts: [num('Inhalt', V, 'l', { strict: true })],
    solution: [`In dm: $r = ${q(d / 20, 'dm')}$, $h = ${q(h / 10, 'dm')}$`, `$V = \\frac{1}{3} \\cdot ${tx(d / 20)}^2 \\cdot \\pi \\cdot ${tx(h / 10)} ${res(V, 'dm³')} = ${tx(V)}\\,\\text{l}$`],
  };
};

const tipi: Gen = () => {
  const A = pick([12.57, 19.63, 22.9, 28.27]);
  const h = pick([3, 3.5, 4]);
  const r = Math.sqrt(A / PI);
  const s = Math.hypot(round(r, 2), h);
  return {
    title: 'Tipi-Zelt',
    badge: 'Anwendung',
    text: `Ein kegelförmiges Tipi hat eine kreisrunde Bodenfläche von $${q(A, 'm²')}$ und ist $${q(h, 'm')}$ hoch.`,
    figure: <KegelFig r={r} h={h} lr="r = ?" lh={`${de(h)} m`} ls="s" />,
    parts: [num('$r$', r, 'm', { q: 'a) Berechne den Radius der Bodenfläche.' }), num('$M$', round(r, 2) * round(s, 2) * PI, 'm²', { q: 'b) Wie viel Zeltplane braucht man für den Mantel?', tol: r * s * PI * 0.01 })],
    solution: [`a) $A = r^2 \\cdot \\pi \\;\\Rightarrow\\; r = \\sqrt{\\frac{${tx(A)}}{\\pi}} ${res(r, 'm')}$`, `b) $s = \\sqrt{${tx(round(r, 2))}^2 + ${tx(h)}^2} ${res(s, 'm')}$; $M = r \\cdot s \\cdot \\pi ${res(round(r, 2) * round(s, 2) * PI, 'm²')}$`],
  };
};

const BASIC_V = [kegelV, kegelVd, kegelH, kegelR];
const BASIC_O = [kegelS, kegelMO, kegelMs, kegelRausS];
const APPS = [eiswaffel, sandhaufen, schultuete, kegeldach, trichter, tipi];

const ex = {
  title: 'Kegel mit r = 3 cm und h = 4 cm',
  text: 'Ein Kegel hat den Radius $r = 3\\,\\text{cm}$ und die Höhe $h = 4\\,\\text{cm}$.',
  figure: <KegelFig r={3} h={4} lr="r = 3 cm" lh="h = 4 cm" ls="s" />,
  steps: [
    'Volumen: $V = \\frac{1}{3} \\cdot r^2 \\cdot \\pi \\cdot h = \\frac{1}{3} \\cdot (3\\,\\text{cm})^2 \\cdot \\pi \\cdot 4\\,\\text{cm} \\approx 37{,}70\\,\\text{cm}^3$',
    'Mantellinie (Pythagoras): $s = \\sqrt{r^2 + h^2} = \\sqrt{9 + 16}\\,\\text{cm} = 5\\,\\text{cm}$',
    'Mantel: $M = r \\cdot s \\cdot \\pi = 3\\,\\text{cm} \\cdot 5\\,\\text{cm} \\cdot \\pi \\approx 47{,}12\\,\\text{cm}^2$',
    'Oberfläche: $O = G + M \\approx 28{,}27 + 47{,}12 = 75{,}40\\,\\text{cm}^2$',
  ],
  tip: 'Für den Mantel brauchst du die schräge Mantellinie $s$, für das Volumen die senkrechte Höhe $h$.',
};

const pages: PracticeConfig[] = [
  { slug: 'volumen', title: 'Volumen des Kegels', description: 'V, Höhe und Radius', formulas: F_KEGEL, example: ex, gens: BASIC_V, apps: APPS },
  { slug: 'oberflaeche', title: 'Oberfläche des Kegels', description: 'Mantellinie, Mantel, Oberfläche', formulas: F_KEGEL, example: ex, gens: BASIC_O, apps: APPS },
  { slug: 'gemischt', title: 'Gemischt und Umstellen', description: 'Alle Kegel-Aufgaben gemischt', formulas: [...F_KEGEL, 'h = \\frac{3 \\cdot V}{r^2 \\cdot \\pi}'], example: ex, gens: [...BASIC_V, ...BASIC_O], apps: APPS },
  {
    slug: 'anwendungsaufgaben',
    title: 'Anwendungsaufgaben',
    description: 'Alltag und Abschlussprüfung',
    formulas: F_KEGEL,
    example: ex,
    gens: [],
    apps: APPS,
    fixed: examsFor('kegel'),
    nBasic: 0,
    nApp: 3,
    nFixed: 2,
  },
];

export const kegel: TopicConfig = { slug: 'kegel', title: 'Kegel', description: 'Oberfläche und Volumen berechnen', icon: 'cone', pages };

export { APPS as KEGEL_APPS };
