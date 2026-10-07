import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, tx } from '../engine/util';
import { PyramideFig } from '../figures/shapes';
import { areaOf, lenUnit, num, res, volOf } from './helpers';
import { examsFor } from './pruefung';

const F_PYR = [
  'G = a^2',
  'M = 4 \\cdot A_\\Delta = 4 \\cdot \\frac{h_s \\cdot a}{2}',
  'O = G + M',
  'V = \\frac{1}{3} \\cdot G \\cdot h = \\frac{1}{3} \\cdot a^2 \\cdot h',
  'h_s = \\sqrt{h^2 + \\left(\\frac{a}{2}\\right)^2}',
  's = \\sqrt{h_s^2 + \\left(\\frac{a}{2}\\right)^2}',
];

const Vp = (a: number, h: number) => (a * a * h) / 3;
const hsOf = (a: number, h: number) => Math.hypot(h, a / 2);

const pyrV: Gen = () => {
  const u = lenUnit();
  const a = rs(2, 12, 0.5);
  const h = rs(2, 15, 0.5);
  return {
    title: 'Pyramide: Volumen',
    text: `Eine quadratische Pyramide hat die Grundkante $a = ${q(a, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne das Volumen.`,
    figure: <PyramideFig a={a} h={h} la={`a = ${de(a)} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$V$', Vp(a, h), volOf(u))],
    solution: [`$V = \\frac{1}{3} \\cdot a^2 \\cdot h = \\frac{1}{3} \\cdot (${q(a, u)})^2 \\cdot ${q(h, u)} ${res(Vp(a, h), volOf(u))}$`],
  };
};

const pyrHs: Gen = () => {
  const u = lenUnit();
  const a = 2 * ri(1, 8);
  const h = rs(2, 15, 0.5);
  const hs = hsOf(a, h);
  return {
    title: 'Pyramide: Höhe der Seitenfläche',
    text: `Eine quadratische Pyramide hat $a = ${q(a, u)}$ und $h = ${q(h, u)}$. Berechne die Höhe $h_s$ einer Seitenfläche.`,
    figure: <PyramideFig a={a} h={h} la={`a = ${a} ${u}`} lh={`h = ${de(h)} ${u}`} lhs="h_s = ?" />,
    parts: [num('$h_s$', hs, u)],
    solution: [`Rechtwinkliges Dreieck aus $h$, $\\frac{a}{2}$ und $h_s$:`, `$h_s = \\sqrt{h^2 + \\left(\\frac{a}{2}\\right)^2} = \\sqrt{(${q(h, u)})^2 + (${q(a / 2, u)})^2} ${res(hs, u)}$`],
  };
};

const pyrMO: Gen = () => {
  const u = lenUnit();
  const a = 2 * ri(1, 8);
  const h = rs(2, 15, 0.5);
  const hs = round(hsOf(a, h), 2);
  const M = 4 * ((hs * a) / 2);
  return {
    title: 'Pyramide: Mantel und Oberfläche',
    text: `Eine quadratische Pyramide hat $a = ${q(a, u)}$ und $h = ${q(h, u)}$. Berechne $h_s$, die Mantelfläche und die Oberfläche.`,
    figure: <PyramideFig a={a} h={h} la={`a = ${a} ${u}`} lh={`h = ${de(h)} ${u}`} lhs="h_s" />,
    parts: [num('$h_s$', hs, u), num('$M$', M, areaOf(u), { tol: M * 0.01 }), num('$O$', a * a + M, areaOf(u), { tol: (a * a + M) * 0.01 })],
    solution: [
      `$h_s = \\sqrt{(${q(h, u)})^2 + (${q(a / 2, u)})^2} ${res(hsOf(a, h), u)}$`,
      `$M = 4 \\cdot \\frac{h_s \\cdot a}{2} = 4 \\cdot \\frac{${tx(hs)} \\cdot ${a}}{2} ${res(M, areaOf(u))}$`,
      `$O = a^2 + M = ${a * a} + ${tx(M)} ${res(a * a + M, areaOf(u))}$`,
    ],
  };
};

const pyrMhs: Gen = () => {
  const u = lenUnit();
  const a = rs(2, 12, 0.5);
  const hs = round(a / 2 + rs(1, 10, 0.5), 1);
  const M = 2 * hs * a;
  return {
    title: 'Pyramide: Mantel aus h_s',
    text: `Eine quadratische Pyramide hat die Grundkante $a = ${q(a, u)}$ und die Seitenhöhe $h_s = ${q(hs, u)}$. Berechne Mantelfläche und Oberfläche.`,
    figure: <PyramideFig a={a} h={Math.sqrt(hs * hs - (a * a) / 4)} la={`a = ${de(a)} ${u}`} lhs={`h_s = ${de(hs)} ${u}`} />,
    parts: [num('$M$', M, areaOf(u)), num('$O$', a * a + M, areaOf(u))],
    solution: [`$M = 4 \\cdot \\frac{h_s \\cdot a}{2} = 4 \\cdot \\frac{${tx(hs)} \\cdot ${tx(a)}}{2} ${res(M, areaOf(u))}$`, `$O = a^2 + M ${res(a * a + M, areaOf(u))}$`],
  };
};

const pyrS: Gen = () => {
  const u = lenUnit();
  const a = 2 * ri(1, 8);
  const h = rs(2, 15, 0.5);
  const hs = hsOf(a, h);
  const s = Math.hypot(hs, a / 2);
  return {
    title: 'Pyramide: Seitenkante s',
    text: `Eine quadratische Pyramide hat $a = ${q(a, u)}$ und $h = ${q(h, u)}$. Berechne zuerst $h_s$ und dann die Seitenkante $s$.`,
    figure: <PyramideFig a={a} h={h} la={`a = ${a} ${u}`} lh={`h = ${de(h)} ${u}`} lhs="h_s" ls="s = ?" />,
    parts: [num('$h_s$', hs, u), num('$s$', s, u)],
    solution: [`$h_s = \\sqrt{(${q(h, u)})^2 + (${q(a / 2, u)})^2} ${res(hs, u)}$`, `$s = \\sqrt{h_s^2 + \\left(\\frac{a}{2}\\right)^2} = \\sqrt{${tx(round(hs, 2))}^2 + ${tx(a / 2)}^2} ${res(Math.hypot(round(hs, 2), a / 2), u)}$`],
  };
};

const pyrH: Gen = () => {
  const u = lenUnit();
  const a = ri(2, 12);
  const h = rs(2, 15, 0.5);
  const V = round(Vp(a, h), 2);
  return {
    title: 'Pyramide: Höhe aus dem Volumen',
    text: `Eine quadratische Pyramide hat das Volumen $V = ${q(V, volOf(u))}$ und die Grundkante $a = ${q(a, u)}$. Wie hoch ist sie?`,
    figure: <PyramideFig a={a} h={h} la={`a = ${a} ${u}`} lh="h = ?" />,
    parts: [num('$h$', (3 * V) / (a * a), u)],
    solution: [`$V = \\frac{1}{3} \\cdot a^2 \\cdot h \\;\\Rightarrow\\; h = \\frac{3 \\cdot V}{a^2} = \\frac{3 \\cdot ${tx(V)}}{${a}^2} ${res((3 * V) / (a * a), u)}$`],
  };
};

const pyrA: Gen = () => {
  const u = lenUnit();
  const a = ri(2, 12);
  const h = ri(3, 15);
  const V = round(Vp(a, h), 2);
  const aa = Math.sqrt((3 * V) / h);
  return {
    title: 'Pyramide: Grundkante aus dem Volumen',
    text: `Eine quadratische Pyramide hat das Volumen $V = ${q(V, volOf(u))}$ und die Höhe $h = ${q(h, u)}$. Berechne die Grundkante $a$.`,
    figure: <PyramideFig a={a} h={h} la="a = ?" lh={`h = ${h} ${u}`} />,
    parts: [num('$a$', aa, u)],
    solution: [`$a^2 = \\frac{3 \\cdot V}{h} = \\frac{3 \\cdot ${tx(V)}}{${h}} = ${tx((3 * V) / h)}$`, `$a = \\sqrt{${tx((3 * V) / h)}} ${res(aa, u)}$`],
  };
};

const pyrHausHs: Gen = () => {
  const u = lenUnit();
  const a = 2 * ri(1, 8);
  const hs = round(a / 2 + rs(1, 10, 0.5), 1);
  const h = Math.sqrt(hs * hs - (a / 2) ** 2);
  return {
    title: 'Pyramide: Höhe aus h_s',
    text: `Bei einer quadratischen Pyramide ist $a = ${q(a, u)}$ und $h_s = ${q(hs, u)}$. Berechne die Körperhöhe $h$ und das Volumen.`,
    figure: <PyramideFig a={a} h={h} la={`a = ${a} ${u}`} lh="h = ?" lhs={`h_s = ${de(hs)} ${u}`} />,
    parts: [num('$h$', h, u), num('$V$', Vp(a, round(h, 2)), volOf(u), { tol: Vp(a, h) * 0.01 })],
    solution: [`$h = \\sqrt{h_s^2 - \\left(\\frac{a}{2}\\right)^2} = \\sqrt{${tx(hs)}^2 - ${a / 2}^2} ${res(h, u)}$`, `$V = \\frac{1}{3} \\cdot ${a}^2 \\cdot ${tx(round(h, 2))} ${res(Vp(a, round(h, 2)), volOf(u))}$`],
  };
};

// Anwendungen
const glaspyramide: Gen = () => {
  const a = pick([20, 30, 35.4]);
  const h = pick([15, 21.6, 25]);
  const hs = round(hsOf(a, h), 2);
  const M = 2 * hs * a;
  const p = pick([3.5, 4.8, 6.2]);
  return {
    title: 'Glaspyramide reinigen',
    badge: 'Anwendung',
    text: `Vor einem Museum steht eine Glaspyramide mit quadratischer Grundfläche ($a = ${q(a, 'm')}$, $h = ${q(h, 'm')}$). Die Glasflächen (nur die vier Seiten) werden gereinigt; das kostet $${q(p, '€')}$ pro $\\text{m}^2$.`,
    figure: <PyramideFig a={a} h={h} la={`${de(a)} m`} lh={`${de(h)} m`} lhs="h_s" />,
    parts: [num('$h_s$', hs, 'm', { q: 'a) Berechne die Höhe einer Seitenfläche.' }), num('$M$', M, 'm²', { q: 'b) Wie groß ist die Glasfläche?', tol: M * 0.01 }), num('Kosten', M * p, '€', { q: 'c) Was kostet die Reinigung?', tol: M * p * 0.01 })],
    solution: [`a) $h_s = \\sqrt{${tx(h)}^2 + ${tx(a / 2)}^2} ${res(hsOf(a, h), 'm')}$`, `b) $M = 4 \\cdot \\frac{${tx(hs)} \\cdot ${tx(a)}}{2} ${res(M, 'm²')}$`, `c) $${tx(round(M, 2))} \\cdot ${tx(p)} ${res(round(M, 2) * p, '€')}$`],
  };
};

const cheops: Gen = () => {
  const a = 230.3;
  const h = pick([138.75, 146.5]);
  const V = Vp(a, h);
  return {
    title: 'Cheops-Pyramide',
    badge: 'Anwendung',
    text: `Die Cheops-Pyramide hat eine quadratische Grundfläche mit $a = ${q(a, 'm')}$ und eine Höhe von $${q(h, 'm')}$.`,
    figure: <PyramideFig a={a} h={h} la={`${de(a)} m`} lh={`${de(h)} m`} />,
    parts: [num('$G$', a * a, 'm²', { q: 'a) Wie groß ist die Grundfläche?' }), num('$V$', V, 'm³', { q: 'b) Berechne das Volumen.' })],
    solution: [`a) $G = a^2 = ${tx(a)}^2 ${res(a * a, 'm²')}$`, `b) $V = \\frac{1}{3} \\cdot G \\cdot h ${res(V, 'm³')}$`],
  };
};

const zeltdach: Gen = () => {
  const a = pick([3, 4, 5, 6]);
  const hD = pick([1, 1.2, 1.5]);
  const hs = hsOf(a, hD);
  const M = 2 * round(hs, 2) * a;
  return {
    title: 'Pavillon-Dach',
    badge: 'Anwendung',
    text: `Ein Pavillon hat ein pyramidenförmiges Stoffdach über einer quadratischen Fläche ($a = ${q(a, 'm')}$). Das Dach ist $${q(hD, 'm')}$ hoch.`,
    figure: <PyramideFig a={a} h={hD} la={`${a} m`} lh={`${de(hD)} m`} lhs="h_s" />,
    parts: [num('$h_s$', hs, 'm', { q: 'a) Berechne die Höhe einer Dachfläche.' }), num('Stoff', M, 'm²', { q: 'b) Wie viel Stoff braucht man für das Dach?', tol: M * 0.01 })],
    solution: [`a) $h_s = \\sqrt{${tx(hD)}^2 + ${tx(a / 2)}^2} ${res(hs, 'm')}$`, `b) $M = 4 \\cdot \\frac{${tx(round(hs, 2))} \\cdot ${a}}{2} ${res(M, 'm²')}$`],
  };
};

const kirchturm: Gen = () => {
  const a = pick([4, 5, 6]);
  const h = pick([8, 10, 12]);
  const ver = pick([10, 15]);
  const hs = hsOf(a, h);
  const M = 2 * round(hs, 2) * a;
  return {
    title: 'Kirchturmdach mit Schiefer',
    badge: 'Anwendung',
    text: `Ein Kirchturm hat ein pyramidenförmiges Dach ($a = ${q(a, 'm')}$, Höhe $${q(h, 'm')}$). Es wird mit Schiefer gedeckt, dabei rechnet man mit $${ver}\\,\\%$ Verschnitt.`,
    figure: <PyramideFig a={a} h={h} la={`${a} m`} lh={`${h} m`} lhs="h_s" />,
    parts: [num('$M$', M, 'm²', { q: 'a) Wie groß ist die Dachfläche?', tol: M * 0.01 }), num('Schiefer', M * (1 + ver / 100), 'm²', { q: 'b) Wie viel Schiefer muss bestellt werden?', tol: M * 0.012 })],
    solution: [`a) $h_s = \\sqrt{${h}^2 + ${tx(a / 2)}^2} ${res(hs, 'm')}$; $M = 4 \\cdot \\frac{${tx(round(hs, 2))} \\cdot ${a}}{2} ${res(M, 'm²')}$`, `b) $${tx(round(M, 2))} \\cdot ${tx(1 + ver / 100)} ${res(round(M, 2) * (1 + ver / 100), 'm²')}$`],
  };
};

const betonSkulptur: Gen = () => {
  const a = pick([1.2, 1.5, 2]);
  const h = pick([1.8, 2, 2.5]);
  const p = pick([180, 250, 350]);
  const V = Vp(a, h);
  return {
    title: 'Skulptur aus Beton',
    badge: 'Anwendung',
    text: `Vor der Schule wird eine Skulptur in Form einer quadratischen Pyramide aufgestellt ($a = ${q(a, 'm')}$, $h = ${q(h, 'm')}$). $1\\,\\text{m}^3$ Beton kostet $${q(p, '€')}$.`,
    figure: <PyramideFig a={a} h={h} la={`${de(a)} m`} lh={`${de(h)} m`} />,
    parts: [num('$V$', V, 'm³', { q: 'a) Wie viel Beton wird benötigt?' }), num('Kosten', V * p, '€', { q: 'b) Was kostet der Beton?' })],
    solution: [`a) $V = \\frac{1}{3} \\cdot ${tx(a)}^2 \\cdot ${tx(h)} ${res(V, 'm³')}$`, `b) $${tx(V, 3)} \\cdot ${p} ${res(V * p, '€')}$`],
  };
};

const BASIC_V = [pyrV, pyrH, pyrA, pyrHausHs];
const BASIC_O = [pyrHs, pyrMO, pyrMhs, pyrS];
const APPS = [glaspyramide, cheops, zeltdach, kirchturm, betonSkulptur];

const ex = {
  title: 'Pyramide mit a = 6 cm und h = 4 cm',
  text: 'Eine quadratische Pyramide hat die Grundkante $a = 6\\,\\text{cm}$ und die Höhe $h = 4\\,\\text{cm}$.',
  figure: <PyramideFig a={6} h={4} la="a = 6 cm" lh="h = 4 cm" lhs="h_s" />,
  steps: [
    'Volumen: $V = \\frac{1}{3} \\cdot a^2 \\cdot h = \\frac{1}{3} \\cdot (6\\,\\text{cm})^2 \\cdot 4\\,\\text{cm} = 48\\,\\text{cm}^3$',
    'Seitenhöhe (Pythagoras): $h_s = \\sqrt{h^2 + \\left(\\frac{a}{2}\\right)^2} = \\sqrt{16 + 9}\\,\\text{cm} = 5\\,\\text{cm}$',
    'Mantel: $M = 4 \\cdot \\frac{h_s \\cdot a}{2} = 4 \\cdot \\frac{5\\,\\text{cm} \\cdot 6\\,\\text{cm}}{2} = 60\\,\\text{cm}^2$',
    'Oberfläche: $O = G + M = 36\\,\\text{cm}^2 + 60\\,\\text{cm}^2 = 96\\,\\text{cm}^2$',
  ],
  tip: '$h$ = Körperhöhe (Spitze bis Mitte der Grundfläche), $h_s$ = Höhe eines Seitendreiecks. Für den Mantel brauchst du immer $h_s$!',
};

const pages: PracticeConfig[] = [
  { slug: 'volumen', title: 'Volumen der Pyramide', description: 'V, Höhe und Grundkante', formulas: F_PYR, example: ex, gens: BASIC_V, apps: APPS },
  { slug: 'oberflaeche', title: 'Oberfläche der Pyramide', description: 'h_s, Mantel, Oberfläche, Seitenkante', formulas: F_PYR, example: ex, gens: BASIC_O, apps: APPS },
  { slug: 'gemischt', title: 'Gemischt und Umstellen', description: 'Alle Pyramiden-Aufgaben gemischt', formulas: F_PYR, example: ex, gens: [...BASIC_V, ...BASIC_O], apps: APPS },
  {
    slug: 'anwendungsaufgaben',
    title: 'Anwendungsaufgaben',
    description: 'Alltag und Abschlussprüfung',
    formulas: F_PYR,
    example: ex,
    gens: [],
    apps: APPS,
    fixed: examsFor('pyramide'),
    nBasic: 0,
    nApp: 3,
    nFixed: 2,
  },
];

export const pyramide: TopicConfig = { slug: 'pyramide', title: 'Pyramide', description: 'Oberfläche und Volumen berechnen', icon: 'pyramid', pages };

export { APPS as PYRAMIDE_APPS };
