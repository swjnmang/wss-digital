import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Practice from './engine/Practice';
import Rich from '../raum_und_form/engine/Rich';
import type { Level, Task, TopicConfig } from './engine/types';
import { GTFigure, gtFromAngles, others, randomAngles } from './engine/generalTriangle';
import { asked, given, plain } from './engine/rightTriangle';
import {
  deg,
  fmtDeg,
  fmtU,
  pick,
  randFloat,
  round,
  shuffle,
  sinD,
  tex,
  texDeg,
  texU,
  UNITS,
} from './engine/util';

const PAIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [1, 2],
  [2, 1],
];

function generate(level: Level, slot: number): Task {
  const unit = pick(UNITS);
  const standard = level === 'einfach';
  const angleTask = level === 'mittel' && slot % 2 === 1;

  if (level === 'schwer' && slot % 2 === 0) {
    // WWS: zwei Winkel und die Seite gegenüber dem dritten -> erst Winkelsumme, dann Sinussatz
    const ang = randomAngles({ decimals: true });
    const [i, j] = shuffle([0, 1, 2]);
    const k = 3 - i - j;
    const L = randFloat(3, 12, 1);
    const t = gtFromAngles(ang, k, L);
    const { n } = t;
    const wk = 180 - ang[i] - ang[j];
    const target = (L * sinD(ang[i])) / sinD(wk);
    return {
      key: `s1-${ang.join('-')}-${L}`,
      text: `Im Dreieck ${n.V.join('')} sind $${n.wt[i]} = ${texDeg(ang[i])}$, $${
        n.wt[j]
      } = ${texDeg(ang[j])}$ und $${n.s[k]} = ${texU(L, unit, 1)}$ gegeben. Berechne den Winkel $${
        n.wt[k]
      }$ und die Seite $${n.s[i]}$.`,
      figure: (
        <GTFigure
          t={t}
          sides={[0, 1, 2].map((x) =>
            x === k
              ? given(`${n.s[x]} = ${fmtU(L, unit, 1)}`)
              : x === i
              ? asked(`${n.s[x]} = ?`)
              : plain(n.s[x])
          )}
          angles={[0, 1, 2].map((x) =>
            x === k ? asked(`${n.w[x]} = ?`) : given(`${n.w[x]} = ${fmtDeg(ang[x])}`)
          )}
        />
      ),
      fields: [
        { kind: 'num', label: `$${n.wt[k]}$`, value: wk, unit: '°', tol: 0.15 },
        { kind: 'num', label: `$${n.s[i]}$`, value: target, unit },
      ],
      tips: [
        `Für den Sinussatz brauchst du ein vollständiges Paar aus Seite und gegenüberliegendem Winkel. Zu $${n.s[k]}$ fehlt noch der Winkel $${n.wt[k]}$.`,
        `Winkelsumme: $${n.wt[k]} = 180^\\circ - ${n.wt[i]} - ${n.wt[j]}$.`,
        `Jetzt der Sinussatz: $\\dfrac{${n.s[i]}}{\\sin(${n.wt[i]})} = \\dfrac{${n.s[k]}}{\\sin(${n.wt[k]})}$ – nach $${n.s[i]}$ umstellen.`,
      ],
      solution: [
        `Winkelsumme: $${n.wt[k]} = 180^\\circ - ${texDeg(ang[i])} - ${texDeg(ang[j])} = ${texDeg(
          wk
        )}$`,
        `Sinussatz: $\\dfrac{${n.s[i]}}{\\sin(${n.wt[i]})} = \\dfrac{${n.s[k]}}{\\sin(${n.wt[k]})}$`,
        `$${n.s[i]} = \\dfrac{${n.s[k]} \\cdot \\sin(${n.wt[i]})}{\\sin(${
          n.wt[k]
        })} = \\dfrac{${texU(L, unit, 1)} \\cdot \\sin(${texDeg(ang[i])})}{\\sin(${texDeg(
          wk
        )})} \\approx ${texU(target, unit)}$`,
      ],
    };
  }

  if (angleTask || level === 'schwer') {
    // SsW: zwei Seiten und der Winkel gegenüber der größeren -> Winkel gegenüber der kleineren
    let t;
    let i: number, j: number;
    do {
      t = gtFromAngles(randomAngles({ min: 30, max: 110 }), 0, randFloat(4, 12, 1));
      [i, j] = pick(PAIRS);
    } while (t.side[i] - t.side[j] < 0.8);
    const { n } = t;
    const si = round(t.side[i], 1);
    const sj = round(t.side[j], 1);
    const wi = round(t.ang[i], 1);
    const wj = deg(Math.asin((sj * sinD(wi)) / si));
    const k = 3 - i - j;
    const base = [
      `Sinussatz mit den Paaren $${n.s[i]}, ${n.wt[i]}$ und $${n.s[j]}, ${n.wt[j]}$: $\\dfrac{\\sin(${n.wt[j]})}{${n.s[j]}} = \\dfrac{\\sin(${n.wt[i]})}{${n.s[i]}}$`,
      `$\\sin(${n.wt[j]}) = \\dfrac{${texU(sj, unit, 1)} \\cdot \\sin(${texDeg(wi)})}{${texU(
        si,
        unit,
        1
      )}} \\approx ${tex((sj * sinD(wi)) / si, 4)}$`,
      `$${n.wt[j]} = \\sin^{-1}(${tex((sj * sinD(wi)) / si, 4)}) \\approx ${texDeg(
        wj
      )}$ (eindeutig, weil $${n.wt[j]}$ der kleineren Seite gegenüberliegt und daher spitz ist)`,
    ];
    const sideMarks = [0, 1, 2].map((x) =>
      x === i
        ? given(`${n.s[x]} = ${fmtU(si, unit, 1)}`)
        : x === j
        ? given(`${n.s[x]} = ${fmtU(sj, unit, 1)}`)
        : level === 'schwer'
        ? asked(`${n.s[x]} = ?`)
        : plain(n.s[x])
    );
    const angleMarks = [0, 1, 2].map((x) =>
      x === i ? given(`${n.w[x]} = ${fmtDeg(wi)}`) : x === j ? asked(`${n.w[x]} = ?`) : null
    );
    const tips = [
      `Suche das vollständige Paar: Seite $${n.s[i]}$ und der gegenüberliegende Winkel $${n.wt[i]}$ sind beide bekannt.`,
      `Zum gesuchten Winkel $${n.wt[j]}$ gehört die gegenüberliegende Seite $${n.s[j]}$. Stelle den Sinussatz mit den Sinuswerten im Zähler auf: $\\dfrac{\\sin(${n.wt[j]})}{${n.s[j]}} = \\dfrac{\\sin(${n.wt[i]})}{${n.s[i]}}$.`,
      `Nach $\\sin(${n.wt[j]})$ umstellen, ausrechnen und mit $\\sin^{-1}$ den Winkel bestimmen.`,
    ];
    if (level === 'mittel') {
      return {
        key: `w-${si}-${sj}-${wi}`,
        text: `Im Dreieck ${n.V.join('')} sind $${n.s[i]} = ${texU(si, unit, 1)}$, $${
          n.s[j]
        } = ${texU(sj, unit, 1)}$ und $${n.wt[i]} = ${texDeg(wi)}$ gegeben. Berechne den Winkel $${
          n.wt[j]
        }$.`,
        figure: <GTFigure t={t} sides={sideMarks} angles={angleMarks} />,
        fields: [{ kind: 'num', label: `$${n.wt[j]}$`, value: wj, unit: '°', tol: 0.15 }],
        tips,
        solution: base,
      };
    }
    const wk = 180 - wi - wj;
    const sk = (si * sinD(wk)) / sinD(wi);
    return {
      key: `s2-${si}-${sj}-${wi}`,
      text: `Im Dreieck ${n.V.join('')} sind $${n.s[i]} = ${texU(si, unit, 1)}$, $${
        n.s[j]
      } = ${texU(sj, unit, 1)}$ und $${n.wt[i]} = ${texDeg(wi)}$ gegeben. Berechne den Winkel $${
        n.wt[j]
      }$ und die Seite $${n.s[k]}$.`,
      figure: <GTFigure t={t} sides={sideMarks} angles={angleMarks} />,
      fields: [
        { kind: 'num', label: `$${n.wt[j]}$`, value: wj, unit: '°', tol: 0.15 },
        { kind: 'num', label: `$${n.s[k]}$`, value: sk, unit },
      ],
      tips: [
        ...tips,
        `Für $${n.s[k]}$ brauchst du zuerst den Winkel $${n.wt[k]}$ (Winkelsumme), dann noch einmal den Sinussatz.`,
      ],
      solution: [
        ...base,
        `Winkelsumme: $${n.wt[k]} = 180^\\circ - ${texDeg(wi)} - ${texDeg(wj)} \\approx ${texDeg(
          wk
        )}$`,
        `$${n.s[k]} = \\dfrac{${n.s[i]} \\cdot \\sin(${n.wt[k]})}{\\sin(${
          n.wt[i]
        })} = \\dfrac{${texU(si, unit, 1)} \\cdot \\sin(${texDeg(wk)})}{\\sin(${texDeg(
          wi
        )})} \\approx ${texU(sk, unit)}$`,
      ],
    };
  }

  // Seite berechnen: Paar (Seite, Gegenwinkel) bekannt, dazu ein weiterer Winkel
  const ang = randomAngles({ decimals: !standard });
  const [i, j] = standard ? PAIRS[slot % PAIRS.length] : pick(PAIRS);
  const L = randFloat(3, 12, 1);
  const t = gtFromAngles(ang, i, L, standard);
  const { n } = t;
  const target = (L * sinD(ang[j])) / sinD(ang[i]);
  const k = others(i).find((x) => x !== j)!;
  return {
    key: `${i}${j}-${ang[i]}-${ang[j]}-${L}`,
    text: `Im Dreieck ${n.V.join('')} sind $${n.s[i]} = ${texU(L, unit, 1)}$, $${
      n.wt[i]
    } = ${texDeg(ang[i])}$ und $${n.wt[j]} = ${texDeg(ang[j])}$ gegeben. Berechne die Seite $${
      n.s[j]
    }$.`,
    figure: (
      <GTFigure
        t={t}
        sides={[0, 1, 2].map((x) =>
          x === i
            ? given(`${n.s[x]} = ${fmtU(L, unit, 1)}`)
            : x === j
            ? asked(`${n.s[x]} = ?`)
            : plain(n.s[x])
        )}
        angles={[0, 1, 2].map((x) => (x === k ? null : given(`${n.w[x]} = ${fmtDeg(ang[x])}`)))}
      />
    ),
    fields: [{ kind: 'num', label: `$${n.s[j]}$`, value: target, unit }],
    tips: [
      `Seite $${n.s[i]}$ und ihr gegenüberliegender Winkel $${n.wt[i]}$ sind bekannt – das ist ein vollständiges Paar.`,
      `Die gesuchte Seite $${n.s[j]}$ liegt dem Winkel $${n.wt[j]}$ gegenüber. Sinussatz: $\\dfrac{${n.s[j]}}{\\sin(${n.wt[j]})} = \\dfrac{${n.s[i]}}{\\sin(${n.wt[i]})}$.`,
      `Multipliziere mit $\\sin(${n.wt[j]})$, um $${n.s[j]}$ allein zu bekommen.`,
    ],
    solution: [
      `Sinussatz: $\\dfrac{${n.s[j]}}{\\sin(${n.wt[j]})} = \\dfrac{${n.s[i]}}{\\sin(${n.wt[i]})}$`,
      `$${n.s[j]} = \\dfrac{${n.s[i]} \\cdot \\sin(${n.wt[j]})}{\\sin(${n.wt[i]})} = \\dfrac{${texU(
        L,
        unit,
        1
      )} \\cdot \\sin(${texDeg(ang[j])})}{\\sin(${texDeg(ang[i])})} \\approx ${texU(
        target,
        unit
      )}$`,
    ],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Der Sinussatz gilt in **jedem** Dreieck: Das Verhältnis aus einer Seite und dem Sinus ihres **gegenüberliegenden** Winkels ist für alle drei Seiten gleich." />
    </p>
    <BlockMath math="\frac{a}{\sin(\alpha)} = \frac{b}{\sin(\beta)} = \frac{c}{\sin(\gamma)}" />
    <ol className="list-decimal pl-5 space-y-1">
      <li>
        <Rich text="Ein **vollständiges Paar** suchen: eine Seite und der gegenüberliegende Winkel sind bekannt." />
      </li>
      <li>Die gesuchte Größe mit ihrem Gegenstück (Seite ↔ Gegenwinkel) dazuschreiben.</li>
      <li>
        <Rich text="Umstellen und ausrechnen. Ist ein **Winkel** gesucht, schreibe die Sinuswerte in den Zähler und nutze am Ende $\sin^{-1}$." />
      </li>
    </ol>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich
        text={
          'Gegeben: $a = 6\\,\\text{cm}$, $\\alpha = 50^\\circ$, $\\beta = 70^\\circ$. Gesucht: $b$.\n$b = \\dfrac{a \\cdot \\sin(\\beta)}{\\sin(\\alpha)} = \\dfrac{6\\,\\text{cm} \\cdot \\sin(70^\\circ)}{\\sin(50^\\circ)} \\approx 7{,}36\\,\\text{cm}$'
        }
      />
    </div>
  </>
);

export const cfg: TopicConfig = {
  title: 'Sinussatz',
  subtitle: 'Berechne Seiten und Winkel im allgemeinen Dreieck mit gegenüberliegenden Paaren.',
  trackingTopic: 'Sinussatz',
  videoId: 'zA7vfHfNw1E',
  explanation,
  roundingNote: 'Runde Seiten auf zwei und Winkel auf eine Nachkommastelle.',
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC – eine Seite ist gesucht.',
      example: '$b = \\dfrac{a \\cdot \\sin(\\beta)}{\\sin(\\alpha)}$',
    },
    {
      id: 'mittel',
      description: 'Wechselnde Beschriftung – mal ist eine Seite, mal ein Winkel gesucht.',
    },
    {
      id: 'schwer',
      description: 'Zwei Größen gesucht – mit Winkelsumme und Sinussatz kombinieren.',
    },
  ],
  generate,
};

export default function Sinussatz() {
  return <Practice cfg={cfg} />;
}
