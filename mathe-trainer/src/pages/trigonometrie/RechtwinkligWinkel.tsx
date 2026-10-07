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
  makeRT,
  plain,
  roleIndex,
  type Fn,
  type RT,
} from './engine/rightTriangle';
import { deg, fmtU, pick, randFloat, randInt, round, texDeg, texU, UNITS } from './engine/util';

const FNS: Fn[] = ['sin', 'cos', 'tan'];

/** Winkel aus zwei (gerundet angegebenen) Seiten berechnen. */
function angleFrom(fn: Fn, num: number, den: number) {
  const q = num / den;
  return deg(fn === 'sin' ? Math.asin(q) : fn === 'cos' ? Math.acos(q) : Math.atan(q));
}

function angleSolution(t: RT, fn: Fn, vals: number[], unit: string, result: number) {
  const { n } = t;
  const th = n.wt[t.p];
  const [nr, dr] = FN_RATIO[fn];
  const ni = roleIndex(t, nr);
  const di = roleIndex(t, dr);
  const q = vals[ni] / vals[di];
  return [
    `Vom Winkel $${th}$ aus: Hypotenuse $${n.s[t.r]}$, Gegenkathete $${n.s[t.p]}$, Ankathete $${
      n.s[t.q]
    }$.`,
    `${ROLE_NAME[nr]} und ${ROLE_NAME[dr]} sind bekannt → ${
      FN_NAME[fn]
    }: $\\${fn}(${th}) = \\dfrac{${n.s[ni]}}{${n.s[di]}} = \\dfrac{${texU(
      vals[ni],
      unit,
      1
    )}}{${texU(vals[di], unit, 1)}} \\approx ${String(round(q, 4)).replace('.', '{,}')}$`,
    `Mit der Umkehrfunktion: $${th} = \\${fn}^{-1}\\left(${String(round(q, 4)).replace(
      '.',
      '{,}'
    )}\\right) \\approx ${texDeg(result)}$`,
  ];
}

function generate(level: Level, slot: number): Task {
  const standard = level === 'einfach';
  const unit = pick(UNITS);
  const fn = level === 'einfach' ? FNS[slot % 3] : pick(FNS);
  const theta0 = randInt(18, 72);
  const t = makeRT({ theta: theta0, hyp: randFloat(4, 14, 1), standard });
  const { n } = t;
  // angezeigte Seiten werden auf eine Nachkommastelle gerundet; das Ergebnis wird daraus berechnet
  const vals = t.side.map((s) => round(s, 1));
  const [nr, dr] = FN_RATIO[fn];
  const ni = roleIndex(t, nr);
  const di = roleIndex(t, dr);
  const theta = angleFrom(fn, vals[ni], vals[di]);
  const th = n.wt[t.p];

  const sideMarks = [0, 1, 2].map((i) =>
    i === ni || i === di ? given(`${n.s[i]} = ${fmtU(vals[i], unit, 1)}`) : plain(n.s[i])
  );

  if (level === 'schwer') {
    const other = 90 - theta;
    const angleMarks = [0, 1, 2].map((i) =>
      i === t.p || i === t.q ? asked(`${n.w[i]} = ?`) : null
    );
    return {
      key: `s-${fn}-${vals.join('-')}`,
      text: `Im rechtwinkligen Dreieck ${n.V.join('')} sind $${n.s[ni]} = ${texU(
        vals[ni],
        unit,
        1
      )}$ und $${n.s[di]} = ${texU(
        vals[di],
        unit,
        1
      )}$ bekannt. Berechne die beiden spitzen Winkel $${n.wt[t.p]}$ und $${n.wt[t.q]}$.`,
      figure: <RTFigure t={t} sides={sideMarks} angles={angleMarks} />,
      fields: [
        { kind: 'num', label: `$${n.wt[t.p]}$`, value: theta, unit: '°', tol: 0.15 },
        { kind: 'num', label: `$${n.wt[t.q]}$`, value: other, unit: '°', tol: 0.15 },
      ],
      tips: [
        `Wo liegt der rechte Winkel? Die Seite gegenüber ist die Hypotenuse $${n.s[t.r]}$.`,
        `Beginne mit $${th}$: Welche Rolle haben $${n.s[ni]}$ und $${n.s[di]}$ von $${th}$ aus gesehen? Wähle dazu die passende Winkelfunktion.`,
        `Für den zweiten Winkel hilft die Winkelsumme: $${n.wt[t.p]} + ${
          n.wt[t.q]
        } + 90^\\circ = 180^\\circ$.`,
      ],
      solution: [
        ...angleSolution(t, fn, vals, unit, theta),
        `Winkelsumme: $${n.wt[t.q]} = 180^\\circ - 90^\\circ - ${texDeg(theta)} \\approx ${texDeg(
          other
        )}$`,
      ],
    };
  }

  const angleMarks = [0, 1, 2].map((i) => (i === t.p ? asked(`${n.w[i]} = ?`) : null));
  return {
    key: `${fn}-${vals.join('-')}`,
    text: `Im rechtwinkligen Dreieck ${n.V.join('')} sind $${n.s[ni]} = ${texU(
      vals[ni],
      unit,
      1
    )}$ und $${n.s[di]} = ${texU(vals[di], unit, 1)}$ gegeben. Berechne den Winkel $${th}$.`,
    figure: <RTFigure t={t} sides={sideMarks} angles={angleMarks} />,
    fields: [{ kind: 'num', label: `$${th}$`, value: theta, unit: '°', tol: 0.15 }],
    tips: [
      `Schau vom Winkel $${th}$ aus: Hypotenuse $${
        n.s[t.r]
      }$ (gegenüber dem rechten Winkel), Gegenkathete $${
        n.s[t.p]
      }$ (gegenüber von $${th}$), Ankathete $${n.s[t.q]}$ (am Winkel).`,
      `Gegeben sind ${ROLE_NAME[nr]} und ${ROLE_NAME[dr]}. Das passt zum ${FN_NAME[fn]}: $\\${fn}(${th}) = \\dfrac{${n.s[ni]}}{${n.s[di]}}$.`,
      `Rechne erst den Bruch aus und nutze dann die Umkehrfunktion $\\${fn}^{-1}$ (am Taschenrechner meist SHIFT + ${fn}).`,
    ],
    solution: angleSolution(t, fn, vals, unit, theta),
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Sind zwei Seiten eines rechtwinkligen Dreiecks bekannt, kannst du einen Winkel berechnen. Benenne die Seiten **vom gesuchten Winkel aus**, wähle die passende Winkelfunktion und löse mit der **Umkehrfunktion** ($\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$) nach dem Winkel auf." />
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
      <BlockMath math="\sin(\alpha) = \frac{\text{GK}}{\text{H}}" />
      <BlockMath math="\cos(\alpha) = \frac{\text{AK}}{\text{H}}" />
      <BlockMath math="\tan(\alpha) = \frac{\text{GK}}{\text{AK}}" />
    </div>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich
        text={
          'Gegeben: $a = 3\\,\\text{cm}$ (Gegenkathete von $\\alpha$), $c = 6\\,\\text{cm}$ (Hypotenuse).\n$\\sin(\\alpha) = \\dfrac{3}{6} = 0{,}5$ $\\Rightarrow$ $\\alpha = \\sin^{-1}(0{,}5) = 30^\\circ$\nDen zweiten spitzen Winkel bekommst du über die Winkelsumme: $\\beta = 180^\\circ - 90^\\circ - 30^\\circ = 60^\\circ$.'
        }
      />
    </div>
  </>
);

export const cfg: TopicConfig = {
  title: 'Winkel berechnen mit Sinus, Kosinus und Tangens',
  subtitle: 'Bestimme fehlende Winkel im rechtwinkligen Dreieck aus zwei Seiten.',
  trackingTopic: 'Winkel berechnen',
  videoId: 'EsW65RuykZ8',
  pdf: '/downloads/winkel-berechnen-sinus-kosinus-tangens-uebungen.pdf',
  explanation,
  roundingNote: 'Runde Winkel auf eine Nachkommastelle.',
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC mit rechtem Winkel bei C – ein Winkel ist gesucht.',
      example: '$\\alpha = \\sin^{-1}\\left(\\frac{a}{c}\\right)$',
    },
    {
      id: 'mittel',
      description: 'Wechselnde Beschriftung, der rechte Winkel kann an jeder Ecke liegen.',
    },
    { id: 'schwer', description: 'Berechne beide spitzen Winkel des Dreiecks.' },
  ],
  generate,
};

export default function RechtwinkligWinkel() {
  return <Practice cfg={cfg} />;
}
