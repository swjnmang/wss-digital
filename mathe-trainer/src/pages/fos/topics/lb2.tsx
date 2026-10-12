import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { F, Fr, ch, chFixed, gcd, lcm, nm, nz, p, pick, poly, ri, setTex, sg, t, xm, name } from '../lib';

// Lernbereich 2: Gleichungen und lineare Ungleichungen

const opTex = (op: string) => (/[a-zäöüß]{4,}/i.test(op) && !op.includes('\\') ? `\\text{${op}}` : op);
const step = (l: string, r: string, op?: string) => `$${l} = ${r}${op ? ` \\qquad | ${opTex(op)}` : ''}$`;

// ---------------------------------------------------------------------------
// Lineare Gleichungen und Ungleichungen
// ---------------------------------------------------------------------------

const linGleichung: Gen = () => {
  const x0 = nz(-8, 8);
  const a = nz(-5, 6);
  const b = nz(-6, 6);
  const c = nz(-9, 9);
  let d = nz(-5, 5);
  while (d === a) d = nz(-5, 5);
  const e = a * (x0 + b) - c - d * x0;
  const lk = a * b - c;
  return {
    title: 'Lineare Gleichung lösen',
    text: `Bestimme die Lösungsmenge ($G = \\mathbb{R}$):\n$${a === 1 ? '' : a === -1 ? '-' : a}(${poly([1, b])}) ${sg(-c)} = ${poly([d, e])}$`,
    parts: [nm('$x$', x0, { integer: true })],
    solution: [
      step(`${a === 1 ? '' : a === -1 ? '-' : a}(${poly([1, b])}) ${sg(-c)}`, poly([d, e]), 'Klammer auflösen'),
      step(`${poly([a, a * b])} ${sg(-c)}`, poly([d, e]), 'zusammenfassen'),
      step(poly([a, lk]), poly([d, e]), `${d < 0 ? '+' : '-'} ${Math.abs(d) === 1 ? '' : Math.abs(d)}x`),
      ...(lk !== 0 ? [step(poly([a - d, lk]), `${e}`, `${lk < 0 ? '+' : '-'} ${Math.abs(lk)}`)] : []),
      step(`${a - d === 1 ? '' : a - d === -1 ? '-' : a - d}x`, `${e - lk}`, `: ${p(a - d)}`),
      `$x = ${x0}$, also $L = \\{${x0}\\}$`,
    ],
  };
};

const linBruchGleichung: Gen = () => {
  const b = pick([2, 3, 4, 5, 6]);
  let d = pick([2, 3, 4, 5, 6]);
  while (d === b) d = pick([2, 3, 4, 5, 6]);
  const a = nz(-6, 6);
  const c = nz(-6, 6);
  const x0 = nz(-8, 8);
  const rhs = F(x0 + a, b).sub(F(x0 - c, d));
  const hn = lcm(b, d);
  // HN·(x + a)/b − HN·(x − c)/d = HN·rhs
  const kb = hn / b;
  const kd = hn / d;
  const r = rhs.mul(hn);
  if (kb === kd) return linGleichung();
  return {
    title: 'Gleichung mit Brüchen',
    text: `Löse ($G = \\mathbb{R}$): $\\frac{${poly([1, a])}}{${b}} - \\frac{${poly([1, -c])}}{${d}} = ${rhs.tex()}$`,
    parts: [nm('$x$', x0, { integer: true })],
    solution: [
      `Mit dem Hauptnenner $${hn}$ multiplizieren:`,
      step(`${kb === 1 ? '' : kb}(${poly([1, a])}) - ${kd === 1 ? '' : kd}(${poly([1, -c])})`, r.tex(), 'Klammern auflösen'),
      step(`${poly([kb, kb * a])} ${sg(-kd)}x ${sg(kd * c)}`, r.tex(), 'zusammenfassen'),
      ...(kb * a + kd * c !== 0
        ? [step(poly([kb - kd, kb * a + kd * c]), r.tex(), `${kb * a + kd * c < 0 ? '+' : '-'} ${Math.abs(kb * a + kd * c)}`)]
        : []),
      step(`${kb - kd === 1 ? '' : kb - kd === -1 ? '-' : kb - kd}x`, r.sub(kb * a + kd * c).tex(), `: ${p(kb - kd)}`),
      `$x = ${x0}$, $L = \\{${x0}\\}$`,
    ],
  };
};

const linUngleichung: Gen = () => {
  const a = nz(-6, 6);
  let c = nz(-6, 6);
  while (c === a) c = nz(-6, 6);
  const b = nz(-10, 10);
  const d = nz(-10, 10);
  const rel = pick(['<', '\\leq', '>', '\\geq'] as const);
  const k = a - c;
  const bound = F(d - b, k);
  const flip = k < 0;
  const FLIP: Record<string, string> = { '<': '>', '\\leq': '\\geq', '>': '<', '\\geq': '\\leq' };
  const rel2 = flip ? FLIP[rel] : rel;
  const iv =
    rel2 === '<' ? `]-\\infty;\\,${bound.tex()}[` : rel2 === '\\leq' ? `]-\\infty;\\,${bound.tex()}]` : rel2 === '>' ? `]${bound.tex()};\\,+\\infty[` : `[${bound.tex()};\\,+\\infty[`;
  const all = [`]-\\infty;\\,${bound.tex()}[`, `]-\\infty;\\,${bound.tex()}]`, `]${bound.tex()};\\,+\\infty[`, `[${bound.tex()};\\,+\\infty[`];
  return {
    title: 'Lineare Ungleichung',
    text: `Bestimme die Lösungsmenge ($G = \\mathbb{R}$): $${poly([a, b])} ${rel} ${poly([c, d])}$`,
    parts: [nm('Grenze', bound, { tol: 0.002, q: 'a) Welche Zahl ist die Grenze der Lösungsmenge? (Bruch möglich, z. B. 7/3)' }), ch('b) $L =$', `$${iv}$`, all.filter((x) => x !== iv).map((x) => `$${x}$`))],
    solution: [
      `$${poly([a, b])} ${rel} ${poly([c, d])} \\qquad | ${c < 0 ? '+' : '-'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}x \\;\\; ${b < 0 ? '+' : '-'} ${Math.abs(b)}$`,
      `$${k === 1 ? '' : k === -1 ? '-' : k}x ${rel} ${d - b} \\qquad | : ${p(k)}$${flip ? ' **(Division durch eine negative Zahl → Ungleichheitszeichen umdrehen!)**' : ''}`,
      `$x ${rel2} ${bound.tex()}$`,
      `$L = ${iv}$`,
    ],
  };
};

const linParameter: Gen = () => {
  const m = nz(-4, 5);
  let s = nz(-6, 6);
  while (m + s === 0) s = nz(-6, 6);
  const a = nz(-5, 5);
  const b = a + s;
  let k1 = nz(-5, 6);
  while (k1 === m || k1 + s === 0) k1 = nz(-5, 6);
  const x1 = F(k1 + s, k1 - m);
  return {
    title: 'Lineare Gleichung mit Parameter',
    text: `Gegeben ist die Gleichung $kx ${sg(a)} = ${poly([m, 0])} + k ${b ? sg(b) : ''}$ mit $k \\in \\mathbb{R}$ ($G = \\mathbb{R}$).`,
    parts: [
      nm('$k$', m, { integer: true, q: 'a) Für welchen Wert von $k$ hat die Gleichung **keine** Lösung?' }),
      nm(`$x$`, x1, { tol: 0.002, q: `b) Berechne die Lösung für $k = ${k1}$.` }),
    ],
    solution: [
      `$kx ${sg(a)} = ${poly([m, 0])} + k ${b ? sg(b) : ''} \\qquad | ${m < 0 ? '+' : '-'} ${Math.abs(m)}x \\;\\; ${a < 0 ? '+' : '-'} ${Math.abs(a)}$`,
      `$(k ${sg(-m)})x = k ${sg(s)}$ → Ausklammern von $x$`,
      `Für $k \\neq ${m}$: $x = \\frac{k ${sg(s)}}{k ${sg(-m)}}$`,
      `Für $k = ${m}$: $0 \\cdot x = ${m + s}$ – falsche Aussage, also $L = \\{\\,\\}$.`,
      `b) $k = ${k1}$: $x = \\frac{${k1} ${sg(s)}}{${k1} ${sg(-m)}} = ${x1.tex()}$`,
    ],
  };
};

const bewegung: Gen = () => {
  const v1 = pick([40, 50, 60, 70, 80, 90]);
  const v2 = pick([60, 70, 80, 90, 100, 110]);
  const late = Math.random() < 0.5;
  const tt = pick([1, 1.5, 2, 2.5]);
  const delay = late ? 0.5 : 0;
  // Fahrzeug 2 startet delay h später: v1·t + v2·(t − delay) = s
  const s = v1 * tt + v2 * (tt - delay);
  const n1 = name();
  return {
    title: 'Bewegungsaufgabe',
    badge: 'Anwendung',
    text: `Die Orte A und B sind $${s}$ km voneinander entfernt. ${n1} fährt um 8:00 Uhr in A mit konstant $${v1}\\,\\frac{\\text{km}}{\\text{h}}$ los in Richtung B. ${late ? 'Eine halbe Stunde später' : 'Zur gleichen Zeit'} startet ein Lieferwagen in B mit $${v2}\\,\\frac{\\text{km}}{\\text{h}}$ in Richtung A.`,
    parts: [
      nm('$t$ (in h)', tt, { q: `a) Nach wie vielen Stunden (ab 8:00 Uhr) treffen sie sich?`, tol: 0.01 }),
      nm('Entfernung (in km)', v1 * tt, { q: 'b) Wie weit von A entfernt treffen sie sich?', tol: 0.05 }),
    ],
    solution: [
      `Weg = Geschwindigkeit · Zeit. ${n1}: $s_1 = ${v1}t$, Lieferwagen: $s_2 = ${v2}${late ? '(t - 0{,}5)' : 't'}$`,
      `Treffen, wenn beide zusammen die Strecke geschafft haben: $${v1}t + ${v2}${late ? '(t - 0{,}5)' : 't'} = ${s}$`,
      late ? `$${v1 + v2}t - ${v2 / 2} = ${s} \\qquad | + ${v2 / 2}$` : `$${v1 + v2}t = ${s} \\qquad | : ${v1 + v2}$`,
      late ? `$${v1 + v2}t = ${s + v2 / 2} \\qquad | : ${v1 + v2}$` : '',
      `$t = ${t(tt)}$ h, also um ${8 + Math.floor(tt)}:${tt % 1 ? '30' : '00'} Uhr`,
      `Entfernung von A: $s_1 = ${v1} \\cdot ${t(tt)} = ${t(v1 * tt)}$ km`,
    ].filter(Boolean),
  };
};

const kostenvergleich: Gen = () => {
  const x0 = pick([50, 80, 100, 120, 150, 200, 250, 300]);
  const pA = pick([0.2, 0.25, 0.3, 0.35, 0.4]);
  const pB = pick([0.1, 0.12, 0.15]);
  const gA = pick([5, 8, 10, 12]);
  const gB = Math.round((gA + (pA - pB) * x0) * 100) / 100;
  const ctx = pick([
    { what: 'Handytarif', unit: 'Minuten', u: 'Minute' },
    { what: 'Stromtarif', unit: 'kWh', u: 'kWh' },
    { what: 'Mietwagen', unit: 'km', u: 'km' },
  ]);
  return {
    title: 'Lineare Kosten vergleichen',
    badge: 'Anwendung',
    text: `${ctx.what} A: Grundgebühr $${t(gA)}$ € und $${t(pA)}$ € pro ${ctx.u}.\n${ctx.what} B: Grundgebühr $${t(gB)}$ € und $${t(pB)}$ € pro ${ctx.u}.`,
    parts: [
      nm(`Anzahl (${ctx.unit})`, x0, { q: `a) Bei wie vielen ${ctx.unit} kosten beide Tarife gleich viel?`, tol: 0.5 }),
      ch(`b) Welcher Tarif ist bei mehr als $${x0}$ ${ctx.unit} günstiger?`, 'Tarif B', ['Tarif A']),
    ],
    solution: [
      `$K_A(x) = ${t(pA)}x + ${t(gA)}$, $\\; K_B(x) = ${t(pB)}x + ${t(gB)}$ ($x$: Anzahl ${ctx.unit})`,
      `$${t(pA)}x + ${t(gA)} = ${t(pB)}x + ${t(gB)} \\qquad | - ${t(pB)}x - ${t(gA)}$`,
      `$${t(pA - pB)}x = ${t(gB - gA)} \\qquad | : ${t(pA - pB)}$`,
      `$x = ${x0}$`,
      `b) Tarif B hat den kleineren Preis pro ${ctx.u}, also ist er danach günstiger.`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Quadratische Gleichungen
// ---------------------------------------------------------------------------

function quadCoefs(): { a: number; b: number; c: number } {
  const a = pick([1, 1, 2, -1, 3, -2]);
  const b = nz(-8, 8);
  const c = ri(-9, 9);
  return { a, b, c };
}

const diskriminante: Gen = () => {
  let a: number, b: number, c: number;
  const kind = ri(0, 2);
  if (kind === 1) {
    // D = 0
    const r = nz(-4, 4);
    a = pick([1, 2, -1]);
    b = -2 * a * r;
    c = a * r * r;
  } else ({ a, b, c } = quadCoefs());
  const D = b * b - 4 * a * c;
  const n = D > 0 ? 2 : D === 0 ? 1 : 0;
  return {
    title: 'Diskriminante untersuchen',
    text: `Gegeben ist $${poly([a, b, c])} = 0$.`,
    parts: [
      nm('$D$', D, { integer: true, q: 'a) Berechne die Diskriminante $D = b^2 - 4ac$.' }),
      chFixed('b) Anzahl der Lösungen:', ['keine', 'genau eine', 'zwei'], n),
    ],
    solution: [
      `$a = ${a}$, $b = ${b}$, $c = ${c}$`,
      `$D = ${p(b)}^2 - 4 \\cdot ${p(a)} \\cdot ${p(c)} = ${b * b} ${sg(-4 * a * c)} = ${D}$`,
      D > 0 ? '$D > 0$ → zwei Lösungen' : D === 0 ? '$D = 0$ → genau eine (doppelte) Lösung' : '$D < 0$ → keine Lösung, $L = \\{\\,\\}$',
    ],
  };
};

function niceRoots(): [Fr, Fr, number] {
  const a = pick([1, 1, 2, -1, -2, 3, 4]);
  if (Math.abs(a) >= 2 && Math.random() < 0.5) {
    const r1 = F(nz(-7, 7), Math.abs(a));
    const r2 = F(nz(-5, 5));
    if (r1.v === r2.v) return niceRoots();
    return [r1, r2, a];
  }
  const r1 = nz(-7, 7);
  let r2 = ri(-7, 7);
  while (r2 === r1) r2 = ri(-7, 7);
  return [F(r1), F(r2), a];
}

const loesungsformel: Gen = () => {
  const [r1, r2, a] = niceRoots();
  // a(x − r1)(x − r2) = a x² − a(r1 + r2) x + a r1 r2
  const b = r1.add(r2).mul(-a);
  const c = r1.mul(r2).mul(a);
  if (!b.isInt || !c.isInt) return loesungsformel();
  const D = b.v * b.v - 4 * a * c.v;
  const sq = Math.sqrt(D);
  const [lo, hi] = r1.v < r2.v ? [r1, r2] : [r2, r1];
  return {
    title: 'Lösungsformel anwenden',
    text: `Löse mit der Lösungsformel: $${poly([a, b.v, c.v])} = 0$`,
    parts: [nm('$x_1$ (kleinere Lösung)', lo, { tol: 0.002 }), nm('$x_2$ (größere Lösung)', hi, { tol: 0.002 })],
    solution: [
      `$a = ${a}$, $b = ${b.v}$, $c = ${c.v}$`,
      `$D = ${p(b.v)}^2 - 4 \\cdot ${p(a)} \\cdot ${p(c.v)} = ${D}$, $\\sqrt{D} = ${sq}$`,
      `$x_{1;2} = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{${-b.v} \\pm ${sq}}{${2 * a}}$`,
      `$x_1 = ${lo.tex()}$, $\\; x_2 = ${hi.tex()}$`,
      `$L = \\{${lo.tex()}; ${hi.tex()}\\}$`,
    ],
  };
};

const faktorisieren: Gen = () => {
  const k = ri(0, 3);
  if (k === 0) {
    const a = nz(-4, 5);
    const r = nz(-6, 6);
    const b = -a * r;
    const lo = Math.min(0, r);
    const hi = Math.max(0, r);
    return {
      title: 'Lösen durch Ausklammern',
      text: `Löse durch Ausklammern: $${poly([a, b, 0])} = 0$`,
      parts: [nm('$x_1$ (kleinere Lösung)', lo, { integer: true }), nm('$x_2$ (größere Lösung)', hi, { integer: true })],
      solution: [
        `$x(${poly([a, b])}) = 0$`,
        'Ein Produkt ist null, wenn ein Faktor null ist:',
        `$x = 0 \\;\\lor\\; ${poly([a, b])} = 0 \\iff x = ${r}$`,
        `$L = \\{${lo}; ${hi}\\}$`,
      ],
    };
  }
  if (k === 1) {
    const r1 = nz(-8, 8);
    let r2 = nz(-8, 8);
    while (r2 === r1) r2 = nz(-8, 8);
    const pp = -(r1 + r2);
    const q = r1 * r2;
    const [lo, hi] = [Math.min(r1, r2), Math.max(r1, r2)];
    return {
      title: 'Satz von Vieta',
      text: `Löse durch Faktorisieren (Satz von Vieta): $${poly([1, pp, q])} = 0$`,
      parts: [nm('$x_1$ (kleinere Lösung)', lo, { integer: true }), nm('$x_2$ (größere Lösung)', hi, { integer: true })],
      solution: [
        'Vieta: Für $x^2 + px + q = 0$ gilt $x_1 + x_2 = -p$ und $x_1 \\cdot x_2 = q$.',
        `Gesucht: zwei Zahlen mit Produkt $${q}$ und Summe $${-pp}$ → $${lo}$ und $${hi}$`,
        `$(${xm(r1)})(${xm(r2)}) = 0$`,
        `$L = \\{${lo}; ${hi}\\}$`,
      ],
    };
  }
  if (k === 2) {
    const a = pick([1, 2, 3]);
    const r = nz(-6, 6);
    // a(x − r)²
    const co = [a * a, -2 * a * a * r, a * a * r * r].map((x) => x / a);
    const g = gcd(gcd(co[0], co[1]), co[2]);
    const c2 = co.map((x) => x / g);
    return {
      title: 'Binomische Formel erkennen',
      text: `Löse: $${poly(c2)} = 0$`,
      parts: [nm('$x$', r, { integer: true })],
      solution: [
        `$${poly(c2)} = ${c2[0] === 1 ? '' : c2[0]}(${xm(r)})^2$ (${r > 0 ? '2.' : '1.'} binomische Formel${c2[0] === 1 ? '' : ' nach Ausklammern'})`,
        `$(${xm(r)})^2 = 0 \\iff x = ${r}$ (doppelte Lösung)`,
        `$L = \\{${r}\\}$`,
      ],
    };
  }
  const a = pick([1, 2, 3, 4, 5]);
  const r = ri(1, 7);
  const c = a * r * r;
  return {
    title: 'Reinquadratische Gleichung',
    text: `Löse: $${poly([a, 0, -c])} = 0$`,
    parts: [nm('$x_1$ (kleinere Lösung)', -r, { integer: true }), nm('$x_2$ (größere Lösung)', r, { integer: true })],
    solution: [
      `$${a === 1 ? '' : a}x^2 = ${c}${a === 1 ? '' : ` \\qquad | : ${a}`}$`,
      `$x^2 = ${r * r} \\qquad | \\sqrt{\\;}$`,
      `$x = \\pm ${r}$, $L = \\{-${r}; ${r}\\}$`,
    ],
  };
};

const quadParameter: Gen = () => {
  const k = ri(0, 2);
  if (k === 0) {
    const b = 2 * nz(-5, 5);
    const crit = (b * b) / 4;
    const rel = pick(['zwei Lösungen', 'genau eine Lösung', 'keine Lösung'] as const);
    const right = rel === 'zwei Lösungen' ? `$k < ${crit}$` : rel === 'genau eine Lösung' ? `$k = ${crit}$` : `$k > ${crit}$`;
    return {
      title: 'Quadratische Gleichung mit Parameter',
      text: `Gegeben ist $${poly([1, b, 0]).replace(/ \+ 0$/, '')} + k = 0$ mit $k \\in \\mathbb{R}$.`,
      parts: [
        nm('$D(k) = 0$ für $k =$', crit, { integer: true, q: 'a) Für welches $k$ ist die Diskriminante null?' }),
        ch(`b) Für welche $k$ hat die Gleichung **${rel}**?`, right, [`$k < ${crit}$`, `$k = ${crit}$`, `$k > ${crit}$`, `$k < ${-crit}$`]),
      ],
      solution: [
        `$D = ${p(b)}^2 - 4 \\cdot 1 \\cdot k = ${b * b} - 4k$`,
        `$D = 0 \\iff ${b * b} - 4k = 0 \\iff k = ${crit}$`,
        `$D > 0 \\iff k < ${crit}$ (zwei Lösungen); $\\;D < 0 \\iff k > ${crit}$ (keine Lösung)`,
      ],
    };
  }
  if (k === 1) {
    const b = 2 * ri(1, 4);
    const c = pick([1, 2, 4].filter((x) => (b * b) % (4 * x) === 0));
    const crit = (b * b) / (4 * c);
    return {
      title: 'Parameter im Leitkoeffizienten',
      text: `Für welchen Wert von $k \\neq 0$ hat $kx^2 + ${b}x + ${c} = 0$ genau eine Lösung?`,
      parts: [nm('$k$', crit, { tol: 0.002 })],
      solution: [
        `$D = ${b}^2 - 4 \\cdot k \\cdot ${c} = ${b * b} - ${4 * c}k$`,
        `Genau eine Lösung $\\iff D = 0$: $${b * b} - ${4 * c}k = 0 \\iff k = ${t(crit)}$`,
      ],
    };
  }
  const m = nz(-5, 5);
  // x² − (k + m)x + k·m = 0 → x = k, x = m
  return {
    title: 'Lösungsmenge in Abhängigkeit von k',
    text: `Bestimme die Lösungsmenge von $x^2 - (k ${sg(m)})x ${sg(m)}k = 0$ in Abhängigkeit von $k \\in \\mathbb{R}$.`,
    parts: [
      ch('a) Allgemeine Lösungsmenge:', `$L = \\{${m}; k\\}$`, [`$L = \\{${-m}; k\\}$`, `$L = \\{${m}; -k\\}$`, `$L = \\{${-m}; -k\\}$`]),
      nm('$k$', m, { integer: true, q: 'b) Für welches $k$ gibt es nur **eine** Lösung?' }),
    ],
    solution: [
      `Vieta: zwei Zahlen mit Summe $k ${sg(m)}$ und Produkt $${m}k$ → $${m}$ und $k$.`,
      `$(${xm(m)})(x - k) = 0 \\iff x = ${m} \\lor x = k$`,
      `Für $k = ${m}$ fallen beide Lösungen zusammen: $L = \\{${m}\\}$.`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Bruchgleichungen
// ---------------------------------------------------------------------------

const bruchgleichungEinfach: Gen = () => {
  const b = nz(-6, 6);
  const c = nz(-4, 4);
  let x0 = nz(-8, 8);
  while (x0 === b) x0 = nz(-8, 8);
  const a = c * (x0 - b);
  return {
    title: 'Einfache Bruchgleichung',
    text: `Löse: $\\frac{${a}}{${poly([1, -b])}} = ${c}$`,
    parts: [ch('a) Definitionsmenge:', `$D = \\mathbb{R} \\setminus \\{${b}\\}$`, [`$D = \\mathbb{R} \\setminus \\{${-b}\\}$`, '$D = \\mathbb{R}$', `$D = \\mathbb{R} \\setminus \\{0\\}$`]), nm('b) $x$', x0, { integer: true })],
    solution: [
      `Nenner $\\neq 0$: $${poly([1, -b])} \\neq 0 \\iff x \\neq ${b}$, also $D = \\mathbb{R} \\setminus \\{${b}\\}$`,
      step(`\\frac{${a}}{${poly([1, -b])}}`, `${c}`, `\\cdot (${poly([1, -b])})`),
      step(`${a}`, poly([c, -c * b]), `${-c * b < 0 ? '+' : '-'} ${Math.abs(c * b)}`),
      step(`${a + c * b}`, `${c === 1 ? '' : c === -1 ? '-' : c}x`, `: ${p(c)}`),
      `$x = ${x0} \\in D$, also $L = \\{${x0}\\}$`,
    ],
  };
};

const bruchgleichungKreuz: Gen = () => {
  for (;;) {
    const x0 = nz(-6, 6);
    const b = nz(-6, 6);
    const d = nz(-6, 6);
    const w = x0 + b;
    const u = x0 + d;
    if (w === 0 || u === 0 || b === d) continue;
    const g = gcd(u, w);
    const a = w / g;
    const c = u / g;
    if (a === c || Math.abs(a) > 12 || Math.abs(c) > 12) continue;
    return {
      title: 'Bruchgleichung (Kreuzmultiplikation)',
      text: `Löse: $\\frac{${a}}{${poly([1, b])}} = \\frac{${c}}{${poly([1, d])}}$`,
      parts: [nm('$x$', x0, { integer: true })],
      solution: [
        `$D = \\mathbb{R} \\setminus ${setTex([-b, -d].sort((x, y) => x - y))}$`,
        `Mit beiden Nennern multiplizieren: $${a}(${poly([1, d])}) = ${c}(${poly([1, b])})$`,
        step(poly([a, a * d]), poly([c, c * b]), `${c < 0 ? '+' : '-'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}x \\;\\; ${a * d < 0 ? '+' : '-'} ${Math.abs(a * d)}`),
        step(`${a - c === 1 ? '' : a - c === -1 ? '-' : a - c}x`, `${c * b - a * d}`, `: ${p(a - c)}`),
        `$x = ${x0} \\in D$, $L = \\{${x0}\\}$`,
      ],
    };
  }
};

const bruchgleichungQuadratisch: Gen = () => {
  const r1 = nz(-6, 6);
  let r2 = nz(-6, 6);
  while (r2 === r1) r2 = nz(-6, 6);
  const a = r1 * r2;
  const b = r1 + r2;
  const [lo, hi] = [Math.min(r1, r2), Math.max(r1, r2)];
  return {
    title: 'Bruchgleichung → quadratische Gleichung',
    text: `Löse ($D = \\mathbb{R} \\setminus \\{0\\}$): $x ${a < 0 ? '-' : '+'} \\frac{${Math.abs(a)}}{x} = ${b}$`,
    parts: [nm('$x_1$ (kleinere Lösung)', lo, { integer: true }), nm('$x_2$ (größere Lösung)', hi, { integer: true })],
    solution: [
      `Mit $x$ multiplizieren: $x^2 ${sg(a)} = ${b}x$`,
      `$${poly([1, -b, a])} = 0$`,
      `Vieta oder Lösungsformel: $(${xm(r1)})(${xm(r2)}) = 0$`,
      `Beide Lösungen liegen in $D$: $L = \\{${lo}; ${hi}\\}$`,
    ],
  };
};

const scheinloesung: Gen = () => {
  const r = nz(-6, 6);
  if (Math.random() < 0.5) {
    let q = nz(-4, 4);
    while (q === 1) q = nz(-4, 4);
    return {
      title: 'Achtung Definitionsmenge',
      text: `Löse: $\\frac{x}{${poly([1, -r])}} = \\frac{${r}}{${poly([1, -r])}} ${sg(q)}$`,
      parts: [ch('Lösungsmenge:', '$L = \\{\\,\\}$', [`$L = \\{${r}\\}$`, `$L = \\{${-r}\\}$`, `$L = \\{${r}; ${-r}\\}$`])],
      solution: [
        `$D = \\mathbb{R} \\setminus \\{${r}\\}$`,
        `Mit $(${poly([1, -r])})$ multiplizieren: $x = ${r} ${sg(q)}(${poly([1, -r])})$`,
        `$x = ${poly([q, r - q * r])} \\iff ${poly([1 - q, 0])} = ${r * (1 - q)} \\iff x = ${r}$`,
        `Aber $${r} \\notin D$ – Scheinlösung! Also $L = \\{\\,\\}$.`,
      ],
    };
  }
  const c = ri(1, 9);
  return {
    title: 'Achtung Definitionsmenge',
    text: `Löse: $\\frac{x^2 + ${c}}{${poly([1, -r])}} = \\frac{${r * r + c}}{${poly([1, -r])}}$`,
    parts: [ch('Lösungsmenge:', `$L = \\{${-r}\\}$`, [`$L = \\{${r}\\}$`, `$L = \\{${-r}; ${r}\\}$`, '$L = \\{\\,\\}$'])],
    solution: [
      `$D = \\mathbb{R} \\setminus \\{${r}\\}$`,
      `Mit $(${poly([1, -r])})$ multiplizieren: $x^2 + ${c} = ${r * r + c} \\iff x^2 = ${r * r}$`,
      `$x = ${r}$ oder $x = ${-r}$`,
      `$${r} \\notin D$ (Scheinlösung), also $L = \\{${-r}\\}$.`,
    ],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'lineare-gleichungen',
    title: 'Lineare Gleichungen und Ungleichungen',
    description: 'Äquivalenzumformungen, Ungleichungen, Parameter, Bewegungs- und Kostenaufgaben',
    intro:
      'Mit **Äquivalenzumformungen** (auf beiden Seiten dasselbe addieren, subtrahieren, mit derselben Zahl $\\neq 0$ multiplizieren oder dividieren) bringt man die Variable auf eine Seite. Die Umformung schreibt man hinter einen senkrechten Strich.\n\nBei **Ungleichungen** gilt dasselbe – mit einer Ausnahme: Beim Multiplizieren oder Dividieren mit einer **negativen** Zahl dreht sich das Ungleichheitszeichen um. Die Lösungsmenge gibt man als Intervall an.\n\nBei einem **Parameter** $k$ muss man prüfen, wann man durch einen Term mit $k$ teilen darf (Term $\\neq 0$).',
    formulas: ['a < b \\;\\Rightarrow\\; a \\cdot c > b \\cdot c \\;\\text{ für } c < 0', 's = v \\cdot t'],
    example: {
      title: 'Ungleichung lösen',
      text: 'Löse $3x - 4 > 5x + 2$.',
      steps: ['$3x - 4 > 5x + 2 \\qquad | -5x + 4$', '$-2x > 6 \\qquad | : (-2)$ → Zeichen umdrehen', '$x < -3$, $L = ]-\\infty;\\,-3[$'],
    },
    gens: [linGleichung, linBruchGleichung, linUngleichung, linParameter],
    apps: [bewegung, kostenvergleich],
  },
  {
    slug: 'quadratische-gleichungen',
    title: 'Quadratische Gleichungen',
    description: 'Diskriminante, Lösungsformel, Faktorisieren (Ausklammern, Vieta, binomische Formeln), Parameter',
    intro:
      'Eine quadratische Gleichung $ax^2 + bx + c = 0$ ($a \\neq 0$) hat je nach **Diskriminante** $D = b^2 - 4ac$ zwei ($D > 0$), eine ($D = 0$) oder keine ($D < 0$) Lösung.\n\nLösungswege: **Lösungsformel** (immer möglich), **Ausklammern** (wenn $c = 0$), **Satz von Vieta** (Zahlen mit passender Summe und passendem Produkt), **binomische Formeln** oder Wurzelziehen bei $ax^2 = c$. Hängt die Gleichung von einem Parameter ab, untersucht man $D$ in Abhängigkeit vom Parameter.',
    formulas: ['x_{1;2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', 'D = b^2 - 4ac', 'x^2 + px + q = (x - x_1)(x - x_2) \\text{ mit } x_1 + x_2 = -p,\\; x_1 x_2 = q'],
    example: {
      title: 'Lösungsformel',
      text: 'Löse $2x^2 - 2x - 12 = 0$.',
      steps: ['$D = (-2)^2 - 4 \\cdot 2 \\cdot (-12) = 100$', '$x_{1;2} = \\frac{2 \\pm 10}{4}$', '$x_1 = -2$, $x_2 = 3$, $L = \\{-2; 3\\}$'],
    },
    gens: [diskriminante, loesungsformel, faktorisieren, quadParameter],
  },
  {
    slug: 'bruchgleichungen',
    title: 'Bruchgleichungen',
    description: 'Definitionsmenge beachten, auf lineare oder quadratische Gleichungen zurückführen',
    intro:
      'Bei einer **Bruchgleichung** steht die Variable im Nenner. Vorgehen: 1. **Definitionsmenge** bestimmen (Nenner $\\neq 0$). 2. Mit dem Hauptnenner multiplizieren. 3. Die entstandene lineare oder quadratische Gleichung lösen. 4. Prüfen, ob die Lösungen in $D$ liegen – sonst sind es **Scheinlösungen**.',
    example: {
      title: 'Bruchgleichung',
      text: 'Löse $\\frac{6}{x - 1} = 3$.',
      steps: ['$D = \\mathbb{R} \\setminus \\{1\\}$', '$6 = 3(x - 1) \\iff 6 = 3x - 3 \\iff x = 3$', '$3 \\in D$, also $L = \\{3\\}$'],
    },
    gens: [bruchgleichungEinfach, bruchgleichungKreuz, bruchgleichungQuadratisch, scheinloesung],
  },
];

export const lb2: TopicConfig = {
  slug: 'gleichungen',
  title: 'Gleichungen und lineare Ungleichungen',
  description: 'Lernbereich 2: lineare, quadratische und Bruchgleichungen, Ungleichungen, Parameter',
  icon: 'equals',
  pages,
};
