import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Practice from './engine/Practice';
import Rich from '../raum_und_form/engine/Rich';
import TriangleFigure, { COLOR_ASKED, COLOR_GIVEN, type Mark } from './engine/TriangleFigure';
import type { Level, Task, TopicConfig } from './engine/types';
import { cap, deg, fmt, pick, randFloat, randInt, sinD, tanD, tex, texDeg } from './engine/util';

const ROADS = [
  'eine Bergstraße',
  'eine Passstraße',
  'eine Tiefgaragenrampe',
  'ein Forstweg',
  'eine Skipiste',
  'ein Wanderweg',
  'eine Rollstuhlrampe',
  'eine Zahnradbahn',
];
const PASSES = [
  { name: 'Der Fernpass', percent: 8 },
  { name: 'Der Achenpass', percent: 12 },
  { name: 'Das Hahntennjoch', percent: 15 },
  { name: 'Der Monte Zoncolan', percent: 22 },
  { name: 'Das Stilfser Joch', percent: 24 },
  { name: 'Das Timmelsjoch', percent: 13 },
  { name: 'Der Sölkpass', percent: 23 },
  { name: 'Der Grimselpass', percent: 11 },
];

/** Steigungsdreieck; flache Steigungen werden überhöht gezeichnet, damit man sie erkennt. */
function SlopeFigure({
  ratio,
  base,
  rise,
  path,
  angle,
}: {
  ratio: number;
  base: Mark | null;
  rise: Mark | null;
  path: Mark | null;
  angle: Mark | null;
}) {
  const h = Math.min(0.75, Math.max(0.28, ratio));
  return (
    <TriangleFigure
      pts={[
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: h },
      ]}
      names={['', '', '']}
      sides={[rise, path, base]}
      angles={[angle, null, null]}
      right={1}
    />
  );
}

const g = (text: string): Mark => ({ text, color: COLOR_GIVEN });
const q = (text: string): Mark => ({ text, color: COLOR_ASKED, bold: true });

const pTex = (p: number) => `${tex(p, 1)}\\,\\%`;

function generate(level: Level, slot: number): Task {
  if (level === 'einfach') {
    if (slot % 2 === 0) {
      // Prozent -> Grad
      const pass = slot === 0 || slot === 4 ? pick(PASSES) : null;
      const p = pass ? pass.percent : randInt(3, 40);
      const a = deg(Math.atan(p / 100));
      return {
        key: `pg-${p}`,
        text: pass
          ? `${pass.name} hat eine maximale Steigung von ${p} %. Berechne den Steigungswinkel $\\alpha$.`
          : `${cap(
              pick(ROADS)
            )} hat eine Steigung von ${p} %. Berechne den Steigungswinkel $\\alpha$.`,
        figure: (
          <SlopeFigure
            ratio={p / 100}
            base={g('100 m')}
            rise={g(`${p} m`)}
            path={null}
            angle={q('α = ?')}
          />
        ),
        fields: [{ kind: 'num', label: '$\\alpha$', value: a, unit: '°', tol: 0.15 }],
        tips: [
          `${p} % Steigung bedeutet: auf 100 m waagrechter Strecke geht es ${p} m nach oben.`,
          `Höhe (Gegenkathete) und waagrechte Strecke (Ankathete) → Tangens: $\\tan(\\alpha) = \\dfrac{${p}}{100}$.`,
          `Mit $\\tan^{-1}$ erhältst du den Winkel.`,
        ],
        solution: [
          `$\\tan(\\alpha) = \\dfrac{${p}}{100} = ${tex(p / 100, 2)}$`,
          `$\\alpha = \\tan^{-1}(${tex(p / 100, 2)}) \\approx ${texDeg(a)}$`,
        ],
      };
    }
    // Grad -> Prozent
    const a = randInt(2, 25);
    const p = tanD(a) * 100;
    return {
      key: `gp-${a}`,
      text: `${cap(
        pick(ROADS)
      )} hat einen Steigungswinkel von $\\alpha = ${a}^\\circ$. Gib die Steigung in Prozent an.`,
      figure: (
        <SlopeFigure
          ratio={p / 100}
          base={g('100 m')}
          rise={q('? m')}
          path={null}
          angle={g(`α = ${a}°`)}
        />
      ),
      fields: [{ kind: 'num', label: 'Steigung', value: p, unit: '%', tol: 0.15 }],
      tips: [
        `Die Steigung in Prozent gibt an, wie viele Meter es auf 100 m waagrechter Strecke nach oben geht.`,
        `$\\tan(\\alpha) = \\dfrac{\\text{Höhe}}{\\text{waagrechte Strecke}}$ – also ist die Steigung $\\tan(${a}^\\circ) \\cdot 100\\,\\%$.`,
      ],
      solution: [
        `$\\tan(${a}^\\circ) \\approx ${tex(tanD(a), 4)}$`,
        `Steigung $= ${tex(tanD(a), 4)} \\cdot 100\\,\\% \\approx ${pTex(p)}$`,
      ],
    };
  }

  if (level === 'mittel') {
    // Höhenunterschied und waagrechte Strecke -> Prozent und Grad
    const d = slot % 2 === 0 ? randInt(20, 400) : randInt(500, 3000);
    const h = Math.round(d * randFloat(0.03, 0.35, 2));
    const p = (h / d) * 100;
    const a = deg(Math.atan(h / d));
    const road = pick(ROADS);
    return {
      key: `m-${d}-${h}`,
      text: `${cap(road)} überwindet auf einer **waagrechten** Strecke von ${fmt(
        d
      )} m einen Höhenunterschied von ${h} m. Berechne die Steigung in Prozent und den Steigungswinkel $\\alpha$.`,
      figure: (
        <SlopeFigure
          ratio={h / d}
          base={g(`${fmt(d)} m`)}
          rise={g(`${h} m`)}
          path={null}
          angle={q('α = ?')}
        />
      ),
      fields: [
        { kind: 'num', label: 'Steigung', value: p, unit: '%', tol: 0.15 },
        { kind: 'num', label: '$\\alpha$', value: a, unit: '°', tol: 0.15 },
      ],
      tips: [
        `Steigung in Prozent: $\\dfrac{\\text{Höhenunterschied}}{\\text{waagrechte Strecke}} \\cdot 100\\,\\%$.`,
        `Derselbe Quotient ist $\\tan(\\alpha)$. Nutze $\\tan^{-1}$ für den Winkel.`,
        `Achtung: Steigung in Prozent und Winkel in Grad sind **nicht** dasselbe – 100 % entsprechen 45°.`,
      ],
      solution: [
        `Steigung $= \\dfrac{${h}\\,\\text{m}}{${d}\\,\\text{m}} \\cdot 100\\,\\% \\approx ${pTex(
          p
        )}$`,
        `$\\tan(\\alpha) = \\dfrac{${h}}{${d}} \\approx ${tex(
          h / d,
          4
        )}$ $\\Rightarrow$ $\\alpha = \\tan^{-1}(${tex(h / d, 4)}) \\approx ${texDeg(a)}$`,
      ],
    };
  }

  // schwer: Anwendungen mit der Weglänge (Hypotenuse) bzw. einer Karte
  const kind = slot % 3;
  if (kind === 0) {
    const p = randFloat(4, 25, 1);
    const s = randInt(4, 30) * 100;
    const a = deg(Math.atan(p / 100));
    const h = s * sinD(a);
    const who = pick([
      'Ein Radfahrer',
      'Eine Wanderin',
      'Ein Linienbus',
      'Eine Läuferin',
      'Ein Auto',
    ]);
    return {
      key: `s0-${p}-${s}`,
      text: `${who} legt auf einer Straße mit ${fmt(p, 1)} % Steigung eine Strecke von ${fmt(
        s
      )} m zurück (gemessen **entlang der Straße**). Berechne den Steigungswinkel und den Höhenunterschied.`,
      figure: (
        <SlopeFigure
          ratio={p / 100}
          base={null}
          rise={q('h = ?')}
          path={g(`${fmt(s)} m`)}
          angle={q('α = ?')}
        />
      ),
      fields: [
        { kind: 'num', label: '$\\alpha$', value: a, unit: '°', tol: 0.15 },
        { kind: 'num', label: '$h$', value: h, unit: 'm', tol: Math.max(h * 0.01, 0.5) },
      ],
      tips: [
        `Berechne zuerst den Winkel: $\\tan(\\alpha) = \\dfrac{${tex(p, 1)}}{100}$.`,
        `Die ${fmt(
          s
        )} m entlang der Straße sind die **Hypotenuse**, gesucht ist die Gegenkathete $h$ → Sinus.`,
        `$h = ${fmt(s)}\\,\\text{m} \\cdot \\sin(\\alpha)$`,
      ],
      solution: [
        `$\\alpha = \\tan^{-1}\\left(\\dfrac{${tex(p, 1)}}{100}\\right) \\approx ${texDeg(a, 2)}$`,
        `$h = ${s}\\,\\text{m} \\cdot \\sin(${texDeg(a, 2)}) \\approx ${tex(h, 1)}\\,\\text{m}$`,
      ],
    };
  }
  if (kind === 1) {
    const scale = pick([10000, 25000, 50000]);
    const cm = randFloat(2, 9, 1);
    const d = (cm * scale) / 100;
    const h = randInt(15, 160);
    const p = (h / d) * 100;
    const a = deg(Math.atan(h / d));
    return {
      key: `s1-${scale}-${cm}-${h}`,
      text: `Auf einer Wanderkarte im Maßstab 1 : ${fmt(scale)} sind zwei Orte ${fmt(
        cm,
        1
      )} cm voneinander entfernt. Der Höhenunterschied beträgt ${h} m. Berechne das durchschnittliche Gefälle in Prozent und den Neigungswinkel.`,
      figure: (
        <SlopeFigure
          ratio={h / d}
          base={q('? m')}
          rise={g(`${h} m`)}
          path={null}
          angle={q('α = ?')}
        />
      ),
      fields: [
        { kind: 'num', label: 'Gefälle', value: p, unit: '%', tol: 0.15 },
        { kind: 'num', label: '$\\alpha$', value: a, unit: '°', tol: 0.15 },
      ],
      tips: [
        `Die Karte zeigt die waagrechte Entfernung: ${fmt(cm, 1)} cm · ${fmt(scale)} = ${fmt(
          cm * scale
        )} cm = ${fmt(d)} m.`,
        `Gefälle $= \\dfrac{\\text{Höhenunterschied}}{\\text{waagrechte Strecke}} \\cdot 100\\,\\%$ – rechne beide in Metern.`,
        `Für den Winkel: $\\alpha = \\tan^{-1}\\left(\\dfrac{${h}}{${tex(d, 0)}}\\right)$.`,
      ],
      solution: [
        `Waagrechte Strecke: $${tex(cm, 1)}\\,\\text{cm} \\cdot ${scale} = ${tex(
          d,
          0
        )}\\,\\text{m}$`,
        `Gefälle $= \\dfrac{${h}}{${tex(d, 0)}} \\cdot 100\\,\\% \\approx ${pTex(p)}$`,
        `$\\alpha = \\tan^{-1}(${tex(h / d, 4)}) \\approx ${texDeg(a)}$`,
      ],
    };
  }
  // Rampe: Höhe und Steigung gegeben -> Länge der Rampe
  const p = pick([6, 8, 10, 12, 15]);
  const h = randFloat(0.4, 2.5, 2);
  const a = deg(Math.atan(p / 100));
  const s = h / sinD(a);
  return {
    key: `s2-${p}-${h}`,
    text: `Eine Rampe soll eine Höhe von ${fmt(
      h
    )} m überwinden und darf höchstens ${p} % Steigung haben. Wie lang muss die Rampe (die schräge Fläche) mindestens sein? Berechne auch den Steigungswinkel.`,
    figure: (
      <SlopeFigure
        ratio={p / 100}
        base={null}
        rise={g(`${fmt(h)} m`)}
        path={q('s = ?')}
        angle={q('α = ?')}
      />
    ),
    fields: [
      { kind: 'num', label: '$\\alpha$', value: a, unit: '°', tol: 0.15 },
      { kind: 'num', label: '$s$', value: s, unit: 'm', tol: Math.max(s * 0.01, 0.02) },
    ],
    tips: [
      `Winkel: $\\alpha = \\tan^{-1}\\left(\\dfrac{${p}}{100}\\right)$.`,
      `Die Höhe ist die Gegenkathete, die Rampe die Hypotenuse → Sinus: $\\sin(\\alpha) = \\dfrac{h}{s}$.`,
      `Umgestellt: $s = \\dfrac{h}{\\sin(\\alpha)}$.`,
    ],
    solution: [
      `$\\alpha = \\tan^{-1}(${tex(p / 100, 2)}) \\approx ${texDeg(a, 2)}$`,
      `$s = \\dfrac{${tex(h)}\\,\\text{m}}{\\sin(${texDeg(a, 2)})} \\approx ${tex(s)}\\,\\text{m}$`,
    ],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Die **Steigung in Prozent** gibt an, wie viele Meter es auf 100 m **waagrechter** Strecke nach oben geht. Der **Steigungswinkel** $\alpha$ ist der Winkel zwischen Straße und Waagrechter. Beide hängen über den Tangens zusammen:" />
    </p>
    <BlockMath math="\tan(\alpha) = \frac{\text{Höhenunterschied}}{\text{waagrechte Strecke}} = \frac{p}{100}" />
    <ul className="list-disc pl-5 space-y-1">
      <li>
        <Rich text="Prozent → Grad: $\alpha = \tan^{-1}\left(\dfrac{p}{100}\right)$" />
      </li>
      <li>
        <Rich text="Grad → Prozent: $p = \tan(\alpha) \cdot 100\,\%$" />
      </li>
    </ul>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich text="12 % Steigung: $\tan(\alpha) = 0{,}12$ $\Rightarrow$ $\alpha = \tan^{-1}(0{,}12) \approx 6{,}8^\circ$. Achtung: 100 % Steigung sind 45°, nicht 90°!" />
    </div>
  </>
);

export const cfg: TopicConfig = {
  title: 'Steigungswinkel in Prozent und Grad',
  subtitle: 'Rechne Steigungsangaben zwischen Prozent und Winkelmaß um.',
  trackingTopic: 'Steigungswinkel',
  explanation,
  roundingNote: 'Runde auf eine Nachkommastelle.',
  levels: [
    {
      id: 'einfach',
      description: 'Prozent in Grad umrechnen und umgekehrt.',
      example: '$12\\,\\% \\approx 6{,}8^\\circ$',
    },
    {
      id: 'mittel',
      description: 'Aus Höhenunterschied und waagrechter Strecke Steigung und Winkel bestimmen.',
    },
    {
      id: 'schwer',
      description: 'Anwendungen: Weg entlang der Straße, Wanderkarte mit Maßstab, Rampen.',
    },
  ],
  generate,
};

export default function SteigungswinkelProzentGrad() {
  return <Practice cfg={cfg} />;
}
