import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Practice from './engine/Practice';
import Rich from '../raum_und_form/engine/Rich';
import type { Level, Task, TopicConfig } from './engine/types';
import {
  FN_NAME,
  FN_RATIO,
  RTFigure,
  ROLE_NAME,
  asked,
  makeRT,
  plain,
  roleIndex,
  type Fn,
  type Role,
  type RT,
} from './engine/rightTriangle';
import { pick, randInt, shuffle } from './engine/util';

const FNS: Fn[] = ['sin', 'cos', 'tan'];
const PAIRS: [Role, Role][] = [
  ['G', 'H'],
  ['A', 'H'],
  ['G', 'A'],
  ['H', 'G'],
  ['H', 'A'],
  ['A', 'G'],
];

const frac = (t: RT, [x, y]: [Role, Role]) =>
  `$\\dfrac{${t.n.s[roleIndex(t, x)]}}{${t.n.s[roleIndex(t, y)]}}$`;

/** Welche Funktion ist num/den bezogen auf den Winkel? */
function fnOfPair([x, y]: [Role, Role]): Fn | null {
  return FNS.find((f) => FN_RATIO[f][0] === x && FN_RATIO[f][1] === y) ?? null;
}

/** Rolle einer Seite, wenn man vom anderen spitzen Winkel aus schaut. */
const swap = (r: Role): Role => (r === 'G' ? 'A' : r === 'A' ? 'G' : 'H');

const roleTip = (t: RT) =>
  `Vom Winkel $${t.n.wt[t.p]}$ aus: Hypotenuse $${t.n.s[t.r]}$, Gegenkathete $${
    t.n.s[t.p]
  }$, Ankathete $${t.n.s[t.q]}$.`;

function generate(level: Level, slot: number): Task {
  const t = makeRT({ theta: randInt(25, 65), hyp: 10, standard: level === 'einfach' });
  const { n } = t;
  const th = n.wt[t.p];
  const sideMarks = [0, 1, 2].map((i) => plain(n.s[i]));
  const angleMarks = [0, 1, 2].map((i) =>
    i === t.p ? asked(n.w[i]) : level === 'schwer' && i === t.q ? asked(n.w[i]) : null
  );
  const figure = <RTFigure t={t} sides={sideMarks} angles={angleMarks} />;
  const base = `${n.V.join('')}-${t.r}-${t.p}`;

  if (level === 'einfach') {
    const fn = FNS[slot % 3];
    const correctPair = FN_RATIO[fn];
    const others = shuffle(
      PAIRS.filter((p) => p[0] !== correctPair[0] || p[1] !== correctPair[1])
    ).slice(0, 3);
    const opts = shuffle([correctPair, ...others]);
    return {
      key: `e-${fn}-${base}`,
      text: `Im rechtwinkligen Dreieck ${n.V.join(
        ''
      )} ist der Winkel $${th}$ markiert. Welcher Quotient ist $\\${fn}(${th})$?`,
      figure,
      fields: [
        {
          kind: 'choice',
          label: `$\\${fn}(${th}) =$`,
          options: opts.map((p) => frac(t, p)),
          correct: opts.indexOf(correctPair),
        },
      ],
      tips: [
        roleTip(t),
        `Der ${FN_NAME[fn]} ist ${ROLE_NAME[correctPair[0]]} durch ${ROLE_NAME[correctPair[1]]}.`,
      ],
      solution: [
        roleTip(t),
        `$\\${fn}(${th}) = \\dfrac{\\text{${ROLE_NAME[correctPair[0]]}}}{\\text{${
          ROLE_NAME[correctPair[1]]
        }}} = $ ${frac(t, correctPair)}`,
      ],
    };
  }

  const fnLabels = ['Sinus', 'Kosinus', 'Tangens', 'keine davon'];
  const pair = pick(PAIRS);

  if (level === 'mittel') {
    const fn = pick(FNS);
    const correctPair = FN_RATIO[fn];
    const same = (p: [Role, Role]) => p[0] === correctPair[0] && p[1] === correctPair[1];
    const opts = shuffle([correctPair, ...shuffle(PAIRS.filter((p) => !same(p))).slice(0, 3)]);
    const f2 = fnOfPair(pair);
    return {
      key: `m-${fn}-${pair.join('')}-${base}`,
      text: `Im rechtwinkligen Dreieck ${n.V.join(
        ''
      )} ist der Winkel $${th}$ markiert. Beantworte beide Fragen.`,
      figure,
      fields: [
        {
          kind: 'choice',
          label: `a) $\\${fn}(${th}) =$`,
          options: opts.map((p) => frac(t, p)),
          correct: opts.indexOf(correctPair),
        },
        {
          kind: 'choice',
          label: `b) Der Quotient ${frac(t, pair)} ist der … von $${th}$`,
          options: fnLabels,
          correct: f2 ? FNS.indexOf(f2) : 3,
        },
      ],
      tips: [
        roleTip(t),
        `Sinus = GK/H, Kosinus = AK/H, Tangens = GK/AK.`,
        `Bei b) prüfe genau, was im Zähler und was im Nenner steht. Ein umgedrehter Bruch passt zu keiner der drei Funktionen.`,
      ],
      solution: [
        roleTip(t),
        `a) $\\${fn}(${th}) =$ ${frac(t, correctPair)}`,
        `b) ${frac(t, pair)} $= \\dfrac{\\text{${ROLE_NAME[pair[0]]}}}{\\text{${
          ROLE_NAME[pair[1]]
        }}}$ → ${f2 ? FN_NAME[f2] : 'keine der drei Funktionen (umgedrehter Bruch)'}`,
      ],
    };
  }

  // schwer: derselbe Quotient vom einen und vom anderen spitzen Winkel aus
  const p = FN_RATIO[FNS[slot % 3]];
  const f1 = fnOfPair(p)!;
  const f2 = fnOfPair([swap(p[0]), swap(p[1])]);
  const th2 = n.wt[t.q];
  return {
    key: `s-${f1}-${base}`,
    text: `Im rechtwinkligen Dreieck ${n.V.join(
      ''
    )} sind die Winkel $${th}$ und $${th2}$ markiert. Betrachte den Quotienten ${frac(t, p)}.`,
    figure,
    fields: [
      {
        kind: 'choice',
        label: `${frac(t, p)} ist der … von $${th}$`,
        options: fnLabels,
        correct: FNS.indexOf(f1),
      },
      {
        kind: 'choice',
        label: `${frac(t, p)} ist der … von $${th2}$`,
        options: fnLabels,
        correct: f2 ? FNS.indexOf(f2) : 3,
      },
    ],
    tips: [
      roleTip(t),
      `Vom Winkel $${th2}$ aus tauschen Gegenkathete und Ankathete ihre Rollen: Gegenkathete ist dann $${
        n.s[t.q]
      }$, Ankathete $${n.s[t.p]}$.`,
      `Prüfe für jeden Winkel: Was steht im Zähler, was im Nenner?`,
    ],
    solution: [
      `Von $${th}$ aus: ${frac(t, p)} $= \\dfrac{\\text{${ROLE_NAME[p[0]]}}}{\\text{${
        ROLE_NAME[p[1]]
      }}}$ → ${FN_NAME[f1]}`,
      `Von $${th2}$ aus: ${frac(t, p)} $= \\dfrac{\\text{${ROLE_NAME[swap(p[0])]}}}{\\text{${
        ROLE_NAME[swap(p[1])]
      }}}$ → ${f2 ? FN_NAME[f2] : 'keine der drei Funktionen (das ist der Kehrwert des Tangens)'}`,
      `Merke: $\\sin(${th}) = \\cos(${th2})$, weil sich beide Winkel zu $90^\\circ$ ergänzen.`,
    ],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Sinus, Kosinus und Tangens sind **Seitenverhältnisse** im rechtwinkligen Dreieck. Welche Seite Gegen- oder Ankathete ist, hängt vom betrachteten Winkel ab." />
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
      <BlockMath math="\sin(\alpha) = \frac{\text{Gegenkathete}}{\text{Hypotenuse}}" />
      <BlockMath math="\cos(\alpha) = \frac{\text{Ankathete}}{\text{Hypotenuse}}" />
      <BlockMath math="\tan(\alpha) = \frac{\text{Gegenkathete}}{\text{Ankathete}}" />
    </div>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich text="Dreieck ABC mit rechtem Winkel bei C: $\sin(\alpha) = \frac{a}{c}$, $\cos(\alpha) = \frac{b}{c}$, $\tan(\alpha) = \frac{a}{b}$. Vom Winkel $\beta$ aus gilt dagegen $\sin(\beta) = \frac{b}{c}$." />
    </div>
    <p className="text-sm text-slate-500">
      Eselsbrücke: „GAGA HuHu AG“ – sin = G/H, cos = A/H, tan = G/A.
    </p>
  </>
);

export const cfg: TopicConfig = {
  title: 'Sinus, Kosinus und Tangens erkennen',
  subtitle: 'Erkenne die Winkelfunktionen als Seitenverhältnisse.',
  trackingTopic: 'Sinus, Kosinus, Tangens erkennen',
  videoId: '0qxNk-ZcW-8',
  pdf: '/downloads/sinus-kosinus-tangens-erkennen-uebungen.pdf',
  explanation,
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC – wähle den passenden Quotienten.',
      example: '$\\sin(\\alpha) = \\,?$',
    },
    {
      id: 'mittel',
      description: 'Wechselnde Beschriftung – Quotient bestimmen und Funktion erkennen.',
    },
    { id: 'schwer', description: 'Derselbe Quotient von beiden spitzen Winkeln aus betrachtet.' },
  ],
  generate,
};

export default function SinusKosinusTangensErkennen() {
  return <Practice cfg={cfg} />;
}
