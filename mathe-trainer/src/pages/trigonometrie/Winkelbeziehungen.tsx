import Practice from './engine/Practice';
import Rich from '../raum_und_form/engine/Rich';
import type { Level, Task, TopicConfig } from './engine/types';
import { chance, pick, randInt } from './engine/util';

type RelType = 'Scheitelwinkel' | 'Nebenwinkel' | 'Stufenwinkel' | 'Wechselwinkel';

const RELATION_LABEL: Record<RelType, string> = {
  Scheitelwinkel: 'Scheitelwinkel',
  Nebenwinkel: 'Nebenwinkel',
  Stufenwinkel: 'Stufenwinkel',
  Wechselwinkel: 'Wechselwinkel',
};

const RELATION_RULE: Record<RelType, string> = {
  Scheitelwinkel:
    'Scheitelwinkel liegen sich an derselben Kreuzung gegenüber und sind **gleich groß**.',
  Nebenwinkel:
    'Nebenwinkel liegen an derselben Kreuzung nebeneinander und ergänzen sich zu **180°**.',
  Stufenwinkel:
    'Stufenwinkel liegen an den beiden Kreuzungen an der gleichen Position. An Parallelen sind sie **gleich groß**.',
  Wechselwinkel:
    'Wechselwinkel liegen an verschiedenen Kreuzungen auf verschiedenen Seiten der Schrägen, beide zwischen oder beide außerhalb der Parallelen („Z-Form“). An Parallelen sind sie **gleich groß**.',
};

// Winkel 1–4 an der oberen Kreuzung (g₁), 5–8 an der unteren (g₂)
type Pos = 'TL' | 'TR' | 'BR' | 'BL';
const POSITION: Record<number, Pos> = {
  1: 'TL',
  2: 'TR',
  3: 'BR',
  4: 'BL',
  5: 'TL',
  6: 'TR',
  7: 'BR',
  8: 'BL',
};

const RELATIONS: { a: number; b: number; type: RelType }[] = [
  { a: 1, b: 3, type: 'Scheitelwinkel' },
  { a: 2, b: 4, type: 'Scheitelwinkel' },
  { a: 5, b: 7, type: 'Scheitelwinkel' },
  { a: 6, b: 8, type: 'Scheitelwinkel' },
  { a: 1, b: 2, type: 'Nebenwinkel' },
  { a: 2, b: 3, type: 'Nebenwinkel' },
  { a: 3, b: 4, type: 'Nebenwinkel' },
  { a: 4, b: 1, type: 'Nebenwinkel' },
  { a: 5, b: 6, type: 'Nebenwinkel' },
  { a: 6, b: 7, type: 'Nebenwinkel' },
  { a: 7, b: 8, type: 'Nebenwinkel' },
  { a: 8, b: 5, type: 'Nebenwinkel' },
  { a: 1, b: 5, type: 'Stufenwinkel' },
  { a: 2, b: 6, type: 'Stufenwinkel' },
  { a: 3, b: 7, type: 'Stufenwinkel' },
  { a: 4, b: 8, type: 'Stufenwinkel' },
  { a: 3, b: 5, type: 'Wechselwinkel' },
  { a: 4, b: 6, type: 'Wechselwinkel' },
  { a: 1, b: 7, type: 'Wechselwinkel' },
  { a: 2, b: 8, type: 'Wechselwinkel' },
];

const relationOf = (x: number, y: number) =>
  RELATIONS.find((r) => (r.a === x && r.b === y) || (r.a === y && r.b === x));

// 'TL'/'BR' sind θ, 'TR'/'BL' sind 180° − θ
const valueOf = (id: number, theta: number) =>
  POSITION[id] === 'TL' || POSITION[id] === 'BR' ? theta : 180 - theta;

const step = (from: number, to: number, theta: number, type: RelType) =>
  type === 'Nebenwinkel'
    ? `∠${to} und ∠${from} sind Nebenwinkel: ∠${to} = 180° − ${valueOf(from, theta)}° = ${valueOf(
        to,
        theta
      )}°`
    : `∠${to} und ∠${from} sind ${RELATION_LABEL[type]}: ∠${to} = ∠${from} = ${valueOf(
        to,
        theta
      )}°`;

// ---------- Skizze ----------

const rad = (d: number) => (d * Math.PI) / 180;

const wedgeSpan = (pos: Pos, theta: number): [number, number] =>
  pos === 'TL'
    ? [180, 180 + theta]
    : pos === 'TR'
    ? [180 + theta, 360]
    : pos === 'BR'
    ? [0, theta]
    : [theta, 180];

function AngleSketch({
  theta,
  single,
  mirror,
  blue,
  red,
}: {
  theta: number;
  single: boolean;
  mirror: boolean;
  blue: number[];
  red: number[];
}) {
  const W = 420;
  const H = single ? 190 : 300;
  const mx = (x: number) => (mirror ? W - x : x);
  const p1 = { x: 190, y: single ? 95 : 90 };
  const t = rad(theta);
  const s = 130 / Math.sin(t);
  const p2 = { x: p1.x + s * Math.cos(t), y: p1.y + s * Math.sin(t) };
  const ext = single ? 85 : 60;
  const start = { x: p1.x - ext * Math.cos(t), y: p1.y - ext * Math.sin(t) };
  const end = single
    ? { x: p1.x + ext * Math.cos(t), y: p1.y + ext * Math.sin(t) }
    : { x: p2.x + 60 * Math.cos(t), y: p2.y + 60 * Math.sin(t) };
  const ids = single ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8];
  const color = (id: number) =>
    blue.includes(id) ? '#2563eb' : red.includes(id) ? '#dc2626' : '#94a3b8';
  const hl = (id: number) => blue.includes(id) || red.includes(id);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[420px] mx-auto"
      role="img"
      aria-label="Skizze der Winkel"
    >
      {[p1, ...(single ? [] : [p2])].map((p, i) => (
        <g key={i}>
          <line x1={mx(20)} y1={p.y} x2={mx(400)} y2={p.y} stroke="#0f172a" strokeWidth={1.5} />
          {!single && (
            <polygon
              points={`${mx(388)},${p.y - 5} ${mx(398)},${p.y} ${mx(388)},${p.y + 5}`}
              fill="#0f172a"
            />
          )}
          <text
            x={mx(405)}
            y={p.y + 5}
            fontSize={14}
            fontWeight="bold"
            textAnchor={mirror ? 'end' : 'start'}
          >
            {single ? 'g' : i === 0 ? 'g₁' : 'g₂'}
          </text>
        </g>
      ))}
      <line
        x1={mx(start.x)}
        y1={start.y}
        x2={mx(end.x)}
        y2={end.y}
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      <text
        x={mx(end.x + 8)}
        y={end.y + 10}
        fontSize={14}
        fontWeight="bold"
        textAnchor={mirror ? 'end' : 'start'}
      >
        {single ? 'h' : 't'}
      </text>
      {ids.map((id) => {
        const v = id <= 4 ? p1 : p2;
        const [a0, a1] = wedgeSpan(POSITION[id], theta);
        const r = hl(id) ? 30 : 22;
        const sx = v.x + r * Math.cos(rad(a0));
        const sy = v.y + r * Math.sin(rad(a0));
        const ex = v.x + r * Math.cos(rad(a1));
        const ey = v.y + r * Math.sin(rad(a1));
        const mid = rad((a0 + a1) / 2);
        const lr = r + 15;
        return (
          <g key={id}>
            <path
              d={`M ${mx(v.x)} ${v.y} L ${mx(sx)} ${sy} A ${r} ${r} 0 0 ${mirror ? 0 : 1} ${mx(
                ex
              )} ${ey} Z`}
              fill={color(id)}
              fillOpacity={hl(id) ? 0.2 : 0}
              stroke="none"
            />
            <path
              d={`M ${mx(sx)} ${sy} A ${r} ${r} 0 0 ${mirror ? 0 : 1} ${mx(ex)} ${ey}`}
              fill="none"
              stroke={color(id)}
              strokeWidth={hl(id) ? 2.5 : 1.3}
            />
            <text
              x={mx(v.x + lr * Math.cos(mid))}
              y={v.y + lr * Math.sin(mid)}
              fontSize={hl(id) ? 15 : 12}
              fontWeight={hl(id) ? 'bold' : 'normal'}
              fill={color(id)}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Aufgaben ----------

function generate(level: Level, slot: number): Task {
  const theta = randInt(32, 78);
  const mirror = chance();
  const single = level === 'einfach';
  const calc = slot % 2 === 0;

  if (level === 'schwer') {
    // Zwei Winkel ohne direkte Beziehung zum gegebenen Winkel -> über einen Zwischenwinkel
    const g = randInt(1, 8);
    const far = [1, 2, 3, 4, 5, 6, 7, 8].filter((x) => x !== g && !relationOf(g, x));
    const targets = [pick(far)];
    targets.push(pick(far.filter((x) => x !== targets[0])));
    targets.sort((a, b) => a - b);
    const chain = (t: number) => {
      const mid = [1, 2, 3, 4, 5, 6, 7, 8].find((x) => relationOf(g, x) && relationOf(x, t))!;
      return [
        step(g, mid, theta, relationOf(g, mid)!.type),
        step(mid, t, theta, relationOf(mid, t)!.type),
      ];
    };
    return {
      key: `s-${g}-${targets.join('')}-${theta}`,
      text: `Die Geraden g₁ und g₂ sind parallel. Es gilt ∠${g} = ${valueOf(
        g,
        theta
      )}°. Berechne ∠${targets[0]} und ∠${targets[1]}.`,
      figure: <AngleSketch theta={theta} single={false} mirror={mirror} blue={[g]} red={targets} />,
      fields: targets.map((t) => ({
        kind: 'num' as const,
        label: `∠${t}`,
        value: valueOf(t, theta),
        unit: '°',
        tol: 0.01,
      })),
      tips: [
        `Die gesuchten Winkel hängen nicht direkt mit ∠${g} zusammen. Gehe in zwei Schritten über einen Zwischenwinkel.`,
        `Bestimme zuerst die Winkel an derselben Kreuzung wie ∠${g} (Scheitel- und Nebenwinkel). Übertrage sie dann mit Stufen- oder Wechselwinkeln auf die andere Kreuzung.`,
        `An jeder Kreuzung gibt es nur zwei verschiedene Werte: ${valueOf(g, theta)}° und ${
          180 - valueOf(g, theta)
        }°.`,
      ],
      solution: targets.flatMap((t) => [`**∠${t}:**`, ...chain(t)]),
    };
  }

  const pool = single ? RELATIONS.filter((r) => r.a <= 4 && r.b <= 4) : RELATIONS;
  const rel =
    level === 'mittel'
      ? pool.filter((r) =>
          slot % 4 < 2 ? r.type === 'Stufenwinkel' || r.type === 'Wechselwinkel' : true
        )
      : pool;
  const r = pick(rel);
  const [x, y] = chance() ? [r.a, r.b] : [r.b, r.a];
  const intro = single
    ? 'Zwei Geraden g und h schneiden sich.'
    : 'Die Geraden g₁ und g₂ sind parallel und werden von t geschnitten.';

  if (calc) {
    return {
      key: `c-${x}-${y}-${theta}`,
      text: `${intro} Es gilt ∠${x} = ${valueOf(x, theta)}°. Berechne ∠${y}.`,
      figure: <AngleSketch theta={theta} single={single} mirror={mirror} blue={[x]} red={[y]} />,
      fields: [{ kind: 'num', label: `∠${y}`, value: valueOf(y, theta), unit: '°', tol: 0.01 }],
      tips: [
        `Wie liegen ∠${x} und ∠${y} zueinander? Gleiche Kreuzung oder verschiedene? Gegenüber, nebeneinander oder an der gleichen Position?`,
        `∠${x} und ∠${y} sind ${RELATION_LABEL[r.type]}. ${RELATION_RULE[r.type]}`,
      ],
      solution: [RELATION_RULE[r.type], step(x, y, theta, r.type)],
    };
  }

  const options: RelType[] = single
    ? ['Scheitelwinkel', 'Nebenwinkel']
    : ['Scheitelwinkel', 'Nebenwinkel', 'Stufenwinkel', 'Wechselwinkel'];
  return {
    key: `k-${Math.min(x, y)}-${Math.max(x, y)}-${theta}`,
    text: `${intro} Welche Beziehung besteht zwischen ∠${x} und ∠${y}?`,
    figure: <AngleSketch theta={theta} single={single} mirror={mirror} blue={[x]} red={[y]} />,
    fields: [
      {
        kind: 'choice',
        options: options.map((o) => RELATION_LABEL[o]),
        correct: options.indexOf(r.type),
      },
    ],
    tips: [
      single
        ? `Liegen die beiden Winkel einander gegenüber oder direkt nebeneinander?`
        : `Liegen beide Winkel an derselben Kreuzung? Dann sind es Scheitel- oder Nebenwinkel, sonst Stufen- oder Wechselwinkel.`,
      single
        ? `Nebenwinkel haben einen gemeinsamen Schenkel und ergeben zusammen 180°.`
        : `Stufenwinkel: gleiche Position (F-Form). Wechselwinkel: über Kreuz auf verschiedenen Seiten der Schrägen (Z-Form).`,
    ],
    solution: [`∠${x} und ∠${y} sind **${RELATION_LABEL[r.type]}**.`, RELATION_RULE[r.type]],
  };
}

const explanation = (
  <>
    <p>
      <Rich text="Schneiden sich zwei Geraden, entstehen vier Winkel. Schneidet eine Gerade $t$ zwei **parallele** Geraden, entstehen acht Winkel – aber nur zwei verschiedene Größen!" />
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>
        <Rich text="**Scheitelwinkel:** liegen sich an derselben Kreuzung gegenüber – sie sind **gleich groß**." />
      </li>
      <li>
        <Rich text="**Nebenwinkel:** liegen nebeneinander an derselben Kreuzung – zusammen **180°**." />
      </li>
      <li>
        <Rich text="**Stufenwinkel (F-Form):** gleiche Position an beiden Kreuzungen – an Parallelen **gleich groß**." />
      </li>
      <li>
        <Rich text="**Wechselwinkel (Z-Form):** über Kreuz auf verschiedenen Seiten der Schrägen – an Parallelen **gleich groß**." />
      </li>
    </ul>
    <div className="border-l-4 border-blue-400 bg-blue-50 rounded p-3">
      <p className="font-semibold text-slate-800 mb-1">Beispiel</p>
      <Rich text="Ist ∠1 = 60°, dann ist sein Scheitelwinkel ∠3 = 60°, sein Nebenwinkel ∠2 = 180° − 60° = 120° und sein Stufenwinkel ∠5 = 60°." />
    </div>
  </>
);

export const cfg: TopicConfig = {
  title: 'Winkelbeziehungen',
  subtitle: 'Scheitel-, Neben-, Stufen- und Wechselwinkel erkennen und berechnen.',
  trackingTopic: 'Winkelbeziehungen',
  explanation,
  levels: [
    { id: 'einfach', description: 'Zwei sich schneidende Geraden: Scheitel- und Nebenwinkel.' },
    { id: 'mittel', description: 'Parallele Geraden mit Schräge: alle vier Winkelbeziehungen.' },
    {
      id: 'schwer',
      description: 'Winkel über einen Zwischenschritt berechnen – zwei Winkel pro Aufgabe.',
    },
  ],
  generate,
};

export default function Winkelbeziehungen() {
  return <Practice cfg={cfg} />;
}
