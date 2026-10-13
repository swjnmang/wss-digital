import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { rechenregelnGens, rechenregelnSections } from './lb1_rechenregeln';
import { F, ch, chFixed, gcd, nm, nz, p, pick, poly, ri, setTex, sg, shuffle, t, WF } from '../lib';

// Lernbereich 1: Aussagenlogik, Mengenlehre mit Zahlenmengen, Rechenregeln

// ---------------------------------------------------------------------------
// Aussagenlogik
// ---------------------------------------------------------------------------

type BE = { k: 'v'; n: string } | { k: 'not'; a: BE } | { k: 'and' | 'or' | 'imp'; a: BE; b: BE };
const V = (n: string): BE => ({ k: 'v', n });
const N = (a: BE): BE => ({ k: 'not', a });
const B = (k: 'and' | 'or' | 'imp', a: BE, b: BE): BE => ({ k, a, b });
const OPS = { and: '\\land', or: '\\lor', imp: '\\Rightarrow' };
const wf = (b: boolean) => (b ? '\\text{w}' : '\\text{f}');

function beTex(e: BE, top = true): string {
  if (e.k === 'v') return e.n;
  if (e.k === 'not') return `\\lnot ${e.a.k === 'v' || e.a.k === 'not' ? beTex(e.a, false) : `(${beTex(e.a)})`}`;
  const s = `${beTex(e.a, false)} ${OPS[e.k]} ${beTex(e.b, false)}`;
  return top ? s : `(${s})`;
}

function beEval(e: BE, vals: Record<string, boolean>): boolean {
  if (e.k === 'v') return vals[e.n];
  if (e.k === 'not') return !beEval(e.a, vals);
  const a = beEval(e.a, vals);
  const b = beEval(e.b, vals);
  return e.k === 'and' ? a && b : e.k === 'or' ? a || b : !a || b;
}

const RULE = {
  not: 'Negation: kehrt den Wahrheitswert um',
  and: 'Konjunktion: nur wahr, wenn beide Teilaussagen wahr sind',
  or: 'Disjunktion: wahr, wenn mindestens eine Teilaussage wahr ist',
  imp: 'Konditional: nur falsch, wenn die Voraussetzung wahr und die Folgerung falsch ist',
};

function beSteps(e: BE, vals: Record<string, boolean>, out: string[] = []): string[] {
  if (e.k === 'v') return out;
  if (e.k === 'not') {
    beSteps(e.a, vals, out);
    out.push(`$${beTex(e)}$: $\\lnot ${wf(beEval(e.a, vals))} = ${wf(beEval(e, vals))}$ (${RULE.not})`);
    return out;
  }
  beSteps(e.a, vals, out);
  beSteps(e.b, vals, out);
  out.push(`$${beTex(e)}$: $${wf(beEval(e.a, vals))} ${OPS[e.k]} ${wf(beEval(e.b, vals))} = ${wf(beEval(e, vals))}$ (${RULE[e.k]})`);
  return out;
}

function beVars(e: BE, s = new Set<string>()): Set<string> {
  if (e.k === 'v') s.add(e.n);
  else if (e.k === 'not') beVars(e.a, s);
  else {
    beVars(e.a, s);
    beVars(e.b, s);
  }
  return s;
}

const BE_TEMPLATES: (() => BE)[] = [
  () => B('and', V('A'), N(V('B'))),
  () => B('or', N(V('A')), V('B')),
  () => B('imp', V('A'), V('B')),
  () => B('imp', N(V('A')), V('B')),
  () => N(B('and', V('A'), V('B'))),
  () => N(B('or', V('A'), V('B'))),
  () => B('imp', B('and', V('A'), V('B')), V('C')),
  () => B('and', B('or', V('A'), V('B')), N(V('C'))),
  () => B('imp', V('A'), B('or', V('B'), V('C'))),
  () => B('or', B('and', V('A'), N(V('B'))), V('C')),
  () => N(B('imp', V('A'), V('B'))),
  () => B('imp', B('or', V('A'), N(V('C'))), V('B')),
];

const wahrheitswert: Gen = () => {
  const e = pick(BE_TEMPLATES)();
  const vars = [...beVars(e)].sort();
  const vals: Record<string, boolean> = {};
  vars.forEach((v) => (vals[v] = Math.random() < 0.5));
  const res = beEval(e, vals);
  return {
    title: 'Wahrheitswert bestimmen',
    text: `Es gilt: ${vars.map((v) => `$${v}$ ist **${vals[v] ? 'wahr' : 'falsch'}**`).join(', ')}.\nBestimme den Wahrheitswert von $${beTex(e)}$.`,
    parts: [WF(`Die Aussage $${beTex(e)}$ ist …`, res)],
    solution: [
      `Werte von innen nach außen aus (${vars.map((v) => `$${v} = ${wf(vals[v])}$`).join(', ')}):`,
      ...beSteps(e, vals),
      `Also ist $${beTex(e)}$ **${res ? 'wahr' : 'falsch'}**.`,
    ],
  };
};

const MATH_ST: [string, boolean, string][] = [
  ['$7$ ist eine Primzahl.', true, '$7$ hat nur die Teiler $1$ und $7$.'],
  ['$12$ ist durch $5$ teilbar.', false, '$12 : 5 = 2{,}4$ ist keine ganze Zahl.'],
  ['$\\sqrt{49} = 7$', true, '$7^2 = 49$.'],
  ['$-3 \\in \\mathbb{N}$', false, 'Negative Zahlen sind keine natürlichen Zahlen.'],
  ['$2^5 = 32$', true, '$2\\cdot2\\cdot2\\cdot2\\cdot2 = 32$.'],
  ['$0{,}5 > \\frac{2}{3}$', false, '$\\frac{2}{3} \\approx 0{,}67 > 0{,}5$.'],
  ['$15$ ist eine gerade Zahl.', false, '$15$ ist nicht durch $2$ teilbar.'],
  ['$\\frac{3}{4} = 0{,}75$', true, '$3 : 4 = 0{,}75$.'],
  ['$(-2)^2 = -4$', false, '$(-2)\\cdot(-2) = +4$.'],
  ['$\\pi < 3$', false, '$\\pi \\approx 3{,}14 > 3$.'],
  ['$1{,}5 \\in \\mathbb{Q}$', true, '$1{,}5 = \\frac{3}{2}$ ist ein Bruch.'],
  ['$|-5| = 5$', true, 'Der Betrag ist der Abstand zur Null.'],
  ['$\\sqrt{2} \\in \\mathbb{Q}$', false, '$\\sqrt{2}$ ist irrational.'],
  ['$3^0 = 0$', false, 'Es gilt $a^0 = 1$.'],
  ['$-2 > -5$', true, '$-2$ liegt auf dem Zahlenstrahl rechts von $-5$.'],
];

const mathVerknuepfung: Gen = () => {
  const [A, Bs] = shuffle(MATH_ST).slice(0, 2);
  const op = pick(['and', 'or', 'imp', 'impR', 'notA'] as const);
  const a = A[1];
  const b = Bs[1];
  let e: BE;
  if (op === 'and') e = B('and', V('A'), V('B'));
  else if (op === 'or') e = B('or', V('A'), V('B'));
  else if (op === 'imp') e = B('imp', V('A'), V('B'));
  else if (op === 'impR') e = B('imp', V('B'), V('A'));
  else e = B('or', N(V('A')), V('B'));
  const vals = { A: a, B: b };
  const res = beEval(e, vals);
  return {
    title: 'Aussagen verknüpfen',
    text: `$A$: ${A[0]}\n$B$: ${Bs[0]}\nIst die Aussage $${beTex(e)}$ wahr oder falsch?`,
    parts: [WF(`$${beTex(e)}$ ist …`, res)],
    solution: [
      `$A$ ist **${a ? 'wahr' : 'falsch'}**: ${A[2]}`,
      `$B$ ist **${b ? 'wahr' : 'falsch'}**: ${Bs[2]}`,
      ...beSteps(e, vals),
    ],
  };
};

const SENTENCES: [string, 'w' | 'f' | 'af' | 'k', string][] = [
  ['Wie spät ist es?', 'k', 'Fragen haben keinen Wahrheitswert.'],
  ['Mach bitte das Fenster zu!', 'k', 'Aufforderungen haben keinen Wahrheitswert.'],
  ['$x + 3 = 7$', 'af', 'Erst wenn man für $x$ eine Zahl einsetzt, entsteht eine wahre oder falsche Aussage.'],
  ['$2x > 10$', 'af', 'Enthält die Variable $x$, der Wahrheitswert hängt von $x$ ab.'],
  ['München ist die Hauptstadt von Bayern.', 'w', 'Eindeutig wahr.'],
  ['Ein Dreieck hat vier Ecken.', 'f', 'Ein Dreieck hat drei Ecken.'],
  ['Für alle $x \\in \\mathbb{R}$ gilt $x^2 \\geq 0$.', 'w', 'Quadrate sind nie negativ – die Variable ist durch „für alle“ gebunden.'],
  ['Die Zahl $x$ ist durch $3$ teilbar.', 'af', 'Der Wahrheitswert hängt von $x$ ab.'],
  ['Schöne Grüße aus Augsburg!', 'k', 'Ein Gruß ist weder wahr noch falsch.'],
  ['$3 \\cdot 4 = 13$', 'f', '$3 \\cdot 4 = 12$.'],
  ['Es gibt eine natürliche Zahl, die größer als $100$ ist.', 'w', 'Zum Beispiel $101$.'],
  ['$y - 4 < 0$', 'af', 'Der Wahrheitswert hängt von $y$ ab.'],
  ['$\\sqrt{16} = 5$', 'f', '$\\sqrt{16} = 4$.'],
];
const SENT_LABEL = { w: 'wahre Aussage', f: 'falsche Aussage', af: 'Aussageform', k: 'keine Aussage' };

const aussageErkennen: Gen = () => {
  const [s, kind, why] = pick(SENTENCES);
  const opts = ['wahre Aussage', 'falsche Aussage', 'Aussageform', 'keine Aussage'];
  return {
    title: 'Aussage, Aussageform oder keine Aussage?',
    text: `„${s}“`,
    parts: [chFixed('Was liegt vor?', opts, opts.indexOf(SENT_LABEL[kind]))],
    solution: [
      'Eine **Aussage** ist ein Satz, der entweder wahr oder falsch ist. Eine **Aussageform** enthält eine Variable und wird erst durch Einsetzen zur Aussage.',
      `Hier: **${SENT_LABEL[kind]}**. ${why}`,
    ],
  };
};

const ALLTAG: { A: string; B: string; s: [string, BE][] }[] = [
  {
    A: 'Es regnet.',
    B: 'Die Straße ist nass.',
    s: [
      ['Wenn es regnet, dann ist die Straße nass.', B('imp', V('A'), V('B'))],
      ['Es regnet nicht, aber die Straße ist nass.', B('and', N(V('A')), V('B'))],
      ['Es regnet oder die Straße ist nass.', B('or', V('A'), V('B'))],
      ['Es stimmt nicht, dass es regnet und die Straße nass ist.', N(B('and', V('A'), V('B')))],
      ['Es regnet und die Straße ist nicht nass.', B('and', V('A'), N(V('B')))],
    ],
  },
  {
    A: 'Tom lernt für die Prüfung.',
    B: 'Tom besteht die Prüfung.',
    s: [
      ['Wenn Tom lernt, dann besteht er die Prüfung.', B('imp', V('A'), V('B'))],
      ['Tom lernt nicht und besteht trotzdem.', B('and', N(V('A')), V('B'))],
      ['Tom lernt oder er besteht nicht.', B('or', V('A'), N(V('B')))],
      ['Wenn Tom nicht lernt, dann besteht er nicht.', B('imp', N(V('A')), N(V('B')))],
      ['Tom lernt und besteht die Prüfung.', B('and', V('A'), V('B'))],
    ],
  },
  {
    A: 'Der Akku ist geladen.',
    B: 'Das Handy funktioniert.',
    s: [
      ['Wenn der Akku geladen ist, funktioniert das Handy.', B('imp', V('A'), V('B'))],
      ['Der Akku ist geladen, aber das Handy funktioniert nicht.', B('and', V('A'), N(V('B')))],
      ['Der Akku ist nicht geladen oder das Handy funktioniert.', B('or', N(V('A')), V('B'))],
      ['Es ist nicht so, dass der Akku geladen ist oder das Handy funktioniert.', N(B('or', V('A'), V('B')))],
    ],
  },
];

const alltagFormalisieren: Gen = () => {
  const ctx = pick(ALLTAG);
  const [sent, e] = pick(ctx.s);
  const right = `$${beTex(e)}$`;
  const others = ctx.s.map(([, x]) => `$${beTex(x)}$`).filter((x) => x !== right);
  const extra = [`$${beTex(B('imp', V('B'), V('A')))}$`, `$${beTex(B('and', V('A'), V('B')))}$`, `$${beTex(B('or', V('A'), V('B')))}$`];
  return {
    title: 'Alltagssprache in Formelsprache',
    text: `$A$: ${ctx.A}\n$B$: ${ctx.B}\nÜbersetze: „${sent}“`,
    parts: [ch('Welche Formel passt?', right, shuffle([...new Set([...others, ...extra])]).filter((x) => x !== right).slice(0, 3))],
    solution: [
      '„nicht“ → $\\lnot$, „und“/„aber“ → $\\land$, „oder“ → $\\lor$, „wenn …, dann …“ → $\\Rightarrow$',
      `„${sent}“ → ${right}`,
    ],
  };
};

const NEG: [string, string, string[]][] = [
  ['Alle Schüler der Klasse haben bestanden.', 'Mindestens ein Schüler der Klasse hat nicht bestanden.', ['Kein Schüler der Klasse hat bestanden.', 'Alle Schüler der Klasse sind durchgefallen.']],
  ['Es gibt einen Bus, der pünktlich ist.', 'Kein Bus ist pünktlich.', ['Es gibt einen Bus, der nicht pünktlich ist.', 'Alle Busse sind pünktlich.']],
  ['Jede Primzahl ist ungerade.', 'Es gibt mindestens eine Primzahl, die gerade ist.', ['Keine Primzahl ist ungerade.', 'Jede Primzahl ist gerade.']],
  ['Lisa spielt Tennis und Fußball.', 'Lisa spielt nicht Tennis oder nicht Fußball.', ['Lisa spielt weder Tennis noch Fußball.', 'Lisa spielt nicht Tennis und Fußball.']],
  ['Ich fahre mit dem Rad oder mit dem Bus.', 'Ich fahre weder mit dem Rad noch mit dem Bus.', ['Ich fahre nicht mit dem Rad oder nicht mit dem Bus.', 'Ich fahre mit dem Rad und mit dem Bus.']],
  ['Alle Zahlen in der Liste sind positiv.', 'Mindestens eine Zahl in der Liste ist nicht positiv.', ['Alle Zahlen in der Liste sind negativ.', 'Keine Zahl in der Liste ist positiv.']],
];

const negation: Gen = () => {
  const [s, right, wrong] = pick(NEG);
  const tip = /und|oder/.test(s)
    ? 'Regel von De Morgan: $\\lnot(A \\land B) = \\lnot A \\lor \\lnot B$ und $\\lnot(A \\lor B) = \\lnot A \\land \\lnot B$.'
    : '„Alle“ wird verneint zu „mindestens einer … nicht“, „es gibt“ wird verneint zu „keiner“.';
  return {
    title: 'Aussagen verneinen',
    text: `Verneine die Aussage: „${s}“`,
    parts: [ch('Welche Aussage ist die Negation?', right, wrong)],
    solution: [tip, `Negation: „${right}“`],
  };
};

const aussageformLoesung: Gen = () => {
  const G = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
  const a = ri(-2, 2);
  const k = pick([5, 10, 17]);
  const conds: [string, (x: number) => boolean][] = [
    [`x > ${a}`, (x) => x > a],
    [`x \\leq ${a + 2}`, (x) => x <= a + 2],
    [`x^2 < ${k}`, (x) => x * x < k],
    ['x \\text{ ist gerade}', (x) => x % 2 === 0],
    [`|x| \\leq 2`, (x) => Math.abs(x) <= 2],
  ];
  for (let tries = 0; tries < 30; tries++) {
    const [c1, c2] = shuffle(conds).slice(0, 2);
    const op = pick(['and', 'or'] as const);
    const f = (x: number) => (op === 'and' ? c1[1](x) && c2[1](x) : c1[1](x) || c2[1](x));
    const L = G.filter(f);
    const other = G.filter((x) => (op === 'and' ? c1[1](x) || c2[1](x) : c1[1](x) && c2[1](x)));
    const L1 = G.filter(c1[1]);
    const L2 = G.filter(c2[1]);
    const opts = new Set([setTex(L), setTex(other), setTex(L1), setTex(L2)]);
    if (opts.size < 3 || L.length === 0 || L.length === G.length) continue;
    const form = `${c1[0]} ${OPS[op]} ${c2[0]}`;
    return {
      title: 'Lösungsmenge einer Aussageform',
      text: `Grundmenge $G = ${setTex(G)}$.\nBestimme die Lösungsmenge der Aussageform $${form}$.`,
      parts: [ch('$L =$', `$${setTex(L)}$`, [`$${setTex(other)}$`, `$${setTex(L1)}$`, `$${setTex(L2)}$`])],
      solution: [
        `$${c1[0]}$ erfüllen: $${setTex(L1)}$`,
        `$${c2[0]}$ erfüllen: $${setTex(L2)}$`,
        op === 'and'
          ? `Bei $\\land$ müssen **beide** Bedingungen gelten (Schnittmenge): $L = ${setTex(L)}$`
          : `Bei $\\lor$ genügt **eine** Bedingung (Vereinigungsmenge): $L = ${setTex(L)}$`,
      ],
    };
  }
  return wahrheitswert();
};

// ---------------------------------------------------------------------------
// Zahlenmengen und Mengenoperationen
// ---------------------------------------------------------------------------

const SETS = ['\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{Q}', '\\mathbb{R}'];
const NUMS: [string, number, string][] = [
  ['7', 0, 'natürliche Zahl'],
  ['-4', 1, 'negative ganze Zahl'],
  ['\\frac{3}{5}', 2, 'Bruch, nicht ganzzahlig'],
  ['-2{,}5', 2, 'endlicher Dezimalbruch $= -\\frac{5}{2}$'],
  ['\\sqrt{2}', 3, 'unendlicher, nicht periodischer Dezimalbruch (irrational)'],
  ['\\sqrt{25}', 0, '$\\sqrt{25} = 5$'],
  ['\\pi', 3, 'irrationale Zahl'],
  ['0{,}\\overline{3}', 2, 'periodischer Dezimalbruch $= \\frac{1}{3}$'],
  ['-\\sqrt{9}', 1, '$-\\sqrt{9} = -3$'],
  ['\\frac{12}{4}', 0, '$\\frac{12}{4} = 3$'],
  ['\\sqrt{0{,}25}', 2, '$\\sqrt{0{,}25} = 0{,}5 = \\frac{1}{2}$'],
  ['\\sqrt{8}', 3, '$\\sqrt{8} = 2\\sqrt{2}$ ist irrational'],
  ['-\\frac{10}{5}', 1, '$-\\frac{10}{5} = -2$'],
  ['1{,}010010001\\ldots', 3, 'unendlich, nicht periodisch (irrational)'],
  ['\\sqrt{\\frac{4}{9}}', 2, '$\\sqrt{\\frac{4}{9}} = \\frac{2}{3}$'],
];

const kleinsteMenge: Gen = () => {
  const [x, k, why] = pick(NUMS);
  return {
    title: 'Zahlenmenge bestimmen',
    text: `Zu welcher Zahlenmenge gehört $${x}$ **mindestens**? Wähle die kleinste passende Menge.`,
    parts: [chFixed('Kleinste Zahlenmenge:', SETS.map((s) => `$${s}$`), k)],
    solution: [
      `$${x}$: ${why}.`,
      `Kleinste Menge: $${SETS[k]}$. Wegen $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$ liegt die Zahl auch in allen größeren Mengen.`,
    ],
  };
};

const elementWF: Gen = () => {
  const [x, k, why] = pick(NUMS);
  const m = ri(0, 3);
  const notIn = Math.random() < 0.3;
  const truth = notIn ? k > m : k <= m;
  return {
    title: 'Element oder nicht?',
    text: `Entscheide: $${x} ${notIn ? '\\notin' : '\\in'} ${SETS[m]}$`,
    parts: [WF('Die Aussage ist …', truth)],
    solution: [`$${x}$: ${why}. Kleinste Menge: $${SETS[k]}$.`, `Also $${x} ${k <= m ? '\\in' : '\\notin'} ${SETS[m]}$ – die Aussage ist **${truth ? 'wahr' : 'falsch'}**.`],
  };
};

const mengenOps: Gen = () => {
  for (let tries = 0; tries < 30; tries++) {
    const U = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const A = shuffle(U).slice(0, ri(3, 5)).sort((a, b) => a - b);
    const Bm = shuffle(U).slice(0, ri(3, 5)).sort((a, b) => a - b);
    const cut = A.filter((x) => Bm.includes(x));
    const uni = [...new Set([...A, ...Bm])].sort((a, b) => a - b);
    const AoB = A.filter((x) => !Bm.includes(x));
    const BoA = Bm.filter((x) => !A.includes(x));
    if (cut.length === 0 || AoB.length === 0) continue;
    const ops: [string, number[], string][] = [
      ['A \\cap B', cut, 'Schnittmenge: Elemente, die in $A$ **und** in $B$ liegen'],
      ['A \\cup B', uni, 'Vereinigungsmenge: Elemente, die in $A$ **oder** in $B$ liegen'],
      ['A \\setminus B', AoB, 'Differenzmenge: Elemente von $A$, die **nicht** in $B$ liegen'],
      ['B \\setminus A', BoA, 'Differenzmenge: Elemente von $B$, die **nicht** in $A$ liegen'],
    ];
    const [op, res, why] = pick(ops);
    const wrong = ops.filter((o) => o[0] !== op).map((o) => `$${setTex(o[1])}$`);
    if (new Set([setTex(res), ...ops.filter((o) => o[0] !== op).map((o) => setTex(o[1]))]).size < 3) continue;
    return {
      title: 'Mengenoperationen',
      text: `Gegeben: $A = ${setTex(A)}$ und $B = ${setTex(Bm)}$.\nBestimme $${op}$.`,
      parts: [ch(`$${op} =$`, `$${setTex(res)}$`, wrong)],
      solution: [why + '.', `$${op} = ${setTex(res)}$`],
    };
  }
  return kleinsteMenge();
};

interface Iv {
  l: number;
  lc: boolean;
  r: number;
  rc: boolean;
}
const ivTex = (i: Iv) => {
  const l = i.l === -Infinity ? '-\\infty' : t(i.l);
  const r = i.r === Infinity ? '+\\infty' : t(i.r);
  return `${i.lc ? '[' : ']'}${l};\\,${r}${i.rc ? ']' : '['}`;
};
const ivVariants = (i: Iv): string[] => [
  ivTex({ ...i, lc: !i.lc }),
  ivTex({ ...i, rc: !i.rc }),
  ivTex({ ...i, lc: !i.lc, rc: !i.rc }),
];

const intervallOps: Gen = () => {
  const xs = shuffle([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4).sort((a, b) => a - b);
  const A: Iv = { l: xs[0], lc: Math.random() < 0.5, r: xs[2], rc: Math.random() < 0.5 };
  const Bv: Iv = { l: xs[1], lc: Math.random() < 0.5, r: xs[3], rc: Math.random() < 0.5 };
  const ops: [string, Iv, string][] = [
    ['A \\cap B', { l: Bv.l, lc: Bv.lc, r: A.r, rc: A.rc }, 'Schnittmenge = Überlappungsbereich beider Intervalle'],
    ['A \\cup B', { l: A.l, lc: A.lc, r: Bv.r, rc: Bv.rc }, 'Vereinigung = alles, was in mindestens einem Intervall liegt'],
    ['A \\setminus B', { l: A.l, lc: A.lc, r: Bv.l, rc: !Bv.lc }, `$A$ ohne den Teil, der in $B$ liegt – gehört $${t(Bv.l)}$ zu $B$, dann gehört es nicht mehr dazu (und umgekehrt)`],
    ['B \\setminus A', { l: A.r, lc: !A.rc, r: Bv.r, rc: Bv.rc }, `$B$ ohne den Teil, der in $A$ liegt – die Grenze $${t(A.r)}$ wechselt die Klammer`],
  ];
  const [op, res, why] = pick(ops);
  return {
    title: 'Intervalle verknüpfen',
    text: `Gegeben: $A = ${ivTex(A)}$ und $B = ${ivTex(Bv)}$.\nBestimme $${op}$.`,
    parts: [ch(`$${op} =$`, `$${ivTex(res)}$`, ivVariants(res).map((x) => `$${x}$`))],
    solution: [
      'Eckige Klammer nach innen $[\\;]$: Grenze gehört dazu; nach außen $]\\;[$: Grenze gehört nicht dazu.',
      'Skizze am Zahlenstrahl: ' + why + '.',
      `$${op} = ${ivTex(res)}$`,
    ],
  };
};

const beschreibendIntervall: Gen = () => {
  const a = ri(-6, 3);
  const b = a + ri(2, 7);
  const kind = ri(0, 3);
  let desc: string;
  let iv: Iv;
  if (kind === 0) {
    const lc = Math.random() < 0.5;
    const rc = Math.random() < 0.5;
    desc = `${t(a)} ${lc ? '\\leq' : '<'} x ${rc ? '\\leq' : '<'} ${t(b)}`;
    iv = { l: a, lc, r: b, rc };
  } else if (kind === 1) {
    const lc = Math.random() < 0.5;
    desc = `x ${lc ? '\\geq' : '>'} ${t(a)}`;
    iv = { l: a, lc, r: Infinity, rc: false };
  } else if (kind === 2) {
    const rc = Math.random() < 0.5;
    desc = `x ${rc ? '\\leq' : '<'} ${t(b)}`;
    iv = { l: -Infinity, lc: false, r: b, rc };
  } else {
    desc = `${t(a)} < x \\leq ${t(b)}`;
    iv = { l: a, lc: false, r: b, rc: true };
  }
  const wrong = iv.l === -Infinity
    ? [ivTex({ ...iv, rc: !iv.rc }), ivTex({ ...iv, lc: true }), ivTex({ l: iv.r, lc: iv.rc, r: Infinity, rc: false })]
    : iv.r === Infinity
      ? [ivTex({ ...iv, lc: !iv.lc }), ivTex({ ...iv, rc: true }), ivTex({ l: -Infinity, lc: false, r: iv.l, rc: iv.lc })]
      : ivVariants(iv);
  return {
    title: 'Beschreibende Form und Intervall',
    text: `Schreibe die Menge $\\{x \\in \\mathbb{R} \\mid ${desc}\\}$ in Intervallschreibweise.`,
    parts: [ch('Intervall:', `$${ivTex(iv)}$`, wrong.map((w) => `$${w}$`))],
    solution: [
      '$\\leq$ bzw. $\\geq$: Grenze gehört dazu → Klammer zeigt nach innen. $<$ bzw. $>$: Klammer zeigt nach außen.',
      'Bei $\\pm\\infty$ steht immer eine nach außen gerichtete Klammer.',
      `$\\{x \\in \\mathbb{R} \\mid ${desc}\\} = ${ivTex(iv)}$`,
    ],
  };
};

const teilmengen: Gen = () => {
  const items: [string, boolean, string][] = [
    ['\\mathbb{N} \\subset \\mathbb{Z}', true, 'Jede natürliche Zahl ist auch eine ganze Zahl.'],
    ['\\mathbb{Q} \\subset \\mathbb{Z}', false, '$\\frac{1}{2} \\in \\mathbb{Q}$, aber $\\frac{1}{2} \\notin \\mathbb{Z}$.'],
    ['\\mathbb{Z} \\cap \\mathbb{N} = \\mathbb{N}', true, 'Die gemeinsamen Elemente sind genau die natürlichen Zahlen.'],
    ['\\mathbb{Q} \\cup \\mathbb{R} = \\mathbb{Q}', false, 'Die Vereinigung ist $\\mathbb{R}$.'],
    ['\\sqrt{3} \\in \\mathbb{R} \\setminus \\mathbb{Q}', true, '$\\sqrt{3}$ ist irrational.'],
    ['-5 \\in \\mathbb{Z} \\setminus \\mathbb{N}', true, '$-5$ ist ganz, aber nicht natürlich.'],
    ['0{,}25 \\in \\mathbb{R} \\setminus \\mathbb{Q}', false, '$0{,}25 = \\frac{1}{4}$ ist rational.'],
    ['\\mathbb{Z} \\setminus \\mathbb{N} = \\{0; -1; -2; \\ldots\\}', true, 'Übrig bleiben null und die negativen ganzen Zahlen ($0 \\notin \\mathbb{N}$).'],
    ['\\mathbb{R} \\subset \\mathbb{Q}', false, 'Irrationale Zahlen wie $\\pi$ sind nicht rational.'],
  ];
  const [s, v, why] = pick(items);
  return {
    title: 'Beziehungen zwischen Zahlenmengen',
    text: `Entscheide: $${s}$`,
    parts: [WF('Die Aussage ist …', v)],
    solution: [`$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$`, why, `Die Aussage ist **${v ? 'wahr' : 'falsch'}**.`],
  };
};

// ---------------------------------------------------------------------------
// Potenzen und Betrag
// ---------------------------------------------------------------------------

const potenzWert: Gen = () => {
  const k = ri(0, 4);
  if (k === 0) {
    const a = pick([2, 3, 4, 5, 10]);
    const n = ri(1, a === 2 ? 4 : 2);
    return {
      title: 'Negative Exponenten',
      text: `Berechne $${a}^{-${n}}$. (Eingabe als Bruch oder Dezimalzahl)`,
      parts: [nm('Ergebnis', F(1, a ** n), { tol: 1e-6 })],
      solution: [`$a^{-x} = \\frac{1}{a^x}$`, `$${a}^{-${n}} = \\frac{1}{${a}^{${n}}} = \\frac{1}{${a ** n}}$`],
    };
  }
  if (k === 1) {
    const a = nz(-4, -2);
    const n = ri(2, 4);
    return {
      title: 'Potenzen negativer Zahlen',
      text: `Berechne $(${a})^{${n}}$ und $-${-a}^{${n}}$.`,
      parts: [nm(`$(${a})^{${n}}$`, a ** n, { integer: true }), nm(`$-${-a}^{${n}}$`, -((-a) ** n), { integer: true })],
      solution: [
        `$(${a})^{${n}}$: Die Klammer gehört zur Basis → ${n % 2 === 0 ? 'gerader Exponent → positiv' : 'ungerader Exponent → negativ'}: $${a ** n}$`,
        `$-${-a}^{${n}} = -(${-a}^{${n}}) = ${-((-a) ** n)}$ (das Minus gehört nicht zur Basis)`,
      ],
    };
  }
  if (k === 2) {
    const a = ri(2, 5);
    const b = ri(a + 1, 7);
    const n = pick([1, 2]);
    const r = F(b ** n, a ** n);
    return {
      title: 'Bruch hoch negative Zahl',
      text: `Berechne $\\left(\\frac{${a}}{${b}}\\right)^{-${n}}$.`,
      parts: [nm('Ergebnis', r, { tol: 0.002 })],
      solution: [`Negativer Exponent → Kehrbruch: $\\left(\\frac{${a}}{${b}}\\right)^{-${n}} = \\left(\\frac{${b}}{${a}}\\right)^{${n}} = ${r.tex()}$`],
    };
  }
  if (k === 3) {
    const a = pick([2, 3, 5]);
    const m = ri(2, 6);
    const n = ri(-3, 3);
    const q = ri(1, 5);
    const e = m + n - q;
    const val = F(a ** Math.max(e, 0), a ** Math.max(-e, 0));
    return {
      title: 'Potenzgesetze anwenden',
      text: `Berechne $\\frac{${a}^{${m}} \\cdot ${a}^{${n}}}{${a}^{${q}}}$ ohne Taschenrechner.`,
      parts: [nm('Ergebnis', val, { tol: 1e-6 })],
      solution: [
        '$a^x \\cdot a^y = a^{x+y}$ und $\\frac{a^x}{a^y} = a^{x-y}$',
        `$= ${a}^{${m} ${sg(n)} - ${q}} = ${a}^{${e}} = ${val.tex()}$`,
      ],
    };
  }
  const a = ri(2, 6);
  const b = ri(2, 5);
  const n = ri(2, 3);
  return {
    title: 'Potenzen mit gleichem Exponenten',
    text: `Berechne geschickt: $${a * b}^{${n}} : ${a}^{${n}}$`,
    parts: [nm('Ergebnis', b ** n, { integer: true })],
    solution: [`$\\frac{a^x}{b^x} = \\left(\\frac{a}{b}\\right)^x$`, `$\\left(\\frac{${a * b}}{${a}}\\right)^{${n}} = ${b}^{${n}} = ${b ** n}$`],
  };
};

const potenzTerm: Gen = () => {
  const c1 = ri(2, 6) * pick([1, 2, 3]);
  const c2 = pick([1, 2, 3].filter((x) => c1 % x === 0));
  const ex1 = ri(2, 7);
  const ex2 = ri(1, 5);
  const ey1 = ri(1, 4);
  const ey2 = ri(1, 5);
  const ex = ex1 - ex2;
  const ey = ey1 - ey2;
  return {
    title: 'Terme mit Potenzen vereinfachen',
    text: `Vereinfache $\\frac{${c1}x^{${ex1}}y^{${ey1}}}{${c2 === 1 ? '' : c2}x^{${ex2}}y^{${ey2}}}$ zu $k \\cdot x^{m} \\cdot y^{n}$ (mit $x, y \\neq 0$).`,
    parts: [nm('$k$', c1 / c2, { integer: true }), nm('$m$', ex, { integer: true }), nm('$n$', ey, { integer: true })],
    solution: [
      'Zahlen kürzen, gleiche Basen: $\\frac{a^x}{a^y} = a^{x-y}$',
      `$k = ${c1} : ${c2} = ${c1 / c2}$`,
      `$x^{${ex1} - ${ex2}} = x^{${ex}}$, $\\; y^{${ey1} - ${ey2}} = y^{${ey}}$`,
      `Ergebnis: $${c1 / c2}x^{${ex}}y^{${ey}}$${ey < 0 ? ` $= \\frac{${c1 / c2}x^{${ex}}}{y^{${-ey}}}$` : ''}`,
    ],
  };
};

const potenzVonPotenz: Gen = () => {
  const m = ri(2, 4);
  const n = nz(-3, 3);
  const k = ri(1, 6);
  const e = m * n + k;
  return {
    title: 'Potenz einer Potenz',
    text: `Schreibe $\\left(a^{${m}}\\right)^{${n}} \\cdot a^{${k}}$ als **eine** Potenz $a^{e}$ und gib $e$ an ($a \\neq 0$).`,
    parts: [nm('$e$', e, { integer: true })],
    solution: [`$(a^x)^y = a^{x \\cdot y}$: $\\left(a^{${m}}\\right)^{${n}} = a^{${m * n}}$`, `$a^{${m * n}} \\cdot a^{${k}} = a^{${m * n} ${sg(k)}} = a^{${e}}$`],
  };
};

const betragWert: Gen = () => {
  const a = nz(-9, 9);
  const b = nz(-9, 9);
  const c = nz(-12, 12);
  const val = Math.abs(a - b) - Math.abs(c);
  return {
    title: 'Beträge berechnen',
    text: `Berechne $|${a} - ${p(b)}| - |${c}|$.`,
    parts: [nm('Ergebnis', val, { integer: true })],
    solution: [
      '$|x| = x$ für $x \\geq 0$ und $|x| = -x$ für $x < 0$',
      `$|${a} - ${p(b)}| = |${a - b}| = ${Math.abs(a - b)}$ und $|${c}| = ${Math.abs(c)}$`,
      `$${Math.abs(a - b)} - ${Math.abs(c)} = ${val}$`,
    ],
  };
};

const betragsfrei: Gen = () => {
  const m = pick([1, 2, 3, -2]);
  const z = nz(-5, 5);
  const c = -m * z;
  const term = poly([m, c]);
  const right = poly([-m, -c]);
  const below = Math.random() < 0.5;
  // Fallgrenze: m·x + c = 0 → x = z
  const posLeft = m < 0; // für x < z ist m·x + c > 0, wenn m < 0
  const exprBelow = posLeft ? term : right;
  const exprAbove = posLeft ? right : term;
  const asked = below ? exprBelow : exprAbove;
  const other = below ? exprAbove : exprBelow;
  return {
    title: 'Betragsfrei darstellen',
    text: `Stelle $|${term}|$ betragsfrei dar.`,
    parts: [
      nm('Fallgrenze $x$', z, { integer: true, q: `a) Für welches $x$ wird $${term} = 0$?` }),
      ch(`b) Für $x ${below ? '<' : '\\geq'} ${z}$ gilt $|${term}| = $ …`, `$${asked}$`, [`$${other}$`, `$${poly([m, -c])}$`]),
    ],
    solution: [
      `Fallgrenze: $${term} = 0 \\iff x = ${z}$`,
      `Für $x \\geq ${z}$ ist $${term}$ ${posLeft ? 'negativ bzw. 0' : 'positiv bzw. 0'} → $|${term}| = ${exprAbove}$`,
      `Für $x < ${z}$ ist $${term}$ ${posLeft ? 'positiv' : 'negativ'} → $|${term}| = ${exprBelow}$`,
      `$|${term}| = \\begin{cases} ${exprAbove} & \\text{für } x \\geq ${z} \\\\ ${exprBelow} & \\text{für } x < ${z} \\end{cases}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Wurzeln
// ---------------------------------------------------------------------------

const SQF = [2, 3, 5, 6, 7, 10, 11];

const teilweiseRadizieren: Gen = () => {
  const a = ri(2, 7);
  const b = pick(SQF);
  const n = a * a * b;
  return {
    title: 'Teilweise radizieren',
    text: `Vereinfache $\\sqrt{${n}}$ zu $a\\sqrt{b}$ (mit möglichst kleinem $b$).`,
    parts: [nm('$a$', a, { integer: true }), nm('$b$', b, { integer: true })],
    solution: [
      `Größte Quadratzahl in $${n}$ suchen: $${n} = ${a * a} \\cdot ${b}$`,
      `$\\sqrt{${n}} = \\sqrt{${a * a}} \\cdot \\sqrt{${b}} = ${a}\\sqrt{${b}}$`,
    ],
  };
};

const wurzelgesetze: Gen = () => {
  const r = ri(2, 9);
  const b = pick(SQF);
  const k = Math.random() < 0.5;
  if (k) {
    // √(b·s²) · √b = s·b ... wähle x·y = (r·b)² / b ... einfach: √(b) · √(b·r²) = b·r
    return {
      title: 'Wurzeln multiplizieren',
      text: `Berechne ohne Taschenrechner: $\\sqrt{${b}} \\cdot \\sqrt{${b * r * r}}$`,
      parts: [nm('Ergebnis', b * r, { integer: true })],
      solution: [
        '$\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}$',
        `$\\sqrt{${b} \\cdot ${b * r * r}} = \\sqrt{${b * b * r * r}} = ${b * r}$`,
      ],
    };
  }
  return {
    title: 'Wurzeln dividieren',
    text: `Berechne ohne Taschenrechner: $\\frac{\\sqrt{${b * r * r}}}{\\sqrt{${b}}}$`,
    parts: [nm('Ergebnis', r, { integer: true })],
    solution: ['$\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$', `$\\sqrt{\\frac{${b * r * r}}{${b}}} = \\sqrt{${r * r}} = ${r}$`],
  };
};

const wurzelZusammenfassen: Gen = () => {
  const b = pick([2, 3, 5]);
  const [k1, k2, k3] = shuffle([1, 2, 3, 4, 5]).slice(0, 3);
  const c1 = nz(-3, 4);
  const c2 = nz(-3, 3);
  const c3 = nz(-3, 3);
  const total = c1 * k1 + c2 * k2 + c3 * k3;
  const w = (c: number, k: number, first = false) => {
    const coef = Math.abs(c) === 1 ? '' : `${Math.abs(c)}`;
    const s = `${coef}\\sqrt{${k * k * b}}`;
    return first ? `${c < 0 ? '-' : ''}${s}` : `${c < 0 ? '-' : '+'} ${s}`;
  };
  const term = `${w(c1, k1, true)} ${w(c2, k2)} ${w(c3, k3)}`;
  return {
    title: 'Wurzelterme zusammenfassen',
    text: `Vereinfache $${term}$ zu $c\\sqrt{${b}}$. Gib $c$ an.`,
    parts: [nm('$c$', total, { integer: true })],
    solution: [
      'Erst teilweise radizieren, dann gleiche Wurzeln zusammenfassen:',
      `$\\sqrt{${k1 * k1 * b}} = ${k1}\\sqrt{${b}}$, $\\sqrt{${k2 * k2 * b}} = ${k2}\\sqrt{${b}}$, $\\sqrt{${k3 * k3 * b}} = ${k3}\\sqrt{${b}}$`,
      `$(${c1} \\cdot ${k1} ${sg(c2)} \\cdot ${k2} ${sg(c3)} \\cdot ${k3})\\sqrt{${b}} = ${total}\\sqrt{${b}}$`,
    ],
  };
};

const nennerRational: Gen = () => {
  if (Math.random() < 0.55) {
    const b = pick(SQF);
    const a = ri(1, 12);
    const r = F(a, b);
    return {
      title: 'Nenner rational machen',
      text: `Mache den Nenner rational: $\\frac{${a}}{\\sqrt{${b}}} = c\\sqrt{${b}}$. Gib $c$ an (als Bruch oder ganze Zahl).`,
      parts: [nm('$c$', r, { tol: 0.002 })],
      solution: [
        `Mit $\\sqrt{${b}}$ erweitern: $\\frac{${a}}{\\sqrt{${b}}} = \\frac{${a}\\sqrt{${b}}}{\\sqrt{${b}} \\cdot \\sqrt{${b}}} = \\frac{${a}\\sqrt{${b}}}{${b}}$`,
        `$= ${r.tex()}\\sqrt{${b}}$, also $c = ${r.tex()}$`,
      ],
    };
  }
  // c / (√a − b) mit a − b² = d, c = k·d
  for (;;) {
    const a = pick([3, 5, 6, 7, 10, 11]);
    const b = ri(1, 3);
    const d = a - b * b;
    if (d === 0 || Math.abs(d) > 10) continue;
    const k = nz(-3, 3);
    const c = k * d;
    return {
      title: 'Nenner rational machen (3. binomische Formel)',
      text: `Mache den Nenner rational: $\\frac{${c}}{\\sqrt{${a}} - ${b}} = p + q\\sqrt{${a}}$. Gib $p$ und $q$ an.`,
      parts: [nm('$p$', k * b, { integer: true }), nm('$q$', k, { integer: true })],
      solution: [
        `Mit $\\sqrt{${a}} + ${b}$ erweitern (3. binomische Formel im Nenner):`,
        `$\\frac{${c}(\\sqrt{${a}} + ${b})}{(\\sqrt{${a}} - ${b})(\\sqrt{${a}} + ${b})} = \\frac{${c}(\\sqrt{${a}} + ${b})}{${a} - ${b * b}} = \\frac{${c}(\\sqrt{${a}} + ${b})}{${d}}$`,
        `$= ${k}(\\sqrt{${a}} + ${b}) = ${k * b} ${sg(k)}\\sqrt{${a}}$`,
      ],
    };
  }
};

const wurzelAbschaetzen: Gen = () => {
  if (Math.random() < 0.5) {
    let n = ri(5, 140);
    while (Number.isInteger(Math.sqrt(n))) n++;
    const lo = Math.floor(Math.sqrt(n));
    return {
      title: 'Wurzeln abschätzen',
      text: `Zwischen welchen aufeinanderfolgenden natürlichen Zahlen liegt $\\sqrt{${n}}$? Gib die **kleinere** Zahl an.`,
      parts: [nm('kleinere Zahl', lo, { integer: true })],
      solution: [`$${lo}^2 = ${lo * lo} < ${n} < ${(lo + 1) ** 2} = ${lo + 1}^2$`, `Also $${lo} < \\sqrt{${n}} < ${lo + 1}$.`],
    };
  }
  const b = pick([2, 3]);
  const appr = b === 2 ? 1.414 : 1.732;
  const k1 = ri(1, 4);
  const k2 = ri(2, 3);
  const c = k1 + k2;
  return {
    title: 'Näherungswert ohne Taschenrechner',
    text: `Bestimme mit $\\sqrt{${b}} \\approx ${t(appr, 3)}$ einen Näherungswert für $${k1 === 1 ? '' : k1}\\sqrt{${b}} + \\sqrt{${k2 * k2 * b}}$ (auf zwei Dezimalen).`,
    parts: [nm('Näherungswert', c * appr, { tol: 0.02 })],
    solution: [
      `$\\sqrt{${k2 * k2 * b}} = ${k2}\\sqrt{${b}}$`,
      `$${k1}\\sqrt{${b}} + ${k2}\\sqrt{${b}} = ${c}\\sqrt{${b}} \\approx ${c} \\cdot ${t(appr, 3)} \\approx ${t(c * appr, 2)}$`,
    ],
  };
};

const wurzelBinom: Gen = () => {
  const a = pick(SQF);
  const b = ri(1, 5);
  if (Math.random() < 0.5) {
    return {
      title: 'Binomische Formeln mit Wurzeln',
      text: `Berechne $(\\sqrt{${a}} + ${b})(\\sqrt{${a}} - ${b})$.`,
      parts: [nm('Ergebnis', a - b * b, { integer: true })],
      solution: ['3. binomische Formel: $(a + b)(a - b) = a^2 - b^2$', `$(\\sqrt{${a}})^2 - ${b}^2 = ${a} - ${b * b} = ${a - b * b}$`],
    };
  }
  const minus = Math.random() < 0.5;
  return {
    title: 'Binomische Formeln mit Wurzeln',
    text: `Vereinfache $(\\sqrt{${a}} ${minus ? '-' : '+'} ${b})^2 = p + q\\sqrt{${a}}$. Gib $p$ und $q$ an.`,
    parts: [nm('$p$', a + b * b, { integer: true }), nm('$q$', minus ? -2 * b : 2 * b, { integer: true })],
    solution: [
      `${minus ? '2' : '1'}. binomische Formel: $(a ${minus ? '-' : '+'} b)^2 = a^2 ${minus ? '-' : '+'} 2ab + b^2$`,
      `$(\\sqrt{${a}})^2 ${minus ? '-' : '+'} 2 \\cdot ${b}\\sqrt{${a}} + ${b * b} = ${a + b * b} ${minus ? '-' : '+'} ${2 * b}\\sqrt{${a}}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Termumformungen
// ---------------------------------------------------------------------------

const coefParts = (c: number[]) => [
  nm('Koeffizient vor $x^2$', c[0], { integer: true }),
  nm('Koeffizient vor $x$', c[1], { integer: true }),
  nm('Zahl ohne $x$', c[2], { integer: true }),
];

const ausmultiplizieren: Gen = () => {
  const a = nz(-4, 4);
  const b = nz(-7, 7);
  const c = nz(-4, 4);
  const d = nz(-7, 7);
  const res = [a * c, a * d + b * c, b * d];
  return {
    title: 'Summen multiplizieren',
    text: `Multipliziere aus und fasse zusammen: $(${poly([a, b])})(${poly([c, d])})$\nErgebnis in der Form $\\square\\, x^2 + \\square\\, x + \\square$.`,
    parts: coefParts(res),
    solution: [
      'Jeder Summand der ersten Klammer wird mit jedem Summanden der zweiten Klammer multipliziert:',
      `$${p(a)}x \\cdot ${p(c)}x + ${p(a)}x \\cdot ${p(d)} + ${p(b)} \\cdot ${p(c)}x + ${p(b)} \\cdot ${p(d)}$`,
      `$= ${a * c}x^2 ${sg(a * d)}x ${sg(b * c)}x ${sg(b * d)} = ${poly(res)}$`,
    ],
  };
};

const binomischeFormel: Gen = () => {
  const a = ri(1, 5);
  const b = ri(1, 9);
  const k = ri(0, 2);
  const lhs = k === 0 ? `(${poly([a, b])})^2` : k === 1 ? `(${poly([a, -b])})^2` : `(${poly([a, b])})(${poly([a, -b])})`;
  const res = k === 0 ? [a * a, 2 * a * b, b * b] : k === 1 ? [a * a, -2 * a * b, b * b] : [a * a, 0, -b * b];
  const formel = ['$(a + b)^2 = a^2 + 2ab + b^2$', '$(a - b)^2 = a^2 - 2ab + b^2$', '$(a + b)(a - b) = a^2 - b^2$'][k];
  const ax = a === 1 ? 'x' : `${a}x`;
  return {
    title: `${k + 1}. binomische Formel`,
    text: `Wende eine binomische Formel an: $${lhs}$\nErgebnis in der Form $\\square\\, x^2 + \\square\\, x + \\square$.`,
    parts: coefParts(res),
    solution: [
      formel,
      k === 2
        ? `$(${ax})^2 - ${b}^2 = ${poly(res)}$`
        : `$(${ax})^2 ${k === 0 ? '+' : '-'} 2 \\cdot ${ax} \\cdot ${b} + ${b}^2 = ${poly(res)}$`,
    ],
  };
};

const faktorisierenBinom: Gen = () => {
  const a = ri(1, 4);
  const b = ri(1, 7);
  const k = ri(0, 2);
  const res = k === 0 ? [a * a, 2 * a * b, b * b] : k === 1 ? [a * a, -2 * a * b, b * b] : [a * a, 0, -b * b];
  const opts = [`$(${poly([a, b])})^2$`, `$(${poly([a, -b])})^2$`, `$(${poly([a, b])})(${poly([a, -b])})$`];
  return {
    title: 'Faktorisieren mit binomischen Formeln',
    text: `Schreibe $${poly(res)}$ als Produkt.`,
    parts: [ch('Faktorisierung:', opts[k], [...opts.filter((_, i) => i !== k), `$(${poly([b, a])})^2$`])],
    solution: [
      k === 2
        ? `Differenz zweier Quadrate: $${poly([a * a, 0, 0])} = (${a === 1 ? 'x' : `${a}x`})^2$ und $${b * b} = ${b}^2$ → 3. binomische Formel`
        : `$${poly([a * a, 0, 0])} = (${a === 1 ? 'x' : `${a}x`})^2$, $${b * b} = ${b}^2$ und $2 \\cdot ${a === 1 ? 'x' : `${a}x`} \\cdot ${b} = ${2 * a * b}x$ → ${k + 1}. binomische Formel`,
      `$${poly(res)} = ${opts[k].slice(1, -1)}$`,
    ],
  };
};

const ausklammern: Gen = () => {
  const g = ri(2, 6);
  let u = nz(-5, 5);
  let v = nz(-7, 7);
  while (gcd(u, v) !== 1) {
    u = nz(-5, 5);
    v = nz(-7, 7);
  }
  if (u < 0) {
    u = -u;
    v = -v;
  }
  const term = poly([g * u, g * v, 0]);
  const right = `$${g}x(${poly([u, v])})$`;
  return {
    title: 'Ausklammern',
    text: `Klammere so viel wie möglich aus: $${term}$`,
    parts: [
      ch('Ergebnis:', right, [
        `$x(${poly([g * u, g * v])})$`,
        `$${g}x(${poly([u, -v])})$`,
        `$${g}(${poly([u, v, 0])})$`,
        `$${g}x(${poly([g * u, v])})$`,
      ]),
    ],
    solution: [
      `Gemeinsamer Faktor der Zahlen: $${g}$, gemeinsame Variable: $x$`,
      `$${term} = ${g}x \\cdot ${p(u)}x + ${g}x \\cdot ${p(v)} = ${g}x(${poly([u, v])})$`,
      'Probe durch Ausmultiplizieren!',
    ],
  };
};

const produkteAddieren: Gen = () => {
  const a = nz(-4, 4);
  const b = nz(-6, 6);
  const c = nz(-4, 4);
  const d = nz(-6, 6);
  const e = nz(-3, 3);
  const f = nz(-5, 5);
  // a x (b x + c) + e (d x + f)… allgemeiner: (x + a)(x + b) − (x + c)²
  const k = Math.random() < 0.5;
  if (k) {
    const res = [a * b, a * c + e * d, e * f];
    return {
      title: 'Produkte addieren',
      text: `Vereinfache $${a === 1 ? '' : a === -1 ? '-' : a}x(${poly([b, c])}) ${e < 0 ? '-' : '+'} ${Math.abs(e) === 1 ? '' : Math.abs(e)}(${poly([d, f])})$\nErgebnis: $\\square\\, x^2 + \\square\\, x + \\square$`,
      parts: coefParts(res),
      solution: [
        `$= ${poly([a * b, a * c, 0])} ${sg(e * d)}x ${sg(e * f)}$`,
        `$= ${poly(res)}$`,
      ],
    };
  }
  const res = [0, a + b - 2 * c, a * b - c * c];
  return {
    title: 'Summen multiplizieren und subtrahieren',
    text: `Vereinfache $(${poly([1, a])})(${poly([1, b])}) - (${poly([1, c])})^2$\nErgebnis: $\\square\\, x^2 + \\square\\, x + \\square$`,
    parts: coefParts(res),
    solution: [
      `$(${poly([1, a])})(${poly([1, b])}) = ${poly([1, a + b, a * b])}$`,
      `$(${poly([1, c])})^2 = ${poly([1, 2 * c, c * c])}$ (binomische Formel)`,
      `Klammer beim Subtrahieren auflösen (Vorzeichen umdrehen!): $${poly([1, a + b, a * b])} - (${poly([1, 2 * c, c * c])})$`,
      `$= ${poly(res)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Bruchterme
// ---------------------------------------------------------------------------

const definitionsmenge: Gen = () => {
  const b = nz(-6, 6);
  let c = nz(-6, 6);
  while (c === b) c = nz(-6, 6);
  const a = nz(-5, 5);
  const z = [b, c].sort((x, y) => x - y);
  const right = `$\\mathbb{R} \\setminus ${setTex(z)}$`;
  return {
    title: 'Definitionsmenge von Bruchtermen',
    text: `Bestimme die maximale Definitionsmenge von $\\frac{${poly([1, a])}}{(${poly([1, -b])})(${poly([1, -c])})}$.`,
    parts: [ch('$D =$', right, [`$\\mathbb{R} \\setminus ${setTex([-b, -c].sort((x, y) => x - y))}$`, `$\\mathbb{R} \\setminus ${setTex([-a])}$`, `$\\mathbb{R}$`])],
    solution: [
      'Der Nenner darf nicht null werden.',
      `$(${poly([1, -b])})(${poly([1, -c])}) = 0 \\iff x = ${b} \\lor x = ${c}$`,
      `$D = \\mathbb{R} \\setminus ${setTex(z)}$`,
    ],
  };
};

const bruchtermKuerzen: Gen = () => {
  const a = ri(1, 7);
  const k = ri(2, 6);
  const v = ri(0, 2);
  if (v === 0) {
    return {
      title: 'Bruchterme kürzen',
      text: `Kürze $\\frac{x^2 - ${a * a}}{x + ${a}}$ (für $x \\neq -${a}$).`,
      parts: [ch('Ergebnis:', `$x - ${a}$`, [`$x + ${a}$`, `$x - ${a * a}$`, `$\\frac{x - ${a}}{x}$`])],
      solution: [`Zähler mit 3. binomischer Formel faktorisieren: $x^2 - ${a * a} = (x + ${a})(x - ${a})$`, `$\\frac{(x + ${a})(x - ${a})}{x + ${a}} = x - ${a}$`],
    };
  }
  if (v === 1) {
    return {
      title: 'Bruchterme kürzen',
      text: `Kürze $\\frac{${k}x + ${k * a}}{x^2 + ${2 * a}x + ${a * a}}$ (für $x \\neq -${a}$).`,
      parts: [ch('Ergebnis:', `$\\frac{${k}}{x + ${a}}$`, [`$\\frac{${k}}{x - ${a}}$`, `$\\frac{${k}x}{x + ${a}}$`, `$${k}(x + ${a})$`])],
      solution: [
        `Zähler: $${k}x + ${k * a} = ${k}(x + ${a})$; Nenner: $(x + ${a})^2$ (1. binomische Formel)`,
        `$\\frac{${k}(x + ${a})}{(x + ${a})^2} = \\frac{${k}}{x + ${a}}$`,
      ],
    };
  }
  return {
    title: 'Bruchterme multiplizieren',
    text: `Vereinfache $\\frac{x^2 - ${a * a}}{${k}x} \\cdot \\frac{${2 * k}x}{x - ${a}}$ (für $x \\neq 0$, $x \\neq ${a}$).`,
    parts: [ch('Ergebnis:', `$2(x + ${a})$`, [`$2(x - ${a})$`, `$\\frac{x + ${a}}{2}$`, `$${2 * k}(x + ${a})$`])],
    solution: [
      `$x^2 - ${a * a} = (x + ${a})(x - ${a})$`,
      `$\\frac{(x + ${a})(x - ${a}) \\cdot ${2 * k}x}{${k}x \\cdot (x - ${a})} = 2(x + ${a})$`,
    ],
  };
};

const bruchtermAddieren: Gen = () => {
  const a = nz(-5, 5);
  const b = nz(-5, 5);
  const c = nz(-5, 5);
  // a/x + b/(x + c) = ((a + b)x + a c) / (x(x + c))
  return {
    title: 'Bruchterme addieren',
    text: `Fasse zusammen: $\\frac{${a}}{x} + \\frac{${b}}{${poly([1, c])}} = \\frac{\\square\\, x + \\square}{x(${poly([1, c])})}$`,
    parts: [nm('Koeffizient vor $x$', a + b, { integer: true }), nm('Zahl', a * c, { integer: true })],
    solution: [
      `Hauptnenner: $x(${poly([1, c])})$`,
      `$\\frac{${a}(${poly([1, c])})}{x(${poly([1, c])})} + \\frac{${b}x}{x(${poly([1, c])})} = \\frac{${poly([a, a * c])} ${sg(b)}x}{x(${poly([1, c])})}$`,
      `$= \\frac{${poly([a + b, a * c])}}{x(${poly([1, c])})}$`,
    ],
  };
};

const bruchtermWert: Gen = () => {
  const a = nz(-4, 4);
  const b = nz(-6, 6);
  let x = nz(-5, 5);
  while (x === -a) x = nz(-5, 5);
  const val = F(x * x + b, x + a);
  return {
    title: 'Bruchterm auswerten',
    text: `Berechne den Wert von $T(x) = \\frac{x^2 ${sg(b)}}{${poly([1, a])}}$ für $x = ${x}$.`,
    parts: [nm(`$T(${x})$`, val, { tol: 0.002 })],
    solution: [`$T(${x}) = \\frac{${p(x)}^2 ${sg(b)}}{${x} ${sg(a)}} = \\frac{${x * x + b}}{${x + a}} = ${val.tex()}$`],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'aussagenlogik',
    title: 'Aussagenlogik',
    description: 'Aussagen, Aussageformen, Konjunktion, Disjunktion, Negation, Konditional',
    intro:
      'Eine **Aussage** ist ein Satz, der eindeutig **wahr (w)** oder **falsch (f)** ist. Eine **Aussageform** enthält eine Variable (z. B. $x + 2 = 5$) und wird erst durch Einsetzen zur Aussage.\n\nVerknüpfungen: **Negation** $\\lnot A$ („nicht A“) kehrt den Wahrheitswert um. **Konjunktion** $A \\land B$ („und“) ist nur wahr, wenn beide wahr sind. **Disjunktion** $A \\lor B$ („oder“) ist wahr, wenn mindestens eine wahr ist. **Konditional** $A \\Rightarrow B$ („wenn A, dann B“) ist **nur falsch**, wenn $A$ wahr und $B$ falsch ist.',
    formulas: [
      '\\begin{array}{cc|c|c|c|c} A & B & \\lnot A & A \\land B & A \\lor B & A \\Rightarrow B \\\\ \\hline \\text{w} & \\text{w} & \\text{f} & \\text{w} & \\text{w} & \\text{w} \\\\ \\text{w} & \\text{f} & \\text{f} & \\text{f} & \\text{w} & \\text{f} \\\\ \\text{f} & \\text{w} & \\text{w} & \\text{f} & \\text{w} & \\text{w} \\\\ \\text{f} & \\text{f} & \\text{w} & \\text{f} & \\text{f} & \\text{w} \\end{array}',
      '\\lnot(A \\land B) = \\lnot A \\lor \\lnot B',
      '\\lnot(A \\lor B) = \\lnot A \\land \\lnot B',
    ],
    example: {
      title: 'Wahrheitswert einer Verknüpfung',
      text: '$A$: „$12$ ist durch $4$ teilbar“ (w), $B$: „$5$ ist gerade“ (f). Ist $A \\Rightarrow B$ wahr?',
      steps: ['Voraussetzung $A$ ist wahr, Folgerung $B$ ist falsch.', '$\\text{w} \\Rightarrow \\text{f} = \\text{f}$ – das Konditional ist **falsch**.'],
    },
    gens: [wahrheitswert, mathVerknuepfung, aussageErkennen, alltagFormalisieren, negation, aussageformLoesung],
  },
  {
    slug: 'zahlenmengen',
    title: 'Zahlenmengen und Mengenoperationen',
    description: 'ℕ, ℤ, ℚ, ℝ, Schnitt-, Vereinigungs- und Differenzmenge, Intervalle',
    intro:
      '$\\mathbb{N} = \\{1; 2; 3; \\ldots\\}$ natürliche Zahlen, $\\mathbb{Z} = \\{\\ldots; -2; -1; 0; 1; 2; \\ldots\\}$ ganze Zahlen, $\\mathbb{Q}$ rationale Zahlen (alle Brüche, also endliche oder periodische Dezimalzahlen), $\\mathbb{R}$ reelle Zahlen (zusätzlich irrationale Zahlen wie $\\sqrt{2}$ oder $\\pi$). Es gilt $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$.\n\n**Schnittmenge** $A \\cap B$: in $A$ **und** $B$. **Vereinigungsmenge** $A \\cup B$: in $A$ **oder** $B$. **Differenzmenge** $A \\setminus B$: in $A$, aber **nicht** in $B$. Intervalle: $[a;\\,b]$ mit Grenzen, $]a;\\,b[$ ohne Grenzen.',
    formulas: ['\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}', '[a;\\,b] = \\{x \\in \\mathbb{R} \\mid a \\leq x \\leq b\\}', ']a;\\,b[ = \\{x \\in \\mathbb{R} \\mid a < x < b\\}', '[a;\\,+\\infty[ = \\{x \\in \\mathbb{R} \\mid x \\geq a\\}'],
    example: {
      title: 'Schnitt zweier Intervalle',
      text: '$A = [-2;\\,4[$, $B = ]1;\\,6]$. Bestimme $A \\cap B$.',
      steps: ['Am Zahlenstrahl überlappen sich die Intervalle zwischen $1$ und $4$.', '$1$ gehört nicht zu $B$, $4$ nicht zu $A$.', '$A \\cap B = ]1;\\,4[$'],
    },
    gens: [kleinsteMenge, elementWF, teilmengen, mengenOps, intervallOps, beschreibendIntervall],
  },
  {
    slug: 'rechenregeln',
    title: 'Rechenregeln, ganze Zahlen und Brüche',
    description: 'Termart, Fachbegriffe, Rechengesetze, ganze Zahlen, Bruchrechnen – in 8 Unterthemen',
    intro:
      'Dieses Thema ist in **8 Unterthemen** aufgeteilt. Wähle oben ein Unterthema, um es mit eigener Erklärung, Merkhilfe und Beispiel gezielt zu üben – oder übe alles gemischt.\n\nReihenfolge beim Rechnen: **Klammer → Potenz → Punkt → Strich**. Brüche kannst du als z. B. **-5/6** eingeben, Ergebnisse immer vollständig kürzen.',
    formulas: ['\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{ad \\pm bc}{bd}', '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}', '\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}', 'a(b + c) = ab + ac'],
    gens: rechenregelnGens,
    nBasic: 8,
    sections: rechenregelnSections,
  },
  {
    slug: 'potenzen-betrag',
    title: 'Potenzen und Absolutbetrag',
    description: 'Potenzgesetze anwenden, Terme mit Beträgen betragsfrei darstellen',
    intro:
      'Potenzgesetze (Merkhilfe): Bei **gleicher Basis** werden Exponenten addiert bzw. subtrahiert, bei **gleichem Exponenten** werden die Basen multipliziert bzw. dividiert. Ein negativer Exponent bedeutet Kehrwert: $a^{-x} = \\frac{1}{a^x}$.\n\nDer **Betrag** $|x|$ ist der Abstand zur Null. Um $|T(x)|$ betragsfrei darzustellen, bestimmt man die Stelle, an der $T(x) = 0$ wird, und unterscheidet die Fälle $T(x) \\geq 0$ (Betrag fällt weg) und $T(x) < 0$ (Vorzeichen umdrehen).',
    formulas: ['a^x \\cdot a^y = a^{x+y}', '\\frac{a^x}{a^y} = a^{x-y}', '(a^x)^y = a^{x \\cdot y}', 'a^x \\cdot b^x = (a \\cdot b)^x', 'a^{-x} = \\frac{1}{a^x}, \\quad a^0 = 1', '|x| = \\begin{cases} x & x \\geq 0 \\\\ -x & x < 0 \\end{cases}'],
    example: {
      title: 'Betragsfrei darstellen',
      text: 'Stelle $|2x - 6|$ betragsfrei dar.',
      steps: ['$2x - 6 = 0 \\iff x = 3$', 'Für $x \\geq 3$: $|2x - 6| = 2x - 6$', 'Für $x < 3$: $|2x - 6| = -(2x - 6) = -2x + 6$'],
    },
    gens: [potenzWert, potenzTerm, potenzVonPotenz, betragWert, betragsfrei],
  },
  {
    slug: 'wurzeln',
    title: 'Quadratwurzeln',
    description: 'Wurzelgesetze, teilweise Radizieren, Nenner rational machen, Abschätzen',
    intro:
      '$\\sqrt{a}$ ist die nichtnegative Zahl, deren Quadrat $a$ ergibt ($a \\geq 0$). **Teilweise radizieren**: größte Quadratzahl abspalten, z. B. $\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$. Nur gleiche Wurzeln lassen sich addieren.\n\n**Nenner rational machen**: Bei $\\frac{a}{\\sqrt{b}}$ mit $\\sqrt{b}$ erweitern; bei $\\frac{a}{\\sqrt{b} - c}$ mit $\\sqrt{b} + c$ erweitern (3. binomische Formel).',
    formulas: ['\\sqrt{a} \\cdot \\sqrt{a} = a', '\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}', '\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}', '\\sqrt{a^2} = |a|'],
    example: {
      title: 'Nenner rational machen',
      text: 'Vereinfache $\\frac{6}{\\sqrt{3}}$.',
      steps: ['$\\frac{6}{\\sqrt{3}} = \\frac{6 \\cdot \\sqrt{3}}{\\sqrt{3} \\cdot \\sqrt{3}} = \\frac{6\\sqrt{3}}{3}$', '$= 2\\sqrt{3}$'],
    },
    gens: [teilweiseRadizieren, wurzelgesetze, wurzelZusammenfassen, nennerRational, wurzelAbschaetzen, wurzelBinom],
  },
  {
    slug: 'termumformungen',
    title: 'Termumformungen',
    description: 'Ausmultiplizieren, binomische Formeln, Ausklammern',
    intro:
      '**Summen multiplizieren**: Jeder Summand der einen Klammer wird mit jedem Summanden der anderen Klammer multipliziert. **Ausklammern** ist die Umkehrung: den größten gemeinsamen Faktor vor die Klammer ziehen.\n\nDie **binomischen Formeln** sparen Rechenarbeit und helfen beim Faktorisieren. Steht vor einer Klammer ein Minus, drehen sich beim Auflösen alle Vorzeichen in der Klammer um.',
    formulas: ['(a + b)^2 = a^2 + 2ab + b^2', '(a - b)^2 = a^2 - 2ab + b^2', '(a + b)(a - b) = a^2 - b^2', '(a + b)(c + d) = ac + ad + bc + bd'],
    example: {
      title: 'Ausmultiplizieren',
      text: 'Vereinfache $(2x - 3)(x + 4)$.',
      steps: ['$2x \\cdot x + 2x \\cdot 4 - 3 \\cdot x - 3 \\cdot 4$', '$= 2x^2 + 8x - 3x - 12 = 2x^2 + 5x - 12$'],
    },
    gens: [ausmultiplizieren, binomischeFormel, faktorisierenBinom, ausklammern, produkteAddieren],
  },
  {
    slug: 'bruchterme',
    title: 'Bruchterme',
    description: 'Definitionsmenge, Kürzen, Addieren und Multiplizieren',
    intro:
      'Ein **Bruchterm** enthält die Variable im Nenner. Zuerst die **Definitionsmenge** bestimmen: Alle $x$, für die der Nenner null wird, sind ausgeschlossen.\n\nKürzen darf man nur **Faktoren**, nie einzelne Summanden. Deshalb Zähler und Nenner zuerst faktorisieren (Ausklammern, binomische Formeln). Zum Addieren auf den Hauptnenner bringen.',
    formulas: ['\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}', 'x^2 - a^2 = (x + a)(x - a)'],
    example: {
      title: 'Kürzen',
      text: 'Kürze $\\frac{3x + 6}{x^2 - 4}$.',
      steps: ['$D = \\mathbb{R} \\setminus \\{-2; 2\\}$', '$\\frac{3(x + 2)}{(x + 2)(x - 2)} = \\frac{3}{x - 2}$'],
    },
    gens: [definitionsmenge, bruchtermKuerzen, bruchtermAddieren, bruchtermWert],
  },
];

export const lb1: TopicConfig = {
  slug: 'grundlagen',
  title: 'Aussagenlogik, Mengen und Rechenregeln',
  description: 'Lernbereich 1: Aussagen verknüpfen, Zahlenmengen, Brüche, Potenzen, Beträge, Wurzeln und Terme',
  icon: 'logic',
  pages,
};
