import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, tx } from '../engine/util';
import type { P } from '../figures/Scene';
import { PrismFig, QuaderFig, WuerfelFig } from '../figures/shapes';
import { areaOf, family, lenUnit, name, num, res, volOf } from './helpers';
import { examsFor } from './pruefung';

const F_PRISMA = [
  '\\text{Würfel: } O = 6 \\cdot a^2,\\; V = a^3',
  'd = a \\cdot \\sqrt{3}',
  '\\text{Quader: } O = 2 \\cdot (a \\cdot b + b \\cdot h + a \\cdot h)',
  'V = G \\cdot h = a \\cdot b \\cdot h',
  'd = \\sqrt{a^2 + b^2 + h^2}',
  '\\text{Prisma: } O = 2 \\cdot G + M,\\; V = G \\cdot h',
  '\\text{Dreiseitig: } V = \\frac{1}{2} \\cdot c \\cdot h_c \\cdot h',
];

const wuerfel: Gen = () => {
  const u = lenUnit();
  const a = rs(2, 12, 0.5);
  return {
    title: 'Würfel: Volumen und Oberfläche',
    text: `Ein Würfel hat die Kantenlänge $a = ${q(a, u)}$. Berechne Volumen und Oberfläche.`,
    figure: <WuerfelFig la={`a = ${de(a)} ${u}`} />,
    parts: [num('$V$', a ** 3, volOf(u)), num('$O$', 6 * a * a, areaOf(u))],
    solution: [`$V = a^3 = (${q(a, u)})^3 = ${q(a ** 3, volOf(u))}$`, `$O = 6 \\cdot a^2 = 6 \\cdot (${q(a, u)})^2 = ${q(6 * a * a, areaOf(u))}$`],
  };
};

const quaderV: Gen = () => {
  const u = lenUnit();
  const a = rs(2, 12, 0.5);
  const b = rs(2, 8, 0.5);
  const h = rs(2, 10, 0.5);
  return {
    title: 'Quader: Volumen',
    text: `Ein Quader ist $a = ${q(a, u)}$ lang, $b = ${q(b, u)}$ breit und $h = ${q(h, u)}$ hoch. Berechne das Volumen.`,
    figure: <QuaderFig a={a} b={b} h={h} la={`a = ${de(a)} ${u}`} lb={`b = ${de(b)} ${u}`} lh={`h = ${de(h)} ${u}`} />,
    parts: [num('$V$', a * b * h, volOf(u))],
    solution: [`$V = a \\cdot b \\cdot h = ${q(a, u)} \\cdot ${q(b, u)} \\cdot ${q(h, u)} = ${q(a * b * h, volOf(u))}$`],
  };
};

const quaderO: Gen = () => {
  const u = lenUnit();
  const a = ri(2, 15);
  const b = ri(2, 10);
  const h = ri(2, 12);
  const O = 2 * (a * b + b * h + a * h);
  return {
    title: 'Quader: Oberfläche',
    text: `Ein Quader hat die Kanten $a = ${q(a, u)}$, $b = ${q(b, u)}$ und $h = ${q(h, u)}$. Berechne die Oberfläche.`,
    figure: <QuaderFig a={a} b={b} h={h} la={`a = ${a} ${u}`} lb={`b = ${b} ${u}`} lh={`h = ${h} ${u}`} />,
    parts: [num('$O$', O, areaOf(u))],
    solution: [`$O = 2 \\cdot (a \\cdot b + b \\cdot h + a \\cdot h) = 2 \\cdot (${a * b} + ${b * h} + ${a * h})\\,\\text{${u}}^2 = ${q(O, areaOf(u))}$`],
  };
};

const quaderDiag: Gen = () => {
  const u = lenUnit();
  const a = ri(3, 15);
  const b = ri(2, 10);
  const h = ri(2, 12);
  const d = Math.sqrt(a * a + b * b + h * h);
  return {
    title: 'Quader: Raumdiagonale',
    text: `Berechne die Länge der Raumdiagonale $d$ eines Quaders mit $a = ${q(a, u)}$, $b = ${q(b, u)}$ und $h = ${q(h, u)}$.`,
    figure: <QuaderFig a={a} b={b} h={h} la={`a = ${a} ${u}`} lb={`b = ${b} ${u}`} lh={`h = ${h} ${u}`} ld="d = ?" />,
    parts: [num('$d$', d, u)],
    solution: [`$d = \\sqrt{a^2 + b^2 + h^2} = \\sqrt{${a}^2 + ${b}^2 + ${h}^2} = \\sqrt{${a * a + b * b + h * h}} ${res(d, u)}$`],
  };
};

const quaderH: Gen = () => {
  const u = lenUnit();
  const a = ri(3, 15);
  const b = ri(2, 10);
  const h = rs(2, 12, 0.5);
  const V = a * b * h;
  return {
    title: 'Quader: Höhe aus dem Volumen',
    text: `Ein Quader hat das Volumen $V = ${q(V, volOf(u))}$, die Länge $a = ${q(a, u)}$ und die Breite $b = ${q(b, u)}$. Wie hoch ist er?`,
    figure: <QuaderFig a={a} b={b} h={h} la={`a = ${a} ${u}`} lb={`b = ${b} ${u}`} lh="h = ?" />,
    parts: [num('$h$', h, u)],
    solution: [`$V = a \\cdot b \\cdot h \\;\\Rightarrow\\; h = \\frac{V}{a \\cdot b} = \\frac{${tx(V)}}{${a} \\cdot ${b}} = ${q(h, u)}$`],
  };
};

const wuerfelA: Gen = () => {
  const u = lenUnit();
  const a = ri(2, 12);
  return {
    title: 'Würfel: Kante aus dem Volumen',
    text: `Ein Würfel hat das Volumen $V = ${q(a ** 3, volOf(u))}$. Wie lang ist eine Kante? Wie lang ist die Raumdiagonale?`,
    figure: <WuerfelFig la="a = ?" ld="d" />,
    parts: [num('$a$', a, u), num('$d$', a * Math.sqrt(3), u)],
    solution: [`$V = a^3 \\;\\Rightarrow\\; a = \\sqrt[3]{${a ** 3}} = ${q(a, u)}$`, `$d = a \\cdot \\sqrt{3} ${res(a * Math.sqrt(3), u)}$`],
  };
};

function triFront(c: number, hc: number, t = 0.4): P[] {
  return [[0, 0], [c, 0], [c * t, hc]];
}

const dreiecksprismaV: Gen = () => {
  const u = lenUnit();
  const c = rs(3, 10, 0.5);
  const hc = rs(2, 8, 0.5);
  const h = rs(4, 15, 0.5);
  const G = (c * hc) / 2;
  return {
    title: 'Dreiecksprisma: Volumen',
    text: `Die Grundfläche eines Prismas ist ein Dreieck mit $c = ${q(c, u)}$ und $h_c = ${q(hc, u)}$. Das Prisma ist $h = ${q(h, u)}$ lang. Berechne Grundfläche und Volumen.`,
    figure: <PrismFig front={triFront(c, hc)} len={Math.max(h * 0.6, c * 0.6)} edgeLabels={{ 0: `c = ${de(c)} ${u}` }} height={{ from: [c * 0.4, hc], to: [c * 0.4, 0], label: `h_c = ${de(hc)} ${u}` }} llen={`h = ${de(h)} ${u}`} />,
    parts: [num('$G$', G, areaOf(u)), num('$V$', G * h, volOf(u))],
    solution: [`$G = \\frac{c \\cdot h_c}{2} = \\frac{${q(c, u)} \\cdot ${q(hc, u)}}{2} = ${q(G, areaOf(u))}$`, `$V = G \\cdot h = ${q(G, areaOf(u))} \\cdot ${q(h, u)} = ${q(G * h, volOf(u))}$`],
  };
};

const dreiecksprismaO: Gen = () => {
  const u = lenUnit();
  const [x, y, z] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
  const h = ri(4, 15);
  const G = (x * y) / 2;
  const M = (x + y + z) * h;
  const front: P[] = [[0, 0], [x, 0], [0, y]];
  return {
    title: 'Dreiecksprisma: Oberfläche',
    text: `Die Grundfläche eines Prismas ist ein rechtwinkliges Dreieck mit den Seiten $${x}\\,\\text{${u}}$, $${y}\\,\\text{${u}}$ und $${z}\\,\\text{${u}}$ (rechter Winkel zwischen den beiden kürzeren Seiten). Das Prisma ist $${q(h, u)}$ lang.`,
    figure: <PrismFig front={front} len={Math.max(h * 0.5, 3)} edgeLabels={{ 0: `${x} ${u}`, 1: `${z} ${u}`, 2: `${y} ${u}` }} llen={`${h} ${u}`} />,
    parts: [num('$G$', G, areaOf(u), { q: 'a) Berechne die Grundfläche.' }), num('$M$', M, areaOf(u), { q: 'b) Berechne die Mantelfläche.' }), num('$O$', 2 * G + M, areaOf(u), { q: 'c) Berechne die Oberfläche.' })],
    solution: [`a) $G = \\frac{${x} \\cdot ${y}}{2} = ${q(G, areaOf(u))}$`, `b) $M = u \\cdot h = (${x} + ${y} + ${z}) \\cdot ${h} = ${q(M, areaOf(u))}$`, `c) $O = 2 \\cdot G + M = ${2 * G} + ${M} = ${q(2 * G + M, areaOf(u))}$`],
  };
};

const trapezprisma: Gen = () => {
  const u = lenUnit();
  const a = ri(6, 12);
  const c = ri(3, a - 2);
  const hT = ri(2, 6);
  const h = ri(5, 20);
  const G = ((a + c) / 2) * hT;
  const off = (a - c) / 2;
  return {
    title: 'Trapezprisma: Volumen',
    text: `Ein Prisma hat ein Trapez als Grundfläche ($a = ${q(a, u)}$, $c = ${q(c, u)}$, Trapezhöhe $${q(hT, u)}$). Das Prisma ist $h = ${q(h, u)}$ lang.`,
    figure: <PrismFig front={[[0, 0], [a, 0], [off + c, hT], [off, hT]]} len={Math.max(h * 0.5, a * 0.5)} edgeLabels={{ 0: `a = ${a} ${u}`, 2: `c = ${c} ${u}` }} height={{ from: [off, hT], to: [off, 0], label: `${hT} ${u}` }} llen={`h = ${h} ${u}`} />,
    parts: [num('$G$', G, areaOf(u)), num('$V$', G * h, volOf(u))],
    solution: [`$G = \\frac{a + c}{2} \\cdot h_a = \\frac{${a} + ${c}}{2} \\cdot ${hT} = ${q(G, areaOf(u))}$`, `$V = G \\cdot h = ${q(G, areaOf(u))} \\cdot ${q(h, u)} = ${q(G * h, volOf(u))}$`],
    };
};

const dreieckC: Gen = () => {
  const c = ri(8, 20);
  const hc = ri(6, 25);
  const L = ri(15, 40);
  const V = 0.5 * c * hc * L;
  return {
    title: 'Dachbreite aus dem Volumen',
    text: `Ein Dachraum hat die Form eines dreiseitigen Prismas. Er ist $${q(L, 'm')}$ lang, die dreieckige Giebelfront ist $${q(hc, 'm')}$ hoch. Der Dachraum hat ein Volumen von $${q(V, 'm³')}$. Wie breit ist das Dach?`,
    figure: <PrismFig front={triFront(c, hc, 0.5)} len={Math.max(L * 0.4, c * 0.5)} edgeLabels={{ 0: 'c = ?' }} height={{ from: [c / 2, hc], to: [c / 2, 0], label: `${hc} m` }} llen={`${L} m`} />,
    parts: [num('$c$', c, 'm')],
    solution: [`$V = \\frac{1}{2} \\cdot c \\cdot h_c \\cdot h \\;\\Rightarrow\\; c = \\frac{2 \\cdot V}{h_c \\cdot h}$`, `$c = \\frac{2 \\cdot ${de(V)}}{${hc} \\cdot ${L}} = ${q(c, 'm')}$`],
  };
};

// Anwendungen
const aquarium: Gen = () => {
  const a = pick([60, 80, 100, 120]);
  const b = pick([30, 35, 40, 50]);
  const h = pick([40, 50, 60]);
  const f = pick([5, 8, 10]);
  const V = (a * b * (h - f)) / 1000;
  return {
    title: 'Aquarium befüllen',
    badge: 'Anwendung',
    text: `${name()} füllt ein Aquarium (innen $${q(a, 'cm')}$ lang, $${q(b, 'cm')}$ breit, $${q(h, 'cm')}$ hoch) bis $${q(f, 'cm')}$ unter den Rand.`,
    figure: <QuaderFig a={a} b={b} h={h} la={`${a} cm`} lb={`${b} cm`} lh={`${h} cm`} />,
    parts: [num('Wasser', V, 'l', { strict: true })],
    solution: [`Wasserhöhe: $${h} - ${f} = ${q(h - f, 'cm')}$`, `In dm: $${tx(a / 10)} \\cdot ${tx(b / 10)} \\cdot ${tx((h - f) / 10)} = ${q(V, 'dm³')} = ${tx(V)}\\,\\text{l}$`],
  };
};

const zelt: Gen = () => {
  const l = pick([2.2, 2.5, 3, 3.4]);
  const b = pick([1.6, 1.8, 2, 2.1]);
  const h = pick([1.2, 1.4, 1.5, 1.6]);
  const s = Math.hypot(b / 2, h);
  const V = 0.5 * b * h * l;
  const stoff = 2 * ((b * h) / 2) + 2 * s * l + b * l;
  return {
    title: 'Zelt',
    badge: 'Anwendung',
    text: `Ein Zelt hat die Form eines liegenden Prismas mit einem gleichschenkligen Dreieck als Grundfläche. Es ist $${q(l, 'm')}$ lang, $${q(b, 'm')}$ breit und $${q(h, 'm')}$ hoch.`,
    figure: <PrismFig front={triFront(b, h, 0.5)} len={l * 0.9} edgeLabels={{ 0: `${de(b)} m`, 1: 's = ?' }} height={{ from: [b / 2, h], to: [b / 2, 0], label: `${de(h)} m` }} llen={`${de(l)} m`} />,
    parts: [
      num('$V$', V, 'm³', { q: 'a) Berechne den Rauminhalt des Zeltes.' }),
      num('$s$', s, 'm', { q: 'b) Wie lang ist eine schräge Zeltwand ($s$)?' }),
      num('Stoff', 2 * ((b * h) / 2) + 2 * round(s, 2) * l + b * l, 'm²', { q: 'c) Wie viel Stoff wird inklusive Boden benötigt?', tol: stoff * 0.01 }),
    ],
    solution: [
      `a) $V = \\frac{1}{2} \\cdot ${q(b, 'm')} \\cdot ${q(h, 'm')} \\cdot ${q(l, 'm')} ${res(V, 'm³')}$`,
      `b) Pythagoras: $s = \\sqrt{(${q(b / 2, 'm')})^2 + (${q(h, 'm')})^2} ${res(s, 'm')}$`,
      `c) 2 Giebel: $2 \\cdot \\frac{${tx(b)} \\cdot ${tx(h)}}{2} = ${q(b * h, 'm²')}$; 2 Seiten: $2 \\cdot ${tx(round(s, 2))} \\cdot ${tx(l)} ${res(2 * round(s, 2) * l, 'm²')}$; Boden: $${tx(b)} \\cdot ${tx(l)} = ${q(b * l, 'm²')}$`,
      `Gesamt: $A ${res(b * h + 2 * round(s, 2) * l + b * l, 'm²')}$`,
    ],
  };
};

const becken: Gen = () => {
  const L = pick([20, 25]);
  const b = pick([8, 10, 12.5]);
  const t1 = pick([0.8, 1]);
  const t2 = pick([1.8, 2, 2.2]);
  const rate = pick([1.5, 2, 2.5]);
  const V = ((t1 + t2) / 2) * L * b;
  const k = L / 4 / t2;
  return {
    title: 'Schwimmbecken füllen',
    badge: 'Anwendung',
    text: `Ein Schwimmbecken ist $${q(L, 'm')}$ lang und $${q(b, 'm')}$ breit. Der Boden fällt gleichmäßig von $${q(t1, 'm')}$ auf $${q(t2, 'm')}$ Tiefe ab (Trapez als Grundfläche). Pro Minute fließen $${q(rate, 'm³')}$ Wasser hinein.`,
    figure: (
      <PrismFig
        front={[[0, (t2 - t1) * k], [L, 0], [L, t2 * k], [0, t2 * k]]}
        len={b * 0.8}
        edgeLabels={{ 1: `${de(t2)} m`, 2: `${L} m`, 3: `${de(t1)} m` }}
        llen={`${de(b)} m`}
        fill="#bae6fd"
      />
    ),
    parts: [num('$V$', V, 'm³', { q: 'a) Wie viel Wasser passt in das Becken?' }), num('Zeit', V / rate / 60, 'h', { q: 'b) Wie lange dauert das Füllen (in Stunden)?' })],
    solution: [
      `a) Trapez: $G = \\frac{${tx(t1)} + ${tx(t2)}}{2} \\cdot ${L} = ${q(((t1 + t2) / 2) * L, 'm²')}$; $V = G \\cdot ${q(b, 'm')} = ${q(V, 'm³')}$`,
      `b) $${tx(V)} : ${tx(rate)} = ${q(V / rate, 'min')}$; $: 60 ${res(V / rate / 60, 'h')}$`,
    ],
  };
};

const sandkasten: Gen = () => {
  const a = pick([1.5, 2, 2.5]);
  const b = pick([1.5, 2]);
  const t = pick([30, 35, 40]);
  const p = pick([35, 42, 48]);
  const V = a * b * (t / 100);
  return {
    title: 'Sandkasten',
    badge: 'Anwendung',
    text: `${family()} baut einen Sandkasten ($${q(a, 'm')}$ × $${q(b, 'm')}$). Er wird $${q(t, 'cm')}$ hoch mit Sand gefüllt. $1\\,\\text{m}^3$ Sand kostet $${q(p, '€')}$.`,
    parts: [num('Sand', V, 'm³', { q: 'a) Wie viel Sand wird benötigt?' }), num('Kosten', V * p, '€', { q: 'b) Was kostet der Sand?' })],
    solution: [`a) $${q(t, 'cm')} = ${q(t / 100, 'm')}$; $V = ${tx(a)} \\cdot ${tx(b)} \\cdot ${tx(t / 100)} ${res(V, 'm³')}$`, `b) $${tx(round(V, 3), 3)} \\cdot ${p} ${res(round(V, 3) * p, '€')}$`],
  };
};

const geschenk: Gen = () => {
  const a = ri(20, 40);
  const b = ri(15, 30);
  const h = ri(5, 20);
  const z = pick([10, 15, 20]);
  const O = 2 * (a * b + b * h + a * h);
  return {
    title: 'Geschenk einpacken',
    badge: 'Anwendung',
    text: `Ein quaderförmiges Geschenk ist $${q(a, 'cm')}$ lang, $${q(b, 'cm')}$ breit und $${q(h, 'cm')}$ hoch. Für Überlappungen braucht man $${z}\\,\\%$ mehr Papier.`,
    figure: <QuaderFig a={a} b={b} h={h} la={`${a} cm`} lb={`${b} cm`} lh={`${h} cm`} />,
    parts: [num('$O$', O, 'cm²', { q: 'a) Wie groß ist die Oberfläche?' }), num('Papier', O * (1 + z / 100), 'cm²', { q: 'b) Wie viel Papier wird benötigt?' })],
    solution: [`a) $O = 2 \\cdot (${a * b} + ${b * h} + ${a * h}) = ${q(O, 'cm²')}$`, `b) $${O} \\cdot ${tx(1 + z / 100)} = ${q(O * (1 + z / 100), 'cm²')}$`],
  };
};

const brotzeitbox: Gen = () => {
  const a = pick([16, 18, 20]);
  const b = pick([10, 12]);
  const h = pick([4, 4.5, 5, 6]);
  const V = a * b * h;
  return {
    title: 'Brotzeitbox',
    badge: 'Anwendung',
    text: `Eine quaderförmige Brotzeitbox hat ein Volumen von $${q(V, 'cm³')}$. Sie ist $${q(a, 'cm')}$ lang und $${q(b, 'cm')}$ breit. Wie hoch ist sie?`,
    figure: <QuaderFig a={a} b={b} h={h} la={`${a} cm`} lb={`${b} cm`} lh="h = ?" />,
    parts: [num('$h$', h, 'cm')],
    solution: [`$h = \\frac{V}{a \\cdot b} = \\frac{${V}}{${a} \\cdot ${b}} = ${q(h, 'cm')}$`],
  };
};

const BASIC_V = [wuerfel, quaderV, quaderH, dreiecksprismaV, trapezprisma];
const BASIC_O = [wuerfel, quaderO, dreiecksprismaO, quaderDiag];
const APPS = [aquarium, zelt, becken, sandkasten, geschenk, brotzeitbox];

const ex = {
  title: 'Trapezprisma: G zuerst!',
  text: 'Ein Prisma hat ein Trapez als Grundfläche ($a = 2{,}5\\,\\text{m}$, $c = 1{,}5\\,\\text{m}$, Trapezhöhe $1\\,\\text{m}$) und ist $3{,}5\\,\\text{m}$ lang.',
  figure: <PrismFig front={[[0, 0], [2.5, 0], [2, 1], [0.5, 1]]} len={2.2} edgeLabels={{ 0: 'a = 2,5 m', 2: 'c = 1,5 m' }} height={{ from: [0.5, 1], to: [0.5, 0], label: '1 m' }} llen="h = 3,5 m" />,
  steps: [
    'Grundfläche (Trapez): $G = \\frac{2{,}5\\,\\text{m} + 1{,}5\\,\\text{m}}{2} \\cdot 1\\,\\text{m} = 2\\,\\text{m}^2$',
    'Volumen: $V = G \\cdot h = 2\\,\\text{m}^2 \\cdot 3{,}5\\,\\text{m} = 7\\,\\text{m}^3$',
    'Oberfläche: $O = 2 \\cdot G + M$ mit $M = u \\cdot h$ (Umfang der Grundfläche mal Prismenhöhe)',
  ],
  tip: 'Die **Prismenhöhe** $h$ steht senkrecht auf der Grundfläche – sie ist nicht die Höhe des Trapezes oder Dreiecks!',
};

const pages: PracticeConfig[] = [
  { slug: 'volumen', title: 'Volumen von Prismen', description: 'Würfel, Quader, Dreiecks- und Trapezprisma', formulas: F_PRISMA, example: ex, gens: BASIC_V, apps: APPS },
  { slug: 'oberflaeche', title: 'Oberfläche von Prismen', description: 'Würfel, Quader, Dreiecksprisma', formulas: F_PRISMA, example: ex, gens: BASIC_O, apps: APPS },
  {
    slug: 'gemischt',
    title: 'Gemischt und Umstellen',
    description: 'Höhe, Kante und Diagonale berechnen',
    formulas: F_PRISMA,
    example: {
      title: 'Höhe aus dem Volumen',
      text: 'Eine Brotzeitbox hat $V = 864\\,\\text{cm}^3$, ist $18\\,\\text{cm}$ lang und $12\\,\\text{cm}$ breit.',
      figure: <QuaderFig a={18} b={12} h={4} la="18 cm" lb="12 cm" lh="h = ?" />,
      steps: ['$V = a \\cdot b \\cdot h \\quad | : (a \\cdot b)$', '$h = \\frac{864\\,\\text{cm}^3}{18\\,\\text{cm} \\cdot 12\\,\\text{cm}} = 4\\,\\text{cm}$'],
    },
    gens: [...BASIC_V, quaderO, quaderDiag, wuerfelA, dreieckC, dreiecksprismaO],
    apps: APPS,
  },
  {
    slug: 'anwendungsaufgaben',
    title: 'Anwendungsaufgaben',
    description: 'Alltag und Abschlussprüfung',
    formulas: F_PRISMA,
    example: ex,
    gens: [],
    apps: APPS,
    fixed: examsFor('prisma'),
    nBasic: 0,
    nApp: 3,
    nFixed: 2,
  },
];

export const prisma: TopicConfig = { slug: 'prisma', title: 'Prisma', description: 'Würfel, Quader und andere Prismen', icon: 'box', pages };

export { APPS as PRISMA_APPS };
