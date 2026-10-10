import Practice from './engine/Practice';
import Rich from '../raum_und_form/engine/Rich';
import type { Level, Task, TopicConfig } from './engine/types';
import {
  RTFigure,
  ROLE_NAME,
  asked,
  makeRT,
  plain,
  roleIndex,
  type Role,
} from './engine/rightTriangle';
import { STANDARD, pick, randInt, type Naming } from './engine/util';

const ROLES: Role[] = ['H', 'G', 'A'];

// Für "schwer": Eckpunkte ohne griechische Winkel, Seiten als Strecken
const POINT_SETS: [string, string, string][] = [
  ['P', 'Q', 'R'],
  ['K', 'L', 'M'],
  ['R', 'S', 'T'],
  ['U', 'V', 'W'],
  ['X', 'Y', 'Z'],
  ['E', 'F', 'G'],
];

function generate(level: Level): Task {
  if (level === 'schwer') {
    const V = pick(POINT_SETS);
    const naming: Naming = { V, s: ['', '', ''], w: ['', '', ''], wt: ['', '', ''] };
    const t = makeRT({ theta: randInt(25, 65), hyp: 10, naming });
    // Seite gegenüber Ecke i als Strecke zwischen den anderen beiden Ecken
    const seg = (i: number) => `\\overline{${V[(i + 1) % 3]}${V[(i + 2) % 3]}}`;
    const options = [0, 1, 2].map((i) => `$${seg(i)}$`);
    const angleMarks = [0, 1, 2].map((i) => (i === t.p ? asked('•') : null));
    const P = V[t.p];
    return {
      key: `s-${V.join('')}`,
      text: `Im rechtwinkligen Dreieck ${V.join(
        ''
      )} ist der Winkel bei **${P}** markiert. Ordne die Seiten zu.`,
      figure: <RTFigure t={t} sides={[null, null, null]} angles={angleMarks} />,
      fields: ROLES.map((role) => ({
        kind: 'choice' as const,
        label: role === 'H' ? 'Hypotenuse' : `${ROLE_NAME[role]} zum Winkel bei ${P}`,
        options,
        correct: roleIndex(t, role),
      })),
      tips: [
        `Der rechte Winkel ist mit einem Quadrat markiert. Er liegt bei ${V[t.r]}.`,
        `Die Hypotenuse ist die längste Seite und liegt dem rechten Winkel gegenüber – sie verbindet also die beiden anderen Ecken.`,
        `Die Gegenkathete liegt dem Winkel bei ${P} gegenüber, berührt den Punkt ${P} also nicht. Die Ankathete geht vom Punkt ${P} zum rechten Winkel.`,
      ],
      solution: [
        `Rechter Winkel bei ${V[t.r]} → Hypotenuse: $${seg(t.r)}$`,
        `Gegenüber vom Winkel bei ${P} → Gegenkathete: $${seg(t.p)}$`,
        `Vom Punkt ${P} zum rechten Winkel → Ankathete: $${seg(t.q)}$`,
      ],
    };
  }

  // Auch bei "einfach" (Buchstaben A, B, C) liegt der rechte Winkel an wechselnden Ecken,
  // damit die Hypotenuse nicht immer c ist, sondern über die Lage erkannt werden muss.
  const t = makeRT({
    theta: randInt(25, 65),
    hyp: 10,
    naming: level === 'einfach' ? STANDARD : undefined,
  });
  const { n } = t;
  const options = [0, 1, 2].map((i) => `$${n.s[i]}$`);
  const th = n.wt[t.p];
  const angleMarks = [0, 1, 2].map((i) => (i === t.p ? asked(n.w[i]) : null));
  const sideMarks = [0, 1, 2].map((i) => plain(n.s[i]));

  const fields =
    level === 'einfach'
      ? ROLES.map((role) => ({
          kind: 'choice' as const,
          label: role === 'H' ? 'Hypotenuse' : `${ROLE_NAME[role]} von $${th}$`,
          options,
          correct: roleIndex(t, role),
        }))
      : [
          { kind: 'choice' as const, label: 'Hypotenuse', options, correct: t.r },
          { kind: 'choice' as const, label: `Gegenkathete von $${th}$`, options, correct: t.p },
          { kind: 'choice' as const, label: `Ankathete von $${th}$`, options, correct: t.q },
          // Rollen wechseln, wenn man den anderen spitzen Winkel betrachtet
          {
            kind: 'choice' as const,
            label: `Gegenkathete von $${n.wt[t.q]}$`,
            options,
            correct: t.q,
          },
        ];

  return {
    key:
      level === 'einfach'
        ? `${t.r}-${t.p}-${t.pose.rotate}-${t.pose.mirror}`
        : `${n.V.join('')}-${t.r}`,
    text:
      level === 'einfach'
        ? `Im rechtwinkligen Dreieck ${n.V.join(
            ''
          )} ist der Winkel $${th}$ markiert. Welche Seite ist Hypotenuse, Gegenkathete und Ankathete?`
        : `Im rechtwinkligen Dreieck ${n.V.join(
            ''
          )} ist der Winkel $${th}$ markiert. Ordne die Seiten zu. Achtung: Bei der letzten Frage geht es um den anderen spitzen Winkel $${
            n.wt[t.q]
          }$.`,
    figure: <RTFigure t={t} sides={sideMarks} angles={angleMarks} />,
    fields,
    tips: [
      `Suche zuerst den rechten Winkel (Quadrat mit Punkt). Die Seite gegenüber ist die Hypotenuse.`,
      `Die Gegenkathete liegt dem Winkel $${th}$ gegenüber – sie berührt die Ecke ${
        n.V[t.p]
      } nicht.`,
      `Die Ankathete ist die Kathete, die an der Ecke ${n.V[t.p]} anliegt.${
        level === 'mittel' ? ` Für $${n.wt[t.q]}$ tauschen Gegen- und Ankathete ihre Rollen.` : ''
      }`,
    ],
    solution: [
      `Rechter Winkel bei ${n.V[t.r]} → Hypotenuse: $${n.s[t.r]}$`,
      `Gegenüber von $${th}$ → Gegenkathete: $${n.s[t.p]}$`,
      `Am Winkel $${th}$ anliegend → Ankathete: $${n.s[t.q]}$`,
      ...(level === 'mittel'
        ? [
            `Vom Winkel $${n.wt[t.q]}$ aus ist $${
              n.s[t.q]
            }$ die Gegenkathete (sie liegt ihm gegenüber).`,
          ]
        : []),
    ],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Im rechtwinkligen Dreieck haben die Seiten besondere Namen. Wichtig: Gegenkathete und Ankathete hängen davon ab, **von welchem Winkel aus** du schaust." />
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>
        <Rich text="**Hypotenuse:** die längste Seite, sie liegt **gegenüber dem rechten Winkel**." />
      </li>
      <li>
        <Rich text="**Gegenkathete:** die Kathete, die dem betrachteten Winkel **gegenüber** liegt." />
      </li>
      <li>
        <Rich text="**Ankathete:** die Kathete, die **am** betrachteten Winkel **anliegt**." />
      </li>
    </ul>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich text="Dreieck ABC, rechter Winkel bei A. Hypotenuse ist hier $a$ – nicht $c$! Vom Winkel $\beta$ aus ist $b$ die Gegenkathete und $c$ die Ankathete – vom Winkel $\gamma$ aus genau umgekehrt." />
    </div>
    <p className="text-sm text-slate-500">
      <Rich text="Achtung: Die Hypotenuse heißt nicht automatisch $c$. Entscheidend ist nur, wo der rechte Winkel liegt." />
    </p>
    <p className="text-sm text-slate-500">
      <Rich text="Merke: Die Seite gegenüber einer Ecke trägt deren Kleinbuchstaben (gegenüber von A liegt $a$)." />
    </p>
  </>
);

export const cfg: TopicConfig = {
  title: 'Rechtwinklige Dreiecke beschriften',
  subtitle: 'Ordne Hypotenuse, Gegenkathete und Ankathete richtig zu.',
  trackingTopic: 'Rechtwinklige Dreiecke beschriften',
  videoId: 'BKuTvKSng78',
  pdf: '/downloads/rechtwinklige-dreiecke-beschriften-uebungen.pdf',
  explanation,
  levels: [
    {
      id: 'einfach',
      description: 'Dreieck ABC in verschiedenen Lagen, der rechte Winkel kann an jeder Ecke liegen – ordne die drei Seiten zu.',
    },
    {
      id: 'mittel',
      description: 'Wechselnde Buchstaben und zusätzlich der Blick vom anderen spitzen Winkel.',
    },
    {
      id: 'schwer',
      description:
        'Seiten werden als Strecken angegeben (z. B. $\\overline{PQ}$), der Winkel nur über seinen Eckpunkt.',
    },
  ],
  generate,
};

export default function RechtwinkligBeschriften() {
  return <Practice cfg={cfg} />;
}
