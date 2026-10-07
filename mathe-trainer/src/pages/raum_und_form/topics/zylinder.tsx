import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, tx, PI } from '../engine/util';
import { RingFig, ZylinderFig } from '../figures/shapes';
import { areaOf, eq, family, lenUnit, num, res, volOf } from './helpers';
import { examsFor } from './pruefung';

const F_ZYL = ['G = r^2 \\cdot \\pi', 'M = u \\cdot h = 2 \\cdot r \\cdot \\pi \\cdot h', 'O = 2 \\cdot G + M', 'V = G \\cdot h = r^2 \\cdot \\pi \\cdot h'];

const zylV: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const Vv = r * r * PI * h;
  return {
    title: 'Zylinder: Volumen',
    text: `Ein Zylinder hat den Radius $r = ${q(r, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne das Volumen.`,
    figure: <ZylinderFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$V$', Vv, volOf(u))],
    solution: [`$V = r^2 \\cdot \\pi \\cdot h = (${q(r, u)})^2 \\cdot \\pi \\cdot ${q(h, u)} ${res(Vv, volOf(u))}$`],
  };
};

const zylVd: Gen = () => {
  const u = lenUnit();
  const d = ri(2, 24);
  const h = rs(2, 20, 0.5);
  const r = d / 2;
  const Vv = r * r * PI * h;
  return {
    title: 'Zylinder: Volumen aus dem Durchmesser',
    text: `Ein Zylinder hat den Durchmesser $d = ${q(d, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne Grundfläche und Volumen.`,
    figure: <ZylinderFig r={r} h={h} ld={`d = ${d} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$G$', r * r * PI, areaOf(u)), num('$V$', Vv, volOf(u))],
    solution: [`$r = ${q(r, u)}$`, `$G = r^2 \\cdot \\pi ${res(r * r * PI, areaOf(u))}$`, `$V = G \\cdot h ${res(Vv, volOf(u))}$`],
  };
};

const zylMO: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const G = r * r * PI;
  const M = 2 * r * PI * h;
  return {
    title: 'Zylinder: Mantel und Oberfläche',
    text: `Ein Zylinder hat den Radius $r = ${q(r, u)}$ und die Höhe $h = ${q(h, u)}$. Berechne Mantelfläche und Oberfläche.`,
    figure: <ZylinderFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$M$', M, areaOf(u)), num('$O$', 2 * G + M, areaOf(u))],
    solution: [
      `$M = 2 \\cdot r \\cdot \\pi \\cdot h = 2 \\cdot ${q(r, u)} \\cdot \\pi \\cdot ${q(h, u)} ${res(M, areaOf(u))}$`,
      `$G = r^2 \\cdot \\pi ${res(G, areaOf(u))}$`,
      `$O = 2 \\cdot G + M ${res(2 * G + M, areaOf(u))}$`,
    ],
  };
};

const zylH: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const Vv = round(r * r * PI * h, 2);
  return {
    title: 'Zylinder: Höhe aus dem Volumen',
    text: `Ein Zylinder hat das Volumen $V = ${q(Vv, volOf(u))}$ und den Radius $r = ${q(r, u)}$. Berechne die Höhe.`,
    figure: <ZylinderFig r={r} h={h} lr={`r = ${de(r)} ${u}`} lh="h = ?" />,
    parts: [num('$h$', Vv / (r * r * PI), u)],
    solution: [`$V = r^2 \\cdot \\pi \\cdot h \\;\\Rightarrow\\; h = \\frac{V}{r^2 \\cdot \\pi} = \\frac{${tx(Vv)}}{${tx(r)}^2 \\cdot \\pi} ${res(Vv / (r * r * PI), u)}$`],
  };
};

const zylR: Gen = () => {
  const u = lenUnit();
  const r = rs(1, 10, 0.5);
  const h = rs(2, 20, 0.5);
  const Vv = round(r * r * PI * h, 2);
  const rr = Math.sqrt(Vv / (PI * h));
  return {
    title: 'Zylinder: Radius aus dem Volumen',
    text: `Ein Zylinder hat das Volumen $V = ${q(Vv, volOf(u))}$ und die Höhe $h = ${q(h, u)}$. Berechne den Radius.`,
    figure: <ZylinderFig r={r} h={h} lr="r = ?" lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$r$', rr, u)],
    solution: [`$V = r^2 \\cdot \\pi \\cdot h \\;\\Rightarrow\\; r = \\sqrt{\\frac{V}{\\pi \\cdot h}} = \\sqrt{\\frac{${tx(Vv)}}{\\pi \\cdot ${tx(h)}}} ${res(rr, u)}$`],
  };
};

const zylHausO: Gen = () => {
  const u = lenUnit();
  const r = ri(2, 12);
  const h = rs(3, 20, 0.5);
  const Ov = round(2 * r * r * PI + 2 * r * PI * h, 2);
  const hh = (Ov - 2 * r * r * PI) / (2 * r * PI);
  return {
    title: 'Zylinder: Höhe aus der Oberfläche',
    text: `Ein Zylinder hat die Oberfläche $O = ${q(Ov, areaOf(u))}$ und den Radius $r = ${q(r, u)}$. Berechne die Höhe. (anspruchsvoll)`,
    figure: <ZylinderFig r={r} h={h} lr={`r = ${r} ${u}`} lh="h = ?" />,
    parts: [num('$h$', hh, u)],
    solution: [
      `$G = r^2 \\cdot \\pi ${res(r * r * PI, areaOf(u))}$; $M = O - 2 \\cdot G ${res(Ov - 2 * r * r * PI, areaOf(u))}$`,
      `$M = 2 \\cdot r \\cdot \\pi \\cdot h \\;\\Rightarrow\\; h = \\frac{M}{2 \\cdot r \\cdot \\pi} ${res(hh, u)}$`,
    ],
  };
};

const hohlzylinder: Gen = () => {
  const u = lenUnit();
  const R = ri(4, 12);
  const r = ri(2, R - 1);
  const h = ri(5, 30);
  const Vv = (R * R - r * r) * PI * h;
  return {
    title: 'Hohlzylinder (Rohr)',
    text: `Ein Rohr hat den Außenradius $r_a = ${q(R, u)}$, den Innenradius $r_i = ${q(r, u)}$ und die Länge $h = ${q(h, u)}$. Berechne das Volumen des Materials.`,
    figure: <RingFig R={R} r={r} lR={`r_a = ${R} ${u}`} lr={`r_i = ${r} ${u}`} />,
    parts: [num('$V$', Vv, volOf(u))],
    solution: [`$V = (r_a^2 - r_i^2) \\cdot \\pi \\cdot h = (${R}^2 - ${r}^2) \\cdot \\pi \\cdot ${h} ${res(Vv, volOf(u))}$`],
  };
};

// Anwendungen
const dose: Gen = () => {
  const d = pick([6.6, 7.5, 8, 10]);
  const h = pick([11.5, 12, 13.5, 15]);
  const r = d / 2;
  return {
    title: 'Konservendose',
    badge: 'Anwendung',
    text: `Eine Dose hat einen Durchmesser von $${q(d, 'cm')}$ und ist $${q(h, 'cm')}$ hoch. Rundherum klebt ein Papieretikett (Mantelfläche).`,
    figure: <ZylinderFig r={r} h={h} ld={`${de(d)} cm`} lh={`${de(h)} cm`} />,
    parts: [num('Inhalt', r * r * PI * h, 'ml', { q: 'a) Wie viel Milliliter passen in die Dose?' }), num('Etikett', 2 * r * PI * h, 'cm²', { q: 'b) Wie groß ist das Etikett?' })],
    solution: [`a) $V = (${q(r, 'cm')})^2 \\cdot \\pi \\cdot ${q(h, 'cm')} ${res(r * r * PI * h, 'cm³')} = ${tx(r * r * PI * h)}\\,\\text{ml}$`, `b) $M = 2 \\cdot ${q(r, 'cm')} \\cdot \\pi \\cdot ${q(h, 'cm')} ${res(2 * r * PI * h, 'cm²')}$`],
  };
};

const wasserturm: Gen = () => {
  const h = pick([10, 12.5, 15]);
  const L = pick([300000, 400000, 500000]);
  const G = L / 1000 / h;
  const hh = pick([60, 80, 100]);
  const bed = pick([400, 500]);
  const tage = L / (hh * bed);
  return {
    title: 'Neuer Wasserturm',
    badge: 'Anwendung',
    text: `Eine Gemeinde baut einen zylinderförmigen Wasserturm mit $${q(h, 'm')}$ Höhe und einem Fassungsvermögen von $${de(L)}\\,\\text{Litern}$. Er versorgt $${hh}$ Haushalte mit je $${bed}$ Litern Tagesbedarf.`,
    parts: [
      num('$G$', G, 'm²', { q: 'a) Wie groß muss die Grundfläche sein?' }),
      num('$r$', Math.sqrt(G / PI), 'm', { q: 'b) Welchen Radius hat der Turm?' }),
      num('Tage', tage, null, { q: 'c) Nach wie vielen Tagen ist das Wasser aufgebraucht?' }),
    ],
    solution: [
      `a) $${de(L)}\\,\\text{l} = ${q(L / 1000, 'm³')}$; $G = \\frac{V}{h} = \\frac{${L / 1000}}{${tx(h)}} ${res(G, 'm²')}$`,
      `b) $r = \\sqrt{\\frac{G}{\\pi}} ${res(Math.sqrt(G / PI), 'm')}$`,
      `c) Tagesbedarf: $${hh} \\cdot ${bed}\\,\\text{l} = ${de(hh * bed)}\\,\\text{l}$; $${de(L)} : ${de(hh * bed)} ${eq(tage)} ${tx(tage)}$ Tage`,
    ],
  };
};

const regentonne: Gen = () => {
  const d = pick([60, 70, 80]);
  const h = pick([90, 100, 110]);
  const r = d / 20;
  const V = r * r * PI * (h / 10);
  return {
    title: 'Regentonne',
    badge: 'Anwendung',
    text: `Eine zylinderförmige Regentonne ist innen $${q(d, 'cm')}$ breit und $${q(h, 'cm')}$ hoch. Wie viele Liter Wasser fasst sie?`,
    figure: <ZylinderFig r={d} h={h} ld={`${d} cm`} lh={`${h} cm`} />,
    parts: [num('Wasser', V, 'l', { strict: true })],
    solution: [`Für Liter in dm rechnen: $r = ${q(r, 'dm')}$, $h = ${q(h / 10, 'dm')}$`, `$V = (${q(r, 'dm')})^2 \\cdot \\pi \\cdot ${q(h / 10, 'dm')} ${res(V, 'dm³')} = ${tx(V)}\\,\\text{l}$`],
  };
};

const litfass: Gen = () => {
  const d = pick([1.2, 1.4, 1.5]);
  const h = pick([2.5, 3, 3.5]);
  const p = pick([12, 15, 18]);
  const M = d * PI * h;
  return {
    title: 'Litfaßsäule bekleben',
    badge: 'Anwendung',
    text: `Eine Litfaßsäule ($d = ${q(d, 'm')}$) wird bis zu einer Höhe von $${q(h, 'm')}$ mit Plakaten beklebt. Das Bekleben kostet $${q(p, '€')}$ pro $\\text{m}^2$.`,
    figure: <ZylinderFig r={d / 2} h={h} ld={`${de(d)} m`} lh={`${de(h)} m`} fill="#fef3c7" />,
    parts: [num('Fläche', M, 'm²', { q: 'a) Wie groß ist die Plakatfläche?' }), num('Kosten', round(M, 2) * p, '€', { q: 'b) Was kostet das Bekleben?' })],
    solution: [`a) $M = 2 \\cdot r \\cdot \\pi \\cdot h = 2 \\cdot ${q(d / 2, 'm')} \\cdot \\pi \\cdot ${q(h, 'm')} ${res(M, 'm²')}$`, `b) $${tx(round(M, 2))} \\cdot ${p} ${res(round(M, 2) * p, '€')}$`],
  };
};

const tennisdose: Gen = () => {
  const n = pick([3, 4]);
  const d = 6.7;
  const r = d / 2;
  const h = n * d;
  const Vd = r * r * PI * h;
  const Vb = n * (4 / 3) * r ** 3 * PI;
  return {
    title: 'Tennisballdose',
    badge: 'Anwendung',
    text: `In eine zylinderförmige Dose passen genau $${n}$ Tennisbälle übereinander (Durchmesser je $${q(d, 'cm')}$). Die Dose ist so breit wie ein Ball und so hoch wie alle Bälle zusammen.`,
    parts: [
      num('Dose', Vd, 'cm³', { q: 'a) Berechne das Volumen der Dose.' }),
      num('Bälle', Vb, 'cm³', { q: 'b) Berechne das Volumen aller Bälle.' }),
      num('Luft', ((Vd - Vb) / Vd) * 100, '%', { q: 'c) Wie viel Prozent der Dose sind mit Luft gefüllt?', tol: 0.2 }),
    ],
    solution: [
      `a) $h = ${n} \\cdot ${tx(d)} = ${q(h, 'cm')}$; $V = (${q(r, 'cm')})^2 \\cdot \\pi \\cdot ${q(h, 'cm')} ${res(Vd, 'cm³')}$`,
      `b) $${n} \\cdot \\frac{4}{3} \\cdot (${q(r, 'cm')})^3 \\cdot \\pi ${res(Vb, 'cm³')}$`,
      `c) $\\frac{${tx(round(Vd - Vb, 2))}}{${tx(round(Vd, 2))}} \\cdot 100 \\approx ${tx(((Vd - Vb) / Vd) * 100)}\\,\\%$ (immer genau ein Drittel!)`,
    ],
  };
};

const pool: Gen = () => {
  const d = pick([3, 3.66, 4.5, 5.5]);
  const h = pick([0.9, 1.07, 1.2, 1.32]);
  const f = pick([80, 85, 90]);
  const r = d / 2;
  const V = r * r * PI * h;
  return {
    title: 'Aufstellpool befüllen',
    badge: 'Anwendung',
    text: `${family()} stellt einen runden Pool auf (Innendurchmesser $${q(d, 'm')}$, Höhe $${q(h, 'm')}$). Er wird nur zu $${f}\\,\\%$ gefüllt.`,
    figure: <ZylinderFig r={r} h={h} ld={`${de(d)} m`} lh={`${de(h)} m`} fill="#bae6fd" />,
    parts: [num('Pool', V, 'm³', { q: 'a) Wie groß ist das Volumen des Pools?' }), num('Wasser', V * (f / 100) * 1000, 'l', { q: 'b) Wie viele Liter Wasser werden eingefüllt?', tol: V * 10 })],
    solution: [`a) $V = (${q(r, 'm')})^2 \\cdot \\pi \\cdot ${q(h, 'm')} ${res(V, 'm³')}$`, `b) $${tx(round(V, 2))}\\,\\text{m}^3 \\cdot 0{,}${f} ${res(round(V, 2) * (f / 100), 'm³')} ${res(round(V, 2) * (f / 100) * 1000, 'l')}$`],
  };
};

const BASIC_V = [zylV, zylVd, zylH, zylR, hohlzylinder];
const BASIC_O = [zylMO, zylMO, zylHausO, zylVd];
const APPS = [dose, wasserturm, regentonne, litfass, tennisdose, pool];

const ex = {
  title: 'Zylinder mit r = 4 cm und h = 10 cm',
  text: 'Ein Zylinder hat den Radius $r = 4\\,\\text{cm}$ und die Höhe $h = 10\\,\\text{cm}$.',
  figure: <ZylinderFig r={4} h={10} lr="r = 4 cm" lh="h = 10 cm" />,
  steps: [
    'Grundfläche: $G = r^2 \\cdot \\pi = (4\\,\\text{cm})^2 \\cdot \\pi \\approx 50{,}27\\,\\text{cm}^2$',
    'Volumen: $V = G \\cdot h \\approx 50{,}27\\,\\text{cm}^2 \\cdot 10\\,\\text{cm} = 502{,}65\\,\\text{cm}^3$',
    'Mantel: $M = 2 \\cdot r \\cdot \\pi \\cdot h = 2 \\cdot 4\\,\\text{cm} \\cdot \\pi \\cdot 10\\,\\text{cm} \\approx 251{,}33\\,\\text{cm}^2$',
    'Oberfläche: $O = 2 \\cdot G + M \\approx 100{,}53 + 251{,}33 = 351{,}86\\,\\text{cm}^2$',
  ],
  tip: 'Die Mantelfläche ist abgewickelt ein Rechteck: Länge = Kreisumfang $u$, Breite = Höhe $h$.',
};

const pages: PracticeConfig[] = [
  { slug: 'volumen', title: 'Volumen des Zylinders', description: 'V, Höhe und Radius', formulas: F_ZYL, example: ex, gens: BASIC_V, apps: APPS },
  { slug: 'oberflaeche', title: 'Oberfläche des Zylinders', description: 'Mantel, Grundfläche, Oberfläche', formulas: F_ZYL, example: ex, gens: BASIC_O, apps: APPS },
  {
    slug: 'gemischt',
    title: 'Gemischt und Umstellen',
    description: 'Alle Zylinder-Aufgaben gemischt',
    formulas: [...F_ZYL, 'h = \\frac{V}{r^2 \\cdot \\pi}', 'r = \\sqrt{\\frac{V}{\\pi \\cdot h}}'],
    example: {
      title: 'Höhe aus dem Volumen',
      text: 'Ein Zylinder hat $V = 2000\\,\\text{cm}^3$ und $r = 5\\,\\text{cm}$. Wie hoch ist er?',
      figure: <ZylinderFig r={5} h={25} lr="r = 5 cm" lh="h = ?" />,
      steps: ['$V = r^2 \\cdot \\pi \\cdot h \\quad | : (r^2 \\cdot \\pi)$', '$h = \\frac{2000\\,\\text{cm}^3}{(5\\,\\text{cm})^2 \\cdot \\pi} \\approx 25{,}46\\,\\text{cm}$'],
    },
    gens: [...BASIC_V, zylMO, zylHausO],
    apps: APPS,
  },
  {
    slug: 'anwendungsaufgaben',
    title: 'Anwendungsaufgaben',
    description: 'Alltag und Abschlussprüfung',
    formulas: F_ZYL,
    example: {
      title: 'Wie viele Liter passen in die Tonne?',
      text: 'Eine Tonne ist innen $60\\,\\text{cm}$ breit und $90\\,\\text{cm}$ hoch.',
      steps: ['Liter gesucht → in dm rechnen: $r = 3\\,\\text{dm}$, $h = 9\\,\\text{dm}$', '$V = (3\\,\\text{dm})^2 \\cdot \\pi \\cdot 9\\,\\text{dm} \\approx 254{,}47\\,\\text{dm}^3 = 254{,}47\\,\\text{l}$'],
    },
    gens: [],
    apps: APPS,
    fixed: examsFor('zylinder'),
    nBasic: 0,
    nApp: 3,
    nFixed: 2,
  },
];

export const zylinder: TopicConfig = { slug: 'zylinder', title: 'Zylinder', description: 'Oberfläche und Volumen berechnen', icon: 'cylinder', pages };

export { APPS as ZYLINDER_APPS };
