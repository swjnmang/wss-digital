import type { Gen, PracticeConfig, TopicConfig } from '../engine/types';
import { de, pick, q, ri, rs, round, tx, type UnitId } from '../engine/util';
import Scene, { C, type El, type P } from '../figures/Scene';
import { sl } from '../figures/shapes';
import { lenUnit, name, num, res } from './helpers';
import { examsFor } from './pruefung';

const F_SS = [
  'k = \\frac{L\'}{L}',
  '\\text{1. SS: } \\frac{|\\overline{ZA}|}{|\\overline{ZA\'}|} = \\frac{|\\overline{ZB}|}{|\\overline{ZB\'}|}',
  '\\frac{|\\overline{ZA}|}{|\\overline{AA\'}|} = \\frac{|\\overline{ZB}|}{|\\overline{BB\'}|}',
  '\\text{2. SS: } \\frac{|\\overline{AB}|}{|\\overline{A\'B\'}|} = \\frac{|\\overline{ZA}|}{|\\overline{ZA\'}|} = \\frac{|\\overline{ZB}|}{|\\overline{ZB\'}|}',
];

interface SSLabels {
  ZA?: string;
  AA?: string;
  ZA_?: string;
  ZB?: string;
  BB?: string;
  ZB_?: string;
  AB?: string;
  A_B_?: string;
}

const ang = (d: number): P => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)];
const isQ = (s?: string) => !!s && (s.includes('?') || s.startsWith('x'));

/** Strahlensatz-Figur. V-Figur (Standard) oder X-Figur (Parallelen auf verschiedenen Seiten von Z). */
export function StrahlFig(props: { za: number; zaa: number; zb: number; zbb: number; l: SSLabels; x?: boolean; names?: [string, string, string, string, string] }) {
  const N = props.names ?? ['Z', 'A', 'B', "A'", "B'"];
  const u1 = ang(props.x ? 22 : 26);
  const u2 = ang(props.x ? -28 : -20);
  const s = props.x ? -1 : 1;
  const Z: P = [0, 0];
  const A: P = [u1[0] * props.za, u1[1] * props.za];
  const B: P = [u2[0] * props.zb, u2[1] * props.zb];
  const A_: P = [u1[0] * props.zaa * s, u1[1] * props.zaa * s];
  const B_: P = [u2[0] * props.zbb * s, u2[1] * props.zbb * s];
  const ext = 1.12;
  const els: El[] = [];
  if (props.x) {
    els.push({ t: 'line', pts: [[A_[0] * ext, A_[1] * ext], [A[0] * ext, A[1] * ext]] });
    els.push({ t: 'line', pts: [[B_[0] * ext, B_[1] * ext], [B[0] * ext, B[1] * ext]] });
  } else {
    els.push({ t: 'line', pts: [Z, [A_[0] * ext, A_[1] * ext]] });
    els.push({ t: 'line', pts: [Z, [B_[0] * ext, B_[1] * ext]] });
  }
  els.push({ t: 'line', pts: [A, B], stroke: C.blue, w: 2.2 });
  els.push({ t: 'line', pts: [A_, B_], stroke: C.blue, w: 2.2 });
  [Z, A, B, A_, B_].forEach((p) => els.push({ t: 'dot', at: p }));
  const up: P = [0, 1];
  const down: P = [0, -1];
  els.push({ t: 'label', at: Z, text: N[0], dx: props.x ? 0 : -12, dy: props.x ? 16 : 0, color: C.blue });
  // Punktnamen
  els.push({ t: 'label', at: A, text: N[1], dx: -4, dy: -13, color: C.blue });
  els.push({ t: 'label', at: B, text: N[2], dx: -4, dy: 14, color: C.blue });
  els.push({ t: 'label', at: A_, text: N[3], dx: props.x ? -4 : 6, dy: props.x ? 14 : -13, color: C.blue });
  els.push({ t: 'label', at: B_, text: N[4], dx: props.x ? -4 : 6, dy: props.x ? -13 : 14, color: C.blue });
  const L = props.l;
  const col = (t?: string) => (isQ(t) ? C.red : C.label);
  const lab = (a: P, b: P, t: string | undefined, away: P) => (t ? sl(a, b, t, away).map((e) => ({ ...e, color: col(t) }) as El) : []);
  // Strecken auf den Strahlen: Beschriftung nach außen
  els.push(...lab(Z, A, L.ZA, props.x ? up : down));
  els.push(...lab(A, A_, L.AA, down));
  const dim = (a: P, b: P, t: string | undefined, away: P): El[] => {
    if (!t) return [];
    const e = sl(a, b, t, away)[0];
    return e && e.t === 'side' ? [{ t: 'dim', a, b, text: t, side: e.side, off: 20, color: col(t) }] : [];
  };
  els.push(...(L.ZA || L.AA ? dim(Z, A_, L.ZA_, props.x ? up : down) : lab(Z, A_, L.ZA_, props.x ? up : down)));
  els.push(...lab(Z, B, L.ZB, props.x ? down : up));
  els.push(...lab(B, B_, L.BB, up));
  els.push(...(L.ZB || L.BB ? dim(Z, B_, L.ZB_, props.x ? down : up) : lab(Z, B_, L.ZB_, props.x ? down : up)));
  els.push(...lab(A, B, L.AB, props.x ? A_ : Z));
  els.push(...lab(A_, B_, L.A_B_, Z));
  return <Scene els={els} maxH={165} />;
}

const S = (s: string) => `|\\overline{${s}}|`;

// ---------------------------------------------------------------------------
// Streckfaktor
// ---------------------------------------------------------------------------

const kBerechnen: Gen = () => {
  const u = lenUnit();
  const za = rs(2, 9, 0.5);
  const k = pick([0.5, 1.5, 2, 2.5, 3, 4, 0.25]);
  const zaa = za * k;
  return {
    title: 'Streckfaktor berechnen',
    text: `Die Strecke $\\overline{ZA}$ ist $${q(za, u)}$ lang, die gestreckte Strecke $\\overline{ZA'}$ ist $${q(zaa, u)}$ lang. Berechne den Streckfaktor $k$.`,
    parts: [num('$k$', k, null)],
    solution: [`$k = \\frac{L'}{L} = \\frac{${q(zaa, u)}}{${q(za, u)}} = ${tx(k)}$`, k > 1 ? 'Da $k > 1$ ist, wurde vergrößert.' : 'Da $k < 1$ ist, wurde verkleinert.'],
  };
};

const bildStrecke: Gen = () => {
  const u = lenUnit();
  const za = rs(2, 12, 0.5);
  const k = pick([0.5, 1.5, 2, 2.5, 3, 4]);
  return {
    title: 'Gestreckte Strecke berechnen',
    text: `Eine Strecke $\\overline{ZA} = ${q(za, u)}$ wird mit dem Faktor $k = ${tx(k)}$ gestreckt. Wie lang ist $\\overline{ZA'}$?`,
    parts: [num("$\\overline{ZA'}$", za * k, u)],
    solution: [`$k = \\frac{\\overline{ZA'}}{\\overline{ZA}} \\;\\Rightarrow\\; \\overline{ZA'} = k \\cdot \\overline{ZA} = ${tx(k)} \\cdot ${q(za, u)} = ${q(za * k, u)}$`],
  };
};

const urStrecke: Gen = () => {
  const u = lenUnit();
  const za = rs(2, 12, 0.5);
  const k = pick([2, 2.5, 3, 4, 5]);
  const zaa = za * k;
  return {
    title: 'Ursprüngliche Strecke berechnen',
    text: `Nach einer Streckung mit $k = ${tx(k)}$ ist die Strecke $\\overline{ZA'} = ${q(zaa, u)}$ lang. Wie lang war $\\overline{ZA}$?`,
    parts: [num('$\\overline{ZA}$', za, u)],
    solution: [`$\\overline{ZA} = \\frac{\\overline{ZA'}}{k} = \\frac{${q(zaa, u)}}{${tx(k)}} = ${q(za, u)}$`],
  };
};

const dreieckGestreckt: Gen = () => {
  const u = pick<UnitId>(['cm', 'm']);
  const za = ri(2, 6);
  const k = pick([1.5, 2, 2.5, 3]);
  const zb = ri(3, 8);
  return {
    title: 'Gestrecktes Dreieck',
    text: `Ein Dreieck $ZAB$ wurde von $Z$ aus vergrößert. Es ist $\\overline{ZA} = ${q(za, u)}$, $\\overline{ZA'} = ${q(za * k, u)}$ und $\\overline{ZB} = ${q(zb, u)}$.`,
    figure: <StrahlFig za={za} zaa={za * k} zb={zb} zbb={zb * k} l={{ ZA: `${za} ${u}`, ZB: `${zb} ${u}`, ZB_: "ZB' = ?" }} />,
    parts: [num('$k$', k, null, { q: 'a) Berechne den Streckfaktor $k$.' }), num("$\\overline{ZB'}$", zb * k, u, { q: "b) Berechne die Streckenlänge $\\overline{ZB'}$." })],
    solution: [`a) $k = \\frac{${q(za * k, u)}}{${q(za, u)}} = ${tx(k)}$`, `b) $\\overline{ZB'} = k \\cdot \\overline{ZB} = ${tx(k)} \\cdot ${q(zb, u)} = ${q(zb * k, u)}$`],
  };
};

// ---------------------------------------------------------------------------
// 1. Strahlensatz
// ---------------------------------------------------------------------------

function ssValues() {
  const za = rs(2, 7, 0.5);
  const zb = rs(2, 8, 0.5);
  const k = pick([1.5, 2, 2.5, 3, 1.6, 1.8]);
  return { za, zb, k, zaa: round(za * k, 2), zbb: round(zb * k, 2) };
}

const erster: Gen = () => {
  const u = lenUnit();
  const v = ssValues();
  const x = Math.random() < 0.25;
  const unknown = pick(['ZA', 'ZA_', 'ZB', 'ZB_'] as const);
  const val = { ZA: v.za, ZA_: v.zaa, ZB: v.zb, ZB_: v.zbb };
  const nm: Record<string, string> = { ZA: 'ZA', ZA_: "ZA'", ZB: 'ZB', ZB_: "ZB'" };
  const labels: SSLabels = {};
  (['ZA', 'ZA_', 'ZB', 'ZB_'] as const).forEach((k) => (labels[k] = k === unknown ? 'x' : `${de(val[k])} ${u}`));
  const given = (['ZA', 'ZA_', 'ZB', 'ZB_'] as const).filter((k) => k !== unknown).map((k) => `$${S(nm[k])} = ${q(val[k], u)}$`);
  const ans = val[unknown];
  const formula: Record<string, string> = {
    ZA: `x = \\frac{${S('ZA\'')} \\cdot ${S('ZB')}}{${S("ZB'")}} = \\frac{${tx(v.zaa)} \\cdot ${tx(v.zb)}}{${tx(v.zbb)}}`,
    ZA_: `x = \\frac{${S('ZA')} \\cdot ${S("ZB'")}}{${S('ZB')}} = \\frac{${tx(v.za)} \\cdot ${tx(v.zbb)}}{${tx(v.zb)}}`,
    ZB: `x = \\frac{${S('ZA')} \\cdot ${S("ZB'")}}{${S("ZA'")}} = \\frac{${tx(v.za)} \\cdot ${tx(v.zbb)}}{${tx(v.zaa)}}`,
    ZB_: `x = \\frac{${S("ZA'")} \\cdot ${S('ZB')}}{${S('ZA')}} = \\frac{${tx(v.zaa)} \\cdot ${tx(v.zb)}}{${tx(v.za)}}`,
  };
  return {
    title: '1. Strahlensatz',
    text: `Die Geraden $AB$ und $A'B'$ sind parallel. Gegeben: ${given.join(', ')}. Berechne $x = ${S(nm[unknown])}$.`,
    figure: <StrahlFig {...v} l={labels} x={x} />,
    parts: [num('$x$', ans, u)],
    solution: [`$\\frac{${S('ZA')}}{${S("ZA'")}} = \\frac{${S('ZB')}}{${S("ZB'")}}$`, `$${formula[unknown]} ${res(ans, u)}$`],
  };
};

const ersterAbschnitte: Gen = () => {
  const u = lenUnit();
  const v = ssValues();
  const aa = round(v.zaa - v.za, 2);
  const bb = round(v.zbb - v.zb, 2);
  const unknown = pick(['BB', 'ZB'] as const);
  if (unknown === 'BB') {
    return {
      title: '1. Strahlensatz mit Abschnitten',
      text: `$AB \\parallel A'B'$. Es ist $${S('ZA')} = ${q(v.za, u)}$, $${S("AA'")} = ${q(aa, u)}$ und $${S('ZB')} = ${q(v.zb, u)}$. Berechne $x = ${S("BB'")}$.`,
      figure: <StrahlFig {...v} l={{ ZA: `${de(v.za)} ${u}`, AA: `${de(aa)} ${u}`, ZB: `${de(v.zb)} ${u}`, BB: 'x' }} />,
      parts: [num('$x$', bb, u)],
      solution: [`$\\frac{${S('ZA')}}{${S("AA'")}} = \\frac{${S('ZB')}}{${S("BB'")}}$`, `$x = \\frac{${tx(aa)} \\cdot ${tx(v.zb)}}{${tx(v.za)}} ${res((aa * v.zb) / v.za, u)}$`],
    };
  }
  return {
    title: '1. Strahlensatz mit Abschnitten',
    text: `$AB \\parallel A'B'$. Es ist $${S('ZA')} = ${q(v.za, u)}$, $${S("AA'")} = ${q(aa, u)}$ und $${S("BB'")} = ${q(bb, u)}$. Berechne $x = ${S('ZB')}$.`,
    figure: <StrahlFig {...v} l={{ ZA: `${de(v.za)} ${u}`, AA: `${de(aa)} ${u}`, ZB: 'x', BB: `${de(bb)} ${u}` }} />,
    parts: [num('$x$', (v.za * bb) / aa, u)],
    solution: [`$\\frac{${S('ZA')}}{${S("AA'")}} = \\frac{${S('ZB')}}{${S("BB'")}}$`, `$x = \\frac{${tx(v.za)} \\cdot ${tx(bb)}}{${tx(aa)}} ${res((v.za * bb) / aa, u)}$`],
  };
};

const ersterSumme: Gen = () => {
  const u = lenUnit();
  const v = ssValues();
  const aa = round(v.zaa - v.za, 2);
  return {
    title: 'Erst addieren, dann rechnen',
    text: `$AB \\parallel A'B'$. Es ist $${S('ZA')} = ${q(v.za, u)}$, $${S("AA'")} = ${q(aa, u)}$ und $${S('ZB')} = ${q(v.zb, u)}$. Berechne $${S("ZA'")}$ und $x = ${S("ZB'")}$.`,
    figure: <StrahlFig {...v} l={{ ZA: `${de(v.za)} ${u}`, AA: `${de(aa)} ${u}`, ZB: `${de(v.zb)} ${u}`, ZB_: 'x' }} />,
    parts: [num("$|\\overline{ZA'}|$", v.zaa, u), num('$x$', (v.zaa * v.zb) / v.za, u)],
    solution: [`$${S("ZA'")} = ${tx(v.za)} + ${tx(aa)} = ${q(v.zaa, u)}$`, `$x = \\frac{${S("ZA'")} \\cdot ${S('ZB')}}{${S('ZA')}} = \\frac{${tx(v.zaa)} \\cdot ${tx(v.zb)}}{${tx(v.za)}} ${res((v.zaa * v.zb) / v.za, u)}$`],
  };
};

// ---------------------------------------------------------------------------
// 2. Strahlensatz
// ---------------------------------------------------------------------------

const zweiter: Gen = () => {
  const u = lenUnit();
  const v = ssValues();
  const ab = rs(1.5, 6, 0.5);
  const a_b_ = round(ab * v.k, 2);
  const x = Math.random() < 0.3;
  const mode = pick(['A_B_', 'AB', 'ZA_'] as const);
  if (mode === 'A_B_') {
    return {
      title: '2. Strahlensatz',
      text: `$AB \\parallel A'B'$. Es ist $${S('ZA')} = ${q(v.za, u)}$, $${S("ZA'")} = ${q(v.zaa, u)}$ und $${S('AB')} = ${q(ab, u)}$. Berechne $x = ${S("A'B'")}$.`,
      figure: <StrahlFig {...v} x={x} l={{ ZA: `${de(v.za)} ${u}`, ZA_: `${de(v.zaa)} ${u}`, AB: `${de(ab)} ${u}`, A_B_: 'x' }} />,
      parts: [num('$x$', (ab * v.zaa) / v.za, u)],
      solution: [`$\\frac{${S('AB')}}{${S("A'B'")}} = \\frac{${S('ZA')}}{${S("ZA'")}}$`, `$x = \\frac{${tx(ab)} \\cdot ${tx(v.zaa)}}{${tx(v.za)}} ${res((ab * v.zaa) / v.za, u)}$`],
    };
  }
  if (mode === 'AB') {
    return {
      title: '2. Strahlensatz',
      text: `$AB \\parallel A'B'$. Es ist $${S('ZB')} = ${q(v.zb, u)}$, $${S("ZB'")} = ${q(v.zbb, u)}$ und $${S("A'B'")} = ${q(a_b_, u)}$. Berechne $x = ${S('AB')}$.`,
      figure: <StrahlFig {...v} x={x} l={{ ZB: `${de(v.zb)} ${u}`, ZB_: `${de(v.zbb)} ${u}`, AB: 'x', A_B_: `${de(a_b_)} ${u}` }} />,
      parts: [num('$x$', (a_b_ * v.zb) / v.zbb, u)],
      solution: [`$\\frac{${S('AB')}}{${S("A'B'")}} = \\frac{${S('ZB')}}{${S("ZB'")}}$`, `$x = \\frac{${tx(a_b_)} \\cdot ${tx(v.zb)}}{${tx(v.zbb)}} ${res((a_b_ * v.zb) / v.zbb, u)}$`],
    };
  }
  return {
    title: '2. Strahlensatz',
    text: `$AB \\parallel A'B'$. Es ist $${S('ZA')} = ${q(v.za, u)}$, $${S('AB')} = ${q(ab, u)}$ und $${S("A'B'")} = ${q(a_b_, u)}$. Berechne $x = ${S("ZA'")}$.`,
    figure: <StrahlFig {...v} x={x} l={{ ZA: `${de(v.za)} ${u}`, ZA_: 'x', AB: `${de(ab)} ${u}`, A_B_: `${de(a_b_)} ${u}` }} />,
    parts: [num('$x$', (v.za * a_b_) / ab, u)],
    solution: [`$\\frac{${S("ZA'")}}{${S('ZA')}} = \\frac{${S("A'B'")}}{${S('AB')}}$`, `$x = \\frac{${tx(v.za)} \\cdot ${tx(a_b_)}}{${tx(ab)}} ${res((v.za * a_b_) / ab, u)}$`],
  };
};

const zweiterAbschnitt: Gen = () => {
  const u = lenUnit();
  const v = ssValues();
  const aa = round(v.zaa - v.za, 2);
  const ab = rs(1.5, 6, 0.5);
  return {
    title: '2. Strahlensatz: Achtung, ganze Strecke!',
    text: `$AB \\parallel A'B'$. Es ist $${S('ZA')} = ${q(v.za, u)}$, $${S("AA'")} = ${q(aa, u)}$ und $${S('AB')} = ${q(ab, u)}$. Berechne $x = ${S("A'B'")}$.`,
    figure: <StrahlFig {...v} l={{ ZA: `${de(v.za)} ${u}`, AA: `${de(aa)} ${u}`, AB: `${de(ab)} ${u}`, A_B_: 'x' }} />,
    parts: [num('$x$', (ab * v.zaa) / v.za, u)],
    solution: [
      `Beim 2. Strahlensatz brauchst du die Strecken **ab Z**: $${S("ZA'")} = ${tx(v.za)} + ${tx(aa)} = ${q(v.zaa, u)}$`,
      `$x = \\frac{${S('AB')} \\cdot ${S("ZA'")}}{${S('ZA')}} = \\frac{${tx(ab)} \\cdot ${tx(v.zaa)}}{${tx(v.za)}} ${res((ab * v.zaa) / v.za, u)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Anwendungen
// ---------------------------------------------------------------------------

function shadowFig(person: string, tree: string, sPerson: string, sTree: string, ratio = 0.3) {
  const T = 10;
  const r = Math.min(Math.max(ratio, 0.22), 0.5);
  const p = T * (1 - r);
  const ht = 6;
  const hp = ht * r;
  const els: El[] = [
    { t: 'line', pts: [[-0.3, 0], [T + 0.4, 0]], stroke: C.gray, w: 2 },
    { t: 'line', pts: [[0, 0], [0, ht]], stroke: '#15803d', w: 4 },
    { t: 'line', pts: [[p, 0], [p, hp]], stroke: C.blue, w: 3 },
    { t: 'line', pts: [[0, ht], [T, 0]], dash: true, stroke: '#ca8a04' },
    { t: 'label', at: [0, ht / 2], text: tree, dx: -8, anchor: 'end', color: tree.includes('?') ? C.red : C.label },
    { t: 'label', at: [p, hp], text: person, dy: -14, dx: -4, anchor: 'end', color: person.includes('?') ? C.red : C.label },
    { t: 'dim', a: [0, 0], b: [T, 0], text: sTree, side: -1, off: 30 },
    { t: 'dim', a: [p, 0], b: [T, 0], text: sPerson, side: -1, off: 8 },
  ];
  return <Scene els={els} maxH={130} />;
}

const baumSchatten: Gen = () => {
  const n = name();
  const gp = pick([1.62, 1.7, 1.78, 1.85]);
  const sT = rs(8, 16, 0.5);
  const dist = round(sT - rs(1.2, 2.5, 0.1), 1);
  const sP = round(sT - dist, 1);
  const hT = (gp * sT) / sP;
  return {
    title: 'Wie hoch ist der Baum?',
    badge: 'Anwendung',
    text: `${n} ist $${q(gp, 'm')}$ groß und stellt sich so in den Schatten eines Baumes, dass die Schatten genau gleich enden. ${n} steht dann $${q(dist, 'm')}$ vom Baum entfernt. Der Baumschatten ist $${q(sT, 'm')}$ lang.`,
    figure: shadowFig(`${de(gp)} m`, 'h = ?', `${de(sP)} m`, `${de(sT)} m`, sP / sT),
    parts: [num('Schatten Person', sP, 'm', { q: `a) Wie lang ist der Schatten von ${n}?` }), num('$h$', hT, 'm', { q: 'b) Wie hoch ist der Baum?' })],
    solution: [`a) $${q(sT, 'm')} - ${q(dist, 'm')} = ${q(sP, 'm')}$`, `b) $\\frac{h}{${tx(gp)}} = \\frac{${tx(sT)}}{${tx(sP)}} \\;\\Rightarrow\\; h = \\frac{${tx(gp)} \\cdot ${tx(sT)}}{${tx(sP)}} ${res(hT, 'm')}$`],
  };
};

const seeBreite: Gen = () => {
  const za = ri(25, 45);
  const zaa = za + ri(30, 60);
  const ab = ri(15, 40);
  const x = (ab * zaa) / za;
  return {
    title: 'Abstand zweier Bäume am See',
    badge: 'Anwendung',
    text: `Um den Abstand von zwei Bäumen $A'$ und $B'$ am gegenüberliegenden Seeufer zu bestimmen, wurden die Strecken $${S('ZA')} = ${q(za, 'm')}$, $${S("ZA'")} = ${q(zaa, 'm')}$ und $${S('AB')} = ${q(ab, 'm')}$ gemessen ($AB \\parallel A'B'$).`,
    figure: <StrahlFig za={za} zaa={zaa} zb={za * 0.9} zbb={zaa * 0.9} l={{ ZA: `${za} m`, ZA_: `${zaa} m`, AB: `${ab} m`, A_B_: 'x' }} />,
    parts: [num('$x$', x, 'm')],
    solution: [`$\\frac{x}{${S('AB')}} = \\frac{${S("ZA'")}}{${S('ZA')}} \\;\\Rightarrow\\; x = \\frac{${ab} \\cdot ${zaa}}{${za}} ${res(x, 'm')}$`],
  };
};

const turmStab: Gen = () => {
  const stab = pick([1.5, 2, 2.5]);
  const d1 = rs(2, 4, 0.5);
  const d2 = ri(20, 60);
  const h = (stab * (d1 + d2)) / d1;
  return {
    title: 'Turmhöhe mit einem Stab messen',
    badge: 'Anwendung',
    text: `Ein $${q(stab, 'm')}$ langer Stab wird senkrecht aufgestellt. Peilt man vom Boden über die Stabspitze, so trifft man genau die Turmspitze. Der Peilpunkt ist $${q(d1, 'm')}$ vom Stab entfernt, der Stab steht $${q(d2, 'm')}$ vom Turm entfernt.`,
    figure: shadowFig(`${de(stab)} m`, 'h = ?', `${de(d1)} m`, `${de(d1 + d2)} m`, d1 / (d1 + d2)),
    parts: [num('$h$', h, 'm')],
    solution: [`Entfernung Peilpunkt–Turm: $${q(d1, 'm')} + ${q(d2, 'm')} = ${q(d1 + d2, 'm')}$`, `$\\frac{h}{${tx(stab)}} = \\frac{${tx(d1 + d2)}}{${tx(d1)}} \\;\\Rightarrow\\; h ${res(h, 'm')}$`],
  };
};

const dachDecke: Gen = () => {
  const h = rs(3, 4.5, 0.1);
  const s = round(h + rs(0.3, 1.2, 0.1), 1);
  const H = round(h * rs(0.55, 0.75, 0.05), 2);
  const W = Math.max(Math.sqrt(s * s - h * h), h * 0.8);
  const x = (s * (h - H)) / h;
  const els: El[] = [
    { t: 'poly', pts: [[0, 0], [W, 0], [0, h]], fill: C.fill3 },
    { t: 'line', pts: [[0, H], [(W * (h - H)) / h, H]], stroke: C.blue, w: 2.2 },
    { t: 'label', at: [0, h / 2], text: `h = ${de(h)} m`, dx: -8, anchor: 'end' },
    { t: 'label', at: [W * 0.8, h * 0.2], text: `s = ${de(s)} m`, dx: 10, anchor: 'start' },
    { t: 'label', at: [(W * (h - H)) / h / 2, (H + h) / 2], text: 'x', dx: 10, anchor: 'start', color: C.red },
    { t: 'line', pts: [[(W * (h - H)) / h, H], [0, h]], stroke: C.red, w: 2.4 },
    { t: 'dim', a: [(W * (h - H)) / h, 0], b: [(W * (h - H)) / h, H], text: `H = ${de(H)} m`, side: -1, off: 0 },
  ];
  return {
    title: 'Decke im Dachgiebel',
    badge: 'Anwendung',
    text: `In einem Dachgiebel (Höhe $h = ${q(h, 'm')}$, Dachschräge $s = ${q(s, 'm')}$) wird in der Höhe $H = ${q(H, 'm')}$ eine waagrechte Decke eingezogen. Wie lang ist die schräge Wand $x$ oberhalb der Decke?`,
    figure: <Scene els={els} maxH={150} />,
    parts: [num('$x$', x, 'm')],
    solution: [`Oberhalb der Decke bleibt die Höhe $${q(h, 'm')} - ${q(H, 'm')} = ${q(h - H, 'm')}$.`, `$\\frac{x}{s} = \\frac{h - H}{h} \\;\\Rightarrow\\; x = \\frac{${tx(s)} \\cdot ${tx(h - H)}}{${tx(h)}} ${res(x, 'm')}$`],
  };
};

const pyramideBreite: Gen = () => {
  const h = pick([60, 80, 120, 146.5]);
  const b = pick([90, 120, 180, 230.33]);
  const t = pick([0.5, 1 / 3, 0.25]);
  const tt = t === 0.5 ? 'auf halber Höhe' : t === 0.25 ? 'nach einem Viertel der Höhe' : 'nach einem Drittel der Höhe';
  const x = b * (1 - t);
  return {
    title: 'Breite einer Pyramide',
    badge: 'Anwendung',
    text: `Eine Pyramide ist $${q(h, 'm')}$ hoch und am Boden $${q(b, 'm')}$ breit. Wie breit ist sie ${tt} (von unten gemessen)?`,
    parts: [num('Breite', x, 'm')],
    solution: [`Von der Spitze aus gemessen ist der Abstand $${tx(h)} \\cdot ${tx(1 - t, 4)} = ${q(h * (1 - t), 'm')}$.`, `$\\frac{x}{${tx(b)}} = \\frac{${tx(h * (1 - t))}}{${tx(h)}} \\;\\Rightarrow\\; x ${res(x, 'm')}$`],
  };
};

const doerfer: Gen = () => {
  const ab = ri(5, 9);
  const ad = ri(14, 22);
  const bc = ri(6, 11);
  const x = (bc * ad) / ab;
  return {
    title: 'Entfernung über den See',
    badge: 'Anwendung',
    text: `Zwischen den Orten D und E liegt ein See. Die Straßen B–C und D–E verlaufen parallel. Von A nach B sind es $${q(ab, 'km')}$, von A nach D $${q(ad, 'km')}$, von B nach C $${q(bc, 'km')}$. Wie weit sind D und E voneinander entfernt?`,
    figure: <StrahlFig za={ab} zaa={ad} zb={ab * 1.1} zbb={ad * 1.1} names={['A', 'B', 'C', 'D', 'E']} l={{ ZA: `${ab} km`, ZA_: `${ad} km`, AB: `${bc} km`, A_B_: 'x' }} />,
    parts: [num('$x$', x, 'km')],
    solution: [`$\\frac{|\\overline{DE}|}{|\\overline{BC}|} = \\frac{|\\overline{AD}|}{|\\overline{AB}|}$ (2. Strahlensatz)`, `$\\frac{x}{${bc}} = \\frac{${ad}}{${ab}} \\;\\Rightarrow\\; x = \\frac{${bc} \\cdot ${ad}}{${ab}} ${res(x, 'km')}$`],
  };
};

const BASIC: Gen[] = [erster, ersterAbschnitte, ersterSumme, zweiter, zweiterAbschnitt];
const APPS: Gen[] = [baumSchatten, seeBreite, turmStab, dachDecke, pyramideBreite, doerfer];

const ex1 = {
  title: 'Fehlende Strecke mit dem 1. Strahlensatz',
  text: "$AB \\parallel A'B'$. Gegeben: $|\\overline{ZA}| = 3\\,\\text{cm}$, $|\\overline{ZA'}| = 6\\,\\text{cm}$, $|\\overline{ZB}| = 4\\,\\text{cm}$.",
  figure: <StrahlFig za={3} zaa={6} zb={4} zbb={8} l={{ ZA: '3 cm', ZA_: '6 cm', ZB: '4 cm', ZB_: 'x' }} />,
  steps: [
    "Gleichung aus der Merkhilfe: $\\frac{|\\overline{ZA}|}{|\\overline{ZA'}|} = \\frac{|\\overline{ZB}|}{|\\overline{ZB'}|}$",
    'Einsetzen: $\\frac{3}{6} = \\frac{4}{x}$',
    'Umstellen: $x = \\frac{6 \\cdot 4}{3} = 8$ → $|\\overline{ZB\'}| = 8\\,\\text{cm}$',
  ],
  tip: 'Beschrifte zuerst die Punkte Z, A, A\', B, B\' in der Skizze. Die gesuchte Größe schreibst du am besten oben links in den Bruch.',
};

const pages: PracticeConfig[] = [
  {
    slug: 'streckfaktor',
    title: 'Streckfaktor und zentrische Streckung',
    description: 'k = L\' : L berechnen und anwenden',
    formulas: ['k = \\frac{L\'}{L}', 'L\' = k \\cdot L', 'k > 1: \\text{vergrößern},\\; k < 1: \\text{verkleinern}'],
    example: {
      title: 'Streckfaktor bestimmen',
      text: "Die Strecke $\\overline{ZA}$ ist $5\\,\\text{cm}$ lang, $\\overline{ZA'}$ ist $10\\,\\text{cm}$ lang.",
      steps: ["$k = \\frac{L'}{L} = \\frac{10\\,\\text{cm}}{5\\,\\text{cm}} = 2$", "Die Strecke $\\overline{ZA'}$ ist also doppelt so lang wie $\\overline{ZA}$."],
      tip: 'Der Streckfaktor $k$ hat **keine Einheit** – die Einheiten kürzen sich weg.',
    },
    gens: [kBerechnen, bildStrecke, urStrecke, dreieckGestreckt],
    nBasic: 6,
    nApp: 0,
  },
  {
    slug: 'erster-strahlensatz',
    title: '1. Strahlensatz',
    description: 'Abschnitte auf den Strahlen',
    formulas: F_SS.slice(1, 3),
    example: ex1,
    gens: [erster, erster, ersterAbschnitte, ersterSumme],
    apps: [baumSchatten, dachDecke, turmStab],
  },
  {
    slug: 'zweiter-strahlensatz',
    title: '2. Strahlensatz',
    description: 'Parallele Strecken berechnen',
    formulas: [F_SS[3]],
    example: {
      title: 'Parallele Strecke berechnen',
      text: "$AB \\parallel A'B'$. Gegeben: $|\\overline{ZA}| = 4\\,\\text{m}$, $|\\overline{ZA'}| = 10\\,\\text{m}$, $|\\overline{AB}| = 3\\,\\text{m}$.",
      figure: <StrahlFig za={4} zaa={10} zb={4.5} zbb={11.25} l={{ ZA: '4 m', ZA_: '10 m', AB: '3 m', A_B_: 'x' }} />,
      steps: ["$\\frac{|\\overline{AB}|}{|\\overline{A'B'}|} = \\frac{|\\overline{ZA}|}{|\\overline{ZA'}|}$", '$\\frac{3}{x} = \\frac{4}{10}$', '$x = \\frac{3 \\cdot 10}{4} = 7{,}5$ → $|\\overline{A\'B\'}| = 7{,}5\\,\\text{m}$'],
      tip: "Beim 2. Strahlensatz immer die Strecken **ab Z** verwenden ($|\\overline{ZA'}|$), nie nur den Abschnitt $|\\overline{AA'}|$!",
    },
    gens: [zweiter, zweiter, zweiterAbschnitt],
    apps: [seeBreite, doerfer, pyramideBreite],
  },
  {
    slug: 'anwendung',
    title: 'Anwendungsaufgaben',
    description: 'Schatten, See, Turm, Dachgiebel',
    formulas: F_SS.slice(1),
    example: {
      title: 'Baum und Schatten',
      text: 'Ein $1{,}80\\,\\text{m}$ großer Mann wirft einen $2\\,\\text{m}$ langen Schatten. Ein Baum wirft zur gleichen Zeit einen $12\\,\\text{m}$ langen Schatten.',
      figure: shadowFig('1,8 m', 'h = ?', '2 m', '12 m', 2 / 12),
      steps: ['Sonnenstrahl, Boden und die senkrechten Linien bilden eine Strahlensatz-Figur.', '$\\frac{h}{1{,}8\\,\\text{m}} = \\frac{12\\,\\text{m}}{2\\,\\text{m}}$', '$h = \\frac{1{,}8 \\cdot 12}{2}\\,\\text{m} = 10{,}8\\,\\text{m}$'],
    },
    gens: [],
    apps: APPS,
    fixed: examsFor('strahlensaetze'),
    nBasic: 0,
    nApp: 4,
    nFixed: 2,
  },
  {
    slug: 'gemischt',
    title: 'Gemischte Aufgaben',
    description: 'Beide Strahlensätze gemischt',
    formulas: F_SS,
    example: ex1,
    gens: [...BASIC, kBerechnen],
    apps: APPS,
  },
];

export const strahlensaetze: TopicConfig = {
  slug: 'strahlensaetze',
  title: 'Strahlensätze',
  description: 'Streckfaktor, 1. und 2. Strahlensatz',
  icon: 'expand',
  pages,
};
