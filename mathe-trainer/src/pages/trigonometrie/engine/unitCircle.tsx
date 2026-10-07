import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GeoGebraSineUnitCircle from '../../../components/GeoGebraSineUnitCircle';
import Rich from '../../raum_und_form/engine/Rich';
import type { Level, Task, TopicConfig } from './types';
import { chance, cosD, deg, pick, randFloat, randInt, sinD, tex, texDeg } from './util';

export type CircleFn = 'sin' | 'cos';

const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

const val = (fn: CircleFn, a: number) => (fn === 'sin' ? sinD(a) : cosD(a));

/** exakter Wert als KaTeX für besondere Winkel */
function exact(v: number) {
  const s = v < -1e-9 ? '-' : '';
  const x = Math.abs(v);
  if (x < 1e-9) return '0';
  if (Math.abs(x - 0.5) < 1e-6) return `${s}\\tfrac{1}{2}`;
  if (Math.abs(x - Math.SQRT1_2) < 1e-6) return `${s}\\tfrac{\\sqrt{2}}{2}`;
  if (Math.abs(x - Math.sqrt(3) / 2) < 1e-6) return `${s}\\tfrac{\\sqrt{3}}{2}`;
  return `${s}1`;
}

const quadrant = (a: number) => {
  const x = ((a % 360) + 360) % 360;
  return x < 90 ? 1 : x < 180 ? 2 : x < 270 ? 3 : 4;
};

// ---------- Einheitskreis-Skizze ----------

interface SketchProps {
  fn: CircleFn;
  points?: { angle: number; label: string; color?: string }[];
  /** Hilfslinie y = k (sin) bzw. x = k (cos) */
  level?: number;
}

export function UnitCircleSketch({ fn, points = [], level }: SketchProps) {
  const S = 240;
  const c = S / 2;
  const r = 85;
  const P = (a: number) => ({ x: c + r * cosD(a), y: c - r * sinD(a) });
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className="w-full max-w-[260px] mx-auto"
      role="img"
      aria-label="Einheitskreis"
    >
      <line x1={10} y1={c} x2={S - 10} y2={c} stroke="#94a3b8" />
      <line x1={c} y1={10} x2={c} y2={S - 10} stroke="#94a3b8" />
      <circle cx={c} cy={c} r={r} fill="#eff6ff" stroke="#1e293b" strokeWidth={1.5} />
      {[0, 90, 180, 270].map((a) => {
        const p = { x: c + (r + 16) * cosD(a), y: c - (r + 16) * sinD(a) };
        return (
          <text
            key={a}
            x={p.x}
            y={p.y}
            fontSize={10}
            fill="#64748b"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {a}°
          </text>
        );
      })}
      {level !== undefined &&
        (fn === 'sin' ? (
          <line
            x1={20}
            y1={c - r * level}
            x2={S - 20}
            y2={c - r * level}
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        ) : (
          <line
            x1={c + r * level}
            y1={20}
            x2={c + r * level}
            y2={S - 20}
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        ))}
      {points.map((pt, i) => {
        const p = P(pt.angle);
        const col = pt.color ?? '#dc2626';
        return (
          <g key={i}>
            <line x1={c} y1={c} x2={p.x} y2={p.y} stroke={col} strokeWidth={1.5} />
            {fn === 'sin' ? (
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x}
                y2={c}
                stroke="#16a34a"
                strokeWidth={3}
                strokeDasharray="4 3"
              />
            ) : (
              <line
                x1={p.x}
                y1={p.y}
                x2={c}
                y2={p.y}
                stroke="#16a34a"
                strokeWidth={3}
                strokeDasharray="4 3"
              />
            )}
            <circle cx={p.x} cy={p.y} r={4} fill={col} />
            <text
              x={p.x + (p.x >= c ? 7 : -7)}
              y={p.y + (p.y <= c ? -7 : 14)}
              fontSize={12}
              fontWeight="bold"
              fill={col}
              textAnchor={p.x >= c ? 'start' : 'end'}
            >
              {pt.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Aufgaben ----------

export function makeGenerator(fn: CircleFn) {
  const F = `\\${fn}`;
  const coord = fn === 'sin' ? 'y-Koordinate' : 'x-Koordinate';
  const name = fn === 'sin' ? 'Sinus' : 'Kosinus';

  return function generate(level: Level, slot: number): Task {
    if (level === 'einfach') {
      if (slot % 2 === 0) {
        const a = pick(SPECIAL.filter((x) => x <= 180));
        const v = val(fn, a);
        return {
          key: `v-${a}`,
          text: `Bestimme mithilfe des Einheitskreises: $${F}(${a}^\\circ)$ (auf zwei Nachkommastellen).`,
          figure: <UnitCircleSketch fn={fn} points={[{ angle: a, label: 'P' }]} />,
          fields: [{ kind: 'num', label: `$${F}(${a}^\\circ)$`, value: v, tol: 0.011 }],
          tips: [
            `Der Punkt P auf dem Einheitskreis hat die Koordinaten $P(\\cos(\\alpha) \\mid \\sin(\\alpha))$.`,
            `Der ${name} ist die **${coord}** von P (grün gestrichelt).`,
            `Den genauen Wert liefert auch der Taschenrechner (Modus DEG).`,
          ],
          solution: [
            `$${F}(${a}^\\circ)$ ist die ${coord} von P.`,
            `$${F}(${a}^\\circ) = ${exact(v)} \\approx ${tex(v)}$`,
          ],
        };
      }
      let a = randInt(5, 355);
      while (a % 90 === 0) a = randInt(5, 355);
      const v = val(fn, a);
      const q = quadrant(a);
      return {
        key: `z-${a}`,
        text: `Hat $${F}(${a}^\\circ)$ ein positives oder ein negatives Vorzeichen?`,
        figure: <UnitCircleSketch fn={fn} points={[{ angle: a, label: 'P' }]} />,
        fields: [{ kind: 'choice', options: ['positiv', 'negativ'], correct: v > 0 ? 0 : 1 }],
        tips: [
          `In welchem Quadranten liegt der Winkel ${a}°?`,
          fn === 'sin'
            ? `Der Sinus ist die y-Koordinate: oberhalb der x-Achse (1. und 2. Quadrant) positiv, darunter negativ.`
            : `Der Kosinus ist die x-Koordinate: rechts der y-Achse (1. und 4. Quadrant) positiv, links negativ.`,
        ],
        solution: [
          `${a}° liegt im ${q}. Quadranten.`,
          `Dort ist die ${coord} von P ${
            v > 0 ? 'positiv' : 'negativ'
          }: $${F}(${a}^\\circ) \\approx ${tex(v)}$`,
        ],
      };
    }

    if (level === 'mittel') {
      const kind = slot % 3;
      if (kind === 0) {
        // Symmetrie
        const a = fn === 'sin' ? randInt(10, 80) : pick([randInt(10, 80), randInt(100, 170)]);
        const partner = fn === 'sin' ? 180 - a : 360 - a;
        const v = val(fn, a);
        return {
          key: `y-${a}`,
          text:
            fn === 'sin'
              ? `Es gilt $\\sin(${a}^\\circ) \\approx ${tex(
                  v
                )}$. Welcher Winkel $\\alpha$ mit $90^\\circ < \\alpha < 180^\\circ$ hat denselben Sinuswert?`
              : `Es gilt $\\cos(${a}^\\circ) \\approx ${tex(
                  v
                )}$. Welcher Winkel $\\alpha$ mit $180^\\circ < \\alpha < 360^\\circ$ hat denselben Kosinuswert?`,
          figure: (
            <UnitCircleSketch
              fn={fn}
              points={[{ angle: a, label: `${a}°`, color: '#1e293b' }]}
              level={v}
            />
          ),
          fields: [{ kind: 'num', label: '$\\alpha$', value: partner, unit: '°', tol: 0.01 }],
          tips: [
            fn === 'sin'
              ? `Gleicher Sinus heißt gleiche Höhe (y-Koordinate). Die grüne Linie schneidet den Kreis ein zweites Mal – gespiegelt an der y-Achse.`
              : `Gleicher Kosinus heißt gleiche x-Koordinate. Die grüne Linie schneidet den Kreis ein zweites Mal – gespiegelt an der x-Achse.`,
            fn === 'sin'
              ? `Es gilt $\\sin(180^\\circ - \\alpha) = \\sin(\\alpha)$.`
              : `Es gilt $\\cos(360^\\circ - \\alpha) = \\cos(\\alpha)$.`,
          ],
          solution: [
            fn === 'sin'
              ? `Spiegelung an der y-Achse: $\\sin(180^\\circ - ${a}^\\circ) = \\sin(${a}^\\circ)$`
              : `Spiegelung an der x-Achse: $\\cos(360^\\circ - ${a}^\\circ) = \\cos(${a}^\\circ)$`,
            `$\\alpha = ${fn === 'sin' ? 180 : 360}^\\circ - ${a}^\\circ = ${partner}^\\circ$`,
          ],
        };
      }
      if (kind === 1) {
        const a = pick(SPECIAL.filter((x) => x > 180));
        const v = val(fn, a);
        const ref = a <= 270 ? a - 180 : 360 - a;
        return {
          key: `v3-${a}`,
          text: `Bestimme $${F}(${a}^\\circ)$ mithilfe des Einheitskreises (auf zwei Nachkommastellen).`,
          figure: <UnitCircleSketch fn={fn} points={[{ angle: a, label: 'P' }]} />,
          fields: [{ kind: 'num', label: `$${F}(${a}^\\circ)$`, value: v, tol: 0.011 }],
          tips: [
            `${a}° liegt im ${quadrant(a)}. Quadranten. Welches Vorzeichen hat dort die ${coord}?`,
            `Der Betrag ist derselbe wie bei einem Winkel im 1. Quadranten: Vergleiche mit $${F}(${ref}^\\circ)$.`,
          ],
          solution: [
            `${a}° liegt im ${quadrant(a)}. Quadranten, Bezugswinkel ${ref}°.`,
            `$${F}(${a}^\\circ) = ${exact(v)} \\approx ${tex(v)}$`,
          ],
        };
      }
      // besondere Stellen
      const variants =
        fn === 'sin'
          ? [
              { q: 'Bei welchem Winkel ist $\\sin(\\alpha)$ am größten?', a: 90 },
              { q: 'Bei welchem Winkel ist $\\sin(\\alpha)$ am kleinsten?', a: 270 },
              {
                q: 'Bei welchem Winkel mit $0^\\circ < \\alpha < 360^\\circ$ ist $\\sin(\\alpha) = 0$?',
                a: 180,
              },
            ]
          : [
              { q: 'Bei welchem Winkel ist $\\cos(\\alpha)$ am kleinsten?', a: 180 },
              {
                q: 'Bei welchem Winkel mit $0^\\circ < \\alpha < 180^\\circ$ ist $\\cos(\\alpha) = 0$?',
                a: 90,
              },
              {
                q: 'Bei welchem Winkel mit $180^\\circ < \\alpha < 360^\\circ$ ist $\\cos(\\alpha) = 0$?',
                a: 270,
              },
            ];
      const vt = pick(variants);
      const opts = [0, 90, 180, 270];
      return {
        key: `x-${vt.a}`,
        text: `${vt.q} (Betrachte $0^\\circ \\le \\alpha < 360^\\circ$.)`,
        figure: <UnitCircleSketch fn={fn} />,
        fields: [
          {
            kind: 'choice',
            options: opts.map((o) => `$${o}^\\circ$`),
            correct: opts.indexOf(vt.a),
          },
        ],
        tips: [
          `Der ${name} ist die ${coord} des Punktes P auf dem Einheitskreis.`,
          fn === 'sin'
            ? `Wo liegt der Punkt am höchsten, am tiefsten bzw. auf der x-Achse?`
            : `Wo liegt der Punkt ganz rechts, ganz links bzw. auf der y-Achse?`,
        ],
        solution: [`Bei $\\alpha = ${vt.a}^\\circ$ ist $${F}(\\alpha) = ${exact(val(fn, vt.a))}$.`],
      };
    }

    // schwer
    if (slot % 2 === 0) {
      // Gleichung mit zwei Lösungen
      let k = randFloat(0.1, 0.95, 2) * (chance() ? 1 : -1);
      if ([0.5, -0.5].includes(k)) k = k > 0 ? 0.55 : -0.55;
      const base = deg(fn === 'sin' ? Math.asin(k) : Math.acos(k));
      let sols: number[];
      if (fn === 'sin') sols = k > 0 ? [base, 180 - base] : [180 - base, 360 + base];
      else sols = [base, 360 - base];
      sols.sort((x, y) => x - y);
      const inv = `\\${fn}^{-1}(${tex(k)})`;
      return {
        key: `g-${k}`,
        text: `Löse die Gleichung $${F}(\\alpha) = ${tex(
          k
        )}$ für $0^\\circ \\le \\alpha < 360^\\circ$. Es gibt zwei Lösungen.`,
        figure: <UnitCircleSketch fn={fn} level={k} />,
        fields: [
          { kind: 'num', label: '$\\alpha_1$ (kleinere)', value: sols[0], unit: '°', tol: 0.15 },
          { kind: 'num', label: '$\\alpha_2$ (größere)', value: sols[1], unit: '°', tol: 0.15 },
        ],
        tips: [
          `Eine Lösung liefert der Taschenrechner: $${inv} \\approx ${texDeg(base)}$.`,
          fn === 'sin'
            ? `Die grüne Linie schneidet den Kreis zweimal. Die zweite Lösung erhältst du über $\\sin(180^\\circ - \\alpha) = \\sin(\\alpha)$.`
            : `Die grüne Linie schneidet den Kreis zweimal. Die zweite Lösung erhältst du über $\\cos(360^\\circ - \\alpha) = \\cos(\\alpha)$.`,
          fn === 'sin' && k < 0
            ? `Ein negativer Winkel liegt nicht im Bereich – addiere 360°.`
            : `Prüfe, dass beide Lösungen zwischen 0° und 360° liegen.`,
        ],
        solution:
          fn === 'sin'
            ? k > 0
              ? [
                  `$\\alpha_1 = ${inv} \\approx ${texDeg(base)}$`,
                  `$\\alpha_2 = 180^\\circ - ${texDeg(base)} \\approx ${texDeg(sols[1])}$`,
                ]
              : [
                  `Taschenrechner: $${inv} \\approx ${texDeg(base)}$ (liegt nicht im Bereich)`,
                  `$\\alpha_1 = 180^\\circ - (${texDeg(base)}) \\approx ${texDeg(sols[0])}$`,
                  `$\\alpha_2 = 360^\\circ + (${texDeg(base)}) \\approx ${texDeg(sols[1])}$`,
                ]
            : [
                `$\\alpha_1 = ${inv} \\approx ${texDeg(base)}$`,
                `$\\alpha_2 = 360^\\circ - ${texDeg(base)} \\approx ${texDeg(sols[1])}$`,
              ],
      };
    }
    // Periodizität
    const b = pick(SPECIAL.filter((x) => x % 90 !== 0));
    const turns = pick([1, 2, -1]);
    const a = b + 360 * turns;
    const v = val(fn, b);
    return {
      key: `p-${a}`,
      text: `Bestimme $${F}(${a}^\\circ)$ ohne Taschenrechner über den Einheitskreis (auf zwei Nachkommastellen).`,
      figure: <UnitCircleSketch fn={fn} points={[{ angle: b, label: 'P' }]} />,
      fields: [{ kind: 'num', label: `$${F}(${a}^\\circ)$`, value: v, tol: 0.011 }],
      tips: [
        `Nach einer vollen Umdrehung (360°) landet der Punkt wieder an derselben Stelle: $${F}(\\alpha \\pm 360^\\circ) = ${F}(\\alpha)$.`,
        `${a}° ${turns > 0 ? `− ${360 * turns}°` : '+ 360°'} = ${b}°.`,
      ],
      solution: [
        `$${F}(${a}^\\circ) = ${F}(${b}^\\circ)$, denn ${
          a < 0 ? `${a}° + 360° = ${b}°` : `${a}° − ${360 * turns}° = ${b}°`
        }.`,
        `$${F}(${b}^\\circ) = ${exact(v)} \\approx ${tex(v)}$`,
      ],
    };
  };
}

export function circleConfig(fn: CircleFn): TopicConfig {
  const isSin = fn === 'sin';
  const name = isSin ? 'Sinus' : 'Kosinus';
  return {
    title: `Die ${name}funktion am Einheitskreis`,
    subtitle: `Lies ${name}werte am Einheitskreis ab und verstehe den Verlauf der ${name}kurve.`,
    trackingTopic: `${name}funktion`,
    videoId: isSin ? 'Zw0bByWHFeo' : undefined,
    roundingNote: 'Runde Werte auf zwei, Winkel auf eine Nachkommastelle.',
    explanation: (
      <>
        <p>
          <Rich
            text={`Am **Einheitskreis** (Radius 1) gehört zu jedem Winkel $\\alpha$ ein Punkt $P(\\cos(\\alpha) \\mid \\sin(\\alpha))$. Der ${name} ist die **${
              isSin ? 'y-Koordinate (Höhe)' : 'x-Koordinate'
            }** von P.`}
          />
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            {isSin ? (
              <Rich text="Positiv im 1. und 2. Quadranten (oberhalb der x-Achse), negativ im 3. und 4." />
            ) : (
              <Rich text="Positiv im 1. und 4. Quadranten (rechts der y-Achse), negativ im 2. und 3." />
            )}
          </li>
          <li>
            {isSin ? (
              <Rich text="Größter Wert 1 bei 90°, kleinster Wert −1 bei 270°, Nullstellen bei 0°, 180°, 360°." />
            ) : (
              <Rich text="Größter Wert 1 bei 0° und 360°, kleinster Wert −1 bei 180°, Nullstellen bei 90° und 270°." />
            )}
          </li>
          <li>
            {isSin ? (
              <Rich text="Symmetrie: $\sin(180^\circ - \alpha) = \sin(\alpha)$ – deshalb hat $\sin(\alpha) = k$ meist zwei Lösungen." />
            ) : (
              <Rich text="Symmetrie: $\cos(360^\circ - \alpha) = \cos(\alpha)$ – deshalb hat $\cos(\alpha) = k$ meist zwei Lösungen." />
            )}
          </li>
          <li>
            <Rich
              text={`Nach 360° wiederholt sich alles: $\\${fn}(\\alpha + 360^\\circ) = \\${fn}(\\alpha)$ (Periode 360°).`}
            />
          </li>
        </ul>
        <p className="text-sm text-slate-600">
          Bewege im Applet den Schieberegler <InlineMath math="\alpha" /> oder den Punkt P und
          beobachte, wie die {name}kurve entsteht.
        </p>
        <GeoGebraSineUnitCircle mode={fn} />
      </>
    ),
    levels: [
      {
        id: 'einfach',
        description: `Werte für besondere Winkel ablesen und das Vorzeichen bestimmen.`,
        example: `$\\${fn}(60^\\circ) = \\,?$`,
      },
      { id: 'mittel', description: 'Symmetrie, Winkel über 180° und besondere Stellen der Kurve.' },
      {
        id: 'schwer',
        description: `Gleichungen wie $\\${fn}(\\alpha) = 0{,}4$ mit zwei Lösungen und Winkel über 360°.`,
      },
    ],
    generate: makeGenerator(fn),
  };
}
