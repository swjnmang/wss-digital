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
import { asked, given, plain } from './engine/rightTriangle';
import {
  cosD,
  deg,
  fmtDeg,
  fmtU,
  pick,
  randFloat,
  randInt,
  round,
  sinD,
  tex,
  texDeg,
  texU,
  UNITS,
} from './engine/util';

/** Dreieck aus zwei Seiten an Ecke i und dem Winkel dort. */
function sws(i: number, sj: number, sk: number, wi: number, standard = false) {
  const [j, k] = others(i);
  const sv = [0, 0, 0] as [number, number, number];
  sv[j] = sj;
  sv[k] = sk;
  sv[i] = Math.sqrt(sj * sj + sk * sk - 2 * sj * sk * cosD(wi));
  return gtFromSides(sv, standard);
}

const areaFormula = (s: string[], w: string[], i: number) => {
  const [j, k] = others(i);
  return `A = \\tfrac{1}{2} \\cdot ${s[j]} \\cdot ${s[k]} \\cdot \\sin(${w[i]})`;
};

function generate(level: Level, slot: number): Task {
  const unit = pick(UNITS);
  const standard = level === 'einfach';
  const area = `\\text{${unit}}^2`;

  if (level === 'schwer') {
    if (slot % 2 === 0) {
      // Zwei Seiten an Ecke i, aber nur die beiden anderen Winkel gegeben -> Winkelsumme
      const ang = randomAngles({ decimals: true });
      const i = randInt(0, 2);
      const [j, k] = others(i);
      const raw = gtFromAngles(ang, j, randFloat(4, 12, 1));
      const sj = round(raw.side[j], 1);
      const sk = round(raw.side[k], 1);
      const wi = 180 - ang[j] - ang[k];
      const A = 0.5 * sj * sk * sinD(wi);
      const t = sws(i, sj, sk, wi);
      const { n } = t;
      return {
        key: `s1-${sj}-${sk}-${ang.join('-')}`,
        text: `Im Dreieck ${n.V.join('')} sind $${n.s[j]} = ${texU(sj, unit, 1)}$, $${
          n.s[k]
        } = ${texU(sk, unit, 1)}$, $${n.wt[j]} = ${texDeg(ang[j])}$ und $${n.wt[k]} = ${texDeg(
          ang[k]
        )}$ gegeben. Berechne den Winkel $${n.wt[i]}$ und den Flächeninhalt $A$.`,
        figure: (
          <GTFigure
            t={t}
            sides={[0, 1, 2].map((x) =>
              x === i ? plain(n.s[x]) : given(`${n.s[x]} = ${fmtU(x === j ? sj : sk, unit, 1)}`)
            )}
            angles={[0, 1, 2].map((x) =>
              x === i ? asked(`${n.w[x]} = ?`) : given(`${n.w[x]} = ${fmtDeg(ang[x])}`)
            )}
          />
        ),
        fields: [
          { kind: 'num', label: `$${n.wt[i]}$`, value: wi, unit: '°', tol: 0.15 },
          { kind: 'num', label: '$A$', value: A, unit: `${unit}²` },
        ],
        tips: [
          `Für den Flächensatz brauchst du den Winkel **zwischen** den beiden bekannten Seiten $${n.s[j]}$ und $${n.s[k]}$. Das ist $${n.wt[i]}$.`,
          `Winkelsumme: $${n.wt[i]} = 180^\\circ - ${n.wt[j]} - ${n.wt[k]}$.`,
          `Flächensatz: $${areaFormula(n.s, n.wt, i)}$.`,
        ],
        solution: [
          `Winkelsumme: $${n.wt[i]} = 180^\\circ - ${texDeg(ang[j])} - ${texDeg(ang[k])} = ${texDeg(
            wi
          )}$`,
          `$${areaFormula(n.s, n.wt, i)}$`,
          `$A = \\tfrac{1}{2} \\cdot ${texU(sj, unit, 1)} \\cdot ${texU(
            sk,
            unit,
            1
          )} \\cdot \\sin(${texDeg(wi)}) \\approx ${tex(A)}\\,${area}$`,
        ],
      };
    }
    // Eine Seite und zwei Winkel -> zweite Seite mit Sinussatz, dann Fläche
    const ang = randomAngles({ decimals: true });
    const i = randInt(0, 2);
    const [j, k] = others(i);
    const sj = randFloat(4, 12, 1);
    const sk = (sj * sinD(ang[k])) / sinD(ang[j]);
    const A = 0.5 * sj * sk * sinD(ang[i]);
    const t = gtFromAngles(ang, j, sj);
    const { n } = t;
    return {
      key: `s2-${sj}-${ang.join('-')}`,
      text: `Im Dreieck ${n.V.join('')} sind $${n.s[j]} = ${texU(sj, unit, 1)}$, $${
        n.wt[j]
      } = ${texDeg(ang[j])}$ und $${n.wt[k]} = ${texDeg(
        ang[k]
      )}$ gegeben. Berechne zuerst die Seite $${n.s[k]}$ und dann den Flächeninhalt $A$.`,
      figure: (
        <GTFigure
          t={t}
          sides={[0, 1, 2].map((x) =>
            x === j
              ? given(`${n.s[x]} = ${fmtU(sj, unit, 1)}`)
              : x === k
              ? asked(`${n.s[x]} = ?`)
              : plain(n.s[x])
          )}
          angles={[0, 1, 2].map((x) => (x === i ? null : given(`${n.w[x]} = ${fmtDeg(ang[x])}`)))}
        />
      ),
      fields: [
        { kind: 'num', label: `$${n.s[k]}$`, value: sk, unit },
        { kind: 'num', label: '$A$', value: A, unit: `${unit}²`, tol: Math.max(A * 0.015, 0.02) },
      ],
      tips: [
        `Seite $${n.s[j]}$ und Gegenwinkel $${n.wt[j]}$ bilden ein Paar → Sinussatz: $${n.s[k]} = \\dfrac{${n.s[j]} \\cdot \\sin(${n.wt[k]})}{\\sin(${n.wt[j]})}$.`,
        `Für die Fläche brauchst du den Winkel zwischen $${n.s[j]}$ und $${n.s[k]}$: $${n.wt[i]} = 180^\\circ - ${n.wt[j]} - ${n.wt[k]}$.`,
        `Flächensatz: $${areaFormula(n.s, n.wt, i)}$.`,
      ],
      solution: [
        `Sinussatz: $${n.s[k]} = \\dfrac{${texU(sj, unit, 1)} \\cdot \\sin(${texDeg(
          ang[k]
        )})}{\\sin(${texDeg(ang[j])})} \\approx ${texU(sk, unit)}$`,
        `Winkelsumme: $${n.wt[i]} = 180^\\circ - ${texDeg(ang[j])} - ${texDeg(ang[k])} = ${texDeg(
          ang[i]
        )}$`,
        `$A = \\tfrac{1}{2} \\cdot ${texU(sj, unit, 1)} \\cdot ${texU(
          sk,
          unit
        )} \\cdot \\sin(${texDeg(ang[i])}) \\approx ${tex(A)}\\,${area}$`,
      ],
    };
  }

  const i = standard ? slot % 3 : randInt(0, 2);
  const [j, k] = others(i);
  const sj = randFloat(3, 12, 1);
  const sk = randFloat(3, 12, 1);

  if (level === 'mittel' && slot % 2 === 1) {
    // Fläche und zwei Seiten gegeben -> eingeschlossener (spitzer) Winkel
    const w0 = randInt(20, 85);
    const A = round(0.5 * sj * sk * sinD(w0), 1);
    const sv = (2 * A) / (sj * sk);
    const wi = deg(Math.asin(sv));
    const t = sws(i, sj, sk, wi);
    const { n } = t;
    return {
      key: `m2-${sj}-${sk}-${A}`,
      text: `Das Dreieck ${n.V.join('')} hat den Flächeninhalt $A = ${tex(
        A,
        1
      )}\\,${area}$. Außerdem ist $${n.s[j]} = ${texU(sj, unit, 1)}$ und $${n.s[k]} = ${texU(
        sk,
        unit,
        1
      )}$. Berechne den spitzen Winkel $${n.wt[i]}$.`,
      figure: (
        <GTFigure
          t={t}
          sides={[0, 1, 2].map((x) =>
            x === i ? plain(n.s[x]) : given(`${n.s[x]} = ${fmtU(x === j ? sj : sk, unit, 1)}`)
          )}
          angles={[0, 1, 2].map((x) => (x === i ? asked(`${n.w[x]} = ?`) : null))}
        />
      ),
      fields: [{ kind: 'num', label: `$${n.wt[i]}$`, value: wi, unit: '°', tol: 0.15 }],
      tips: [
        `Der Winkel $${n.wt[i]}$ liegt zwischen $${n.s[j]}$ und $${
          n.s[k]
        }$. Flächensatz: $${areaFormula(n.s, n.wt, i)}$.`,
        `Stelle nach dem Sinus um: $\\sin(${n.wt[i]}) = \\dfrac{2A}{${n.s[j]} \\cdot ${n.s[k]}}$.`,
        `Rechne den Bruch aus und nutze $\\sin^{-1}$.`,
      ],
      solution: [
        `$${areaFormula(n.s, n.wt, i)}$ $\\Rightarrow$ $\\sin(${n.wt[i]}) = \\dfrac{2A}{${
          n.s[j]
        } \\cdot ${n.s[k]}}$`,
        `$\\sin(${n.wt[i]}) = \\dfrac{2 \\cdot ${tex(A, 1)}}{${tex(sj, 1)} \\cdot ${tex(
          sk,
          1
        )}} \\approx ${tex(sv, 4)}$`,
        `$${n.wt[i]} = \\sin^{-1}(${tex(sv, 4)}) \\approx ${texDeg(wi)}$`,
      ],
    };
  }

  const wi = randInt(25, 140);

  if (level === 'mittel') {
    // Fläche, eine Seite und Winkel gegeben -> andere Seite
    const A = round(0.5 * sj * sk * sinD(wi), 1);
    const target = (2 * A) / (sj * sinD(wi));
    const t = sws(i, sj, target, wi);
    const { n } = t;
    return {
      key: `m1-${sj}-${wi}-${A}`,
      text: `Das Dreieck ${n.V.join('')} hat den Flächeninhalt $A = ${tex(
        A,
        1
      )}\\,${area}$. Außerdem ist $${n.s[j]} = ${texU(sj, unit, 1)}$ und $${n.wt[i]} = ${texDeg(
        wi
      )}$. Berechne die Seite $${n.s[k]}$.`,
      figure: (
        <GTFigure
          t={t}
          sides={[0, 1, 2].map((x) =>
            x === j
              ? given(`${n.s[x]} = ${fmtU(sj, unit, 1)}`)
              : x === k
              ? asked(`${n.s[x]} = ?`)
              : plain(n.s[x])
          )}
          angles={[0, 1, 2].map((x) => (x === i ? given(`${n.w[x]} = ${fmtDeg(wi)}`) : null))}
        />
      ),
      fields: [{ kind: 'num', label: `$${n.s[k]}$`, value: target, unit }],
      tips: [
        `Der Winkel $${n.wt[i]}$ liegt zwischen $${n.s[j]}$ und $${
          n.s[k]
        }$. Flächensatz: $${areaFormula(n.s, n.wt, i)}$.`,
        `Stelle nach $${n.s[k]}$ um: $${n.s[k]} = \\dfrac{2A}{${n.s[j]} \\cdot \\sin(${n.wt[i]})}$.`,
      ],
      solution: [
        `$${areaFormula(n.s, n.wt, i)}$ $\\Rightarrow$ $${n.s[k]} = \\dfrac{2A}{${
          n.s[j]
        } \\cdot \\sin(${n.wt[i]})}$`,
        `$${n.s[k]} = \\dfrac{2 \\cdot ${tex(A, 1)}}{${tex(sj, 1)} \\cdot \\sin(${texDeg(
          wi
        )})} \\approx ${texU(target, unit)}$`,
      ],
    };
  }

  // einfach: Fläche aus zwei Seiten und eingeschlossenem Winkel
  const t = sws(i, sj, sk, wi, standard);
  const { n } = t;
  const A = 0.5 * sj * sk * sinD(wi);
  return {
    key: `e-${sj}-${sk}-${wi}`,
    text: `Im Dreieck ${n.V.join('')} sind $${n.s[j]} = ${texU(sj, unit, 1)}$, $${n.s[k]} = ${texU(
      sk,
      unit,
      1
    )}$ und $${n.wt[i]} = ${texDeg(wi)}$ gegeben. Berechne den Flächeninhalt $A$.`,
    figure: (
      <GTFigure
        t={t}
        sides={[0, 1, 2].map((x) =>
          x === i ? plain(n.s[x]) : given(`${n.s[x]} = ${fmtU(x === j ? sj : sk, unit, 1)}`)
        )}
        angles={[0, 1, 2].map((x) => (x === i ? given(`${n.w[x]} = ${fmtDeg(wi)}`) : null))}
      />
    ),
    fields: [{ kind: 'num', label: '$A$', value: A, unit: `${unit}²` }],
    tips: [
      `Der Winkel $${n.wt[i]}$ liegt genau zwischen den beiden gegebenen Seiten – perfekt für den Flächensatz.`,
      `$${areaFormula(n.s, n.wt, i)}$`,
      `Achte auf die Einheit: Flächen haben die Einheit ${unit}².`,
    ],
    solution: [
      `$${areaFormula(n.s, n.wt, i)}$`,
      `$A = \\tfrac{1}{2} \\cdot ${texU(sj, unit, 1)} \\cdot ${texU(
        sk,
        unit,
        1
      )} \\cdot \\sin(${texDeg(wi)}) \\approx ${tex(A)}\\,${area}$`,
    ],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Kennst du **zwei Seiten und den Winkel dazwischen**, kannst du den Flächeninhalt jedes Dreiecks direkt berechnen – ohne vorher die Höhe zu bestimmen. Die Höhe steckt im Sinus: z. B. $h_c = b \cdot \sin(\alpha)$." />
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-center text-sm">
      <BlockMath math="A = \tfrac{1}{2}\, b c \sin(\alpha)" />
      <BlockMath math="A = \tfrac{1}{2}\, a c \sin(\beta)" />
      <BlockMath math="A = \tfrac{1}{2}\, a b \sin(\gamma)" />
    </div>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich
        text={
          'Gegeben: $a = 6\\,\\text{cm}$, $b = 4\\,\\text{cm}$, $\\gamma = 30^\\circ$.\n$A = \\tfrac{1}{2} \\cdot 6\\,\\text{cm} \\cdot 4\\,\\text{cm} \\cdot \\sin(30^\\circ) = 6\\,\\text{cm}^2$'
        }
      />
    </div>
    <p className="text-sm text-slate-500">
      <Rich text="Wichtig: Der Winkel muss **zwischen** den beiden Seiten liegen. Fehlt er, hilft oft die Winkelsumme oder der Sinussatz." />
    </p>
  </>
);

export const cfg: TopicConfig = {
  title: 'Flächensatz',
  subtitle: 'Berechne Flächeninhalte und fehlende Größen im allgemeinen Dreieck.',
  trackingTopic: 'Flächensatz',
  videoId: 'JFoLf3uT4DM',
  explanation,
  roundingNote: 'Runde auf zwei Nachkommastellen (Winkel auf eine).',
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC – Flächeninhalt aus zwei Seiten und dem eingeschlossenen Winkel.',
      example: '$A = \\tfrac{1}{2}ab\\sin(\\gamma)$',
    },
    {
      id: 'mittel',
      description: 'Rückwärts rechnen: Aus der Fläche eine Seite oder einen Winkel bestimmen.',
    },
    {
      id: 'schwer',
      description: 'Erst den passenden Winkel bzw. die passende Seite berechnen, dann die Fläche.',
    },
  ],
  generate,
};

export default function Flaechensatz() {
  return <Practice cfg={cfg} />;
}
