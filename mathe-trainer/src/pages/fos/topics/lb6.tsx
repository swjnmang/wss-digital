import type { Gen, PracticeConfig, TopicConfig } from '../../raum_und_form/engine/types';
import { PI, q, type UnitId } from '../../raum_und_form/engine/util';
import Scene, { C, ell, type El } from '../../raum_und_form/figures/Scene';
import { QuaderFig, ZylinderFig } from '../../raum_und_form/figures/shapes';
import { flaechengeometrie } from '../../raum_und_form/topics/flaeche';
import { num, res } from '../../raum_und_form/topics/helpers';
import { kegel } from '../../raum_und_form/topics/kegel';
import { kugel } from '../../raum_und_form/topics/kugel';
import { prisma } from '../../raum_und_form/topics/prisma';
import { pyramide } from '../../raum_und_form/topics/pyramide';
import { strahlensaetze } from '../../raum_und_form/topics/strahlensaetze';
import { zylinder } from '../../raum_und_form/topics/zylinder';
import { ch, eqs, nm, pick, ri, rs, round, t } from '../lib';

// Lernbereich 6: Berechnungen von Längen, Flächeninhalten und Volumina
// Grundaufgaben stammen aus dem Bereich „Raum & Form“, ergänzt um Kreissektor und Aufgaben mit Parameter.

const from = (topic: { pages: { slug: string; gens: Gen[]; apps?: Gen[] }[] }, slugs: string[], withApps = true) =>
  topic.pages.filter((pg) => slugs.includes(pg.slug)).flatMap((pg) => [...pg.gens, ...(withApps ? pg.apps ?? [] : [])]);
const appsOf = (topic: { pages: { slug: string; apps?: Gen[] }[] }, slugs: string[]) =>
  topic.pages.filter((pg) => slugs.includes(pg.slug)).flatMap((pg) => pg.apps ?? []);
const unit = (): UnitId => pick(['cm', 'cm', 'm', 'dm'] as UnitId[]);
const area = (u: UnitId) => `${u}²` as UnitId;
const vol = (u: UnitId) => `${u}³` as UnitId;

function SektorFig({ alpha, lr, lb }: { alpha: number; lr?: string; lb?: string }) {
  const r = 3;
  const arc = ell([0, 0], r, r, 90 - alpha / 2, 90 + alpha / 2, 40);
  const mid = ((90) * Math.PI) / 180;
  const els: El[] = [
    { t: 'circle', c: [0, 0], r, stroke: C.gray, dash: true },
    { t: 'poly', pts: [[0, 0], ...arc], fill: C.fill },
    { t: 'dot', at: [0, 0] },
    { t: 'label', at: [0, -0.2], text: 'M', dy: 12 },
    { t: 'label', at: [0, 0.9], text: `${alpha}°`, size: 11 },
  ];
  if (lr) els.push({ t: 'side', a: [0, 0], b: arc[0], text: lr, side: -1 });
  if (lb) els.push({ t: 'label', at: [r * 1.08 * Math.cos(mid), r * 1.08 * Math.sin(mid)], text: lb, dy: -4, color: C.blue, bold: true });
  return <Scene els={els} maxH={150} />;
}

const sektorFlaeche: Gen = () => {
  const u = unit();
  const r = rs(2, 12, 0.5);
  const al = pick([30, 45, 60, 72, 90, 120, 135, 150, 210, 240, 270]);
  const A = (r * r * PI * al) / 360;
  const b = (2 * r * PI * al) / 360;
  return {
    title: 'Kreissektor',
    text: `Ein Kreissektor hat den Radius $r = ${q(r, u)}$ und den Mittelpunktswinkel $\\alpha = ${al}^\\circ$. Berechne den Flächeninhalt und die Bogenlänge.`,
    figure: <SektorFig alpha={al} lr={`r = ${t(r).replace('{,}', ',')} ${u}`} lb="b" />,
    parts: [num('$A$', A, area(u)), num('$b$', b, u)],
    solution: [
      `Der Sektor ist der Anteil $\\frac{${al}^\\circ}{360^\\circ}$ des ganzen Kreises.`,
      `$A = r^2 \\cdot \\pi \\cdot \\frac{\\alpha}{360^\\circ} = (${q(r, u)})^2 \\cdot \\pi \\cdot \\frac{${al}^\\circ}{360^\\circ} ${res(A, area(u))}$`,
      `$b = 2 \\cdot r \\cdot \\pi \\cdot \\frac{\\alpha}{360^\\circ} = 2 \\cdot ${q(r, u)} \\cdot \\pi \\cdot \\frac{${al}^\\circ}{360^\\circ} ${res(b, u)}$`,
    ],
  };
};

const sektorWinkel: Gen = () => {
  const u = unit();
  const r = ri(3, 12);
  const al = pick([36, 40, 45, 60, 72, 80, 90, 100, 120, 135, 144, 150]);
  const b = round((2 * r * PI * al) / 360, 2);
  const alExact = (b * 360) / (2 * r * PI);
  return {
    title: 'Mittelpunktswinkel aus der Bogenlänge',
    text: `Ein Kreisbogen mit dem Radius $r = ${q(r, u)}$ ist $b = ${q(b, u)}$ lang. Berechne den Mittelpunktswinkel $\\alpha$.`,
    figure: <SektorFig alpha={al} lr="r" lb={`b`} />,
    parts: [num('$\\alpha$', alExact, '°', { tol: 0.2 })],
    solution: [
      `$b = 2 r \\pi \\cdot \\frac{\\alpha}{360^\\circ} \\iff \\alpha = \\frac{b \\cdot 360^\\circ}{2 r \\pi}$`,
      `$\\alpha = \\frac{${t(b)} \\cdot 360^\\circ}{2 \\cdot ${r} \\cdot \\pi} \\approx ${t(round(alExact, 1))}^\\circ$`,
    ],
  };
};

const sektorUmfang: Gen = () => {
  const u = unit();
  const r = rs(2, 10, 0.5);
  const al = pick([45, 60, 90, 120, 150, 270]);
  const b = (2 * r * PI * al) / 360;
  const U = 2 * r + b;
  return {
    title: 'Umfang eines Kreissektors',
    text: `Berechne den Umfang eines Kreissektors mit $r = ${q(r, u)}$ und $\\alpha = ${al}^\\circ$ (Bogen und beide Radien).`,
    figure: <SektorFig alpha={al} lr="r" lb="b" />,
    parts: [num('$U$', U, u)],
    solution: [
      `Bogenlänge: $b = 2 \\cdot ${q(r, u)} \\cdot \\pi \\cdot \\frac{${al}^\\circ}{360^\\circ} ${res(b, u)}$`,
      `$U = 2r + b = 2 \\cdot ${q(r, u)} + ${q(round(b, 2), u)} ${res(U, u)}$`,
    ],
  };
};

const pizza: Gen = () => {
  const d = pick([26, 28, 30, 32, 36]);
  const n = pick([6, 8, 10, 12]);
  const A = ((d / 2) ** 2 * PI) / n;
  return {
    title: 'Pizzastück',
    badge: 'Anwendung',
    text: `Eine runde Pizza mit $${d}$ cm Durchmesser wird in $${n}$ gleich große Stücke geschnitten. Berechne den Mittelpunktswinkel und die Fläche eines Stücks.`,
    figure: <SektorFig alpha={360 / n} lr={`${d / 2} cm`} />,
    parts: [num('$\\alpha$', 360 / n, '°'), num('$A$', A, 'cm²')],
    solution: [`$\\alpha = 360^\\circ : ${n} = ${t(360 / n)}^\\circ$`, `$r = ${d / 2}$ cm, $A = (${d / 2}\\,\\text{cm})^2 \\cdot \\pi : ${n} ${res(A, 'cm²')}$`],
  };
};

// ---------------------------------------------------------------------------
// Körper mit Parameter und Umkehraufgaben
// ---------------------------------------------------------------------------

const quaderParameter: Gen = () => {
  const k1 = pick([2, 3]);
  const h = ri(2, 6);
  const x0 = ri(2, 6);
  const V0 = k1 * h * x0 * x0;
  return {
    title: 'Quader mit Parameter',
    text: `Ein Quader hat die Kantenlängen $x$, $${k1}x$ und $${h}$ (Längen in cm, $x > 0$).`,
    figure: <QuaderFig a={k1 * 2} b={2} h={h / 1.5} la={`${k1}x`} lb="x" lh={`${h}`} />,
    parts: [
      ch('a) Volumen $V(x)$ in cm³:', `$V(x) = ${k1 * h}x^2$`, [`$V(x) = ${k1 + 1 + h}x$`, `$V(x) = ${k1 * h}x^3$`, `$V(x) = ${k1 * h}x$`]),
      nm('$x$ in cm', x0, { q: `b) Für welches $x$ beträgt das Volumen $${V0}$ cm³?`, tol: 0.01 }),
    ],
    solution: [
      `a) $V(x) = x \\cdot ${k1}x \\cdot ${h} = ${k1 * h}x^2$`,
      `b) $${k1 * h}x^2 = ${V0} \\qquad | : ${k1 * h}$`,
      `$x^2 = ${x0 * x0} \\iff x = ${x0}$ (nur positive Lösung sinnvoll)`,
    ],
  };
};

const zylinderParameter: Gen = () => {
  const k = pick([2, 3]);
  const x0 = ri(2, 6);
  const V = k * PI * x0 ** 3;
  const Vr = round(V, 2);
  return {
    title: 'Zylinder mit Parameter',
    text: `Bei einem Zylinder ist die Höhe ${k === 2 ? 'doppelt' : 'dreimal'} so groß wie der Radius $r$. Das Volumen beträgt $${t(Vr)}$ cm³. Berechne $r$.`,
    figure: <ZylinderFig r={1} h={k} lr="r" lh={`${k}r`} />,
    parts: [num('$r$', x0, 'cm', { tol: 0.02 })],
    solution: [
      `$V = r^2 \\pi \\cdot h = r^2 \\pi \\cdot ${k}r = ${k}\\pi r^3$`,
      `$${k}\\pi r^3 = ${t(Vr)} \\iff r^3 = \\frac{${t(Vr)}}{${k}\\pi} \\approx ${t(round(Vr / (k * PI), 2))}$`,
      `$r = \\sqrt[3]{${t(round(Vr / (k * PI), 2))}} \\approx ${x0}$ cm`,
    ],
  };
};

const wuerfelAusOberflaeche: Gen = () => {
  const u = unit();
  const a = rs(2, 12, 0.5);
  const O = 6 * a * a;
  return {
    title: 'Würfel aus der Oberfläche',
    text: `Ein Würfel hat die Oberfläche $O = ${q(O, area(u))}$. Berechne die Kantenlänge und das Volumen.`,
    parts: [num('$a$', a, u), num('$V$', a ** 3, vol(u))],
    solution: [`$O = 6a^2 \\iff a = \\sqrt{\\frac{O}{6}} = \\sqrt{\\frac{${t(O)}}{6}} = ${q(a, u)}$`, `$V = a^3 = (${q(a, u)})^3 ${res(a ** 3, vol(u))}$`],
  };
};

const kugelAusVolumen: Gen = () => {
  const r = rs(2, 15, 0.5);
  const V = round((4 / 3) * PI * r ** 3, 2);
  return {
    title: 'Kugelradius aus dem Volumen',
    text: `Eine Kugel hat das Volumen $V = ${q(V, 'cm³')}$. Berechne ihren Radius und ihre Oberfläche.`,
    parts: [num('$r$', r, 'cm', { tol: 0.02 }), num('$O$', 4 * PI * r * r, 'cm²', { tol: 0.5 })],
    solution: [
      `$V = \\frac{4}{3} r^3 \\pi \\iff r = \\sqrt[3]{\\frac{3V}{4\\pi}} = \\sqrt[3]{\\frac{3 \\cdot ${t(V)}}{4\\pi}} \\approx ${q(r, 'cm')}$`,
      `$O = 4 r^2 \\pi = 4 \\cdot (${q(r, 'cm')})^2 \\cdot \\pi ${res(4 * PI * r * r, 'cm²')}$`,
    ],
  };
};

const kegelParameter: Gen = () => {
  const h = pick([3, 6, 9, 12]);
  const r0 = ri(2, 8);
  const V = (1 / 3) * r0 * r0 * PI * h;
  const k = h / 3 === 1 ? '' : `${h / 3}`;
  return {
    title: 'Kegel mit Parameter',
    text: `Ein Kegel hat die Höhe $h = ${h}$ cm und den Radius $r = x$ cm.`,
    parts: [
      ch('a) Volumen $V(x)$ in cm³:', `$V(x) = ${k}\\pi x^2$`, [`$V(x) = ${h}\\pi x^2$`, `$V(x) = ${k}\\pi x^3$`, `$V(x) = ${k}\\pi x$`]),
      nm('$x$', r0, { q: `b) Für welchen Radius beträgt das Volumen $${t(round(V, 2))}$ cm³?`, tol: 0.02 }),
    ],
    solution: [
      `a) $V(x) = \\frac{1}{3} \\cdot x^2 \\cdot \\pi \\cdot ${h} = ${k}\\pi x^2$`,
      `b) $${k}\\pi x^2 = ${t(round(V, 2))} \\iff x^2 = \\frac{${t(round(V, 2))}}{${h / 3}\\pi} \\approx ${t(round(V / ((h / 3) * PI), 2))}$`,
      `$x ${eqs(r0)} ${r0}$ (positive Lösung)`,
    ],
  };
};

// ---------------------------------------------------------------------------

const pages: PracticeConfig[] = [
  {
    slug: 'strahlensatz',
    title: 'Strahlensätze',
    description: 'Unbekannte Längen berechnen, Entfernungen und Höhen im Gelände',
    intro:
      'Werden zwei Strahlen mit gemeinsamem Anfangspunkt $Z$ von zwei **parallelen** Geraden geschnitten, gelten die **Strahlensätze**: Die Abschnitte auf den Strahlen stehen im gleichen Verhältnis (1. Strahlensatz), und die Parallelenabschnitte stehen im gleichen Verhältnis wie die zugehörigen Strahlenabschnitte ab $Z$ (2. Strahlensatz).\n\nSo lassen sich z. B. Baumhöhen über den Schatten oder Flussbreiten bestimmen, ohne direkt zu messen.',
    formulas: ['\\frac{\\overline{ZA}}{\\overline{ZA\'}} = \\frac{\\overline{ZB}}{\\overline{ZB\'}}', '\\frac{\\overline{AB}}{\\overline{A\'B\'}} = \\frac{\\overline{ZA}}{\\overline{ZA\'}}'],
    gens: from(strahlensaetze, ['erster-strahlensatz', 'zweiter-strahlensatz'], false),
    apps: appsOf(strahlensaetze, ['erster-strahlensatz', 'zweiter-strahlensatz']),
  },
  {
    slug: 'flaechen',
    title: 'Umfang und Flächeninhalt',
    description: 'Rechteck, Parallelogramm, Dreieck, Trapez und Kreis',
    intro:
      'Der **Umfang** ist die Länge der Randlinie, der **Flächeninhalt** gibt an, wie viele Einheitsquadrate in die Figur passen. Achte auf die Einheiten: Längen in cm, Flächen in cm².\n\nDreieck und Parallelogramm: Grundseite und zugehörige **Höhe** (senkrecht!) verwenden. Trapez: Mittelwert der parallelen Seiten mal Höhe. Kreis: $U = 2r\\pi$, $A = r^2\\pi$.',
    formulas: ['A_\\triangle = \\frac{1}{2} \\cdot g \\cdot h', 'A_{\\text{Trapez}} = \\frac{a + c}{2} \\cdot h', 'U_{\\text{Kreis}} = 2 \\cdot r \\cdot \\pi', 'A_{\\text{Kreis}} = r^2 \\cdot \\pi'],
    gens: from(flaechengeometrie, ['rechteck', 'dreiecke', 'parallelogramm', 'trapez', 'kreis'], false),
    apps: appsOf(flaechengeometrie, ['zusammengesetzte-flaechen', 'kreis', 'trapez']),
  },
  {
    slug: 'kreissektor',
    title: 'Kreissektor und Kreisbogen',
    description: 'Flächeninhalt eines Kreissektors, Bogenlänge, Mittelpunktswinkel',
    intro:
      'Ein **Kreissektor** („Tortenstück“) ist der Teil eines Kreises zwischen zwei Radien. Der Mittelpunktswinkel $\\alpha$ gibt an, welcher Anteil $\\frac{\\alpha}{360^\\circ}$ des ganzen Kreises gemeint ist.\n\nFläche und Bogenlänge erhält man, indem man Kreisfläche bzw. Kreisumfang mit diesem Anteil multipliziert. Der Umfang des Sektors besteht aus dem Bogen und zwei Radien.',
    formulas: ['A = r^2 \\cdot \\pi \\cdot \\frac{\\alpha}{360^\\circ}', 'b = 2 \\cdot r \\cdot \\pi \\cdot \\frac{\\alpha}{360^\\circ}'],
    example: {
      title: 'Viertelkreis',
      text: '$r = 4$ cm, $\\alpha = 90^\\circ$',
      steps: ['$A = 16 \\cdot \\pi \\cdot \\frac{90}{360} = 4\\pi \\approx 12{,}57\\,\\text{cm}^2$', '$b = 8\\pi \\cdot \\frac{90}{360} = 2\\pi \\approx 6{,}28\\,\\text{cm}$'],
    },
    gens: [sektorFlaeche, sektorWinkel, sektorUmfang],
    apps: [pizza],
  },
  {
    slug: 'koerper',
    title: 'Oberfläche und Volumen von Körpern',
    description: 'Quader, Würfel, Prisma, Pyramide, Zylinder, Kegel und Kugel',
    intro:
      '**Prisma und Zylinder**: $V = G \\cdot h$ (Grundfläche mal Höhe). **Pyramide und Kegel**: ein Drittel davon, $V = \\frac{1}{3} G \\cdot h$. **Kugel**: $V = \\frac{4}{3} r^3 \\pi$, $O = 4r^2\\pi$.\n\nDie **Oberfläche** ist die Summe aller Begrenzungsflächen (Grund- und Deckfläche plus Mantel). Für Pyramide und Kegel braucht man oft vorher eine Höhe oder Mantellinie mit dem Satz des Pythagoras.',
    formulas: ['V_{\\text{Prisma}} = G \\cdot h', 'V_{\\text{Pyramide}} = \\frac{1}{3} \\cdot G \\cdot h', 'V_{\\text{Zylinder}} = r^2 \\pi h,\\; M = 2r\\pi h', 'V_{\\text{Kegel}} = \\frac{1}{3} r^2 \\pi h,\\; M = r\\pi m', 'V_{\\text{Kugel}} = \\frac{4}{3} r^3 \\pi,\\; O = 4r^2\\pi'],
    gens: [
      ...from(prisma, ['gemischt'], false),
      ...from(pyramide, ['gemischt'], false),
      ...from(zylinder, ['gemischt'], false),
      ...from(kegel, ['gemischt'], false),
      ...from(kugel, ['gemischt'], false),
    ],
    apps: [...appsOf(prisma, ['gemischt']), ...appsOf(zylinder, ['gemischt']), ...appsOf(kugel, ['gemischt'])],
  },
  {
    slug: 'parameter-umkehr',
    title: 'Körper mit Parameter und Umkehraufgaben',
    description: 'Volumen in Abhängigkeit von einem Parameter, Abmessungen aus Volumen oder Oberfläche',
    intro:
      'Hängen Kantenlängen oder Radien von einer Variablen $x$ ab, setzt man sie in die Formel ein und vereinfacht – so erhält man z. B. $V(x)$.\n\n**Umkehraufgaben**: Ist das Volumen oder die Oberfläche gegeben, stellt man die Formel nach der gesuchten Größe um. Bei $x^2$ zieht man die Quadratwurzel, bei $x^3$ die dritte Wurzel; nur positive Längen sind sinnvoll.',
    formulas: ['V_{\\text{Quader}} = a \\cdot b \\cdot c', 'O_{\\text{Würfel}} = 6a^2', 'V_{\\text{Zylinder}} = r^2 \\cdot \\pi \\cdot h', 'V_{\\text{Kugel}} = \\frac{4}{3} \\cdot r^3 \\cdot \\pi'],
    gens: [quaderParameter, zylinderParameter, wuerfelAusOberflaeche, kugelAusVolumen, kegelParameter],
  },
];

export const lb6: TopicConfig = {
  slug: 'laengen-flaechen-volumina',
  title: 'Längen, Flächeninhalte und Volumina',
  description: 'Lernbereich 6: Strahlensätze, ebene Figuren, Kreissektor, Körper und Aufgaben mit Parameter',
  icon: 'cube',
  pages,
};
