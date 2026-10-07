import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, shuffle, tx, type UnitId } from '../engine/util';
import Scene, { C, type El, type P } from '../figures/Scene';
import { RectFig, RightTriFig, TriFig } from '../figures/shapes';
import { choice, lenUnit, name, num, res } from './helpers';

const F_PYTH = ['c^2 = a^2 + b^2', '\\text{Hypotenuse}^2 = \\text{Kathete}^2 + \\text{Kathete}^2', 'c = \\sqrt{a^2 + b^2}', 'a = \\sqrt{c^2 - b^2}'];

const LETTERS: [string, string, string][] = [
  ['A', 'B', 'C'],
  ['R', 'S', 'T'],
  ['D', 'E', 'F'],
  ['K', 'L', 'M'],
  ['P', 'Q', 'R'],
  ['X', 'Y', 'Z'],
  ['U', 'V', 'W'],
];

/** Zufälliges Dreieck: Ecke mit rechtem Winkel und Seitennamen */
function triNames() {
  const set = shuffle(pick(LETTERS));
  const [R, X, Y] = set;
  return {
    names: [R, X, Y] as [string, string, string],
    // Seite gegenüber einer Ecke = Kleinbuchstabe
    k1: Y.toLowerCase(), // Strecke R–X
    k2: X.toLowerCase(), // Strecke R–Y
    h: R.toLowerCase(),
    tri: [...set].sort().join(''),
  };
}

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [6, 8, 10],
  [9, 12, 15],
  [20, 21, 29],
  [9, 40, 41],
  [12, 16, 20],
];

function legs(): [number, number] {
  if (Math.random() < 0.4) {
    const [a, b] = pick(TRIPLES);
    const k = pick([1, 1, 0.5, 2, 1.5]);
    return Math.random() < 0.5 ? [a * k, b * k] : [b * k, a * k];
  }
  return [rs(2, 15, 0.5), rs(2, 15, 0.5)];
}

const rot = () => pick([0, 0, 30, 90, 150, 200, 270, 320]);

// ---------------------------------------------------------------------------
// Grundlagen
// ---------------------------------------------------------------------------

const hypotenuseErkennen: Gen = () => {
  const t = triNames();
  const [a, b] = legs();
  return {
    title: 'Hypotenuse erkennen',
    text: `Im Dreieck ${t.tri} liegt der rechte Winkel bei ${t.names[0]}.`,
    figure: <RightTriFig k1={a} k2={b} l1={t.k1} l2={t.k2} lh={t.h} names={t.names} rot={rot()} mirror={Math.random() < 0.5} />,
    parts: [choice('Welche Seite ist die Hypotenuse?', `$${t.h}$`, [`$${t.k1}$`, `$${t.k2}$`])],
    solution: [`Die Hypotenuse liegt **gegenüber vom rechten Winkel** und ist die längste Seite: $${t.h}$.`, `Die Katheten sind $${t.k1}$ und $${t.k2}$.`],
  };
};

const gleichungWaehlen: Gen = () => {
  const t = triNames();
  const [a, b] = legs();
  const right = `$${t.h}^2 = ${t.k1}^2 + ${t.k2}^2$`;
  return {
    title: 'Gleichung aufstellen',
    text: `Gegeben ist das rechtwinklige Dreieck ${t.tri}. Stelle den Satz des Pythagoras auf.`,
    figure: <RightTriFig k1={a} k2={b} l1={t.k1} l2={t.k2} lh={t.h} names={t.names} rot={rot()} mirror={Math.random() < 0.5} />,
    parts: [choice('Welche Gleichung ist richtig?', right, [`$${t.k1}^2 = ${t.h}^2 + ${t.k2}^2$`, `$${t.k2}^2 = ${t.k1}^2 + ${t.h}^2$`])],
    solution: [`Hypotenuse (gegenüber vom rechten Winkel bei ${t.names[0]}): $${t.h}$`, `$\\text{Hypotenuse}^2 = \\text{Kathete}^2 + \\text{Kathete}^2$ → ${right}`],
  };
};

const umgestellt: Gen = () => {
  const t = triNames();
  const [a, b] = legs();
  const right = `$${t.k1} = \\sqrt{${t.h}^2 - ${t.k2}^2}$`;
  return {
    title: 'Kathete gesucht – richtig umstellen',
    text: `Im Dreieck ${t.tri} (rechter Winkel bei ${t.names[0]}) sind $${t.h}$ und $${t.k2}$ bekannt. Gesucht ist $${t.k1}$.`,
    figure: <RightTriFig k1={a} k2={b} l1={`${t.k1} = ?`} l2={t.k2} lh={t.h} names={t.names} rot={rot()} />,
    parts: [choice('Mit welcher Formel berechnest du die gesuchte Seite?', right, [`$${t.k1} = \\sqrt{${t.h}^2 + ${t.k2}^2}$`, `$${t.k1} = ${t.h} - ${t.k2}$`])],
    solution: [`$${t.h}^2 = ${t.k1}^2 + ${t.k2}^2 \\quad | - ${t.k2}^2$`, `$${t.k1}^2 = ${t.h}^2 - ${t.k2}^2 \\quad | \\sqrt{\\;}$`, right],
  };
};

// ---------------------------------------------------------------------------
// Berechnen
// ---------------------------------------------------------------------------

const hypBerechnen: Gen = () => {
  const t = triNames();
  const u = lenUnit();
  const [a, b] = legs();
  const c = Math.hypot(a, b);
  return {
    title: 'Hypotenuse berechnen',
    text: `Im Dreieck ${t.tri} ist der Winkel bei ${t.names[0]} ein rechter Winkel. Es gilt $${t.k1} = ${q(a, u)}$ und $${t.k2} = ${q(b, u)}$. Berechne $${t.h}$.`,
    figure: <RightTriFig k1={a} k2={b} l1={`${t.k1} = ${de(a)} ${u}`} l2={`${t.k2} = ${de(b)} ${u}`} lh={`${t.h} = ?`} names={t.names} rot={rot()} />,
    parts: [num(`$${t.h}$`, c, u)],
    solution: [
      `$${t.h}^2 = ${t.k1}^2 + ${t.k2}^2$`,
      `$${t.h} = \\sqrt{(${q(a, u)})^2 + (${q(b, u)})^2} = \\sqrt{${tx(a * a + b * b)}\\,\\text{${u}}^2} ${res(c, u)}$`,
    ],
  };
};

const katheteBerechnen: Gen = () => {
  const t = triNames();
  const u = lenUnit();
  const [a, b] = legs();
  const c = round(Math.hypot(a, b), 1);
  const k = Math.sqrt(c * c - b * b);
  return {
    title: 'Kathete berechnen',
    text: `Im rechtwinkligen Dreieck ${t.tri} (rechter Winkel bei ${t.names[0]}) ist $${t.h} = ${q(c, u)}$ und $${t.k2} = ${q(b, u)}$. Berechne $${t.k1}$.`,
    figure: <RightTriFig k1={k} k2={b} l1={`${t.k1} = ?`} l2={`${t.k2} = ${de(b)} ${u}`} lh={`${t.h} = ${de(c)} ${u}`} names={t.names} rot={rot()} />,
    parts: [num(`$${t.k1}$`, k, u)],
    solution: [`$${t.h}^2 = ${t.k1}^2 + ${t.k2}^2 \\;\\Rightarrow\\; ${t.k1}^2 = ${t.h}^2 - ${t.k2}^2$`, `$${t.k1} = \\sqrt{(${q(c, u)})^2 - (${q(b, u)})^2} ${res(k, u)}$`],
  };
};

const tabelle: Gen = () => {
  const u = lenUnit();
  const [a, b] = legs();
  const c = Math.hypot(a, b);
  const mode = pick(['c', 'a'] as const);
  if (mode === 'c') {
    return {
      title: 'Fehlende Seite',
      text: `Ein rechtwinkliges Dreieck hat die Katheten $${q(a, u)}$ und $${q(b, u)}$. Wie lang ist die Hypotenuse?`,
      parts: [num('Hypotenuse', c, u)],
      solution: [`$\\text{Hypotenuse} = \\sqrt{(${q(a, u)})^2 + (${q(b, u)})^2} ${res(c, u)}$`],
    };
  }
  const cr = round(c, 1);
  const k = Math.sqrt(cr * cr - b * b);
  return {
    title: 'Fehlende Seite',
    text: `Ein rechtwinkliges Dreieck hat die Hypotenuse $${q(cr, u)}$ und eine Kathete mit $${q(b, u)}$. Wie lang ist die andere Kathete?`,
    parts: [num('Kathete', k, u)],
    solution: [`$\\text{Kathete} = \\sqrt{(${q(cr, u)})^2 - (${q(b, u)})^2} ${res(k, u)}$`],
  };
};

const punkteAbstand: Gen = () => {
  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;
  while (x1 === x2 || y1 === y2) {
    x1 = ri(-4, 4);
    y1 = ri(-4, 4);
    x2 = ri(-4, 4);
    y2 = ri(-4, 4);
  }
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const d = Math.hypot(dx, dy);
  const els: El[] = [];
  for (let i = -5; i <= 5; i++) {
    els.push({ t: 'line', pts: [[i, -5], [i, 5]], stroke: '#e2e8f0', w: 0.8 });
    els.push({ t: 'line', pts: [[-5, i], [5, i]], stroke: '#e2e8f0', w: 0.8 });
  }
  els.push({ t: 'line', pts: [[-5, 0], [5, 0]], stroke: C.gray, w: 1.2 }, { t: 'line', pts: [[0, -5], [0, 5]], stroke: C.gray, w: 1.2 });
  const A: P = [x1, y1];
  const B: P = [x2, y2];
  const H: P = [x2, y1];
  els.push({ t: 'line', pts: [A, H, B], dash: true, stroke: C.blue });
  els.push({ t: 'line', pts: [A, B], stroke: C.red, w: 2 });
  els.push({ t: 'dot', at: A }, { t: 'dot', at: B });
  els.push({ t: 'label', at: A, text: 'A', dx: -10, dy: -10, color: C.blue }, { t: 'label', at: B, text: 'B', dx: 10, dy: -10, color: C.blue });
  return {
    title: 'Abstand zweier Punkte',
    text: `Berechne den Abstand der Punkte $A(${x1}\\,|\\,${y1})$ und $B(${x2}\\,|\\,${y2})$ im Koordinatensystem (1 LE = 1 cm).`,
    figure: <Scene els={els} maxH={170} />,
    parts: [num('$\\overline{AB}$', d, 'cm')],
    solution: [
      `Hilfsdreieck: waagrecht $|${x2} - (${x1})| = ${dx}$, senkrecht $|${y2} - (${y1})| = ${dy}$`,
      `$\\overline{AB} = \\sqrt{${dx}^2 + ${dy}^2} = \\sqrt{${dx * dx + dy * dy}} ${res(d, 'cm')}$`,
    ],
  };
};

const gleichschenkligHoehe: Gen = () => {
  const u = lenUnit();
  const c = 2 * ri(2, 8);
  const h = rs(3, 12, 0.5);
  const s = round(Math.hypot(c / 2, h), 1);
  const hh = Math.sqrt(s * s - (c / 2) * (c / 2));
  return {
    title: 'Höhe im gleichschenkligen Dreieck',
    text: `Ein gleichschenkliges Dreieck hat die Basis $c = ${q(c, u)}$ und die Schenkel $a = b = ${q(s, u)}$. Berechne die Höhe $h_c$ und den Flächeninhalt.`,
    figure: <TriFig g={c} h={hh} t={0.5} lg={`c = ${de(c)} ${u}`} lb={`${de(s)} ${u}`} la={`${de(s)} ${u}`} lh="h_c = ?" />,
    parts: [num('$h_c$', hh, u), num('$A$', (c * hh) / 2, `${u}²` as UnitId)],
    solution: [
      `Die Höhe halbiert die Basis: $\\frac{c}{2} = ${q(c / 2, u)}$`,
      `$h_c = \\sqrt{(${q(s, u)})^2 - (${q(c / 2, u)})^2} ${res(hh, u)}$`,
      `$A = \\frac{c \\cdot h_c}{2} = \\frac{${q(c, u)} \\cdot ${tx(round(hh, 2))}\\,\\text{${u}}}{2} ${res((c * round(hh, 2)) / 2, `${u}²` as UnitId)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Rechtwinklig prüfen
// ---------------------------------------------------------------------------

const pruefen: Gen = () => {
  const yes = Math.random() < 0.5;
  const [x, y, z] = pick(TRIPLES);
  const k = pick([1, 2, 3, 0.5, 1.5, 10]);
  let s = [x * k, y * k, z * k];
  if (!yes) s = [s[0], s[1] + pick([-1, 1]) * (k >= 1 ? 1 : 0.5), s[2]];
  const u = pick<UnitId>(['cm', 'm', 'mm']);
  const sides = shuffle(s);
  const [p, qq, r] = [...s].sort((m, n) => m - n);
  const lhs = p * p + qq * qq;
  const rhs = r * r;
  return {
    title: 'Rechtwinklig oder nicht?',
    text: `Ein Dreieck hat die Seitenlängen $${q(sides[0], u)}$, $${q(sides[1], u)}$ und $${q(sides[2], u)}$. Ist es rechtwinklig?`,
    parts: [choice('Entscheide mit dem Satz des Pythagoras:', yes ? 'Ja, rechtwinklig' : 'Nein, nicht rechtwinklig', [yes ? 'Nein, nicht rechtwinklig' : 'Ja, rechtwinklig'])],
    solution: [
      `Die längste Seite ($${q(r, u)}$) wäre die Hypotenuse.`,
      `$${tx(p)}^2 + ${tx(qq)}^2 = ${tx(lhs)}$ und $${tx(r)}^2 = ${tx(rhs)}$`,
      Math.abs(lhs - rhs) < 1e-9 ? 'Beide Seiten sind gleich → das Dreieck ist **rechtwinklig**.' : 'Die Werte sind verschieden → das Dreieck ist **nicht rechtwinklig**.',
    ],
  };
};

const pruefenEinheiten: Gen = () => {
  const [x, y, z] = pick([[30, 40, 50], [50, 120, 130], [60, 80, 100], [28, 45, 53], [33, 56, 65]]);
  const yes = Math.random() < 0.6;
  const zz = yes ? z : z + pick([-2, 2]);
  return {
    title: 'Rechtwinklig? Achte auf die Einheiten!',
    text: `Ein Dreieck hat die Seiten $a = ${q(x, 'cm')}$, $b = ${q(y / 10, 'dm')}$ und $c = ${q(zz / 100, 'm')}$. Ist es rechtwinklig?`,
    parts: [choice('Rechne zuerst alle Seiten in cm um:', yes ? 'Ja, rechtwinklig' : 'Nein, nicht rechtwinklig', [yes ? 'Nein, nicht rechtwinklig' : 'Ja, rechtwinklig'])],
    solution: [
      `$a = ${x}\\,\\text{cm}$, $b = ${y}\\,\\text{cm}$, $c = ${zz}\\,\\text{cm}$`,
      `$${x}^2 + ${y}^2 = ${x * x + y * y}$ und $${zz}^2 = ${zz * zz}$`,
      yes ? '→ gleich, also **rechtwinklig**.' : '→ verschieden, also **nicht rechtwinklig**.',
    ],
  };
};

// ---------------------------------------------------------------------------
// Anwendungen
// ---------------------------------------------------------------------------

function wallFig(base: string, height: string, slant: string, w = 1.5, h = 4.5) {
  const els: El[] = [
    { t: 'line', pts: [[-0.6, 0], [w + 1, 0]], stroke: C.gray, w: 2 },
    { t: 'poly', pts: [[w, 0], [w + 0.5, 0], [w + 0.5, h + 0.4], [w, h + 0.4]], fill: '#e2e8f0', stroke: C.gray },
    { t: 'line', pts: [[0, 0], [w, h]], stroke: '#92400e', w: 3 },
    { t: 'right', at: [w, 0], u: [-1, 0], v: [0, 1] },
    { t: 'side', a: [0, 0], b: [w, 0], text: base, side: -1, color: base.includes('?') ? C.red : C.label },
    { t: 'side', a: [w, 0], b: [w, h], text: height, side: -1, color: height.includes('?') ? C.red : C.label, off: 14 },
    { t: 'side', a: [0, 0], b: [w, h], text: slant, side: 1, color: slant.includes('?') ? C.red : C.label },
  ];
  return <Scene els={els} maxH={160} />;
}

const leiter: Gen = () => {
  const l = rs(4, 8, 0.5);
  const a = rs(1, 2, 0.1);
  const h = Math.sqrt(l * l - a * a);
  return {
    title: 'Leiter an der Hauswand',
    badge: 'Anwendung',
    text: `Eine $${q(l, 'm')}$ lange Leiter wird an eine Hauswand gelehnt. Ihr Fuß steht aus Sicherheitsgründen $${q(a, 'm')}$ von der Wand entfernt. In welcher Höhe berührt die Leiter die Wand?`,
    figure: wallFig(`${de(a)} m`, 'h = ?', `${de(l)} m`),
    parts: [num('$h$', h, 'm')],
    solution: [`Die Leiter ist die Hypotenuse: $${tx(l)}^2 = ${tx(a)}^2 + h^2$`, `$h = \\sqrt{(${q(l, 'm')})^2 - (${q(a, 'm')})^2} ${res(h, 'm')}$`],
  };
};

const leiterLaenge: Gen = () => {
  const h = rs(3, 6, 0.5);
  const a = rs(1, 2, 0.25);
  const l = Math.hypot(h, a);
  const firm = pick(['die Dachdeckerei Berger', 'der Malerbetrieb Öztürk', 'die Firma Schönhaar Bedachungen']);
  return {
    title: 'Welche Leiter wird gebraucht?',
    badge: 'Anwendung',
    text: `Für Arbeiten am Dach muss ${firm} eine Leiter an eine $${q(h, 'm')}$ hohe Wand lehnen. Der Abstand des Leiterfußes zur Wand soll $${q(a, 'm')}$ betragen. Wie lang muss die Leiter mindestens sein?`,
    figure: wallFig(`${de(a)} m`, `${de(h)} m`, 'l = ?'),
    parts: [num('$l$', l, 'm')],
    solution: [`$l^2 = (${q(h, 'm')})^2 + (${q(a, 'm')})^2$`, `$l = \\sqrt{${tx(h * h + a * a, 4)}}\\,\\text{m} ${res(l, 'm')}$`],
  };
};

const drachenSchnur: Gen = () => {
  const s = pick([120, 150, 180, 200]);
  const steps = ri(80, 150);
  const sl = pick([0.7, 0.75, 0.8]);
  const w = steps * sl;
  const n1 = name();
  const h = Math.sqrt(s * s - w * w);
  return {
    title: 'Wie hoch fliegt der Drachen?',
    badge: 'Anwendung',
    text: `${n1} lässt einen Drachen an einer $${q(s, 'm')}$ langen Schnur steigen. Ein Freund läuft vom Startpunkt los, bis der Drachen genau über ihm ist: $${steps}$ Schritte zu je $${q(sl * 100, 'cm')}$.`,
    parts: [num('Weg', w, 'm', { q: 'a) Wie weit ist der Freund gelaufen?' }), num('Höhe', h, 'm', { q: 'b) Wie hoch fliegt der Drachen?' })],
    solution: [`a) $${steps} \\cdot ${q(sl, 'm')} = ${q(w, 'm')}$`, `b) $h = \\sqrt{(${q(s, 'm')})^2 - (${q(w, 'm')})^2} ${res(h, 'm')}$`],
  };
};

const feuerwehr: Gen = () => {
  const st = ri(3, 7);
  const sh = pick([2.7, 2.8, 3]);
  const a = rs(4, 7, 0.5);
  const h = st * sh;
  const l = Math.hypot(h, a);
  return {
    title: 'Feuerwehreinsatz',
    badge: 'Anwendung',
    text: `Bei einem Einsatz muss die Feuerwehr ein Fenster im ${st}. Stock erreichen (Höhe pro Stockwerk $${q(sh, 'm')}$). Das Fahrzeug steht $${q(a, 'm')}$ vom Gebäude entfernt. (Die Höhe des Fahrzeugs wird vernachlässigt.)`,
    parts: [num('Höhe', h, 'm', { q: 'a) In welcher Höhe liegt das Fenster?' }), num('Leiter', l, 'm', { q: 'b) Wie weit muss die Leiter mindestens ausgefahren werden?' })],
    solution: [`a) $${st} \\cdot ${q(sh, 'm')} = ${q(h, 'm')}$`, `b) $l = \\sqrt{(${q(h, 'm')})^2 + (${q(a, 'm')})^2} ${res(l, 'm')}$`],
  };
};

const dach: Gen = () => {
  const b = 2 * ri(4, 7);
  const s = rs(b / 2 + 1, b / 2 + 4, 0.5);
  const w = rs(2.5, 4, 0.5);
  const h = Math.sqrt(s * s - (b / 2) ** 2);
  const els: El[] = [
    { t: 'poly', pts: [[0, 0], [b, 0], [b, w], [b / 2, w + h], [0, w]], fill: C.fill3 },
    { t: 'line', pts: [[0, w], [b, w]], dash: true, stroke: C.gray },
    { t: 'line', pts: [[b / 2, w], [b / 2, w + h]], dash: true, stroke: C.red },
    { t: 'label', at: [b / 2, w + h / 2], text: 'h = ?', dx: 6, anchor: 'start', color: C.red },
    { t: 'side', a: [0, 0], b: [b, 0], text: `${b} m`, side: -1 },
    { t: 'side', a: [0, w], b: [b / 2, w + h], text: `${de(s)} m`, side: 1 },
    { t: 'side', a: [b, 0], b: [b, w], text: `${de(w)} m`, side: 1 },
  ];
  return {
    title: 'Wie hoch ist das Haus?',
    badge: 'Anwendung',
    text: `Ein Haus ist $${q(b, 'm')}$ breit. Die Dachschräge ist $${q(s, 'm')}$ lang und der Dachfirst liegt genau in der Mitte. Die Wände sind $${q(w, 'm')}$ hoch.`,
    figure: <Scene els={els} />,
    parts: [num('$h$', h, 'm', { q: 'a) Wie hoch ist das Dach?' }), num('Gesamthöhe', h + w, 'm', { q: 'b) Wie hoch ist das ganze Haus?' })],
    solution: [`a) Halbe Breite: $${q(b / 2, 'm')}$; $h = \\sqrt{(${q(s, 'm')})^2 - (${q(b / 2, 'm')})^2} ${res(h, 'm')}$`, `b) $${tx(round(h, 2))}\\,\\text{m} + ${q(w, 'm')} ${res(round(h, 2) + w, 'm')}$`],
  };
};

const fernseher: Gen = () => {
  const b = pick([89, 110, 122, 144]);
  const h = round((b * 9) / 16, 0);
  const d = Math.hypot(b, h);
  return {
    title: 'Fernseher-Diagonale',
    badge: 'Anwendung',
    text: `Ein Fernsehbildschirm ist $${q(b, 'cm')}$ breit und $${q(h, 'cm')}$ hoch. Die Größe wird in Zoll angegeben ($1\\text{ Zoll} = 2{,}54\\,\\text{cm}$).`,
    figure: <RectFig a={b} b={h} la={`${b} cm`} lb={`${h} cm`} ld="d = ?" />,
    parts: [num('Diagonale', d, 'cm', { q: 'a) Wie lang ist die Diagonale?' }), num('Zoll', d / 2.54, null, { q: 'b) Wie viel Zoll sind das (auf ganze Zoll gerundet)?', tol: 0.6 })],
    solution: [`a) $d = \\sqrt{${b}^2 + ${h}^2} ${res(d, 'cm')}$`, `b) $${tx(round(d, 2))} : 2{,}54 \\approx ${tx(d / 2.54, 1)}$ → ca. $${Math.round(d / 2.54)}$ Zoll`],
  };
};

const abkuerzung: Gen = () => {
  const a = ri(30, 80);
  const b = ri(20, 60);
  const d = Math.hypot(a, b);
  return {
    title: 'Abkürzung über die Wiese',
    badge: 'Anwendung',
    text: `${name()} geht nicht außen um ein rechteckiges Feld herum ($${q(a, 'm')}$ und $${q(b, 'm')}$), sondern diagonal hindurch.`,
    figure: <RectFig a={a} b={b} la={`${a} m`} lb={`${b} m`} ld="?" fill={C.green} />,
    parts: [num('Diagonale', d, 'm', { q: 'a) Wie lang ist der Weg quer über das Feld?' }), num('Ersparnis', a + b - d, 'm', { q: 'b) Wie viele Meter spart man?' })],
    solution: [`a) $d = \\sqrt{${a}^2 + ${b}^2} ${res(d, 'm')}$`, `b) außen herum: $${a + b}\\,\\text{m}$; Ersparnis: $${a + b} - ${tx(round(d, 2))} ${res(a + b - round(d, 2), 'm')}$`],
  };
};

const mast: Gen = () => {
  const h = rs(6, 14, 0.5);
  const a = rs(3, 6, 0.5);
  const n = ri(3, 4);
  const s = Math.hypot(h, a);
  return {
    title: 'Abspannseile für einen Mast',
    badge: 'Anwendung',
    text: `Ein Fahnenmast wird mit $${n}$ Seilen abgespannt. Jedes Seil ist oben in $${q(h, 'm')}$ Höhe befestigt und $${q(a, 'm')}$ vom Mastfuß entfernt im Boden verankert.`,
    figure: wallFig(`${de(a)} m`, `${de(h)} m`, 's = ?', a, h),
    parts: [num('ein Seil', s, 'm', { q: 'a) Wie lang ist ein Seil?' }), num('alle Seile', n * s, 'm', { q: `b) Wie viel Seil wird für alle ${n} Seile benötigt?` })],
    solution: [`a) $s = \\sqrt{(${q(h, 'm')})^2 + (${q(a, 'm')})^2} ${res(s, 'm')}$`, `b) $${n} \\cdot ${tx(round(s, 2))}\\,\\text{m} ${res(n * round(s, 2), 'm')}$`],
  };
};

const schrank: Gen = () => {
  const h = pick([2.2, 2.3, 2.35, 2.4]);
  const t = pick([0.55, 0.6, 0.65, 0.7]);
  const raum = pick([2.4, 2.45, 2.5]);
  const d = Math.hypot(h, t);
  const passt = d <= raum;
  return {
    title: 'Schrank aufstellen',
    badge: 'Anwendung',
    text: `Ein Schrank ist $${q(h, 'm')}$ hoch und $${q(t * 100, 'cm')}$ tief. Er wird liegend ins Zimmer getragen und dann aufgerichtet. Das Zimmer ist $${q(raum, 'm')}$ hoch.`,
    parts: [
      num('Diagonale', d, 'm', { q: 'a) Wie lang ist die Diagonale der Seitenwand des Schranks?' }),
      choice('b) Lässt sich der Schrank aufrichten?', passt ? 'Ja' : 'Nein', [passt ? 'Nein' : 'Ja']),
    ],
    solution: [`a) $d = \\sqrt{(${q(h, 'm')})^2 + (${q(t, 'm')})^2} ${res(d, 'm')}$`, `b) ${passt ? `$${tx(round(d, 2))}\\,\\text{m} \\le ${q(raum, 'm')}$ → ja, es passt.` : `$${tx(round(d, 2))}\\,\\text{m} > ${q(raum, 'm')}$ → nein, der Schrank stößt an die Decke.`}`],
  };
};

const BASICS = [hypBerechnen, katheteBerechnen, tabelle, punkteAbstand, gleichschenkligHoehe];
const APPS = [leiter, leiterLaenge, drachenSchnur, feuerwehr, dach, fernseher, abkuerzung, mast, schrank];

const exampleCalc = {
  title: 'Hypotenuse und Kathete berechnen',
  text: 'Im Dreieck $ABC$ liegt der rechte Winkel bei $C$. Es ist $a = 5\\,\\text{cm}$ und $b = 4\\,\\text{cm}$.',
  figure: <RightTriFig k1={4} k2={5} l1="b = 4 cm" l2="a = 5 cm" lh="c = ?" names={['C', 'A', 'B']} />,
  steps: [
    'Hypotenuse $c$ liegt gegenüber vom rechten Winkel: $c^2 = a^2 + b^2$',
    '$c = \\sqrt{(5\\,\\text{cm})^2 + (4\\,\\text{cm})^2} = \\sqrt{41\\,\\text{cm}^2} \\approx 6{,}40\\,\\text{cm}$',
    'Ist eine **Kathete** gesucht, wird subtrahiert: $b = \\sqrt{c^2 - a^2}$',
  ],
  tip: 'Die Hypotenuse ist immer die längste Seite. Ist dein Ergebnis für eine Kathete größer als die Hypotenuse, hast du addiert statt subtrahiert.',
};

const pages: PracticeConfig[] = [
  {
    slug: 'katheten-hypotenuse',
    title: 'Katheten und Hypotenuse',
    description: 'Seiten benennen und Gleichung aufstellen',
    formulas: F_PYTH.slice(0, 2),
    example: {
      title: 'Welche Seite ist die Hypotenuse?',
      text: 'Im Dreieck $RST$ liegt der rechte Winkel bei $T$.',
      figure: <RightTriFig k1={4} k2={3} l1="s" l2="r" lh="t" names={['T', 'R', 'S']} rot={30} />,
      steps: ['Die **Hypotenuse** liegt gegenüber vom rechten Winkel: hier $t$.', 'Die beiden anderen Seiten $r$ und $s$ sind die **Katheten**.', 'Satz des Pythagoras: $t^2 = r^2 + s^2$'],
      tip: 'Die Seite gegenüber einer Ecke hat denselben Buchstaben – nur klein geschrieben.',
    },
    gens: [hypotenuseErkennen, gleichungWaehlen, umgestellt],
    nBasic: 6,
    nApp: 0,
  },
  {
    slug: 'berechnen',
    title: 'Seiten berechnen',
    description: 'Hypotenuse und Katheten berechnen',
    formulas: F_PYTH,
    example: exampleCalc,
    gens: BASICS,
    apps: APPS,
  },
  {
    slug: 'rechtwinklig-pruefen',
    title: 'Rechtwinklig prüfen',
    description: 'Ist ein Dreieck rechtwinklig?',
    formulas: ['\\text{rechtwinklig, wenn: } a^2 + b^2 = c^2', 'c = \\text{längste Seite}'],
    example: {
      title: 'Ist das Dreieck mit 6 cm, 8 cm, 10 cm rechtwinklig?',
      text: 'Ein Dreieck hat die Seiten $6\\,\\text{cm}$, $8\\,\\text{cm}$ und $10\\,\\text{cm}$.',
      steps: ['Die längste Seite ($10\\,\\text{cm}$) wäre die Hypotenuse.', '$6^2 + 8^2 = 36 + 64 = 100$ und $10^2 = 100$', 'Beide Werte stimmen überein → das Dreieck ist **rechtwinklig**.'],
      tip: 'Sind die Seiten in verschiedenen Einheiten angegeben, rechne zuerst alles in dieselbe Einheit um.',
    },
    gens: [pruefen, pruefen, pruefenEinheiten],
    apps: [schrank],
    nBasic: 5,
    nApp: 1,
  },
  {
    slug: 'anwendung',
    title: 'Anwendungsaufgaben',
    description: 'Leiter, Drachen, Dach & Co.',
    formulas: F_PYTH,
    example: {
      title: 'Leiter an der Wand',
      text: 'Eine $5\\,\\text{m}$ lange Leiter steht $1{,}5\\,\\text{m}$ von der Wand entfernt. Wie hoch reicht sie?',
      figure: wallFig('1,5 m', 'h = ?', '5 m'),
      steps: ['Skizze: Wand und Boden bilden den rechten Winkel, die Leiter ist die **Hypotenuse**.', '$h = \\sqrt{(5\\,\\text{m})^2 - (1{,}5\\,\\text{m})^2} = \\sqrt{22{,}75\\,\\text{m}^2} \\approx 4{,}77\\,\\text{m}$'],
    },
    gens: [],
    apps: APPS,
    nBasic: 0,
    nApp: 6,
  },
  {
    slug: 'gemischt',
    title: 'Gemischte Aufgaben',
    description: 'Alles rund um Pythagoras',
    formulas: F_PYTH,
    example: exampleCalc,
    gens: [...BASICS, hypotenuseErkennen, umgestellt, pruefen],
    apps: APPS,
  },
];

export const pythagoras: TopicConfig = {
  slug: 'satz-des-pythagoras',
  title: 'Satz des Pythagoras',
  description: 'Seiten im rechtwinkligen Dreieck berechnen',
  icon: 'triangle',
  pages,
};
