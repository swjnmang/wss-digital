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
  given,
  hypFrom,
  makeRT,
  plain,
  roleIndex,
  type Fn,
  type Role,
} from './engine/rightTriangle';
import {
  fmtDeg,
  fmtU,
  pick,
  randFloat,
  randInt,
  shuffle,
  texDeg,
  texU,
  UNITS,
} from './engine/util';

// Gesuchte Seite steht im Zähler (einfach) bzw. auch im Nenner (mittel)
type Case = { fn: Fn; givenRole: Role; askedRole: Role };
const NUMERATOR_CASES: Case[] = [
  { fn: 'sin', givenRole: 'H', askedRole: 'G' },
  { fn: 'cos', givenRole: 'H', askedRole: 'A' },
  { fn: 'tan', givenRole: 'A', askedRole: 'G' },
];
const DENOMINATOR_CASES: Case[] = [
  { fn: 'sin', givenRole: 'G', askedRole: 'H' },
  { fn: 'cos', givenRole: 'A', askedRole: 'H' },
  { fn: 'tan', givenRole: 'G', askedRole: 'A' },
];
const ALL_CASES = [...NUMERATOR_CASES, ...DENOMINATOR_CASES];

/** Umstellen nach der gesuchten Seite und Einsetzen (KaTeX-Zeilen). */
function solveLines(
  fn: Fn,
  theta: string,
  thetaVal: string,
  num: string,
  den: string,
  askedRole: Role,
  givenVal: string,
  result: string
) {
  const [numRole] = FN_RATIO[fn];
  const f = `\\${fn}(${theta})`;
  const fv = `\\${fn}(${thetaVal})`;
  if (askedRole === numRole) {
    return [
      `Nach ${num} umstellen (mal ${den}): $${num} = ${den} \\cdot ${f}$`,
      `Einsetzen: $${num} = ${givenVal} \\cdot ${fv} \\approx ${result}$`,
    ];
  }
  return [
    `Nach ${den} umstellen (mal ${den}, dann durch $${f}$): $${den} = \\dfrac{${num}}{${f}}$`,
    `Einsetzen: $${den} = \\dfrac{${givenVal}}{${fv}} \\approx ${result}$`,
  ];
}

function generate(level: Level, slot: number): Task {
  const standard = level === 'einfach';
  const theta = level === 'einfach' ? randInt(20, 70) : randFloat(15, 75, 1);
  const unit = pick(UNITS);
  const L = randFloat(2.5, 14, 1);

  if (level === 'schwer') {
    // Eine Seite und ein Winkel gegeben -> beide fehlenden Seiten
    const givenRole: Role = (['H', 'G', 'A'] as Role[])[slot % 3];
    const t = makeRT({ theta, hyp: hypFrom(givenRole, L, theta) });
    const { n } = t;
    const gi = roleIndex(t, givenRole);
    const missing = (['H', 'G', 'A'] as Role[]).filter((r) => r !== givenRole);
    const sideMarks = [0, 1, 2].map((i) =>
      i === gi ? given(`${n.s[i]} = ${fmtU(L, unit, 1)}`) : asked(`${n.s[i]} = ?`)
    );
    const angleMarks = [0, 1, 2].map((i) =>
      i === t.p ? given(`${n.w[i]} = ${fmtDeg(theta)}`) : null
    );
    const th = n.wt[t.p];
    const fields = missing.map((role) => ({
      kind: 'num' as const,
      label: `$${n.s[roleIndex(t, role)]}$`,
      value: t.side[roleIndex(t, role)],
      unit,
    }));
    const solution: string[] = [
      `Vom Winkel $${th}$ aus: Hypotenuse $${n.s[t.r]}$, Gegenkathete $${n.s[t.p]}$, Ankathete $${
        n.s[t.q]
      }$.`,
    ];
    for (const role of missing) {
      const fn = (['sin', 'cos', 'tan'] as Fn[]).find(
        (f) => FN_RATIO[f].includes(role) && FN_RATIO[f].includes(givenRole)
      )!;
      const [nr, dr] = FN_RATIO[fn];
      const ai = roleIndex(t, role);
      solution.push(
        `**${n.s[ai]} berechnen** – ${ROLE_NAME[role]} und ${ROLE_NAME[givenRole]} → ${
          FN_NAME[fn]
        }: $\\${fn}(${th}) = \\dfrac{${n.s[roleIndex(t, nr)]}}{${n.s[roleIndex(t, dr)]}}$`
      );
      solution.push(
        ...solveLines(
          fn,
          th,
          texDeg(theta),
          n.s[roleIndex(t, nr)],
          n.s[roleIndex(t, dr)],
          role,
          texU(L, unit, 1),
          texU(t.side[ai], unit)
        )
      );
    }
    return {
      key: `s-${givenRole}-${theta}-${L}`,
      text: `Im rechtwinkligen Dreieck ${n.V.join('')} sind $${n.s[gi]} = ${texU(
        L,
        unit,
        1
      )}$ und $${th} = ${texDeg(theta)}$ gegeben. Berechne die beiden fehlenden Seiten.`,
      figure: <RTFigure t={t} sides={sideMarks} angles={angleMarks} />,
      fields,
      tips: [
        `Bestimme vom Winkel $${th}$ aus Hypotenuse (gegenüber dem rechten Winkel), Gegenkathete (gegenüber von $${th}$) und Ankathete (liegt an $${th}$).`,
        `Für jede gesuchte Seite brauchst du eine Formel, in der nur die gegebene Seite $${n.s[gi]}$, der Winkel $${th}$ und die gesuchte Seite vorkommen.`,
        `Die zweite fehlende Seite kannst du auch mit dem Satz des Pythagoras berechnen – rechne dann aber mit dem ungerundeten Wert weiter.`,
      ],
      solution,
    };
  }

  const pool = level === 'einfach' ? NUMERATOR_CASES : ALL_CASES;
  const c = level === 'einfach' ? pool[slot % pool.length] : shuffle(pool)[0];
  const t = makeRT({ theta, hyp: hypFrom(c.givenRole, L, theta), standard });
  const { n } = t;
  const gi = roleIndex(t, c.givenRole);
  const ai = roleIndex(t, c.askedRole);
  const th = n.wt[t.p];
  const [numRole, denRole] = FN_RATIO[c.fn];
  const num = n.s[roleIndex(t, numRole)];
  const den = n.s[roleIndex(t, denRole)];

  const sideMarks = [0, 1, 2].map((i) =>
    i === gi
      ? given(`${n.s[i]} = ${fmtU(L, unit, 1)}`)
      : i === ai
      ? asked(`${n.s[i]} = ?`)
      : plain(n.s[i])
  );
  const angleMarks = [0, 1, 2].map((i) =>
    i === t.p ? given(`${n.w[i]} = ${fmtDeg(theta)}`) : null
  );

  return {
    key: `${c.fn}-${c.askedRole}-${theta}-${L}`,
    text: `Im rechtwinkligen Dreieck ${n.V.join('')} ist $${n.s[gi]} = ${texU(
      L,
      unit,
      1
    )}$ und $${th} = ${texDeg(theta)}$. Berechne die Seite $${n.s[ai]}$.`,
    figure: <RTFigure t={t} sides={sideMarks} angles={angleMarks} />,
    fields: [{ kind: 'num', label: `$${n.s[ai]}$`, value: t.side[ai], unit }],
    tips: [
      `Schau vom Winkel $${th}$ aus: Die Hypotenuse $${
        n.s[t.r]
      }$ liegt gegenüber dem rechten Winkel, die Gegenkathete $${
        n.s[t.p]
      }$ gegenüber von $${th}$, die Ankathete $${n.s[t.q]}$ liegt an $${th}$.`,
      `Gegeben ist die ${ROLE_NAME[c.givenRole]} $${n.s[gi]}$, gesucht die ${
        ROLE_NAME[c.askedRole]
      } $${n.s[ai]}$. Welche Winkelfunktion verbindet diese beiden Seiten?`,
      `Nimm den ${FN_NAME[c.fn]}: $\\${
        c.fn
      }(${th}) = \\dfrac{${num}}{${den}}$. Stelle die Formel nach $${n.s[ai]}$ um.`,
    ],
    solution: [
      `Vom Winkel $${th}$ aus: Hypotenuse $${n.s[t.r]}$, Gegenkathete $${n.s[t.p]}$, Ankathete $${
        n.s[t.q]
      }$.`,
      `${ROLE_NAME[c.givenRole]} gegeben, ${ROLE_NAME[c.askedRole]} gesucht → ${
        FN_NAME[c.fn]
      }: $\\${c.fn}(${th}) = \\dfrac{${num}}{${den}}$`,
      ...solveLines(
        c.fn,
        th,
        texDeg(theta),
        num,
        den,
        c.askedRole,
        texU(L, unit, 1),
        texU(t.side[ai], unit)
      ),
    ],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Im rechtwinkligen Dreieck benennst du die Seiten immer **vom Winkel aus**, mit dem du rechnest: Die **Hypotenuse** liegt gegenüber dem rechten Winkel, die **Gegenkathete** liegt dem Winkel gegenüber, die **Ankathete** liegt am Winkel an." />
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
      <BlockMath math="\sin(\alpha) = \frac{\text{GK}}{\text{H}}" />
      <BlockMath math="\cos(\alpha) = \frac{\text{AK}}{\text{H}}" />
      <BlockMath math="\tan(\alpha) = \frac{\text{GK}}{\text{AK}}" />
    </div>
    <ol className="list-decimal pl-5 space-y-1">
      <li>Seiten vom gegebenen Winkel aus benennen.</li>
      <li>Die Winkelfunktion wählen, in der die gegebene und die gesuchte Seite vorkommen.</li>
      <li>
        Nach der gesuchten Seite umstellen, einsetzen und ausrechnen (Taschenrechner auf DEG).
      </li>
    </ol>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich
        text={
          'Gegeben: $c = 8\\,\\text{cm}$ (Hypotenuse), $\\alpha = 30^\\circ$. Gesucht: $a$ (Gegenkathete von $\\alpha$).\n$\\sin(30^\\circ) = \\dfrac{a}{8\\,\\text{cm}}$ $\\Rightarrow$ $a = 8\\,\\text{cm} \\cdot \\sin(30^\\circ) = 4\\,\\text{cm}$'
        }
      />
    </div>
  </>
);

export const cfg: TopicConfig = {
  title: 'Streckenlänge mit Sinus, Kosinus und Tangens',
  subtitle: 'Berechne fehlende Seiten im rechtwinkligen Dreieck.',
  trackingTopic: 'Streckenlänge berechnen',
  videoId: 'HfiouXm2n3E',
  pdf: '/downloads/streckenlaenge-sinus-kosinus-tangens-uebungen.pdf',
  explanation,
  roundingNote: 'Runde deine Ergebnisse auf zwei Nachkommastellen.',
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC, die gesuchte Seite steht in der Formel oben (im Zähler).',
      example: '$a = c \\cdot \\sin(\\alpha)$',
    },
    {
      id: 'mittel',
      description: 'Wechselnde Beschriftung – die gesuchte Seite kann auch im Nenner stehen.',
      example: '$c = \\dfrac{a}{\\sin(\\alpha)}$',
    },
    {
      id: 'schwer',
      description: 'Eine Seite und ein Winkel sind gegeben – berechne beide fehlenden Seiten.',
    },
  ],
  generate,
};

export default function RechtwinkligStrecken() {
  return <Practice cfg={cfg} />;
}
