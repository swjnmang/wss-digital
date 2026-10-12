import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { F, chFixed, gcd, nm, nz, p, pick, poly, ri, sg, t, tx, name } from '../lib';
import Plot from '../Plot';

// Lernbereich 4: Lineare Gleichungssysteme

const P = (x: number, y: number) => `(${t(x)} \\mid ${t(y)})`;

/** a·x + b·y als KaTeX */
function lin2(a: number, b: number, v = ['x', 'y']): string {
  const terms: string[] = [];
  [a, b].forEach((c, i) => {
    if (c === 0) return;
    const coef = Math.abs(c) === 1 ? '' : `${Math.abs(c)}`;
    const s = `${coef}${v[i]}`;
    terms.push(terms.length === 0 ? `${c < 0 ? '-' : ''}${s}` : `${c < 0 ? '-' : '+'} ${s}`);
  });
  return terms.join(' ') || '0';
}
const lin3 = (r: number[]) => {
  const v = ['x', 'y', 'z'];
  const terms: string[] = [];
  r.slice(0, 3).forEach((c, i) => {
    if (c === 0) return;
    const coef = Math.abs(c) === 1 ? '' : `${Math.abs(c)}`;
    terms.push(terms.length === 0 ? `${c < 0 ? '-' : ''}${coef}${v[i]}` : `${c < 0 ? '-' : '+'} ${coef}${v[i]}`);
  });
  return terms.join(' ') || '0';
};

const sys2 = (r1: number[], r2: number[]) =>
  `\\begin{aligned} \\text{I}&: \\; ${lin2(r1[0], r1[1])} = ${r1[2]} \\\\ \\text{II}&: \\; ${lin2(r2[0], r2[1])} = ${r2[2]} \\end{aligned}`;

function rand2(): { x: number; y: number; r1: number[]; r2: number[] } {
  for (;;) {
    const x = nz(-6, 6);
    const y = nz(-6, 6);
    const a1 = nz(-5, 5);
    const b1 = nz(-5, 5);
    const a2 = nz(-5, 5);
    const b2 = nz(-5, 5);
    if (a1 * b2 - a2 * b1 === 0) continue;
    return { x, y, r1: [a1, b1, a1 * x + b1 * y], r2: [a2, b2, a2 * x + b2 * y] };
  }
}

// ---------------------------------------------------------------------------
// 2 × 2
// ---------------------------------------------------------------------------

const grafischLoesen: Gen = () => {
  const xs = ri(-3, 3);
  const ys = ri(-3, 3);
  const m1 = pick([F(1), F(2), F(-1), F(1, 2), F(-2), F(-1, 2)]);
  let m2 = pick([F(1), F(2), F(-1), F(1, 2), F(-2), F(-1, 2), F(3)]);
  while (m2.v === m1.v) m2 = pick([F(1), F(2), F(-1), F(1, 2), F(-2), F(-1, 2), F(3)]);
  const t1 = F(ys).sub(m1.mul(xs));
  const t2 = F(ys).sub(m2.mul(xs));
  // Gleichungen in der Form a x + b y = c mit ganzen Zahlen
  const toRow = (m: typeof m1, tt: typeof t1) => {
    const d = m.d * tt.d / gcd(m.d, tt.d);
    return [-m.v * d, d, tt.v * d].map((v) => Math.round(v));
  };
  const r1 = toRow(m1, t1);
  const r2 = toRow(m2, t2);
  return {
    title: 'LGS grafisch lösen',
    text: `Löse das Gleichungssystem grafisch. Die beiden Geraden sind eingezeichnet.\n$${sys2(r1, r2)}$`,
    figure: <Plot x={[-6, 6]} y={[-6, 6]} curves={[{ f: (x) => m1.v * x + t1.v, label: 'I' }, { f: (x) => m2.v * x + t2.v, label: 'II' }]} />,
    parts: [nm('$x$', xs, { integer: true }), nm('$y$', ys, { integer: true })],
    solution: [
      `Nach $y$ auflösen: I: $y = ${poly([m1, t1])}$, $\\;$ II: $y = ${poly([m2, t2])}$`,
      `Die Geraden schneiden sich in $S${P(xs, ys)}$.`,
      `Probe in I: $${r1[0]} \\cdot ${p(xs)} ${sg(r1[1])} \\cdot ${p(ys)} = ${r1[2]}$ ✓`,
      `$L = \\{${P(xs, ys)}\\}$`,
    ],
  };
};

const einsetzverfahren: Gen = () => {
  const x = nz(-6, 6);
  const y = nz(-6, 6);
  const a = nz(-4, 4);
  // I: y = a x + b
  const b = y - a * x;
  const c = nz(-4, 4);
  const d = nz(-4, 4);
  if (c + d * a === 0) return einsetzverfahren();
  const e = c * x + d * y;
  return {
    title: 'Einsetzverfahren',
    text: `Löse mit dem Einsetzverfahren:\n$\\begin{aligned} \\text{I}&: \\; y = ${poly([a, b])} \\\\ \\text{II}&: \\; ${lin2(c, d)} = ${e} \\end{aligned}$`,
    parts: [nm('$x$', x, { integer: true }), nm('$y$', y, { integer: true })],
    solution: [
      'I in II einsetzen:',
      `$${c === 1 ? '' : c === -1 ? '-' : c}x ${sg(d)}(${poly([a, b])}) = ${e}$`,
      `$${poly([c + d * a, d * b])} = ${e} \\qquad | ${d * b < 0 ? '+' : '-'} ${Math.abs(d * b)}$`,
      `$${c + d * a === 1 ? '' : c + d * a === -1 ? '-' : c + d * a}x = ${e - d * b} \\qquad | : ${p(c + d * a)}$`,
      `$x = ${x}$`,
      `In I einsetzen: $y = ${a} \\cdot ${p(x)} ${sg(b)} = ${y}$`,
      `$L = \\{${P(x, y)}\\}$`,
    ],
  };
};

const additionsverfahren: Gen = () => {
  const { x, y, r1, r2 } = rand2();
  // y eliminieren: I·b2 − II·b1
  const f1 = r2[1] / gcd(r1[1], r2[1]);
  const f2 = r1[1] / gcd(r1[1], r2[1]);
  const ax = r1[0] * f1 - r2[0] * f2;
  const cx = r1[2] * f1 - r2[2] * f2;
  return {
    title: 'Additionsverfahren',
    text: `Löse mit dem Additionsverfahren:\n$${sys2(r1, r2)}$`,
    parts: [nm('$x$', x, { integer: true }), nm('$y$', y, { integer: true })],
    solution: [
      `$y$ eliminieren: $${f1 === 1 ? '' : `${p(f1)} \\cdot `}\\text{I} - ${f2 === 1 ? '' : `${p(f2)} \\cdot `}\\text{II}$`,
      `$${lin2(r1[0] * f1, r1[1] * f1)} = ${r1[2] * f1}$`,
      `$${lin2(r2[0] * f2, r2[1] * f2)} = ${r2[2] * f2}$`,
      `Subtrahieren: $${ax === 1 ? '' : ax === -1 ? '-' : ax}x = ${cx} \\iff x = ${x}$`,
      `In I einsetzen: $${r1[0]} \\cdot ${p(x)} ${sg(r1[1])}y = ${r1[2]} \\iff ${r1[1] === 1 ? '' : r1[1] === -1 ? '-' : r1[1]}y = ${r1[2] - r1[0] * x} \\iff y = ${y}$`,
      `$L = \\{${P(x, y)}\\}$`,
    ],
  };
};

const anzahlLoesungen: Gen = () => {
  const kind = ri(0, 2);
  const a = nz(-4, 4);
  const b = nz(-4, 4);
  const c = ri(-8, 8);
  const k = pick([2, -1, 3, -2]);
  let r2: number[];
  if (kind === 0) {
    let a2 = nz(-4, 4);
    while (a2 * b === a * b * k || a2 === a * k) a2 = nz(-4, 4);
    r2 = [a2, b * k, ri(-8, 8)];
  } else if (kind === 1) {
    let c2 = ri(-12, 12);
    while (c2 === c * k) c2 = ri(-12, 12);
    r2 = [a * k, b * k, c2];
  } else {
    r2 = [a * k, b * k, c * k];
  }
  const r1 = [a, b, c];
  const det = r1[0] * r2[1] - r2[0] * r1[1];
  const ans = det !== 0 ? 0 : kind === 1 ? 1 : 2;
  return {
    title: 'Anzahl der Lösungen',
    text: `Wie viele Lösungen hat das Gleichungssystem?\n$${sys2(r1, r2)}$`,
    parts: [chFixed('Das LGS hat …', ['genau eine Lösung', 'keine Lösung', 'unendlich viele Lösungen'], ans)],
    solution:
      ans === 0
        ? ['Die Koeffizienten von $x$ und $y$ sind nicht proportional → die Geraden haben verschiedene Steigungen und schneiden sich in **genau einem** Punkt.']
        : ans === 1
          ? [`II ist auf der linken Seite das $${k}$-fache von I, die rechte Seite aber nicht: $${p(k)} \\cdot ${c} = ${k * c} \\neq ${r2[2]}$.`, 'Die Geraden sind parallel → **keine** Lösung, $L = \\{\\,\\}$.']
          : [`II ist das $${k}$-fache von I (auch die rechte Seite).`, 'Beide Gleichungen beschreiben dieselbe Gerade → **unendlich viele** Lösungen.'],
  };
};

const treffpunkt: Gen = () => {
  const v1 = pick([60, 80, 90, 100, 120]);
  const v2 = pick([40, 50, 60, 70, 80]);
  const tt = pick([0.5, 1, 1.5, 2]);
  const s = (v1 + v2) * tt;
  const n1 = name();
  return {
    title: 'Treffpunkt zweier Fahrzeuge',
    badge: 'Anwendung',
    text: `${n1} startet in Augsburg und fährt mit $${v1}\\,\\frac{\\text{km}}{\\text{h}}$ in Richtung des $${s}$ km entfernten Ortes B. Gleichzeitig fährt in B ein Bus mit $${v2}\\,\\frac{\\text{km}}{\\text{h}}$ los in Richtung Augsburg. $s$ ist die Entfernung von Augsburg in km, $t$ die Zeit in h.`,
    figure: (
      <Plot
        x={[0, Math.max(3, tt * 2)]}
        y={[0, s * 1.1]}
        step={0.5}
        ystep={s > 200 ? 50 : 20}
        xl="t"
        yl="s"
        curves={[{ f: (x) => v1 * x, label: n1 }, { f: (x) => s - v2 * x, label: 'Bus' }]}
      />
    ),
    parts: [nm('$t$ in h', tt, { tol: 0.01, q: 'a) Nach welcher Zeit treffen sie sich?' }), nm('$s$ in km', v1 * tt, { tol: 0.1, q: 'b) Wie weit von Augsburg entfernt treffen sie sich?' })],
    solution: [
      `$\\begin{aligned} \\text{I}&: \\; s = ${v1}t \\\\ \\text{II}&: \\; s = ${s} - ${v2}t \\end{aligned}$`,
      `Gleichsetzen: $${v1}t = ${s} - ${v2}t \\iff ${v1 + v2}t = ${s} \\iff t = ${t(tt)}$`,
      `$s = ${v1} \\cdot ${t(tt)} = ${t(v1 * tt)}$ km. Im Diagramm: Schnittpunkt der beiden Geraden.`,
    ],
  };
};

const anwendung2: Gen = () => {
  const a = pick([4, 5, 6, 8]);
  const b = pick([9, 10, 12, 14]);
  const x = ri(20, 80);
  const y = ri(10, 60);
  return {
    title: 'Eintrittskarten',
    badge: 'Anwendung',
    text: `Ein Kino verkauft Karten für Kinder ($${a}$ €) und Erwachsene ($${b}$ €). An einem Abend wurden $${x + y}$ Karten für insgesamt $${a * x + b * y}$ € verkauft. Wie viele Kinder- und Erwachsenenkarten waren es?`,
    parts: [nm('Kinderkarten $x$', x, { integer: true }), nm('Erwachsenenkarten $y$', y, { integer: true })],
    solution: [
      `$\\begin{aligned} \\text{I}&: \\; x + y = ${x + y} \\\\ \\text{II}&: \\; ${a}x + ${b}y = ${a * x + b * y} \\end{aligned}$`,
      `Aus I: $x = ${x + y} - y$; in II: $${a}(${x + y} - y) + ${b}y = ${a * x + b * y}$`,
      `$${a * (x + y)} + ${b - a}y = ${a * x + b * y} \\iff ${b - a}y = ${(b - a) * y} \\iff y = ${y}$`,
      `$x = ${x + y} - ${y} = ${x}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// 3 × 3 – Gauß-Algorithmus
// ---------------------------------------------------------------------------

const mat = (rows: number[][]) =>
  `\\left(\\begin{array}{rrr|r} ${rows.map((r) => r.map((v) => `${v}`).join(' & ')).join(' \\\\ ')} \\end{array}\\right)`;

function normRow(r: number[]): number[] {
  const g = r.reduce((s, v) => gcd(s, v), 0) || 1;
  const sgn = r.find((v) => v !== 0) ?? 1;
  return r.map((v) => (v / g) * (sgn < 0 ? -1 : 1));
}

/** Zeile b so mit Zeile a kombinieren, dass Spalte col wegfällt; liefert Zeile und Beschreibung */
function elim(a: number[], b: number[], col: number, na: string, nb: string): [number[], string] {
  const g = gcd(a[col], b[col]);
  const fa = b[col] / g;
  const fb = a[col] / g;
  const r = b.map((v, i) => v * fb - a[i] * fa);
  const desc = `${fb === 1 ? '' : fb === -1 ? '-' : `${fb} \\cdot `}\\text{${nb}} ${fa < 0 ? '+' : '-'} ${Math.abs(fa) === 1 ? '' : `${Math.abs(fa)} \\cdot `}\\text{${na}}`;
  return [r, desc];
}

function rand3() {
  for (;;) {
    const sol = [nz(-4, 4), ri(-4, 4), nz(-4, 4)];
    const rows: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const c = [ri(-3, 3), ri(-3, 3), ri(-3, 3)];
      if (i === 0 && c[0] === 0) c[0] = 1;
      rows.push([...c, c[0] * sol[0] + c[1] * sol[1] + c[2] * sol[2]]);
    }
    const [a, b, c] = rows;
    const det =
      a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
    if (det === 0) continue;
    if (rows.some((r) => r.slice(0, 3).filter((v) => v !== 0).length < 2)) continue;
    return { sol, rows };
  }
}

/** Zeile mit eingesetzten Werten, z. B. 3x - 2 \cdot 4 + (-1) */
function subst(row: number[], vals: (number | null)[]): string {
  const v = ['x', 'y', 'z'];
  const terms: string[] = [];
  row.slice(0, 3).forEach((c, i) => {
    if (c === 0) return;
    const body = vals[i] === null ? `${Math.abs(c) === 1 ? '' : Math.abs(c)}${v[i]}` : `${Math.abs(c)} \\cdot ${p(vals[i] as number)}`;
    terms.push(terms.length === 0 ? `${c < 0 ? '-' : ''}${body}` : `${c < 0 ? '-' : '+'} ${body}`);
  });
  return terms.join(' ');
}

/** Gauß-Algorithmus mit Lösungsweg; null, wenn der Weg unschön würde */
function gaussSteps(rows: number[][], sol: number[], maxAbs = 200): string[] | null {
  const r1 = rows[0];
  let [, r2, r3] = rows;
  if (r1[0] === 0) return null;
  const steps: string[] = ['Erweiterte Koeffizientenmatrix:', `$${mat([r1, r2, r3])}$`];
  let d2 = '';
  let d3 = '';
  if (r2[0] !== 0) [r2, d2] = elim(r1, r2, 0, 'I', 'II');
  if (r3[0] !== 0) [r3, d3] = elim(r1, r3, 0, 'I', 'III');
  const n2 = normRow(r2);
  const n3 = normRow(r3);
  const kurz = n2.some((v, i) => v !== r2[i]) || n3.some((v, i) => v !== r3[i]);
  r2 = n2;
  r3 = n3;
  if (r2[1] === 0 && r3[1] === 0) return null;
  const swap = r2[1] === 0;
  if (swap) [r2, r3] = [r3, r2];
  if (d2 || d3) {
    steps.push(
      `${[d2 && `II' $= ${d2}$`, d3 && `III' $= ${d3}$`].filter(Boolean).join(', ')}${kurz ? ' (Zeilen anschließend vereinfacht)' : ''}${swap ? ", danach II' und III' tauschen" : ''}:`,
    );
    steps.push(`$${mat([r1, r2, r3])}$`);
  }
  let d33 = '';
  if (r3[1] !== 0) [r3, d33] = elim(r2, r3, 1, "II'", "III'");
  const n33 = normRow(r3);
  const kurz3 = n33.some((v, i) => v !== r3[i]);
  r3 = n33;
  if (r3[2] === 0 || Math.abs(r3[3]) > maxAbs) return null;
  if (d33) {
    steps.push(`III'' $= ${d33}$${kurz3 ? ' (vereinfacht)' : ''} → Stufenform:`);
    steps.push(`$${mat([r1, r2, r3])}$`);
  }
  const z = r3[3] / r3[2];
  const y = (r2[3] - r2[2] * z) / r2[1];
  const x = (r1[3] - r1[1] * y - r1[2] * z) / r1[0];
  if (z !== sol[2] || y !== sol[1] || x !== sol[0]) return null;
  steps.push(`Aus der letzten Zeile: $${lin3(r3)} = ${r3[3]} \\iff z = ${z}$`);
  steps.push(`In II' einsetzen: $${subst(r2, [null, null, z])} = ${r2[3]} \\iff y = ${y}$`);
  steps.push(`In I einsetzen: $${subst(r1, [null, y, z])} = ${r1[3]} \\iff x = ${x}$`);
  return steps;
}

const gauss: Gen = () => {
  for (;;) {
    const { sol, rows } = rand3();
    const steps = gaussSteps(rows, sol);
    if (!steps) continue;
    const [x, y, z] = sol;
    return {
      title: 'Gauß-Algorithmus',
      text: `Löse das Gleichungssystem mit dem Gauß-Algorithmus:\n$\\begin{aligned} \\text{I}&: \\; ${lin3(rows[0])} = ${rows[0][3]} \\\\ \\text{II}&: \\; ${lin3(rows[1])} = ${rows[1][3]} \\\\ \\text{III}&: \\; ${lin3(rows[2])} = ${rows[2][3]} \\end{aligned}$`,
      parts: [nm('$x$', x, { integer: true }), nm('$y$', y, { integer: true }), nm('$z$', z, { integer: true })],
      solution: [...steps, `$L = \\{(${x} \\mid ${y} \\mid ${z})\\}$`],
    };
  }
};

const dreiAnwendung: Gen = () => {
  const ctx = pick([
    { items: [['Breze', 'Brezen'], ['Semmel', 'Semmeln'], ['Croissant', 'Croissants']], prices: [80, 50, 120] },
    { items: [['Heft', 'Hefte'], ['Stift', 'Stifte'], ['Ordner', 'Ordner']], prices: [150, 80, 300] },
    { items: [['Apfel', 'Äpfel'], ['Banane', 'Bananen'], ['Kiwi', 'Kiwis']], prices: [40, 30, 50] },
  ]);
  const pr = ctx.prices;
  for (let i = 0; i < 200; i++) {
    const buys = [0, 1, 2].map((k) => [k === 0 ? ri(1, 4) : ri(0, 4), ri(1, 4), ri(1, 3)]);
    const rows = buys.map((r) => [...r, r[0] * pr[0] + r[1] * pr[1] + r[2] * pr[2]]);
    const steps = gaussSteps(rows, pr, 100000);
    if (!steps) continue;
    const names = ['Anna', 'Ben', 'Can'];
    const cnt = (n: number, it: string[]) => `${n} ${n === 1 ? it[0] : it[1]}`;
    return {
      title: 'Einkauf mit drei Unbekannten',
      badge: 'Anwendung',
      text:
        buys
          .map((r, k) => `${names[k]} kauft ${[0, 1, 2].filter((j) => r[j] > 0).map((j) => cnt(r[j], ctx.items[j])).join(', ').replace(/, ([^,]*)$/, ' und $1')} für $${tx(rows[k][3] / 100, 2, true)}$ €.`)
          .join('\n') + '\nWas kostet ein Stück jeweils (in €)?',
      parts: ctx.items.map((it, j) => nm(`${it[0]}`, pr[j] / 100, { tol: 0.005 })),
      solution: [
        `$x$, $y$, $z$: Preise in Cent für ${ctx.items.map((it) => it[0]).join(', ')}`,
        `$\\begin{aligned} ${rows.map((r, k) => `\\text{${['I', 'II', 'III'][k]}}&: \\; ${lin3(r)} = ${r[3]}`).join(' \\\\ ')} \\end{aligned}$`,
        ...steps.slice(1),
        `${ctx.items.map((it, j) => `${it[0]}: $${tx(pr[j] / 100, 2, true)}$ €`).join(', ')}`,
      ],
    };
  }
  return gauss();
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'lgs-zwei-unbekannte',
    title: 'LGS mit zwei Unbekannten',
    description: 'Grafisch, Einsetz- und Additionsverfahren, Anzahl der Lösungen, Treffpunktaufgaben',
    intro:
      'Ein **lineares Gleichungssystem** (LGS) mit zwei Gleichungen und zwei Unbekannten beschreibt zwei Geraden. Die Lösung ist der **Schnittpunkt** – grafisch abgelesen oder rechnerisch bestimmt.\n\n**Einsetzverfahren**: eine Gleichung nach einer Variablen auflösen und in die andere einsetzen. **Additionsverfahren**: Gleichungen so vervielfachen, dass beim Addieren/Subtrahieren eine Variable wegfällt.\n\nParallele Geraden → keine Lösung; identische Geraden → unendlich viele Lösungen.',
    formulas: ['y = m \\cdot x + t', 's = v \\cdot t'],
    example: {
      title: 'Additionsverfahren',
      text: 'I: $2x + y = 7$, II: $x - y = 2$',
      steps: ['I + II: $3x = 9 \\iff x = 3$', 'In II: $3 - y = 2 \\iff y = 1$', '$L = \\{(3 \\mid 1)\\}$'],
    },
    gens: [grafischLoesen, einsetzverfahren, additionsverfahren, anzahlLoesungen],
    apps: [treffpunkt, anwendung2],
  },
  {
    slug: 'gauss-algorithmus',
    title: 'LGS mit drei Unbekannten (Gauß-Algorithmus)',
    description: 'Stufenform mit dem Gauß-Algorithmus, Rückwärtseinsetzen, Anwendungen',
    intro:
      'Beim **Gauß-Algorithmus** bringt man das LGS mit erlaubten Zeilenumformungen (Zeile vervielfachen, Zeilen addieren/subtrahieren, Zeilen tauschen) auf **Stufenform**: In der 2. Zeile fehlt $x$, in der 3. Zeile fehlen $x$ und $y$.\n\nDann löst man die letzte Zeile nach $z$ auf und setzt **rückwärts** ein. Übersichtlich ist die Schreibweise als erweiterte Koeffizientenmatrix (nur die Zahlen).',
    formulas: ['\\left(\\begin{array}{rrr|r} * & * & * & * \\\\ 0 & * & * & * \\\\ 0 & 0 & * & * \\end{array}\\right)'],
    example: {
      title: 'Stufenform',
      text: 'I: $x + y + z = 6$, II: $2x - y + z = 3$, III: $x + 2y - z = 2$',
      steps: ["II' $= \\text{II} - 2 \\cdot \\text{I}$: $-3y - z = -9$", "III' $= \\text{III} - \\text{I}$: $y - 2z = -4$", "III'' $= 3 \\cdot \\text{III'} + \\text{II'}$: $-7z = -21 \\iff z = 3$", '$y = 2$, $x = 1$'],
    },
    gens: [gauss],
    apps: [dreiAnwendung],
    nBasic: 3,
    nApp: 1,
  },
];

export const lb4: TopicConfig = {
  slug: 'gleichungssysteme',
  title: 'Lineare Gleichungssysteme',
  description: 'Lernbereich 4: grafisch, Einsetz- und Additionsverfahren, Gauß-Algorithmus',
  icon: 'grid',
  pages,
};
