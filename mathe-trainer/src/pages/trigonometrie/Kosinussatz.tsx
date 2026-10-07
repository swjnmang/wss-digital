import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Practice from './engine/Practice';
import Rich from '../raum_und_form/engine/Rich';
import type { Level, Task, TopicConfig } from './engine/types';
import {
  GTFigure,
  gtFromAngles,
  gtFromSides,
  others,
  randomAngles,
} from './engine/generalTriangle';
import { asked, given } from './engine/rightTriangle';
import {
  cosD,
  deg,
  fmtDeg,
  fmtU,
  pick,
  randFloat,
  randInt,
  round,
  tex,
  texDeg,
  texU,
  UNITS,
} from './engine/util';

/** Kosinussatz für die Seite gegenüber Ecke i (KaTeX). */
const law = (s: string[], w: string[], i: number) => {
  const [j, k] = others(i);
  return `${s[i]}^2 = ${s[j]}^2 + ${s[k]}^2 - 2 \\cdot ${s[j]} \\cdot ${s[k]} \\cdot \\cos(${w[i]})`;
};

/** nach dem Winkel an Ecke i umgestellt */
const lawAngle = (s: string[], w: string[], i: number) => {
  const [j, k] = others(i);
  return `\\cos(${w[i]}) = \\dfrac{${s[j]}^2 + ${s[k]}^2 - ${s[i]}^2}{2 \\cdot ${s[j]} \\cdot ${s[k]}}`;
};

function generate(level: Level, slot: number): Task {
  const unit = pick(UNITS);
  const standard = level === 'einfach';

  if (level === 'mittel') {
    // SSS -> Winkel
    const raw = gtFromAngles(randomAngles({ min: 30, max: 120 }), 0, randFloat(4, 12, 1));
    const sv = raw.side.map((x) => round(x, 1)) as [number, number, number];
    const t = gtFromSides(sv);
    const { n } = t;
    const i = slot % 3;
    const [j, k] = others(i);
    const c = (sv[j] ** 2 + sv[k] ** 2 - sv[i] ** 2) / (2 * sv[j] * sv[k]);
    const w = deg(Math.acos(c));
    return {
      key: `m-${sv.join('-')}-${i}`,
      text: `Im Dreieck ${n.V.join('')} sind alle drei Seiten bekannt: $${n.s[0]} = ${texU(
        sv[0],
        unit,
        1
      )}$, $${n.s[1]} = ${texU(sv[1], unit, 1)}$, $${n.s[2]} = ${texU(
        sv[2],
        unit,
        1
      )}$. Berechne den Winkel $${n.wt[i]}$.`,
      figure: (
        <GTFigure
          t={t}
          sides={[0, 1, 2].map((x) => given(`${n.s[x]} = ${fmtU(sv[x], unit, 1)}`))}
          angles={[0, 1, 2].map((x) => (x === i ? asked(`${n.w[x]} = ?`) : null))}
        />
      ),
      fields: [{ kind: 'num', label: `$${n.wt[i]}$`, value: w, unit: '°', tol: 0.15 }],
      tips: [
        `Der gesuchte Winkel $${n.wt[i]}$ liegt der Seite $${
          n.s[i]
        }$ gegenüber. Schreibe den Kosinussatz für $${n.s[i]}^2$ auf: $${law(n.s, n.wt, i)}$.`,
        `Stelle nach $\\cos(${n.wt[i]})$ um: $${lawAngle(n.s, n.wt, i)}$.`,
        `Rechne den Bruch aus und bestimme den Winkel mit $\\cos^{-1}$. Ist der Bruch negativ, ist der Winkel stumpf.`,
      ],
      solution: [
        `$${lawAngle(n.s, n.wt, i)}$`,
        `$\\cos(${n.wt[i]}) = \\dfrac{${tex(sv[j], 1)}^2 + ${tex(sv[k], 1)}^2 - ${tex(
          sv[i],
          1
        )}^2}{2 \\cdot ${tex(sv[j], 1)} \\cdot ${tex(sv[k], 1)}} \\approx ${tex(c, 4)}$`,
        `$${n.wt[i]} = \\cos^{-1}(${tex(c, 4)}) \\approx ${texDeg(w)}$`,
      ],
    };
  }

  // SWS -> dritte Seite (schwer: zusätzlich ein weiterer Winkel)
  const i = standard ? slot % 3 : randInt(0, 2);
  const [j, k] = others(i);
  const sv = [0, 0, 0] as [number, number, number];
  sv[j] = randFloat(3, 12, 1);
  sv[k] = randFloat(3, 12, 1);
  const wi = level === 'schwer' && slot % 2 === 0 ? randInt(95, 140) : randInt(25, 115);
  const si = Math.sqrt(sv[j] ** 2 + sv[k] ** 2 - 2 * sv[j] * sv[k] * cosD(wi));
  sv[i] = si;
  const t = gtFromSides(sv, standard);
  const { n } = t;
  const solution = [
    `Gegeben sind zwei Seiten und der **eingeschlossene** Winkel $${n.wt[i]}$ → Kosinussatz für die gegenüberliegende Seite $${n.s[i]}$:`,
    `$${law(n.s, n.wt, i)}$`,
    `$${n.s[i]}^2 = ${tex(sv[j], 1)}^2 + ${tex(sv[k], 1)}^2 - 2 \\cdot ${tex(
      sv[j],
      1
    )} \\cdot ${tex(sv[k], 1)} \\cdot \\cos(${texDeg(wi)}) \\approx ${tex(si * si, 2)}$`,
    `$${n.s[i]} = \\sqrt{${tex(si * si, 2)}} \\approx ${texU(si, unit)}$`,
  ];
  const tips = [
    `Der Winkel $${n.wt[i]}$ liegt zwischen den beiden bekannten Seiten $${n.s[j]}$ und $${n.s[k]}$. Gesucht ist die Seite gegenüber: $${n.s[i]}$.`,
    `Kosinussatz: $${law(n.s, n.wt, i)}$.`,
    `Setze ein, rechne alles auf der rechten Seite aus und ziehe zum Schluss die Wurzel.${
      wi > 90
        ? ' Der Kosinus eines stumpfen Winkels ist negativ – aus „minus“ wird dann „plus“.'
        : ''
    }`,
  ];

  if (level === 'schwer') {
    const cj = (si * si + sv[k] ** 2 - sv[j] ** 2) / (2 * si * sv[k]);
    const wj = deg(Math.acos(cj));
    return {
      key: `s-${sv[j]}-${sv[k]}-${wi}`,
      text: `Im Dreieck ${n.V.join('')} sind $${n.s[j]} = ${texU(sv[j], unit, 1)}$, $${
        n.s[k]
      } = ${texU(sv[k], unit, 1)}$ und $${n.wt[i]} = ${texDeg(wi)}$ gegeben. Berechne die Seite $${
        n.s[i]
      }$ und anschließend den Winkel $${n.wt[j]}$.`,
      figure: (
        <GTFigure
          t={t}
          sides={[0, 1, 2].map((x) =>
            x === i ? asked(`${n.s[x]} = ?`) : given(`${n.s[x]} = ${fmtU(sv[x], unit, 1)}`)
          )}
          angles={[0, 1, 2].map((x) =>
            x === i ? given(`${n.w[x]} = ${fmtDeg(wi)}`) : x === j ? asked(`${n.w[x]} = ?`) : null
          )}
        />
      ),
      fields: [
        { kind: 'num', label: `$${n.s[i]}$`, value: si, unit },
        { kind: 'num', label: `$${n.wt[j]}$`, value: wj, unit: '°', tol: 0.2 },
      ],
      tips: [
        ...tips,
        `Für $${n.wt[j]}$ kennst du jetzt alle drei Seiten: $${lawAngle(n.s, n.wt, j)}$.`,
      ],
      solution: [
        ...solution,
        `Jetzt sind alle Seiten bekannt: $${lawAngle(n.s, n.wt, j)} \\approx ${tex(cj, 4)}$`,
        `$${n.wt[j]} = \\cos^{-1}(${tex(cj, 4)}) \\approx ${texDeg(wj)}$`,
      ],
    };
  }

  return {
    key: `e-${sv[j]}-${sv[k]}-${wi}`,
    text: `Im Dreieck ${n.V.join('')} sind $${n.s[j]} = ${texU(sv[j], unit, 1)}$, $${
      n.s[k]
    } = ${texU(sv[k], unit, 1)}$ und $${n.wt[i]} = ${texDeg(wi)}$ gegeben. Berechne die Seite $${
      n.s[i]
    }$.`,
    figure: (
      <GTFigure
        t={t}
        sides={[0, 1, 2].map((x) =>
          x === i ? asked(`${n.s[x]} = ?`) : given(`${n.s[x]} = ${fmtU(sv[x], unit, 1)}`)
        )}
        angles={[0, 1, 2].map((x) => (x === i ? given(`${n.w[x]} = ${fmtDeg(wi)}`) : null))}
      />
    ),
    fields: [{ kind: 'num', label: `$${n.s[i]}$`, value: si, unit }],
    tips,
    solution,
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Der Kosinussatz gilt in **jedem** Dreieck. Du brauchst ihn, wenn kein vollständiges Paar (Seite + Gegenwinkel) bekannt ist – also bei **zwei Seiten und dem eingeschlossenen Winkel** (SWS) oder bei **drei Seiten** (SSS)." />
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-center text-sm">
      <BlockMath math="a^2 = b^2 + c^2 - 2bc\cdot\cos(\alpha)" />
      <BlockMath math="b^2 = a^2 + c^2 - 2ac\cdot\cos(\beta)" />
      <BlockMath math="c^2 = a^2 + b^2 - 2ab\cdot\cos(\gamma)" />
    </div>
    <p>
      <Rich text="**Winkel gesucht?** Stelle nach dem Kosinus um, z. B. $\cos(\alpha) = \dfrac{b^2 + c^2 - a^2}{2bc}$, und nutze $\cos^{-1}$." />
    </p>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich
        text={
          'Gegeben: $b = 5\\,\\text{cm}$, $c = 7\\,\\text{cm}$, $\\alpha = 60^\\circ$. Gesucht: $a$.\n$a^2 = 5^2 + 7^2 - 2 \\cdot 5 \\cdot 7 \\cdot \\cos(60^\\circ) = 39$ $\\Rightarrow$ $a = \\sqrt{39} \\approx 6{,}24\\,\\text{cm}$'
        }
      />
    </div>
  </>
);

export const cfg: TopicConfig = {
  title: 'Kosinussatz',
  subtitle: 'Berechne fehlende Seiten und Winkel im allgemeinen Dreieck.',
  trackingTopic: 'Kosinussatz',
  videoId: 'pLu62FC_m9s',
  explanation,
  roundingNote: 'Runde Seiten auf zwei und Winkel auf eine Nachkommastelle.',
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC – zwei Seiten und der eingeschlossene Winkel sind gegeben.',
      example: '$a^2 = b^2 + c^2 - 2bc\\cos(\\alpha)$',
    },
    {
      id: 'mittel',
      description:
        'Alle drei Seiten sind gegeben – berechne einen Winkel. Wechselnde Beschriftung.',
    },
    {
      id: 'schwer',
      description: 'Erst die dritte Seite, dann einen weiteren Winkel – auch mit stumpfen Winkeln.',
    },
  ],
  generate,
};

export default function Kosinussatz() {
  return <Practice cfg={cfg} />;
}
