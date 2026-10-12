import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { F, Fr, ch, chFixed, nm, pick, ri, setTex, shuffle, t, name } from '../lib';
import Tree, { type TNode } from '../Tree';

// Lernbereich 7: Daten und Zufall, Wahrscheinlichkeit

/** Wahrscheinlichkeit als Eingabe: Bruch oder Dezimalzahl (3 Nachkommastellen) */
const pr = (label: string, v: Fr | number, q?: string) =>
  nm(label, v, { tol: 0.0011, ...(q ? { q } : {}) });
const frs = (f: Fr) => f.text();
const dec = (x: number) => t(Math.round(x * 10000) / 10000, 4);
const PHINT = '(als Bruch, z. B. 3/8, oder als Dezimalzahl auf drei Nachkommastellen)';

// ---------------------------------------------------------------------------
// Zufallsexperimente, Ergebnisraum, Ereignisse
// ---------------------------------------------------------------------------

const SITUATIONS: [string, boolean, string][] = [
  ['Eine Münze wird geworfen und man notiert Kopf oder Zahl.', true, 'Mehrere mögliche Ergebnisse, nicht vorhersagbar.'],
  ['Die Länge eines Tisches wird mit einem Maßband gemessen.', false, 'Das Ergebnis steht fest – kein Zufall.'],
  ['Aus einer Lostrommel wird ein Los gezogen.', true, 'Welches Los kommt, ist nicht vorhersagbar.'],
  ['Man berechnet das Produkt $3 \\cdot 7$.', false, 'Das Ergebnis ist eindeutig $21$.'],
  ['Ein Glücksrad mit vier Feldern wird gedreht.', true, 'Mögliche Ergebnisse bekannt, Ausgang zufällig.'],
  ['Ein Schüler wird für ein Interview zufällig aus der Klasse ausgewählt.', true, 'Zufällige Auswahl unter bekannten Möglichkeiten.'],
  ['Man liest an einer Uhr die aktuelle Uhrzeit ab.', false, 'Das ist eine Messung, kein Zufallsexperiment.'],
  ['Ein Würfel wird zweimal geworfen und die Augensumme notiert.', true, 'Ergebnisse $2$ bis $12$ möglich, Ausgang zufällig.'],
  ['Ein Ball wird aus $2$ m Höhe fallen gelassen; man notiert, ob er nach unten fällt.', false, 'Das Ergebnis ist sicher.'],
];

const istZufallsexperiment: Gen = () => {
  const [s, v, why] = pick(SITUATIONS);
  return {
    title: 'Zufallsexperiment?',
    text: s,
    parts: [chFixed('Handelt es sich um ein Zufallsexperiment?', ['ja', 'nein'], v ? 0 : 1)],
    solution: ['Ein **Zufallsexperiment** hat mehrere mögliche, vorher bekannte Ergebnisse; welches eintritt, ist nicht vorhersagbar, und es ist (beliebig oft) wiederholbar.', why],
  };
};

const ergebnisraumAnzahl: Gen = () => {
  const items: [string, number, string][] = [
    ['Eine Münze wird dreimal geworfen.', 8, '$2 \\cdot 2 \\cdot 2 = 8$, z. B. $\\Omega = \\{KKK; KKZ; \\ldots; ZZZ\\}$'],
    ['Ein Würfel wird zweimal geworfen (Reihenfolge wird notiert).', 36, '$6 \\cdot 6 = 36$'],
    ['Eine Münze und ein Würfel werden gleichzeitig geworfen.', 12, '$2 \\cdot 6 = 12$'],
    ['Aus einer Urne mit einer roten, einer blauen und einer grünen Kugel wird zweimal **mit** Zurücklegen gezogen.', 9, '$3 \\cdot 3 = 9$'],
    ['Aus einer Urne mit den Kugeln 1, 2, 3, 4 wird zweimal **ohne** Zurücklegen gezogen.', 12, '$4 \\cdot 3 = 12$ (beim 2. Zug ist eine Kugel weniger da)'],
    ['Bei einem Test werden drei Ja/Nein-Fragen zufällig angekreuzt.', 8, '$2 \\cdot 2 \\cdot 2 = 8$'],
    ['Eine Münze wird viermal geworfen.', 16, '$2^4 = 16$'],
    ['Aus den Buchstaben A, B, C, D, E wird zweimal ohne Zurücklegen gezogen.', 20, '$5 \\cdot 4 = 20$'],
  ];
  const [s, n, why] = pick(items);
  return {
    title: 'Mächtigkeit des Ergebnisraums',
    text: `${s} Wie viele Ergebnisse hat der Ergebnisraum $\\Omega$?`,
    parts: [nm('$|\\Omega|$', n, { integer: true })],
    solution: ['Im Baumdiagramm: Anzahl der Äste je Stufe multiplizieren (Zählprinzip).', why],
  };
};

const EVENTS: [string, (x: number) => boolean][] = [
  ['Die Augenzahl ist gerade.', (x) => x % 2 === 0],
  ['Die Augenzahl ist eine Primzahl.', (x) => [2, 3, 5, 7, 11].includes(x)],
  ['Die Augenzahl ist durch 3 teilbar.', (x) => x % 3 === 0],
  ['Die Augenzahl ist ungerade.', (x) => x % 2 === 1],
];

const ereignisMenge: Gen = () => {
  const n = pick([6, 8, 10, 12]);
  const Om = Array.from({ length: n }, (_, i) => i + 1);
  const k = ri(2, n - 2);
  const evs: [string, (x: number) => boolean][] = [
    ...EVENTS,
    [`Die Augenzahl ist größer als ${k}.`, (x) => x > k],
    [`Die Augenzahl ist höchstens ${k}.`, (x) => x <= k],
  ];
  const [txt, f] = pick(evs);
  const A = Om.filter(f);
  const comp = Om.filter((x) => !f(x));
  return {
    title: 'Ereignis als Teilmenge',
    text: `Ein Würfel mit den Augenzahlen $1$ bis $${n}$ wird einmal geworfen, $\\Omega = \\{1; 2; \\ldots; ${n}\\}$.\nEreignis $A$: „${txt}“`,
    parts: [
      ch('$A =$', `$${setTex(A)}$`, [`$${setTex(comp)}$`, `$${setTex(A.slice(1))}$`, `$${setTex([...A, A[A.length - 1] + 1].filter((x) => x <= n + 1))}$`]),
      ch('Gegenereignis $\\overline{A} =$', `$${setTex(comp)}$`, [`$${setTex(A)}$`, `$${setTex(comp.slice(1))}$`, '$\\{\\,\\}$']),
    ],
    solution: [`Alle Ergebnisse aus $\\Omega$, die die Bedingung erfüllen: $A = ${setTex(A)}$`, `$\\overline{A} = \\Omega \\setminus A = ${setTex(comp)}$`],
  };
};

const ereignisAlgebra: Gen = () => {
  for (;;) {
    const n = pick([10, 12]);
    const Om = Array.from({ length: n }, (_, i) => i + 1);
    const [e1, e2] = shuffle(EVENTS).slice(0, 2);
    const k = ri(3, n - 3);
    const ev2: [string, (x: number) => boolean] = Math.random() < 0.5 ? e2 : [`Die Zahl ist größer als ${k}.`, (x) => x > k];
    const A = Om.filter(e1[1]);
    const B = Om.filter(ev2[1]);
    const ops: [string, number[], string][] = [
      ['A \\cap B', A.filter((x) => B.includes(x)), '$A$ **und** $B$ treten ein'],
      ['A \\cup B', Om.filter((x) => A.includes(x) || B.includes(x)), '$A$ **oder** $B$ (oder beide) treten ein'],
      ['\\overline{A} \\cap B', B.filter((x) => !A.includes(x)), '$A$ tritt **nicht** ein, aber $B$'],
      ['\\overline{A \\cup B}', Om.filter((x) => !A.includes(x) && !B.includes(x)), '**weder** $A$ **noch** $B$ treten ein'],
    ];
    const [op, R, why] = pick(ops);
    const wrong = ops.filter((o) => o[0] !== op).map((o) => `$${setTex(o[1])}$`);
    if (new Set([setTex(R), ...ops.filter((o) => o[0] !== op).map((o) => setTex(o[1]))]).size < 3) continue;
    return {
      title: 'Ereignisse verknüpfen',
      text: `Aus Losen mit den Nummern $1$ bis $${n}$ wird eines gezogen.\n$A$: „${e1[0].replace('Augenzahl', 'Zahl')}“ $\\quad$ $B$: „${ev2[0].replace('Augenzahl', 'Zahl')}“\nGib $${op}$ als Menge an.`,
      parts: [ch(`$${op} =$`, `$${setTex(R)}$`, wrong)],
      solution: [`$A = ${setTex(A)}$, $\\; B = ${setTex(B)}$`, `$${op}$: ${why}.`, `$${op} = ${setTex(R)}$`],
    };
  }
};

const verbalAlgebra: Gen = () => {
  const items: [string, string][] = [
    ['Es treten **beide** Ereignisse ein.', 'A \\cap B'],
    ['Es tritt **mindestens eines** der beiden Ereignisse ein.', 'A \\cup B'],
    ['Es tritt **keines** der beiden Ereignisse ein.', '\\overline{A} \\cap \\overline{B}'],
    ['Es tritt **höchstens eines** der beiden Ereignisse ein.', '\\overline{A} \\cup \\overline{B}'],
    ['Es tritt **nur** $A$ ein.', 'A \\cap \\overline{B}'],
    ['Es tritt **genau eines** der beiden Ereignisse ein.', '(A \\cap \\overline{B}) \\cup (\\overline{A} \\cap B)'],
  ];
  const ctx = pick([
    ['Lena besteht die Mathe-Prüfung.', 'Lena besteht die Deutsch-Prüfung.'],
    ['Der Bus ist pünktlich.', 'Die Bahn ist pünktlich.'],
    ['Beim ersten Wurf fällt eine Sechs.', 'Beim zweiten Wurf fällt eine Sechs.'],
  ]);
  const [s, r] = pick(items);
  return {
    title: 'Ereignisse in Mengenschreibweise',
    text: `$A$: „${ctx[0]}“ $\\quad$ $B$: „${ctx[1]}“\n${s}`,
    parts: [ch('Passende Schreibweise:', `$${r}$`, shuffle(items.map((i) => `$${i[1]}$`).filter((x) => x !== `$${r}$`)).slice(0, 3))],
    solution: [
      '$\\cap$: „und“, $\\cup$: „oder“ (mindestens eines), $\\overline{A}$: „nicht $A$“',
      'De Morgan: $\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}$ und $\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}$',
      `Hier: $${r}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Häufigkeiten
// ---------------------------------------------------------------------------

const wuerfelHaeufigkeit: Gen = () => {
  const n = pick([20, 25, 40, 50]);
  const data = Array.from({ length: n }, () => ri(1, 6));
  const k = ri(1, 6);
  const hk = data.filter((x) => x === k).length;
  const hg = data.filter((x) => x % 2 === 0).length;
  return {
    title: 'Absolute und relative Häufigkeit',
    text: `Ein Würfel wurde $${n}$-mal geworfen:\n${data.join(', ')}`,
    parts: [
      nm(`$H(${k})$`, hk, { integer: true, q: `a) Absolute Häufigkeit der Augenzahl $${k}$` }),
      nm(`$h(\\text{gerade})$`, hg / n, { tol: 0.0011, q: 'b) Relative Häufigkeit des Ereignisses „gerade Augenzahl“ (als Dezimalzahl)' }),
    ],
    solution: [
      `a) Die $${k}$ kommt $${hk}$-mal vor: $H(${k}) = ${hk}$`,
      `b) Gerade Augenzahlen ($2$, $4$, $6$) kommen $${hg}$-mal vor.`,
      `$h = \\frac{\\text{absolute Häufigkeit}}{\\text{Anzahl Versuche}} = \\frac{${hg}}{${n}} = ${dec(hg / n)}$`,
    ],
  };
};

const umfrageHaeufigkeit: Gen = () => {
  const n = pick([20, 25, 40, 50]);
  const cats = ['Bus', 'Fahrrad', 'zu Fuß', 'Auto'];
  const cuts = shuffle(Array.from({ length: n - 1 }, (_, i) => i + 1)).slice(0, 3).sort((a, b) => a - b);
  const counts = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], n - cuts[2]];
  const i = ri(0, 3);
  return {
    title: 'Relative Häufigkeit in Prozent',
    badge: 'Anwendung',
    text: `${n} Schülerinnen und Schüler wurden gefragt, wie sie zur Schule kommen:\n${cats.map((c, j) => `${c}: ${counts[j]}`).join(' · ')}`,
    parts: [nm(`Anteil „${cats[i]}“ in %`, (counts[i] / n) * 100, { tol: 0.06 })],
    solution: [`$h(\\text{${cats[i]}}) = \\frac{${counts[i]}}{${n}} = ${dec(counts[i] / n)} = ${t((counts[i] / n) * 100, 2)}\\,\\%$`, 'Die relativen Häufigkeiten aller Kategorien ergeben zusammen $1$ bzw. $100\\,\\%$.'],
  };
};

// ---------------------------------------------------------------------------
// Laplace
// ---------------------------------------------------------------------------

const laplaceWuerfel: Gen = () => {
  const k = ri(2, 5);
  const evs: [string, number[]][] = [
    ['eine gerade Augenzahl', [2, 4, 6]],
    ['eine Primzahl', [2, 3, 5]],
    [`eine Augenzahl größer als ${k}`, [1, 2, 3, 4, 5, 6].filter((x) => x > k)],
    ['eine durch 3 teilbare Augenzahl', [3, 6]],
    [`höchstens eine ${k}`, [1, 2, 3, 4, 5, 6].filter((x) => x <= k)],
  ];
  const [s, A] = pick(evs);
  const P = F(A.length, 6);
  return {
    title: 'Laplace-Wahrscheinlichkeit',
    text: `Ein fairer Würfel wird einmal geworfen. Wie groß ist die Wahrscheinlichkeit für ${s}? ${PHINT}`,
    parts: [pr('$P(A)$', P)],
    solution: ['Laplace-Experiment: alle Ergebnisse gleich wahrscheinlich, $P(A) = \\frac{|A|}{|\\Omega|}$', `$A = ${setTex(A)}$, $|A| = ${A.length}$, $|\\Omega| = 6$`, `$P(A) = \\frac{${A.length}}{6} = ${P.tex()}$`],
  };
};

const augensumme: Gen = () => {
  const s = ri(3, 11);
  const pairs: string[] = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) pairs.push(`(${a};${b})`);
  const P = F(pairs.length, 36);
  return {
    title: 'Augensumme zweier Würfel',
    text: `Zwei faire Würfel werden geworfen. Berechne die Wahrscheinlichkeit, dass die Augensumme $${s}$ beträgt. ${PHINT}`,
    parts: [pr('$P$', P)],
    solution: ['$|\\Omega| = 6 \\cdot 6 = 36$ gleich wahrscheinliche Paare.', `Günstige Ergebnisse: $${pairs.join(', ')}$ – das sind $${pairs.length}$.`, `$P = \\frac{${pairs.length}}{36}${P.d !== 36 ? ` = ${P.tex()}` : ''} \\approx ${dec(P.v)}$`],
  };
};

const skatKarten: Gen = () => {
  const items: [string, number, string][] = [
    ['eine Herz-Karte', 8, '$8$ Herz-Karten'],
    ['ein Ass', 4, '$4$ Asse'],
    ['ein Bube oder eine Herz-Karte', 11, '$4$ Buben $+ \\; 8$ Herz $- \\; 1$ Herz-Bube (doppelt gezählt) $= 11$ (Satz von Sylvester)'],
    ['eine rote Karte (Herz oder Karo)', 16, '$8 + 8 = 16$'],
    ['eine Bildkarte (Bube, Dame, König)', 12, '$3 \\cdot 4 = 12$'],
    ['kein Ass', 28, 'Gegenereignis: $32 - 4 = 28$'],
  ];
  const [s, n, why] = pick(items);
  const P = F(n, 32);
  return {
    title: 'Ziehen aus einem Kartenspiel',
    text: `Aus einem gut gemischten Skatblatt ($32$ Karten: Kreuz, Pik, Herz, Karo mit je $7, 8, 9, 10$, Bube, Dame, König, Ass) wird eine Karte gezogen. Wie wahrscheinlich ist ${s}? ${PHINT}`,
    parts: [pr('$P$', P)],
    solution: [`Günstige Karten: ${why}`, `$P = \\frac{${n}}{32}${P.d !== 32 ? ` = ${P.tex()}` : ''} \\approx ${dec(P.v)}$`],
  };
};

const gegenereignis: Gen = () => {
  const n = pick([2, 3, 4]);
  const P = F(1).sub(F(5 ** n, 6 ** n));
  return {
    title: 'Mindestens eine Sechs',
    text: `Ein fairer Würfel wird $${n}$-mal geworfen. Berechne die Wahrscheinlichkeit, mindestens eine Sechs zu würfeln. ${PHINT}`,
    parts: [pr('$P$', P)],
    solution: [
      '„Mindestens eine Sechs“ ist das Gegenereignis von „keine Sechs“.',
      `$P(\\text{keine Sechs}) = \\left(\\frac{5}{6}\\right)^{${n}} = \\frac{${5 ** n}}{${6 ** n}}$`,
      `$P = 1 - \\frac{${5 ** n}}{${6 ** n}} = ${P.tex()} \\approx ${dec(P.v)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------
// Baumdiagramme
// ---------------------------------------------------------------------------

const urneZweiZuege: Gen = () => {
  const r = ri(2, 6);
  const b = ri(2, 6);
  const N = r + b;
  const mit = Math.random() < 0.5;
  const pR1 = F(r, N);
  const pB1 = F(b, N);
  const pRR = mit ? F(r, N) : F(r - 1, N - 1);
  const pRB = mit ? F(b, N) : F(b, N - 1);
  const pBR = mit ? F(r, N) : F(r, N - 1);
  const pBB = mit ? F(b, N) : F(b - 1, N - 1);
  const paths = { rr: pR1.mul(pRR), rb: pR1.mul(pRB), br: pB1.mul(pBR), bb: pB1.mul(pBB) };
  const evs: [string, (keyof typeof paths)[]][] = [
    ['beide Kugeln rot sind', ['rr']],
    ['beide Kugeln die gleiche Farbe haben', ['rr', 'bb']],
    ['genau eine Kugel rot ist', ['rb', 'br']],
    ['mindestens eine Kugel blau ist', ['rb', 'br', 'bb']],
  ];
  const [s, ks] = pick(evs);
  const P = ks.reduce((acc, k) => acc.add(paths[k]), F(0));
  const tree: TNode[] = [
    { label: 'r', p: frs(pR1), children: [{ label: 'r', p: frs(pRR) }, { label: 'b', p: frs(pRB) }] },
    { label: 'b', p: frs(pB1), children: [{ label: 'r', p: frs(pBR) }, { label: 'b', p: frs(pBB) }] },
  ];
  const lab: Record<string, string> = { rr: 'rr', rb: 'rb', br: 'br', bb: 'bb' };
  const pathTex = (k: keyof typeof paths) => {
    const [a, c] = [k[0] === 'r' ? pR1 : pB1, { rr: pRR, rb: pRB, br: pBR, bb: pBB }[k]];
    return `P(${lab[k]}) = ${a.tex()} \\cdot ${c.tex()} = ${paths[k].tex()}`;
  };
  return {
    title: `Urne: zweimal ziehen ${mit ? 'mit' : 'ohne'} Zurücklegen`,
    text: `In einer Urne liegen $${r}$ rote und $${b}$ blaue Kugeln. Es werden nacheinander zwei Kugeln **${mit ? 'mit' : 'ohne'}** Zurücklegen gezogen. Berechne die Wahrscheinlichkeit, dass ${s}. ${PHINT}`,
    figure: <Tree root={tree} />,
    parts: [pr('$P$', P)],
    solution: [
      mit ? 'Mit Zurücklegen bleiben die Wahrscheinlichkeiten in der 2. Stufe gleich.' : 'Ohne Zurücklegen ist in der 2. Stufe eine Kugel weniger in der Urne.',
      '1. Pfadregel (Produktregel): Wahrscheinlichkeiten entlang eines Pfades multiplizieren.',
      ...ks.map((k) => `$${pathTex(k)}$`),
      ks.length > 1 ? `2. Pfadregel (Summenregel): $P = ${ks.map((k) => paths[k].tex()).join(' + ')} = ${P.tex()}$` : `$P = ${P.tex()}$`,
      `$P \\approx ${dec(P.v)}$`,
    ],
  };
};

const dreiStufen: Gen = () => {
  const p10 = pick([6, 7, 8, 9]);
  const p = p10 / 10;
  const q = 1 - p;
  const pn = name();
  const k = ri(0, 2);
  const node = (d: number): TNode[] =>
    d === 0 ? [] : [
      { label: 'T', p: t(p), children: node(d - 1) },
      { label: 'N', p: t(q), children: node(d - 1) },
    ];
  const evs: [string, number, string[]][] = [
    ['genau zwei Treffer', 3 * p * p * q, [`P(\\text{TTN}) + P(\\text{TNT}) + P(\\text{NTT}) = 3 \\cdot ${t(p)}^2 \\cdot ${t(q)}`]],
    ['mindestens ein Treffer', 1 - q ** 3, [`\\text{Gegenereignis „kein Treffer“: } P(\\text{NNN}) = ${t(q)}^3 = ${dec(q ** 3)}`, `P = 1 - ${dec(q ** 3)}`]],
    ['drei Treffer', p ** 3, [`P(\\text{TTT}) = ${t(p)}^3`]],
  ];
  const [s, P, steps] = evs[k];
  return {
    title: 'Dreistufiges Zufallsexperiment',
    text: `${pn} trifft beim Basketball-Freiwurf mit einer Wahrscheinlichkeit von $${t(p)}$. Es werden drei Würfe ausgeführt (unabhängig voneinander). Berechne die Wahrscheinlichkeit für **${s}** (auf drei Nachkommastellen).`,
    figure: <Tree root={node(3)} />,
    parts: [pr('$P$', P)],
    solution: ['T: Treffer, N: kein Treffer. Pfadregeln anwenden:', ...steps.map((x) => `$${x}$`), `$P = ${dec(P)}$`],
  };
};

const wuerfelspiel: Gen = () => {
  const einsatz = pick([1, 2]);
  const v = Math.random() < 0.5;
  const P = v ? F(1, 36) : F(11, 36);
  return {
    title: 'Gewinnwahrscheinlichkeit beim Würfelspiel',
    badge: 'Anwendung',
    text: `Bei einem Spiel zahlt man $${einsatz}$ € Einsatz und wirft zweimal einen Würfel. Man gewinnt, wenn ${v ? 'zweimal eine Sechs' : 'mindestens eine Sechs'} fällt. (6: Sechs, k: keine Sechs) ${PHINT}`,
    figure: (
      <Tree
        root={[
          { label: '6', p: '1/6', children: [{ label: '6', p: '1/6' }, { label: 'k', p: '5/6' }] },
          { label: 'k', p: '5/6', children: [{ label: '6', p: '1/6' }, { label: 'k', p: '5/6' }] },
        ]}
      />
    ),
    parts: [pr('$P(\\text{Gewinn})$', P)],
    solution: v
      ? ['Nur der Pfad „6, 6“: $P = \\frac{1}{6} \\cdot \\frac{1}{6} = \\frac{1}{36} \\approx 0{,}028$']
      : ['Pfade „6, 6“, „6, keine 6“, „keine 6, 6“ – oder schneller mit dem Gegenereignis:', '$P = 1 - \\frac{5}{6} \\cdot \\frac{5}{6} = 1 - \\frac{25}{36} = \\frac{11}{36} \\approx 0{,}306$'],
  };
};

// ---------------------------------------------------------------------------
// Vierfeldertafel
// ---------------------------------------------------------------------------

const table = (A: string, B: string, c: (string | number)[][]) =>
  `\\begin{array}{c|c|c|c} & ${B} & \\overline{${B}} & \\Sigma \\\\ \\hline ${A} & ${c[0].join(' & ')} \\\\ \\hline \\overline{${A}} & ${c[1].join(' & ')} \\\\ \\hline \\Sigma & ${c[2].join(' & ')} \\end{array}`;

const vierfelderAnzahlen: Gen = () => {
  const ctx = pick([
    { A: 'M', B: 'S', dA: 'Mädchen', dB: 'spielt ein Instrument', group: 'Schülerinnen und Schüler' },
    { A: 'R', B: 'H', dA: 'Raucher', dB: 'hat Bluthochdruck', group: 'Personen' },
    { A: 'F', B: 'V', dA: 'fährt mit dem Fahrrad', dB: 'ist volljährig', group: 'Befragte' },
  ]);
  const N = pick([100, 120, 150, 200, 250]);
  const nA = ri(Math.round(N * 0.3), Math.round(N * 0.6));
  const nB = ri(Math.round(N * 0.2), Math.round(N * 0.6));
  const nAB = ri(Math.max(5, nA + nB - N + 5), Math.min(nA, nB) - 5);
  const c = [
    [nAB, nA - nAB, nA],
    [nB - nAB, N - nA - nB + nAB, N - nA],
    [nB, N - nB, N],
  ];
  const shown = [
    [nAB, '?', nA],
    ['', '?', ''],
    [nB, '', N],
  ];
  const q = ri(0, 2);
  const Pq: [string, number, string][] = [
    [`P(${ctx.A} \\cup ${ctx.B})`, (nA + nB - nAB) / N, `\\frac{${nA} + ${nB} - ${nAB}}{${N}} = \\frac{${nA + nB - nAB}}{${N}}`],
    [`P(\\overline{${ctx.A}} \\cap \\overline{${ctx.B}})`, c[1][1] / N, `\\frac{${c[1][1]}}{${N}}`],
    [`P(${ctx.A} \\cap \\overline{${ctx.B}})`, c[0][1] / N, `\\frac{${c[0][1]}}{${N}}`],
  ];
  const [pl, pv, pt] = Pq[q];
  return {
    title: 'Vierfeldertafel mit Anzahlen',
    text: `Von $${N}$ ${ctx.group} gilt: ${ctx.A}: „${ctx.dA}“, ${ctx.B}: „${ctx.dB}“.\n$${table(ctx.A, ctx.B, shown)}$`,
    parts: [
      nm(`$|${ctx.A} \\cap \\overline{${ctx.B}}|$`, c[0][1], { integer: true, q: `a) Ergänze die Tafel: Wie viele gehören zu $${ctx.A}$, aber nicht zu $${ctx.B}$?` }),
      nm(`$|\\overline{${ctx.A}} \\cap \\overline{${ctx.B}}|$`, c[1][1], { integer: true, q: 'b) Wie viele gehören zu keiner der beiden Gruppen?' }),
      pr(`$${pl}$`, pv, `c) Eine Person wird zufällig ausgewählt. Berechne $${pl}$ (Dezimalzahl).`),
    ],
    solution: [
      'Zeilen und Spalten müssen sich zu den Summen ergänzen:',
      `$${table(ctx.A, ctx.B, c)}$`,
      `a) $${nA} - ${nAB} = ${c[0][1]}$, b) $${N - nB} - ${c[0][1]} = ${c[1][1]}$`,
      `c) $${pl} = ${pt} = ${dec(pv)}$`,
    ],
  };
};

const vierfelderWahrscheinlichkeiten: Gen = () => {
  const pA = ri(2, 7) / 10;
  const pB = ri(2, 7) / 10;
  const lo = Math.max(0, Math.round((pA + pB - 1) * 100) + 1);
  const hi = Math.round(Math.min(pA, pB) * 100) - 1;
  const pAB = ri(lo, hi) / 100;
  const pAnB = pA - pAB;
  const pnAB = pB - pAB;
  const pnn = 1 - pA - pB + pAB;
  const c = [
    [t(pAB), t(pAnB), t(pA)],
    [t(pnAB), t(pnn), t(1 - pA)],
    [t(pB), t(1 - pB), '1'],
  ];
  const sylv = Math.random() < 0.5;
  return {
    title: 'Vierfeldertafel mit Wahrscheinlichkeiten',
    text: `Für zwei Ereignisse gilt $P(A) = ${t(pA)}$, $P(B) = ${t(pB)}$ und $P(A \\cap B) = ${t(pAB)}$.`,
    parts: sylv
      ? [pr('$P(A \\cup B)$', pA + pB - pAB, 'a) Berechne $P(A \\cup B)$.'), pr('$P(\\overline{A} \\cap \\overline{B})$', pnn, 'b) Berechne die Wahrscheinlichkeit, dass keines der Ereignisse eintritt.')]
      : [pr('$P(\\overline{A} \\cap B)$', pnAB, 'a) Berechne $P(\\overline{A} \\cap B)$.'), pr('$P(A \\cap \\overline{B})$', pAnB, 'b) Berechne $P(A \\cap \\overline{B})$.')],
    solution: [
      `$${table('A', 'B', c)}$`,
      sylv ? `a) Satz von Sylvester: $P(A \\cup B) = ${t(pA)} + ${t(pB)} - ${t(pAB)} = ${t(pA + pB - pAB)}$` : `a) $P(\\overline{A} \\cap B) = P(B) - P(A \\cap B) = ${t(pB)} - ${t(pAB)} = ${t(pnAB)}$`,
      sylv ? `b) $P(\\overline{A} \\cap \\overline{B}) = 1 - P(A \\cup B) = ${t(pnn)}$ (De Morgan)` : `b) $P(A \\cap \\overline{B}) = P(A) - P(A \\cap B) = ${t(pA)} - ${t(pAB)} = ${t(pAnB)}$`,
    ],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'zufallsexperimente',
    title: 'Zufallsexperimente und Ereignisse',
    description: 'Ergebnisraum, Ereignisse als Teilmengen, Ereignis-Algebra',
    intro:
      'Ein **Zufallsexperiment** hat mehrere mögliche Ergebnisse, deren Eintreten nicht vorhersagbar ist. Die Menge aller Ergebnisse ist der **Ergebnisraum** $\\Omega$. Bei mehrstufigen Experimenten hilft ein Baumdiagramm: Die Anzahl der Ergebnisse ist das Produkt der Astanzahlen.\n\nEin **Ereignis** $A$ ist eine Teilmenge von $\\Omega$. Verknüpfungen: $A \\cap B$ („und“), $A \\cup B$ („oder“), $\\overline{A}$ („nicht A“, Gegenereignis). Gilt $A \\cap B = \\{\\,\\}$, heißen $A$ und $B$ **unvereinbar**.',
    formulas: ['\\overline{A} = \\Omega \\setminus A', '\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}', '\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}'],
    example: {
      title: 'Würfel',
      text: '$\\Omega = \\{1; \\ldots; 6\\}$, $A$: „gerade“, $B$: „größer als 4“',
      steps: ['$A = \\{2; 4; 6\\}$, $B = \\{5; 6\\}$', '$A \\cap B = \\{6\\}$, $A \\cup B = \\{2; 4; 5; 6\\}$', '$\\overline{A} = \\{1; 3; 5\\}$'],
    },
    gens: [istZufallsexperiment, ergebnisraumAnzahl, ereignisMenge, ereignisAlgebra, verbalAlgebra],
  },
  {
    slug: 'haeufigkeiten',
    title: 'Absolute und relative Häufigkeiten',
    description: 'Häufigkeiten aus Versuchsreihen und Umfragen bestimmen',
    intro:
      'Wird ein Zufallsexperiment $n$-mal durchgeführt, gibt die **absolute Häufigkeit** $H(A)$ an, wie oft $A$ eingetreten ist. Die **relative Häufigkeit** ist der Anteil $h(A) = \\frac{H(A)}{n}$ (als Dezimalzahl oder in Prozent).\n\nBei sehr vielen Wiederholungen stabilisiert sich die relative Häufigkeit in der Nähe der Wahrscheinlichkeit (Gesetz der großen Zahlen).',
    formulas: ['h(A) = \\frac{H(A)}{n}'],
    gens: [wuerfelHaeufigkeit],
    apps: [umfrageHaeufigkeit],
    nBasic: 2,
    nApp: 2,
  },
  {
    slug: 'laplace',
    title: 'Laplace-Wahrscheinlichkeiten',
    description: 'Würfel, Karten, Gegenereignis, Satz von Sylvester',
    intro:
      'Bei einem **Laplace-Experiment** sind alle Ergebnisse gleich wahrscheinlich (fairer Würfel, gut gemischte Karten, gleich große Kugeln). Dann gilt $P(A) = \\frac{|A|}{|\\Omega|} = \\frac{\\text{Anzahl günstige Ergebnisse}}{\\text{Anzahl mögliche Ergebnisse}}$.\n\nOft ist das **Gegenereignis** einfacher: $P(A) = 1 - P(\\overline{A})$, z. B. bei „mindestens einmal“. Für „oder“ gilt der **Satz von Sylvester**.',
    formulas: ['P(A) = \\frac{|A|}{|\\Omega|}', 'P(\\overline{A}) = 1 - P(A)', 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)'],
    gens: [laplaceWuerfel, augensumme, skatKarten, gegenereignis],
  },
  {
    slug: 'baumdiagramme',
    title: 'Baumdiagramme und Pfadregeln',
    description: 'Zwei- und dreistufige Zufallsexperimente, Ziehen mit und ohne Zurücklegen',
    intro:
      'Mehrstufige Zufallsexperimente stellt man im **Baumdiagramm** dar. An jedem Verzweigungspunkt ergeben die Wahrscheinlichkeiten zusammen $1$.\n\n**1. Pfadregel (Produktregel)**: Die Wahrscheinlichkeit eines Pfades ist das Produkt der Wahrscheinlichkeiten entlang des Pfades. **2. Pfadregel (Summenregel)**: Die Wahrscheinlichkeit eines Ereignisses ist die Summe der Wahrscheinlichkeiten aller zugehörigen Pfade.\n\nBeim Ziehen **ohne Zurücklegen** ändern sich die Wahrscheinlichkeiten in der zweiten Stufe.',
    formulas: ['P(\\text{Pfad}) = p_1 \\cdot p_2 \\cdot \\ldots', 'P(A) = P(\\text{Pfad}_1) + P(\\text{Pfad}_2) + \\ldots'],
    example: {
      title: 'Ohne Zurücklegen',
      text: 'Urne mit $3$ roten und $2$ blauen Kugeln, zwei Züge ohne Zurücklegen. $P(\\text{beide rot})$?',
      steps: ['$P(rr) = \\frac{3}{5} \\cdot \\frac{2}{4} = \\frac{6}{20} = \\frac{3}{10}$'],
    },
    gens: [urneZweiZuege, urneZweiZuege, dreiStufen],
    apps: [wuerfelspiel],
    nBasic: 4,
    nApp: 1,
  },
  {
    slug: 'vierfeldertafel',
    title: 'Vierfeldertafel',
    description: 'Zwei Merkmale in der Vierfeldertafel, Wahrscheinlichkeiten verknüpfter Ereignisse',
    intro:
      'Geht es um zwei Merkmale $A$ und $B$, ordnet man alle Kombinationen in einer **Vierfeldertafel** an: $A \\cap B$, $A \\cap \\overline{B}$, $\\overline{A} \\cap B$, $\\overline{A} \\cap \\overline{B}$. Zeilen- und Spaltensummen ergeben die Randwerte, unten rechts steht die Gesamtzahl bzw. $1$.\n\nFehlende Felder ergänzt man durch Addieren und Subtrahieren. Wahrscheinlichkeiten erhält man (bei zufälliger Auswahl) als Anteil an der Gesamtzahl.',
    formulas: [table('A', 'B', [['P(A \\cap B)', 'P(A \\cap \\overline{B})', 'P(A)'], ['P(\\overline{A} \\cap B)', 'P(\\overline{A} \\cap \\overline{B})', 'P(\\overline{A})'], ['P(B)', 'P(\\overline{B})', '1']])],
    gens: [vierfelderAnzahlen, vierfelderWahrscheinlichkeiten],
    nBasic: 4,
  },
];

export const lb7: TopicConfig = {
  slug: 'daten-und-zufall',
  title: 'Daten und Zufall, Wahrscheinlichkeit',
  description: 'Lernbereich 7: Zufallsexperimente, Ereignisse, Häufigkeiten, Laplace, Baumdiagramme, Vierfeldertafel',
  icon: 'dice',
  pages,
};
