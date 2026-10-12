import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { q, type UnitId } from '../../raum_und_form/engine/util';
import { RightTriFig, TriFig } from '../../raum_und_form/figures/shapes';
import { pythagoras } from '../../raum_und_form/topics/pythagoras';
import { ch, chFixed, de, eqs, nm, pick, ri, rs, round, shuffle, t } from '../lib';

// Lernbereich 5: Dreieckslehre

const DEG = Math.PI / 180;
const sin = (a: number) => Math.sin(a * DEG);
const cos = (a: number) => Math.cos(a * DEG);
const tan = (a: number) => Math.tan(a * DEG);
const unit = (): UnitId => pick(['cm', 'm', 'cm', 'm', 'mm'] as UnitId[]);
const r2 = (x: number) => round(x, 2);
const pageGens = (slug: string) => {
  const pg = pythagoras.pages.find((x) => x.slug === slug);
  return [...(pg?.gens ?? []), ...(pg?.apps ?? [])];
};

// ---------------------------------------------------------------------------
// Dreiecksarten und Winkelsumme
// ---------------------------------------------------------------------------

const TYPES = ['gleichseitig', 'gleichschenklig (nicht gleichseitig)', 'rechtwinklig', 'gleichschenklig und rechtwinklig', 'keine dieser Eigenschaften'];

const seitenKlassifizieren: Gen = () => {
  const k = ri(0, 4);
  const u = unit();
  let sides: string[];
  let why: string;
  if (k === 0) {
    const a = rs(2, 9, 0.5);
    sides = [q(a, u), q(a, u), q(a, u)];
    why = 'Alle drei Seiten sind gleich lang.';
  } else if (k === 1) {
    const a = rs(3, 9, 0.5);
    let b = rs(2, 12, 0.5);
    while (b === a || Math.abs(a * a * 2 - b * b) < 1e-9 || b >= 2 * a) b = rs(2, 12, 0.5);
    sides = shuffle([q(a, u), q(a, u), q(b, u)]);
    why = `Zwei Seiten sind gleich lang ($${q(a, u)}$), und $${t(a)}^2 + ${t(a)}^2 = ${t(2 * a * a)} \\neq ${t(b * b)} = ${t(b)}^2$ – also nicht rechtwinklig.`;
  } else if (k === 2) {
    const tr = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]]);
    const f = pick([1, 0.5, 2]);
    const s = tr.map((x) => x * f);
    sides = shuffle(s.map((x) => q(x, u)));
    why = `Pythagoras mit der längsten Seite: $${t(s[0])}^2 + ${t(s[1])}^2 = ${t(s[0] ** 2 + s[1] ** 2)} = ${t(s[2])}^2$ → rechtwinklig.`;
  } else if (k === 3) {
    const a = ri(2, 9);
    sides = shuffle([`${a}\\,\\text{${u}}`, `${a}\\,\\text{${u}}`, `${a}\\sqrt{2}\\,\\text{${u}}`]);
    why = `Zwei gleich lange Seiten und $${a}^2 + ${a}^2 = ${2 * a * a} = (${a}\\sqrt{2})^2$ → gleichschenklig und rechtwinklig.`;
  } else {
    let a = 0;
    let b = 0;
    let c = 0;
    do {
      a = ri(3, 7);
      b = a + ri(1, 3);
      c = b + ri(1, 3);
    } while (a * a + b * b === c * c || c >= a + b);
    sides = shuffle([q(a, u), q(b, u), q(c, u)]);
    why = `Alle Seiten verschieden; $${a}^2 + ${b}^2 = ${a * a + b * b} \\neq ${c * c} = ${c}^2$ → nicht rechtwinklig.`;
  }
  return {
    title: 'Dreiecksart bestimmen',
    text: `Ein Dreieck hat die Seitenlängen $${sides.join('$, $')}$. Welche Eigenschaft hat es?`,
    parts: [chFixed('Das Dreieck ist …', TYPES, k)],
    solution: ['Gleichseitig: drei gleiche Seiten. Gleichschenklig: zwei gleiche Seiten. Rechtwinklig: $a^2 + b^2 = c^2$ mit der längsten Seite $c$ (Umkehrung des Pythagoras).', why],
  };
};

const winkelsumme: Gen = () => {
  const kind = ri(0, 2);
  let al: number;
  let be: number;
  if (kind === 0) {
    al = ri(20, 70);
    be = 90 - al;
  } else if (kind === 1) {
    al = ri(15, 45);
    be = ri(95 - al, 150 - al);
  } else {
    al = ri(35, 80);
    be = ri(Math.max(91 - al, 30), 85);
  }
  const ga = 180 - al - be;
  const ang = [al, be, ga];
  const art = ang.includes(90) ? 1 : Math.max(...ang) > 90 ? 2 : 0;
  return {
    title: 'Innenwinkelsumme',
    text: `In einem Dreieck ist $\\alpha = ${al}^\\circ$ und $\\beta = ${be}^\\circ$.`,
    figure: <TriFig g={6} h={3.5} t={2 + ri(-1, 2)} names={['A', 'B', 'C']} noHeight />,
    parts: [nm('$\\gamma$ in Grad', ga, { integer: true }), chFixed('Das Dreieck ist …', ['spitzwinklig', 'rechtwinklig', 'stumpfwinklig'], art)],
    solution: [
      '$\\alpha + \\beta + \\gamma = 180^\\circ$',
      `$\\gamma = 180^\\circ - ${al}^\\circ - ${be}^\\circ = ${ga}^\\circ$`,
      art === 1 ? 'Ein Winkel ist $90^\\circ$ → rechtwinklig.' : art === 2 ? 'Ein Winkel ist größer als $90^\\circ$ → stumpfwinklig.' : 'Alle Winkel sind kleiner als $90^\\circ$ → spitzwinklig.',
    ],
  };
};

const gleichschenkligWinkel: Gen = () => {
  if (Math.random() < 0.5) {
    const basis = ri(25, 80);
    return {
      title: 'Winkel im gleichschenkligen Dreieck',
      text: `In einem gleichschenkligen Dreieck ist ein Basiswinkel $${basis}^\\circ$ groß. Berechne den Winkel an der Spitze.`,
      parts: [nm('Spitzenwinkel in Grad', 180 - 2 * basis, { integer: true })],
      solution: ['Die beiden Basiswinkel sind gleich groß.', `$180^\\circ - 2 \\cdot ${basis}^\\circ = ${180 - 2 * basis}^\\circ$`],
    };
  }
  const spitze = 2 * ri(10, 70);
  return {
    title: 'Winkel im gleichschenkligen Dreieck',
    text: `Der Winkel an der Spitze eines gleichschenkligen Dreiecks beträgt $${spitze}^\\circ$. Wie groß ist ein Basiswinkel?`,
    parts: [nm('Basiswinkel in Grad', (180 - spitze) / 2, { integer: true })],
    solution: ['Die beiden Basiswinkel sind gleich groß.', `$(180^\\circ - ${spitze}^\\circ) : 2 = ${(180 - spitze) / 2}^\\circ$`],
  };
};

const winkelGleichseitig: Gen = () => {
  let al = ri(20, 70);
  while (al === 45) al = ri(20, 70);
  const ga = 90;
  const be = 180 - al - ga;
  return {
    title: 'Winkel im rechtwinkligen Dreieck',
    text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$ und $\\alpha$ ist um $${Math.abs(be - al)}^\\circ$ ${be - al >= 0 ? 'kleiner' : 'größer'} als $\\beta$. Berechne $\\alpha$.`,
    parts: [nm('$\\alpha$ in Grad', al, { integer: true })],
    solution: [`$\\alpha + \\beta = 90^\\circ$ und $\\beta = \\alpha ${be - al >= 0 ? '+' : '-'} ${Math.abs(be - al)}^\\circ$`, `$2\\alpha ${be - al >= 0 ? '+' : '-'} ${Math.abs(be - al)}^\\circ = 90^\\circ \\iff \\alpha = ${al}^\\circ$`],
  };
};

// ---------------------------------------------------------------------------
// Sinus, Kosinus, Tangens
// ---------------------------------------------------------------------------

/** Rechtwinkliges Dreieck ABC mit γ = 90°: a = BC, b = AC, c = AB (Hypotenuse) */
function triAt(al: number, c: number) {
  return { a: c * sin(al), b: c * cos(al), c };
}

const fig = (a: number, b: number, la: string, lb: string, lc: string) => (
  <RightTriFig k1={a} k2={b} l1={la} l2={lb} lh={lc} names={['C', 'B', 'A']} rot={pick([0, 0, 180, 90])} mirror={Math.random() < 0.5} />
);

const seiteBerechnen: Gen = () => {
  const al = ri(20, 70);
  const u = unit();
  const k = ri(0, 3);
  const c = rs(4, 15, 0.5);
  const { a, b } = triAt(al, c);
  if (k === 0) {
    return {
      title: 'Gegenkathete mit Sinus',
      text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $\\alpha = ${al}^\\circ$ und $c = ${q(c, u)}$. Berechne $a$.`,
      figure: fig(a, b, 'a = ?', 'b', `c = ${de(c)} ${u}`),
      parts: [nm(`$a$ in ${u}`, a, { tol: 0.02 })],
      solution: ['$a$ liegt $\\alpha$ gegenüber (Gegenkathete), $c$ ist die Hypotenuse.', `$\\sin\\alpha = \\frac{a}{c} \\iff a = c \\cdot \\sin\\alpha$`, `$a = ${q(c, u)} \\cdot \\sin ${al}^\\circ ${eqs(a)} ${q(r2(a), u)}$`],
    };
  }
  if (k === 1) {
    return {
      title: 'Ankathete mit Kosinus',
      text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $\\alpha = ${al}^\\circ$ und $c = ${q(c, u)}$. Berechne $b$.`,
      figure: fig(a, b, 'a', 'b = ?', `c = ${de(c)} ${u}`),
      parts: [nm(`$b$ in ${u}`, b, { tol: 0.02 })],
      solution: ['$b$ liegt an $\\alpha$ an (Ankathete), $c$ ist die Hypotenuse.', `$\\cos\\alpha = \\frac{b}{c} \\iff b = c \\cdot \\cos\\alpha$`, `$b = ${q(c, u)} \\cdot \\cos ${al}^\\circ ${eqs(b)} ${q(r2(b), u)}$`],
    };
  }
  if (k === 2) {
    const bb = rs(3, 12, 0.5);
    const aa = bb * tan(al);
    return {
      title: 'Gegenkathete mit Tangens',
      text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $\\alpha = ${al}^\\circ$ und $b = ${q(bb, u)}$. Berechne $a$.`,
      figure: fig(aa, bb, 'a = ?', `b = ${de(bb)} ${u}`, 'c'),
      parts: [nm(`$a$ in ${u}`, aa, { tol: 0.02 })],
      solution: ['Gegenkathete $a$ und Ankathete $b$ von $\\alpha$ → Tangens.', `$\\tan\\alpha = \\frac{a}{b} \\iff a = b \\cdot \\tan\\alpha$`, `$a = ${q(bb, u)} \\cdot \\tan ${al}^\\circ ${eqs(aa)} ${q(r2(aa), u)}$`],
    };
  }
  const aa = rs(3, 12, 0.5);
  const cc = aa / sin(al);
  return {
    title: 'Hypotenuse berechnen',
    text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $\\alpha = ${al}^\\circ$ und $a = ${q(aa, u)}$. Berechne $c$.`,
    figure: fig(aa, aa / tan(al), `a = ${de(aa)} ${u}`, 'b', 'c = ?'),
    parts: [nm(`$c$ in ${u}`, cc, { tol: 0.02 })],
    solution: ['$a$ ist Gegenkathete von $\\alpha$, gesucht die Hypotenuse $c$ → Sinus.', `$\\sin\\alpha = \\frac{a}{c} \\iff c = \\frac{a}{\\sin\\alpha}$`, `$c = \\frac{${q(aa, u)}}{\\sin ${al}^\\circ} ${eqs(cc)} ${q(r2(cc), u)}$`],
  };
};

const winkelBerechnen: Gen = () => {
  const u = unit();
  const k = ri(0, 2);
  const a = rs(2, 12, 0.5);
  const b = rs(2, 12, 0.5);
  if (k === 0) {
    const al = Math.atan(a / b) / DEG;
    return {
      title: 'Winkel mit Tangens',
      text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $a = ${q(a, u)}$ und $b = ${q(b, u)}$. Berechne $\\alpha$ (auf zwei Dezimalen).`,
      figure: fig(a, b, `a = ${de(a)} ${u}`, `b = ${de(b)} ${u}`, 'c'),
      parts: [nm('$\\alpha$ in Grad', al, { tol: 0.02 })],
      solution: [`$\\tan\\alpha = \\frac{a}{b} = \\frac{${t(a)}}{${t(b)}}$`, `$\\alpha = \\tan^{-1}\\left(\\frac{${t(a)}}{${t(b)}}\\right) \\approx ${t(r2(al))}^\\circ$`],
    };
  }
  const c = Math.max(a, b) + rs(1, 6, 0.5);
  if (k === 1) {
    const al = Math.asin(a / c) / DEG;
    return {
      title: 'Winkel mit Sinus',
      text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $a = ${q(a, u)}$ und $c = ${q(c, u)}$. Berechne $\\alpha$ (auf zwei Dezimalen).`,
      figure: fig(a, Math.sqrt(c * c - a * a), `a = ${de(a)} ${u}`, 'b', `c = ${de(c)} ${u}`),
      parts: [nm('$\\alpha$ in Grad', al, { tol: 0.02 })],
      solution: [`$\\sin\\alpha = \\frac{a}{c} = \\frac{${t(a)}}{${t(c)}}$`, `$\\alpha = \\sin^{-1}\\left(\\frac{${t(a)}}{${t(c)}}\\right) \\approx ${t(r2(al))}^\\circ$`],
    };
  }
  const be = Math.acos(a / c) / DEG;
  return {
    title: 'Winkel mit Kosinus',
    text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$, $a = ${q(a, u)}$ und $c = ${q(c, u)}$. Berechne $\\beta$ (auf zwei Dezimalen).`,
    figure: fig(a, Math.sqrt(c * c - a * a), `a = ${de(a)} ${u}`, 'b', `c = ${de(c)} ${u}`),
    parts: [nm('$\\beta$ in Grad', be, { tol: 0.02 })],
    solution: ['Für $\\beta$ ist $a$ die Ankathete (liegt an $B$ an).', `$\\cos\\beta = \\frac{a}{c} = \\frac{${t(a)}}{${t(c)}}$`, `$\\beta = \\cos^{-1}\\left(\\frac{${t(a)}}{${t(c)}}\\right) \\approx ${t(r2(be))}^\\circ$`],
  };
};

const verhaeltnisWaehlen: Gen = () => {
  const items: [string, string][] = [
    ['\\sin\\alpha', '\\frac{a}{c}'],
    ['\\cos\\alpha', '\\frac{b}{c}'],
    ['\\tan\\alpha', '\\frac{a}{b}'],
    ['\\sin\\beta', '\\frac{b}{c}'],
    ['\\cos\\beta', '\\frac{a}{c}'],
    ['\\tan\\beta', '\\frac{b}{a}'],
  ];
  const [f, r] = pick(items);
  return {
    title: 'Seitenverhältnisse',
    text: `Im Dreieck $ABC$ ist $\\gamma = 90^\\circ$ (Seiten $a$, $b$, $c$ wie üblich gegenüber von $A$, $B$, $C$). Welches Seitenverhältnis ist $${f}$?`,
    figure: fig(4, 3, 'a', 'b', 'c'),
    parts: [ch(`$${f} =$`, `$${r}$`, ['$\\frac{a}{c}$', '$\\frac{b}{c}$', '$\\frac{a}{b}$', '$\\frac{b}{a}$', '$\\frac{c}{a}$'].filter((x) => x !== `$${r}$`).slice(0, 4))],
    solution: [
      '$\\sin = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}$, $\\cos = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}$, $\\tan = \\frac{\\text{Gegenkathete}}{\\text{Ankathete}}$',
      `Von ${f.includes('alpha') ? '$\\alpha$ (bei $A$): Gegenkathete $a$, Ankathete $b$' : '$\\beta$ (bei $B$): Gegenkathete $b$, Ankathete $a$'}, Hypotenuse $c$.`,
      `$${f} = ${r}$`,
    ],
  };
};

const leiter: Gen = () => {
  const l = rs(3, 8, 0.5);
  const al = ri(60, 78);
  const h = l * sin(al);
  const d = l * cos(al);
  return {
    title: 'Leiter an der Wand',
    badge: 'Anwendung',
    text: `Eine $${t(l)}$ m lange Leiter lehnt an einer Hauswand. Sie bildet mit dem Boden einen Winkel von $${al}^\\circ$.`,
    figure: <RightTriFig k1={d} k2={h} l1="Abstand" l2="Höhe" lh={`${de(l)} m`} />,
    parts: [nm('Höhe in m', h, { tol: 0.02, q: 'a) In welcher Höhe berührt die Leiter die Wand?' }), nm('Abstand in m', d, { tol: 0.02, q: 'b) Wie weit steht der Fuß der Leiter von der Wand entfernt?' })],
    solution: [
      `a) $h = ${t(l)} \\cdot \\sin ${al}^\\circ \\approx ${t(r2(h))}$ m`,
      `b) $d = ${t(l)} \\cdot \\cos ${al}^\\circ \\approx ${t(r2(d))}$ m`,
      `Probe mit Pythagoras: $${t(r2(h))}^2 + ${t(r2(d))}^2 \\approx ${t(r2(h * h + d * d))} \\approx ${t(l)}^2$`,
    ],
  };
};

const rampe: Gen = () => {
  const len = rs(4, 12, 0.5);
  const hcm = ri(30, 90);
  const al = Math.atan(hcm / 100 / len) / DEG;
  return {
    title: 'Steigungswinkel einer Rampe',
    badge: 'Anwendung',
    text: `Eine Rollstuhlrampe überwindet auf einer waagrechten Strecke von $${t(len)}$ m einen Höhenunterschied von $${hcm}$ cm. Berechne den Steigungswinkel.`,
    figure: <RightTriFig k1={len} k2={Math.max(hcm / 100, len / 6)} l1={`${de(len)} m`} l2={`${hcm} cm`} lh="Rampe" />,
    parts: [nm('Winkel in Grad', al, { tol: 0.02 })],
    solution: [`Einheiten angleichen: $${hcm}$ cm $= ${t(hcm / 100)}$ m`, `$\\tan\\alpha = \\frac{${t(hcm / 100)}}{${t(len)}}$`, `$\\alpha = \\tan^{-1}\\left(\\frac{${t(hcm / 100)}}{${t(len)}}\\right) \\approx ${t(r2(al))}^\\circ$`],
  };
};

const turmhoehe: Gen = () => {
  const d = ri(20, 80);
  const al = ri(25, 60);
  const aug = rs(1.5, 1.8, 0.1);
  const h = d * tan(al) + aug;
  return {
    title: 'Höhe eines Turms',
    badge: 'Anwendung',
    text: `Ein Beobachter steht $${d}$ m von einem Kirchturm entfernt und sieht die Turmspitze unter einem Höhenwinkel von $${al}^\\circ$. Seine Augen sind $${t(aug)}$ m über dem Boden. Wie hoch ist der Turm?`,
    figure: <RightTriFig k1={d} k2={d * tan(al)} l1={`${d} m`} l2="x" lh="Sichtlinie" />,
    parts: [nm('Höhe in m', h, { tol: 0.05 })],
    solution: [`$\\tan ${al}^\\circ = \\frac{x}{${d}} \\iff x = ${d} \\cdot \\tan ${al}^\\circ \\approx ${t(r2(d * tan(al)))}$ m`, `Turmhöhe: $${t(r2(d * tan(al)))} + ${t(aug)} \\approx ${t(r2(h))}$ m`],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'dreiecksarten',
    title: 'Dreiecksarten und Innenwinkelsumme',
    description: 'Gleichseitig, gleichschenklig, rechtwinklig entscheiden, Winkel berechnen',
    intro:
      '**Gleichseitig**: alle drei Seiten (und Winkel, je $60^\\circ$) gleich. **Gleichschenklig**: zwei Seiten (Schenkel) gleich lang, die Basiswinkel sind gleich groß. **Rechtwinklig**: ein Winkel ist $90^\\circ$ – das prüft man mit der Umkehrung des Satzes von Pythagoras: Gilt $a^2 + b^2 = c^2$ für die längste Seite $c$, ist das Dreieck rechtwinklig.\n\nIn jedem Dreieck gilt die **Innenwinkelsumme** $\\alpha + \\beta + \\gamma = 180^\\circ$.',
    formulas: ['\\alpha + \\beta + \\gamma = 180^\\circ', 'a^2 + b^2 = c^2'],
    example: {
      title: 'Rechtwinklig?',
      text: 'Seiten $6$ cm, $8$ cm, $10$ cm.',
      steps: ['$6^2 + 8^2 = 36 + 64 = 100 = 10^2$', 'Das Dreieck ist rechtwinklig (rechter Winkel gegenüber der $10$-cm-Seite).'],
    },
    gens: [seitenKlassifizieren, winkelsumme, gleichschenkligWinkel, winkelGleichseitig],
  },
  {
    slug: 'pythagoras',
    title: 'Satz des Pythagoras',
    description: 'Seitenlängen im rechtwinkligen Dreieck berechnen und Rechtwinkligkeit prüfen',
    intro:
      'Im rechtwinkligen Dreieck heißt die Seite gegenüber dem rechten Winkel **Hypotenuse** (längste Seite), die beiden anderen heißen **Katheten**. Es gilt: $\\text{Kathete}^2 + \\text{Kathete}^2 = \\text{Hypotenuse}^2$.\n\nGesucht ist die Hypotenuse → addieren und Wurzel ziehen. Gesucht ist eine Kathete → subtrahieren und Wurzel ziehen.',
    formulas: ['a^2 + b^2 = c^2', 'c = \\sqrt{a^2 + b^2}', 'a = \\sqrt{c^2 - b^2}'],
    gens: [...pageGens('berechnen'), ...pageGens('rechtwinklig-pruefen')],
    nBasic: 6,
    nApp: 0,
  },
  {
    slug: 'sinus-kosinus-tangens',
    title: 'Sinus, Kosinus und Tangens',
    description: 'Seiten und Winkel im rechtwinkligen Dreieck berechnen, Anwendungen',
    intro:
      'Im rechtwinkligen Dreieck hängen Winkel und Seitenverhältnisse zusammen. Vom Winkel aus gesehen: **Gegenkathete** liegt gegenüber, **Ankathete** liegt am Winkel an, die **Hypotenuse** liegt gegenüber dem rechten Winkel.\n\nSeite gesucht: passende Formel wählen und umstellen. Winkel gesucht: Verhältnis berechnen und mit $\\sin^{-1}$, $\\cos^{-1}$ bzw. $\\tan^{-1}$ (Taschenrechner im Gradmaß!) den Winkel bestimmen.',
    formulas: ['\\sin\\alpha = \\frac{a}{c}', '\\cos\\alpha = \\frac{b}{c}', '\\tan\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha} = \\frac{a}{b}'],
    example: {
      title: 'Seite berechnen',
      text: '$\\gamma = 90^\\circ$, $\\alpha = 35^\\circ$, $c = 8$ cm. Berechne $a$.',
      steps: ['$\\sin 35^\\circ = \\frac{a}{8\\,\\text{cm}}$', '$a = 8\\,\\text{cm} \\cdot \\sin 35^\\circ \\approx 4{,}59\\,\\text{cm}$'],
    },
    gens: [verhaeltnisWaehlen, seiteBerechnen, seiteBerechnen, winkelBerechnen],
    apps: [leiter, rampe, turmhoehe],
  },
];

export const lb5: TopicConfig = {
  slug: 'dreieckslehre',
  title: 'Dreieckslehre',
  description: 'Lernbereich 5: Dreiecksarten, Innenwinkelsumme, Pythagoras, Sinus, Kosinus und Tangens',
  icon: 'triangle',
  pages,
};
