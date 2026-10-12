import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { F, ch, chFixed, nm, pick, ri, round, t, name } from '../lib';
import Plot from '../Plot';

// Lernbereich 8: Exponentialfunktion und Logarithmus

const r = (x: number, d = 2) => round(x, d);
const ln = Math.log;

// ---------------------------------------------------------------------------
// Exponentielles Wachstum, Graphen
// ---------------------------------------------------------------------------

const linearOderExponentiell: Gen = () => {
  const kind = ri(0, 1);
  const x0 = ri(0, 1);
  const xs = [x0, x0 + 1, x0 + 2, x0 + 3, x0 + 4];
  let ys: number[];
  let why: string;
  if (kind === 0) {
    const s = pick([20, 50, 100, 200]);
    const d = pick([15, 30, 40, 60, -10, -20]);
    ys = xs.map((_, i) => s + d * i);
    why = `Die Differenz aufeinanderfolgender Werte ist konstant ($${d > 0 ? '+' : ''}${d}$) → **lineares** Wachstum.`;
  } else {
    const s = pick([100, 200, 400, 800, 1000]);
    const a = pick([2, 1.5, 0.5, 1.2, 0.8, 1.1]);
    ys = xs.map((_, i) => r(s * a ** i, 2));
    why = `Der Quotient aufeinanderfolgender Werte ist konstant ($\\frac{${t(ys[1])}}{${t(ys[0])}} = ${t(a)}$) → **exponentielles** Wachstum mit Faktor $${t(a)}$.`;
  }
  return {
    title: 'Linear oder exponentiell?',
    text: `Die Tabelle beschreibt einen Vorgang:\n$\\begin{array}{c|${'c'.repeat(5)}} x & ${xs.join(' & ')} \\\\ \\hline y & ${ys.map((y) => t(y)).join(' & ')} \\end{array}$`,
    parts: [chFixed('Es liegt vor:', ['lineares Wachstum bzw. lineare Abnahme', 'exponentielles Wachstum bzw. exponentielle Abnahme'], kind)],
    solution: ['Linear: gleiche **Differenzen**. Exponentiell: gleiche **Quotienten** (Faktoren).', why],
  };
};

const wachstumsfaktor: Gen = () => {
  const zu = Math.random() < 0.5;
  const pp = pick([2, 3, 4, 5, 8, 10, 12, 15, 20, 25]);
  const a = zu ? 1 + pp / 100 : 1 - pp / 100;
  if (Math.random() < 0.5) {
    return {
      title: 'Wachstumsfaktor',
      text: `Eine Größe ${zu ? 'nimmt' : 'nimmt'} pro Jahr um $${pp}\\,\\%$ ${zu ? 'zu' : 'ab'}. Wie lautet der Wachstumsfaktor $a$?`,
      parts: [nm('$a$', a, { tol: 0.0005 })],
      solution: [zu ? `Zunahme um $p\\,\\%$: $a = 1 + \\frac{p}{100}$` : `Abnahme um $p\\,\\%$: $a = 1 - \\frac{p}{100}$`, `$a = 1 ${zu ? '+' : '-'} ${t(pp / 100)} = ${t(a)}$`],
    };
  }
  return {
    title: 'Prozentsatz aus dem Faktor',
    text: `Ein Bestand wird durch $f(x) = 500 \\cdot ${t(a)}^x$ beschrieben ($x$ in Jahren). Um wie viel Prozent ${zu ? 'wächst' : 'sinkt'} er pro Jahr?`,
    parts: [nm('Prozentsatz in %', pp, { tol: 0.01 })],
    solution: [`$a = ${t(a)} ${zu ? '> 1' : '< 1'}$ → ${zu ? 'Wachstum' : 'Abnahme'}`, `$|a - 1| = ${t(Math.abs(a - 1))} = ${pp}\\,\\%$`],
  };
};

const expEigenschaften: Gen = () => {
  const b = pick([1, 2, 3, 0.5, 4, -1, -2]);
  const a = pick([2, 3, 0.5, 1.5, 0.25, 0.8]);
  const steigt = (a > 1) === (b > 0);
  const W = b > 0 ? '$W_f = ]0;\\,+\\infty[$' : '$W_f = ]-\\infty;\\,0[$';
  return {
    title: 'Eigenschaften der Exponentialfunktion',
    text: `Gegeben ist $f(x) = ${b === 1 ? '' : b === -1 ? '-' : `${t(b)} \\cdot `}${t(a)}^x$ mit $D_f = \\mathbb{R}$.`,
    figure: <Plot x={[-4, 4]} y={b > 0 ? [-1, 8] : [-8, 1]} curves={[{ f: (x) => b * a ** x, label: 'Gf' }]} />,
    parts: [
      nm('$y$-Achsenabschnitt', b, { tol: 0.001, q: 'a) Schnittpunkt mit der $y$-Achse: $f(0) = $' }),
      chFixed('b) Monotonie:', ['streng monoton steigend', 'streng monoton fallend'], steigt ? 0 : 1),
      ch('c) Wertemenge:', W, ['$W_f = ]0;\\,+\\infty[$', '$W_f = ]-\\infty;\\,0[$', '$W_f = \\mathbb{R}$', `$W_f = [${t(b)};\\,+\\infty[$`].filter((x) => x !== W).slice(0, 3)),
    ],
    solution: [
      `a) $f(0) = ${t(b)} \\cdot ${t(a)}^0 = ${t(b)}$ (da $a^0 = 1$)`,
      `b) $a = ${t(a)} ${a > 1 ? '> 1' : '< 1'}$ und $b ${b > 0 ? '> 0' : '< 0'}$ → ${steigt ? 'steigend' : 'fallend'}`,
      `c) Die $x$-Achse ($y = 0$) ist waagrechte Asymptote, der Graph liegt ${b > 0 ? 'oberhalb' : 'unterhalb'} davon: ${W}`,
    ],
  };
};

const expAusGraph: Gen = () => {
  const b = pick([1, 2, 3, 4]);
  const a = pick([2, 3, 0.5]);
  const f = (x: number) => b * a ** x;
  return {
    title: 'Funktionsterm aus dem Graphen',
    text: 'Der Graph gehört zu $f(x) = b \\cdot a^x$. Bestimme $b$ und $a$ mithilfe der markierten Punkte.',
    figure: <Plot x={[-3, 3]} y={[-1, 9]} curves={[{ f, label: 'Gf' }]} points={[{ x: 0, y: b, label: `(0|${b})` }, { x: 1, y: f(1), label: `(1|${String(f(1)).replace('.', ',')})` }]} />,
    parts: [nm('$b$', b, { tol: 0.001 }), nm('$a$', a, { tol: 0.001 })],
    solution: [`$f(0) = b = ${b}$`, `$f(1) = b \\cdot a = ${t(f(1))} \\iff a = \\frac{${t(f(1))}}{${b}} = ${t(a)}$`, `$f(x) = ${b === 1 ? '' : `${b} \\cdot `}${t(a)}^x$`],
  };
};

const funktionswertExp: Gen = () => {
  const b = pick([50, 100, 200, 250, 400]);
  const a = pick([1.05, 1.1, 1.2, 0.9, 0.85, 1.5]);
  const x = ri(2, 8);
  return {
    title: 'Funktionswert berechnen',
    text: `Berechne $f(${x})$ für $f(x) = ${b} \\cdot ${t(a)}^x$ (auf zwei Dezimalen).`,
    parts: [nm(`$f(${x})$`, b * a ** x, { tol: 0.011 })],
    solution: [`$f(${x}) = ${b} \\cdot ${t(a)}^{${x}} \\approx ${t(r(b * a ** x))}$`],
  };
};

// ---------------------------------------------------------------------------
// Logarithmus
// ---------------------------------------------------------------------------

const logWert: Gen = () => {
  const items: [string, number, string][] = [];
  const base = pick([2, 3, 4, 5, 10]);
  const e = ri(-3, 4);
  const val = F(base ** Math.max(e, 0), base ** Math.max(-e, 0));
  items.push([`\\log_{${base}} ${val.d === 1 ? val.n : `\\frac{1}{${val.d}}`}`, e, `$${base}^{${e}} = ${val.tex()}$`]);
  items.push([`\\log_{${base * base}} ${base}`, 0.5, `$${base * base}^{\\frac{1}{2}} = \\sqrt{${base * base}} = ${base}$`]);
  items.push([`\\log_{${base}} 1`, 0, `$${base}^0 = 1$`]);
  items.push([`\\log_{${base}} ${base}`, 1, `$${base}^1 = ${base}$`]);
  const [term, res, why] = items[Math.random() < 0.7 ? 0 : ri(1, 3)];
  return {
    title: 'Logarithmen berechnen',
    text: `Berechne ohne Taschenrechner: $${term}$`,
    parts: [nm('Ergebnis', res, { tol: 0.001 })],
    solution: ['$\\log_b a = z \\iff b^z = a$: Gesucht ist der Exponent.', `${why}, also $${term} = ${t(res)}$`],
  };
};

const logGesetze: Gen = () => {
  const b = pick([2, 3, 10]);
  const k = ri(0, 2);
  if (k === 0) {
    const u = b ** ri(1, 3);
    const v = b ** ri(1, 3);
    const s = ln(u * v) / ln(b);
    return {
      title: 'Logarithmusgesetze anwenden',
      text: `Berechne geschickt: $\\log_{${b}} ${u} + \\log_{${b}} ${v}$`,
      parts: [nm('Ergebnis', Math.round(s), { integer: true })],
      solution: [`$\\log_b u + \\log_b v = \\log_b (u \\cdot v)$`, `$\\log_{${b}} (${u} \\cdot ${v}) = \\log_{${b}} ${u * v} = ${Math.round(s)}$`],
    };
  }
  if (k === 1) {
    const e1 = ri(3, 6);
    const e2 = ri(1, e1 - 1);
    return {
      title: 'Logarithmusgesetze anwenden',
      text: `Berechne geschickt: $\\log_{${b}} ${b ** e1} - \\log_{${b}} ${b ** e2}$`,
      parts: [nm('Ergebnis', e1 - e2, { integer: true })],
      solution: [`$\\log_b u - \\log_b v = \\log_b \\frac{u}{v}$`, `$\\log_{${b}} \\frac{${b ** e1}}{${b ** e2}} = \\log_{${b}} ${b ** (e1 - e2)} = ${e1 - e2}$`],
    };
  }
  const z = ri(2, 5);
  const items: [string, string, string[]][] = [
    [`\\log_{${b}} (x^{${z}})`, `${z} \\cdot \\log_{${b}} x`, [`(\\log_{${b}} x)^{${z}}`, `\\log_{${b}} ${z} \\cdot x`, `\\log_{${b}} x + ${z}`]],
    [`\\log_{${b}} (u \\cdot v)`, `\\log_{${b}} u + \\log_{${b}} v`, [`\\log_{${b}} u \\cdot \\log_{${b}} v`, `\\log_{${b}} u - \\log_{${b}} v`, `${b}^{u + v}`]],
    [`\\log_{${b}} \\frac{u}{v}`, `\\log_{${b}} u - \\log_{${b}} v`, [`\\frac{\\log_{${b}} u}{\\log_{${b}} v}`, `\\log_{${b}} u + \\log_{${b}} v`, `\\log_{${b}} (u - v)`]],
  ];
  const [l, right, wrong] = pick(items);
  return {
    title: 'Logarithmusgesetze',
    text: `Welcher Term ist gleich $${l}$ (für $u, v, x > 0$)?`,
    parts: [ch('Gleichwertig:', `$${right}$`, wrong.map((w) => `$${w}$`))],
    solution: ['Merkhilfe: $\\log_b(uv) = \\log_b u + \\log_b v$, $\\; \\log_b \\frac{u}{v} = \\log_b u - \\log_b v$, $\\; \\log_b u^z = z \\cdot \\log_b u$', `$${l} = ${right}$`],
  };
};

const expGleichungExakt: Gen = () => {
  const a = pick([2, 3, 4, 5]);
  const e = ri(-2, 5);
  const c = F(a ** Math.max(e, 0), a ** Math.max(-e, 0));
  let k = ri(-3, 3);
  while (k === 0) k = ri(-3, 3);
  // a^(x + k) = c → x = e − k
  return {
    title: 'Exponentialgleichung (ohne Taschenrechner)',
    text: `Löse: $${a}^{x ${k ? (k > 0 ? `+ ${k}` : `- ${-k}`) : ''}} = ${c.tex()}$`,
    parts: [nm('$x$', e - k, { integer: true })],
    solution: [`$${c.tex()}$ als Potenz von $${a}$ schreiben: $${c.tex()} = ${a}^{${e}}$`, `Exponentenvergleich: $x ${k ? (k > 0 ? `+ ${k}` : `- ${-k}`) : ''} = ${e} \\iff x = ${e - k}$`],
  };
};

const expGleichungLog: Gen = () => {
  const b = pick([2, 3, 5, 100, 200, 50]);
  const a = pick([1.05, 1.2, 1.5, 2, 3, 0.8, 0.5]);
  let c: number;
  do c = pick([3, 5, 7, 10, 12, 20, 40, 150, 500, 1000, 0.5, 30]) * (b >= 50 ? 10 : 1);
  while ((c / b > 1) !== (a > 1) || c === b);
  const x = ln(c / b) / ln(a);
  return {
    title: 'Exponentialgleichung mit Logarithmus',
    text: `Löse ($x$ auf zwei Dezimalen): $${b} \\cdot ${t(a)}^x = ${t(c)}$`,
    parts: [nm('$x$', x, { tol: 0.011 })],
    solution: [
      `$${b} \\cdot ${t(a)}^x = ${t(c)} \\qquad | : ${b}$`,
      `$${t(a)}^x = ${t(r(c / b, 4), 4)} \\qquad | \\log$`,
      `$x = \\log_{${t(a)}} ${t(r(c / b, 4), 4)} = \\frac{\\lg ${t(r(c / b, 4), 4)}}{\\lg ${t(a)}} \\approx ${t(r(x))}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Modellierung
// ---------------------------------------------------------------------------

const bevoelkerung: Gen = () => {
  const N0 = pick([12000, 25000, 48000, 80000, 150000]);
  const p = pick([1.5, 2, 2.5, 3, 4]);
  const a = 1 + p / 100;
  const n = ri(5, 15);
  const ziel = N0 * pick([1.5, 2]);
  const tz = ln(ziel / N0) / ln(a);
  const ort = pick(['Eine Kleinstadt', 'Ein Ort', 'Eine Gemeinde']);
  return {
    title: 'Bevölkerungswachstum',
    badge: 'Anwendung',
    text: `${ort} hat $${t(N0)}$ Einwohner. Die Einwohnerzahl wächst jährlich um $${t(p)}\\,\\%$.`,
    parts: [
      nm(`Einwohner nach ${n} Jahren`, N0 * a ** n, { tol: 1, q: `a) Wie viele Einwohner sind es voraussichtlich nach $${n}$ Jahren (gerundet)?` }),
      nm('Jahre', tz, { tol: 0.011, q: `b) Nach wie vielen Jahren werden es $${t(ziel)}$ Einwohner sein (auf zwei Dezimalen)?` }),
    ],
    solution: [
      `$N(t) = ${t(N0)} \\cdot ${t(a)}^t$ ($t$ in Jahren)`,
      `a) $N(${n}) = ${t(N0)} \\cdot ${t(a)}^{${n}} \\approx ${t(Math.round(N0 * a ** n))}$`,
      `b) $${t(N0)} \\cdot ${t(a)}^t = ${t(ziel)} \\iff ${t(a)}^t = ${t(ziel / N0)} \\iff t = \\frac{\\lg ${t(ziel / N0)}}{\\lg ${t(a)}} \\approx ${t(r(tz))}$`,
    ],
  };
};

const zerfall: Gen = () => {
  const N0 = pick([100, 200, 500, 800]);
  const p = pick([5, 8, 10, 12, 15, 20]);
  const a = 1 - p / 100;
  const th = ln(0.5) / ln(a);
  const stoff = pick(['Ein Medikament wird im Körper abgebaut', 'Ein radioaktiver Stoff zerfällt', 'Koffein wird im Blut abgebaut']);
  const n = ri(2, 6);
  return {
    title: 'Exponentielle Abnahme',
    badge: 'Anwendung',
    text: `${stoff}: Pro Stunde nimmt die Menge um $${p}\\,\\%$ ab. Anfangs sind $${N0}$ mg vorhanden.`,
    figure: <Plot x={[0, 12]} y={[0, N0 * 1.1]} step={2} ystep={N0 >= 500 ? 100 : 50} xl="t" yl="m" curves={[{ f: (x) => N0 * a ** x, label: 'm(t)', from: 0 }]} />,
    parts: [
      nm('Menge in mg', N0 * a ** n, { tol: 0.011, q: `a) Wie viel ist nach $${n}$ Stunden noch vorhanden?` }),
      nm('Halbwertszeit in h', th, { tol: 0.011, q: 'b) Berechne die Halbwertszeit (auf zwei Dezimalen).' }),
    ],
    solution: [
      `$m(t) = ${N0} \\cdot ${t(a)}^t$`,
      `a) $m(${n}) = ${N0} \\cdot ${t(a)}^{${n}} \\approx ${t(r(N0 * a ** n))}$ mg`,
      `b) Halbwertszeit: $${t(a)}^t = 0{,}5 \\iff t = \\frac{\\lg 0{,}5}{\\lg ${t(a)}} \\approx ${t(r(th))}$ h`,
    ],
  };
};

const faktorAusZweiWerten: Gen = () => {
  const N0 = pick([200, 400, 500, 1000]);
  const a = pick([1.1, 1.2, 1.25, 0.8, 0.9, 1.5]);
  const k = pick([2, 3, 4]);
  const Nk = r(N0 * a ** k, 2);
  const nm1 = name();
  return {
    title: 'Wachstumsfaktor aus zwei Werten',
    badge: 'Anwendung',
    text: `${nm1} beobachtet eine Bakterienkultur: Zu Beginn sind es $${N0}$ Bakterien, nach $${k}$ Stunden $${t(Nk)}$. Das Wachstum ist exponentiell: $N(t) = ${N0} \\cdot a^t$.`,
    parts: [nm('$a$', a, { tol: 0.002 }), nm('Änderung pro Stunde in %', (a - 1) * 100, { tol: 0.2, q: 'Um wie viel Prozent ändert sich die Anzahl pro Stunde? (Abnahme negativ)' })],
    solution: [
      `$${N0} \\cdot a^{${k}} = ${t(Nk)} \\iff a^{${k}} = ${t(r(Nk / N0, 4), 4)}$`,
      `$a = \\sqrt[${k}]{${t(r(Nk / N0, 4), 4)}} \\approx ${t(a)}$`,
      `$a - 1 = ${t(r(a - 1, 2))}$ → ${a > 1 ? 'Zunahme' : 'Abnahme'} um $${t(Math.abs(r((a - 1) * 100, 1)))}\\,\\%$ pro Stunde`,
    ],
  };
};

const linearVsExp: Gen = () => {
  const K = pick([1000, 2000, 5000]);
  const p = pick([3, 4, 5]);
  const add = Math.round((K * p) / 100 * pick([1.2, 1.3, 1.5]));
  const a = 1 + p / 100;
  let n = 1;
  while (K * a ** n <= K + add * n) n++;
  return {
    title: 'Linear oder exponentiell anlegen?',
    badge: 'Anwendung',
    text: `${name()} legt $${t(K)}$ € an. Angebot A: Jedes Jahr kommen $${add}$ € dazu (linear). Angebot B: $${p}\\,\\%$ Zinsen pro Jahr mit Zinseszins (exponentiell). Ab welchem ganzen Jahr ist Angebot B besser?`,
    figure: (
      <Plot
        x={[0, Math.max(10, n + 4)]}
        y={[K * 0.95, K + add * (n + 5)]}
        step={Math.max(10, n + 4) > 20 ? 5 : 2}
        ystep={K >= 5000 ? 500 : 250}
        xl="n"
        yl="€"
        curves={[{ f: (x) => K + add * x, label: 'A' }, { f: (x) => K * a ** x, label: 'B' }]}
      />
    ),
    parts: [nm('Jahr', n, { integer: true })],
    solution: [
      `A: $K_A(n) = ${t(K)} + ${add}n$, B: $K_B(n) = ${t(K)} \\cdot ${t(a)}^n$`,
      `Werte vergleichen (Tabelle mit dem Taschenrechner): $K_A(${n - 1}) = ${t(K + add * (n - 1))}$, $K_B(${n - 1}) \\approx ${t(r(K * a ** (n - 1)))}$`,
      `$K_A(${n}) = ${t(K + add * n)}$, $K_B(${n}) \\approx ${t(r(K * a ** n))}$`,
      `Ab dem ${n}. Jahr ist B besser – exponentielles Wachstum überholt lineares Wachstum langfristig immer.`,
    ],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'exponentialfunktion',
    title: 'Exponentielles Wachstum und Exponentialfunktion',
    description: 'Linear oder exponentiell, Wachstumsfaktor, Graph und Eigenschaften von b · aˣ',
    intro:
      'Bei **linearem** Wachstum kommt pro Schritt immer **derselbe Betrag** hinzu, bei **exponentiellem** Wachstum wird pro Schritt mit **demselben Faktor** $a$ multipliziert. Eine Zunahme um $p\\,\\%$ bedeutet $a = 1 + \\frac{p}{100}$, eine Abnahme $a = 1 - \\frac{p}{100}$.\n\nFür $f(x) = b \\cdot a^x$ ($a > 0$, $a \\neq 1$) gilt: Der Graph schneidet die $y$-Achse in $(0 \\mid b)$, die $x$-Achse ist **waagrechte Asymptote**, es gibt keine Nullstelle. Für $b > 0$ ist $W_f = ]0;\\,+\\infty[$; der Graph steigt für $a > 1$ und fällt für $0 < a < 1$.',
    formulas: ['f(x) = b \\cdot a^x', 'a = 1 \\pm \\frac{p}{100}', 'a^0 = 1, \\quad a^{-x} = \\frac{1}{a^x}'],
    example: {
      title: 'Wachstumsfaktor',
      text: 'Ein Kapital von $500$ € wächst jährlich um $4\\,\\%$.',
      steps: ['$a = 1 + 0{,}04 = 1{,}04$', '$K(x) = 500 \\cdot 1{,}04^x$', '$K(10) = 500 \\cdot 1{,}04^{10} \\approx 740{,}12$ €'],
    },
    gens: [linearOderExponentiell, wachstumsfaktor, expEigenschaften, expAusGraph, funktionswertExp],
  },
  {
    slug: 'logarithmus',
    title: 'Logarithmus und Exponentialgleichungen',
    description: 'Logarithmen berechnen, Logarithmusgesetze, Exponentialgleichungen lösen',
    intro:
      'Der **Logarithmus** $\\log_b a$ ist der Exponent, mit dem man $b$ potenzieren muss, um $a$ zu erhalten: $\\log_b a = z \\iff b^z = a$. Beispiel: $\\log_2 8 = 3$, weil $2^3 = 8$.\n\n**Exponentialgleichungen** $a^x = c$: Lässt sich $c$ als Potenz von $a$ schreiben, vergleicht man die Exponenten. Sonst logarithmiert man: $x = \\log_a c = \\frac{\\lg c}{\\lg a}$ (Basiswechsel mit dem Taschenrechner).',
    formulas: ['\\log_b a = z \\iff b^z = a', '\\log_b(uv) = \\log_b u + \\log_b v', '\\log_b \\frac{u}{v} = \\log_b u - \\log_b v', '\\log_b u^z = z \\cdot \\log_b u', '\\log_c a = \\frac{\\log_b a}{\\log_b c}'],
    example: {
      title: 'Exponentialgleichung',
      text: 'Löse $3 \\cdot 2^x = 30$.',
      steps: ['$2^x = 10 \\qquad | \\log$', '$x = \\log_2 10 = \\frac{\\lg 10}{\\lg 2} \\approx 3{,}32$'],
    },
    gens: [logWert, logGesetze, expGleichungExakt, expGleichungLog],
  },
  {
    slug: 'modellierung',
    title: 'Wachstums- und Zerfallsprozesse',
    description: 'Modelle aufstellen, Vorhersagen treffen, Halbwertszeit, Faktor aus zwei Werten',
    intro:
      'Ein exponentieller Prozess mit Anfangswert $N_0$ und Faktor $a$ pro Zeiteinheit wird durch $N(t) = N_0 \\cdot a^t$ beschrieben. **Vorhersage**: $t$ einsetzen. **Zeitpunkt gesucht**: Gleichung $N_0 \\cdot a^t = N$ mit dem Logarithmus lösen.\n\nDie **Halbwertszeit** ist die Zeit, nach der nur noch die Hälfte vorhanden ist ($a^t = 0{,}5$), die **Verdopplungszeit** die Zeit bis zum Doppelten ($a^t = 2$). Kennt man zwei Werte, erhält man $a$ durch Wurzelziehen.',
    formulas: ['N(t) = N_0 \\cdot a^t', 'a^t = 0{,}5 \\;\\Rightarrow\\; t_{1/2} = \\frac{\\lg 0{,}5}{\\lg a}'],
    example: {
      title: 'Verdopplungszeit',
      text: 'Ein Bestand wächst um $5\\,\\%$ pro Jahr. Wann hat er sich verdoppelt?',
      steps: ['$1{,}05^t = 2$', '$t = \\frac{\\lg 2}{\\lg 1{,}05} \\approx 14{,}21$ Jahre'],
    },
    gens: [bevoelkerung, zerfall, faktorAusZweiWerten, linearVsExp],
    nBasic: 4,
  },
];

export const lb8: TopicConfig = {
  slug: 'exponentialfunktion',
  title: 'Exponentialfunktion und Logarithmus',
  description: 'Lernbereich 8: exponentielles Wachstum, Graphen, Logarithmus, Exponentialgleichungen, Modellierung',
  icon: 'growth',
  pages,
};
