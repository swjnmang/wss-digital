import type { Gen, PracticeConfig, Task, TopicConfig } from '../engine/types';
import { convert, de, pick, q, ri, rs, shuffle, tx, UNITS, type UnitId } from '../engine/util';
import { choice, name, num } from './helpers';

const LEN: UnitId[] = ['mm', 'cm', 'dm', 'm', 'km'];
const AREA: UnitId[] = ['mm²', 'cm²', 'dm²', 'm²'];
const VOL: UnitId[] = ['mm³', 'cm³', 'dm³', 'm³'];

function factorText(from: UnitId, to: UnitId): { line: string; result: string } {
  const r = UNITS[from].f / UNITS[to].f;
  if (r > 1) return { line: `1\\,${UNITS[from].tex} = ${tx(r, 6)}\\,${UNITS[to].tex}`, result: `\\cdot ${tx(r, 6)}` };
  return { line: `1\\,${UNITS[to].tex} = ${tx(1 / r, 6)}\\,${UNITS[from].tex}`, result: `: ${tx(1 / r, 6)}` };
}

function convTask(from: UnitId, to: UnitId, v: number, title: string): Task {
  const res = convert(v, from, to);
  const f = factorText(from, to);
  return {
    title,
    text: `Rechne um: $${q(v, from, 4)} = \\;?\\;${UNITS[to].tex}$`,
    parts: [num(`$${q(v, from, 4)}$`, res, to, { strict: true, tol: Math.abs(res) * 1e-6 + 1e-9 })],
    solution: [`$${f.line}$`, `$${tx(v, 4)} ${f.result} = ${tx(res, 6)}$, also $${q(v, from, 4)} = ${q(res, to, 6)}$`],
  };
}

function ladderGen(ladder: UnitId[], maxDist: number, title: string): Gen {
  return () => {
    let i = 0;
    let j = 0;
    while (i === j || Math.abs(i - j) > maxDist) {
      i = ri(0, ladder.length - 1);
      j = ri(0, ladder.length - 1);
    }
    const from = ladder[i];
    const to = ladder[j];
    // Wert so wählen, dass das Ergebnis nicht zu klein wird
    const v = j > i ? pick([ri(2, 9) * 100, ri(12, 950) * 10, ri(1500, 98000)]) : pick([rs(0.2, 9.5, 0.1), ri(2, 85), rs(1.25, 12.75, 0.25)]);
    return convTask(from, to, v, title);
  };
}

const laenge = ladderGen(LEN, 2, 'Längen umrechnen');
const flaeche = ladderGen(AREA, 2, 'Flächen umrechnen');
const volumen = ladderGen(VOL, 1, 'Volumen umrechnen');

const liter: Gen = () => {
  const cases: [UnitId, UnitId, number][] = [
    ['l', 'cm³', rs(0.25, 5, 0.25)],
    ['l', 'dm³', ri(2, 250)],
    ['m³', 'l', rs(0.5, 12, 0.5)],
    ['ml', 'l', ri(5, 95) * 10],
    ['cm³', 'l', ri(2, 95) * 50],
    ['l', 'ml', rs(0.2, 3, 0.1)],
    ['dm³', 'l', rs(1.5, 40, 0.5)],
    ['l', 'm³', ri(5, 90) * 100],
  ];
  const [from, to, v] = pick(cases);
  const t = convTask(from, to, v, 'Liter und Kubik');
  t.solution.unshift('$1\\,\\text{l} = 1\\,\\text{dm}^3 \\quad 1\\,\\text{ml} = 1\\,\\text{cm}^3 \\quad 1\\,\\text{m}^3 = 1000\\,\\text{l}$');
  return t;
};

const summeLaengen: Gen = () => {
  const m = rs(1.2, 4.8, 0.1);
  const cm = ri(15, 95);
  const mm = ri(12, 95) * 10;
  const sumCm = m * 100 + cm + mm / 10;
  return {
    title: 'Längen addieren',
    text: `Berechne in Zentimeter: $${q(m, 'm')} + ${q(cm, 'cm')} + ${q(mm, 'mm')}$`,
    parts: [num('Summe', sumCm, 'cm', { strict: true })],
    solution: [`Erst alles in cm umrechnen: $${q(m, 'm')} = ${q(m * 100, 'cm')}$, $${q(mm, 'mm')} = ${q(mm / 10, 'cm')}$`, `$${tx(m * 100)} + ${cm} + ${tx(mm / 10)} = ${q(sumCm, 'cm')}$`],
  };
};

const laufen: Gen = () => {
  const n = ri(3, 12);
  const r = pick([200, 400, 800]);
  return {
    title: 'Runden laufen',
    badge: 'Anwendung',
    text: `${name()} läuft im Sportunterricht $${n}$ Runden auf der Bahn. Eine Runde ist $${q(r, 'm')}$ lang. Wie viele Kilometer sind das?`,
    parts: [num('Strecke', (n * r) / 1000, 'km', { strict: true })],
    solution: [`$${n} \\cdot ${q(r, 'm')} = ${q(n * r, 'm')}$`, `$${q(n * r, 'm')} = ${q((n * r) / 1000, 'km')}$ (durch 1000)`],
  };
};

const flaschen: Gen = () => {
  const fl = pick([0.75, 1, 1.5, 2]);
  const gl = pick([150, 200, 250]);
  const n = Math.floor((fl * 1000) / gl);
  return {
    title: 'Gläser füllen',
    badge: 'Anwendung',
    text: `Eine Flasche enthält $${q(fl, 'l')}$ Saft. Wie viele Gläser zu je $${q(gl, 'ml')}$ kann man **vollständig** füllen?`,
    parts: [num('Gläser', n, null, { integer: true })],
    solution: [`$${q(fl, 'l')} = ${q(fl * 1000, 'ml')}$`, `$${de(fl * 1000)} : ${gl} = ${tx((fl * 1000) / gl)}$ → $${n}$ volle Gläser`],
  };
};

const aquarium: Gen = () => {
  const a = pick([60, 80, 100, 120]);
  const b = pick([30, 35, 40, 50]);
  const h = pick([40, 45, 50, 60]);
  const V = a * b * h;
  return {
    title: 'Aquarium',
    badge: 'Anwendung',
    text: `Ein Aquarium hat innen ein Volumen von $${q(V, 'cm³')}$. Wie viele Liter Wasser passen hinein?`,
    parts: [num('Wasser', V / 1000, 'l', { strict: true })],
    solution: [`$1\\,\\text{l} = 1\\,\\text{dm}^3 = 1000\\,\\text{cm}^3$`, `$${q(V, 'cm³')} : 1000 = ${q(V / 1000, 'l')}$`],
  };
};

const zimmerDm: Gen = () => {
  const A = rs(8.5, 24, 0.5);
  const fl = pick([25, 30, 40, 50]);
  const n = Math.ceil((A * 10000) / (fl * fl));
  return {
    title: 'Fliesen zählen',
    badge: 'Anwendung',
    text: `Ein Badezimmerboden ist $${q(A, 'm²')}$ groß. Er wird mit quadratischen Fliesen ($${q(fl, 'cm')}$ × $${q(fl, 'cm')}$) belegt. Wie viele Fliesen braucht man mindestens?`,
    parts: [num('Fliesen', n, null, { integer: true })],
    solution: [`Eine Fliese: $${fl} \\cdot ${fl} = ${q(fl * fl, 'cm²')}$`, `$${q(A, 'm²')} = ${q(A * 10000, 'cm²')}$`, `$${de(A * 10000)} : ${fl * fl} \\approx ${tx((A * 10000) / (fl * fl))}$ → aufrunden: $${n}$ Fliesen`],
  };
};

// --- Welche Einheit passt? ---------------------------------------------------

const SITUATIONS: [string, UnitId, UnitId[]][] = [
  ['die Länge eines Gartenzauns', 'm', ['m²', 'm³']],
  ['die Wassermenge in einer Badewanne', 'l', ['m', 'm²']],
  ['die Fläche eines Fußballfeldes', 'm²', ['m', 'm³']],
  ['das Volumen eines Würfelzuckers', 'cm³', ['cm', 'cm²']],
  ['den Umfang einer Pizza', 'cm', ['cm²', 'cm³']],
  ['die Größe eines Handydisplays (Fläche)', 'cm²', ['cm', 'cm³']],
  ['die Menge Beton für eine Garage', 'm³', ['m', 'm²']],
  ['die Dicke einer Münze', 'mm', ['mm²', 'mm³']],
  ['den Stoff für eine Tischdecke', 'm²', ['m', 'm³']],
  ['den Inhalt einer Getränkedose', 'ml', ['cm', 'cm²']],
  ['die Entfernung von München nach Berlin', 'km', ['km²', 'm³']],
  ['die Farbe für eine Wand (gestrichene Fläche)', 'm²', ['m', 'l']],
];

const welcheEinheit: Gen = () => {
  const [sit, right, wrong] = pick(SITUATIONS);
  return {
    title: 'Welche Einheit passt?',
    text: `Welche Einheit passt für ${sit}?`,
    parts: [choice('Wähle die passende Einheit:', right, wrong)],
    solution: ['Länge/Strecke/Umfang → mm, cm, m, km', 'Fläche → cm², m² (zwei Längen multipliziert)', 'Volumen/Rauminhalt → cm³, m³, l (drei Längen multipliziert)'],
  };
};

const ergebnisEinheit: Gen = () => {
  const u = pick<UnitId>(['cm', 'm', 'mm']);
  const cases: [string, string, UnitId][] = [
    ['$A = a \\cdot b$', 'Flächeninhalt eines Rechtecks', `${u}²` as UnitId],
    ['$u = 2 \\cdot r \\cdot \\pi$', 'Umfang eines Kreises', u],
    ['$V = a \\cdot b \\cdot h$', 'Volumen eines Quaders', `${u}³` as UnitId],
    ['$O = 4 \\cdot r^2 \\cdot \\pi$', 'Oberfläche einer Kugel', `${u}²` as UnitId],
    ['$V = r^2 \\cdot \\pi \\cdot h$', 'Volumen eines Zylinders', `${u}³` as UnitId],
    ['$c^2 = a^2 + b^2$', 'Hypotenuse $c$ (Pythagoras)', u],
    ['$M = r \\cdot s \\cdot \\pi$', 'Mantelfläche eines Kegels', `${u}²` as UnitId],
  ];
  const [f, what, right] = pick(cases);
  const all = shuffle([u, `${u}²`, `${u}³`]).filter((x) => x !== right);
  return {
    title: 'Einheit des Ergebnisses',
    text: `Alle Längen sind in ${u} gegeben. Du berechnest ${what} mit ${f}.`,
    parts: [choice('In welcher Einheit steht das Ergebnis?', right, all)],
    solution: [`${what}: ${right.endsWith('³') ? 'Volumen → Kubik-Einheit' : right.endsWith('²') ? 'Fläche → Quadrat-Einheit' : 'Strecke → Längeneinheit'} (${right})`],
  };
};

const vergleich: Gen = () => {
  const cases: [string, string, string[]][] = [
    ['$1\\,\\text{m}^2$', '$100\\,\\text{dm}^2$', ['$10\\,\\text{dm}^2$', '$1000\\,\\text{dm}^2$']],
    ['$1\\,\\text{m}^3$', '$1000\\,\\text{l}$', ['$100\\,\\text{l}$', '$10\\,\\text{l}$']],
    ['$1\\,\\text{dm}^3$', '$1\\,\\text{l}$', ['$10\\,\\text{l}$', '$100\\,\\text{ml}$']],
    ['$1\\,\\text{cm}^2$', '$100\\,\\text{mm}^2$', ['$10\\,\\text{mm}^2$', '$1000\\,\\text{mm}^2$']],
    ['$1\\,\\text{cm}^3$', '$1\\,\\text{ml}$', ['$1\\,\\text{l}$', '$10\\,\\text{ml}$']],
    ['$1\\,\\text{km}$', '$1000\\,\\text{m}$', ['$100\\,\\text{m}$', '$10.000\\,\\text{m}$']],
    ['$1\\,\\text{m}^2$', '$10.000\\,\\text{cm}^2$', ['$100\\,\\text{cm}^2$', '$1000\\,\\text{cm}^2$']],
    ['$1\\,\\text{m}^3$', '$1.000.000\\,\\text{cm}^3$', ['$1000\\,\\text{cm}^3$', '$100.000\\,\\text{cm}^3$']],
  ];
  const [a, right, wrong] = pick(cases);
  return {
    title: 'Was ist gleich groß?',
    text: `Welche Angabe ist genauso groß wie ${a}?`,
    parts: [choice('Wähle aus:', right, wrong)],
    solution: ['Länge: Faktor 10 (km → m: 1000)', 'Fläche: Faktor 100', 'Volumen: Faktor 1000; $1\\,\\text{l} = 1\\,\\text{dm}^3$, $1\\,\\text{ml} = 1\\,\\text{cm}^3$'],
  };
};

const TREPPE = '\\text{km} \\xrightarrow{\\cdot 1000} \\text{m} \\xrightarrow{\\cdot 10} \\text{dm} \\xrightarrow{\\cdot 10} \\text{cm} \\xrightarrow{\\cdot 10} \\text{mm}';

const pages: PracticeConfig[] = [
  {
    slug: 'laengen',
    title: 'Längeneinheiten',
    description: 'mm, cm, dm, m, km',
    formulas: [TREPPE, '\\text{größere → kleinere Einheit: mal}', '\\text{kleinere → größere Einheit: geteilt}'],
    example: {
      title: '3,5 m in cm umrechnen',
      text: 'Wie viele Zentimeter sind $3{,}5\\,\\text{m}$?',
      steps: ['$1\\,\\text{m} = 100\\,\\text{cm}$ (zwei Stufen: $\\cdot 10 \\cdot 10$)', 'Von der größeren zur kleineren Einheit wird **multipliziert**: $3{,}5 \\cdot 100 = 350$', 'Ergebnis: $3{,}5\\,\\text{m} = 350\\,\\text{cm}$'],
      tip: 'Wähle bei jedem Ergebnis die Einheit selbst aus – auch wenn sie in der Aufgabe steht.',
    },
    gens: [laenge, laenge, summeLaengen],
    apps: [laufen],
    nBasic: 5,
    nApp: 1,
  },
  {
    slug: 'flaechen',
    title: 'Flächeneinheiten',
    description: 'mm², cm², dm², m² (Faktor 100)',
    formulas: ['\\text{m}^2 \\xrightarrow{\\cdot 100} \\text{dm}^2 \\xrightarrow{\\cdot 100} \\text{cm}^2 \\xrightarrow{\\cdot 100} \\text{mm}^2', '1\\,\\text{km}^2 = 1.000.000\\,\\text{m}^2'],
    example: {
      title: '2,5 m² in dm² umrechnen',
      text: 'Wie viele Quadratdezimeter sind $2{,}5\\,\\text{m}^2$?',
      steps: ['Ein Quadrat mit $1\\,\\text{m}$ Seitenlänge hat $10\\,\\text{dm} \\cdot 10\\,\\text{dm} = 100\\,\\text{dm}^2$.', 'Also: $1\\,\\text{m}^2 = 100\\,\\text{dm}^2$', '$2{,}5 \\cdot 100 = 250$ → $2{,}5\\,\\text{m}^2 = 250\\,\\text{dm}^2$'],
      tip: 'Bei Flächen ist der Umrechnungsfaktor zwischen benachbarten Einheiten immer **100**.',
    },
    gens: [flaeche, flaeche, vergleich],
    apps: [zimmerDm],
    nBasic: 5,
    nApp: 1,
  },
  {
    slug: 'volumen',
    title: 'Volumeneinheiten und Liter',
    description: 'mm³ … m³, Liter und Milliliter',
    formulas: ['\\text{m}^3 \\xrightarrow{\\cdot 1000} \\text{dm}^3 \\xrightarrow{\\cdot 1000} \\text{cm}^3 \\xrightarrow{\\cdot 1000} \\text{mm}^3', '1\\,\\text{l} = 1\\,\\text{dm}^3', '1\\,\\text{ml} = 1\\,\\text{cm}^3', '1\\,\\text{m}^3 = 1000\\,\\text{l}'],
    example: {
      title: '0,8 m³ in Liter umrechnen',
      text: 'Ein Wassertank fasst $0{,}8\\,\\text{m}^3$. Wie viele Liter sind das?',
      steps: ['$1\\,\\text{m}^3 = 1000\\,\\text{dm}^3$ und $1\\,\\text{dm}^3 = 1\\,\\text{l}$', '$0{,}8 \\cdot 1000 = 800$ → $0{,}8\\,\\text{m}^3 = 800\\,\\text{l}$'],
      tip: 'Sind Liter gesucht, rechne alle Längen am besten gleich in **dm** um – dann kommt das Volumen direkt in dm³ = Liter heraus.',
    },
    gens: [volumen, liter, liter],
    apps: [aquarium, flaschen],
    nBasic: 4,
    nApp: 2,
  },
  {
    slug: 'welche-einheit',
    title: 'Welche Einheit passt?',
    description: 'Länge, Fläche oder Volumen erkennen',
    formulas: ['\\text{Strecke: cm, m}', '\\text{Fläche: cm}^2\\text{, m}^2', '\\text{Volumen: cm}^3\\text{, m}^3\\text{, l}'],
    example: {
      title: 'Strecke, Fläche oder Volumen?',
      text: 'Ein Würfel hat die Kantenlänge $a = 3\\,\\text{cm}$.',
      steps: ['Kantenlänge (Strecke): $3\\,\\text{cm}$', 'Oberfläche: $O = 6 \\cdot a^2 = 54\\,\\text{cm}^2$ → **Quadrat**-Einheit', 'Volumen: $V = a^3 = 27\\,\\text{cm}^3$ → **Kubik**-Einheit'],
      tip: 'Werden zwei Längen multipliziert, entsteht eine Fläche (²). Bei drei Längen entsteht ein Volumen (³).',
    },
    gens: [welcheEinheit, ergebnisEinheit, vergleich, laenge, flaeche, volumen],
    apps: [aquarium, zimmerDm, flaschen, laufen],
    nBasic: 5,
    nApp: 1,
  },
];

export const einheiten: TopicConfig = {
  slug: 'einheiten',
  title: 'Einheiten umrechnen',
  description: 'Längen, Flächen, Volumen und Liter',
  icon: 'scale',
  pages,
};
